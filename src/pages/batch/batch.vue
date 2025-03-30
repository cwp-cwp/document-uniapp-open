<template>
  <view class="batch-container">
    <view class="batch-content">
      <view class="upload-section">
        <view
          class="upload-area"
          :class="{ 'border-primary': isDragging }"
          @click="selectFiles"
        >
          <view class="upload-icon">
            <uni-icons
              type="upload-filled"
              size="40"
              color="#6a5acd"
            />
          </view>
          <text class="upload-title">
            点击添加文件
          </text>
          <text class="upload-desc">
            支持PDF、Word格式
          </text>
          <button
            class="browse-btn"
            style="height: 32px;"
          >
            浏览文件
          </button>
        </view>
      </view>

      <view class="files-section">
        <view class="files-header">
          <text class="section-title">
            待转换文件 ({{ addedFiles.length }})
          </text>
          <view
            v-if="addedFiles.length > 0"
            class="files-actions"
          >
            <button
              class="clear-all"
              @click="clearAllFiles"
            >
              清空全部
            </button>
          </view>
        </view>

        <view
          v-if="addedFiles.length > 0"
          class="file-list"
        >
          <view
            v-for="(file, index) in addedFiles"
            :key="index"
            class="file-item"
          >
            <view
              class="file-icon"
              :class="getFileClass(file.type)"
            >
              <!-- 将uni-icons替换为image组件 -->
              <image
                :src="getFileIcon(file.type)"
                class="file-icon-img"
                mode="aspectFit"
              />
            </view>
            <view class="file-details">
              <text class="file-name">
                {{ file.name }}
              </text>
              <text class="file-meta">
                {{ file.size }} · {{ getFileTypeName(file.type) }}
              </text>
              <view class="format-selector">
                <text class="format-label">
                  转换为:
                </text>
                <view class="format-select-wrapper">
                  <picker
                    :value="file.targetFormatIndex"
                    :range="getAvailableFormats(file.type)"
                    @change="(e) => updateTargetFormat(index, e.detail.value)"
                  >
                    <view class="picker-value">
                      {{ getAvailableFormats(file.type)[file.targetFormatIndex] }}
                      <uni-icons
                        type="down"
                        size="12"
                        color="#333"
                      />
                    </view>
                  </picker>
                </view>
              </view>
            </view>
            <view class="file-actions">
              <button
                class="file-action-btn remove-file"
                @click="removeFile(index)"
              >
                <uni-icons
                  type="close"
                  size="20"
                  color="#999"
                />
              </button>
            </view>
          </view>
        </view>

        <view
          v-else
          class="empty-state"
        >
          <view class="empty-icon">
            <uni-icons
              type="file-filled"
              size="32"
              color="#ccc"
            />
          </view>
          <text class="empty-title">
            暂无文件
          </text>
          <text class="empty-desc">
            请添加需要转换的文件
          </text>
        </view>
      </view>

      <view class="options-section">
        <view class="section-title">
          转换选项
        </view>
        <view class="options-container">
          <view class="option-item">
            <view class="option-label">
              <text>保持原文档格式</text>
              <uni-icons
                type="info"
                size="16"
                color="#6a5acd"
              />
            </view>
            <switch
              :checked="options.keepFormat"
              color="#6a5acd"
              @change="(e) => options.keepFormat = e.detail.value"
            />
          </view>
          <view class="option-item">
            <view class="option-label">
              <text>转换后压缩文件</text>
              <uni-icons
                type="info"
                size="16"
                color="#6a5acd"
              />
            </view>
            <switch
              :checked="options.compressAfter"
              color="#6a5acd"
              @change="(e) => options.compressAfter = e.detail.value"
            />
          </view>
          <view class="option-item">
            <view class="option-label">
              <text>图片质量</text>
            </view>
            <view class="option-select-wrapper">
              <picker
                :value="options.imageQualityIndex"
                :range="imageQualityOptions"
                @change="(e) => options.imageQualityIndex = e.detail.value"
              >
                <view class="picker-value">
                  {{ imageQualityOptions[options.imageQualityIndex] }}
                  <uni-icons
                    type="down"
                    size="12"
                    color="#333"
                  />
                </view>
              </picker>
            </view>
          </view>
          <view class="option-item">
            <view class="option-label">
              <text>文件命名</text>
            </view>
            <view class="option-select-wrapper">
              <picker
                :value="options.fileNamingIndex"
                :range="fileNamingOptions"
                @change="(e) => options.fileNamingIndex = e.detail.value"
              >
                <view class="picker-value">
                  {{ fileNamingOptions[options.fileNamingIndex] }}
                  <uni-icons
                    type="down"
                    size="12"
                    color="#333"
                  />
                </view>
              </picker>
            </view>
          </view>
        </view>
      </view>

      <view class="action-buttons">
        <button
          class="btn-convert"
          :disabled="addedFiles.length === 0"
          @click="startConversion"
        >
          开始转换 ({{ addedFiles.length }}个文件)
        </button>
      </view>

      <view
        v-if="!isVip"
        class="vip-info"
      >
        <view class="vip-info-content">
          <uni-icons
            type="info-filled"
            size="16"
            color="#6a5acd"
          />
          <text class="vip-info-text">
            批量转换为VIP专享功能，每次最多可同时转换5个文件
          </text>
        </view>
        <view
          class="vip-info-action"
          @click="goToVipPage"
        >
          <text>了解VIP</text>
          <uni-icons
            type="right"
            size="12"
            color="#6a5acd"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { UPLOAD_SINGLE_FILE_URL, USER_INFO_URL } from '@/utils/url.js'
import http from '@/utils/httpRequest.js'
import { onLoad } from '@dcloudio/uni-app'

const isVip = ref(false)
const isDragging = ref(false)
const addedFiles = ref([])

const options = ref({
  keepFormat: true,
  compressAfter: false,
  imageQualityIndex: 1,
  fileNamingIndex: 0
})

const imageQualityOptions = ref(['低质量', '中等质量', '高质量'])
const fileNamingOptions = ref(['保持原文件名', '添加日期后缀', '添加序号后缀'])

// 文件类型对应的可转换格式
const conversionOptions = {
  pdf: ['Word文档 (.doc)', 'PPT演示文档 (.ppt)', 'RTF文档 (.rtf)'],
  doc: ['PDF文档 (.pdf)', 'RTF文档 (.rtf)', 'TXT文本 (.txt)'],
  docx: ['PDF文档 (.pdf)', 'RTF文档 (.rtf)', 'TXT文本 (.txt)'],
  xls: ['PDF文档 (.pdf)', 'CSV文件 (.csv)', 'HTML网页 (.html)'],
  xlsx: ['PDF文档 (.pdf)', 'CSV文件 (.csv)', 'HTML网页 (.html)'],
  ppt: ['PDF文档 (.pdf)', 'JPG图片 (.jpg)'],
  pptx: ['PDF文档 (.pdf)', 'JPG图片 (.jpg)'],
  jpg: ['PDF文档 (.pdf)', 'PNG图片 (.png)'],
  jpeg: ['PDF文档 (.pdf)', 'PNG图片 (.png)'],
  png: ['PDF文档 (.pdf)', 'JPG图片 (.jpg)'],
  txt: ['PDF文档 (.pdf)', 'Word文档 (.docx)', 'HTML网页 (.html)'],
  default: ['PDF文档 (.pdf)']
}

// 获取用户信息
const getUserInfo = async () => {
  try {
    const result = await http.get(USER_INFO_URL)
    if (result && result.code === 200) {
      // 更新VIP状态
      const userInfo = result.data

      // 检查用户是否是VIP以及VIP是否过期
      if (userInfo.isVip) {
        // 检查VIP是否过期
        const now = new Date().getTime()
        const expireTime = new Date(userInfo.vipExpiry).getTime()
        isVip.value = expireTime > now
      } else {
        isVip.value = false
      }

      return userInfo
    } else {
      console.error('获取用户信息失败:', result.msg)
      isVip.value = false
      return null
    }
  } catch (error) {
    console.error('获取用户信息错误:', error)
    isVip.value = false
    return null
  }
}

// 检查用户是否为VIP
onLoad(async () => {
  await getUserInfo()
})

// 获取用户可上传的最大文件大小（字节）
const getMaxFileSize = (isValidVip) => {
  // VIP用户可上传30MB，普通用户可上传15MB
  return isValidVip ? 30 * 1024 * 1024 : 15 * 1024 * 1024
}

// 获取文件类型样式类
const getFileClass = (type) => {
  const classMap = {
    pdf: 'pdf-icon',
    doc: 'word-icon',
    docx: 'word-icon',
    xls: 'excel-icon',
    xlsx: 'excel-icon',
    ppt: 'ppt-icon',
    pptx: 'ppt-icon',
    jpg: 'image-icon',
    jpeg: 'image-icon',
    png: 'image-icon',
    txt: 'txt-icon'
  }

  return classMap[type] || ''
}

// 获取文件图标
const getFileIcon = (type) => {
  // 将格式转为大写，匹配图片命名
  const formatMap = {
    pdf: 'PDF',
    doc: 'WORD',
    docx: 'WORD',
    xls: 'EXCEL',
    xlsx: 'EXCEL',
    ppt: 'PPT',
    pptx: 'PPT',
    txt: 'TEXT',
    text: 'TEXT',
    jpg: 'JPG',
    jpeg: 'JPG',
    png: 'PNG',
    gif: 'GIF',
    csv: 'CSV',
    zip: 'ZIP',
    html: 'FILE'
  }

  // 获取对应的图标名称
  const iconName = formatMap[type.toLowerCase()] || 'FILE'

  // 返回图片路径
  return `/static/images/${iconName}.png`
}

// 获取文件类型名称
const getFileTypeName = (type) => {
  const nameMap = {
    pdf: 'PDF文档',
    doc: 'Word文档',
    docx: 'Word文档',
    xls: 'Excel表格',
    xlsx: 'Excel表格',
    ppt: 'PPT演示文稿',
    pptx: 'PPT演示文稿',
    jpg: '图片文件',
    jpeg: '图片文件',
    png: '图片文件',
    txt: '文本文件',
    html: 'HTML网页'
  }

  return nameMap[type] || '未知文件'
}

// 获取可用的转换格式
const getAvailableFormats = (type) => {
  return conversionOptions[type] || conversionOptions.default
}

// 选择文件
const selectFiles = async () => {
  if (!isVip.value) {
    uni.showModal({
      title: '提示',
      content: '批量转换为VIP专享功能，请先开通VIP',
      confirmText: '了解VIP',
      success: (res) => {
        if (res.confirm) {
          goToVipPage()
        }
      }
    })
    return
  }

  // 限制文件数量为5个
  const maxFiles = 5
  const remainingSlots = maxFiles - addedFiles.value.length

  if (remainingSlots <= 0) {
    uni.showToast({
      title: `最多只能添加${maxFiles}个文件`,
      icon: 'none'
    })
    return
  }

  // #ifdef H5
  uni.chooseFile({
    count: remainingSlots,
    type: 'all',
    extension: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.png', '.txt', '.rtf', '.html'],
    success: (res) => {
      if (res.tempFiles && res.tempFiles.length > 0) {
        handleSelectedFiles(res.tempFiles, isVip.value)
      }
    }
  })
  // #endif

  // #ifdef MP-WEIXIN
  uni.chooseMessageFile({
    count: remainingSlots,
    type: 'all',
    extension: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.png', '.txt', '.rtf', '.html'],
    success: (res) => {
      if (res.tempFiles && res.tempFiles.length > 0) {
        handleSelectedFiles(res.tempFiles, isVip.value)
      }
    }
  })
  // #endif
}

// 处理选择的文件
const handleSelectedFiles = (files, isValidVip) => {
  const supportedFiles = []
  const unsupportedFiles = []
  const oversizedFiles = []
  const maxFileSize = getMaxFileSize(isValidVip)

  for (const file of files) {
    const ext = file.name.split('.').pop().toLowerCase()

    // 检查文件大小
    if (file.size > maxFileSize) {
      oversizedFiles.push({
        name: file.name,
        size: formatFileSize(file.size)
      })
      continue
    }

    // 只接受PDF和Word文件
    if (['pdf', 'doc', 'docx'].includes(ext)) {
      supportedFiles.push({
        name: file.name,
        size: formatFileSize(file.size),
        rawSize: file.size, // 保存原始大小用于后续验证
        type: ext,
        targetFormatIndex: 0,
        path: file.path,
        file
      })
    } else {
      unsupportedFiles.push(file.name)
    }
  }

  // 添加支持的文件到列表
  addedFiles.value.push(...supportedFiles)

  // 如果有不支持的文件，显示提示
  if (unsupportedFiles.length > 0) {
    uni.showModal({
      title: '不支持的文件类型',
      content: `目前仅支持Word和PDF格式的文件，以下文件已被过滤：\n${unsupportedFiles.join('\n')}`,
      showCancel: false
    })
  }

  // 如果有超出大小限制的文件，显示提示
  if (oversizedFiles.length > 0) {
    const maxSizeMB = maxFileSize / (1024 * 1024)
    const fileList = oversizedFiles.map(f => `${f.name} (${f.size})`).join('\n')

    uni.showModal({
      title: '文件大小超出限制',
      content: `以下文件超出${maxSizeMB}MB大小限制，已被过滤：\n${fileList}`,
      showCancel: false
    })
  }
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (size < 1024) {
    return size + 'B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(1) + 'KB'
  } else {
    return (size / (1024 * 1024)).toFixed(1) + 'MB'
  }
}

const updateTargetFormat = (fileIndex, formatIndex) => {
  addedFiles.value[fileIndex].targetFormatIndex = formatIndex
}

const removeFile = (index) => {
  addedFiles.value.splice(index, 1)
}

const clearAllFiles = () => {
  uni.showModal({
    title: '清空文件',
    content: '确定要清空所有文件吗？',
    success: (res) => {
      if (res.confirm) {
        addedFiles.value = []
      }
    }
  })
}

// 开始转换
const startConversion = async () => {
  if (addedFiles.value.length === 0) {
    uni.showToast({
      title: '请先添加文件',
      icon: 'none'
    })
    return
  }

  // 检查VIP状态
  if (!isVip.value) {
    uni.showModal({
      title: '提示',
      content: '批量转换为VIP专享功能，请先开通VIP',
      confirmText: '了解VIP',
      success: (res) => {
        if (res.confirm) {
          goToVipPage()
        }
      }
    })
    return
  }

  // 检查文件数量限制
  if (addedFiles.value.length > 5) {
    uni.showToast({
      title: '最多只能同时转换5个文件',
      icon: 'none'
    })
    return
  }

  // 再次检查文件大小限制（以防用户状态发生变化）
  const maxFileSize = getMaxFileSize(isVip.value)
  const oversizedFiles = addedFiles.value.filter(file => file.rawSize > maxFileSize)

  if (oversizedFiles.length > 0) {
    const maxSizeMB = maxFileSize / (1024 * 1024)
    const fileList = oversizedFiles.map(f => f.name).join('\n')

    uni.showModal({
      title: '文件大小超出限制',
      content: `以下文件超出${maxSizeMB}MB大小限制：\n${fileList}\n\n请移除这些文件后重试。`,
      showCancel: false
    })
    return
  }

  // 检查文件类型，只允许Word和PDF文件
  const invalidFiles = addedFiles.value.filter(file => {
    const fileType = file.type.toLowerCase()
    return !['pdf', 'doc', 'docx'].includes(fileType)
  })

  if (invalidFiles.length > 0) {
    // 存在不支持的文件类型
    const fileNames = invalidFiles.map(file => file.name).join('\n')
    uni.showModal({
      title: '不支持的文件类型',
      content: `目前仅支持Word和PDF格式的文件，以下文件无法转换：\n${fileNames}`,
      showCancel: false
    })
    return
  }

  try {
    uni.showLoading({
      title: '准备上传文件...'
    })

    // 上传所有文件
    const uploadedFiles = []
    for (let i = 0; i < addedFiles.value.length; i++) {
      const file = addedFiles.value[i]

      // 更新加载提示
      uni.showLoading({
        title: `上传文件 (${i + 1}/${addedFiles.value.length})...`
      })

      // 上传文件
      try {
        const result = await http.uploadFile({
          url: UPLOAD_SINGLE_FILE_URL,
          filePath: file.path,
          name: 'file',
          formData: {
            originalName: file.name // 添加原始文件名
          }
        })

        // 解析返回结果
        let resultData = result
        if (typeof result === 'string') {
          try {
            resultData = JSON.parse(result)
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('解析上传结果失败:', e)
            continue
          }
        }

        if (resultData && resultData.code === 200) {
          // 获取格式代码 - 修复这里的bug
          const formatText = getAvailableFormats(file.type)[file.targetFormatIndex]
          // 修复：使用正确的格式解析方法获取目标格式
          const targetFormat = getFormatCodeFromText(formatText)

          // 保存上传成功的文件信息
          uploadedFiles.push({
            file: resultData.data,
            fileName: file.name,
            fileType: file.type,
            targetFormat
          })
        } else {
          // eslint-disable-next-line no-console
          console.error(`文件 ${file.name} 上传失败:`, resultData)
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`文件 ${file.name} 上传错误:`, error)
      }
    }

    // 检查是否有文件上传成功
    if (uploadedFiles.length === 0) {
      uni.hideLoading()
      uni.showToast({
        title: '所有文件上传失败',
        icon: 'none'
      })
      return
    }

    // 准备批量转换参数
    const batchId = 'batch_' + new Date().getTime()

    // 将上传成功的文件信息和转换选项保存到本地存储
    uni.setStorageSync('batchConversion_' + batchId, {
      files: uploadedFiles,
      options: {
        keepFormat: options.value.keepFormat,
        compressAfter: options.value.compressAfter,
        imageQuality: ['low', 'medium', 'high'][options.value.imageQualityIndex],
        fileNaming: ['original', 'date', 'sequence'][options.value.fileNamingIndex]
      }
    })

    // 跳转到批量转换进度页面
    uni.navigateTo({
      url: `/pages/progress/progress?batchId=${batchId}&mode=batch&totalFiles=${uploadedFiles.length}`
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('文件上传错误:', error)
    uni.showToast({
      title: '文件上传失败，请重试',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 新增：从格式文本中提取格式代码的方法
const getFormatCodeFromText = (formatText) => {
  if (!formatText) return 'pdf'

  // 从格式文本中提取括号内的扩展名
  const match = formatText.match(/\(\.(\w+)\)/)
  if (match && match[1]) {
    return match[1].toLowerCase()
  }

  // 如果无法从括号中提取，则使用关键词匹配
  if (formatText.includes('PDF')) return 'pdf'
  if (formatText.includes('Word')) return 'doc'
  if (formatText.includes('RTF')) return 'rtf'
  if (formatText.includes('TXT')) return 'txt'
  if (formatText.includes('HTML')) return 'html'
  if (formatText.includes('JPG')) return 'jpg'
  if (formatText.includes('PNG')) return 'png'
  if (formatText.includes('CSV')) return 'csv'
  if (formatText.includes('PPT')) return 'ppt'

  return 'pdf' // 默认返回PDF
}

const goToVipPage = () => {
  uni.navigateTo({
    url: '/pages/member/member'
  })
}
</script>

<style lang="scss" scoped>
@import "./batch.scss";
</style>
