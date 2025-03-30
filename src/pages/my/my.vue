<template>
  <view class="my-container">
    <view class="header">
      <view class="user-info">
        <view
          class="avatar-container"
          @click="userInfo.isLogin && showAvatarActionSheet()"
        >
          <image
            class="avatar"
            :src="userInfo.isLogin && userInfo.avatar ? `${FILE_DOMAIN}${userInfo.avatar}` : '/static/images/default-avatar.png'"
            mode="aspectFill"
          />
          <view
            v-if="userInfo.isVip && !isVipExpired"
            class="vip-badge"
          >
            <uni-icons
              type="vip-filled"
              size="16"
              color="#FFD700"
            />
          </view>
          <!-- 添加编辑提示 -->
          <view
            v-if="userInfo.isLogin"
            class="edit-hint"
          >
            <uni-icons
              type="camera"
              size="14"
              color="#fff"
            />
          </view>
        </view>
        <view class="user-details">
          <view
            class="user-name-row"
            @click="userInfo.isLogin && showNicknameModal()"
          >
            <text class="user-name">
              {{ userInfo.nickName || '游客' }}
            </text>
            <view
              v-if="userInfo.isVip && !isVipExpired"
              class="user-tag"
            >
              <text>VIP会员</text>
            </view>
            <!-- 添加编辑图标 -->
            <view
              v-if="userInfo.isLogin"
              class="edit-name-icon"
            >
              <uni-icons
                type="compose"
                size="14"
                color="rgba(255,255,255,0.8)"
              />
            </view>
          </view>
          <text
            v-if="userInfo.userId"
            class="user-id"
          >
            ID: {{ userInfo.userId }}
          </text>
          <view
            v-if="!userInfo.isLogin"
            class="login-btn"
            @click="login"
          >
            <text>点击登录</text>
          </view>
          <text
            v-if="userInfo.isVip"
            class="vip-expiry"
          >
            有效期至: {{ userInfo.vipExpiry }}
          </text>
        </view>
      </view>
    </view>

    <view class="stats-section">
      <view class="stat-card">
        <text class="stat-value">
          {{ stats.conversions }}
        </text>
        <text class="stat-label">
          转换次数
        </text>
      </view>
      <view class="stat-card">
        <text class="stat-value">
          {{ stats.savedFiles }}
        </text>
        <text class="stat-label">
          文件数量
        </text>
      </view>
      <view class="stat-card">
        <text class="stat-value">
          {{ stats.totalSize }}
        </text>
        <text class="stat-label">
          总空间
        </text>
      </view>
    </view>

    <view
      v-if="!userInfo.isVip || isVipExpired"
      class="vip-banner"
      @click="goToVipPage"
    >
      <view class="vip-content">
        <view class="vip-icon">
          <uni-icons
            type="vip-filled"
            size="24"
            color="#FFD700"
          />
        </view>
        <view class="vip-text">
          <text class="vip-title">
            开通VIP会员
          </text>
          <text class="vip-subtitle">
            不限次数转换，享受更多特权
          </text>
        </view>
      </view>
      <view class="vip-button">
        <text>立即开通</text>
        <uni-icons
          type="right"
          size="16"
          color="#6a5acd"
        />
      </view>
    </view>

    <view class="menu-section">
      <view class="menu-group">
        <view class="menu-title">
          <text>功能与服务</text>
        </view>
        <view
          class="menu-item"
          @click="goToHistory"
        >
          <view class="menu-icon">
            <uni-icons
              type="calendar"
              size="20"
              color="#6a5acd"
            />
          </view>
          <view class="menu-content">
            <text class="menu-label">
              历史记录
            </text>
          </view>
          <uni-icons
            type="right"
            size="16"
            color="#ccc"
          />
        </view>
        <view
          class="menu-item"
          @click="goToFormatGuide"
        >
          <view class="menu-icon">
            <uni-icons
              type="help-filled"
              size="20"
              color="#6a5acd"
            />
          </view>
          <view class="menu-content">
            <text class="menu-label">
              格式指南
            </text>
          </view>
          <uni-icons
            type="right"
            size="16"
            color="#ccc"
          />
        </view>
        <view
          class="menu-item"
          @click="goToBatchConversion"
        >
          <view class="menu-icon">
            <uni-icons
              type="upload-filled"
              size="20"
              color="#6a5acd"
            />
          </view>
          <view class="menu-content">
            <text class="menu-label">
              批量转换
            </text>
            <view
              v-if="!userInfo.isVip || isVipExpired"
              class="menu-tag"
            >
              <text>VIP</text>
            </view>
          </view>
          <uni-icons
            type="right"
            size="16"
            color="#ccc"
          />
        </view>
      </view>

      <view class="menu-group">
        <view class="menu-title">
          <text>设置与帮助</text>
        </view>
        <view
          class="menu-item"
          @click="goToFeedback"
        >
          <view class="menu-icon">
            <uni-icons
              type="chat"
              size="20"
              color="#6a5acd"
            />
          </view>
          <view class="menu-content">
            <text class="menu-label">
              意见反馈
            </text>
          </view>
          <uni-icons
            type="right"
            size="16"
            color="#ccc"
          />
        </view>
        <view
          class="menu-item"
          @click="goToAbout"
        >
          <view class="menu-icon">
            <uni-icons
              type="info-filled"
              size="20"
              color="#6a5acd"
            />
          </view>
          <view class="menu-content">
            <text class="menu-label">
              关于我们
            </text>
          </view>
          <uni-icons
            type="right"
            size="16"
            color="#ccc"
          />
        </view>
        <view
          class="menu-item"
          @click="goToSettings"
        >
          <view class="menu-icon">
            <uni-icons
              type="gear-filled"
              size="20"
              color="#6a5acd"
            />
          </view>
          <view class="menu-content">
            <text class="menu-label">
              设置
            </text>
          </view>
          <uni-icons
            type="right"
            size="16"
            color="#ccc"
          />
        </view>
      </view>
    </view>

    <view
      v-if="userInfo.isLogin"
      class="logout-section"
    >
      <button
        class="logout-btn"
        @click="logout"
      >
        退出登录
      </button>
    </view>

    <view class="version-info">
      <text>当前版本: v1.0.0</text>
    </view>
  </view>

  <!-- 添加昵称修改弹窗 -->
  <uni-popup
    ref="nicknamePopup"
    type="center"
  >
    <view class="nickname-popup">
      <view class="popup-header">
        <text class="popup-title">
          修改昵称
        </text>
        <uni-icons
          type="close"
          size="20"
          color="#333"
          @click="closeNicknameModal"
        />
      </view>
      <view class="popup-body">
        <input
          v-model="newNickname"
          class="nickname-input"
          placeholder="请输入新昵称"
          maxlength="20"
        >
      </view>
      <view class="popup-footer">
        <button
          class="popup-btn btn-cancel"
          @click="closeNicknameModal"
        >
          取消
        </button>
        <button
          class="popup-btn btn-confirm"
          @click="confirmNickname"
        >
          确定
        </button>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import http from '@/utils/httpRequest'
import {
  USER_STATS_URL,
  UPDATE_AVATAR_URL,
  UPDATE_NICKNAME_URL,
  UPLOAD_FILE_URL,
  FILE_DOMAIN
} from '@/utils/url'

// 弹窗引用
const nicknamePopup = ref(null)
const newNickname = ref('')

// 初始化用户信息为空状态
const userInfo = ref({
  nickName: '',
  avatar: '',
  userId: '',
  isLogin: false,
  isVip: false,
  vipExpiry: ''
})

// 计算会员是否已过期
const isVipExpired = computed(() => {
  if (!userInfo.value.isVip || !userInfo.value.vipExpiry) {
    return true
  }

  const now = new Date()
  const expiryDate = new Date(userInfo.value.vipExpiry)
  return now > expiryDate
})

const stats = ref({
  conversions: 0,
  savedFiles: 0,
  totalSize: '0MB'
})

// 每次页面显示时都检查登录状态
onShow(() => {
  checkLoginStatus()
})

onShareAppMessage(() => {
  return {
    title: '小程序分享'
  }
})

onShareTimeline(() => {
  return {}
})

// 检查登录状态
const checkLoginStatus = () => {
  try {
    // 从缓存中获取token
    const token = uni.getStorageSync('token')

    // 如果有token，则通过接口获取用户信息
    if (token) {
      // 显示加载
      uni.showLoading({
        title: '加载中...'
      })

      // 从后台接口获取用户信息
      http.get(USER_INFO_URL)
        .then(res => {
          if (res.code === 200 && res.data) {
            // 更新用户信息
            const userData = res.data
            userInfo.value = {
              nickName: userData.nickName || '',
              avatar: userData.avatar || '',
              userId: userData.id ? userData.id.toString().substring(10) : '',
              isLogin: true,
              isVip: userData.isVip || false,
              vipExpiry: userData.vipExpiry ? formatDate(new Date(userData.vipExpiry)) : ''
            }

            // 获取用户统计数据
            getUserStats()
          } else {
            // 接口返回错误，可能是token失效
            resetUserInfo()
            // 清除本地存储的token
            uni.removeStorageSync('token')
          }
        })
        .catch(err => {
          console.error('获取用户信息失败', err)
          resetUserInfo()
          // 清除本地存储的token
          uni.removeStorageSync('token')
        })
        .finally(() => {
          uni.hideLoading()
        })
    } else {
      // 没有token，重置用户状态
      resetUserInfo()
    }
  } catch (e) {
    console.error('检查登录状态失败', e)
    resetUserInfo()
  }
}

// 格式化日期为 YYYY-MM-DD 格式
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 重置用户信息
const resetUserInfo = () => {
  userInfo.value = {
    nickName: '',
    avatar: '',
    userId: '',
    isLogin: false,
    isVip: false,
    vipExpiry: ''
  }

  stats.value = {
    conversions: 0,
    savedFiles: 0,
    totalSize: '0MB'
  }
}

// 获取用户统计数据
const getUserStats = () => {
  if (userInfo.value.isLogin) {
    http.get(USER_STATS_URL)
      .then(res => {
        if (res.code === 200 && res.data) {
          stats.value = res.data
        }
      })
      .catch(err => {
        console.error('获取用户统计数据失败', err)
      })
  }
}

// 显示头像操作菜单
const showAvatarActionSheet = () => {
  uni.showActionSheet({
    itemList: ['从相册选择', '拍照'],
    success: (res) => {
      switch (res.tapIndex) {
        case 0:
          chooseFromAlbum()
          break
        case 1:
          takePhoto()
          break
      }
    }
  })
}

// 从相册选择
const chooseFromAlbum = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      // 上传图片到服务器
      uploadAvatar(tempFilePath)
    }
  })
}

// 拍照
const takePhoto = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      // 上传图片到服务器
      uploadAvatar(tempFilePath)
    }
  })
}

// 上传头像
const uploadAvatar = (filePath) => {
  uni.showLoading({
    title: '上传中...'
  })

  // 使用封装的上传文件方法
  http.uploadFile({
    url: UPLOAD_FILE_URL,
    filePath,
    name: 'file'
  })
    .then(data => {
      if (data.code === 200) {
        // 文件上传成功，获取文件路径
        const avatarUrl = data.data

        // 调用修改头像接口
        updateUserAvatar(avatarUrl)
      } else {
        uni.showToast({
          title: data.msg || '上传失败',
          icon: 'none'
        })
      }
    })
    .catch(() => {
      uni.showToast({
        title: '上传失败',
        icon: 'none'
      })
    })
    .finally(() => {
      uni.hideLoading()
    })
}

// 更新用户头像
const updateUserAvatar = (avatarUrl) => {
  http.post(UPDATE_AVATAR_URL, {
    avatar: avatarUrl
  })
    .then(res => {
      if (res.code === 200) {
        // 更新成功后重新获取用户信息
        checkLoginStatus()

        uni.showToast({
          title: '头像已更新',
          icon: 'success'
        })
      } else {
        uni.showToast({
          title: res.msg || '更新失败',
          icon: 'none'
        })
      }
    })
    .catch(() => {
      uni.showToast({
        title: '更新失败',
        icon: 'none'
      })
    })
}

// 显示昵称修改弹窗
const showNicknameModal = () => {
  // 设置初始值为当前昵称
  newNickname.value = userInfo.value.nickName || ''
  // 打开弹窗
  nicknamePopup.value.open()
}

// 关闭昵称修改弹窗
const closeNicknameModal = () => {
  nicknamePopup.value.close()
}

// 确认修改昵称
const confirmNickname = () => {
  if (newNickname.value.trim()) {
    // 调用修改昵称接口
    http.post(UPDATE_NICKNAME_URL, {
      nickName: newNickname.value.trim()
    })
      .then(res => {
        if (res.code === 200) {
          // 关闭弹窗
          closeNicknameModal()

          // 更新成功后重新获取用户信息
          checkLoginStatus()

          uni.showToast({
            title: '昵称已更新',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: res.msg || '更新失败',
            icon: 'none'
          })
        }
      })
      .catch(() => {
        uni.showToast({
          title: '更新失败',
          icon: 'none'
        })
      })
  } else {
    uni.showToast({
      title: '昵称不能为空',
      icon: 'none'
    })
  }
}

// 跳转到登录页面
const login = () => {
  uni.navigateTo({
    url: '/pages/login/login'
  })
}

// 退出登录
const logout = () => {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清除本地存储的token
        uni.removeStorageSync('token')

        // 重置用户状态
        resetUserInfo()

        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        })
      }
    }
  })
}

// 其他函数保持不变
const goToVipPage = () => {
  if (!userInfo.value.isLogin) {
    // 未登录时先跳转到登录页
    login()
    return
  }

  uni.navigateTo({
    url: '/pages/member/member'
  })
}

const goToHistory = () => {
  if (!userInfo.value.isLogin) {
    // 未登录时先跳转到登录页
    login()
    return
  }

  uni.switchTab({
    url: '/pages/history/history'
  })
}

const goToFormatGuide = () => {
  uni.navigateTo({
    url: '/pages/guide/guide'
  })
}

const goToBatchConversion = () => {
  if (!userInfo.value.isLogin) {
    // 未登录时先跳转到登录页
    login()
    return
  }

  if (!userInfo.value.isVip || isVipExpired.value) {
    uni.showModal({
      title: 'VIP功能',
      content: '批量转换为VIP专享功能，是否立即开通VIP？',
      confirmText: '立即开通',
      success: (res) => {
        if (res.confirm) {
          goToVipPage()
        }
      }
    })
    return
  }

  uni.navigateTo({
    url: '/pages/batch/batch'
  })
}

const goToFeedback = () => {
  if (!userInfo.value.isLogin) {
    // 未登录时先跳转到登录页
    login()
    return
  }

  uni.navigateTo({
    url: '/pages/feedback/feedback'
  })
}

const goToAbout = () => {
  uni.navigateTo({
    url: '/pages/about/about'
  })
}

const goToSettings = () => {
  uni.navigateTo({
    url: '/pages/settings/settings'
  })
}
</script>

<style lang="scss" scoped>
@import "./my.scss";
</style>
