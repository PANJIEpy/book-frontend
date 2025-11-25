<template>
  <div class="home" style ="padding: 10px">
<!-- 按钮-->
<!-- 搜索-->
    <div style="margin: 10px 0;">
      <el-form inline="true" size="small">
        <el-form-item label="账号(学号/工号)" >
      <el-input v-model="queryParams.username" placeholder="请输入账号"  clearable>
        <template #prefix><el-icon class="el-input__icon"><search/></el-icon></template>
      </el-input>
          </el-form-item >
        <el-form-item label="真实姓名" >
          <el-input v-model="queryParams.realName" placeholder="请输入真实姓名"  clearable>
            <template #prefix><el-icon class="el-input__icon"><search /></el-icon></template>
          </el-input>
        </el-form-item >
        <el-form-item label="用户类型" >
          <el-select v-model="queryParams.userType" placeholder="选择用户类型" clearable>
            <el-option label="学生" value="STUDENT"></el-option>
            <el-option label="教师" value="TEACHER"></el-option>
          </el-select>
        </el-form-item >
        <el-form-item label="院系/部门" >
          <el-input v-model="queryParams.deptName" placeholder="请输入院系/部门"  clearable>
            <template #prefix><el-icon class="el-input__icon"><search /></el-icon></template>
          </el-input>
        </el-form-item >
        <el-form-item>
      <el-button type="primary" style="margin-left: 1%" @click="load" size="mini">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button size="mini"  type="danger" @click="clear">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 按钮-->
    <div style="margin: 10px 0;" >
      <el-popconfirm title="确认删除?" @confirm="deleteBatch" v-if="user.role == 1">
        <template #reference>
          <el-button type="danger" size="mini" >批量删除</el-button>
        </template>
      </el-popconfirm>
    </div>
<!-- 数据字段-->
    <el-table :data="tableData" stripe border="true"  @selection-change="handleSelectionChange" >
      <el-table-column v-if="user.roleKey === 'SUPER'"
                       type="selection"
                       width="55">
      </el-table-column>
      <el-table-column prop="userId" label="用户ID" sortable />
      <el-table-column prop="username" label="账号" />
      <el-table-column prop="realName" label="真实姓名" />
      <el-table-column prop="userType" label="用户类型" :formatter="formatUserType" />
      <el-table-column prop="roleKey" label="角色" :formatter="formatRoleKey" />
      <el-table-column prop="deptName" label="院系/部门" />
      <el-table-column prop="phone" label="联系电话" />
      <el-table-column prop="maxBorrowQuota" label="最大借阅额度" />
      <el-table-column prop="status" label="状态" :formatter="formatStatus" />
      <el-table-column fixed="right" label="操作" >
        <template v-slot="scope">
          <el-button  size="mini" @click ="handleEdit(scope.row)">编辑</el-button>
          <el-popconfirm title="确认删除?" @confirm="handleDelete(scope.row.userId)">
            <template #reference>
              <el-button type="danger" size="mini" >删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
<!--    分页-->
    <div style="margin: 10px 0">
      <el-pagination
          v-model:currentPage="currentPage"
          :page-sizes="[5, 10, 20]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      >
      </el-pagination>

      <el-dialog v-model="dialogVisible" title="编辑读者信息" width="30%">
        <el-form :model="form" label-width="120px">
          <el-form-item label="用户名">
            <el-input style="width: 80%" v-model="form.username"></el-input>
          </el-form-item>
          <el-form-item label="昵称">
            <el-input style="width: 80%" v-model="form.nickName"></el-input>
          </el-form-item>
          <el-form-item label="电话号码">
            <el-input style="width: 80%" v-model="form.phone"></el-input>
          </el-form-item>
          <el-form-item label="性别">
            <div>
              <el-radio v-model="form.sex" label="男">男</el-radio>
              <el-radio v-model="form.sex" label="女">女</el-radio>
            </div>
          </el-form-item>
          <el-form-item label="地址">
            <el-input type="textarea" style="width: 80%" v-model="form.address"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import {ElMessage} from "element-plus";
import api from '../api';

export default {
  created(){
    // 先获取用户信息，再加载数据
    let userStr = sessionStorage.getItem("user") ||"{}"
    this.user = JSON.parse(userStr)
    console.log('用户信息：', this.user);
    
    // 延迟一小段时间再加载数据，确保页面准备就绪
    setTimeout(() => {
      console.log('延迟加载用户数据');
      this.load();
    }, 100);
  },
  name: 'User',
  methods: {
    handleSelectionChange(val){
      console.log('选中的行数据：', val);
      // 使用正确的userId字段
      this.ids = val.map(v => v.userId)
      console.log('选中的ID列表：', this.ids);
    },
    deleteBatch(){
      if (!this.ids.length) {
        ElMessage.warning("请选择数据！")
        return
      }
      //  一个小优化，直接发送这个数组，而不是一个一个的提交删除
      api.user.batchDeleteUser(this.ids).then(res =>{
        if(res.code === '0'){
          ElMessage.success("批量删除成功")
          this.load()
        }
        else {
          ElMessage.error(res.msg)
        }
      })
    },
    load() {
      console.log('开始加载用户数据，当前页码：', this.currentPage, '每页数量：', this.pageSize);
      console.log('原始查询参数：', this.queryParams);
      
      // 构建请求配置，只传递非空的查询参数
      const params = {
        pageNum: this.currentPage,
        pageSize: this.pageSize
      };
      
      // 只添加非空的查询条件
      if (this.queryParams.username && this.queryParams.username.trim()) {
        params.username = this.queryParams.username;
      }
      if (this.queryParams.realName && this.queryParams.realName.trim()) {
        params.realName = this.queryParams.realName;
      }
      if (this.queryParams.userType && this.queryParams.userType.trim()) {
        params.userType = this.queryParams.userType;
      }
      if (this.queryParams.deptName && this.queryParams.deptName.trim()) {
        params.deptName = this.queryParams.deptName;
      }
      if (this.queryParams.status && this.queryParams.status.toString().trim()) {
        params.status = this.queryParams.status;
      }
      
      const requestConfig = {
        params: params
      };
      
      console.log('过滤后的请求参数：', params);
      console.log('实际请求的URL路径(基于baseURL):', '/admin/user/page');
      
      // 调用分页查询所有用户信息的接口
      api.user.getUserList(params).then(res => {
        console.log('获取用户数据响应完整信息：', res);
        console.log('响应状态码：', res.code);
        console.log('响应数据类型：', typeof res.data);
        console.log('响应数据内容：', JSON.stringify(res.data));
        
        // 检查响应状态码，兼容不同的状态码格式
        if(res) {
          // 尝试不同的状态码检查方式
          const isSuccess = (res.code === 0 || res.code === 200 || res.code === '0' || res.code === '200');
          console.log('请求是否成功：', isSuccess);
          
          if(isSuccess) {
            // 更详细的数据格式检查
            console.log('响应数据是否存在：', res.data !== undefined);
            if(res.data) {
              console.log('records字段是否存在：', res.data.records !== undefined);
              console.log('total字段是否存在：', res.data.total !== undefined);
              
              // 更健壮的数据获取方式，尝试多种可能的数据结构
              let userData = [];
              let userTotal = 0;
              
              // 检查是否是标准的分页响应格式
              if(Array.isArray(res.data.records)) {
                userData = res.data.records;
                userTotal = res.data.total || 0;
                console.log('使用records字段作为数据源');
              } 
              // 检查是否数据直接在data字段中
              else if(Array.isArray(res.data)) {
                userData = res.data;
                userTotal = res.data.length;
                console.log('使用data字段作为数据源');
              }
              // 检查是否有rows或list字段（常见的分页响应格式）
              else if(Array.isArray(res.data.rows)) {
                userData = res.data.rows;
                userTotal = res.data.total || 0;
                console.log('使用rows字段作为数据源');
              }
              else if(Array.isArray(res.data.list)) {
                userData = res.data.list;
                userTotal = res.data.total || 0;
                console.log('使用list字段作为数据源');
              }
              
              this.tableData = userData;
              this.total = userTotal;
              console.log('成功加载用户数据，总数：', this.total, '记录数：', this.tableData.length);
              
              // 显示数据加载提示
              if(this.tableData.length === 0) {
                ElMessage.info('当前查询条件下没有找到数据');
              } else {
                ElMessage.success(`成功加载 ${this.tableData.length} 条用户数据`);
              }
            } else {
              console.error('响应中没有data字段');
              this.tableData = [];
              this.total = 0;
              ElMessage.warning('响应中没有数据');
            }
          } else {
            console.error('请求失败或状态码不正确：', res.code, res.message || res.msg || '未知错误');
            this.tableData = [];
            this.total = 0;
            ElMessage.error('获取用户数据失败：' + (res.message || res.msg || '未知错误'));
          }
        } else {
          console.error('响应为空');
          this.tableData = [];
          this.total = 0;
          ElMessage.error('获取用户数据失败：响应为空');
        }
      }).catch(error => {
        console.error('请求用户数据时发生错误：', error);
        console.error('错误详情：', error.response || error.message);
        this.tableData = [];
        this.total = 0;
        ElMessage.error('网络错误，请检查连接后重试：' + (error.message || '未知错误'));
      });
    },
    clear(){
      this.queryParams = {
        username: '',
        realName: '',
        userType: '',
        deptName: '',
        status: ''
      }
      this.load()
    },
    formatUserType(row, column) {
      return row.userType === 'STUDENT' ? '学生' : row.userType === 'TEACHER' ? '教师' : row.userType
    },
    formatRoleKey(row, column) {
      return row.roleKey === 'SUPER' ? '超级管理员' : row.roleKey === 'PURCHASE' ? '采购管理员' : row.roleKey
    },
    formatStatus(row, column) {
      return row.status === 1 ? '正常' : '禁用'
    },

    handleDelete(id){
      api.user.deleteUser(id).then(res =>{
        console.log(res)
        if(res.code == 0 ){
          ElMessage.success("删除成功")
        }
        else
          ElMessage.error(res.msg)
        this.load()
      })
    },


    add(){
      this.dialogVisible= true
      this.form ={}
    },
    save(){
      if(this.form.id){
        api.user.updateUser(this.form).then(res =>{
          console.log(res)
          if(res.code == 0){
            ElMessage({
              message: '更新成功',
              type: 'success',
            })
          }
          else {
            ElMessage.error(res.msg)
          }

          this.load() //不知道为啥，更新必须要放在这里面
          this.dialogVisible = false
        })
      } else {
        api.user.addUser(this.form).then(res =>{
          console.log(res)
          if(res.code == 0){
            ElMessage.success('添加成功')
          }
          else {
            ElMessage.error(res.msg)
          }
          this.load()
          this.dialogVisible = false
        })
      }

    },


    handleEdit(row){
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
    },
    handleSizeChange(pageSize){
      this.pageSize = pageSize
      this.load()
    },
    handleCurrentChange(pageNum) {
      this.currentPage = pageNum;
      console.log('页码已更改为：', this.currentPage);
      this.load();
    },
  },
  data() {
    return {
      form: {},
      dialogVisible : false,
      queryParams: {
        username: '',
        realName: '',
        userType: '',
        deptName: '',
        status: ''
      },
      total:10,
      currentPage:1,
      pageSize: 10,
      tableData: [],
      user:{},
      ids:[],
    }
  },
}
</script>
