import axios from 'axios'
import router from "../router";

const request = axios.create({
    baseURL: '/api',
    timeout: 5000
})

// request 拦截器
// 可以自请求发送前对请求做一些处理
// 比如统一加token，对请求参数统一加密
request.interceptors.request.use(config => {
    config.headers['Content-Type'] = 'application/json;charset=utf-8';

    // 从sessionStorage中获取JWT token并添加到请求头
    const token = sessionStorage.getItem("token");
    if (token) {
        // 同时支持Authorization和X-Custom-Token请求头，与后端保持一致
        config.headers['Authorization'] = `Bearer ${token}`;
        config.headers['X-Custom-Token'] = token;
    }
    
    // 不需要自动跳转到登录页，让调用方处理未登录情况
    return config
}, error => {
    return Promise.reject(error)
});

// response 拦截器
// 可以在接口响应后统一处理结果
request.interceptors.response.use(
    response => {
        let res = response.data;
        // 如果是返回的文件
        if (response.config.responseType === 'blob') {
            return res
        }
        // 兼容服务端返回的字符串数据
        if (typeof res === 'string') {
            res = res ? JSON.parse(res) : res
        }
        // 处理token过期或未授权的情况
        if (res.code === 401 || res.code === 403) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            router.push('/login');
        }
        return res;
    },
    error => {
        console.log('err' + error) // for debug
        // 处理网络错误或服务器错误
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            router.push('/login');
        }
        return Promise.reject(error)
    }
)

export default request

