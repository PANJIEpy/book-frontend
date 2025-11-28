// 用户相关API调用
import request from '../utils/request';

// 获取用户列表（分页）
export const getUserList = (params) => {
  return request({
    url: '/admin/user/page',
    method: 'get',
    params
  });
};

// 获取用户信息
export const getUserInfo = () => {
  return request({
    url: '/admin/user/info',
    method: 'get'
  });
};

// 新增用户
export const addUser = (data) => {
  return request({
    url: '/admin/user',
    method: 'post',
    data
  });
};

// 更新用户
export const updateUser = (data) => {
  return request({
    url: `/admin/user/${data.userId}`,
    method: 'put',
    params: {
      username: data.username,
      realName: data.realName,
      userType: data.userType,
      roleKey: data.roleKey,
      deptName: data.deptName,
      phone: data.phone,
      maxBorrowQuota: data.maxBorrowQuota,
      status: data.status,
      avatarUrl: data.avatarUrl
    }
  });
};

// 删除用户
export const deleteUser = (userId) => {
  return request({
    url: `/admin/user/${userId}`,
    method: 'delete'
  });
};

// 批量删除用户
export const batchDeleteUser = (userIds) => {
  return request({
    url: '/admin/user/batch',
    method: 'delete',
    data: userIds
  });
};

// 更改用户状态
export const changeUserStatus = (data) => {
  return request({
    url: '/admin/user/status',
    method: 'put',
    data
  });
};

// 用户推荐图书
export const recommendBook = (userId, data) => {
  return request({
    url: `/admin/user/${userId}/recommend`,
    method: 'get',
    params: data
  });
};

// 查询用户推荐记录
export const getRecommendRecords = (userId) => {
  return request({
    url: `/admin/user/recommend/${userId}`,
    method: 'get'
  });
};

// 分页查询所有推荐图书的信息
export const getRecommendList = (params) => {
  return request({
    url: '/admin/user/recommend/page',
    method: 'get',
    params
  });
};

// 审核通过推荐图书
export const approveRecommend = (requestId) => {
  return request({
    url: '/admin/user/recommend',
    method: 'post',
    params: {
      requestId
    }
  });
};

// 审核驳回推荐图书
export const rejectRecommend = (requestId, remark) => {
  return request({
    url: '/admin/user/recommend/reject',
    method: 'post',
    params: {
      requestId,
      remark
    }
  });
};

// 待采购池查询
export const getRecommendPool = () => {
  return request({
    url: '/admin/user/recommend/order',
    method: 'get'
  });
};

// 添加到采购订单
export const addToPurchaseOrder = (requestId) => {
  return request({
    url: '/admin/user/recommend/order/add',
    method: 'post',
    params: {
      requestId
    }
  });
};

// 查询采购订单
export const getPurchaseOrders = () => {
  return request({
    url: '/admin/user/recommend/order/all',
    method: 'get'
  });
};

// 填写采购订单
export const fillPurchaseOrder = (orderId, data) => {
  return request({
    url: '/admin/user/recommend/order/fill',
    method: 'post',
    params: {
      orderId
    },
    data
  });
};

// 生成采购订单
export const generatePurchaseOrder = (orderId) => {
  return request({
    url: '/admin/user/recommend/order/generate',
    method: 'post',
    params: {
      orderId
    }
  });
};

// 查询已处理的采购订单
export const getProcessedPurchaseOrders = () => {
  return request({
    url: '/admin/user/recommend/order/processed',
    method: 'get'
  });
};
