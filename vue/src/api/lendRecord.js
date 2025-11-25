// 借阅记录相关API调用
import request from '../utils/request';

// 创建借阅记录
export const createLendRecord = (data) => {
  return request({
    url: '/LendRecord',
    method: 'post',
    data
  });
};

// 更新借阅记录
export const updateLendRecord = (data) => {
  return request({
    url: '/LendRecord1/',
    method: 'put',
    data
  });
};

// 获取用户借阅信息
export const getUserBorrowInfo = (params) => {
  return request({
    url: '/bookwithuser',
    method: 'get',
    params
  });
};

// 添加借阅关联记录
export const addBorrowRecord = (data) => {
  return request({
    url: '/bookwithuser/insertNew',
    method: 'post',
    data
  });
};

// 删除借阅关联记录
export const deleteBorrowRecord = (data) => {
  return request({
    url: '/bookwithuser/deleteRecord',
    method: 'post',
    data
  });
};
