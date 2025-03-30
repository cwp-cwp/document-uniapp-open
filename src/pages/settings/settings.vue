<template>
  <view class="page-container">
    <!-- 主内容区 -->
    <view class="container">
      <view class="settings-container">
        <!-- 常规设置 -->
        <view class="settings-section">
          <view class="section-title">
            <uni-icons
              type="settings"
              size="18"
              color="#6a5acd"
            />
            <text>常规设置</text>
          </view>

          <view
            class="setting-item"
            @click="showLanguageModal"
          >
            <view class="setting-label">
              <view class="setting-icon">
                <uni-icons
                  type="list"
                  size="18"
                  color="#6a5acd"
                />
              </view>
              <view class="setting-text">
                <text class="setting-name">
                  语言设置
                </text>
                <text class="setting-desc">
                  选择应用界面语言
                </text>
              </view>
            </view>
            <view class="setting-value">
              <text>{{ currentLanguage }}</text>
              <uni-icons
                type="right"
                size="14"
                color="#ccc"
              />
            </view>
          </view>

          <view class="setting-item">
            <view class="setting-label">
              <view class="setting-icon">
                <uni-icons
                  type="eye"
                  size="18"
                  color="#6a5acd"
                />
              </view>
              <view class="setting-text">
                <text class="setting-name">
                  深色模式
                </text>
                <text class="setting-desc">
                  切换应用界面主题
                </text>
              </view>
            </view>
            <switch
              :checked="isDarkMode"
              color="#6a5acd"
              class="setting-switch"
              @change="toggleDarkMode"
            />
          </view>

          <view class="setting-item">
            <view class="setting-label">
              <view class="setting-icon">
                <uni-icons
                  type="notification"
                  size="18"
                  color="#6a5acd"
                />
              </view>
              <view class="setting-text">
                <text class="setting-name">
                  通知提醒
                </text>
                <text class="setting-desc">
                  接收转换完成通知
                </text>
              </view>
            </view>
            <switch
              :checked="notificationEnabled"
              color="#6a5acd"
              class="setting-switch"
              @change="toggleNotification"
            />
          </view>
        </view>

        <!-- 转换设置 -->
        <view class="settings-section">
          <view class="section-title">
            <uni-icons
              type="reload"
              size="18"
              color="#6a5acd"
            />
            <text>转换设置</text>
          </view>

          <view
            class="setting-item"
            @click="selectDefaultFormat"
          >
            <view class="setting-label">
              <view class="setting-icon">
                <uni-icons
                  type="list"
                  size="18"
                  color="#6a5acd"
                />
              </view>
              <view class="setting-text">
                <text class="setting-name">
                  默认输出格式
                </text>
                <text class="setting-desc">
                  设置默认的转换输出格式
                </text>
              </view>
            </view>
            <view class="setting-value">
              <text>{{ defaultFormat }}</text>
              <uni-icons
                type="right"
                size="14"
                color="#ccc"
              />
            </view>
          </view>

          <view class="setting-item">
            <view class="setting-label">
              <view class="setting-icon">
                <uni-icons
                  type="download"
                  size="18"
                  color="#6a5acd"
                />
              </view>
              <view class="setting-text">
                <text class="setting-name">
                  压缩输出文件
                </text>
                <text class="setting-desc">
                  转换后自动压缩文件大小
                </text>
              </view>
            </view>
            <switch
              :checked="compressEnabled"
              color="#6a5acd"
              class="setting-switch"
              @change="toggleCompress"
            />
          </view>

          <view
            class="setting-item"
            @click="selectQuality"
          >
            <view class="setting-label">
              <view class="setting-icon">
                <uni-icons
                  type="star"
                  size="18"
                  color="#6a5acd"
                />
              </view>
              <view class="setting-text">
                <text class="setting-name">
                  转换质量
                </text>
                <text class="setting-desc">
                  设置转换输出质量
                </text>
              </view>
            </view>
            <view class="setting-value">
              <text>{{ conversionQuality }}</text>
              <uni-icons
                type="right"
                size="14"
                color="#ccc"
              />
            </view>
          </view>
        </view>

        <!-- 存储设置 -->
        <view class="settings-section">
          <view class="section-title">
            <uni-icons
              type="list"
              size="18"
              color="#6a5acd"
            />
            <text>存储设置</text>
          </view>

          <view
            class="setting-item"
            @click="selectSavePath"
          >
            <view class="setting-label">
              <view class="setting-icon">
                <uni-icons
                  type="location"
                  size="18"
                  color="#6a5acd"
                />
              </view>
              <view class="setting-text">
                <text class="setting-name">
                  默认保存位置
                </text>
                <text class="setting-desc">
                  设置文件默认保存路径
                </text>
              </view>
            </view>
            <view class="setting-value">
              <text>{{ savePath }}</text>
              <uni-icons
                type="right"
                size="14"
                color="#ccc"
              />
            </view>
          </view>

          <view class="setting-item">
            <view class="setting-label">
              <view class="setting-icon">
                <uni-icons
                  type="calendar"
                  size="18"
                  color="#6a5acd"
                />
              </view>
              <view class="setting-text">
                <text class="setting-name">
                  保留历史记录
                </text>
                <text class="setting-desc">
                  保存最近的转换记录
                </text>
              </view>
            </view>
            <switch
              :checked="historyEnabled"
              color="#6a5acd"
              class="setting-switch"
              @change="toggleHistory"
            />
          </view>

          <view class="setting-item">
            <view class="setting-label">
              <view class="setting-icon">
                <uni-icons
                  type="trash"
                  size="18"
                  color="#6a5acd"
                />
              </view>
              <view class="setting-text">
                <text class="setting-name">
                  清除缓存
                </text>
                <text class="setting-desc">
                  删除临时文件和缓存数据
                </text>
              </view>
            </view>
            <button
              class="btn-clear-cache"
              @click="clearCache"
            >
              清除
            </button>
          </view>
        </view>

        <!-- 关于 -->
        <view class="settings-section">
          <view class="section-title">
            <uni-icons
              type="info"
              size="18"
              color="#6a5acd"
            />
            <text>关于</text>
          </view>

          <view
            class="setting-item"
            @click="rateApp"
          >
            <view class="setting-label">
              <view class="setting-icon">
                <uni-icons
                  type="star"
                  size="18"
                  color="#6a5acd"
                />
              </view>
              <view class="setting-text">
                <text class="setting-name">
                  给我们评分
                </text>
                <text class="setting-desc">
                  如果您喜欢我们的应用，请给我们评分
                </text>
              </view>
            </view>
            <view class="setting-value">
              <uni-icons
                type="right"
                size="14"
                color="#ccc"
              />
            </view>
          </view>

          <view
            class="setting-item"
            @click="navigateTo('/pages/agreement/agreement')"
          >
            <view class="setting-label">
              <view class="setting-icon">
                <uni-icons
                  type="paperplane"
                  size="18"
                  color="#6a5acd"
                />
              </view>
              <view class="setting-text">
                <text class="setting-name">
                  用户协议
                </text>
                <text class="setting-desc">
                  查看用户协议和条款
                </text>
              </view>
            </view>
            <view class="setting-value">
              <uni-icons
                type="right"
                size="14"
                color="#ccc"
              />
            </view>
          </view>

          <view
            class="setting-item"
            @click="navigateTo('/pages/privacy/privacy')"
          >
            <view class="setting-label">
              <view class="setting-icon">
                <uni-icons
                  type="locked"
                  size="18"
                  color="#6a5acd"
                />
              </view>
              <view class="setting-text">
                <text class="setting-name">
                  隐私政策
                </text>
                <text class="setting-desc">
                  了解我们如何保护您的数据
                </text>
              </view>
            </view>
            <view class="setting-value">
              <uni-icons
                type="right"
                size="14"
                color="#ccc"
              />
            </view>
          </view>
        </view>

        <!-- 在"存储设置"部分之前添加 -->
        <view class="settings-section">
          <view class="section-title">
            <uni-icons
              type="locked"
              size="18"
              color="#6a5acd"
            />
            <text>账号安全</text>
          </view>

          <view
            class="setting-item"
            @click="navigateTo('/pages/change-password/change-password')"
          >
            <view class="setting-label">
              <view class="setting-icon">
                <uni-icons
                  type="locked-filled"
                  size="18"
                  color="#6a5acd"
                />
              </view>
              <view class="setting-text">
                <text class="setting-name">
                  修改密码
                </text>
                <text class="setting-desc">
                  定期修改密码可以提高账号安全性
                </text>
              </view>
            </view>
            <view class="setting-value">
              <uni-icons
                type="right"
                size="14"
                color="#ccc"
              />
            </view>
          </view>

          <view
            class="setting-item"
            @click="navigateTo('/pages/reset-password/reset-password')"
          >
            <view class="setting-label">
              <view class="setting-icon">
                <uni-icons
                  type="refresh"
                  size="18"
                  color="#6a5acd"
                />
              </view>
              <view class="setting-text">
                <text class="setting-name">
                  忘记密码
                </text>
                <text class="setting-desc">
                  通过手机验证码重置密码
                </text>
              </view>
            </view>
            <view class="setting-value">
              <uni-icons
                type="right"
                size="14"
                color="#ccc"
              />
            </view>
          </view>
        </view>

        <view class="version-info">
          版本 1.0.0 (Build 2023071501)
        </view>
      </view>
    </view>

    <!-- 语言选择弹窗 -->
    <uni-popup
      ref="languagePopup"
      type="center"
      background-color="transparent"
      :mask-click="false"
    >
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">
            选择语言
          </text>
          <uni-icons
            type="close"
            size="20"
            color="#333"
            @click="closeLanguageModal"
          />
        </view>
        <view class="popup-body">
          <view
            v-for="language in languages"
            :key="language.value"
            class="language-option"
            :class="{ selected: language.value === selectedLanguage }"
            @click="selectLanguage(language.value)"
          >
            <view
              class="language-flag"
              :style="{ backgroundColor: language.color }"
            />
            <text class="language-name">
              {{ language.name }}
            </text>
            <uni-icons
              v-if="language.value === selectedLanguage"
              type="checkmarkempty"
              size="16"
              color="#6a5acd"
            />
          </view>
        </view>
        <view class="popup-footer">
          <button
            class="popup-btn btn-cancel"
            @click="closeLanguageModal"
          >
            取消
          </button>
          <button
            class="popup-btn btn-confirm"
            @click="confirmLanguage"
          >
            确定
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref } from 'vue'

// 弹窗引用
const languagePopup = ref(null)

// 设置项状态
const isDarkMode = ref(false)
const notificationEnabled = ref(true)
const compressEnabled = ref(true)
const historyEnabled = ref(true)
const currentLanguage = ref('简体中文')
const defaultFormat = ref('PDF')
const conversionQuality = ref('高质量')
const savePath = ref('下载文件夹')
const selectedLanguage = ref('zh')

// 语言选项
const languages = [
  { name: '简体中文', value: 'zh', color: '#e53935' },
  { name: 'English', value: 'en', color: '#1e88e5' },
  { name: '日本語', value: 'ja', color: '#43a047' },
  { name: '한국어', value: 'ko', color: '#1e88e5' }
]

// 显示语言选择弹窗
const showLanguageModal = () => {
  languagePopup.value.open()
}

// 关闭语言选择弹窗
const closeLanguageModal = () => {
  languagePopup.value.close()
}

// 选择语言
const selectLanguage = (value) => {
  selectedLanguage.value = value
}

// 确认语言选择
const confirmLanguage = () => {
  const selected = languages.find(item => item.value === selectedLanguage.value)
  if (selected) {
    currentLanguage.value = selected.name
  }
  closeLanguageModal()
}

// 切换暗黑模式
const toggleDarkMode = (e) => {
  isDarkMode.value = e.detail.value
}

// 切换通知
const toggleNotification = (e) => {
  notificationEnabled.value = e.detail.value
}

// 切换压缩功能
const toggleCompress = (e) => {
  compressEnabled.value = e.detail.value
}

// 切换历史记录
const toggleHistory = (e) => {
  historyEnabled.value = e.detail.value
}

// 选择默认输出格式
const selectDefaultFormat = () => {
  uni.showActionSheet({
    itemList: ['PDF', 'Word', 'Excel', 'PPT', '图片'],
    success: (res) => {
      const formats = ['PDF', 'Word', 'Excel', 'PPT', '图片']
      defaultFormat.value = formats[res.tapIndex]
    }
  })
}

// 选择转换质量
const selectQuality = () => {
  uni.showActionSheet({
    itemList: ['高质量', '标准', '快速'],
    success: (res) => {
      const qualities = ['高质量', '标准', '快速']
      conversionQuality.value = qualities[res.tapIndex]
    }
  })
}

// 选择保存路径
const selectSavePath = () => {
  uni.showActionSheet({
    itemList: ['下载文件夹', '自定义位置', '云端存储'],
    success: (res) => {
      const paths = ['下载文件夹', '自定义位置', '云端存储']
      savePath.value = paths[res.tapIndex]
    }
  })
}

// 清除缓存
const clearCache = () => {
  uni.showModal({
    title: '清除缓存',
    content: '确定要清除所有缓存数据吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: '缓存已清除',
          icon: 'success'
        })
      }
    }
  })
}

// 页面导航
const navigateTo = (url) => {
  uni.navigateTo({ url })
}

// 评分应用
const rateApp = () => {
  uni.showToast({
    title: '感谢您的支持',
    icon: 'none'
  })
}

</script>

<style lang="scss" scoped>
@import "./settings.scss";
</style>
