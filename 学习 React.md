# 学习 React

React 是一个“用于构建用户界面的 JavaScript 库”。它用数据驱动视图，仅仅改变数据，不用直接操作繁琐的 DOM API，就能让数据的变化反映在页面中，所以我们能更快速地构建更复杂的网页。它比 Angular 容易，相比 Vue 使用更少的模版，它还有一个好看的蓝色图标。下面的内容是我学习 React 时做的记录。

## Hook

Hook 是 React16.8 的新增特性。

*クラスコンポーネントの欠点<small style="color: salmon">けってん</small>：*

>大型组件很难拆分和重构，也很难测试；
>
>业务逻辑分散在组件的各个方法之中，导致重复逻辑或关联逻辑；
>
>组件类引入了复杂的编程模式，比如 render props 和高阶组件。

React Hooks 使用函数写出**全功能**组件，函数无状态，因此使用 React Hooks 进行**状态的读写**。

相关链接：
- [react hooks进阶与原理](https://zhuanlan.zhihu.com/p/51356920)——知乎文章；
- [useHooks](https://usehooks.com)——提供了很多通用的自定义 hooks；
- [REACT HOOKS 原理及实现](https://sylvenas.github.io/blog/2021/03/30/react-hooks.html)——作者通过自己实现 useState 理解 React Hooks，点击查看 [gist 代码](https://gist.github.com/Sylvenas/28d23025ff369ab63c95cd8a40122d4c)。

## useState

useState()，例<small style="color: salmon">れい</small>を挙<small style="color: salmon">あ</small>げましょう，下面是一个“计数组件”的例子：

```javascript
import React, { useState } from "react";

export default function EffectDemo() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count => count + 1); // 如果这里换成 setCount(count + 1)，页面上的 count 将停止在 1，不再继续每秒自增
    }, 1000);

    return () => { clearInterval(timer); };
  }, []);

  return <h1>{ count }</h1>;
}
```

更详细的计数器实现介绍：[使用 React Hooks 声明 setInterval](https://overreacted.io/zh-hans/making-setinterval-declarative-with-react-hooks/)。

相关链接：
- [如何惰性创建昂贵的对象？](https://react.docschina.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily)——官方文档解释向 useState 传入函数参数来惰性创建昂贵对象；
- [Hooks, State, Closures, and useReducer](https://adamrackis.dev/blog/state-and-use-reducer)；
- [使用 React Hooks 声明 setInterval](https://overreacted.io/zh-hans/making-setinterval-declarative-with-react-hooks/)——用自定义 hooks 实现一个 setInterval。

## useContext

Context 适用全局的设置，如主题、语言的切换。

初步使用 useContext 的步骤：
- 在父组件定义`const AppContext = React.createContext({});`；
- 然后在父组件外层包裹`<AppContext.Provider value={{testkey: 'testvalue'}}></AppContext.Provider>`；
- 最后在后代组件里执行`const { testkey } = useContext(AppContext);`。

相关链接：
- [Context](https://zh-hans.reactjs.org/docs/context.html)——React 文档；
- [useContext](https://zh-hans.reactjs.org/docs/hooks-reference.html#usecontext)——React 文档。

## useReducer

什么是 useReducer：useState 的替代方案，useReducer 同样返回一个 state 和一个用来更新 state 的函数，但是 useReducer 使用更“声明式”的调用方式。

为什么使用 useReducer：为了高可读性，分离“做什么”和“怎么做”，集中处理 state，“声明”大于“命令”。

useReducer 的工作流程：
- 定义一个 useReducer，包括一个 reducer 函数和一个 state 初始值，然后 state 被渲染在页面中；
- 用户想要改变状态 state，于是触发了一个事件，执行`dispatch(action)`;
- reducer 接收到了 action，根据 action 对 state 做出更新；
- state 被重新渲染在页面中；
- 重复以上步骤……

用 useReducer 实现一个计数器（自增）的例子：

```javascript
const initialState = {count: 0};

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {count: state.count + 1};
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (<>
      Count: {state.count}
      <button onClick={() => dispatch({type: 'increment'})}>+</button>
    </>
  );
}
```

相关链接：
- [useReducer](https://zh-hans.reactjs.org/docs/hooks-reference.html#usereducer)——React 文档；
- [CodeSandbox](https://codesandbox.io/s/react-usereducer-redux-xqlet?file=/src/index.js)——在线运行用 useReducer 实现的自增计数器。

## useEffect

关于 useEffect 的执行顺序：

```javascript
import React from "react";

function Son() {
  console.log("son .......");
  React.useEffect(() => {
    console.log('--------Son useEffect-------');
  });
  React.useLayoutEffect(() => {
    console.log('--------Son useLayoutEffect-------');
  });
  React.useInsertionEffect(() => {
    console.log('--------Son useInsertionEffect-------');
  });
  return <div>子组件</div>;
}

function Father() {
  console.log("father ........");
  React.useEffect(() => {
    console.log('--------Father useEffect-------');
  });
  React.useLayoutEffect(() => {
    console.log('--------Father useLayoutEffect-------');
  });
  React.useInsertionEffect(() => {
    console.log('--------Father useInsertionEffect-------');
  });
  return <div>
    <div>父组件</div>
    <Son />
  </div>;
}

export default Father;
```

上面代码的执行结果：

```
father ........
son .......
--------Son useInsertionEffect-------
--------Father useInsertionEffect-------
--------Son useLayoutEffect-------
--------Father useLayoutEffect-------
--------Son useEffect-------
--------Father useEffect-------
```

相关链接：
- [“如果我的 effect 的依赖频繁变化，我该怎么办？”](https://zh-hans.reactjs.org/docs/hooks-faq.html#what-can-i-do-if-my-effect-dependencies-change-too-often)——执行 effect 创建闭包；
- [CodeSandbox](https://codesandbox.io/s/react-useeffect-redux-9t3bg)——“引入具有副作用的操作，最常见的就是向服务器请求数据”。

## useMemo / useCallback

什么是 useMemo / useCallback：
- 都用来缓存，useMemo 用来缓存值，这个值往往有很大的计算量，useCallback 用来缓存函数；
- 如果说缓存值或函数不好理解，又可以说 useMemo 用来缓存纯函数，useCallback 用来缓存不纯的（副作用）函数；
- 由于纯函数对相同的输入总是有相同的输出，所以只要提供了纯函数的入参（useMemo 的依赖项），可以认为缓存纯函数相当于缓存值；
- 不纯的函数不能保证每次执行都会有相同的输出，所以在 js 里，缓存这种不纯的函数缓存的是它的引用，而这种函数在 React 中总是以回调的形式出现，例如在`setTimeout`回调中，在 `onClick`中，它们都不是当下执行，而是异步的、是作为回调的，所以可以命名为`useCallback`。

为什么需要 useMemo / useCallback：
- 因为 React 的重新渲染，每一次重新渲染都会导致重新执行组件函数；
- 如果组件函数中有运算量大的部分，缓存（使用 useMemo）起来会起到性能优化的作用；
- 如果父组件传递了一个函数给子组件，每一次父组件渲染，即使子组件进行了`React.memo`包裹，子组件也会重新渲染，因为父组件的渲染导致传递给子组件的函数更新了，子组件对比前后有不同的 props，就进行了一次浪费的渲染，所以把函数缓存（使用 useCallback）起来再传递更好。

Context 中使用 useMemo 的最佳实践：

```javascript
const AuthContext = React.createContext({});
function AuthProvider({ user, status, forgotPwLink, children }){
  const memoizedValue = React.useMemo(() => {
    return {
      user,
      status,
      forgotPwLink,
    };
  }, [user, status, forgotPwLink]);
  return (
    <AuthContext.Provider value={memoizedValue}>
      {children}
    </AuthContext.Provider>
  );
}
```

Hooks 中使用 useCallback 的最佳实践：

```javascript
function useToggle(initialValue) {
  const [value, setValue] = React.useState(initialValue);
  const toggle = React.useCallback(() => {
    setValue(v => !v);
  }, []);
  return [value, toggle];
}
```

相关链接：
- [Understanding useMemo and useCallback](https://www.joshwcomeau.com/react/usememo-and-usecallback/#an-alternative-approach)——英文，解释了 useMemo 和 useCallback，有丰富直观的交互和案例代码；
- [一直以来`useCallback`的使用姿势都不对](https://segmentfault.com/a/1190000022988054)——解释 useCallback 以及替代方案 useReducer 和 useContext。

## useRef

什么是 useRef：useRef 生成的变量，既不导致重新渲染，也不被重新渲染影响。

为什么需要 useRef：需要使用 useState 生成的不可变的数据，同样也需要 useRef 生成的可变数据。

其它关于 useRef 的信息：
- ref 不导致 render，并且结果总是最终的值，不会像 state hook 会使用闭包在每个状态保存一个值；
- 借用 useRef() 模拟类组件的 componentDidMount 生命周期（在第一次渲染时执行操作，book）；
- 赋值给 DOM 节点的 ref 属性，访问 DOM 节点；
- useRef 和 createRef 的区别，https://juejin.im/post/6844904079164964878。

利用 useRef 实现一个名为 usePrevious 的自定义 hook，用来保存上一次的状态：

```typescript
function usePrevious<T>(value: T): T {
  const ref: any = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
```

相关链接：
- [useRef](https://zh-hans.reactjs.org/docs/hooks-reference.html#useref)—— React 官方文档。

## useLayoutEffect

相关链接：
- [React useLayoutEffect](https://weiyun0912.github.io/Wei-Docusaurus/docs/React/Hooks/React-useLayoutEffect/)——useEffect 的闪屏问题。

## useImpreativeHandle

> “可以通过 useImperativeHandle Hook 暴露一些命令式的方法给父组件。”——*https://zh-hans.reactjs.org/docs/hooks-faq.html#can-i-make-a-ref-to-a-function-component*

相关链接：
- [React Hooks: 使用 useImperativeHandle 來跟子元件互動](https://z3388638.medium.com/react-hooks-%E4%BD%BF%E7%94%A8-useimperativehandle-%E4%BE%86%E8%B7%9F%E5%AD%90%E5%85%83%E4%BB%B6%E4%BA%92%E5%8B%95-2b543bec3e8a)；
- *‌https://codesandbox.io/s/romantic-ritchie-jvkdu?file=/src/components/BaseInput/index.jsx*——一个 useInperativeHandle 的在线例子。

## 自定义 Hook

独自<small style="color: salmon">どくじ</small>の Hooks を作成<small style="color: salmon">さくせい</small>する、例を挙げましょう：https://codesandbox.io/s/react-useeffect-redux-ghl7c；把公共的逻辑代码提取到函数中，然后像调用函数一样调用它。

## Refs 转发

相关链接：
- [Why, exactly, do we need React.forwardRef?](https://stackoverflow.com/questions/62931216/why-exactly-do-we-need-react-forwardref)——“为什么可以通过 props 传 ref 还需要转发 ref？”；
- [What is the different between useImperativeHandle and useRef?](https://stackoverflow.com/questions/73468735/what-is-the-different-between-useimperativehandle-and-useref)——“使用 useImperativeHandle 和直接赋值 ref.current 的区别？”

## 异步组件和懒加载

使用异步组件 React.Suspense 和懒加载 React.lazy 的例子，这里的 OtherComponent 会因为懒加载在产包中被代码分割：

```javascript
const OtherComponent = React.lazy(() => import("./TheDemo"));

function MyComponent() {
  return <React.Suspense fallback={<Spinner />}>
    <div>
      <OtherComponent />
    </div>
  </React.Suspense>;
}
```

相关链接：
- [React.Suspense](https://zh-hans.reactjs.org/docs/react-api.html#reactsuspense)——React 官方文档；
- [React.lazy](https://zh-hans.reactjs.org/docs/code-splitting.html#reactlazy)——React 官方文档。

## Portals

令子节点渲染到父组件外的指定 DOM 里，`ReactDOM.createPortal(child, container)`。用在如 body 层的 fixed 的 position，跳出父元素的 hidden overflow 或 z-index。

## 动画

高度位置的高度动画：
- *‌https://github.com/chenglou/react-motion/issues/62*，GitHub 提问
- *‌https://stackoverflow.com/questions/29337045/how-to-animate-element-height-in-react-with-reactcsstransitiongroup*，stack overflow 提问
- *‌https://github.com/Stanko/react-animate-height*，库

## パフォーマンス最適化<small style="color: salmon">さいてきか</small>

shouldComponentUpdate（SCU）：除首次渲染和 forceUpdate() 时，此外渲染前被调用；父组件更新，子组件也更新，SCU 默认返回 true，可以在子组件的 SCU 中**添加条件**（返回 false）从而在满足条件的情况下，父组件的更新不连带子组件。可以在组件中添加 componentDidUpdate（CDU），打印查看子组件是否更新。

データを変更<small style="color: salmon">へんこう</small>しないこと：如果现在已经给子组件 SCU 添加了条件，却使用非纯函数进行数据更新，将导致子组件静默不按预期渲染视图（数据已在 setState 前更新），因为这个问题，React 默认情况下，SCU 返回 false 来保证按预期渲染视图（即使使用非纯函数）。

PureComponent と memo：浅比较，分别用在类组件和函数组件中，前者不可自定义（可用 forceUpdate() 强制渲染），后者自定义在指定方法的第二参数。immutable.js，https://immutable-js.github.io/immutable-js/。

HOC：“高階<small style="color: salmon">たかしな</small>コンパーネントとは、あるコンパーネントを受<small style="color: salmon">う</small>け取<small style="color: salmon">と</small>って新規<small style="color: salmon">しんき</small>のコンパーネントを返<small style="color: salmon">かえ</small>すような関数<small style="color: salmon">かんすう</small>です。”，类似于工厂模式，用于复用组件逻辑，https://zh-hans.reactjs.org/docs/higher-order-components.html。

Render Props：https://zh-hans.reactjs.org/docs/render-props.html。

## 原理<small style="color: salmon">げんり</small>

JSX 本质：React.createElement 实现（https://www.babeljs.cn/），参数 1 是代表组件的变量或 dom 节点名称字符串，参数 2 是该组件属性，参数 3 是子组件，返回 vnode，通过 patch 渲染。

下面是一段 jsx：

```
<>
  <a ok href="https://facebook.github.io/react/">Clickme!</a>
  {' '}{' '}{' '}{' '}{' '}
  <div className="box" boole>
    <span>John Lennon</span>
    <span>johnlennon.com</span>
    <span>singer</span>
  </div>
</>
```

下面是 babel 转译后的 js：

```
"use strict";

/*#__PURE__*/
React.createElement(
  React.Fragment,
  null,
  /*#__PURE__*/ React.createElement(
    "a",
    {
      ok: true,
      href: "https://facebook.github.io/react/"
    },
    "Clickme!"
  ),
  " ",
  " ",
  " ",
  " ",
  " ",
  /*#__PURE__*/ React.createElement(
    "div",
    {
      className: "box",
      boole: true
    },
    /*#__PURE__*/ React.createElement("span", null, "John Lennon"),
    /*#__PURE__*/ React.createElement("span", null, "johnlennon.com"),
    /*#__PURE__*/ React.createElement("span", null, "singer")
  )
);
```

合成事件机制的优点：更好的兼容性与跨平台；挂载在 document，减少内存消耗，避免频繁解绑；方便事件的统一管理（如事件机制）。

合成事件的过程：DOM 触发事件，冒泡至顶层 document → 合成事件层，SyntheticEvent 派发事件 → 事件处理函数。

batchUpdate：setState 命中该机制时会执行“保存组件于 dirtyComponents 中”，相反则“遍历所有 dirtyComponents，调用 updateComponent，更新 pending state or props”，体现在 setState 上就是同步；如何判断是否将命中该机制可以理解成，执行函数的机制是函数内有个布尔变量（isBatchingUpdates），在函数首尾分别赋值为开和关，setState 时查看该变量，值为关**反映的现象**则是同步；能命中该机制的情况，如生命周期（和调用它的函数）、React 中注册的事件（和它调用的函数）、React 可以“管理”的入口。

组件的渲染和更新：props state → render() 生成 vnode → patch(elem, vnode)；setState(newState) --> dirtyComponents → render() 生成 newVnode → patch(vnode, newVnode)。

React 官方对自己的总结是：声明式；组件化；一次学习，随处编写。这里解释怎么做到声明式。“函数式编程就是一种声明式，能够避免代码副作用，同时它推崇数据不可变，以便更易维护与考量代码”，下面是 React 里普遍使用的一些这样的概念：

- 一等对象，函数既可以赋值给变量，也可以作为参数传递，如高阶函数的应用（增强行为）；
- 纯粹性，不改变自身作用域以外的任何东西，如`const add = (x, y) => x + y`纯粹，`let x = 0; const add = y => (x = x + y)`不纯粹；
- 不可变性，改了变量就不纯粹了，那么我们需要修改变量只能通过赋值新变量的方式，如`const add3 = arr => arr.concat(3); const myArr = [1, 2]; const result = add3(myArr)`；
- 柯里化，多参转单参，转化后一个个参数是一个个状态方便保存下来，如`const add = x => y => x + y`；
- 组合，通过组合，方便分解缩小，易于阅读和测试；
- 函数式编程与 UI，React 用函数式编程构建 UI，使函数是一个幂等函数。

## 虚拟 DOM

关于 DOM 操作：DOM 操作耗费性能，js 计算能力更强；不用虚拟 DOM 时，自己调整 DOM 操作。

相关链接：
- [snabbdom](https://github.com/snabbdom/snabbdom/blob/master/README-zh_CN.md)——“一个精简化、模块化、功能强大、性能卓越的虚拟 DOM 库”。

## diff 算法

React 的 diff 算法的时间复杂度相比传统 diff 算法，从指数级的 O(n^3) 降到了线性的 O(n)。

React diff 的线性复杂度基于 3 个假设：
- Web UI 中 DOM 节点跨层级的移动操作特别少，可忽略不计（tree diff）；
- 两个相同组件产生类似的 DOM 结构，不同组件产生不同 DOM 结构（component diff）；
- 对于同一层次的一组子节点，可以通过唯一的 id 进行区分（element diff）。

## ほしのかけら

練習問題<small style="color: salmon">れんしゅうもんだい</small>：组件如何通讯；JSX 本质；context 的作用；shouldComponentUpdate（SCU）的作用；redux 单向数据流的简述；setState 是异步还是同步。

渲染原生 HTML：JSX 标签需要 dangerouslySetInnerHTML 属性，这个属性的值必须是 `{__html: ''<span>富文本内容<i>斜体</i><b>加粗</b></span>''}` 格式的对象，https://zh-hans.reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml。

React Event：SyntheticEvent 模拟出了 DOM 事件所有能力；event.nativeEvent 是原生事件对象；所有事件被挂载到了 document 上；e.nativeEvent, e.nativeEvent.target, e.nativeEvent.currentTarget。

ライフサイクル：ライフサイクル図<small style="color: salmon">ず</small>，https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/；https://codepen.io/birdknothing/pen/XvVqmx?editors=1011。

Reselect 库解决了从 selector 派生数据会导致重新生成数据，进而导致重复渲染的问题。

组件之间数据的传递和更新：
- 父组件向子组件，通过 props 进行传递；
- 子组件向父组件，先在父组件向子组件传递函数 props，然后在子组件调用时设置入参即可使父组件获得设置的参数；
- 跨级组件，利用 Context 避免逐层传递实现跨级传递；
- 非嵌套组件，可以使用 Hooks API，结合 useContext 和 useReducer，可以使用 Redux，可以使用发布订阅者模式，安装`npm install events -S`。

组件设计：
- 拆分功能，分层；
- 组件原子化；
- 区分管理数据的容器组件和管理视图的 UI 组件。

state 数据结构设计标准：
- 能够体现“数据描述内容”；
- 数据**结构化**，易于查找、遍历；
- 数据可扩展。

React 和真实操作 DOM 快慢的讨论：https://www.zhihu.com/question/31809713/answer/54833728。

引入大量本地图片：https://segmentfault.com/q/1010000009641349。

import 图片方式：webpack 把图片当资源文件打包，可以配置 url-loader 进行图片压缩。

React 阻止默认事件：显式调用对象的 preventDefault 方法阻止。

类组件里常用的定义事件函数方法：ES7 的属性初始化语法，无需手动绑定 this。

官方文档的问题：
- 有很多固定的范式，没有说明原因；
- 提供了自由的选择，没有解释区别。

相关链接：
- [Why React Re-Renders](https://www.joshwcomeau.com/react/why-react-re-renders/#introduction)——英文，用快照类比解释了 React 的重新渲染机制，有丰富直观的交互和案例代码；
- [React18 setState: 消失的面试题](https://zhuanlan.zhihu.com/p/460668459)——React18 的 setState 是异步的。

## 学習<small style="color: salmon">がくしゅう</small>サイト

资料：
- [Overreacted](https://overreacted.io/)——Dan Abramov 的个人博客；
- [React技术揭秘](https://react.iamkasong.com/)——源码阅读；
- [ライフサイクル図（React 生命周期）](https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)——React 生命周期图示；
- [React 源码解析](https://linjuncheng.cn/pages/react/hard/readme.html)——作者结合掘金小册等资料的总结。


其它链接：
- [林纳斯的程序时间](https://linux.slashdot.org/story/20/07/03/2133201/linus-torvalds-i-do-no-coding-any-more)——“Linus Torvalds: 'I Do No Coding Any More' ”；
- [试题材料](https://q.shanyue.tech/interviews/2017.html)——作者的历年面试题记录；


## 猫の餌<small style="color: salmon">えさ</small>

```
https://www.zhihu.com/question/24925709/answer/130708066

猫咪怀孕，产前准备及生产后护理全攻略：https://zhuanlan.zhihu.com/p/180313588

母猫产后吃什么？该怎样护理？ https://zhuanlan.zhihu.com/p/34534366

Python 编程快速上手：让繁琐工作自动化：https://automatetheboringstuff.com/
```