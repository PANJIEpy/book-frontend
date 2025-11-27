<template>
  <div class="borrow-container">
    <h2>借阅与续借</h2>
    
    <el-tabs v-model="activeTab" type="card" class="borrow-tabs">
      <!-- 借阅申请 -->
      <el-tab-pane label="借阅申请" name="apply">
        <el-card shadow="hover">
          <div class="apply-section">
            <h3>借阅申请记录</h3>
            <el-table :data="borrowApplications" style="width: 100%">
              <el-table-column prop="bookName" label="图书名称" width="200"></el-table-column>
              <el-table-column prop="author" label="作者" width="120"></el-table-column>
              <el-table-column prop="applyTime" label="申请时间"></el-table-column>
              <el-table-column prop="status" label="状态">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">
                    {{ getStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="拒绝原因">
                <template #default="scope">
                  <span v-if="activeTab === 'apply' && scope.row.status === 2">{{ scope.row.reason }}</span>
                  <span v-else-if="activeTab === 'apply' && scope.row.status !== 2">-</span>
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button type="danger" size="small" @click="handleCancelApply(scope.row)" v-if="scope.row.status === 0">
                    取消申请
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination">
              <el-pagination
                layout="total, sizes, prev, pager, next, jumper"
                :total="applyTotal"
                :page-size="applyPageSize"
                :current-page="applyCurrentPage"
                @size-change="handleApplySizeChange"
                @current-change="handleApplyCurrentChange"
              ></el-pagination>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
      
      <!-- 我的借阅 -->
      <el-tab-pane label="我的借阅" name="my-borrow">
        <el-card shadow="hover">
          <div class="my-borrow-section">
            <h3>当前借阅图书</h3>
            <el-table :data="currentBorrows" style="width: 100%">
              <el-table-column prop="bookName" label="图书名称" width="200"></el-table-column>
              <el-table-column prop="author" label="作者" width="120"></el-table-column>
              <el-table-column prop="borrowTime" label="借阅时间"></el-table-column>
              <el-table-column prop="dueTime" label="应还时间">
                <template #default="scope">
                  <span :class="getDueTimeClass(scope.row.dueTime)">
                    {{ scope.row.dueTime }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="renewCount" label="续借次数"></el-table-column>
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="handleRenew(scope.row)" :disabled="scope.row.renewCount >= 2">
                    续借
                  </el-button>
                  <el-button type="success" size="small" @click="handleReturn(scope.row)">
                    归还
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
          </div>
        </el-card>
      </el-tab-pane>
      
      <!-- 借阅规则 -->
      <el-tab-pane label="借阅规则" name="rules">
        <el-card shadow="hover">
          <div class="rules-section">
            <h3>借阅规则说明</h3>
            <div class="rules-content">
              <div class="rule-item">
                <h4>1. 借阅期限</h4>
                <ul>
                  <li>学生：每本书可借30天，最多可续借2次，每次续借15天</li>
                  <li>教师：每本书可借60天，最多可续借2次，每次续借30天</li>
                </ul>
              </div>
              
              <div class="rule-item">
                <h4>2. 借阅额度</h4>
                <ul>
                  <li>学生：最多可同时借阅5本书</li>
                  <li>教师：最多可同时借阅10本书</li>
                </ul>
              </div>
              
              <div class="rule-item">
                <h4>3. 逾期罚款</h4>
                <ul>
                  <li>逾期1-7天：0.5元/天</li>
                  <li>逾期8-30天：1元/天</li>
                  <li>逾期30天以上：2元/天，上限20元</li>
                </ul>
              </div>
              
              <div class="rule-item">
                <h4>4. 违规处理</h4>
                <ul>
                  <li>逾期未还：暂停借阅权限，直至归还图书并缴纳罚款</li>
                  <li>损坏图书：按图书定价的50%-100%赔偿</li>
                  <li>丢失图书：按图书定价的100%-200%赔偿</li>
                </ul>
              </div>
              
              <div class="rule-item">
                <h4>5. 其他说明</h4>
                <ul>
                  <li>支持跨校区借阅，需在申请时选择取书地点</li>
                  <li>预约图书需在到书后3天内取书，逾期未取将取消预约</li>
                  <li>每月可免费打印10张图书资料，超出部分0.1元/张</li>
                </ul>
              </div>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 续借确认对话框 -->
    <el-dialog v-model="showRenewDialog" title="续借确认" width="500px">
      <div class="renew-dialog">
        <p>您确定要续借《{{ currentRenewBook.bookName }}》吗？</p>
        <p class="renew-info">
          当前借阅期限：{{ currentRenewBook.borrowTime }} - {{ currentRenewBook.dueTime }}
        </p>
        <p class="renew-info">
          续借后期限：{{ currentRenewBook.dueTime }} - {{ calculateNewDueTime(currentRenewBook.dueTime) }}
        </p>
        <p class="renew-info">
          已续借次数：{{ currentRenewBook.renewCount }} / 2
        </p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRenewDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmRenew">确定续借</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 归还确认对话框 -->
    <el-dialog v-model="showReturnDialog" title="归还确认" width="500px">
      <div class="return-dialog">
        <p>您确定要归还《{{ currentReturnBook.bookName }}》吗？</p>
        <p class="return-info">
          借阅时间：{{ currentReturnBook.borrowTime }} - {{ currentReturnBook.dueTime }}
        </p>
        <p class="return-info">
          实际归还时间：{{ new Date().toISOString().split('T')[0] }}
        </p>
        <el-form-item label="归还方式">
          <el-radio-group v-model="returnForm.returnMethod">
            <el-radio label="线下还书点">线下还书点</el-radio>
            <el-radio label="自助还书机">自助还书机</el-radio>
          </el-radio-group>
        </el-form-item>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showReturnDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmReturn">确定归还</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus';

export default {
  name: 'Borrow',
  data() {
    return {
      activeTab: 'apply',
      
      // 借阅申请
      borrowApplications: [
        { id: 1, bookName: 'Vue.js实战', author: '梁灏', applyTime: '2025-11-20', status: 0, reason: '' },
        { id: 2, bookName: 'JavaScript高级程序设计', author: 'Nicholas C. Zakas', applyTime: '2025-11-15', status: 1, reason: '' },
        { id: 3, bookName: 'Python编程：从入门到实践', author: 'Eric Matthes', applyTime: '2025-11-10', status: 2, reason: '超出借阅额度' }
      ],
      applyTotal: 3,
      applyCurrentPage: 1,
      applyPageSize: 10,
      
      // 当前借阅
      currentBorrows: [
        { 
          id: 1, 
          bookName: 'Vue.js实战', 
          author: '梁灏', 
          borrowTime: '2025-11-01', 
          dueTime: '2025-12-01', 
          renewCount: 0 
        },
        { 
          id: 2, 
          bookName: 'JavaScript高级程序设计', 
          author: 'Nicholas C. Zakas', 
          borrowTime: '2025-10-15', 
          dueTime: '2025-11-15', 
          renewCount: 1 
        },
        { 
          id: 3, 
          bookName: '数据结构', 
          author: '严蔚敏', 
          borrowTime: '2025-09-20', 
          dueTime: '2025-10-20', 
          renewCount: 2 
        }
      ],
      borrowTotal: 3,
      borrowCurrentPage: 1,
      borrowPageSize: 10,
      
      // 续借对话框
      showRenewDialog: false,
      currentRenewBook: {},
      
      // 归还对话框
      showReturnDialog: false,
      currentReturnBook: {},
      returnForm: {
        returnMethod: '线下还书点'
      }
    };
  },
  methods: {
    // 获取状态类型
    getStatusType(status) {
      const typeMap = {
        0: 'warning',
        1: 'success',
        2: 'danger'
      };
      return typeMap[status] || 'info';
    },
    
    // 获取状态文本
    getStatusText(status) {
      const textMap = {
        0: '待审核',
        1: '已通过',
        2: '已拒绝'
      };
      return textMap[status] || '未知';
    },
    
    // 获取应还时间样式类
    getDueTimeClass(dueTime) {
      const today = new Date();
      const dueDate = new Date(dueTime);
      const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return 'overdue';
      } else if (diffDays <= 3) {
        return 'warning';
      } else {
        return '';
      }
    },
    
    // 取消申请
    handleCancelApply(application) {
      ElMessage.success('借阅申请已取消');
      application.status = 3; // 已取消
    },
    
    // 续借
    handleRenew(book) {
      this.currentRenewBook = { ...book };
      this.showRenewDialog = true;
    },
    
    // 确认续借
    confirmRenew() {
      ElMessage.success('续借成功');
      // 更新续借次数和应还时间
      const book = this.currentBorrows.find(item => item.id === this.currentRenewBook.id);
      if (book) {
        book.renewCount += 1;
        book.dueTime = this.calculateNewDueTime(book.dueTime);
      }
      this.showRenewDialog = false;
    },
    
    // 计算新的应还时间
    calculateNewDueTime(dueTime) {
      const date = new Date(dueTime);
      date.setDate(date.getDate() + 15); // 续借15天
      return date.toISOString().split('T')[0];
    },
    
    // 归还
    handleReturn(book) {
      this.currentReturnBook = { ...book };
      this.showReturnDialog = true;
    },
    
    // 确认归还
    confirmReturn() {
      ElMessage.success('归还成功');
      // 从当前借阅列表中移除
      this.currentBorrows = this.currentBorrows.filter(item => item.id !== this.currentReturnBook.id);
      this.borrowTotal--;
      this.showReturnDialog = false;
    },
    
    // 借阅申请分页
    handleApplySizeChange(size) {
      this.applyPageSize = size;
    },
    handleApplyCurrentChange(current) {
      this.applyCurrentPage = current;
    },
    
    // 当前借阅分页
    handleBorrowSizeChange(size) {
      this.borrowPageSize = size;
    },
    handleBorrowCurrentChange(current) {
      this.borrowCurrentPage = current;
    }
  }
};
</script>

<style scoped>
.borrow-container {
  width: 100%;
}

.borrow-tabs {
  margin-top: 20px;
}

.apply-section, .my-borrow-section, .rules-section {
  padding: 10px 0;
}

.apply-section h3, .my-borrow-section h3, .rules-section h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 应还时间样式 */
.overdue {
  color: #f56c6c;
  font-weight: 600;
}

.warning {
  color: #e6a23c;
  font-weight: 600;
}

/* 规则样式 */
.rules-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.rule-item h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
}

.rule-item ul {
  margin: 0;
  padding-left: 20px;
}

.rule-item li {
  margin-bottom: 5px;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

/* 对话框样式 */
.renew-dialog p, .return-dialog p {
  margin: 0 0 10px 0;
  font-size: 14px;
}

.renew-info, .return-info {
  color: #606266;
}
</style>