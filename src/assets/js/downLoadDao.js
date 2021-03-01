var SqliteDB = require('./sqlite.js').SqliteDB;
var file = "src/assets/db/filePath.db";
var sqliteDB = new SqliteDB(file);

/**
 * 储存下载的/上传的文件列表
 */
export function add(fileName, path) {
	var createTileTableSql = "create table if not exists localPath(fileName TEXT, path TEXT);";
	sqliteDB.createTable(createTileTableSql, function() {
		isInsert(fileName, function() {
			var sql = "insert into localPath(fileName,path) values(?, ?)"
			var data = [
				[fileName, path],
			];
			sqliteDB.insertData(sql, data, function() {
				console.log(`${fileName}插入成功`)
			})
		})
	})

}

/**
 * 判断是否已经记录此文件
 * @param {Object} fileName
 */
function isInsert(fileName, callback) {
	var sql = `select * from localPath where fileName = '${fileName}'`
	//console.log(sql)
	sqliteDB.queryData(sql, function(objects) {
		console.log(sql)
		console.log(objects)
		if (objects.length == 0) {
			callback()
		} else {
			console.log(`${fileName}文件已存在`)
		}

	})
}

/**
 * 获取记录的文件
 */
