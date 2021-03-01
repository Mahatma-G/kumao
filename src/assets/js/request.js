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
const SMB2  =  require('smb2'); 
import { BaiDuRequest } from './baidu.js'
import { seafileRequest } from "./seaFile.js"
import {ftpRequest} from './ftp.js'

//处理所有请求
function request(type, url, params, callback) {
	switch (type) {
		case 'seafile':
			seafileRequest(url, params, callback);
			break;
		case 'ftp':
			ftpRequest(url, params, callback);
			break;
		case 'smb':
			smbRequset(url,params,callback);
			break;
		case 'baidu':
			BaiDuRequest(url,params,callback);
			break;
	}
}

//初始化smb对象
// share （必填）：您要访问的共享
// domain （必填）：用户注册的域
// username （必填）：访问共享的用户名
// password （必填）：密码
// port（可选）：default 445，SMB服务器的端口
// packetConcurrency（可选）：default 20，从共享写入/读取数据时的同时包数
// autoCloseTimeout（可选）：default 10000，关闭SMB2会话和套接字之前的超时时间（以毫秒为单位）（如果设置0为该连接，则除非您这样做，否则将永远不会关闭）
var smbConfig = {}
var smb = (function() {
	var client;
	return function() {
		if (client) {
			return client;
		} else {
			client = new SMB2(smbConfig);
			return client;
		}
	}
})(smbConfig)


//处理smb请求
function smbRequset(url,params,callback){
	var smb_client;
	switch(url){
		case 'link':
			smbConfig = params;
			smb_client = smb()
			callback()
			break;
		case 'upload':
			smb_client = smb();
			console.log(err+'aaaaa')
			smb_client.readdir(params, function(err, files){
			    if(err){
					console.log(err+'sssssssss')
				}else{
					console.log(files)
					console.log("Sdadada")
					callback(files)
				}
				
			});
		break;
	}
}

//处理ftp请求
// function ftpRequest(url, params, callback) {
// 	var base = baseURL + 'ftp/';
// 	var f = new ftp();
// 	var connectConfig;
// 	if (url == 'connect') {
// 		connectConfig = {
// 			host: params.ip,
// 			user: params.userName,
// 			password: params.password,
// 			port: params.port
// 		};
// 	} else {
// 		var loginInfo = JSON.parse(localStorage.getItem('nowLoginInfo'));
// 		connectConfig = {
// 			host: loginInfo.ip,
// 			user: loginInfo.userName,
// 			password: loginInfo.password,
// 			port: loginInfo.port
// 		};
// 	}

// 	f.connect(connectConfig);
// 	f.on('ready', function() {
// 		switch (url) {
// 			case 'connect':
// 				connect();
// 				break;
// 			case 'getFiles':
// 				getFiles();
// 				break;
// 			case 'deleteFile':
// 				deleteFile();
// 				break;
// 			case 'deleteDir':
// 				deleteDir();
// 				break;
// 			case 'rename':
// 				rename();
// 				break;
// 			case 'makeDir':
// 				makeDir();
// 				break;
// 			case 'move':
// 				move();
// 				break;
// 			case 'download':
// 				download();
// 				break;
// 			case 'upload':
// 				upload();
// 				break;
// 		}
// 	})
// 	f.on('error', function() {
// 		switch (url) {
// 			case 'connect':
// 				callback('连接失败，请检查输入信息是否正确！');
// 				break;
// 		}
// 	})

// 	/**
// 	 * 建立连接 connect
// 	 * ip、port、userName、password
// 	 */
// 	function connect() {
// 		callback('success');
// 	}
// 	/**
// 	 * 列出目录下所有文件及文件夹 getFiles
// 	 * pathName
// 	 */
// 	function getFiles() {
// 		f.list(params.pathName, function(err, list) {
// 			var name;
// 			var time;
// 			var file = false;
// 			var directory = false;
// 			var type;
// 			var size;
// 			var fileList = [];
// 			for (var i = 0; i < list.length; i++) {
// 				if (list[i].type == 'd') {
// 					var nowList = {
// 						name: list[i].name,
// 						mtime: list[i].date,
// 						file: false,
// 						directory: true,
// 						type: 1,
// 						size: list[i].size
// 					}
// 					fileList.push(nowList);
// 				}
// 				if (list[i].type == '-') {
// 					var nowList = {
// 						name: list[i].name,
// 						mtime: list[i].date,
// 						file: true,
// 						directory: false,
// 						type: 0,
// 						size: list[i].size
// 					}
// 					fileList.push(nowList);
// 				}
// 			}
// 			callback(fileList);
// 		})
// 	}
// 	/**
// 	 * 复制文件 copyFile
// 	 * sourceFileName(文件名)、sourceDir(文件所在目录)、targetDir(目标目录)
// 	 */
// 	function copyFile() {

// 	}

// 	/**
// 	 * 复制目录 copyDir
// 	 * sourceDir、targetDir
// 	 */


// 	/**
// 	 * 删除文件 deleted
// 	 * path
// 	 */
// 	function deleteFile() {
// 		f.delete(params.path, (error) => {
// 			if (error) {
// 				callback(error);
// 			} else {
// 				callback('success');
// 			}
// 		})
// 	}

// 	/**
// 	 * 删除目录 deleteDir
// 	 * remotePath、dirName
// 	 */
// 	var nowPath = [];
// 	var isSuccess = true;

// 	function deleteDir() {
// 		nowPath.push(params.path);
// 		f.list(params.path, (error, list) => {
// 			foreach(list);
// 		})
// 	}
// 	var foreach = function(list) {
// 		if (list.length == 0) {
// 			var path = '';
// 			for (var i = 0; i < nowPath.length; i++) {
// 				path += nowPath[i];
// 			}
// 			f.rmdir(path, (error) => {
// 				if (error) {
// 					console.log(error)
// 					isSuccess = false;
// 				} else {
// 					if (nowPath.length == 1) {
// 						callback('success');
// 					} else {
// 						nowPath.pop();
// 						var path = '';
// 						for (var i = 0; i < nowPath.length; i++) {
// 							path += nowPath[i];
// 						}
// 						f.list(path, (error, list) => {
// 							foreach(list);
// 						})
// 					}
// 				}
// 			})
// 		} else {
// 			for (var i = 0; i < list.length; i++) {
// 				if (list[i].type == 'd') {
// 					nowPath.push('/' + list[i].name);
// 					var path = '';
// 					for (var i1 = 0; i1 < nowPath.length; i1++) {
// 						path += nowPath[i1];
// 					}
// 					f.list(path, (error, list) => {
// 						foreach(list);
// 					})
// 				} else {
// 					var path = '';
// 					for (var y = 0; y < nowPath.length; y++) {
// 						path += nowPath[y];
// 					}
// 					f.delete(path + '/' + list[i].name, (error) => {
// 						if (error) {
// 							isSuccess = false;
// 						} else {
// 							if (i == list.length) {
// 								var path = '';
// 								for (var i2 = 0; i2 < nowPath.length; i2++) {
// 									path += nowPath[i2];
// 								}
// 								f.list(path, (error, list) => {
// 									foreach(list);
// 								})
// 							}
// 						}
// 					})
// 				}
// 			}
// 		}
// 	}

// 	/**
// 	 * 移动文件 moveFile
// 	 * fromPath、fromName、toPath、toName
// 	 */
// 	function move() {
// 		f.rename(params.oldPath, params.newPath, (error) => {
// 			if (error) {
// 				callback('error');
// 			} else {
// 				callback('success');
// 			}
// 		})
// 	}

// 	/**
// 	 * 重命名 rename
// 	 * path、oldName、newName
// 	 */
// 	function rename() {
// 		f.rename(params.oldPath, params.newPath, (error) => {
// 			if (error) {
// 				callback(error);
// 			} else {
// 				callback('success');
// 			}
// 		})
// 	}

// 	/**
// 	 * 创建目录 makeDir
// 	 * remotePath、makePath
// 	 */
// 	function makeDir() {
// 		f.mkdir(params.path, (error) => {
// 			if (error) {
// 				callback(error);
// 			} else {
// 				callback('success');
// 			}
// 		})
// 	}

// 	/**
// 	 * 上传 upload
// 	 * remotePath(远程目录)、url(文件地址)、fileName(文件名)、type(地址类型-->local本地文件，net非本地文件)
// 	 */
// 	function upload() {
// 		for (var i = 0; i < params.localPath.length; i++) {
// 			const fileName = path.basename(params.localPath[i]);
// 			ElementUI.Message({
// 				message: fileName + '正在上传,剩余' + (params.localPath.length - i - 1) + '个文件',
// 				type: 'success'
// 			})
// 			console.log(params.toPath);
// 			f.put(params.localPath[i], params.toPath + '/' + fileName, (error) => {
// 				if (error) {
// 					callback(error);
// 				} else {
// 					callback('success');
// 					ElementUI.Message({
// 						message: fileName + '上传成功',
// 						type: 'success'
// 					})

// 				}
// 			})
// 		}

// 	}

// 	/**
// 	 * 下载 download
// 	 * remotePath(远程目录)、fileName(文件名)、localPath(本地目录)、localName(本地文件名)
// 	 */
// 	// var ftpPath=[];
// 	// var dirPath=[];
// 	function download() {
// 		var downloadPath = 'F:/fsp/';
// 		var fileName = path.basename(params.path);
// 		if (params.type == 'file') {
// 			f.get(params.path, (error, stream) => {
// 				if (error) {
// 					callback(fileName + '下载失败');
// 					return;
// 				}
// 				let ws = fs.createWriteStream(downloadPath + fileName);
// 				stream.pipe(ws);
// 				callback(fileName + '下载成功');
// 			})
// 		}
// 		if (params.type == 'dir') {
// 			// var fileName=path.basename(params.path);
// 			// ftpPath.push(params.path);
// 			// dirPath.push(downloadPath+fileName+'/');
// 			// downloadDir();
// 		}
// 	}
// 	/**
// 	 * 自动备份
// 	 */
// 	function backup() {

// 	}
// }



export {
	request
}
