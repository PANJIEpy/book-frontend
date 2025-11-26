import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/assets/css/global.css'

import zhCn from 'element-plus/es/locale/lang/zh-cn'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 已移除对自定义消息样式的覆盖，使用ElMessage默认样式
import '@/assets/icon/iconfont.js' // 图标
import '@/assets/icon/iconfont.css'
const app =createApp(App)
import * as ElIconModules from '@element-plus/icons'
for(let iconName in ElIconModules){
    app.component(iconName,ElIconModules[iconName])
}
app.use(store).use(router).use(ElementPlus,{locale: zhCn,size:"small"}).mount('#app')
