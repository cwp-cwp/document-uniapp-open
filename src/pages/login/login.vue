<template>
  <view class="login-container">
    <!-- 顶部背景 -->
    <view class="login-header">
      <image
        class="login-bg"
        src="/static/images/login-bg.png"
        mode="aspectFill"
      />
      <view class="login-logo">
        <image
          src="/static/images/logo.png"
          mode="aspectFit"
        />
        <text class="app-name">
          文档转换助手
        </text>
      </view>
    </view>

    <!-- 登录表单 -->
    <view class="login-form">
      <!-- 登录方式切换 -->
      <view class="login-tabs">
        <view
          class="tab-item"
          :class="{ active: loginType === 'password' }"
          @click="loginType = 'password'"
        >
          密码登录
        </view>
        <view
          class="tab-item"
          :class="{ active: loginType === 'code' }"
          @click="loginType = 'code'"
        >
          验证码登录
        </view>
      </view>

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

      <!-- 密码登录 -->
      <view
        v-if="loginType === 'password'"
        class="input-group"
      >
        <uni-icons
          type="locked-filled"
          size="20"
          color="#6a5acd"
        />
        <input
          v-model="form.password"
          :type="showPassword ? 'text' : 'safe-password'"
          placeholder="请输入密码"
          class="input-field"
          :password="!showPassword"
        >
        <view
          class="eye-btn"
          @click="showPassword = !showPassword"
        >
          <uni-icons
            :type="showPassword ? 'eye-filled' : 'eye-slash-filled'"
            size="20"
            color="#999"
          />
        </view>
      </view>

      <!-- 验证码登录 -->
      <view
        v-if="loginType === 'code'"
        class="input-group"
      >
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

      <!-- 登录按钮 -->
      <button
        class="login-btn"
        @click="handleLogin"
      >
        登录
      </button>

      <!-- 微信登录 -->
      <view class="wechat-login">
        <view class="divider">
          <view class="line" />
          <text>或</text>
          <view class="line" />
        </view>
        <button
          class="wechat-btn"
          :class="{ 'btn-disabled': !agreePolicy }"
          open-type="getPhoneNumber"
          :disabled="!agreePolicy"
          @getphonenumber="handleGetPhoneNumber"
        >
          <uni-icons
            type="phone-filled"
            size="24"
            color="#fff"
          />
          <text>手机号快捷登录</text>
        </button>
      </view>

      <!-- 协议 -->
      <view
        class="agreement"
        :class="{ shake: isShaking }"
      >
        <checkbox
          :checked="agreePolicy"
          color="#6a5acd"
          style="transform: scale(0.7);"
          @click="agreePolicy = !agreePolicy"
        />
        <text class="agreement-text">
          登录即表示同意
          <text
            class="link"
            @click="goToUserAgreement"
          >
            《用户协议》
          </text>
          和
          <text
            class="link"
            @click="goToPrivacyPolicy"
          >
            《隐私政策》
          </text>
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import httpRequest from '@/utils/httpRequest'
import { LOGIN_BY_CODE_URL, LOGIN_BY_PASS_URL, SEND_CODE_URL, WX_LOGIN_URL } from '@/utils/url'

// 登录方式：password-密码登录，code-验证码登录
const loginType = ref('password')
// 是否显示密码
const showPassword = ref(false)
// 是否同意协议
const agreePolicy = ref(false) // 修改为默认不勾选
// 验证码倒计时
const counting = ref(false)
const countdown = ref(60)
const codeText = ref('获取验证码')
// 是否正在抖动
const isShaking = ref(false)

// 表单数据
const form = reactive({
  phone: '',
  password: '',
  code: ''
})

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
        title: '验证码发送失败',
        icon: 'error'
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

// 处理登录
const handleLogin = () => {
  // 验证表单
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

  if (loginType.value === 'password' && !form.password) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    })
    return
  }

  if (loginType.value === 'code' && !form.code) {
    uni.showToast({
      title: '请输入验证码',
      icon: 'none'
    })
    return
  }

  if (!agreePolicy.value) {
    // 添加抖动效果
    isShaking.value = true
    setTimeout(() => {
      isShaking.value = false
    }, 600) // 动画持续时间

    uni.showToast({
      title: '请同意用户协议和隐私政策',
      icon: 'none'
    })
    return
  }

  // 显示加载
  uni.showLoading({
    title: '登录中...'
  })

  // 根据登录方式调用不同接口
  const loginUrl = loginType.value === 'password' ? LOGIN_BY_PASS_URL : LOGIN_BY_CODE_URL

  const loginData = loginType.value === 'password' ? { phone: form.phone, password: form.password } : { phone: form.phone, code: form.code }

  // 发送登录请求
  httpRequest.post(loginUrl, loginData)
    .then(res => {
      // 隐藏加载
      uni.hideLoading()

      if (res.code === 200 && res.data) {
        // 保存token和用户信息
        uni.setStorageSync('token', res.data.token)
        uni.setStorageSync('userInfo', res.data.userInfo)

        // 显示登录成功提示
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })

        // 延迟跳转到首页
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/index/index'
          })
        }, 1500)
      } else {
        uni.showToast({
          title: res.msg || '登录失败',
          icon: 'none'
        })
      }
    })
    .catch(err => {
      uni.hideLoading()
      console.error('登录失败', err)
    })
}

// 处理获取手机号
const handleGetPhoneNumber = (e) => {
  if (!agreePolicy.value) {
    // 添加抖动效果
    isShaking.value = true
    setTimeout(() => {
      isShaking.value = false
    }, 600) // 动画持续时间

    uni.showToast({
      title: '请同意用户协议和隐私政策',
      icon: 'none'
    })
    return
  }

  // 显示加载
  uni.showLoading({
    title: '登录中...'
  })

  // 判断用户是否允许获取手机号
  if (e.detail.errMsg === 'getPhoneNumber:ok') {
    // 获取到手机号的code
    const phoneCode = e.detail.code // 新版本微信小程序直接返回code

    // 先获取登录code
    uni.login({
      provider: 'weixin',
      success: (loginRes) => {
        if (loginRes.code) {
          // 调用微信登录接口，同时发送登录code和手机号code
          httpRequest.post(WX_LOGIN_URL, {
            code: loginRes.code,
            phoneCode
          }).then(res => {
            uni.hideLoading()

            if (res.code === 200 && res.data) {
              // 保存token和用户信息
              uni.setStorageSync('token', res.data.token)
              uni.setStorageSync('userInfo', res.data.userInfo)

              // 显示登录成功提示
              uni.showToast({
                title: '登录成功',
                icon: 'success'
              })

              // 延迟跳转到首页
              setTimeout(() => {
                uni.switchTab({
                  url: '/pages/index/index'
                })
              }, 1500)
            } else {
              uni.showToast({
                title: res.msg || '微信登录失败',
                icon: 'none'
              })
            }
          }).catch(err => {
            uni.hideLoading()
            console.error('微信登录失败', err)
          })
        } else {
          uni.hideLoading()
          uni.showToast({
            title: '微信登录失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        uni.hideLoading()
        console.error('微信登录失败', err)
        uni.showToast({
          title: '微信登录失败',
          icon: 'none'
        })
      }
    })
  } else {
    // 用户拒绝授权手机号，尝试普通微信登录
    uni.hideLoading()
    handleWechatLoginWithoutPhone()
  }
}

// 不带手机号的微信登录
const handleWechatLoginWithoutPhone = () => {
  // 显示加载
  uni.showLoading({
    title: '登录中...'
  })

  // 调用微信登录获取code
  uni.login({
    provider: 'weixin',
    success: (loginRes) => {
      if (loginRes.code) {
        // 发送登录请求，只包含code
        httpRequest.post(WX_LOGIN_URL, {
          code: loginRes.code
        }).then(res => {
          uni.hideLoading()

          if (res.code === 200 && res.data) {
            // 保存token和用户信息
            uni.setStorageSync('token', res.data.token)
            uni.setStorageSync('userInfo', res.data.userInfo)

            // 显示登录成功提示
            uni.showToast({
              title: '登录成功',
              icon: 'success'
            })

            // 延迟跳转到首页
            setTimeout(() => {
              uni.switchTab({
                url: '/pages/index/index'
              })
            }, 1500)
          } else {
            uni.showToast({
              title: res.msg || '微信登录失败',
              icon: 'none'
            })
          }
        }).catch(err => {
          uni.hideLoading()
          console.error('微信登录失败', err)
        })
      } else {
        uni.hideLoading()
        uni.showToast({
          title: '微信登录失败',
          icon: 'none'
        })
      }
    },
    fail: (err) => {
      uni.hideLoading()
      console.error('微信登录失败', err)
      uni.showToast({
        title: '微信登录失败',
        icon: 'none'
      })
    }
  })
}

// 跳转到用户协议页面
const goToUserAgreement = () => {
  uni.navigateTo({
    url: '/pages/agreement/agreement'
  })
}

// 跳转到隐私政策页面
const goToPrivacyPolicy = () => {
  uni.navigateTo({
    url: '/pages/privacy/privacy'
  })
}
</script>

<style lang="scss" scoped>
@import "./login.scss";
</style>
