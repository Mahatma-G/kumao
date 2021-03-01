<template>
    <div id='seafileLogin'>
        <table align="center">
            <tr>
                <td width="115" align="right">网盘服务地址：</td>
                <td width="240"><el-input placeholder="如:http://192.168.235.132:8000" v-model="info.SERVICE_URL" clearable /></td>
            </tr>
            <tr>
                <td align="right">网盘文件地址：</td>
                <td><el-input placeholder="如:http://192.168.235.132:8082" v-model="info.FILE_SERVER_ROOT" clearable /></td>
            </tr>
            <tr>
                <td align="right">用户名：</td>
                <td><el-input placeholder="请输入网盘用户名" v-model="info.username" clearable /></td>
            </tr>
            <tr>
                <td align="right">密码：</td>
                <td><el-input placeholder="请输入网盘密码" v-model="info.password" show-password /></td>
            </tr>
            <tr>
                <td colspan="2" align="center"><el-button @click="login" type="primary" v-loading.fullscreen.lock="fullscreenLoading">登录</el-button></td>
            </tr>
        </table>
    </div>
</template>

<script>
import{request} from '../assets/js/request.js'
const {ipcRenderer:ipc} = require('electron');
const Store = require('electron-store');
const store = new Store();
export default {
    name:'seafileLogin',
    data(){
        return{
             info:{
               "SERVICE_URL": "http://192.168.43.101:8000",
               "FILE_SERVER_ROOT": "http://192.168.43.101:8082",
               "username": "admin@123.com",
               "password": "admin",
            },
            fullscreenLoading:false
        }
    },
	

	
    methods:{
        login:function(){
            if(this.info.SERVICE_URL==''){
                this.$message({
                    message:'服务地址不能为空！',
                    type:'warning'
                })
                return;
            }
            if(this.info.FILE_SERVER_ROOT==''){
                this.$message({
                    message:'文件地址不能为空！',
                    type:'warning'
                })
                return;
            }
            if(this.info.username==''){
                this.$message({
                    message:'用户名不能为空！',
                    type:'warning'
                })
                return;
            }
            if(this.info.password==''){
                this.$message({
                    message:'密码不能为空！',
                    type:'warning'
                })
                return;
            }
            this.fullscreenLoading=true;
            request('seafile','link',this.info,
                (response)=>{
					store.set("SERVICE_URL",this.info.SERVICE_URL)
                    if(response.data=="pong"){
                        request('seafile','obtainAuthToken',this.info,
                        (response)=>{
                            if(response.data.token!=null){
                                this.fullscreenLoading=false;
                                this.$store.commit('add',{type:'seafile',name:'token',value:response.data.token})
                                ipc.sendSync('createMainWindow',{type:'seafile',name:'token',value:response.data.token})
                            } else {
                                console.log('登录失败')
                            }
                        })
                    }
                })
        }
    }
}
</script>

<style>
#seafileLogin .el-input{
    padding: 5px 3px;
}
</style>
