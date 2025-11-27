<template>
  <div class="system-config-container">
    <h2>系统配置</h2>

    <el-tabs v-model="activeTab" class="main-tabs">
      <!-- 借阅规则配置 -->
      <el-tab-pane label="借阅规则配置" name="borrowRule">
        <el-card shadow="hover" class="main-card">
          <template #header>
            <div class="card-header">
              <span>借阅规则配置</span>
              <el-button type="primary" @click="saveBorrowRule">
                保存配置
              </el-button>
            </div>
          </template>

          <el-form :model="borrowRuleForm" label-width="150px" class="config-form">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="学生借阅期限(天)">
                  <el-input-number
                    v-model="borrowRuleForm.studentBorrowDays"
                    :min="1"
                    :step="1"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="教师借阅期限(天)">
                  <el-input-number
                    v-model="borrowRuleForm.teacherBorrowDays"
                    :min="1"
                    :step="1"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="学生最大借阅册数">
                  <el-input-number
                    v-model="borrowRuleForm.studentMaxBooks"
                    :min="1"
                    :step="1"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="教师最大借阅册数">
                  <el-input-number
                    v-model="borrowRuleForm.teacherMaxBooks"
                    :min="1"
                    :step="1"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="学生续借次数">
                  <el-input-number
                    v-model="borrowRuleForm.studentRenewTimes"
                    :min="0"
                    :step="1"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="教师续借次数">
                  <el-input-number
                    v-model="borrowRuleForm.teacherRenewTimes"
                    :min="0"
                    :step="1"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="续借期限(天)">
                  <el-input-number
                    v-model="borrowRuleForm.renewDays"
                    :min="1"
                    :step="1"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="长期借阅最长期限(天)">
                  <el-input-number
                    v-model="borrowRuleForm.longTermBorrowDays"
                    :min="1"
                    :step="1"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 罚款规则配置 -->
      <el-tab-pane label="罚款规则配置" name="fineRule">
        <el-card shadow="hover" class="main-card">
          <template #header>
            <div class="card-header">
              <span>罚款规则配置</span>
              <el-button type="primary" @click="saveFineRule">
                保存配置
              </el-button>
            </div>
          </template>

          <el-form :model="fineRuleForm" label-width="150px" class="config-form">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="逾期罚款费率(元/天)">
                  <el-input-number
                    v-model="fineRuleForm.overdueRate"
                    :min="0"
                    :step="0.1"
                    :precision="1"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="单本书罚款上限(元)">
                  <el-input-number
                    v-model="fineRuleForm.maxFinePerBook"
                    :min="0"
                    :step="1"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="用户罚款上限(元)">
                  <el-input-number
                    v-model="fineRuleForm.maxFinePerUser"
                    :min="0"
                    :step="1"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="破损图书赔偿比例(%)">
                  <el-input-number
                    v-model="fineRuleForm.damageCompensationRate"
                    :min="0"
                    :max="100"
                    :step="1"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="丢失图书赔偿比例(%)">
                  <el-input-number
                    v-model="fineRuleForm.lostCompensationRate"
                    :min="0"
                    :max="200"
                    :step="1"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 编目规则配置 -->
      <el-tab-pane label="编目规则配置" name="catalogRule">
        <el-card shadow="hover" class="main-card">
          <template #header>
            <div class="card-header">
              <span>编目规则配置</span>
              <el-button type="primary" @click="saveCatalogRule">
                保存配置
              </el-button>
            </div>
          </template>

          <el-form :model="catalogRuleForm" label-width="150px" class="config-form">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="分类标准">
                  <el-select v-model="catalogRuleForm.classificationStandard" style="width: 100%">
                    <el-option label="中图法" value="中图法" />
                    <el-option label="杜威十进制分类法" value="杜威十进制分类法" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="索书号生成规则">
                  <el-select v-model="catalogRuleForm.callNumberRule" style="width: 100%">
                    <el-option label="分类号+著者号" value="classification+author" />
                    <el-option label="分类号+种次号" value="classification+serial" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="ISBN必填">
                  <el-switch v-model="catalogRuleForm.isbnRequired" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="分类号必填">
                  <el-switch v-model="catalogRuleForm.classificationRequired" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="著者必填">
                  <el-switch v-model="catalogRuleForm.authorRequired" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="出版社必填">
                  <el-switch v-model="catalogRuleForm.publisherRequired" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 预警规则配置 -->
      <el-tab-pane label="预警规则配置" name="warningRule">
        <el-card shadow="hover" class="main-card">
          <template #header>
            <div class="card-header">
              <span>预警规则配置</span>
              <el-button type="primary" @click="saveWarningRule">
                保存配置
              </el-button>
            </div>
          </template>

          <el-form :model="warningRuleForm" label-width="150px" class="config-form">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="低库存预警阈值">
                  <el-input-number
                    v-model="warningRuleForm.lowStockThreshold"
                    :min="0"
                    :step="1"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="预约取书期限(天)">
                  <el-input-number
                    v-model="warningRuleForm.reservationPickupDays"
                    :min="1"
                    :step="1"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="逾期预警提前天数">
                  <el-input-number
                    v-model="warningRuleForm.overdueWarningDays"
                    :min="0"
                    :step="1"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="违规次数预警阈值">
                  <el-input-number
                    v-model="warningRuleForm.violationWarningThreshold"
                    :min="1"
                    :step="1"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 基础信息配置 -->
      <el-tab-pane label="基础信息配置" name="basicInfo">
        <el-card shadow="hover" class="main-card">
          <template #header>
            <div class="card-header">
              <span>基础信息配置</span>
              <el-button type="primary" @click="saveBasicInfo">
                保存配置
              </el-button>
            </div>
          </template>

          <el-form :model="basicInfoForm" label-width="150px" class="config-form">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="图书馆名称">
                  <el-input v-model="basicInfoForm.libraryName" placeholder="请输入图书馆名称" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="图书馆地址">
                  <el-input v-model="basicInfoForm.libraryAddress" placeholder="请输入图书馆地址" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="联系电话">
                  <el-input v-model="basicInfoForm.contactPhone" placeholder="请输入联系电话" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱地址">
                  <el-input v-model="basicInfoForm.email" placeholder="请输入邮箱地址" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="开放时间">
                  <el-input
                    v-model="basicInfoForm.openTime"
                    type="textarea"
                    rows="4"
                    placeholder="请输入开放时间"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 数据备份配置 -->
      <el-tab-pane label="数据备份配置" name="backupConfig">
        <el-card shadow="hover" class="main-card">
          <template #header>
            <div class="card-header">
              <span>数据备份配置</span>
              <el-button type="primary" @click="saveBackupConfig">
                保存配置
              </el-button>
              <el-button type="success" @click="manualBackup">
                手动备份
              </el-button>
              <el-button type="warning" @click="restoreBackup">
                恢复数据
              </el-button>
            </div>
          </template>

          <el-form :model="backupConfigForm" label-width="150px" class="config-form">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="自动备份开关">
                  <el-switch v-model="backupConfigForm.autoBackupEnabled" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="备份周期">
                  <el-select v-model="backupConfigForm.backupCycle" style="width: 100%">
                    <el-option label="每天" value="daily" />
                    <el-option label="每周" value="weekly" />
                    <el-option label="每月" value="monthly" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="备份时间">
                  <el-time-picker
                    v-model="backupConfigForm.backupTime"
                    placeholder="选择备份时间"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="备份保留天数">
                  <el-input-number
                    v-model="backupConfigForm.backupRetentionDays"
                    :min="1"
                    :step="1"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="备份路径">
                  <el-input v-model="backupConfigForm.backupPath" placeholder="请输入备份路径" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <!-- 备份记录 -->
          <h3 style="margin-top: 20px; margin-bottom: 15px;">备份记录</h3>
          <el-table :data="backupRecords" stripe border style="width: 100%">
            <el-table-column prop="id" label="备份ID" width="120" />
            <el-table-column prop="backupTime" label="备份时间" width="180" />
            <el-table-column prop="backupSize" label="备份大小" width="120" />
            <el-table-column prop="backupType" label="备份类型" width="120">
              <template #default="scope">
                <el-tag :type="scope.row.backupType === '自动' ? 'primary' : 'success'">
                  {{ scope.row.backupType }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button type="primary" size="mini" @click="downloadBackup(scope.row)">
                  下载
                </el-button>
                <el-button type="danger" size="mini" @click="deleteBackup(scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';

// 激活的标签页
const activeTab = ref('borrowRule');

// 借阅规则表单
const borrowRuleForm = ref({
  studentBorrowDays: 30,
  teacherBorrowDays: 60,
  studentMaxBooks: 5,
  teacherMaxBooks: 10,
  studentRenewTimes: 2,
  teacherRenewTimes: 3,
  renewDays: 30,
  longTermBorrowDays: 180
});

// 罚款规则表单
const fineRuleForm = ref({
  overdueRate: 0.5,
  maxFinePerBook: 20,
  maxFinePerUser: 100,
  damageCompensationRate: 50,
  lostCompensationRate: 150
});

// 编目规则表单
const catalogRuleForm = ref({
  classificationStandard: '中图法',
  callNumberRule: 'classification+author',
  isbnRequired: true,
  classificationRequired: true,
  authorRequired: true,
  publisherRequired: true
});

// 预警规则表单
const warningRuleForm = ref({
  lowStockThreshold: 5,
  reservationPickupDays: 7,
  overdueWarningDays: 3,
  violationWarningThreshold: 3
});

// 基础信息表单
const basicInfoForm = ref({
  libraryName: '图书馆管理系统',
  libraryAddress: '校园内',
  contactPhone: '010-12345678',
  email: 'library@example.com',
  openTime: '周一至周五: 8:00-22:00\n周六至周日: 9:00-21:00'
});

// 备份配置表单
const backupConfigForm = ref({
  autoBackupEnabled: true,
  backupCycle: 'daily',
  backupTime: '02:00',
  backupRetentionDays: 30,
  backupPath: '/backup'
});

// 备份记录
const backupRecords = ref([
  { id: 1, backupTime: '2023-05-15 02:00:00', backupSize: '125.6MB', backupType: '自动', status: '成功' },
  { id: 2, backupTime: '2023-05-14 02:00:00', backupSize: '124.8MB', backupType: '自动', status: '成功' },
  { id: 3, backupTime: '2023-05-13 02:00:00', backupSize: '123.5MB', backupType: '自动', status: '成功' },
  { id: 4, backupTime: '2023-05-12 02:00:00', backupSize: '122.9MB', backupType: '自动', status: '成功' },
  { id: 5, backupTime: '2023-05-11 14:30:00', backupSize: '122.1MB', backupType: '手动', status: '成功' }
]);

// 保存借阅规则
const saveBorrowRule = () => {
  // 模拟保存逻辑
  ElMessage.success('借阅规则保存成功');
};

// 保存罚款规则
const saveFineRule = () => {
  // 模拟保存逻辑
  ElMessage.success('罚款规则保存成功');
};

// 保存编目规则
const saveCatalogRule = () => {
  // 模拟保存逻辑
  ElMessage.success('编目规则保存成功');
};

// 保存预警规则
const saveWarningRule = () => {
  // 模拟保存逻辑
  ElMessage.success('预警规则保存成功');
};

// 保存基础信息
const saveBasicInfo = () => {
  // 模拟保存逻辑
  ElMessage.success('基础信息保存成功');
};

// 保存备份配置
const saveBackupConfig = () => {
  // 模拟保存逻辑
  ElMessage.success('备份配置保存成功');
};

// 手动备份
const manualBackup = () => {
  // 模拟手动备份逻辑
  ElMessage.success('手动备份成功');
};

// 恢复数据
const restoreBackup = () => {
  // 模拟恢复数据逻辑
  ElMessage.success('数据恢复功能开发中');
};

// 下载备份
const downloadBackup = (row) => {
  // 模拟下载备份逻辑
  ElMessage.success('备份下载成功');
};

// 删除备份
const deleteBackup = (row) => {
  // 模拟删除备份逻辑
  ElMessage.success('备份删除成功');
};
</script>

<style scoped>
.system-config-container {
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

.config-form {
  padding: 20px 0;
}
</style>