/*
作者：马腾
更新日期：2016年12月7日
注：UpLoadfile中配置bind绑定的Dom对象如果是个 button的话，火狐点击无效，尽量使用Div
*/

//跨域服文本要处理 OPTIONS 请求
function UpLoadfile(_config){
	var content=this,callback=null,bindObject=null;
	var defaultConfig={
		//服务端接收文件路径
		serverInterface:"",
		//绑定组件
		bind:null,
		//过滤器
		accept:"*.*",
		//提交file域的名称
		filename:"file",
		//是否允许选中多个文件
		multiple:false,
		//回调函数
		callback:{
			//开始上传
			loadstartEvent:function(_data){},
			//错误
			errorEvent:function(_data){},
			//上传结束
			loadendEvent:function(_data){},
			//进度
			progressEvent:function(_data){},
			//选择了文件
			selectFileEvent:function(_data){}
		},
		//超时时间
		timeout:0
	};
	var files=[];
	//合并两个对象
	function extend(){
		var agu=Array.prototype.slice.call(arguments);
		for(var i=1; i<agu.length;i++){
			for(var tag in agu[i]){
				agu[0][tag]=agu[i][tag];
			}
		}
		return (agu.length>0?agu[0]:{});
	}
	function getResult(_obj){
		var result={
			status:"",//load|loaded|progress|
			errorInfo:"",
			progress:0,
			loaded:0,
			total:0,
			fileList:files,
			filepathList:[],
			event:null
		};
		return extend(result,_obj);
	}
	var config=extend({},defaultConfig,_config);
	//html xmlhttprequest对象
	var xhr=(function(){
		var xhr = new XMLHttpRequest();
		if(xhr && xhr.upload && !xhr.upload.onprogress){
			xhr.withCredentials = false;
			return xhr;
		}
		return null;
	})();
	//用于form和iframe关联的name值
	var uploading=false;
	var form=(function(){
		var form=document.createElement("form");
		form.style.display="none";
		form.setAttribute("enctype","multipart/form-data");
		form.setAttribute("target",name);
		form.setAttribute("method","post");
		document.body.appendChild(form);
		return form;
	})();
	function creatFileInput(){
		//初始化file组件
		var file=document.createElement("input");
		file.setAttribute("type","file");
		file.setAttribute("name","file");
		file.setAttribute("accept","*.*");
		file.style.position="absolute";
		file.style.width="100%";
		file.style.height="100%";
		file.style.cursor="pointer";
		file.style.top="0px";
		file.style.left="0px";
		file.style.display="block";
		file.style.opacity=0;
		file.style.filter="aplaha(opcity=0)";
		file.style.fontSize="100px";
		file.style.zIndex=99;
		return file;
	}
	var file=creatFileInput();
	//文件上传时候的值
	this.filename=function(_name){
		file.setAttribute("name",_name);
	};
	//绑定上传按钮
	this.bind=function(_id){
		var dom=document.getElementById(_id) || ((_id && _id.style)?_id:null);
		if(!dom){return false;}
		bindObject=dom;
		var position=dom.style.position;
		if(position!=="absolute" && position!=="fixed" && position!=="relative"){
			dom.style.position="relative";
		}
		if(file.parentNode){
			file.parentNode.removeChild(file);
		}
		dom.appendChild(file);
		return true;
	};
	//过滤文件类型
	this.accept=function(_value){
		if(_value!==undefined){
			if(_value){
				file.setAttribute("accept",_value);
			}else{
				file.removeAttribute("accept");
			}
		}
		return file.getAttribute("accept");
	};
	//允许选择多个文件(传逻辑值)
	this.multiple=function(_value){
		if(_value!==undefined){
			if(_value){
				file.setAttribute("multiple",_value);
			}else{
				file.removeAttribute("multiple");
			}
		}
		return file.hasAttribute("multiple");
	};
	//获取上传状态
	this.status=function(){
		return uploading;
	};
	//停止
	this.stop=function(){
		this.reset(false);
	};
	//销毁对象
	this.dispose=function(){
		if(file && file.parentNode){
			file.parentNode.removeChild(file);
		}
		if(form && form.parentNode){
			form.parentNode.removeChild(form);
		}
		content=null;
	};
	//重置(是否清除选择文件域)
	this.reset=function(_clear){
		if(_clear===undefined || _clear){
			file.value="";
			form.reset();
		}
		if(file.parentNode){
			file.parentNode.removeChild(file);
		}
		if(bindObject){
			bindObject.appendChild(file);
		} 
		uploading=false;
		xhr.abort();//取消下载
	};
	//设置回调函数
	this.callback=function(_callback){
		if(_callback!==undefined){
			config.callback=_callback;
		}
		return config.callback;
	};
	//回调函数封装
	function callfun(_event,_value){
		if(config.callback && typeof(config.callback[_event])==="function"){
			config.callback[_event].call(content,_value);
		}
		return (config.callback && typeof(config.callback[_event])==="function");
	}
	//上传文件
	this.submit=function(data){
		if(!xhr){//是否支持html5
			return callfun("errorEvent",getResult({errorCode:1,errorInfo:"请下载支持HTML5的浏览器才可上传文件!"}));
		}else if(!bindObject){//判断条件
			return callfun("errorEvent",getResult({errorCode:2,errorinfo:"未绑定上传组件!"}));
		}else if(uploading){//判断是否正在上传
			return callfun("errorEvent",getResult({errorCode:3,errorinfo:"正在执行文件上传，请稍候再试!"}));
		}
		uploading=true;//标记为开始上传
		bindObject.removeChild(file);//移除file组件
		form.appendChild(file);//把组件装入表单
		
		var formData = new FormData(form);
		if(data){
			for(var name in data){
				formData.append(name,data[name]);
			}
		}
		xhr.open('POST',config.serverInterface);
		xhr.timeout=config.timeout;
		xhr.upload.onprogress=function(evt){
			if(evt.lengthComputable){
				callfun("progressEvent",getResult({progress:(Math.round(evt.loaded/evt.total*100)),loaded:evt.loaded,total:evt.total,event:evt}));
			}
		};
		xhr.onloadstart=function(evt){
			callfun("loadstartEvent",getResult({event:evt}));
		};
		xhr.onabort=function(evt){
			callfun("abortEvent",getResult({errorCode:4,errorInfo:"传输中断!",event:evt}));
			content.reset(false);
		};
		xhr.ontimeout=function(evt){
			callfun("errorEvent",getResult({errorCode:5,errorInfo:"传输超时!",event:evt}));
			content.reset(false);
		};
		xhr.onerror=function(evt){
			//log(evt);
			callfun("errorEvent",getResult({errorCode:6,errorInfo:"上传发生错误!",event:evt}));
			content.reset(false);
		};
		xhr.onload=function(evt){
			//callfun(getResult({status:"load",event:evt}));
		};
		xhr.onloadend=function(evt){
			var obj={},isError=false;
			try{
				obj=JSON.parse(xhr.responseText+"");
				obj.event=evt;
			}catch(e){
				isError=true;
			}
			if(!isError){
				callfun("loadendEvent",getResult(obj));
			}else{
				callfun("errorEvent",getResult({errorCode:7,message:"解析失败！",event:evt}));
			}
			content.reset(false);
		};
		xhr.send(formData);
		return true;
	};
	//选择了文件事件
	function onChange(event){
		if(!file.value){return false;}
		files.splice(0,files.length);//清空数组
		for(var i=0;(file && file.files && i<file.files.length);i++){
			files.push(file.files[i]);
		}
		callfun("selectFileEvent",getResult({"event":event}));
	}
	//绑定file事件
	file[window.attachEvent?"attachEvent":"addEventListener"]((window.attachEvent?"on":"")+"change",onChange,false);

	//初始化
	for(var tag in config){
		if(typeof(content[tag])==="function"){
			content[tag](config[tag]);
		}
	}
}
function UpLoadBlob(_config){
	var content=this,bindObject=null,formData=new FormData();
	var defaultConfig={
		//服务端接收文件路径
		serverInterface:"",
		//提交file域的名称
		filename:"file",
		//回调函数
		callback:{
			//上传开始
			loadstartEvent:function(){},
			//错误
			errorEvent:function(){},
			//上传结束
			loadendEvent:function(){},
			//上传进度
			progressEvent:function(){}
		},
		//超时时间
		timeout:0
	};
	//合并两个对象
	function extend(){
		var agu=Array.prototype.slice.call(arguments);
		for(var i=1; i<agu.length;i++){
			for(var tag in agu[i]){
				agu[0][tag]=agu[i][tag];
			}
		}
		return (agu.length>0?agu[0]:{});
	}
	function getResult(_obj){
		var result={
			status:"",//load|loaded|progress|
			errorInfo:"",
			progress:0,
			loaded:0,
			total:0,
			formData:formData,
			filepathList:[],
			event:null
		};
		return extend(result,_obj);
	}
	var config=extend({},defaultConfig,_config);
	//html xmlhttprequest对象
	var xhr=(function(){
		var xhr = new XMLHttpRequest();
		if(xhr && xhr.upload && !xhr.upload.onprogress){
			xhr.withCredentials = false;
			return xhr;
		}
		return null;
	})();
	//用于form和iframe关联的name值
	var uploading=false;
	//文件上传时候的值
	this.filename=function(_name){
		if(_name!==undefined){config.filename=_name;}
		return config.filename;
	};
	//获取上传状态
	this.status=function(){
		return uploading;
	};
	//停止
	this.stop=function(){
		this.reset();
	};
	//重置(是否清除选择文件域)
	this.reset=function(){
		uploading=false;
		formData=new FormData();
		xhr.abort();//取消下载
	};
	//设置回调函数
	this.callback=function(_callback){
		if(_callback!==undefined){
			config.callback=_callback;
		}
		return config.callback;
	};
	//回调函数封装
	function callfun(_event,_value){
		if(config.callback && typeof(config.callback[_event])==="function"){
			config.callback[_event].call(content,_value);
		}
		return (config.callback && typeof(config.callback[_event])==="function");
	}
	//添加表单值
	this.addFormDataItem=function(_name,_value){
		formData.append(_name,_value);
	};
	//获取表单对象
	this.getFormData=function(){
		return formData;
	};
	//上传文件
	this.submit=function(data){
		if(!xhr){//是否支持html5
			return callfun("errorEvent",getResult({errorCode:1,errorInfo:"请下载支持HTML5的浏览器才可上传文件!"}));
		}else if(uploading){//判断是否正在上传
			return callfun("errorEvent",getResult({errorCode:2,errorinfo:"正在执行文件上传，请稍候再试!"}));
		}
		uploading=true;//标记为开始上传
		
		xhr.open('POST',config.serverInterface);
		if(xhr.overrideMimeType){xhr.overrideMimeType("application/octet-stream");}
		xhr.timeout=config.timeout;
		xhr.upload.onprogress=function(evt){
			if(evt.lengthComputable){
				callfun("progressEvent",getResult({progress:(Math.round(evt.loaded/evt.total*100)),loaded:evt.loaded,total:evt.total,event:evt}));
			}
		};
		xhr.onloadstart=function(evt){
			callfun("loadstartEvent",getResult({event:evt}));
		};
		xhr.onabort=function(evt){
			callfun("errorEvent",getResult({errorCode:3,errorInfo:"传输中断!"}));
			content.reset(false);
		};
		xhr.ontimeout=function(evt){
			callfun("errorEvent",getResult({errorCode:4,errorInfo:"传输超时!"}));
			content.reset(false);
		};
		xhr.onerror=function(evt){
			callfun("errorEvent",getResult({errorCode:5,errorInfo:"发送失败!"}));
			content.reset(false);
		};
		xhr.onload=function(evt){
			//callfun("errorEvent",getResult({errorCode:5,errorInfo:"传输超时!"}));
		};
		xhr.onloadend=function(evt){
			if(xhr.responseText){
				var obj={},isError=false;
				try{
					obj=JSON.parse(xhr.responseText);
					obj.event=evt;
				}catch(e){
					isError=true;
				}
				if(!isError){
					callfun("loadendEvent",getResult(obj));
				}else{
					callfun("errorEvent",getResult({errorCode:7,message:"解析失败！",event:evt}));
				}
			}else{
				callfun("errorEvent",getResult({errorCode:7,errorInfo:"服务器未返回数据!"}));
			}
			content.reset(false);
		};
		if(data){
			for(var name in data){
				formData.append(name,data[name]);
			}
		}
		xhr.send(formData);
		return true;
	};
	//初始化
	for(var tag in config){
		if(typeof(content[tag])==="function"){
			content[tag](config[tag]);	
		}
	}
}