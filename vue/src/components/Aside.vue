<template>
<div>


  <el-menu
      style="width: 200px; min-height: calc(100vh - 50px);"
      :default-active="path"
      class="el-menu-vertical-demo"
      @open="handleOpen"
      @close="handleClose"
      router
      background-color="#30333c" text-color="#fff"
  >
    <el-menu-item index="/dashboard" >
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icondashboard "></use>
      </svg>
      <span>展示板</span>
    </el-menu-item>
    
    <el-sub-menu index="2" text-color="#fff">
      <template #title>
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-mingpian "></use>
        </svg>
        <span>个人信息</span>
      </template>
      <el-menu-item index="/person" style="font-color: white">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-a-bianji1 "></use>
        </svg>
        <span>修改个人信息</span>
      </el-menu-item>
      <el-menu-item index="/password">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-mima "></use>
        </svg>
        <span>修改密码</span>
      </el-menu-item>
    </el-sub-menu>
    
    <!-- ADMIN可以看到用户管理，超级管理员可以看到 -->
    <el-menu-item index="/user" v-if="user.userType === 'ADMIN' && user.roleKey === 'SUPER'">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#iconreader "></use>
      </svg>
      <span>用户管理</span>
    </el-menu-item>
    
    <!-- ADMIN可以看到完整的图书管理菜单，超级管理员和采购管理员可以看到 -->
    <el-sub-menu index="3" text-color="#fff" v-if="user.userType === 'ADMIN' && (user.roleKey === 'SUPER' || user.roleKey === 'PURCHASE')">
      <template #title>
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#iconbook "></use>
        </svg>
        <span>图书管理</span>
      </template>
      <el-menu-item index="/book">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#iconbook "></use>
        </svg>
        <span>书籍管理</span>
      </el-menu-item>
      <el-menu-item index="/purchase">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-shopping-cart-full "></use>
        </svg>
        <span>图书采购</span>
      </el-menu-item>
      <el-menu-item index="/catalog">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-a-dangan1 "></use>
        </svg>
        <span>图书编目</span>
      </el-menu-item>
      <el-menu-item index="/collection">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-a-dangan1 "></use>
        </svg>
        <span>图书典藏</span>
      </el-menu-item>
      <el-menu-item index="/inventory">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-a-dangan1 "></use>
        </svg>
        <span>库存管理</span>
      </el-menu-item>
      <el-menu-item index="/journal">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#iconbook "></use>
        </svg>
        <span>期刊管理</span>
      </el-menu-item>
      <el-menu-item index="/electronic-resource">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-a-dangan1 "></use>
        </svg>
        <span>电子资源</span>
      </el-menu-item>
    </el-sub-menu>
    
    <!-- STUDENT和TEACHER只能看到图书查询 -->
    <el-menu-item index="/book" v-if="user.userType === 'STUDENT' || user.userType === 'TEACHER'">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#iconbook "></use>
      </svg>
      <span>图书查询</span>
    </el-menu-item>
    
    <!-- ADMIN可以看到完整的借阅管理菜单，超级管理员和借阅管理员可以看到 -->
    <el-sub-menu index="4" text-color="#fff" v-if="user.userType === 'ADMIN' && (user.roleKey === 'SUPER' || user.roleKey === 'BORROW')">
      <template #title>
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#iconlend-record "></use>
        </svg>
        <span>借阅管理</span>
      </template>
      <el-menu-item index="/lendrecord">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#iconlend-record "></use>
        </svg>
        <span>借阅记录</span>
      </el-menu-item>
      <el-menu-item index="/borrow-audit">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-a-shenhe1 "></use>
        </svg>
        <span>借阅审核</span>
      </el-menu-item>
      <el-menu-item index="/return-fine">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-a-tuihuo1 "></use>
        </svg>
        <span>归还与罚款</span>
      </el-menu-item>
      <el-menu-item index="/reservation">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-a-yuyue1 "></use>
        </svg>
        <span>预约管理</span>
      </el-menu-item>
    </el-sub-menu>
    
    <!-- STUDENT和TEACHER只能看到借阅信息查询 -->
    <el-menu-item index="/lendrecord" v-if="user.userType === 'STUDENT' || user.userType === 'TEACHER'">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#iconlend-record"></use>
      </svg>
      <span>借阅信息</span>
    </el-menu-item>
    
    <!-- ADMIN可以管理公告与活动，只有超级管理员可以看到 -->
    <el-menu-item index="/announcement" v-if="user.userType === 'ADMIN' && user.roleKey === 'SUPER'">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-a-gonggao1 "></use>
      </svg>
      <span>公告与活动</span>
    </el-menu-item>
    
    <!-- ADMIN可以看到数据统计，超级管理员和数据管理员可以看到 -->
    <el-menu-item index="/statistics" v-if="user.userType === 'ADMIN' && (user.roleKey === 'SUPER' || user.roleKey === 'DATA')">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-a-tongji1 "></use>
      </svg>
      <span>数据统计</span>
    </el-menu-item>
    
    <!-- 只有ADMIN中的超级管理员可以看到系统管理 -->
    <el-sub-menu index="5" text-color="#fff" v-if="user.userType === 'ADMIN' && user.roleKey === 'SUPER'">
      <template #title>
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-a-quanxian1 "></use>
        </svg>
        <span>系统管理</span>
      </template>
      <el-menu-item index="/permission">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-a-quanxian1 "></use>
        </svg>
        <span>权限管理</span>
      </el-menu-item>
      <el-menu-item index="/system-config">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-a-shezhi1 "></use>
        </svg>
        <span>系统配置</span>
      </el-menu-item>
    </el-sub-menu>
  </el-menu>

</div>
</template>

<script>



export default {
  name: "Aside",
  components:{},
  created(){
    let userStr = sessionStorage.getItem("user") || "{}";
    this.user = JSON.parse(userStr);
    this.path = this.$route.path;
  },
  watch: {
    '$route.path': function(newPath) {
      this.path = newPath;
    }
  },
  data(){
    return {
      user:{},
      path: '/'  // 初始化为根路径
    }
  }
}
</script>

<style scoped>
.icon {
  width: 30px;
  height: 30px;
  padding-top: 5px;
  padding-right: 10px;
}
</style>