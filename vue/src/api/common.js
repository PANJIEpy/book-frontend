// 通用API调用
import request from '../utils/request';

// 获取系统信息
export const getSystemInfo = () => {
  return request({
    url: '/admin/system/info',
    method: 'get'
  });
};

// 上传文件
export const uploadFile = (formData) => {
  return request({
    url: '/admin/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 获取字典数据
export const getDictData = (dictType) => {
  return request({
    url: `/admin/dict/data/${dictType}`,
    method: 'get'
  });
};
