// 图书相关API调用
import request from '../utils/request';

// 获取图书列表（分页）
export const getBookList = (params) => {
  return request({
    url: '/admin/book/page',
    method: 'get',
    params
  });
};

// 根据ID查询图书详情
export const getBookById = (bookId) => {
  return request({
    url: `/admin/book/${bookId}`,
    method: 'get'
  });
};

// 添加图书
export const addBook = (data) => {
  return request({
    url: '/admin/book',
    method: 'post',
    data
  });
};

// 更新图书
export const updateBook = (data) => {
  return request({
    url: `/admin/book/${data.bookId}`,
    method: 'put',
    data
  });
};

// 删除图书
export const deleteBook = (bookId) => {
  return request({
    url: `/admin/book/${bookId}`,
    method: 'delete'
  });
};

// 批量删除图书
export const batchDeleteBook = (bookIds) => {
  return request({
    url: '/admin/book/batch',
    method: 'delete',
    data: bookIds
  });
};
