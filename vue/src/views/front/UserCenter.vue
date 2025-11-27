<template>
  <div class="user-center-container">
    <h2>用户中心</h2>
    
    <el-tabs v-model="activeTab" type="card" class="user-tabs">
      <!-- 个人信息 -->
      <el-tab-pane label="个人信息" name="info">
        <el-card shadow="hover">
          <el-form :model="userInfo" ref="userForm" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="学号/工号">
                  <el-input v-model="userInfo.username" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="真实姓名">
                  <el-input v-model="userInfo.realName"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="用户类型">
                  <el-select v-model="userInfo.userType" disabled>
                    <el-option label="学生" value="STUDENT"></el-option>
                    <el-option label="教师" value="TEACHER"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="院系/部门">
                  <el-input v-model="userInfo.deptName"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="联系电话">
                  <el-input v-model="userInfo.phone"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="最大借阅额度">
                  <el-input-number v-model="userInfo.maxBorrowQuota" :min="1" :max="99" disabled></el-input-number>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="当前借阅数">
                  <el-input v-model="currentBorrowCount" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="状态">
                  <el-tag :type="userInfo.status === 1 ? 'success' : 'danger'">
                    {{ userInfo.status === 1 ? '正常' : '禁用' }}
                  </el-tag>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item>
              <el-button type="primary" @click="updateUserInfo">保存修改</el-button>
              <el-button @click="resetForm">重置</el-button>
              <el-button type="warning" @click="showChangePasswordDialog = true">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <!-- 借阅记录 -->
      <el-tab-pane label="借阅记录" name="borrow">
        <el-card shadow="hover">
          <div class="tab-header">
            <el-select v-model="borrowStatus" placeholder="选择状态" size="small">
              <el-option label="全部" value=""></el-option>
              <el-option label="未还" value="0"></el-option>
              <el-option label="已还" value="1"></el-option>
            </el-select>
          </div>
          
          <el-table :data="borrowRecords" style="width: 100%">
            <el-table-column prop="bookName" label="图书名称" width="200"></el-table-column>
            <el-table-column prop="author" label="作者" width="120"></el-table-column>
            <el-table-column prop="borrowTime" label="借阅时间"></el-table-column>
            <el-table-column prop="dueTime" label="应还时间"></el-table-column>
            <el-table-column prop="returnTime" label="实际还书时间" v-if="borrowStatus === '1'"></el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag :type="scope.row.status === 0 ? 'warning' : 'success'">
                  {{ scope.row.status === 0 ? '未还' : '已还' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" v-if="borrowStatus === '0'">
              <template #default="scope">
                <el-button type="primary" size="small" @click="handleRenew(scope.row)" :disabled="scope.row.canRenew === false">
                  续借
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination">
            <el-pagination
              layout="total, sizes, prev, pager, next, jumper"
              :total="borrowTotal"
              :page-size="borrowPageSize"
              :current-page="borrowCurrentPage"
              @size-change="handleBorrowSizeChange"
              @current-change="handleBorrowCurrentChange"
            ></el-pagination>
          </div>
        </el-card>
      </el-tab-pane>
      
      <!-- 预约记录 -->
      <el-tab-pane label="预约记录" name="reservation">
        <el-card shadow="hover">
          <div class="tab-header">
            <el-select v-model="reservationStatus" placeholder="选择状态" size="small">
              <el-option label="全部" value=""></el-option>
              <el-option label="待取书" value="0"></el-option>
              <el-option label="已取书" value="1"></el-option>
              <el-option label="已取消" value="2"></el-option>
            </el-select>
          </div>
          
          <el-table :data="reservationRecords" style="width: 100%">
            <el-table-column prop="bookName" label="图书名称" width="200"></el-table-column>
            <el-table-column prop="author" label="作者" width="120"></el-table-column>
            <el-table-column prop="reserveTime" label="预约时间"></el-table-column>
            <el-table-column prop="expireTime" label="过期时间"></el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag
                  :type="scope.row.status === 0 ? 'warning' : scope.row.status === 1 ? 'success' : 'info'"
                >
                  {{ scope.row.status === 0 ? '待取书' : scope.row.status === 1 ? '已取书' : '已取消' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" v-if="reservationStatus === '0'">
              <template #default="scope">
                <el-button type="danger" size="small" @click="handleCancelReservation(scope.row)">
                  取消预约
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination">
            <el-pagination
              layout="total, sizes, prev, pager, next, jumper"
              :total="reservationTotal"
              :page-size="reservationPageSize"
              :current-page="reservationCurrentPage"
              @size-change="handleReservationSizeChange"
              @current-change="handleReservationCurrentChange"
            ></el-pagination>
          </div>
        </el-card>
      </el-tab-pane>
      
      <!-- 违规记录 -->
      <el-tab-pane label="违规记录" name="violation">
        <el-card shadow="hover">
          <el-table :data="violationRecords" style="width: 100%">
            <el-table-column prop="bookName" label="图书名称" width="200"></el-table-column>
            <el-table-column prop="violationType" label="违规类型">
              <template #default="scope">
                <el-tag type="danger">{{ scope.row.violationType }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="violationTime" label="违规时间"></el-table-column>
            <el-table-column prop="fineAmount" label="罚款金额"></el-table-column>
            <el-table-column prop="status" label="处理状态">
              <template #default="scope">
                <el-tag :type="scope.row.status === 0 ? 'warning' : 'success'">
                  {{ scope.row.status === 0 ? '未处理' : '已处理' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" v-if="violationStatus === '0'">
              <template #default="scope">
                <el-button type="primary" size="small" @click="handlePayFine(scope.row)">
                  缴纳罚款
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination">
            <el-pagination
              layout="total, sizes, prev, pager, next, jumper"
              :total="violationTotal"
              :page-size="violationPageSize"
              :current-page="violationCurrentPage"
              @size-change="handleViolationSizeChange"
              @current-change="handleViolationCurrentChange"
            ></el-pagination>
          </div>
        </el-card>
      </el-tab-pane>
      
      <!-- 收藏图书 -->
      <el-tab-pane label="收藏图书" name="collection">
        <el-card shadow="hover">
          <div class="book-collection-list">
            <div class="collection-item" v-for="book in collectionBooks" :key="book.id">
              <div class="book-cover">
                <img :src="book.coverUrl || defaultCover" alt="图书封面">
              </div>
              <div class="book-info">
                <h4>{{ book.bookName }}</h4>
                <p class="author">{{ book.author }}</p>
                <div class="book-status">
                  <el-tag :type="book.availableCount > 0 ? 'success' : 'warning'">
                    {{ book.availableCount > 0 ? '可借' : '已借完' }}
                  </el-tag>
                </div>
                <div class="collection-actions">
                  <el-button type="primary" size="small" @click="handleBorrowFromCollection(book)">
                    立即借阅
                  </el-button>
                  <el-button type="danger" size="small" @click="handleCancelCollection(book)">
                    取消收藏
                  </el-button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="pagination">
            <el-pagination
              layout="total, sizes, prev, pager, next, jumper"
              :total="collectionTotal"
              :page-size="collectionPageSize"
              :current-page="collectionCurrentPage"
              @size-change="handleCollectionSizeChange"
              @current-change="handleCollectionCurrentChange"
            ></el-pagination>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 修改密码对话框 -->
    <el-dialog v-model="showChangePasswordDialog" title="修改密码" width="500px">
      <el-form :model="passwordForm" ref="passwordForm" label-width="120px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showChangePasswordDialog = false">取消</el-button>
          <el-button type="primary" @click="handleChangePassword">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus';

export default {
  name: 'UserCenter',
  data() {
    return {
      activeTab: 'info',
      userInfo: {
        username: '',
        realName: '',
        userType: 'STUDENT',
        deptName: '',
        phone: '',
        maxBorrowQuota: 5,
        status: 1
      },
      currentBorrowCount: 2,
      
      // 借阅记录
      borrowStatus: '',
      borrowRecords: [
        { id: 1, bookName: 'Vue.js实战', author: '梁灏', borrowTime: '2025-11-01', dueTime: '2025-12-01', returnTime: '', status: 0, canRenew: true },
        { id: 2, bookName: 'JavaScript高级程序设计', author: 'Nicholas C. Zakas', borrowTime: '2025-10-15', dueTime: '2025-11-15', returnTime: '', status: 0, canRenew: false }
      ],
      borrowTotal: 2,
      borrowCurrentPage: 1,
      borrowPageSize: 10,
      
      // 预约记录
      reservationStatus: '',
      reservationRecords: [
        { id: 1, bookName: 'Python编程：从入门到实践', author: 'Eric Matthes', reserveTime: '2025-11-20', expireTime: '2025-11-27', status: 0 },
        { id: 2, bookName: 'Java核心技术', author: 'Cay S. Horstmann', reserveTime: '2025-11-15', expireTime: '2025-11-22', status: 1 }
      ],
      reservationTotal: 2,
      reservationCurrentPage: 1,
      reservationPageSize: 10,
      
      // 违规记录
      violationStatus: '',
      violationRecords: [
        { id: 1, bookName: '数据结构', author: '严蔚敏', violationType: '逾期未还', violationTime: '2025-10-01', fineAmount: 5.00, status: 1 },
        { id: 2, bookName: '操作系统', author: '汤小丹', violationType: '损坏图书', violationTime: '2025-09-15', fineAmount: 10.00, status: 0 }
      ],
      violationTotal: 2,
      violationCurrentPage: 1,
      violationPageSize: 10,
      
      // 收藏图书
      collectionBooks: [
        { id: 1, bookName: '深度学习', author: 'Ian Goodfellow', coverUrl: '', availableCount: 3 },
        { id: 2, bookName: '人工智能导论', author: 'Stuart Russell', coverUrl: '', availableCount: 0 }
      ],
      collectionTotal: 2,
      collectionCurrentPage: 1,
      collectionPageSize: 10,
      defaultCover: '',
      
      // 修改密码
      showChangePasswordDialog: false,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    };
  },
  created() {
    this.loadUserInfo();
  },
  methods: {
    loadUserInfo() {
      let userStr = sessionStorage.getItem('user') || '{}';
      let user = JSON.parse(userStr);
      this.userInfo = {
        username: user.username || '',
        realName: user.realName || '',
        userType: user.userType || 'STUDENT',
        deptName: user.deptName || '',
        phone: user.phone || '',
        maxBorrowQuota: user.maxBorrowQuota || 5,
        status: user.status || 1
      };
    },
    
    // 更新用户信息
    updateUserInfo() {
      this.$refs.userForm.validate((valid) => {
        if (valid) {
          // 模拟更新
          ElMessage.success('个人信息更新成功');
          // 更新sessionStorage中的用户信息
          let userStr = sessionStorage.getItem('user') || '{}';
          let user = JSON.parse(userStr);
          user.realName = this.userInfo.realName;
          user.deptName = this.userInfo.deptName;
          user.phone = this.userInfo.phone;
          sessionStorage.setItem('user', JSON.stringify(user));
        }
      });
    },
    
    // 重置表单
    resetForm() {
      this.loadUserInfo();
    },
    
    // 修改密码
    handleChangePassword() {
      this.$refs.passwordForm.validate((valid) => {
        if (valid) {
          if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
            ElMessage.error('两次输入的密码不一致');
            return;
          }
          // 模拟修改密码
          ElMessage.success('密码修改成功');
          this.showChangePasswordDialog = false;
          this.passwordForm = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
        }
      });
    },
    
    // 续借
    handleRenew(record) {
      ElMessage.success('续借成功');
      record.canRenew = false;
      // 模拟延长借阅期限
      let dueDate = new Date(record.dueTime);
      dueDate.setDate(dueDate.getDate() + 30);
      record.dueTime = dueDate.toISOString().split('T')[0];
    },
    
    // 取消预约
    handleCancelReservation(record) {
      ElMessage.success('预约已取消');
      record.status = 2;
    },
    
    // 缴纳罚款
    handlePayFine(record) {
      ElMessage.success('罚款缴纳成功');
      record.status = 1;
    },
    
    // 从收藏借阅
    handleBorrowFromCollection(book) {
      ElMessage.success('借阅申请已提交');
    },
    
    // 取消收藏
    handleCancelCollection(book) {
      ElMessage.success('收藏已取消');
      this.collectionBooks = this.collectionBooks.filter(item => item.id !== book.id);
      this.collectionTotal--;
    },
    
    // 借阅记录分页
    handleBorrowSizeChange(size) {
      this.borrowPageSize = size;
    },
    handleBorrowCurrentChange(current) {
      this.borrowCurrentPage = current;
    },
    
    // 预约记录分页
    handleReservationSizeChange(size) {
      this.reservationPageSize = size;
    },
    handleReservationCurrentChange(current) {
      this.reservationCurrentPage = current;
    },
    
    // 违规记录分页
    handleViolationSizeChange(size) {
      this.violationPageSize = size;
    },
    handleViolationCurrentChange(current) {
      this.violationCurrentPage = current;
    },
    
    // 收藏图书分页
    handleCollectionSizeChange(size) {
      this.collectionPageSize = size;
    },
    handleCollectionCurrentChange(current) {
      this.collectionCurrentPage = current;
    }
  }
};
</script>

<style scoped>
.user-center-container {
  width: 100%;
}

.user-tabs {
  margin-top: 20px;
}

.tab-header {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-end;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.book-collection-list {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.collection-item {
  width: calc(25% - 15px);
  display: flex;
  flex-direction: column;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 10px;
  transition: all 0.3s;
}

.collection-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
}

.book-cover {
  width: 100%;
  height: 200px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-info .author {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #606266;
}

.book-status {
  margin-bottom: 15px;
}

.collection-actions {
  display: flex;
  gap: 10px;
}
</style>