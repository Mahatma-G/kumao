import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'begin',
    component: () => import('../components/LoginTitle.vue'),
    children:[
      {
        path:'',
        name:'login',
        component:()=>import('../components/Login.vue'),
        children:[
          {
            path:'',
            name:'seafileLogin',
            component:()=>import('../components/SeafileLogin.vue')
          },
          {
            path:'ftpLogin',
            name:'ftpLogin',
            component:()=>import('../components/FtpLogin.vue')
          },
          {
            path:'baiDuLogin',
            name:'baiDuLogin',
            component:()=>import('../components/BaiDuLogin.vue')
          },
		  {
		  	path:'AllLogin',
		  	name:'AllLogin',
		  	component:()=>import('../components/AllLogin.vue')
		  }
        ]
      }
    ]
  },
  {
    path:'/mainTitle',
    name:'mainTitle',
    component:()=>import('../components/MainTitle.vue'),
    children:[
      {
        path:'',
        name:'showFile',
        component:()=>import('../components/ShowFile.vue')
      },
	  {
	    path:'/download',
	    name:'download',
	    component:()=>import('../components/download.vue')
	  }
    ]
  },
  {
    path:'/index',
    name:'index',
    component:()=>import('../components/All/index.vue'),
    children:[
      {
        path:'/',
        name:'showFile',
        component:()=>import('../components/ShowFile.vue')
      }
    ]
  },
  {
    path:'/upload',
    name:'upload',
    component:()=>import('../components/upload.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
