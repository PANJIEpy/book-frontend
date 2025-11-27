<template>
  <div class="return-fine-container" style="padding: 10px">
    <el-tabs v-model="activeTab" type="card">
      <!-- 图书归还 -->
      <el-tab-pane label="图书归还" name="return">
        <div class="tab-content">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>图书归还处理</span>
                <el-button type="success" size="small" @click="clearReturnForm">清空</el-button>
              </div>
            </template>
            
            <el-form :model="returnForm" label-width="120px" style="max-width: 800px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="图书条码">
                    <el-input v-model="returnForm.barcode" placeholder="请输入或扫描图书条码" clearable @keyup.enter="fetchBorrowInfo" />
                  </el-form-item>
                  <el-form-item label="ISBN">
                    <el-input v-model="returnForm.isbn" placeholder="自动获取" readonly />
                  </el-form-item>
                  <el-form-item label="图书名称">
                    <el-input v-model="returnForm.bookName" placeholder="自动获取" readonly />
                  </el-form-item>
                  <el-form-item label="借阅人">
                    <el-input v-model="returnForm.userName" placeholder="自动获取" readonly />
                  </el-form-item>
                  <el-form-item label="借阅时间">
                    <el-input v-model="returnForm.borrowTime" placeholder="自动获取" readonly />
                  </el-form-item>
                  <el-form-item label="应还时间">
                    <el-input v-model="returnForm.dueTime" placeholder="自动获取" readonly />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="实际归还时间">
                    <el-date-picker v-model="returnForm.actualReturnTime" type="datetime" placeholder="选择归还时间" format="YYYY-MM-DD HH:mm:ss" />
                  </el-form-item>
                  <el-form-item label="图书状态" required>
                    <el-radio-group v-model="returnForm.bookStatus">
                      <el-radio label="GOOD">完好</el-radio>
                      <el-radio label="DAMAGED">破损</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item v-if="returnForm.bookStatus === 'DAMAGED'" label="破损类型" required>
                    <el-select v-model="returnForm.damageType" placeholder="选择破损类型">
                      <el-option label="封面破损" value="COVER_DAMAGED" />
                      <el-option label="内页破损" value="PAGE_DAMAGED" />
                      <el-option label="缺页" value="PAGE_MISSING" />
                      <el-option label="污渍" value="DIRTY" />
                      <el-option label="其他" value="OTHER" />
                    </el-select>
                  </el-form-item>
                  <el-form-item v-if="returnForm.bookStatus === 'DAMAGED'" label="破损描述">
                    <el-input v-model="returnForm.damageDesc" type="textarea" rows="3" placeholder="请描述破损情况" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item>
                <el-button type="primary" @click="processReturn">处理归还</el-button>
                <el-button type="info" @click="showBatchReturnDialog = true">批量归还</el-button>
              </el-form-item>
            </el-form>
            
            <!-- 罚款信息 -->
            <div v-if="fineInfo.show" class="fine-info-container">
              <el-alert
                :title="fineInfo.title"
                :description="fineInfo.description"
                :type="fineInfo.type"
                show-icon
                style="margin-bottom: 15px"
              />
              <div v-if="fineInfo.amount > 0" class="fine-actions">
                <el-button type="primary" @click="confirmFinePayment">确认缴纳罚款</el-button>
                <el-button type="warning" @click="waiveFine">豁免罚款</el-button>
              </div>
            </div>
            
            <div v-if="returnHistory.length > 0" class="return-history">
              <h4>最近归还记录</h4>
              <el-table :data="returnHistory.slice(0, 5)" stripe border size="small">
                <el-table-column prop="barcode" label="条码" width="150" />
                <el-table-column prop="bookName" label="图书名称" min-width="200" />
                <el-table-column prop="userName" label="借阅人" width="120" />
                <el-table-column prop="bookStatus" label="状态" width="100">
                  <template #default="scope">
                    <el-tag :type="scope.row.bookStatus === 'GOOD' ? 'success' : 'warning'">
                      {{ scope.row.bookStatus === 'GOOD' ? '完好' : '破损' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="returnTime" label="归还时间" width="180" />
              </el-table>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- 罚款管理 -->
      <el-tab-pane label="罚款管理" name="fine">
        <div class="tab-content">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>罚款记录管理</span>
                <el-button type="success" size="small" @click="refreshFineList">刷新</el-button>
              </div>
            </template>
            
            <el-form :model="fineQuery" label-width="100px" inline style="margin-bottom: 15px">
              <el-form-item label="用户ID/姓名">
                <el-input v-model="fineQuery.userKeyword" placeholder="请输入用户ID或姓名" clearable />
              </el-form-item>
              <el-form-item label="罚款状态">
                <el-select v-model="fineQuery.status" placeholder="选择罚款状态" clearable>
                  <el-option label="未缴纳" value="UNPAID" />
                  <el-option label="已缴纳" value="PAID" />
                  <el-option label="已豁免" value="WAIVED" />
                </el-select>
              </el-form-item>
              <el-form-item label="罚款时间">
                <el-date-picker
                  v-model="fineQuery.fineTime"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchFine">查询</el-button>
                <el-button @click="clearFineQuery">清空</el-button>
              </el-form-item>
            </el-form>
            
            <el-table :data="filteredFineList" stripe border @selection-change="handleFineSelectionChange">
              <el-table-column type="selection" width="55" />
              <el-table-column prop="fineId" label="罚款ID" width="120" sortable />
              <el-table-column prop="userId" label="用户ID" width="100" />
              <el-table-column prop="userName" label="用户姓名" width="120" />
              <el-table-column prop="bookName" label="图书名称" min-width="200" />
              <el-table-column prop="isbn" label="ISBN" width="150" />
              <el-table-column prop="amount" label="罚款金额" width="100">
                <template #default="scope">
                  <span style="color: #f56c6c; font-weight: bold">{{ scope.row.amount }} 元</span>
                </template>
              </el-table-column>
              <el-table-column prop="reason" label="罚款原因" width="150" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">
                    {{ getStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="罚款时间" width="180" sortable />
              <el-table-column label="操作" width="180">
                <template #default="scope">
                  <el-button v-if="scope.row.status === 'UNPAID'" type="success" size="mini" @click="confirmPayment(scope.row)">确认缴纳</el-button>
                  <el-button v-if="scope.row.status === 'UNPAID'" type="warning" size="mini" @click="waiveFineRecord(scope.row)">豁免罚款</el-button>
                  <el-button type="info" size="mini" @click="viewFineDetail(scope.row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="finePage.currentPage"
                v-model:page-size="finePage.pageSize"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="filteredFineList.length"
                @size-change="handleFineSizeChange"
                @current-change="handleFineCurrentChange"
              />
            </div>
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- 破损维修与报废 -->
      <el-tab-pane label="破损维修与报废" name="repair">
        <div class="tab-content">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>破损图书处理</span>
                <el-button type="success" size="small" @click="refreshRepairList">刷新</el-button>
              </div>
            </template>
            
            <el-tabs v-model="repairSubTab" type="border-card">
              <el-tab-pane label="待处理破损图书" name="pending">
                <el-table :data="pendingRepairList" stripe border @selection-change="handleRepairSelectionChange">
                  <el-table-column type="selection" width="55" />
                  <el-table-column prop="damageId" label="记录ID" width="120" sortable />
                  <el-table-column prop="barcode" label="图书条码" width="150" />
                  <el-table-column prop="bookName" label="图书名称" min-width="200" />
                  <el-table-column prop="isbn" label="ISBN" width="150" />
                  <el-table-column prop="damageType" label="破损类型" width="120" />
                  <el-table-column prop="damageDesc" label="破损描述" min-width="200" />
                  <el-table-column prop="createTime" label="登记时间" width="180" sortable />
                  <el-table-column label="操作" width="200">
                    <template #default="scope">
                      <el-button type="primary" size="mini" @click="repairBook(scope.row)">维修处理</el-button>
                      <el-button type="danger" size="mini" @click="scrapBook(scope.row)">报废处理</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="维修记录" name="repair">
                <el-table :data="repairRecordList" stripe border>
                  <el-table-column prop="repairId" label="维修ID" width="120" sortable />
                  <el-table-column prop="barcode" label="图书条码" width="150" />
                  <el-table-column prop="bookName" label="图书名称" min-width="200" />
                  <el-table-column prop="repairDate" label="维修日期" width="180" sortable />
                  <el-table-column prop="repairCost" label="维修费用" width="100">
                    <template #default="scope">
                      <span>{{ scope.row.repairCost }} 元</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="repairDesc" label="维修内容" min-width="200" />
                  <el-table-column prop="status" label="状态" width="100">
                    <template #default="scope">
                      <el-tag :type="scope.row.status === 'COMPLETED' ? 'success' : 'warning'">
                        {{ scope.row.status === 'COMPLETED' ? '已完成' : '维修中' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="报废记录" name="scrap">
                <el-table :data="scrapRecordList" stripe border>
                  <el-table-column prop="scrapId" label="报废ID" width="120" sortable />
                  <el-table-column prop="barcode" label="图书条码" width="150" />
                  <el-table-column prop="bookName" label="图书名称" min-width="200" />
                  <el-table-column prop="isbn" label="ISBN" width="150" />
                  <el-table-column prop="scrapDate" label="报废日期" width="180" sortable />
                  <el-table-column prop="reason" label="报废原因" min-width="200" />
                  <el-table-column prop="operator" label="操作人" width="120" />
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 批量归还对话框 -->
    <el-dialog v-model="showBatchReturnDialog" title="批量归还处理" width="500px">
      <el-form :model="batchReturnForm" label-width="80px">
        <el-form-item label="条码列表">
          <el-input v-model="batchReturnForm.barcodeList" type="textarea" rows="8" placeholder="请输入多个图书条码，每行一个" />
        </el-form-item>
        <el-form-item label="归还时间">
          <el-date-picker v-model="batchReturnForm.returnTime" type="datetime" placeholder="选择归还时间" format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showBatchReturnDialog = false">取消</el-button>
          <el-button type="primary" @click="batchReturn">开始批量归还</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 维修处理对话框 -->
    <el-dialog v-model="showRepairDialog" title="图书维修处理" width="500px">
      <el-form :model="repairForm" label-width="100px">
        <el-form-item label="图书条码">
          <el-input v-model="repairForm.barcode" readonly />
        </el-form-item>
        <el-form-item label="图书名称">
          <el-input v-model="repairForm.bookName" readonly />
        </el-form-item>
        <el-form-item label="维修日期">
          <el-date-picker v-model="repairForm.repairDate" type="date" placeholder="选择维修日期" format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="维修费用">
          <el-input-number v-model="repairForm.repairCost" :min="0" :step="0.1" placeholder="请输入维修费用" />
        </el-form-item>
        <el-form-item label="维修内容">
          <el-input v-model="repairForm.repairDesc" type="textarea" rows="4" placeholder="请输入维修内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRepairDialog = false">取消</el-button>
          <el-button type="primary" @click="saveRepairRecord">保存维修记录</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 报废处理对话框 -->
    <el-dialog v-model="showScrapDialog" title="图书报废处理" width="500px">
      <el-form :model="scrapForm" label-width="100px">
        <el-form-item label="图书条码">
          <el-input v-model="scrapForm.barcode" readonly />
        </el-form-item>
        <el-form-item label="图书名称">
          <el-input v-model="scrapForm.bookName" readonly />
        </el-form-item>
        <el-form-item label="报废日期">
          <el-date-picker v-model="scrapForm.scrapDate" type="date" placeholder="选择报废日期" format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="报废原因" required>
          <el-input v-model="scrapForm.reason" type="textarea" rows="4" placeholder="请输入报废原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showScrapDialog = false">取消</el-button>
          <el-button type="primary" @click="saveScrapRecord">确认报废</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import api from '../api'

export default {
  name: 'ReturnFine',
  data() {
    return {
      activeTab: 'return',
      
      // 图书归还
      returnForm: {
        barcode: '',
        isbn: '',
        bookName: '',
        userName: '',
        borrowTime: '',
        dueTime: '',
        actualReturnTime: new Date(),
        bookStatus: 'GOOD',
        damageType: '',
        damageDesc: ''
      },
      fineInfo: {
        show: false,
        title: '',
        description: '',
        type: 'info',
        amount: 0
      },
      returnHistory: [],
      showBatchReturnDialog: false,
      batchReturnForm: {
        barcodeList: '',
        returnTime: new Date()
      },
      
      // 罚款管理
      fineQuery: {
        userKeyword: '',
        status: '',
        fineTime: []
      },
      fineList: [],
      finePage: {
        currentPage: 1,
        pageSize: 10
      },
      selectedFineItems: [],
      
      // 破损维修
      repairSubTab: 'pending',
      pendingRepairList: [],
      repairRecordList: [],
      scrapRecordList: [],
      selectedRepairItems: [],
      showRepairDialog: false,
      repairForm: {
        barcode: '',
        bookName: '',
        repairDate: new Date(),
        repairCost: 0,
        repairDesc: ''
      },
      showScrapDialog: false,
      scrapForm: {
        barcode: '',
        bookName: '',
        scrapDate: new Date(),
        reason: ''
      }
    }
  },
  created() {
    this.refreshFineList()
    this.refreshRepairList()
  },
  computed: {
    filteredFineList() {
      let result = this.fineList
      
      if (this.fineQuery.userKeyword) {
        const keyword = this.fineQuery.userKeyword.toLowerCase()
        result = result.filter(item => 
          item.userId.includes(keyword) || item.userName.toLowerCase().includes(keyword)
        )
      }
      
      if (this.fineQuery.status) {
        result = result.filter(item => item.status === this.fineQuery.status)
      }
      
      if (this.fineQuery.fineTime && this.fineQuery.fineTime.length === 2) {
        const [start, end] = this.fineQuery.fineTime
        result = result.filter(item => {
          const fineTime = new Date(item.createTime)
          return fineTime >= start && fineTime <= end
        })
      }
      
      return result
    }
  },
  methods: {
    // 图书归还
    fetchBorrowInfo() {
      if (!this.returnForm.barcode) {
        ElMessage.warning('请输入图书条码')
        return
      }
      
      // 模拟API调用，获取借阅信息
      ElMessage.success('正在获取借阅信息...')
      setTimeout(() => {
        this.returnForm.isbn = '9787115537558'
        this.returnForm.bookName = 'Vue.js实战'
        this.returnForm.userName = '张三'
        this.returnForm.borrowTime = '2025-11-01 14:30:00'
        this.returnForm.dueTime = '2025-11-15 14:30:00'
        
        // 计算逾期天数和罚款
        const dueDate = new Date(this.returnForm.dueTime)
        const actualDate = new Date(this.returnForm.actualReturnTime)
        const daysLate = Math.ceil((actualDate - dueDate) / (1000 * 60 * 60 * 24))
        
        if (daysLate > 0) {
          const fineAmount = Math.min(daysLate * 0.5, 20) // 0.5元/天，上限20元
          this.fineInfo = {
            show: true,
            title: '逾期罚款',
            description: `该图书逾期 ${daysLate} 天，需缴纳罚款 ${fineAmount} 元`,
            type: 'warning',
            amount: fineAmount
          }
        } else {
          this.fineInfo = {
            show: true,
            title: '归还正常',
            description: '该图书未逾期，无需缴纳罚款',
            type: 'success',
            amount: 0
          }
        }
        
        ElMessage.success('借阅信息获取成功')
      }, 1000)
    },
    processReturn() {
      if (!this.returnForm.barcode || !this.returnForm.actualReturnTime || !this.returnForm.bookStatus) {
        ElMessage.warning('请填写必填字段')
        return
      }
      
      // 模拟处理归还
      ElMessage.success('归还处理成功')
      
      // 添加到归还历史
      this.returnHistory.unshift({
        barcode: this.returnForm.barcode,
        bookName: this.returnForm.bookName,
        userName: this.returnForm.userName,
        bookStatus: this.returnForm.bookStatus,
        returnTime: this.returnForm.actualReturnTime.toLocaleString()
      })
      
      if (this.returnHistory.length > 10) {
        this.returnHistory.pop()
      }
      
      this.clearReturnForm()
      this.refreshFineList()
      this.refreshRepairList()
    },
    clearReturnForm() {
      this.returnForm = {
        barcode: '',
        isbn: '',
        bookName: '',
        userName: '',
        borrowTime: '',
        dueTime: '',
        actualReturnTime: new Date(),
        bookStatus: 'GOOD',
        damageType: '',
        damageDesc: ''
      }
      this.fineInfo.show = false
    },
    batchReturn() {
      if (!this.batchReturnForm.barcodeList) {
        ElMessage.warning('请输入条码列表')
        return
      }
      
      const barcodes = this.batchReturnForm.barcodeList.split('\n').filter(barcode => barcode.trim())
      if (barcodes.length === 0) {
        ElMessage.warning('请输入有效的条码列表')
        return
      }
      
      ElMessage.success(`开始批量归还，共${barcodes.length}本图书`)
      this.showBatchReturnDialog = false
      
      // 模拟批量归还
      setTimeout(() => {
        ElMessage.success(`批量归还完成，成功${barcodes.length}本`)
        this.batchReturnForm.barcodeList = ''
        this.refreshFineList()
        this.refreshRepairList()
      }, 2000)
    },
    confirmFinePayment() {
      ElMessage.success('罚款缴纳确认成功')
      this.fineInfo.show = false
    },
    waiveFine() {
      ElMessage.success('罚款已豁免')
      this.fineInfo.show = false
    },
    
    // 罚款管理
    refreshFineList() {
      // 模拟数据，实际应调用API
      this.fineList = [
        {
          fineId: 'F20251120001',
          userId: '1001',
          userName: '张三',
          bookName: 'Vue.js实战',
          isbn: '9787115537558',
          amount: 5.00,
          reason: '逾期10天',
          status: 'UNPAID',
          createTime: '2025-11-20 14:30:00'
        },
        {
          fineId: 'F20251119001',
          userId: '1002',
          userName: '李四',
          bookName: 'Java核心技术',
          isbn: '9787111641247',
          amount: 20.00,
          reason: '逾期45天（上限20元）',
          status: 'PAID',
          createTime: '2025-11-19 09:15:00',
          payTime: '2025-11-19 10:30:00'
        }
      ]
    },
    searchFine() {
      ElMessage.success('查询完成')
    },
    clearFineQuery() {
      this.fineQuery = {
        userKeyword: '',
        status: '',
        fineTime: []
      }
    },
    handleFineSelectionChange(val) {
      this.selectedFineItems = val
    },
    handleFineSizeChange(size) {
      this.finePage.pageSize = size
    },
    handleFineCurrentChange(current) {
      this.finePage.currentPage = current
    },
    confirmPayment(row) {
      row.status = 'PAID'
      row.payTime = new Date().toLocaleString()
      ElMessage.success('罚款缴纳确认成功')
    },
    waiveFineRecord(row) {
      row.status = 'WAIVED'
      ElMessage.success('罚款已豁免')
    },
    viewFineDetail(row) {
      ElMessage.info('查看罚款详情功能开发中')
    },
    getStatusType(status) {
      const typeMap = {
        UNPAID: 'danger',
        PAID: 'success',
        WAIVED: 'warning'
      }
      return typeMap[status] || 'default'
    },
    getStatusText(status) {
      const textMap = {
        UNPAID: '未缴纳',
        PAID: '已缴纳',
        WAIVED: '已豁免'
      }
      return textMap[status] || '未知状态'
    },
    
    // 破损维修
    refreshRepairList() {
      // 模拟数据，实际应调用API
      this.pendingRepairList = [
        {
          damageId: 'D20251120001',
          barcode: '10001',
          bookName: 'Vue.js实战',
          isbn: '9787115537558',
          damageType: 'COVER_DAMAGED',
          damageDesc: '封面边角磨损',
          createTime: '2025-11-20 14:30:00'
        },
        {
          damageId: 'D20251119001',
          barcode: '10002',
          bookName: 'Java核心技术',
          isbn: '9787111641247',
          damageType: 'PAGE_DAMAGED',
          damageDesc: '内页有污渍',
          createTime: '2025-11-19 09:15:00'
        }
      ]
      
      this.repairRecordList = [
        {
          repairId: 'R20251118001',
          barcode: '10003',
          bookName: 'Python数据分析',
          isbn: '9787115473804',
          repairDate: '2025-11-18 14:30:00',
          repairCost: 15.00,
          repairDesc: '修复封面破损',
          status: 'COMPLETED'
        }
      ]
      
      this.scrapRecordList = [
        {
          scrapId: 'S20251117001',
          barcode: '10004',
          bookName: '数据结构与算法',
          isbn: '9787115536605',
          scrapDate: '2025-11-17 09:15:00',
          reason: '严重破损，无法修复',
          operator: '管理员'
        }
      ]
    },
    handleRepairSelectionChange(val) {
      this.selectedRepairItems = val
    },
    repairBook(row) {
      this.repairForm = {
        barcode: row.barcode,
        bookName: row.bookName,
        repairDate: new Date(),
        repairCost: 0,
        repairDesc: ''
      }
      this.showRepairDialog = true
    },
    scrapBook(row) {
      this.scrapForm = {
        barcode: row.barcode,
        bookName: row.bookName,
        scrapDate: new Date(),
        reason: ''
      }
      this.showScrapDialog = true
    },
    saveRepairRecord() {
      if (!this.repairForm.repairDate || !this.repairForm.repairDesc) {
        ElMessage.warning('请填写完整维修信息')
        return
      }
      
      ElMessage.success('维修记录保存成功')
      this.showRepairDialog = false
      this.refreshRepairList()
    },
    saveScrapRecord() {
      if (!this.scrapForm.reason) {
        ElMessage.warning('请输入报废原因')
        return
      }
      
      ElMessage.success('报废记录保存成功')
      this.showScrapDialog = false
      this.refreshRepairList()
    }
  }
}
</script>

<style scoped>
.return-fine-container {
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

.fine-info-container {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.fine-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.return-history {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.return-history h4 {
  margin-bottom: 15px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}
</style>