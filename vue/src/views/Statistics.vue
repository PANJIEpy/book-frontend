<template>
  <div class="statistics-container">
    <h2>数据统计分析</h2>

    <el-tabs v-model="activeTab" class="main-tabs">
      <!-- 借阅量统计 -->
      <el-tab-pane label="借阅量统计" name="borrow">
        <el-card shadow="hover" class="main-card">
          <template #header>
            <div class="card-header">
              <span>借阅量统计</span>
              <div class="header-actions">
                <el-button type="primary" @click="exportBorrowStats">
                  <el-icon><Download /></el-icon> 导出统计
                </el-button>
              </div>
            </div>
          </template>

          <!-- 统计条件 -->
          <div class="search-filter">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-select v-model="borrowStatsParams.timeRange" placeholder="时间范围">
                  <el-option label="近7天" value="7d" />
                  <el-option label="近30天" value="30d" />
                  <el-option label="近90天" value="90d" />
                  <el-option label="近1年" value="1y" />
                  <el-option label="自定义" value="custom" />
                </el-select>
              </el-col>
              <el-col :span="6" v-if="borrowStatsParams.timeRange === 'custom'">
                <el-date-picker
                  v-model="borrowStatsParams.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-col>
              <el-col :span="6">
                <el-select v-model="borrowStatsParams.category" placeholder="图书分类">
                  <el-option label="全部" value="" />
                  <el-option label="文学" value="文学" />
                  <el-option label="科技" value="科技" />
                  <el-option label="教育" value="教育" />
                  <el-option label="艺术" value="艺术" />
                  <el-option label="历史" value="历史" />
                </el-select>
              </el-col>
              <el-col :span="6">
                <el-button type="primary" @click="generateBorrowStats">
                  <el-icon><Refresh /></el-icon> 生成统计
                </el-button>
              </el-col>
            </el-row>
          </div>

          <!-- 统计概览 -->
          <el-row :gutter="20" class="overview-cards">
            <el-col :span="6">
              <el-card shadow="hover" class="overview-card">
                <div class="card-content">
                  <div class="card-title">总借阅量</div>
                  <div class="card-value">{{ borrowOverview.totalBorrow }}</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="overview-card">
                <div class="card-content">
                  <div class="card-title">日均借阅量</div>
                  <div class="card-value">{{ borrowOverview.dailyAvg }}</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="overview-card">
                <div class="card-content">
                  <div class="card-title">最多借阅分类</div>
                  <div class="card-value">{{ borrowOverview.topCategory }}</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="overview-card">
                <div class="card-content">
                  <div class="card-title">最多借阅用户类型</div>
                  <div class="card-value">{{ borrowOverview.topUserType }}</div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <!-- 借阅趋势图 -->
          <div class="chart-container">
            <h3>借阅趋势</h3>
            <div class="chart-placeholder">
              <el-empty description="借阅趋势图（模拟）" />
              <!-- 实际项目中可替换为ECharts等图表库 -->
            </div>
          </div>

          <!-- 借阅分类占比 -->
          <div class="chart-container">
            <h3>借阅分类占比</h3>
            <div class="chart-placeholder">
              <el-empty description="借阅分类占比图（模拟）" />
              <!-- 实际项目中可替换为ECharts等图表库 -->
            </div>
          </div>

          <!-- 借阅量表格 -->
          <el-table :data="borrowStatsData" stripe border style="width: 100%">
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="category" label="分类" width="100" />
            <el-table-column prop="userType" label="用户类型" width="100" />
            <el-table-column prop="borrowCount" label="借阅量" width="100" />
            <el-table-column prop="returnCount" label="归还量" width="100" />
            <el-table-column prop="overdueCount" label="逾期量" width="100" />
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 采购效果分析 -->
      <el-tab-pane label="采购效果分析" name="purchase">
        <el-card shadow="hover" class="main-card">
          <template #header>
            <div class="card-header">
              <span>采购效果分析</span>
              <div class="header-actions">
                <el-button type="primary" @click="exportPurchaseStats">
                  <el-icon><Download /></el-icon> 导出统计
                </el-button>
              </div>
            </div>
          </template>

          <!-- 统计条件 -->
          <div class="search-filter">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-select v-model="purchaseStatsParams.year" placeholder="年份">
                  <el-option label="2023" value="2023" />
                  <el-option label="2022" value="2022" />
                  <el-option label="2021" value="2021" />
                </el-select>
              </el-col>
              <el-col :span="6">
                <el-button type="primary" @click="generatePurchaseStats">
                  <el-icon><Refresh /></el-icon> 生成统计
                </el-button>
              </el-col>
            </el-row>
          </div>

          <!-- 采购概览 -->
          <el-row :gutter="20" class="overview-cards">
            <el-col :span="6">
              <el-card shadow="hover" class="overview-card">
                <div class="card-content">
                  <div class="card-title">预算总额</div>
                  <div class="card-value">¥{{ purchaseOverview.totalBudget }}</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="overview-card">
                <div class="card-content">
                  <div class="card-title">执行金额</div>
                  <div class="card-value">¥{{ purchaseOverview.executedBudget }}</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="overview-card">
                <div class="card-content">
                  <div class="card-title">执行率</div>
                  <div class="card-value">{{ purchaseOverview.executionRate }}%</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="overview-card">
                <div class="card-content">
                  <div class="card-title">到货率</div>
                  <div class="card-value">{{ purchaseOverview.arrivalRate }}%</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="overview-card">
                <div class="card-content">
                  <div class="card-title">推荐采纳率</div>
                  <div class="card-value">{{ purchaseOverview.recommendationRate }}%</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="overview-card">
                <div class="card-content">
                  <div class="card-title">新增图书</div>
                  <div class="card-value">{{ purchaseOverview.newBooks }}</div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <!-- 采购效果表格 -->
          <el-table :data="purchaseStatsData" stripe border style="width: 100%">
            <el-table-column prop="category" label="分类" width="100" />
            <el-table-column prop="budget" label="预算(元)" width="120" />
            <el-table-column prop="actualCost" label="实际支出(元)" width="150" />
            <el-table-column prop="purchaseCount" label="采购数量" width="120" />
            <el-table-column prop="arrivalCount" label="到货数量" width="120" />
            <el-table-column prop="arrivalRate" label="到货率" width="120">
              <template #default="scope">
                <el-progress
                  :percentage="scope.row.arrivalRate"
                  :stroke-width="10"
                  :show-text="true"
                />
              </template>
            </el-table-column>
            <el-table-column prop="recommendationCount" label="推荐数量" width="120" />
            <el-table-column prop="adoptionCount" label="采纳数量" width="120" />
            <el-table-column prop="adoptionRate" label="采纳率" width="120">
              <template #default="scope">
                <el-progress
                  :percentage="scope.row.adoptionRate"
                  :stroke-width="10"
                  :show-text="true"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 资源利用率统计 -->
      <el-tab-pane label="资源利用率统计" name="utilization">
        <el-card shadow="hover" class="main-card">
          <template #header>
            <div class="card-header">
              <span>资源利用率统计</span>
              <div class="header-actions">
                <el-button type="primary" @click="exportUtilizationStats">
                  <el-icon><Download /></el-icon> 导出统计
                </el-button>
              </div>
            </div>
          </template>

          <!-- 统计条件 -->
          <div class="search-filter">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-select v-model="utilizationStatsParams.timeRange" placeholder="时间范围">
                  <el-option label="近30天" value="30d" />
                  <el-option label="近90天" value="90d" />
                  <el-option label="近1年" value="1y" />
                </el-select>
              </el-col>
              <el-col :span="6">
                <el-button type="primary" @click="generateUtilizationStats">
                  <el-icon><Refresh /></el-icon> 生成统计
                </el-button>
              </el-col>
            </el-row>
          </div>

          <!-- 资源利用概览 -->
          <el-row :gutter="20" class="overview-cards">
            <el-col :span="6">
              <el-card shadow="hover" class="overview-card">
                <div class="card-content">
                  <div class="card-title">纸质资源利用率</div>
                  <div class="card-value">{{ utilizationOverview.paperUtilization }}%</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="overview-card">
                <div class="card-content">
                  <div class="card-title">电子资源利用率</div>
                  <div class="card-value">{{ utilizationOverview.electronicUtilization }}%</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="overview-card">
                <div class="card-content">
                  <div class="card-title">期刊到刊率</div>
                  <div class="card-value">{{ utilizationOverview.journalArrivalRate }}%</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="overview-card">
                <div class="card-content">
                  <div class="card-title">期刊借阅率</div>
                  <div class="card-value">{{ utilizationOverview.journalBorrowRate }}%</div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <!-- 资源利用率对比 -->
          <div class="chart-container">
            <h3>资源利用率对比</h3>
            <div class="chart-placeholder">
              <el-empty description="资源利用率对比图（模拟）" />
              <!-- 实际项目中可替换为ECharts等图表库 -->
            </div>
          </div>

          <!-- 资源利用率表格 -->
          <el-table :data="utilizationStatsData" stripe border style="width: 100%">
            <el-table-column prop="resourceType" label="资源类型" width="120" />
            <el-table-column prop="totalCount" label="总数量" width="100" />
            <el-table-column prop="usedCount" label="使用数量" width="120" />
            <el-table-column prop="utilizationRate" label="利用率" width="120">
              <template #default="scope">
                <el-progress
                  :percentage="scope.row.utilizationRate"
                  :stroke-width="10"
                  :show-text="true"
                />
              </template>
            </el-table-column>
            <el-table-column prop="viewCount" label="浏览量" width="100" />
            <el-table-column prop="borrowCount" label="借阅量" width="100" />
            <el-table-column prop="avgBorrowDays" label="平均借阅天数" width="150" />
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { Download, Refresh } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 激活的标签页
const activeTab = ref('borrow');

// 借阅量统计参数
const borrowStatsParams = ref({
  timeRange: '30d',
  dateRange: null,
  category: ''
});

// 采购效果分析参数
const purchaseStatsParams = ref({
  year: '2023'
});

// 资源利用率统计参数
const utilizationStatsParams = ref({
  timeRange: '30d'
});

// 借阅概览数据
const borrowOverview = ref({
  totalBorrow: 12580,
  dailyAvg: 419,
  topCategory: '科技',
  topUserType: '学生'
});

// 采购概览数据
const purchaseOverview = ref({
  totalBudget: 500000,
  executedBudget: 485000,
  executionRate: 97,
  arrivalRate: 95,
  recommendationRate: 88,
  newBooks: 2580
});

// 资源利用概览数据
const utilizationOverview = ref({
  paperUtilization: 65,
  electronicUtilization: 82,
  journalArrivalRate: 98,
  journalBorrowRate: 45
});

// 模拟借阅统计数据
const borrowStatsData = ref([
  { date: '2023-05-01', category: '科技', userType: '学生', borrowCount: 125, returnCount: 118, overdueCount: 7 },
  { date: '2023-05-02', category: '文学', userType: '教师', borrowCount: 89, returnCount: 85, overdueCount: 4 },
  { date: '2023-05-03', category: '教育', userType: '学生', borrowCount: 67, returnCount: 62, overdueCount: 5 },
  { date: '2023-05-04', category: '艺术', userType: '学生', borrowCount: 45, returnCount: 42, overdueCount: 3 },
  { date: '2023-05-05', category: '历史', userType: '教师', borrowCount: 56, returnCount: 54, overdueCount: 2 },
  { date: '2023-05-06', category: '科技', userType: '学生', borrowCount: 132, returnCount: 125, overdueCount: 7 },
  { date: '2023-05-07', category: '文学', userType: '学生', borrowCount: 98, returnCount: 92, overdueCount: 6 }
]);

// 模拟采购统计数据
const purchaseStatsData = ref([
  { category: '科技', budget: 150000, actualCost: 145000, purchaseCount: 850, arrivalCount: 810, arrivalRate: 95.3, recommendationCount: 250, adoptionCount: 220, adoptionRate: 88 },
  { category: '文学', budget: 120000, actualCost: 118000, purchaseCount: 620, arrivalCount: 605, arrivalRate: 97.6, recommendationCount: 200, adoptionCount: 185, adoptionRate: 92.5 },
  { category: '教育', budget: 80000, actualCost: 78000, purchaseCount: 450, arrivalCount: 435, arrivalRate: 96.7, recommendationCount: 150, adoptionCount: 132, adoptionRate: 88 },
  { category: '艺术', budget: 70000, actualCost: 68000, purchaseCount: 380, arrivalCount: 365, arrivalRate: 96.1, recommendationCount: 120, adoptionCount: 105, adoptionRate: 87.5 },
  { category: '历史', budget: 80000, actualCost: 76000, purchaseCount: 280, arrivalCount: 265, arrivalRate: 94.6, recommendationCount: 100, adoptionCount: 88, adoptionRate: 88 }
]);

// 模拟资源利用率统计数据
const utilizationStatsData = ref([
  { resourceType: '纸质图书', totalCount: 52000, usedCount: 33800, utilizationRate: 65, viewCount: 0, borrowCount: 33800, avgBorrowDays: 21.5 },
  { resourceType: '电子图书', totalCount: 25800, usedCount: 21156, utilizationRate: 82, viewCount: 125600, borrowCount: 21156, avgBorrowDays: 0 },
  { resourceType: '纸质期刊', totalCount: 1200, usedCount: 540, utilizationRate: 45, viewCount: 0, borrowCount: 540, avgBorrowDays: 14.8 },
  { resourceType: '电子期刊', totalCount: 850, usedCount: 731, utilizationRate: 86, viewCount: 89200, borrowCount: 731, avgBorrowDays: 0 },
  { resourceType: '学位论文', totalCount: 15600, usedCount: 11232, utilizationRate: 72, viewCount: 156000, borrowCount: 11232, avgBorrowDays: 0 }
]);

// 生成借阅统计
const generateBorrowStats = () => {
  // 模拟生成逻辑
  ElMessage.success('借阅统计生成成功');
};

// 生成采购统计
const generatePurchaseStats = () => {
  // 模拟生成逻辑
  ElMessage.success('采购统计生成成功');
};

// 生成资源利用率统计
const generateUtilizationStats = () => {
  // 模拟生成逻辑
  ElMessage.success('资源利用率统计生成成功');
};

// 导出借阅统计
const exportBorrowStats = () => {
  // 模拟导出逻辑
  ElMessage.success('借阅统计导出成功');
};

// 导出采购统计
const exportPurchaseStats = () => {
  // 模拟导出逻辑
  ElMessage.success('采购统计导出成功');
};

// 导出资源利用率统计
const exportUtilizationStats = () => {
  // 模拟导出逻辑
  ElMessage.success('资源利用率统计导出成功');
};
</script>

<style scoped>
.statistics-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.main-tabs {
  margin-bottom: 20px;
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

.chart-container {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 4px;
}

.chart-container h3 {
  margin-bottom: 15px;
  color: #303133;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}
</style>