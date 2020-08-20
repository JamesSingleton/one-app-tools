import crypto from 'crypto';
import { promise, writeFileSync } from 'fs';
import path from 'path';
import Worker from 'jest-worker';
import chalk from 'chalk';
import { createEntrypoints } from './entries'
import { createBuildId } from './create-build-id'
import { isWriteable } from './is-writeable'
import createSpinner from './spinner';
import getBaseWebpackConfig from './webpack-config';
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

  
}