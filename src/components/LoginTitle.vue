<!--
标题栏模块
 -->
<template>
    <div id="loginTitle">
        <el-container>
            <el-header :style="{height:this.$route.params.height+'px'}">
                <el-row type="flex" justify="space-between">
                    <el-col class="title" :span="10" :style="{lineHeight:this.$route.params.height+'px'}">酷猫云盘</el-col>
                    <el-col class="btn" :span="5">
                        <el-button @click="min" class="min" icon="el-icon-minus" size="mini" type="text" circle></el-button>
                        <el-button @click="max" class="max" icon="el-icon-copy-document" size="mini" type="text" circle :style="{display:this.$route.params.display}"></el-button>
                        <el-button @click="close" class="close" icon="el-icon-close" size="mini" type="text" circle></el-button>
                    </el-col>
                </el-row>
            </el-header>
            <el-main>
                <router-view />
            </el-main>
        </el-container>
    </div>
</template>
<script>
const {ipcRenderer:ipc} = require('electron');
export default {
    name:"loginTitle",
    methods:{
        min:function(){
            ipc.send('loginMin');
        },
        close:function(){
            ipc.send('loginClose');
        },
        max:function(){
            ipc.send('loginMax');
        }
    }
}
</script>
<style>
#loginTitle .el-header{
    height: 70px;
    background: #66a9c9;
    -webkit-app-region: drag;
    -webkit-user-select: none;
}
#loginTitle .el-header .el-row .title{
    line-height: 70px;
    font-size: 1.5em;
    margin-left: 20px;
}
#loginTitle .el-header .el-row .btn{
    text-align: right;
}
#loginTitle .el-header .el-row .btn .el-button{
    -webkit-app-region: no-drag;
    color: white;
    cursor: default;
    margin-top: 2px;
    transition: .5s;
    font-size: 1em;
}
#loginTitle .el-header .el-row .btn .close:hover{
    background: #c02c38;
    transform: rotate(180deg);
}
#loginTitle .el-header .el-row .btn .min:hover,#myTitle .el-header .el-row .btn .max:hover{
    background: #5e7987;
    transform: rotate(180deg);
}
#loginTitle .el-header .el-row .btn .max{
    display: none;
}
</style>