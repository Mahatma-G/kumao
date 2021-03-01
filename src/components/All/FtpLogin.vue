<template>
	<div id="ftpLogin">
	    <table align="center">
	        <tr>
	            <td width="115" align="right">IP地址：</td>
	            <td width="240"><el-input placeholder="如:192.168.235.132" v-model="info.ip" clearable /></td>
	        </tr>
	        <tr>
	            <td align="right">端口号：</td>
	            <td><el-input placeholder="默认端口号为21" v-model="info.port" clearable /></td>
	        </tr>
	        <tr>
	            <td align="right">用户名：</td>
	            <td><el-input v-model="info.userName" clearable /></td>
	        </tr>
	        <tr>
	            <td align="right">密码：</td>
	            <td><el-input v-model="info.password" show-password /></td>
	        </tr>
	    </table>
	</div>
</template>

<script>
	var FileUtil = require('../../assets/util/fileUtil.js');
	export default {
		name: "FtpLogin",
		props: {
			//conf : Object
		},
		data() {
			return {
				info:{
					 ip:'192.168.43.101',
					port:'',
					userName:'root',
					password:'root'
					
				},
			}
		},
		
		mounted() {
			var that = this
			FileUtil.readConfig('user.json',function(val){
				that.$data.info = val.ftp
			})
		},
		
		methods:{
			setConfig:function(){
				return this.$data.info
			}
		}
	}
</script>

<style>
</style>
