const http = require('http');
http.createServer(function(request,response){
  // console.log('request come',request.url);
  // if(request.url=="/home"){
  //   console.log('aaa');
  // } else {
    // console.log(request.url);
  // }
  response.end("request");
}).listen(7888);
var num = setInterval(function(){console.log('a')},1000*60*60*24);