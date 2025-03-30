/**
 * HTTP请求封装
 * 统一处理请求、响应拦截、错误处理、token管理等
 */

// 请求方法封装
const http = {
  /**
   * GET请求
   * @param {String} url 请求地址
   * @param {Object} params 请求参数
   * @param {Object} options 其他选项
   */
  get (url, params = {}, options = {}) {
    return request({
      url,
      method: 'GET',
      data: params,
      ...options
    })
  },

  /**
   * POST请求
   * @param {String} url 请求地址
   * @param {Object} data 请求数据
   * @param {Object} options 其他选项
   */
  post (url, data = {}, options = {}) {
    return request({
      url,
      method: 'POST',
      data,
      ...options
    })
  },

  /**
   * PUT请求
   * @param {String} url 请求地址
   * @param {Object} data 请求数据
   * @param {Object} options 其他选项
   */
  put (url, data = {}, options = {}) {
    return request({
      url,
      method: 'PUT',
      data,
      ...options
    })
  },

  /**
   * DELETE请求
   * @param {String} url 请求地址
   * @param {Object} data 请求数据
   * @param {Object} options 其他选项
   */
  delete (url, data = {}, options = {}) {
    return request({
      url,
      method: 'DELETE',
      data,
      ...options
    })
  }
}

/**
 * 统一请求方法
 * @param {Object} options 请求配置
 */
function request (options) {
  uni.showLoading({ title: '请求中', mask: true })
  return new Promise((resolve, reject) => {
    // 获取存储的token
    const token = uni.getStorageSync('token') || ''

    // 请求头设置
    const header = {
      'Content-Type': 'application/json',
      ...options.header
    }

    // 如果有token，添加到请求头
    if (token) {
      header.Authorization = `Bearer ${token}`
    }

    // 发起请求
    uni.request({
      url: options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header,
      timeout: options.timeout || 30000,
      success: (res) => {
        uni.hideLoading()
        // 请求成功处理
        const { statusCode, data } = res

        // 状态码处理
        if (statusCode >= 200 && statusCode < 300) {
          // 成功状态
          if (data.code === 200) {
            resolve(data)
          } else if (data.code === 401) {
            // 未授权或禁止访问，跳转登录页
            handleAuthError()
            reject(new Error('未登录或登录已过期'))
          } else {
            // 显示错误提示
            uni.showToast({
              title: data.msg,
              icon: 'none',
              duration: 2000
            })
            reject(res)
          }
        } else {
          // 其他错误
          handleError(res)
          reject(res)
        }
      },
      fail: (err) => {
        uni.hideLoading()
        // 请求失败处理
        handleError(err)
        reject(err)
      }
    })
  })
}

/**
 * 处理授权错误
 */
function handleAuthError () {
  // 清除本地存储的token和用户信息
  uni.removeStorageSync('token')
  uni.removeStorageSync('userInfo')

  // 显示提示
  uni.showToast({
    title: '登录已过期，请重新登录',
    icon: 'none',
    duration: 2000
  })

  // 延迟跳转到登录页
  setTimeout(() => {
    uni.navigateTo({
      url: '/pages/login/login'
    })
  }, 1500)
}

/**
 * 处理请求错误
 * @param {Object} err 错误信息
 */
function handleError (err) {
  // 网络错误处理
  let message = '请求失败，请检查网络'

  if (err && err.data) {
    if (typeof err.data === 'string') {
      message = err.data
    } else if (err.data.message) {
      message = err.data.message
    } else if (err.data.error) {
      message = err.data.error
    }
  }

  // 显示错误提示
  uni.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  })
}

/**
 * 上传文件
 * @param {Object} options 上传选项
 */
function uploadFile (options) {
  uni.showLoading({ title: '请求中', mask: true })
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''

    uni.uploadFile({
      url: options.url,
      filePath: options.filePath,
      name: options.name || 'file',
      formData: options.formData || {},
      header: {
        Authorization: token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        uni.hideLoading()
        if (res.statusCode === 200) {
          let data = res.data
          if (typeof data === 'string') {
            try {
              data = JSON.parse(data)
              if (data.code === 401) {
                handleAuthError()
                reject(new Error('未登录或登录已过期'))
              }
            } catch (e) {
              // 解析失败，保持原样
            }
          }
          resolve(data)
        } else {
          handleError(res)
          reject(res)
        }
      },
      fail: (err) => {
        uni.hideLoading()
        handleError(err)
        reject(err)
      }
    })
  })
}

// 导出
export default {
  ...http,
  request,
  uploadFile
}
