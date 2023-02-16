/**
 * 滑行动画组件。
 *
 * 该组件维护样式，包含滑行过渡动画的具体样式，入场动画样式和退场动画样式，可以直接使用。
 *
 * 过渡动画组件飞书文档：https://w3nu1yaadv.feishu.cn/wiki/wikcntHfsey7NmMLU2gjqt3jwmf
 */
Component({
  /**
   * position-class: 用于设置表示方位位置的样式。
   * 例如指定被动画包裹的子组件是“悬浮”还是”定位在屏幕正中央“，如果直接给被动画组件
   * 包裹的子组件指定位置样式，动画可能失效，所以使用这个 class，被动画包裹的子组件
   * 可以保持纯净（只提供 UI 样式），同时避免因位置样式问题导致的动画失效。
   */
  externalClasses: ['position-class'],
  data: {
    durStyle: '', // 持续时间样式
    accDurStyle: '', // 可访问性动画持续时间
  },
  properties: {
    opened: {
      type: Boolean,
      value: false,
    },
    direction: { // 滑行方向
      type: String,
      value: 'down', // ['down', 'right', 'up', 'left']
    },
    duration: {
      type: Number,
      value: 240,
    },
    /** 是否包裹子组件，false-撑满父组件 */
    isWrap: {
      type: Boolean,
      value: true,
    },
    noTransition: {
      type: Boolean,
      value: false,
    },
    positionStyle: {
      type: String,
      value: '',
    },
  },
  lifetimes: {
    attached() {
    },
  },
  methods: {
    entering() {
      this.triggerEvent('entering')
    },
    entered() {
      this.triggerEvent('entered')
    },
    exiting() {
      this.triggerEvent('exiting')
    },
    exited() {
      this.triggerEvent('exited')
    },
  },
})
