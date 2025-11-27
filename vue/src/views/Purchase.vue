<template>
  <div class="purchase-container" style="padding: 10px">
    <el-tabs v-model="activeTab" type="card">
      <!-- 推荐审核 -->
      <el-tab-pane label="推荐审核" name="review">
        <div class="tab-content">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>待审核推荐列表</span>
                <el-button type="primary" size="small" @click="refreshReviewList">刷新</el-button>
              </div>
            </template>
            
            <el-table :data="reviewList" stripe border>
              <el-table-column prop="id" label="推荐ID" width="80" sortable />
              <el-table-column prop="userId" label="推荐人ID" width="100" />
              <el-table-column prop="userName" label="推荐人" width="120" />
              <el-table-column prop="bookName" label="图书名称" min-width="150" />
              <el-table-column prop="isbn" label="ISBN" width="150" />
              <el-table-column prop="reason" label="推荐理由" min-width="200" />
              <el-table-column prop="createTime" label="推荐时间" width="180" sortable />
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button type="success" size="mini" @click="approveRecommend(scope.row)">通过</el-button>
                  <el-button type="danger" size="mini" @click="rejectRecommend(scope.row)">驳回</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="reviewPage.currentPage"
                v-model:page-size="reviewPage.pageSize"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="reviewPage.total"
                @size-change="handleReviewSizeChange"
                @current-change="handleReviewCurrentChange"
              />
            </div>
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- 待采购池 -->
      <el-tab-pane label="待采购池" name="pool">
        <div class="tab-content">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>待采购图书列表</span>
                <div>
                  <el-button type="primary" size="small" @click="addToPurchaseList">添加到采购清单</el-button>
                  <el-button type="success" size="small" @click="refreshPoolList">刷新</el-button>
                </div>
              </div>
            </template>
            
            <el-table :data="poolList" stripe border @selection-change="handlePoolSelectionChange">
              <el-table-column type="selection" width="55" />
              <el-table-column prop="id" label="ID" width="80" sortable />
              <el-table-column prop="bookName" label="图书名称" min-width="150" />
              <el-table-column prop="isbn" label="ISBN" width="150" />
              <el-table-column prop="author" label="作者" width="120" />
              <el-table-column prop="publisher" label="出版社" width="150" />
              <el-table-column prop="recommendCount" label="推荐次数" width="100" sortable />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag type="info">待采购</el-tag>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="poolPage.currentPage"
                v-model:page-size="poolPage.pageSize"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="poolPage.total"
                @size-change="handlePoolSizeChange"
                @current-change="handlePoolCurrentChange"
              />
            </div>
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- 采购清单 -->
      <el-tab-pane label="采购清单" name="list">
        <div class="tab-content">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>采购清单管理</span>
                <div>
                  <el-button type="primary" size="small" @click="createPurchaseOrder">生成采购订单</el-button>
                  <el-button type="success" size="small" @click="exportPurchaseList">导出Excel</el-button>
                  <el-button type="warning" size="small" @click="batchImport">批量导入</el-button>
                  <input type="file" ref="importFile" style="display: none" accept=".xlsx,.xls" @change="handleImport" />
                </div>
              </div>
            </template>
            
            <el-table :data="purchaseList" stripe border @selection-change="handleListSelectionChange">
              <el-table-column type="selection" width="55" />
              <el-table-column prop="id" label="清单ID" width="80" sortable />
              <el-table-column prop="bookName" label="图书名称" min-width="150" />
              <el-table-column prop="isbn" label="ISBN" width="150" />
              <el-table-column prop="author" label="作者" width="120" />
              <el-table-column prop="publisher" label="出版社" width="150" />
              <el-table-column prop="quantity" label="采购数量" width="100" />
              <el-table-column prop="estimatedPrice" label="预估价格" width="100" />
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button type="danger" size="mini" @click="removeFromList(scope.row)">移除</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="listPage.currentPage"
                v-model:page-size="listPage.pageSize"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="listPage.total"
                @size-change="handleListSizeChange"
                @current-change="handleListCurrentChange"
              />
            </div>
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- 采购订单 -->
      <el-tab-pane label="采购订单" name="order">
        <div class="tab-content">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>采购订单列表</span>
                <el-button type="primary" size="small" @click="refreshOrderList">刷新</el-button>
              </div>
            </template>
            
            <el-table :data="orderList" stripe border>
              <el-table-column prop="orderId" label="订单ID" width="120" sortable />
              <el-table-column prop="supplier" label="供应商" width="150" />
              <el-table-column prop="totalAmount" label="订单金额" width="120" />
              <el-table-column prop="status" label="订单状态" width="120">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="180" sortable />
              <el-table-column prop="updateTime" label="更新时间" width="180" sortable />
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button type="info" size="mini" @click="viewOrderDetail(scope.row)">查看详情</el-button>
                  <el-button v-if="scope.row.status === 0" type="success" size="mini" @click="updateOrderStatus(scope.row, 1)">标记发货</el-button>
                  <el-button v-if="scope.row.status === 1" type="success" size="mini" @click="updateOrderStatus(scope.row, 2)">标记到货</el-button>
                  <el-button v-if="scope.row.status < 2" type="danger" size="mini" @click="updateOrderStatus(scope.row, 3)">取消订单</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="orderPage.currentPage"
                v-model:page-size="orderPage.pageSize"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="orderPage.total"
                @size-change="handleOrderSizeChange"
                @current-change="handleOrderCurrentChange"
              />
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 审核对话框 -->
    <el-dialog v-model="reviewDialogVisible" :title="reviewDialogTitle" width="400px">
      <el-form :model="reviewForm" label-width="80px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="reviewForm.result" disabled>
            <el-radio label="1">通过</el-radio>
            <el-radio label="2">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="reviewForm.result === '2'" label="驳回理由">
          <el-input v-model="reviewForm.rejectReason" type="textarea" rows="4" placeholder="请输入驳回理由" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="reviewDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReview">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 订单详情对话框 -->
    <el-dialog v-model="orderDetailVisible" title="订单详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单ID">{{ currentOrder.orderId }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ currentOrder.supplier }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">{{ currentOrder.totalAmount }} 元</el-descriptions-item>
        <el-descriptions-item label="订单状态">{{ getStatusText(currentOrder.status) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentOrder.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentOrder.updateTime }}</el-descriptions-item>
      </el-descriptions>
      
      <h4 style="margin-top: 20px">订单图书列表</h4>
      <el-table :data="currentOrder.items" stripe border style="margin-top: 10px">
        <el-table-column prop="bookName" label="图书名称" />
        <el-table-column prop="isbn" label="ISBN" width="150" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="price" label="单价" width="100" />
      </el-table>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="orderDetailVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import api from '../api'

export default {
  name: 'Purchase',
  data() {
    return {
      activeTab: 'review',
      
      // 推荐审核
      reviewList: [],
      reviewPage: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      reviewDialogVisible: false,
      reviewDialogTitle: '',
      reviewForm: {
        id: '',
        result: '',
        rejectReason: ''
      },
      
      // 待采购池
      poolList: [],
      poolPage: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      selectedPoolItems: [],
      
      // 采购清单
      purchaseList: [],
      listPage: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      selectedListItems: [],
      
      // 采购订单
      orderList: [],
      orderPage: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      orderDetailVisible: false,
      currentOrder: {}
    }
  },
  created() {
    this.refreshReviewList()
  },
  methods: {
    // 推荐审核
    refreshReviewList() {
      // 模拟数据，实际应调用API
      this.reviewList = [
        { id: 1, userId: '1001', userName: '张三', bookName: 'Vue.js实战', isbn: '9787115428028', reason: '前端开发必备', createTime: '2025-11-20 14:30:00' },
        { id: 2, userId: '1002', userName: '李四', bookName: 'Java核心技术', isbn: '9787111641247', reason: 'Java学习经典', createTime: '2025-11-21 09:15:00' },
        { id: 3, userId: '1003', userName: '王五', bookName: 'Python数据分析', isbn: '9787115473804', reason: '数据分析入门', createTime: '2025-11-22 16:45:00' }
      ]
      this.reviewPage.total = this.reviewList.length
    },
    handleReviewSizeChange(size) {
      this.reviewPage.pageSize = size
      this.refreshReviewList()
    },
    handleReviewCurrentChange(current) {
      this.reviewPage.currentPage = current
      this.refreshReviewList()
    },
    approveRecommend(row) {
      this.reviewDialogTitle = '审核通过'
      this.reviewForm = {
        id: row.id,
        result: '1',
        rejectReason: ''
      }
      this.reviewDialogVisible = true
    },
    rejectRecommend(row) {
      this.reviewDialogTitle = '审核驳回'
      this.reviewForm = {
        id: row.id,
        result: '2',
        rejectReason: ''
      }
      this.reviewDialogVisible = true
    },
    submitReview() {
      if (this.reviewForm.result === '2' && !this.reviewForm.rejectReason) {
        ElMessage.warning('请输入驳回理由')
        return
      }
      
      // 模拟API调用
      ElMessage.success('审核完成')
      this.reviewDialogVisible = false
      this.refreshReviewList()
      this.refreshPoolList()
    },
    
    // 待采购池
    refreshPoolList() {
      // 模拟数据，实际应调用API
      this.poolList = [
        { id: 1, bookName: 'Vue.js实战', isbn: '9787115428028', author: '梁灏', publisher: '人民邮电出版社', recommendCount: 5 },
        { id: 2, bookName: 'Java核心技术', isbn: '9787111641247', author: '凯S.霍斯特曼', publisher: '机械工业出版社', recommendCount: 3 },
        { id: 3, bookName: 'Python数据分析', isbn: '9787115473804', author: 'Wes McKinney', publisher: '人民邮电出版社', recommendCount: 7 }
      ]
      this.poolPage.total = this.poolList.length
    },
    handlePoolSizeChange(size) {
      this.poolPage.pageSize = size
      this.refreshPoolList()
    },
    handlePoolCurrentChange(current) {
      this.poolPage.currentPage = current
      this.refreshPoolList()
    },
    handlePoolSelectionChange(val) {
      this.selectedPoolItems = val
    },
    addToPurchaseList() {
      if (this.selectedPoolItems.length === 0) {
        ElMessage.warning('请选择要添加的图书')
        return
      }
      
      // 模拟添加到采购清单
      this.selectedPoolItems.forEach(item => {
        const exists = this.purchaseList.some(listItem => listItem.isbn === item.isbn)
        if (!exists) {
          this.purchaseList.push({
            id: Date.now() + Math.random(),
            bookName: item.bookName,
            isbn: item.isbn,
            author: item.author,
            publisher: item.publisher,
            quantity: 1,
            estimatedPrice: 0
          })
        }
      })
      this.listPage.total = this.purchaseList.length
      ElMessage.success('添加成功')
    },
    
    // 采购清单
    handleListSelectionChange(val) {
      this.selectedListItems = val
    },
    handleListSizeChange(size) {
      this.listPage.pageSize = size
    },
    handleListCurrentChange(current) {
      this.listPage.currentPage = current
    },
    removeFromList(row) {
      const index = this.purchaseList.indexOf(row)
      if (index > -1) {
        this.purchaseList.splice(index, 1)
        this.listPage.total = this.purchaseList.length
        ElMessage.success('移除成功')
      }
    },
    createPurchaseOrder() {
      if (this.purchaseList.length === 0) {
        ElMessage.warning('采购清单为空')
        return
      }
      
      // 模拟生成采购订单
      ElMessage.success('采购订单生成成功')
      this.purchaseList = []
      this.listPage.total = 0
      this.refreshOrderList()
    },
    exportPurchaseList() {
      ElMessage.info('导出功能开发中')
    },
    batchImport() {
      this.$refs.importFile.click()
    },
    handleImport() {
      ElMessage.info('导入功能开发中')
      this.$refs.importFile.value = ''
    },
    
    // 采购订单
    refreshOrderList() {
      // 模拟数据，实际应调用API
      this.orderList = [
        { orderId: 'PO20251120001', supplier: '北京图书供应商', totalAmount: 128.5, status: 0, createTime: '2025-11-20 15:30:00', updateTime: '2025-11-20 15:30:00' },
        { orderId: 'PO20251119001', supplier: '上海图书供应商', totalAmount: 256.0, status: 1, createTime: '2025-11-19 10:15:00', updateTime: '2025-11-20 09:00:00' },
        { orderId: 'PO20251118001', supplier: '广州图书供应商', totalAmount: 384.5, status: 2, createTime: '2025-11-18 14:45:00', updateTime: '2025-11-19 16:30:00' }
      ]
      this.orderPage.total = this.orderList.length
    },
    handleOrderSizeChange(size) {
      this.orderPage.pageSize = size
      this.refreshOrderList()
    },
    handleOrderCurrentChange(current) {
      this.orderPage.currentPage = current
      this.refreshOrderList()
    },
    getStatusType(status) {
      const typeMap = { 0: 'warning', 1: 'info', 2: 'success', 3: 'danger' }
      return typeMap[status] || 'default'
    },
    getStatusText(status) {
      const textMap = { 0: '待发货', 1: '已发货', 2: '已到货', 3: '已取消' }
      return textMap[status] || '未知状态'
    },
    viewOrderDetail(row) {
      this.currentOrder = {
        ...row,
        items: [
          { bookName: 'Vue.js实战', isbn: '9787115428028', quantity: 1, price: 59.0 },
          { bookName: 'Java核心技术', isbn: '9787111641247', quantity: 1, price: 128.0 }
        ]
      }
      this.orderDetailVisible = true
    },
    updateOrderStatus(row, status) {
      // 模拟更新订单状态
      row.status = status
      row.updateTime = new Date().toLocaleString()
      ElMessage.success('订单状态已更新')
      
      // 如果是到货状态，触发入库提醒
      if (status === 2) {
        ElMessage.success('图书已到货，触发入库提醒')
      }
    }
  }
}
</script>

<style scoped>
.purchase-container {
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