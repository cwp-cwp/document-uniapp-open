<template>
  <view class="page-container">
    <!-- 主内容区 -->
    <view class="container">
      <view class="feedback-container">
        <view class="section-title">
          <uni-icons
            type="chat"
            size="20"
            color="#6a5acd"
          />
          <text>提交您的反馈</text>
        </view>
        <text class="intro-text">
          我们非常重视您的意见和建议，这将帮助我们不断改进产品和服务。
        </text>

        <uni-forms
          ref="feedbackForm"
          :model="formData"
          validate-trigger="submit"
        >
          <!-- 反馈类型 -->
          <view class="form-item">
            <text class="form-label">
              反馈类型
            </text>
            <view class="feedback-type">
              <view
                v-for="(item, index) in feedbackTypes"
                :key="index"
                class="type-btn"
                :class="{ active: selectedType === index }"
                @click="selectType(index)"
              >
                {{ item }}
              </view>
            </view>
          </view>

          <!-- 反馈内容 -->
          <view class="form-item">
            <text class="form-label">
              反馈内容
            </text>
            <textarea
              v-model="formData.content"
              class="form-control"
              placeholder="请详细描述您的意见或遇到的问题..."
              maxlength="500"
            />
            <text class="form-text">
              请尽可能详细地描述，这将有助于我们更好地理解和解决问题。
            </text>
          </view>

          <!-- 上传截图 -->
          <view class="form-item">
            <text class="form-label">
              上传截图（可选）
            </text>
            <view
              class="upload-area"
              @click="chooseImage"
            >
              <view class="upload-icon">
                <uni-icons
                  type="cloud-upload"
                  size="40"
                  color="#6a5acd"
                />
              </view>
              <text class="upload-text">
                点击上传图片
              </text>
              <text class="form-text">
                支持 JPG、PNG 格式，最大 5MB
              </text>
            </view>

            <!-- 图片预览区 -->
            <view
              v-if="imageUrls.length > 0"
              class="image-preview"
            >
              <view
                v-for="(image, index) in imageUrls"
                :key="index"
                class="preview-item"
              >
                <image
                  :src="image"
                  mode="aspectFill"
                  class="preview-image"
                  @click="previewImage(index)"
                />
                <view
                  class="delete-btn"
                  @click.stop="deleteImage(index)"
                >
                  <uni-icons
                    type="close"
                    size="20"
                    color="#ffffff"
                  />
                </view>
              </view>
            </view>
          </view>

          <!-- 联系方式 -->
          <view class="form-item">
            <text class="form-label">
              联系方式（可选）
            </text>
            <input
              v-model="formData.contact"
              class="form-control"
              placeholder="邮箱或手机号，方便我们回复您"
            >
            <text class="form-text">
              我们将对您的个人信息严格保密
            </text>
          </view>

          <!-- 提交按钮 -->
          <button
            class="submit-btn"
            :disabled="uploading || submitting"
            @click="submitFeedback"
          >
            <uni-icons
              type="paperplane"
              size="16"
              color="#ffffff"
            />
            <text class="btn-text">
              {{ uploading ? '正在上传图片...' : (submitting ? '提交中...' : '提交反馈') }}
            </text>
          </button>
        </uni-forms>

        <!-- 其他联系方式 -->
        <view class="contact-info">
          <view class="section-title">
            <uni-icons
              type="headphones"
              size="20"
              color="#6a5acd"
            />
            <text>其他联系方式</text>
          </view>

          <view class="contact-item">
            <view class="contact-icon">
              <uni-icons
                type="email"
                size="20"
                color="#6a5acd"
              />
            </view>
            <view class="contact-text">
              <text class="contact-label">
                电子邮件：
              </text>
              <text>1733459640@qq.com</text>
            </view>
          </view>

          <view class="contact-item">
            <view class="contact-icon">
              <uni-icons
                type="qq"
                size="20"
                color="#6a5acd"
              />
            </view>
            <view class="contact-text">
              <text class="contact-label">
                QQ：
              </text>
              <text>1733459640</text>
            </view>
          </view>

          <view class="contact-item">
            <view class="contact-icon">
              <uni-icons
                type="weixin"
                size="20"
                color="#6a5acd"
              />
            </view>
            <view class="contact-text">
              <text class="contact-label">
                微信公众号：
              </text>
              <text>-</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { SUBMIT_FEEDBACK_URL, UPLOAD_FILE_URL, FILE_DOMAIN } from '@/utils/url.js'
import http from '@/utils/httpRequest.js'

// 表单数据
const formData = reactive({
  type: '功能建议',
  content: '',
  images: [],
  contact: ''
})

// 状态变量
const feedbackTypes = ['功能建议', '问题反馈', '使用体验', '其他']
const selectedType = ref(0)
const uploading = ref(false)
const submitting = ref(false)
const imageUrls = ref([]) // 用于存储上传后的图片URL

// 选择反馈类型
const selectType = (index) => {
  selectedType.value = index
  formData.type = feedbackTypes[index]
}

// 选择图片
const chooseImage = async () => {
  try {
    if (formData.images.length >= 3) {
      uni.showToast({
        title: '最多上传3张图片',
        icon: 'none'
      })
      return
    }

    const res = await uni.chooseImage({
      count: 3 - formData.images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })

    // 检查文件大小并上传图片
    const tempFilePaths = res.tempFilePaths
    uploading.value = true

    for (let i = 0; i < tempFilePaths.length; i++) {
      const fileInfo = await uni.getFileInfo({
        filePath: tempFilePaths[i]
      })

      if (fileInfo.size > 5 * 1024 * 1024) { // 5MB
        uni.showToast({
          title: '图片大小不能超过5MB',
          icon: 'none'
        })
        continue
      }

      try {
        // 上传图片到服务器
        const uploadRes = await http.uploadFile({
          url: UPLOAD_FILE_URL,
          filePath: tempFilePaths[i],
          name: 'file'
        })

        if (uploadRes.code === 200) {
          // 上传成功，添加图片路径到表单数据
          formData.images.push(uploadRes.data)
          imageUrls.value.push(`${FILE_DOMAIN}${uploadRes.data}`)
        } else {
          uni.showToast({
            title: uploadRes.msg || '图片上传失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('上传图片失败', error)
        uni.showToast({
          title: '图片上传失败',
          icon: 'none'
        })
      }
    }

    uploading.value = false
  } catch (e) {
    console.error('选择图片失败', e)
    uploading.value = false
  }
}

// 删除图片
const deleteImage = (index) => {
  formData.images.splice(index, 1)
  imageUrls.value.splice(index, 1)
}

// 预览图片
const previewImage = (index) => {
  uni.previewImage({
    urls: imageUrls.value,
    current: imageUrls.value[index]
  })
}

// 提交反馈
const submitFeedback = async () => {
  // 表单验证
  if (!formData.content.trim()) {
    uni.showToast({
      title: '请填写反馈内容',
      icon: 'none'
    })
    return
  }

  // 防止重复提交
  if (submitting.value || uploading.value) {
    return
  }

  submitting.value = true

  // 显示加载
  uni.showLoading({
    title: '提交中...'
  })

  try {
    // 调用提交接口
    const res = await http.post(SUBMIT_FEEDBACK_URL, {
      type: formData.type,
      content: formData.content,
      images: formData.images,
      contact: formData.contact
    })

    if (res.code === 200) {
      uni.showToast({
        title: '反馈提交成功',
        icon: 'success'
      })

      // 重置表单 - 使用 Object.assign 来避免 ESLint 报错
      Object.assign(formData, {
        type: feedbackTypes[0],
        content: '',
        images: [],
        contact: ''
      })

      selectedType.value = 0
      imageUrls.value = []

      // 延迟返回上一页
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({
        title: res.msg || '提交失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('提交反馈失败', error)
    uni.showToast({
      title: '提交失败，请稍后重试',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
    // eslint-disable-next-line require-atomic-updates
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
@import "./feedback.scss";
</style>
