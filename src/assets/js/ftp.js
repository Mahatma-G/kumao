import axios from 'axios'
import qs from 'qs'
import ftp from 'ftp'
import fs from 'fs'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import store from '../../store'
const path = require('path')
const baseURL = 'http://127.0.0.1:8083/'
var SeaFileInfo //保存配置信息
const SMB2 = require('smb2');
const {
	ipcRenderer: ipc,
	remote,
	dialog
} = require('electron');
//连接ftp
var FTPlink = (function link() {
	var a;
	return function() {
		if (a) {
			return a;
		} else {
			a = new ftp();
			return a;
		}
	}
})()

export function ftpRequest(url, params, callback) {
	var f = FTPlink();
	switch (url) {
		case 'connect':
			connect(params);
			break;
		case 'link':
			connect(params);
			break;
		case 'getFiles':
			getFiles();
			break;
		case 'deleteFile':
			deleteFile();
			break;
		case 'deleteDir':
			deleteDir();
			break;
		case 'rename':
			rename();
			break;
		case 'makeDir':
			makeDir();
			break;
		case 'move':
			move();
			break;
		case 'download':
			download();
			break;
		case 'upload':
			upload();
			break;
	}


	/**
	 * 建立连接 connect
	 * ip、port、userName、password
	 */
	function connect(params) {
		if (params.type == 0) {
			f.connect(params.data)
		} else if (params.type == 1) {
			var loginInfo = params.data
			var connectConfig = {
				host: loginInfo.ip,
				user: loginInfo.userName,
				password: loginInfo.password,
				port: loginInfo.port
			};
			f.connect(connectConfig)
		}
		callback('success');
	}
	/**
	 * 列出目录下所有文件及文件夹 getFiles
	 * pathName
	 */
	function getFiles() {
		f.list(params.pathName, (error, list) => {
			console.log(list);
			var fileList = [];
			for (var i = 0; i < list.length; i++) {
				if (list[i].type == 'd') {
					var nowList = {
						name: list[i].name,
						mtime: list[i].date,
						file: false,
						directory: true,
						type: 1,
						size: list[i].size
					}
					fileList.push(nowList);
				}
				if (list[i].type == '-') {
					var nowList = {
						name: list[i].name,
						mtime: list[i].date,
						file: true,
						directory: false,
						type: 0,
						size: list[i].size
					}
					fileList.push(nowList);
				}
			}
			console.log(fileList);
			callback(fileList);
		})
	}
	/**
	 * 复制文件 copyFile
	 * sourceFileName(文件名)、sourceDir(文件所在目录)、targetDir(目标目录)
	 */
	function copyFile() {

	}

	/**
	 * 复制目录 copyDir
	 * sourceDir、targetDir
	 */


	/**
	 * 删除文件 deleted
	 * path
	 */
	function deleteFile() {
		f.delete(params.path, (error) => {
			if (error) {
				callback(error);
			} else {
				callback('success');
			}
		})
	}

	/**
	 * 删除目录 deleteDir
	 * remotePath、dirName
	 */


	function deleteDir() {
		var nowPath = [];
		var isSuccess = true;
		nowPath.push(params.path);
		f.list(params.path, (error, list) => {
			foreach(list, nowPath);
		})
	}

	var foreach = function(list, nowPath) {
		if (list.length == 0) {
			var path = '';
			for (var i = 0; i < nowPath.length; i++) {
				path += nowPath[i];
			}
			f.rmdir(path, (error) => {
				if (error) {
					console.log(error)
					isSuccess = false;
				} else {
					if (nowPath.length == 1) {
						callback('success');
					} else {
						nowPath.pop();
						var path = '';
						for (var i = 0; i < nowPath.length; i++) {
							path += nowPath[i];
						}
						f.list(path, (error, list) => {
							foreach(list);
						})
					}
				}
			})
		} else {
			for (var i = 0; i < list.length; i++) {
				if (list[i].type == 'd') {
					nowPath.push('/' + list[i].name);
					var path = '';
					for (var i1 = 0; i1 < nowPath.length; i1++) {
						path += nowPath[i1];
					}
					f.list(path, (error, list) => {
						foreach(list);
					})
				} else {
					var path = '';
					for (var y = 0; y < nowPath.length; y++) {
						path += nowPath[y];
					}
					f.delete(path + '/' + list[i].name, (error) => {
						if (error) {
							isSuccess = false;
						} else {
							if (i == list.length) {
								var path = '';
								for (var i2 = 0; i2 < nowPath.length; i2++) {
									path += nowPath[i2];
								}
								f.list(path, (error, list) => {
									foreach(list);
								})
							}
						}
					})
				}
			}
		}
	}

	/**
	 * 移动文件 moveFile
	 * fromPath、fromName、toPath、toName
	 */
	function move() {
		f.rename(params.oldPath, params.newPath, (error) => {
			if (error) {
				callback('error');
			} else {
				callback('success');
			}
		})
	}

	/**
	 * 重命名 rename
	 * path、oldName、newName
	 */
	function rename() {
		f.rename(params.oldPath, params.newPath, (error) => {
			if (error) {
				callback(error);

			} else {
				callback('success');
			}
		})
	}

	/**
	 * 创建目录 makeDir
	 * remotePath、makePath
	 */
	function makeDir() {
		f.mkdir(params.path, (error) => {
			if (error) {
				callback(error);
			} else {
				callback('success');
			}
		})
	}

	/**
	 * 上传 upload
	 * remotePath(远程目录)、url(文件地址)、fileName(文件名)、type(地址类型-->local本地文件，net非本地文件)
	 */
	function upload() {
		for (var i = 0; i < params.localPath.length; i++) {
			const fileName = path.basename(params.localPath[i]);
			//ElementUI.Message({
			//	message: fileName + '正在上传,剩余' + (params.localPath.length - i - 1) + '个文件',
			//	type: 'success'
			//})
			console.log(params.toPath);
			f.put(params.localPath[i], params.toPath + '/' + fileName, (error) => {
				if (error) {
					callback(error);
				} else {
					callback('success');
					//ElementUI.Message({
						//message: fileName + '上传成功',
						//type: 'success'
					//})

				}
			})
		}

	}

	/**
	 * 下载 download
	 * remotePath(远程目录)、fileName(文件名)、localPath(本地目录)、localName(本地文件名)
	 */
	// var ftpPath=[];
	// var dirPath=[];
	function download() {
		if (params.type == "openFile") {
			var downloadPath = process.cwd();
			downloadPath = downloadPath + "/temp";
			var exist = fs.existsSync(downloadPath);
			if (!exist) {
				fs.mkdirSync(downloadPath);
			}
			var fileName = path.basename(params.path);
			console.log(fileName)
			f.get(params.path, (error, stream) => {
				if (error) {
					callback(fileName + '打开失败');
					return;
				}
				let ws = fs.createWriteStream(downloadPath + "/" + fileName);
				console.log(downloadPath);
				stream.pipe(ws);
				callback(fileName + '下载成功');
			})
			return;
		}
		remote.dialog.showOpenDialog({
			properties: ['openDirectory']
		}, function(files) {
			if (files.length > 0) {
				console.log(files);
				var downloadPath = files[0];
				if (params.downType == 'open') {
					downloadPath += '/openUpload/';
					var exist = fs.existsSync(downloadPath);
					if (!exist) {
						fs.mkdirSync(downloadPath);
					}
				}
				var fileName = path.basename(params.path);
				console.log(fileName)
				if (params.type == 'file') {
					f.get(params.path, (error, stream) => {
						if (error) {
							callback(fileName + '下载失败');
							return;
						}
						let ws = fs.createWriteStream(downloadPath + "/" + fileName);
						console.log(downloadPath);
						stream.pipe(ws);
						callback(fileName + '下载成功');
					})
				}
				if (params.type == 'dir') {
					// var fileName=path.basename(params.path);
					// ftpPath.push(params.path);
					// dirPath.push(downloadPath+fileName+'/');
					// downloadDir();
				}
			}
		})
	}
	/**
	 * 自动备份
	 */
	function backup() {

	}
}

