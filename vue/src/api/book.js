// 图书相关API调用
import request from '../utils/request';

// 获取图书列表（分页）
export const getBookList = (params) => {
  return request({
    url: '/book',
    method: 'get',
    params
  });
};

// 添加图书
export const addBook = (data) => {
  return request({
    url: '/book',
    method: 'post',
    data
  });
};

// 更新图书
export const updateBook = (data) => {
  return request({
    url: '/book',
    method: 'put',
    data
  });
};

// 删除图书
export const deleteBook = (id) => {
  return request({
    url: `/book/${id}`,
    method: 'delete'
  });
};

// 批量删除图书
export const batchDeleteBook = (ids) => {
  return request({
    url: '/book/deleteBatch',
    method: 'post',
    data: ids
  });
};
