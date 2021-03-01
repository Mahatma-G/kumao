<template>
    <div id="nullPage">
        此文件夹为空，可以进行<el-link type="primary">上传</el-link>
    </div>
</template>
<script>
export default {
    name:'nullPage'
}
</script>
<style>
#nullPage{
    width: 100%;
    height: 100%;
    font-size: 0.9em;
    padding-top:20px;
    -webkit-user-select: none;
    box-sizing: border-box;
}
#nullPage .el-link{
    vertical-align: bottom;
}
</style>