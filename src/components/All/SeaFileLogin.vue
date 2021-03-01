<template>
	<div id='seafileLogin'>
		<table align="center">
			<tr>
				<td width="115" align="right">网盘服务地址：</td>
				<td width="240">
					<el-input v-model="config.SERVICE_URL" placeholder="如:http://192.168.235.132:8000" clearable />
				</td>
			</tr>
			<tr>
				<td align="right">网盘文件地址：</td>
				<td>
					<el-input v-model="config.FILE_SERVER_ROOT" placeholder="如:http://192.168.235.132:8082" clearable />
				</td>
			</tr>
			<tr>
				<td align="right">用户名：</td>
				<td>
					<el-input v-model="config.username" placeholder="请输入网盘用户名" clearable />
				</td>
			</tr>
			<tr>
				<td align="right">密码：</td>
				<td>
					<el-input v-model="config.password" placeholder="请输入网盘密码" show-password />
				</td>
			</tr>
		</table>
	</div>
</template>

<script>
	var FileUtil = require('../../assets/util/fileUtil.js');
	export default {
		name: "SeaFIleLogin",
		props: {
			conf : Object,
			
		},
		data() {
			return {
				config: {
					  "SERVICE_URL": "http://192.168.43.101:8000",
					       "FILE_SERVER_ROOT": "http://192.168.43.101:8082",
					       "username": "admin@123.com",
					       "password": "admin",
				}
			}
		},
		
		mounted() {
			var that = this
			FileUtil.readConfig('user.json',function(val){
				that.$data.config = val.seafile
				
			})
		},
		
		methods:{
			setConfig:function(){
				return this.$data.config;
			}
		}
		
	}
</script>

<style>
</style>
