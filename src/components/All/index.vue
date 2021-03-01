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
						<p class="asideTitle">多网盘模式</p>
						<ul>
							<li id="allFile" style="background:#5698c3;color:white;">全部文件</li>
							<li @click="change" id="change">切换网盘</li>
							<li id="userSet">设置</li>
						</ul>
						<div id="capacityBox">
							<!-- <div id="capacity"> -->
								<!-- <div id="alreadyUse" :style="{width:1230/2048*170+'px'}"></div> -->
							<!-- </div> -->
							<!-- <div id="capacityText">1230G/2048G</div> -->
						</div>
					</el-aside>
					<el-main>
						<el-container>
							<el-header style="background:#F9FAFB;height:40px;border-bottom:1px solid #ccccd6;">
								<div class="path">
									<span @click="toHomeDir">我的网盘 > </span>
									<span v-for="(value,index) in this.$store.state.filePath" @click="changePath(index)" :key="index">{{value.name}} > </span>
								</div>
								<div class="info"></div>
							</el-header>
							<el-main style="background:white">
								<router-view />
							</el-main>
						</el-container>
					</el-main>
				</el-container>
			</el-main>
		</el-container>
		<el-dialog style="text-align:left;user-select:none;width:1100px" title="设置">
			<div style="height:400px;margin:-30px -18px -25px -18px">
				<el-scrollbar :native="false" style="height:100%;width:100%" wrap-style="overflow-x:hidden;margin-bottom:0px">
					<div style="height:auto;padding:0px 30px">
						<div>
							<h3>自动备份</h3>
							<div style="padding:0px 10px;line-height:30px">
								自动备份网盘：&nbsp;&nbsp;&nbsp; <span>FTP 192.168.235.132</span>
								<div style="margin-left:100px">
									<el-button size="middle" type="text">切换网盘</el-button>
								</div>
								自动备份路径：&nbsp;&nbsp;&nbsp; <span id="backupPath" style="user-select:text"><!-- {{backupPath}} --></span>
								<div style="margin-left:100px">
									<el-button @click="changeDirPath('backup')" type="text">切换路径</el-button>
									<el-button @click="copyPath('backup')" type="text">复制路径</el-button>
								</div>
							</div>
						</div>
						<div>
							<h3>下载</h3>
							<div style="padding:0px 10px">
								下载路径：&nbsp;&nbsp;&nbsp; <span id="downloadPath" style="user-select:text"><!-- {{downloadPath}} --></span>
								<div style="margin-left:70px">
									<el-button @click="changeDirPath('download')" type="text">切换路径</el-button>
									<el-button @click="copyPath('download')" type="text">复制路径</el-button>
								</div>
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
</template>

<script>
	const {ipcRenderer: ipc} = require('electron');
	import{request} from '../../assets/js/request.js'
	const Store = require('electron-store');
	const store = new Store();
	export default {
		data() {
			return {

			};
		},

		created() {
			this.$store.commit('updateWindowHeight', document.body.clientHeight);
			ipc.send('getLoginInfo');
			ipc.on('AgetLoginInfo', (event, args) => {
				console.log(args.value)
				var files = []
				for (var item in args.value) {
					var file = {
						type: 'dir',
						name: item
					}
					if(item == 'ftp'){
						request("ftp","link",{type:1,data:args.value.ftp},function(response){
							console.log(response)
						})
					}
					files.push(file)
				}
				this.$store.state.nd.file = args.value //保存各个网盘信息
				this.$store.state.nd.isEnter = false //判断是否进入某个网盘
				this.$store.state.nd.type = "all"
				this.$store.commit('setNowAllFile', files);
			})

		},
		
		

		methods: {
			min: function() {
				ipc.send('min');
			},
			close: function() {
				ipc.send('close');
			},
			max: function() {
				ipc.send('max');
			},
			toHomeDir:function(){
				var files = []
				for (var item in this.$store.state.nd.file) {
					var file = {
						type: 'dir',
						name: item,
						server_filename:item
					}
					files.push(file)
				}
				this.$store.commit('setNowAllFile', files);
				this.$store.state.nd.isEnter = false
				this.$store.commit('add',{type:'',name:'',value:""})
				this.$store.commit('changeFilePath',{type:'deleteAll'});
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
				console.log(this.$store.state.nowType);
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
					if(allPath.length>1){
						i=1;
						while(i <= index){
							path=path+allPath[i].path;
							i++;
						}
					}
					if(path=="/"){
						request('seafile','listLibraries',{url:store.get("SERVICE_URL"),token:this.$store.state.nowInfo.token},(response)=>{
							this.$store.commit('setNowAllFile',response.data);
							this.$store.commit('changeFilePath',{type:'delete',index:index+1});
						})
					} else {
						request('seafile','listDirEntriesByP',{url:store.get("SERVICE_URL"),token:this.$store.state.nowInfo.token,repo_id:this.$store.state.repo_id,path:path},(response)=>{
							console.log(response.data)
							this.$store.commit('changeFilePath',{type:'delete',index:index+1});
							this.$store.commit('setNowAllFile',response.data);
						})
					}
				}
			},
			change:function(e){
				// document.getElementById(this.lastId).style="";
				// this.lastId='change';
				// e.target.style="background:#5698c3;color:white;"
				ipc.send('changeUser');
			},
		}
	};
</script>

<style>
	#mainTitle .title {
		height: 40px;
		background: #EEF0F6;
		-webkit-app-region: drag;
		-webkit-user-select: none;
	}

	#mainTitle .title .el-row .title {
		line-height: 40px;
		font-size: 1.3em;
		text-align: left;
		padding-left: 20px;
	}

	#mainTitle .title .el-row .btn {
		text-align: right;
	}

	#mainTitle .title .el-row .btn .el-button {
		-webkit-app-region: no-drag;
		cursor: default;
		margin-top: 5px;
		transition: .5s;
		font-size: 1em;
	}

	#mainTitle .title .el-row .btn .close:hover {
		background: #c02c38;
		transform: rotate(180deg);
		color: white;
	}

	#mainTitle .title .el-row .btn .min:hover,
	#mainTitle .el-header .el-row .btn .max:hover {
		background: #5e7987;
		color: white;
		transform: rotate(180deg);
	}

	#mainTitle .el-main {
		padding: 0
	}

	#mainTitle .aside {
		background: rgb(249, 250, 251);
		height: 500px;
		border-right: 1px solid #ccccd6;
		position: relative;
		-webkit-user-select: none;
	}

	#mainTitle .aside .asideTitle {
		font-size: 1.2em;
		color: black;
		margin: 10px 0;
	}

	#mainTitle .aside ul {
		list-style: none;
		padding: 0;
	}

	#mainTitle .aside li {
		width: 100%;
		height: 50px;
		line-height: 50px;
		font-size: 0.9em;
	}

	#mainTitle .aside li:hover {
		background: #8fb2c9;
		color: white;
	}

	#mainTitle .aside li:active {
		background: #5698c3;
		color: white;
	}

	#mainTitle .aside #capacityBox {
		position: absolute;
		bottom: 10px;
		padding: 0 14px;
	}

	#mainTitle .aside #capacity {
		width: 170px;
		height: 10px;
		background: #ccccd6;
	}

	#mainTitle .aside #alreadyUse {
		height: 10px;
		background: #c04851;
	}

	#mainTitle .aside #capacityText {
		font-size: 0.8em;
		margin-top: 10px;
	}

	#mainTitle .path {
		float: left;
		font-size: 12px;
		padding: 10px 0;
	}

	#mainTitle .path span:hover {
		cursor: pointer;
		color: #5698c3;
	}

	#mainTitle .info {
		float: right;
		padding: 7px;
		font-size: 0.8em;
	}

	#mainTitle .info img {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		vertical-align: middle;
	}

	#mainTitle .beiFen {
		display: inline-block;
		width: 300px;
		border: 1px solid blue;
	}
</style>
