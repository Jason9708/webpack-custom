# 区分开发与生产环境

`webpack 4.x`引入了`mode`的概念，在运行`webpacks`时需要指定使用`production`还是`development`，这个功能说明我们需要具备运行两套构建环境的能力

当你指定了使用`production mode`时，默认会启动各种性能优化的功能，而`development mode`，则会开启debug工具，运行时打印详细错误信息。

### 在配置文件中区分mode
之前我们的配置文件都是直接暴露一个`js`对象，这种方式无法获取到`mode`参数，所以我们要更换另外一种方式。

官文多种配置类型文档：https://webpack.docschina.org/configuration/configuration-types/

配置文件可以暴露一个函数
```
module.exports = (env, argv) => ({
    // ...
    optimization: {
        minimize: false,
        // 通过argv来获取mode
        minimizer: argv.mode === 'production' ? [
            // ... 自己的配置
        ]:[]
    }
})
```
这样获取mode之后，我们就能区分不同的构建环境，然后根据不通环境再对特殊的`loader`或`plugin`做额外配置


### 拆分配置
我们可以将`webpack`的配置按照不同的环境拆分成多个文件，运行时直接根据环境变量加载对应的配置文件

举个爪子，当我们用`webpack`构建`vue`项目时,即`vue init webpack projectname`,我们可以看到`build`文件夹下已经区分了`mode`

根据这个例子，我们可以划分成下面几个文件
```
- webpack.base.js       基础部分，即共享的配置
- webpack.dev.js        开发环境使用的配置
- webpack.pro.js        生产环境使用的配置
```

#### 如何处理这样的配置拆分
对于`webpack`的配置，其实就是对外暴露一个`js`对象，所以对于这个对象，我们可以使用`js`代码来修改
```
const config = {
    // webpack配置
}

config.plugins.push(...) // 修改这个配置对象

module.exports = config // 暴露这个对象
```

此外我们要有一个工具（`webpack-merge`）帮助我们合并多个配置对象，这样我们就可以很轻松地拆分`webpack`配置，然后判断当前的环境变量，使用工具将对应环境的配置对象整合后提供给`webpack`

举个爪子
```
基础共享部分（webpack.base.js

module.exports = {
    entry: ...,
    output: {
        ...
    },
    resolve: {
        ...
    },
    module: {
        ...
    },
    plugins: [
        ...
    ]
}
```
```
webpack.dev.js 
需求： 添加loader/plugin

const merge = require('webpack-merge')
const webpack = require('webpack')
const baseWebpackConfig = require('./webpack.base.js')

module.exports = merga(baseWebpackConfig, {
    module: {
        rules: [
            // 注意：当这里use的值是字符串或者是对象的话，会替换掉原本规则use的值
            ... 
        ]
    },
    plugins: [
        // plugins会与baseWebpackConfig中的plugins数组进行合并
        ...
    ]
})
```

