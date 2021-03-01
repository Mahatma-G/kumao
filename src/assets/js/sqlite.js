// var fs = require('fs');
// var sqlite3 = require('sqlite3').verbose();
 
// var DB = DB || {};
 
// DB.SqliteDB = function(file){
//     DB.db = new sqlite3.Database(file);
 
//     DB.exist = fs.existsSync(file);
//     if(!DB.exist){
//         console.log("Creating db file!");
//         fs.openSync(file, 'w');
//     };
// };
 
// DB.printErrorInfo = function(err){
//     console.log(err);
// };
 
// DB.SqliteDB.prototype.createTable = function(sql,callback){
//     DB.db.serialize(function(){
//         DB.db.run(sql, function(err){
//             if(null != err){
//                 DB.printErrorInfo(err);
//                 return;
//             }else{
// 				callback()
// 			}
//         });
//     });
// };
 
// DB.SqliteDB.prototype.insertData = function(sql, objects,callback){
//     DB.db.serialize(function(){
//         var stmt = DB.db.prepare(sql);
//         for(let i = 0; i < objects.length; ++i){
//             stmt.run(objects[i],function(){
// 				callback()
// 			});
//         }
    
//         stmt.finalize();
//     });
// };
 
// DB.SqliteDB.prototype.queryData = function(sql, callback){
//     DB.db.all(sql, function(err, rows){
//         if(null != err){
//             DB.printErrorInfo(err);
//             return;
//         }
 
//         /// deal query data.
//         if(callback){
//             callback(rows);
//         }
//     });
// };
 
// DB.SqliteDB.prototype.executeSql = function(sql,callback){
//     DB.db.run(sql, function(err){
//         if(null != err){
//             DB.printErrorInfo(err);
//         }else{
// 			callback()
// 		}
//     });
// };
 
// DB.SqliteDB.prototype.close = function(){
//     DB.db.close();
// };
 
// /// export SqliteDB.
// exports.SqliteDB = DB.SqliteDB;