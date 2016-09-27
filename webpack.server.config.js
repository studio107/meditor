var webpack = require('webpack'),
    webpackDevServer = require("webpack-dev-server"),
    extend = require('util')._extend,
    version = require('./package.json').version,
    webpackConfig = require('./webpack.config'),
    config = extend(webpackConfig, {
        entry: {
            bundle: [
                'webpack-dev-server/client?http://localhost:8080',
                'webpack/hot/only-dev-server',
                './js/index'
            ]
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoErrorsPlugin(),
            new webpack.optimize.DedupePlugin()
        ]
    });

new webpackDevServer(webpack(config), {
    publicPath: '/static/dist/' + version + '/js/',
    hot: true,
    historyApiFallback: true
}).listen(8080, '0.0.0.0', function (err, result) {
    if (err) {
        console.log(err);
    }
    console.log('Listening at localhost:8080');
});