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
//处理Seafile网盘的请求
export function seafileRequest(url, params, callback) {
	switch (url) {
		//建立连接
		case "link":
			SeaFileInfo = params
			axios({
				url: SeaFileInfo.SERVICE_URL + "/api2/ping/",
				method: 'get',
				headers: {
					'content-type': 'application/x-www-form-urlencoded'
				}
			}).then((response) => {
				callback(response);
			})
			break;

			//登录
		case "obtainAuthToken":
			axios({
				url: SeaFileInfo.SERVICE_URL + "/api2/auth-token/",
				method: 'post',
				data: qs.stringify(params),
				headers: {
					'content-type': 'application/x-www-form-urlencoded'
				}
			}).then((response) => {
				callback(response);
			})
			break;

			//获取账号信息
		case "checkAccountInfo":
			axios({
				url: params.url + "/api2/account/info/",
				method: 'get',
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'Authorization': 'Token ' + params.token,
					'Accept': "application/json",
					'indent': "4"
				}
			}).then((response) => {
				callback(response);
			})
			break;

			//获取资料库
		case 'listLibraries':
			axios({
				url: params.url + "/api2/repos",
				method: 'get',
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'Authorization': 'Token ' + params.token,
					'Accept': "application/json",
					'indent': "4"
				}
			}).then((response) => {
				callback(response);
			})
			break;

			//根据路径列出目录下的文件或文件夹（不包括子目录）
		case 'listDirEntriesByP':
			axios({
				url: params.url + "/api2/repos/" + params.repo_id + "/dir?p=" + params.path,
				method: 'get',
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'Authorization': 'Token ' + params.token,
				}
			}).then((response) => {
				callback(response);
			})
			break;

			//创建新资料库
		case 'createNewLibrary':
			axios({
				url: params.url + "/api2/repos/",
				method: 'post',
				data: qs.stringify({
					name: params.libName
				}),
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'Authorization': 'Token ' + params.token,
					'Accept': "application/json",
					'indent': "4"
				}
			}).then((response) => {
				callback(response);
			})
			break;

			//创建新文件夹
		case 'createNewDir':
			axios({
				url: params.url + "/api2/repos/" + params.repo_id + "/dir/?p=" + params.p,
				method: 'post',
				data: qs.stringify({
					operation: "mkdir"
				}),
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'Authorization': 'Token ' + params.token,
					'Accept': "application/json",
					'indent': "4"
				}
			}).then((response) => {
				callback(response);
			})
			break;

			//文件夹重命名
		case 'renameDir':
			axios({
				url: params.url + "/api2/repos/" + params.repo_id + "/dir/?p=" + params.p,
				method: 'post',
				data: qs.stringify({
					operation: "rename",
					newname: params.newName
				}),
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'Authorization': 'Token ' + params.token,
					'Accept': "application/json",
					'indent': "4"
				}
			}).then((response) => {
				callback(response);
			})
			break;

			//文件重命名
		case 'renameFile':
			axios({
				url: params.url + "/api2/repos/" + params.repo_id + "/file/?p=" + params.p,
				method: 'post',
				data: qs.stringify({
					operation: "rename",
					newname: params.newName
				}),
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'Authorization': 'Token ' + params.token,
					'Accept': "application/json",
					'indent': "4"
				}
			}).then((response) => {
				callback(response);
			})
			break;

			//资料库重命名
		case 'renameRepo':
			axios({
				url: params.url + "/api2/repos/" + params.repo_id + "/?op=rename",
				method: 'post',
				data: qs.stringify({
					repo_name: params.newName
				}),
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'Authorization': 'Token ' + params.token,
					'Accept': "application/json",
					'indent': "4"
				}
			}).then((response) => {
				callback(response);
			})
			break;

			//文件的复制
		case 'copy':
			axios({
				url: params.url + "/api2/repos/" + params.repo_id + "/file/?p=" + params.p,
				method: 'post',
				data: qs.stringify({
					operation: "copy",
					dst_repo: params.dst_repo,
					dst_dir: params.dst_dir
				}),
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'Authorization': 'Token ' + params.token,
					'Accept': "application/json",
					'indent': "4"
				}
			}).then((response) => {
				callback(response);
			})
			break;

			//文件的移动
		case 'moveFile':
			axios({
				url: params.url + "/api2/repos/" + params.repo_id + "/file/?p=" + params.p,
				method: 'post',
				data: qs.stringify({
					operation: "move",
					dst_repo: params.dst_repo,
					dst_dir: params.dst_dir
				}),
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'Authorization': 'Token ' + params.token,
					'Accept': "application/json",
					'indent': "4"
				}
			}).then((response) => {
				callback(response);
			})
			break;

			//删除资料库
		case 'deleteLibrary':
			axios({
				url: params.url + "/api2/repos/" + params.repo_id + "/",
				method: 'delete',
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'Authorization': 'Token ' + params.token,
					'Accept': "application/json",
					'indent': "4"
				}
			}).then((response) => {
				callback(response);
			})
			break;

			//删除文件
		case 'deleteFile':
			axios({
				url: params.url + "/api2/repos/" + params.repo_id + "/file/?p=" + params.p,
				method: 'delete',
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'Authorization': 'Token ' + params.token,
					'Accept': "application/json",
					'indent': "4"
				}
			}).then((response) => {
				callback(response);
			})
			break;

			//删除文件夹
		case 'deleteDir':
			axios({
				url: params.url + "/api2/repos/" + params.repo_id + "/dir/?p=" + params.p,
				method: 'delete',
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'Authorization': 'Token ' + params.token,
					'Accept': "application/json",
					'indent': "4"
				}
			}).then((response) => {
				callback(response);
			})
			break;

			//获取文件上传连接
		case 'uploadLink':
			axios({
				url: params.url + "/api2/repos/" + params.repo_id + "/upload-link/?p=" + params.p,
				method: 'get',
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'Authorization': 'Token ' + params.token,
					'Accept': "application/json",
					'indent': "4"
				}
			}).then((response) => {
				callback(response);
			})
			break;

		case "uploadFile":
			axios({
				url: params.url + "?ret-json=1",
				method: 'post',
				onUploadProgress: function(progressEvent) {
					let complete = (progressEvent.loaded / progressEvent.total * 100 | 0) + '%'
					callback(complete)
				},
				data: params.data,
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'Authorization': 'Token ' + params.token,
				}
			}).then((response) => {
				callback(response);
			})
			break;

			//获取文件下来连接
		case "downLoadFile":
			axios({
				url: params.url + "/api2/repos/" + params.repo_id + "/file/?p=" + params.p + params.reuse_Temp,
				method: 'get',
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'Authorization': 'Token ' + params.token,
					'Accept': "application/json",
					'indent': "4"
				}
			}).then((response) => {
				callback(response);
			})
			break;
	}
}
