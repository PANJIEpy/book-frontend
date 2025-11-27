<template>
  <div class="person-container">
    <el-card class="person-card">
      <template #header>
        <div class="card-header">
          <h2 class="title">个人信息</h2>
        </div>
      </template>
      
      <!-- 头像区域 -->
      <div class="avatar-section">
        <el-avatar :size="120" :src="form.avatarUrl || defaultAvatar" class="avatar">
          {{ form.realName?.charAt(0) || '用' }}
        </el-avatar>
        <div class="avatar-info">
          <h3 class="real-name">{{ form.realName || '未设置姓名' }}</h3>
          <p class="user-type">{{ getUserTypeText(form.userType) }}</p>
        </div>
      </div>
      
      <el-form :model="form" ref="form" label-width="120px" class="info-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="账号">
              <el-input v-model="form.username" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="真实姓名">
              <el-input v-model="form.realName"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户类型">
              <el-select v-model="form.userType" disabled>
                <el-option label="学生" value="STUDENT"></el-option>
                <el-option label="教师" value="TEACHER"></el-option>
                <el-option label="管理员" value="ADMIN"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="管理员角色">
              <el-select v-model="form.roleKey" disabled>
                <el-option label="超级管理员" value="SUPER"></el-option>
                <el-option label="采购管理员" value="PURCHASE"></el-option>
                <el-option label="借阅管理员" value="BORROW"></el-option>
                <el-option label="数据管理员" value="DATA"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="院系/部门">
              <el-input v-model="form.deptName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="form.phone"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最大借阅额度">
              <el-input-number v-model="form.maxBorrowQuota" :min="1" :max="99" :disabled="true"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-tag :type="form.status === 1 ? 'success' : 'danger'">
                {{ form.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="联系地址">
          <el-input type="textarea" v-model="form.address" :rows="3"></el-input>
        </el-form-item>
      </el-form>
      
      <div class="button-section">
        <el-button type="primary" @click="update" size="large">保存修改</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import request from "@/utils/request";
import { ElMessage } from "element-plus";

export default {
  name: "Person",
  data() {
    return {
      form: {},
      defaultAvatar: "",
    };
  },
  created() {
    this.loadUserInfo();
  },
  methods: {
    // 加载用户信息
    loadUserInfo() {
      let userStr = sessionStorage.getItem("user") || "{}";
      this.form = JSON.parse(userStr);
    },
    
    // 更新用户信息
    update() {
      request.put(`/admin/user/${this.form.userId}`, this.form).then(res => {
        if (res.code === 0 || res.code === 200 || res.ok) {
          ElMessage.success("更新成功");
          sessionStorage.setItem("user", JSON.stringify(this.form));
          // 触发Layout更新用户信息
          this.$emit("userInfo");
        } else {
          ElMessage.error(res.message || "更新失败");
        }
      }).catch(err => {
        console.error("更新用户信息错误:", err);
        ElMessage.error("更新失败，请重试");
      });
    },
    
    // 获取用户类型文本
    getUserTypeText(userType) {
      const typeMap = {
        STUDENT: "学生",
        TEACHER: "教师",
        ADMIN: "管理员"
      };
      return typeMap[userType] || "未知类型";
    },
  },
};
</script>

<style scoped>
.person-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 100px);
  padding: 40px 20px;
  background-color: #f5f7fa;
}

.person-card {
  width: 100%;
  max-width: 800px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.avatar-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 30px;
}

.avatar {
  margin-right: 30px;
  border: 4px solid #ecf5ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.avatar-info {
  display: flex;
  flex-direction: column;
}

.real-name {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.user-type {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.info-form {
  margin-bottom: 30px;
}

.button-section {
  display: flex;
  justify-content: center;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
