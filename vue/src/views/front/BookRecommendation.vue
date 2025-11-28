<template>
  <div class="book-recommendation">
    <h2>图书推荐</h2>
    <el-card>
      <el-form :model="form" label-width="120px">
        <el-form-item label="图书名称" required>
          <el-input v-model="form.title" placeholder="请输入图书名称"></el-input>
        </el-form-item>
        <el-form-item label="作者" required>
          <el-input v-model="form.author" placeholder="请输入作者"></el-input>
        </el-form-item>
        <el-form-item label="ISBN">
          <el-input v-model="form.isbn" placeholder="请输入ISBN"></el-input>
        </el-form-item>
        <el-form-item label="推荐理由" required>
          <el-input v-model="form.reason" type="textarea" placeholder="请输入推荐理由" :rows="3"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">提交推荐</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="recommendation-list">
      <h3>我的推荐记录</h3>
      <el-table :data="recommendationList" stripe border>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="title" label="图书名称"></el-table-column>
        <el-table-column prop="author" label="作者" width="120"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'PENDING' ? 'warning' : scope.row.status === 'APPROVED' ? 'success' : scope.row.status === 'PURCHASING' ? 'info' : scope.row.status === 'STORED' ? 'success' : 'danger'">
              {{ scope.row.status === 'PENDING' ? '待审核' : scope.row.status === 'APPROVED' ? '已通过' : scope.row.status === 'PURCHASING' ? '采购中' : scope.row.status === 'STORED' ? '已入库' : '已驳回' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="推荐时间" width="180"></el-table-column>
        <el-table-column prop="remark" label="审核意见" show-overflow-tooltip></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus';
import api from '@/api';

export default {
  name: 'BookRecommendation',
  data() {
    return {
      form: {
        title: '',
        author: '',
        publisher: '',
        isbn: '',
        reason: ''
      },
      recommendationList: []
    };
  },
  methods: {
    submit() {
      // 表单验证
      if (!this.form.title || !this.form.author || !this.form.reason) {
        ElMessage.warning('请填写必填项');
        return;
      }

      // 调用API提交推荐
      const userStr = sessionStorage.getItem('user') || '{}';
      const user = JSON.parse(userStr);
      if (!user.userId) {
        ElMessage.warning('请先登录');
        return;
      }

      api.user.recommendBook(user.userId, {
        bookName: this.form.title,
        author: this.form.author,
        isbn: this.form.isbn,
        reason: this.form.reason
      }).then(res => {
        console.log('提交推荐API响应:', res);
        // 检查响应code，后端返回的是200，不是0
        if (res.code == 200 || res.code == '200' || res.code == 0 || res.code == '0') {
          ElMessage.success('图书推荐成功，等待审核');
          this.reset();
          this.loadRecommendations();
        } else {
          ElMessage.error(res.msg || res.message || '推荐失败');
        }
      }).catch(error => {
        console.error('推荐图书失败:', error);
        ElMessage.error('推荐图书失败');
      });
    },
    reset() {
      this.form = {
        title: '',
        author: '',
        isbn: '',
        reason: ''
      };
    },
    loadRecommendations() {
      // 调用API获取推荐记录
      const userStr = sessionStorage.getItem('user') || '{}';
      const user = JSON.parse(userStr);
      if (!user.userId) {
        return;
      }

      // 根据后端接口文档，查询推荐记录应该使用userId作为参数
      api.user.getRecommendRecords(user.userId).then(res => {
        console.log('推荐记录API响应:', res);
        // 检查响应code，后端返回的是200，不是0
        if (res.code == 200 || res.code == '200' || res.code == 0 || res.code == '0') {
          // 转换数据格式，适配前端显示
          this.recommendationList = Array.isArray(res.data) ? res.data.map(item => ({
            id: item.requestId,
            title: item.bookName,
            author: item.author,
            status: item.status === 0 ? 'PENDING' : item.status === 1 ? 'APPROVED' : item.status === 2 ? 'PURCHASING' : item.status === 3 ? 'STORED' : 'REJECTED',
            createTime: item.createdAt,
            remark: item.auditRemark
          })) : [];
          console.log('处理后的推荐记录:', this.recommendationList);
        }
      }).catch(error => {
        console.error('获取推荐记录失败:', error);
        ElMessage.error('获取推荐记录失败');
      });
    }
  },
  created() {
    this.loadRecommendations();
  }
};
</script>

<style scoped>
.book-recommendation {
  padding: 20px;
}

.recommendation-list {
  margin-top: 20px;
}

h2 {
  font-size: 20px;
  margin-bottom: 20px;
  color: #333;
}

h3 {
  font-size: 16px;
  margin-bottom: 15px;
  color: #666;
}
</style>