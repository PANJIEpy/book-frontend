<template>
  <div class="inventory-container">
    <h2>库存管理</h2>
    
    <!-- 库存概览 -->
    <el-row :gutter="20" class="overview-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="overview-card">
          <div class="card-content">
            <div class="card-title">总库存</div>
            <div class="card-value">{{ totalInventory }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="overview-card">
          <div class="card-content">
            <div class="card-title">可借数量</div>
            <div class="card-value">{{ availableInventory }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="overview-card">
          <div class="card-content">
            <div class="card-title">在借数量</div>
            <div class="card-value">{{ borrowedInventory }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="overview-card">
          <div class="card-content">
            <div class="card-title">低库存预警</div>
            <div class="card-value">{{ lowStockCount }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 库存数据管理 -->
    <el-card shadow="hover" class="main-card">
      <template #header>
        <div class="card-header">
          <span>库存数据管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="exportLowStock">
              <el-icon><Download /></el-icon> 导出低库存清单
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="search-filter">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select v-model="searchParams.category" placeholder="按分类筛选" clearable>
              <el-option label="文学" value="文学" />
              <el-option label="科技" value="科技" />
              <el-option label="教育" value="教育" />
              <el-option label="艺术" value="艺术" />
              <el-option label="历史" value="历史" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="searchParams.location" placeholder="按馆藏位置筛选" clearable>
              <el-option label="一楼文学区" value="一楼文学区" />
              <el-option label="二楼科技区" value="二楼科技区" />
              <el-option label="三楼教育区" value="三楼教育区" />
              <el-option label="四楼艺术区" value="四楼艺术区" />
              <el-option label="五楼历史区" value="五楼历史区" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="searchParams.status" placeholder="按状态筛选" clearable>
              <el-option label="可借" value="可借" />
              <el-option label="在借" value="在借" />
              <el-option label="破损" value="破损" />
              <el-option label="维修中" value="维修中" />
              <el-option label="报废" value="报废" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="searchInventory">
              <el-icon><Search /></el-icon> 搜索
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 库存数据表格 -->
      <el-table :data="inventoryData" stripe border style="width: 100%">
        <el-table-column prop="id" label="库存ID" width="100" />
        <el-table-column prop="bookId" label="图书ID" width="100" />
        <el-table-column prop="bookName" label="图书名称" min-width="200" />
        <el-table-column prop="isbn" label="ISBN" width="150" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="location" label="馆藏位置" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="total" label="总数量" width="100" />
        <el-table-column prop="available" label="可借数量" width="100" />
        <el-table-column prop="borrowed" label="在借数量" width="100" />
        <el-table-column prop="lowStockThreshold" label="低库存阈值" width="120" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button type="primary" size="mini" @click="editLowStockThreshold(scope.row)">
              设置阈值
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 库存异动记录 -->
    <el-card shadow="hover" class="main-card">
      <template #header>
        <div class="card-header">
          <span>库存异动记录</span>
          <div class="header-actions">
            <el-button type="primary" @click="exportInventoryFlow">
              <el-icon><Download /></el-icon> 导出库存流水
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="search-filter">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input v-model="flowSearchParams.bookName" placeholder="图书名称" clearable />
          </el-col>
          <el-col :span="6">
            <el-select v-model="flowSearchParams.type" placeholder="异动类型" clearable>
              <el-option label="入库" value="入库" />
              <el-option label="出库" value="出库" />
              <el-option label="调架" value="调架" />
              <el-option label="报废" value="报废" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-date-picker
              v-model="flowSearchParams.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="searchInventoryFlow">
              <el-icon><Search /></el-icon> 搜索
            </el-button>
            <el-button @click="resetFlowSearch">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 库存异动表格 -->
      <el-table :data="inventoryFlowData" stripe border style="width: 100%">
        <el-table-column prop="id" label="记录ID" width="100" />
        <el-table-column prop="bookId" label="图书ID" width="100" />
        <el-table-column prop="bookName" label="图书名称" min-width="200" />
        <el-table-column prop="type" label="异动类型" width="100">
          <template #default="scope">
            <el-tag :type="getFlowType(scope.row.type)">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="operateTime" label="操作时间" width="180" />
        <el-table-column prop="remark" label="备注" min-width="200" />
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="flowCurrentPage"
          v-model:page-size="flowPageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="flowTotal"
          @size-change="handleFlowSizeChange"
          @current-change="handleFlowCurrentChange"
        />
      </div>
    </el-card>

    <!-- 设置低库存阈值对话框 -->
    <el-dialog
      v-model="thresholdDialogVisible"
      title="设置低库存阈值"
      width="400px"
    >
      <el-form :model="thresholdForm" label-width="100px">
        <el-form-item label="图书名称">
          <el-input v-model="thresholdForm.bookName" disabled />
        </el-form-item>
        <el-form-item label="当前阈值">
          <el-input v-model="thresholdForm.currentThreshold" disabled />
        </el-form-item>
        <el-form-item label="新阈值" required>
          <el-input-number
            v-model="thresholdForm.newThreshold"
            :min="0"
            :step="1"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="thresholdDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveThreshold">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Download, Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 库存概览数据
const totalInventory = ref(12580);
const availableInventory = ref(8920);
const borrowedInventory = ref(3200);
const lowStockCount = ref(156);

// 库存数据搜索参数
const searchParams = ref({
  category: '',
  location: '',
  status: ''
});

// 库存数据分页
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(100);

// 库存异动记录搜索参数
const flowSearchParams = ref({
  bookName: '',
  type: '',
  dateRange: null
});

// 库存异动记录分页
const flowCurrentPage = ref(1);
const flowPageSize = ref(10);
const flowTotal = ref(200);

// 阈值设置对话框
const thresholdDialogVisible = ref(false);
const thresholdForm = ref({
  bookName: '',
  currentThreshold: 0,
  newThreshold: 0
});

// 模拟库存数据
const inventoryData = ref([
  { id: 1, bookId: 'BK001', bookName: 'JavaScript高级程序设计', isbn: '9787115428085', category: '科技', location: '二楼科技区', status: '可借', total: 10, available: 7, borrowed: 3, lowStockThreshold: 5 },
  { id: 2, bookId: 'BK002', bookName: '百年孤独', isbn: '9787544270878', category: '文学', location: '一楼文学区', status: '在借', total: 8, available: 2, borrowed: 6, lowStockThreshold: 3 },
  { id: 3, bookId: 'BK003', bookName: '中国通史', isbn: '9787101110261', category: '历史', location: '五楼历史区', status: '可借', total: 5, available: 3, borrowed: 2, lowStockThreshold: 2 },
  { id: 4, bookId: 'BK004', bookName: '艺术概论', isbn: '9787515343542', category: '艺术', location: '四楼艺术区', status: '破损', total: 6, available: 4, borrowed: 2, lowStockThreshold: 3 },
  { id: 5, bookId: 'BK005', bookName: '教育学基础', isbn: '9787107321080', category: '教育', location: '三楼教育区', status: '维修中', total: 7, available: 5, borrowed: 2, lowStockThreshold: 3 },
  { id: 6, bookId: 'BK006', bookName: '算法导论', isbn: '9787111407010', category: '科技', location: '二楼科技区', status: '可借', total: 12, available: 8, borrowed: 4, lowStockThreshold: 5 },
  { id: 7, bookId: 'BK007', bookName: '红楼梦', isbn: '9787532154563', category: '文学', location: '一楼文学区', status: '可借', total: 15, available: 10, borrowed: 5, lowStockThreshold: 5 },
  { id: 8, bookId: 'BK008', bookName: '世界简史', isbn: '9787508686648', category: '历史', location: '五楼历史区', status: '在借', total: 9, available: 3, borrowed: 6, lowStockThreshold: 3 },
  { id: 9, bookId: 'BK009', bookName: '设计心理学', isbn: '9787111486608', category: '艺术', location: '四楼艺术区', status: '可借', total: 8, available: 6, borrowed: 2, lowStockThreshold: 3 },
  { id: 10, bookId: 'BK010', bookName: '教育心理学', isbn: '9787107319000', category: '教育', location: '三楼教育区', status: '可借', total: 11, available: 8, borrowed: 3, lowStockThreshold: 4 }
]);

// 模拟库存异动记录数据
const inventoryFlowData = ref([
  { id: 1, bookId: 'BK001', bookName: 'JavaScript高级程序设计', type: '入库', quantity: 5, operator: 'admin', operateTime: '2023-05-10 14:30:00', remark: '新书采购入库' },
  { id: 2, bookId: 'BK002', bookName: '百年孤独', type: '出库', quantity: 2, operator: 'librarian1', operateTime: '2023-05-11 09:15:00', remark: '借阅出库' },
  { id: 3, bookId: 'BK003', bookName: '中国通史', type: '调架', quantity: 3, operator: 'librarian2', operateTime: '2023-05-12 16:45:00', remark: '从三楼调到五楼' },
  { id: 4, bookId: 'BK004', bookName: '艺术概论', type: '报废', quantity: 1, operator: 'admin', operateTime: '2023-05-13 11:20:00', remark: '图书严重破损，无法修复' },
  { id: 5, bookId: 'BK005', bookName: '教育学基础', type: '入库', quantity: 4, operator: 'librarian1', operateTime: '2023-05-14 10:00:00', remark: '补充采购入库' },
  { id: 6, bookId: 'BK006', bookName: '算法导论', type: '出库', quantity: 3, operator: 'librarian2', operateTime: '2023-05-15 15:30:00', remark: '借阅出库' },
  { id: 7, bookId: 'BK007', bookName: '红楼梦', type: '调架', quantity: 2, operator: 'librarian1', operateTime: '2023-05-16 08:45:00', remark: '从二楼调到一楼' },
  { id: 8, bookId: 'BK008', bookName: '世界简史', type: '入库', quantity: 6, operator: 'admin', operateTime: '2023-05-17 13:20:00', remark: '新书采购入库' },
  { id: 9, bookId: 'BK009', bookName: '设计心理学', type: '出库', quantity: 1, operator: 'librarian2', operateTime: '2023-05-18 14:10:00', remark: '借阅出库' },
  { id: 10, bookId: 'BK010', bookName: '教育心理学', type: '报废', quantity: 2, operator: 'admin', operateTime: '2023-05-19 10:50:00', remark: '图书老化，无法使用' }
]);

// 根据状态获取标签类型
const getStatusType = (status) => {
  const statusMap = {
    '可借': 'success',
    '在借': 'primary',
    '破损': 'warning',
    '维修中': 'info',
    '报废': 'danger'
  };
  return statusMap[status] || 'info';
};

// 根据异动类型获取标签类型
const getFlowType = (type) => {
  const typeMap = {
    '入库': 'success',
    '出库': 'primary',
    '调架': 'info',
    '报废': 'danger'
  };
  return typeMap[type] || 'info';
};

// 搜索库存数据
const searchInventory = () => {
  // 模拟搜索逻辑
  ElMessage.success('搜索成功');
};

// 重置搜索
const resetSearch = () => {
  searchParams.value = {
    category: '',
    location: '',
    status: ''
  };
};

// 搜索库存异动记录
const searchInventoryFlow = () => {
  // 模拟搜索逻辑
  ElMessage.success('搜索成功');
};

// 重置库存异动记录搜索
const resetFlowSearch = () => {
  flowSearchParams.value = {
    bookName: '',
    type: '',
    dateRange: null
  };
};

// 导出低库存清单
const exportLowStock = () => {
  // 模拟导出逻辑
  ElMessage.success('低库存清单导出成功');
};

// 导出库存流水
const exportInventoryFlow = () => {
  // 模拟导出逻辑
  ElMessage.success('库存流水导出成功');
};

// 编辑低库存阈值
const editLowStockThreshold = (row) => {
  thresholdForm.value = {
    bookName: row.bookName,
    currentThreshold: row.lowStockThreshold,
    newThreshold: row.lowStockThreshold
  };
  thresholdDialogVisible.value = true;
};

// 保存阈值设置
const saveThreshold = () => {
  // 模拟保存逻辑
  thresholdDialogVisible.value = false;
  ElMessage.success('低库存阈值设置成功');
};

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val;
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
};

const handleFlowSizeChange = (val) => {
  flowPageSize.value = val;
};

const handleFlowCurrentChange = (val) => {
  flowCurrentPage.value = val;
};
</script>

<style scoped>
.inventory-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.overview-cards {
  margin-bottom: 20px;
}

.overview-card {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-content {
  text-align: center;
}

.card-title {
  font-size: 16px;
  color: #606266;
  margin-bottom: 10px;
}

.card-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
}

.main-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-filter {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f0f2f5;
  border-radius: 4px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>