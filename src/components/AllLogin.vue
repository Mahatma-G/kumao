<template>
	<div class="allLogin">
		<el-row>
			<el-row>
				<el-steps v-if="ctc" :active="active" finish-status="success">
					<el-step v-for="(item,index) of value" :title="item" :key="index"></el-step>
				</el-steps>
			</el-row>
		</el-row>
		<el-row>
			<el-carousel @change="change" :loop="false" ref="carousel" indicatorPosition="none" arrow="never" :autoplay="false"
			 indicator-position="outside">
				<el-carousel-item name="choose">
					<el-transfer class="choose" :titles="title" v-model="value" :data="data"></el-transfer>
				</el-carousel-item>
				<el-carousel-item v-for="item in value" :name="item" :key="item">
					<SeaFile ref="seafile" v-if="item == 'seafile'"></SeaFile>
					<FtpLogin ref="ftp" v-if="item == 'ftp'"></FtpLogin>
					<BaiDuLogin ref="baidu" v-if="item == 'baidu'"></BaiDuLogin>
				</el-carousel-item>
			</el-carousel>
		</el-row>
		<el-row>
			<center>
				<el-button v-if="ctc" @click="prev" type="primary" plain>{{text2}}</el-button>
				<el-button @click="login" type="primary" plain>{{text}}</el-button>
			</center>
		</el-row>
		<el-dialog title="提示" :visible.sync="dialogVisible" top="30%" width="70%">
			<span>是否重新选择网盘</span>
			<span slot="footer" class="dialog-footer">
				<el-button @click="dialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="rechoose">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	import {
		request
	} from '../assets/js/request.js'
	import SeaFile from './All/SeaFileLogin'
	import FtpLogin from './All/FtpLogin'
	import BaiDuLogin from './All/BaiDuLogin'
	const {
		ipcRenderer: ipc
	} = require('electron');
	var FileUtil = require('../assets/util/fileUtil.js');
	export default {
		components: {
			SeaFile,
			FtpLogin,
			BaiDuLogin
		},
		data() {
			return {
				data: [{
						key: 'seafile',
						label: "SeFile"
					},
					{
						key: 'ftp',
						label: "Ftp"
					},
					{
						key: 'baidu',
						label: "百度网盘"
					},
				],
				text2: '上一步',
				text: '确定',
				value: [],
				title: ["挂载网盘", "已挂载网盘"],
				active: 0,
				ctc: false, //是否选择完网盘
				activeNames: ['1'],
				config: {
					"seafile": {
						"SERVICE_URL": "http://192.168.229.128:8000",
						"FILE_SERVER_ROOT": "http://192.168.229.128:8082",
						"username": "912657787@qq.com",
						"password": "13646460878zyl"
					},
				},
				index: 0,
				dialogVisible: false,
				finish: false
			};
		},

		methods: {
			login: function() {
				var arr = this.$data.value
				var that = this
				if (arr.length == 0) {
					this.$message.error('请至少选择一个网盘');
				} else {
					that.$data.ctc = true
					that.$data.text = "下一步"
					this.$refs.carousel.next();
					if (this.$data.index == this.$data.value.length) {
						var conf = {}
						for (var item of this.$data.value) {
							conf[item] = this.$refs[item][0].setConfig()
						}
						var config = conf
						var chooseConfig = {}
						for (var type of arr) {
							chooseConfig[type] = config[type]
							request(type, 'link', config[type], function(res) {
								if (res.data == "pong") {
									request('seafile', 'obtainAuthToken', config["seafile"], function(res) {
										if (res.data.token != null) {
											chooseConfig["seafile"].token = res.data.token
											that.$data.active++
											if (that.$data.active == arr.length) {
												that.setConfig(config)
												ipc.sendSync('createMainWindow2', {
													type: 'all',
													name: 'config',
													value: chooseConfig
												})
											}
										}
									})
								} else if (res == "success") {
									that.$data.active++
									if (that.$data.active == arr.length) {
										that.setConfig(config)
										ipc.sendSync('createMainWindow2', {
											type: 'all',
											name: 'config',
											value: chooseConfig
										})
									}
								} else if (res.status == 200) {
									config.baidu.token = res.data.access_token
									that.$data.active++
									if (that.$data.active == arr.length) {
										that.setConfig(config)
										ipc.sendSync('createMainWindow2', {
											type: 'all',
											name: 'config',
											value: chooseConfig
										})
									}
								}
							})
						}
					}
				}
			},

			prev: function() {
				if (this.$data.index == 1) {
					this.$data.dialogVisible = true
				} else {
					this.$refs.carousel.prev();
				}
			},

			change: function(res) {
				this.$data.index = res
			},

			rechoose: function() {
				this.$data.dialogVisible = false
				this.$refs.carousel.prev();
				this.$data.ctc = false
				this.$data.text = "完成"
				this.$data.value = []
			},
			
			setConfig:function(config){
				FileUtil.setConfig('user.json',config,function(){})
			}

		}
	};
</script>

<style>
	.allLogin {}

	.choose {
		width: 582px;
		margin: 10px auto;
	}
</style>
