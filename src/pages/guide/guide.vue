<template>
  <view class="guide-page">
    <!-- 主内容区 -->
    <view class="container">
      <!-- 搜索栏 - 使用uni-search-bar组件替换原来的搜索框 -->
      <view class="search-container">
        <uni-search-bar
          v-model="searchQuery"
          placeholder="搜索格式名称..."
          cancel-button="none"
          bg-color="#ffffff"
          radius="20"
          @confirm="search"
        />
      </view>

      <!-- 筛选按钮 -->
      <scroll-view
        scroll-x
        class="filter-scroll"
        show-scrollbar="false"
      >
        <view class="filter-buttons">
          <view
            v-for="(filter, index) in filters"
            :key="index"
            :class="['filter-btn', activeFilter === filter.value ? 'active' : '']"
            @click="setActiveFilter(filter.value)"
          >
            {{ filter.label }}
          </view>
        </view>
      </scroll-view>

      <!-- 格式指南列表 -->
      <view class="format-list">
        <view v-if="filteredFormats.length > 0">
          <!-- 格式卡片 -->
          <view
            v-for="(format, index) in filteredFormats"
            :key="index"
            class="format-card"
          >
            <view class="format-header">
              <view :class="['file-icon', format.iconClass]">
                <!-- 将iconfont图标替换为image组件 -->
                <image
                  :src="getFileIcon(format.type)"
                  class="format-icon-img"
                  mode="aspectFit"
                />
              </view>
              <view class="format-title">
                <text class="format-name">
                  {{ format.name }}
                </text>
                <text class="format-info">
                  {{ format.info }}
                </text>
              </view>
            </view>
            <view class="format-desc">
              {{ format.description }}
            </view>
            <view class="tips-section">
              <text class="tips-title">
                转换提示:
              </text>
              <view class="tips-list">
                <view
                  v-for="(tip, tipIndex) in format.tips"
                  :key="tipIndex"
                  class="tip-item"
                >
                  <text class="tip-bullet">
                    •
                  </text>
                  <text class="tip-text">
                    {{ tip }}
                  </text>
                </view>
              </view>
            </view>
            <navigator
              url="/pages/select/select"
              class="convert-btn"
              open-type="switchTab"
            >
              <text class="iconfont icon-convert" /> 转换此格式
            </navigator>
          </view>
        </view>

        <!-- 空状态 -->
        <view
          v-if="filteredFormats.length === 0"
          class="empty-state"
        >
          <view class="empty-icon">
            <text class="iconfont icon-search" />
          </view>
          <text class="empty-title">
            未找到相关格式
          </text>
          <text class="empty-desc">
            请尝试其他搜索关键词
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed } from 'vue'
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'

export default {
  name: 'Guide',
  setup () {
    onShareAppMessage(() => {
      return {
        title: '小程序分享'
      }
    })

    onShareTimeline(() => {
      return {}
    })

    // 搜索查询
    const searchQuery = ref('')
    // 搜索方法
    const search = () => {
      console.log('搜索关键词:', searchQuery.value)
      // 这里可以添加额外的搜索逻辑，如果需要的话
    }
    // 获取文件图标
    const getFileIcon = (type) => {
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
    // 筛选选项
    const filters = [
      { label: '全部', value: 'all' },
      { label: 'PDF', value: 'pdf' },
      { label: 'Word', value: 'word' },
      { label: 'Excel', value: 'excel' },
      { label: 'PPT', value: 'ppt' },
      { label: '图片', value: 'image' }
    ]

    // 当前激活的筛选
    const activeFilter = ref('all')

    // 设置激活的筛选
    const setActiveFilter = (value) => {
      activeFilter.value = value
    }

    // 格式数据
    const formats = [
      {
        name: 'PDF (便携式文档格式)',
        info: 'Adobe开发的文档格式',
        type: 'pdf',
        iconType: 'icon-pdf',
        iconClass: 'pdf-icon',
        description: 'PDF是一种用于表示文档的文件格式，独立于应用程序、硬件和操作系统。每个PDF文件都封装了一个完整的描述文档的固定布局，包括文本、字体、图形和其他需要显示的信息。',
        tips: [
          'PDF转Word时，复杂的表格和图形可能会失真',
          '包含扫描图像的PDF需要OCR处理才能提取文本',
          '加密的PDF文件需要先解除密码保护才能转换'
        ]
      },
      {
        name: 'Word (DOC/DOCX)',
        info: 'Microsoft Office文档格式',
        type: 'word',
        iconType: 'icon-word',
        iconClass: 'word-icon',
        description: 'Word文档是Microsoft Office套件中的文字处理格式。DOC是旧版格式，而DOCX是基于XML的新格式，具有更好的压缩性能和功能扩展性。Word文档广泛用于创建各类文本文档。',
        tips: [
          'Word转PDF能保留大部分格式和布局',
          '复杂的Word文档(如含有宏、VBA代码)在转换时可能丢失这些功能',
          'DOCX格式比DOC格式更容易转换且保留更多原始格式'
        ]
      },
      {
        name: 'Excel (XLS/XLSX)',
        info: 'Microsoft Office电子表格格式',
        type: 'excel',
        iconType: 'icon-excel',
        iconClass: 'excel-icon',
        description: 'Excel是Microsoft Office套件中的电子表格应用程序使用的文件格式。它允许用户组织、格式化和计算数据，支持公式、图表和数据分析工具。XLSX是较新的基于XML的格式。',
        tips: [
          'Excel转PDF时，确保设置正确的打印区域以获得最佳效果',
          '含有复杂公式的Excel在转换为其他格式时可能只保留结果值',
          '多工作表的Excel文件转换时需注意所有工作表的处理'
        ]
      },
      {
        name: 'PowerPoint (PPT/PPTX)',
        info: 'Microsoft Office演示文稿格式',
        type: 'ppt',
        iconType: 'icon-ppt',
        iconClass: 'ppt-icon',
        description: 'PowerPoint是用于创建演示文稿的文件格式，支持幻灯片、动画、过渡效果和多媒体内容。PPT是旧版格式，而PPTX是基于XML的新格式，具有更好的兼容性和功能。',
        tips: [
          'PPT转PDF可以保留所有视觉元素，但会失去动画效果',
          '转换时注意保持原始幻灯片比例以避免布局错位',
          '含有特殊字体的PPT在转换前应确保嵌入字体'
        ]
      },
      {
        name: '图片格式 (JPG/PNG/TIFF)',
        info: '常用图像文件格式',
        type: 'image',
        iconType: 'icon-image',
        iconClass: 'image-icon',
        description: '图片格式用于存储和显示图像数据。JPG适合照片，具有较高的压缩率；PNG支持透明背景，适合图标和插图；TIFF提供无损压缩，常用于专业印刷和图像编辑。',
        tips: [
          '图片转PDF时可以设置多张图片合并为一个文档',
          'JPG转PNG会保留原始质量但无法恢复已丢失的细节',
          '转换为PDF时可以添加OCR功能使图片中的文字可搜索'
        ]
      }
    ]

    // 根据搜索和筛选条件过滤格式
    const filteredFormats = computed(() => {
      let result = formats

      // 应用搜索筛选
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(format =>
          format.name.toLowerCase().includes(query) ||
          format.info.toLowerCase().includes(query) ||
          format.description.toLowerCase().includes(query)
        )
      }

      // 应用类型筛选
      if (activeFilter.value !== 'all') {
        result = result.filter(format => format.type === activeFilter.value)
      }

      return result
    })

    return {
      searchQuery,
      search,
      filters,
      activeFilter,
      setActiveFilter,
      formats,
      filteredFormats,
      getFileIcon
    }
  }
}
</script>

<style lang="scss" scoped>
@import "./guide.scss";
</style>
