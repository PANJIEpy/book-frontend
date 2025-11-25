import { createStore } from 'vuex'
import request from '../utils/request'

export default createStore({
  state: {
    // 登录状态相关
    token: sessionStorage.getItem('token') || '',
    userInfo: sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : null,
    isLoggedIn: !!sessionStorage.getItem('token')
  },
  mutations: {
    // 设置token
    SET_TOKEN(state, token) {
      state.token = token
      state.isLoggedIn = !!token
      sessionStorage.setItem('token', token)
    },
    // 设置用户信息
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo
      sessionStorage.setItem('user', JSON.stringify(userInfo))
    },
    // 清除登录状态
    CLEAR_LOGIN_STATE(state) {
      state.token = ''
      state.userInfo = null
      state.isLoggedIn = false
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
    }
  },
  actions: {
    // 登录操作
    async login({ commit, dispatch }, loginForm) {
      try {
        const response = await request.post('/admin/login', loginForm)
        if (response.code === 0 || response.code === 200 || response.ok) {
          // 存储token
          commit('SET_TOKEN', response.data)
          // 获取用户信息
          await dispatch('getUserInfo')
          return true
        }
        return false
      } catch (error) {
        console.error('登录失败:', error)
        return false
      }
    },
    
    // 获取用户信息
    async getUserInfo({ commit }) {
      try {
        const response = await request.get('/admin/info')
        if (response.code === 0 || response.code === 200 || response.ok) {
          commit('SET_USER_INFO', response.data)
          return true
        }
        return false
      } catch (error) {
        console.error('获取用户信息失败:', error)
        commit('CLEAR_LOGIN_STATE')
        return false
      }
    },
    
    // 登出操作
    logout({ commit }) {
      commit('CLEAR_LOGIN_STATE')
    },
    
    // 检查登录状态
    checkLogin({ state, dispatch }) {
      if (state.isLoggedIn && !state.userInfo) {
        // 有token但没有用户信息，尝试重新获取
        return dispatch('getUserInfo')
      }
      return Promise.resolve(state.isLoggedIn)
    }
  },
  getters: {
    // 获取当前登录用户信息
    currentUser: state => state.userInfo,
    // 判断是否登录
    isAuthenticated: state => state.isLoggedIn,
    // 获取token
    getToken: state => state.token
  },
  modules: {
  }
})
