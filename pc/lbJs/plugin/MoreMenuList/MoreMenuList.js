var MoreMenuListZindex=999999999;
function MoreMenuList(_config){
	//数组对象的扩展
	Array.prototype.indexOf=function(_value){
		for(var i=0;i<this.length;i++){
			if(this[i]==_value){return i;}
		}
		return -1;
	};
	var content=this;//对象引用
	var node=this.node=$("<div>").addClass("MoreMenuList").append("");//显示对象
	var defaultConfig={//默认配置
		//target:"",
		algin:"left",
		zIndex:(MoreMenuListZindex--)
	};
	var menuList=[];
	var config={};//对象合并后的配置
	var parentJQ=null;
	
	function MenuNode(_name,_nodeConfig,_callback){
		this.type="MenuNode";
		var menuNodeContent=this;
		var node=this.node=$("<div>").addClass("MoreMenuListChild");
		var callback=null,config;
		//设置回调函数
		this.setCallback=function(_callback){
			callback=_callback;
		};
		//设置标题
		this.setCaption=function(_caption){
			node.text(_caption?_caption:"");
		};
		this.getCaption=function(_caption){
			return node.text();
		};
		this.setConfig=function(_config){
			config=_config;
		};
		//删除自身
		this.dispose=function(){
			node.remove();
			menuNodeContent=null;
		};
		//加入到显示队列
		this.appendTo=function(_jq){
			if(node.parent().length){
				node.parent().get(0).removeChild(node.get(0));
			}
			/*
			if($(_jq).css("position")!="absolute" && $(_jq).css("position")!="fixed"){
				$(_jq).css("position","relative");
			}*/
			$(_jq).append(node.get(0));
		};
		
		this.setCaption(_name);
		this.setConfig(_nodeConfig);
		this.setCallback(_callback);
		
		node.bind("click",function(){
			if(typeof(callback)==="function"){
				callback.call(menuNodeContent,config,content);//回调
			}
		});
	}
	
	this.show=function(){
		node.show(0);
	};
	
	this.hide=function(){
		node.hide(0);
	};
	
	//添加到目标中
	this.appendTo=function (_jq){
		parentJQ=_jq;
		this.setTarget(_jq);
		this.setZIndex(config.zIndex);
	};
	
	//加入到显示队列
	this.setTarget=function(_jq){
		parentJQ=_jq;
		this.setZIndex(config.zIndex);
		if(node.parent().length){
			node.parent().get(0).removeChild(node.get(0));
		}
		if($(_jq).css("position")!="absolute" && $(_jq).css("position")!="fixed"){
			$(_jq).css("position","relative");
		}
		$(_jq).append(node.get(0)).hover(function(){
			if(config.disable){return;}
			node.show(0);	
		},function(){
			node.hide(0);
		});
	};
	//添加子菜单
	this.addMenuNode=function(_name,_nodeConfig,_callback,_saveNode){
		var menuNode=new MenuNode(_name,_nodeConfig,_callback);
		menuNode.appendTo(node);
		menuList.push(menuNode);
		_saveNode=menuNode;
		return this;
	};
	//删除子菜单
	this.delMenuNode=function(_node){
		var menuNode=_node;
		if(menuNode && typeof(menuNode)==="object" && menuNode.type==="MenuNode"){
			var index=menuList.indexOf(_node);
			if(index>=0){
				menuList.splice(index,1);
			}
			menuNode.dispose();
		}
		return this;
	};
	//删除全部
	this.clearAll=function(){
		for(var i=0;i<menuList.length;i++)
		{
			menuList[i].dispose();
		}
		menuList.splice(0,menuList.length);
	};
	//设置层级
	this.setZIndex=function(_index){
		//config=_config;
		// if(parentJQ){
		// 	$(parentJQ).css("z-index",_index);
		// }
		node.css("z-index",_index);
	};
	//禁止弹出提示
	this.setDisable=function(_disable){
		config.disable=!!_disable;
		if(!!_disable){
			node.hide(0);
		}
	};
	this.getDisable=function(_disable){
		return !!config.disable;
	};
	
	this.setAlgin=function(_algin){
		if(_algin==="left"){
			node.css("left",0);
			node.css("right","auto");
		}else if(_algin==="right"){
			node.css("right",0);
			node.css("left","auto");
		}
	};
	
	//设置插件初始化代码
	this.setConfig=function(_config){
		config=$.extend({},defaultConfig,_config);//合并对象
		for(var name in config){
			var funName= String(name).substr(0,1).toUpperCase();
			funName+=String(name).substr(1);
			if(typeof content["set"+funName] ==="function"){
				if(config[name] instanceof Array){//如果是个数组则当做参数传递
					content["set"+funName].apply(this,config[name]);
				}else{
					content["set"+funName].call(this,config[name]);//当做参数赋值
				}
			}
		}
	};
	
	if(_config){
		this.setConfig(_config);
	}
}