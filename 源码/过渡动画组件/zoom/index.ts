import { scaleStyle } from './styles'

/**
 * 缩放动画组件。
 *
 * 该组件维护样式，包含缩放动画的具体样式，入场动画样式和退场动画样式，可以直接使用。
 *
 * 过渡动画飞书文档：https://w3nu1yaadv.feishu.cn/wiki/wikcntHfsey7NmMLU2gjqt3jwmf
 */
Component({
  externalClasses: ['position-class'],
  properties: {
    opened: {
      type: Boolean,
      value: false,
    },
    scale: {
      type: Number, // 0-1
      default: null,
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
  data: {
    scaleSty: '', // 缩放大小样式
  },
  observers: {
    scale(v: number) {
      this.setData({ scaleSty: scaleStyle(v) })
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
