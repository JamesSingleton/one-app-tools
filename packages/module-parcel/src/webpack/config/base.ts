import { Configuration } from 'webpack';
import isWslBoolean from 'is-wsl'
import curry from 'lodash.curry'
import { ConfigurationContext } from './utils'

const isWindows = process.platform === 'win32' || isWslBoolean;

export const base = curry(function base(
  ctx: ConfigurationContext,
  config: Configuration
){
  config.mode = ctx.isDevelopment ? 'development' : 'production'
  config.name = ctx.isServer ? 'server' : 'client'
  config.target = ctx.isServer ? 'node' : 'web'

  // Stop compilation early in a production build when an error is encountered.
  config.bail = ctx.isProduction

  if (ctx.isDevelopment) {
    if(isWindows) {
      config.devtool = 'inline-source-map'
    } else {
      config.devtool = 'eval-source-map'
    }
  } else {
    if(ctx.productionBrowserSourceMaps) {
      config.devtool = 'source-map'
    } else {
      config.devtool = false
    }
  }

  if(!config.module) {
    config.module = { rules: []}
  }
  config.module.strictExportPresence = true

  return config
})