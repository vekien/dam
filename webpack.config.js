let Encore = require('@symfony/webpack-encore');

Encore
    .setOutputPath('public')
    .setPublicPath('/')
    .addEntry('app', './src/js/app.js')
    .addStyleEntry('styles', './src/scss/styles.scss')
    .enableReactPreset()
    .disableSingleRuntimeChunk()
    .enableSassLoader(function(options) {}, {
        resolveUrlLoader: false
    })
;

// enable node environment
let config = Encore.getWebpackConfig();
config.target = 'electron-renderer';
module.exports = config;
