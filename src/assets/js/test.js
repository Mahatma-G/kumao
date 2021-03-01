var SqliteDB = require('./sqlite.js').SqliteDB;

var file = "filePath.db";

 var sqliteDB = new SqliteDB(file);

// var createTileTableSql = "create table if not exists tiles(level INTEGER, column INTEGER, row INTEGER, content BLOB);";

// sqliteDB.createTable(createTileTableSql);

// var tileData = [
// 	[1, 10, 10],
// 	[1, 11, 11],
// 	[1, 10, 9],
// 	[1, 11, 9]
// ];

// var insertTileSql = "insert into tiles(level, column, row) values(?, ?, ?)";

// sqliteDB.insertData(insertTileSql, tileData);

querySql = "select * from path";

sqliteDB.queryData(querySql, function(objects) {
	for (var i = 0; i < objects.length; ++i) {

		console.log(objects[i]);

	}
});

sqliteDB.close();
