<template>
  <view class="option-container">
    <!-- 主内容区 -->
    <view class="main-content">
      <!-- 已选择文件 -->
      <view class="selected-file">
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
      </view>

      <!-- 转换选项 -->
      <view class="options-container">
        <view class="section-title">
          <uni-icons
            type="refresh"
            size="18"
            color="#6a5acd"
          />
          <text class="section-title__text">
            选择目标格式
          </text>
        </view>

        <!-- 格式选项 -->
        <view
          v-for="(format, index) in formatOptions"
          :key="index"
          :class="['format-option', { 'format-option--active': selectedFormat === format.value }]"
          @click="selectFormat(format.value)"
        >
          <view :class="['format-icon', 'format-icon--' + format.icon]">
            <!-- 将uni-icons替换为image组件 -->
            <image
              :src="getFormatIcon(format.value)"
              class="format-icon-img"
              mode="aspectFit"
            />
          </view>
          <view class="format-info">
            <view class="format-name">
              {{ format.name }}
            </view>
            <view class="format-desc">
              {{ format.desc }}
            </view>
          </view>
          <view class="format-radio">
            <view
              v-if="selectedFormat === format.value"
              class="format-radio__inner"
            />
          </view>
        </view>

        <view class="section-title mt-4">
          <uni-icons
            type="settings"
            size="18"
            color="#6a5acd"
          />
          <text class="section-title__text">
            转换设置
          </text>
        </view>

        <!-- Word文档设置 -->
        <view class="option-group">
          <view class="custom-switch">
            <view class="switch-info">
              <view class="option-label">
                保留原始格式
              </view>
              <view class="option-hint">
                尽可能保持与原文档相同的排版和样式
              </view>
            </view>
            <switch
              :checked="preserveFormat"
              color="#6a5acd"
              style="transform: scale(0.8);"
              @change="preserveFormat = !preserveFormat"
            />
          </view>
        </view>

        <view class="option-group">
          <view class="custom-switch">
            <view class="switch-info">
              <view class="option-label">
                提取图片
              </view>
              <view class="option-hint">
                从文档中提取并保存所有图片
              </view>
            </view>
            <switch
              :checked="extractImages"
              color="#6a5acd"
              style="transform: scale(0.8);"
              @change="extractImages = !extractImages"
            />
          </view>
        </view>

        <view class="option-group">
          <view class="option-label">
            页面范围
          </view>
          <view class="page-range">
            <input
              v-model="startPage"
              type="number"
              class="page-input"
              placeholder="起始页"
            >
            <text class="page-separator">
              至
            </text>
            <input
              v-model="endPage"
              type="number"
              class="page-input"
              placeholder="结束页"
            >
          </view>
          <view class="option-hint">
            留空表示转换全部页面
          </view>
        </view>

        <view class="option-group">
          <view class="option-label">
            输出质量
          </view>
          <picker
            :value="qualityIndex"
            :range="qualityOptions"
            range-key="label"
            @change="onQualityChange"
          >
            <view class="quality-picker">
              <text>{{ qualityOptions[qualityIndex].label }}</text>
              <uni-icons
                type="bottom"
                size="14"
                color="#666"
              />
            </view>
          </picker>
        </view>

        <button
          class="convert-btn"
          @click="startConversion"
        >
          <uni-icons
            type="refresh"
            size="25"
            color="#FFFFFF"
          />
          <text>开始转换</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { GET_PDF_FORMATS_URL } from '@/utils/url.js'
import http from '@/utils/httpRequest.js'
import { onLoad } from '@dcloudio/uni-app'

const fileId = ref('')
const fileName = ref('')
const fileSize = ref(0)
const fileType = ref('')

const selectedFile = ref({
  name: '',
  size: 0
})

const formatOptions = ref([])
const selectedFormat = ref('')
const preserveFormat = ref(true)
const extractImages = ref(false)
const startPage = ref('')
const endPage = ref('')
const qualityIndex = ref(1)
const qualityOptions = ref([
  { value: 'low', label: '低质量 (较小文件体积)' },
  { value: 'medium', label: '中等质量 (推荐)' },
  { value: 'high', label: '高质量 (较大文件体积)' }
])

// 获取页面参数
onLoad((options) => {
  fileId.value = options.fileId || ''
  fileName.value = decodeURIComponent(options.fileName || '')
  fileSize.value = options.fileSize || 0
  fileType.value = options.fileType || ''

  // 更新selectedFile对象
  selectedFile.value = {
    name: fileName.value,
    size: parseInt(fileSize.value),
    type: fileType.value
  }

  // 获取支持的转换格式
  getSupportedFormats()
})

// 获取支持的转换格式
async function getSupportedFormats () {
  try {
    uni.showLoading({
      title: '加载中...'
    })

    // 获取文件类型，用于请求对应的转换格式
    const fileExtension = fileName.value.split('.').pop().toLowerCase()
    let requestFileType = 'pdf'

    // 判断文件类型
    if (fileExtension === 'pdf') {
      requestFileType = 'pdf'
    } else if (['doc', 'docx', 'rtf'].includes(fileExtension)) {
      requestFileType = 'word'
    }

    // 传入文件类型参数
    const res = await http.get(`${GET_PDF_FORMATS_URL}?fileType=${requestFileType}`)

    if (res.code === 200 && res.data) {
      // 处理后端返回的格式数据，添加前端需要的字段
      formatOptions.value = res.data.map(format => {
        // 根据格式值设置对应的图标和描述
        let icon = ''
        let desc = ''

        switch (format.value) {
          case 'doc':
            icon = 'word'
            desc = '可编辑的Word文档格式'
            break
          case 'pdf':
            icon = 'pdf'
            desc = '方便阅读的PDF文档格式'
            break
          case 'xls':
            icon = 'excel'
            desc = '可编辑的Excel表格格式'
            break
          case 'ppt':
            icon = 'ppt'
            desc = '可编辑的PowerPoint演示文稿'
            break
          case 'html':
            icon = 'html'
            desc = '网页格式，可在浏览器中查看'
            break
          case 'txt':
            icon = 'txt'
            desc = '纯文本格式，无格式信息'
            break
          default:
            icon = 'file'
            desc = '文档格式'
        }

        return {
          value: format.value,
          name: format.label,
          icon,
          desc
        }
      })

      if (formatOptions.value.length > 0) {
        selectedFormat.value = formatOptions.value[0].value
      }
    } else {
      uni.showToast({
        title: res.msg || '获取格式失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取支持格式错误:', error)
    uni.showToast({
      title: '获取格式失败，请重试',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 获取格式图标
function getFormatIcon (format) {
  const iconMap = {
    doc: 'WORD',
    pdf: 'PDF',
    xls: 'EXCEL',
    ppt: 'PPT',
    html: 'HTML',
    txt: 'TEXT',
    jpg: 'JPG',
    png: 'PNG'
  }

  // 获取对应的图标名称
  const iconName = iconMap[format] || 'FILE'

  // 返回图片路径
  return `/static/images/${iconName}.png`
}

// 选择格式
function selectFormat (format) {
  selectedFormat.value = format
}

// 质量选择变更
function onQualityChange (e) {
  qualityIndex.value = e.detail.value
}

// 开始转换
async function startConversion () {
  if (!fileId.value || !selectedFormat.value) {
    uni.showToast({
      title: '参数错误',
      icon: 'none'
    })
    return
  }

  try {
    // 构建转换选项
    const options = {
      preserveFormat: preserveFormat.value,
      extractImages: extractImages.value,
      quality: qualityOptions.value[qualityIndex.value].value
    }

    // 如果设置了页面范围，添加到选项中
    if (startPage.value) {
      options.startPage = parseInt(startPage.value)
    }

    if (endPage.value) {
      options.endPage = parseInt(endPage.value)
    }

    // 将所有参数编码后传递给进度页面
    const optionsStr = encodeURIComponent(JSON.stringify(options))

    // 跳转到进度页面，并传递所有必要的参数
    uni.navigateTo({
      url: `/pages/progress/progress?fileId=${fileId.value}&fileName=${encodeURIComponent(fileName.value)}&fileSize=${fileSize.value}&fileType=${fileType.value}&targetFormat=${selectedFormat.value}&options=${optionsStr}`
    })
  } catch (error) {
    console.error('准备转换错误:', error)
    uni.showToast({
      title: '准备转换失败，请重试',
      icon: 'none'
    })
  }
}

// 获取文件类型
function getFileType (fileName) {
  const extension = fileName.split('.').pop().toLowerCase()
  const typeMap = {
    pdf: 'pdf',
    doc: 'word',
    docx: 'word',
    xls: 'excel',
    xlsx: 'excel',
    ppt: 'ppt',
    pptx: 'ppt',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    txt: 'txt'
  }

  return typeMap[extension] || 'file'
}

// 获取文件图标
function getFileIcon (fileName) {
  const type = getFileType(fileName)
  const iconMap = {
    pdf: 'PDF',
    word: 'WORD',
    excel: 'EXCEL',
    ppt: 'PPT',
    image: 'JPG',
    txt: 'TEXT'
  }

  // 获取对应的图标名称
  const iconName = iconMap[type] || 'FILE'

  // 返回图片路径
  return `/static/images/${iconName}.png`
}

// 格式化文件大小
function formatFileSize (bytes) {
  if (bytes === 0) return '0B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  return (bytes / Math.pow(1024, i)).toFixed(1) + units[i]
}
</script>

<style lang="scss" scoped>
@import "./option.scss";
</style>
