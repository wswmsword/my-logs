/* eslint-disable max-len */
/*
 * @Author: wsWmsword
 * @Date: 2022-11-17 09:31:00
 * @LastEditors: wsWmsword
 * @LastEditTime: 2022-02-07
 * @Description: 动画的公共 behavior，给组件涂上奶和蜜（Milk and Honey）
 * behavior 只能传递 properties，不能像 hook 传递入参
 */

// let lastInvokeTime = Date.now()

/** transition 动画的进程阶段 */
enum PROCESS {
  /** 一片混沌的状态 */
  INIT = /*            */0b0000,
  /** 入场动画初始状态 */
  ENTER = /*           */0b0001,
  /** 入场动画结束状态 */
  ENTER_ACTIVE = /*    */0b0010,
  /** 退场动画初始状态 */
  EXIT = /*            */0b0100,
  /** 退场动画结束状态 */
  EXIT_ACTIVE = /*     */0b1000,
}
// const PROCESS_All_BITS = 0b1111

/**
 * 过渡动画的公共 behavior。
 *
 * 组件飞书文档：https://w3nu1yaadv.feishu.cn/wiki/wikcntHfsey7NmMLU2gjqt3jwmf
 *
 * 提供了动画各个阶段的回调：entering、entered、exiting、exited。
 * - entering，入场动画开始了；
 * - entered，入场动画结束了；
 * - exiting，退场动画开始了；
 * - exited，退场动画结束了。
 *
 * 该 behavior 维护逻辑，包括维护过渡动画的每个阶段状态，触发阶段钩子。
 *
 * ⚠️ 如果动画开始前或动画结束后，需要隐藏，请不要（也不能）使用 `opacity: 0` 或者 `left: -1000rpx` 表示隐藏，请使用 `visibility: hidden`，或者销毁组件。
 *
 * ---
 * 实际场景一：click -> **entering** --等待入场动画结束--> **entered** -> click -> **exiting** --等待退场动画结束--> **entered**
 *
 * 实际场景二：click -> **entering** --等待入场动画结束--> 还没结束立马 click -> **exiting** --等待退场动画结束--> **exitd**
 *
 * ---
 * - Bug1
 *   - 退场动画可能闪退。在入场动画即将结束时，触发退场，期望是立即执行退场动画（这时不会触发入场动画的 transitionend），可实际情况是需要等待一段时间（视图->逻辑->视图）才执行退场，这时入场动画结束的回调 transitionend 已经执行完毕，而在这个回调中，我能识别到的动画状态是错误的退场状态，所以期望的退场动画没有出现，而是动画组件被立即卸载了。
 *   - Solutions
 *     - a. 目前小程序没有提供 transitionstart 回调函数，日后如果提供，可以利用 transitionstart 确定动画的状态。
 *     - b. 判断 transitionend 回调的时间和上次触发动画时间的时间差，如果像几十毫秒一样小，就代表用户的目的是完成退场动画，而不是立即结束，卸载动画，这可以保证动画稳定但会导致动画不被卸载，由于卸载的重要性，不应该使用该方案。
 *     - c. 使用 setTimeout 定时器代替 transitionend 回调。
 *   - [Event 事件微信文档](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/event.html)
 *   - [社区帖子](https://developers.weixin.qq.com/community/develop/doc/00028a7bd2c588bf7e2f7644351400)
 * - TODO: show 钩子待删除；appear 属性定义
 */
const behavior = Behavior({
  properties: {
    /** 动画持续的时间，单位 ms */
    duration: {
      type: Number,
      value: 240,
    },
    /** 触发动画的开关，true 打开动画，false 关闭动画 */
    opened/* InProgram */: {
      type: Boolean,
      value: false,
      observer() {
        if (!this.data.readied) {
          return
        }
        // this.toggleAnime()
        this.baiduObserverShim(this.toggleAnime.bind(this))
      },
    },
    /** 完成动画后是否销毁组件 */
    isDestroy: {
      type: Boolean,
      value: true,
    },
    /** 加载后立即展示动画，通常在不提供再次打开的场景使用，例如弹窗 */
    appear: {
      type: Boolean,
      value: false,
    },
    /**
     * @function 禁止首次动画
     * @description 如果是一系列嵌套的动画，打开时，很可能只需要最外层的动画，内层的内容只需要在打开之后直接展示，而不需要动画
     */
    ignoreFirst: {
      type: Boolean,
      value: false,
    },
    /** 禁止动画。有的情况开启动画的响应过慢，可能需要关闭，例如执行 wx.pageScrollTo 后打开动画会导致响应过慢 */
    noTransition: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    test: 'test data in behavior',
    displayed: false, // 组件是否卸载，卸载发生在动画结束后
    openedInScreen: null, // true-滑入，false-滑出
    appeared: false,
    ignoredFirst: false, // 已禁止首次动画
    exited: true, // 动画已退出（准备-进入前-进入-退出前-退出）
    readied: false, // 标记是否进入 ready 生命周期，延迟所有操作到 ready 后
    processBits: PROCESS.INIT, // 表示（当前）动画进程阶段状态
    // ======== 下面是一堆 transition 动画运行的状态 =========
    IS_INIT_BITS: true, // 初始状态，true
    IS_ENTER_BITS: false,
    IS_ENTER_ACTIVE_BITS: false,
    IS_EXIT_BITS: false,
    IS_EXIT_ACTIVE_BITS: false,
    // ======== 上面是一堆 transition 动画运行的状态 =========
    startedTranstion: false, // 第一次运行动画后设为 true，true 则确定了组件已装载完毕
  },
  methods: {
    /** wxml 标签的 transitionend 事件 */
    enteredOrExited(/* e */) {
      const { opened } = this.data
      if (opened) {
        this.hasEntered()
      } else {
        this.hasExited()
      }
    },
    /** 入场动画结束 */
    hasEntered() {
      this.setTransBits(PROCESS.EXIT) // 设置动画状态，退场动画初始阶段，0100
      this.triggerEvent('entered')
      this.setData({ exited: false })
    },
    /** 退场动画结束 */
    hasExited() {
      // if (Date.now() - lastInvokeTime < 50) {
      //   // 一种解决 bug1 的方法，抹平操作
      //   // 这样抹平会导致，在真正的退场动画附近操作时，导致不卸载组件
      //   // 这样抹平，阀值 50 不是一个准确的范围，可能机型性能越差需要的阀值越大
      //   // 不卸载组件导致的问题大于动画的不稳定性，不应该使用
      //   return
      // }
      this.setData({ displayed: false })
      this.triggerEvent('exited')
      this.setData({ exited: true })
    },
    /** 切换入场和退场动画 */
    toggleAnime() {
      // lastInvokeTime = Date.now()
      const { opened } = this.data
      if (this.willStopAnimeIfOK()) {
        return
      }
      if (opened) {
        const { startedTranstion } = this.data
        this.setTransBits(PROCESS.ENTER) // 设置动画状态，入场动画初始阶段，0001
        if (startedTranstion) {
          // 组件装载完毕，无需等待，直接动画
          this.enteringTransition()
        } else {
          // 组件还不一定装载完毕，等几帧后，再动画
          this.asyncEnteringTransition()
        }
        this.triggerEvent('show')
        this.setData({ displayed: true })
      } else {
        this.setTransBits(PROCESS.EXIT_ACTIVE) // 设置动画状态，退场动画结束阶段，1000
        this.setData({ openedInScreen: opened })
        this.triggerEvent('exiting') // 正在退出的钩子，正式开始退出动画了
      }
    },
    /** 入场动画开始了 */
    enteringTransition() {
      this.setTransBits(PROCESS.ENTER_ACTIVE) // 设置动画状态，入场动画结束阶段，0010
      this.setData({ openedInScreen: true })
      this.triggerEvent('entering') // 正在进入的钩子，正式开始进入动画了
    },
    /** 入场动画开始了，但是要等几帧，等组件装载完毕 */
    asyncEnteringTransition() {
      if (ENV_IS_TT) {
        // 设置动画进行状态，计时器延迟动画在组件挂载后执行
        setTimeout(() => {
          this.enteringTransition()
          this.setData({ startedTranstion: true }) // 标记
        }, 36)
      }
      if (ENV_IS_WEAPP || ENV_IS_SWAN) {
        wx.nextTick(() => {
          setTimeout(() => {
            this.enteringTransition()
            this.setData({ startedTranstion: true }) // 标记
          }, 6)
        })
      }
    },
    /** 如果满足，则中断动画 */
    willStopAnimeIfOK() {
      // 禁止动画？
      const disabledTransition = this.stopIfNoTransition()
      if (disabledTransition) {
        return true
      }
      // 禁止第一次动画？
      const disabledFirstTransition = this.stopIfNoFirstTransition()
      if (disabledFirstTransition) {
        return true
      }
      return false
    },
    /** 禁止动画的操作 */
    stopIfNoTransition() {
      const { opened } = this.data
      if (this.data.noTransition) {
        this.setData({ openedInScreen: opened })
        if (opened) {
          this.setData({ displayed: true })
          this.triggerEvent('show')
        }
        setTimeout(() => {
          // 在本次之后的事件循环执行
          this.enteredOrExited()
        }, 32) // 2 帧 32ms
        return true
      }
      return false
    },
    /** 禁止第一次动画的操作 */
    stopIfNoFirstTransition() {
      const { opened } = this.data
      if (this.data.ignoreFirst && !this.data.ignoredFirst) {
        this.setData({ openedInScreen: opened })
        if (opened) {
          this.setData({ displayed: true })
          this.triggerEvent('show')
        }
        setTimeout(() => {
          // 在本次之后的事件循环执行
          this.setData({ ignoredFirst: true })
          this.enteredOrExited()
        }, 32) // 2 帧 32ms
        return true
      }
      return false
    },
    /** 动画状态更新 */
    setTransBits(bits: number) {
      this.setData({
        processBits: bits,
      })
      this.updatedProcessBits(bits)
    },
    /** 相当于 observers: {processBits() {...}}，兼容百度小程序，百度组件里用不了 observers？ */
    updatedProcessBits(cur: number) {
      const bitsObj = {
        IS_INIT_BITS: false,
        IS_ENTER_BITS: false,
        IS_ENTER_ACTIVE_BITS: false,
        IS_EXIT_BITS: false,
        IS_EXIT_ACTIVE_BITS: false,
      }
      // data 变量名映射
      const curProcess = new Map([
        [PROCESS.INIT, 'IS_INIT_BITS'],
        [PROCESS.ENTER, 'IS_ENTER_BITS'],
        [PROCESS.ENTER_ACTIVE, 'IS_ENTER_ACTIVE_BITS'],
        [PROCESS.EXIT, 'IS_EXIT_BITS'],
        [PROCESS.EXIT_ACTIVE, 'IS_EXIT_ACTIVE_BITS'],
      ]).get(cur)
      this.setData({
        ...bitsObj,
        [curProcess]: true,
      })
      // const processMap = new Map([
      //   [PROCESS.ENTER, 'IS_ENTER_BITS'],
      //   [PROCESS.ENTER_ACTIVE, 'IS_ENTER_ACTIVE_BITS'],
      //   [PROCESS.EXIT, 'IS_EXIT_BITS'],
      //   [PROCESS.EXIT_ACTIVE, 'IS_EXIT_ACTIVE_BITS'],
      // ])
      // const targetProcess = processMap.get(cur)
      // processMap.forEach(processStr => {
      //   if (processStr === targetProcess) {
      //     if (this.data[processStr] !== true) {
      //       this.setData({
      //         [processStr]: true,
      //       })
      //     }
      //   } else if (this.data[processStr] === true) {
      //     this.setData({
      //       [processStr]: false,
      //     })
      //   }
      // })
    },
    /**
     * 垫片，主要用来抹平百度在监听器（observers）里不使用定时器，内部的 setData 不会再次出发监听器的问题。
     *
     * 已反馈社区，[问题链接](https://smartprogram.baidu.com/forum/topic/show/157870)，如果在未来
     * 版本中已修复该问题，请移除该函数（baiduObserverShim）。
     */
    baiduObserverShim(func) {
      if (ENV_IS_SWAN) {
        setTimeout(func, 16)
      } else {
        func()
      }
    },
  },
  lifetimes: {
    ready() {
      this.setData({ processBits: PROCESS.INIT })
      this.updatedProcessBits(PROCESS.INIT)
      if (this.data.opened) {
        // this.toggleAnime()
        this.baiduObserverShim(this.toggleAnime.bind(this))
      }
      this.setData({ readied: true })
    },
  },
})

export default behavior
