# Abdou Portal API

# Steps

- [] install nvm for node

https://www.nvmnode.com/guide/installation.html
https://github.com/coreybutler/nvm-windows/releases/tag/1.2.2

- [] use 24.x node version

nvm install 24.13.0
nvm use 24.13.0

https://nodejs.org/en/download/archive/v24.13.0

- [] start npm `npm init -y`
- [] npm install -g npm @11.6.2

https://www.npmjs.com/package/@tsconfig/node24
https://expressjs.com/pt-br/

- [] install main dependencies
  npm install:
  express

- [] install dev dependencies
  npm i -D typescript @types/node @types/express @tsconfig/node24

- [] start typescript `npx tsc --init`

- [] create inital .js file `mkdir src && cd src && touch index.js`

```js
import express from "express"
const app = express()
const port = 3000

app.get("/", (req, res) => {
  res.send("ok")
})

app.listen(port, () => {
  console.log(`Running on http://localhost:${port}`)
})
```

`node src/index.js`

`Running on http://localhost:3000`

- [] rename src/index.js to src/index.ts

- [] Running TS files `npx tsc`

- [] Will generate :
  dist
  ┣ index.d.ts
  ┣ index.d.ts.map
  ┣ index.js
  ┗ index.js.map

- [] run `node dist/index.js`, if works, typescript its ok

- [] run npm i -D tsx

- [] add 'dev' script on package.json

```json
"scripts": {
    "dev": "tsx watch src/index.ts"
  },
```

- [] run `npm run dev` to init app server

- [] install commitlint `npm install --save-dev @commitlint/cli` , `npm install --save-dev @commitlint/config-conventional` run `touch commitlint.config.ts`

```ts
export default {
  extends: ["@commitlint/config-conventional"],
}
```

https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional
https://github.com/conventional-changelog/commitlint?tab=readme-ov-file

` echo "fix(SCOPE): Some message" | npm run commitlint`

```zsh
> catalog-api@1.0.0 commitlint
> commitlint

⧗   input: fix(SCOPE): Some message
✖   subject must not be sentence-case, start-case, pascal-case, upper-case [subject-case]

✖   found 1 problems, 0 warnings
ⓘ   Get help: https://github.com/conventional-changelog/commitlint/#what-is-commitlint
```

- [] install husky `npm install -D husky`
- [] `npx init  husky`

- [] add a file in ./husky called commit-msg

```sh
npx commitlint --edit $1
```

- [] test running `git add -A` and `git commit -m "foo"` and output must be something like:

```zsh
$ git commit -m "init project"
⧗   input: init project
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]

✖   found 2 problems, 0 warnings
ⓘ   Get help: https://github.com/conventional-changelog/commitlint/#what-is-commitlint

husky - commit-msg script failed (code 1)
```

https://commitizen-tools.github.io/commitizen/

- [] add `commtizen` `npm install commitizen` with `cz-conventional-changelog` with `npm install cz-conventional-changelog`

- [] add this config on package.json

```json
"config": {
    "commitizen": {
      "path": "./node_modules/cz-conventional-changelog"
    }
  }
```

- [] to use all commit lint flow run `npm run commit` (npm script added)

```json
"scripts": {
    "dev": "tsx watch src/index.ts",
    "commitlint": "commitlint",
    "commit": "cz"
  },
```

## Eslint Prittier

### Eslint

- [] Install eslint wiht `npm install -D eslint @eslint/js typescript-eslint`

- [] run `npm init @eslint/config` will generate `eslint.config`

```js
import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"
import { defineConfig } from "eslint/config"

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.node,
    },
  },
  tseslint.configs.recommended,
  {
    ignores: ["dist/", "node_modules/"],
  },
])
```

- [] add new lint script on packege.json

```json
"scripts": {
    "dev": "tsx watch src/index.ts",
    "commitlint": "commitlint",
    "commit": "cz",
    "lint": "eslint src/"
  },
```

- [] test lint

```zsh
$ npm run lint

> catalog-api@1.0.0 lint
> eslint src/


R:\workplace\catalog\catalog-api\src\index.ts
  2:8  error  'test' is defined but never used  @typescript-eslint/no-unused-vars

✖ 1 problem (1 error, 0 warnings)
```

### Prittier

npm install -D prettier

touch .prettierignore

npm i -D eslint-config-prettier

```js
import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"
import { defineConfig } from "eslint/config"
import prettier from "eslint-config-prettier/flat"

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.node,
    },
  },
  tseslint.configs.recommended,
  prettier,
  {
    ignores: ["dist/", "node_modules/"],
  },
])
```

```json
"scripts": {
   "dev": "tsx watch src/index.ts",
   "commitlint": "commitlint",
   "commit": "cz",
   "lint": "eslint src/",
   "check": "prettier --check src/"
 },
```

## Docker

- [] Create infra/compose.yaml
- [] Create .env

```yaml
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=catalog_user
POSTGRES_DB=catalog
POSTGRES_PASSWORD=catalog_password
POSTGRES_SCHEMA=local
DATABASE_URL=postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB?schema=$POSTGRES_SCHEMA
```

- [] `compose.yaml`

```yaml
name: catolog
services:
  database:
    container_name: catolog-dev-postgres
    image: postgres:17-alpine
    env_file:
      - ../.env
    ports:
      - "5432:5432"
```

- [] npm scripts

```json
"scripts": {
    "dev": "tsx watch src/index.ts",
    "commitlint": "commitlint",
    "commit": "cz",
    "lint": "eslint src/",
    "check": "prettier --check src/",
    "services:database:up": "docker compose -f infra/compose.yaml up -d",
    "services:database:stop": "docker compose -f infra/compose.yaml stop",
    "services:database:down": "docker compose -f infra/compose.yaml down"
  }
```

## Prisma

https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/prisma-postgres

- [] Install dependencies

```zsh
npm install prisma @types/node @types/pg --save-dev
npm install @prisma/client @prisma/adapter-pg pg dotenv
```

- [] initialize prisma

```zsh
$ npx prisma init

    Prisma is a modern DB toolkit to query, migrate and model your database (https://prisma.io)

    Usage

      $ prisma [command]

    Commands

                init   Set up Prisma for your app
                 dev   Start a local Prisma Postgres server for development
            generate   Generate artifacts (e.g. Prisma Client)
                  db   Manage your database schema and lifecycle
             migrate   Migrate your database
              studio   Browse your data with Prisma Studio
            validate   Validate your Prisma schema
              format   Format your Prisma schema
             version   Displays Prisma version info
               debug   Displays Prisma debug info
                 mcp   Starts an MCP server to use with AI development tools

    Flags

         --preview-feature   Run Preview Prisma commands
         --help, -h          Show additional information about a command

┌──────────────────────────────────────────────────────────────────────────────────────┐
│  Optimize performance through connection pooling and caching with Prisma Accelerate  │
│  and capture real-time events from your database with Prisma Pulse.                  │
│  Learn more at https://pris.ly/cli/pdp                                               │
└──────────────────────────────────────────────────────────────────────────────────────┘

    Examples

      Set up a new local Prisma Postgres `prisma dev`-ready project
      $ prisma init

      Start a local Prisma Postgres server for development
      $ prisma dev

      Generate artifacts (e.g. Prisma Client)
      $ prisma generate

      Browse your data
      $ prisma studio

      Create migrations from your Prisma schema, apply them to the database, generate artifacts (e.g. Prisma Client)
      $ prisma migrate dev

      Pull the schema from an existing database, updating the Prisma schema
      $ prisma db pull

      Push the Prisma schema state to the database
      $ prisma db push

      Validate your Prisma schema
      $ prisma validate

      Format your Prisma schema
      $ prisma format

      Display Prisma version info
      $ prisma version

      Display Prisma debug info
      $ prisma debug


Initialized Prisma in your project

  prisma/
    schema.prisma
  prisma.config.ts
  .env

warn You already have a .gitignore file. Don't forget to add .env in it to not commit any private information.

Next, choose how you want to set up your database:

CONNECT EXISTING DATABASE:
  1. Configure your DATABASE_URL in prisma.config.ts
  2. Run prisma db pull to introspect your database.

CREATE NEW DATABASE:
  Local: npx prisma dev (runs Postgres locally in your terminal)
  Cloud: npx create-db (creates a free Prisma Postgres database)

Then, define your models in prisma/schema.prisma and run prisma migrate dev to apply your schema.

Learn more: https://pris.ly/getting-started
```

- [] install `npm install dotenv-expand` to allow contact in .env files

- [] configura prisma migrations

- [] npm scripts

```json
"migrations:create": "prisma migrate dev create-only --name",
"migrations:up": "prisma migrate dev",
"migrations:status": "prisma migrate status",
"prisma:generate": "prisma generate"
```

📦 catalog-api/
├── 📂 .github/
│ └── 📂 workflows/
│ └── test.yml
├── 📂 .husky/
├── 📂 .vscode/
├── 📂 infra/
│ └── compose.yaml
├── 📂 prisma/
│ ├── schema.prisma
│ └── seed.ts
├── 📂 src/
│ ├── 📂 config/
│ │ ├── database.ts
│ │ └── environment.ts
│ ├── 📂 controllers/
│ │ ├── user.controller.ts
│ │ ├── brand.controller.ts
│ │ ├── category.controller.ts
│ │ ├── product.controller.ts
│ │ ├── address.controller.ts
│ │ └── order.controller.ts
│ ├── 📂 services/
│ ├── 📂 repositories/
│ ├── 📂 routes/
│ ├── 📂 middlewares/
│ ├── 📂 validators/
│ ├── 📂 dtos/
│ │ ├── 📂 user/
│ │ ├── 📂 product/
│ │ └── 📂 order/
│ ├── 📂 utils/
│ ├── 📂 types/
│ ├── 📂 generated/
│ │ └── 📂 prisma/
│ ├── app.ts
│ └── server.ts
├── 📂 tests/
│ ├── 📂 unit/
│ │ ├── 📂 services/
│ │ ├── 📂 repositories/
│ │ └── 📂 validators/
│ ├── 📂 integration/
│ │ └── 📂 api/
│ │ └── 📂 v1/
│ │ ├── 📂 user/
│ │ ├── 📂 product/
│ │ ├── 📂 order/
│ │ └── 📂 status/
│ ├── 📂 helpers/
│ │ ├── 📂 factories/
│ │ └── 📂 mocks/
│ ├── orchestrator.ts
│ └── jest.setup.ts
├── .editorconfig
├── .env.example
├── .env.development
├── .gitignore
├── .nvmrc
├── .prettierrc
├── .prettierignore
├── commitlint.config.ts
├── eslint.config.js
├── jest.config.ts
├── package.json
├── tsconfig.json
└── README.md

Route → Middleware → Controller → Service → Repository → Database

## Tests

- [] install jest and dependencies with `npm install -D vitest supertest @types/supertest`

- [] create vitest.config.js

```ts
import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    hookTimeout: 30000,
  },
  plugins: [tsconfigPaths()],
})
```

📦tests
┣ 📂integration
┃ ┗ 📂api
┃ ┃ ┣ 📂migrations
┃ ┃ ┗ 📂status
┃ ┃ ┃ ┗ 📜get.test.ts
┗ 📂unit

exemple of test:

```ts
import request from "supertest"
import app from "../../../../src/app.js"

describe("GET /api/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await request(app).get("/api/status")

      expect(response.status).toBe(200)
      expect(response.body.status).toBeDefined()
      expect(response.body.database).toBeDefined()
      expect(response.body.updated_at).toBeDefined()
    })
  })
})
```

- [] npm scripts:

```json
scripts: {
   "test": "vitest run",
   "test:watch": "vitest"
}
```

```szh
$ npm run test

> catalog-api@1.0.0 test
> vitest run


 RUN  v4.0.18 R:/workplace/catalog/catalog-api

 ✓ tests/integration/api/status/get.test.ts (1 test) 350ms
   ✓ GET /api/status (1)
     ✓ Anonymous user (1)
       ✓ Retrieving current system status  347ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  15:37:51
   Duration  1.53s (transform 277ms, setup 0ms, import 860ms, tests 350ms, environment 0ms)

```

# Github Actions

- [] create directory ./.github/workflows

- [] create linting.yaml tests.yaml

```yaml
name: Linting

on: pull_request

jobs:
  prettier:
    name: Prettier
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20, 24]

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm ci

      - name: Prettier check
        run: npm run lint:prettier:check
```

```yaml
name: Automated Tests

on: pull_request

jobs:
  vitest:
    name: Vitest
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20, 24]

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm ci

      - name: Create .env
        run: |
          cat <<EOF > .env
          POSTGRES_HOST=localhost
          POSTGRES_PORT=5432
          POSTGRES_USER=catalog_user
          POSTGRES_PASSWORD=catalog_password
          POSTGRES_DB=catalog
          POSTGRES_SCHEMA=local
          DATABASE_URL=postgres://catalog_user:catalog_password@localhost:5432/catalog?schema=local
          EOF

      - name: Start Database
        run: npm run services:database:up

      - name: Wait fot database
        run: sleep 10

      - name: Generate Prisma Client
        run: npm run prisma:generate

      - name: Run Jest tests
        run: npm run test
```

- [] On github configure rules set to target branch

## Prisma Schemas

Fluxo:

```txt
┌─────────────────────┐
│ Dev 1: Edita Schema │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────┐
│ prisma migrate dev      │
│ --name add_feature      │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Cria migration.sql      │
│ Aplica no banco local   │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Commita no Git          │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Dev 2: git pull         │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ prisma migrate dev      │
│ (aplica automaticamente)│
└─────────────────────────┘
```

### Criar nova migration

`npx prisma migrate dev --name your_change_name`

### Ver migrations pendentes

`npx prisma migrate status`

### Gerar Prisma Client (após migration)

`npx prisma generate`

### Reset total do banco (⚠️ APAGA TUDO)

`npx prisma migrate reset`

### Crete migratation only

`npx prisma migrate dev --create-only --name init`

```prisma
"[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma",
  },
```

- [] `npm run prisma:migrations:create -- --name init_create_user_and_brand_tables`

```zsh

npm run prisma:migrations:create -- --name init_create_user_and_brand_tables

> catalog-api@1.0.0 prisma:migrations:create
> prisma migrate dev --create-only --name init_create_user_and_brand_tables

Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
Datasource "db": PostgreSQL database "catalog", schema "local" at "localhost:5432"



📦prisma
 ┣ 📂migrations
 ┃ ┣ 📂20260127184357_init_create_user_and_brand_tables
 ┃ ┃ ┗ 📜migration.sql
 ┃ ┗ 📜migration_lock.toml
 ┗ 📜schema.prisma


```

- [] See pending migrations:

```zsh
npm run prisma:migrations:status

> catalog-api@1.0.0 prisma:migrations:status
> prisma migrate status

Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
Datasource "db": PostgreSQL database "catalog", schema "local" at "localhost:5432"

1 migration found in prisma/migrations
Following migration have not yet been applied:
20260127184357_init_create_user_and_brand_tables

To apply migrations in development run prisma migrate dev.
To apply migrations in production run prisma migrate deploy.
```

- [] Apply migrations on local database

```zsh
npm run prisma:migrations:apply

> catalog-api@1.0.0 prisma:migrations:apply
> prisma migrate dev

Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
Datasource "db": PostgreSQL database "catalog", schema "local" at "localhost:5432"

Applying migration `20260127184357_init_create_user_and_brand_tables`

The following migration(s) have been applied:

migrations/
  └─ 20260127184357_init_create_user_and_brand_tables/
    └─ migration.sql

Your database is now in sync with your schema.

```

- create model User and apply migration\n- create model Brand and apply migration\n- fix npm prisma scripts
