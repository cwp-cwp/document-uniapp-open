<template>
  <view class="index-page">
    <!-- 头部 -->
    <view class="header">
      <view class="container">
        <text class="title">
          文档格式转换
        </text>
        <text class="subtitle">
          快速、高效、专业的文档转换工具
        </text>
      </view>
    </view>

    <!-- 主内容区 -->
    <view class="container">
      <!-- 轮播图 -->
      <swiper
        class="carousel"
        :indicator-dots="true"
        :autoplay="true"
        :interval="3000"
        :duration="500"
        indicator-active-color="#6a5acd"
      >
        <swiper-item
          v-for="(item, index) in carouselItems"
          :key="index"
        >
          <image
            :src="item.image"
            mode="aspectFill"
            class="carousel-image"
          />
          <view class="carousel-caption">
            <text class="carousel-title">
              {{ item.title }}
            </text>
            <text class="carousel-desc">
              {{ item.description }}
            </text>
          </view>
        </swiper-item>
      </swiper>

      <!-- 添加移动通知公告 -->
      <uni-notice-bar
        text="🎁 限时活动：现在使用可免费获得VIP会员，无需购买会员即可享受全部会员福利！"
        :scrollable="true"
        :single="true"
        color="#ff0000"
        background-color="#ffe8e8"
        speed="80"
        class="vip-notice"
        show-icon
        icon="sound"
        @click="goToMember"
      />

      <!-- 功能区 -->
      <uni-grid
        :column="2"
        :highlight="false"
        :show-border="false"
      >
        <uni-grid-item
          v-for="(feature, index) in features"
          :key="index"
          :index="index"
        >
          <navigator
            :url="feature.url"
            class="feature-card"
            :open-type="feature.openType"
          >
            <view class="feature-header">
              <view class="feature-icon">
                <uni-icons
                  :type="feature.icon"
                  size="50"
                  color="white"
                />
              </view>
            </view>
            <view class="feature-body">
              <view class="feature-kong" />
              <text class="feature-title">
                {{ feature.title }}
              </text>
              <view class="feature-kong" />
              <text class="feature-desc">
                {{ feature.description }}
              </text>
            </view>
          </navigator>
        </uni-grid-item>
      </uni-grid>

      <!-- 通知公告 -->
      <view class="notice-container">
        <view class="notice-header">
          <view class="notice-title">
            <text class="iconfont icon-notification" />
            <text>通知公告</text>
          </view>
          <text class="notice-more">
            更多 <text class="iconfont icon-right" />
          </text>
        </view>
        <view class="notice-list">
          <view
            v-for="(notice, index) in notices"
            :key="index"
            class="notice-item"
          >
            <view class="notice-dot" />
            <text class="notice-text">
              {{ notice.text }}
            </text>
            <text class="notice-date">
              {{ notice.date }}
            </text>
          </view>
        </view>
      </view>

      <!-- 最近转换 -->
      <view class="section-title">
        <text class="iconfont icon-clock" />
        <text>最近转换</text>
      </view>
      <view class="recent-conversions">
        <view
          v-for="(item, index) in recentConversions"
          :key="index"
          class="recent-card"
        >
          <view :class="['file-icon', item.iconClass]">
            <!-- 将iconfont图标替换为image组件 -->
            <image
              :src="getFileIcon(item.fileType)"
              class="file-icon-img"
              mode="aspectFit"
            />
          </view>
          <view class="file-info">
            <text class="file-name">
              {{ item.fileName }}
            </text>
            <text class="file-meta">
              {{ item.meta }}
            </text>
          </view>
        </view>
      </view>

      <!-- VIP会员卡片 -->
      <view class="vip-card">
        <text class="vip-badge">
          HOT
        </text>
        <text class="vip-title">
          VIP会员特权
        </text>
        <view
          v-for="(feature, index) in vipFeatures"
          :key="index"
          class="vip-feature"
        >
          <text class="iconfont icon-check" />
          <text>{{ feature }}</text>
        </view>
        <navigator
          url="/pages/member/member"
          class="vip-btn"
        >
          立即开通
        </navigator>
      </view>
    </view>

    <!-- 快速开始悬浮按钮 -->
    <navigator
      url="/pages/select/select"
      class="quick-start"
      open-type="switchTab"
    >
      <uni-icons
        type="plusempty"
        size="30"
        color="white"
      />
    </navigator>
  </view>
</template>

<script>
import { ref } from 'vue'
import { onShareAppMessage, onShareTimeline, onLoad } from '@dcloudio/uni-app'
import http from '@/utils/httpRequest'
import { GET_CONVERSION_HISTORY_URL } from '@/utils/url'
import { FILE_DOMAIN } from '../../utils/url'

export default {
  name: 'Index',
  // eslint-disable-next-line max-lines-per-function
  setup () {
    onShareAppMessage(() => {
      return {
        title: '小程序分享'
      }
    })

    onShareTimeline(() => {
      return {}
    })

    // 页面加载时获取最近转换记录
    onLoad(() => {
      // 从缓存中获取用户信息和token
      const token = uni.getStorageSync('token')
      const cachedUserInfo = uni.getStorageSync('userInfo')
      if (token && cachedUserInfo) {
        fetchRecentConversions()
      }
    })

    // 轮播图数据
    const carouselItems = ref([
      {
        image: `${FILE_DOMAIN}/document/photo-1586281380349-632531db7ed4.png`,
        title: '文档转换专家',
        description: '一站式解决所有文档格式转换需求'
      },
      {
        image: `${FILE_DOMAIN}/document/photo-1450101499163-c8848c66ca85.png`,
        title: '高效批量转换',
        description: '一次性处理多个文件，节省您的宝贵时间'
      },
      {
        image: `${FILE_DOMAIN}/document/photo-1568667256549-094345857637.png`,
        title: '多种格式支持',
        description: '支持Word、PDF、Excel、PPT等多种格式互转'
      }
    ])

    // 功能区数据
    const features = ref([
      {
        title: '单文件转换',
        description: '快速转换单个文档',
        icon: 'refresh',
        url: '/pages/select/select',
        openType: 'switchTab'
      },
      {
        title: '批量转换',
        description: '一次处理多个文件',
        icon: 'folder-add',
        url: '/pages/batch/batch',
        openType: 'navigate'
      },
      {
        title: '格式指南',
        description: '了解文档格式知识',
        icon: 'paperplane',
        url: '/pages/guide/guide',
        openType: 'navigate'
      },
      {
        title: 'VIP会员',
        description: '享受更多特权',
        icon: 'vip',
        url: '/pages/member/member',
        openType: 'navigate'
      }
    ])

    // 最近转换数据
    const recentConversions = ref([])

    // 获取最近转换记录
    const fetchRecentConversions = async () => {
      try {
        const res = await http.get(GET_CONVERSION_HISTORY_URL, {
          pageNo: 1,
          pageSize: 2 // 只获取最近两条记录
        })

        if (res.code === 200 && res.data && res.data.length > 0) {
          // 转换接口数据为组件所需格式
          recentConversions.value = res.data.map(item => {
            // 获取文件类型图标
            const fileType = item.sourceFileType ? item.sourceFileType.toLowerCase() : 'unknown'
            const targetType = item.targetFileType ? item.targetFileType.toLowerCase() : 'unknown'

            // 格式化时间（简单处理，实际项目中可能需要更复杂的时间处理逻辑）
            const conversionTime = item.conversionTime ? formatTime(new Date(item.conversionTime)) : '未知时间'

            return {
              fileName: item.sourceFileName || '未知文件',
              meta: `${getFileTypeName(fileType)} → ${getFileTypeName(targetType)} · ${conversionTime}`,
              fileType,
              iconClass: `${fileType}-icon`
            }
          })
        }
      } catch (error) {
        console.error('获取最近转换记录失败', error)
      }
    }

    // 格式化时间为"刚刚"、"x分钟前"等形式
    const formatTime = (date) => {
      const now = new Date()
      const diff = now - date

      // 小于1分钟显示"刚刚"
      if (diff < 60 * 1000) {
        return '刚刚'
      }

      // 小于1小时显示"x分钟前"
      if (diff < 60 * 60 * 1000) {
        return `${Math.floor(diff / (60 * 1000))}分钟前`
      }

      // 小于24小时显示"x小时前"
      if (diff < 24 * 60 * 60 * 1000) {
        return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
      }

      // 小于30天显示"x天前"
      if (diff < 30 * 24 * 60 * 60 * 1000) {
        return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
      }

      // 其他情况显示具体日期
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    }

    // 根据文件类型获取文件类型名称
    const getFileTypeName = (fileType) => {
      const typeMap = {
        pdf: 'PDF',
        doc: 'Word',
        docx: 'Word',
        xls: 'Excel',
        xlsx: 'Excel',
        ppt: 'PPT',
        pptx: 'PPT',
        txt: 'TXT',
        html: 'HTML',
        jpg: '图片',
        jpeg: '图片',
        png: '图片'
      }

      return typeMap[fileType] || '未知格式'
    }

    // 获取文件图标
    const getFileIcon = (type) => {
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

    // 通知公告数据
    const notices = ref([
      {
        text: '系统升级通知：本周六凌晨2点-4点进行系统维护',
        date: '06-15'
      },
      {
        text: '新增PPT格式支持，欢迎体验使用',
        date: '06-10'
      },
      {
        text: 'VIP会员特惠活动，新用户直接送3年会员',
        date: '06-05'
      }
    ])

    // VIP特权数据
    const vipFeatures = ref([
      '无限次数转换，不受每日限制',
      '支持更大文件（最大30MB）',
      '批量转换，一次最多5个文件'
    ])

    // 添加跳转到会员页面的方法
    const goToMember = () => {
      uni.navigateTo({
        url: '/pages/member/member'
      })
    }

    // 在 return 中添加新方法
    return {
      carouselItems,
      features,
      notices,
      recentConversions,
      vipFeatures,
      getFileIcon,
      goToMember
    }
  }
}
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
