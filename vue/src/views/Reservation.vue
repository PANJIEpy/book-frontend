<template>
  <div class="reservation-container" style="padding: 10px">
    <el-tabs v-model="activeTab" type="card">
      <!-- 预约队列管理 -->
      <el-tab-pane label="预约队列管理" name="queue">
        <div class="tab-content">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>预约队列管理</span>
                <el-button type="success" size="small" @click="refreshQueueList">刷新</el-button>
              </div>
            </template>
            
            <el-form :model="queueQuery" label-width="100px" inline style="margin-bottom: 15px">
              <el-form-item label="图书名称">
                <el-input v-model="queueQuery.bookName" placeholder="请输入图书名称" clearable />
              </el-form-item>
              <el-form-item label="ISBN">
                <el-input v-model="queueQuery.isbn" placeholder="请输入ISBN" clearable />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchQueue">查询</el-button>
                <el-button @click="clearQueueQuery">清空</el-button>
              </el-form-item>
            </el-form>
            
            <el-table :data="filteredQueueList" stripe border>
              <el-table-column prop="bookId" label="图书ID" width="100" sortable />
              <el-table-column prop="bookName" label="图书名称" min-width="200" />
              <el-table-column prop="isbn" label="ISBN" width="150" />
              <el-table-column prop="totalQueue" label="队列人数" width="100" />
              <el-table-column prop="availableStatus" label="可借状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.availableStatus === 'AVAILABLE' ? 'success' : 'warning'">
                    {{ scope.row.availableStatus === 'AVAILABLE' ? '可借' : '已借出' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button type="primary" size="mini" @click="viewQueueDetail(scope.row)">查看队列</el-button>
                  <el-button type="warning" size="mini" @click="adjustQueue(scope.row)">调整队列</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="queuePage.currentPage"
                v-model:page-size="queuePage.pageSize"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="filteredQueueList.length"
                @size-change="handleQueueSizeChange"
                @current-change="handleQueueCurrentChange"
              />
            </div>
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- 预约记录查询 -->
      <el-tab-pane label="预约记录查询" name="record">
        <div class="tab-content">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>预约记录管理</span>
                <el-button type="success" size="small" @click="refreshRecordList">刷新</el-button>
              </div>
            </template>
            
            <el-form :model="recordQuery" label-width="100px" inline style="margin-bottom: 15px">
              <el-form-item label="用户ID/姓名">
                <el-input v-model="recordQuery.userKeyword" placeholder="请输入用户ID或姓名" clearable />
              </el-form-item>
              <el-form-item label="图书名称">
                <el-input v-model="recordQuery.bookName" placeholder="请输入图书名称" clearable />
              </el-form-item>
              <el-form-item label="预约状态">
                <el-select v-model="recordQuery.status" placeholder="选择预约状态" clearable>
                  <el-option label="等待中" value="WAITING" />
                  <el-option label="已通知" value="NOTIFIED" />
                  <el-option label="已借阅" value="BORROWED" />
                  <el-option label="已取消" value="CANCELLED" />
                  <el-option label="已超时" value="TIMEOUT" />
                </el-select>
              </el-form-item>
              <el-form-item label="预约时间">
                <el-date-picker
                  v-model="recordQuery.reserveTime"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchRecord">查询</el-button>
                <el-button @click="clearRecordQuery">清空</el-button>
              </el-form-item>
            </el-form>
            
            <el-table :data="filteredRecordList" stripe border @selection-change="handleRecordSelectionChange">
              <el-table-column type="selection" width="55" />
              <el-table-column prop="reserveId" label="预约ID" width="120" sortable />
              <el-table-column prop="userId" label="用户ID" width="100" />
              <el-table-column prop="userName" label="用户姓名" width="120" />
              <el-table-column prop="bookName" label="图书名称" min-width="200" />
              <el-table-column prop="isbn" label="ISBN" width="150" />
              <el-table-column prop="reserveTime" label="预约时间" width="180" sortable />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">
                    {{ getStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="expireTime" label="取书截止时间" width="180" sortable />
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button v-if="scope.row.status === 'WAITING'" type="success" size="mini" @click="notifyUser(scope.row)">发送通知</el-button>
                  <el-button v-if="scope.row.status === 'NOTIFIED'" type="warning" size="mini" @click="cancelReservation(scope.row)">取消预约</el-button>
                  <el-button type="info" size="mini" @click="viewRecordDetail(scope.row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="recordPage.currentPage"
                v-model:page-size="recordPage.pageSize"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="filteredRecordList.length"
                @size-change="handleRecordSizeChange"
                @current-change="handleRecordCurrentChange"
              />
            </div>
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- 预约超时统计 -->
      <el-tab-pane label="预约超时统计" name="statistics">
        <div class="tab-content">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>预约超时统计</span>
                <el-button type="success" size="small" @click="generateTimeoutReport">生成报表</el-button>
              </div>
            </template>
            
            <el-form :model="statisticsQuery" label-width="100px" inline style="margin-bottom: 15px">
              <el-form-item label="统计月份">
                <el-date-picker
                  v-model="statisticsQuery.month"
                  type="month"
                  placeholder="选择月份"
                  format="YYYY-MM"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchStatistics">查询</el-button>
                <el-button type="warning" size="small" @click="exportTimeoutReport">导出报表</el-button>
              </el-form-item>
            </el-form>
            
            <!-- 统计概览 -->
            <div class="statistics-overview">
              <el-row :gutter="20">
                <el-col :span="6">
                  <el-statistic title="总预约数" :value="statisticsData.totalReservations" />
                </el-col>
                <el-col :span="6">
                  <el-statistic title="超时预约数" :value="statisticsData.timeoutReservations" />
                </el-col>
                <el-col :span="6">
                  <el-statistic title="超时率" :value="statisticsData.timeoutRate" suffix="%" />
                </el-col>
                <el-col :span="6">
                  <el-statistic title="平均超时天数" :value="statisticsData.avgTimeoutDays" suffix="天" />
                </el-col>
              </el-row>
            </div>
            
            <!-- 超时记录列表 -->
            <h4 style="margin: 20px 0">超时预约记录</h4>
            <el-table :data="timeoutRecordList" stripe border>
              <el-table-column prop="reserveId" label="预约ID" width="120" />
              <el-table-column prop="userId" label="用户ID" width="100" />
              <el-table-column prop="userName" label="用户姓名" width="120" />
              <el-table-column prop="bookName" label="图书名称" min-width="200" />
              <el-table-column prop="reserveTime" label="预约时间" width="180" />
              <el-table-column prop="expireTime" label="取书截止时间" width="180" />
              <el-table-column prop="timeoutDays" label="超时天数" width="100">
                <template #default="scope">
                  <span style="color: #f56c6c">{{ scope.row.timeoutDays }} 天</span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 队列详情对话框 -->
    <el-dialog v-model="showQueueDetailDialog" title="预约队列详情" width="600px">
      <div class="queue-detail">
        <h4>{{ currentQueue.bookName }} ({{ currentQueue.isbn }})</h4>
        <p>当前队列人数：{{ currentQueue.totalQueue }} 人</p>
        <p>图书状态：<el-tag :type="currentQueue.availableStatus === 'AVAILABLE' ? 'success' : 'warning'">
          {{ currentQueue.availableStatus === 'AVAILABLE' ? '可借' : '已借出' }}
        </el-tag></p>
        
        <h5 style="margin-top: 20px">预约队列</h5>
        <el-table :data="currentQueue.queueItems" stripe border style="margin-bottom: 20px">
          <el-table-column prop="queueNo" label="队列号" width="80" />
          <el-table-column prop="userId" label="用户ID" width="100" />
          <el-table-column prop="userName" label="用户姓名" width="120" />
          <el-table-column prop="reserveTime" label="预约时间" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'WAITING' ? 'info' : 'success'">
                {{ scope.row.status === 'WAITING' ? '等待中' : '已通知' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showQueueDetailDialog = false">关闭</el-button>
          <el-button type="primary" @click="notifyNextUser">通知下一位</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 调整队列对话框 -->
    <el-dialog v-model="showAdjustQueueDialog" title="调整预约队列" width="500px">
      <el-form :model="adjustForm" label-width="100px">
        <el-form-item label="图书名称">
          <el-input v-model="adjustForm.bookName" readonly />
        </el-form-item>
        <el-form-item label="调整原因" required>
          <el-input v-model="adjustForm.reason" type="textarea" rows="4" placeholder="请输入调整原因" />
        </el-form-item>
        <el-form-item label="调整说明">
          <el-input v-model="adjustForm.description" type="textarea" rows="3" placeholder="请输入调整说明" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAdjustQueueDialog = false">取消</el-button>
          <el-button type="primary" @click="saveAdjustQueue">保存调整</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 预约详情对话框 -->
    <el-dialog v-model="showRecordDetailDialog" title="预约详情" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="预约ID">{{ currentRecord.reserveId }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentRecord.userId }}</el-descriptions-item>
        <el-descriptions-item label="用户姓名">{{ currentRecord.userName }}</el-descriptions-item>
        <el-descriptions-item label="图书ID">{{ currentRecord.bookId }}</el-descriptions-item>
        <el-descriptions-item label="图书名称">{{ currentRecord.bookName }}</el-descriptions-item>
        <el-descriptions-item label="ISBN">{{ currentRecord.isbn }}</el-descriptions-item>
        <el-descriptions-item label="预约时间">{{ currentRecord.reserveTime }}</el-descriptions-item>
        <el-descriptions-item label="取书截止时间">{{ currentRecord.expireTime }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ getStatusText(currentRecord.status) }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ currentRecord.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRecordDetailDialog = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import api from '../api'

export default {
  name: 'Reservation',
  data() {
    return {
      activeTab: 'queue',
      
      // 预约队列管理
      queueQuery: {
        bookName: '',
        isbn: ''
      },
      queueList: [],
      queuePage: {
        currentPage: 1,
        pageSize: 10
      },
      
      // 预约记录查询
      recordQuery: {
        userKeyword: '',
        bookName: '',
        status: '',
        reserveTime: []
      },
      recordList: [],
      recordPage: {
        currentPage: 1,
        pageSize: 10
      },
      selectedRecordItems: [],
      
      // 预约超时统计
      statisticsQuery: {
        month: new Date()
      },
      statisticsData: {
        totalReservations: 125,
        timeoutReservations: 25,
        timeoutRate: 20,
        avgTimeoutDays: 2.5
      },
      timeoutRecordList: [],
      
      // 对话框相关
      showQueueDetailDialog: false,
      currentQueue: {},
      showAdjustQueueDialog: false,
      adjustForm: {
        bookName: '',
        reason: '',
        description: ''
      },
      showRecordDetailDialog: false,
      currentRecord: {}
    }
  },
  created() {
    this.refreshQueueList()
    this.refreshRecordList()
    this.generateTimeoutReport()
  },
  computed: {
    filteredQueueList() {
      let result = this.queueList
      
      if (this.queueQuery.bookName) {
        const bookName = this.queueQuery.bookName.toLowerCase()
        result = result.filter(item => 
          item.bookName.toLowerCase().includes(bookName)
        )
      }
      
      if (this.queueQuery.isbn) {
        result = result.filter(item => item.isbn.includes(this.queueQuery.isbn))
      }
      
      return result
    },
    filteredRecordList() {
      let result = this.recordList
      
      if (this.recordQuery.userKeyword) {
        const keyword = this.recordQuery.userKeyword.toLowerCase()
        result = result.filter(item => 
          item.userId.includes(keyword) || item.userName.toLowerCase().includes(keyword)
        )
      }
      
      if (this.recordQuery.bookName) {
        const bookName = this.recordQuery.bookName.toLowerCase()
        result = result.filter(item => 
          item.bookName.toLowerCase().includes(bookName)
        )
      }
      
      if (this.recordQuery.status) {
        result = result.filter(item => item.status === this.recordQuery.status)
      }
      
      if (this.recordQuery.reserveTime && this.recordQuery.reserveTime.length === 2) {
        const [start, end] = this.recordQuery.reserveTime
        result = result.filter(item => {
          const reserveTime = new Date(item.reserveTime)
          return reserveTime >= start && reserveTime <= end
        })
      }
      
      return result
    }
  },
  methods: {
    // 预约队列管理
    refreshQueueList() {
      // 模拟数据，实际应调用API
      this.queueList = [
        {
          bookId: 'B001',
          bookName: 'Vue.js实战',
          isbn: '9787115537558',
          totalQueue: 3,
          availableStatus: 'BORROWED',
          queueItems: [
            { queueNo: 1, userId: '1001', userName: '张三', reserveTime: '2025-11-20 14:30:00', status: 'NOTIFIED' },
            { queueNo: 2, userId: '1002', userName: '李四', reserveTime: '2025-11-20 15:45:00', status: 'WAITING' },
            { queueNo: 3, userId: '1003', userName: '王五', reserveTime: '2025-11-20 16:20:00', status: 'WAITING' }
          ]
        },
        {
          bookId: 'B002',
          bookName: 'Java核心技术',
          isbn: '9787111641247',
          totalQueue: 2,
          availableStatus: 'AVAILABLE',
          queueItems: [
            { queueNo: 1, userId: '1004', userName: '赵六', reserveTime: '2025-11-19 09:15:00', status: 'WAITING' },
            { queueNo: 2, userId: '1005', userName: '孙七', reserveTime: '2025-11-19 11:20:00', status: 'WAITING' }
          ]
        }
      ]
    },
    searchQueue() {
      ElMessage.success('查询完成')
    },
    clearQueueQuery() {
      this.queueQuery = {
        bookName: '',
        isbn: ''
      }
    },
    handleQueueSizeChange(size) {
      this.queuePage.pageSize = size
    },
    handleQueueCurrentChange(current) {
      this.queuePage.currentPage = current
    },
    viewQueueDetail(row) {
      this.currentQueue = row
      this.showQueueDetailDialog = true
    },
    adjustQueue(row) {
      this.adjustForm = {
        bookName: row.bookName,
        reason: '',
        description: ''
      }
      this.showAdjustQueueDialog = true
    },
    notifyNextUser() {
      ElMessage.success('已通知下一位用户')
      this.showQueueDetailDialog = false
      this.refreshQueueList()
    },
    saveAdjustQueue() {
      if (!this.adjustForm.reason) {
        ElMessage.warning('请输入调整原因')
        return
      }
      
      ElMessage.success('队列调整成功')
      this.showAdjustQueueDialog = false
      this.refreshQueueList()
    },
    
    // 预约记录查询
    refreshRecordList() {
      // 模拟数据，实际应调用API
      this.recordList = [
        {
          reserveId: 'R20251120001',
          userId: '1001',
          userName: '张三',
          bookId: 'B001',
          bookName: 'Vue.js实战',
          isbn: '9787115537558',
          reserveTime: '2025-11-20 14:30:00',
          expireTime: '2025-11-23 14:30:00',
          status: 'NOTIFIED',
          remark: '学习需要'
        },
        {
          reserveId: 'R20251120002',
          userId: '1002',
          userName: '李四',
          bookId: 'B001',
          bookName: 'Vue.js实战',
          isbn: '9787115537558',
          reserveTime: '2025-11-20 15:45:00',
          expireTime: '2025-11-23 15:45:00',
          status: 'WAITING',
          remark: '项目开发需要'
        },
        {
          reserveId: 'R20251119001',
          userId: '1003',
          userName: '王五',
          bookId: 'B002',
          bookName: 'Java核心技术',
          isbn: '9787111641247',
          reserveTime: '2025-11-19 09:15:00',
          expireTime: '2025-11-22 09:15:00',
          status: 'TIMEOUT',
          remark: '教学参考'
        }
      ]
    },
    searchRecord() {
      ElMessage.success('查询完成')
    },
    clearRecordQuery() {
      this.recordQuery = {
        userKeyword: '',
        bookName: '',
        status: '',
        reserveTime: []
      }
    },
    handleRecordSelectionChange(val) {
      this.selectedRecordItems = val
    },
    handleRecordSizeChange(size) {
      this.recordPage.pageSize = size
    },
    handleRecordCurrentChange(current) {
      this.recordPage.currentPage = current
    },
    notifyUser(row) {
      ElMessage.success('已发送到书提醒')
      row.status = 'NOTIFIED'
    },
    cancelReservation(row) {
      ElMessage.success('预约已取消')
      row.status = 'CANCELLED'
    },
    viewRecordDetail(row) {
      this.currentRecord = row
      this.showRecordDetailDialog = true
    },
    getStatusType(status) {
      const typeMap = {
        WAITING: 'info',
        NOTIFIED: 'success',
        BORROWED: 'warning',
        CANCELLED: 'danger',
        TIMEOUT: 'danger'
      }
      return typeMap[status] || 'default'
    },
    getStatusText(status) {
      const textMap = {
        WAITING: '等待中',
        NOTIFIED: '已通知',
        BORROWED: '已借阅',
        CANCELLED: '已取消',
        TIMEOUT: '已超时'
      }
      return textMap[status] || '未知状态'
    },
    
    // 预约超时统计
    generateTimeoutReport() {
      ElMessage.success('预约超时统计报表生成成功')
      // 模拟生成超时记录
      this.timeoutRecordList = [
        {
          reserveId: 'R20251119001',
          userId: '1003',
          userName: '王五',
          bookName: 'Java核心技术',
          isbn: '9787111641247',
          reserveTime: '2025-11-19 09:15:00',
          expireTime: '2025-11-22 09:15:00',
          timeoutDays: 3
        },
        {
          reserveId: 'R20251118001',
          userId: '1004',
          userName: '赵六',
          bookName: '数据结构与算法',
          isbn: '9787115536605',
          reserveTime: '2025-11-18 14:30:00',
          expireTime: '2025-11-21 14:30:00',
          timeoutDays: 5
        }
      ]
    },
    searchStatistics() {
      ElMessage.success('统计查询完成')
    },
    exportTimeoutReport() {
      ElMessage.info('导出功能开发中')
    }
  }
}
</script>

<style scoped>
.reservation-container {
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

.statistics-overview {
  margin: 20px 0;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.queue-detail h4 {
  margin-bottom: 10px;
}

.queue-detail p {
  margin: 5px 0;
}
</style>