# 精通 ARIA：'Hidden' vs 'None'

原文：*https://www.scottohara.me/blog/2018/05/05/hidden-vs-none.html*

原文日期：2018.05.05

原文作者：[Scott O'Hara](https://www.scottohara.me/)

翻译日期：02/04/23 17:27:06 Sat CST

ARIA 提供了两个不同的方法来抑制页面标签的无障碍信息，分别是 `aria-hidden=true` 和 `role=none | presentation`。开发者有时会把它们混淆。它们意义相同吗？如果不同，哪里不同呢？

跟着我来各个击破。


## `aria-hidden` 是干嘛的？

这个 `aria-hidden` 属性用来指定一个元素会不会暴露给用户代理（如浏览器）的无障碍 API，或者[无障碍树](https://www.tpgi.com/the-browser-accessibility-tree/)（accessibility tree）。

若一个元素被标记成了 `aria-hidden=false`，这意味着元素会暴露给辅助技术，相当于没有设置这个属性。但是当心，正如 [ARIA specification 所记载的](https://www.w3.org/TR/wai-aria-1.1/#aria-hidden)，使用 `aria-hidden=false` 可能引起一些问题。如果你不想隐藏内容，最好是移除这个属性，而不是使用 `false` 值。

不赋值给 `aria-hidden` 会默认让元素保持当前状态。基本上这表示 `aria-hidden` 被忽略了，元素会被暴露与否，这另外取决于元素的其它属性。

例如，`<p aria-hidden hidden>...</p>` 会因为 `hidden` 属性被隐藏，它的用户代理样式 `display: none` 已经阻止元素暴露给浏览器的无障碍树了。

然而，`<p aria-hidden style="opacity: 0">...</p>` 不会被隐藏，这是因为零透明度的元素只是在视觉上隐藏了。它与它的子元素仍然会暴露给辅助技术。

## 使用 `aria-hidden=true`

有一条普世规定，如果内容对*一部分*用户隐藏，那么可能也要对*所有*用户隐藏。这说明了你往往不会真的需要 `aria-hidden=true`。

例如，若是要对所有人隐藏内容，就使用 `display: none` 或者 `visibility: hidden`。这两个都是用于隐藏的更健壮的办法。

有种情况是 CSS 不可用的时候（例如浏览器的阅读模式），可以使用 HTML 的 `hidden` 属性来保持内容隐藏。因为这个原因，所以要谨慎使用。

如果我们的目的是对所有用户隐藏内容，`aria-hidden=true` 是不足以应对的。

在下面的例子里，段落内容只对辅助技术隐藏了，其它情况仍然是可视的：

```html
<p aria-hidden=true>
  This content is not announced to screen readers.
</p>
```

> 无障碍属性只影响内容向无障碍树暴露的方式，如果开发者不做改动，是不会改变元素原有的功能和样式的。

像这样使用 `aria-hidden=true` 会给那些使用辅助技术，而且视力正常或视力部分正常的用户带来困扰。很明显能看到内容……但为什么就访问不到？

下面的代码对所有用户隐藏：

```html
<p hidden>...</p>
<p style="display: none;">...</p>
<p style="visibility: hidden;">...</p>
```

如果内容要对所有用户隐藏，但是使用了其它的隐藏样式方法，这时候就要用 `aria-hidden=true` 来达到这一目的。

```html
<p aria-hidden=true style="opacity: 0">
  ... 
</p>
```

> 看前面的代码例子，如果在隐藏的段落里有个超链接（`<a href=...>`）或者 `button` 元素，通过 `tab` 按键仍然可以到达已被隐藏的可聚焦元素。
> 
> `aria-hidden=true` 是**不会**阻止可聚焦元素聚焦的。

有一种情况在元素可视的情况下使用 `aria-hidden=true` 是起作用的，那就是当被展示的内容被当作装饰、重复内容、可以被访问的意义相同的内容的时候。

例如，跟着超链接文字的一个图标。这个例子里，图标和替换文字的意义一样，所以对辅助技术隐藏则更好。

```html
<a href="/">
  <span class=home-font-icon aria-hidden=true></span>
  Home
</a>
```

## `role=none` 和 `role=presentation` 是干嘛的？

`aria-hidden=true` 被用来对辅助技术隐藏元素及其子内容，角色 `none` 和角色 `presentation` 则被用来抑制那些元素的隐式 ARIA 语义。这两个角色**不会**让元素对辅助技术隐藏。此外，设置属性角色的值为这两个任意一个，都不会改变当前“表象的（presentational）”元素的子元素的语义，只有一个例外（后文介绍）。

关于这两个角色，`presentation` 和 [`none`](https://www.w3.org/TR/wai-aria-1.1/#none) 彼此是同义词。

> 在 ARIA 1.1 里，调查委员会引入了 `none` 作为 `presentation` 的同义词，这是由于一开始混淆了“presentation”或“presentational”的含义。许多人错误地将 `role=presentation` 看成`aria-hidden=true` 的同义词，所以我们认为 `role=none` 更明确地传达了实际含义。

## 使用 `role=none` 和 `role=presentation`

理想情况下，你不会经常使用这两个角色。由于它们的目的是移除元素的隐式 ARIA 语义，所以这表示应该使用更通用的元素（如 `<div>`）来代替。

```html
<!-- avoid -->
<article role=none>
  <p>I'm still exposed as a paragraph!</p>
  <button>I'm still exposed as a button!</button>
</article>

<!-- instead -->
<div>
  <p>...</p>
  <button>...</button>
</div>
```

即便如此，这些角色有时还是有益的。它们可以被用来纠正历史遗留标签的问题，以及现代 web 开发的特定问题。

最常见的需要纠正的 HTML 过去的问题是 `<table>` 元素。在更复杂的 CSS 布局技术没有创建之前，表格被广泛滥用于布局的用途。幸运的是，现在已经基本停止表格的非法使用了，但仍然可以从很多太古网站上找到这些表格布局——事实上为了快速布局，当今有些更现代的网站还在重复这样的错误。

为了从“表格布局”移除不想要的表格语义，`role=none` 就可以指定给 `<table>` 元素。当 `<table>` 的隐式 ARIA 语义被移除，它的直接子元素的隐式语义也将被移除。这时的 `role=none` 是主要的特殊情况，其它情况这个角色不会去除子元素的 ARIA 语义。

```html
<table role=none>
  <tr> <!-- no longer a 'row' -->
    <td> <!-- no longer a 'cell' -->
      <table> <!-- this IS still a table -->
        <!-- also, gross. nested tables -->
      </table>
    </td> 
    ...
  </tr>
  ...
</table>
```

或者，`none` 或 `presentation` 的使用可以被用来把一个特定的标签模版渐进式改善到 ARIA 组件，where the underlying implicit semantics might only be desired as a no JavaScript fallback。例如，一个选项卡列表组件。

下面代码演示了一个无需列表，列表包含了跳转链接用于跳转至不同的章节。

```html
<ul>
  <li><a href="#panel_1">...</a></li>
  <li><a href="#panel_2">...</a></li>
  <li><a href="#panel_3">...</a></li>
</ul>
```

我们可以通过 ARIA 改善这个模版来创建一个选项卡列表，然而选项卡列表要求它的子选项有直接联系。因此元素 `<li>` 不是预期想要的，这个模版暴露给辅助技术会导致一些问题。我们可以这样，把 `role=none` 加到 `<li>` 元素上来抑制不想要的语义。

```html
<ul role="tablist">
  <li role="none">
    <a href="#panel_1" 
      role="tab"
      aria-selected="true/false" 
      aria-controls="panel_1">
      ...
    </a>
  </li>
  <!-- etc. -->
</ul>
```

通过抑制 `<li>` 的语义，选项卡会以[选项卡列表预期的形式](http://w3c.github.io/aria-practices/#tabpanel)暴露给无障碍 API。

## 不当使用 `role=none` 和 `aria-hidden=true`

下面是这些 ARIA 特性的两个常见的错误使用的例子。

### 在可聚焦元素上使用

这两个特性有个共同点，那就是不能用于交互元素，除非满足非常严格的条件。

例如，如果在 `<button>` 元素上使用 `aria-hidden=true`，按钮仍然是可以被键盘聚焦的，浏览器和辅助技术可能会通过聚焦时暴露元素（朗读属性？）来纠正属性的错误使用。键盘、编程或者指针事件（鼠标点击或触碰）都可以触发聚焦。

还有角色 `none` 和 `presentation`，在特定情况这些角色会被[有意忽略](https://www.w3.org/TR/wai-aria-1.2/#conflict_resolution_presentation_none)，例如交互元素是可以被聚焦的情况，或者有其它全局 ARIA 属性的情况。

在许多情况下，如果你试图抑制交互元素的语义，你就可能应该重新想想元素和特性的使用是否正确。否则，确保元素被真的隐藏，或者语义被抑制的唯一方法是确保元素也被禁用了：

```html
<button disabled aria-hidden=true>...</button>

<button disabled role=presentation>...</button>
```

由于 `disabled` 属性完全移除了 `<button>` 元素被聚焦的能力，所以可聚焦元素的这些属性都失效了。注意，如果你这么做了可能会引起其他可访问性问题，例如颜色对比度错误……我相信你懂的。;)

### 同时使用

另一个常见错误就是同时使用 `role=none` 和 `aria-hidden=true`。下面是个例子：

```html
<element role=none aria-hidden=true>
  ...
</element>
```

正如前文介绍的，`role=none` 用来抑制隐式 ARIA 语义，而 `aria-hidden=true` 则从浏览器无障碍树上完全隐藏。若是元素要完全隐藏，那就没有理由同时抑制语义。

## 总结

ARIA 可以提高文档和界面的可访问性，尤其可以填补原声 HTML 的语义空白。可是，再三叮嘱没有 ARIA 总比糟糕的 ARIA 更好。

如果你要用 ARIA 来扩展你的 HTML，应该只在必要的时候去做。例如，与其移除被错误使用的 HTML 元素的语义，不如正确地使用 HTML 元素，或者在你需要真正的通用容器的时候，使用 `<div>`。

如果需要标记一个 `<img>` 是个装饰，就提供一个空的 `alt` 属性。你可能不需要 `role=none` 或者 `aria-hidden`。

有时候，只需要退一步想想什么是你真正想要完成的。如果要找到更多关于为所有用户隐藏内容的信息，请查看我的上一篇文章，[“Inclusively Hidden”](https://www.scottohara.me/blog/2017/04/14/inclusively-hidden.html)。













