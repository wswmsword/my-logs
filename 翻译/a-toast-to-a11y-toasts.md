# 为无障碍 toast 组件欢呼

原文：*https://www.scottohara.me/blog/2019/07/08/a-toast-to-a11y-toasts.html*

原文日期：2019.07.08

原文作者：[Scott O'Hara](https://www.scottohara.me/)

翻译日期：02/04/23 12:17:05 CST

最近你可能读了 [Adrian Roselli’s Scraping Burned Toast](http://adrianroselli.com/2019/06/scraping-burned-toast.html)、Chris Coyier 的 [summary of the current “toast conversation”](https://css-tricks.com/toast/)。或者，你可能访问过 [A Standard ‘Toast’ UI Element](https://github.com/jackbsteinberg/std-toast/) 和 [WICG discussion thread](https://discourse.wicg.io/t/proposal-toast-ui-element/3634/25)。

又或者你只是通过阅读 [Android development docs](https://developer.android.com/guide/topics/ui/notifiers/toasts) 和 [Material Design](https://materialdoc.com/components/snackbars-and-toasts/) 熟悉了“toasts”。

不管你多熟悉“toast”的概念，早已有人创建了不同的 UI 库包含了各种 toast。不幸的是，对于不同的 UI 库，toast 组件之间的可访问性和包容性有很大的差异。

我在前面提到的 Github issues 中做了一些评论，这期间我也想到了怎样概括 toast / messaging 组件的功能。下面是我的一些一闪而过的想法……

## 定义 toast

一个 toast 组件是一个位置始终不变的弹窗，内容传递了一条简洁的信息。一般 toast 信息出现在屏幕底部，小屏设备也是如此。“"growler" notification”也可以被视为 “toast” 的一种，它们通常出现在屏幕上方或下方的角落。不论弹窗出现的位置有没有遵守某个标准，用户都不会喜欢猜测弹窗出现的位置。

toast 可以被用来指示由用户或应用触发的任务或进程加载的完成情况。例如，文件已保存、消息已发送或者会议即将开始。

如果因为超时而错过了 toast 信息，也不应该对当前的状态造成任何影响。还用前面的例子，忽略了 toast，文件正常保存、消息正常发送或者会议仍然即将开始。

尽管如此，在面对不同个体的时候，事件的意义也不一定是不同的。在创建 toast 组件时候考虑 [WCAG 2.2.1: Timing Adjustable](https://www.w3.org/WAI/WCAG21/Understanding/timing-adjustable.html)，确保每个用户有足够的时间了解 toast 中的消息。除了一些类 toast（“snackbar”是一种。用户会把 toast 当零食（toast）吃吗？不要饿着肚子上网，拜托。）的实现，消息虽然消失了，但同时消息也会被添加到了日志中。很少有 toast 组件会考虑到 Level A WCAG success criteria。

## toast 的包容性用户体验

Toast 组件应被视为一种状态消息，所以应该使用 [role="status"](https://www.w3.org/TR/wai-aria-1.1/#status)。或者，如果 toast 消息将被“记录”，用于以后查看（是个好点子），那么就应该使用 [role="log"](https://www.w3.org/TR/wai-aria-1.1/#log)。这样能确保 toast 展示在屏幕上的时候，可以“礼貌地”与辅助技术交流，例如屏幕阅读器。

理想情况下，toast 组件**不**应该包含交互式控件，因为这样会引入包容性用户体验的分歧。下面是引入交互式组件带来的问题：

- 实时区域不会传递内容真正想要表达的语义。一条状态消息包含文字“您的消息已发送。”，后面带有文本是“撤销”的链接或按钮，这会被理解成“您的消息已发送。撤销”。“撤销”的语义难以理解。这引起下一个问题……
- 用屏幕阅读器的人会知道“撤销”是可操作元素，但这取决于使用的元素（链接或按钮），如果他们真的需要“撤销”，意味着他们要猜测自己应该搜索什么元素。由于 toast 通常在短时间后自动消失（WCAG 2.2.1），用户必须快速处理，他们希望在消息消失前有足够的时间导航到“撤销”上。
- 如果屏幕阅读器有足够的时间导航到“撤销”控件上，toast 仍然会消失。JavaScript 监听器可以完成“如果聚焦或悬浮在 toast 之上就不要关闭 toast”这样的工作，但是这不适用于屏幕阅读器的虚拟光标导航，虚拟光标不会触发聚焦或悬浮事件。
- 对于有视力的键盘用户，或者指针设备用户，如果身体行动能力薄弱，他们也非常反对迅速导航至 toast 组件的时间限制。
- 假设用户避免了以上所有问题，开发者仍然需要一个方法来管理焦点。激活“撤销”控件后，焦点仍然要回到前一个逻辑位置（或许是消息的提交按钮）。又或者包含“关闭”的 toast，不管理会导致失去焦点，用户会回到文档顶部，而且还要手动回到原来触发 toast 的地方。
- 另一个需要考虑的问题，任何类型的弹出消息会为使用缩放功能的用户或者小屏幕用户（也许使用媒体查询另弹出窗口不展示）带来困扰。
- 对于使用屏幕放大镜软件的用户，但是没有使用屏幕阅读器，也许放大的那一部分没有展示弹出消息。如果弹出窗口里有一个重要的“撤销”控件，就完全被忽略了。
- 最后，根据 WCAG 2.2.1 Timing Adjustable，理想情况下，应该有一系列浏览器或系统级别的对于消息时间的设置。不同于给定一个固定时间，在 toast 消失前应该持续多长时间应该由最终用户决定，类似高对比度和减弱动画的设置。

## 缩小重要交互元素的用户体验差距

如果操作很重要，且操作途径是唯一的，就不能把这个操作放在 toast 上。但是，如果非要把“撤销”放在 toast 上，也不是没有办法：

- 操作应该可以被“toast”之外的部分轻易触发。例如，列表中的一项被删除了，这项内容应该没有彻底消失，而是展示“撤销”按钮，这样的话 toast “撤销”就不是唯一途径。
- 或者，toast 消息应该保存在日志页面或组件中（查看 [ARIA’s log role](https://www.w3.org/TR/wai-aria-1.1/#log)）。
- 使用非模态对话弹窗（不阻止用户继续操作的弹窗）来传递消息。你甚至可以依据您的样式规范，在视觉上把样式和位置模拟成 toast。虽然这可能引发“把一类组件画成另一类组件”之类的讨论……好吧，人们貌似没有怎么讨论把链接画得像按钮的问题，反之亦然。而且，“toast”也不像真的吐司……所以其实我们早就放任了视觉没有和名称一致的问题。

## 总结

我确信，toast / messaging 组件应该具有的在用户体验方面能够考虑的和功能性上的东西，可以通过更多探讨而被提出来。我希望你也可以，请[参与讨论提出贡献](https://github.com/jackbsteinberg/std-toast/)。