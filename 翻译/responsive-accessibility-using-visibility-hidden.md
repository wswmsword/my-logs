# 使用 visibility hidden 进行可访问性适配

原文：*https://www.scottohara.me/blog/2022/11/07/responsive-accessibility.html*

原文日期：2022.11.07

原文作者：[Scott O'Hara](https://www.scottohara.me/)

翻译日期：02/04/23 12:17:05 CST

虽然可以通过 CSS 媒体查询适配不同的屏幕尺寸和缩放等级来适配内容，但如果在视觉显示之外不做更多的调整，结果有时是不甚理想的。

有时在正常网页中的内容，需要用对话框的形式在小屏设备中呈现。或者，在小屏上展示/隐藏是有意义的，但是切换到大屏幕上就不必了。

HTML 提供了一些特性，例如 `source` 元素的 `media` 属性，这个特性被用在 picture 元素上，以检测不同的尺寸的媒体查询状态进行适配。然而这个特性没有扩展到其它元素上。（也许其它元素也应该有这个元素？）

我有一些这类问题的实例，我们现在先列举一例。

## 使用媒体查询来切换

设想你有个 FAQ（常见问题）页面，在大屏设备上展示所有常见问题，每个问题都能在屏幕上直接预览，因此目前问题还不够明显。然而，换到小屏设备，为了帮助人们减少滚动来找到想要的答案，所有的回答默认都被折叠了。

因此大屏幕上的网页会像下面这样，一个标题下面跟着一个答案：

```html
<h#>
  Frequently asked question
</h#>
<div>Answer goes here!</div>
```

但是小屏上我们期待像下面这样：

```html
<h#>
  <button aria-expanded="...">Frequently asked question</button>
</h#>
<div>Answer goes here!</div>
```

目前，我们不想根据屏幕尺寸重做 DOM 展示不同的 UI。我们也不能只在大屏上去掉按钮的视觉效果，因为这样做，底层的隐式和显式的无障碍（ARIA）语义仍然暴露给了（无障碍）辅助技术。而且，不考虑样式，按钮的功能性和可聚焦性还是会被保留。

人们也许会考虑使用 JavaScript 基于屏幕尺寸来添加/移除按钮。这还是太麻烦了，另一个办法是通过添加/移除按钮的属性来抑制按钮的语义和行为。这么做，最终你会在屏幕上看到下面这一堆冗余标签：

```html
<h#>
  <button aria-expanded="..."
  	disabled
  	role="none"
  	>Frequently asked question</button>
</h#>
<div>Answer goes here!</div>
```

属性 `disabled` 用于完全移除按钮的可聚焦性（`tabindex=-1` 只是设置了无法通过 tab 键聚焦，但仍然是可聚焦的）。另外还要设置样式，让按钮*看起来*不是 disabled 的状态。最后再设置 `role=none` 来让按钮的隐式的按钮角色（role）和不可用状态（state）之间不再有关联。

这是漫长又曲折的路途，即使我们没有添加或移除按钮，也带来了大量的 DOM 操作。

## 使用 CSS 和 visibility

不修改 DOM，我们可以用 CSS 媒体查询来控制展示或隐藏 `button` 元素。

看下面代码：

```html
<h3>
  <button aria-expanded=...>
    <span>My text</span>
  </button>
</h3>
<div class=content>
  the content that toggles depending on breakpoint.
</div>
```

和上面介绍的小屏幕方案代码没有太大区别，但 `button` 元素包裹了 `span` 是做什么的？

好吧，这就是 [CSS 的 visibility 属性](https://developer.mozilla.org/en-US/docs/web/css/visibility) 发光发热的地方。

属性 `visibility` 很有意思。当值被设置为 `hidden` 的时候，元素的内容视觉上被隐藏了，但是仍然在页面占据“空间”。页面上的一片空白就像应用了 `opacity: 0`。但是不同于 `opacity`，`visibility: hidden` 不会暴露给浏览器的可访问性（accessibility） API。这种行为很像 `display: none`，它们都不会被展示在 a11y 树中。

在本例中，让 `visibility` 既不同又*实用*的是，你可以让被应用`visibility: hidden`的子树中的某个部分再次可见。

在大尺寸屏幕中，按钮要隐藏，内容要可见。见下方代码：

```css
@media screen and ( min-width: 600px ) {
  button[aria-expanded] {
    visibility: hidden;
  }
}


button[aria-expanded] span {
  visibility: visible;
}
```

上方媒体查询中确保了带有`aria-expanded`属性的按钮会在比 600px 宽的屏幕上隐藏。这确保了按钮不会暴露给辅助技术。

上面代码的第二个部分，确保了按钮的子元素，也就是 `span` 元素中的内容，总是会被展示，而不管 `button` 元素是否隐藏。

还需要一点 JavaScript 来完成这个 disclosure 组件（我还在[另一篇文章](https://www.scottohara.me/blog/2022/09/12/details-summary.html#creating-an-aria-disclosure-widget)中提到这个组件），你可以点击查看[在线代码](https://codepen.io/scottohara/pen/abKBvMP)。

```javascript
const b = document.querySelector('button');
const c = document.querySelector('.content');

b.addEventListener('click', function (e) {
  if ( this.getAttribute('aria-expanded') === 'true' ) {
    this.setAttribute('aria-expanded', 'false');
    c.classList.add('hidden');
  }
  else {
    this.setAttribute('aria-expanded', 'true');
    c.classList.remove('hidden');
  }
});
```

## 难道不觉得有点 hacky 和困惑吗？

当然。但是想要不过度依赖 JS 甚至 CSS 而通过原生 HTML 标签，在禁用 JS 和 CSS 的时候仍然可用，目前还没有很好的方案。例如，这些 JS 资源文件加载失败的时候，服务器出现问题的时候，打开某种阅读模式的时候，就不能使用上面的无障碍方案了。

Extra effort would need to be taken (likely with JavaScript) to make this behave in a nice progressively enhanced sort of way. But, I’m content with just being clever today. Maybe I, or someone else, can figure out how to make this a smart idea some other time.