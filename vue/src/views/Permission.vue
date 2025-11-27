<template>
  <div class="permission-container">
    <h2>权限管理</h2>

    <el-tabs v-model="activeTab" class="main-tabs">
      <!-- 角色管理 -->
      <el-tab-pane label="角色管理" name="role">
        <el-card shadow="hover" class="main-card">
          <template #header>
            <div class="card-header">
              <span>角色列表</span>
              <div class="header-actions">
                <el-button type="primary" @click="addRole">
                  <el-icon><Plus /></el-icon> 新增角色
                </el-button>
              </div>
            </div>
          </template>

          <!-- 角色列表表格 -->
          <el-table :data="roleList" stripe border style="width: 100%">
            <el-table-column prop="id" label="角色ID" width="100" />
            <el-table-column prop="roleName" label="角色名称" width="150" />
            <el-table-column prop="roleCode" label="角色编码" width="150" />
            <el-table-column prop="description" label="角色描述" min-width="200" />
            <el-table-column prop="createTime" label="创建时间" width="180" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.status"
                  active-value="1"
                  inactive-value="0"
                  @change="handleRoleStatusChange(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button type="primary" size="mini" @click="assignPermission(scope.row)">
                  分配权限
                </el-button>
                <el-button type="warning" size="mini" @click="editRole(scope.row)">
                  编辑
                </el-button>
                <el-button type="danger" size="mini" @click="deleteRole(scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 权限分配 -->
      <el-tab-pane label="权限分配" name="permission">
        <el-card shadow="hover" class="main-card">
          <template #header>
            <div class="card-header">
              <span>权限分配</span>
            </div>
          </template>

          <!-- 权限分配界面 -->
          <div class="permission-assign">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-card shadow="hover" class="side-card">
                  <template #header>
                    <div class="side-card-header">
                      <span>选择角色</span>
                    </div>
                  </template>
                  <el-tree
                    :data="roleTree"
                    :props="roleTreeProps"
                    node-key="id"
                    @node-click="handleRoleSelect"
                  />
                </el-card>
              </el-col>
              <el-col :span="18">
                <el-card shadow="hover" class="main-content-card">
                  <template #header>
                    <div class="side-card-header">
                      <span>权限列表</span>
                      <el-button type="primary" size="small" @click="savePermission">
                        保存权限
                      </el-button>
                    </div>
                  </template>
                  <el-tree
                    v-if="selectedRole"
                    :data="permissionTree"
                    :props="permissionTreeProps"
                    node-key="id"
                    show-checkbox
                    :default-checked-keys="defaultCheckedKeys"
                    :default-expanded-keys="defaultExpandedKeys"
                    @check="handlePermissionCheck"
                  />
                  <el-empty v-else description="请选择一个角色" />
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-tab-pane>

      <!-- 操作日志 -->
      <el-tab-pane label="操作日志" name="log">
        <el-card shadow="hover" class="main-card">
          <template #header>
            <div class="card-header">
              <span>操作日志</span>
              <div class="header-actions">
                <el-button type="primary" @click="exportLogs">
                  <el-icon><Download /></el-icon> 导出日志
                </el-button>
              </div>
            </div>
          </template>

          <!-- 搜索和筛选 -->
          <div class="search-filter">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-input v-model="logSearchParams.operator" placeholder="操作人" clearable />
              </el-col>
              <el-col :span="6">
                <el-select v-model="logSearchParams.operationType" placeholder="操作类型" clearable>
                  <el-option label="登录" value="登录" />
                  <el-option label="权限变更" value="权限变更" />
                  <el-option label="数据删除" value="数据删除" />
                  <el-option label="数据修改" value="数据修改" />
                  <el-option label="数据新增" value="数据新增" />
                </el-select>
              </el-col>
              <el-col :span="6">
                <el-date-picker
                  v-model="logSearchParams.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-col>
              <el-col :span="6">
                <el-button type="primary" @click="searchLogs">
                  <el-icon><Search /></el-icon> 搜索
                </el-button>
                <el-button @click="resetLogSearch">重置</el-button>
              </el-col>
            </el-row>
          </div>

          <!-- 操作日志表格 -->
          <el-table :data="operationLogs" stripe border style="width: 100%">
            <el-table-column prop="id" label="日志ID" width="100" />
            <el-table-column prop="operator" label="操作人" width="120" />
            <el-table-column prop="operationType" label="操作类型" width="120">
              <template #default="scope">
                <el-tag :type="getLogType(scope.row.operationType)">
                  {{ scope.row.operationType }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="operationContent" label="操作内容" min-width="300" />
            <el-table-column prop="ipAddress" label="IP地址" width="150" />
            <el-table-column prop="operationTime" label="操作时间" width="180" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="logCurrentPage"
              v-model:page-size="logPageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="logTotal"
              @size-change="handleLogSizeChange"
              @current-change="handleLogCurrentChange"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增/编辑角色对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      :title="roleDialogTitle"
      width="500px"
    >
      <el-form :model="roleForm" label-width="100px">
        <el-form-item label="角色名称" required>
          <el-input v-model="roleForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" required>
          <el-input v-model="roleForm.roleCode" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="roleForm.status"
            active-value="1"
            inactive-value="0"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRole">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { Plus, Download, Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 激活的标签页
const activeTab = ref('role');

// 角色管理
const roleList = ref([
  { id: 1, roleName: '超级管理员', roleCode: 'SUPER_ADMIN', description: '拥有系统所有权限', createTime: '2023-01-01 00:00:00', status: '1' },
  { id: 2, roleName: '采购管理员', roleCode: 'PURCHASE_ADMIN', description: '负责图书采购管理', createTime: '2023-01-01 00:00:00', status: '1' },
  { id: 3, roleName: '借阅管理员', roleCode: 'BORROW_ADMIN', description: '负责借阅管理', createTime: '2023-01-01 00:00:00', status: '1' },
  { id: 4, roleName: '数据管理员', roleCode: 'DATA_ADMIN', description: '负责数据统计分析', createTime: '2023-01-01 00:00:00', status: '1' }
]);

// 角色树
const roleTree = ref([
  { id: 1, label: '超级管理员', children: [] },
  { id: 2, label: '采购管理员', children: [] },
  { id: 3, label: '借阅管理员', children: [] },
  { id: 4, label: '数据管理员', children: [] }
]);

// 角色树配置
const roleTreeProps = ref({
  label: 'label',
  children: 'children'
});

// 权限树
const permissionTree = ref([
  { id: 1, label: '系统管理', children: [
    { id: 11, label: '用户管理', children: [
      { id: 111, label: '查看用户' },
      { id: 112, label: '新增用户' },
      { id: 113, label: '编辑用户' },
      { id: 114, label: '删除用户' }
    ]},
    { id: 12, label: '角色管理', children: [
      { id: 121, label: '查看角色' },
      { id: 122, label: '新增角色' },
      { id: 123, label: '编辑角色' },
      { id: 124, label: '删除角色' }
    ]},
    { id: 13, label: '权限管理', children: [
      { id: 131, label: '分配权限' }
    ]}
  ]},
  { id: 2, label: '图书管理', children: [
    { id: 21, label: '图书采购', children: [
      { id: 211, label: '查看采购' },
      { id: 212, label: '新增采购' },
      { id: 213, label: '编辑采购' },
      { id: 214, label: '删除采购' }
    ]},
    { id: 22, label: '图书编目', children: [
      { id: 221, label: '查看编目' },
      { id: 222, label: '新增编目' },
      { id: 223, label: '编辑编目' }
    ]}
  ]},
  { id: 3, label: '借阅管理', children: [
    { id: 31, label: '借阅审核', children: [
      { id: 311, label: '查看审核' },
      { id: 312, label: '审核通过' },
      { id: 313, label: '审核拒绝' }
    ]},
    { id: 32, label: '归还管理', children: [
      { id: 321, label: '查看归还' },
      { id: 322, label: '办理归还' }
    ]}
  ]}
]);

// 权限树配置
const permissionTreeProps = ref({
  label: 'label',
  children: 'children'
});

// 选中的角色
const selectedRole = ref(null);
// 默认选中的权限
const defaultCheckedKeys = ref([]);
// 默认展开的权限
const defaultExpandedKeys = ref([1, 2, 3]);

// 操作日志搜索参数
const logSearchParams = ref({
  operator: '',
  operationType: '',
  dateRange: null
});

// 操作日志分页
const logCurrentPage = ref(1);
const logPageSize = ref(10);
const logTotal = ref(200);

// 对话框
const roleDialogVisible = ref(false);
const roleDialogTitle = ref('新增角色');
const roleForm = ref({
  id: '',
  roleName: '',
  roleCode: '',
  description: '',
  status: '1'
});

// 模拟操作日志数据
const operationLogs = ref([
  { id: 1, operator: 'admin', operationType: '登录', operationContent: '管理员登录系统', ipAddress: '192.168.1.100', operationTime: '2023-05-15 14:30:00', status: '成功' },
  { id: 2, operator: 'admin', operationType: '权限变更', operationContent: '为用户user001分配借阅管理员角色', ipAddress: '192.168.1.100', operationTime: '2023-05-15 14:35:00', status: '成功' },
  { id: 3, operator: 'librarian1', operationType: '数据修改', operationContent: '更新图书信息', ipAddress: '192.168.1.101', operationTime: '2023-05-15 15:20:00', status: '成功' },
  { id: 4, operator: 'admin', operationType: '数据删除', operationContent: '删除过期公告', ipAddress: '192.168.1.100', operationTime: '2023-05-15 16:45:00', status: '成功' },
  { id: 5, operator: 'user001', operationType: '登录', operationContent: '用户登录系统', ipAddress: '192.168.1.102', operationTime: '2023-05-16 09:15:00', status: '成功' },
  { id: 6, operator: 'librarian2', operationType: '数据新增', operationContent: '新增图书采购记录', ipAddress: '192.168.1.103', operationTime: '2023-05-16 10:30:00', status: '成功' },
  { id: 7, operator: 'admin', operationType: '权限变更', operationType: '更新角色权限', operationContent: '更新借阅管理员角色权限', ipAddress: '192.168.1.100', operationTime: '2023-05-16 14:20:00', status: '成功' },
  { id: 8, operator: 'unknown', operationType: '登录', operationContent: '未知用户尝试登录', ipAddress: '10.0.0.1', operationTime: '2023-05-16 15:45:00', status: '失败' },
  { id: 9, operator: 'librarian1', operationType: '数据修改', operationContent: '处理图书归还', ipAddress: '192.168.1.101', operationTime: '2023-05-17 09:50:00', status: '成功' },
  { id: 10, operator: 'admin', operationType: '登录', operationContent: '管理员登录系统', ipAddress: '192.168.1.100', operationTime: '2023-05-17 14:00:00', status: '成功' }
]);

// 根据日志类型获取标签类型
const getLogType = (type) => {
  const typeMap = {
    '登录': 'primary',
    '权限变更': 'warning',
    '数据删除': 'danger',
    '数据修改': 'info',
    '数据新增': 'success'
  };
  return typeMap[type] || 'info';
};

// 新增角色
const addRole = () => {
  roleDialogTitle.value = '新增角色';
  roleForm.value = {
    id: '',
    roleName: '',
    roleCode: '',
    description: '',
    status: '1'
  };
  roleDialogVisible.value = true;
};

// 编辑角色
const editRole = (row) => {
  roleDialogTitle.value = '编辑角色';
  roleForm.value = { ...row };
  roleDialogVisible.value = true;
};

// 保存角色
const saveRole = () => {
  // 模拟保存逻辑
  roleDialogVisible.value = false;
  ElMessage.success('角色保存成功');
};

// 分配权限
const assignPermission = (row) => {
  selectedRole.value = row;
  // 模拟获取角色权限
  defaultCheckedKeys.value = [111, 112, 211, 212];
  activeTab.value = 'permission';
};

// 保存权限
const savePermission = () => {
  // 模拟保存权限逻辑
  ElMessage.success('权限保存成功');
};

// 角色状态变更
const handleRoleStatusChange = (row) => {
  // 模拟状态变更逻辑
  ElMessage.success('角色状态更新成功');
};

// 删除角色
const deleteRole = (row) => {
  // 模拟删除逻辑
  ElMessage.success('角色删除成功');
};

// 角色选择
const handleRoleSelect = (data) => {
  selectedRole.value = data;
  // 模拟获取角色权限
  defaultCheckedKeys.value = [111, 112, 211, 212];
};

// 权限选择
const handlePermissionCheck = (data, checked, indeterminate) => {
  // 模拟权限选择逻辑
};

// 搜索日志
const searchLogs = () => {
  // 模拟搜索逻辑
  ElMessage.success('搜索成功');
};

// 重置日志搜索
const resetLogSearch = () => {
  logSearchParams.value = {
    operator: '',
    operationType: '',
    dateRange: null
  };
};

// 导出日志
const exportLogs = () => {
  // 模拟导出逻辑
  ElMessage.success('日志导出成功');
};

// 日志分页处理
const handleLogSizeChange = (val) => {
  logPageSize.value = val;
};

const handleLogCurrentChange = (val) => {
  logCurrentPage.value = val;
};
</script>

<style scoped>
.permission-container {
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

.permission-assign {
  margin-top: 20px;
}

.side-card {
  height: 600px;
  overflow-y: auto;
}

.side-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-content-card {
  height: 600px;
  overflow-y: auto;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>