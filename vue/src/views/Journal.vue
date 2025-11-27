<template>
  <div class="journal-container">
    <h2>期刊管理</h2>

    <!-- 期刊订阅管理 -->
    <el-card shadow="hover" class="main-card">
      <template #header>
        <div class="card-header">
          <span>期刊订阅管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="generateSubscriptionList">
              <el-icon><Document /></el-icon> 生成年度订阅清单
            </el-button>
            <el-button type="success" @click="addJournal">
              <el-icon><Plus /></el-icon> 新增期刊
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="search-filter">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input v-model="subscriptionSearchParams.journalName" placeholder="期刊名称" clearable />
          </el-col>
          <el-col :span="6">
            <el-input v-model="subscriptionSearchParams.issn" placeholder="ISSN号" clearable />
          </el-col>
          <el-col :span="6">
            <el-select v-model="subscriptionSearchParams.status" placeholder="订阅状态" clearable>
              <el-option label="已订阅" value="已订阅" />
              <el-option label="已取消" value="已取消" />
              <el-option label="待审批" value="待审批" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="searchSubscription">
              <el-icon><Search /></el-icon> 搜索
            </el-button>
            <el-button @click="resetSubscriptionSearch">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 订阅清单表格 -->
      <el-table :data="subscriptionList" stripe border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="journalName" label="期刊名称" min-width="200" />
        <el-table-column prop="issn" label="ISSN号" width="150" />
        <el-table-column prop="publisher" label="出版社" width="150" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="annualBudget" label="年度预算" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getSubscriptionStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="subscriptionYear" label="订阅年度" width="120" />
        <el-table-column prop="remark" label="备注" min-width="200" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button type="primary" size="mini" @click="editJournal(scope.row)">
              编辑
            </el-button>
            <el-button v-if="scope.row.status === '已订阅'" type="danger" size="mini" @click="cancelSubscription(scope.row)">
              取消订阅
            </el-button>
            <el-button v-else type="success" size="mini" @click="renewSubscription(scope.row)">
              重新订阅
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="subscriptionCurrentPage"
          v-model:page-size="subscriptionPageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="subscriptionTotal"
          @size-change="handleSubscriptionSizeChange"
          @current-change="handleSubscriptionCurrentChange"
        />
      </div>
    </el-card>

    <!-- 期刊到刊登记 -->
    <el-card shadow="hover" class="main-card">
      <template #header>
        <div class="card-header">
          <span>期刊到刊登记</span>
          <div class="header-actions">
            <el-button type="primary" @click="batchRegister">
              <el-icon><Upload /></el-icon> 批量登记
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="search-filter">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input v-model="arrivalSearchParams.journalName" placeholder="期刊名称" clearable />
          </el-col>
          <el-col :span="6">
            <el-input v-model="arrivalSearchParams.issueNumber" placeholder="期号" clearable />
          </el-col>
          <el-col :span="6">
            <el-select v-model="arrivalSearchParams.status" placeholder="到刊状态" clearable>
              <el-option label="已到刊" value="已到刊" />
              <el-option label="未到刊" value="未到刊" />
              <el-option label="已通知" value="已通知" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="searchArrival">
              <el-icon><Search /></el-icon> 搜索
            </el-button>
            <el-button @click="resetArrivalSearch">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 到刊登记表格 -->
      <el-table :data="arrivalList" stripe border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="journalName" label="期刊名称" min-width="200" />
        <el-table-column prop="issn" label="ISSN号" width="150" />
        <el-table-column prop="issueNumber" label="期号" width="100" />
        <el-table-column prop="publicationDate" label="出版日期" width="120" />
        <el-table-column prop="expectedArrivalDate" label="预计到刊日期" width="150" />
        <el-table-column prop="actualArrivalDate" label="实际到刊日期" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getArrivalStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button v-if="scope.row.status === '未到刊'" type="success" size="mini" @click="registerArrival(scope.row)">
              登记到刊
            </el-button>
            <el-button v-if="scope.row.status === '已到刊'" type="primary" size="mini" @click="sendArrivalNotice(scope.row)">
              发送通知
            </el-button>
            <el-button type="info" size="mini" @click="viewArrivalDetail(scope.row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="arrivalCurrentPage"
          v-model:page-size="arrivalPageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="arrivalTotal"
          @size-change="handleArrivalSizeChange"
          @current-change="handleArrivalCurrentChange"
        />
      </div>
    </el-card>

    <!-- 过刊管理 -->
    <el-card shadow="hover" class="main-card">
      <template #header>
        <div class="card-header">
          <span>过刊管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="bindJournal">
              <el-icon><Link /></el-icon> 装订过刊
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="search-filter">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input v-model="backIssueSearchParams.journalName" placeholder="期刊名称" clearable />
          </el-col>
          <el-col :span="6">
            <el-input v-model="backIssueSearchParams.issn" placeholder="ISSN号" clearable />
          </el-col>
          <el-col :span="6">
            <el-input v-model="backIssueSearchParams.bindingVolume" placeholder="装订卷号" clearable />
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="searchBackIssue">
              <el-icon><Search /></el-icon> 搜索
            </el-button>
            <el-button @click="resetBackIssueSearch">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 过刊管理表格 -->
      <el-table :data="backIssueList" stripe border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="journalName" label="期刊名称" min-width="200" />
        <el-table-column prop="issn" label="ISSN号" width="150" />
        <el-table-column prop="bindingVolume" label="装订卷号" width="120" />
        <el-table-column prop="bindingDate" label="装订日期" width="150" />
        <el-table-column prop="location" label="馆藏位置" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getBackIssueStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="borrowCount" label="借阅次数" width="100" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button type="primary" size="mini" @click="viewBackIssueDetail(scope.row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="backIssueCurrentPage"
          v-model:page-size="backIssuePageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="backIssueTotal"
          @size-change="handleBackIssueSizeChange"
          @current-change="handleBackIssueCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑期刊对话框 -->
    <el-dialog
      v-model="journalDialogVisible"
      :title="journalDialogTitle"
      width="600px"
    >
      <el-form :model="journalForm" label-width="100px" :rules="journalRules" ref="journalFormRef">
        <el-form-item label="期刊名称" prop="journalName">
          <el-input v-model="journalForm.journalName" placeholder="请输入期刊名称" />
        </el-form-item>
        <el-form-item label="ISSN号" prop="issn">
          <el-input v-model="journalForm.issn" placeholder="请输入ISSN号" />
        </el-form-item>
        <el-form-item label="出版社" prop="publisher">
          <el-input v-model="journalForm.publisher" placeholder="请输入出版社" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="journalForm.category" placeholder="请选择分类">
            <el-option label="科技" value="科技" />
            <el-option label="医学" value="医学" />
            <el-option label="教育" value="教育" />
            <el-option label="文学" value="文学" />
            <el-option label="艺术" value="艺术" />
          </el-select>
        </el-form-item>
        <el-form-item label="年度预算" prop="annualBudget">
          <el-input-number
            v-model="journalForm.annualBudget"
            :min="0"
            :step="100"
            style="width: 100%"
            placeholder="请输入年度预算"
          />
        </el-form-item>
        <el-form-item label="订阅年度" prop="subscriptionYear">
          <el-input v-model="journalForm.subscriptionYear" placeholder="请输入订阅年度" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="journalForm.remark"
            type="textarea"
            rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="journalDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveJournal">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 取消订阅对话框 -->
    <el-dialog
      v-model="cancelDialogVisible"
      title="取消订阅"
      width="400px"
    >
      <el-form :model="cancelForm" label-width="100px">
        <el-form-item label="期刊名称">
          <el-input v-model="cancelForm.journalName" disabled />
        </el-form-item>
        <el-form-item label="取消理由" required>
          <el-input
            v-model="cancelForm.reason"
            type="textarea"
            rows="3"
            placeholder="请输入取消订阅理由"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmCancel">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 到刊登记对话框 -->
    <el-dialog
      v-model="arrivalDialogVisible"
      title="期刊到刊登记"
      width="500px"
    >
      <el-form :model="arrivalForm" label-width="120px">
        <el-form-item label="期刊名称">
          <el-input v-model="arrivalForm.journalName" disabled />
        </el-form-item>
        <el-form-item label="期号">
          <el-input v-model="arrivalForm.issueNumber" disabled />
        </el-form-item>
        <el-form-item label="实际到刊日期" required>
          <el-date-picker
            v-model="arrivalForm.actualArrivalDate"
            type="date"
            placeholder="选择实际到刊日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="馆藏位置" required>
          <el-input v-model="arrivalForm.location" placeholder="请输入馆藏位置" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="arrivalForm.remark"
            type="textarea"
            rows="2"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="arrivalDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmArrival">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { Document, Plus, Search, Upload, Link } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 期刊订阅管理
const subscriptionSearchParams = ref({
  journalName: '',
  issn: '',
  status: ''
});

const subscriptionCurrentPage = ref(1);
const subscriptionPageSize = ref(10);
const subscriptionTotal = ref(100);

// 期刊到刊登记
const arrivalSearchParams = ref({
  journalName: '',
  issueNumber: '',
  status: ''
});

const arrivalCurrentPage = ref(1);
const arrivalPageSize = ref(10);
const arrivalTotal = ref(100);

// 过刊管理
const backIssueSearchParams = ref({
  journalName: '',
  issn: '',
  bindingVolume: ''
});

const backIssueCurrentPage = ref(1);
const backIssuePageSize = ref(10);
const backIssueTotal = ref(100);

// 对话框
const journalDialogVisible = ref(false);
const journalDialogTitle = ref('新增期刊');
const journalFormRef = ref(null);
const journalForm = ref({
  id: '',
  journalName: '',
  issn: '',
  publisher: '',
  category: '',
  annualBudget: 0,
  subscriptionYear: '',
  remark: ''
});

const journalRules = reactive({
  journalName: [{ required: true, message: '请输入期刊名称', trigger: 'blur' }],
  issn: [{ required: true, message: '请输入ISSN号', trigger: 'blur' }],
  publisher: [{ required: true, message: '请输入出版社', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  annualBudget: [{ required: true, message: '请输入年度预算', trigger: 'blur' }],
  subscriptionYear: [{ required: true, message: '请输入订阅年度', trigger: 'blur' }]
});

const cancelDialogVisible = ref(false);
const cancelForm = ref({
  journalName: '',
  reason: ''
});

const arrivalDialogVisible = ref(false);
const arrivalForm = ref({
  journalName: '',
  issueNumber: '',
  actualArrivalDate: '',
  location: '',
  remark: ''
});

// 模拟数据
const subscriptionList = ref([
  { id: 1, journalName: '计算机学报', issn: '0254-4164', publisher: '中国计算机学会', category: '科技', annualBudget: 5000, status: '已订阅', subscriptionYear: '2023', remark: '' },
  { id: 2, journalName: '软件学报', issn: '1000-9825', publisher: '中国科学院软件研究所', category: '科技', annualBudget: 4500, status: '已订阅', subscriptionYear: '2023', remark: '' },
  { id: 3, journalName: '科学通报', issn: '0023-074X', publisher: '中国科学院', category: '综合', annualBudget: 6000, status: '已取消', subscriptionYear: '2023', remark: '预算不足' },
  { id: 4, journalName: '自然辩证法研究', issn: '1000-8934', publisher: '中国自然辩证法研究会', category: '哲学', annualBudget: 3000, status: '待审批', subscriptionYear: '2023', remark: '' },
  { id: 5, journalName: '教育研究', issn: '1002-5731', publisher: '中国教育科学研究院', category: '教育', annualBudget: 4000, status: '已订阅', subscriptionYear: '2023', remark: '' },
  { id: 6, journalName: '中国图书馆学报', issn: '1001-8867', publisher: '中国图书馆学会', category: '图书馆学', annualBudget: 3500, status: '已订阅', subscriptionYear: '2023', remark: '' },
  { id: 7, journalName: '文学评论', issn: '0511-4683', publisher: '中国社会科学院文学研究所', category: '文学', annualBudget: 3200, status: '已订阅', subscriptionYear: '2023', remark: '' },
  { id: 8, journalName: '历史研究', issn: '0459-1909', publisher: '中国社会科学院历史研究所', category: '历史', annualBudget: 3800, status: '已订阅', subscriptionYear: '2023', remark: '' },
  { id: 9, journalName: '美术研究', issn: '0461-6855', publisher: '中央美术学院', category: '艺术', annualBudget: 2800, status: '已订阅', subscriptionYear: '2023', remark: '' },
  { id: 10, journalName: '音乐研究', issn: '0512-7939', publisher: '人民音乐出版社', category: '艺术', annualBudget: 2500, status: '已订阅', subscriptionYear: '2023', remark: '' }
]);

const arrivalList = ref([
  { id: 1, journalName: '计算机学报', issn: '0254-4164', issueNumber: '01', publicationDate: '2023-01-15', expectedArrivalDate: '2023-01-20', actualArrivalDate: '', status: '未到刊' },
  { id: 2, journalName: '软件学报', issn: '1000-9825', issueNumber: '01', publicationDate: '2023-01-10', expectedArrivalDate: '2023-01-18', actualArrivalDate: '2023-01-16', status: '已到刊' },
  { id: 3, journalName: '教育研究', issn: '1002-5731', issueNumber: '02', publicationDate: '2023-02-01', expectedArrivalDate: '2023-02-10', actualArrivalDate: '2023-02-08', status: '已通知' },
  { id: 4, journalName: '中国图书馆学报', issn: '1001-8867', issueNumber: '01', publicationDate: '2023-01-20', expectedArrivalDate: '2023-01-28', actualArrivalDate: '', status: '未到刊' },
  { id: 5, journalName: '文学评论', issn: '0511-4683', issueNumber: '01', publicationDate: '2023-01-15', expectedArrivalDate: '2023-01-25', actualArrivalDate: '2023-01-22', status: '已到刊' },
  { id: 6, journalName: '历史研究', issn: '0459-1909', issueNumber: '01', publicationDate: '2023-01-10', expectedArrivalDate: '2023-01-20', actualArrivalDate: '2023-01-18', status: '已通知' },
  { id: 7, journalName: '美术研究', issn: '0461-6855', issueNumber: '01', publicationDate: '2023-02-01', expectedArrivalDate: '2023-02-12', actualArrivalDate: '', status: '未到刊' },
  { id: 8, journalName: '音乐研究', issn: '0512-7939', issueNumber: '01', publicationDate: '2023-01-20', expectedArrivalDate: '2023-01-30', actualArrivalDate: '2023-01-28', status: '已到刊' },
  { id: 9, journalName: '计算机学报', issn: '0254-4164', issueNumber: '02', publicationDate: '2023-02-15', expectedArrivalDate: '2023-02-22', actualArrivalDate: '', status: '未到刊' },
  { id: 10, journalName: '软件学报', issn: '1000-9825', issueNumber: '02', publicationDate: '2023-02-10', expectedArrivalDate: '2023-02-18', actualArrivalDate: '', status: '未到刊' }
]);

const backIssueList = ref([
  { id: 1, journalName: '计算机学报', issn: '0254-4164', bindingVolume: '2022年第1-6期', bindingDate: '2022-07-15', location: '六楼过刊区', status: '可借', borrowCount: 12 },
  { id: 2, journalName: '软件学报', issn: '1000-9825', bindingVolume: '2022年第1-6期', bindingDate: '2022-07-20', location: '六楼过刊区', status: '可借', borrowCount: 15 },
  { id: 3, journalName: '教育研究', issn: '1002-5731', bindingVolume: '2022年第1-6期', bindingDate: '2022-07-18', location: '六楼过刊区', status: '在借', borrowCount: 20 },
  { id: 4, journalName: '中国图书馆学报', issn: '1001-8867', bindingVolume: '2022年第1-4期', bindingDate: '2022-05-10', location: '六楼过刊区', status: '可借', borrowCount: 8 },
  { id: 5, journalName: '文学评论', issn: '0511-4683', bindingVolume: '2022年第1-4期', bindingDate: '2022-05-15', location: '六楼过刊区', status: '可借', borrowCount: 14 },
  { id: 6, journalName: '历史研究', issn: '0459-1909', bindingVolume: '2022年第1-4期', bindingDate: '2022-05-20', location: '六楼过刊区', status: '可借', borrowCount: 16 },
  { id: 7, journalName: '美术研究', issn: '0461-6855', bindingVolume: '2022年第1-4期', bindingDate: '2022-05-12', location: '六楼过刊区', status: '可借', borrowCount: 9 },
  { id: 8, journalName: '音乐研究', issn: '0512-7939', bindingVolume: '2022年第1-4期', bindingDate: '2022-05-18', location: '六楼过刊区', status: '可借', borrowCount: 7 },
  { id: 9, journalName: '计算机学报', issn: '0254-4164', bindingVolume: '2021年第1-12期', bindingDate: '2022-01-20', location: '六楼过刊区', status: '可借', borrowCount: 5 },
  { id: 10, journalName: '软件学报', issn: '1000-9825', bindingVolume: '2021年第1-12期', bindingDate: '2022-01-25', location: '六楼过刊区', status: '可借', borrowCount: 7 }
]);

// 获取订阅状态标签类型
const getSubscriptionStatusType = (status) => {
  const statusMap = {
    '已订阅': 'success',
    '已取消': 'danger',
    '待审批': 'warning'
  };
  return statusMap[status] || 'info';
};

// 获取到刊状态标签类型
const getArrivalStatusType = (status) => {
  const statusMap = {
    '已到刊': 'success',
    '未到刊': 'warning',
    '已通知': 'info'
  };
  return statusMap[status] || 'info';
};

// 获取过刊状态标签类型
const getBackIssueStatusType = (status) => {
  const statusMap = {
    '可借': 'success',
    '在借': 'primary'
  };
  return statusMap[status] || 'info';
};

// 生成年度订阅清单
const generateSubscriptionList = () => {
  // 模拟生成逻辑
  ElMessage.success('年度订阅清单生成成功');
};

// 新增期刊
const addJournal = () => {
  journalDialogTitle.value = '新增期刊';
  journalForm.value = {
    id: '',
    journalName: '',
    issn: '',
    publisher: '',
    category: '',
    annualBudget: 0,
    subscriptionYear: '',
    remark: ''
  };
  journalDialogVisible.value = true;
};

// 编辑期刊
const editJournal = (row) => {
  journalDialogTitle.value = '编辑期刊';
  journalForm.value = { ...row };
  journalDialogVisible.value = true;
};

// 保存期刊
const saveJournal = () => {
  // 模拟保存逻辑
  journalDialogVisible.value = false;
  ElMessage.success('保存成功');
};

// 取消订阅
const cancelSubscription = (row) => {
  cancelForm.value = {
    journalName: row.journalName,
    reason: ''
  };
  cancelDialogVisible.value = true;
};

// 确认取消订阅
const confirmCancel = () => {
  // 模拟取消逻辑
  cancelDialogVisible.value = false;
  ElMessage.success('取消订阅成功');
};

// 重新订阅
const renewSubscription = (row) => {
  // 模拟重新订阅逻辑
  ElMessage.success('重新订阅成功');
};

// 登记到刊
const registerArrival = (row) => {
  arrivalForm.value = {
    journalName: row.journalName,
    issueNumber: row.issueNumber,
    actualArrivalDate: '',
    location: '',
    remark: ''
  };
  arrivalDialogVisible.value = true;
};

// 确认到刊登记
const confirmArrival = () => {
  // 模拟到刊登记逻辑
  arrivalDialogVisible.value = false;
  ElMessage.success('到刊登记成功');
};

// 发送到刊通知
const sendArrivalNotice = (row) => {
  // 模拟发送通知逻辑
  ElMessage.success('到刊通知发送成功');
};

// 查看详情
const viewArrivalDetail = (row) => {
  // 模拟查看详情逻辑
  ElMessage.info('查看详情功能开发中');
};

const viewBackIssueDetail = (row) => {
  // 模拟查看详情逻辑
  ElMessage.info('查看详情功能开发中');
};

// 装订过刊
const bindJournal = () => {
  // 模拟装订过刊逻辑
  ElMessage.success('过刊装订成功');
};

// 搜索订阅清单
const searchSubscription = () => {
  // 模拟搜索逻辑
  ElMessage.success('搜索成功');
};

// 重置订阅搜索
const resetSubscriptionSearch = () => {
  subscriptionSearchParams.value = {
    journalName: '',
    issn: '',
    status: ''
  };
};

// 搜索到刊登记
const searchArrival = () => {
  // 模拟搜索逻辑
  ElMessage.success('搜索成功');
};

// 重置到刊搜索
const resetArrivalSearch = () => {
  arrivalSearchParams.value = {
    journalName: '',
    issueNumber: '',
    status: ''
  };
};

// 搜索过刊
const searchBackIssue = () => {
  // 模拟搜索逻辑
  ElMessage.success('搜索成功');
};

// 重置过刊搜索
const resetBackIssueSearch = () => {
  backIssueSearchParams.value = {
    journalName: '',
    issn: '',
    bindingVolume: ''
  };
};

// 批量登记
const batchRegister = () => {
  // 模拟批量登记逻辑
  ElMessage.success('批量登记功能开发中');
};

// 分页处理
const handleSubscriptionSizeChange = (val) => {
  subscriptionPageSize.value = val;
};

const handleSubscriptionCurrentChange = (val) => {
  subscriptionCurrentPage.value = val;
};

const handleArrivalSizeChange = (val) => {
  arrivalPageSize.value = val;
};

const handleArrivalCurrentChange = (val) => {
  arrivalCurrentPage.value = val;
};

const handleBackIssueSizeChange = (val) => {
  backIssuePageSize.value = val;
};

const handleBackIssueCurrentChange = (val) => {
  backIssueCurrentPage.value = val;
};
</script>

<style scoped>
.journal-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
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