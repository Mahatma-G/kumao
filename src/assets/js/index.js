const os = require('os');
const file = require('fs');
const exec = require('child_process').exec;
var allDirectories;
var myHost;



//获取本地IP
function getIPAdress() {
    var interfaces = os.networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}
myHost = getIPAdress();


//获取目录
//directories 目录名  为 / 时获取所有一级目录
 	 function getAllDirectories(directories){
		 exec('ls '+directories,(error,stdout,stderr)=>{
		 		if(error){
		 				console.error('执行的错误:'+error);
		 				return;
		 			}else{	
		 				allDirectories=stdout;
		 			}
		 		});
	 }
	 
//创建文件夹
//directoriesName  创建文件夹目录/文件夹  eg:/home/a 在home目录下创建a文件夹
	 function createDirectories(directoriesName){
		 exec('mkdir '+directoriesName,(error,stdout,stderr)=>{
				if(error){
						console.error('执行的错误:'+error);
						return;
					}
		 })
	 }
	 
//创建文件  eg:/home/a.txt 在home目录下创建a.txt文件
//directoriesName  要创建文件的路径 
	 function createFile(directoriesName){
		 exec('touch '+directoriesName,(error,stdout,stderr)=>{
				if(error){
						console.error('执行的错误:'+error);
						return;
					}
		 })
	 }
	
//删除文件   eg:/home/a.txt 删除home目录下的a.txt文件   eg:b.txt 删除b.txt文件，必须在b.txt所在目录
//directoriesName 要删除文件的路径
	function deleteDirectories(directoriesName){
		exec('rm -rf '+directoriesName,(error,stdout,stderr)=>{
				if(error){
						console.error('执行的错误:'+error);
						return;
						}
					})
	}
	
//移动文件  重命名文件
//directoriesfileName 移动文件所在目录
//targetDirectoriesNewFileName 移动目标目录
//eg: mv /home/a.txt /home/node/b.txt  将/home目录下的a.txt移动到home/node目录下并且重命名为b.txt  重命名文件时目录前后不变
	function moveDirectories(directoriesfileName,targetDirectoriesNewFileName){
		exec('mv '+directoriesfileName+' '+targetDirectoriesNewFileName,(error,stdout,stderr)=>{
				if(error){
						console.error('执行的错误:'+error);
						return;
						}
					})
	}
	
//复制文件
//directoriesfileName 移动文件所在目录
//targetDirectoriesNewFileName 移动目标目录
//eg: mv /home/a.txt /home/node/b.txt  将home目录下的a.txt复制到home/node目录下并且重命名为b.txt
	function copyDirectories(directoriesfileName,targetDirectoriesNewFileName){
		exec('cp '+directoriesfileName+' '+targetDirectoriesNewFileName,(error,stdout,stderr)=>{
				if(error){
						console.error('执行的错误:'+error);
						return;
						}
					})
	}
	

	


	
//服务端===========================================================
	 
	 
//设置共享文件夹 
//shareDirectories  共享文件夹路径
//shareIP  共享网段IP eg:192.168.14.106表示只有这一台主机可以挂载  eg:192.168.14.*表示14网段下所有主机都可以挂载  *表示局域网内所有主机都可以挂载
//permissionGroup(传数组)权限组:
//restartCallback  回调函数，此处调用restart函数
	function setUpShareDirectories(shareDirectories,shareIP,permissionGroup,restartCallback){
		file.writeFile('/etc/exports',shareDirectories+' '+shareIP+'('+permissionGroup+')',restartCallback)		
	}

//重新输出共享目录
	function restart(){
		exec('exportfs -rv',(error,stdout,stderr)=>{
						if(error){
								console.error('执行的错误:'+error);
								return;
							}
		})
	}
	
	
		
	
//客户端========================================================
//serverIP服务端IP
//shareDirectory服务端共享目录
//mountDirectory客服端挂载目录
	function clientMountDirectory(serverIP,shareDirectory,mountDirectory){
		exec('mount -t nfs '+serverIP+':'+shareDirectory+' '+mountDirectory,(error,stdout,stderr)=>{
						if(error){
								console.error('执行的错误:'+error);
								return;
							}
		})
	}
	
	
	 
