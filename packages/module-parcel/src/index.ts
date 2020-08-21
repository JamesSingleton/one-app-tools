import crypto from 'crypto';
import { promise, writeFileSync } from 'fs';
import chalk from 'chalk';
import devalue from 'devalue';
import findUp from 'find-up';
import {nanoid} from 'nanoid'
import path from 'path';
import Worker from 'jest-worker';
import chalk from 'chalk';
import { CompilerResult, runCompiler } from './compiler'
import { createEntrypoints } from './entries'
import { createBuildId } from './create-build-id'
import { isWriteable } from './is-writeable'
import writeBuildId from './write-build-id'
import createSpinner from './spinner';
import getBaseWebpackConfig from './webpack-config';
import {isCI, name} from './utils/ci-info'
import formatWebpackMessages from './utils/format-webpack-messages'
import * as Log from './output/log'

export default async function build(
  dir: string,
  conf: null,
  reactProductionProfiling: false
): Promise<void> {
  if (!(await isWriteable(dir))) {
    throw new Error(
      '> Build directory is not writeable.'
    )
  }
  // attempt to load global env values so they are available in next.config.js
  const { loadedEnvFiles } = loadEnvConfig(dir)

  const config = loadConfig(PHASE_PRODUCTION_BUILD, dir, conf)
  const { target } = config
  const buildId = await createBuildId(config.createBuildId, nanoid)
  const distDir = path.join(dir, config.distDir)

  const buildSpinner = createSpinner({
    prefixText: `${Log.prefixes.info} Creating an optimized build`
  })

  const ignoreTypeScriptErrors = Boolean(config.typescript?.ignoreBuildErrors)
  await verifyTypeScriptSetup(dir, !ignoreTypeScriptErrors)

  let tracer: any = null
  if (config.experimental.profiling) {
    const { createTrace } = require('./profiler/profiler')
    tracer = createTrace(path.join(distDir, `profile-events.json`))
    tracer.profiler.startProfiling()
  }

  const entryPoints = createEntrypoints(
    target,
    buildId,
    previewProps,
    config,
    loadedEnvFiles
  )

  const configs = await Promise.all([
    getBaseWebpackConfig(dir, {
      tracer,
      buildId,
      reactProductionProfiling,
      isServer: false,
      config,
      target,
      entrypoints: entryPoints.client
    }),
    getBaseWebpackConfig(dir, {
      tracer,
      buildId,
      reactProductionProfiling,
      isServer: true,
      config,
      target,
      entrypoints: entryPoints.server
    })
  ])

  const clientConfig = configs[0];

  if (
    clientConfig.optimization && 
    (clientConfig.optimization.minimize !== true ||
      (clientConfig.optimization.minimizer && clientConfig.optimization.minimizer.length === 0))
  ) {
    Log.warn(
      'Production code optimization has been disabled in your project.'
    )
  }

  const buildStartTime = process.hrtime();

  let result: CompilerResult = { warnings: [], errors: []}

  result = await runCompiler(configs)

  const buildEndTime = process.hrtime(buildStartTime);

  if (buildSpinner) {
    buildSpinner.stopAndPersist()
  }

  result = formatWebpackMessages(result)

  if (result.errors.length > 0) {
    if(result.errors.length > 1) {
      result.errors.length = 1;
    }

    const error = result.errors.join('\n\n');

    console.error(chalk.red('Failed to compile.\n'))

    console.error(error)
    console.error()
  } else {

    if (result.warnings.length > 0) {
      Log.warn('Compiled with warnings\n')
      console.warn(result.warnings.join('\n\n'))
      console.warn()
    } else {
      Log.info(`Compiled successfully in ${buildEndTime[0]} seconds`)
    }
  }

  const postCompileSpinner = createSpinner({
    prefixText: `${Log.prefixes.info} collecting module data`
  })

  await writeBuildId(distDir, buildId)

  if (postCompileSpinner) {
    postCompileSpinner.stopAndPersist()
  }

}