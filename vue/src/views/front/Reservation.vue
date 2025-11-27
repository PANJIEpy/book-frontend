<template>
  <div class="reservation-container">
    <h2>图书预约</h2>
    
    <el-tabs v-model="activeTab" type="card" class="reservation-tabs">
      <!-- 预约申请 -->
      <el-tab-pane label="预约申请" name="apply">
        <el-card shadow="hover">
          <div class="apply-section">
            <h3>预约申请</h3>
            <el-form :model="reservationForm" ref="reservationForm" label-width="100px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="图书名称" required>
                    <el-input v-model="reservationForm.bookName" placeholder="请输入图书名称" clearable></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="ISBN">
                    <el-input v-model="reservationForm.isbn" placeholder="请输入ISBN" clearable></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="作者">
                    <el-input v-model="reservationForm.author" placeholder="请输入作者" clearable></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="取书地点" required>
                    <el-select v-model="reservationForm.pickupLocation" placeholder="请选择取书地点">
                      <el-option label="主校区图书馆" value="main-campus"></el-option>
                      <el-option label="东校区图书馆" value="east-campus"></el-option>
                      <el-option label="西校区图书馆" value="west-campus"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-form-item label="备注">
                <el-input type="textarea" v-model="reservationForm.remark" placeholder="请输入备注" :rows="3"></el-input>
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="handleApply">提交预约</el-button>
                <el-button @click="resetForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-tab-pane>
      
      <!-- 我的预约 -->
      <el-tab-pane label="我的预约" name="my-reservation">
        <el-card shadow="hover">
          <div class="my-reservation-section">
            <h3>预约记录</h3>
            <div class="filter-section">
              <el-select v-model="reservationStatus" placeholder="选择状态" size="small">
                <el-option label="全部" value=""></el-option>
                <el-option label="待取书" value="0"></el-option>
                <el-option label="已取书" value="1"></el-option>
                <el-option label="已取消" value="2"></el-option>
                <el-option label="已过期" value="3"></el-option>
              </el-select>
            </div>
            
            <el-table :data="reservationRecords" style="width: 100%">
              <el-table-column prop="bookName" label="图书名称" width="200"></el-table-column>
              <el-table-column prop="author" label="作者" width="120"></el-table-column>
              <el-table-column prop="applyTime" label="预约时间"></el-table-column>
              <el-table-column prop="expireTime" label="过期时间"></el-table-column>
              <el-table-column prop="pickupLocation" label="取书地点">
                <template #default="scope">
                  {{ getLocationText(scope.row.pickupLocation) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">
                    {{ getStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="handlePickup(scope.row)" v-if="scope.row.status === 0">
                    确认取书
                  </el-button>
                  <el-button type="danger" size="small" @click="handleCancel(scope.row)" v-if="scope.row.status === 0">
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
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              ></el-pagination>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
      
      <!-- 预约规则 -->
      <el-tab-pane label="预约规则" name="rules">
        <el-card shadow="hover">
          <div class="rules-section">
            <h3>预约规则说明</h3>
            <div class="rules-content">
              <div class="rule-item">
                <h4>1. 预约条件</h4>
                <ul>
                  <li>图书已被借出时可预约</li>
                  <li>同一图书只能预约一次</li>
                  <li>无超期未取记录</li>
                  <li>未达到预约上限（最多同时预约3本）</li>
                </ul>
              </div>
              
              <div class="rule-item">
                <h4>2. 预约流程</h4>
                <ul>
                  <li>提交预约申请</li>
                  <li>系统自动加入预约队列（按申请时间排序）</li>
                  <li>图书归还后自动通知队列首位用户</li>
                  <li>用户在3天内到指定地点取书</li>
                </ul>
              </div>
              
              <div class="rule-item">
                <h4>3. 预约期限</h4>
                <ul>
                  <li>预约有效期：30天</li>
                  <li>到书后取书期限：3天</li>
                  <li>逾期未取自动取消预约</li>
                  <li>连续2次逾期未取，暂停预约权限1个月</li>
                </ul>
              </div>
              
              <div class="rule-item">
                <h4>4. 取消预约</h4>
                <ul>
                  <li>待取书状态前可取消预约</li>
                  <li>取消预约不影响信用记录</li>
                  <li>逾期未取视为违约</li>
                </ul>
              </div>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 预约确认对话框 -->
    <el-dialog v-model="showConfirmDialog" title="预约确认" width="500px">
      <div class="confirm-dialog">
        <p>您确定要预约《{{ reservationForm.bookName }}》吗？</p>
        <p class="confirm-info">
          取书地点：{{ getLocationText(reservationForm.pickupLocation) }}
        </p>
        <p class="confirm-info">
          预约有效期：30天
        </p>
        <p class="confirm-info">
          到书后请在3天内取书
        </p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showConfirmDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmApply">确定预约</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus';

export default {
  name: 'Reservation',
  data() {
    return {
      activeTab: 'apply',
      
      // 预约表单
      reservationForm: {
        bookName: '',
        isbn: '',
        author: '',
        pickupLocation: 'main-campus',
        remark: ''
      },
      
      // 预约记录
      reservationStatus: '',
      reservationRecords: [
        { 
          id: 1, 
          bookName: 'Python编程：从入门到实践', 
          author: 'Eric Matthes', 
          applyTime: '2025-11-20', 
          expireTime: '2025-11-27', 
          pickupLocation: 'main-campus', 
          status: 0 
        },
        { 
          id: 2, 
          bookName: 'Java核心技术', 
          author: 'Cay S. Horstmann', 
          applyTime: '2025-11-15', 
          expireTime: '2025-11-22', 
          pickupLocation: 'east-campus', 
          status: 1 
        },
        { 
          id: 3, 
          bookName: '数据结构与算法分析', 
          author: 'Mark Allen Weiss', 
          applyTime: '2025-11-10', 
          expireTime: '2025-11-17', 
          pickupLocation: 'west-campus', 
          status: 2 
        },
        { 
          id: 4, 
          bookName: '操作系统', 
          author: '汤小丹', 
          applyTime: '2025-11-05', 
          expireTime: '2025-11-12', 
          pickupLocation: 'main-campus', 
          status: 3 
        }
      ],
      reservationTotal: 4,
      reservationCurrentPage: 1,
      reservationPageSize: 10,
      
      // 对话框
      showConfirmDialog: false
    };
  },
  methods: {
    // 提交预约
    handleApply() {
      this.$refs.reservationForm.validate((valid) => {
        if (valid) {
          this.showConfirmDialog = true;
        }
      });
    },
    
    // 确认预约
    confirmApply() {
      ElMessage.success('预约申请已提交，正在处理中');
      this.showConfirmDialog = false;
      this.resetForm();
    },
    
    // 重置表单
    resetForm() {
      this.reservationForm = {
        bookName: '',
        isbn: '',
        author: '',
        pickupLocation: 'main-campus',
        remark: ''
      };
      this.$refs.reservationForm.resetFields();
    },
    
    // 获取地点文本
    getLocationText(location) {
      const locationMap = {
        'main-campus': '主校区图书馆',
        'east-campus': '东校区图书馆',
        'west-campus': '西校区图书馆'
      };
      return locationMap[location] || location;
    },
    
    // 获取状态类型
    getStatusType(status) {
      const typeMap = {
        0: 'warning',
        1: 'success',
        2: 'info',
        3: 'danger'
      };
      return typeMap[status] || 'info';
    },
    
    // 获取状态文本
    getStatusText(status) {
      const textMap = {
        0: '待取书',
        1: '已取书',
        2: '已取消',
        3: '已过期'
      };
      return textMap[status] || '未知';
    },
    
    // 确认取书
    handlePickup(record) {
      ElMessage.success('取书成功');
      record.status = 1; // 已取书
    },
    
    // 取消预约
    handleCancel(record) {
      ElMessage.success('预约已取消');
      record.status = 2; // 已取消
    },
    
    // 分页
    handleSizeChange(size) {
      this.reservationPageSize = size;
    },
    handleCurrentChange(current) {
      this.reservationCurrentPage = current;
    }
  }
};
</script>

<style scoped>
.reservation-container {
  width: 100%;
}

.reservation-tabs {
  margin-top: 20px;
}

.apply-section, .my-reservation-section, .rules-section {
  padding: 10px 0;
}

.apply-section h3, .my-reservation-section h3, .rules-section h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
}

.filter-section {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-end;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
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
.confirm-dialog p {
  margin: 0 0 10px 0;
  font-size: 14px;
}

.confirm-info {
  color: #606266;
}
</style>