// import {
// 	request
// } from "./request.js"
// var SqliteDB = require('./sqlite.js').SqliteDB;


// /**
//  * @param {Object} type 网盘类型
//  */
// function insertPath(type, params, callback) {
// 	var file = "src/assets/db/filePath.db";
// 	var sqliteDB = new SqliteDB(file);
// 	var deleteTable = "drop table if exists path"
// 	sqliteDB.executeSql(deleteTable, function() {
// 		var createTileTableSql = "create table if not exists path(fileName TEXT, path TEXT , repoId TEXT);";
// 		sqliteDB.createTable(createTileTableSql, function() {
// 			switch (type) {
// 				case "seafile":
// 					request("seafile", "listLibraries", params, function(res) {
// 						var repo_id = []
// 						for (var item of res.data) {
// 							repo_id.push(item.id)
// 						}
// 						console.log(repo_id.length)
// 						for (let i = 0; i < repo_id.length; i++) {
// 							setTimeout(function(){
// 								var repoId = repo_id[i]
								
// 								params.repo_id = repoId
// 								params.path = "/"
								
// 								getFile("seafile", params, sqliteDB, function(res) {
// 									//console.log(res)
// 								})
// 							},i*3000)
// 						}

// 					})
// 					break;

// 			}
// 		});
// 	})

// }



// /**
//  * 递归遍历问价夹
//  * @param {Object} type
//  * @param {Object} params
//  * @param {Object} dbClient
//  * @param {Object} callback
//  */
// function getFile(type, params, dbClient, callback) {
// 	//console.log("*****************************")
// 	console.log(params)
// 	switch (type) {
// 		case "seafile":
// 			request("seafile", "listDirEntriesByP", params, files => {
// 				var fpath = params.path;
// 				for (let i = 0; i < files.data.length; i++) {
// 					var data = [
// 						[files.data[i].name, params.path, params.repo_id],
// 					];
// 					var insertSql = "insert into path(fileName,path,repoId) values(?, ? , ?)";
// 					dbClient.insertData(insertSql, data, function() {
// 						var dirs = []
// 						if (files.data[i].type == "dir") {
// 							var item = {
// 								f_path: fpath,
// 								path: files.data[i].name
// 							}
// 							dirs.push(item)
// 						}

// 						console.log(dirs)
// 						for (let item of dirs) {
// 							let params_ = params
// 							params_.path = item.f_path + '/' + item.path
// 							console.log(`url:  ${params_.path}`)
// 							getFile(type, params_, dbClient, function(res) {
// 								console.log(res)
// 								var querySql = "select * from path";
// 								dbClient.queryData(querySql, function(objects) {
// 									console.log("*********************")
// 									for (var i = 0; i < objects.length; ++i) {
// 										console.log(objects[i]);
// 									}
// 									console.log("*********************")
// 								});
// 							})
// 						}
// 					});
// 					callback(files.data[i].name + " : " + params.path)
// 				}

// 			})
// 			break;

// 		case "ftp":

// 			break;


// 	}

// }


// /**
//  * 查找文件
//  * @param {Object} type
//  * @param {Object} params
//  * @param {Object} callback
//  */
// function selectFile(type, params, callback) {
// 	var file = "src/assets/db/filePath.db";
// 	var sqliteDB = new SqliteDB(file);
// 	switch (type) {
// 		case "seafile":
// 			var sql = `select * from path where fileName LIKE '%${params.fileName}%' `
// 			console.log(sql)
// 			sqliteDB.queryData(sql, function(res) {
// 				var res_ = []
// 				for (var i = 0; i < res.length; ++i) {
// 					//console.log(res[i]);
// 					res_.push(res[i])
// 				}
// 				callback(res_)
// 			})
// 			break;

// 		case "ftp":

// 			break;

// 		case "baidu":
// 			console.log("ss")
// 			request("baidu", "searchFile", params, res => {
// 				console.log(res)
// 			})
// 			break;
// 	}
// }

// export {
// 	insertPath,
// 	selectFile
// }
