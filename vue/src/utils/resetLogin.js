// 重置登录状态的工具函数
export function resetLogin() {
  // 清除sessionStorage中的用户信息和token
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  console.log('登录状态已重置，请重新登录');
  // 重定向到登录页面
  window.location.href = '/login';
}