<template>
	<div id="simpleView" @mousedown="mousedown">
		<div v-for="(item,index) of this.$store.state.nowAllFile" :key="index">
			<div class="box" @dblclick="dblclickDir(item)" :id="index" v-if="item.type=='repo'||item.type=='dir'||item.directory||item.isdir==1"
			 @contextmenu.prevent="childRightMenu">
				<div class="imgBox">
					<img v-if="$store.state.nowType=='baidu'" draggable="false" :src="icon[item.isdir]" />
					<img v-else draggable="false" :src="icon[item.type]" />
				</div>
				<div class="fileName" v-if="$store.state.nowType=='baidu'">{{item.server_filename}}</div>
				<div class="fileName" v-else>{{item.name}}</div>
			</div>
			<div class="box" @dblclick="dblclickFile(item)" :id="index" v-if="item.type=='file'||item.file||item.isdir==0"
			 @contextmenu.prevent="childRightMenu">
				<div class="imgBox">
					<img v-if="$store.state.nowType=='baidu'" draggable="false" :src="icon[item.isdir]" />
					<img v-else draggable="false" :src="icon[item.type]" />
				</div>
				<div class="fileName" v-if="$store.state.nowType=='baidu'">{{item.server_filename}}</div>
				<div class="fileName" v-else>{{item.name}}</div>
			</div>
		</div>

		<div v-if="opening">

		</div>

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

		<el-dialog title="选择备份文件夹" :visible.sync="showPathDialog">
			<el-button @click="beifen('bendi')">本地备份</el-button>
			<el-button @click="beifen('seafile')">seafile</el-button>
			<el-button @click="beifen('baidu')">百度网盘</el-button>
		</el-dialog>

		<el-dialog title="选择备份文件夹" :close-on-click-modal="false" :visible.sync="seaFilePath">
			<el-card class="box-card">

			</el-card>
		</el-dialog>

	</div>
</template>
<script>
	import {
		request
	} from '../assets/js/request.js'
	var fileUtil = require("../assets/util/fileUtil.js")
	import axios from 'axios'
	import {
		beifen,
		loacl_beifen
	} from '../assets/util/benfen.js'
	const path_ = require('path');
	const {
		ipcRenderer: ipc
	} = require('electron');
	const {
		shell
	} = require('electron')
	import fs from 'fs'
	const Store = require('electron-store');
	const store = new Store();
	export default {
		name: 'simpleView',
		data() {
			return {
				icon: {
					dir: require('../assets/images/dir.png'),
					repo: require('../assets/images/dir.png'),
					file: require('../assets/images/file.png'),
					1: require('../assets/images/dir.png'),
					0: require('../assets/images/file.png')
				},
				lastIndex: '0',
				nowType: this.$store.state.nowType,
				repo_id: this.$store.state.repo_id,
				selectLists: [],
				dialogVisible: false,
				showPathDialog: false,
				propertyData: [],
				showDeleteDialog: false,
				seaFilePath: false,
				nowDir: "",
				opening: false,
				fileType: ['doc', 'docx', 'ppt', 'pptx', 'js', 'html', 'css', 'php', 'xls', 'xlsx', 'png', 'jpg', 'txt'],
			}

		},

		watch: {
			'$store.state.nowType': function() {
				this.nowType = this.$store.state.nowType
			}
		},

		methods: {
			createWin: function() {
				ipc.send('createNewWin');
			},


			mousedown: function() {
				//实现鼠标框选文件
				if (event.button == 1 || event.button == 2) return;
				if (this.dialogVisible || this.showDeleteDialog || this.showPathDialog || this.seaFilePath) return;
				var selList = [];
				var fileLists = document.getElementsByClassName('box');
				for (var i = 0; i < fileLists.length; i++) {
					fileLists[i].className = "box";
				}
				selList = fileLists;
				var isSelect = true;
				//获取事件触发后的event对象，做了一个兼容性处理
				var evt = window.event || arguments[0];
				// 存放鼠标点击初始位置
				var startX = (evt.x || evt.clientX) - 200;
				var startY = (evt.y || evt.clientY) - 80;
				//创建一个框选元素
				var selDiv = document.createElement("div");
				//给框选元素添加CSS样式，使用决定定位
				selDiv.style.cssText =
					"position:absolute; width:0px; height:0px; font-size:0px; margin:0px; padding:0px; background:#C3D5ED; border:1px dashed #0099FF; z-index:1000; filter:alpha(opacity:60); opacity:0.6; display:none";
				//添加id
				selDiv.id = "selectDiv";
				//appendChild()向节点添加最后一个子节点
				document.getElementById('simpleView').appendChild(selDiv);
				//根据起始位置，添加定位
				selDiv.style.left = startX + "px";
				selDiv.style.top = startY + "px";
				//根据坐标给选框修改样式
				var _x = null;
				var _y = null;
				this.clearEventBubble(evt);
				//移动鼠标
				var _this = this;
				document.getElementById('simpleView').onmousemove = function() {
					evt = window.event || arguments[0];
					if (isSelect) {
						if (selDiv.style.display == "none") {
							selDiv.style.display = "";
						}
						//获取当前鼠标位置
						_x = (evt.x || evt.clientX) - 200;
						_y = (evt.y || evt.clientY) - 80;
						selDiv.style.left = Math.min(_x, startX) + 'px';
						selDiv.style.top = Math.min(_y, startY) + 'px';
						selDiv.style.width = Math.abs(_x - startX) + 'px'; //Math.abs()返回数的绝对值
						selDiv.style.height = Math.abs(_y - startY) + 'px';
						//获取参数
						var _l = selDiv.offsetLeft;
						var _t = selDiv.offsetTop;
						var _w = selDiv.offsetWidth;
						var _h = selDiv.offsetHeight;
						for (var i = 0; i < selList.length; i++) {
							var sl = selList[i].offsetWidth + selList[i].offsetLeft;
							var st = selList[i].offsetHeight + selList[i].offsetTop;
							if (sl > _l && st > _t && selList[i].offsetLeft < _l + _w && selList[i].offsetTop < _t + _h) {
								// 该DOM元素被选中，进行处理
								// indexOf()可返回某个指定的字符串值在字符串中首次出现的位置
								if (selList[i].className.indexOf(" selected") == -1) {
									selList[i].className = selList[i].className + " selected";
								}
							} else {
								if (selList[i].className.indexOf(" selected") != -1) {
									selList[i].className = "box";
								}
							}
						}
					}
					_this.clearEventBubble(evt);
				};
				//放开鼠标，选框消失
				document.getElementById('simpleView').onmouseup = function() {
					if (event.button == 1 || event.button == 2) return;
					if (_this.dialogVisible || _this.showDeleteDialog) return;
					isSelect = false;
					_this.selectLists = [];
					var isNull = true;
					if (selDiv) {
						document.getElementById('simpleView').removeChild(selDiv);
						for (var i = 0; i < selList.length; i++) {
							if (selList[i].className.indexOf('selected') != -1) {
								_this.selectLists.push(selList[i].id);
								isNull = false;
							}
						}
					}
					if (isNull && selList) {
						for (var i = 0; i < selList.length; i++) {
							var _l = selList[i].offsetLeft;
							var _t = selList[i].offsetTop;
							var _w = selList[i].offsetWidth;
							var _h = selList[i].offsetHeight;
							if (startX > _l && startX < _l + _w && startY > _t && startY < _t + _h) {
								selList[i].className = selList[i].className + " selected";
								_this.selectLists.push(selList[i].id);
							}
						}
					}
					selList = null, _x = null, _y = null, selDiv = null, startX = null, startY = null, evt = null;
				}

			},
			clearEventBubble: function(evt) {
				// stopPropagation()不再派发事件。终止事件在传播过程的捕获、目标处理或起跑阶段进一步传播
				if (evt.stopPropagation) {
					evt.stopPropagation();
				} else {
					evt.cancelBubble = true; // 阻止该事件的进一步冒泡
				}
				if (evt.preventDefault) {
					evt.preventDefault(); // 取消事件的默认动作
				} else {
					evt.returnValue = false;
				}
			},
			dblclickDir: function(args) {
				//双击进入文件夹
				this.$store.commit('orderBy', {
					orderBy: 'name',
					order: 'asc'
				});
				for (var i = 0; i < this.selectLists.length; i++) {
					document.getElementById(this.selectLists[i]).className = "box";
				}
				this.selectLists = [];
				var nowPaths = this.$store.state.filePath;
				var path = '';
				//处理多网盘
				if (this.$store.state.nd) {
					if (this.$store.state.nd.type == "all" && !this.$store.state.nd.isEnter) {
						console.log(args);
						if (args.name == 'ftp') {
							request('ftp', 'getFiles', {
								pathName: '/'
							}, (response) => {
								this.$store.commit('changeFilePath', {
									type: 'add',
									name: "FTP",
									path: '/'
								});
								this.$store.commit('add', {
									type: 'ftp',
									name: 'userName',
									value: this.$store.state.nd.file.ftp.ip
								})
								this.$store.commit('setNowAllFile', response);
								this.$store.state.nd.isEnter = true
							})
						} else if (args.name == 'seafile') {
							store.set("SERVICE_URL", this.$store.state.nd.file.seafile.SERVICE_URL)
							request('seafile', 'listLibraries', {
								url: this.$store.state.nd.file.seafile.SERVICE_URL,
								token: this.$store.state.nd.file.seafile.token
							}, (response) => {
								this.$store.commit('changeFilePath', {
									type: 'add',
									name: "Seafile",
									path: '/'
								});
								this.$store.commit('add', {
									type: 'seafile',
									name: 'token',
									value: this.$store.state.nd.file.seafile.token
								})
								this.$store.commit('setNowAllFile', response.data);
								this.$store.state.nd.isEnter = true
							})
						} else if (args.name == 'baidu') {
							request('baidu', 'getfileList', {
								path: '/'
							}, response => {
								this.$store.commit('changeFilePath', {
									type: 'add',
									name: "百度网盘",
									path: '/'
								});
								this.$store.commit('add', {
									type: 'baidu',
									name: 'token',
									value: ""
								})
								console.log(response)
								this.$store.commit('setNowAllFile', response.data.list);
								this.$store.state.nd.isEnter = true

							})
						}

					}
				}
				//处理百度
				if (this.$store.state.nowType == 'baidu') {
					for (var nowPath of nowPaths) {
						path += nowPath.path;
					}
					path += '/' + args.server_filename;
					request('baidu', 'getRecursionFileList', {
						path: path
					}, response => {
						console.log(path);
						this.$store.commit('changeFilePath', {
							type: 'add',
							name: args.server_filename,
							path: '/' + args.server_filename
						});
						console.log(this.$store.state.filePath);
						this.$store.commit('setNowAllFile', response.data.list);
						console.log(response);
					})
				}
				//处理ftp
				if (this.$store.state.nowType == 'ftp') {
					for (var nowPath of nowPaths) {
						path += nowPath.path;
					}
					path += '/' + args.name + '/';
					request('ftp', 'getFiles', {
						pathName: path
					}, response => {
						this.$store.commit('changeFilePath', {
							type: 'add',
							name: args.name,
							path: '/' + args.name
						});
						this.$store.commit('setNowAllFile', response);
					})
				}
				//处理seafile
				if (this.$store.state.nowType == 'seafile') {
					if (args.type == 'dir') {
						for (var nowPath of nowPaths) {
							path = path + nowPath.path;
						}
						path = path + '/' + args.name;
					} else if (args.type == 'repo') {
						path = '/';
						this.repo_id = args.id;
						this.$store.commit('setRepo_id', this.repo_id);
					}
					request(this.$store.state.nowType, 'listDirEntriesByP', {
						url: store.get("SERVICE_URL"),
						token: this.$store.state.nowInfo.token,
						repo_id: this.repo_id,
						path: path
					}, (response) => {
						if (args.type == 'repo') {
							this.$store.commit('changeFilePath', {
								type: 'add',
								name: args.name,
								path: ''
							});
						} else {
							this.$store.commit('changeFilePath', {
								type: 'add',
								name: args.name,
								path: '/' + args.name
							});
						}
						this.$store.commit('setNowAllFile', response.data);
						this.lastIndex = '0';
					})
				}
			},
			openDir: function() {
				//在菜单中点击打开文件夹
				var args = this.$store.state.nowAllFile[this.selectLists[0]];
				console.log(args);
				this.dblclickDir(args);
			},
			copyOrCut: function(type) {
				//复制或剪切文件
				var nowAllFile = this.$store.state.nowAllFile;
				var nowPaths = this.$store.state.filePath;
				var nowPath = '';
				var paths = [];
				var _this = this;
				//处理百度
				if (this.$store.state.nowType == 'baidu') {
					for (var i = 0; i < nowPaths.length; i++) {
						nowPath += nowPaths[i].path;
					}
					for (var i = 0; i < this.selectLists.length; i++) {
						var info = {
							path: nowPath,
							name: nowAllFile[this.selectLists[i]].server_filename
						}
						paths.push(info);
					}
					this.$store.commit('setCopyOrCut', {
						repo_id: '',
						copyPath: paths,
						copyOrCut: type
					});
				}
				//处理ftp
				if (this.$store.state.nowType == 'ftp') {
					for (var i = 0; i < nowPaths.length; i++) {
						nowPath += nowPaths[i].path;
					}
					var path;
					if (nowPath != '') {
						path = nowPath + '/';
					} else {
						path = '/';
					}
					for (var i = 0; i < this.selectLists.length; i++) {
						var info = {
							path: path,
							name: nowAllFile[this.selectLists[i]].name
						}
						paths.push(info);
					}
					this.$store.commit('setCopyOrCut', {
						repo_id: '',
						copyPath: paths,
						copyOrCut: type
					});
				}
				//处理seafile
				if (this.$store.state.nowType == 'seafile') {
					if (nowAllFile[this.selectLists[0]].type == 'repo') {
						var msg = "复制"
						if (type == "cut") {
							msg = '剪切';
						}
						this.$message({
							message: "此文件夹不可被" + msg,
							type: 'warning'
						})
						return;
					}
					for (var i = 0, len = nowPaths.length; i < len; i++) {
						if (nowPaths[i].path != '/') {
							nowPath += nowPaths[i].path;
						}
					}
					for (var i = 0, len = this.selectLists.length; i < len; i++) {
						var path = nowPath + '/' + nowAllFile[this.selectLists[i]].name;
						paths.push(path);
					}
					this.$store.commit('setCopyOrCut', {
						repo_id: this.$store.state.repo_id,
						copyPath: paths,
						copyOrCut: type
					});
				}
			},
			deleted: function() {
				//实现文件的删除
				this.showDeleteDialog = false;
				var nowInfo = this.$store.state.nowInfo;
				var nowAllFile = this.$store.state.nowAllFile;
				var _this = this;
				var nowPath = this.$store.state.filePath;
				var path = '';
				var url = '';
				for (var i = 0, len = nowPath.length; i < len; i++) {
					if (nowPath[i].path != '/') {
						path += nowPath[i].path;
					}
				}
				//处理百度
				if (this.$store.state.nowType == 'baidu') {
					for (var i = this.selectLists.length - 1; i >= 0; i--) {
						var dpath = path;
						dpath = dpath + '/' + nowAllFile[this.selectLists[i]].server_filename;
						console.log(dpath);
						request('baidu', 'fileDelete', {
							path: dpath
						}, response => {
							if (response.status == 200) {
								if (i == -1) {
									this.refresh();
								}
							}
						})
					}
				}
				//处理ftp
				if (this.$store.state.nowType == 'ftp') {
					if (path == '') {
						path = '/';
					}
					for (var i = this.selectLists.length - 1; i >= 0; i--) {
						var dpath = path;
						if (dpath == '/') {
							dpath += nowAllFile[this.selectLists[i]].name;
						} else {
							dpath += '/' + nowAllFile[this.selectLists[i]].name;
						}
						if (nowAllFile[this.selectLists[i]].directory) {
							request('ftp', 'deleteDir', {
								path: dpath
							}, response => {
								if (response == 'success') {
									if (i == -1) {
										this.refresh();
									}

								}
							})
						}
						if (nowAllFile[this.selectLists[i]].file) {
							request('ftp', 'deleteFile', {
								path: dpath
							}, response => {
								console.log(response);
								if (response == 'success') {
									if (i == -1) {
										this.refresh();
									}
								}
							})
						}
					}
				}
				//处理seafile
				if (this.$store.state.nowType == 'seafile') {
					for (var i = 0; i < this.selectLists.length; i++) {
						if (nowAllFile[this.selectLists[i]].type == 'repo') {
							url = "deleteLibrary";
						} else if (nowAllFile[this.selectLists[i]].type == "dir") {
							url = "deleteDir";
						} else {
							url = "deleteFile";
						}
						var index = 0;
						if (url == "deleteLibrary") {
							index++;
							request(this.nowType, url, {
								url: store.get("SERVICE_URL"),
								token: nowInfo.token,
								repo_id: nowAllFile[this.selectLists[i]].id
							}, (response) => {
								// if (index == this.selectLists.length) {
								// 	this.refresh();
								// }
								this.refresh();
							})
						} else {
							var p = ''
							index++;
							p = path + '/' + nowAllFile[this.selectLists[i]].name;
							request(this.nowType, url, {
								url: store.get("SERVICE_URL"),
								token: nowInfo.token,
								repo_id: this.$store.state.repo_id,
								p: p
							}, (response) => {
								// if (index == this.selectLists.length) {
								// 	this.refresh();
								// }
								this.refresh();
							})
						}
					}

				}
			},
			refresh: function() {
				//刷新页面
				var nowPaths = this.$store.state.filePath;
				var nowInfo = this.$store.state.nowInfo;
				var path = '';
				//处理百度
				if (this.$store.state.nowType == 'baidu') {
					console.log('baidu')
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
			rename: function() {
				//对文件或文件夹进行重命名
				var nowAllFile = this.$store.state.nowAllFile;
				var nowPaths = this.$store.state.filePath;
				var nowPath = '';
				var _this = this;
				var url = '';
				var path = '';
				for (var i = 0, len = nowPaths.length; i < len; i++) {
					if (nowPaths[i].path != "/") {
						nowPath += nowPaths[i].path;
					}
				}
				this.$prompt('请输入新文件名', '文件重命名', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					inputValue: nowAllFile[_this.selectLists[0]].name || nowAllFile[_this.selectLists[0]].server_filename
				}).then(({
					value
				}) => {
					//处理百度
					if (_this.$store.state.nowType == 'baidu') {
						path = nowPath;
						var oldName = '/' + nowAllFile[_this.selectLists[0]].server_filename;
						request('baidu', 'fileRename', {
							path: path + oldName,
							newname: value
						}, response => {
							console.log('aaa');
							console.log(response);
							this.refresh();
						})
					}
					//处理ftp
					if (_this.$store.state.nowType == 'ftp') {
						if (nowPath == '') {
							path = '/';
						} else {
							path = nowPath;
						}
						if (path != '/') {
							path += '/';
						}
						var oldName = nowAllFile[_this.selectLists[0]].name;
						request('ftp', 'rename', {
							oldPath: path + oldName,
							newPath: path + value
						}, response => {
							if (response == 'success') {
								this.refresh();
							}
						})
					}
					//处理seafile
					if (_this.$store.state.nowType == 'seafile') {
						path = nowPath + '/' + nowAllFile[this.selectLists[0]].name;
						if (nowAllFile[_this.selectLists[0]].type == 'dir') {
							url = 'renameDir'
						} else if (nowAllFile[_this.selectLists[0]].type == 'repo') {
							url = 'renameRepo'
						} else {
							url = "renameFile"
						}
						if (url == "renameRepo") {
							request(_this.nowType, url, {
								url: store.get("SERVICE_URL"),
								token: _this.$store.state.nowInfo.token,
								repo_id: nowAllFile[_this.selectLists[0]].id,
								newName: value
							}, response => {
								request(_this.nowType, 'listLibraries', {
									url: store.get("SERVICE_URL"),
									token: _this.$store.state.nowInfo.token
								}, response => {
									_this.$store.commit('setNowAllFile', response.data);
								})
							})
							return;
						}
						request(_this.nowType, url, {
							url: store.get("SERVICE_URL"),
							token: _this.$store.state.nowInfo.token,
							repo_id: _this.repo_id,
							p: path,
							newName: value
						}, response => {
							if (nowPath == '') {
								nowPath = '/';
							}
							console.log(nowPath)
							request(_this.nowType, 'listDirEntriesByP', {
								url: store.get("SERVICE_URL"),
								token: this.$store.state.nowInfo.token,
								repo_id: this.repo_id,
								path: nowPath
							}, (response) => {
								_this.$store.commit('setNowAllFile', response.data);
							})
						})
					}
				});
			},

			showProperty: function() {
				//显示文件的属性
				var item = this.$store.state.nowAllFile[this.selectLists[0]];

				this.dialogVisible = true;
				var type;
				if (item.type == "repo") {
					type = "资料库";
				} else if (item.type == "dir" || item.directory || item.isdir == 1) {
					type = "文件夹";
				} else if (item.type == "file" || item.file || item.isdir == 0) {
					type = "文件";
				}
				var size = item.size ? (item.size > 1024 ? (item.size / 1024 > 1024 ? (item.size / 1024 / 1024 > 1024 ? (item.size /
					1024 / 1024 / 1024).toFixed(2) + 'GB' : (item.size / 1024 / 1024).toFixed(2) + 'MB') : (item.size / 1024).toFixed(
					2) + 'KB') : item.size + 'bytes') : '-';
				var time;
				if (this.$store.state.nowType == 'baidu') {
					time = this.dateFormat('YYYY-mm-dd HH:MM', item.server_mtime);
				} else {
					time = this.dateFormat('YYYY-mm-dd HH:MM', item.mtime);
				}
				this.propertyData = [{
						key: "名称：",
						value: item.name || item.server_filename
					},
					{
						key: "类型：",
						value: type
					},
					{
						key: "大小：",
						value: size
					},
					{
						key: "创建时间：",
						value: time
					}
				]
			},
			download: function() {
				//文件下载
				var _this = this;
				var nowAllFile = this.$store.state.nowAllFile;
				var nowPaths = this.$store.state.filePath;
				var path = '';
				for (var nowPath of nowPaths) {
					path += nowPath.path;
				}
				path += '/';
				if (_this.$store.state.nowType == 'ftp') {
					for (var i = 0; i < this.selectLists.length; i++) {
						path += nowAllFile[this.selectLists[0]].name;
						if (nowAllFile[this.selectLists[0]].file) {
							request('ftp', 'download', {
								path: path,
								type: 'file'
							}, response => {
								this.$message({
									message: response
								})
							});
						} else {
							request('ftp', 'download', {
								path: path,
								type: 'dir'
							}, response => {
								this.$message({
									message: response
								})
							})
						}
					}
				} else if (_this.$store.state.nowType == 'seafile') {
					var nowPath = '';
					var _this = this;
					var url = '';
					var path = '';
					for (var i = 0, len = nowPaths.length; i < len; i++) {
						if (nowPaths[i].path != "/") {
							nowPath += nowPaths[i].path;
						}
					}
					const {
						dialog
					} = require('electron').remote;
					dialog.showOpenDialog({
						title: "选择文件夹",
						defaultPath: "",
						properties: ['openDirectory'],
					}).then(result => {
						console.log(result.filePaths[0])
						for (let i = 0; i < this.selectLists.length; i++) {
							path = nowPath + '/' + nowAllFile[this.selectLists[i]].name;
							request(_this.nowType, 'downLoadFile', {
								url: store.get("SERVICE_URL"),
								token: this.$store.state.nowInfo.token,
								repo_id: this.repo_id,
								p: path,
								reuse_Temp: "",
							}, (response) => {
								//ipc.send('download', response.data);
								fileUtil.downLoad(response, result.filePaths[0], nowAllFile[this.selectLists[i]].name, function(res) {
									console.log(res)
								}, function() {
									//shell.openItem(dest + "/" + fileName);
								})
							})
						}
					})


				}
			},
			dateFormat: function(fmt, date) {
				//格式化时间
				if (this.$store.state.nowType == 'baidu') {
					var date1 = new Date(date * 1000);
					var Y = date1.getFullYear() + '-';
					var M = (date1.getMonth() + 1 < 10 ? '0' + (date1.getMonth() + 1) : date1.getMonth() + 1) + '-';
					var D = (date1.getDate() < 10 ? '0' + (date1.getDate()) : date1.getDate()) + ' ';
					var h = (date1.getHours() < 10 ? '0' + (date1.getHours()) : date1.getHours()) + ":";
					var m = (date1.getMinutes() < 10 ? '0' + (date1.getMinutes()) : date1.getMinutes());
					return Y + M + D + h + m;
				} else {
					let ret;
					var date1 = new Date(date * 1000);
					const opt = {
						"Y+": date1.getFullYear().toString(),
						"m+": (date1.getMonth() + 1).toString(),
						"d+": date1.getDate().toString(),
						"H+": date1.getHours().toString(),
						"M+": date1.getMinutes().toString(),
						"S+": date1.getSeconds().toString()
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
			dblclickFile: function(item) {
				console.log(this.nowType)
				//下载并打开文件
				var _this = this;
				var nowAllFile = this.$store.state.nowAllFile;
				var nowPaths = this.$store.state.filePath;
				var path = '';
				for (var nowPath of nowPaths) {
					path += nowPath.path;
				}
				path += '/';
				if (_this.$store.state.nowType == 'ftp') {
					path += item.name;
					var kz = item.name.split('.').pop();
					if (this.fileType.indexOf(kz) != -1) {
						console.log(path)
						request('ftp', 'download', {
							path: path,
							type: 'openFile',
							downType: 'open'
						}, response => {
							var path = process.cwd();
							const dest = path_.join(path, "temp");
							ipc.send('downloadPath', dest);
							shell.openItem(path_.join(path, "temp", item.name));
						});
					} else {
						this.$message({
							message: '该类型暂不能打开'
						})
					}
				} else if (_this.$store.state.nowType == 'seafile') {
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
					request('seafile', 'downLoadFile', {
						url: store.get("SERVICE_URL"),
						token: this.$store.state.nowInfo.token,
						repo_id: this.repo_id,
						p: path,
						reuse_Temp: "",
					}, (response) => {
						var fileName = response.config.url.split("/")
						fileName = fileName[fileName.length - 1]
						var url = response.data
						var path = process.cwd()
						const dest = path_.join(path, "temp");
						const fs = require("fs");
						fs.access(dest + "/" + fileName, fs.F_OK, (err) => {
							if (!err) {
								shell.openItem(dest + "/" + fileName);
								return;
							} else {
								fileUtil.downLoad(url, dest, fileName, function(res) {
									console.log(res)
								}, function() {
									shell.openItem(dest + "/" + fileName);
								})
							}
						});

					})
				}
			},

			beifen: function(type) {
				var _this = this;
				var nowAllFile = this.$store.state.nowAllFile;
				var nowPaths = this.$store.state.filePath;
				var item = this.$data.nowDir
				console.log(item)
				//this.$data.showPathDialog = true
				if (type == 'bendi') {
					const {
						dialog
					} = require('electron').remote;
					dialog.showOpenDialog({
						title: "选择文件夹",
						defaultPath: "",
						properties: ['openDirectory'],
					}).then(result => {
						_this.$data.showPathDialog = false
						if (_this.$store.state.nowType == 'seafile') {
							var nowPath = '';
							var url = '';
							var path = '';
							for (var i = 0, len = nowPaths.length; i < len; i++) {
								if (nowPaths[i].path != "/") {
									nowPath += nowPaths[i].path;
								}
							}
							path = nowPath + '/' + item.name;
							beifen("seafile", "bendi", path, result.filePaths[0], '', {
								SERVICE_URL: store.get("SERVICE_URL"),
								token: this.$store.state.nowInfo.token,
								repoid: this.repo_id,
							}, _this)
						}

					}).catch(err => {
						console.log(err)
					})
				} else if (type == 'seafile') {
					this.$data.seaFilePath = true
					if (_this.$store.state.nowType == 'seafile') {
						var nowPath = '';
						var url = '';
						var path = '';
						for (var i = 0, len = nowPaths.length; i < len; i++) {
							if (nowPaths[i].path != "/") {
								nowPath += nowPaths[i].path;
							}
						}
						path = nowPath + '/' + item.name;
						beifen("seafile", "seafile", path, result.filePaths[0], '', {
							SERVICE_URL: store.get("SERVICE_URL"),
							token: this.$store.state.nowInfo.token,
							repoid: this.repo_id,
						}, _this)
					}
				}
			},

			chooseType: function() {
				this.$data.nowDir = this.$store.state.nowAllFile[this.selectLists[0]];
				this.$data.showPathDialog = true
			},

			childRightMenu: function(event) {
				//鼠标右键
				(event.target.id == 'detailsView' || event.target.id == 'simpleView' || event.target.id == 'detailsViewLi') ||
				this.selectLists.length == 0 ? '' : this.$contextmenu({
					items: [{
							label: "打开",
							disabled: this.selectLists.length > 1 ? true : false,
							onClick: () => {
								if (this.$store.state.nowAllFile[this.selectLists[0]].type == 'file' || this.$store.state.nowAllFile[this.selectLists[
										0]].type == '0') {
									this.dblclickFile(this.$store.state.nowAllFile[this.selectLists[0]]);
								}
								if (this.$store.state.nowAllFile[this.selectLists[0]].type == "dir" || this.$store.state.nowAllFile[this.selectLists[
										0]].type == "repo" || this.$store.state.nowAllFile[this.selectLists[0]].type == '1') {
									this.openDir();
								}
							}
						},
						{
							label: "下载",
							divided: true,
							icon: "el-icon-download",
							onClick: () => {
								this.download();
							}
						},
						{
							label: "复制",
							icon: "el-icon-document-copy",
							onClick: () => {
								this.copyOrCut('copy');
							}
						},
						{
							label: "剪切",
							icon: "el-icon-scissors",
							onClick: () => {
								this.copyOrCut('cut');
							}
						},
						{
							label: "删除",
							divided: true,
							icon: "el-icon-delete",
							onClick: () => {
								this.showDeleteDialog = true;
							}
						},
						{
							label: "重命名",
							disabled: this.selectLists.length > 1 ? true : false,
							onClick: () => {
								this.rename();
							}
						},
						{
							label: "属性",
							disabled: this.selectLists.length > 1 ? true : false,
							onClick: () => {
								this.showProperty();
							}
						},
						{
							label: "自动备份",
							disabled: this.selectLists.length > 1 ? true : false,
							onClick: () => {
								this.chooseType();
							}
						}
					],
					event,
					customClass: "class-boxMenu",
					zIndex: 3
				});
				return false;
			}
		}

	}
</script>
<style>
	#simpleView {
		width: 100%;
		height: 100%;
		text-align: left;
		display: flex;
		flex-wrap: wrap;
		align-content: flex-start;
	}

	#simpleView .box {
		width: 120px;
		height: 120px;
		text-align: center;
		font-size: 0.8em;
		box-sizing: border-box;
		-webkit-user-select: none;
		margin: 10px;
	}

	#simpleView .box:hover {
		background: rgba(195, 215, 233, .6);
	}

	#simpleView .box:active,
	#simpleView .selected {
		background: rgba(195, 215, 233, 1);
		border: 1px solid blue;
	}

	#simpleView .imgBox {
		padding: 10px 20px 2px 20px;
	}

	#simpleView .imgBox img {
		width: 80px;
		height: 80px;
	}

	#simpleView .box span {
		display: inline-block;
		width: 120px;
		overflow: hidden;
		font-size: 0.9em;
		text-overflow: ellipsis;
	}

	#simpleView .fileName {
		width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap
	}

	/* #simpleView .upload{
    width: 120px;
    height: 110px;
    margin: 10px;
}
#simpleView #maskLayer{
    position: absolute;
    width: 0px;
    height:100px;
    background: red;
    opacity: 0.5;
    z-index: 3;
} */
</style>

