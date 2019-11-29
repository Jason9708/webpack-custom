const path = require('path')
const UglifyPlugin = require('uglifyjs-webpack-plugin') // 用于缩小（压缩）JsW文件
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
    entry: './src/index.js', // 入口

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'output.js'
    },

    module: {
        rules: [
            // 处理ES6
            {
                test: /\.jsx?/,
                include: [
                    path.resolve(__dirname, 'src')
                ],
                use: 'babel-loader'
            },
            // 处理 css
            {
                test: /\.css/,
                // 因为这个插件需要干涉模块转换的内容，所以需要使用它对应的 loader
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader',
                }),
            },
            // 处理 Less
            {
                test: /\.less$/,
                // 因为这个插件需要干涉模块转换的内容，所以需要使用它对应的 loader
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader',
                        'less-loader',
                    ],
                }),
            },
            // 处理图片
            {
                test: /\.(png|jpg|gif)$/,
                use: [{
                    loader: 'file-loader',
                    options: {},
                }, ],
            }
        ]
    },

    // 代码模块路径解析的配置
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src') // 为src设置别名
        },
        modules: [
            "node_modules",
            path.resolve(__dirname, 'src')
        ],

        extensions: [".wasm", ".mjs", ".js", ".json", ",jsx"],
    },

    plugins: [
        // 使用 uglifyjs-webpack-plugin 来压缩 JS 代码
        // 如果你留意了我们一开始直接使用 webpack 构建的结果，你会发现默认已经使用了 JS 代码压缩的插件
        // 这其实也是我们命令中的 --mode production 的效果，后续的小节会介绍 webpack 的 mode 参数
        new UglifyPlugin(),
        // 关联 HTML
        new HtmlWebpackPlugin({
            filename: 'index.html', // 配置输出文件名和路径
            template: path.join(__dirname, './src/index.html'),
        }),
        // 将.css文件单独分离
        new ExtractTextPlugin('index.css'), // 分离 css

    ]
}