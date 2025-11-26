

// 导入Element Plus的ElMessage组件
import { ElMessage } from 'element-plus'

// 成功消息函数 - 使用ElMessage.success
function successMessage(message, duration = 3000) {
  ElMessage.success({
    message: message,
    duration: duration,
    showClose: true
  })
}

// 错误消息函数 - 使用ElMessage.error
function errorMessage(message, duration = 3000) {
  ElMessage.error({
    message: message,
    duration: duration,
    showClose: true
  })
}

// 警告消息函数 - 使用ElMessage.warning
function warningMessage(message, duration = 3000) {
  ElMessage.warning({
    message: message,
    duration: duration,
    showClose: true
  })
}

// 信息消息函数 - 使用ElMessage.info
function infoMessage(message, duration = 3000) {
  ElMessage.info({
    message: message,
    duration: duration,
    showClose: true
  })
}

// 导出消息服务
export default {
  success: successMessage,
  error: errorMessage,
  warning: warningMessage,
  info: infoMessage
}