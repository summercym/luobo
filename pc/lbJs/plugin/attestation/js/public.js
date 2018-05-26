//获取url参数
function UrlRequest(_url) {
	var url = _url?String(_url):String(document.location);//获取url中"?"符后的字串
	var theRequest = new Object();
	if (url.indexOf("?") != -1) {
		var str = url.substr(url.indexOf("?")+1);
		if(str.indexOf("#")!= -1){str=str.substr(0,str.indexOf("#"))}
		strs = str.split("&");
		for(var i = 0; i < strs.length; i ++) {
			var indexOfadd=strs[i].indexOf("=");
			if (indexOfadd>0){
				var key=strs[i].substr(0,indexOfadd);
				var value=strs[i].substr(indexOfadd+1);
				theRequest[key]=((key in theRequest)?(theRequest[key]+","):"")+value;
			}
      }
   }
   return theRequest;
}