<template>
  <view class="select-container">
    <!-- 头部 -->
    <view class="header">
      <view class="header__content">
        <text class="header__title">
          选择文件
        </text>
      </view>
    </view>

    <!-- 主内容区 -->
    <view class="upload-container">
      <!-- 上传区域 -->
      <view
        class="upload-area"
        @click="chooseFile"
      >
        <view class="upload-icon">
          <uni-icons
            type="cloud-upload"
            size="50"
            color="#6a5acd"
          />
        </view>
        <view class="upload-text">
          拖放文件到这里
        </view>
        <view class="upload-hint">
          支持PDF、Word格式
        </view>
      </view>

      <view class="divider">
        或
      </view>

      <button
        class="browse-btn"
        @click="chooseFile"
      >
        <uni-icons
          type="folder-add"
          size="30"
          color="#FFFFFF"
          class="icon"
        />
        浏览文件
      </button>

      <!-- 已选择文件（选择文件后显示） -->
      <view
        v-if="selectedFile"
        class="selected-file"
      >
        <view :class="['selected-file__icon', 'selected-file__icon--' + getFileType(selectedFile.name)]">
          <!-- 将uni-icons替换为image组件 -->
          <image
            :src="getFileIcon(selectedFile.name)"
            class="file-icon-img"
            mode="aspectFit"
          />
        </view>
        <view class="selected-file__details">
          <view class="selected-file__name">
            {{ selectedFile.name }}
          </view>
          <view class="selected-file__meta">
            {{ getFileType(selectedFile.name).toUpperCase() }} • {{ formatFileSize(selectedFile.size) }}
          </view>
        </view>
        <view
          class="selected-file__remove"
          @click="removeFile"
        >
          <uni-icons
            type="trash"
            size="18"
            color="#f44336"
          />
        </view>
      </view>

      <button
        class="next-btn"
        :disabled="!selectedFile"
        @click="goToNext"
      >
        <text style="color: white">
          下一步
        </text>
        <uni-icons
          type="arrow-right"
          size="16"
          color="#FFFFFF"
          class="icon"
        />
      </button>
    </view>

    <!-- 支持的格式信息 -->
    <view class="format-info">
      <view class="format-info__title">
        <uni-icons
          type="info"
          size="18"
          color="#6a5acd"
          class="icon"
        />
        支持的文件格式
      </view>
      <view class="format-info__list">
        <text class="format-info__badge">
          PDF
        </text>
        <text class="format-info__badge">
          DOC/DOCX
        </text>
      </view>
    </view>

    <!-- 文件大小限制提示 -->
    <view class="format-info">
      <view class="format-info__title">
        <uni-icons
          type="notification"
          size="18"
          color="#6a5acd"
          class="icon"
        />
        文件大小限制
      </view>
      <view class="format-info__text">
        免费用户：单个文件最大15MB，每日转换次数限制10次
        <view />
        VIP用户：单个文件最大30MB，无转换次数限制
      </view>
    </view>
    <view class="format-kong" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { UPLOAD_SINGLE_FILE_URL, USER_INFO_URL } from '@/utils/url.js'
import http from '@/utils/httpRequest.js'
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'

const selectedFile = ref(null)
const isUploading = ref(false)
const uploadedFileId = ref(null)
const uploadedFileInfo = ref(null) // 新增：存储上传后的完整文件信息
const userInfo = ref(null) // 新增：存储用户信息

onShareAppMessage(() => {
  return {
    title: '小程序分享'
  }
})

onShareTimeline(() => {
  return {}
})

// 新增：获取用户信息
async function getUserInfo () {
  try {
    const result = await http.get(USER_INFO_URL)
    if (result && result.code === 200) {
      userInfo.value = result.data
      return result.data
    } else {
      console.error('获取用户信息失败:', result.msg)
      return null
    }
  } catch (error) {
    console.error('获取用户信息错误:', error)
    return null
  }
}

// 新增：检查用户是否是有效VIP
function isValidVip (user) {
  if (!user) return false

  // 检查用户是否是VIP
  if (!user.isVip) return false

  // 检查VIP是否过期
  if (!user.vipExpiry) return false

  const now = new Date().getTime()
  const expireTime = new Date(user.vipExpiry).getTime()

  return expireTime > now
}

// 新增：获取用户可上传的最大文件大小（字节）
function getMaxFileSize (user) {
  // VIP用户可上传30MB，普通用户可上传15MB
  const isVip = isValidVip(user)
  return isVip ? 30 * 1024 * 1024 : 15 * 1024 * 1024
}

// 选择文件
function chooseFile () {
  // #ifdef H5
  uni.chooseFile({
    count: 1,
    extension: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.png', '.txt', '.rtf', '.html'],
    success: (res) => {
      if (res.tempFiles && res.tempFiles.length > 0) {
        selectedFile.value = res.tempFiles[0]
      }
    }
  })
  // #endif

  // #ifdef MP-WEIXIN
  uni.chooseMessageFile({
    count: 1,
    type: 'all',
    extension: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.png', '.txt', '.rtf', '.html'],
    success: (res) => {
      if (res.tempFiles && res.tempFiles.length > 0) {
        selectedFile.value = res.tempFiles[0]
      }
    }
  })
  // #endif
}

// 移除文件
function removeFile () {
  selectedFile.value = null
  uploadedFileId.value = null
}

// 获取文件类型
function getFileType (fileName) {
  const ext = fileName.split('.').pop().toLowerCase()
  if (['pdf'].includes(ext)) return 'pdf'
  if (['doc', 'docx'].includes(ext)) return 'doc'
  if (['xls', 'xlsx'].includes(ext)) return 'xls'
  if (['ppt', 'pptx'].includes(ext)) return 'ppt'
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'img'
  return 'pdf'
}

// 获取文件图标
function getFileIcon (fileName) {
  const type = getFileType(fileName)
  const iconMap = {
    pdf: 'PDF',
    doc: 'WORD',
    xls: 'EXCEL',
    ppt: 'PPT',
    img: 'JPG'
  }

  // 获取对应的图标名称
  const iconName = iconMap[type] || 'FILE'

  // 返回图片路径
  return `/static/images/${iconName}.png`
}

// 格式化文件大小
function formatFileSize (size) {
  if (size < 1024) {
    return size + 'B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(1) + 'KB'
  } else {
    return (size / (1024 * 1024)).toFixed(1) + 'MB'
  }
}

// 上传文件
async function uploadFile () {
  if (!selectedFile.value) {
    uni.showToast({
      title: '请先选择文件',
      icon: 'none'
    })
    return false
  }

  isUploading.value = true

  try {
    uni.showLoading({
      title: '上传中...'
    })

    // 使用封装好的http.uploadFile方法替代uni.uploadFile
    const result = await http.uploadFile({
      url: UPLOAD_SINGLE_FILE_URL,
      filePath: selectedFile.value.path,
      name: 'file',
      formData: {
        originalName: selectedFile.value.name // 添加原始文件名
      }
    })

    uni.hideLoading()

    // 由于http.uploadFile已经处理了响应解析，直接使用返回结果
    if (result && result.code === 200) {
      // 保存文件信息
      uploadedFileId.value = result.data.fileId
      // 保存完整的文件信息以便传递给下一个页面
      uploadedFileInfo.value = result.data
      return true
    } else {
      uni.showToast({
        title: result.msg || '上传失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('上传文件错误:', error)
    uni.showToast({
      title: '上传失败，请重试',
      icon: 'none'
    })
  } finally {
    isUploading.value = false
    uni.hideLoading()
  }

  return false
}

// 导航到下一页
async function goToNext () {
  if (!selectedFile.value) {
    uni.showToast({
      title: '请先选择文件',
      icon: 'none'
    })
    return
  }

  // 验证文件类型，只允许Word和PDF文件
  const fileExt = selectedFile.value.name.split('.').pop().toLowerCase()
  const allowedTypes = ['pdf', 'doc', 'docx']

  if (!allowedTypes.includes(fileExt)) {
    uni.showToast({
      title: '目前仅支持Word和PDF格式的文件',
      icon: 'none',
      duration: 2000
    })
    return
  }

  // 获取用户信息，判断VIP状态
  const user = await getUserInfo()
  const maxFileSize = getMaxFileSize(user)

  // 检查文件大小是否超过限制
  if (selectedFile.value.size > maxFileSize) {
    const maxSizeMB = maxFileSize / (1024 * 1024)
    const isVip = isValidVip(user)

    if (isVip) {
      uni.showToast({
        title: `文件大小超过VIP用户限制(${maxSizeMB}MB)`,
        icon: 'none',
        duration: 3000
      })
    } else {
      uni.showToast({
        title: `文件大小超过限制(${maxSizeMB}MB)，升级VIP可上传更大文件`,
        icon: 'none',
        duration: 3000
      })
    }
    return
  }

  // 如果文件还未上传，先上传文件
  if (!uploadedFileId.value) {
    const uploadSuccess = await uploadFile()
    if (!uploadSuccess) return
  }

  // 使用上传后返回的文件信息
  uni.navigateTo({
    url: `/pages/option/option?fileId=${uploadedFileId.value}&fileName=${encodeURIComponent(selectedFile.value.name)}&fileSize=${selectedFile.value.size}&fileType=${getFileType(selectedFile.value.name)}`
  })
}

// 导航到指定页面
function navigateTo (url) {
  uni.switchTab({
    url
  })
}
</script>

<style lang="scss">
@import './select.scss';
</style>
