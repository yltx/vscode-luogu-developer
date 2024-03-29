/* eslint-disable @typescript-eslint/no-var-requires */
//@ts-check
'use strict';

const resolve = require('path').resolve;

/** @typedef {import('webpack').Configuration} WebpackConfig **/

/**
 * @param { 'production' | 'development' | 'none' } mode
 * @returns {WebpackConfig}
 */
function getBaseConfig(mode) {
  return {
    mode,
    externals: {
      vscode: 'commonjs vscode'
    },
    devtool: mode !== 'production' ? 'source-map' : undefined,
    infrastructureLogging: {
      level: 'log'
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@': resolve('src'),
        '@w': resolve('webview'),
        'luogu-api': resolve('luogu-api-docs', 'luogu-api.d.ts')
      }
    }
  };
}

/**
 * @param { 'production' | 'development' | 'none' } mode
 * @returns {WebpackConfig}
 */
function getExtensionConfig(mode) {
  return {
    ...getBaseConfig(mode),
    target: 'node',
    entry: './src/extension.ts',
    output: {
      filename: 'extension.js',
      path: resolve('dist'),
      libraryTarget: 'commonjs2'
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: resolve('tsconfig.extension.json')
              }
            }
          ]
        }
      ]
    }
  };
}

/**
 * @param { 'production' | 'development' | 'none' } mode
 * @returns {WebpackConfig}
 */
function getOldWebviewConfig(mode) {
  return {
    ...getBaseConfig(mode),
    target: ['web', 'es2020'],
    entry: './src/webview/main.ts',
    output: {
      filename: 'webview.js',
      path: resolve('dist')
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: resolve('tsconfig.json')
              }
            }
          ]
        }
      ]
    }
  };
}

/**
 * @param { 'production' | 'development' | 'none' } mode
 * @param {WebpackConfig['entry']} entry
 * @returns {WebpackConfig}
 */
function GetWebviewConfig(mode, entry) {
  return {
    ...getBaseConfig(mode),
    entry,
    target: ['web', 'es2020'],
    output: {
      filename: '[name].js',
      path: resolve('dist')
    },
    module: {
      rules: [
        {
          exclude: /node_modules/,
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: resolve('tsconfig.webview.json')
            }
          }
        },
        {
          exclude: /node_modules/,
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // plugins: [new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)()]
  };
}

module.exports =
  /**
   * @param {{ mode: 'production' | 'development' | 'none' | undefined; }} argv
   * @returns { Promise<WebpackConfig[]> }
   */
  function (env, argv) {
    const mode = argv.mode || 'none';
    return Promise.all([
      getExtensionConfig(mode),
      getOldWebviewConfig(mode),
      GetWebviewConfig(mode, {
        benben: './webview/benben'
      })
    ]);
  };
