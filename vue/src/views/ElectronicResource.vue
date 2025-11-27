<template>
  <div class="electronic-resource-container">
    <h2>电子资源管理</h2>

    <!-- 电子资源列表 -->
    <el-card shadow="hover" class="main-card">
      <template #header>
        <div class="card-header">
          <span>电子资源列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="uploadResource">
              <el-icon><Upload /></el-icon> 上传资源
            </el-button>
            <el-button type="success" @click="batchImport">
              <el-icon><DocumentAdd /></el-icon> 批量导入
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="search-filter">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input v-model="searchParams.title" placeholder="资源标题" clearable />
          </el-col>
          <el-col :span="6">
            <el-select v-model="searchParams.type" placeholder="资源类型" clearable>
              <el-option label="电子书" value="电子书" />
              <el-option label="期刊论文" value="期刊论文" />
              <el-option label="会议论文" value="会议论文" />
              <el-option label="视频" value="视频" />
              <el-option label="音频" value="音频" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="searchParams.accessLevel" placeholder="访问权限" clearable>
              <el-option label="公开" value="公开" />
              <el-option label="校内" value="校内" />
              <el-option label="特定用户组" value="特定用户组" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="searchResources">
              <el-icon><Search /></el-icon> 搜索
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 资源列表表格 -->
      <el-table :data="resourceList" stripe border style="width: 100%">
        <el-table-column prop="id" label="资源ID" width="100" />
        <el-table-column prop="title" label="资源标题" min-width="200" />
        <el-table-column prop="type" label="资源类型" width="100" />
        <el-table-column prop="isbn" label="ISBN/刊号" width="150" />
        <el-table-column prop="format" label="格式" width="80" />
        <el-table-column prop="size" label="大小" width="100" />
        <el-table-column prop="accessLevel" label="访问权限" width="120">
          <template #default="scope">
            <el-tag :type="getAccessLevelType(scope.row.accessLevel)">
              {{ scope.row.accessLevel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="downloadLimit" label="下载限制" width="120" />
        <el-table-column prop="viewCount" label="浏览量" width="100" />
        <el-table-column prop="downloadCount" label="下载量" width="100" />
        <el-table-column prop="uploadTime" label="上传时间" width="180" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button type="primary" size="mini" @click="editResource(scope.row)">
              编辑
            </el-button>
            <el-button v-if="scope.row.status === '可见'" type="warning" size="mini" @click="hideResource(scope.row)">
              隐藏
            </el-button>
            <el-button v-else type="success" size="mini" @click="showResource(scope.row)">
              显示
            </el-button>
            <el-button type="danger" size="mini" @click="deleteResource(scope.row)">
              删除
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

    <!-- 资源访问统计 -->
    <el-card shadow="hover" class="main-card">
      <template #header>
        <div class="card-header">
          <span>资源访问统计</span>
          <div class="header-actions">
            <el-button type="primary" @click="exportStatistics">
              <el-icon><Download /></el-icon> 导出统计报表
            </el-button>
          </div>
        </div>
      </template>

      <!-- 统计概览 -->
      <el-row :gutter="20" class="statistics-overview">
        <el-col :span="6">
          <el-card shadow="hover" class="statistic-card">
            <div class="statistic-content">
              <div class="statistic-title">总资源数</div>
              <div class="statistic-value">{{ totalResources }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="statistic-card">
            <div class="statistic-content">
              <div class="statistic-title">总浏览量</div>
              <div class="statistic-value">{{ totalViewCount }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="statistic-card">
            <div class="statistic-content">
              <div class="statistic-title">总下载量</div>
              <div class="statistic-value">{{ totalDownloadCount }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="statistic-card">
            <div class="statistic-content">
              <div class="statistic-title">人均访问时长</div>
              <div class="statistic-value">{{ averageAccessTime }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 资源利用率表格 -->
      <h3 style="margin-top: 20px; margin-bottom: 15px;">资源利用率Top10</h3>
      <el-table :data="topResources" stripe border style="width: 100%">
        <el-table-column type="index" label="排名" width="80" />
        <el-table-column prop="title" label="资源标题" min-width="200" />
        <el-table-column prop="type" label="资源类型" width="100" />
        <el-table-column prop="viewCount" label="浏览量" width="100" />
        <el-table-column prop="downloadCount" label="下载量" width="100" />
        <el-table-column prop="utilizationRate" label="利用率" width="120">
          <template #default="scope">
            <el-progress
              :percentage="scope.row.utilizationRate"
              :stroke-width="10"
              :show-text="true"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 上传资源对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传电子资源"
      width="600px"
    >
      <el-form :model="uploadForm" label-width="100px">
        <el-form-item label="资源标题" required>
          <el-input v-model="uploadForm.title" placeholder="请输入资源标题" />
        </el-form-item>
        <el-form-item label="资源类型" required>
          <el-select v-model="uploadForm.type" placeholder="请选择资源类型">
            <el-option label="电子书" value="电子书" />
            <el-option label="期刊论文" value="期刊论文" />
            <el-option label="会议论文" value="会议论文" />
            <el-option label="视频" value="视频" />
            <el-option label="音频" value="音频" />
          </el-select>
        </el-form-item>
        <el-form-item label="ISBN/刊号">
          <el-input v-model="uploadForm.isbn" placeholder="请输入ISBN或刊号" />
        </el-form-item>
        <el-form-item label="资源文件" required>
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持单个文件上传，最大支持100MB
              </div>
            </template>
          </el-upload>
          <div v-if="uploadForm.fileName" class="file-name">
            已选择文件：{{ uploadForm.fileName }}
          </div>
        </el-form-item>
        <el-form-item label="访问权限" required>
          <el-select v-model="uploadForm.accessLevel" placeholder="请选择访问权限">
            <el-option label="公开" value="公开" />
            <el-option label="校内" value="校内" />
            <el-option label="特定用户组" value="特定用户组" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="uploadForm.accessLevel === '特定用户组'" label="用户组">
          <el-select v-model="uploadForm.userGroup" placeholder="请选择用户组" multiple>
            <el-option label="教师" value="教师" />
            <el-option label="研究生" value="研究生" />
            <el-option label="本科生" value="本科生" />
            <el-option label="管理员" value="管理员" />
          </el-select>
        </el-form-item>
        <el-form-item label="下载限制">
          <el-input v-model="uploadForm.downloadLimit" placeholder="如：单日5次" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmUpload">确定上传</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑资源对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑电子资源"
      width="600px"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="资源标题" required>
          <el-input v-model="editForm.title" placeholder="请输入资源标题" />
        </el-form-item>
        <el-form-item label="资源类型" required>
          <el-select v-model="editForm.type" placeholder="请选择资源类型">
            <el-option label="电子书" value="电子书" />
            <el-option label="期刊论文" value="期刊论文" />
            <el-option label="会议论文" value="会议论文" />
            <el-option label="视频" value="视频" />
            <el-option label="音频" value="音频" />
          </el-select>
        </el-form-item>
        <el-form-item label="ISBN/刊号">
          <el-input v-model="editForm.isbn" placeholder="请输入ISBN或刊号" />
        </el-form-item>
        <el-form-item label="访问权限" required>
          <el-select v-model="editForm.accessLevel" placeholder="请选择访问权限">
            <el-option label="公开" value="公开" />
            <el-option label="校内" value="校内" />
            <el-option label="特定用户组" value="特定用户组" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="editForm.accessLevel === '特定用户组'" label="用户组">
          <el-select v-model="editForm.userGroup" placeholder="请选择用户组" multiple>
            <el-option label="教师" value="教师" />
            <el-option label="研究生" value="研究生" />
            <el-option label="本科生" value="本科生" />
            <el-option label="管理员" value="管理员" />
          </el-select>
        </el-form-item>
        <el-form-item label="下载限制">
          <el-input v-model="editForm.downloadLimit" placeholder="如：单日5次" />
        </el-form-item>
        <el-form-item label="状态" required>
          <el-select v-model="editForm.status" placeholder="请选择状态">
            <el-option label="可见" value="可见" />
            <el-option label="隐藏" value="隐藏" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { Upload, DocumentAdd, Search, UploadFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 搜索参数
const searchParams = ref({
  title: '',
  type: '',
  accessLevel: ''
});

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(100);

// 对话框
const uploadDialogVisible = ref(false);
const editDialogVisible = ref(false);

// 上传表单
const uploadForm = ref({
  title: '',
  type: '',
  isbn: '',
  fileName: '',
  file: null,
  accessLevel: '校内',
  userGroup: [],
  downloadLimit: ''
});

// 编辑表单
const editForm = ref({
  id: '',
  title: '',
  type: '',
  isbn: '',
  accessLevel: '校内',
  userGroup: [],
  downloadLimit: '',
  status: '可见'
});

// 统计数据
const totalResources = ref(2580);
const totalViewCount = ref(12560);
const totalDownloadCount = ref(8920);
const averageAccessTime = ref('15.2分钟');

// 模拟数据
const resourceList = ref([
  { id: 1, title: 'Vue.js实战', type: '电子书', isbn: '9787115428085', format: 'PDF', size: '25.6MB', accessLevel: '公开', downloadLimit: '单日5次', viewCount: 1250, downloadCount: 890, uploadTime: '2023-01-15 14:30:00', status: '可见' },
  { id: 2, title: 'JavaScript高级程序设计', type: '电子书', isbn: '9787115516381', format: 'EPUB', size: '32.8MB', accessLevel: '校内', downloadLimit: '单日5次', viewCount: 2100, downloadCount: 1560, uploadTime: '2023-01-10 10:20:00', status: '可见' },
  { id: 3, title: '深度学习在计算机视觉中的应用', type: '期刊论文', isbn: '1000-9825', format: 'PDF', size: '3.2MB', accessLevel: '校内', downloadLimit: '单日10次', viewCount: 890, downloadCount: 650, uploadTime: '2023-02-01 16:45:00', status: '可见' },
  { id: 4, title: '人工智能发展趋势研究', type: '会议论文', isbn: '978-1-4503-7444-9', format: 'PDF', size: '5.6MB', accessLevel: '公开', downloadLimit: '', viewCount: 1560, downloadCount: 1200, uploadTime: '2023-02-15 09:15:00', status: '可见' },
  { id: 5, title: 'Python数据分析与可视化', type: '电子书', isbn: '9787115523561', format: 'PDF', size: '42.5MB', accessLevel: '校内', downloadLimit: '单日5次', viewCount: 1890, downloadCount: 1350, uploadTime: '2023-03-01 14:20:00', status: '可见' },
  { id: 6, title: '计算机网络原理', type: '视频', isbn: '', format: 'MP4', size: '256.8MB', accessLevel: '校内', downloadLimit: '不可下载', viewCount: 3200, downloadCount: 0, uploadTime: '2023-03-10 11:30:00', status: '可见' },
  { id: 7, title: '数据库系统概论', type: '电子书', isbn: '9787302525069', format: 'EPUB', size: '38.2MB', accessLevel: '特定用户组', downloadLimit: '单日5次', viewCount: 980, downloadCount: 670, uploadTime: '2023-03-15 15:45:00', status: '可见' },
  { id: 8, title: '算法导论', type: '电子书', isbn: '9787111407010', format: 'PDF', size: '52.3MB', accessLevel: '校内', downloadLimit: '单日5次', viewCount: 2560, downloadCount: 1890, uploadTime: '2023-04-01 10:15:00', status: '可见' },
  { id: 9, title: '软件工程实践', type: '音频', isbn: '', format: 'MP3', size: '128.5MB', accessLevel: '校内', downloadLimit: '单日3次', viewCount: 650, downloadCount: 420, uploadTime: '2023-04-10 14:30:00', status: '隐藏' },
  { id: 10, title: '机器学习实战', type: '电子书', isbn: '9787115421900', format: 'PDF', size: '36.8MB', accessLevel: '公开', downloadLimit: '单日5次', viewCount: 1980, downloadCount: 1450, uploadTime: '2023-04-15 09:45:00', status: '可见' }
]);

const topResources = ref([
  { title: 'JavaScript高级程序设计', type: '电子书', viewCount: 2100, downloadCount: 1560, utilizationRate: 95 },
  { title: '算法导论', type: '电子书', viewCount: 2560, downloadCount: 1890, utilizationRate: 92 },
  { title: '计算机网络原理', type: '视频', viewCount: 3200, downloadCount: 0, utilizationRate: 88 },
  { title: 'Vue.js实战', type: '电子书', viewCount: 1250, downloadCount: 890, utilizationRate: 85 },
  { title: 'Python数据分析与可视化', type: '电子书', viewCount: 1890, downloadCount: 1350, utilizationRate: 82 },
  { title: '机器学习实战', type: '电子书', viewCount: 1980, downloadCount: 1450, utilizationRate: 80 },
  { title: '深度学习在计算机视觉中的应用', type: '期刊论文', viewCount: 890, downloadCount: 650, utilizationRate: 78 },
  { title: '人工智能发展趋势研究', type: '会议论文', viewCount: 1560, downloadCount: 1200, utilizationRate: 75 },
  { title: '数据库系统概论', type: '电子书', viewCount: 980, downloadCount: 670, utilizationRate: 72 },
  { title: '软件工程实践', type: '音频', viewCount: 650, downloadCount: 420, utilizationRate: 70 }
]);

// 根据访问权限获取标签类型
const getAccessLevelType = (level) => {
  const levelMap = {
    '公开': 'success',
    '校内': 'primary',
    '特定用户组': 'warning'
  };
  return levelMap[level] || 'info';
};

// 文件上传处理
const handleFileChange = (file) => {
  uploadForm.value.file = file.raw;
  uploadForm.value.fileName = file.name;
};

// 上传资源
const uploadResource = () => {
  uploadForm.value = {
    title: '',
    type: '',
    isbn: '',
    fileName: '',
    file: null,
    accessLevel: '校内',
    userGroup: [],
    downloadLimit: ''
  };
  uploadDialogVisible.value = true;
};

// 确认上传
const confirmUpload = () => {
  // 模拟上传逻辑
  uploadDialogVisible.value = false;
  ElMessage.success('资源上传成功');
};

// 批量导入
const batchImport = () => {
  // 模拟批量导入逻辑
  ElMessage.success('批量导入功能开发中');
};

// 编辑资源
const editResource = (row) => {
  editForm.value = { ...row };
  editDialogVisible.value = true;
};

// 保存编辑
const saveEdit = () => {
  // 模拟保存逻辑
  editDialogVisible.value = false;
  ElMessage.success('资源编辑成功');
};

// 隐藏资源
const hideResource = (row) => {
  // 模拟隐藏逻辑
  ElMessage.success('资源已隐藏');
};

// 显示资源
const showResource = (row) => {
  // 模拟显示逻辑
  ElMessage.success('资源已显示');
};

// 删除资源
const deleteResource = (row) => {
  // 模拟删除逻辑
  ElMessage.success('资源已删除');
};

// 搜索资源
const searchResources = () => {
  // 模拟搜索逻辑
  ElMessage.success('搜索成功');
};

// 重置搜索
const resetSearch = () => {
  searchParams.value = {
    title: '',
    type: '',
    accessLevel: ''
  };
};

// 导出统计报表
const exportStatistics = () => {
  // 模拟导出逻辑
  ElMessage.success('统计报表导出成功');
};

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val;
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
};
</script>

<style scoped>
.electronic-resource-container {
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

.statistics-overview {
  margin-bottom: 20px;
}

.statistic-card {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.statistic-content {
  text-align: center;
}

.statistic-title {
  font-size: 16px;
  color: #606266;
  margin-bottom: 10px;
}

.statistic-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
}

.file-name {
  margin-top: 10px;
  color: #606266;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>