/*eslint-env node */
var _ = require( 'lodash' );
var path = require( 'path' );
var webpack = require( 'webpack' );
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
//var ExtractTextPlugin = require("extract-text-webpack-plugin");
//var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
//var purify = require("purifycss-webpack-plugin");
var pkg = require('./package.json');

var pathAppTo;

function pathTo() {
    return path.join( __dirname, 'src', path.join.apply( path, arguments ) );
}

pathAppTo = _.partial( pathTo, 'app' );

module.exports = function ( options ) {
    var config = _.merge( {}, {
        devServer: {
            contentBase: path.join( __dirname, 'src' ),
            publicPath: '/',
            hot: true,
            inline: true,
            historyApiFallback: true,
            stats: 'minimal',
            proxy: {
                '/api/v1/*': 'http://localhost:9000'
            },
            host: '0.0.0.0',
            port: 8080
        },
        entry: {
            vendor: _.reject(_.keys(pkg.dependencies), function(v) {
                return _.includes([
                    'material-ui',
                    'intl',
                    'lodash'
                ], v)
            }).concat([
                './src/fontello/css/animation.css',
                './src/fontello/css/fontello.css',
                'ladda/dist/ladda.min.css'
            ])
        },

        output: {
            path: path.join( __dirname, 'build' ),
            filename: '[name].js'
        },
        plugins: [
            //new ExtractTextPlugin('[name].[chunkhash].css'),
            new HtmlWebpackPlugin({
              template: 'src/index.ejs',
              inject: false
            }),
            new webpack.DefinePlugin( {
                __VERSION__: JSON.stringify(pkg.version)
            } ),
            new webpack.HotModuleReplacementPlugin(),

            new CopyWebpackPlugin([
                { from: './src/favicon.ico' },
                { from: './assets/img/*.png' },
                { from: './assets/img/*.jpg' },
                { from: './assets/img/*.svg' },
                { from: './locales/**/*.json' }
            ]),
            /*
            new LodashModuleReplacementPlugin({
              collections: true,
              paths: true
            }),*/
            new webpack.NamedModulesPlugin(),
            new webpack.optimize.CommonsChunkPlugin({names: ['vendor']})
        ],
        resolve: {
            modules: [
              "src",
              "node_modules"
            ],
            extensions: ['.js', '.jsx', '.styl', 'css' ],
            alias: {
                //application aliases
                components: pathAppTo( 'components' ),
                utils: pathAppTo( 'utils' ),
                services: pathAppTo( 'services' ),
                parts: pathAppTo( 'parts' ),
                assets: pathTo( 'assets' ),
                config: pathAppTo( 'config.js' )
            }
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                      'style-loader',
                      'css-loader'
                    ]
                },
                {
                    test: /.(gif|png|woff(2)?|eot|ttf|svg)(\?[a-z0-9=\.]+)?$/,
                    use: ['url-loader']
                },
                {
                    test: /\.jpg|\.png|\.mp3/,
                    use: ['file-loader']
                },
                {
                    test: /\.styl$/,
                    use: [
                      'style-loader',
                      'css-loader',
                      'stylus-loader'
                    ]
                }
            ]
        }
    }, options.overrides );

    config.module.rules = _.union( config.module.rules, options.rules );
    config.plugins = _.union( config.plugins, options.plugins );
    return config;
};
