<template>
	<div>
		<!-- <div class="down_item" style="text-align: left;" v-for="(value, key, index) in $store.state.downloadFile">
			{{key}}
			<el-progress v-if="parseInt(value) != 100" :percentage="parseInt(value)"></el-progress>
			<div class="btn" v-if="parseInt(value) == 100">打开文件</div>
		</div> -->
		<div class="down_item" style="text-align: left;" v-for="(item,index) in $store.state.downloadFile">
			{{item.fileName}}
			<el-progress v-if="parseInt(item.progress) != 100" :percentage="parseInt(item.progress)"></el-progress>
			<div @click="openFile(item.filePath)" class="btn" v-if="setFilepath(item)">打开文件</div>
		</div>
	</div>
</template>

<script>
	//import {add} from '../assets/js/downLoadDao.js'
	export default {
		name: '',
		data() {
			return {
		
			}
		},

		computed: {
			//这里需要把store 动态的数据放到computed里面才会同步更新 视图
			getPlayUrl() {
				return this.$store.state.downloadFile
			}
		},

		watch: {
			getPlayUrl() {
				console.log(this.$store.state.downloadFile)
			}
		},

		mounted() {
			console.log(this.$store.state.downloadFile)

		},

		methods: {
			openFile: function(path) {				
				const {shell} = require('electron');
				shell.openItem(path);
			},
			
			setFilepath:function(item){
				console.log(item.progress)
				if(parseInt(item.progress) == 100){
					//add(item.fileName,item.filePath)
					return true
				}else{
					return false
				}
			}
		}
	}
</script>

<style>
	.btn {
		display: inline-block;
		float: right;
		margin-right: 10px;
		font-size: 12px;
		color: #0000FF;
		margin-top: 10px;
	}

	.down_item {
		padding: 10px;
	}

	.down_item:hover {
		background-color: rgba(0, 191, 255, 0.1);
	}
</style>
