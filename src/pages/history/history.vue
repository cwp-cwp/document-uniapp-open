<template>
  <view class="history-container">
    <view class="header">
      <view class="container">
        <view class="d-flex justify-content-between align-items-center">
          <view class="header-title-wrapper">
            <text class="header-title">
              历史记录
            </text>
            <text class="header-tip">
              只保留最近一小时数据
            </text>
          </view>
          <view class="header-actions">
            <text
              v-if="selectedRecords.length > 0"
              class="header-action"
              @click="deleteSelected"
            >
              删除({{ selectedRecords.length }})
            </text>
            <text
              v-else
              class="header-action"
              @click="toggleSelectMode"
            >
              {{ isSelectMode ? '取消' : '管理' }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <view class="history-content">
      <view class="filter-section">
        <view class="tabs">
          <view
            class="tab"
            :class="{ 'active': currentTab === 'all' }"
            @click="switchTab('all')"
          >
            <text>全部</text>
          </view>
          <view
            class="tab"
            :class="{ 'active': currentTab === 'completed' }"
            @click="switchTab('completed')"
          >
            <text>已完成</text>
          </view>
          <view
            class="tab"
            :class="{ 'active': currentTab === 'failed' }"
            @click="switchTab('failed')"
          >
            <text>失败</text>
          </view>
        </view>
        <view class="search-box">
          <uni-icons
            type="search"
            size="16"
            color="#999"
          />
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索历史记录"
            @input="handleSearch"
          >
          <uni-icons
            v-if="searchKeyword"
            type="clear"
            size="16"
            color="#999"
            @click="clearSearch"
          />
        </view>
      </view>

      <view
        v-if="filteredRecords.length > 0"
        class="record-list"
      >
        <view
          v-for="(record) in filteredRecords"
          :key="record.id"
          class="record-item"
          :class="{ 'selected': isRecordSelected(record.id) }"
        >
          <view
            v-if="isSelectMode"
            class="record-checkbox"
            @click="toggleRecordSelection(record.id)"
          >
            <uni-icons
              :type="isRecordSelected(record.id) ? 'checkbox-filled' : 'circle'"
              size="20"
              :color="isRecordSelected(record.id) ? '#6a5acd' : '#ddd'"
            />
          </view>
          <view
            class="record-content"
            @click="viewRecordDetail(record)"
          >
            <view class="record-icon">
              <!-- 将uni-icons替换为image组件 -->
              <image
                :src="getFileIcon(record.sourceFormat)"
                class="file-icon"
                mode="aspectFit"
              />
            </view>
            <view class="record-details">
              <view class="record-top">
                <text class="record-name">
                  {{ record.fileName }}
                </text>
                <text :class="['record-status', record.status === 'completed' ? 'success' : 'error']">
                  {{ record.status === 'completed' ? '成功' : '失败' }}
                </text>
              </view>
              <view class="record-info">
                <text class="record-format">
                  {{ getFileTypeName(record.sourceFormat) }} → {{ getFileTypeName(record.targetFormat) }}
                </text>
                <text class="record-date">
                  {{ record.date }}
                </text>
              </view>
            </view>
          </view>
          <view
            v-if="!isSelectMode"
            class="record-actions"
          >
            <button
              v-if="record.status === 'completed'"
              class="action-btn download"
              @click.stop="downloadFile(record)"
            >
              <uni-icons
                type="download"
                size="16"
                color="#6a5acd"
              />
            </button>
            <button
              class="action-btn delete"
              @click.stop="deleteRecord(record.id)"
            >
              <uni-icons
                type="clear"
                size="16"
                color="#f44336"
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
            type="info"
            size="60"
            color="#ddd"
          />
        </view>
        <text class="empty-text">
          {{ searchKeyword ? '未找到相关记录' : '暂无历史记录' }}
        </text>
        <text
          v-if="!searchKeyword"
          class="empty-desc"
        >
          您可以在首页转换文件
        </text>
        <button
          v-if="!searchKeyword"
          class="empty-action"
          @click="goToHome"
        >
          去转换
        </button>
      </view>

      <view
        v-if="filteredRecords.length > 0 && hasMoreRecords"
        class="loading-more"
      >
        <text v-if="isLoading">
          加载中...
        </text>
        <text
          v-else
          @click="loadMoreRecords"
        >
          加载更多
        </text>
      </view>

      <view
        v-if="isSelectMode && filteredRecords.length > 0"
        class="bottom-actions"
      >
        <view
          class="select-all-action"
          @click="toggleSelectAll"
        >
          <uni-icons
            :type="isAllSelected ? 'checkbox-filled' : 'circle'"
            size="20"
            :color="isAllSelected ? '#6a5acd' : '#ddd'"
          />
          <text>全选</text>
        </view>
        <button
          class="delete-btn"
          :disabled="selectedRecords.length === 0"
          @click="deleteSelected"
        >
          删除选中({{ selectedRecords.length }})
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import http from '@/utils/httpRequest'
import { GET_CONVERSION_HISTORY_URL, DOWNLOAD_CONVERTED_FILE_URL, DELETE_CONVERSIONS_URL } from '@/utils/url.js'
import { onLoad } from '@dcloudio/uni-app'

const currentTab = ref('all')
const searchKeyword = ref('')
const isSelectMode = ref(false)
const selectedRecords = ref([])
const isLoading = ref(false)
const hasMoreRecords = ref(true)
const pageNo = ref(1)
const pageSize = ref(5)

// 历史记录数据
const historyRecords = ref([])

onLoad(() => {
  // 页面加载后获取历史记录数据
  fetchConversionHistory()
})

// 根据当前选项卡和搜索关键词过滤记录
const filteredRecords = computed(() => {
  let records = [...historyRecords.value]

  // 根据搜索关键词过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    records = records.filter(record =>
      record.fileName.toLowerCase().includes(keyword) ||
      getFileTypeName(record.sourceFormat).toLowerCase().includes(keyword) ||
      getFileTypeName(record.targetFormat).toLowerCase().includes(keyword)
    )
  }

  return records
})

const isAllSelected = computed(() => {
  return filteredRecords.value.length > 0 &&
         selectedRecords.value.length === filteredRecords.value.length
})

// 获取转换历史记录
const fetchConversionHistory = async () => {
  isLoading.value = true

  try {
    const params = {
      pageNo: pageNo.value,
      pageSize: pageSize.value
    }

    // 根据当前选项卡添加flag参数
    if (currentTab.value === 'completed') {
      params.flag = 0
    } else if (currentTab.value === 'failed') {
      params.flag = 1
    }
    // 'all' 标签不传flag参数，查询全部

    const res = await http.get(GET_CONVERSION_HISTORY_URL, params)

    if (res.code === 200 && res.data) {
      // 处理返回的数据
      const records = res.data || [] // 修改这里，直接使用res.data，因为接口返回的就是数组

      // 格式化记录数据
      const formattedRecords = records.map(item => ({
        id: item.id.toString(),
        fileName: item.sourceFileName || item.targetFileName || '未知文件', // 修改这里，使用sourceFileName或targetFileName
        sourceFormat: item.sourceFileType || '',
        targetFormat: item.targetFileType || '',
        date: formatDate(item.conversionTime || new Date()),
        status: item.flag === 0 ? 'completed' : 'failed',
        fileSize: item.fileSize || '',
        errorMessage: item.errorMessage || '转换失败',
        conversionId: item.id
      }))

      // 如果是第一页，直接替换数据，否则追加数据
      if (pageNo.value === 1) {
        historyRecords.value = formattedRecords
      } else {
        historyRecords.value = [...historyRecords.value, ...formattedRecords]
      }

      // 判断是否还有更多数据
      hasMoreRecords.value = records.length === pageSize.value
    } else {
      uni.showToast({
        title: '获取历史记录失败',
        icon: 'none'
      })
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('获取历史记录失败', error)
    uni.showToast({
      title: '获取历史记录失败，请检查网络',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    return '未知时间'
  }

  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-')
}

// 切换选项卡
const switchTab = (tab) => {
  currentTab.value = tab

  // 切换选项卡时清空选择
  if (isSelectMode.value) {
    selectedRecords.value = []
  }

  // 切换选项卡时重置分页并重新获取数据
  pageNo.value = 1
  historyRecords.value = []
  hasMoreRecords.value = true
  fetchConversionHistory()
}

// 处理搜索
const handleSearch = () => {
  // 实现搜索逻辑，这里直接使用computed属性过滤
}

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = ''
}

// 切换选择模式
const toggleSelectMode = () => {
  isSelectMode.value = !isSelectMode.value
  selectedRecords.value = []
}

// 检查记录是否已选择
const isRecordSelected = (id) => {
  return selectedRecords.value.includes(id)
}

// 切换记录选择状态
const toggleRecordSelection = (id) => {
  const index = selectedRecords.value.indexOf(id)
  if (index > -1) {
    selectedRecords.value.splice(index, 1)
  } else {
    selectedRecords.value.push(id)
  }
}

// 切换全选状态
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedRecords.value = []
  } else {
    selectedRecords.value = filteredRecords.value.map(record => record.id)
  }
}

// 删除选中的记录
const deleteSelected = () => {
  if (selectedRecords.value.length === 0) return

  uni.showModal({
    title: '确认删除',
    content: `确定要删除选中的${selectedRecords.value.length}条记录吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          // 调用删除API - 修改这里，按照后端接口要求传递ids参数
          const result = await http.post(DELETE_CONVERSIONS_URL, selectedRecords.value)

          if (result.code === 200) {
            // 删除选中的记录
            historyRecords.value = historyRecords.value.filter(
              record => !selectedRecords.value.includes(record.id)
            )
            // eslint-disable-next-line require-atomic-updates
            selectedRecords.value = []

            if (isSelectMode.value && filteredRecords.value.length === 0) {
              isSelectMode.value = false
            }

            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
          } else {
            uni.showToast({
              title: '删除失败',
              icon: 'none'
            })
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('删除记录失败', error)
          uni.showToast({
            title: '删除失败，请重试',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 删除单个记录
const deleteRecord = (id) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除此记录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          // 调用删除API - 修改这里，按照后端接口要求传递ids参数
          const result = await http.post(DELETE_CONVERSIONS_URL, [id])

          if (result.code === 200) {
            historyRecords.value = historyRecords.value.filter(record => record.id !== id)
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
          } else {
            uni.showToast({
              title: '删除失败',
              icon: 'none'
            })
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('删除记录失败', error)
          uni.showToast({
            title: '删除失败，请重试',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 查看记录详情
const viewRecordDetail = (record) => {
  if (isSelectMode.value) {
    toggleRecordSelection(record.id)
    return
  }

  // 根据记录状态跳转到不同页面
  if (record.status === 'completed') {
    uni.navigateTo({
      url: `/pages/result/result?taskId=${record.conversionId}&status=success&fileName=${encodeURIComponent(record.fileName)}&fileType=${record.sourceFormat}&targetFormat=${record.targetFormat}`
    })
  } else {
    uni.showModal({
      title: '转换失败',
      content: record.errorMessage || '未知错误',
      showCancel: false
    })
  }
}

// 下载文件
const downloadFile = (record) => {
  if (!record.conversionId) {
    uni.showToast({
      title: '无法下载此文件',
      icon: 'none'
    })
    return
  }

  uni.showLoading({
    title: '准备下载'
  })

  // #ifdef H5
  // 在H5环境下使用XMLHttpRequest下载文件
  const token = uni.getStorageSync('token') || ''
  const downloadUrl = `${DOWNLOAD_CONVERTED_FILE_URL}/${record.conversionId}`

  const xhr = new XMLHttpRequest()
  xhr.open('GET', downloadUrl, true)
  xhr.responseType = 'blob'
  xhr.setRequestHeader('Authorization', token ? `Bearer ${token}` : '')

  xhr.onload = function () {
    uni.hideLoading()
    if (this.status === 200) {
      const blob = new Blob([this.response])
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = record.fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)

      uni.showToast({
        title: '下载成功',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: '下载失败',
        icon: 'none'
      })
    }
  }

  xhr.onerror = function () {
    uni.hideLoading()
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
  const fileExt = record.targetFormat.toLowerCase()

  uni.downloadFile({
    url: `${DOWNLOAD_CONVERTED_FILE_URL}/${record.conversionId}`,
    header: {
      Authorization: uni.getStorageSync('token') ? `Bearer ${uni.getStorageSync('token')}` : ''
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

// 加载更多记录
const loadMoreRecords = () => {
  if (isLoading.value || !hasMoreRecords.value) return

  pageNo.value++
  fetchConversionHistory()
}

// 获取文件图标
const getFileIcon = (format) => {
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
    html: 'HTML',
    rtf: 'FILE'
  }

  // 获取对应的图标名称
  const iconName = formatMap[format?.toLowerCase()] || 'FILE'

  // 返回图片路径
  return `/static/images/${iconName}.png`
}

// 获取文件类型名称
const getFileTypeName = (format) => {
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
    html: 'HTML网页',
    rtf: 'RTF文档'
  }

  return nameMap[format?.toLowerCase()] || '未知文件'
}

// 返回首页
const goToHome = () => {
  uni.switchTab({
    url: '/pages/index/index'
  })
}

</script>

<style lang="scss" scoped>
@import './history.scss';
</style>
