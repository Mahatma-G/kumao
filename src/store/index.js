import Vue from 'vue'
import Vuex from 'vuex'
import{request} from '../assets/js/request.js'
const path = require('path')
import sparkMd5 from 'spark-md5'
import fs from 'fs'
// import crypto from 'crypto'
// import '../assets/js/pinyin.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
	//多网盘登录时的信息
	nd:{},
    //当前网盘信息
    nowInfo:{},
    //当前网盘
    nowType:"",
    //窗口高度
    windowHeight:'658',
    //网盘类型
    type:{
      seafile:{'type':'seafile','name':'Seafile'},
      ftp:{'type':'ftp','name':'FTP'},
      baidu:{'type':'baidu','name':'百度网盘'}
    },
    //当前文件路径
    filePath:[],
    //当前路径所有文件及文件夹
    nowAllFile:[],
    //当前seafile网盘资料库id
    repo_id:'',
    //当前选中的文件或文件夹
    selectList:[],
    //待粘贴文件的资料库id
    copy_repo_id:'',
    //待粘贴文件的路径
    copyPath:[],
    //复制还是剪贴
    copyOrCut:'copy',
    //排序依据
    orderBy:'name',
    //排序规则
    order:'asc',
	//当前正在下载的程序
	downloadFile:[]
  },
  mutations: {
	  
	//更新下载列队
	updateDownLoadList:function(state,args){
		if(state.downloadFile.length < 10){
			for(let i = 0; i < state.downloadFile.length ; i ++){
				if(state.downloadFile[i].fileName == args.fileName){
					state.downloadFile[i].progress = args.progress
					state.downloadFile.push(" ")
					state.downloadFile.pop()
					return
				}
			}
			
			console.log("ss")
			state.downloadFile.push(args)
			
			state.downloadFile.push(" ")
			state.downloadFile.pop()
		}
		
		
		// state.downloadFile[args.fileName] = args.progress
		
		// //保持视图更新
		// state.downloadFile.state = 1
		// delete state.downloadFile.state 
	},
	  
    //添加网盘信息
    add:function(state,args){
      state.nowInfo[args.name]=args.value;
      state.nowType=args.type;
    },
    //更新窗口高度
    updateWindowHeight:function(state,height){
      state.windowHeight=height-40;
    },
    //更新当前路径的文件
    setNowAllFile:function(state,args){
      //按照名称正序
      var name=args;
      var infoByNameZ=name.sort(function compareFunction(obj1,obj2){
        var val1;
        var val2;
        if(state.nowType=='baidu'){
          val1 = obj1.server_filename;
          val2 = obj2.server_filename;
        } else {
          val1 = obj1.name;
          val2 = obj2.name;
        }
        return val1.localeCompare(val2,"zh");
      })
      state.nowAllFile=infoByNameZ;
      console.log(state.nowAllFile);
    },
    //切换排序方式
    orderBy:function(state,args){
      state.orderBy=args.orderBy;
      state.order=args.order;
    },
    //按照名称升序
    orderByNameZ:function(state){
      var name=state.nowAllFile;
      var infoByNameZ=name.sort(function compareFunction(obj1,obj2){
        var val1;
        var val2;
        if(state.nowType=='baidu'){
          val1 = obj1.server_filename;
          val2 = obj2.server_filename;
        } else {
          val1 = obj1.name;
          val2 = obj2.name;
        }
        return val1.localeCompare(val2,"zh");
      })
      state.nowAllFile=infoByNameZ;
    },
    //按照名称降序
    orderByNameD:function(state){
      var name=state.nowAllFile;
      var infoByNameD=name.sort(function compareFunction(obj1,obj2){
        var val1;
        var val2;
        if(state.nowType=='baidu'){
          val1 = obj1.server_filename;
          val2 = obj2.server_filename;
        } else {
          val1 = obj1.name;
          val2 = obj2.name;
        }
        return val2.localeCompare(val1,"zh");
      })
      state.nowAllFile=infoByNameD;
    },
    //按照时间升序
    orderByTimeZ:function(state){
      var time=state.nowAllFile;
      var infoByTimeZ = time.sort(function(obj3,obj4){
        var val3;
        var val4;
        if(state.nowType=='baidu'){
          val3 = obj3.server_mtime;
          val4 = obj4.server_mtime;
        } else if(state.nowType=='ftp') {
          val3 = obj3.mtime.getTime();
          val4 = obj4.mtime.getTime();
        } else {
          val3 = obj3.mtime;
          val4 = obj4.mtime;
        }
        if(val3<val4){
          return -1;
        } else if(val3>val4){
          return 1;
        } else {
          return 0;
        }
      });
      state.nowAllFile=infoByTimeZ;
    },
    //按照时间降序
    orderByTimeD:function(state){
      var time=state.nowAllFile;
      var infoByTimeD = time.sort(function(obj3,obj4){
        var val3;
        var val4;
        if(state.nowType=='baidu'){
          val3 = obj3.server_mtime;
          val4 = obj4.server_mtime;
        } else if(state.nowType=='ftp') {
          val3 = obj3.mtime.getTime();
          val4 = obj4.mtime.getTime();
        } else {
          val3 = obj3.mtime;
          val4 = obj4.mtime;
        }
        if(val3>val4){
          return -1;
        } else if(val3<val4){
          return 1;
        } else {
          return 0;
        }
      });
      state.nowAllFile=infoByTimeD;
    },
    //按照大小升序
    orderBySizeZ:function(state){
      var size=state.nowAllFile;
      var infoBySizeZ = size.sort(function(obj5,obj6){
        var val5 = obj5.size;
        var val6 = obj6.size;
        if(val5<val6){
          return -1;
        } else if(val5>val6){
          return 1;
        } else {
          return 0;
        }
      });
      state.nowAllFile=infoBySizeZ;
    },
    //按照大小降序
    orderBySizeD:function(state){
      var size=state.nowAllFile;
      var infoBySizeD = size.sort(function(obj5,obj6){
        var val5 = obj5.size;
        var val6 = obj6.size;
        if(val5>val6){
          return -1;
        } else if(val5<val6){
          return 1;
        } else {
          return 0;
        }
      });
      state.nowAllFile=infoBySizeD;
    },
    //更新路径
    changeFilePath:function(state,args){
      switch(args.type){
        case 'add':
          state.filePath.push(args);
          break;
        case 'delete':
          var length = state.filePath.length-args.index+1;//截去的长度
          state.filePath.splice(args.index,length);
          break;
        case 'deleteAll':
          state.filePath=[];
          break;
      }
      
    },
    //更新seafile网盘的资料库id
    setRepo_id:function(state,args){
      state.repo_id=args;
    },
    //设置复制和剪切的repo_id和路径
    setCopyOrCut:function(state,args){
      state.copy_repo_id=args.repo_id;
      state.copyPath=args.copyPath;
      state.copyOrCut=args.copyOrCut;
    },
    //百度上传文件
    uploadByBaidu:function(state,args){
      var serverPath=args.path;
      var filesPath=args.chooseFilePath;
      var i = 0;
      var upload = function(){
        console.log(i)
        var fileName=path.basename(filesPath[i]);//文件名
        var states=fs.statSync(filesPath[i]);
        var file=fs.readFileSync(filesPath[i]);//文件
        var uploadPath=serverPath+'/'+fileName;//上传绝对地址
        var fileSize=states.size;//文件大小
        var chunkSize=1024*1024*4;//分片大小
        var md5;
        var newFile = new File(file,fileName,{size:fileSize});
        //计算MD5
        let blobSlice=File.prototype.slice||File.prototype.mozSlice||File.prototype.webkitSlice,
        chunks=Math.ceil(fileSize/chunkSize),//总分片数
        currentChunk=0,
        spark=new sparkMd5.ArrayBuffer(),
        fileReader=new FileReader();
        let time = new Date().getTime();
        fileReader.onload=(e)=>{
          spark.append(e.target.result);
          currentChunk++;
          if (currentChunk < chunks){
            console.log(`第${currentChunk}分片解析完成, 开始第${currentChunk +1} / ${chunks}分片解析`);
            loadNext();
          } else {
            console.log('finished loading');
            md5 = spark.end();//得到md5
            console.log(`MD5计算完成：${fileName} \nMD5：${md5} \n分片：${chunks} 大小:${fileSize} 用时：${new Date().getTime() - time} ms`);
            spark.destroy(); //释放缓存
            console.log(serverPath);
            console.log(fileSize);
            console.log(md5);
            request('baidu','preUploadFile',{path:serverPath,size:fileSize,block_list:[md5]},response=>{
              console.log(response);
            })
            // i++;
            // if(i<filesPath.length){
            //   upload();
            // }
          }
        }
        fileReader.onerror = () => {
          console.warn('oops, something went wrong.');
        };
        let loadNext=()=>{
          let start=currentChunk*chunkSize,
          end = ((start + chunkSize) >= fileSize) ? fileSize : start + chunkSize;
          fileReader.readAsArrayBuffer(blobSlice.call(newFile, start, end));
        };
        loadNext();
      }
      upload();
    }
  },
  actions: {
  },
  modules: {
  }
})
