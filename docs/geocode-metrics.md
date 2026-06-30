# Reverse-geocode no ingest de métricas de device

Como o backend resolve o endereço (geocode reverso) das coordenadas que os
devices reportam, e por que ele evita chamar a API do Google mais do que o
necessário.

## Contexto

Devices enviam a própria localização periodicamente via:

```
PATCH /api/devices/:code/metrics
{ "localization": { "lat": -23.3054, "lng": -45.9631 } }
```

O intervalo de envio é controlado pelo **firmware do device**, não pela API —
o endpoint é passivo, só reage quando o device chama.

Para cada posição queremos um endereço legível (rua, cidade, estado). Isso vem
do **Google Geocoding API**, que **cobra por chamada**. Logo, o objetivo é:
resolver o endereço corretamente gastando o mínimo de chamadas possível.

## O problema

A implementação inicial geocodificava sempre que as coordenadas mudavam,
usando comparação de igualdade exata (`previous.lat !== lat`).

GPS sempre tem _jitter_: um device parado reporta coordenadas levemente
diferentes a cada tick (variação na 6ª/7ª casa decimal, ~5–15 m). Com igualdade
exata, quase todo tick conta como "mudou" → **geocode em quase todo envio**,
mesmo o device imóvel.

Exemplo: device parado enviando a cada 30 s → ~2880 geocodes/dia onde **1**
bastava.

## A solução: âncora + limiar de distância

Duas ideias combinadas.

### 1. Limiar de distância (haversine)

Em vez de comparar igualdade exata, calculamos a distância geográfica entre a
posição de referência e a posição reportada. Só geocodificamos se ela passar de
um limiar (`GEOCODE_DISTANCE_THRESHOLD_M = 50` metros).

50 m fica acima do erro típico de GPS (5–15 m), então jitter nunca dispara, mas
uma realocação real (device movido para outro endereço) dispara.

A distância usa a fórmula de **haversine** (`distanceMeters` em
`src/lib/geocode/index.ts`) — distância de grande círculo entre dois pontos
lat/lng.

### 2. Âncora (não comparar contra o tick anterior)

A pergunta-chave: distância **em relação a quê**?

Se comparássemos contra a _última coordenada reportada_, dois problemas:

- **Random-walk do jitter:** a base de comparação andaria um pouco a cada tick.
  Em milhares de ticks o ponto-base poderia vagar > 50 m da posição real mesmo
  parado, disparando geocodes espúrios.
- **Drift acumulado:** um device andando 40 m/tick nunca passaria de 50 m entre
  ticks consecutivos, então nunca geocodificaria apesar de percorrer
  quilômetros.

Solução: comparar sempre contra uma **âncora** — a coordenada da _última
tentativa de geocode_. A âncora só se move quando um geocode efetivamente roda.

- Device parado: âncora fixa, jitter sempre < 50 m dela → **1 geocode na vida**.
- Device que se desloca acumulando > 50 m da âncora → dispara, e a âncora avança
  para a nova posição.

> **Por que "última tentativa" e não "último sucesso"?** Se a âncora só
> avançasse em sucesso, um device realocado para um ponto que o Google não
> resolve deixaria o gate `moved` permanentemente aberto e re-geocodificaria
> todo tick. Avançar na tentativa fecha esse buraco.

## O fluxo, passo a passo

Em `DeviceService.updateDeviceMetrics`
(`src/services/device/device.service.ts`):

```text
1. Lê o blob de métricas atual do device (localization + anchor).
2. anchor = stored.anchor
          ?? localization armazenada   ← fallback p/ devices antigos
3. moved          = !anchor || distanceMeters(anchor, atual) > 50m
   missingAddress = nenhum address resolvido ainda
4. SE (moved OU missingAddress):
      address  = reverseGeocode(lat, lng)   ← única chamada à rede
      anchor   = posição atual              ← avança na tentativa
   SENÃO:
      address  = address anterior (reusa)
      anchor   = mantém
5. Persiste { localization: {lat, lng, address}, anchor }.
```

Pontos importantes:

- **`reverseGeocode` nunca lança exceção** — retorna `null` em qualquer falha
  (sem chave de API, erro de rede, status não-OK). Falha de geocode **nunca**
  bloqueia o ingest: as coordenadas são persistidas e o endpoint responde `204`
  mesmo sem endereço.
- **`missingAddress` é o self-heal:** se um geocode falhou (ex.: chave indisponível
  no momento), `address` fica `null` e o próximo tick tenta de novo, mesmo sem
  movimento — até resolver.

## Persistência

Em `DeviceRepository.updateDeviceMetrics`
(`src/repositories/device/device.respository.ts`), dentro de uma transação:

- **`device.metrics`** (snapshot atual) recebe
  `{ localization: {lat, lng, address}, anchor: {lat, lng}, updatedAt }`.
- **`deviceMetricsHistory`** recebe **apenas a leitura crua** (`localization`),
  uma linha por tick. A âncora é estado derivado e não entra no histórico.

`metrics` é uma coluna JSON livre — **não houve migração de schema**. Devices
gravados antes da âncora existir (blob só com `localization`) funcionam via o
fallback do passo 2: a localização armazenada vira a âncora na primeira chamada
pós-deploy.

## Garantias

| Cenário                             | Comportamento                          |
| ----------------------------------- | -------------------------------------- |
| Device fixo + jitter de GPS         | 1 geocode na vida                      |
| Random-walk do jitter (longo prazo) | Âncora fixa → sem geocode espúrio      |
| Drift / movimento lento cumulativo  | Dispara ao acumular > 50 m da âncora   |
| Realocação real (> 50 m)            | Geocode + âncora avança                |
| Geocode falhou (transitório)        | Self-heal no próximo tick              |
| Geocode falhou → ingest             | Persiste coords, responde 204          |
| Device antigo sem campo `anchor`    | Fallback p/ localization, sem migração |

## Limitação conhecida

Uma coordenada que o Google **nunca** resolve (`ZERO_RESULTS` — ex.: mar aberto,
construção nova) mantém `missingAddress` sempre verdadeiro e re-geocodifica todo
tick. Fora de escopo para devices fixos em endereços reais. Se surgir, o fix é
distinguir um resultado vazio _permanente_ de um erro _transitório_ e parar de
retentar o primeiro (ver `TODO` no service).

## Decisões de design

- **Limiar 50 m** é constante de módulo no service. Se devices móveis entrarem
  no roadmap, um device a 40 m/tick nunca re-geocodificaria — aí o limiar
  viraria config por tipo de device.
- **Haversine vs alternativas:** geohash bucketing (cache compartilhado entre
  devices) sofre do mesmo problema de jitter na borda das células; arredondar
  coordenadas para N casas decimais também. Para cache **por device**, âncora +
  haversine é mais correto. Abordagem alinhada com a recomendação do OpenCage
  para frotas/IoT.

## Arquivos

- `src/lib/geocode/index.ts` — `reverseGeocode` (Google) e `distanceMeters`
  (haversine). Único ponto que conhece o Google.
- `src/services/device/device.service.ts` — lógica da decisão de geocode.
- `src/repositories/device/device.respository.ts` — persistência (snapshot +
  histórico) em transação.
- `tests/integration/api/device/metrics/patch.test.ts` — 15 testes de
  integração cobrindo jitter, realocação, drift cumulativo, self-heal, falha de
  geocode e blob legado.
