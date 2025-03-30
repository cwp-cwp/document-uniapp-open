<template>
  <view class="member-container">
    <view class="member-content">
      <view class="vip-card">
        <view class="vip-header">
          <view class="vip-title-area">
            <uni-icons
              type="vip-filled"
              size="24"
              color="#FFD700"
            />
            <text class="vip-title">
              文档转换VIP
            </text>
          </view>
          <view
            v-if="isVip"
            class="user-status"
          >
            <text class="status-text">
              已开通
            </text>
            <text class="expiry-date">
              有效期至: {{ expiryDate }}
            </text>
          </view>
          <view
            v-else
            class="user-status"
          >
            <text class="status-text not-vip">
              未开通
            </text>
          </view>
        </view>
        <view class="benefits-list">
          <view class="benefit-item">
            <view class="benefit-icon">
              <uni-icons
                type="checkbox-filled"
                size="18"
                color="#6a5acd"
              />
            </view>
            <text class="benefit-text">
              不限次数文档转换
            </text>
          </view>
          <view class="benefit-item">
            <view class="benefit-icon">
              <uni-icons
                type="checkbox-filled"
                size="18"
                color="#6a5acd"
              />
            </view>
            <text class="benefit-text">
              转换速度提升50%
            </text>
          </view>
          <view class="benefit-item">
            <view class="benefit-icon">
              <uni-icons
                type="checkbox-filled"
                size="18"
                color="#6a5acd"
              />
            </view>
            <text class="benefit-text">
              支持15MB以上大文件
            </text>
          </view>
          <view class="benefit-item">
            <view class="benefit-icon">
              <uni-icons
                type="checkbox-filled"
                size="18"
                color="#6a5acd"
              />
            </view>
            <text class="benefit-text">
              支持批量转换
            </text>
          </view>
          <view class="benefit-item">
            <view class="benefit-icon">
              <uni-icons
                type="checkbox-filled"
                size="18"
                color="#6a5acd"
              />
            </view>
            <text class="benefit-text">
              享受更多优惠
            </text>
          </view>
        </view>
      </view>

      <view class="plans-section">
        <text class="section-title">
          选择套餐
        </text>
        <view class="plans-container">
          <view
            class="plan-card"
            :class="{ 'plan-selected': selectedPlan === 'month' }"
            @click="selectPlan('month')"
          >
            <view
              v-if="selectedPlan === 'month'"
              class="plan-badge"
            >
              <text>已选</text>
            </view>
            <text class="plan-name">
              月度会员
            </text>
            <text class="plan-price">
              ¥29.00
            </text>
            <text class="plan-unit">
              每月
            </text>
          </view>
          <view
            class="plan-card"
            :class="{ 'plan-selected': selectedPlan === 'quarter' }"
            @click="selectPlan('quarter')"
          >
            <view
              v-if="selectedPlan === 'quarter'"
              class="plan-badge"
            >
              <text>已选</text>
            </view>
            <text class="plan-name">
              季度会员
            </text>
            <text class="plan-price">
              ¥69.00
            </text>
            <text class="plan-unit">
              每季度
            </text>
            <text class="plan-save">
              省¥18
            </text>
          </view>
          <view
            class="plan-card"
            :class="{ 'plan-selected': selectedPlan === 'year' }"
            @click="selectPlan('year')"
          >
            <view
              v-if="selectedPlan === 'year'"
              class="plan-badge hot"
            >
              <text>已选</text>
            </view>
            <view
              v-else
              class="plan-badge hot"
            >
              <text>热门</text>
            </view>
            <text class="plan-name">
              年度会员
            </text>
            <text class="plan-price">
              ¥199.00
            </text>
            <text class="plan-unit">
              每年
            </text>
            <text class="plan-save">
              省¥149
            </text>
          </view>
        </view>
      </view>

      <view class="payment-methods">
        <text class="section-title">
          支付方式
        </text>
        <view class="payment-list">
          <view
            class="payment-item payment-selected"
          >
            <view class="payment-info">
              <view class="payment-icon wechat">
                <uni-icons
                  type="weixin"
                  size="24"
                  color="#09BB07"
                />
              </view>
              <text class="payment-name">
                微信支付
              </text>
            </view>
            <view class="payment-check">
              <uni-icons
                type="checkbox-filled"
                size="20"
                color="#6a5acd"
              />
            </view>
          </view>
        </view>
      </view>

      <view class="agreement-section">
        <view
          class="agreement-check"
          @click="toggleAgreement"
        >
          <uni-icons
            v-if="agreedToTerms"
            type="checkbox-filled"
            size="20"
            color="#6a5acd"
          />
          <uni-icons
            v-else
            type="checkbox"
            size="20"
            color="#cccccc"
          />
        </view>
        <text class="agreement-text">
          同意<text class="agreement-link">
            《会员服务协议》
          </text>
        </text>
      </view>

      <view class="action-buttons">
        <button
          v-if="isVip"
          class="btn-pay disabled"
          disabled
        >
          已是会员 ({{ expiryDate }} 到期)
        </button>
        <button
          v-else
          class="btn-pay"
          :disabled="!canProceed"
          @click="proceedToPayment"
        >
          立即开通 ¥{{ getSelectedPlanPrice() }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import httpRequest from '@/utils/httpRequest'
import { USER_INFO_URL } from '@/utils/url'

const isVip = ref(false)
const selectedPlan = ref('month')
const agreedToTerms = ref(false)
const userInfo = ref(null)
const expiryDate = ref('')

// 页面加载时获取用户信息
onLoad(() => {
  getUserInfo()
})

// 获取用户信息并检查会员状态
const getUserInfo = () => {
  // 显示加载
  uni.showLoading({
    title: '加载中...'
  })

  // 从后台接口获取用户信息
  httpRequest.get(USER_INFO_URL)
    .then(res => {
      if (res.code === 200 && res.data) {
        userInfo.value = res.data

        // 检查用户是否是会员
        if (userInfo.value.vipExpiry) {
          const expireTime = new Date(userInfo.value.vipExpiry)
          const now = new Date()

          // 如果过期时间大于当前时间，则用户是会员
          if (expireTime > now) {
            isVip.value = true
            // 格式化过期时间为 YYYY-MM-DD 格式
            expiryDate.value = formatDate(expireTime)
          }
        }
      } else {
        uni.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        })
      }
    })
    .catch(err => {
      console.error('获取用户信息失败', err)
      uni.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      })
    })
    .finally(() => {
      uni.hideLoading()
    })
}

// 格式化日期为 YYYY-MM-DD 格式
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const plans = {
  month: {
    price: 29.00,
    name: '月度会员'
  },
  quarter: {
    price: 69.00,
    name: '季度会员'
  },
  year: {
    price: 199.00,
    name: '年度会员'
  }
}

const canProceed = computed(() => {
  return selectedPlan.value && agreedToTerms.value
})

const selectPlan = (plan) => {
  selectedPlan.value = plan
}

const toggleAgreement = () => {
  agreedToTerms.value = !agreedToTerms.value
}

const getSelectedPlanPrice = () => {
  return plans[selectedPlan.value].price.toFixed(2)
}

const proceedToPayment = () => {
  if (!canProceed.value) return

  // 先校验用户是否登录
  checkUserLogin().then(isLoggedIn => {
    if (isLoggedIn) {
      // 用户已登录，跳转到支付页面
      uni.navigateTo({
        url: `/pages/pay/pay?plan=${selectedPlan.value}&price=${getSelectedPlanPrice()}`
      })
    } else {
      // 用户未登录，提示并跳转到登录页
      uni.showModal({
        title: '提示',
        content: '请先登录后再开通会员',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: '/pages/login/login'
            })
          }
        }
      })
    }
  })
}

// 添加检查用户登录状态的方法
const checkUserLogin = () => {
  return new Promise((resolve) => {
    // 显示加载
    uni.showLoading({
      title: '加载中...'
    })

    // 请求接口获取用户信息
    httpRequest.get(USER_INFO_URL)
      .then(res => {
        if (res.code === 200 && res.data) {
          // 更新用户信息
          userInfo.value = res.data

          // 更新会员状态
          if (userInfo.value.vipExpiry) {
            const expireTime = new Date(userInfo.value.vipExpiry)
            const now = new Date()

            if (expireTime > now) {
              isVip.value = true
              expiryDate.value = formatDate(expireTime)
            } else {
              isVip.value = false
            }
          }

          // 用户已登录
          resolve(true)
        } else {
          // 获取用户信息失败，视为未登录
          resolve(false)
        }
      })
      .catch(err => {
        console.error('获取用户信息失败', err)
        // 发生错误，视为未登录
        resolve(false)
      })
      .finally(() => {
        uni.hideLoading()
      })
  })
}
</script>

<style lang="scss" scoped>
@import "./member.scss";
</style>
