/**
 * 文件处理工具类
 */
const fs = require('fs');
const path_ = require('path');
const http = require('http');

class FileUtil {
	/**
	 * 读取config文件夹中的json配置文件
	 */
	readConfig(fileName, callback) {
		var list;
		var url = '../../../../../../src/assets/config/' + fileName;
		fs.readFile(path_.join(__dirname, url), 'utf8', function(err, data) {
			if (err) throw err;
			list = JSON.parse(data);
			callback(list)
		});
	}

	/**
	 * 修改配置文件
	 */
	setConfig(fileName, newConfig, callback) {
		var url = '../../../../../../src/assets/config/' + fileName;
		fs.writeFile(path_.join(__dirname, url), JSON.stringify(newConfig), 'utf8', (err) => {
			if (err) throw err;
			callback()
		});
	}

	/**
	 * 读取本地文件
	 * C:\\Users\\Admin\\Desktop\\安卓项目原型图
	 * @param {Object} path
	 */
	readFile(path, callback) {
		fs.readdir(path, function(err, files) {
			if(err){
				console.log(err)
				return
			}
			
			var dirs = [];
			(function iterator(i) {
				if (i == files.length) {
					callback(dirs);
					return;
				}
				fs.stat(path_.join(path, files[i]), function(err, data) {
					if (data.isFile()) {
						var chunks = [];
						var length = 0;

						var file = fs.createReadStream(path_.join(path, files[i]), {
							encoding: null,
							highWaterMark: 1024 * 1024 * 1024,
							autoClose:true,
						})
						console.log(file)
						
						file.on('data',(data)=>{
						    console.log(data);
							dirs.push(data)
							iterator(i + 1);
						});
						
						// fs.readFile(path_.join(path, files[i]), null, function(error, data) {
						// 	dirs.push(data)
						// 	iterator(i + 1);
						// })

					}
					
				});
			})(0);
		});
	}

	/**
	 * 下载文件
	 * @param {Object} url 文件地址
	 * @param {Object} path 本地路径
	 * @param {Object} fileNamename 文件名
	 */
	downLoad(url, path, fileName, callback, callback_) {
		const dest = path_.join(path, fileName);
		console.log(dest)
		const file = fs.createWriteStream(dest);
		//console.log(url)
		http.get(url, (res) => {
			if (res.statusCode !== 200) {
				return;
			}
			const len = parseInt(res.headers['content-length']) // 文件总长度
			let cur = 0
			const total = (len / 1048576).toFixed(2) // 转为M 1048576 - bytes in  1Megabyte

			res.on('data', function(chunk) {
				cur += chunk.length
				const progress = (100.0 * cur / len).toFixed(2) // 当前进度
				const currProgress = (cur / 1048576).toFixed(2) // 当前了多少
				callback(progress, currProgress, total)
			})


			res.on('end', () => {
				console.log('finish download');
			});
			file.on('finish', (res) => {
				file.close();
				callback_()
				//callback(res)
			}).on('error', (err) => {
				console.log(err)
				//fs.unlink(path);
			});
			res.pipe(file);
		});
	}

	/**
	 * 获取本地文件上传对象
	 * @param {Object} filepath
	 * @param {Object} filename
	 */
	getFileObj(filepath, filename) {
		var formData = {
			filename: filename,
			file: fs.createReadStream(filepath)
		};

		return formData
	}

	/**
	 * 唯一id
	 */
	getUuid() {
		var s = [];
		var hexDigits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
		for (var i = 0; i < 36; i++) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
		}
		s[14] = "4"
		s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
		s[8] = s[13] = s[18] = s[23] = "-"
		let uuid = s.join("")
		return uuid
	}


}

module.exports = new FileUtil();
