import * as argon2lib from "argon2"

interface Argon2Config {
  type: typeof argon2lib.argon2id
  memoryCost: number
  timeCost: number
  parallelism: number
}

const argonConfig = {
  type: argon2lib.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as Argon2Config

export async function hash(password: string): Promise<string> {
  return argon2lib.hash(password, argonConfig)
}

export async function verify(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2lib.verify(hash, password)
  } catch {
    return false
  }
}

const argon2 = {
  hash,
  verify,
} as const

export default argon2
