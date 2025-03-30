<template>
  <view class="progress-container">
    <view class="progress-content">
      <view class="progress-card">
        <view class="progress-title">
          <text>{{ isBatchMode ? '批量转换中...' : '文件转换中...' }}</text>
          <text class="progress-status">
            {{ progressPercent.toFixed(2) }}%
          </text>
        </view>
        <view class="progress-bar-wrapper">
          <view class="progress-bar">
            <view
              class="progress-bar-inner"
              :style="{ width: progressPercent + '%' }"
            />
          </view>
        </view>

        <!-- 批量转换模式显示 -->
        <view
          v-if="isBatchMode"
          class="batch-info"
        >
          <text class="batch-status">
            正在处理 {{ currentFileIndex + 1 }}/{{ totalFiles }} 个文件
          </text>
        </view>

        <!-- 单文件转换模式显示 -->
        <view
          v-else
          class="file-info"
        >
          <view class="file-icon">
            <image
              :src="getFileIcon(fileName)"
              class="file-icon-img"
              mode="aspectFit"
            />
          </view>
          <view class="file-details">
            <text class="file-name">
              {{ fileName }}
            </text>
            <text class="file-meta">
              {{ fileType.toUpperCase() }}文档
            </text>
            <view class="convert-info">
              <text>转换为：</text>
              <text class="target-format">
                {{ targetFormat }}
              </text>
            </view>
          </view>
        </view>

        <view class="estimated-time">
          <text>预计剩余时间: {{ remainingTime }}</text>
        </view>
      </view>

      <view class="tips-card">
        <view class="tips-header">
          <uni-icons
            type="info-filled"
            size="16"
            color="#6a5acd"
          />
          <text class="tips-title">
            转换提示
          </text>
        </view>
        <view class="tips-content">
          <text class="tip-item">
            • 转换过程中请不要关闭页面，否则任务将被中断
          </text>
          <text class="tip-item">
            • 较大文件转换可能需要较长时间，请耐心等待
          </text>
          <text class="tip-item">
            • 目前仅支持20MB以内的文件转换
          </text>
        </view>
      </view>

      <view class="action-buttons">
        <button
          class="btn-outline"
          @click="cancelConversion"
        >
          取消转换
        </button>
        <button
          class="btn-primary"
          @click="goToHome"
        >
          返回首页
        </button>
      </view>

      <view
        class="vip-banner"
        @click="goToVip"
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
              VIP用户，转换更快速
            </text>
            <text class="vip-desc">
              转换速度提升50%，不限次数使用
            </text>
          </view>
        </view>
        <view class="vip-arrow">
          <uni-icons
            type="right"
            size="16"
            color="#fff"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { BATCH_CONVERT_PDF_URL, CONVERT_PDF_URL } from '@/utils/url.js'
import http from '@/utils/httpRequest.js'
import { onLoad, onUnload } from '@dcloudio/uni-app'

const progressPercent = ref(0)
const remainingTime = ref('计算中...')
const taskId = ref('')
const fileName = ref('')
const fileType = ref('')
const targetFormat = ref('')
const progressTimer = ref(null)
const isCompleted = ref(false)
const fileId = ref('')
const conversionOptions = ref({})
const isBatchMode = ref(false)
const batchId = ref('')
const totalFiles = ref(0)
const currentFileIndex = ref(0)
const batchResults = ref([])

// 获取页面参数
onLoad((options) => {
  // 检查是否为批量模式
  if (options.mode === 'batch') {
    isBatchMode.value = true
    batchId.value = options.batchId || ''
    totalFiles.value = parseInt(options.totalFiles || '0')

    // 开始批量转换
    startBatchConversion()
  } else {
    // 单文件转换模式
    fileId.value = options.fileId || ''
    fileName.value = decodeURIComponent(options.fileName || '')
    fileType.value = options.fileType || ''
    targetFormat.value = options.targetFormat || ''

    // 解析转换选项
    if (options.options) {
      try {
        conversionOptions.value = JSON.parse(decodeURIComponent(options.options))
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('解析转换选项错误:', e)
      }
    }

    // 开始单文件转换
    startConversion()
  }
})

// 组件卸载时清除定时器
onUnload(() => {
  if (progressTimer.value) {
    clearInterval(progressTimer.value)
    progressTimer.value = null
  }
})

// 开始批量转换
const startBatchConversion = async () => {
  try {
    // 先开始模拟转换进度，但最多只到90%
    startProgressSimulation(90)

    // 从本地存储获取批量转换参数
    const batchData = uni.getStorageSync('batchConversion_' + batchId.value)
    if (!batchData) {
      throw new Error('批量转换数据不存在')
    }

    const { files, options } = batchData

    // 构建批量转换请求
    const conversionRequests = []
    for (let i = 0; i < files.length; i++) {
      conversionRequests.push({
        fileId: files[i].file.fileId,
        targetFormat: files[i].targetFormat,
        options
      })
    }

    // 发送批量转换请求
    const res = await http.post(BATCH_CONVERT_PDF_URL, conversionRequests, { timeout: 600000 })

    if (res.code === 200 && res.data) {
      // 保存转换结果
      batchResults.value = res.data

      // API请求成功后，完成进度条并跳转
      completeProgress()
    } else {
      // 转换失败，停止进度模拟
      stopProgressSimulation()

      uni.showToast({
        title: res.msg || '批量转换失败',
        icon: 'none'
      })

      // 转换失败，返回上一页
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('批量转换错误:', error)

    // 转换失败，停止进度模拟
    stopProgressSimulation()

    uni.showToast({
      title: error.data.msg || '批量转换失败，请重试',
      icon: 'none',
      duration: 3000
    })

    // 转换失败，返回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
}

// 开始单文件转换
const startConversion = async () => {
  try {
    // 先开始模拟转换进度，但最多只到90%
    startProgressSimulation(90)

    // 构建URL参数
    const url = `${CONVERT_PDF_URL}?fileId=${fileId.value}&targetFormat=${targetFormat.value}`

    // 发送转换请求，设置较长的超时时间
    const res = await http.post(url, conversionOptions.value, { timeout: 600000 })

    if (res.code === 200 && res.data) {
      // 保存转换ID
      taskId.value = res.data.conversionId || res.data.taskId

      // API请求成功后，完成进度条并跳转
      completeProgress()
    } else {
      // 转换失败，停止进度模拟
      stopProgressSimulation()

      uni.showToast({
        title: res.msg || '转换失败',
        icon: 'none'
      })
      // 转换失败，返回上一页
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('开始转换错误:', error)

    // 转换失败，停止进度模拟
    stopProgressSimulation()

    uni.showToast({
      title: error.data.msg || '转换失败，请重试',
      icon: 'none'
    })
    // 转换失败，返回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
}

// 停止进度模拟
const stopProgressSimulation = () => {
  if (progressTimer.value) {
    clearInterval(progressTimer.value)
    progressTimer.value = null
  }
}

// 完成进度条并跳转到结果页面
const completeProgress = () => {
  // 停止之前的进度模拟
  stopProgressSimulation()

  // 设置进度为100%
  progressPercent.value = 100
  isCompleted.value = true
  remainingTime.value = '已完成'

  // 延迟一秒后跳转到结果页面
  setTimeout(() => {
    navigateToResult()
  }, 1000)
}

// 开始模拟进度，增加maxProgress参数限制最大进度
const startProgressSimulation = (maxProgress = 99) => {
  // 初始化进度
  progressPercent.value = 0
  remainingTime.value = '计算中...'

  // 设置定时器，模拟进度增长
  progressTimer.value = setInterval(() => {
    // 根据当前进度计算增长速度（进度越高，增长越慢）
    let increment = 0
    if (progressPercent.value < 30) {
      increment = Math.random() * 5 + 3 // 3-8
    } else if (progressPercent.value < 60) {
      increment = Math.random() * 3 + 2 // 2-5
    } else if (progressPercent.value < 80) {
      increment = Math.random() * 2 + 1 // 1-3
    } else {
      increment = Math.random() * 1 + 0.5 // 0.5-1.5
    }

    // 更新进度，但不超过maxProgress，并保留2位小数
    progressPercent.value = parseFloat(Math.min(maxProgress, progressPercent.value + increment).toFixed(2))

    // 更新剩余时间
    updateRemainingTime()
  }, 300)
}

// 更新剩余时间
const updateRemainingTime = () => {
  // 根据进度模拟剩余时间
  const remainingProgress = 100 - progressPercent.value
  let seconds = 0

  if (remainingProgress > 50) {
    seconds = Math.round(remainingProgress * 3)
  } else if (remainingProgress > 20) {
    seconds = Math.round(remainingProgress * 2)
  } else {
    seconds = Math.round(remainingProgress)
  }

  remainingTime.value = formatRemainingTime(seconds)
}

// 导航到结果页面
const navigateToResult = () => {
  if (isBatchMode.value) {
    // 批量转换结果页面
    uni.redirectTo({
      url: `/pages/result/result?batchId=${batchId.value}&mode=batch&status=success&totalFiles=${totalFiles.value}&successFiles=${batchResults.value.length}`
    })
  } else {
    // 单文件转换结果页面
    uni.redirectTo({
      url: `/pages/result/result?taskId=${taskId.value}&status=success&fileUrl=${encodeURIComponent(taskId.value)}&fileName=${encodeURIComponent(fileName.value)}&targetFormat=${targetFormat.value}`
    })
  }
}

// 格式化剩余时间
const formatRemainingTime = (seconds) => {
  if (seconds < 60) {
    return `约${seconds}秒`
  } else if (seconds < 3600) {
    return `约${Math.ceil(seconds / 60)}分钟`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.ceil((seconds % 3600) / 60)
    return `约${hours}小时${minutes}分钟`
  }
}

// 取消转换
const cancelConversion = () => {
  uni.showModal({
    title: '取消转换',
    content: '确定要取消当前转换任务吗？',
    success: (res) => {
      if (res.confirm) {
        // 清除定时器
        if (progressTimer.value) {
          clearInterval(progressTimer.value)
        }

        // 返回上一页
        uni.navigateBack()
      }
    }
  })
}

// 返回首页
const goToHome = () => {
  // 清除定时器
  if (progressTimer.value) {
    clearInterval(progressTimer.value)
  }

  uni.switchTab({
    url: '/pages/index/index'
  })
}

// 跳转到VIP页面
const goToVip = () => {
  uni.navigateTo({
    url: '/pages/member/member'
  })
}

// 获取文件图标
const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase()
  const type = ext === 'pdf' ? 'pdf' : ['doc', 'docx'].includes(ext) ? 'word' : ['xls', 'xlsx'].includes(ext) ? 'excel' : ['ppt', 'pptx'].includes(ext) ? 'ppt' : ['jpg', 'jpeg', 'png'].includes(ext) ? 'image' : 'file'

  const iconMap = {
    pdf: 'PDF',
    word: 'WORD',
    excel: 'EXCEL',
    ppt: 'PPT',
    image: 'JPG'
  }

  // 获取对应的图标名称
  const iconName = iconMap[type] || 'FILE'

  // 返回图片路径
  return `/static/images/${iconName}.png`
}
</script>

<style lang="scss" scoped>
@import "./progress.scss";
</style>
