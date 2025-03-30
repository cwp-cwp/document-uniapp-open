<template>
  <view class="pay-container">
    <view class="header">
      <view class="container">
        <view class="d-flex justify-content-between align-items-center">
          <text class="header-title">
            确认支付
          </text>
        </view>
      </view>
    </view>

    <view class="pay-content">
      <view class="order-card">
        <view class="order-title">
          订单信息
        </view>
        <view class="order-item">
          <text class="item-label">
            商品名称
          </text>
          <text class="item-value">
            {{ orderInfo.productName }}
          </text>
        </view>
        <view class="order-item">
          <text class="item-label">
            商品价格
          </text>
          <text class="item-value price">
            ¥{{ orderInfo.price.toFixed(2) }}
          </text>
        </view>
        <view class="order-item">
          <text class="item-label">
            订单编号
          </text>
          <text class="item-value">
            {{ orderInfo.orderNo }}
          </text>
        </view>
        <view class="order-divider" />
        <view class="order-total">
          <text class="total-label">
            实付金额
          </text>
          <text class="total-price">
            ¥{{ orderInfo.price.toFixed(2) }}
          </text>
        </view>
      </view>

      <view class="payment-methods">
        <text class="section-title">
          支付方式
        </text>
        <view class="payment-list">
          <view
            class="payment-item"
            :class="{ 'payment-selected': paymentMethod === 'wechat' }"
            @click="selectPayment('wechat')"
          >
            <view class="payment-info">
              <view class="payment-icon wechat">
                <uni-icons
                  type="weixin"
                  size="24"
                  color="#09BB07"
                />
              </view>
              <view class="payment-details">
                <text class="payment-name">
                  微信支付
                </text>
                <text class="payment-desc">
                  使用微信扫码支付
                </text>
              </view>
            </view>
            <view class="payment-check">
              <uni-icons
                v-if="paymentMethod === 'wechat'"
                type="checkbox-filled"
                size="20"
                color="#6a5acd"
              />
              <uni-icons
                v-else
                type="circle"
                size="20"
                color="#cccccc"
              />
            </view>
          </view>
          <view
            class="payment-item"
            :class="{ 'payment-selected': paymentMethod === 'alipay' }"
            @click="selectPayment('alipay')"
          >
            <view class="payment-info">
              <view class="payment-icon alipay">
                <uni-icons
                  type="wallet-filled"
                  size="24"
                  color="#1677FF"
                />
              </view>
              <view class="payment-details">
                <text class="payment-name">
                  支付宝
                </text>
                <text class="payment-desc">
                  使用支付宝扫码支付
                </text>
              </view>
            </view>
            <view class="payment-check">
              <uni-icons
                v-if="paymentMethod === 'alipay'"
                type="checkbox-filled"
                size="20"
                color="#6a5acd"
              />
              <uni-icons
                v-else
                type="circle"
                size="20"
                color="#cccccc"
              />
            </view>
          </view>
        </view>
      </view>

      <view
        v-if="showQrCode"
        class="qr-section"
      >
        <text class="qr-title">
          请使用{{ paymentMethod === 'wechat' ? '微信' : '支付宝' }}扫码支付
        </text>
        <view class="qr-code-container">
          <image
            class="qr-code"
            src="/static/pay_qrcode.png"
            mode="aspectFit"
          />
        </view>
        <text class="qr-hint">
          扫码后请在手机上完成支付
        </text>
        <view class="qr-timer">
          <text>支付二维码有效时间：</text>
          <text class="countdown">
            {{ countdownMinutes }}:{{ countdownSeconds < 10 ? '0' + countdownSeconds : countdownSeconds }}
          </text>
        </view>
      </view>

      <view class="action-buttons">
        <button
          class="btn-cancel"
          @click="cancelPayment"
        >
          取消支付
        </button>
        <button
          v-if="!showQrCode"
          class="btn-confirm"
          @click="confirmPayment"
        >
          确认支付
        </button>
        <button
          v-else
          class="btn-confirm"
          @click="checkPaymentStatus"
        >
          支付完成
        </button>
      </view>

      <view class="payment-tips">
        <view class="tips-header">
          <uni-icons
            type="info-filled"
            size="16"
            color="#6a5acd"
          />
          <text class="tips-title">
            支付须知
          </text>
        </view>
        <view class="tips-content">
          <text class="tip-item">
            • 支付成功后，VIP会员权益将立即生效
          </text>
          <text class="tip-item">
            • 请在订单有效期内完成支付，超时订单将自动取消
          </text>
          <text class="tip-item">
            • 如遇支付问题，请联系客服：400-123-4567
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

const orderInfo = ref({
  productName: '文档转换服务 - VIP月度会员',
  price: 29.00,
  orderNo: 'DOC' + new Date().getTime()
})

const paymentMethod = ref('wechat')
const showQrCode = ref(false)
const countdownMinutes = ref(4)
const countdownSeconds = ref(59)
let countdownTimer = null

const selectPayment = (method) => {
  paymentMethod.value = method
}

const confirmPayment = () => {
  showQrCode.value = true
  startCountdown()
}

const startCountdown = () => {
  countdownTimer = setInterval(() => {
    if (countdownSeconds.value > 0) {
      countdownSeconds.value--
    } else {
      if (countdownMinutes.value > 0) {
        countdownMinutes.value--
        countdownSeconds.value = 59
      } else {
        stopCountdown()
        uni.showModal({
          title: '支付超时',
          content: '二维码已过期，请重新获取',
          showCancel: false,
          success: () => {
            showQrCode.value = false
          }
        })
      }
    }
  }, 1000)
}

const stopCountdown = () => {
  clearInterval(countdownTimer)
}

const cancelPayment = () => {
  uni.showModal({
    title: '取消支付',
    content: '确定要取消支付吗？',
    success: (res) => {
      if (res.confirm) {
        stopCountdown()
        uni.navigateBack()
      }
    }
  })
}

const checkPaymentStatus = () => {
  // 模拟支付成功
  uni.showLoading({
    title: '正在验证支付状态'
  })

  setTimeout(() => {
    uni.hideLoading()
    stopCountdown()

    // 导航到支付成功页面
    uni.navigateTo({
      url: '/pages/paySuccess/paySuccess'
    })
  }, 1500)
}

onUnmounted(() => {
  stopCountdown()
})
</script>

<style lang="scss" scoped>
@import "./pay.scss";
</style>
