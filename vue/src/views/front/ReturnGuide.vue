<template>
  <div class="return-guide-container">
    <h2>归还指引</h2>
    
    <el-tabs v-model="activeTab" type="card" class="return-tabs">
      <!-- 待还图书 -->
      <el-tab-pane label="待还图书" name="pending">
        <el-card shadow="hover">
          <div class="pending-section">
            <h3>待还图书</h3>
            <el-table :data="pendingBooks" style="width: 100%">
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
              <el-table-column prop="overdueDays" label="逾期天数" v-if="scope.row.overdueDays > 0">
                <template #default="scope">
                  <span class="overdue-days">
                    {{ scope.row.overdueDays }} 天
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="fineAmount" label="罚款金额" v-if="scope.row.fineAmount > 0">
                <template #default="scope">
                  <span class="fine-amount">
                    {{ scope.row.fineAmount }} 元
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button type="success" size="small" @click="handleReturn(scope.row)">
                    立即归还
                  </el-button>
                  <el-button type="primary" size="small" @click="handlePayFine(scope.row)" v-if="scope.row.fineAmount > 0">
                    缴纳罚款
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination">
              <el-pagination
                layout="total, sizes, prev, pager, next, jumper"
                :total="pendingTotal"
                :page-size="pendingPageSize"
                :current-page="pendingCurrentPage"
                @size-change="handlePendingSizeChange"
                @current-change="handlePendingCurrentChange"
              ></el-pagination>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
      
      <!-- 还书点指引 -->
      <el-tab-pane label="还书点指引" name="location">
        <el-card shadow="hover">
          <div class="location-section">
            <h3>还书点指引</h3>
            
            <div class="location-tabs">
              <el-tabs v-model="activeLocationTab" type="border-card">
                <el-tab-pane label="线下还书点" name="offline">
                  <div class="offline-locations">
                    <div class="location-item" v-for="location in offlineLocations" :key="location.id">
                      <h4>{{ location.name }}</h4>
                      <p class="address">{{ location.address }}</p>
                      <p class="time">开放时间：{{ location.openTime }}</p>
                      <p class="phone">联系电话：{{ location.phone }}</p>
                      <el-button type="primary" size="small" @click="showLocationMap(location)">
                        查看地图
                      </el-button>
                    </div>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="自助还书机" name="self-service">
                  <div class="self-service-locations">
                    <div class="location-item" v-for="machine in selfServiceMachines" :key="machine.id">
                      <h4>{{ machine.name }}</h4>
                      <p class="address">{{ machine.address }}</p>
                      <p class="status">状态：<el-tag :type="machine.status === '正常' ? 'success' : 'danger'">{{ machine.status }}</el-tag></p>
                      <p class="usage">使用率：{{ machine.usageRate }}%</p>
                      <el-button type="primary" size="small" @click="showMachineGuide(machine)">
                        操作指南
                      </el-button>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
      
      <!-- 罚款缴纳 -->
      <el-tab-pane label="罚款缴纳" name="fine">
        <el-card shadow="hover">
          <div class="fine-section">
            <h3>罚款缴纳</h3>
            
            <div class="fine-info" v-if="totalFine > 0">
              <h4>待缴罚款总额：<span class="total-fine">{{ totalFine }} 元</span></h4>
              <el-button type="primary" size="large" @click="showPayDialog">
                立即缴纳
              </el-button>
            </div>
            <div class="no-fine" v-else>
              <el-empty description="暂无待缴罚款"></el-empty>
            </div>
            
            <div class="fine-rules">
              <h4>罚款规则</h4>
              <ul>
                <li>逾期1-7天：0.5元/天</li>
                <li>逾期8-30天：1元/天</li>
                <li>逾期30天以上：2元/天，上限20元</li>
                <li>损坏图书：按图书定价的50%-100%赔偿</li>
                <li>丢失图书：按图书定价的100%-200%赔偿</li>
              </ul>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
    
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
    
    <!-- 罚款缴纳对话框 -->
    <el-dialog v-model="showPayDialog" title="罚款缴纳" width="500px">
      <div class="pay-dialog">
        <h4>待缴罚款：<span class="pay-amount">{{ totalFine }} 元</span></h4>
        <el-form-item label="支付方式">
          <el-radio-group v-model="payForm.payMethod">
            <el-radio label="校园一卡通">校园一卡通</el-radio>
            <el-radio label="微信支付">微信支付</el-radio>
            <el-radio label="支付宝">支付宝</el-radio>
          </el-radio-group>
        </el-form-item>
        <div class="pay-info">
          <p>请确保您的支付账户余额充足</p>
          <p>缴纳成功后，您的借阅权限将自动恢复</p>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPayDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmPay">确认缴纳</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage, ElEmpty } from 'element-plus';

export default {
  name: 'ReturnGuide',
  components: {
    ElEmpty
  },
  data() {
    return {
      activeTab: 'pending',
      
      // 待还图书
      pendingBooks: [
        { 
          id: 1, 
          bookName: 'Vue.js实战', 
          author: '梁灏', 
          borrowTime: '2025-11-01', 
          dueTime: '2025-12-01', 
          overdueDays: 0, 
          fineAmount: 0 
        },
        { 
          id: 2, 
          bookName: 'JavaScript高级程序设计', 
          author: 'Nicholas C. Zakas', 
          borrowTime: '2025-10-15', 
          dueTime: '2025-11-15', 
          overdueDays: 12, 
          fineAmount: 6.00 
        },
        { 
          id: 3, 
          bookName: '数据结构', 
          author: '严蔚敏', 
          borrowTime: '2025-09-20', 
          dueTime: '2025-10-20', 
          overdueDays: 48, 
          fineAmount: 20.00 
        }
      ],
      pendingTotal: 3,
      pendingCurrentPage: 1,
      pendingPageSize: 10,
      
      // 还书点
      activeLocationTab: 'offline',
      offlineLocations: [
        { 
          id: 1, 
          name: '主校区图书馆总服务台', 
          address: '主校区图书馆1楼大厅', 
          openTime: '周一至周日 8:00-22:00', 
          phone: '010-12345678' 
        },
        { 
          id: 2, 
          name: '东校区图书馆服务台', 
          address: '东校区图书馆1楼大厅', 
          openTime: '周一至周日 8:30-21:30', 
          phone: '010-87654321' 
        },
        { 
          id: 3, 
          name: '西校区图书馆服务台', 
          address: '西校区图书馆1楼大厅', 
          openTime: '周一至周日 9:00-21:00', 
          phone: '010-11223344' 
        }
      ],
      selfServiceMachines: [
        { 
          id: 1, 
          name: '主校区图书馆自助还书机', 
          address: '主校区图书馆2楼大厅', 
          status: '正常', 
          usageRate: 65 
        },
        { 
          id: 2, 
          name: '东校区图书馆自助还书机', 
          address: '东校区图书馆2楼大厅', 
          status: '正常', 
          usageRate: 45 
        },
        { 
          id: 3, 
          name: '西校区图书馆自助还书机', 
          address: '西校区图书馆2楼大厅', 
          status: '故障', 
          usageRate: 0 
        }
      ],
      
      // 罚款信息
      totalFine: 26.00,
      
      // 对话框
      showReturnDialog: false,
      currentReturnBook: {},
      returnForm: {
        returnMethod: '线下还书点'
      },
      showPayDialog: false,
      payForm: {
        payMethod: '校园一卡通'
      }
    };
  },
  methods: {
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
    
    // 立即归还
    handleReturn(book) {
      this.currentReturnBook = { ...book };
      this.showReturnDialog = true;
    },
    
    // 确认归还
    confirmReturn() {
      ElMessage.success('归还成功');
      // 从待还列表中移除
      this.pendingBooks = this.pendingBooks.filter(item => item.id !== this.currentReturnBook.id);
      this.pendingTotal--;
      // 更新罚款总额
      this.totalFine -= this.currentReturnBook.fineAmount;
      this.showReturnDialog = false;
    },
    
    // 缴纳罚款
    handlePayFine(book) {
      ElMessage.success('罚款缴纳成功');
      // 清除罚款
      const pendingBook = this.pendingBooks.find(item => item.id === book.id);
      if (pendingBook) {
        this.totalFine -= pendingBook.fineAmount;
        pendingBook.fineAmount = 0;
        pendingBook.overdueDays = 0;
      }
    },
    
    // 查看地图
    showLocationMap(location) {
      ElMessage.info(`查看 ${location.name} 地图`);
    },
    
    // 操作指南
    showMachineGuide(machine) {
      ElMessage.info(`查看 ${machine.name} 操作指南`);
    },
    
    // 确认缴纳罚款
    confirmPay() {
      ElMessage.success('罚款缴纳成功');
      this.totalFine = 0;
      // 清除所有罚款
      this.pendingBooks.forEach(book => {
        book.fineAmount = 0;
        book.overdueDays = 0;
      });
      this.showPayDialog = false;
    },
    
    // 分页
    handlePendingSizeChange(size) {
      this.pendingPageSize = size;
    },
    handlePendingCurrentChange(current) {
      this.pendingCurrentPage = current;
    }
  }
};
</script>

<style scoped>
.return-guide-container {
  width: 100%;
}

.return-tabs {
  margin-top: 20px;
}

.pending-section, .location-section, .fine-section {
  padding: 10px 0;
}

.pending-section h3, .location-section h3, .fine-section h3 {
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

.overdue-days {
  color: #f56c6c;
  font-weight: 600;
}

.fine-amount {
  color: #f56c6c;
  font-weight: 600;
}

/* 还书点样式 */
.location-tabs {
  margin-top: 20px;
}

.location-item {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  transition: all 0.3s;
}

.location-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.location-item h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
}

.location-item .address, .location-item .time, .location-item .phone {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #606266;
}

/* 罚款样式 */
.fine-info {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  text-align: center;
}

.fine-info h4 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
}

.total-fine {
  color: #f56c6c;
  font-size: 24px;
  font-weight: 600;
}

.no-fine {
  margin: 40px 0;
}

.fine-rules {
  margin-top: 30px;
}

.fine-rules h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
}

.fine-rules ul {
  margin: 0;
  padding-left: 20px;
}

.fine-rules li {
  margin-bottom: 5px;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

/* 对话框样式 */
.return-dialog p, .pay-dialog p {
  margin: 0 0 10px 0;
  font-size: 14px;
}

.return-info, .pay-info {
  color: #606266;
}

.pay-amount {
  color: #f56c6c;
  font-size: 24px;
  font-weight: 600;
}
</style>