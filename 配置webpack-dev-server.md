# 配置webpack-dev-server
在开发流程中，我们在部署到生产环境之前，都应该是在本地上先开发，运行我们写的代码，我们称为**本地环境**，这个环境相当于提供了一个简单的服务器，用于访问`webpack`构建好的静态文件。

（在开发中我们用它来调式代码）

`webpack-dev-server`是`webpack`提供的一个工具，可以基于当前的`webpack`配置快速启动一个**静态服务**.

当`mode`为`development`时，会具备热更新的功能（实时根据修改刷新当前页面）

### webpack-dev-server 官方文档
https://webpack.docschina.org/configuration/dev-server/

### webpack-dev-server的基础使用
`webpack-dev-server`是一个依赖包，需要手动安装，然后在已经有`webpack`配置文件的项目目录下直接使用即可
```
npm install webpack-dev-server -D

webpack-dev-server --mode development
```

我们也可以通过配置`package.json`来更改启动命令
```
package.json

{
    // ...
    "scripts": {
        "dev": "webpack-dev-server --mode development"
    }
}


然后命令行使用 npm run dev 即可运行
```

**PS：**`webpack-dev-server`默认使用`8080`端口，如果`webpack`已经配置好了`html-webpack-plugin`来构建`html`文件，那么当我们访问`http://localhost:8080`就可以看到`index.html`页面，而如果没有进行配置，那么`webpack-dev-server`会自己生成一个页面用于展示静态资源

### 配置 webpack-dev-server

`devServer`字段是`webpack`用于配置`webpack-dev-server`的核心，我们可以在其中实现修改端口等功能

#### 常用 devServer 配置
```
- port      用于指定静态服务开启的端口（默认8080）
- host      用于指定静态服务的主机名（默认是localhost）
- publicPath        用于指定构建好的静态文件在浏览器中以什么路径去访问（默认是/)
    - 例如有一个构建好的文件 output.js，完整的访问路径为 http://localhost:8080/output.js , 如果配置了 publicPath: 'assets/'，那么 output.js 的访问路径就是 http://localhost:8080/assets/output.js
    - 建议生产环境的 devServer.publicPath 与 output.publicPath 的值一致
- proxy     用于设置请求代理，即将特定URL的请求代理到另外一台服务器上（如果需要请求单独的后端服务API时，可以通过这个配置进行代理）

举个爪子
proxy: {
    '/api': {
        target: "http://localhost:8000", // 将URL中带有 /api 的请求代理到 http://localhost:8000 上
        pathRewrite: { '^/api', '' } // 去掉URL中的 api 部分
        changeOrigin: true // 本地会虚拟一个服务器接受你的请求并代你发送该请求，可以解决跨域问题
    }
}

- contentBase       用于配置提供额外静态文件内容的目录，即配置额外静态文件内容的访问路径（那些不经过webpack构建，但在webpack-dev-server中提供访问的静态资源）

举个爪子：
contenBase: path.join(__dirname, "public") // 当前目录下的 public
constBase: [ path.join(__dirname, "public"), path.join(__dirname, "assets" )}

- before & after        用于配置用于在`webpack-dev-server`定义额外的中间件
    - before        在`webpack-dev-server`静态资源中间件处理之后，可以用于拦截部分请求返回特定内容，或者实现简单的数据mock
    - after     在webpack-dev-server静态资源中间件处理之后，可以用于打印日志等操作
```

### 配置 webpack-dev-middleware 中间件

`webpack-dev-middleware`就是在`Express`中提供`webpack-dev-server`静态服务能力的一个中间件

`webpack-dev-middleware`是一个依赖，需要手动安装
```
npm install webpack-dev-middleware --save-dev


在装有express的node服务里
const middleware = require("webpack-dev-middleware")

app.use(middleware(xxx,{
    xxx
}))
```

### 实现一个简单的mock服务
在日常的工作中，前端人员常常会因为后端接口未完成或者数据返回参差不齐，导致页面开发完后，进度停滞不前，那么我们就需要`mock`服务来帮助我们模拟后端数据，而`webpack-dev-server`的`before`或`proxy`配置，又或者`webpack-dev-middleware`结合`Express`，都可以帮助我们实现简单的`mock`服务


当我们请求某一个特定的路径时（如`/market/shopsList`），可以访问我们想要的数据内容

我们先基于`Express app`实现一个简单的`mock`功能方法
```
module.export = function mock(app) {
    app.get('/market/shopsList', (req,res) => {
        res.json({
            data:'' // 模拟返回数据
        })
    })

    // ...
}
```
然后配置`webpack-dev-server`中的`before`字段
```
const mock= require('./mock')

before(app) {
    mock(app) // 调用mock函数
}
```
