//获取url中的参数对象
function urlRequest(_url) {
	var url=String(_url);
	var content=this;
	var noProUrl="";//无协议链接
	var noHostUrl="";//无端口链接
	var theProtocol = "";//协议
	var theHost = ""; //服务器
	var thePage = ""; //文件本地地址
	var theFile = ""; //文件名
	var theSearchString = ""; //?后的数据	
	var theRequest = {};//?后的数据对象
	var theNewUrl="";//新的url
	var reg=/[^\x00-\xff]/; //匹配双字节字符(包括汉字在内)
	var thePtlMark = false;//协议标记
	var theHostMark = false; //服务器标记
	var thePageMark = false; //文件本地地址标记
	var theFileMark = false; //文件名标记
	var theSSMark = false; //?后的数据标记
	var FilePageMark = false;//是否在更改路径后更改过文件名称	
	//设置url初始值
	this.setUrl=function(_url){
		var url=String(_url);
        if(!reg.test(url)){//验证参数是否合法  		
			//协议
			if(url.indexOf("://")!=-1){//看有没有"://"
				var proNum=url.indexOf("://");//第一个"://"的位置
				theProtocol=url.substr(0,proNum+3);
				noProUrl=url.substr(proNum+3);
			}else{//没有"://"
				theProtocol="";
				noProUrl=url
			}				
			//服务器
			if(noProUrl.indexOf("/")!=-1){//有"/"
				var hostNum=noProUrl.indexOf("/");//第一个"/"的位置
				theHost=noProUrl.substr(0,hostNum);//在第一个"/"之前找"."
				if(theHost.indexOf(".")!=-1){//有"."
					theHost=theHost;
					noHostUrl=noProUrl.substr(hostNum);
				}else{//没"."
					theHost="";
					noHostUrl=noProUrl;			
				}
			}else{//没有"/"
				theHost="";
				noHostUrl=noProUrl;						
			}
			
			//文件地址
			if(noHostUrl.indexOf("?")!=-1){//存在"?"
				var pageNum=noHostUrl.indexOf("?");//第一个"?"的位置
				thePage=noHostUrl.substr(0,pageNum);
			}else{
				thePage=noHostUrl;
			}
			
			//文件名
			if(thePage.lastIndexOf("/")!=-1){//存在"/"
				var fileNum=thePage.lastIndexOf("/");//最后一个"/"的位置
				theFile=thePage.substr(fileNum+1);
			}else{
				theFile=thePage;
			}
			
			//参数字符串
			if(noHostUrl.indexOf("?")!=-1){//存在"?"
				var strNum=noHostUrl.indexOf("?");//第一个"?"的位置
				theSearchString=noHostUrl.substr(strNum+1);
			}else{
				theSearchString="";
			}
			
			//参数对象
			if (url.indexOf("?") != -1) {//判断后面有没有参数
				var str = url.substr(url.indexOf("?")+1);
				if(str.indexOf("#")!= -1){str=str.substr(0,str.indexOf("#"));}
				strs = str.split("&");
				for(var i = 0; i < strs.length; i ++) {
					var indexOfadd=strs[i].indexOf("=");
					var key=strs[i].substr(0,indexOfadd);
					if (indexOfadd>0 && key){
						var value=strs[i].substr(indexOfadd+1);
						if(key in theRequest){
							if(theRequest[key] instanceof Array){
								theRequest[key].push(value);
							}else{
								theRequest[key]=[theRequest[key]];
								theRequest[key].push(value);
							}
						}else{
							theRequest[key]=value;
						}
					}
				}
			}
		}else{
			return ;
		}			
	}
	
	//截取各部分
	this.setData=function(_url){
		if(_url){//_url存在则取值
			content.setUrl(_url);
		}else{
			theSearchString=theSearchString?("?"+theSearchString):theSearchString;
			if(theFile && FilePageMark){
				thePage=thePage.substr(0,thePage.lastIndexOf("/"))+theFile;
			}else{
				thePage=thePage;
			}
			theNewUrl=theProtocol+theHost+thePage+theSearchString;
			if(theNewUrl.indexOf("//")==0){
				theNewUrl=theNewUrl.substr(theNewUrl.indexOf("//")+2);
				return theNewUrl;
			}
			return theNewUrl;
		}
	}
		//获取协议
	this.setProtocol=function(_value){
		if(_value){//有参数
            if(!reg.test(_value)){//验证参数是否合法  
            	if(_value.indexOf(":") != -1 && _value.indexOf("//") == -1){
            		theProtocol=_value+"//"; 
            	}else if(_value.indexOf(":") == -1 && _value.indexOf("//") == -1){
            		theProtocol=_value+"://"; 
            	}else{
            		theProtocol=_value; 
            	}
            }else{
            	theProtocol="";
            }
            thePtlMark = true;
            return this;
		}else if(!_value){//无参数
			if(thePtlMark){//之前传过
				return theProtocol;
			}else{
				theProtocol = theProtocol;
			}
			return theProtocol;
		}else{//其余出错的时候
			theProtocol="";
			return theProtocol;
		}
	};
	//获取host
	this.setHost=function(_value){
		if(_value){//有参数
            if(!reg.test(_value)) {//验证参数是否合法  
	    		theHost=_value; 
			}else{
				theHost="";
			}
            theHostMark = true;
            return this;
		}else if(!_value ){//无参数
			if(theHostMark){//之前传过
				return theHost;
			}else{
				theHost = theHost;
			}
			return theHost;
		}else{//其余出错的时候
			theHost="";
			return theHost;
		}
	};
	//获取page
	this.setPage=function(_value){
		if(_value){//有参数
			FilePageMark=false;
            if(!reg.test(_value)) {//验证参数是否合法  
            	if(_value.indexOf("/")!= -1 && _value.indexOf("/")==0){
            		thePage=_value; 
            	}else{
            		thePage="/"+_value; 
            	}
			}else{
	    		thePage=""; 
			}
            thePageMark = true;
            return this;
		}else if(!_value){//无参数
			if(thePageMark){//之前传过
				return thePage;
			}else{
				thePage = thePage;
			}
			return thePage;
		}else{//其余出错的时候
			thePage="";
			return thePage;
		}
	};
	//获取file
	this.setFile=function(_value){
		if(_value){//有参数
			FilePageMark=true;
            if(!reg.test(_value)) {//验证参数是否合法  
            	if(_value.indexOf("/")!= -1){
            		theFile=_value; 
            	}else{
            		theFile="/"+_value; 
            	}
			}else{
	    		theFile=""; 
			}
            theFileMark = true;
            return this;
		}else if(!_value){//无参数
			if(theFileMark){//之前传过
				return theFile;
			}else{
				theFile=theFile;
			}
			return theFile;
		}else{//其余出错的时候
			theFile="";
			return theFile;
		}
	};
	//获取url中"?"后的字串
	this.setSearchString=function(_value){
		if(_value){//有参数
            if(!reg.test(_value)) {//验证参数是否合法  
	    		theSearchString=_value; 
			}else{
	    		theSearchString=""; 
			}
            theSSMark = true;
            return this;
		}else if(!_value){//无参数
			if(theSSMark){//之前传过
				return theSearchString;
			}else{
				theSearchString = theSearchString;
			}
			return theSearchString;
		}else{//其余出错的时候
			theSearchString="";
			return theSearchString;
		}		
	};	
	//获取url中"?"符后的字串对象
	this.setUrlObj=function(_value){
		theRequest = {};
		if(!_value){
			if (url.indexOf("?") != -1) {//判断后面有没有参数
				var str = url.substr(url.indexOf("?")+1);
				if(str.indexOf("#")!= -1){str=str.substr(0,str.indexOf("#"));}
				strs = str.split("&");
				for(var i = 0; i < strs.length; i ++) {
					var indexOfadd=strs[i].indexOf("=");
					var key=strs[i].substr(0,indexOfadd);
					if (indexOfadd>0 && key){
						var value=strs[i].substr(indexOfadd+1);
						if(key in theRequest){
							if(theRequest[key] instanceof Array){
								theRequest[key].push(value);
							}else{
								theRequest[key]=[theRequest[key]];
								theRequest[key].push(value);
							}
						}else{
							theRequest[key]=value;
						}
					}
				}
			}
			return theRequest;
		}else{
			theRequest=_value;
			return this;
		}
	};
}