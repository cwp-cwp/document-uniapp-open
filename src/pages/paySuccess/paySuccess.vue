<template>
  <view class="success-container">
    <view class="success-content">
      <view class="success-card">
        <view class="success-icon">
          <uni-icons
            type="checkmarkempty"
            size="40"
            color="#fff"
          />
        </view>
        <text class="success-title">
          支付成功
        </text>
        <text class="success-message">
          您的VIP会员已开通，感谢您的支持！
        </text>
        <view class="action-buttons">
          <button
            class="btn-primary"
            @click="goToHome"
          >
            返回首页
          </button>
          <button
            class="btn-outline"
            @click="goToVipPage"
          >
            查看会员权益
          </button>
        </view>
      </view>

      <view class="order-summary">
        <view class="summary-title">
          <uni-icons
            type="file-filled"
            size="18"
            color="#6a5acd"
          />
          <text class="title-text">
            订单信息
          </text>
        </view>
        <view class="order-detail">
          <text class="detail-label">
            订单编号
          </text>
          <text class="detail-value">
            {{ orderInfo.orderNo }}
          </text>
        </view>
        <view class="order-detail">
          <text class="detail-label">
            商品名称
          </text>
          <text class="detail-value">
            {{ orderInfo.productName }}
          </text>
        </view>
        <view class="order-detail">
          <text class="detail-label">
            支付金额
          </text>
          <text class="detail-value price">
            ¥{{ orderInfo.price.toFixed(2) }}
          </text>
        </view>
        <view class="order-detail">
          <text class="detail-label">
            支付方式
          </text>
          <text class="detail-value">
            {{ orderInfo.paymentMethod }}
          </text>
        </view>
        <view class="order-detail">
          <text class="detail-label">
            支付时间
          </text>
          <text class="detail-value">
            {{ orderInfo.paymentTime }}
          </text>
        </view>
      </view>

      <view class="benefits">
        <view class="benefits-title">
          <uni-icons
            type="gift-filled"
            size="18"
            color="#6a5acd"
          />
          <text class="title-text">
            您已获得的会员权益
          </text>
        </view>
        <view class="benefit-item">
          <view class="benefit-icon">
            <uni-icons
              type="reload"
              size="20"
              color="#6a5acd"
            />
          </view>
          <view class="benefit-text">
            <text class="benefit-title">
              无限次转换
            </text>
            <text class="benefit-desc">
              30天内不限次数使用文档转换服务
            </text>
          </view>
        </view>
        <view class="benefit-item">
          <view class="benefit-icon">
            <uni-icons
              type="download-filled"
              size="20"
              color="#6a5acd"
            />
          </view>
          <view class="benefit-text">
            <text class="benefit-title">
              优先转换
            </text>
            <text class="benefit-desc">
              文档转换任务优先处理，速度提升50%
            </text>
          </view>
        </view>
        <view class="benefit-item">
          <view class="benefit-icon">
            <uni-icons
              type="paperplane-filled"
              size="20"
              color="#6a5acd"
            />
          </view>
          <view class="benefit-text">
            <text class="benefit-title">
              批量处理
            </text>
            <text class="benefit-desc">
              支持多个文档同时批量转换
            </text>
          </view>
        </view>
        <view class="benefit-item">
          <view class="benefit-icon">
            <uni-icons
              type="star-filled"
              size="20"
              color="#6a5acd"
            />
          </view>
          <view class="benefit-text">
            <text class="benefit-title">
              格式指南
            </text>
            <text class="benefit-desc">
              所有转换记录永久保存，随时下载
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const formatCurrentTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const orderInfo = ref({
  orderNo: 'DOC20230615001',
  productName: '文档转换服务 - VIP月度会员',
  price: 29.00,
  paymentMethod: '微信支付',
  paymentTime: formatCurrentTime()
})

const goToHome = () => {
  uni.switchTab({
    url: '/pages/index/index'
  })
}

const goToVipPage = () => {
  uni.navigateTo({
    url: '/pages/member/member'
  })
}
</script>

<style lang="scss" scoped>
@import "./paySuccess.scss";
</style>
