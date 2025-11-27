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
        <el-form-item label="出版社">
          <el-input v-model="form.publisher" placeholder="请输入出版社"></el-input>
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
            <el-tag :type="scope.row.status === 'PENDING' ? 'warning' : scope.row.status === 'APPROVED' ? 'success' : 'danger'">
              {{ scope.row.status === 'PENDING' ? '待审核' : scope.row.status === 'APPROVED' ? '已通过' : '已驳回' }}
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
      recommendationList: [
        {
          id: 1,
          title: 'JavaScript高级程序设计',
          author: 'Nicholas C. Zakas',
          status: 'PENDING',
          createTime: '2023-10-01 10:00:00',
          remark: ''
        },
        {
          id: 2,
          title: '深入理解计算机系统',
          author: 'Randal E. Bryant',
          status: 'APPROVED',
          createTime: '2023-09-15 14:30:00',
          remark: '推荐理由充分，同意采购'
        },
        {
          id: 3,
          title: '算法导论',
          author: 'Thomas H. Cormen',
          status: 'REJECTED',
          createTime: '2023-09-01 09:15:00',
          remark: '已有相同版本，暂不采购'
        }
      ]
    };
  },
  methods: {
    submit() {
      // 表单验证
      if (!this.form.title || !this.form.author || !this.form.reason) {
        ElMessage.warning('请填写必填项');
        return;
      }

      // 模拟API调用
      ElMessage.success('图书推荐成功，等待审核');
      this.reset();
      // 实际项目中应该调用API提交推荐
      // api.bookRecommendation.submit(this.form).then(res => {
      //   if (res.code === 0) {
      //     ElMessage.success('图书推荐成功，等待审核');
      //     this.reset();
      //     this.loadRecommendations();
      //   } else {
      //     ElMessage.error(res.msg || '推荐失败');
      //   }
      // });
    },
    reset() {
      this.form = {
        title: '',
        author: '',
        publisher: '',
        isbn: '',
        reason: ''
      };
    },
    loadRecommendations() {
      // 模拟加载推荐记录
      // api.bookRecommendation.getList().then(res => {
      //   if (res.code === 0) {
      //     this.recommendationList = res.data;
      //   }
      // });
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