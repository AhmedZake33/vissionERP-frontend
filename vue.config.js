const path = require('path')

module.exports = {
  publicPath: '/',
  parallel: false,
  productionSourceMap: false,
  lintOnSave: false,
  css: {
    loaderOptions: {
      sass: {
        sassOptions: {
          includePaths: ['./node_modules', './src/assets'],
        },
      },
    },
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@themeConfig': path.resolve(__dirname, 'themeConfig.js'),
        '@core': path.resolve(__dirname, 'src/@core'),
        '@validations': path.resolve(__dirname, 'src/@core/utils/validations/validations.js'),
        '@axios': path.resolve(__dirname, 'src/libs/axios'),
      },
    },
    optimization: {
      minimizer: [
        new (require('terser-webpack-plugin'))({
          parallel: false,
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
      ],
    },
  },
  chainWebpack: config => {
    // Remove thread-loader to avoid spawn issues on Node v22 Windows
    const jsRule = config.module.rule('js')
    jsRule.uses.delete('thread-loader')
    const tsRule = config.module.rule('ts')
    if (tsRule) tsRule.uses.delete('thread-loader')

    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        // eslint-disable-next-line no-param-reassign
        options.transformAssetUrls = {
          img: 'src',
          image: 'xlink:href',
          'b-avatar': 'src',
          'b-img': 'src',
          'b-img-lazy': ['src', 'blank-src'],
          'b-card': 'img-src',
          'b-card-img': 'src',
          'b-card-img-lazy': ['src', 'blank-src'],
          'b-carousel-slide': 'img-src',
          'b-embed': 'src',
        }
        return options
      })
  },
  transpileDependencies: ['vue-echarts', 'resize-detector', 'laravel-echo', 'pusher-js'],
}
