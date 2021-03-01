<template>
	<div id='baiDuLogin'>
		<table align="center">
			<tr>
				<td>请输入code：</td>
				<td>
					<el-input v-model="code" clearable></el-input>
				</td>
			</tr>
			<tr>
				<td colspan="2" align="center">
					<el-button @click="getCode" type="primary">获取code</el-button>
					<el-button @click="login" type="primary">登录</el-button>
				</td>
			</tr>
		</table>

		<div style="background-color:#FFF;position: absolute; top: 50%; opacity: 0.8;">
			<iframe id="my-iframe" :src="orderFoodUrl" frameborder="0" style="height: 280px;width: 660px" />
		</div>
	</div>
</template>

<script>
	import {
		request
	} from '../assets/js/request.js';
	const {
		ipcRenderer: ipc
	} = require('electron');
	export default {
		name: 'baiDuLogin',
		data() {
			return {
				code: '',
				getCodeWindow: '',
				orderFoodUrl: ''
			}
		},
		methods: {
			login: function() {
				// if (this.getCodeWindow != '') {
				// 	this.getCodeWindow.close();
				// }
				if (this.code == '') {
					this.$message({
						message: 'code不能为空，请重新获取！'
					})
				} else {
					request('baidu', "get_access_token", {
						code: this.code
					}, function(response) {
						console.log(response);
						if (response.status == 200) {
							ipc.sendSync('createMainWindow', {
								type: 'baidu'
							});
						} else {
							this.$message({
								message: 'code错误请重新获取！'
							})
						}
					})
				}
			},
			getCode: function() {
				// var windows = window.open(
				// 	"https://openapi.baidu.com/oauth/2.0/authorize?response_type=code&client_id=YfnalYdC6vEKZhv4YEXYCXlu&redirect_uri=oob&scope=netdisk"
				// );
				// this.getCodeWindow = windows;
				this.orderFoodUrl = "https://openapi.baidu.com/oauth/2.0/authorize?response_type=code&client_id=YfnalYdC6vEKZhv4YEXYCXlu&redirect_uri=oob&scope=netdisk"
			}
		}
	}
</script>

<style>
	#baiDuLogin .el-input {
		padding: 5px 3px;
	}
</style>

