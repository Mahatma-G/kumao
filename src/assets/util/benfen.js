import {
	request
} from '../js/request.js'
const buffer = require('buffer');
const fileutil = require('./fileUtil.js')
const fs = require("fs");
const Store = require('electron-store');
const store_ = new Store();
const join = require('path').join
var loaclPath = ""
/**
 * 本地文件夹备份
 * @param {Object} type 网盘类型
 * @param {Object} param 参数
 * @param {function} callback 回调 
 */
function loacl_beifen(type, param, callback) {
	switch (type) {
		case "seafile":
			console.log(param)
			request("seafile", "uploadLink", {
				url: store_.get("SERVICE_URL"),
				token: param.token,
				repo_id: param.repo_id,
				p: param.toPath,
			}, res => {
				var url = res.data
				fileutil.readFile("C:\\Users\\Admin\\Desktop\\ad", function(file) {
					console.log(file)
					for (let i = 0; i < file.length; i++) {
						var formData = new FormData();
						console.log(new Buffer(file[i], "utf8"))
						formData.append('file', new Buffer(file[i]));
						formData.append("parent_dir", param.toPath + "/")
						formData.append("relative_path", "")

						request("seafile", "uploadFile", {
							url: url,
							data: formData,
							token: param.token,
						}, res_ => {
							console.log(res_)
							callback(res_)
						})
					}
				})

			})
			break

		case "ftp":
			const {
				dialog
			} = require('electron').remote;
			dialog.showOpenDialog({
				title: "选择文件夹",
				defaultPath: "",
				properties: ['openDirectory'],
			}).then(result => {
				//console.log(result)
				loaclPath = result.filePaths[0]
				var files = getJsonFiles(loaclPath)
				for (var item of files) {
					request('ftp', 'upload', {
						localPath: files,
						toPath: param.toPath
					}, function() {})
				}
				setTimeout(function() {
					//loaclPath = result.filePaths[0]
					var files = getJsonFiles(loaclPath)
					for (var item of files) {
						request('ftp', 'upload', {
							localPath: files,
							toPath: param.toPath
						}, function() {})
					}
				}, 60000 * 5)

			})

			break;
	}
}



function getJsonFiles(jsonPath) {
	let jsonFiles = [];

	function findJsonFile(path) {
		let files = fs.readdirSync(path);
		files.forEach(function(item, index) {
			let fPath = join(path, item);
			let stat = fs.statSync(fPath);
			if (stat.isDirectory() === true) {
				findJsonFile(fPath);
			}
			if (stat.isFile() === true) {
				jsonFiles.push(fPath);
			}
		});
	}
	findJsonFile(jsonPath);
	return jsonFiles
}





/**
 * 文件夹备份
 * type:"备份网盘类型"
 * path:"备份文件夹路径"
 * toType:"目标网盘"
 * toPath "目标文件路径"
 * time:"备份时间"
 * param:"各个参数"
 * vue:"当前vue实例"
 */
function beifen(type, toType, path, toPath, time, param, vue) {
	switch (type) {
		case "seafile":
			//读取目标文件夹所有文件
			request("seafile", "listDirEntriesByP", {
				url: param.SERVICE_URL,
				repo_id: param.repoid,
				path: path,
				token: param.token
			}, function(files) {
				//相同网盘备份采用复制
				switch (toType) {
					case 'seafile':
						request(toType, "copy", {
							url: store_.get("SERVICE_URL"),
							token: param.token,
							repo_id: param.repoid,
							p: path,
							dst_repo: param.repoid,
							dst_dir: toPath
						}, (response) => {
							console.log(response)
						})
						break;
					default:
						//获取每一个文件的下载路径
						for (let file of files.data) {
							request("seafile", "downLoadFile", {
								url: param.SERVICE_URL,
								repo_id: param.repoid,
								p: path + "/" + file.name,
								reuse_Temp: "",
								token: param.token
							}, function(url) {
								console.log(url)
								if (url.status == 200) {
									if (toType == "bendi") {
										fileutil.downLoad(url.data, toPath, file.name, function(progress, currProgress, total) {
											//console.log(progress)
											vue.$store.commit('updateDownLoadList', {
												fileName: file.name,
												progress: progress,
												dirPath: toPath,
												filePath: toPath + "\\" + file.name
											})
										})
									}
								}

							})
						}

						break;
				}

			})
			// 下载文件到本地
			// request(type,"downLoadFile",param,res=>{

			// })

			break;
		case "ftp":


			break;
		case "baidu":

			break;
	}
}

export {
	loacl_beifen,
	beifen
}

