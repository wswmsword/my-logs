/*
 * @Author: wsWmsword
 * @Date: 2022-11-15 09:14:02
 * @LastEditors: wsWmsword
 * @LastEditTime: 2022-11-22 19:17:20
 * @Description: 动画组件
 */
import behavior from '../behavior'

enum STYLE {
  POSITION,
  DURATION,
  ENTER,
  ENTER_ACTIVE,
  EXIT,
  EXIT_ACTIVE,
}

/**
 * 过渡动画组件。
 *
 * 组件飞书文档：https://w3nu1yaadv.feishu.cn/wiki/wikcntHfsey7NmMLU2gjqt3jwmf
 *
 * 传入动画各个阶段的 class，展示 transition 动画：`enter-class`、`enter-active-class`、`exit-class`、`exit-active-class`。
 * - enter-class，入场动画初始状态 class；
 * - enter-active-class，入场动画结束状态 class；
 * - exit-class，退场动画初始状态 class；
 * - exit-active-class，退场动画结束状态 class。
 *
 * 什么时候不需要该 transition 组件？
 * - 不需要获取动画各个阶段的回调（例如不需要动画执行完销毁组件，也即动画开始前才装载组件）；
 * - 动画开始前和结束后使用 `visibility: hidden` 隐藏；
 * - 在确定以上两点都不需要后，且自己编写动画更快捷方便的时候；
 *
 * ⚠️ 如果动画开始前或动画结束后，需要隐藏，请不要（也不能）使用 `opacity: 0` 或者 `left: -1000rpx` 表示隐藏，请使用 `visibility: hidden`，或者销毁组件。
 *
 * 该组件维护视图，包括维护 class 和 style 来回应 behavior 提供的过渡动画的每个阶段状态。
 *
 * 该组件使用 transitionend 事件来判断动画结束，而不是通过 setTimeout 定时器来判断动画结束。
 *
 * 类似 [react-transition-group](http://reactcommunity.org/react-transition-group/transition)，通过传递 transition 动画各阶段的 class 展示动画
 * 同类组件：https://doc.mini.talelin.com/component/animation/transition.html
 */
Component({
  /**
   * - **enter-class**: 入场动画初始状态 class
   * - **enter-active-class**: 入场动画结束状态 class
   * - **exit-class**: 退场动画初始状态 class
   * - **exit-active-class**: 退场动画结束状态 class
   * - **position-class**: 用于设置表示方位位置的样式。
   * 例如指定被动画包裹的子组件是“悬浮”还是”定位在屏幕正中央“，如果直接给被动画组件
   * 包裹的子组件指定位置样式，动画可能失效，所以使用这个 class，被动画包裹的子组件
   * 可以保持纯净（只提供 UI 样式），同时避免因位置样式问题导致的动画失效。
   */
  externalClasses: ['position-class', 'enter-class', 'enter-active-class', 'exit-class', 'exit-active-class'],
  behaviors: [behavior],
  data: {
    transDur: '',
    styleStr: '', // 添加到标签的样式 style
    styleArr: [], // 样式数组，方便遍历、删除、添加，最终生成 styleStr
    initedStyleStr: false, // 已经设置 styleStr 了吗？没设置就要用 enterStyle 作为初始状态样式
  },
  properties: {
    /** 是否包裹子组件，false-撑满父组件 */
    isWrap: {
      type: Boolean,
      value: true,
    },
    /** 动画持续的时间，单位 ms */
    duration: {
      type: Number,
      value: 240,
      observer(v: number | string) {
        this.setData({
          transDur: (v == null || v === 0 || v === '') ? '' : `transition-duration: ${v}ms !important;`,
        })
      },
    },
    // 下面的同上面提到的动画各个阶段的 class，只不过这里是 style
    enterStyle: '',
    enterActiveStyle: '',
    exitStyle: '',
    exitActiveStyle: '',
    // 上面的同之前提到的各个动画的 class，只不过这是 style
    /** 对应 position-class，是位置的样式字符串 */
    positionStyle: '',
  },
  observers: {
    IS_ENTER_BITS(v: boolean) {
      // console.log(v ? 'add' : 'remove', '-开始入场')
      const { enterStyle } = this.data
      this.removeOrAddStyleItem(v, STYLE.ENTER, enterStyle)

      if (v) {
        // 开始入场的时候，设置位置样式（positionStyle）
        this.setPositionStyle()
        // 开始入场的时候，设置动画的持续时间
        this.setDurationStyle()
      }
    },
    IS_ENTER_ACTIVE_BITS(v: boolean) {
      // console.log(v ? 'add' : 'remove', '-结束入场')
      const { enterActiveStyle } = this.data
      this.removeOrAddStyleItem(v, STYLE.ENTER_ACTIVE, enterActiveStyle)
    },
    IS_EXIT_BITS(v: boolean) {
      // console.log(v ? 'add' : 'remove', '-开始退场')
      const { exitStyle } = this.data
      this.removeOrAddStyleItem(v, STYLE.EXIT, exitStyle)
    },
    IS_EXIT_ACTIVE_BITS(v: boolean) {
      // console.log(v ? 'add' : 'remove', '-结束退场')
      const { exitActiveStyle } = this.data
      this.removeOrAddStyleItem(v, STYLE.EXIT_ACTIVE, exitActiveStyle)
    },
  },
  lifetimes: {
  },
  methods: {
    /** 设置位置样式 */
    setPositionStyle() {
      const { positionStyle } = this.data
      if (!(positionStyle == null || positionStyle === '')) {
        this.removeOrAddStyleItem(true, STYLE.POSITION, positionStyle)
      }
    },
    /** 设置持续时间样式 */
    setDurationStyle() {
      const { transDur } = this.data
      if (!(transDur == null || transDur === '')) {
        this.removeOrAddStyleItem(true, STYLE.DURATION, transDur)
      }
    },
    /** 添加或删除 styleArr 里的某项 */
    removeOrAddStyleItem(add: boolean, styleItemIdx: number, styleItemStr: string) {
      const { styleArr } = this.data
      const hasTargetStyle = styleArr[styleItemIdx] != null
      if (add) {
        if (!hasTargetStyle) {
          this.addStyleItem(styleItemIdx, styleItemStr)
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (hasTargetStyle) {
          this.removeStyleItem(styleItemIdx)
        }
      }
    },
    /** 删除 styleArr 里的某项元素 */
    removeStyleItem(itemIdx: number) {
      const { styleArr }: { styleArr: string[] } = this.data
      styleArr[itemIdx] = null
      this.setData({
        styleArr,
      })
      this.styleArr2StyleStr(styleArr)
    },
    /** 添加 styleArr 里的某项元素 */
    addStyleItem(itemIdx: number, itemStr: string) {
      if (itemStr == null || itemStr === '') {
        return
      }
      const { styleArr }: { styleArr: string[] } = this.data
      styleArr[itemIdx] = itemStr
      this.setData({
        styleArr,
      })
      this.styleArr2StyleStr(styleArr)
    },
    /** styleArr 转为 styleStr */
    styleArr2StyleStr(arr: string[]) {
      const filteredArr = arr.filter(item => (item != null && item !== ''))
      const styleStrEndsWithSemi = filteredArr.map((s: string) => (s.endsWith(';') ? s : s.concat(';')))
      const joinedStyleStr = styleStrEndsWithSemi.join(' ').trim()
      const finalStr = joinedStyleStr === '' ? null : joinedStyleStr
      this.setData({ styleStr: finalStr })
      const { initedStyleStr } = this.data
      if (!initedStyleStr) {
        this.setData({ initedStyleStr: true })
      }
    },
  },
})
