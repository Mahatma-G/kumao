var SqliteDB = require('../js/sqlite.js').SqliteDB;

var file = "filePath.db"; 

var sqliteDB = new SqliteDB(file);

var sql = "select * from path where fileName LIKE '%te%' "

sqliteDB.queryData(sql, function(objects) {
	for (var i = 0; i < objects.length; ++i) {

		console.log(objects[i]);

	}
});

sqliteDB.close();