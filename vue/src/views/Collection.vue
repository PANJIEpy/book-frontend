<template>
  <div class="collection-container" style="padding: 10px">
    <el-tabs v-model="activeTab" type="card">
      <!-- 馆藏登记 -->
      <el-tab-pane label="馆藏登记" name="register">
        <div class="tab-content">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>采购图书到货登记</span>
                <el-button type="success" size="small" @click="clearRegisterForm">清空</el-button>
              </div>
            </template>
            
            <el-form :model="registerForm" label-width="120px" style="max-width: 800px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="图书条码">
                    <el-input v-model="registerForm.barcode" placeholder="请输入或扫描图书条码" clearable @keyup.enter="fetchBookInfo" />
                  </el-form-item>
                  <el-form-item label="ISBN">
                    <el-input v-model="registerForm.isbn" placeholder="自动获取" readonly />
                  </el-form-item>
                  <el-form-item label="图书名称">
                    <el-input v-model="registerForm.bookName" placeholder="自动获取" readonly />
                  </el-form-item>
                  <el-form-item label="作者">
                    <el-input v-model="registerForm.author" placeholder="自动获取" readonly />
                  </el-form-item>
                  <el-form-item label="出版社">
                    <el-input v-model="registerForm.publisher" placeholder="自动获取" readonly />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="馆区" required>
                    <el-select v-model="registerForm.libraryArea" placeholder="选择馆区">
                      <el-option label="主馆" value="MAIN" />
                      <el-option label="分馆1" value="BRANCH1" />
                      <el-option label="分馆2" value="BRANCH2" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="书架号" required>
                    <el-input v-model="registerForm.shelfNumber" placeholder="如：A-01-02" />
                  </el-form-item>
                  <el-form-item label="馆藏状态" required>
                    <el-select v-model="registerForm.status">
                      <el-option label="完好" value="GOOD" />
                      <el-option label="破损" value="DAMAGED" />
                      <el-option label="维修中" value="REPAIRING" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="备注">
                    <el-input v-model="registerForm.remark" type="textarea" rows="3" placeholder="可选" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item>
                <el-button type="primary" @click="saveCollectionRecord">保存馆藏记录</el-button>
                <el-button type="info" @click="showBatchRegisterDialog = true">批量登记</el-button>
              </el-form-item>
            </el-form>
            
            <div v-if="registerHistory.length > 0" class="register-history">
              <h4>最近登记记录</h4>
              <el-table :data="registerHistory.slice(0, 5)" stripe border size="small">
                <el-table-column prop="barcode" label="条码" width="150" />
                <el-table-column prop="bookName" label="图书名称" min-width="200" />
                <el-table-column prop="libraryArea" label="馆区" width="100" />
                <el-table-column prop="shelfNumber" label="书架号" width="120" />
                <el-table-column prop="createTime" label="登记时间" width="180" />
              </el-table>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- 馆内调架 -->
      <el-tab-pane label="馆内调架" name="transfer">
        <div class="tab-content">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>馆内图书调架</span>
                <el-button type="success" size="small" @click="clearTransferForm">清空</el-button>
              </div>
            </template>
            
            <el-form :model="transferForm" label-width="120px" style="max-width: 600px">
              <el-form-item label="图书条码">
                <el-input v-model="transferForm.barcode" placeholder="请输入或扫描图书条码" clearable @keyup.enter="fetchCollectionInfo" />
              </el-form-item>
              <el-form-item label="当前馆区">
                <el-input v-model="transferForm.currentArea" placeholder="自动获取" readonly />
              </el-form-item>
              <el-form-item label="当前书架号">
                <el-input v-model="transferForm.currentShelf" placeholder="自动获取" readonly />
              </el-form-item>
              <el-form-item label="目标馆区" required>
                <el-select v-model="transferForm.targetArea">
                  <el-option label="主馆" value="MAIN" />
                  <el-option label="分馆1" value="BRANCH1" />
                  <el-option label="分馆2" value="BRANCH2" />
                </el-select>
              </el-form-item>
              <el-form-item label="目标书架号" required>
                <el-input v-model="transferForm.targetShelf" placeholder="如：B-03-01" />
              </el-form-item>
              <el-form-item label="调架原因" required>
                <el-input v-model="transferForm.reason" type="textarea" rows="3" placeholder="请输入调架原因" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveTransferRecord">保存调架记录</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- 图书清点 -->
      <el-tab-pane label="图书清点" name="inventory">
        <div class="tab-content">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>图书清点管理</span>
                <div>
                  <el-button type="primary" size="small" @click="generateInventoryList">生成清点清单</el-button>
                  <el-button type="success" size="small" @click="startInventory">开始清点</el-button>
                  <el-button type="warning" size="small" @click="showInventoryResult">查看差异报表</el-button>
                </div>
              </div>
            </template>
            
            <div class="inventory-section">
              <h4>清点设置</h4>
              <el-form :model="inventoryForm" label-width="120px" inline>
                <el-form-item label="馆区">
                  <el-select v-model="inventoryForm.libraryArea" placeholder="选择馆区">
                    <el-option label="主馆" value="MAIN" />
                    <el-option label="分馆1" value="BRANCH1" />
                    <el-option label="分馆2" value="BRANCH2" />
                  </el-select>
                </el-form-item>
                <el-form-item label="书架号">
                  <el-input v-model="inventoryForm.shelfNumber" placeholder="可选，如：A-01" />
                </el-form-item>
                <el-form-item label="清点方式">
                  <el-radio-group v-model="inventoryForm.method">
                    <el-radio label="扫码清点" />
                    <el-radio label="按书架清点" />
                  </el-radio-group>
                </el-form-item>
              </el-form>
            </div>
            
            <div v-if="inventoryStatus" class="inventory-status">
              <el-alert
                :title="inventoryStatus.title"
                :description="inventoryStatus.description"
                :type="inventoryStatus.type"
                show-icon
              />
            </div>
            
            <div v-if="inventoryList.length > 0" class="inventory-list">
              <h4>待清点图书列表 ({{ inventoryList.length }})</h4>
              <el-table :data="inventoryList" stripe border size="small" style="margin-bottom: 15px">
                <el-table-column prop="barcode" label="条码" width="150" />
                <el-table-column prop="bookName" label="图书名称" min-width="200" />
                <el-table-column prop="shelfNumber" label="书架号" width="120" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag :type="scope.row.status === 'UNCHECKED' ? 'warning' : 'success'">
                      {{ scope.row.status === 'UNCHECKED' ? '未清点' : '已清点' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- 馆藏状态变更 -->
      <el-tab-pane label="馆藏状态变更" name="status">
        <div class="tab-content">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>馆藏状态变更管理</span>
                <el-button type="success" size="small" @click="clearStatusForm">清空</el-button>
              </div>
            </template>
            
            <el-form :model="statusForm" label-width="120px" style="max-width: 600px">
              <el-form-item label="图书条码">
                <el-input v-model="statusForm.barcode" placeholder="请输入或扫描图书条码" clearable @keyup.enter="fetchCollectionStatus" />
              </el-form-item>
              <el-form-item label="当前状态">
                <el-input v-model="statusForm.currentStatus" placeholder="自动获取" readonly />
              </el-form-item>
              <el-form-item label="目标状态" required>
                <el-select v-model="statusForm.targetStatus">
                  <el-option label="完好" value="GOOD" />
                  <el-option label="破损" value="DAMAGED" />
                  <el-option label="维修中" value="REPAIRING" />
                  <el-option label="报废" value="SCRAPPED" />
                </el-select>
              </el-form-item>
              <el-form-item v-if="statusForm.targetStatus === 'DAMAGED'" label="破损描述" required>
                <el-input v-model="statusForm.damageDesc" type="textarea" rows="3" placeholder="请描述破损情况" />
              </el-form-item>
              <el-form-item v-if="statusForm.targetStatus === 'REPAIRING'" label="维修信息" required>
                <el-input v-model="statusForm.repairInfo" type="textarea" rows="3" placeholder="请输入维修信息" />
              </el-form-item>
              <el-form-item v-if="statusForm.targetStatus === 'SCRAPPED'" label="报废原因" required>
                <el-input v-model="statusForm.scrapReason" type="textarea" rows="3" placeholder="请输入报废原因" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="updateStatus">更新状态</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- 馆藏查询 -->
      <el-tab-pane label="馆藏查询" name="query">
        <div class="tab-content">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>馆藏记录查询</span>
                <el-button type="primary" size="small" @click="refreshCollectionList">刷新</el-button>
              </div>
            </template>
            
            <el-form :model="queryForm" label-width="100px" inline style="margin-bottom: 15px">
              <el-form-item label="条码/ISBN">
                <el-input v-model="queryForm.keyword" placeholder="请输入条码或ISBN" clearable />
              </el-form-item>
              <el-form-item label="图书名称">
                <el-input v-model="queryForm.bookName" placeholder="请输入图书名称" clearable />
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="queryForm.status" placeholder="选择状态" clearable>
                  <el-option label="完好" value="GOOD" />
                  <el-option label="破损" value="DAMAGED" />
                  <el-option label="维修中" value="REPAIRING" />
                  <el-option label="报废" value="SCRAPPED" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchCollection">查询</el-button>
                <el-button @click="clearQueryForm">清空</el-button>
              </el-form-item>
            </el-form>
            
            <el-table :data="filteredCollectionList" stripe border @selection-change="handleCollectionSelectionChange">
              <el-table-column type="selection" width="55" />
              <el-table-column prop="barcode" label="图书条码" width="150" />
              <el-table-column prop="isbn" label="ISBN" width="150" />
              <el-table-column prop="bookName" label="图书名称" min-width="200" />
              <el-table-column prop="author" label="作者" width="120" />
              <el-table-column prop="libraryArea" label="馆区" width="100" />
              <el-table-column prop="shelfNumber" label="书架号" width="120" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">
                    {{ getStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="180" sortable />
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button type="primary" size="mini" @click="viewCollectionDetail(scope.row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="collectionPage.currentPage"
                v-model:page-size="collectionPage.pageSize"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="filteredCollectionList.length"
                @size-change="handleCollectionSizeChange"
                @current-change="handleCollectionCurrentChange"
              />
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 批量登记对话框 -->
    <el-dialog v-model="showBatchRegisterDialog" title="批量馆藏登记" width="500px">
      <el-form :model="batchRegisterForm" label-width="80px">
        <el-form-item label="条码列表">
          <el-input v-model="batchRegisterForm.barcodeList" type="textarea" rows="8" placeholder="请输入多个图书条码，每行一个" />
        </el-form-item>
        <el-form-item label="馆区">
          <el-select v-model="batchRegisterForm.libraryArea" placeholder="选择馆区">
            <el-option label="主馆" value="MAIN" />
            <el-option label="分馆1" value="BRANCH1" />
            <el-option label="分馆2" value="BRANCH2" />
          </el-select>
        </el-form-item>
        <el-form-item label="书架号">
          <el-input v-model="batchRegisterForm.shelfNumber" placeholder="如：A-01" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showBatchRegisterDialog = false">取消</el-button>
          <el-button type="primary" @click="batchRegister">开始批量登记</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 馆藏详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="馆藏详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="图书条码">{{ currentCollection.barcode }}</el-descriptions-item>
        <el-descriptions-item label="ISBN">{{ currentCollection.isbn }}</el-descriptions-item>
        <el-descriptions-item label="图书名称">{{ currentCollection.bookName }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ currentCollection.author }}</el-descriptions-item>
        <el-descriptions-item label="出版社">{{ currentCollection.publisher }}</el-descriptions-item>
        <el-descriptions-item label="馆区">{{ currentCollection.libraryArea }}</el-descriptions-item>
        <el-descriptions-item label="书架号">{{ currentCollection.shelfNumber }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ getStatusText(currentCollection.status) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ currentCollection.createTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentCollection.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
      
      <h4 style="margin-top: 20px">状态变更历史</h4>
      <el-timeline>
        <el-timeline-item v-for="(item, index) in currentCollection.statusHistory" :key="index" :timestamp="item.time">
          {{ item.content }}
        </el-timeline-item>
      </el-timeline>
      
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
  name: 'Collection',
  data() {
    return {
      activeTab: 'register',
      
      // 馆藏登记
      registerForm: {
        barcode: '',
        isbn: '',
        bookName: '',
        author: '',
        publisher: '',
        libraryArea: 'MAIN',
        shelfNumber: '',
        status: 'GOOD',
        remark: ''
      },
      registerHistory: [],
      showBatchRegisterDialog: false,
      batchRegisterForm: {
        barcodeList: '',
        libraryArea: 'MAIN',
        shelfNumber: ''
      },
      
      // 馆内调架
      transferForm: {
        barcode: '',
        currentArea: '',
        currentShelf: '',
        targetArea: 'MAIN',
        targetShelf: '',
        reason: ''
      },
      
      // 图书清点
      inventoryForm: {
        libraryArea: '',
        shelfNumber: '',
        method: '扫码清点'
      },
      inventoryList: [],
      inventoryStatus: null,
      
      // 馆藏状态变更
      statusForm: {
        barcode: '',
        currentStatus: '',
        targetStatus: '',
        damageDesc: '',
        repairInfo: '',
        scrapReason: ''
      },
      
      // 馆藏查询
      queryForm: {
        keyword: '',
        bookName: '',
        status: ''
      },
      collectionList: [],
      collectionPage: {
        currentPage: 1,
        pageSize: 10
      },
      selectedCollectionItems: [],
      
      // 详情对话框
      showDetailDialog: false,
      currentCollection: {}
    }
  },
  created() {
    this.refreshCollectionList()
  },
  computed: {
    filteredCollectionList() {
      let result = this.collectionList
      
      if (this.queryForm.keyword) {
        const keyword = this.queryForm.keyword
        result = result.filter(item => 
          item.barcode.includes(keyword) || item.isbn.includes(keyword)
        )
      }
      
      if (this.queryForm.bookName) {
        const bookName = this.queryForm.bookName.toLowerCase()
        result = result.filter(item => 
          item.bookName.toLowerCase().includes(bookName)
        )
      }
      
      if (this.queryForm.status) {
        result = result.filter(item => item.status === this.queryForm.status)
      }
      
      return result
    }
  },
  methods: {
    // 馆藏登记
    fetchBookInfo() {
      if (!this.registerForm.barcode) {
        ElMessage.warning('请输入图书条码')
        return
      }
      
      // 模拟API调用，根据条码获取图书信息
      ElMessage.success('正在获取图书信息...')
      setTimeout(() => {
        this.registerForm.isbn = '9787115537558'
        this.registerForm.bookName = 'Vue.js实战'
        this.registerForm.author = '梁灏'
        this.registerForm.publisher = '人民邮电出版社'
        ElMessage.success('图书信息获取成功')
      }, 1000)
    },
    saveCollectionRecord() {
      if (!this.registerForm.barcode || !this.registerForm.libraryArea || !this.registerForm.shelfNumber) {
        ElMessage.warning('请填写必填字段')
        return
      }
      
      // 保存馆藏记录
      const record = {
        ...this.registerForm,
        id: Date.now(),
        createTime: new Date().toLocaleString(),
        statusHistory: [{
          time: new Date().toLocaleString(),
          content: `初始状态：${this.getStatusText(this.registerForm.status)}`
        }]
      }
      
      this.collectionList.unshift(record)
      this.registerHistory.unshift(record)
      if (this.registerHistory.length > 10) {
        this.registerHistory.pop()
      }
      
      ElMessage.success('馆藏登记成功')
      this.clearRegisterForm()
    },
    clearRegisterForm() {
      this.registerForm = {
        barcode: '',
        isbn: '',
        bookName: '',
        author: '',
        publisher: '',
        libraryArea: 'MAIN',
        shelfNumber: '',
        status: 'GOOD',
        remark: ''
      }
    },
    batchRegister() {
      if (!this.batchRegisterForm.barcodeList) {
        ElMessage.warning('请输入条码列表')
        return
      }
      
      const barcodes = this.batchRegisterForm.barcodeList.split('\n').filter(barcode => barcode.trim())
      if (barcodes.length === 0) {
        ElMessage.warning('请输入有效的条码列表')
        return
      }
      
      ElMessage.success(`开始批量登记，共${barcodes.length}条记录`)
      this.showBatchRegisterDialog = false
      
      // 模拟批量登记
      setTimeout(() => {
        ElMessage.success(`批量登记完成，成功${barcodes.length}条`)
        this.batchRegisterForm.barcodeList = ''
        this.refreshCollectionList()
      }, 2000)
    },
    
    // 馆内调架
    fetchCollectionInfo() {
      if (!this.transferForm.barcode) {
        ElMessage.warning('请输入图书条码')
        return
      }
      
      // 模拟API调用，获取馆藏信息
      ElMessage.success('正在获取馆藏信息...')
      setTimeout(() => {
        this.transferForm.currentArea = '主馆'
        this.transferForm.currentShelf = 'A-01-01'
        ElMessage.success('馆藏信息获取成功')
      }, 1000)
    },
    saveTransferRecord() {
      if (!this.transferForm.barcode || !this.transferForm.targetArea || !this.transferForm.targetShelf || !this.transferForm.reason) {
        ElMessage.warning('请填写必填字段')
        return
      }
      
      // 保存调架记录
      ElMessage.success('调架记录保存成功')
      this.clearTransferForm()
    },
    clearTransferForm() {
      this.transferForm = {
        barcode: '',
        currentArea: '',
        currentShelf: '',
        targetArea: 'MAIN',
        targetShelf: '',
        reason: ''
      }
    },
    
    // 图书清点
    generateInventoryList() {
      // 模拟生成清点清单
      this.inventoryList = [
        { barcode: '10001', bookName: 'Vue.js实战', shelfNumber: 'A-01-01', status: 'UNCHECKED' },
        { barcode: '10002', bookName: 'Java核心技术', shelfNumber: 'A-01-02', status: 'UNCHECKED' },
        { barcode: '10003', bookName: 'Python数据分析', shelfNumber: 'A-01-03', status: 'UNCHECKED' }
      ]
      
      this.inventoryStatus = {
        title: '清点清单已生成',
        description: `共生成${this.inventoryList.length}条待清点记录`,
        type: 'success'
      }
      
      ElMessage.success('清点清单生成成功')
    },
    startInventory() {
      if (this.inventoryList.length === 0) {
        ElMessage.warning('请先生成清点清单')
        return
      }
      
      // 模拟开始清点
      this.inventoryStatus = {
        title: '清点进行中',
        description: '请使用扫码枪扫描图书条码进行清点',
        type: 'info'
      }
      
      ElMessage.success('清点已开始')
    },
    showInventoryResult() {
      // 模拟生成差异报表
      this.inventoryStatus = {
        title: '清点完成',
        description: '实际清点2本，差异1本（缺失1本）',
        type: 'warning'
      }
      
      ElMessage.success('差异报表已生成')
    },
    
    // 馆藏状态变更
    fetchCollectionStatus() {
      if (!this.statusForm.barcode) {
        ElMessage.warning('请输入图书条码')
        return
      }
      
      // 模拟API调用，获取馆藏状态
      ElMessage.success('正在获取馆藏状态...')
      setTimeout(() => {
        this.statusForm.currentStatus = '完好'
        ElMessage.success('馆藏状态获取成功')
      }, 1000)
    },
    updateStatus() {
      if (!this.statusForm.barcode || !this.statusForm.targetStatus) {
        ElMessage.warning('请填写必填字段')
        return
      }
      
      if ((this.statusForm.targetStatus === 'DAMAGED' && !this.statusForm.damageDesc) ||
          (this.statusForm.targetStatus === 'REPAIRING' && !this.statusForm.repairInfo) ||
          (this.statusForm.targetStatus === 'SCRAPPED' && !this.statusForm.scrapReason)) {
        ElMessage.warning('请填写完整信息')
        return
      }
      
      // 更新状态
      ElMessage.success('状态更新成功')
      this.clearStatusForm()
    },
    clearStatusForm() {
      this.statusForm = {
        barcode: '',
        currentStatus: '',
        targetStatus: '',
        damageDesc: '',
        repairInfo: '',
        scrapReason: ''
      }
    },
    
    // 馆藏查询
    refreshCollectionList() {
      // 模拟数据，实际应调用API
      this.collectionList = [
        {
          id: 1,
          barcode: '10001',
          isbn: '9787115537558',
          bookName: 'Vue.js实战',
          author: '梁灏',
          publisher: '人民邮电出版社',
          libraryArea: '主馆',
          shelfNumber: 'A-01-01',
          status: 'GOOD',
          createTime: '2025-11-20 14:30:00',
          remark: '无',
          statusHistory: [{
            time: '2025-11-20 14:30:00',
            content: '初始状态：完好'
          }]
        },
        {
          id: 2,
          barcode: '10002',
          isbn: '9787111641247',
          bookName: 'Java核心技术',
          author: '凯S.霍斯特曼',
          publisher: '机械工业出版社',
          libraryArea: '主馆',
          shelfNumber: 'A-01-02',
          status: 'DAMAGED',
          createTime: '2025-11-21 09:15:00',
          remark: '封面破损',
          statusHistory: [
            {
              time: '2025-11-21 09:15:00',
              content: '初始状态：完好'
            },
            {
              time: '2025-11-25 16:45:00',
              content: '状态变更：完好 → 破损，描述：封面破损'
            }
          ]
        }
      ]
    },
    searchCollection() {
      ElMessage.success('查询完成')
    },
    clearQueryForm() {
      this.queryForm = {
        keyword: '',
        bookName: '',
        status: ''
      }
    },
    handleCollectionSizeChange(size) {
      this.collectionPage.pageSize = size
    },
    handleCollectionCurrentChange(current) {
      this.collectionPage.currentPage = current
    },
    handleCollectionSelectionChange(val) {
      this.selectedCollectionItems = val
    },
    viewCollectionDetail(row) {
      this.currentCollection = row
      this.showDetailDialog = true
    },
    getStatusType(status) {
      const typeMap = {
        GOOD: 'success',
        DAMAGED: 'warning',
        REPAIRING: 'info',
        SCRAPPED: 'danger'
      }
      return typeMap[status] || 'default'
    },
    getStatusText(status) {
      const textMap = {
        GOOD: '完好',
        DAMAGED: '破损',
        REPAIRING: '维修中',
        SCRAPPED: '报废'
      }
      return textMap[status] || '未知状态'
    }
  }
}
</script>

<style scoped>
.collection-container {
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

.register-history {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.register-history h4 {
  margin-bottom: 15px;
}

.inventory-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.inventory-section h4 {
  margin-bottom: 15px;
}

.inventory-status {
  margin-bottom: 20px;
}

.inventory-list {
  margin-top: 20px;
}

.inventory-list h4 {
  margin-bottom: 15px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}
</style>