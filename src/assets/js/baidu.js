import axios from 'axios'
import qs from 'qs'
import ftp from 'ftp'
import fs from 'fs'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import store from '../../store'
const path = require('path')
const baseURL = 'http://127.0.0.1:8083/'
const {ipcRenderer:ipc} = require('electron');
var SeaFileInfo //保存配置信息
const Store = require('electron-store');
const store_ = new Store();

//百度请求
//path:文件绝对路径
export function BaiDuRequest(url,params,callback){
	let access_token=store_.get("access_token");
	let API_Key="YfnalYdC6vEKZhv4YEXYCXlu";//nIoc7T7GA953ao9LWfd53zGf
	let Secret_Key="Y87PWesI9tt9GWarQFqDj1jQWoNFWhQ2";
	let code="b31e9f584bec34f859d89bc236d6beef";
	switch(url){
		//跳转授权
		case 'login':
			window.open("https://openapi.baidu.com/oauth/2.0/authorize?response_type=code&client_id=YfnalYdC6vEKZhv4YEXYCXlu&redirect_uri=oob&scope=netdisk");
			callback()
		break;
		
		case 'link':
			axios({
					url:"https://openapi.baidu.com/oauth/2.0/token?grant_type=authorization_code&code="+params.code+"&client_id="+API_Key+"&client_secret="+Secret_Key+"&redirect_uri=oob",
					method:'get'
				}).then((response)=>{
					
					store_.set("access_token",response.data.access_token)
					callback(response);
			})
		break;
		
		//获取access_token
		case 'get_access_token':
			axios({
				url:"https://openapi.baidu.com/oauth/2.0/token?grant_type=authorization_code&code="+params.code+"&client_id="+API_Key+"&client_secret="+Secret_Key+"&redirect_uri=oob",
				method:'get'
			}).then((response)=>{
				console.log(store_)
				store_.set("access_token",response.data.access_token)
				callback(response);
			})
		break;
		
		//获取网盘容量信息
		case 'getCapacity':
			axios({
				url:"https://pan.baidu.com/api/quota?access_token="+access_token+"&checkfree=1&checkexpire=1",
				method:'get'
			}).then((response)=>{
				callback(response);
			})
		break;
		
		//获取文件列表列表
		case 'getfileList':
			axios({
				url:"https://pan.baidu.com/rest/2.0/xpan/file?method=list&order=name&start=0&folder=0&access_token="+access_token+"&dir="+params.path,
				method:'get'
			}).then((response)=>{
				callback(response);
			})
		break;
		
		//递归获取文件列表
		case 'getRecursionFileList':
			axios({
				url:"https://pan.baidu.com/rest/2.0/xpan/multimedia?method=listall&access_token="+access_token+"&path="+params.path+"&order=name&recursion=0&web=1&start=0&limit=100",
				method:'get'
			}).then((response)=>{
				callback(response);
			})
		break;
		
		//获取文档列表
		case 'getDocumentList':
			axios({
				url:"https://pan.baidu.com/rest/2.0/xpan/file?method=doclist&access_token="+access_token+"&order=name",
				method:'get'
			}).then((response)=>{
				callback(response);
			})
		break;
		
		//获取图片列表
		case 'getImageList':
			axios({
				url:"https://pan.baidu.com/rest/2.0/xpan/file?method=imagelist&access_token="+access_token+"&order=name&recursion=1",
				method:'get'
			}).then((response)=>{
				callback(response);
			})
		break;
		
		//获取bt列表
		case 'getbtlist':
			axios({
				url:"https://pan.baidu.com/rest/2.0/xpan/file?method=btlist&access_token="+access_token,
				method:'get'
			}).then((response)=>{
				callback(response);
			})
		break;
		
		//获取分类文件总个数 filetype:文件类型， 1 视频、2 音频、3 图片、4 文档、5 应用、6 其他、7 种子
		case 'getFileTypeNum':
			axios({
				url:"https://pan.baidu.com/api/categoryinfo?category="+params.filetype+"&recursion=1&access_token="+access_token,
				method:'get'
			}).then((response)=>{
				callback(response);
			})
		break;
		
		//获取分类文件列表  filetype:文件类型， 1 视频、2 音频、3 图片、4 文档、5 应用、6 其他、7 种子
		case 'getFileTypeList':
			axios({
				url:"https://pan.baidu.com/rest/2.0/xpan/multimedia?method=categorylist&category="+params.filetype+"&access_token="+access_token,
				method:'get'
			}).then((response)=>{
				callback(response);
			})
		break;
		
		//搜索文件 key:文件名关键字
		case 'searchFile':
			axios({
				url:"https://pan.baidu.com/rest/2.0/xpan/file?method=search&recursion=1&key="+params.key+"&access_token="+access_token,
				method:'get'
			}).then((response)=>{
				callback(response);
			})
		break;
		
		//文件删除
		case 'fileDelete':	
			axios({
				url:"https://pan.baidu.com/rest/2.0/xpan/file?method=filemanager&async=1&opera=delete&access_token="+access_token,
				method:'post',
				data:qs.stringify({
					filelist:'["'+params.path+'"]',
				}),
				headers:{
					'Content-Type':'multipart/form-data'
				}			
		}).then((response)=>{
			callback(response);
		})
		break;
		
		//文件重命名 newname:新文件名
		case 'fileRename':
			var path={
				"path":params.path,
				"newname":params.newname,
				"ondup":"newcopy"
			}
			var path1=JSON.stringify(path)
			axios({
				url:"https://pan.baidu.com/rest/2.0/xpan/file?method=filemanager&async=2&opera=rename&access_token="+access_token,
				method:'post',
				data:qs.stringify({
					filelist:'['+path1+']',
				}),
				headers:{
					'Content-Type':'multipart/form-data'
				}
		}).then((response)=>{
			callback(response);
			console.log(response);
		})
		break;
		
		//文件复制,粘贴，dest:目标目录
		case 'fileCopy':
			var path={
				"path":params.path,
				"dest":params.dest,
				"ondup":"newcopy"
			}
			var path1=JSON.stringify(path)
			axios({
				url:"https://pan.baidu.com/rest/2.0/xpan/file?method=filemanager&async=2&opera=copy&access_token="+access_token,
				method:'post',
				data:qs.stringify({
					filelist:'['+path1+']',
				}),
				headers:{
					'Content-Type':'multipart/form-data'
				}
		}).then((response)=>{
			callback(response);
			console.log(response);
		})
		break;
		
		//文件移动,dest:目标目录
		case 'fileMove':
			var path={
				"path":params.path,
				"dest":params.dest,
				"ondup":"newcopy"
			}
			var path1=JSON.stringify(path)
			axios({
				url:"https://pan.baidu.com/rest/2.0/xpan/file?method=filemanager&async=2&opera=move&access_token="+access_token,
				method:'post',
				data:qs.stringify({
					filelist:'['+path1+']',
				}),
				headers:{
					'Content-Type':'multipart/form-data'
				}
		}).then((response)=>{
			callback(response);
		})
		break;
		
		//创建文件夹"/BTBD"
		case 'createfolder':
			axios({
				url:"https://pan.baidu.com/rest/2.0/xpan/file?method=create&access_token="+access_token,
				method:'post',
				data:qs.stringify({
					path:params.path,
					size:0,
					isdir:1,
				}),
				headers:{
					'Content-Type':'multipart/form-data'
				}
		}).then((response)=>{
			callback(response);
			console.log(response)
		})
		break;
				
		//预上传文件
		/* 
		 path:文件上传绝对路径
		 size:文件大小
		 block_list:各分片md5
		 */
		case 'preUploadFile':
			axios({
				url:"https://pan.baidu.com/rest/2.0/xpan/file?method=precreate&access_token="+access_token,
				method:'post',
				data:qs.stringify({
					path:"/BTBD"+params.path,
					size:params.size,
					isdir:0,
					autoinit:1,
					block_list:params.block_list
				}),
				headers:{
					'Content-Type':'multipart/form-data'
				}
			}).then((response)=>{
			callback(response);
		})
		
		//分片上传文件
		/*
		 path:文件绝对路径
		 uploadid:文件预上传返回uploadid
		 file:文件内容
		 partseq:文件分片的位置序号，参考预上传接口返回的block_list,为0则不分片
		 */
		case 'sliceUploadFile':
			axios({
				url:"https://d.pcs.baidu.com/rest/2.0/pcs/superfile2&access_token="+access_token,
				method:'post',
				data:qs.stringify({
					method:"upload",
					type:"tmpfile",
					path:"/BTBD"+params.path,
					uploadid:params.uploadid,
					file:params.file,
					partseq:params.partseq
				}),
				headers:{
					'Content-Type':'multipart/form-data'
				}
			}).then((response)=>{
			callback(response);
			console.log(response)
		})
	}
}


