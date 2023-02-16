import { bgStyle } from './styles'

/**
 * 褪色（渐变）动画组件。
 *
 * 该组件维护样式，包含褪色过渡动画的具体样式，入场动画样式和退场动画样式，可以直接使用。
 *
 * 过渡动画组件飞书文档：https://w3nu1yaadv.feishu.cn/wiki/wikcntHfsey7NmMLU2gjqt3jwmf
 */
Component({
  externalClasses: ['position-class'],
  data: {
    bgStyle: '',
  },
  properties: {
    opened: {
      type: Boolean,
      value: false,
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
    bgColor: {
      type: String,
      value: 'rgba(0, 0, 0, 0.5)',
    },
    positionStyle: {
      type: String,
      value: '',
    },
  },
  observers: {
    bgColor(v: string) {
      this.setData({ bgStyle: bgStyle(v) })
    },
  },
  lifetimes: {
    attached() {
      const { bgColor } = this.data
      this.setData({ bgStyle: bgStyle(bgColor) })
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
