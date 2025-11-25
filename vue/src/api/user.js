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
    url: '/admin/user',
    method: 'put',
    data
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
