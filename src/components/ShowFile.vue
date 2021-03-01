<template>
	<div id="showFile">
		<el-container>
			<el-main>
				<el-scrollbar style="height:100%;width:100%" :native="false" wrap-style="overflow-x:hidden;margin-bottom:0px">
					<div id="fileBox" :style="{height:this.$store.state.windowHeight-72+'px'}" @contextmenu.prevent="boxRightMenu">
						<nullPage v-if="this.$store.state.nowAllFile.length==0"></nullPage>
						<simpleView v-if="viewType=='simpleView'&&this.$store.state.nowAllFile.length>0"></simpleView>
						<detailsView v-if="viewType=='detailsView'&&this.$store.state.nowAllFile.length>0"></detailsView>
					</div>
					<from id="from" enctype="multipart/form-data">
						<input id="getFile" type="file" @change="addFile" hidden="hidden" multiple="multiple" />
					</from>
				</el-scrollbar>
			</el-main>
			<el-footer style="background:#F9FAFB;height:30px;border-top:1px solid #ccccd6">
				<div id="fileNum">{{this.$store.state.nowAllFile.length}}项</div>
				<div id="viewType">
					<i class="fa fa-list-ul" v-if="viewType=='simpleView'" @click="toDetails"></i>
					<i class="el-icon-menu" v-if="viewType=='detailsView'" @click="toSimple"></i>
				</div>
			</el-footer>
		</el-container>
	</div>
</template>
<script>
	import nullPage from './NullPage'
	import simpleView from './simpleView'
	import detailsView from './DetailsView'
	import {
		request
	} from '../assets/js/request.js'
	import axios from 'axios'
	const {
		ipcRenderer: ipc
	} = require('electron');
	import {
		loacl_beifen
	} from '../assets/util/benfen.js'
	import {
		insertPath,
		selectFile
	} from '../assets/js/shell.js'
	const fs = require('fs')
	const http = require('http');
	const Store = require('electron-store');
	const store = new Store();
	export default {
		name: 'showFile',
		components: {
			simpleView,
			detailsView,
			nullPage
		},
		data() {
			return {
				viewType: 'simpleView',
			}
		},
		mounted() {
			if (this.$store.state.nowType == 'ftp') {
				request('ftp', 'connect', {
					type: 1,
					data: JSON.parse(store.get('nowLoginInfo'))
				}, function(response) {
					console.log(response);
				})
			}
		},

		methods: {
			toDetails: function() {
				this.viewType = 'detailsView'
			},
			toSimple: function() {
				this.viewType = 'simpleView'
			},
			refresh: function() {
				//刷新页面
				var nowPaths = this.$store.state.filePath;
				var nowInfo = this.$store.state.nowInfo;
				var path = '';
				//处理百度
				if (this.$store.state.nowType == 'baidu') {
					if (nowPaths.length == 0) {
						path = '/';
					} else {
						for (var nowPath of nowPaths) {
							path += nowPath.path;
						}
					}
					request('baidu', 'getRecursionFileList', {
						path: path
					}, response => {
						console.log(response.data.list)
						this.$store.commit('setNowAllFile', response.data.list);
					})
				}
				//处理ftp
				if (this.$store.state.nowType == 'ftp') {
					if (nowPaths.length == 0) {
						path = '/';
					} else {
						for (var nowPath of nowPaths) {
							path += nowPath.path;
						}
						path += '/';
					}
					request('ftp', 'getFiles', {
						pathName: path
					}, response => {
						this.$store.commit('setNowAllFile', response);
					})
				}
				//处理seafile
				if (this.$store.state.nowType == 'seafile') {
					if (nowPaths.length == 0) {
						request(this.$store.state.nowType, 'listLibraries', {
							url: store.get("SERVICE_URL"),
							token: nowInfo.token
						}, (response) => {
							this.$store.commit('setNowAllFile', response.data);
							insertPath("seafile", {
								url: store.get("SERVICE_URL"),
								token: nowInfo.token
							}, function() {})
							// selectFile("baidu",{
							// 	key:"java"
							// },function(res){
							// 	console.log(res)
							// })
						})
					} else {
						var path = '';
						for (var nowPath of nowPaths) {
							path = path + nowPath.path;
						}
						request(this.$store.state.nowType, 'listDirEntriesByP', {
							url: store.get("SERVICE_URL"),
							token: this.$store.state.nowInfo.token,
							repo_id: this.$store.state.repo_id,
							path: path
						}, (response) => {
							this.$store.commit('setNowAllFile', response.data);
						})
					}
				}

			},
			newDir: function() {
				//新建文件夹
				var nowPaths = this.$store.state.filePath;
				var nowInfo = this.$store.state.nowInfo;
				this.$prompt('请输入文件名', '新建文件夹', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
				}).then(({
					value
				}) => {
					//处理百度
					if (this.$store.state.nowType == 'baidu') {
						console.log('aa');
						var path = '';
						if (nowPaths.length == 0) {
							path = '/' + value;
						} else {
							for (var nowPath of nowPaths) {
								path += nowPath.path + '/' + value;
							}
						}
						request('baidu', 'createfolder', {
							path: path
						}, response => {
							console.log(response);
							console.log(path);
							if (response.status == 200) {
								this.refresh();
							}
						})
					}
					//处理ftp
					if (this.$store.state.nowType == 'ftp') {
						var path = '';
						if (nowPaths.length == 0) {
							path = '/';
						} else {
							for (var nowPath of nowPaths) {
								path += nowPath.path;
							}
						}
						if (path != '/') {
							path += '/';
						}
						request('ftp', 'makeDir', {
							path: path + value
						}, response => {
							this.refresh();
						})
					}
					//处理seafile
					if (this.$store.state.nowType == 'seafile') {
						//新建资料库
						if (nowPaths.length == 0) {
							request(this.$store.state.nowType, 'createNewLibrary', {
								url: store.get("SERVICE_URL"),
								token: nowInfo.token,
								libName: value
							}, (response) => {
								request(this.$store.state.nowType, 'listLibraries', {
									url: store.get("SERVICE_URL"),
									token: nowInfo.token
								}, (response) => {
									this.$store.commit('setNowAllFile', response.data);
								})
							})
						} else {
							//新建文件夹
							var path1 = '';
							for (var nowPath of nowPaths) {
								if (nowPath.path == '/') continue;
								path1 = path1 + nowPath.path;
							}
							var path = path1 + '/' + value;
							request(this.$store.state.nowType, 'createNewDir', {
								url: store.get("SERVICE_URL"),
								token: nowInfo.token,
								repo_id: this.$store.state.repo_id,
								p: path
							}, (response) => {
								request(this.$store.state.nowType, 'listDirEntriesByP', {
									url: store.get("SERVICE_URL"),
									token: this.$store.state.nowInfo.token,
									repo_id: this.$store.state.repo_id,
									path: path1
								}, (response) => {
									console.log("ss")
									console.log(response)
									this.$store.commit('setNowAllFile', response.data);
								})
							})
						}
					}
				})
			},
			paste: function() {
				//实现文件的粘贴
				var nowAllFile = this.$store.state.nowAllFile;
				var copyPath = this.$store.state.copyPath;
				var repo_id = this.$store.state.copy_repo_id;
				var copyOrCut = this.$store.state.copyOrCut;
				var nowPaths = this.$store.state.filePath;
				var nowInfo = this.$store.state.nowInfo;
				var path = '';
				for (var i = 0, len = nowPaths.length; i < len; i++) {
					if (nowPaths[i].path != '/') {
						path += nowPaths[i].path;
					}
				}
				//处理百度
				if (this.$store.state.nowType == 'baidu') {
					if (copyOrCut == 'copy') {
						console.log(copyPath);
						for (var i = 0; i < copyPath.length; i++) {
							var oldPath = copyPath[i].path + '/' + copyPath[i].name;
							var newPath = path + '/' + copyPath[i].name;
							console.log(oldPath);
							console.log(path);
							request('baidu', 'fileCopy', {
								path: oldPath,
								dest: path
							}, response => {
								if (i == copyPath.length) {
									this.refresh();
								}
							})
						}
					} else if (copyOrCut == 'cut') {
						for (var i = 0; i < copyPath.length; i++) {
							var oldPath = copyPath[i].path + '/' + copyPath[i].name;
							var newPath = path + '/' + copyPath[i].name;
							request('baidu', 'fileMove', {
								path: oldPath,
								dest: path
							}, response => {
								if (i == copyPath.length) {
									this.refresh();
								}
							})
						}
					}
				}
				//处理ftp
				if (this.$store.state.nowType == 'ftp') {
					if (path == "") {
						path = '/';
					}
					if (copyOrCut == 'cut') {
						if (path != '/') {
							path += '/';
						}
						for (var i = 0; i < copyPath.length; i++) {
							var oldPath = copyPath[i].path + copyPath[i].name;
							var newPath = path + copyPath[i].name;
							request('ftp', 'move', {
								oldPath: oldPath,
								newPath: newPath
							}, response => {
								if (response == 'success') {
									if (i == copyPath.length) {
										this.$store.commit('setCopyOrCut', {
											copy_repo_id: '',
											copyPath: [],
											copyOrCut: 'copy'
										});
										this.refresh();
									}
								}
							})
						}
					}
				}
				//处理seafile
				if (this.$store.state.nowType == 'seafile') {
					if (path == "") {
						path = '/';
					}
					var url = ''
					if (copyOrCut == 'copy') {
						url = 'copy';
					} else {
						url = 'moveFile';
					}
					var index = 0;
					for (var i = 0, len = copyPath.length; i < len; i++) {
						index++;
						request(this.$store.state.nowType, url, {
							url: store.get("SERVICE_URL"),
							token: nowInfo.token,
							repo_id: repo_id,
							p: copyPath[i],
							dst_repo: this.$store.state.repo_id,
							dst_dir: path
						}, (response) => {
							if (index == copyPath.length) {
								if (copyOrCut == "cut") {
									this.$store.commit('setCopyOrCut', {
										copy_repo_id: '',
										copyPath: [],
										copyOrCut: 'copy'
									});
								}
								this.refresh();
							}
						})
					}
				}

			},

			addFile: function(res) {
				var dom = document.getElementById("getFile")
				var that = this
				//this.fileList = this.file.files
				var arr = dom.files
				var nowPaths = this.$store.state.filePath;
				var nowInfo = this.$store.state.nowInfo;
				var nowType = this.$store.state.nowType
				var path1 = '';
				//var file = new File()
				for (var nowPath of nowPaths) {
					if (nowPath.path == '/') continue;
					path1 = path1 + nowPath.path;
				}
				request(this.$store.state.nowType, "uploadLink", {
					url: store.get("SERVICE_URL"),
					token: nowInfo.token,
					repo_id: this.$store.state.repo_id,
					p: path1,
				}, (response) => {
					console.log(response.data)
					arr.forEach(function(file) {
						var formData = new FormData();
						formData.append('file', file);
						formData.append("parent_dir", path1 + "/")
						formData.append("relative_path", "")
						request(nowType, "uploadFile", {
							url: response.data,
							data: formData,
							token: nowInfo.token,
						}, (res) => {
							console.log(res)
							if (res.data) {
								res = 100
							}
							that.$store.commit('updateDownLoadList', {
								fileName: file.name,
								progress: parseInt(res),
								//dirPath: toPath,
								filePath: file.path
							})
							that.refresh()
						})
					})
				})
			},

			//文件上传
			uploadFile: function() {
				//处理seaFiel
				if (this.$store.state.nowType == 'seafile') {
					this.file = document.getElementById("getFile")
					this.file.click()
				}
				//处理ftp和百度
				if (this.$store.state.nowType == 'ftp' || this.$store.state.nowType == 'baidu') {
					ipc.send('open-directory-dialog', 'openFile');
					ipc.once('selectedItem', this.getPath);
				}

			},
			getPath: function(e, chooseFilePath) {
				var nowPaths = this.$store.state.filePath;
				var path = '';
				for (var nowPath of nowPaths) {
					path += nowPath.path;
				}
				if (path == '') {
					path = '/';
				}
				//处理百度
				if (this.$store.state.nowType == 'baidu') {
					this.$store.commit('uploadByBaidu', {
						path: path,
						chooseFilePath: chooseFilePath
					});
				}
				//处理ftp
				if (this.$store.state.nowType == 'ftp') {
					request('ftp', 'upload', {
						localPath: chooseFilePath,
						toPath: path
					}, response => {
						console.log(response);
					})
				}
			},


			local_benfen: function() {
				var that = this
				var nowPaths = this.$store.state.filePath;
				var path1 = '';
				//var file = new File()
				for (var nowPath of nowPaths) {
					if (nowPath.path == '/') continue;
					path1 = path1 + nowPath.path;
				}
				if(this.$store.state.nowType == 'seafile'){
					loacl_beifen("seafile", {
						token: this.$store.state.nowInfo.token,
						repo_id: this.$store.state.repo_id,
						toPath: path1
					}, function(res) {
						console.log(res)
					})
				}else if(this.$store.state.nowType == 'ftp'){
					loacl_beifen("ftp",{
						toPath:path1
					},function(){})
				}
				
			},

			boxRightMenu: function(event) {
				//鼠标右键
				event.target.id == 'detailsView' || event.target.id == 'simpleView' || event.target.id == 'detailsViewLi' || event
					.target.id == 'nullPage' ? this.$contextmenu({
						items: [{
								label: "刷新",
								icon: "el-icon-refresh",
								onClick: () => {
									this.refresh();
								}
							},
							{
								label: "新建文件夹",
								onClick: () => {
									this.newDir();
								}
							},
							{
								label: "上传",
								divided: true,
								onClick: () => {
									this.uploadFile();
								}
							},
							{
								label: "粘贴",
								divided: true,
								disabled: this.$store.state.copyPath.length > 0 ? false : true,
								onClick: () => {
									this.paste();
								}
							},
							{
								label: "本地备份",
								divided: true,
								onClick: () => {
									this.local_benfen();
								}
							},
							{
								label: "查看",
								children: [{
										label: "列表",
										icon: this.viewType == 'detailsView' ? "el-icon-check" : "",
										onClick: () => {
											this.viewType = 'detailsView';
										}
									},
									{
										label: "图标",
										icon: this.viewType == 'simpleView' ? "el-icon-check" : "",
										onClick: () => {
											this.viewType = 'simpleView';
										}
									}
								]
							},
							{
								label: '排序',
								divided: true,
								children: [{
										label: '文件名',
										icon: this.$store.state.orderBy == 'name' ? 'el-icon-check' : '',
										onClick: () => {
											if (this.$store.state.order == 'asc') {
												this.$store.commit('orderBy', {
													orderBy: 'name',
													order: 'asc'
												});
												this.$store.commit('orderByNameZ');
											} else if (this.$store.state.order == 'desc') {
												this.$store.commit('orderBy', {
													orderBy: 'name',
													order: 'desc'
												});
												this.$store.commit('orderByNameD');
											}
										}
									},
									{
										label: '大小',
										icon: this.$store.state.orderBy == 'size' ? 'el-icon-check' : '',
										onClick: () => {
											if (this.$store.state.order == 'asc') {
												this.$store.commit('orderBy', {
													orderBy: 'size',
													order: 'asc'
												});
												this.$store.commit('orderBySizeZ');
											} else if (this.$store.state.order == 'desc') {
												this.$store.commit('orderBy', {
													orderBy: 'size',
													order: 'desc'
												});
												this.$store.commit('orderBySizeD');
											}
										}
									},
									{
										label: '创建时间',
										divided: true,
										icon: this.$store.state.orderBy == 'time' ? 'el-icon-check' : '',
										onClick: () => {
											if (this.$store.state.order == 'asc') {
												this.$store.commit('orderBy', {
													orderBy: 'time',
													order: 'asc'
												});
												this.$store.commit('orderByTimeZ');
											} else if (this.$store.state.order == 'desc') {
												this.$store.commit('orderBy', {
													orderBy: 'time',
													order: 'desc'
												});
												this.$store.commit('orderByTimeD');
											}
										}
									},
									{
										label: '升序',
										icon: this.$store.state.order == 'asc' ? 'el-icon-check' : '',
										onClick: () => {
											if (this.$store.state.orderBy == 'name') {
												this.$store.commit('orderBy', {
													orderBy: 'name',
													order: 'asc'
												});
												this.$store.commit('orderByNameZ');
											} else if (this.$store.state.orderBy == 'size') {
												this.$store.commit('orderBy', {
													orderBy: 'size',
													order: 'asc'
												});
												this.$store.commit('orderBySizeZ');
											} else if (this.$store.state.orderBy == 'time') {
												this.$store.commit('orderBy', {
													orderBy: 'time',
													order: 'asc'
												});
												this.$store.commit('orderByTimeZ');
											}
										}
									},
									{
										label: '降序',
										icon: this.$store.state.order == 'desc' ? 'el-icon-check' : '',
										onClick: () => {
											if (this.$store.state.orderBy == 'name') {
												this.$store.commit('orderBy', {
													orderBy: 'name',
													order: 'desc'
												});
												this.$store.commit('orderByNameD');
											} else if (this.$store.state.orderBy == 'size') {
												this.$store.commit('orderBy', {
													orderBy: 'size',
													order: 'desc'
												});
												this.$store.commit('orderBySizeD');
											} else if (this.$store.state.orderBy == 'time') {
												this.$store.commit('orderBy', {
													orderBy: 'time',
													order: 'desc'
												});
												this.$store.commit('orderByTimeD');
											}
										}
									}
								]
							}
						],
						event,
						zIndex: 3,
						customClass: "class-boxMenu"
					}) : '';
				return false;
			},
		}
	}
</script>
<style>
	#showFile {
		margin: 0px;
		padding: 0px;
	}

	#showFile .el-footer #fileNum {
		float: left;
		line-height: 29px;
		font-size: 0.8em;
		-webkit-user-select: none;
	}

	#showFile .el-footer #viewType {
		float: right;
		line-height: 29px;
	}

	#showFile .el-footer #viewType .fa:hover,
	#showFile .el-footer #viewType .el-icon-sort:hover {
		color: blue;
		cursor: pointer;
	}

	#showFile .el-footer #viewType .el-icon-menu:hover {
		color: blue;
		cursor: pointer;
	}

	.class-boxMenu {
		padding: 0px;
	}
</style>
