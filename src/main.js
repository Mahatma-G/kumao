import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
import VueAxios from 'vue-axios'
import uploader from 'vue-simple-uploader'
import './assets/font-awesome/css/font-awesome.min.css'
import contextmenu from 'vue-contextmenujs'

Vue.use(uploader);
Vue.use(VueAxios, axios)
Vue.use(ElementUI)
Vue.use(contextmenu)
Vue.config.productionTip = false

// Vue.directive('addFile', {
//   bind(el, binding) {
//     el.addEventListener('click', () => {
//       const data = binding.value;
//       var data = [
//       	[files.data.name, data.path, data.repo_id],
//       ];
// 	  var SqliteDB = require('./sqlite.js').SqliteDB;
// 	  var file = "src/assets/db/filePath.db";
// 	  var sqliteDB = new SqliteDB(file);
// 	  var sql = "insert into path(fileName,path,repoId) values(?, ?, ?)"
// 	  sqliteDB.insertData(sql, data, function(){
// 		  console.log("插入成功")
// 	  })      
//     }, false);
//   }
// });

// Vue.directive('deleteFile', {
//   bind(el, binding) {
//     el.addEventListener('click', () => {
//       const data = binding.value;
//       console.log(data)
//       //data中方法着用户的行为数据（用户的行为数据需要自己定义）
//       /**
//        * 进行统计操作
//        */
//     }, false);
//   }
// });

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
