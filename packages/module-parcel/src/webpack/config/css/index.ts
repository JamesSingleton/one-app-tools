
import curry from 'lodash.curry'
import path from 'path';
import webpack, { Configuration } from 'webpack';
import MiniCssExtractPlugin from '../../plugins/mini-css-extract-plugin';
import { loader, plugin } from '../helpers';
import { ConfigurationContext, ConfiguationFn, pipe } from '../utils';
import { getCssModuleLoader, getGlobalCssLoader } from './loaders';

// RegExps for all Style Sheet variants
const regexLikeCss = /\.(css|scss|sass)$/

// RegExps for Style Sheets
const regexCssGlobal = /(?<!\.module)\.css$/
const regexCssModules = /\.module\.css$/

// RegExps for Syntactically Awesome Style Sheets
const regexSassGlobal = /(?<!\.module)\.(scss|sass)$/
const regexSassModules = /\.module\.(scss|sass)$/

export const css = curry(async function css(
  ctx: ConfigurationContext,
  config: Configuration
) {
  const { prependData: sassPrependData, ...sassOptions } = ctx.sassOptions

  const sassPreprocessors: webpack.RuleSetUseItem[] = [
    {
      loader: require.resolve('sass-loader'),
      options: {
        sourceMap: true,
        sassOptions,
        prependData: sassPrependData,
      },
    },
    {
      loader: require.resolve('resolve-url-loader'),
      options: {
        sourceMap: true,
      },
    },
  ]

  const fns: ConfigurationFn[] = [
    loader({
      oneOf: [
        {
          test: /a^/,
          loader: 'noop-loader',
          options: { __oneapp_css_remove: true }
        }
      ]
    })
  ]

  const postCssPlugins = await getPostCssPlugins(
    ctx.rootDirectory,
    ctx.isProduction,
    true
  )

  fns.push(
    loader({
      oneOf: [
        {
          test: regexLikeCss,
          // Does One App have an issuer we can use here?
          use: {
            loader: 'error-loader',
          }
        }
      ]
    })
  )

  fns.push(
    loader({
      oneOf: [
        {
          sideEffects: false,
          test: regexCssModules,
          issuer: {
            and: [ctx.rootDirectory],
            not: [/node_modules/]
          },
          use: getCssModuleLoader(ctx, postCssPlugins)
        }
      ]
    })
  )

  fns.push(
    loader({
      oneOf: [
        {
          sideEffects: false,
          test: regexSassModules,
          issuer: {
            and: [ctx.rootDirectory],
            not: [/node_modules/]
          },
          use: getCssModuleLoader(ctx, postCssPlugins, sassPreprocessors)
        }
      ]
    })
  )

  fns.push(
    loader({
      oneOf: [
        {
          test: [regexCssModules, regexSassModules].filter(Boolean),
          use: {
            loader: 'error-loader',
            options: {
              reason: getLocalModuleImportError()
            }
          }
        }
      ]
    })
  )

  if(ctx.isServer) {
    fns.push(
      loader({
        oneOf: [
          {
            test: [regexCssGlobal, regexSassGlobal].filter(Boolean),
            use: require.resolve('ignore-loader')
          }
        ]
      })
    )
  } else if (ctx.customAppFile) {
    fns.push(
      loader({
        oneOf: [
          {
            sideEffects: true,
            test: regexCssGlobal,
            issuer: { and: [ctx.customAppFile]},
            use: getGlobalCssLoader(ctx, postCssPlugins)
          }
        ]
      })
    )

    fns.push(
      loader({
        oneOf: [
          {
            sideEffects: true,
            test: regexSassGlobal,
            issuer: { and: [ctx.customAppFile]},
            use: getGlobalCssLoader(ctx, postCssPlugins, sassPreprocessors)
          }
        ]
      })
    )
  }

  // Throw an error for Global CSS used inside of `node_modules`
  fns.push(
    loader({
      oneOf:[
        {
          test: [regexCssGlobal, regexSassGlobal].filter(Boolean),
          issuer: { and: [/node_modules/]},
          use: {
            loader: 'error-loader',
            options: {
              reason: getGlobalModuleImportError(),
            }
          }
        }
      ]
    })
  )

  if (ctx.isClient) {
    fns.push(
      loader({
        oneOf: [
          {
            issuer: regexLikeCss,
            exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
            use: {
              loader: require.resolve('file-loader'),
              options: {
                name: 'static/media/[name].[hash].[ext]',
              }
            }
          }
        ]
      })
    )
  }

  if (ctx.isClient && ctx.isProduction) {
    fns.push(
      plugin(
        // @ts-ignore
        new MiniCssExtractPlugin({
          filename: 'static/css/[contenthash].css',
          chunkFilename: 'static/css/[contenthash].css',
          ignoreOrder: true
        })
      )
    )
  }

  const fn = pipe(...fns)
  return fn(config)
})