<template>
    <div id="login">
        <table align="center">
            <tr>
                <td width="115" align="right">登录类型：</td>
                <td width="240">
                    <el-select v-model="type" @change="typeChange">
                        <el-option value="Seafile">Seafile</el-option>
                        <el-option value="FTP">FTP</el-option>
						<el-option value="baidu">百度网盘</el-option>
						<el-option value="smb">SMB</el-option>
						<el-option value="all">批量登录</el-option>
                    </el-select>
                </td>
            </tr>
        </table>
        <router-view />
    </div>
</template>
<script>
export default {
    name:'login',
    data(){
        return{
            type:'Seafile'
        }
    },
    methods:{
        typeChange:function(){
            switch(this.type){
                case 'Seafile':
                    this.$router.push({name:'seafileLogin'});
                    break;
                case 'FTP':
                    this.$router.push({path:'ftpLogin'});
                    break;
				case 'baidu':
					this.$router.push({path:'baiDuLogin'});
					break;
				case 'smb':
					this.$router.push({path:'SMBLogin'});
					break;
				case 'all':
					this.$router.push({path:'AllLogin'});
					break;
            }
        }
    }
}
</script>
<style>
#login{
    text-align: left;
}
#login .el-select{
    padding: 5px 3px;
}
</style>