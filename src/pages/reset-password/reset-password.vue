<template>
  <view class="page-container">
    <view class="header">
      <view class="title">
        重置密码
      </view>
      <view class="subtitle">
        通过手机验证码重置您的账号密码
      </view>
    </view>

    <view class="form-container">
      <!-- 手机号输入 -->
      <view class="input-group">
        <uni-icons
          type="phone-filled"
          size="20"
          color="#6a5acd"
        />
        <input
          v-model="form.phone"
          type="number"
          maxlength="11"
          placeholder="请输入手机号"
          class="input-field"
        >
        <view
          v-if="form.phone"
          class="clear-btn"
          @click="form.phone = ''"
        >
          <uni-icons
            type="clear"
            size="16"
            color="#999"
          />
        </view>
      </view>

      <!-- 验证码 -->
      <view class="input-group">
        <uni-icons
          type="compose"
          size="20"
          color="#6a5acd"
        />
        <input
          v-model="form.code"
          type="number"
          maxlength="6"
          placeholder="请输入验证码"
          class="input-field"
        >
        <view
          class="code-btn"
          :class="{ disabled: counting }"
          @click="getVerificationCode"
        >
          {{ codeText }}
        </view>
      </view>

      <!-- 新密码 -->
      <view class="input-group">
        <uni-icons
          type="locked-filled"
          size="20"
          color="#6a5acd"
        />
        <input
          v-model="form.newPassword"
          :type="showNewPassword ? 'text' : 'safe-password'"
          placeholder="请输入新密码"
          class="input-field"
          :password="!showNewPassword"
        >
        <view
          class="eye-btn"
          @click="showNewPassword = !showNewPassword"
        >
          <uni-icons
            :type="showNewPassword ? 'eye-filled' : 'eye-slash-filled'"
            size="20"
            color="#999"
          />
        </view>
      </view>

      <!-- 确认新密码 -->
      <view class="input-group">
        <uni-icons
          type="locked-filled"
          size="20"
          color="#6a5acd"
        />
        <input
          v-model="form.confirmPassword"
          :type="showConfirmPassword ? 'text' : 'safe-password'"
          placeholder="请确认新密码"
          class="input-field"
          :password="!showConfirmPassword"
        >
        <view
          class="eye-btn"
          @click="showConfirmPassword = !showConfirmPassword"
        >
          <uni-icons
            :type="showConfirmPassword ? 'eye-filled' : 'eye-slash-filled'"
            size="20"
            color="#999"
          />
        </view>
      </view>

      <!-- 密码规则提示 -->
      <view class="password-tips">
        <text>密码长度至少6位，建议包含字母、数字和特殊字符</text>
      </view>

      <!-- 提交按钮 -->
      <button
        class="submit-btn"
        @click="handleResetPassword"
      >
        重置密码
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import httpRequest from '@/utils/httpRequest'
import { RESET_PASSWORD_URL, SEND_CODE_URL } from '@/utils/url'

// 表单数据
const form = reactive({
  phone: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码显示控制
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// 验证码倒计时
const counting = ref(false)
const countdown = ref(60)
const codeText = ref('获取验证码')

// 获取验证码
const getVerificationCode = () => {
  // 验证手机号
  if (!form.phone) {
    uni.showToast({
      title: '请输入手机号',
      icon: 'none'
    })
    return
  }

  if (!/^1\d{10}$/.test(form.phone)) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    })
    return
  }

  // 如果正在倒计时，不处理
  if (counting.value) return

  // 发送验证码请求
  httpRequest.get(SEND_CODE_URL, {
    phone: form.phone
  }).then(res => {
    if (res.code === 200) {
      uni.showToast({
        title: '验证码已发送',
        icon: 'success'
      })
      // 开始倒计时
      startCountdown()
    } else {
      uni.showToast({
        title: res.msg || '验证码发送失败',
        icon: 'none'
      })
    }
  }).catch(err => {
    console.error('发送验证码失败', err)
  })
}

// 开始倒计时
const startCountdown = () => {
  counting.value = true
  countdown.value = 60
  codeText.value = `${countdown.value}秒`

  const timer = setInterval(() => {
    countdown.value--
    codeText.value = `${countdown.value}秒`

    if (countdown.value <= 0) {
      clearInterval(timer)
      counting.value = false
      codeText.value = '获取验证码'
    }
  }, 1000)
}

// 重置密码处理
const handleResetPassword = () => {
  // 表单验证
  if (!form.phone) {
    uni.showToast({
      title: '请输入手机号',
      icon: 'none'
    })
    return
  }

  if (!/^1\d{10}$/.test(form.phone)) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    })
    return
  }

  if (!form.code) {
    uni.showToast({
      title: '请输入验证码',
      icon: 'none'
    })
    return
  }

  if (!form.newPassword) {
    uni.showToast({
      title: '请输入新密码',
      icon: 'none'
    })
    return
  }

  if (form.newPassword.length < 6) {
    uni.showToast({
      title: '新密码长度不能少于6位',
      icon: 'none'
    })
    return
  }

  if (form.newPassword !== form.confirmPassword) {
    uni.showToast({
      title: '两次输入的新密码不一致',
      icon: 'none'
    })
    return
  }

  // 显示加载
  uni.showLoading({
    title: '提交中...'
  })

  // 发送重置密码请求
  httpRequest.post(RESET_PASSWORD_URL, {
    phone: form.phone,
    code: form.code,
    newPassword: form.newPassword
  }).then(res => {
    uni.hideLoading()

    if (res.code === 200) {
      uni.showToast({
        title: '密码重置成功',
        icon: 'success'
      })

      // 延迟跳转到登录页
      setTimeout(() => {
        uni.redirectTo({
          url: '/pages/login/login'
        })
      }, 1500)
    } else {
      uni.showToast({
        title: res.msg || '重置失败',
        icon: 'none'
      })
    }
  }).catch(err => {
    uni.hideLoading()
    console.error('重置密码失败', err)
  })
}
</script>

<style lang="scss" scoped>
@import "./reset-password.scss";
</style>
