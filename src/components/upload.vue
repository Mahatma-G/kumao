<template>
    <div id="upload">
        <uploader 
                :options="options" 
                :fileStatusText="fileStatusText" 
                :autoStart="false" 
                @file-added="onFileAdded"
                class="uploader-example">
            <uploader-unsupport></uploader-unsupport>
            <!-- @file-added="onFileAdded" -->
            <uploader-drop>
                <p>将文件拖拽到此处</p>
                <uploader-btn :directory="false">点击上传</uploader-btn>
            </uploader-drop>
            <uploader-list></uploader-list>
        </uploader>
    </div>
</template>
<script>
import SparkMD5 from 'spark-md5'
export default {
    name:'upload',
    data(){
        return {
            options:{
                target:()=>{
                    var a = true;
                    if(a){
                        return 'http://localhost:7888/upload';
                    } else {
                        return 'aa';
                    }
                },
                testChunks:true,
                chunkSize:1024*1024*2,
                checkChunkUploadedByResponse:(chunk,message)=>{
                    // let obj = JSON.parse(message);
                    // if(obj.isExist){
                    //     this.statusTextMap.success='秒传文件';
                    //     return true;
                    // }
                    // return (obj.uploaded || []).indexOf(chunk.offset+1)>=0
                },
            },
            statusTextMap:{
                success:'上传成功',
                error:'上传出错了',
                uploading:'上传中...',
                paused:'暂停',
                waiting:'等待中',
                cmd5:'计算MD5...'
            },
            fileStatusText:(status,response)=>{
                return this.statusTextMap[status];
            }
        }
    },
    methods:{
        onFileAdded(file){
            this.computeMD5(file);
        },
        computeMD5(file){
            let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
                chunkSize = 1024*1024*2,
                chunks = Math.ceil(file.size / chunkSize),
                currentChunk = 0,
                spark = new SparkMD5.ArrayBuffer(),
                fileReader = new FileReader();
            let time = new Date().getTime();
            file.cmd5=true;
            fileReader.onload=(e)=>{
                spark.append(e.target.result);
                currentChunk++;
                if(currentChunk<chunks){
                    console.log(`第${currentChunk}片解析完成，开始第${currentChunk+1}/${chunks}分片解析`);
                    loadNext();
                } else {
                    console.log('finished loading');
                    let md5 = spark.end();
                    console.log(`md5计算完成:${file.name}\nMD5:${md5}\n分片：${chunks}\n大小：${file.size}\n用时：${new Date().getTime()-time}ms`);
                    spark.destroy();
                    file.uniqueIdentifier = md5;
                    file.cmd5=false;
                    file.resume();
                }
            };
            fileReader.onerror=()=>{
                console.log('oops,something went wrong.');
                file.cancel();
            };
            let loadNext=()=>{
                let start = currentChunk * chunkSize,
                    end = ((start+chunkSize)>=file.size) ? file.size : start+chunkSize;
                fileReader.readAsArrayBuffer(blobSlice.call(file.file,start,end));
            };
            loadNext();
        }
    }
}
</script>
<style>
.uploader-example {
    width: 880px;
    padding: 15px;
    margin: 40px auto 0;
    font-size: 12px;
    box-shadow: 0 0 10px rgba(0, 0, 0, .4);
}
.uploader-example .uploader-btn {
  margin-right: 4px;
}
.uploader-example .uploader-list {
    max-height: 440px;
    overflow: auto;
    overflow-x: hidden;
    overflow-y: auto;
}
</style>