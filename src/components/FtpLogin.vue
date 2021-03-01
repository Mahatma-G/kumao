<template>
    <div id="ftpLogin">
        <table align="center">
            <tr>
                <td width="115" align="right">IP地址：</td>
                <td width="240"><el-input placeholder="如:192.168.235.132" v-model="info.ip" clearable /></td>
            </tr>
            <tr>
                <td align="right">端口号：</td>
                <td><el-input placeholder="默认端口号为21" v-model="info.port" clearable /></td>
            </tr>
            <tr>
                <td align="right">用户名：</td>
                <td><el-input v-model="info.userName" clearable /></td>
            </tr>
            <tr>
                <td align="right">密码：</td>
                <td><el-input v-model="info.password" show-password /></td>
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
    name:'ftpLogin',
    data(){
        return{
            info:{
                ip:'192.168.43.101',
                port:'',
                userName:'root',
                password:'root'
            },
            fullscreenLoading:false
        }
    },
    methods:{
        login:function(){
            if(this.info.ip==''){
                this.$message({
                    message:'IP地址不能为空！',
                    type:'warning'
                })
                return;
            }
            if(this.info.userName==''){
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
            if(this.info.port==''){
                this.info.port='21';
            }
            
            request('ftp','connect',this.info,response=>{
                this.fullscreenLoading=false;
                if(response=='success'){
                    store.set('nowLoginInfo',JSON.stringify(this.info));
                    ipc.sendSync('createMainWindow',{type:'ftp',name:'userName',value:this.info.ip});
                } else {
                    this.$message({
                        message:'登录失败，请检查输入信息是否正确！',
                        type:'error'
                    });
                }
            })
        }
    }
}
</script>
<style>
#ftpLogin .el-input{
    padding: 5px 3px;
}
</style>
