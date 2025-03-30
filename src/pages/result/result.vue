<template>
  <view class="result-container">
    <view class="result-content">
      <view class="result-card">
        <view
          v-if="conversionResult.status === 'success'"
          class="result-status"
        >
          <view class="status-icon success">
            <uni-icons
              type="checkmarkempty"
              size="30"
              color="#fff"
            />
          </view>
          <text class="status-title success">
            转换成功
          </text>
          <text class="status-desc">
            您的文件已成功转换，可立即下载使用
          </text>
        </view>
        <view
          v-else-if="conversionResult.status === 'failed'"
          class="result-status"
        >
          <view class="status-icon error">
            <uni-icons
              type="closeempty"
              size="30"
              color="#fff"
            />
          </view>
          <text class="status-title error">
            转换失败
          </text>
          <text class="status-desc">
            {{ conversionResult.errorMessage }}
          </text>
        </view>

        <view class="file-details">
          <view class="original-file">
            <view class="file-header">
              <uni-icons
                type="file-filled"
                size="20"
                color="#6a5acd"
              />
              <text class="header-text">
                源文件
              </text>
            </view>
            <view class="file-content">
              <view class="file-icon">
                <image
                  :src="getFileIcon(conversionResult.originalFile.format)"
                  class="file-icon-img"
                  mode="aspectFit"
                />
              </view>
              <view class="file-info">
                <text class="file-name">
                  {{ conversionResult.originalFile.name }}
                </text>
                <text class="file-meta">
                  {{ conversionResult.originalFile.size }} · {{ getFileTypeName(conversionResult.originalFile.format) }}
                </text>
              </view>
            </view>
          </view>

          <view class="conversion-arrow">
            <uni-icons
              type="arrowright"
              size="20"
              color="#999"
            />
          </view>

          <view class="converted-file">
            <view class="file-header">
              <uni-icons
                type="file-filled"
                size="20"
                color="#6a5acd"
              />
              <text class="header-text">
                转换后
              </text>
            </view>
            <view class="file-content">
              <view class="file-icon">
                <image
                  :src="getFileIcon(conversionResult.convertedFile.format)"
                  class="file-icon-img"
                  mode="aspectFit"
                />
              </view>
              <view class="file-info">
                <text class="file-name">
                  {{ conversionResult.convertedFile.name }}
                </text>
                <text class="file-meta">
                  {{ conversionResult.convertedFile.size }} · {{
                    getFileTypeName(conversionResult.convertedFile.format)
                  }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <view class="conversion-details">
          <view class="detail-item">
            <text class="detail-label">
              转换耗时
            </text>
            <text class="detail-value">
              {{ conversionResult.conversionTime }}
            </text>
          </view>
          <view class="detail-item">
            <text class="detail-label">
              转换日期
            </text>
            <text class="detail-value">
              {{ conversionResult.conversionDate }}
            </text>
          </view>
        </view>

        <view
          v-if="conversionResult.status === 'success'"
          class="action-buttons"
        >
          <button
            class="btn-download"
            @click="conversionResult.isBatch ? goToHistory() : downloadFile()"
          >
            <uni-icons
              type="download"
              size="16"
              color="#fff"
            />
            <text>{{ conversionResult.isBatch ? '查看文件' : '下载文件' }}</text>
          </button>
          <button
            class="btn-preview"
            @click="conversionResult.isBatch ? goToHistory() : copyAndShareLink()"
          >
            <uni-icons
              type="link"
              size="16"
              color="#6a5acd"
            />
            <text>{{ conversionResult.isBatch ? '历史记录' : '复制链接' }}</text>
          </button>
        </view>
        <view
          v-else
          class="action-buttons"
        >
          <button
            class="btn-retry"
            @click="retryConversion"
          >
            <uni-icons
              type="refresh"
              size="16"
              color="#fff"
            />
            <text>重新转换</text>
          </button>
        </view>
      </view>

      <view class="other-options">
        <view class="options-title">
          您可能还需要
        </view>
        <view class="options-grid">
          <view
            class="option-item"
            @click="newConversion"
          >
            <view class="option-icon">
              <uni-icons
                type="upload-filled"
                size="24"
                color="#6a5acd"
              />
            </view>
            <text class="option-name">
              新建转换
            </text>
          </view>
          <view
            class="option-item"
            @click="batchConversion"
          >
            <view class="option-icon">
              <uni-icons
                type="folder-add"
                size="24"
                color="#6a5acd"
              />
            </view>
            <text class="option-name">
              批量转换
            </text>
          </view>
          <view
            class="option-item"
            @click="goToHistory"
          >
            <view class="option-icon">
              <uni-icons
                type="calendar"
                size="24"
                color="#6a5acd"
              />
            </view>
            <text class="option-name">
              历史记录
            </text>
          </view>
          <view
            class="option-item"
            @click="shareResult"
          >
            <view class="option-icon">
              <uni-icons
                type="paperplane"
                size="24"
                color="#6a5acd"
              />
            </view>
            <text class="option-name">
              分享结果
            </text>
          </view>
        </view>
      </view>

      <view
        v-if="conversionResult.status === 'success'"
        class="more-formats"
      >
        <view class="formats-title">
          转换为更多格式
        </view>
        <view class="formats-list">
          <view
            v-for="(format, index) in otherFormats"
            :key="index"
            class="format-item"
            @click="convertToOtherFormat(format)"
          >
            <view class="format-icon">
              <image
                :src="getFileIcon(format.extension)"
                class="format-icon-img"
                mode="aspectFit"
              />
            </view>
            <text class="format-name">
              {{ format.name }}
            </text>
          </view>
        </view>
      </view>

      <view class="feedback-card">
        <view class="feedback-title">
          您对转换结果满意吗？
        </view>
        <view class="rating-stars">
          <view
            v-for="index in 5"
            :key="index"
            class="star"
            @click="setRating(index)"
          >
            <uni-icons
              :type="rating >= index ? 'star-filled' : 'star'"
              size="24"
              :color="rating >= index ? '#FFD700' : '#ccc'"
            />
          </view>
        </view>
        <view
          v-if="rating > 0"
          class="feedback-actions"
        >
          <button
            class="btn-feedback"
            @click="submitFeedback"
          >
            提交评价
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { DOWNLOAD_CONVERTED_FILE_URL, FILE_DOC_DOMAIN, GET_CONVERSION_INFO_URL } from '@/utils/url.js'
import http from '@/utils/httpRequest.js'
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'

const taskId = ref('')
const conversionResult = ref({
  status: 'loading', // loading, success, failed
  errorMessage: '',
  originalFile: {
    name: '',
    format: '',
    size: ''
  },
  convertedFile: {
    name: '',
    format: '',
    size: '',
    url: ''
  },
  conversionTime: '1分钟',
  conversionDate: new Date().toLocaleDateString(),
  isBatch: false,
  batchResults: []
})

onShareAppMessage(() => {
  return {
    title: '小程序分享'
  }
})

onShareTimeline(() => {
  return {}
})

// 获取页面参数
onLoad((options) => {
  // 检查是否为批量模式
  if (options.mode === 'batch') {
    const batchId = options.batchId || ''
    const totalFiles = parseInt(options.totalFiles || '0')
    const successFiles = parseInt(options.successFiles || '0')

    // 从本地存储获取批量转换结果
    const batchData = uni.getStorageSync('batchConversion_' + batchId)

    if (batchData) {
      // 设置批量转换结果
      conversionResult.value = {
        status: successFiles > 0 ? 'success' : 'failed',
        errorMessage: successFiles === 0 ? '所有文件转换失败' : '',
        originalFile: {
          name: `${totalFiles}个文件`,
          format: '多种格式',
          size: '批量转换'
        },
        convertedFile: {
          name: `${successFiles}个文件`,
          format: '多种格式',
          size: '批量转换'
        },
        conversionTime: '批量转换',
        conversionDate: new Date().toLocaleDateString(),
        isBatch: true,
        batchResults: batchData.results || []
      }
    } else {
      // 批量转换数据不存在
      conversionResult.value.status = 'failed'
      conversionResult.value.errorMessage = '批量转换数据不存在'
    }
  } else {
    taskId.value = options.taskId || ''

    // 如果有状态参数，直接使用
    if (options.status) {
      conversionResult.value.status = options.status

      // 设置文件信息
      conversionResult.value.originalFile.name = decodeURIComponent(options.fileName || '')
      conversionResult.value.originalFile.format = options.fileType || ''
      // 从文件名中提取格式，如果fileType不存在
      if (!conversionResult.value.originalFile.format && conversionResult.value.originalFile.name) {
        const nameParts = conversionResult.value.originalFile.name.split('.')
        if (nameParts.length > 1) {
          conversionResult.value.originalFile.format = nameParts[nameParts.length - 1]
        }
      }
      conversionResult.value.originalFile.size = formatFileSize(options.fileSize || 0)

      if (options.status === 'success') {
        // 设置转换后的文件信息
        const targetFormat = options.targetFormat || ''
        const fileName = conversionResult.value.originalFile.name
        const baseName = fileName.substring(0, fileName.lastIndexOf('.') !== -1 ? fileName.lastIndexOf('.') : fileName.length)
        const convertedFileName = `${baseName}.${targetFormat}`

        conversionResult.value.convertedFile = {
          name: convertedFileName,
          format: targetFormat,
          size: formatFileSize(options.convertedFileSize || 0) || '计算中...',
          // 设置下载URL
          url: `${DOWNLOAD_CONVERTED_FILE_URL}/${taskId.value}`
        }

        // 设置转换时间和日期
        conversionResult.value.conversionTime = options.conversionTime || '刚刚完成'
        conversionResult.value.conversionDate = options.conversionDate || new Date().toLocaleString()

        // 获取转换后文件的大小
        if (!options.convertedFileSize) {
          getConvertedFileSize()
        }
      } else if (options.status === 'failed') {
        conversionResult.value.errorMessage = decodeURIComponent(options.errorMsg || '转换失败，请重试')
      }
    } else {
      // 如果没有状态参数，默认为失败
      conversionResult.value.status = 'failed'
      conversionResult.value.errorMessage = '无法获取转换结果'
    }
  }
})

// 获取转换后文件的大小
const getConvertedFileSize = () => {
  if (!taskId.value) return

  const token = uni.getStorageSync('token') || ''
  const url = `${DOWNLOAD_CONVERTED_FILE_URL}/${taskId.value}`

  // 发送HEAD请求获取文件大小
  uni.request({
    url,
    method: 'HEAD',
    header: {
      Authorization: token ? `Bearer ${token}` : ''
    },
    success: (res) => {
      if (res.statusCode === 200) {
        const contentLength = res.header['Content-Length'] || res.header['content-length']
        if (contentLength) {
          conversionResult.value.convertedFile.size = formatFileSize(parseInt(contentLength))
        }
      }
    }
  })
}

// 获取文件图标
const getFileIcon = (format) => {
  if (!format) return '/static/images/FILE.png'

  const formatLower = format.toLowerCase()

  if (formatLower === 'pdf') {
    return '/static/images/PDF.png'
  } else if (['doc', 'docx'].includes(formatLower)) {
    return '/static/images/WORD.png'
  } else if (['xls', 'xlsx'].includes(formatLower)) {
    return '/static/images/EXCEL.png'
  } else if (['ppt', 'pptx'].includes(formatLower)) {
    return '/static/images/PPT.png'
  } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(formatLower)) {
    return '/static/images/JPG.png'
  } else if (['txt', 'text', 'log'].includes(formatLower)) {
    return '/static/images/TEXT.png'
  } else if (['html', 'htm'].includes(formatLower)) {
    return '/static/images/HTML.png'
  } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(formatLower)) {
    return '/static/images/ZIP.png'
  } else {
    return '/static/images/FILE.png'
  }
}

// 下载文件
const downloadFile = () => {
  if (!taskId.value) {
    uni.showToast({
      title: '下载ID不存在',
      icon: 'none'
    })
    return
  }

  const downloadUrl = `${DOWNLOAD_CONVERTED_FILE_URL}/${taskId.value}`
  const token = uni.getStorageSync('token') || ''

  // #ifdef H5
  // 对于H5，创建一个临时链接并添加token到请求头
  const xhr = new XMLHttpRequest()
  xhr.open('GET', downloadUrl, true)
  xhr.responseType = 'blob'
  xhr.setRequestHeader('Authorization', token ? `Bearer ${token}` : '')

  xhr.onload = function () {
    if (this.status === 200) {
      const blob = new Blob([this.response])
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = conversionResult.value.convertedFile.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } else {
      uni.showToast({
        title: '下载失败',
        icon: 'none'
      })
    }
  }

  xhr.onerror = function () {
    uni.showToast({
      title: '下载失败',
      icon: 'none'
    })
  }

  xhr.send()
  // #endif

  // #ifdef MP-WEIXIN
  uni.showLoading({
    title: '准备下载...'
  })

  // 获取文件扩展名
  const fileExt = conversionResult.value.convertedFile.format.toLowerCase()

  uni.downloadFile({
    url: downloadUrl,
    header: {
      Authorization: token ? `Bearer ${token}` : ''
    },
    success: (res) => {
      uni.hideLoading()
      if (res.statusCode === 200) {
        // 尝试直接打开文件
        uni.openDocument({
          filePath: res.tempFilePath,
          fileType: fileExt, // 明确指定文件类型
          showMenu: true,
          success: () => {
            uni.showToast({
              title: '文件已打开',
              icon: 'success'
            })
          },
          fail: () => {
            // 如果直接打开失败，尝试保存到本地后再打开
            uni.saveFile({
              tempFilePath: res.tempFilePath,
              success: (saveRes) => {
                uni.showToast({
                  title: '文件已保存',
                  icon: 'success'
                })

                // 再次尝试打开
                uni.openDocument({
                  filePath: saveRes.savedFilePath,
                  fileType: fileExt,
                  showMenu: true,
                  success: () => {
                  },
                  fail: () => {
                    uni.showToast({
                      title: '文件已保存，但无法直接打开',
                      icon: 'none',
                      duration: 2000
                    })
                  }
                })
              },
              fail: () => {
                uni.showToast({
                  title: '保存文件失败',
                  icon: 'none'
                })
              }
            })
          }
        })
      } else {
        uni.showToast({
          title: '下载失败',
          icon: 'none'
        })
      }
    },
    fail: () => {
      uni.hideLoading()
      uni.showToast({
        title: '下载失败',
        icon: 'none'
      })
    }
  })
  // #endif
}

// 重新转换
const retryConversion = () => {
  uni.navigateBack({
    delta: 2 // 返回到选择文件页面
  })
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (!size || isNaN(size)) return '未知大小'

  if (size < 1024) {
    return size + 'B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(1) + 'KB'
  } else {
    return (size / (1024 * 1024)).toFixed(1) + 'MB'
  }
}

// 获取文件类型名称
const getFileTypeName = (format) => {
  if (!format) return '未知文件'

  const formatLower = format.toLowerCase()

  if (formatLower === 'pdf') {
    return 'PDF文档'
  } else if (['doc', 'docx'].includes(formatLower)) {
    return 'Word文档'
  } else if (['xls', 'xlsx'].includes(formatLower)) {
    return 'Excel表格'
  } else if (['ppt', 'pptx'].includes(formatLower)) {
    return 'PPT演示文稿'
  } else if (['jpg', 'jpeg', 'png'].includes(formatLower)) {
    return '图片文件'
  } else if (formatLower === 'txt') {
    return '文本文件'
  } else if (formatLower === 'html') {
    return 'HTML网页'
  } else {
    return `${formatLower.toUpperCase()}文件`
  }
}

// 评分
const rating = ref(0)

// 设置评分
const setRating = (value) => {
  rating.value = value
}

// 提交评价
const submitFeedback = () => {
  uni.showLoading({
    title: '提交中...'
  })

  // 模拟提交评价
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({
      title: '感谢您的评价！',
      icon: 'success'
    })
  }, 1000)
}

// 其他可转换的格式
const otherFormats = ref([
  { name: 'Word', extension: 'docx' },
  { name: 'PDF', extension: 'pdf' },
  { name: 'TXT', extension: 'txt' },
  { name: 'HTML', extension: 'html' }
])

// 转换为其他格式
const convertToOtherFormat = () => {
  uni.switchTab({ url: '/pages/select/select' })
}

// 新建转换
const newConversion = () => {
  uni.switchTab({
    url: '/pages/select/select'
  })
}

// 批量转换
const batchConversion = () => {
  uni.navigateTo({
    url: '/pages/batch/batch'
  })
}

// 查看历史记录
const goToHistory = () => {
  uni.switchTab({
    url: '/pages/history/history'
  })
}

// 分享结果
const shareResult = () => {
  // #ifdef H5
  if (navigator.share) {
    navigator.share({
      title: '文档转换结果',
      text: `我使用文档转换工具将${conversionResult.value.originalFile.name}转换为了${getFileTypeName(conversionResult.value.convertedFile.format)}`,
      url: window.location.href
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.log('分享失败:', error)
      uni.showToast({
        title: '分享失败',
        icon: 'none'
      })
    })
  } else {
    // 复制链接
    const input = document.createElement('input')
    input.setAttribute('readonly', 'readonly')
    input.setAttribute('value', window.location.href)
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)

    uni.showToast({
      title: '链接已复制，请手动分享',
      icon: 'none'
    })
  }
  // #endif

  // #ifdef MP-WEIXIN
  // 在微信小程序中，显示操作菜单让用户选择分享方式
  uni.showActionSheet({
    itemList: ['分享给朋友', '分享到朋友圈'],
    success: function (res) {
      if (res.tapIndex === 0) {
        // 分享给朋友
        uni.showToast({
          title: '请点击右上角分享给朋友',
          icon: 'none',
          duration: 2000
        })
      } else if (res.tapIndex === 1) {
        // 分享到朋友圈
        uni.showToast({
          title: '请点击右上角分享到朋友圈',
          icon: 'none',
          duration: 2000
        })
      }
    }
  })
  // #endif
}

// 复制链接
const copyAndShareLink = async () => {
  if (!taskId.value) {
    uni.showToast({
      title: '任务ID不存在',
      icon: 'none'
    })
    return
  }

  try {
    uni.showLoading({
      title: '获取链接中...'
    })

    // 调用接口获取转换记录信息
    const result = await http.get(`${GET_CONVERSION_INFO_URL}/${taskId.value}`)

    if (result && result.code === 200 && result.data) {
      const conversion = result.data
      const fileLink = conversion.targetFilePath

      // 复制链接到剪贴板
      uni.setClipboardData({
        data: `${FILE_DOC_DOMAIN}${fileLink}`,
        success: () => {
          uni.hideLoading()
          uni.showToast({
            title: '链接已复制到剪贴板',
            icon: 'success'
          })

          // #ifdef MP-WEIXIN
          // 在微信小程序中，打开分享菜单
          setTimeout(() => {
            uni.showActionSheet({
              itemList: ['分享给朋友', '分享到朋友圈'],
              success: function (res) {
                if (res.tapIndex === 0) {
                  // 分享给朋友
                  wx.showShareMenu({
                    withShareTicket: true,
                    menus: ['shareAppMessage']
                  })
                } else if (res.tapIndex === 1) {
                  // 分享到朋友圈
                  wx.showShareMenu({
                    withShareTicket: true,
                    menus: ['shareTimeline']
                  })
                }
              }
            })
          }, 1000)
          // #endif

          // #ifdef H5
          // 在H5环境下，提示用户可以分享链接
          uni.showModal({
            title: '链接已复制',
            content: '您可以将链接分享给好友',
            showCancel: false
          })
          // #endif
        },
        fail: () => {
          uni.hideLoading()
          uni.showToast({
            title: '复制链接失败',
            icon: 'none'
          })
        }
      })
    } else {
      uni.hideLoading()
      uni.showToast({
        title: '获取文件信息失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '获取文件信息失败',
      icon: 'none'
    })
    console.error('获取文件信息错误:', error)
  }
}
</script>

<style lang="scss" scoped>
@import './result.scss';
</style>
