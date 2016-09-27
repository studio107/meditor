var webpack = require('webpack'),
    path = require('path'),
    version = require('./package.json').version;

var settings = {
    DEBUG: process.env.NODE_ENV !== 'production'
};

module.exports = {
    watch: false,
    cache: settings.DEBUG,
    debug: settings.DEBUG,
    devtool: settings.DEBUG ? 'eval' : 'source-map',
    node: {
        fs: "empty"
    },
    entry: {
        bundle: './js/index'
    },
    output: {
        path: path.resolve(__dirname, 'dist', version, 'js'),
        filename: '[name].js',
        publicPath: 'http://localhost:8080/static/dist/' + version + '/js/'
    },
    plugins: [
        new webpack.ProvidePlugin({
            'Promise': 'bluebird'
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': settings.DEBUG ? '"development"' : '"production"'
            }
        }),
        // this is a alternative. See pre.js
        //new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            dropDebugger: true,
            dropConsole: true,
            sourceMap: false,
            output: {
                comments: false
            },
            compressor: {
                warnings: false
            }
        })
    ],
    resolve: {
        modulesDirectories: [
            './node_modules',
            './js'
        ],
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: "style-loader!css-loader",
                exclude: /(node_modules|bower_components)/
            },
            {
                test: /\.scss$/,
                loaders: ["style", "css", "sass"],
                exclude: /(node_modules|bower_components)/
            },
            {
                test: /\.js|\.jsx$/,
                loader: ['babel-loader'],
                query: {
                    cacheDirectory: true,
                    presets: ['es2015', 'stage-0', 'react'],
                    plugins: [
                        "add-module-exports"
                    ]
                },
                exclude: /(node_modules|bower_components)/
            }
        ]
    }
};