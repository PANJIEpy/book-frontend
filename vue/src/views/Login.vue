<template>
<div  class="login-container"  >
    <el-form ref="form" :model="form"   :rules="rules" class="login-page">
      <h2 class="title" style="margin-bottom: 20px">系统登陆</h2>
      <el-form-item prop="username" >
        <el-input v-model="form.username"  clearable>
          <template #prefix>
            <el-icon class="el-input__icon"><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="form.password"  clearable show-password>
          <template #prefix>
            <el-icon class="el-input__icon"><Lock /></el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <div style="display: flex">
          <el-input  v-model="form.captchaCode" style="width: 45%;" placeholder="请输入验证码"></el-input>
          <img :src="captchaImage" @click="getCaptcha" style="width: 50%; height: 40px; cursor: pointer;" alt="验证码" />
        </div>
      </el-form-item>
      <el-form-item >
        <el-button type="primary"  style=" width: 100%" @click="login">登 录</el-button>
      </el-form-item>
      <el-form-item><el-button type="text" @click="$router.push('/register')">前往注册 >> </el-button></el-form-item>
    </el-form>
</div>

</template>

<script>
import request from "../utils/request";
import {ElMessage} from "element-plus";
import {User, Lock} from "@element-plus/icons-vue";

export default {
  name: "Login",
  data() {
    return {
      captchaImage: '',
      captchaKey: '',
      form: {
        username: '',
        password: '',
        captchaCode: ''
      },
      rules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur',
          }
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur',
          }
        ],
        captchaCode: [
          {
            required: true,
            message: '请输入验证码',
            trigger: 'blur',
          }
        ]
      }
    }
  },
  mounted() {
    // 页面加载时获取验证码
    this.getCaptcha();
  },
  methods: {
    // 获取图形验证码
    getCaptcha() {
      request.get("/admin/login/captcha").then(res => {
        if (res.code === 0 || res.code === 200 || res.ok) {
          this.captchaImage = res.data.image;
          this.captchaKey = res.data.key;
        } else {
          ElMessage.error(res.message || "获取验证码失败");
        }
      }).catch(err => {
        console.error("获取验证码错误:", err);
        ElMessage.error("获取验证码失败");
      });
    },
    // 登录方法
    login() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const loginVo = {
            username: this.form.username,
            password: this.form.password,
            captchaCode: this.form.captchaCode,
            captchaKey: this.captchaKey
          };

          request.post("/admin/login", loginVo).then(res => {
            if (res.code === 0 || res.code === 200 || res.ok) {
              // 存储JWT token
              sessionStorage.setItem("token", res.data);
              
              // 获取用户信息
              this.getUserInfo();
            } else {
              ElMessage.error(res.message || "登录失败");
              // 登录失败时刷新验证码
              this.getCaptcha();
            }
          }).catch(err => {
            console.error("登录错误:", err);
            ElMessage.error("登录失败，请重试");
            this.getCaptcha();
          });
        }
      });
    },
    // 获取用户信息
    getUserInfo() {
      request.get("/admin/info").then(res => {
        if (res.code === 0 || res.code === 200 || res.ok) {
          // 存储用户信息
          sessionStorage.setItem("user", JSON.stringify(res.data));
          ElMessage.success("登录成功");
          this.$router.push("/dashboard");
        } else {
          ElMessage.error(res.message || "获取用户信息失败");
          sessionStorage.removeItem("token");
        }
      }).catch(err => {
        console.error("获取用户信息错误:", err);
        ElMessage.error("获取用户信息失败");
        sessionStorage.removeItem("token");
      });
    }
  }
}
</script>

<style scoped>
.login-container {
  position: fixed;
  width: 100%;
  height: 100vh;
  background: url('../img/bg2.svg');
  background-size: contain;
  overflow: hidden;
}
.login-page {
  border-radius: 5px;
  margin: 180px auto;
  width: 350px;
  padding: 35px 35px 15px;
  background: #fff;
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px #cac6c6;
}
</style>