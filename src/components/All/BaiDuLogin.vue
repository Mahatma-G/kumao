<template>
	<div id="ftpLogin">
	    <table align="center">
	        <tr>
	            <td width="115" align="right">code：</td>
	            <td width="240"><el-input placeholder="" v-model="info.code" clearable /></td>
				<td>
					<el-button style="margin-left: 10px;"  @click="getCode" type="primary">获取code</el-button>
				</td>
	        </tr>
			<tr>
			    <td width="115" align="right">登录状态：</td>
			    <td width="240"><span :class="isOk ? 'green' : 'red'" style="height: 60px; line-height: 60px; font-size: 14px;">{{status}}</span></td>
			</tr>
	    </table>
		<div style="position: absolute; top: 30%; opacity: 0.8;">
			<iframe id="my-iframe" 
			src="https://openapi.baidu.com/oauth/2.0/authorize?response_type=code&client_id=YfnalYdC6vEKZhv4YEXYCXlu&redirect_uri=oob&scope=netdisk"
			 frameborder="0" style="height: 200px;width: 680px" />
		</div>
	</div>
</template>

<script>
	import {request} from '../../assets/js/request.js'
	var FileUtil = require('../../assets/util/fileUtil.js');
	const Store = require('electron-store');
	const store = new Store();
	export default {
		name: "BaiDuLogin",
		props: {
			//conf : Object
		},
		data() {
			return {
				info:{
					
				},
				status:"",
				isOk:true
			}
		},
		
		mounted() {
			var that = this
			FileUtil.readConfig('user.json',function(val){
				that.$data.info = val.baidu
				store.set("access_token", val.baidu.token)
				request("baidu",'getCapacity',{},function(res){
					if(res.status == 200){
						that.$data.isOk = true
						that.$data.status="登录尚未过期，不需要重新获取coke"
					}else{
						that.$data.isOk = false
						that.$data.status="登录过期，请重新获取coke"
					}
				})
			})
		},
		
		methods:{
			setConfig:function(){
				return this.$data.info
			},
		}
	}
</script>

<style>
	.green{
		color: green;
	}
	
	.red{
		color: red;
	}
</style>

