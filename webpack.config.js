
//webpack2.4.1
const webpack = require('webpack');

// 提取出模块中所有引入的样式表文件，将其打包成一个独立的CSS文件
const ExtractTextPlugin = require('extract-text-webpack-plugin');

// 复制文件 
const CopyWebpackPlugin = require('copy-webpack-plugin');

// path模块，用于处理文件和目录路径的工具
const path = require('path');

// 配置项
const config = {

    // 页面入口配置文件
    entry: {
        'vendor':[
            './src/js/vue.min'
            ],
        'index': './src/js/index',
        'public': './src/js/public',
        'list':'./src/js/list'
    },

    //输出模块
    output: {
        path: __dirname + '/dist',
        filename: 'js/[name].js'
    },
    // 观察模式
    // 监测代码，并在代码改变的时候进行重新编译
    //watch:true,

    //加载器
    module: {
        rules: [
            // 编译sass,压缩css
            {
                test: /\.scss|\.css$/,
                // use: [
                //     "style-loader",
                //     "css-loader",
                //     "sass-loader"
                // ]
                use: ExtractTextPlugin.extract({
                    // 通过JS创建style节点，并将其插入<head>中
                    fallback: 'style-loader',
                    use: [{
                            // 解析CSS样式表，将其中的@import和url()当作require来处理
                            loader: 'css-loader'
                        },
                        {
                            // 将SCSS编译成CSS文件
                            loader: 'sass-loader',
                            options: {
                                compress: false
                            }
                        }
                    ]
                })
            },
            {
                test:/\.pug$/,
                use:[{
                    loader:'pug-loader'
                }]
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [{
                    loader: 'url-loader',
                    options: {
                        name: '/img/[name]-[hash:5].[ext]',
                        limit: 25000 // 单位：Byte，例如25000===25kb
                    }
                }]
                // use: [{
                //         loader: 'file-loader',
                //         query: {
                //             name: '/images/[name]-[hash:5].[ext]',
                //             //limit: 250000 // 单位：Byte，例如25000===25kb
                //         }
                //     },
                //     {
                //         loader: 'image-webpack-loader',
                //         query: {
                //             // optimizationLevel:7,
                //             interlaced:false
                //         }
                //     }

                // ]
            }
            // ,
            // {
            //     test: /\.vue$/,
            //     use: [{
            //         loader: 'vue-loader'
            //     }]            
            // }
        ]
    },
    // 观察模式
    // 监测代码，并在代码改变的时候进行重新编译
    watch: true,
    watchOptions: {
        // 当代码首次被改变后增加一个时间延迟
        // 如果在这段延迟时间内，又有其他代码发生了改变，
        // 则其他的改变也将在这段延迟时间后，一并进行编译
        aggregateTimeout: 300,

        // 不进行监测的文件
        // 监测大量的文件将占用CPU或许多内存空间，例如node_modules
        ignored: /node_modules/

        // 每隔一段时间，自动检查代码的改变，例如1000表示每秒进行一次检查
        // 在观察模式不起作用的时候，可以尝试打开这个配置项
        // poll: 1000 
    },
    /*
  配置开发时用的服务器, 让你可以用 http://127.0.0.1:8080/ 这样的url打开页面来调试
  并且带有热更新的功能, 打代码时保存一下文件, 浏览器会自动刷新. 比nginx方便很多
  如果是修改css, 甚至不需要刷新页面, 直接生效. 这让像弹框这种需要点击交互后才会出来的东西调试起来方便很多.
  */
    devServer: {
        // 配置监听端口, 因为8080很常用, 为了避免和其他程序冲突, 我们配个其他的端口号
        port: 8100,
        /*
        historyApiFallback用来配置页面的重定向

        SPA的入口是一个统一的html文件, 比如
        http://localhost:8010/foo
        我们要返回给它
        http://localhost:8010/index.html
        这个文件

        配置为true, 当访问的文件不存在时, 返回根目录下的index.html文件
        */
        historyApiFallback: true,

        // --告诉服务器从哪里提供内容
        contentBase: path.join(__dirname, 'dist')

        // --使用代理，需要 http-proxy-middleware  代理包,连接后台接口的时候使用
        // proxy: {
        //     "/api": "http://localhost:3000"
        // //     "/api": {
        // //         target: "http://localhost:3000",
        // //         pathRewrite: {"^/api" : ""},
        // //         secure: false
        // //     }
        // }
    },


    plugins: [
        // 定义当前开发环境，然后根据开发环境加载对应的插件
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }
        }),
        //scss编译以后的css文件
        new ExtractTextPlugin({
            filename: './css/[name].css',
            allChunks: true
        }),
        // 合并打包第三方库分片
        new webpack.optimize.CommonsChunkPlugin({
            // 入口模块名
            name: 'vendor',

            // 用于重命名公共分片文件名
            // 默认分片名同output中的filename或chunkFilename
            // 例如，vendor.bundle.js
            // filename: 'vendor.js',

            // 使用公共模块的入口模块的最小数量n，2 <= n <= 入口模块总数
            // 例如，minChunks: 3，表示若一个模块同时被3个及以上的入口模块所调用，才将其提取为一个公共分片
            // 若为Infinity，则仅仅创建该公共分片，不提取任何公共模块（适用于打包合并第三方库分片）
            minChunks: Infinity
        }),

        // 提取多个入口模块间的公共分片，用于在各模块间共享使用
        // 通过与其他模块解绑，使得该公共分片只需要加载一次，便能够进行缓存，
        // 当新页面加载时，该公共分片将直接从缓存中提取，而不需要重新加载
        new webpack.optimize.CommonsChunkPlugin({
            // 公共分片名
            name: 'common.chunk',

            // 需要提取公共模块的入口模块
            chunks: [

            ]
        }),

        // 自动加载模块，配置好的模块在使用的时候，将不再需要传入依赖数组
        // 这里将jquery作为自动加载模块，在其他模块内使用$,jQuery则能直接调用
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            _: 'lodash'
        }),
        //拷贝没有编译的静态资源
        new CopyWebpackPlugin([
            //html
            {
                context: path.resolve(__dirname, 'src'),
                from: '*.html',
                to: ''
            },
            //css
            {
                context: path.resolve(__dirname, 'src'),
                from: "**/*.css",
                to: ""
            },
            //img
            {
                from: path.resolve(__dirname, 'src/img'),
                to: "img"
            }
        ])
    ]


};

module.exports = config;