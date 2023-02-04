# 编写一份 PostCSS 插件

原文：*https://www.postcss.com.cn/docs/writing-a-postcss-plugin*

原文日期：Oct 6, 2022

原文作者：[postcss](https://github.com/postcss/postcss/blob/main/docs/writing-a-plugin.md)

翻译日期：01/27/23 15:17:00 CST

## Links

文档：
- [插件模版](https://github.com/postcss/postcss-plugin-boilerplate)
- [插件指南](https://github.com/postcss/postcss/blob/main/docs/guidelines/plugin.md)
- [PostCSS API](https://postcss.org/api/)
- [AST 训练场](https://astexplorer.net/#/2uBU1BLuJ1)

支持：
- [问问题](https://gitter.im/postcss/postcss)
- [PostCSS 推特账户](https://twitter.com/postcss)

## 第一步：想到一个点子

许多领域中编写 PostCSS 会有助于您的工作：
- **兼容性修复**：如果你总是忘记添加浏览器兼容代码，你可以创建 PostCSS 插件来帮你自动插入补全。[postcss-flexbugs-fixes](https://github.com/luisrudge/postcss-flexbugs-fixes) 和 [postcss-flexbugs-fixes](https://github.com/postcss/postcss-100vh-fix) 是两个不错的例子；
- **自动化常规操作**：让计算机执行常规操作，解放我们自己去完成更有创造力的任务。例如，使用 [RTLCSS](https://rtlcss.com/) 的 PostCSS 可以把页面转换为右对齐（right-to-left）语言（阿拉伯语或希伯来语），或者使用 [postcss-dark-theme-class](https://github.com/postcss/postcss-dark-theme-class) 来插入媒体查询作为夜晚/白天的主题开关；
- **预防常见错误**：“会第二次犯的错误，不会是最后一次。”PostCSS 插件检查你的代码的流行错误，帮你避免无意义的调试。最好的办法是[写个心得 Stylelint 插件](https://stylelint.io/developer-guide/plugins)（Stylelint 内部使用 PostCSS）；
- **提高代码可维护性**：[CSS Modules](https://github.com/css-modules/css-modules) 和 [postcss-autoreset](https://github.com/maximkoretskiy/postcss-autoreset) 都是 PostCSS 通过隔离提高可维护性的好榜样；
- **‌Polyfills**：在 [postcss-preset-env](https://github.com/csstools/postcss-preset-env) 里我们已经有很多 CSS 草案的 polyfills。如果你发现一个新草案，你可以创建一个新插件发送到这个 preset 里；
- **全新的 CSS 语法**：我们不推荐给 CSS 创建新语法。若你想添加新特性，通常最好是写个 CSS 草案提议，然后发给 [CSSWG](https://github.com/w3c/csswg-drafts)，然后自己再实现个 polyfill。[这个提议](https://github.com/w3c/csswg-drafts/issues/1332)的 [postcss-easing-gradients](https://github.com/larsenwork/postcss-easing-gradients) 就是个好榜样。但也有很多情况是你不能提交草案的。例如，浏览器的解析性能大大限制了 CSSWG 的嵌套语法，你也许想要从 [postcss-nested](https://github.com/postcss/postcss-nested) 获取非官方的类 Sass 语法。

## 第二步：创建一个项目

有两种方法编写一个插件：
- 创建一个**私有**插件。当插件和项目强相关时，这样做。例如，你想自动化针对你的个人 UI 库的任务时；
- 发布一个**公共**插件。我们推荐这样做。对于私有前端系统，即使在谷歌，也难以维护。另一方面，许多流行的插件又都是在闭源项目中产生的。

私有插件：
- 创建插件文件；
- 从我们的样板复制[插件模版](https://github.com/postcss/postcss-plugin-boilerplate/blob/main/template/index.t.js)。

公共插件：
- 根据[PostCSS plugin boilerplate](https://github.com/postcss/postcss-plugin-boilerplate/)中的指南，创建插件文件夹；
- 在 GitHub 或 GitLab 上创建仓库；
- 发布你的代码。

你也可以用 [our Sharec config](https://github.com/postcss/postcss-sharec-config) 来保持最新的最佳实践。当你每次更新配置后，开发配置和开发工具也会跟着更新。

```javascript
module.exports = (opts = {}) => {
  // Plugin creator to check options or prepare caches
  return {
    postcssPlugin: 'PLUGIN NAME'
    // Plugin listeners
  }
}
module.exports.postcss = true
```

## 第三步：找到节点

大部分 PostCSS 插件做两件事：
1. 在 CSS 里找某些东西（例如，即将修改的属性）；
2. 修改找到的元素（例如，在即将修改的地方前面添加`transform: translateZ(0)`来兼容旧浏览器）。

PostCSS 扫描 CSS 来构建节点树（我们称之为 AST）。树上大概是这些内容：
- Root——根节点，代表了 CSS 文件；
- AtRule——以 `@` 开头的部分，例如 `@charset "UTF-8"` 或 `@media (screen) {}`；
- Rule——带有内部声明的选择器，例如，`input`、`button {}`；
- Declaration——键值对，如 `color: black;`；
- Comment——单独的注释。`selectors`、`at-rule` 的参数以及 `value` 的注释在节点的 `node` 属性内。

你可以查看 [`AST Explorer`](https://astexplorer.net/#/2uBU1BLuJ1) 来学习 PostCSS 怎样转换 CSS 到 AST。

你可以通过给插件对象添加方法指定类型来查找所有节点：

```javascript
module.exports = (opts = {}) => {
  return {
    postcssPlugin: 'PLUGIN NAME',
    Once (root) {
      //  每个文件执行一次，因为每个文件有一个 Root
    },
    Declaration (decl) {
      // 所有 declaration 节点
    }
  }
}
module.exports.postcss = true
```

如果你需要指定名称的 declaration 或 at-rule，你可以这样：

```javascript
    Declaration: {
      color: decl => {
        // All `color` declarations
      }
      '*': decl => {
        // All declarations
      }
    },
    AtRule: {
      media: atRule => {
        // All @media at-rules
      }
    }
```

还有其它需求的话，就用正则或自定义扫描器：
- [Selector parser](https://github.com/postcss/postcss-selector-parser)
- [Value parser](https://github.com/TrySound/postcss-value-parser)
- [Dimension parser](https://github.com/jedmao/parse-css-dimension) 用于数字、长度和百分比
- [Media query parser](https://github.com/dryoma/postcss-media-query-parser)
- [Font parser](https://github.com/jedmao/parse-css-font)
- [Sides parser](https://github.com/jedmao/parse-css-sides) 用于 margin、padding 和 border 属性

其它用来分析 AST 的工具：
- [Property resolver](https://github.com/jedmao/postcss-resolve-prop)
- [Function resolver](https://github.com/andyjansson/postcss-functions)
- [Font helpers](https://github.com/jedmao/postcss-font-helpers)
- [Margin helpers](https://github.com/jedmao/postcss-margin-helpers)

要注意正则和扫描器都是费性能的工具。你可以用在用这些工具前用 `String#includes()` 简单检查一下：

```javascript
if (decl.value.includes('gradient(')) {
  let value = valueParser(decl.value)
  // …
}
```

有两种类型或监听器：enter 和 exit。Once、Root、AtRule 和 Rule 会在处理前调用；OnceExit、RootExit、AtRuleExit 和 RuleExit 会在处理结束被调用。

你也许会在不同监听器中重复使用某些数据。你可以用“进行时定义”监听器：

```javascript
module.exports = (opts = {}) => {
  return {
    postcssPlugin: 'vars-collector',
    prepare (result) {
      const variables = {}
      return {
        Declaration (node) {
          if (node.variable) {
            variables[node.prop] = node.value
          }
        },
        OnceExit () {
          console.log(variables)
        }
      }
    }
  }
}
```

你可以用 `prepare()` 来动态生成监听器。例如，使用 [`Browserslist`](https://github.com/browserslist/browserslist) 来获取 declaration 属性。

## 第四步：修改节点

找到节点后，你可能修改或在节点周围插入/删除。

PostCSS 节点有类 DOM 的 API 来改变 AST。查看我们的 [`API docs`](https://postcss.org/api/)。有方法用来遍历（如 [`Node#next`](https://postcss.org/api/#node-next) 或 [`Node#parent`](https://postcss.org/api/#node-parent)）、查看子元素（如 [`Container#some`](https://postcss.org/api/#container-some)）、移除节点或添加新节点。

插件的方法会在第二个入参中接受节点创造器：

```javascript
    Declaration (node, { Rule }) {
      let newRule = new Rule({ selector: 'a', source: node.source })
      node.root().append(newRule)
      newRule.append(node)
    }
```

如果你添加了新节点，复制 [`Node#source`](https://postcss.org/api/#node-source) 来生成正确的 source maps 很重要。

当你做了改变或添加操作后，插件会重新访问所有节点。如果你想改变某些子节点，插件同样会重新访问父节点。只有 Once 和 OnceExit 不会重新调用。

```javascript
const plugin = () => {
  return {
    postcssPlugin: 'to-red',
    Rule (rule) {
      console.log(rule.toString())
    },
    Declaration (decl) {
      console.log(decl.toString())
      decl.value = 'red'
    }
  }
}
plugin.postcss = true

await postcss([plugin]).process('a { color: black }', { from })
// => a { color: black }
// => color: black
// => a { color: red }
// => color: red
```

由于任何变化导致重新访问，仅添加子节点将导致无限循环。所以我们要检查该节点是否已处理，来避免无限循环。

```javascript
    Declaration: {
      'will-change': decl => {
        if (decl.parent.some(decl => decl.prop === 'transform')) {
          decl.cloneBefore({ prop: 'transform', value: 'translate3d(0, 0, 0)' })
        }
      }
    }
```

你也可以用 Symbol 来标记已处理的节点：

```javascript
const processed = Symbol('processed')

const plugin = () => {
  return {
    postcssPlugin: 'example',
    Rule (rule) {
      if (!rule[processed]) {
        process(rule)
        rule[processed] = true
      }
    }
  }
}
plugin.postcss = true
```

第二个入参也包含 result 对象，内容是警告信息：

```javascript
    Declaration: {
      bad: (decl, { result }) {
        decl.warn(result, 'Deprecated property bad')
      }
    }
```

若是你的插件依赖其它文件，你可以给 result 附加信息，告诉运行程序（webpack、Gulp 等等），当某个文件发生变化后应该重新构建 CSS。

```javascript
    AtRule: {
      import: (atRule, { result }) {
        const importedFile = parseImport(atRule)
        result.messages.push({
          type: 'dependency',
          plugin: 'postcss-import',
          file: importedFile,
          parent: result.opts.from
        })
      }
    }
```

如果依赖项是文件夹，你可以用 dir-dependency 来代替：

```javascript
result.messages.push({
  type: 'dir-dependency',
  plugin: 'postcss-import',
  dir: importedDir,
  parent: result.opts.from
})
```

如果你发现了语法错误，你可以抛出错误：

```javascript
if (!variables[name]) {
  throw decl.error(`Unknown variable ${name}`, { word: name })
}
```

## 第五步：战胜挫折

> 我恨编程
> 我恨编程
> 我恨编程
> 能跑了！
> 我爱编程

即使是最简单的插件，你也会碰到 bug，也会需要至少 10 分钟的调试时间。你会发现最初的想法在真实情况里行不通并做出改变。

别担心。每个 bug 都会被发现，然后你会发现另一个解决方案，这就会让你的插件变得更好更优秀。

从编写测试案例开始。插件模版里有个测试模版 `index.test.js`，它会调用 `npx jest` 来测试你的插件。

在编辑器里使用 Node.js 来调试，或者就干脆用 `console.log`。

PostCSS 社区会帮助你的，因为我们都碰到过相同的问题。请大胆在 [special Gitter channel](https://gitter.im/postcss/) 里提问。

## 发布

当你的插件准备就绪，唤起 `npx clean-publish`。[`clean-publish`](https://github.com/shashkovdanil/clean-publish/) 是个移除测试环境配置的工具。我们为插件模版添加了这个工具。

为你的新插件发个推，带上[`@postcss`](https://twitter.com/postcss)。或者在[聊天室](https://gitter.im/postcss/)告诉我们。我们会帮你推广。

[把你的新插件添加到 PostCSS plugin catalog](https://github.com/himynameisdave/postcss-plugins#submitting-a-new-plugin)。
