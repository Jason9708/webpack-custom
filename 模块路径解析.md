# webpack 如何解析代码模块路径

模块化开发的前端工作规范已经深入人心，在webpack支持的模块化中，我们可以使用`import xxx from 'xxx.js`

又例如我们用`VUE`进行开发的时候，必须使用`import vue from 'Vue'`，`webpack`在构建的时候，会解析依赖，然后再去加载依赖的模块文件

那么`webpack`是如何将 `xxx.js` 或者 `Vue` 解析成模块文件路径呢❓

### 模块解析规则

- 解析相对路径
    - 查找相对当前模块的路径下是否有对应文件或者是文件夹
    - 是文件则直接加载
    - 是文件夹则继续查找文件夹下的`package.json`
    - 存在`package.json`文件则按照文件中`main`字段的文件名来查找文件
    - 若无`package.json`或者没有`main`字段，则默认查找`index.js`
- 解析模块名
    - 查找当前文件目录下，父级目录及以上目录下的`node_modules`文件夹，看是否有对应名称的模块
- 解析绝对路径
    - 直接查找对应路径的文件


在`webpack`中，和模块路径解析有关的配置都在`resolve`字段里
```
module.exports = {
    resolve: {
        //...
    }
}
```


### resolve 常用配置
- resolve.alias 设置别名

先假设我们有个`utils`模块用来作为我们的工具文件，并且在整个项目中经常需要引入，那么如果我们每次引入都用路径去引入，就会显得很麻烦，所以我们可以通过配置别名，达到`import 'utils'`的效果
```
alias: {
    utils: path.resolve(__dirname,'src/utils') // 通过path.resolve和__dirname来获取绝对路径
}
```

这样配置别名采用的是**模糊匹配**，即只要模块中携带了`utils`就会被替换掉
```
import 'utils/form.js' // 相当于引入了 'src/utils/form.js'
```

若想采用精确匹配，需要在别名后加上`$`
```
alias: {
    utils$: path.resolve(__dirname,'src/utils') // 通过path.resolve和__dirname来获取绝对路径
}
```

### resolve.extensions
这个配置的作用与文件后缀名有关系。我们可以通过它定义在进行模块路径解析的时候，`webpack`自己去尝试补全后缀名来进行查找

例如上述`utils`目录下有一个common.js文件，你可以这样引用
```
import * as common from './src/utils/common'
```
`webpack`会尝试给你依赖的路径添加上`extensions`字段所配置的后缀，然后开始按照依赖路径查找所有可以命中src/utils/common.js文件

❗ 但如果是要引用`src/style`目录下的`common.css`文件，而你是`import './src/style/common`这样引入的，`webpack`则会报出无法解析模块的错误

解决方式：
    - 添加后缀
    - 在`extensions`字段中添加`.css`的配置


### resolve.modules
对于直接声明依赖名的模块（上述的`Vue`)，`webpack`会类似`Node.js`一样进行路径搜索，搜索`node_modules`目录，这个目录就是使用`resolve.modules`字段进行配置的
```
resolve: {
    modules:['node_modules'], （默认就是node_modules)
}
```
技巧：通常我们不会去调整这个配置，但如果我们可以确定项目内所有第三方依赖模块都是在项目根目录下的`node_modules`中的话，那么可以在`node_modules`之前配置一个确定的绝对路径（这种配置可以轻微提高构建速度）
```
resolve: {
  modules: [
    path.resolve(__dirname, 'node_modules'), // 指定当前目录下的 node_modules 优先查找，如果有一些类库是放在其他地方的，你可以添加自定义的路径或者目录
    'node_modules',
  ],
},
```
### resolve.mainFields （少用）
可用于配置入口文件，当引用的是一个模块或者是一个目录时，会先看是否存在`package.json`，存在是就会去查找某一字段下指定文件，这个某一个字段，就可以通过`mainFields`来配置
```
默认配置

resolve: {
  // 配置 target === "web" 或者 target === "webworker" 时 mainFields 默认值是：
  mainFields: ['browser', 'module', 'main'],

  // target 的值为其他时，mainFields 默认值为：
  mainFields: ["module", "main"],
},
```
通常情况下，`package.json`不会声明`brower`或者`module`,所以就会去查找`main`字段里的文件了



### resolve.mainFiles （少用）
**当目录下没有`package.json`文件时，我们说会默认使用目录的`index.js`这个文件**，其实这个通过`mainFiles`也是可以配置的（但通常我们无需修改这个配置）
```
默认配置

resolve: {
    mainFiles: ['index'] // 可以添加其他默认使用的文件名
}
```

### resolve.resolveLoader （少用）
`resolveLoader`用于配置解析`loader`时的`resolve`配置，原本`resolve`的配置项在这个字段下基本都有
```
// 默认配置

resolve: {
  resolveLoader: {
    extensions: ['.js', '.json'],
    mainFields: ['loader', 'main'],
  },
}
```
这里提供的配置相对少用，我们一般遵从标准的使用方式，使用默认配置，然后把 `loader` 安装在项目根路径下的 `node_modules` 下就可以了。