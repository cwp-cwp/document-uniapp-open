<template>
  <view class="page-container">
    <view class="header">
      <view class="title">
        修改密码
      </view>
      <view class="subtitle">
        为了保障您的账号安全，请定期修改密码
      </view>
    </view>

    <view class="form-container">
      <!-- 原密码 -->
      <view class="input-group">
        <uni-icons
          type="locked-filled"
          size="20"
          color="#6a5acd"
        />
        <input
          v-model="form.oldPassword"
          :type="showOldPassword ? 'text' : 'safe-password'"
          placeholder="请输入原密码"
          class="input-field"
          :password="!showOldPassword"
        >
        <view
          class="eye-btn"
          @click="showOldPassword = !showOldPassword"
        >
          <uni-icons
            :type="showOldPassword ? 'eye-filled' : 'eye-slash-filled'"
            size="20"
            color="#999"
          />
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
        @click="handleChangePassword"
      >
        确认修改
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import httpRequest from '@/utils/httpRequest'
import { CHANGE_PASSWORD_URL } from '@/utils/url'

// 表单数据
const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码显示控制
const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// 修改密码处理
const handleChangePassword = () => {
  // 表单验证
  if (!form.oldPassword) {
    uni.showToast({
      title: '请输入原密码',
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

  if (form.oldPassword === form.newPassword) {
    uni.showToast({
      title: '新密码不能与原密码相同',
      icon: 'none'
    })
    return
  }

  // 显示加载
  uni.showLoading({
    title: '提交中...'
  })

  // 发送修改密码请求
  httpRequest.post(CHANGE_PASSWORD_URL, {
    oldPassword: form.oldPassword,
    newPassword: form.newPassword
  }).then(res => {
    uni.hideLoading()

    if (res.code === 200) {
      uni.showToast({
        title: '密码修改成功',
        icon: 'success'
      })

      // 延迟返回上一页
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({
        title: res.msg || '修改失败',
        icon: 'none'
      })
    }
  }).catch(err => {
    uni.hideLoading()
    console.error('修改密码失败', err)
  })
}
</script>

<style lang="scss" scoped>
@import "./change-password.scss";
</style>
