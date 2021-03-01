<template>
    <div id="mainTitle">
        <el-container>
            <el-header class="title" style="height:40px">
                <el-row type="flex" justify="space-between">
                    <el-col class="title" :span="10">酷猫云盘</el-col>
                    <el-col class="btn" :span="5">
                        <el-button @click="min" class="min" icon="el-icon-minus" size="mini" type="text" circle></el-button>
                        <el-button @click="max" class="max" icon="el-icon-copy-document" size="mini" type="text" circle></el-button>
                        <el-button @click="close" class="close" icon="el-icon-close" size="mini" type="text" circle></el-button>
                    </el-col>
                </el-row>
            </el-header>
            <el-main>
                <el-container>
                    <el-aside class="aside" :style="{height:this.$store.state.windowHeight-2+'px'}" style="width:200px">
                        <p class="asideTitle">{{this.$store.state.type[this.nowType]['name']}}</p>
                        <ul>
                            <li @click="allFile" id="allFile" style="background:#5698c3;color:white;">全部文件</li>
                            <li @click="change" id="change">切换网盘</li>
							<li id="download"> <router-link style="color: #000000; text-decoration: none;" :to="{name:'download'}">文件下载</router-link></li>
                            <li @click="userSet" id="userSet">设置</li>
                        </ul>
                        <div id="capacityBox">
                            <!-- <div id="capacity">
                                <div id="alreadyUse" :style="{width:1230/2048*170+'px'}"></div>
                            </div>
                            <div id="capacityText">1230G/2048G</div> -->
                        </div>
                    </el-aside>
                    <el-main>
                        <el-container>
                            <el-header style="background:#F9FAFB;height:40px;border-bottom:1px solid #ccccd6;">
                                <div class="path">
                                    <span @click="toHomeDir">我的网盘 > </span>
                                    <span v-for="(value,index) in this.$store.state.filePath" @click="changePath(index)" :key="index">{{value.name}} > </span>
                                </div>
                                <div class="info">
                                    <img v-if="this.$store.state.nowType=='seafile'" :src="this.typeInfo.userInfo.avatar_url" />
                                    <span v-if="this.$store.state.nowtype=='seafile'">&nbsp;{{this.typeInfo.userInfo.email}}</span>
                                    <span v-if="this.$store.state.nowType=='ftp'" style="line-height:30px">{{ftpIp}}</span>
                                </div>
                            </el-header>
                            <el-main style="background:white">
                                <router-view />
                            </el-main>
                        </el-container>
                    </el-main>
                </el-container>
            </el-main>
        </el-container>
        <el-dialog style="text-align:left;user-select:none;width:1100px" title="设置" :visible.sync="showSetDialog">
            <div style="height:400px;margin:-30px -18px -25px -18px">
                <el-scrollbar :native="false" style="height:100%;width:100%" wrap-style="overflow-x:hidden;margin-bottom:0px">
                    <div style="height:auto;padding:0px 30px">
                        <div>
                            <h3>自动备份</h3>
                            <div style="padding:0px 10px;line-height:30px">
                                自动备份网盘：&nbsp;&nbsp;&nbsp; <span>FTP 192.168.235.132</span>
                                <div style="margin-left:100px"><el-button size="middle" type="text">切换网盘</el-button></div>
                                自动备份路径：&nbsp;&nbsp;&nbsp; <span id="backupPath" style="user-select:text">{{backupPath}}</span>
                                <div style="margin-left:100px"><el-button @click="changeDirPath('backup')" type="text">切换路径</el-button> <el-button @click="copyPath('backup')" type="text">复制路径</el-button></div>
                            </div>
                        </div>
                        <div>
                            <h3>下载</h3>
                            <div style="padding:0px 10px">
                                下载路径：&nbsp;&nbsp;&nbsp; <span id="downloadPath" style="user-select:text">{{downloadPath}}</span>
                                <div style="margin-left:70px"><el-button @click="changeDirPath('download')" type="text">切换路径</el-button> <el-button @click="copyPath('download')" type="text">复制路径</el-button></div>
                            </div>
                        </div>
                        <div>
                            <h3>账号</h3>
                            <div style="padding:0px 10px">
                                当前登录：
                            </div>
                        </div>
                    </div>
                </el-scrollbar>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import{request} from '../assets/js/request.js'
const {ipcRenderer:ipc,remote,dialog} = require('electron');
const clipboard = require('electron').clipboard;
const Store = require('electron-store');
const store = new Store();
export default {
    name:"mainTitle",
    data(){
        return{
            height:10,
            typeInfo:'',
            nowType:'',
            lastId:'allFile',
            nowInfo:'',
            ftpIp:store.get('ip'),
            showSetDialog:false,
            backupPath:store.get('backupPath'),
            downloadPath:store.get('downloadPath')
        }
    },
    methods:{
        copyPath:function(type){
            //复制文件路径
            var text='';
            if(type=='backup'){
                text=document.getElementById('backupPath').innerText;
            }
            if(type=='download'){
                text=document.getElementById('downloadPath').innerText;
            }
            clipboard.writeText(text);
            this.$message({
                message:'复制成功',
                type:'success'
            })
        },
        changeDirPath:function(type){
            //修改备份和保存的路径
            remote.dialog.showOpenDialog({
                properties:['openDirectory']
            },function(files){
                if(files.length>0){
                    console.log(files);
                    if(type=='backup'){
                        document.getElementById('backupPath').innerText=files[0];
                        store.set('backupPath',files[0]);
                    }
                    if(type=='download'){
                        document.getElementById('downloadPath').innerText=files[0];
                        store.set('downloadPath',files[0]);
                    }
                }
            })
        },
        min:function(){
            ipc.send('min');
        },
        close:function(){
            ipc.send('close');
        },
        max:function(){
            ipc.send('max');
        },
        getTypeInfo:function(){
            this.typeInfo=this.$store.state.nowInfo;
        },
        allFile:function(e){
            document.getElementById(this.lastId).style="";
            this.lastId='allFile';
            e.target.style="background:#5698c3;color:white;"
			this.$router.push("/mainTitle/")
        },
        upload:function(e){
            if(this.$store.state.nowType=='seafile'){
                this.file = document.getElementById("getFile")
				this.file.click()
            } else {
                var nowPaths = this.$store.state.nowPaths;
                ipc.send('open-directory-dialog','openFile');
                ipc.once('selectedItem',this.getPath);
            }
        },
        getPath:function(e,chooseFilePath){
            var nowPaths = this.$store.state.filePath;
            var path='';
            for(var nowPath of nowPaths){
                path+=nowPath.path;
            }
            //处理百度
            if(this.$store.state.nowType=='baidu'){
                this.$store.commit('uploadByBaidu',{path:path,chooseFilePath:chooseFilePath});
            }
            //处理ftp
            if(this.$store.state.nowType=='ftp'){
                if(path==''){
                    path='/';
                }
                request('ftp','upload',{localPath:chooseFilePath,toPath:path},response=>{
                    console.log(response);
                })
            }
        },
        change:function(e){
            // document.getElementById(this.lastId).style="";
            // this.lastId='change';
            // e.target.style="background:#5698c3;color:white;"
            ipc.send('changeUser');
        },
        userSet:function(e){
            // ipc.send('openSetWindow');
            this.showSetDialog=true;
        },
        toHomeDir:function(){
			console.log("ss")
            this.$store.commit('orderBy',{orderBy:'name',order:'asc'});
            //处理百度
            if(this.$store.state.nowType=='baidu'){
				console.log("a")
                request('baidu','getfileList',{path:'/'},response=>{
                    this.$store.commit('setNowAllFile',response.data.list);
                    this.$store.commit('changeFilePath',{type:'deleteAll'});
                    console.log(response.data.list);
                })
            }
            //处理ftp
            if(this.$store.state.nowType=='ftp'){
                request('ftp','getFiles',{pathName:'/'},response=>{
                    this.$store.commit('setNowAllFile',response);
                    this.$store.commit('changeFilePath',{type:'deleteAll'});
                })
            }
            //处理seafile
            if(this.$store.state.nowType=='seafile'){
                request(this.nowInfo.type,'listLibraries',{url:store.get("SERVICE_URL"),token:this.nowInfo.value},(response)=>{
            		this.$store.commit('setNowAllFile',response.data);
                    this.$store.commit('changeFilePath',{type:'deleteAll'});
                })
            }
        },
		
        changePath:function(index){
            this.$store.commit('orderBy',{orderBy:'name',order:'asc'});
            var allPath=this.$store.state.filePath;
            var i = 0;
            var path = '';
            while(i <= index){
                path=path+allPath[i].path;
                i++;
            }
            //处理百度
            if(this.$store.state.nowType=='baidu'){
                request('baidu','getfileList',{path:path},response=>{
                    this.$store.commit('setNowAllFile',response.data.list);
                    this.$store.commit('changeFilePath',{type:'delete',index:index+1});
                    console.log(response.data.list);
                })
            }
            //处理ftp
            if(this.$store.state.nowType=='ftp'){
                path=path+'/';
                request('ftp','getFiles',{pathName:path},response=>{
                    this.$store.commit('changeFilePath',{type:'delete',index:index+1});
                    this.$store.commit('setNowAllFile',response);
                })
            }
			 //处理seafile
            if(this.$store.state.nowType=='seafile'){
                request(this.nowType,'listDirEntriesByP',{url:store.get("SERVICE_URL"),token:this.$store.state.nowInfo.token,repo_id:this.$store.state.repo_id,path:path},(response)=>{
                    this.$store.commit('changeFilePath',{type:'delete',index:index+1});
                    this.$store.commit('setNowAllFile',response.data);
                })
            }
        }
    },
    mounted(){
        window.onload=()=>{
            var downloadPath=store.get('downloadPath');
            if(downloadPath==''){
                store.set('downloadPath','f:/fsp');
            }
            this.$store.commit('updateWindowHeight',document.body.clientHeight);
            ipc.send('getLoginInfo');
            ipc.on('AgetLoginInfo',(event,args)=>{
                this.nowType=args.type;
                this.nowInfo=args;
                this.$store.commit('add',args);
                //处理ftp
                if(args.type=='ftp'){
                    store.set('ip',args.value);
                    request('ftp','getFiles',{pathName:'/'},response=>{
                        this.$store.commit('setNowAllFile',response);
                    })
                }
                //处理seafile
                if(args.type=='seafile'){
                    //获取用户信息
                    request(args.type,'checkAccountInfo',{url:store.get("SERVICE_URL"),token:args.value},(response)=>{
                        this.$store.commit('add',{type:'seafile',name:'userInfo',value:response.data});
                        this.getTypeInfo();
                    });
                    //获取根路径文件
                    request(args.type,'listLibraries',{url:store.get("SERVICE_URL"),token:args.value},(response)=>{
                        this.$store.commit('setNowAllFile',response.data);
                    })
                }
                //处理百度
                if(args.type=='baidu'){
                    request('baidu','getfileList',{path:'/'},response=>{
                        this.$store.commit('setNowAllFile',response.data.list);
                        console.log(response.data.list);
                    })
                }
            })
        }
        window.onresize=()=>{
            this.$store.commit('updateWindowHeight',document.body.clientHeight);
        }
    }
}
</script>

<style>
#mainTitle .title{
    height: 40px;
    background: #EEF0F6;
    -webkit-app-region: drag;
    -webkit-user-select: none;
}
#mainTitle .title .el-row .title{
    line-height: 40px;
    font-size: 1.3em;
    text-align: left;
    padding-left: 20px;
}
#mainTitle .title .el-row .btn{
    text-align: right;
}
#mainTitle .title .el-row .btn .el-button{
    -webkit-app-region: no-drag;
    cursor: default;
    margin-top: 5px;
    transition: .5s;
    font-size: 1em;
}
#mainTitle .title .el-row .btn .close:hover{
    background: #c02c38;
    transform: rotate(180deg);
    color: white;
}
#mainTitle .title .el-row .btn .min:hover,#mainTitle .el-header .el-row .btn .max:hover{
    background: #5e7987;
    color: white;
    transform: rotate(180deg);
}
#mainTitle .el-main{
    padding:0
}
#mainTitle .aside{
    background:rgb(249, 250, 251);
    height:500px;
    border-right:1px solid #ccccd6;
    position: relative;
    -webkit-user-select: none;
}
#mainTitle .aside .asideTitle{
    font-size: 1.2em;
    color: black;
    margin: 10px 0;
}
#mainTitle .aside ul{
    list-style: none;
    padding:0;
}
#mainTitle .aside li{
    width: 100%;
    height: 50px;
    line-height: 50px;
    font-size: 0.9em;
}
#mainTitle .aside li:hover{
    background: #8fb2c9;
    color: white;
}
#mainTitle .aside li:active{
    background: #5698c3;
    color: white;
}
#mainTitle .aside #capacityBox{
    position: absolute;
    bottom: 10px;
    padding: 0 14px;
}
#mainTitle .aside #capacity{
    width: 170px;
    height: 10px;
    background: #ccccd6;
}
#mainTitle .aside #alreadyUse{
    height: 10px;
    background: #c04851;
}
#mainTitle .aside #capacityText{
    font-size: 0.8em;
    margin-top: 10px;
}
#mainTitle .path{
    float: left;
    font-size: 12px;
    padding:10px 0;
}
#mainTitle .path span:hover{
    cursor: pointer;
    color: #5698c3;
}
#mainTitle .info{
    float: right;
    padding:7px;
    font-size: 0.8em;
}
#mainTitle .info img{
    width: 26px;
    height: 26px;
    border-radius: 50%;
    vertical-align: middle;
}
#mainTitle .beiFen{
    display: inline-block;
    width: 300px;
    border: 1px solid blue;
}
</style>