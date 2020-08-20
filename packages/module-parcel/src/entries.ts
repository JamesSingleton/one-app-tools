import chalk from 'chalk';
import { posix, join } from 'path';
import { stringify } from 'querystring';
import { warn } from './output/log'

export type WebpackEntrypoints = {
  [bundle: string]: string | string[]
}

type Entrypoints = {
  client: WebpackEntrypoints,
  server: WebpackEntrypoints
}

export function createEntrypoints(
  target: 'server',
  buildId: string,
  config: any
): Entrypoints {
  const client: WebpackEntrypoints = {}
  const server: WebpackEntrypoints = {}

  const hasRuntimeConfig =
    Object.keys(config.publicRuntimeConfig).length > 0 ||
    Object.keys(config.serverRuntimeConfig).length > 0

  return {
    client,
    server
  }
}