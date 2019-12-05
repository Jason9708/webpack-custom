# 创建自己的loader

### loader 是一个函数
```
举个爪子：这个爪子是markdown-loader的实现代码

"use strict";

const marked = require('marked')
const loaderUtils = require("loader-utils")

modules.exports = function(markdown) {
    // 使用loaderUtils来获取loader信息
    // this指向构建运行时的上下文
    const options = loaderUtils.getOptions(this)

    this.cacheable()

    // 把配置项直接传递给marked
    marked.setOptions(options)

    // 使用marked处理markdown字符串，然后返回
    return marked(markdown)
}
```

`markdown-loader`本身仅仅只是一个函数，接收模块代码的内容，然后返回代码内容转化后的结果（`loader`本质就是这样一个函数）

**PS：**`loader-utils`是`webpack`官方提供的一个工具库，提供`loader`处理时需要用到的一些工具方法，例如用来解析上下文loader配置项的`getOptions`

### 开始一个`loader`的开发
我们可以在`webpack`配置中直接使用路径来指定使用本地的`loader`，或者在`loader`路径解析中加入本地开发的`loader`目录
```
配置例子：

module：{
    rules: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: path.resolve('./loader/index.js')  // 使用本地的 ./loader/index.js 作为loader
        }
    ]
}


// 在 resolveLoader 中添加本地开发的 loaders 存放路径
// 如果同时需要开发多个 loader，那么这个方式更合适
resolveLoader: {
    modules: [
        'node_modules',
        path.resolve(__dirname,'loaders')
    ]
}
```

我们知道`loader`是一个函数，它接收代码内容，然后返回处理结果

首先`loader`函数接收的参数有三个：`content，map，meta`
-   `content`是模块内容，但不限于字符串，也可以是Buffer（例如一些图片或者字体等文件）
-   `map`是sourcemap对象
-   `meta`是其他的一些元数据


`loader`函数单纯返回一个值，这个值被当成`content`去处理，但如果你需要返回`sourcemap`对象或者`meta`数据，甚至是抛出一个`loader`异常给`webpack`时，你需要使用`this.callback(err,content,map,meta)`来传递这些数据

### Pitching loader
我们可以使用`pitch`来跳过loader的处理，`pitch`方法是`loader`额外实现的一个函数
```
官方例子：

module.exports = function(content) {
    return someSyncOperation(content,this.data.value)  // 由于pitch的缘故，这里data.value为42
}
// 挂在loader函数上的pitch函数
module.exports.pitch = function(remainingRequest,precedingResquest,data) {
    data.value = 42
}
```
我们可以把`pitch`理解为`loader`的前置钩子，它可以使用`this.data`来传递数据，然后具备跳过剩余`loader`的能力

在一个`use`配置中，所有的`loader`执行前都会先执行对应的`pitch`,并且与`loader`执行顺序是相反的
```
use: [
    'bar-loader',
    'foo-loader',
]
// 执行 bar-loader 的 pitch
// 执行 foo-loader 的 pitch
// 执行 foo-loader
// 执行 bar-loader
```
当`pitch`中返回了结果，那么执行顺序会回过头来，跳掉剩余的loader，如`bar-loader`的`pitch`返回了结果，那么执行只剩下
```
// 执行 bar-loader 的 pitch
```

### loader上下文
`this`即`loader`函数的上下文，包括`this.callback`和`this.data`等，可以理解为 `this`是`loader`运行时数据和调用方法的补充载体


### 一个好的loader是怎么样的
`loader`作为`webpack`解析资源的一种扩展方式，最重要的是足够简单易用，专注于处理自己那一块的内容，便于维护，可以和其他多个`loader`协同来处理更加复杂的情况
```
官方对loader用法准则有以下几个定义

-   简单易用
-   使用链式传递
-   模块化的输出
-   确保无状态
-   使用 loader utilities
-   记录 loader 的依赖
-   解析模块依赖关系
-   提取通用代码
-   避免绝对路径
-   使用 peer dependencies
```