<template>
    <div id="detailsView" @click="clearStyle">
        <ul id="detailsViewUL">
            <li>
                <div id="title">
                    <div style="width:500px;padding:6px;border-right:1px solid #ccccd6">
                        <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">文件名</el-checkbox>
                    </div>
                    <div style="width:170px;padding:6px;border-right:1px solid #ccccd6">修改时间</div>
                    <div style="width:100px;padding:6px;border-right:1px solid #ccccd6">大小</div>
                    <div style="width:auto;"></div>
                </div>
            </li>
            <el-checkbox-group v-model="selectLists" @change="handleCheckedChange">
            <li v-for="(item,index) of this.$store.state.nowAllFile" :key="index" id="detailsViewLi">
                <div class="box" v-if="item.type=='dir' || item.type=='repo'||item.directory||item.isdir==1"  @dblclick="dblclickDir(item)" @click="clickDir(index)" :id="index" @contextmenu.prevent="childRightMenu">
                    <div style="width:500px;">
                        <el-checkbox :label="index">
                            <img v-if="nowType=='baidu'" :src="icon[item.isdir]" />
                            <img v-else :src="icon[item.type]" />
                            <span v-if="nowType=='baidu'">{{item.server_filename}}</span>
                            <span v-else>{{item.name}}</span>
                        </el-checkbox>
                    </div>
                    <div v-if="nowType=='baidu'" style="width:170px;padding-left:8px">{{dateFormat('YYYY-mm-dd HH:MM',item.server_mtime)}}</div>
                    <div v-else style="width:170px;padding-left:8px">{{dateFormat('YYYY-mm-dd HH:MM',item.mtime)}}</div>
                    <div style="width:100px;padding-left:10px">
                        {{item.size?(item.size>1024?(item.size/1024>1024?(item.size/1024/1024>1024?(item.size/1024/1024/1024).toFixed(2)+'GB':(item.size/1024/1024).toFixed(2)+'MB'):(item.size/1024).toFixed(2)+'KB'):item.size+'bytes'):'-'}}
                    </div>
                    <!-- {{item.size>1024?(item.size/1024>1024?(item.size/1024/1024).toFixed(2)+'MB':(item.size/1024).toFixed(2)+'KB'):item.size+'bytes'}} -->
                </div>
                <div class="box" v-if="item.type=='file'||item.file||item.isdir==0"  @dblclick="dblclickFile(item)" @click="clickDir(index)" :id="index" @contextmenu.prevent="childRightMenu">
                    <div style="width:500px;">
                        <el-checkbox :label="index">
                            <img v-if="nowType=='baidu'" :src="icon[item.isdir]" />
                            <img v-else :src="icon[item.type]" />
                            <span v-if="nowType=='baidu'">{{item.server_filename}}</span>
                            <span v-else>{{item.name}}</span>
                        </el-checkbox>
                    </div>
                    <div v-if="nowType=='baidu'" style="width:170px;padding-left:8px">{{dateFormat('YYYY-mm-dd HH:MM',item.server_mtime)}}</div>
                    <div v-else style="width:170px;padding-left:8px">{{dateFormat('YYYY-mm-dd HH:MM',item.mtime)}}</div>
                    <div style="width:100px;padding-left:10px">
                        {{item.size?(item.size>1024?(item.size/1024>1024?(item.size/1024/1024>1024?(item.size/1024/1024/1024).toFixed(2)+'GB':(item.size/1024/1024).toFixed(2)+'MB'):(item.size/1024).toFixed(2)+'KB'):item.size+'bytes'):'-'}}
                    </div>
                </div>
            </li>
            </el-checkbox-group>
        </ul>
        <el-dialog title="属性" :visible.sync="dialogVisible" width="340px">
            <el-table :data="propertyData" style="margin-top:-40px">
                <el-table-column property="key" width="150"></el-table-column>
                <el-table-column property="value" width="150"></el-table-column>
            </el-table>
        </el-dialog>
        <el-dialog title="删除" :visible.sync="showDeleteDialog">
            <span>是否确定删除？</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showDeleteDialog=false;">取消</el-button>
                <el-button type="primary" @click="deleted">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import{request} from '../assets/js/request.js'
import axios from 'axios'
const {ipcRenderer:ipc} = require('electron');
const {shell} = require('electron')
const Store = require('electron-store');
const store = new Store();
export default {
    name:'detailsView',
    data(){
        return {
            icon:{
                dir:require('../assets/images/dir.png'),
                repo:require('../assets/images/dir.png'),
                file:require('../assets/images/file.png'),
                1:require('../assets/images/dir.png'),
                0:require('../assets/images/file.png')
            },
            selectLists:[],
            lastSelectLists:[],
            nowType:this.$store.state.nowType,
            repo_id:'',
            checkAll:false,
            isIndeterminate: false,
            dialogVisible:false,
            propertyData:[],
            showDeleteDialog:false,
            fileType:['doc','docx','ppt','pptx','js','html','css','php','xls','xlsx','png','jpg','txt']
        }
    },
    methods:{
        clickDir:function(args){
            //单击选择文件
            if(event.target.localName=='div'){
                if(this.selectLists.length>0){
                    for(var i=0,len=this.selectLists.length;i<len;i++){
                        document.getElementById(this.selectLists[i]).style='';
                    }
                }
                document.getElementById(args).style="background: rgba(195, 215, 233, 1);"
                this.selectLists=[];
                this.selectLists=[args];
                this.isIndeterminate=true;
                this.lastSelectLists=this.selectLists;
            }
        },
        clearStyle:function(e){
            //点击空白处清除选择
            if(e.target.id=='detailsView' || e.target.id=='detailsViewLi'){
                for(var i=0,len=this.selectLists.length;i<len;i++){
                    document.getElementById(this.selectLists[i]).style="";
                }
                this.selectLists=[];
                this.checkAll=false;
                this.isIndeterminate=false;
                this.lastSelectLists=[];
            }
        },
        dblclickDir:function(args){
            //双击进入文件夹
            this.$store.commit('orderBy',{orderBy:'name',order:'asc'});
            for(var i=0,len=this.selectLists.length;i<len;i++){
                document.getElementById(this.selectLists[i]).style='';
            }
            var nowPaths = this.$store.state.filePath;
            this.selectLists=[];
            this.lastSelectLists=[];
            this.checkAll=false;
            this.isIndeterminate=false;
            var path='';
            //处理百度
            if(this.$store.state.nowType=='baidu'){
                for(var nowPath of nowPaths){
                    path+=nowPath.path;
                }
                path+='/'+args.server_filename;
                request('baidu','getRecursionFileList',{path:path},response=>{
                    console.log(path);
                    this.$store.commit('changeFilePath',{type:'add',name:args.server_filename,path:'/'+args.server_filename});
                    console.log(this.$store.state.filePath);
                    this.$store.commit('setNowAllFile',response.data.list);
                    console.log(response);
                })
            }
            //处理ftp
            if(this.$store.state.nowType=='ftp'){
                for(var nowPath of nowPaths){
                    path+=nowPath.path;
                }
                path+='/'+args.name+'/';
                request('ftp','getFiles',{pathName:path},response=>{
                    this.$store.commit('changeFilePath',{type:'add',name:args.name,path:'/'+args.name});
                    this.$store.commit('setNowAllFile',response);
                    console.log(response);
                })
            }
            //处理seafile
            if(this.$store.state.nowType=='seafile'){
                if(args.type=='dir'){
                    for(var nowPath of nowPaths){
                        if(nowPath.path!='/'){
                            path=path+nowPath.path;
                        }
                    }
                    path=path+'/'+args.name;
                } else if(args.type=='repo'){
                    path='/';
                    this.repo_id=args.id;
                    this.$store.commit('setRepo_id',this.repo_id);
                }
                request(this.nowType,'listDirEntriesByP',{token:this.$store.state.nowInfo.token,repo_id:this.repo_id,path:path},(response)=>{
                    this.$store.commit('changeFilePath',{type:'add',name:args.name,path:'/'+args.name});
                    this.$store.commit('setNowAllFile',response.data.data);
                })
            }
        },
        handleCheckAllChange:function(val){
            //点击全选按钮
            var nowAllFile = this.$store.state.nowAllFile;
            if(val){
                for(var i = 0,len = nowAllFile.length;i<len;i++){
                    this.selectLists.push(i);
                    document.getElementById(i).style="background: rgba(195, 215, 233, 1);";
                }
            } else {
                for(var i=0,len=this.selectLists.length;i<len;i++){
                    document.getElementById(this.selectLists[i]).style="";
                }
                this.selectLists=[];
            }
            this.isIndeterminate=false;
            this.lastSelectLists=this.selectLists;
        },
        handleCheckedChange:function(value){
            //点击多选框选择文件
            if(this.lastSelectLists.length>this.selectLists.length){
                for(var i=0,len=this.lastSelectLists.length;i<len;i++){
                    if(this.selectLists.indexOf(this.lastSelectLists[i])<0){
                        document.getElementById(this.lastSelectLists[i]).style="";
                    }
                }
            } else {
                for(var i=0,len=value.length;i<len;i++){
                    document.getElementById(value[i]).style="background: rgba(195, 215, 233, 1);";
                }
            }
            let checkedCount = value.length;
            this.checkAll=checkedCount===this.$store.state.nowAllFile.length;
            this.isIndeterminate=checkedCount > 0 && checkedCount < this.$store.state.nowAllFile.length;
            this.lastSelectLists=this.selectLists;
        },
        openDir:function(){
            //在菜单中点击打开文件夹
            var args = this.$store.state.nowAllFile[this.selectLists[0]];
            console.log(args);
            this.dblclickDir(args);
        },
        rename:function(){
            //对文件或文件夹进行重命名
            var nowAllFile = this.$store.state.nowAllFile;
            var nowPaths = this.$store.state.filePath;
            var nowPath='';
            var _this = this;
            var url='';
            var path='';
            for(var i=0,len=nowPaths.length;i<len;i++){
                if(nowPaths[i].path!="/"){
                    nowPath+=nowPaths[i].path;
                }
            }
            this.$prompt('请输入新文件名','文件重命名',{
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputValue:nowAllFile[_this.selectLists[0]].name||nowAllFile[_this.selectLists[0]].server_filename
            }).then(({value})=>{
                //处理百度
                if(_this.$store.state.nowType=='baidu'){
                    path=nowPath;
                    var oldName='/'+nowAllFile[_this.selectLists[0]].server_filename;
                    request('baidu','fileRename',{path:path+oldName,newname:value},response=>{
                        this.refresh();
                    })
                }
                //处理ftp
                if(_this.$store.state.nowType=='ftp'){
                    if(nowPath==''){
                        path='/';
                    } else {
                        path=nowPath;
                    }
                    if(path!='/'){
                        path+='/';
                    }
                    var oldName = nowAllFile[_this.selectLists[0]].name;
                    request('ftp','rename',{oldPath:path+oldName,newPath:path+value},response=>{
                        if(response=='success'){
                            this.refresh();
                        }
                    })
                }
                //处理seafile
                if(_this.$store.state.nowType=='seafile'){
                    path=nowPath+'/'+nowAllFile[this.selectLists[0]].name;
                    if(nowAllFile[_this.selectLists[0]].type=='dir'){
                        url='renameDir'
                    } else if(nowAllFile[_this.selectLists[0]].type=='repo'){
                        url='renameRepo'
                    } else {
                        url="renameFile"
                    }
                    if(url=="renameRepo"){
                        request(_this.nowType,url,{token:_this.$store.state.nowInfo.token,repo_id:nowAllFile[_this.selectLists[0]].id,newName:value},response=>{
                            request(_this.nowType,'listLibraries',{token:_this.$store.state.nowInfo.token},response=>{
                                _this.$store.commit('setNowAllFile',response.data.data);
                            })
                        })
                        return;
                    }
                    request(_this.nowType,url,{token:_this.$store.state.nowInfo.token,repo_id:_this.repo_id,p:path,newName:value},response=>{
                        if(nowPath==''){
                            nowPath='/';
                        }
                        request(_this.nowType,'listDirEntriesByP',{token:this.$store.state.nowInfo.token,repo_id:this.repo_id,p:nowPath},(response)=>{
                            _this.$store.commit('setNowAllFile',response.data.data);
                        })
                    })
                }
            });
        },
        copyOrCut:function(type){
            //复制或剪切文件
            var nowAllFile = this.$store.state.nowAllFile;
            var nowPaths = this.$store.state.filePath;
            var nowPath='';
            var paths=[];
            var _this = this;
            //处理百度
            if(this.$store.state.nowType=='baidu'){
                for(var i=0; i < nowPaths.length; i++){
                    nowPath+=nowPaths[i].path;
                }
                for(var i=0; i<this.selectLists.length; i++){
                    var info={
                        path:nowPath,
                        name:nowAllFile[this.selectLists[i]].server_filename
                    }
                    paths.push(info);
                }
                this.$store.commit('setCopyOrCut',{repo_id:'',copyPath:paths,copyOrCut:type});
            }
            //处理ftp
            if(this.$store.state.nowType=='ftp'){
                for(var i=0; i<nowPaths.length; i++){
                    nowPath+=nowPaths[i].path;
                }
                var path;
                if(nowPath!=''){
                    path=nowPath+'/';
                } else {
                    path='/';
                }
                for(var i=0; i<this.selectLists.length; i++){
                    var info={
                        path:path,
                        name:nowAllFile[this.selectLists[i]].name
                    }
                    paths.push(info);
                }
                this.$store.commit('setCopyOrCut',{repo_id:'',copyPath:paths,copyOrCut:type});
            }
            //处理seafile
            if(this.$store.state.nowType=='seafile'){
                if(nowAllFile[this.selectLists[0]].type=='repo'){
                    var msg="复制"
                    if(type=="cut"){
                        msg='剪切';
                    }
                    this.$message({
                        message:"此文件夹不可被"+msg,
                        type:'warning'
                    })
                    return;
                }
                for(var i=0,len=nowPaths.length;i<len;i++){
                    if(nowPaths[i].path!='/'){
                        nowPath+=nowPaths[i].path;
                    }
                }
                for(var i=0,len=this.selectLists.length;i<len;i++){
                    var path=nowPath+'/'+nowAllFile[this.selectLists[i]].name;
                    paths.push(path);
                }
                this.$store.commit('setCopyOrCut',{repo_id:this.$store.state.repo_id,copyPath:paths,copyOrCut:type});
            }
        },
        showProperty:function(){
            //显示文件的属性
            var item=this.$store.state.nowAllFile[this.selectLists[0]];
            this.dialogVisible = true;
            var type;
            if(item.type=="repo"){
                type="资料库";
            } else if(item.type=="dir" || item.directory || item.isdir==1){
                type="文件夹";
            } else if(item.type=="file" || item.file || item.isdir==0){
                type="文件";
            }
            var size = item.size?(item.size>1024?(item.size/1024>1024?(item.size/1024/1024>1024?(item.size/1024/1024/1024).toFixed(2)+'GB':(item.size/1024/1024).toFixed(2)+'MB'):(item.size/1024).toFixed(2)+'KB'):item.size+'bytes'):'-';
            var time;
            if(this.$store.state.nowType=='baidu'){
                time = this.dateFormat('YYYY-mm-dd HH:MM',item.server_mtime);
            } else {
                time = this.dateFormat('YYYY-mm-dd HH:MM',item.mtime);
            }
            this.propertyData=[
                {key:"名称：",value:item.name||item.server_filename},
                {key:"类型：",value:type},
                {key:"大小：",value:size},
                {key:"创建时间：",value:time}
            ]
        },
        refresh:function(){
            //刷新页面
            var nowPaths = this.$store.state.filePath;
            var nowInfo = this.$store.state.nowInfo;
            var path='';
            //处理百度
            if(this.$store.state.nowType=='baidu'){
                console.log('baidu')
                if(nowPaths.length==0){
                    path='/';
                } else {
                    for(var nowPath of nowPaths){
                        path+=nowPath.path;
                    }
                }
                request('baidu','getRecursionFileList',{path:path},response=>{
                    this.$store.commit('setNowAllFile',response.data.list);
                    console.log(response)
                })
            }
            //处理ftp
            if(this.$store.state.nowType=='ftp'){
                if(nowPaths.length==0){
                    path='/';
                } else {
                    for(var nowPath of nowPaths){
                        path+=nowPath.path;
                    }
                    path+='/';
                }
                request('ftp','getFiles',{pathName:path},response=>{
                    this.$store.commit('setNowAllFile',response);
                })
            }
            //处理seafile
            if(this.$store.state.nowType=='seafile'){
                if(nowPaths.length==0){
                    request(this.$store.state.nowType,'listLibraries',{token:nowInfo.token},(response)=>{
                        this.$store.commit('setNowAllFile',response.data.data);
                    })
                } else {
                    var path='';
                    for(var nowPath of nowPaths){
                        path=path+nowPath.path;
                    }
                    request(this.$store.state.nowType,'listDirEntriesByP',{token:this.$store.state.nowInfo.token,repo_id:this.$store.state.repo_id,path:path},(response)=>{
                        this.$store.commit('setNowAllFile',response.data.data);
                    })
                }
            }
        },
        deleted:function(){
            //实现文件的删除
            this.showDeleteDialog=false;
            var nowInfo = this.$store.state.nowInfo;
            var nowAllFile = this.$store.state.nowAllFile;
            var _this = this;
            var nowPath = this.$store.state.filePath;
            var path = '';
            var url = '';
            for(var i=0,len=nowPath.length;i<len;i++){
                if(nowPath[i].path!='/'){
                    path+=nowPath[i].path;
                }
            }
            //处理百度
            if(this.$store.state.nowType=='baidu'){
                for(var i=this.selectLists.length-1;i>=0;i--){
                    var dpath=path;
                    dpath=dpath+'/'+nowAllFile[this.selectLists[i]].server_filename;
                    console.log(dpath);
                    request('baidu','fileDelete',{path:dpath},response=>{
                        if(response.status==200){
                            if(i==-1){
                                this.refresh();
                            }
                        }
                    })
                }
            }
            //处理ftp
            if(this.$store.state.nowType=='ftp'){
                if(path==''){
                    path='/';
                }
                for(var i =0; i <this.selectLists.length; i++){
                    if(path=='/'){
                        path+=nowAllFile[this.selectLists[i]].name;
                    } else {
                        path+='/'+nowAllFile[this.selectLists[i]].name;
                    }
                    if(nowAllFile[this.selectLists[i]].directory){
                        request('ftp','deleteDir',{path:path},response=>{
                            if(response=='success'){
                                this.refresh();
                            }
                        })
                    }
                    if(nowAllFile[this.selectLists[i]].file){
                        request('ftp','deleteFile',{path:path},response=>{
                            if(response=='success'){
                                this.refresh();
                            }
                        })
                    }
                }
            }
            //处理seafile
            if(this.$store.state.nowType=='seafile'){
                if(nowAllFile[this.selectLists[0]].type=='repo'){
                    url="deleteLibrary";
                } else if(nowAllFile[this.selectLists[0]].type=="dir"){
                    url="deleteDir";
                } else {
                    url="deleteFile";
                }
                var index=0;
                if(url=="deleteLibrary"){
                    for(var i=0;i<this.selectLists.length;i++){
                        index++;
                        request(this.nowType,url,{token:nowInfo.token,repo_id:nowAllFile[this.selectLists[i]].id},(response)=>{
                            if(index==this.selectLists.length){
                                this.refresh();
                            }
                        })
                    }
                } else {
                    var p=''
                    var i=0;
                    for(var i=0;i<this.selectLists.length;i++){
                        index++;
                        p=path+'/'+nowAllFile[this.selectLists[i]].name;
                        request(this.nowType,url,{token:nowInfo.token,repo_id:this.$store.state.repo_id,p:p},(response)=>{
                            if(index==this.selectLists.length){
                                this.refresh();
                            }
                        })
                    }
                }
            }
        },
        download:function(){
            //文件下载
            var _this = this;
            var nowAllFile = this.$store.state.nowAllFile;
            var nowPaths = this.$store.state.filePath;
            var path='';
            for(var nowPath of nowPaths){
                path+=nowPath.path;
            }
            path+='/';
            if(_this.$store.state.nowType=='ftp'){
				for(var i=0; i<this.selectLists.length; i++){
				    path+=nowAllFile[this.selectLists[0]].name;
				    if(nowAllFile[this.selectLists[0]].file){
				        request('ftp','download',{path:path,type:'file'},response=>{
				            this.$message({
				                message:response
				            })
				        });
				    } else {
				        request('ftp','download',{path:path,type:'dir'},response=>{
				            this.$message({
				                message:response
				            })
				        })
				    }
				}
			}else if(_this.$store.state.nowType=='seafile'){
				var nowPath = '';
				var _this = this;
				var url = '';
				var path = '';
				for (var i = 0, len = nowPaths.length; i < len; i++) {
					if (nowPaths[i].path != "/") {
						nowPath += nowPaths[i].path;
					}
				}
				console.log(nowAllFile[this.selectLists[0]])
				for(let i = 0 ; i < this.selectLists.length ; i ++){
					path = nowPath + '/' + nowAllFile[this.selectLists[i]].name;
					request(_this.nowType, 'downLoadFile', {
						url: storage.getItem("SERVICE_URL"),
						token: this.$store.state.nowInfo.token,
						repo_id: this.repo_id,
						p: path,
						reuse_Temp: "",
					}, (response) => {
						ipc.send('download',response.data);
					})
				}
			} 
        },
        dateFormat:function(fmt,date){
            //格式化时间
            if(this.$store.state.nowType=='baidu'||this.$store.state.nowType=='seafile'){
                var date1=new Date(date*1000);
                var Y = date1.getFullYear()+'-';
                var M = (date1.getMonth()+1<10?'0'+(date1.getMonth()+1):date1.getMonth()+1)+'-';
                var D = (date1.getDate()<10?'0'+(date1.getDate()):date1.getDate())+' ';
                var h = (date1.getHours()<10?'0'+(date1.getHours()):date1.getHours())+":";
                var m = (date1.getMinutes()<10?'0'+(date1.getMinutes()):date1.getMinutes());
                return Y+M+D+h+m;
            } else {
                let ret;
                const opt = {
                    "Y+": date.getFullYear().toString(),
                    "m+": (date.getMonth() + 1).toString(),
                    "d+": date.getDate().toString(),
                    "H+": date.getHours().toString(),
                    "M+": date.getMinutes().toString(),
                    "S+": date.getSeconds().toString()
                };
                for (let k in opt) {
                    ret = new RegExp("(" + k + ")").exec(fmt);
                    if (ret) {
                        fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
                    };
                };
                return fmt;
            } 
        },
        dblclickFile:function(item){
            //下载并打开文件
            var _this = this;
            var nowAllFile = this.$store.state.nowAllFile;
            var nowPaths = this.$store.state.filePath;
            var path='';
            for(var nowPath of nowPaths){
                path+=nowPath.path;
            }
            path+='/';
			if(_this.$store.state.nowType=='ftp'){
               path+=item.name;
                var kz = item.name.split('.').pop();
                console.log(kz);
                console.log(this.fileType.indexOf(kz));
                if(this.fileType.indexOf(kz)!=-1){
                    request('ftp','download',{path:path,type:'file',downType:'open'},response=>{
                        var path=store.get('downloadPath');
                        ipc.send('downloadPath',path);
                        var localPath=path+'\\openUpload\\'+item.name;
                        shell.openItem(localPath);
                    });
                } else {
                    this.$message({
                        message:'该类型暂不能打开'
                    })
                }
			}else if(_this.$store.state.nowType=='seafile'){
				var nowPath = '';
				var _this = this;
				var url = '';
				var path = '';
				for (var i = 0, len = nowPaths.length; i < len; i++) {
					if (nowPaths[i].path != "/") {
						nowPath += nowPaths[i].path;
					}
                }
                path = nowPath + '/' + item.name;
                request(_this.nowType, 'downLoadFile', {
                    url: store.get("SERVICE_URL"),
                    token: this.$store.state.nowInfo.token,
                    repo_id: this.repo_id,
                    p: path,
                    reuse_Temp: "",
                }, (response) => {
                    ipc.send('download',response.data);
                    console.log(response);
                })
			} 
        },
        childRightMenu:function(event){
            //鼠标右键
            (event.target.id=='detailsView'||event.target.id=='simpleView'||event.target.id=='detailsViewLi')||this.selectLists.length==0?'':this.$contextmenu({
                items:[
                    {
                        label:"打开",
                        disabled:this.selectLists.length>1?true:false,
                        onClick:()=>{
                            if(this.$store.state.nowAllFile[this.selectLists[0]].type=='file'||this.$store.state.nowAllFile[this.selectLists[0]].type=='0'){
                                this.dblclickFile(this.$store.state.nowAllFile[this.selectLists[0]]);
                            }
                            if(this.$store.state.nowAllFile[this.selectLists[0]].type=="dir"||this.$store.state.nowAllFile[this.selectLists[0]].type=="repo"||this.$store.state.nowAllFile[this.selectLists[0]].type=='1'){
                                this.openDir();
                            }
                        }
                    },
                    {
                        label:"下载",
                        divided:true,
                        icon:"el-icon-download",
                        onClick:()=>{
                            this.download();
                        }
                    },
                    {
                        label:"复制",
                        icon:"el-icon-document-copy",
                        onClick:()=>{
                            this.copyOrCut('copy');
                        }
                    },
                    {
                        label:"剪切",
                        icon:"el-icon-scissors",
                        onClick:()=>{
                            this.copyOrCut('cut');
                        }
                    },
                    {
                        label:"删除",
                        divided:true,
                        icon:"el-icon-delete",
                        onClick:()=>{
                            this.showDeleteDialog=true;
                        }
                    },
                    {
                        label:"重命名",
                        disabled:this.selectLists.length>1?true:false,
                        onClick:()=>{
                            this.rename();
                        }
                    },
                    {
                        label:"属性",
                        disabled:this.selectLists.length>1?true:false,
                        onClick:()=>{
                            this.showProperty();
                        }
                    }
                ],
                event,
                customClass:"class-boxMenu",
                zIndex:3
            });
            return false;
        }
    },
    computed:{
        allFiles(){
            return this.$store.state.nowAllFile
        }
    },
    watch:{
        allFiles:function(a,b){
            for(var i=0,len=this.selectLists.length;i<len;i++){
                document.getElementById(this.selectLists[i]).style="";
            }
            this.selectLists=[];
            this.checkAll=false;
            this.isIndeterminate=false;
            this.lastSelectLists=[];
        }
    }
}
</script>
<style>
#detailsView{
    width: 100%;
    height: 100%;
    text-align: left;
    -webkit-user-select: none;
    font-family: "Microsoft YaHei"
}
#detailsView ul{
    list-style: none;
    margin: 0;
    padding: 0;
}
#detailsView ul div{
    box-sizing: border-box;
}
#detailsView #title{
    display: flex;
    font-size: 12px;
    border-bottom: 1px solid #ccccd6;
}
#detailsView input{
    vertical-align: top;
}
#detailsView .box{
    font-size: 13px;
    display: flex;
    padding: 10px 6px;
    margin-bottom: 2px;
    width: 770px;
    border: 1px solid white;
    box-sizing: border-box;
    transition: .3s all;
}
#detailsView .box:hover{
    background: rgba(195,215,233, .6);
}
#detailsView .box input{
    vertical-align: middle;
    margin-right: 5px;
}
#detailsView .box img{
    width: 25px;
    height: 25px;
    vertical-align: middle;
    margin-right: 10px;
}
</style>