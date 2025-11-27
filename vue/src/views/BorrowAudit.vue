<template>
  <div class="borrow-audit-container" style="padding: 10px">
    <el-tabs v-model="activeTab" type="card">
      <!-- 待审核借阅申请 -->
      <el-tab-pane label="待审核借阅申请" name="pending">
        <div class="tab-content">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>待审核借阅申请列表</span>
                <el-button type="success" size="small" @click="refreshPendingList">刷新</el-button>
              </div>
            </template>
            
            <el-table :data="pendingList" stripe border @selection-change="handlePendingSelectionChange">
              <el-table-column type="selection" width="55" />
              <el-table-column prop="applyId" label="申请ID" width="120" sortable />
              <el-table-column prop="userId" label="申请人ID" width="100" />
              <el-table-column prop="userName" label="申请人" width="120" />
              <el-table-column prop="userType" label="用户类型" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.userType === 'STUDENT' ? 'info' : 'success'">
                    {{ scope.row.userType === 'STUDENT' ? '学生' : '教师' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="bookName" label="图书名称" min-width="200" />
              <el-table-column prop="isbn" label="ISBN" width="150" />
              <el-table-column prop="borrowType" label="借阅类型" width="120">
                <template #default="scope">
                  <el-tag type="warning">{{ scope.row.borrowType }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="applyTime" label="申请时间" width="180" sortable />
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button type="success" size="mini" @click="approveApply(scope.row)">通过</el-button>
                  <el-button type="danger" size="mini" @click="rejectApply(scope.row)">拒绝</el-button>
                  <el-button v-if="scope.row.userType === 'TEACHER'" type="info" size="mini" @click="longTermBorrow(scope.row)">长期借阅</el-button>
                  <el-button type="warning" size="mini" @click="crossCampusBorrow(scope.row)">跨校区</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="pendingPage.currentPage"
                v-model:page-size="pendingPage.pageSize"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="pendingList.length"
                @size-change="handlePendingSizeChange"
                @current-change="handlePendingCurrentChange"
              />
            </div>
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- 已审核借阅申请 -->
      <el-tab-pane label="已审核借阅申请" name="processed">
        <div class="tab-content">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>已审核借阅申请列表</span>
                <el-button type="success" size="small" @click="refreshProcessedList">刷新</el-button>
              </div>
            </template>
            
            <el-form :model="processedQuery" label-width="100px" inline style="margin-bottom: 15px">
              <el-form-item label="申请人">
                <el-input v-model="processedQuery.userName" placeholder="请输入申请人姓名" clearable />
              </el-form-item>
              <el-form-item label="审核结果">
                <el-select v-model="processedQuery.result" placeholder="选择审核结果" clearable>
                  <el-option label="通过" value="APPROVED" />
                  <el-option label="拒绝" value="REJECTED" />
                </el-select>
              </el-form-item>
              <el-form-item label="审核时间">
                <el-date-picker
                  v-model="processedQuery.auditTime"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchProcessed">查询</el-button>
                <el-button @click="clearProcessedQuery">清空</el-button>
              </el-form-item>
            </el-form>
            
            <el-table :data="filteredProcessedList" stripe border>
              <el-table-column prop="applyId" label="申请ID" width="120" sortable />
              <el-table-column prop="userId" label="申请人ID" width="100" />
              <el-table-column prop="userName" label="申请人" width="120" />
              <el-table-column prop="bookName" label="图书名称" min-width="200" />
              <el-table-column prop="isbn" label="ISBN" width="150" />
              <el-table-column prop="borrowType" label="借阅类型" width="120" />
              <el-table-column prop="auditResult" label="审核结果" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.auditResult === 'APPROVED' ? 'success' : 'danger'">
                    {{ scope.row.auditResult === 'APPROVED' ? '通过' : '拒绝' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="auditTime" label="审核时间" width="180" sortable />
              <el-table-column prop="auditor" label="审核人" width="120" />
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button type="primary" size="mini" @click="viewApplyDetail(scope.row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="processedPage.currentPage"
                v-model:page-size="processedPage.pageSize"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="filteredProcessedList.length"
                @size-change="handleProcessedSizeChange"
                @current-change="handleProcessedCurrentChange"
              />
            </div>
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- 审核日志查询 -->
      <el-tab-pane label="审核日志查询" name="log">
        <div class="tab-content">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>审核日志查询</span>
                <el-button type="success" size="small" @click="refreshLogList">刷新</el-button>
              </div>
            </template>
            
            <el-form :model="logQuery" label-width="100px" inline style="margin-bottom: 15px">
              <el-form-item label="申请人">
                <el-input v-model="logQuery.userName" placeholder="请输入申请人姓名" clearable />
              </el-form-item>
              <el-form-item label="审核人">
                <el-input v-model="logQuery.auditor" placeholder="请输入审核人姓名" clearable />
              </el-form-item>
              <el-form-item label="审核时间">
                <el-date-picker
                  v-model="logQuery.auditTime"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchLog">查询</el-button>
                <el-button @click="clearLogQuery">清空</el-button>
              </el-form-item>
            </el-form>
            
            <el-table :data="filteredLogList" stripe border>
              <el-table-column prop="logId" label="日志ID" width="120" sortable />
              <el-table-column prop="applyId" label="申请ID" width="120" />
              <el-table-column prop="userId" label="申请人ID" width="100" />
              <el-table-column prop="userName" label="申请人" width="120" />
              <el-table-column prop="bookName" label="图书名称" min-width="200" />
              <el-table-column prop="auditResult" label="审核结果" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.auditResult === 'APPROVED' ? 'success' : 'danger'">
                    {{ scope.row.auditResult === 'APPROVED' ? '通过' : '拒绝' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="auditTime" label="审核时间" width="180" sortable />
              <el-table-column prop="auditor" label="审核人" width="120" />
              <el-table-column prop="auditRemark" label="审核备注" min-width="200" />
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="logPage.currentPage"
                v-model:page-size="logPage.pageSize"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="filteredLogList.length"
                @size-change="handleLogSizeChange"
                @current-change="handleLogCurrentChange"
              />
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 审核对话框 -->
    <el-dialog v-model="showAuditDialog" :title="auditDialogTitle" width="500px">
      <el-descriptions :column="1" border style="margin-bottom: 20px">
        <el-descriptions-item label="申请ID">{{ currentApply.applyId }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ currentApply.userName }}</el-descriptions-item>
        <el-descriptions-item label="图书名称">{{ currentApply.bookName }}</el-descriptions-item>
        <el-descriptions-item label="ISBN">{{ currentApply.isbn }}</el-descriptions-item>
        <el-descriptions-item label="借阅类型">{{ currentApply.borrowType }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ currentApply.applyTime }}</el-descriptions-item>
        <el-descriptions-item label="申请备注">{{ currentApply.applyRemark || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <el-form :model="auditForm" label-width="100px">
        <el-form-item v-if="auditForm.result === 'REJECTED'" label="拒绝理由" required>
          <el-input v-model="auditForm.remark" type="textarea" rows="4" placeholder="请输入拒绝理由" />
        </el-form-item>
        <el-form-item v-if="auditForm.isLongTerm" label="长期借阅理由" required>
          <el-input v-model="auditForm.longTermReason" type="textarea" rows="4" placeholder="请输入长期借阅理由" />
        </el-form-item>
        <el-form-item v-if="auditForm.isCrossCampus" label="跨校区借阅说明" required>
          <el-input v-model="auditForm.crossCampusReason" type="textarea" rows="4" placeholder="请输入跨校区借阅说明" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAuditDialog = false">取消</el-button>
          <el-button type="primary" @click="submitAudit">确认审核</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 申请详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="借阅申请详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="申请ID">{{ currentDetail.applyId }}</el-descriptions-item>
        <el-descriptions-item label="申请人ID">{{ currentDetail.userId }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ currentDetail.userName }}</el-descriptions-item>
        <el-descriptions-item label="用户类型">{{ currentDetail.userType === 'STUDENT' ? '学生' : '教师' }}</el-descriptions-item>
        <el-descriptions-item label="图书ID">{{ currentDetail.bookId }}</el-descriptions-item>
        <el-descriptions-item label="图书名称">{{ currentDetail.bookName }}</el-descriptions-item>
        <el-descriptions-item label="ISBN">{{ currentDetail.isbn }}</el-descriptions-item>
        <el-descriptions-item label="借阅类型">{{ currentDetail.borrowType }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ currentDetail.applyTime }}</el-descriptions-item>
        <el-descriptions-item label="申请备注">{{ currentDetail.applyRemark || '无' }}</el-descriptions-item>
        <el-descriptions-item label="审核结果" :span="2">
          <el-tag :type="currentDetail.auditResult === 'APPROVED' ? 'success' : 'danger'">
            {{ currentDetail.auditResult === 'APPROVED' ? '通过' : '拒绝' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审核人" :span="2">{{ currentDetail.auditor }}</el-descriptions-item>
        <el-descriptions-item label="审核时间" :span="2">{{ currentDetail.auditTime }}</el-descriptions-item>
        <el-descriptions-item label="审核备注" :span="2">{{ currentDetail.auditRemark || '无' }}</el-descriptions-item>
        <el-descriptions-item v-if="currentDetail.isLongTerm" label="长期借阅" :span="2">
          <el-tag type="warning">是</el-tag>
          <span style="margin-left: 10px">{{ currentDetail.longTermReason }}</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentDetail.isCrossCampus" label="跨校区借阅" :span="2">
          <el-tag type="info">是</el-tag>
          <span style="margin-left: 10px">{{ currentDetail.crossCampusReason }}</span>
        </el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDetailDialog = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import api from '../api'

export default {
  name: 'BorrowAudit',
  data() {
    return {
      activeTab: 'pending',
      
      // 待审核借阅申请
      pendingList: [],
      pendingPage: {
        currentPage: 1,
        pageSize: 10
      },
      selectedPendingItems: [],
      
      // 已审核借阅申请
      processedList: [],
      processedPage: {
        currentPage: 1,
        pageSize: 10
      },
      processedQuery: {
        userName: '',
        result: '',
        auditTime: []
      },
      
      // 审核日志
      logList: [],
      logPage: {
        currentPage: 1,
        pageSize: 10
      },
      logQuery: {
        userName: '',
        auditor: '',
        auditTime: []
      },
      
      // 审核对话框
      showAuditDialog: false,
      auditDialogTitle: '',
      currentApply: {},
      auditForm: {
        result: 'APPROVED',
        remark: '',
        isLongTerm: false,
        longTermReason: '',
        isCrossCampus: false,
        crossCampusReason: ''
      },
      
      // 详情对话框
      showDetailDialog: false,
      currentDetail: {}
    }
  },
  created() {
    this.refreshPendingList()
    this.refreshProcessedList()
    this.refreshLogList()
  },
  computed: {
    filteredProcessedList() {
      let result = this.processedList
      
      if (this.processedQuery.userName) {
        const userName = this.processedQuery.userName.toLowerCase()
        result = result.filter(item => 
          item.userName.toLowerCase().includes(userName)
        )
      }
      
      if (this.processedQuery.result) {
        result = result.filter(item => item.auditResult === this.processedQuery.result)
      }
      
      if (this.processedQuery.auditTime && this.processedQuery.auditTime.length === 2) {
        const [start, end] = this.processedQuery.auditTime
        result = result.filter(item => {
          const auditTime = new Date(item.auditTime)
          return auditTime >= start && auditTime <= end
        })
      }
      
      return result
    },
    filteredLogList() {
      let result = this.logList
      
      if (this.logQuery.userName) {
        const userName = this.logQuery.userName.toLowerCase()
        result = result.filter(item => 
          item.userName.toLowerCase().includes(userName)
        )
      }
      
      if (this.logQuery.auditor) {
        const auditor = this.logQuery.auditor.toLowerCase()
        result = result.filter(item => 
          item.auditor.toLowerCase().includes(auditor)
        )
      }
      
      if (this.logQuery.auditTime && this.logQuery.auditTime.length === 2) {
        const [start, end] = this.logQuery.auditTime
        result = result.filter(item => {
          const auditTime = new Date(item.auditTime)
          return auditTime >= start && auditTime <= end
        })
      }
      
      return result
    }
  },
  methods: {
    // 待审核借阅申请
    refreshPendingList() {
      // 模拟数据，实际应调用API
      this.pendingList = [
        {
          applyId: 'BA20251120001',
          userId: '1001',
          userName: '张三',
          userType: 'STUDENT',
          bookId: 'B001',
          bookName: 'Vue.js实战',
          isbn: '9787115537558',
          borrowType: '普通借阅',
          applyTime: '2025-11-20 14:30:00',
          applyRemark: '学习需要'
        },
        {
          applyId: 'BA20251120002',
          userId: '2001',
          userName: '李四',
          userType: 'TEACHER',
          bookId: 'B002',
          bookName: 'Java核心技术',
          isbn: '9787111641247',
          borrowType: '普通借阅',
          applyTime: '2025-11-20 15:45:00',
          applyRemark: '教学参考'
        },
        {
          applyId: 'BA20251120003',
          userId: '1002',
          userName: '王五',
          userType: 'STUDENT',
          bookId: 'B003',
          bookName: 'Python数据分析',
          isbn: '9787115473804',
          borrowType: '跨校区借阅',
          applyTime: '2025-11-20 16:20:00',
          applyRemark: '跨校区学习需要'
        }
      ]
      ElMessage.success('待审核列表刷新成功')
    },
    handlePendingSelectionChange(val) {
      this.selectedPendingItems = val
    },
    handlePendingSizeChange(size) {
      this.pendingPage.pageSize = size
    },
    handlePendingCurrentChange(current) {
      this.pendingPage.currentPage = current
    },
    
    // 已审核借阅申请
    refreshProcessedList() {
      // 模拟数据，实际应调用API
      this.processedList = [
        {
          applyId: 'BA20251119001',
          userId: '1003',
          userName: '赵六',
          userType: 'STUDENT',
          bookId: 'B004',
          bookName: '数据结构与算法',
          isbn: '9787115536605',
          borrowType: '普通借阅',
          applyTime: '2025-11-19 09:15:00',
          auditResult: 'APPROVED',
          auditTime: '2025-11-19 10:30:00',
          auditor: '管理员',
          auditRemark: '审核通过'
        },
        {
          applyId: 'BA20251119002',
          userId: '1004',
          userName: '孙七',
          userType: 'STUDENT',
          bookId: 'B005',
          bookName: '计算机网络',
          isbn: '9787111641254',
          borrowType: '普通借阅',
          applyTime: '2025-11-19 11:20:00',
          auditResult: 'REJECTED',
          auditTime: '2025-11-19 14:45:00',
          auditor: '管理员',
          auditRemark: '图书已被借出'
        }
      ]
    },
    searchProcessed() {
      ElMessage.success('查询完成')
    },
    clearProcessedQuery() {
      this.processedQuery = {
        userName: '',
        result: '',
        auditTime: []
      }
    },
    handleProcessedSizeChange(size) {
      this.processedPage.pageSize = size
    },
    handleProcessedCurrentChange(current) {
      this.processedPage.currentPage = current
    },
    
    // 审核日志
    refreshLogList() {
      // 模拟数据，实际应调用API
      this.logList = [
        {
          logId: 'AL20251119001',
          applyId: 'BA20251119001',
          userId: '1003',
          userName: '赵六',
          bookName: '数据结构与算法',
          isbn: '9787115536605',
          auditResult: 'APPROVED',
          auditTime: '2025-11-19 10:30:00',
          auditor: '管理员',
          auditRemark: '审核通过'
        },
        {
          logId: 'AL20251119002',
          applyId: 'BA20251119002',
          userId: '1004',
          userName: '孙七',
          bookName: '计算机网络',
          isbn: '9787111641254',
          auditResult: 'REJECTED',
          auditTime: '2025-11-19 14:45:00',
          auditor: '管理员',
          auditRemark: '图书已被借出'
        }
      ]
    },
    searchLog() {
      ElMessage.success('查询完成')
    },
    clearLogQuery() {
      this.logQuery = {
        userName: '',
        auditor: '',
        auditTime: []
      }
    },
    handleLogSizeChange(size) {
      this.logPage.pageSize = size
    },
    handleLogCurrentChange(current) {
      this.logPage.currentPage = current
    },
    
    // 审核操作
    approveApply(row) {
      this.auditDialogTitle = '审核通过'
      this.currentApply = row
      this.auditForm = {
        result: 'APPROVED',
        remark: '',
        isLongTerm: false,
        longTermReason: '',
        isCrossCampus: row.borrowType === '跨校区借阅',
        crossCampusReason: ''
      }
      this.showAuditDialog = true
    },
    rejectApply(row) {
      this.auditDialogTitle = '审核拒绝'
      this.currentApply = row
      this.auditForm = {
        result: 'REJECTED',
        remark: '',
        isLongTerm: false,
        longTermReason: '',
        isCrossCampus: false,
        crossCampusReason: ''
      }
      this.showAuditDialog = true
    },
    longTermBorrow(row) {
      if (row.userType !== 'TEACHER') {
        ElMessage.warning('只有教师才能申请长期借阅')
        return
      }
      this.auditDialogTitle = '教师长期借阅审核'
      this.currentApply = row
      this.auditForm = {
        result: 'APPROVED',
        remark: '',
        isLongTerm: true,
        longTermReason: '',
        isCrossCampus: false,
        crossCampusReason: ''
      }
      this.showAuditDialog = true
    },
    crossCampusBorrow(row) {
      this.auditDialogTitle = '跨校区借阅审核'
      this.currentApply = row
      this.auditForm = {
        result: 'APPROVED',
        remark: '',
        isLongTerm: false,
        longTermReason: '',
        isCrossCampus: true,
        crossCampusReason: ''
      }
      this.showAuditDialog = true
    },
    submitAudit() {
      if (this.auditForm.result === 'REJECTED' && !this.auditForm.remark) {
        ElMessage.warning('请输入拒绝理由')
        return
      }
      
      if (this.auditForm.isLongTerm && !this.auditForm.longTermReason) {
        ElMessage.warning('请输入长期借阅理由')
        return
      }
      
      if (this.auditForm.isCrossCampus && !this.auditForm.crossCampusReason) {
        ElMessage.warning('请输入跨校区借阅说明')
        return
      }
      
      // 模拟审核提交
      ElMessage.success('审核提交成功')
      this.showAuditDialog = false
      
      // 更新列表
      this.refreshPendingList()
      this.refreshProcessedList()
      this.refreshLogList()
    },
    
    // 详情查看
    viewApplyDetail(row) {
      this.currentDetail = row
      this.showDetailDialog = true
    }
  }
}
</script>

<style scoped>
.borrow-audit-container {
  height: 100%;
  overflow: hidden;
}

.tab-content {
  height: calc(100% - 40px);
  overflow: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}
</style>