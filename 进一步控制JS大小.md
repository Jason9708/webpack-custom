## 优化前端资源加载 - 进一步控制Js大小

### 按需加载
前面讲述如何将大的代码文件进行拆分，抽离出多个页面共享的代码文件，但是当你的`Web`应用是个单页面应用(Vue),并且及其复杂的时候，你会发现有一些代码并不是每一个用户都需要用到的。

我们希望可以将这一部分代码抽离出去，仅当用户真正需要用到时才加载，这时就可以使用`webpack`的按需加载功能

在`webpack`的构建环境中，要按需加载代码模块很简单，遵循`ES`标准的动态加载语法`dynamic-import`来编写代码即可，`webpack`会自动处理使用该语法编写的模块
```
// import 作为一个方法使用，传入模块名即可，返回一个Promise对象来获取模块暴露的对象

import('lodash').then( _ => {
    console.log(_.lash([1,2,3])) // 打印3
})


这里,webpack构建时会自动把lodash模块分离出来，并且在代码内部实现动态加载lodash的功能

动态加载代码模块依赖于网络，所以模块内容会异步返回，

因此import方法需要返回一个promise来获取动态加载的模块内容
```
**❗ 如果使用了`Babel`的话，还需要`Syntax Dynamic Import`这个`Babel`插件来处理`import()`这种语法**

由于动态加载代码模块的语法依赖于`promise`，对于低版本的浏览器，需要添加`promise`的`polyfill`后才能使用


### Tree Shaking
`Tree Shaking`可以移除`Js`上下文中的未引用代码，删除用不着的代码，能够有效减少`JS`代码文件的大小
```
官方例子

// src/math.js
export function square(x) {
    return x * x
}
export function cube(x) {
    return x * x * x
}

// src/index.js
import { cube } from './math.js'
console.log(cube(3))
```
很明显，`square`这个方法未被引用，是可以删掉的。

在`webpack`中，只有启动了`Js`代码压缩功能（即使用 `uglify`）时，会做`Tree shaking`优化
-   `webpack 4.x`需要指定`mode`为`production`
-   `webpack 3.x`需要配置`UglifyJsPlugin`

启动之后，构建出来的包就会移除`square`这部分代码


**PS:**
```
如果你在项目中使用了Babel的话，要把Babel解析模块语法的功能关掉，在.babelrc配置中增加 "modules":false 这个配置


// .babelrc
{
    "presets":[["env",{ "modules": false }]]
}

这样可以把`import/export`这一部分模块语法交由`webpack`处理，否则无法使用`Tree Shaking`的优化
```
