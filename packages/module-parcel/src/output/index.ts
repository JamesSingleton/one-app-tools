import chalk from 'chalk';
import stripAnsi from 'strip-ansi'
import textTable from 'text-table';
import createStore from 'unistore';
import { OutputState, store as consoleStore } from './store'
import formatWebpackMessages from '../utils/format-webpack-messages'

export function startedDevelopmentServer(appUrl: string) {
  consoleStore.setState({ appUrl})
}

let previousClient: import('webpack').Compiler | null = null
let previousServer: import('webpack').Compiler | null = null

type CompilerDiagnosticsWithFile = {
  errors: { file: string | undefined; message: string }[] | null
  warnings: { file: string | undefined; message: string }[] | null
}

type CompilerDiagnostics = {
  errors: string[] | null
  warnings: string[] | null
}

type WebpackStatus =
  | { loading: true }
  | ({ loading: false } & CompilerDiagnostics)

type BuildStatusStore = {
  client: WebpackStatus
  server: WebpackStatus
}

enum WebpackStatusPhase {
  COMPILING = 1,
  COMPILED_WITH_ERRORS = 2,
  COMPILED_WITH_WARNINGS = 4,
  COMPILED = 5,
}

function getWebpackStatusPhase(status: WebpackStatus): WebpackStatusPhase {
  if (status.loading) {
    return WebpackStatusPhase.COMPILING
  }
  if (status.errors) {
    return WebpackStatusPhase.COMPILED_WITH_ERRORS
  }
  if (status.warnings) {
    return WebpackStatusPhase.COMPILED_WITH_WARNINGS
  }
  return WebpackStatusPhase.COMPILED
}

const buildStore = createStore<BuildStatusStore>()

buildStore.subscribe((state) => {
  const {client, server} = state;

  const [{status}] = [
    {status: client, phase: getWebpackStatusPhase(client)},
    {status: server, phase: getWebpackStatusPhase(server)}
  ].sort((a,b) => a.phase.valueOf() - b.phase.valueOf())

  const { bootstrap: bootstrapping, appUrl } = consoleStore.getState()

  if(bootstrapping && status.loading) {
    return
  }

  let partialState: Partial<OutputState> = {
    bootstrap: false,
    appUrl: appUrl!,
  }

  if (status.loading) {
    consoleStore.setState(
      {...partialState, loading: true} as OutputState,
      true
    )
  } else {
    let { errors, warnings} = status

    consoleStore.setState(
      {
        ...partialState,
        loading: false,
        typeChecking: false,
        errors,
        warnings,
      } as OutputState,
      true
    )
  }
})

export function watchCompilers(
  client: import('webpack').Compiler,
  server: import('webpack').Compiler
) {
  if (previousClient === client && previousServer === server) {
    return
  }

  buildStore.setState({
    client: {loading: true},
    server: {loading: true}
  })

  function tapCompiler(
    key: string,
    compiler: any,
    onEvent: (status: WebpackStatus) => void
  ) {
    compiler.hooks.invalid.tap(`OneAppInvalid-${key}`, () => {
      onEvent({loading: true})
    })

    compiler.hooks.done.tap(
      `OneAppDone-${key}`,
      (stats: import('webpack').Stats) => {
        const { errors, warnings } = formatWebpackMessages(
          stats.toJson({all: false, warnings: true, errors: true})
        )

        const hasErrors = !!errors?.length;
        const hasWarnings = !!warnings?.length;

        onEvent({
          loading: false,
          errors: hasErrors ? errors : null,
          warnings: hasWarnings ? warnings : null
        })
      }
    )
  }

  tapCompiler('client', client, (status) =>
    buildStore.setState({client: status})
  )

  tapCompiler('server', server, (status) =>
    buildStore.setState({server: status})
  )

  previousClient = client
  previousServer = server
}