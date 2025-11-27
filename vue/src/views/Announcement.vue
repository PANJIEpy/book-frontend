<template>
  <div class="announcement-container">
    <h2>公告与活动管理</h2>

    <el-tabs v-model="activeTab" class="main-tabs">
      <!-- 公告管理 -->
      <el-tab-pane label="公告管理" name="announcement">
        <el-card shadow="hover" class="main-card">
          <template #header>
            <div class="card-header">
              <span>公告列表</span>
              <div class="header-actions">
                <el-button type="primary" @click="addAnnouncement">
                  <el-icon><Plus /></el-icon> 新增公告
                </el-button>
                <el-button type="success" @click="exportAnnouncementStats">
                  <el-icon><Download /></el-icon> 导出统计
                </el-button>
              </div>
            </div>
          </template>

          <!-- 搜索和筛选 -->
          <div class="search-filter">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-input v-model="announcementSearch.title" placeholder="公告标题" clearable />
              </el-col>
              <el-col :span="6">
                <el-select v-model="announcementSearch.status" placeholder="状态" clearable>
                  <el-option label="已发布" value="已发布" />
                  <el-option label="草稿" value="草稿" />
                  <el-option label="已过期" value="已过期" />
                </el-select>
              </el-col>
              <el-col :span="6">
                <el-select v-model="announcementSearch.isTop" placeholder="是否置顶" clearable>
                  <el-option label="是" value="1" />
                  <el-option label="否" value="0" />
                </el-select>
              </el-col>
              <el-col :span="6">
                <el-button type="primary" @click="searchAnnouncements">
                  <el-icon><Search /></el-icon> 搜索
                </el-button>
                <el-button @click="resetAnnouncementSearch">重置</el-button>
              </el-col>
            </el-row>
          </div>

          <!-- 公告列表表格 -->
          <el-table :data="announcementList" stripe border style="width: 100%">
            <el-table-column prop="id" label="公告ID" width="100" />
            <el-table-column prop="title" label="公告标题" min-width="200" />
            <el-table-column prop="author" label="发布人" width="120" />
            <el-table-column prop="publishTime" label="发布时间" width="180" />
            <el-table-column prop="expireTime" label="过期时间" width="180" />
            <el-table-column prop="isTop" label="是否置顶" width="100">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.isTop"
                  active-value="1"
                  inactive-value="0"
                  @change="handleTopChange(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="viewCount" label="浏览量" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getAnnouncementStatusType(scope.row.status)">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button type="primary" size="mini" @click="previewAnnouncement(scope.row)">
                  预览
                </el-button>
                <el-button type="success" size="mini" v-if="scope.row.status === '草稿'" @click="publishAnnouncement(scope.row)">
                  发布
                </el-button>
                <el-button type="warning" size="mini" @click="editAnnouncement(scope.row)">
                  编辑
                </el-button>
                <el-button type="danger" size="mini" @click="deleteAnnouncement(scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="announcementCurrentPage"
              v-model:page-size="announcementPageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="announcementTotal"
              @size-change="handleAnnouncementSizeChange"
              @current-change="handleAnnouncementCurrentChange"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <!-- 活动管理 -->
      <el-tab-pane label="活动管理" name="activity">
        <el-card shadow="hover" class="main-card">
          <template #header>
            <div class="card-header">
              <span>活动列表</span>
              <div class="header-actions">
                <el-button type="primary" @click="addActivity">
                  <el-icon><Plus /></el-icon> 新增活动
                </el-button>
                <el-button type="success" @click="exportActivityStats">
                  <el-icon><Download /></el-icon> 导出统计
                </el-button>
              </div>
            </div>
          </template>

          <!-- 搜索和筛选 -->
          <div class="search-filter">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-input v-model="activitySearch.title" placeholder="活动名称" clearable />
              </el-col>
              <el-col :span="6">
                <el-select v-model="activitySearch.status" placeholder="状态" clearable>
                  <el-option label="进行中" value="进行中" />
                  <el-option label="未开始" value="未开始" />
                  <el-option label="已结束" value="已结束" />
                </el-select>
              </el-col>
              <el-col :span="6">
                <el-date-picker
                  v-model="activitySearch.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-col>
              <el-col :span="6">
                <el-button type="primary" @click="searchActivities">
                  <el-icon><Search /></el-icon> 搜索
                </el-button>
                <el-button @click="resetActivitySearch">重置</el-button>
              </el-col>
            </el-row>
          </div>

          <!-- 活动列表表格 -->
          <el-table :data="activityList" stripe border style="width: 100%">
            <el-table-column prop="id" label="活动ID" width="100" />
            <el-table-column prop="title" label="活动名称" min-width="200" />
            <el-table-column prop="location" label="活动地点" width="150" />
            <el-table-column prop="startTime" label="开始时间" width="180" />
            <el-table-column prop="endTime" label="结束时间" width="180" />
            <el-table-column prop="maxParticipants" label="最大人数" width="100" />
            <el-table-column prop="participantCount" label="报名人数" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getActivityStatusType(scope.row.status)">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="satisfactionRate" label="满意度" width="120">
              <template #default="scope">
                <el-progress
                  :percentage="scope.row.satisfactionRate"
                  :stroke-width="10"
                  :show-text="true"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button type="primary" size="mini" @click="viewActivityDetail(scope.row)">
                  详情
                </el-button>
                <el-button type="success" size="mini" v-if="scope.row.status === '未开始'" @click="startActivity(scope.row)">
                  开始
                </el-button>
                <el-button type="warning" size="mini" @click="editActivity(scope.row)">
                  编辑
                </el-button>
                <el-button type="danger" size="mini" @click="deleteActivity(scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="activityCurrentPage"
              v-model:page-size="activityPageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="activityTotal"
              @size-change="handleActivitySizeChange"
              @current-change="handleActivityCurrentChange"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增/编辑公告对话框 -->
    <el-dialog
      v-model="announcementDialogVisible"
      :title="announcementDialogTitle"
      width="700px"
    >
      <el-form :model="announcementForm" label-width="100px">
        <el-form-item label="公告标题" required>
          <el-input v-model="announcementForm.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="发布人" required>
          <el-input v-model="announcementForm.author" placeholder="请输入发布人" />
        </el-form-item>
        <el-form-item label="公告内容" required>
          <el-input
            v-model="announcementForm.content"
            type="textarea"
            rows="6"
            placeholder="请输入公告内容"
          />
        </el-form-item>
        <el-form-item label="过期时间" required>
          <el-date-picker
            v-model="announcementForm.expireTime"
            type="datetime"
            placeholder="选择过期时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="是否置顶">
          <el-switch
            v-model="announcementForm.isTop"
            active-value="1"
            inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="状态" required>
          <el-select v-model="announcementForm.status" placeholder="请选择状态">
            <el-option label="草稿" value="草稿" />
            <el-option label="已发布" value="已发布" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="announcementDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAnnouncement">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增/编辑活动对话框 -->
    <el-dialog
      v-model="activityDialogVisible"
      :title="activityDialogTitle"
      width="700px"
    >
      <el-form :model="activityForm" label-width="100px">
        <el-form-item label="活动名称" required>
          <el-input v-model="activityForm.title" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="活动地点" required>
          <el-input v-model="activityForm.location" placeholder="请输入活动地点" />
        </el-form-item>
        <el-form-item label="活动时间" required>
          <el-date-picker
            v-model="activityForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="最大人数" required>
          <el-input-number
            v-model="activityForm.maxParticipants"
            :min="1"
            :step="1"
            style="width: 100%"
            placeholder="请输入最大人数"
          />
        </el-form-item>
        <el-form-item label="活动内容" required>
          <el-input
            v-model="activityForm.content"
            type="textarea"
            rows="6"
            placeholder="请输入活动内容"
          />
        </el-form-item>
        <el-form-item label="状态" required>
          <el-select v-model="activityForm.status" placeholder="请选择状态">
            <el-option label="未开始" value="未开始" />
            <el-option label="进行中" value="进行中" />
            <el-option label="已结束" value="已结束" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="activityDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveActivity">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { Plus, Download, Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 激活的标签页
const activeTab = ref('announcement');

// 公告管理
const announcementSearch = ref({
  title: '',
  status: '',
  isTop: ''
});

const announcementCurrentPage = ref(1);
const announcementPageSize = ref(10);
const announcementTotal = ref(100);

// 活动管理
const activitySearch = ref({
  title: '',
  status: '',
  dateRange: null
});

const activityCurrentPage = ref(1);
const activityPageSize = ref(10);
const activityTotal = ref(100);

// 对话框
const announcementDialogVisible = ref(false);
const announcementDialogTitle = ref('新增公告');
const announcementForm = ref({
  id: '',
  title: '',
  author: '',
  content: '',
  publishTime: '',
  expireTime: '',
  isTop: '0',
  viewCount: 0,
  status: '草稿'
});

const activityDialogVisible = ref(false);
const activityDialogTitle = ref('新增活动');
const activityForm = ref({
  id: '',
  title: '',
  location: '',
  timeRange: [],
  startTime: '',
  endTime: '',
  maxParticipants: 0,
  participantCount: 0,
  content: '',
  status: '未开始',
  satisfactionRate: 0
});

// 模拟数据
const announcementList = ref([
  { id: 1, title: '图书馆开馆时间调整通知', author: '管理员', content: '因节假日调整，图书馆开馆时间有所变化...', publishTime: '2023-05-01 09:00:00', expireTime: '2023-05-31 23:59:59', isTop: '1', viewCount: 1250, status: '已发布' },
  { id: 2, title: '新书推荐：人工智能导论', author: '图书管理员', content: '本馆新增一批人工智能相关图书...', publishTime: '2023-04-20 14:30:00', expireTime: '2023-06-30 23:59:59', isTop: '0', viewCount: 890, status: '已发布' },
  { id: 3, title: '关于举办读书分享会的通知', author: '活动管理员', content: '为丰富校园文化生活，特举办读书分享会...', publishTime: '2023-04-15 10:00:00', expireTime: '2023-05-10 23:59:59', isTop: '0', viewCount: 650, status: '已过期' },
  { id: 4, title: '图书馆系统维护通知', author: '技术管理员', content: '为提升服务质量，图书馆系统将于近期进行维护...', publishTime: '', expireTime: '2023-05-20 23:59:59', isTop: '0', viewCount: 0, status: '草稿' },
  { id: 5, title: '毕业生图书归还提醒', author: '管理员', content: '即将毕业的同学请注意及时归还所借图书...', publishTime: '2023-04-10 09:00:00', expireTime: '2023-06-30 23:59:59', isTop: '1', viewCount: 1560, status: '已发布' },
  { id: 6, title: '电子资源使用培训通知', author: '资源管理员', content: '为帮助师生更好地利用电子资源，特举办使用培训...', publishTime: '2023-03-25 16:00:00', expireTime: '2023-04-15 23:59:59', isTop: '0', viewCount: 420, status: '已过期' },
  { id: 7, title: '图书馆座位预约系统上线', author: '技术管理员', content: '为提高座位利用率，图书馆座位预约系统正式上线...', publishTime: '2023-03-15 10:00:00', expireTime: '2023-05-31 23:59:59', isTop: '0', viewCount: 2100, status: '已发布' },
  { id: 8, title: '关于征集读者意见的通知', author: '管理员', content: '为更好地服务读者，现面向全体师生征集意见...', publishTime: '2023-03-01 09:00:00', expireTime: '2023-03-31 23:59:59', isTop: '0', viewCount: 780, status: '已过期' },
  { id: 9, title: '2023年图书馆工作计划', author: '馆长', content: '现将2023年图书馆工作计划公布如下...', publishTime: '2023-01-10 14:00:00', expireTime: '2023-12-31 23:59:59', isTop: '1', viewCount: 1890, status: '已发布' },
  { id: 10, title: '读者违规处理办法修订通知', author: '管理员', content: '为规范读者行为，对读者违规处理办法进行了修订...', publishTime: '2023-02-15 10:00:00', expireTime: '2023-12-31 23:59:59', isTop: '0', viewCount: 1120, status: '已发布' }
]);

const activityList = ref([
  { id: 1, title: '春季读书分享会', location: '图书馆报告厅', startTime: '2023-05-10 14:30:00', endTime: '2023-05-10 16:30:00', maxParticipants: 100, participantCount: 85, content: '分享春季阅读推荐书单...', status: '未开始', satisfactionRate: 0 },
  { id: 2, title: '电子资源检索培训', location: '图书馆电子阅览室', startTime: '2023-04-25 10:00:00', endTime: '2023-04-25 12:00:00', maxParticipants: 50, participantCount: 42, content: '培训电子资源检索技巧...', status: '已结束', satisfactionRate: 92 },
  { id: 3, title: '图书馆摄影大赛', location: '线上', startTime: '2023-04-01 00:00:00', endTime: '2023-05-31 23:59:59', maxParticipants: 200, participantCount: 156, content: '记录图书馆美好瞬间...', status: '进行中', satisfactionRate: 0 },
  { id: 4, title: '专家讲座：人工智能与未来', location: '图书馆报告厅', startTime: '2023-05-20 15:00:00', endTime: '2023-05-20 17:00:00', maxParticipants: 150, participantCount: 120, content: '邀请专家讲解人工智能发展趋势...', status: '未开始', satisfactionRate: 0 },
  { id: 5, title: '毕业生图书捐赠活动', location: '图书馆大厅', startTime: '2023-06-01 09:00:00', endTime: '2023-06-15 17:00:00', maxParticipants: 500, participantCount: 0, content: '毕业生图书捐赠活动...', status: '未开始', satisfactionRate: 0 },
  { id: 6, title: '冬季阅读马拉松', location: '图书馆', startTime: '2023-01-15 09:00:00', endTime: '2023-01-15 17:00:00', maxParticipants: 80, participantCount: 65, content: '连续阅读8小时挑战...', status: '已结束', satisfactionRate: 88 },
  { id: 7, title: '古籍修复体验活动', location: '图书馆特藏室', startTime: '2023-03-20 14:00:00', endTime: '2023-03-20 16:00:00', maxParticipants: 20, participantCount: 18, content: '体验古籍修复技艺...', status: '已结束', satisfactionRate: 95 },
  { id: 8, title: '图书馆开放日活动', location: '图书馆', startTime: '2023-04-10 09:00:00', endTime: '2023-04-10 16:00:00', maxParticipants: 300, participantCount: 250, content: '图书馆各部门开放参观...', status: '已结束', satisfactionRate: 90 },
  { id: 9, title: '阅读推广月启动仪式', location: '图书馆报告厅', startTime: '2023-04-01 10:00:00', endTime: '2023-04-01 11:30:00', maxParticipants: 200, participantCount: 180, content: '阅读推广月活动启动...', status: '已结束', satisfactionRate: 85 },
  { id: 10, title: '英语角：阅读与交流', location: '图书馆咖啡区', startTime: '2023-05-05 19:00:00', endTime: '2023-05-05 21:00:00', maxParticipants: 30, participantCount: 25, content: '用英语交流阅读心得...', status: '未开始', satisfactionRate: 0 }
]);

// 获取公告状态标签类型
const getAnnouncementStatusType = (status) => {
  const statusMap = {
    '已发布': 'success',
    '草稿': 'warning',
    '已过期': 'info'
  };
  return statusMap[status] || 'info';
};

// 获取活动状态标签类型
const getActivityStatusType = (status) => {
  const statusMap = {
    '进行中': 'success',
    '未开始': 'warning',
    '已结束': 'info'
  };
  return statusMap[status] || 'info';
};

// 搜索公告
const searchAnnouncements = () => {
  // 模拟搜索逻辑
  ElMessage.success('搜索成功');
};

// 重置公告搜索
const resetAnnouncementSearch = () => {
  announcementSearch.value = {
    title: '',
    status: '',
    isTop: ''
  };
};

// 搜索活动
const searchActivities = () => {
  // 模拟搜索逻辑
  ElMessage.success('搜索成功');
};

// 重置活动搜索
const resetActivitySearch = () => {
  activitySearch.value = {
    title: '',
    status: '',
    dateRange: null
  };
};

// 新增公告
const addAnnouncement = () => {
  announcementDialogTitle.value = '新增公告';
  announcementForm.value = {
    id: '',
    title: '',
    author: '',
    content: '',
    publishTime: '',
    expireTime: '',
    isTop: '0',
    viewCount: 0,
    status: '草稿'
  };
  announcementDialogVisible.value = true;
};

// 编辑公告
const editAnnouncement = (row) => {
  announcementDialogTitle.value = '编辑公告';
  announcementForm.value = { ...row };
  announcementDialogVisible.value = true;
};

// 保存公告
const saveAnnouncement = () => {
  // 模拟保存逻辑
  announcementDialogVisible.value = false;
  ElMessage.success('公告保存成功');
};

// 预览公告
const previewAnnouncement = (row) => {
  // 模拟预览逻辑
  ElMessage.info('预览功能开发中');
};

// 发布公告
const publishAnnouncement = (row) => {
  // 模拟发布逻辑
  ElMessage.success('公告发布成功');
};

// 删除公告
const deleteAnnouncement = (row) => {
  // 模拟删除逻辑
  ElMessage.success('公告删除成功');
};

// 导出公告统计
const exportAnnouncementStats = () => {
  // 模拟导出逻辑
  ElMessage.success('公告统计导出成功');
};

// 置顶状态变化
const handleTopChange = (row) => {
  // 模拟置顶逻辑
  ElMessage.success('置顶状态更新成功');
};

// 新增活动
const addActivity = () => {
  activityDialogTitle.value = '新增活动';
  activityForm.value = {
    id: '',
    title: '',
    location: '',
    timeRange: [],
    startTime: '',
    endTime: '',
    maxParticipants: 0,
    participantCount: 0,
    content: '',
    status: '未开始',
    satisfactionRate: 0
  };
  activityDialogVisible.value = true;
};

// 编辑活动
const editActivity = (row) => {
  activityDialogTitle.value = '编辑活动';
  activityForm.value = { ...row };
  // 将开始时间和结束时间转换为时间范围数组
  activityForm.value.timeRange = [row.startTime, row.endTime];
  activityDialogVisible.value = true;
};

// 保存活动
const saveActivity = () => {
  // 模拟保存逻辑
  activityDialogVisible.value = false;
  ElMessage.success('活动保存成功');
};

// 查看活动详情
const viewActivityDetail = (row) => {
  // 模拟查看详情逻辑
  ElMessage.info('查看详情功能开发中');
};

// 开始活动
const startActivity = (row) => {
  // 模拟开始活动逻辑
  ElMessage.success('活动已开始');
};

// 删除活动
const deleteActivity = (row) => {
  // 模拟删除逻辑
  ElMessage.success('活动删除成功');
};

// 导出活动统计
const exportActivityStats = () => {
  // 模拟导出逻辑
  ElMessage.success('活动统计导出成功');
};

// 分页处理
const handleAnnouncementSizeChange = (val) => {
  announcementPageSize.value = val;
};

const handleAnnouncementCurrentChange = (val) => {
  announcementCurrentPage.value = val;
};

const handleActivitySizeChange = (val) => {
  activityPageSize.value = val;
};

const handleActivityCurrentChange = (val) => {
  activityCurrentPage.value = val;
};
</script>

<style scoped>
.announcement-container {
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