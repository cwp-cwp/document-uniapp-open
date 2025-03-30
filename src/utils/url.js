// 服务器地址
// const baseUrl = 'http://127.0.0.1:8085'
const baseUrl = 'https://www.chenwp.top:8443/document-convert-open-api'

// minio文件访问路径
export const FILE_DOMAIN = 'https://www.chenwp.top:8443/minio-file'

// 静态文件下载地址（nginx中配置的）
export const FILE_DOC_DOMAIN = 'https://www.chenwp.top:8443/doc-file'

// 微信登录
export const WX_LOGIN_URL = `${baseUrl}/auth/wechat-login`

// 手机号验证码登录
export const LOGIN_BY_CODE_URL = `${baseUrl}/auth/login-code`

// 手机号密码登录
export const LOGIN_BY_PASS_URL = `${baseUrl}/auth/login-password`

// 发送验证码
export const SEND_CODE_URL = `${baseUrl}/auth/send-code`

// 用户统计数据
export const USER_STATS_URL = `${baseUrl}/user/stats`

// 获取用户信息
export const USER_INFO_URL = `${baseUrl}/user/info`

// 更新用户头像
export const UPDATE_AVATAR_URL = `${baseUrl}/user/updateAvatar`

// 更新用户昵称
export const UPDATE_NICKNAME_URL = `${baseUrl}/user/updateNickname`

// 文件上传
export const UPLOAD_FILE_URL = `${baseUrl}/file/uploadFile2`

// 单文件上传
export const UPLOAD_SINGLE_FILE_URL = `${baseUrl}/file/upload-file`

// 获取PDF支持的转换格式
export const GET_PDF_FORMATS_URL = `${baseUrl}/pdf/formats`

// PDF文件转换
export const CONVERT_PDF_URL = `${baseUrl}/pdf/convert`

// PDF批量转换
export const BATCH_CONVERT_PDF_URL = `${baseUrl}/pdf/batch-convert`

// 下载转换后的文件
export const DOWNLOAD_CONVERTED_FILE_URL = `${baseUrl}/pdf/download`

// 获取转换历史记录
export const GET_CONVERSION_HISTORY_URL = `${baseUrl}/pdf/conversions`

// 删除转换记录
export const DELETE_CONVERSIONS_URL = `${baseUrl}/pdf/delete-conversions`

// 获取转换记录信息
export const GET_CONVERSION_INFO_URL = `${baseUrl}/pdf/conversion-info`

// 修改密码
export const CHANGE_PASSWORD_URL = `${baseUrl}/user/change-password`

// 重置密码（忘记密码）
export const RESET_PASSWORD_URL = `${baseUrl}/user/reset-password`

// 提交反馈
export const SUBMIT_FEEDBACK_URL = `${baseUrl}/feedback/submit`

// 获取反馈列表
export const GET_FEEDBACK_LIST_URL = `${baseUrl}/feedback/list`

// 获取反馈详情
export const GET_FEEDBACK_DETAIL_URL = `${baseUrl}/feedback/detail`
