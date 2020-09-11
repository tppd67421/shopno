const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const imagemin = require('imagemin');
const loader = require('sass-loader')
// const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    }

    if (isProd) {
        config.minimizer = [
            new OptimizeCssAssetsWebpackPlugin(),
            new TerserWebpackPlugin()
        ]
    }

    return config;
}

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const cssLoaders = extra => {
    const loaders = [
        {
            loader: MiniCssExtractPlugin.loader,
            options: {
                hmr: isDev,
                reloadAll: true
            },
        },
        'css-loader'
        // {
        //     loader: 'css-loader',
        //     options: {
        //         importLoaders: 1,
        //         modules: {
        //             localIdentName: '[local]__[sha1:hash:hex:7]'
        //         }
        //     }
        // }
    ]

    if (extra) {
        loaders.push(extra)
    }

    return loaders
}

const babelOptions = preset => {
    const opts = {
        presets: [
            '@babel/preset-env'
        ],
        plugins: [
            '@babel/plugin-proposal-class-properties'
        ]
    }

    if (preset) {
        opts.presets.push(preset)
    }

    return opts
}

const imgLoaders = () => {
    const loaders = [
        'file-loader'
    ]

    if (isProd) {
        loaders.push({
            loader: 'img-loader',
            options: {
                plugins: [
                    require('imagemin-gifsicle')({}),
                    require('imagemin-mozjpeg')({}),
                    require('imagemin-pngquant')({}),
                    require('imagemin-svgo')({})
                ]
            }
        })
    }

    return loaders
}

const plugins = () => {
    const base = [
        new HTMLWebpackPlugin({
            template: './index.html',
            minify: {
                collapseWhitespace: isProd,
                removeScriptTypeAttributes: true
            }
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, 'src/favicon.png'),
                to: path.resolve(__dirname, 'dist')
            }, {
                from: path.resolve(__dirname, 'src/assets/images'),
                to: path.resolve(__dirname, 'dist')
            }
            // from: path.resolve(__dirname, 'src/static'),
            // to: path.resolve(__dirname, 'dist')
        ]),
        new MiniCssExtractPlugin({
            filename: filename('css')
        })
    ]

    // if (isProd) {
    //     base.push(new BundleAnalyzerPlugin())
    // }

    return base
}

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        main: ['@babel/polyfill', './app/index.js'],
    },
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.js', '.ts', '.json', '.png'],
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    optimization: optimization(),
    devServer: {
        port: 4200,
        hot: isDev
    },
    devtool: isDev ? 'source-map' : '',
    plugins: plugins(),
    module: {
        rules: [
            {
                test: /\.css$/,
                use: cssLoaders()
            },
            {
                test: /\.s[ac]ss$/,
                use: cssLoaders('sass-loader')
            },
            {
                test: /\.(png|jp(e*)g|gif|svg)$/,
                use: imgLoaders()
            },
            {
                test: /\.(ttf|woff|woff2|eot)$/,
                use: ['file-loader']
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: {
                    loader: 'babel-loader',
                    options: babelOptions()
                    // options: babelOptions('@babel/preset-react')
                }
            },
        ]
    }
}