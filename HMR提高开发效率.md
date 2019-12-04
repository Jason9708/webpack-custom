# 用HMR提高开发效率
`Hot Module Replacement`，即模块热替换。之前我们使用过`Hot Reloading`，当代码变更时通知浏览器刷新页面，避免手动刷新的繁琐环节。

`Hot Module Replacement`可以说是`Hot Reloading`的增加版，所谓增加，它不用整个页面刷新，而是局部替换掉部分模块代码并且使其生效。

所以，`Hot Module Replacement`即避免了频繁手动刷新页面，也减少了页面刷新时的等待时间，以此极大地提高前端页面开发效率

### 配置使用HMR
我们需要在`webpack`的配置文件中添加启用`HMR`需要的两个插件
```
const webpack = require('webpack')

module.exports = {
    // ...
    devServer: {
        hot: true   // dev-server 的配置要启动 hot，或者在命令行中带参数开启 
    },
    plugins: [
        // ...
        new webpack.NamedModulesPlugin(), // 用于启动 HMR 时可以显示模块的相对路径
        new webpack.HotModuleReplacementPlugin()  // Hot Module Replacement 的插件
    ]
}
```

### 理解HMR
开启`hot`功能的`webpack`会往我们应用的主要代码中添加`WS`相关的代码，用于和服务连接，等待更新动作

当你配置了`HMR`的插件时，会往应用代码中添加`HMR`运行时的代码，主要用于定义代码模块应用更新时的`API`

`HMR`运行时代码会提供定义代码模块应用更新执行的API，这些API可以让我们在模块中定义接收到`HMR`更新应用信号时，需要额外做一些什么工作
```
例如，style-loader 就需要实现 HMR 接口，当收到代码更新时，使用新的样式替换旧的样式

if(module.hot){
    module.hot.accept('xxx/, () => {
        //  ...新样式替换旧样式
    })
}
```

`HMR`应用更新时是使用`webpackHotUpdate`来处理的
```
webpackHotUpdate(id, {
    'modulePath': function() {
        // 模块更新后的代码
    }
})
```
执行`webpackHotUpdate`时如果发现模块代码实现了`HMR`接口，就会执行相应的回调或者方法，从而达到应用更新时，模块可以自行管理自己所需要额外做的工作

不过并不是所有的模块都需要做相关的处理，当遇见没有实现`HMR`接口的模块是，就会进行冒泡（向上）

### module.hot 常见的 API

##### module.hot.accept
`module.hot.accept`方法指定在应用特定代码模块更新时执行相应的`callback`，第一个参数可以是字符串或者数组
```
if(module.hot){
    module.hot.accept(['./bar.js','./index.css'], () => {
        // ... 这样当 bar.js或者 index.css 更新时都会执行该函数
    })
}
```
##### module.hot.decline
`module.hot.decline`对于指定的代码模块，拒绝进行模块代码的更新，进入更新失败状态，例如`module.hot.decline('./bar.js')`

##### module.hot.dispose
`module.hot.dispose`用于添加一个处理函数，在当前模块代码被替换时运行该函数
```
if (module.hot) {
  module.hot.dispose((data) => {
    // data 用于传递数据，如果有需要传递的数据可以挂在 data 对象上，然后在模块代码更新后可以通过 module.hot.data 来获取
  })
}
```

##### module.hot.removeDisposeHandler
`module.hot.removeDisposeHandler` 用于移除`dispose`方法添加的`callback`

`module.hot.accept` 通常用于指定当前依赖的某个模块更新时需要做的处理，如果是当前模块更新时需要处理的动作，使用 `module.hot.dispose` 会更加容易方便。