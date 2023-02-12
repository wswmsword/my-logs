# 最后一次：自定义单选按钮和复选框的样式

原文：*https://www.scottohara.me/blog/2021/09/24/custom-radio-checkbox-again.html*

原文日期：2021.09.24

原文作者：[Scott O'Hara](https://www.scottohara.me/)

翻译日期：02/05/23 17:29:23 Sun CST

三年前（2017/2018），我发布了一系列[无障碍样式表单控件](https://scottaohara.github.io/a11y_styled_form_controls/)，其中包含了用于创建自定义样式的单选按钮和复选框的模版。这么多年我对这些模版不断完善，学习他人的实现，又通过我熟悉的辅助技术进行压力测试，它们是我这些年的结晶。

想当年，在不使用 ARIA 重新创建表单的情况下，自定义表单控件最鲁棒的办法，就是在视觉上隐藏单选按钮和复选框，然后创建 `label` 或者 `span` 以及它们的伪元素（`::before` 和 `::after`）来呈现样式。之所以这样做，很大程度而非全部，是因为 IE 浏览器以及历史版本的 Edge 浏览器没有提供直接修改原生 HTML `<input>`元素的样式的最佳支持。若是你继续往前追溯，所有浏览器都不能很轻松地直接定义这些控件的样式。

我不是在说 2018 年没有直接设置原生单选按钮和复选框样式的办法（参阅 [restyled radio buttons](https://scottaohara.github.io/a11y_styled_form_controls/src/radio-button/#rstyled) 和 [restyled checkboxes](https://scottaohara.github.io/a11y_styled_form_controls/src/checkbox/#rstyled)）。只是由于当时在火狐浏览器、IE 浏览器和非 Chromium 内核的 Edge 浏览器存在不一致的问题，所以还是需要规避方法和遵守样式方面的限制的。

现在（2021），随着 IE 不再提供支持，Edge 使用 Chromium 内核，而火狐的一些怪问题也被解决，可以说从前的限制基本上解除了。

希望这是我最后一次写这个主题的文章。

## 哪些是自定义单选按钮和复选框样式时必须的？

由于我们直接设置元素样式，因此我们预期的模版和没有添加样式的模版的结构是一样的。举个例子：

```html
<label for="r1">
  <input type="radio" id="r1" name="r">
  Restyle Option 1
</label>
<!-- or -->
<input type="radio" id="r2" name="r">
<label for="r2">Resyle option 2</label>
```

```html
<label for="c1">
  <input type="checkbox" id="c1">
  Choice 1
</label>
<!-- or -->
<input type="checkbox" id="c2">
<label for="c2">Choice 2</label>
```


### 必要的 CSS

默认情况下，俩控件自带了各种 CSS 属性，但我们想从零开始（如果你要自定义控件的样式，也许这就是你想的），首先就要清除它们所有的样式。为此，我们利用 [appearance: none](https://developer.mozilla.org/en-US/docs/Web/CSS/appearance) 属性。

> **注意：**for these particular components, I have not run into any unforeseen issues with using the unprefixed appearance property. But, according to caniuse.com, Webkit still requires a -webkit- prefix. Generally best to be safe than sorry, so while annoying to still need both the prefixed -webkit-appearance and appearance, might as well keep it up for now.

一旦给控件指定了 `appearance: none` 之后，你就完全控制了元素的样式，以及元素的 `::before` 和 `::after` 伪元素。但是，既然你已经挑起了担子，你就要在 CSS 里考虑下面这些重任：
- 默认（未选中状态）；
- 选中状态；
- 多选未指定/混合状态（不是必须的，你需要的时候你就想要了）；
- 自定义聚焦状态；
- 选中的聚焦样式（若是选中前后的聚焦样式区别细微很难分辨，例如黑色外边框会和选中被黑色填充的样式混淆）；
- 禁用状态（确保 label 文本也要保持最小对比度！）；
- 确保左对齐和右对齐（`dir=ltr`、`dir=rtl`）不会被你的样式影响；
- 验证您的样式能否在媒体查询中工作，例如：
	- [`forced-colors: active (以前的 -ms-high-contrast: active)`](https://blogs.windows.com/msedgedev/2020/09/17/styling-for-windows-high-contrast-with-new-standards-for-forced-colors/)；
	- `prefers-color-scheme: dark`；
	- `prefers-reduced-motion`（如果你做了花哨的动画之类）；
	- `print`；
	- 其它由于自定义样式受到削弱的媒体查询。不管怎样我们都要测试的吧？

你可以在[单选按钮和复选框的 CodePen 页面](https://codepen.io/scottohara/pen/MWoEGZe)里练练手。试着在 `<div>` 元素上添加 `dir=rtl`，或者给控件设置 `disabled` 试试。

### 除了上述必要的 CSS 以外

Maybe you’re thinking you need more than what’s been called out here. Three selectors to style a radio button or checkbox? “Psh”, you exclaim. “I have some serious user delight that needs injecting into these mundane controls for performing basic tasks on the Internet.” Cool! Feel free to add in other generic/presentational elements as you see fit.

例如：

```html
<div class="custom-check-container">
  <input type="checkbox" id="c">
  <span class="blip-bloop" aria-hidden="true"></span>
  <span class="bleep-blop" aria-hidden="true"></span>
  <label for="c">
    Choice
  </label>
</div>

<!--
  Regarding the aria-hidden=true on the span elements. 
  You may well not "need" these to be explicitly set to be
  hidden from the browser's accessibility tree... but as
  I have no idea what one might do with these decorative
  elements, seems best to put up some guard rails.
-->
```

上面的标签把多选框包裹在 `<div>` 元素中，另外也添加了两个 `<span>` 元素用来实现样式。例如，想要在悬浮、聚焦、激活做一个动画效果吗？你可以用 CSS 兄弟选择器或者 JS 来完成扁平化设计。但是要注意，不要让额外的 `<span>` 元素的层级（z-index）阻止指针事件（click、touch）到达表单。

可是，不要做下面这样的傻事：

```html
<!-- this is sloppy. don't be sloppy. -->
<div role=checkbox aria-checked=false tabindex=0 aria-label="Name of control">
  <input type=checkbox 
         tabindex=-1 
         aria-hidden=true 
         class=visually-hidden 
  >
  <div>
    <!-- oodles of divs go here for reasons that essentially just 
         boil down to "divs go here until I get the result I want. 
         Only then will I turn off the div valve." -->
    Name of control
  </div>
</div>
```

没必要向上面那样嵌套元素，而且“隐藏”的多选框对于辅助技术可能还是可以被检测到（for instance, navigating line-by-line with VoiceOver on macOS, or using Dragon Naturally Speaking - as recent testing has uncovered）。

如果你发现自己卡在了上面说的嵌套问题里，你可能会使用 `visibility: hidden` 来对辅助技术隐藏，进而维护现有功能。A refactor would be ideal here, as the CSS we ship is a strong suggestion, but not a requirement for users. But hey, sometimes you just gotta hide your mistake and hope that no one peaks under your rug and notices all piles of dirt and dust. Right?

If you find yourself stuck in a situation where you are dealing with the above invalid nesting of a checkbox within a ‘checkbox’, you likely use CSS visibility: hidden to completely hide the nested native checkbox from assistive technologies, while still maintaining your present functionality. A refactor would be ideal here, as the CSS we ship is a strong suggestion, but not a requirement for users. But hey, sometimes you just gotta hide your mistake and hope that no one peaks under your rug and notices all piles of dirt and dust. Right?

## 总结，致谢

此时此刻，我认为没什么理由继续推荐视觉隐藏技术来自定义单选按钮和多选框的样式了。现代浏览器都可以处理这些控件的样式，而视觉隐藏技术有太多额外的问题要考虑。

此外，对于创建自定义的 ARIA 单选按钮和多选框的需求，持相当怀疑的态度。The level of effort to make these custom controls, and ensure all necessary functionality is present, goes far beyond just needing to update one’s CSS. Even if you needed to create an ARIA role=switch, CSS styling and relying on an `<input type=checkbox>`’s implicit checked functionality would give you all that you need to style a native checkbox into a custom switch ([the third example on this linked page](https://scottaohara.github.io/a11y_styled_form_controls/src/checkbox--switch/)).

2021-09-25 更新：谢谢 [Adrian Roselli](https://twitter.com/aardrian) 提醒我复选框必要的样式还有 `indeterminiate / aria-checked=mixed`。[CodePen](https://codepen.io/scottohara/pen/MWoEGZe) 上使用 `indeterminiate` IDL 属性 和 `aria-checked=mixed` 的复选框演示例子已经更新

有关自定义原生单选和多选控件的更多信息，特别是使用视觉隐藏技术的，我建议查看下面的这些内容：

- [Under-Engineered Custom Radio Buttons and Checkboxen - Adrian Roselli (2017)](https://adrianroselli.com/2017/05/under-engineered-custom-radio-buttons-and-checkboxen.html)
- [Inclusively Hiding & Styling Checkboxes and Radio Buttons - Sara Soueidan (2020)](https://www.sarasoueidan.com/blog/inclusively-hiding-and-styling-checkboxes-and-radio-buttons/)
- [a11y Styled Form Controls: Checkboxes (2018)](https://scottaohara.github.io/a11y_styled_form_controls/src/checkbox)
- [a11y Styled Form Controls: Radio Buttons (2018)](https://scottaohara.github.io/a11y_styled_form_controls/src/radio-button/)
- [a11y Styled Form Controls: Star Rating Radio Buttons (2018)](https://scottaohara.github.io/a11y_styled_form_controls/src/radio-button--rating/)
- [WTF, Forms (2016)](http://wtfforms.com/)
