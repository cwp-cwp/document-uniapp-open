<template>
  <view class="page-container">
    <!-- 主内容区 -->
    <view class="container">
      <view class="about-container">
        <!-- 公司介绍 -->
        <view class="text-center mb-4">
          <view class="company-logo">
            <uni-icons
              type="refreshempty"
              size="50"
              color="#6a5acd"
            />
          </view>
          <text class="app-name">
            文档格式转换工具
          </text>
          <text class="app-desc">
            简单、高效的文档格式转换解决方案
          </text>
        </view>

        <view class="section">
          <view class="section-title">
            <uni-icons
              type="home"
              size="18"
              color="#6a5acd"
            />
            <text>产品简介</text>
          </view>
          <text class="about-text">
            我们致力于不断创新和优化产品，为用户提供更好的使用体验。
          </text>
        </view>

        <!-- 核心优势 -->
        <view class="section">
          <view class="section-title">
            <uni-icons
              type="star"
              size="18"
              color="#6a5acd"
            />
            <text>核心优势</text>
          </view>
          <view class="feature-list">
            <view class="feature-item">
              <view class="feature-icon">
                <uni-icons
                  type="download"
                  size="20"
                  color="#6a5acd"
                />
              </view>
              <view class="feature-content">
                <text class="feature-title">
                  高效转换
                </text>
                <text class="feature-desc">
                  采用先进的转换引擎，快速处理各种文档格式，节省您的宝贵时间。
                </text>
              </view>
            </view>
            <view class="feature-item">
              <view class="feature-icon">
                <uni-icons
                  type="locked"
                  size="20"
                  color="#6a5acd"
                />
              </view>
              <view class="feature-content">
                <text class="feature-title">
                  安全可靠
                </text>
                <text class="feature-desc">
                  严格保护用户隐私和文件安全，所有文件在转换完成后自动删除。
                </text>
              </view>
            </view>
            <view class="feature-item">
              <view class="feature-icon">
                <uni-icons
                  type="star"
                  size="20"
                  color="#6a5acd"
                />
              </view>
              <view class="feature-content">
                <text class="feature-title">
                  精准转换
                </text>
                <text class="feature-desc">
                  保持原始文档的格式、样式和布局，确保转换后的文档质量。
                </text>
              </view>
            </view>
            <view class="feature-item">
              <view class="feature-icon">
                <uni-icons
                  type="cloud-upload"
                  size="20"
                  color="#6a5acd"
                />
              </view>
              <view class="feature-content">
                <text class="feature-title">
                  云端处理
                </text>
                <text class="feature-desc">
                  无需安装软件，随时随地在线转换，支持多平台访问。
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 联系方式 -->
        <view class="contact-section">
          <view class="section-title mb-3">
            <uni-icons
              type="email"
              size="18"
              color="#6a5acd"
            />
            <text>联系我们</text>
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

<script setup></script>

<style lang="scss" scoped>
@import "./about.scss";
</style>
