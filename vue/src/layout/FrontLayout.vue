<template>
  <div class="front-layout">
    <!-- 顶部导航栏 -->
    <header class="front-header">
      <div class="header-content">
        <div class="logo">
          <h1>图书馆管理系统</h1>
        </div>
        <div class="nav">
          <router-link to="/front/home" class="nav-item">首页</router-link>
          <router-link to="/front/search" class="nav-item">图书搜索</router-link>
          <router-link to="/front/user-center" class="nav-item">用户中心</router-link>
          <router-link to="/front/borrow" class="nav-item">借阅服务</router-link>
          <router-link to="/front/reservation" class="nav-item">图书预约</router-link>
          <router-link to="/front/book-recommendation" class="nav-item">图书推荐</router-link>
          <router-link to="/front/review-collection" class="nav-item">书评与收藏</router-link>
        </div>
        <div class="user-info">
          <el-dropdown>
            <div class="user-dropdown-trigger" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
              <el-avatar :src="user.avatarUrl" size="small" :icon="User">
                {{ user.realName?.charAt(0) || '用' }}
              </el-avatar>
              <span class="user-name">{{ user.realName || '未登录' }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/front/user-center')">个人中心</el-dropdown-item>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>
    
    <!-- 主体内容 -->
    <main class="front-main">
      <router-view />
    </main>
    
    <!-- 页脚 -->
    <footer class="front-footer">
      <div class="footer-content">
        <p>© 2025 图书馆管理系统 版权所有</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus';
import { User } from '@element-plus/icons-vue';

export default {
  name: 'FrontLayout',
  components: {
    User
  },
  data() {
    return {
      user: {}
    };
  },
  created() {
    this.loadUserInfo();
  },
  methods: {
    loadUserInfo() {
      let userStr = sessionStorage.getItem('user') || '{}';
      this.user = JSON.parse(userStr);
    },
    logout() {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      ElMessage.success('退出登录成功');
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.front-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.front-header {
  background-color: #409EFF;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
}

.logo h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.nav {
  display: flex;
  gap: 30px;
}

.nav-item {
  color: white;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  cursor: pointer;
  font-weight: 500;
}

.front-main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
}

.front-footer {
  background-color: #f5f7fa;
  padding: 20px 0;
  text-align: center;
  color: #606266;
  font-size: 14px;
}
</style>