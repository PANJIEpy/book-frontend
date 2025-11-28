<template>
  <div class="purchase-container" style="padding: 10px">
    <el-tabs v-model="activeTab" type="card" @tab-change="handleTabChange">
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
              <el-table-column prop="author" label="作者" width="120" />
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
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button type="primary" size="mini" @click="editOrder(scope.row)">编辑</el-button>
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
    
    <!-- 编辑采购订单对话框 -->
    <el-dialog v-model="editOrderVisible" title="编辑采购订单" width="500px">
      <el-form :model="editOrderForm" label-width="120px">
        <el-form-item label="图书名称" disabled>
          <el-input v-model="editOrderForm.bookName" placeholder="图书名称" />
        </el-form-item>
        <el-form-item label="ISBN" disabled>
          <el-input v-model="editOrderForm.isbn" placeholder="ISBN" />
        </el-form-item>
        <el-form-item label="供应商名称" required>
          <el-input v-model="editOrderForm.supplierName" placeholder="请输入供应商名称" />
        </el-form-item>
        <el-form-item label="采购数量" required>
          <el-input-number v-model="editOrderForm.purchaseCount" :min="1" :step="1" placeholder="请输入采购数量" />
        </el-form-item>
        <el-form-item label="采购价格" required>
          <el-input-number v-model="editOrderForm.purchasePrice" :min="0" :step="0.01" placeholder="请输入采购价格" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editOrderVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditOrder">保存</el-button>
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
      currentOrder: {},
      
      // 编辑采购订单
      editOrderVisible: false,
      editOrderForm: {
        orderId: '',
        bookName: '',
        isbn: '',
        supplierName: '',
        purchaseCount: 1,
        purchasePrice: 0
      }
    }
  },
  created() {
    // 加载当前激活标签页的数据
    console.log('当前激活标签页:', this.activeTab);
    if (this.activeTab === 'review') {
      this.refreshReviewList();
    } else if (this.activeTab === 'pool') {
      this.refreshPoolList();
    } else if (this.activeTab === 'list') {
      this.refreshPurchaseList();
    } else if (this.activeTab === 'order') {
      this.refreshOrderList();
    }
  },
  watch: {
    // 监听activeTab变化，当切换到采购清单标签页时，自动刷新数据
    activeTab(newVal, oldVal) {
      console.log('activeTab变化:', oldVal, '->', newVal);
      this.handleTabChange({ name: newVal });
    }
  },
  methods: {
    // 推荐审核
    refreshReviewList() {
      // 调用API获取待审核推荐列表
      api.user.getRecommendList({
        pageNum: this.reviewPage.currentPage,
        pageSize: this.reviewPage.pageSize
      }).then(res => {
        console.log('推荐列表API响应:', res);
        if (res.code == 200 || res.code == '200' || res.code == 0 || res.code == '0') {
          // 适配后端返回的数据格式，将requestId映射为id，recommenderId映射为userId
          this.reviewList = res.data.records.map(item => ({
            id: item.requestId,
            userId: item.recommenderId,
            userName: item.recommenderName || `用户${item.recommenderId}`,
            bookName: item.bookName,
            isbn: item.isbn,
            author: item.author || '',
            reason: item.reason,
            createTime: item.createdAt
          }));
          this.reviewPage.total = res.data.total;
        }
      }).catch(error => {
        console.error('获取推荐列表失败:', error);
        ElMessage.error('获取推荐列表失败');
      });
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
      
      // 调用真实API进行审核
      if (this.reviewForm.result === '1') {
        // 审核通过
        api.user.approveRecommend(this.reviewForm.id).then(res => {
          console.log('审核通过API响应:', res);
          if (res.code == 200 || res.code == '200' || res.code == 0 || res.code == '0') {
            ElMessage.success('审核通过')
            this.reviewDialogVisible = false
            this.refreshReviewList()
            this.refreshPoolList()
          } else {
            ElMessage.error(res.msg || res.message || '审核失败')
          }
        }).catch(error => {
          console.error('审核通过失败:', error);
          ElMessage.error('审核通过失败')
        });
      } else {
        // 审核驳回
        api.user.rejectRecommend(this.reviewForm.id, this.reviewForm.rejectReason).then(res => {
          console.log('审核驳回API响应:', res);
          if (res.code == 200 || res.code == '200' || res.code == 0 || res.code == '0') {
            ElMessage.success('审核驳回')
            this.reviewDialogVisible = false
            this.refreshReviewList()
          } else {
            ElMessage.error(res.msg || res.message || '审核失败')
          }
        }).catch(error => {
          console.error('审核驳回失败:', error);
          ElMessage.error('审核驳回失败')
        });
      }
    },
    
    // 待采购池
    refreshPoolList() {
      // 调用API获取待采购池数据
      api.user.getRecommendPool().then(res => {
        console.log('待采购池API响应:', res);
        if (res.code == 200 || res.code == '200' || res.code == 0 || res.code == '0') {
          // 适配后端返回的数据格式，将requestId映射为id
          // 去重处理，同一本书只显示一次
          const uniqueBooks = [];
          const seenIsbns = new Set();
          
          res.data.forEach(item => {
            if (!seenIsbns.has(item.isbn)) {
              seenIsbns.add(item.isbn);
              uniqueBooks.push({
                id: item.requestId,
                bookName: item.bookName,
                isbn: item.isbn,
                author: item.author,
                publisher: item.publisher || '' // 添加出版社字段映射
              });
            }
          });
          
          this.poolList = uniqueBooks;
          this.poolPage.total = uniqueBooks.length;
        }
      }).catch(error => {
        console.error('获取待采购池失败:', error);
        ElMessage.error('获取待采购池失败');
      });
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
      
      // 调用API添加到采购清单
      const addPromises = this.selectedPoolItems.map(item => {
        return api.user.addToPurchaseOrder(item.id).then(res => {
          return { success: res.code == 200 || res.code == '200' || res.code == 0 || res.code == '0', item };
        }).catch(error => {
          console.error('添加到采购清单失败:', error);
          return { success: false, item };
        });
      });
      
      Promise.all(addPromises).then(results => {
        const successCount = results.filter(r => r.success).length;
        if (successCount === 0) {
          ElMessage.error('添加失败');
        } else if (successCount === 1) {
          ElMessage.success('1本图书添加成功');
        } else if (successCount === this.selectedPoolItems.length) {
          ElMessage.success(`${successCount}本图书全部添加成功`);
        } else {
          ElMessage.warning(`${successCount}/${this.selectedPoolItems.length} 本图书添加成功`);
        }
        
        // 刷新采购清单和待采购池
        this.refreshPoolList();
        this.refreshPurchaseList();
      });
    },
    
    // 采购清单
    refreshPurchaseList() {
      console.log('开始获取采购订单列表');
      // 先获取待采购池数据，用于补充出版社信息
      api.user.getRecommendPool().then(poolRes => {
        // 创建ISBN到出版社的映射
        const isbnToPublisher = new Map();
        
        if (poolRes && (poolRes.code == 200 || poolRes.code == '200' || poolRes.code == 0 || poolRes.code == '0')) {
          poolRes.data.forEach(item => {
            if (item.isbn && item.publisher) {
              isbnToPublisher.set(item.isbn, item.publisher);
            }
          });
        }
        
        // 再获取采购订单列表
        api.user.getPurchaseOrders().then(res => {
          console.log('采购订单API响应:', JSON.stringify(res));
          if (res && (res.code == 200 || res.code == '200' || res.code == 0 || res.code == '0')) {
            console.log('API响应成功，数据长度:', res.data ? res.data.length : 0);
            // 适配后端返回的数据格式
            this.purchaseList = res.data && Array.isArray(res.data) ? res.data.map(item => ({
              id: item.orderId,
              bookName: item.bookName,
              isbn: item.isbn,
              author: item.author || '', // 直接使用后端返回的author字段
              publisher: item.supplierName || '', // 出版社对应后端的supplierName字段
              quantity: item.purchaseCount || 1,
              estimatedPrice: item.purchasePrice || 0
            })) : [];
            this.listPage.total = this.purchaseList.length;
            console.log('处理后的采购订单列表:', JSON.stringify(this.purchaseList));
          } else {
            console.error('API响应失败，code:', res.code, 'message:', res.msg || res.message);
            ElMessage.error(res.msg || res.message || '获取采购订单失败');
          }
        }).catch(error => {
          console.error('获取采购订单失败:', error);
          ElMessage.error('获取采购订单失败');
        });
      }).catch(error => {
        console.error('获取待采购池数据失败:', error);
        // 即使获取待采购池数据失败，也要继续获取采购订单列表
        api.user.getPurchaseOrders().then(res => {
          if (res && (res.code == 200 || res.code == '200' || res.code == 0 || res.code == '0')) {
            this.purchaseList = res.data && Array.isArray(res.data) ? res.data.map(item => ({
              id: item.orderId,
              bookName: item.bookName,
              isbn: item.isbn,
              author: item.author || '',
              publisher: item.supplierName || '', // 出版社对应后端的supplierName字段
              quantity: item.purchaseCount || 1,
              estimatedPrice: item.purchasePrice || 0
            })) : [];
            this.listPage.total = this.purchaseList.length;
          }
        });
      });
    },
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
    // 编辑采购订单
    editOrder(row) {
      // 填充编辑表单
      this.editOrderForm = {
        orderId: row.id,
        bookName: row.bookName,
        isbn: row.isbn,
        supplierName: '',
        purchaseCount: row.quantity || 1,
        purchasePrice: row.estimatedPrice || 0
      };
      this.editOrderVisible = true;
    },
    submitEditOrder() {
      // 表单验证
      if (!this.editOrderForm.supplierName) {
        ElMessage.warning('请输入供应商名称');
        return;
      }
      if (!this.editOrderForm.purchaseCount || this.editOrderForm.purchaseCount < 1) {
        ElMessage.warning('请输入有效的采购数量');
        return;
      }
      if (this.editOrderForm.purchasePrice < 0) {
        ElMessage.warning('请输入有效的采购价格');
        return;
      }
      
      // 调用API编辑采购订单
      api.user.fillPurchaseOrder(this.editOrderForm.orderId, {
        supplierName: this.editOrderForm.supplierName,
        purchaseCount: this.editOrderForm.purchaseCount,
        purchasePrice: this.editOrderForm.purchasePrice
      }).then(res => {
        console.log('编辑采购订单API响应:', res);
        if (res.code == 200 || res.code == '200' || res.code == 0 || res.code == '0') {
          ElMessage.success('编辑成功');
          this.editOrderVisible = false;
          this.refreshPurchaseList();
        } else {
          ElMessage.error(res.msg || res.message || '编辑失败');
        }
      }).catch(error => {
        console.error('编辑采购订单失败:', error);
        ElMessage.error('编辑失败');
      });
    },
    // 标签页切换事件
    handleTabChange(tab) {
      // 根据切换的标签页刷新对应的数据
      // Element Plus的@tab-change事件参数可能是字符串name或对象{name: string}
      const tabName = typeof tab === 'string' ? tab : tab.name;
      console.log('切换到标签页:', tabName);
      if (tabName === 'review') {
        this.refreshReviewList();
      } else if (tabName === 'pool') {
        this.refreshPoolList();
      } else if (tabName === 'list') {
        this.refreshPurchaseList();
      } else if (tabName === 'order') {
        this.refreshOrderList();
      }
    },
    createPurchaseOrder() {
      if (this.selectedListItems.length === 0) {
        ElMessage.warning('请选择要生成订单的图书')
        return
      }
      
      // 调用API生成采购订单，只处理选中的行
      const generatePromises = this.selectedListItems.map(item => {
        return api.user.generatePurchaseOrder(item.id).then(res => {
          return { success: res.code == 200 || res.code == '200' || res.code == 0 || res.code == '0', item };
        }).catch(error => {
          console.error('生成采购订单失败:', error);
          return { success: false, item };
        });
      });
      
      Promise.all(generatePromises).then(results => {
        const successCount = results.filter(r => r.success).length;
        const totalCount = this.selectedListItems.length;
        
        // 根据生成数量显示不同的提示信息
        if (successCount === 0) {
          ElMessage.error('生成采购订单失败');
        } else if (successCount === 1) {
          ElMessage.success('1个图书的采购订单生成成功');
        } else if (successCount === totalCount) {
          ElMessage.success(`${successCount}个图书的采购订单生成成功`);
        } else {
          ElMessage.warning(`${successCount}/${totalCount} 个图书的采购订单生成成功`);
        }
        
        // 从采购清单中移除已生成订单的图书
        const selectedIds = new Set(this.selectedListItems.map(item => item.id));
        this.purchaseList = this.purchaseList.filter(item => !selectedIds.has(item.id));
        this.listPage.total = this.purchaseList.length;
        this.selectedListItems = []; // 清空选中状态
        this.refreshOrderList();
      });
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
      // 调用API获取已处理的采购订单列表
      api.user.getProcessedPurchaseOrders().then(res => {
        console.log('已处理采购订单API响应:', JSON.stringify(res));
        if (res && (res.code == 200 || res.code == '200' || res.code == 0 || res.code == '0')) {
          // 适配后端返回的数据格式
          this.orderList = res.data && Array.isArray(res.data) ? res.data.map(item => ({
            orderId: item.orderId,
            supplier: item.supplierName,
            totalAmount: item.totalAmount,
            status: item.orderStatus,
            createTime: item.createdAt,
            updateTime: item.updatedAt
          })) : [];
          this.orderPage.total = this.orderList.length;
        } else {
          console.error('获取已处理采购订单失败，code:', res.code, 'message:', res.msg || res.message);
          ElMessage.error(res.msg || res.message || '获取已处理采购订单失败');
        }
      }).catch(error => {
        console.error('获取已处理采购订单失败:', error);
        ElMessage.error('获取已处理采购订单失败');
      });
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