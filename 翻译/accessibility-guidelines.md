# 可访问性指南

## 简介

### 什么是可访问性？

> 可访问性 Accessibility（以下缩写为 A11y——表示，字母 “a”，后跟 11 个字符，最后是“y”）是指（一）让所有人都能使用应用，并且（二）为用户提供平等的体验，无论情景和行动能力。

Spotify 的使命是让数十亿的粉丝有机会享受到艺术家的作品，并受其启发。因为我们的应用面向每个人，所以[可访问性是 Spotify 的核心关注点](https://newsroom.spotify.com/2021-12-03/spotify-joins-the-valuable-500-with-a-commitment-to-disability-inclusion/)。作为将 Spotify 体验扩展到其它社区的开发者，无论用户通过它们的设备如何使用我们的应用和接口，我们都有责任为用户创造一个安全、公平的空间。

![WCAG Map——图像中心写着“WCAG 2.1”，周围围绕者“可感知”、“可操作”、“鲁棒性”和“可理解”。可感知部分有一个卡通盲人用户，并且给出定义“信息和用户界面必须以可感知的方式展示给用户”；可操作部分是一张有两只手使用平板的图像，并且给出定义“用户界面和导航必须是可操作的”；鲁棒性部分有一张通过箭头连接笔记本、耳机和盲文显示器的图像，并且给出定义“内容必须足够强大，才能够被包括辅助技术在内的各种用户终端可靠地理解”；可理解部分有一个使用笔记本的卡通女性，有一个灯泡在她的头顶，就像她想到了一个好点子，并且给出定义“用户界面的信息和操作必须是可理解的”。](./wcag-map.png)

*[The WCAG map by Intopia](https://intopia.digital/wp-content/uploads/2019/10/2019-WCAG2.1-Map-Intopia-plus-reading-order.pdf) 的摘要版本*

**“哪些人的体验会被排除在外？”**，每当我们在应用里为实现功能做选择的时候都要回答这个问题。在日常生活中，那些只能通过楼梯进入的商店已经积极做出了抉择，它们排除了轮椅使用者、带婴儿车的父母，以及带着轮子背包的购物者。每一个设计决策都是关于包容和缺乏包容的态度。

[《Play for All Guidelines》](https://www.worldcat.org/title/27241984)和[《The Inclusive City》](https://www.worldcat.org/title/61247468)的合著者，Susan Goltsman，一般把包容性描述为允许用户以多种方式体验一个事物（比如你的应用），而不是为所有人提供一种体验。

如果你对于问题“哪些人的体验会被排除在外？”，终极目标是得到“没有人会被排除。”的回答——那么这篇文章就是您用来提供高质量应用程序的指南，您的应用程序会有和 Spotify 平等包容性相当的价值观。

人工测试可访问性是必不可少的，因为自动化测试只能捕捉到一小部分问题，而且不能在整体上进行有效的体验。

> 作为应用程序的开发者，请记住，在你开发应用程序的时候，你要可以无缝地切换 a11y 控件的打开和关闭的状态，就像电灯开关让用户可以自主决定灯泡的开关一样。
> 
> 配置您的设备以便快速简单地使用辅助技术进行测试，移除不适感、节省时间。你会发现你的测试会越来越多和频繁。

### 在软件开发周期里的可访问性

正确的 A11y 可以带来高质量应用。越早考虑 a11y 就会有越少的回归过程，并且能保证您的应用从最开始就照顾到了每个人。

> 本指南假设您已经对 a11y 有了基本了解。随时随地，如果您需要进一步的参考资料，万维网联盟（W3C）的 Web A11y 机构已经发布了 [A11y 基础资源](https://www.w3.org/WAI/fundamentals/)，内容包含一系列主题和更深入的内容，而且也和本指南相关联。

下面的图片是 [Jason Dippel 关于可访问性纳入软件开发生命周期（SDCL）的早期阶段的一些看法](https://medium.com/hootsuite-engineering/building-an-accessible-product-eae6b3f3c2d6)。我们同意像下面这样关于可访问性应该被纳入 SDCL 的建议：1. 在 Wireframe 和 Product Backlog 阶段之间，作为用户体验设计（UX Design）的一部分，2. 作为 Sprints 的一部分，然后通知 Sprints Backlog，并且作为 Product Backlog 和 Deployed product 之间的用户体验研究（UX Research）的一部分，这样能有效节省您的成本。

![Jason Dippel 的关于落地可访问性的插图。图片展示了软件开发生命周期（SDLC）。生命周期的不同阶段用蓝色四边形（正方形和长方形）表示，并且使用黑色虚线连接。从左到右，SDLC 的阶段分别是 Wireframe、Product Backlog、Sprint Backlog、Shippable Product 和 Deployed Product。Accessibility 被标识为一个深蓝色圆形，并且和不同阶段的黑色虚线并列，Jason 建议在 SDLC 里纳入可访问性。](./bake-in-accessibility.png)

### 如何使用这份指南

本指南的重点是提高您的技能，以便您可以在已经开发的应用里找到 a11y 的问题，并且进行修复，让您开始开发新应用的时候使用本指南提供的工具。

本指南分为 3 个章节，都以任务清单的方式引导你创建高质量和可访问的应用。章节都是按照易于实现的顺序排布，但是每一条建议同等重要，都应该在开发里优先考虑。它们是：
- quick wins、
- medium-term wins 和
- intensive wins。

## Quick Wins

可访问性 quick wins 是指只需要很短时间实施的修改，是所有人都能做到的第一步。

### 图片的 “alt 描述”

在你应用中，所有的视觉、非文字元素都应该附有可替换文字描述（“alt 描述”作为简写），这些文字描述非文字元素的细节，这些文字为辅助技术用户的提供了必要的环境和背景。

**A11y 行动：**
1. 为所有的图片元素添加文字描述属性，例如，![两只小猫玩毛线球](https://developer.spotify.com/cats.gif)；
2. 或者，在非文本元素之下添加细节标题；
3. 对于完全装饰性图片，添加空的 `<alt="">` 属性，以便于屏幕阅读器跳过它们。

**资源：**
- [WebAim’s guide to alternative text](https://webaim.org/techniques/alttext/)
- [W3C’s guide to text-alternatives in images](https://www.w3.org/WAI/tutorials/images/)

### 动画

> 作为应用程序开发者，遵守系统设定是很重要的。应用内设定同样重要，但是应该要被用户设定的系统首选项所覆盖。

大家知道动画会导致癫痫，包括恶心、头痛等等。对用户来说，根据偏好关闭动画很常见，例如优化设备性能和为电池省电。所以，以包容、不造成伤害的方式引入动画是很重要的。

**A11y 行动：**
1. 采用来自 [WCAG 的建议](https://www.w3.org/TR/WCAG21/#three-flashes-or-below-threshold)，动画的时候小次 3 个闪动，该建议规定在一秒内动画不能超过最多 3 次闪动；
2. 让用户有完全能力控制应用的动画，让他们可以暂停动画，或者按照用户的医院完全关闭动画；
3. 如果用户交互页面（例如上下滚动）会导致动画，添加可以禁用或者减少运动引起的动画的限制选项。

**资源：**
- [University of Maryland’s Photosensitive Epilepsy Analysis Tool](https://trace.umd.edu/peat/)

### 按钮

> To be continued.


