// 仪表盘相关API调用
import request from '../utils/request';

// 获取用户统计数据
export const getUserCount = () => {
  return request({
    url: '/admin/user/total',
    method: 'get'
  });
};

// 获取图书统计数据
export const getBookCount = () => {
  return request({
    url: '/admin/book/total',
    method: 'get'
  });
};

// 获取借阅统计数据
export const getBorrowCount = () => {
  return request({
    url: '/admin/borrow/total',
    method: 'get'
  });
};

// 获取访问统计数据
export const getVisitCount = () => {
  return request({
    url: '/admin/visit/count',
    method: 'get'
  });
};

// 获取借阅统计图表数据
export const getBorrowChartData = () => {
  return request({
    url: '/admin/dashboard/chart',
    method: 'get'
  });
};

// 获取仪表盘统计数据（统一接口）
export const getDashboardStats = () => {
  return request({
    url: '/admin/dashboard/stats',
    method: 'get'
  });
};
