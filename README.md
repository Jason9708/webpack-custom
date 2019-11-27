# webpack-custom
使用 webpack 4.x 定制前端开发环境


## Webpack 基本概念
> webpack 本质上是一个打包工具，它会根据代码的内容解析模块依赖，帮助我们把多个模块的代码打包。

> webpack 会把我们项目中使用到的多个代码模块（可以是不同文件类型），打包构建成项目运行仅需要的几个静态文件。webpack 有着十分丰富的配置项，提供了十分强大的扩展能力，可以在打包构建的过程中做很多事情。

#### 入口（Enrty）
在多个代码模块中会有一个`js`文件作为webpack构建的入口。`webpack`通过读取这个文件，从它开始进行解析依赖，然后打包。（默认入口文件为`./src/index.js`)

根据项目的不同需求，可能是单页面应用，也可能是多页面应用，如果是单页面应用，入口就只有一个；而如果项目比较大型，是多页面应用，那么入口通常会设置多个，一个页面对应一个入口

**以下为配置入口的例子**
```
// 单页面
module.exports = {
    entry: './src/index.js'
}

// 多页面
module.exports = {
    entry: {
        application1: './src/application1.js',
        application2: './src/application2.js',
        // ...
    }
}

// 使用数组来对多个文件进行打包
module.exports = {
    entry: {
        main: [
            './src/application1.js',
            './src/application2.js
        ]
    }
}

// 最后这个例子，可以理解为多个文件作为一个入口，webpack会解析两个文件的依赖然后进行打包
```

#### Loader
`webpack`通过`loader`提供了一种处理多种文件格式的机制。我们可以将`loader`理解为是转换器，负责把某种文件格式的内容转换成`webpack`可以支持打包的模块

**Ps**：在没有添加额外插件的情况下，`webpack` 会默认把所有依赖打包成 `js` 文件，如果入口文件依赖一个 `.hbs` 的模板文件以及一个 `.css` 的样式文件，那么我们需要 `handlebars-loader` 来处理 `.hbs` 文件，需要 `css-loader,style-loader ` 来处理 `.css` 文件，最终把不同格式的文件都解析成 `js` 代码，以便打包后在浏览器中运行。


**如何配置loader规制呢？** 当我们需要使用不同的`loader`来解析不同类型的文件时，在`module.rules`下配置规则
```
举个爪子：使用Babel来处理.js文件

module: {
    //...
    rules: [
        {
            test:/\.jsx?/,  // test匹配文件路径的正则表达式，通常都是匹配文件类型后缀
            include: [
                path.resolve(__dirname,'src') // 指定哪些路径下的文件需要经过loader处理，通常都是src下的文件
            ],
            use: 'babel-loader', // 指定使用的 loader
        }
    ]
}
```
**loader支撑了webpack处理文件的功能，所以它是比较重要，也比较复杂的，想要玩好webpack，就要玩好loader**

#### Plugin
在`webpack`的构建流程中，`plugin`用于处理更多其他的构建任务（模块代码转换的工作由`loader`处理，而其他任何工作都可以交由`plugin`来完成）。我们依据需求来添加所需的`plugin`，实现我们所需要的功能（Such as `HtmlWebpackPlugin` 可以生成创建html入口文件）
```
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    // ...
    plugins: [
        new HtmlWebpackPlugin
    ]
}
```
`plugin`可以作用于`webpack`的整个构建流程，可以在流程的每一个步骤中定制自己的构建需求。在必须时，我们还可以在`webpack`的基础上自己开发`plugin`来适应我们的需求

#### 输出 output
输出即`webpack`最终构建出来的静态文件。可以通过`output`来配置构建结果的文件名、路径等
```
module.exports = {
    //...
    output: {
        path:path.resolve(__dirname,'dist'), // 根目录下的dist
        filename:'index.js'
    }
}

// 可以配置不同入口的不同输出文件
module.exports = {
    entry: {
        application1: './src/application1.js',
        application2: './src/application2.js',
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/dist',
    }
}
```
**❗ 如果没有进行配置，默认创建的输出内容就是`./dist/main.js`**


## 一个简单的webpack配置
**❗ `webpack`运行时默认读取项目下的 `webpack-config.js`，所以我们手动创建一个`webpack.config.js`文件**

> `webpack` 的配置其实是一个 `Node.js` 的脚本，这个脚本对外暴露一个配置对象，`webpack` 通过这个对象来读取相关的一些配置。因为是`Node.js`脚本，所以可玩性非常高，你可以使用任何的 `Node.js` 模块，如 `path` 模块，或者第三方的模块也可以。

```
const path = require('path')
const UglifyPlugin = require('uglifyjs-webpack-plugin') // 用于缩小（压缩）JsW文件

module.exports = {
    entry: './src/index.js', // 入口

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'output.js'
    },

    module: {
        rules: [{
            test: /\.jsx/,
            include: [
                path.resolve(__dirname, 'src')
            ],
            use: 'babel-loader'
        }]
    },

    // 代码模块路径解析的配置
    resolve: {
        modules: [
            "node_modules",
            path.resolve(__dirname, 'src')
        ],

        extensions: [".wasm", ".mjs", ".js", ".json", ",jsx"],
    },

    plugins: [
        new UglifyPlugin()
        // 使用 uglifyjs-webpack-plugin 来压缩 JS 代码
        // 如果你留意了我们一开始直接使用 webpack 构建的结果，你会发现默认已经使用了 JS 代码压缩的插件
        // 这其实也是我们命令中的 --mode production 的效果，后续的小节会介绍 webpack 的 mode 参数
    ]
}
```

## 前端社区三大框架基于 webpack 的脚手架工具

- create-react-app
- angular/devkit/build-webpack
- vue/cli

## 搭建基本的前端开发环境
#### 基础前端开发环境需求分析
- 构建我们发布需要的HTML,JS,CSS文件
- 使用CSS预处理器来编写样式
- 处理和压缩图片
- 使用Babel支持ES6语法
- 本地提供静态服务方便开发调式

#### HTML
通常来说，一个前端项目都是从一个页面（即`HTML`）出发的，最简单的方法是，创建一个`.html`文件，使用`script`引用构建好的`.js`文件
```
<script src="./dist/output.js"></script>
```