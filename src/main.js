import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'normalize.css';
import axios from 'axios'
//导入element
import '@/plugins/element.js'
//导入过滤器
import '@/plugins/filter.js'
//导入全局样式
import '@/assets/css/global.css'
//引入自定义图标
import '@/assets/font_cloudMusic/iconfont.css'
//解决跨域
import { VueJsonp } from 'vue-jsonp'

// 创建两个 axios 实例
const musicHttp = axios.create({
    baseURL: 'http://localhost:3000/'
})

const authHttp = axios.create({
    baseURL: 'http://localhost:5001/'
})

// 将两个实例挂载到 Vue 原型
Vue.prototype.$http = musicHttp      // 音乐服务
Vue.prototype.$authHttp = authHttp   // 认证服务

Vue.use(VueJsonp)
Vue.config.productionTip = false

Vue.config.warnHandler = function (msg, vm, trace) {
    console.warn(`[Vue warn]: ${msg}${trace}`);
};
new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')