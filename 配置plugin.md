# 配置plugin

`plugin`为`webpack`提供额外的功能，由于需要提供不同的功能，不同的插件本身的配置比较多样化

`webpack`插件可以上 https://github.com/webpack-contrib/awesome-webpack#webpack-plugins 进行查阅

### 几个常用插件
#### DefinePlugin
`DefinePlugin`是`webpack`的内置插件，不需要安装，直接通过`webpack.DefinePlugin`使用

作用：创建一些在编译时可以配置的**全局常量**，这些常量的值我们可以在`webpack`的配置中指定
```
module.exports = {
    // ...
    plugins: [
        new webpack.DefinePlugin({
            _GET:JSON.stringify('get'),   // const _GET = 'get'
            _POST:JSON.stringify('post'), // const _POST = 'post'
            _DELETE:JSON.stringify('delete'), // const _DELETE = 'delete'
            _PUT:JSON.stringify('put'), // const _PUT = 'put'
        })
    ]
}
```
这些配置好的全局常量，可以在代码中直接使用
```
console.log('this Api type is' + _GET)
```

**配置规则**
- 如果配置的值是字符串，那么字符串会被当成代码片段来执行，其结果作为最终变量的值，例如`'1 + 1'`，最后结果会是`2`
- 如果配置的值不是字符串，也不是对象字面量，那么值会转换为一个字符串，例如`true`，会被转换成`'true'`
- 如果配置的是一个对象字面量，那么该对象的所有`key`会以相同的方式定义

#### extract-text-webpack-plugin

作用：用来把依赖的`css`分离出来成为单独的文件
```
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
    // ...
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loaer',
                    use: 'css-loader'
                })
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('index.css')  // 配置文件名
    ]
}
```
```
有时候我们构建的入口不止一个，那么ExtractTextPlugin会为每一个入口创建单独分离的文件

plugins: [
    new ExtractTextPlugin('[name].css')
]
```
**❗ 使用ExtractTextPlugin，还需要调整`loader`对应的配置**


#### ProvidePlugin
`ProvidePlugin`是`webpack`内置的，直接通过`webpack.ProvidePlugin`来使用

作用： 引用某些模块作为程序运行时的变量，不必每次使用都需要`import/require`

```
plugins: [
    new webpack.ProvidePlugin({
        identifier:'xxx',  // 类似于 import 'xxx'  
        // identifier: ['xxx','xxxx']   类似于 import xxxx from 'xxxx'
    })
]
```


#### IgnorePlugin
`IgnorePlugin`是`webpack`内置的，直接通过`webpack.IgnorePlugin`来使用

作用：用于忽略某些特定的模块，让webpack不把这些指定的模块打包进去，例如我们使用了`moment.js`，如果直接引用后，里面会有大量的`i18n`代码，会导致打包出来的文件比较大，而实际上我们并不需要，这就是`IgnorePlugin`的使用场景
```
plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/,/moment$/)
]
```
`IgnorePlugin`的参数
1 - 匹配引入模块路径的正则表达式
2 - 匹配模块的对应上下文，即所在目录名