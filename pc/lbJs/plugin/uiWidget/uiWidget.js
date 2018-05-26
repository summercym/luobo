

(function(){
var HTMLElement=window.HTMLElement||Element;
(function(window,undefined){
	var bindEvent=(document.addEventListener?"addEventListener":"attachEvent");//绑定事件
	var eventPrefix=(document.addEventListener?"":"on");//事件前缀
	window.$$=function $$(selector, context){
		function init(selector, context){
			var content=this;
			this.ready=function(_fun){
				if(document.readyState=='complete'){
					_fun();
				}else{
					document[bindEvent](document.addEventListener?"DOMContentLoaded":"onreadystatechange",function(){
						if(document.addEventListener){
							document.removeEventListener('DOMContentLoaded',arguments.callee,false);
							_fun();
						}else if(document.readyState=='complete'){
							document.detachEvent('onreadystatechange',arguments.callee);
							_fun();
						}
					});
				}
				return content;
			};
			if(typeof selector ==="function"){content.ready(selector);}
		}
		init.prototype=this.prototype;
		return new init(selector,context);
	};
})(window);
//Document Object Model
function Dom(_v){
	var content=this;
	var animateTimer=0;
	var node=(function(_v){
		var node;
		if(_v===undefined){return;}
		if(typeof _v==="string" && _v.substr(0,1)=="<"){
			var tagReg=/<([a-z]+).*?>/gi;
			if(!tagReg.test(_v)){return;}
			var tagName=/<([a-z]+).*?>/gi.exec(_v);
			node=document.createElement(tagName[1]);//创建标签
			var tagLabelList=/(<.*?>)/gi.exec(_v);//获取完整标签
			if(tagLabelList.length<=0){return node;}
			var tagLabel=tagLabelList[0];
			tagReg=/(([a-z0-9_~/-]+)="(.*?)")|(([a-z0-9_~=/-]+)='(.*?)')|(([a-z0-9_~=/-]+)=(.*?))/gi;//获取标签属性
			var attrList=tagLabel.match(tagReg);
			for(var i=0;attrList instanceof Array && i<attrList.length;i++ ){
				var keyValue=attrList[i].split("=");
				node.setAttribute(keyValue[0],keyValue[1]);
			}
			return node;
		}else if(typeof _v==="string" && _v){
			return document.querySelector(_v) || document.getElementById(_v) || (function(){throw "提供的筛选器不在系统支付范围内！";})();
		}else if(_v instanceof HTMLElement){
			return _v;
		}else if(_v instanceof Window){
			return _v;
		}else{
			throw "提供的筛选器不在系统支付范围内！";
		}
	})(_v);
	var EventList={};//事件对象
	this.getNode=function(){
		return node;
	};
	this.width=function(_width){
		if(_width===undefined){return node?node.offsetWidth:0;}
		if(node)node.style.width=(isNaN(_width)?_width:(_width+"px"));
		return this;
	};
	this.height=function(_height){
		if(_height===undefined){return node?node.offsetHeight:0;}
		if(node)node.style.height=(isNaN(_height)?_height:(_height+"px"));
		return this;
	};
	this.offset=function(){
		if(!node){return {left:0,top:0};}
		return {
			left:(function(){var left = node.offsetLeft;var current = node.offsetParent;while (current !== null){left += current.offsetLeft;current = current.offsetParent;}return left;})(),
			top:(function(){var top = node.offsetTop;var current = node.offsetParent;while (current !== null){top += current.offsetTop;current = current.offsetParent;}return top;})()
		};
	};
	this.attr=function(_key,_value){
		if(_value===undefined){return node?(node.getAttribute(_key)?node.getAttribute(_key):""):"";}
		if(node){node.setAttribute(_key,_value);}
		return this;
	};
	this.hasAttr=function(_key){
		if(!node){return false;}
		return !!(node.hasAttribute?node.hasAttribute(_key):node.getAttribute(_key));
	};
	this.addClass=function(_v){
		if(node && !this.hasClass(_v)){
			var classStr=node.className;
			var classArr=classStr.replace(/[ ]+/g," ").split(" ");
			if(classArr.indexOf(_v)>=0){return this;}
			node.className=classArr.concat(_v).join(" ");
		}
		return this;
	};
	this.removeClass=function(_v){
		if(node && this.hasClass(_v)){
			var classStr=node.className;
			var classArr=classStr.replace(/[ ]+/g," ").split(" ");
			var index=classArr.indexOf(_v);
			if(index>=0)classArr.splice(index,1);
			node.className=classArr.join(" ");
		}else if(node && _v===undefined){
			node.className="";
		}
		return this;
	};
	this.hasClass=function(_v){
		if(!node){return false;}
		var classStr=node.className;
		var classArr=classStr.replace(/[ ]+/g," ").split(" ");
		return classArr.indexOf(_v)>=0;
	};
	this.bind=function(_type,_dataOrFun,_fun){
		if(!node){return this;}
		var callback=(typeof _dataOrFun=="function"?_dataOrFun:_fun);
		if(typeof callback!=="function"){return this;}
		if(!node.DomEventList){node.DomEventList={};}
		node.DomEventList[callback]=function(_event){
			var event=window.event || _event;
			event.data=(typeof _dataOrFun=="function"?{}:_dataOrFun);
			try{
				event.target=event.target || event.srcElement;
				event.keyCode=event.keyCode || event.which;
				event.delta = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
				event.pageX=("pageX" in event)?event.pageX:(event.clientX + document.body.scrollLeft - document.body.clientLeft);
				event.pageY=("pageY" in event)?event.pageY:(event.clientY + document.body.scrollTop - document.body.clientTop);
			}catch(e){}
			if(typeof event.stopPropagation !=="function"){
				event.stopPropagation=(function(_event){
					return function(){_event.cancelBubble=false;};
				})(event);
			}
			if(typeof event.preventDefault !=="function"){
				event.preventDefault=(function(_event){
					return function(){_event.returnValue=false;};
				})(event);
			}
			callback.call(content.getNode(),event);
		};
		if(document.addEventListener){
			node.addEventListener(_type,node.DomEventList[callback],false);
		}else{
			node.attachEvent("on"+_type,node.DomEventList[callback]);
		}
		return this;
	};
	this.unbind=function(_type,_fun){
		if(!node){return this;}
		if(_fun===undefined){
			node[(document.attachEvent?"on":"")+_type]=null;
			return this;
		}else if(!node.DomEventList || !(_fun in node.DomEventList)){
			return this;
		}
		if(document.addEventListener){
			node.removeEventListener(_type,node.DomEventList[_fun]);
		}else{
			node.detachEvent("on"+_type,node.DomEventList[_fun]);
		}
		return this;
	};
	this.css=function(_v,_k){
		if(typeof _v ==="string"){
			if(_k !==undefined){
				if(node){node.style[_v]=_k;}
				return this;
			}else{
				if(!node)return "";
				var style=node.style[_v];
				if(!style){
					style=window.getComputedStyle ? window.getComputedStyle(node,null)[_v] :node.currentStyle[_v];
				}
				return style;
			}
		}
		for(var name in _v){
			if(node){node.style[name]=_v[name];}
		}
		return this;
	};
	this.hide=function () {
		if(node)node.style.display="none";
		return this;
	};
	this.show=function (_display) {
		if(node)node.style.display=_display?_display:"block";
		return this;
	};
	this.isHide=function() {
		return content.css("display")=="none";
	}
	this.isShow=function() {
		return !content.isHide();
	}
	this.prepend=function(_v){
		if(!node){return this;}
		var target;
		if(typeof _v ==="string"){
			target=document.querySelector(_v) || document.getElementById(_v) || (function(){throw "提供的筛选器不在系统支付范围内！"})();
		}else if(_v instanceof HTMLElement){
			target=_v;
		}else if(_v instanceof Dom){
			this.prepend(_v.getNode());
			return this;
		}else{
			throw "提供的筛选器不在系统支付范围内！";
		}
		if(target instanceof HTMLElement){
			if(node.childNodes.length){
				node.insertBefore(target,node.childNodes[0]);
			}else{
				this.append(target);
			}
		}
		return this;
	};
	this.append=function(_v){
		if(!node){return this;}
		if(typeof _v ==="string"){
			var target=document.querySelector(_v) || document.getElementById(_v) || (function(){throw "提供的筛选器不在系统支付范围内！"})();
			node.appendChild(target);
		}else if(_v instanceof HTMLElement){
			node.appendChild(_v);
		}else if(_v instanceof Dom){
			node.appendChild(_v.getNode());
		}else{
			throw "提供的筛选器不在系统支付范围内！";
		}
		return this;
	};
	this.appendTo=function(_v) {
		if(!node){return this;}
		if(typeof _v ==="string"){
			var	target=document.querySelector(_v) || document.getElementById(_v) || (function(){throw "提供的筛选器不在系统支付范围内！"})();
			target.appendChild(node);
		}else if(_v instanceof HTMLElement){
			_v.appendChild(node);
		}else if(_v instanceof Dom){
			_v.getNode().appendChild(node);
		}else{
			throw "提供的筛选器不在系统支付范围内！";
		}
		return this;
	}
	this.animate=function(_obj, _time, _sp,_fn){
		if(!node){return this;}
		clearTimeout(animateTimer);
		setTimeout(function(){
			content.css({transition:"none",webkitTransition:"none",mozTransition:"none"});
			if(_time){
				content.css({transition: "all ease "+_time+"ms",webkitTransition: "all ease "+_time+"ms",mozTransition: "all ease "+_time+"ms"});
				animateTimer=setTimeout(function(){
					content.css({transition:"none",webkitTransition:"none",mozTransition:"none"});
					if(typeof _fn ==="function")_fn.call(node);
				},_time);
			}
			content.css(_obj);
		},1);
		return this;
	};
	this.remove=function(){
		if(!node){return this;}
		if(node.parentNode){node.parentNode.removeChild(node);}
		content=null;
	};
	this.html=function(_v){
		if(!node){return this;}
		if(_v===undefined){return node.innerHTML;}
		node.innerHTML=_v;
		return this;
	};
	this.outerHTML=function(_v){
		if(!node){return this;}
		if(_v===undefined){return node.outerHTML;}
		node.outerHTML=_v;
		return this;
	};
	this.text=function(_v){
		if(_v===undefined){
			return node?((typeof node.textContent == "string") ? node.textContent : node.innerText):"";
		}
		if (node && typeof node.textContent == "string") {
			node.textContent = _v;
		} else if(node) {
			node.innerText = _v;
		}
		return this;
	};
}
window.WindowDom=Dom;
//扩展对象
function Extend(){
	var arg=Array.prototype.slice.call(arguments);
	for(var i=1;i<arg.length;i++ ){
		for(var name in arg[i]){
			arg[0][name]=arg[i][name];
		}
	}
	return arg.length>0?arg[0]:{};
}

//提示
function TipView(_config){
	var content=this;
	var config=Extend({
		radius:6,
		message:"信息提示",
		isHtml:false,
		bgColor:"rgba(0,0,0,0.8)",
		color:"#ffffff",
		delayTime:2000,
		position:"bottom",//[top,center,bottom]
		delayDispose:true,
		zIndex:99999,
		show:true
	},(typeof(_config)!=="object")?{message:_config}:_config);
	var nodeTemp=new Dom("<div>").addClass("TipTempView");
	var node=new Dom("<div>").addClass("TipView");
	var timeId=0,nodeWidth=0,offsetY,targetY;
	if(config.radius!=null)node.css({borderRadius:config.radius+(isNaN(config.radius)?"":"px")});
	this.bgColor=function(_bgColor){
		if(_bgColor===undefined)return config.bgColor;
		config.bgColor=_bgColor;
		node.css({backgroundColor:_bgColor});
		return this;
	};
	this.color=function(_color){
		if(_color===undefined)return config.color;
		config.color=_color;
		node.css({color:_color});
		return this;
	};
	this.show=function(){
		clearTimeout(timeId);
		if(config.delayTime>0)timeId=setTimeout(content.hide,config.delayTime);
		rePosition();
		node.css(offsetY).animate(targetY,500);
		return this;
	};
	this.delayTime=function(_delay){
		config.delayTime=_delay;
		return this;
	};
	this.zIndex=function(_v){
		node.css("zIndex",_v);
		return this;
	};
	this.hide=function(){
		clearTimeout(timeId);
		node.animate(offsetY,500,"",function(){
			node.css("display","none");
			if(config.delayDispose)content.remove();
		});
		return this;
	};
	this.message=function(_message,_isHtml){
		if(_message===undefined){return {message:config.message,isHtml:config.isHtml};}
		config.isHtml=!!_isHtml;
		config.message=_message;
		if(config.isHtml){
			nodeTemp.html(config.message);
			node.html(config.message);
		}else{
			nodeTemp.text(config.message);
			node.text(config.message);
		}
		rePosition();
		return this;
	};
	this.remove=function(){
		clearTimeout(timeId);
		nodeTemp.remove();
		node.remove();
		content=null;
	};
	//重新定位
	function rePosition(){
		nodeWidth=nodeTemp.width()+50;
		node.css({width:nodeWidth,marginLeft:(-1*nodeWidth/2)+"px",marginTop:(-1*nodeTemp.height()/2)+"px"});
		if(config.position=="top"){
			offsetY={opacity:0,display:"block",top:(-nodeTemp.height())+"px",marginTop:"0px",bottom:"auto"};
			targetY={top:"50px",opacity:1};
		}else if(config.position=="bottom"){
			offsetY={opacity:0,display:"block",bottom:"0%",top:"auto",marginTop:"0px"};
			targetY={opacity:1,bottom:"50px"};
		}else{
			offsetY={opacity:0,display:"block",marginTop:(-nodeTemp.height()/2)+"px",bottom:"auto",top:"50%",transform:"scale(1.1,1.1)",webketTransform:"scale(1.1,1.1)",mozTransform:"scale(1.1,1.1)"};
			targetY={marginTop:(-nodeTemp.height()/2)+"px",opacity:1,transform:"scale(1,1)",webketTransform:"scale(1,1)",mozTransform:"scale(1,1)"};
		}
	}
	document.body.appendChild(nodeTemp.getNode());
	document.body.appendChild(node.getNode());
	this.message(config.message,config.isHtml);
	this.color(config.color);
	this.bgColor(config.bgColor);
	this.zIndex(config.zIndex);
	if(config.show){this.show();}
}
window.TipView=function(_config){
	if(this!=window){throw "TipView：请使用无new构造创建此对象！如： var s=TipView({})";}
	return new TipView((typeof(_config)!=="object")?{message:_config}:_config);
};

//信息框
function AlertView(_config){
	var content=this;
	var nodeWidth=0,offsetY,targetY;
	var node=new Dom("<div>").addClass("AlertView").hide();
	var nodeClose=new Dom("<div>").addClass("AlertViewClose").text("×");//关闭按钮
	var nodeFrame=new Dom("<div>").addClass("AlertViewFrame");//背景模板
	var nodeTitle=new Dom("<div>").addClass("AlertViewTitle");//title模板
	var nodeBody=new Dom("<div>").addClass("AlertViewBody");//提示信息
	var nodeFooter=new Dom("<div>").addClass("AlertViewFooter");//操作按钮
	var messageDomSource;//当为dom 的时候，remove会将dom移入messageDomSource中
	var config=Extend({
		width:"500px",
		caption:"信息提示",
		showTitle:true,
		showClose:true,
		message:"",
		messagePadding:"20px 20px",
		messageAlign:"left",
		buttonsAlign:"right",
		isHtml:false,
		show:true,
		hideBodyScroll:true,//是否显示的时候隐藏滚动条
		classNames:["ThemeButton","ThemeButtonLight","ThemeButtonLight","ThemeButtonLight"],
		buttons:{
			"确定":function(){}
		},
		callback:function(_type,_message){}
	},_config);
	this.width=function(_width){
		if(_width===undefined){return config.width;}
		config.width=_width;
		nodeFrame.width(_width);
		rePosition();
		return this;
	};
	this.caption=function(_caption){
		if(_caption===undefined){return config.caption;}
		config.caption=_caption;
		nodeTitle.text(_caption);
		return this;
	};
	this.message=function(_v){
		if(_v===undefined){return config.message;}
		config.message=_v;
		if(_v instanceof HTMLElement){
			messageDomSource=_v.parentNode?_v.parentNode:document.body;
			if(_v.parentNode){
				_v.parentNode.removeChild(_v);
			}
			nodeBody.append(_v);
			_v.style.display="block";
		}else if(config.isHtml){
			messageDomSource=document.body;
			nodeBody.html(_v);
		}else{
			messageDomSource=document.body;
			nodeBody.text(_v);
		}
		return this;
	};
	this.messagePadding=function (_padding) {
		if(_padding===undefined){return config.messagePadding;}
		config.messagePadding=_padding;
		nodeBody.css({
			padding:_padding+(isNaN(_padding)?"":"px")
		});
	}
	this.messageAlign=function(_align){
		if(_align===undefined){return config.messageAlign;}
		config.messageAlign=_align;
		nodeBody.css({textAlign:_align});
		return this;
	};
	this.buttonsAlign=function(_align){
		if(_align===undefined){return config.buttonsAlign;}
		config.buttonsAlign=_align;
		nodeFooter.css({textAlign:_align});
		return this;
	};
	this.addButton=function(_buttonObject){
		var i=0;
		for(var name in _buttonObject){
			var className=(config.classNames instanceof Array && config.classNames.length>=i+1)?config.classNames[i]:"";
			var buttonElement = new Dom("<button>");
			buttonElement.html(name);
			buttonElement.addClass("AlertViewButton").addClass(className);
			buttonElement.bind("click",(function(_fun){
				return function(){
					if(_fun){
						if(_fun.call(content)!==false){
							content.remove();
						}
					}else{
						content.remove();
					}
				};
			})(_buttonObject[name]));
			nodeFooter.append(buttonElement);
			i++;
		}
		if(i>0){
			nodeFooter.show();
		}else{
			nodeFooter.hide();
		}
		nodeFrame.append(nodeFooter);
		return this;
	};
	this.show=function(){
		node.show();
		rePosition();
		nodeFrame.css(offsetY).animate(targetY,500);
		if(typeof config.callback ==="function"){config.callback.call(content,"show");}
		return this;
	};
	this.showClose=function(){
		nodeClose.show();
		return this;
	};
	this.hideClose=function(){
		nodeClose.hide();
		return this;
	};
	this.showTitle=function(){
		nodeTitle.show();
		nodeFrame.removeClass("AlertViewHideTitle");
		rePosition();
		return this;
	};
	this.hideTitle=function(){
		nodeTitle.hide();
		nodeFrame.addClass("AlertViewHideTitle");
		rePosition();
		return this;
	};
	this.hide=function(){
		if(typeof config.callback ==="function"){
			config.callback.call(content,"hide");
		}
		nodeFrame.hide();
		return this;
	};
	this.remove=function(){
		if(config.message instanceof HTMLElement && config.message.parentNode)config.message.parentNode.removeChild(config.message);
		if(!(typeof config.callback ==="function" && config.callback.call(content,"remove",config.message)===false)){
			if(config.message instanceof HTMLElement){
				config.message.style.display="none";
				messageDomSource.appendChild(config.message);
			}
		}
		nodeFrame.remove();
		node.remove();
		content=null;
	};
	this.setConfig=function(_v){
		if(!_v){return;}
		content.width(_v.width);
		content[_v.showClose?"showClose":"hideClose"]();
		content[_v.showTitle?"showTitle":"hideTitle"]();
		content.caption(_v.caption);
		content.message(_v.message);
		content.messagePadding(_v.messagePadding);
		content.messageAlign(_v.messageAlign);
		content.buttonsAlign(_v.buttonsAlign);
		content.addButton(_v.buttons);
		if(config.show){content.show();}
		return this;
	};
	//重新定位
	function rePosition(){
		nodeFrame.css({display:"block",opacity:0});
		nodeWidth=nodeFrame.width()+50;
		nodeFrame.css({marginLeft:-nodeWidth/2+"px",marginTop:-nodeFrame.height()/2+"px"})
		offsetY={transform:"scale(1.1,1.1)",webketTransform:"scale(1.1,1.1)",mozTransform:"scale(1.1,1.1)"};
		targetY={opacity:1,transform:"scale(1,1)",webketTransform:"scale(1,1)",mozTransform:"scale(1,1)"};
	}
	//关闭按钮
	nodeClose.bind("click",function(){
		var cancel=true;
		if(typeof config.callback ==="function"){
			cancel=(config.callback.call(content,"close")!==false);
		}
		if(cancel)content.remove();
	});
	nodeFrame.append(nodeTitle);
	nodeFrame.append(nodeClose);
	nodeFrame.append(nodeBody);
	node.append(nodeFrame);
	document.body.appendChild(node.getNode());
	content.setConfig(config);
}
window.AlertView=function(_config){
	if(this!=window){throw "AlertView：请使用无new构造创建此对象！如： var s=AlertView({})";}
	return new AlertView((_config instanceof HTMLElement)?{messge:_config}:(typeof _config=="string"?{message:_config}:_config));
};

//iframe弹窗口
function IframeView(_config){
	var content=this;
	var ifrmaenode=new Dom("<iframe>").addClass("IframeView");
	var templeteNode=new Dom("<div>").css({opacity:0});
	var config=Extend({
		width:"800px",
		height:"500px",
		src:"",
		show:true
	},_config);
	var nodeWidth;
	this.width=function(_v){
		if(_v===undefined){return config.width;}
		config.width=_v;
		ifrmaenode.width(_v);
		templeteNode.css({width:_v});
		return this;
	};
	this.height=function(_v){
		if(_v===undefined){return config.height;}
		config.height=_v;
		templeteNode.height(_v);
		ifrmaenode.height(_v);
		return this;
	};
	this.src=function(_v){
		if(_v===undefined){return config.src;}
		config.src=_v;
		ifrmaenode.getNode().setAttribute("src",_v);
		return this;
	};
	this.hide=function(){
		ifrmaenode.css({display:"none"});
		return this;
	};
	this.show=function(){
		rePosition();
		ifrmaenode.css(targetY);
		return this;
	};
	this.setConfig=function(_v){
		this.width(_v.width);
		this.height(_v.height);
		this.src(_v.src);
		return this;
	};
	this.setConfig(config);
	//重新定位
	function rePosition(){
		nodeWidth=templeteNode.width()+50;
		ifrmaenode.css({marginLeft:(-1*nodeWidth/2)+"px",marginTop:(-1*templeteNode.height()/2)+"px"});
		targetY={display:"block",bottom:"auto",top:"50%",marginTop:(-templeteNode.height()/2)+"px",opacity:1,transform:"scale(1,1)",webketTransform:"scale(1,1)",mozTransform:"scale(1,1)"};
	}
	//关闭按钮
	document.body.appendChild(ifrmaenode.getNode());
	document.body.appendChild(templeteNode.getNode());
	if(config.show){content.show();}
}
window.IframeView=function(_config){
	if(this!=window){throw "IframeView：请使用无new构造创建此对象！如： var s=IframeView({})";}
	return new IframeView(_config);
};
//加载框
function LoadingView(_config){
	var content=this;
	var timeId;
	var node=new Dom("<div>").addClass("LoadingView");
	var nodeBg=new Dom("<div>").addClass("LoadingViewBg");
	var nodeIcon=new Dom("<div>").addClass("LoadingViewIcon");
	nodeBg.append(nodeIcon);
	node.append(nodeBg);
	var config=Extend({
		target:"body",//插入对象可以是dom元素可以是id
		show:true,//默认直接显示
		delayTime:0,
		bgColor:"rgba(255,255,255,0.5)",
		delayTimeEndDispose:true//定时结束后自动销毁，false则为隐藏
	},_config);
	function setTarget(_target){
		var target;
		if(typeof(_target)==="string"){
			target=document.querySelector(_target) || document.getElementById(_target) || document.body;
		}else{
			target=(_target instanceof HTMLElement?_target:document.body);
		}
		if(node.parentNode===target){return;}
		if(node.parentNode){node.parentNode.removeChild(node);}
		if(target!==document.body){
			var targetPosition=target.style.position?target.style.position:(window.getComputedStyle ? window.getComputedStyle(target,null)["position"] :target.currentStyle["position"]);
			target.style.position=targetPosition;
			node.addClass("ToTarget");
		}else{
			node.removeClass("ToTarget");
		}
		target.appendChild(node.getNode());
		return this;
	};
	this.bgColor=function(_v){
		nodeBg.css("backgroundColor",_v);
		return this;
	};
	this.show=function(){
		node.show();
		clearTimeout(timeId);
		if(config.delayTime){
			timeId=setTimeout(function(){
				content[config.delayTimeEndDispose?"remove":"hide"]();
				},config.delayTime);
		}
		return this;
	};
	this.hide=function(){
		node.hide();
		clearTimeout(timeId);
		return this;
	};
	this.delayHide=function(_time){
		config.delayTime=parseInt(_time);
		return this;
	};
	this.delayTimeEndDispose=function(_v){
		config.delayTimeEndDispose=!!_v;
		return this;
	};
	//删除元素
	this.remove=function(){
		node.remove();
		content=null;
	};
	//初始化
	;(function setConfig(_v){
		setTarget(_v.target);
		content.bgColor(_v.bgColor);
		content.delayHide(_v.delayTime);
		content.delayTimeEndDispose(_v.delayTimeEndDispose);
		content[_v.show?"show":"hide"]();
	})(config);
}
window.LoadingView=function(_config){
	if(this!=window){throw "LoadingView：请使用无new构造创建此对象！如： var s=LoadingView({})";}
	var config={};
	if(!isNaN(_config)){
		config.delayTime=_config;
	}else if(typeof(_config)==="string"){
		config.target=document.querySelector(_config) || document.getElementById(_config) || document.body;
	}else if(_config instanceof HTMLElement){
		config.target=_config;
	}else{
		config=_config;
	}
	return new LoadingView(config);
};

//下拉框
function SelectView(_config){
	var content=this;
	var node;
	var titleNode,arrawNode,bodyNode,frameNode,scrollView;
	var nodeList=[];
	var body=new Dom(document.body);
	var option=new Dom("<option>");
	var config=Extend({
		target:null,
		width:"auto",
		height:"auto",
		checkMode:false,
		defaultTitle:"请选择",
		zIndex:100,
		callback:function(_data,_caption){}
	},_config);
	if(!(config.target instanceof HTMLElement)){
		config.target=document.querySelector(config.target) || document.getElementById(config.target) || document.createElement("div");
	}
	var selectNode=config.checkMode?[]:null;
	function Node(_title,_data,_callback){
		var content=this,data=0,title="",callback=_callback;
		var node=new Dom("<div>").addClass("SelectViewChild");

		this.title=function(_v){
			if(_v===undefined){return title;}
			title=_v;
			node.text(_v);
		};
		this.data=function(_v){
			if(_v===undefined){return data;}
			data=_v;
		};
		this.select=function(_selected){
			if(_selected===undefined){return node.hasClass("SelectViewSelected");}
			if(_selected){
				node.addClass("SelectViewSelected").addClass("SelectViewChecked");
			}else{
				node.removeClass("SelectViewSelected").removeClass("SelectViewChecked");
			}
		};
		this.remove=function(){
			node.unbind("click",onClick);
			node.remove();
			content=null;
		};
		this.prependTo=function(_dom){
			if(node.getNode().parentNode){node.getNode().parentNode.removeChild(node.getNode());}
			if(_dom instanceof HTMLElement){
				if(_dom.childNodes.length){
					_dom.insertBefore(node.getNode(),_dom.childNodes[0]);
				}else{
					_dom.appendChild(node.getNode());
				}
			}else if(_dom instanceof Dom){
				_dom.prepend(node);
			}
		};
		this.appendTo=function(_dom){
			if(node.getNode().parentNode){node.getNode().parentNode.removeChild(node.getNode());}
			if(_dom instanceof HTMLElement){
				_dom.appendChild(node.getNode());
			}else if(_dom instanceof Dom){
				_dom.append(node);
			}
		};
		function onClick(event){
			if(typeof callback ==="function"){callback.call(content,title,data);}
			if(config.checkMode){event.stopPropagation();}
		}
		content.title(_title);
		content.data(_data);
		node.bind("click",onClick);
	}
	this.width=function(_width) {
		if(_width===undefined)return node.width();
		config.width=_width+isNaN(_width)?"":"px";
		node.width(config.width);
		return this;
	}
	this.height=function(_height) {
		if(_height===undefined)return node.height();
		config.height=_height+isNaN(_height)?"":"px";
		node.height(config.height);
		return this;
	}
	this.setTitle=function(_v){
		titleNode.removeClass("defaultStatus").text(_v);
		return this;
	};
	this.getTitle=function(){
		return titleNode.text();
	};
	this.getSelectedTitle=function(){
		if(selectNode instanceof Array){
			var dataTitle=[];
			for(var i=0;i<selectNode.length;i++){
				dataTitle.push(selectNode[i].title());
			}
			return dataTitle.join(",");
		}else{
			return selectNode?selectNode.title():"";
		}
	};
	this.getNode=function () {
		return node.getNode();
	}
	this.getSelectedData=function(){
		if(selectNode instanceof Array){
			var dataValue=[];
			for(var i=0;i<selectNode.length;i++){
				dataValue.push(selectNode[i].data());
			}
			return dataValue.join(",");
		}else{
			return selectNode?selectNode.data():"";
		}
	};
	this.addOption=function(_title,_data,_selected,_toCall,_insertTop){
		var node=new Node(_title,_data,nodeCallback);
		if(_insertTop){
			node.prependTo(bodyNode);
			nodeList.unshift(node);
		}else{
			node.appendTo(bodyNode)
			nodeList.push(node);
		}
		if(_selected){
			selectedNode(node,_toCall,_selected);
		}
		return node;
	};
	this.selectForIndex=function(_index,_toCall){
		var index=parseInt(_index);
		if(isNaN(index) || index<0 || index>=nodeList.length){return this;}
		selectedNode(nodeList[index],_toCall,true);
		return this;
	};
	this.selectForData=function(_data,_toCall){
		for(var i=0;i<nodeList.length;i++){
			if(nodeList[i].data()==_data){
				selectedNode(nodeList[i],_toCall,true);
				break;
			}
		}
		return this;
	};
	this.cancelSelectForIndex=function(_index,_toCall){
		var index=parseInt(_index);
		if(!isNaN(index) && index>=0 && index<nodeList.length){
			selectedNode(nodeList[index],_toCall,false);
		}
		return this;
	};
	this.cancelSelectForData=function(_data,_toCall){
		for(var i=0;i<nodeList.length;i++){
			if(nodeList[i].data()==_data){
				selectedNode(nodeList[i],_toCall,false);
				break;
			}
		}
		return this;
	};
	this.deleteForIndex=function(_index,_toCall){
		var index=parseInt(_index);
		if(isNaN(index) || index<0 || index>=nodeList.length){return this;}
		deleteNode(nodeList[index],_toCall);
		return this;
	};
	this.deleteForData=function(_data,_toCall){
		for(var i=0;i<nodeList.length;i++){
			if(nodeList[i].data()==_data){
				deleteNode(nodeList[i],_toCall);
				break;
			}
		}
		return this;
	};
	this.getSelectedIndex=function(){
		if(config.checkMode){
			var indexList=[];
			for(var i=0;i<selectNode.length;i++){
				var index=nodeList.indexOf(selectNode[i]);
				if(index>=0){indexList.push(index);}
			}
			return indexList;
		}
		return nodeList.indexOf(selectNode);
	};
	this.clearAll=function(){
		for(var i=nodeList.length-1;i>=0;i--){
			nodeList[i].remove();
		}
		nodeList.splice(0,nodeList.length);
		if(selectNode instanceof Array){
			selectNode.splice(0,selectNode.length);
		}else{
			selectNode=null;
		}
		content.setDefaultStatus();
		bodyNode.css("marginTop",0);
		return this;
	};
	this.appendTo=function(_dom){
		if(node.getNode().parentNode){node.getNode().parentNode.removeChild(node.getNode());}
		if(_dom instanceof HTMLElement){
			_dom.appendChild(node.getNode());
		}else if(document.getElementById(_dom)){
			document.getElementById(_dom).appendChild(node.getNode());
		}
		return this;
	};
	this.setDefaultStatus=function(){
		if(selectNode instanceof Array){
			for(var i=0;i<selectNode.length;i++){
				selectNode[i].select(false);
			}
		}else if(selectNode!=null){
			selectNode.select(false);
		}
		selectNode=config.checkMode?[]:null;
		updateData();
		return this;
	};
	this.getDefaultStatus=function(){
		return !!(config.checkMode?selectNode.length:selectNode);
	};
	this.setCallback=function(_callback){
		config.callback=_callback;
		return this;
	};
	this.getCallback=function(){
		return config.callback;
	};
	this.show=function(){
		node.show("inline-block");
		return this;
	};
	this.hide=function(){
		node.hide();
		return this;
	};
	this.remove=function(){
		if(node && node.attr("SelectViewActionId")){
			delete SelectView.list[node.attr("SelectViewActionId")];
			node.remove();
			content=null;
		}
	};
	function nodeCallback(_title,_data){
		if(config.checkMode){
			return selectedNode(this,true,!this.select());
		}
		selectedNode(this,true,true);
	}
	function deleteNode(_node,_toCall){
		var nodeIndex=nodeList.indexOf(_node)
		if(nodeIndex>=0)nodeList.splice(nodeIndex,1);
		if(selectNode instanceof Array){
			var index=selectNode.indexOf(_node);
			if(index>=0)selectNode.splice(index,1);
		}else if(selectNode==_node){
			selectNode=null;
		}
		updateData();
		if(_node){_node.remove();}
		updateScroll();
	}
	function selectedNode(_node,_toCall,_status){
		if(config.checkMode){//多选模式
			if(_status){
				if(selectNode.indexOf(_node)<0){selectNode.push(_node);}
			}else{
				var index=selectNode.indexOf(_node);
				if(index>=0)selectNode.splice(index,1);
			}
			_node.select(_status);
			if(_toCall && typeof config.callback ==="function"){
				config.callback.call(content,content.getSelectedTitle(),content.getSelectedData());
			}
		}else{
			if(!_status && selectNode===_node){
				selectNode=null;
			}else{
				selectNode=_node;
				for(var i=0;i<nodeList.length;i++){
					nodeList[i].select(false);
				}
				selectNode.select(true);
			}
			if(_toCall && typeof config.callback ==="function"){
				config.callback.call(content,content.getSelectedTitle(),content.getSelectedData());
			}
			hideBody();
		}
		updateData();
	}
	//更新数据
	function updateData(){
		var t=content.getSelectedTitle();
		option.attr("value",content.getSelectedData());
		content.setTitle(t?t:config.defaultTitle);
		titleNode[t?'removeClass':'addClass']("defaultStatus");
	}
	function showBody(event){
		SelectView.closeAll();
		if(nodeList.length===0){return false;}
		if(node.hasClass("SelectViewStatusOpen")){return hideBody();}
		frameNode.width(node.width()?node.width()+"px":"100%");
		node.addClass("SelectViewStatusOpen");
		if(event){event.stopPropagation();}
		body.bind("click",hideBody);
		scrollView.update();
	}
	var hideBody=this.hideBody=function (event){
		node.removeClass("SelectViewStatusOpen");
		body.unbind("click",hideBody);
		if(event){event.stopPropagation();}
	};
	function updateScroll(){
		scrollView.update();
	}
	;(function init(){
		node=new Dom(config.target).addClass("SelectView");
		if(!config.target.style.width){
			content.width(config.width);
		}
		if(!config.target.style.height){
			content.height(config.height);
		}
		if(node.attr("tip")){config.defaultTitle=node.attr("tip");}
		titleNode=new Dom("<div>").addClass("SelectViewTitle defaultStatus").text(config.defaultTitle);
		arrawNode=new Dom("<div>").addClass("SelectViewArraw");
		frameNode=new Dom("<div>").addClass("SelectViewFrame").css("zIndex",config.zIndex);
		bodyNode=new Dom("<div>").addClass("SelectViewBody").addClass(config.checkMode?"checkMode":"");
		var selectIndex=-1,number=-1;
		for (var i=config.target.childNodes.length-1;i>=0;i--){
			if(config.target.childNodes[i].tagName=="OPTION"){
				number++;
				var child=new Dom(config.target.childNodes[i]);
				var childNode=content.addOption(child.text(),child.attr("value"),false,false,true);
				var html=child.outerHTML();
				if(/<option (.*?)selected(.*?)>(.*?)/.test(html)){
					selectIndex=number;
				}
				child.remove();
			}
		}
		if(selectIndex>=0){content.selectForIndex(selectIndex,false);}
		node.append(titleNode).append(arrawNode).append(frameNode).append(option);
		frameNode.append(bodyNode).bind("click",function(event){event.stopPropagation();});
		titleNode.bind("click",showBody);
		arrawNode.bind("click",showBody);
		content.setCallback(config.callback);
		scrollView=new ScrollView(frameNode.getNode(),{
			margin:5,
			gap:15,
			radius:10
		});
	})();
}
SelectView.list={};
SelectView.closeAll=function(){
	for(var name in SelectView.list){
		var nodeSelect=SelectView.list[name];
		if(nodeSelect && nodeSelect.hideBody){nodeSelect.hideBody();}
	}
};
window.SelectView=function(_config){
	if(this!=window){throw "SelectView：请使用无new构造创建此对象！如： var s=SelectView({})";}
	var config=Extend({
		target:null
	},_config);

	if(!(config.target instanceof HTMLElement)){
		config.target=document.querySelector(config.target) ||document.getElementById(config.target) || document.createElement("div");
	}
	var selectViewActionId=config.target.SelectViewActionId;
	if(selectViewActionId in SelectView.list){
		return SelectView.list[selectViewActionId];
	}
	config.target.SelectViewActionId=Math.random();
	return (SelectView.list[config.target.SelectViewActionId]=new SelectView(config));
};

//单选框复选框
function CheckView(_config){
	var content=this;
	var node=new Dom("<div>").addClass("CheckView");
	var nodeFrame=new Dom("<div>").addClass("CheckViewFrame");
	var config=Extend({},_config);
	var callbackList=[];
	this.setNodeId=function(_id) {
		config.target.id=_id;
	}
	this.getNode=function(){
		return config.target;
	};
	this.getValue=function(){
		return config.target.value;
	};
	this.setValue=function(_value){
		config.target.value=_value;
	};
	this.addCallback=function(_callback){
		if(_callback && callbackList.indexOf(_callback)<0){callbackList.push(_callback);}
		return this;
	};
	this.deleteCallback=function(_callback){
		var index=callbackList.indexOf(_callback);
		if(index>=0)callbackList.splice(index,1);
		return this;
	};
	this.setSelected=function(_selected,_toCall){
		config.target.checked=!!_selected;
		content.update();
		if(_toCall){
			inputcallback();
		}
		return this;
	};
	this.getSelected=function(){
		return config.target.checked;
	};
	this.setDisable=function(_disable){//_disable为true、false
		config.target.disabled=!!_disable;
		content.update();
		return this;
	};
	this.getDisable=function(){
		return config.target.disabled;
	};
	this.update=function(){
		if(nodeFrame.hasClass("InputCheckView")){
			nodeFrame[config.target.checked?"addClass":"removeClass"]("CheckViewSelected");
		}else{
			nodeFrame[config.target.checked?"addClass":"removeClass"]("RadioViewSelected");
		}
		nodeFrame[config.target.disabled?"addClass":"removeClass"]("InputDisable");
		return this;
	};
	this.appendTo=function(_target){
		if(node.getNode().parentNode){
			node.getNode().parentNode.removeChild(node.getNode());
		}
		var target=_target;
		if(_target && typeof(_target)==='string'){
			target=document.querySelector(_target) || document.getElementById(_target);
		}
		if(target instanceof HTMLElement)target.appendChild(node.getNode());
		return this;
	};
	function inputcallback(){
		if(nodeFrame.hasClass("InputCheckView")){
			nodeFrame[this.checked?"addClass":"removeClass"]("CheckViewSelected");
		}else{
			nodeFrame[this.checked?"addClass":"removeClass"]("RadioViewSelected");
			if(this.name){
				var radioList=document.querySelectorAll("input[type=radio]");
				for(var x=0;x<radioList.length;x++){
					if(radioList[x].name && radioList[x].name===this.name && radioList[x]!==this){
						radioList[x].checked=false;
						radioList[x].parentNode.className=radioList[x].parentNode.className.replace("RadioViewSelected","");
					}
				}
			}
		}
		for(var i=0;i<callbackList.length;i++){
			if(typeof callbackList[i]==="function"){
				callbackList[i].call(content,this.checked);
			}
		}
	}
	;(function(){
		node.append(nodeFrame);
		nodeFrame.addClass(config.target.type==="checkbox"?"InputCheckView":"InputRadioView");
		if(config.target.parentNode){
			config.target.parentNode.insertBefore(node.getNode(),config.target);
			config.target.parentNode.removeChild(config.target);
		}
		nodeFrame.append(config.target);
		config.target[document.addEventListener?"addEventListener":"attchEvent"]((document.addEventListener?"":"on")+"change",inputcallback);
		content.addCallback(config.callback);
		content.update();
	})();
}
CheckView.list=[];
window.CheckView=function(_config){
	if(this!=window){throw "CheckView：请使用无new构造创建此对象！如： var s=CheckView({})";}
	var config=Extend({
		target:null//,
		//type:"checkbox"//当target为null的时候创建元素类型
		//callback:function(_value){}
	},(_config instanceof HTMLElement || typeof(_config)=="string")?{target:_config}:_config);
	if(config.target===null){
		config.target=(function(){
			var box=document.createElement("input");
			box.type=(config.type?"radio":"checkbox");
			return box;
		})();
	}else if(!(config.target instanceof HTMLElement || (config.target=document.querySelector(config.target)) || (config.target=document.getElementById(config.target)))){
		return null;
	}
	if(config.target.type!=="checkbox" && config.target.type!=="radio"){return null;}
	if(config.target.CheckView){

		return config.target.CheckView;
	}
	var checkViewObj=new CheckView(config);
	config.target.CheckView=checkViewObj;
	CheckView.list.push(checkViewObj);
	return checkViewObj;
};
window.CheckView.initAll=function(_group){
	var box=_group===undefined?document.body:_group;
	if(!(box instanceof HTMLElement || (box=document.querySelector(box)) || (box=document.getElementById(box)))){
		return [];
	}
	var checkboxarr=box.querySelectorAll("input[type=checkbox]");
	var radioarr=box.querySelectorAll("input[type=radio]");
	var checkList=[];
	for(var i=0;i<checkboxarr.length;i++){
		checkList.push(window.CheckView({target:checkboxarr[i]}));
	}
	for(i=0;i<radioarr.length;i++){
		checkList.push(window.CheckView({target:radioarr[i]}));
	}
	return checkList;
};
//表格
function TableView(_target,_config){
	var content=this;
	var node=new Dom("<div>").addClass("TableView"),
		tableNode=document.createElement("table"),
		tableDom=new Dom(tableNode);
		tableDom.addClass("TableBodyView");
		tableDom.attr("border","0");
		tableDom.attr("cellspacing","0");
		tableDom.attr("cellpadding","0");
		tableDom.attr("width","100%");
	node.append(tableDom);

	//合并单元格
	//增加、删除、显示、隐藏 列
	//设置单元格内容
	//多行表头

	var config=Extend({
		borderColor:'#ccc',
		tdPadding:5,
		thPadding:5,
		head:[
			{
			}
		]
	},{});



}
TableView.list={};
window.TableView=function(_target,_config){
	if(this!=window){throw "TableView：请使用无new构造创建此对象！如： var s=TableView(_target,_config)";}
	return new TableView(_target,_config);
};

//滚动条
function ScrollView(_target,_config){
	var content=this;
	var target=_target,node,barFrame,bar,scrollBody,offset={};
	var body=new Dom(document.body);
	var config=Extend({
		radius:10,
		margin:5,
		width:10,
		gap:10,
		bindWindowResize:false,//是否当触发window的resize事件时更新滚动条
		type:"vertical",//[horizontal/vertical]=[纵向/竖向]
		minHeight:20//最小高度
	},_config);
	if(!(target instanceof HTMLElement))throw("ScrollView：无法绑定滚动目标！");
	for(var i=0;i<target.childNodes.length;i++){
		if(target.childNodes[i].tagName==="DIV" || target.childNodes[i].tagName==="UL"  || target.childNodes[i].tagName==="TABLE"){
			scrollBody=new Dom(target.childNodes[i]);
			break;
		}
	}
	if(!scrollBody)throw("ScrollView：无法找到要滚动的元素！");
	node=new Dom(target).addClass("ScrollView").css("overflow","hidden");
	barFrame=new Dom("<div>").addClass("ScrollViewFrame");
	bar=new Dom("<div>").addClass("ScrollViewBar");
	if(config.radius!=null){bar.css({borderRadius:config.radius+(isNaN(config.radius)?"":"px")})}
	//设置边距
	this.margin=function(_margin){
		if(_margin===undefined){return config.margin;}
		if(_margin!=null){
			var css={left:"auto",top:"0px",right:"0px",bottom:"0px"};
			if(isNaN(_margin)){
				var marginArr=String(_margin).replace(/[ ]+/g," ").split(" ");
				if (marginArr.length==1) {
					css.top=css.right=css.bottom=_margin;
				}else if(marginArr.length==2){
					css.top=css.bottom=marginArr[0];
					css.right=marginArr[1];
				}else if(marginArr.length>2){
					css.top=marginArr[0];
					css.right=marginArr[1];
					css.bottom=marginArr[2];
				}
			}else{
				css.top=css.right=css.bottom=_margin+"px";
			}
			barFrame.css(css);
		}
		config.margin=_margin;
		return this;
	};
	//更新试图
	this.update=function(){
		var top=parseInt(scrollBody.css("marginTop"));
			top=isNaN(top)?0:top;
		var bodyHeight=scrollBody.height();
		var height=node.height();
		if(height<=0 || bodyHeight<=0 || bodyHeight<=height){
			barFrame.hide();
			scrollBody.css("marginTop",0);
			return this;
		}else{
			barFrame.show();
		}
		if(top>0){
			top=0;
			scrollBody.css("marginTop",0);
		}else if(height>bodyHeight+top){
			top=height-bodyHeight;
			scrollBody.css("marginTop",top+"px");
		}
		var barHeight=height/bodyHeight*barFrame.height();
		bar.height((config.minHeight && barHeight<config.minHeight)?config.minHeight:barHeight);
		bar.css("top",(barFrame.height()-bar.height())*(Math.abs(top/(bodyHeight-height)))+"px");
		return this;
	};
	//滚动事件
	function onMousewheel(event){
		//滚动时不允许按下按钮，避免冲突
		if(!event.button && config.type=="vertical"){
			var top=isNaN(parseInt(scrollBody.css("marginTop")))?0:parseInt(scrollBody.css("marginTop"));
			var bodyHeight=scrollBody.height();
			var height=node.height();
			var gap=config.gap;
			if(event.delta>0){
				top=top+gap>0?0:top+gap;
			}else if( (bodyHeight+ top - gap)<height  ){
				top=height-bodyHeight;
			}else{
				top = top - gap;
			}
			scrollBody.css("marginTop",(top>0?0:top)+"px");
			content.update();
		}
		event.preventDefault();
	}
	function onMousedown(event){
		offset.sourceTop=bar.offset().top-barFrame.offset().top;
		offset.sourceLeft=bar.offset().left-barFrame.offset().left;
		offset.sourceX=event.pageX;
		offset.sourceY=event.pageY;
		body.css({userSelect:"none"}).bind("mousemove",onMousemove).bind("mouseup",onMouseup);
		bar.addClass("ScrollViewMoveIng");
	}
	function onMousemove(event){
		if(event.buttons!=1){return onMouseup();}
		var bodyHeight=scrollBody.height();//主干内容区域高度
		var height=node.height();//主干框架高度
		var biasesX=event.pageX-offset.sourceX,
			biasesY=event.pageY-offset.sourceY;
		var goalTop=(offset.sourceTop+biasesY)/(barFrame.height()-bar.height()),
			goalLeft=(offset.sourceTop+biasesX)/(barFrame.width()-bar.width());
		if(goalTop<0){
			goalTop=0;
		}else if(goalTop>=1){
			goalTop=1;
		}
		scrollBody.css("marginTop",goalTop*(height-bodyHeight)+"px");
		content.update();
	}
	function onMouseup(event){
		body.unbind("mousemove",onMousemove).unbind("mouseup",onMouseup).css("userSelect","text");
		bar.removeClass("ScrollViewMoveIng");
	}
	;(function(){
		var position=node.css("position");
		if((position&&"absolute,fixed,relative".indexOf(position)<0)||!position)node.css("position","relative");
		barFrame.append(bar);
		bar.bind("mousedown",onMousedown);
		node.append(barFrame);
		node.bind("mousewheel",onMousewheel,false);
		node.bind("DomMouseScroll",onMousewheel,false);
		node.bind("MozMousePixelScroll",onMousewheel,false);
		content.margin(config.margin);
		content.update();
		window[document.addEventListener?"addEventListener":"attchEvent"]((document.addEventListener?"":"on")+"resize",function(){content.update()});
	})();
}
ScrollView.list={};
window.ScrollView=function(_target,_config){
	if(this!=window){throw "ScrollView：请使用无new构造创建此对象！如： var s=ScrollView({})";}
	var target=_target;
	if(_target && typeof(_target)==="string"){
		target=(document.querySelector(_target) || document.getElementById(_target));
	}
	if(!(target instanceof HTMLElement))throw "ScrollView：提供了错误的target参数，target可为#id,.class,Element的任意一种";
	if(target in ScrollView.list)return ScrollView.list[target];
	var scrollViewActionId=target.ScrollViewActionId;
	if(scrollViewActionId in ScrollView.list)return ScrollView.list[scrollViewActionId];
	target.ScrollViewActionId=Math.random();
	return (ScrollView.list[target.ScrollViewActionId]=new ScrollView(target,_config));
};

function ImageBase64(_width,_height,_maxWidth,_maxHeight){
	var content=this;
	var width=_width,height=_height,format="image/png",encoderOptions=0.92;
	var node=new Dom("<input>").attr("type","file").attr("accept","image/gif,image/jpeg,image/jpg,image/png").css("display","none");
	var fileReader,callback;
	this.setCallback=function(_v){
		callback=typeof(_v)==="function"?_v:null;
		return this;
	};
	this.setFormat=function(_format) {
		format=_format;
		return this;
	}
	this.getFormat=function() {
		return format;
	}
	this.setEncoderOptions=function(_encoderOptions) {
		encoderOptions=_encoderOptions;
		return this;
	}
	this.getEncoderOptions=function() {
		return encoderOptions;
	}
	this.open=function(){
		node.getNode().click();
		return this;
	};
	function fileSelected(event){
		if(this.files && this.files.length){
			fileReader.readAsDataURL(this.files[0]);
		}
	};
	function callbackFun(_type,_message,_loaded,_total){
		if(callback){
			callback.call(content,_type,_message,_loaded,_total);
		}
	}
	function onError(event){
		callbackFun("error","读取文件发生错误");
	}
	function onLoad(event){
		var fileDataURL=this.result;
		var canvas=document.createElement("canvas");
		canvas.width=width;
		canvas.height=height;
		var context=canvas.getContext("2d");
		var image=new Image();
		image.onload=function(){
			var imageWidth=this.width,imageHeight=this.height,scale=0;
			if(!imageWidth || !imageHeight){
					return error("请选择有效的图像文件。");
			}
			scale=width/imageWidth;
			if(imageHeight*scale<height){
				scale=(height/imageHeight);
			}
			var targetX=(imageWidth-width/scale)/2,
					targetY=(imageHeight-height/scale)/2;
				context.drawImage(this,targetX,targetY,imageWidth-targetX*2,imageHeight-targetY*2,0,0,width,height);
			var base64URL=canvas.toDataURL(format,encoderOptions);
			callbackFun("success",base64URL);
		}
		image.onerror=function(){
				callbackFun("error","请选择有效的图像文件");
		}
		image.src=fileDataURL;
	}
	function onProgress(event){
		callbackFun("progress",event.loaded/event.total,event.loaded,event.total);
	}
	function onAbort(event){
		callbackFun("abort","已取消文件的读取操作");
	}
	function onLoadend(event){
		callbackFun("complete","文件读取完毕");
	}
	function onLoadstart(event){
		callbackFun("start","开始读取文件");
	}
	node.bind("change",fileSelected);

	;(function init(){
		if(typeof FileReader =='undefined'){
			return callbackFun("error","浏览器版本不支持此功能，请升级您的浏览器到新版本");
		}
		fileReader=new FileReader();
		fileReader.onloadstart=onLoadstart;
		fileReader.onload=onLoad;
		fileReader.onprogress=onProgress;
		fileReader.onerror=onError;
		fileReader.onabort=onAbort;
		fileReader.onloadend=onLoadend;
	})();
}
window.ImageBase64=function(_width,_height,_maxWidth,_maxHeight){
	if(this!=window){throw "ImageBase64：请使用无new构造创建此对象！如： var s=ImageBase64({})";}
	return new ImageBase64(_width,_height,_maxWidth,_maxHeight);
};

//tagLabel标签
function TagLabelView(_title,_data,_config){
	var content=this;
	var node=new Dom("<div>").addClass("Taglabel");
	var nodeText=new Dom("<span>").addClass("TaglabelTitle");
	var nodeInput=new Dom("<input>").attr("type","hidden");
	var nodeClose=new Dom("<div>").addClass("TaglabelClose").text("×");
	node.append(nodeText);
	node.append(nodeInput);
	node.append(nodeClose);
	var config=Extend({
		target:null,
		showClose:false,
		title:(typeof(_title)=="object" && _title && _title.title)?_title.title:(_title?_title:""),//信息
		isHtml:(typeof(_title)=="object" && _title && _title.isHtml)?true:false,
		data:_data,
		callback:function(_type){}//_type为remove时，回调函数返回false将删除自身标签
	},_config);
	this.appendTo=function(_target){
		var target;
		if(typeof(_target)==="string"){
			target= document.querySelector(_target)||document.getElementById(_target)||document.body;
		}else if(_target instanceof HTMLElement){
			target=_target;
		}
		if(!target){return this;}
		config.target=target;
		if(node.parentNode===target){return this;}
		if(node.parentNode){node.parentNode.removeChild(node.getNode());}
		target.appendChild(node.getNode());
		return this;
	};
	//设置标题
	this.setTitle=function(_title,_isHtml){
		config.isHtml=!!_isHtml;
		config.title=_title;
		nodeText[config.isHtml?"html":"text"](config.title);
		return this;
	};
	this.getTitle=function(){return {value:config.value,isHtml:config.isHtml};}
	//设置数据
	this.setData=function(_data){config.data=_data;return this;}
	this.getData=function() {return config.data;}
	//元素id
	this.data=function(_data){
		if(_data===undefined){return config.data;}
		config.data=_data;
		nodeInput.attr("value",(typeof config.data =="object" && config.data)?JSON.stringify(config.data):(config.data?config.data:""));
		return this;
	};
	this.showClose=function (_show) {
		if(_id===undefined){return config.showClose;}
		config.showClose=_show;
		return this;
	}
	//设置回调函数
	this.setCallback=function(_callback){config.callback=_callback;return this;}
	this.getCallback=function(){return config.callback;}
	//删除元素
	this.remove=function(){node.remove();content=null;};
	//初始化
	;(function setConfig(_v){
		content.setTitle(_v.title,_v.isHtml);
		content.setData(_v.data);
		if(_v.target){
			content.appendTo(_v.target);
		}
	})(config);
	nodeClose.bind("click",function(){
		if(typeof config.callback ==="function"){
			if(config.callback.call(content,"remove")!==false){
				content.remove();
			}
		}else{
			content.remove();
		}
	});
}
window.TagLabelView=window.TagLabel=function(_title,_data,_config){
	if(this!=window){throw "TagLabel：请使用无new构造创建此对象！如： var s=TagLabel({})";}
	return new TagLabelView(_title,_data,_config);
};

function HoverTipView(_target,_message,_config){
	var content=this;
	var config=Extend({
		isHtml:false,
		bgColor:"rgba(0,0,0,0.8)",
		borderColor:"rgba(0,0,0,0.8)",
		color:"#ffffff",
		delayHideTime:300,//延迟隐藏时间
		autoShow:true,//自动显示
		autoHide:true,//自动隐藏
		maxWidth:150,//最大宽度
		radius:6,
		position:"bottom",//[top,left,right,bottom,auto]
		zIndex:99999
	},(typeof(_config)!=="object")?{}:_config);
	config.message=_message;
	var nodeTemp=new Dom("<div>").addClass("HoverTipTempView").css("maxWidth",config.maxWidth);
	var nodeTempBody=new Dom("<div>").addClass("HoverTipBodyView");
	nodeTemp.append(nodeTempBody);
	var node=new Dom("<div>").addClass("HoverTipView").css({maxWidth:config.maxWidth}).hide();
	var nodeBody=new Dom("<div>").addClass("HoverTipBodyView");
	var nodeArraw=new Dom("<div>").addClass("HoverTipArrawView");
	var targetNode=new Dom(_target);

	if(config.radius!=null)node.css({borderRadius: config.radius+(isNaN(config.radius)?"":"px")});

	node.append(nodeBody);
	node.append(nodeArraw);
	var hideTimeId=0;
	this.bgColor=function(_bgColor){
		if(_bgColor===undefined){return config.bgColor;}
		config.bgColor=_bgColor;
		node.css({background:_bgColor});
		rePosition();
		return this;
	};
	this.borderColor=function(_borderColor){
		if(_borderColor===undefined){return config.borderColor;}
		config.borderColor=_borderColor;
		node.css({borderColor:_borderColor});
		rePosition();
		return this;
	};
	this.color=function(_color){
		if(_color===undefined){return config.color;}
		config.color=_color;
		node.css({color:_color});
		return this;
	};
	this.delayHideTime=function(_delay){
		if(_delay===undefined)return config.delayHideTime;
		config.delayHideTime=_delay;
		return this;
	};
	this.zIndex=function(_index){
		if(_index===undefined)return config.zIndex;
		config.zIndex=isNaN(_index)?9999:parseInt(_index);
		node.css("zIndex",_index);
		return this;
	};
	this.show=function(_delayHideTime){
		//_delayHideTime 自动隐藏延迟时间，默认不自动隐藏
		clearTimeout(hideTimeId);
		rePosition();
		node.css({opacity:0,display:"block"}).animate({opacity:1},500);
		if(!isNaN(_delayHideTime)){
			hideTimeId=setTimeout(content.hide,_delayHideTime);
		}
		return this;
	};
	this.hide=function(){
		clearTimeout(hideTimeId);
		node.animate({opacity:0},300,"",function(){
			node.hide();
		});
		return this;
	};
	this.message=function(_message,_isHtml){
		if(_message===undefined){return {message:config.message,isHtml:config.isHtml};}
		config.isHtml=!!_isHtml;
		config.message=_message;
		if(config.isHtml){
			nodeTempBody.html(config.message);
			nodeBody.html(config.message);
		}else{
			nodeTempBody.text(config.message);
			nodeBody.text(config.message);
		}
		rePosition();
		return this;
	};
	this.remove=function(){
		clearTimeout(hideTimeId);
		nodeTemp.remove();
		node.remove();
		content=null;
	};
	//重新定位
	function rePosition(){
		var offset=targetNode.offset();
		offset.width=targetNode.width();
		offset.height=targetNode.height();
		offset.right=offset.left+offset.width;
		offset.bottom=offset.top+offset.height;

		offset.nodeWidth=nodeTemp.width();
		offset.nodeHeight=nodeTemp.height();
		var arrawClass;
		var arrawCss={borderTopColor:"transparent",borderRightColor:"transparent",borderBottomColor:"transparent",borderLeftColor:"transparent"}
		var targetCss={top:"auto",right:"auto",bottom:"auto",left:"auto",height:offset.nodeHeight+"px",width:offset.nodeWidth+"px"};
		var arrawColor=(config.borderColor || config.bgColor);
		var arrawGap=config.borderColor?1:0;//三角偏移
		if(config.position==="top"){
			arrawCss.borderTopColor=arrawColor;
			arrawClass="HoverTipPositionBottom";
			targetCss.top=offset.top-offset.nodeHeight-10+"px";
			targetCss.left=offset.left+offset.width/2-offset.nodeWidth/2+"px";
			nodeArraw.css({marginBottom:arrawGap+"px"});
		}else if(config.position==="left"){
			arrawCss.borderLeftColor=arrawColor;
			arrawClass="HoverTipPositionRight";
			targetCss.left=offset.left-offset.nodeWidth-10+"px";
			targetCss.top=offset.top+offset.height/2-offset.nodeHeight/2+"px";
			nodeArraw.css({marginRight:arrawGap+"px"});
		}else if(config.position==="right"){
			arrawCss.borderRightColor=arrawColor;
			arrawClass="HoverTipPositionLeft";
			targetCss.left=offset.left+offset.width+10+"px";
			targetCss.top=offset.top+offset.height/2-offset.nodeHeight/2+"px";
			nodeArraw.css({marginLeft:-arrawGap+"px"});
		}else{
			arrawCss.borderBottomColor=arrawColor;
			arrawClass="HoverTipPositionTop";
			targetCss.top=offset.top+offset.height+10+"px";
			targetCss.left=offset.left+offset.width/2-offset.nodeWidth/2+"px";
			nodeArraw.css({marginTop:-arrawGap+"px"});
		}
		nodeArraw.css(arrawCss).removeClass().addClass("HoverTipArrawView "+arrawClass);
		node.css(targetCss);
		nodeBody.width(nodeTempBody.width()+1+"px");
	}
	function onTargetMouseover(event){
		if(!config.autoShow)return;
		content.show();
	}
	function onTargetMouseout(event){
		if(!config.autoHide)return;
		if(config.delayHideTime>0){
			hideTimeId=setTimeout(content.hide,config.delayHideTime);
		}else{
			content.hide();
		}
	}
	document.body.appendChild(nodeTemp.getNode());
	document.body.appendChild(node.getNode());
	this.message(config.message,config.isHtml);
	this.color(config.color);
	this.bgColor(config.bgColor);
	this.borderColor(config.borderColor);
	this.zIndex(config.zIndex);
	targetNode.bind("mouseover",onTargetMouseover);
	targetNode.bind("mouseout",onTargetMouseout);
	node.appendTo("body");
}
window.HoverTipView=function(_target,_message,_config){
	if(this!=window){throw "HoverTipView：请使用无new构造创建此对象！如： var s=HoverTipView({})";}
	return new HoverTipView(_target,_message,_config);
}

function PageView(_target,_config){
	var content=this;
	var config=Extend({
		currentPage:1,
		totalPage:0,
		pageSize:20,
		showTotalPage:true,
		showPageSize:true,
		showGotoPage:true,
		pageSizeList:[20,50,100],
		totalPageTemplete:"共{totalPage}页",
		pageSizeTemplete:"每页{pageSize}条",
		gotoPageTemplete:"跳转至{gotoPage}页",
		pageSizeCallback:function(_pageSize){},
		pageChangeCallback:function(_page){}
	},_config);
	var node=new Dom("<div>").addClass("PageView"),
		pagetotal=new Dom("<div>").addClass("PageViewTotal").addClass("PageViewHide"),
		pageSize=new Dom("<div>").addClass("PageViewPageNumber").addClass("PageViewHide"),
		pageTo=new Dom("<div>").addClass("PageViewTo");

	var pageNode=new Dom("<div>").addClass("PageViewFrame"),
		pageViewFirst=new Dom("<div>").addClass("PageViewFirst").html("<span>|◀</span>"),
		pageViewFront=new Dom("<div>").addClass("PageViewFront").html("<span>◀</span>"),
		pageViewContent=new Dom("<div>").addClass("PageViewContent"),
		pageViewNext=new Dom("<div>").addClass("PageViewNext").html("<span>▶</span>"),
		pageViewLast=new Dom("<div>").addClass("PageViewLast").html("<span>▶|</span>");
		pageNode.append(pageViewFirst).append(pageViewFront).append(pageViewContent).append(pageViewNext).append(pageViewLast);

	var selectView;

	this.totalPage=function(_page) {
		if(_page===undefined)return config.totalPage;
		config.totalPage=isNaN(parseInt(_page))?0:parseInt(_page);
		if(config.totalPage<0)config.totalPage=1;
		if(this.currentPage()>config.totalPage)this.currentPage(config.totalPage);
		pagetotal.text(config.totalPageTemplete.replace("{totalPage}",config.totalPage));
		pageViewContent.text(config.currentPage+"/"+config.totalPage);
		return this;
	}
	this.currentPage=function(_page,_toCall) {
		if(_page===undefined)return config.totalPage;
		config.currentPage=isNaN(parseInt(_page))?0:parseInt(_page);
		if(config.currentPage<0)config.currentPage=1;
		if(config.currentPage>config.totalPage)config.currentPage=config.totalPage;
		pageViewContent.text(config.currentPage+"/"+config.totalPage);
		if(_toCall && typeof config.pageChangeCallback =="function")config.pageChangeCallback.call(content,config.currentPage);
		return this;
	}
	this.appendTo=function(_target) {
		var target=_target instanceof HTMLElement?_target:(document.querySelector(_target) || document.getElementById(_target));
		if(!(target instanceof HTMLElement))return this;
		target.appendChild(node.getNode());
		return this;
	}
	this.pageSize=function(_pageSize,_toCall) {
		if(_pageSize===undefined)return content.pageSize;
		config.pageSize=isNaN(parseInt(_pageSize))?0:parseInt(_pageSize);
		if(selectView){
			selectView.selectForData(config.pageSize,_toCall);
		}
	}

	;(function(){
		if(config.showTotalPage){
			pagetotal.removeClass("PageViewHide");
			content.totalPage(config.totalPage);
			node.append(pagetotal);
		}
		if(config.showPageSize && config.pageSizeList instanceof Array){
			var pageSizeText=config.pageSizeTemplete.split("{pageSize}");
			if(pageSizeText.length>1){
				pageSize.removeClass("PageViewHide");
				selectView=new SelectView({width:35,defaultTitle:20});
				selectView.setCallback(function(_title,_data){
					if(typeof config.pageSizeCallback==="function")config.pageSizeCallback.call(content,_data);
				});
				for (var i = 0; i < config.pageSizeList.length; i++) {
					selectView.addOption(config.pageSizeList[i],config.pageSizeList[i]);
				}
				selectView.selectForData(config.pageSize);
				var pageSizeleft=document.createElement("span");
				pageSizeleft.innerHTML=pageSizeText[0];
				pageSize.append(pageSizeleft);
				selectView.appendTo(pageSize.getNode());
				var pageSizeRight=document.createElement("span");
				pageSizeRight.innerHTML=pageSizeText[1];
				pageSize.append(pageSizeRight);
				node.append(pageSize);
			}
		}

		node.append(pageNode);

		if(config.showGotoPage){
			var gotoPageTextArr=config.gotoPageTemplete.split("{gotoPage}");
			var eleDom;
			if(gotoPageTextArr.length>0){
				eleDom=document.createElement("span");
				eleDom.innerText=gotoPageTextArr[0];
				pageTo.append(eleDom);
			}
			var inputVal=document.createElement("input");
			inputVal.type="text";
			pageTo.append(inputVal);

			if(gotoPageTextArr.length>1){
				eleDom=document.createElement("span");
				eleDom.innerText=gotoPageTextArr[1];
				pageTo.append(eleDom);
			}
			eleDom=new Dom("<div>").addClass("PageViewGotoButton").text("Go");
			eleDom.bind("click",function(){
				//页码改变回调
				var pageNum=isNaN(parseInt(inputVal.value))?1:parseInt(inputVal.value);
				pageNum=pageNum>config.totalPage?config.totalPage:pageNum;
				if(typeof config.pageChangeCallback =="function"){
					config.pageChangeCallback.call(content,pageNum<0?1:pageNum);
				}
				content.currentPage(pageNum);
			});
			pageTo.append(eleDom);
			node.append(pageTo);
		}
		content.currentPage(config.currentPage);
		pageViewFirst.bind("click",function(){
			if(typeof config.pageChangeCallback =="function")config.pageChangeCallback.call(content,1);
			content.currentPage(1);
		});
		pageViewLast.bind("click",function(){
			if(typeof config.pageChangeCallback =="function")config.pageChangeCallback.call(content,config.totalPage);
			content.currentPage(config.totalPage);
		});
		pageViewFront.bind("click",function(){
			if(typeof config.pageChangeCallback =="function")config.pageChangeCallback.call(content,--config.currentPage<1?config.currentPage=1:config.currentPage);
			content.currentPage(config.currentPage);
		});
		pageViewNext.bind("click",function(){
			if(typeof config.pageChangeCallback =="function")config.pageChangeCallback.call(content,++config.currentPage>config.totalPage?config.currentPage=config.totalPage:config.currentPage);
			content.currentPage(config.currentPage);
		});
		if(_target)content.appendTo(_target);

	})()

}
window.PageView=function (_target,_config) {
	if(this!=window){throw "PageView：请使用无new构造创建此对象！如： var s=PageView(_target,_config)";}
	return new PageView(_target,_config);
}
function spinView(_target,_config){

}
window.spinView=function (_target,_config) {

}

//提交文件
window.AjaxFilePlus=function(_option) {
	var content=this;
	var file=document.createElement("input");
	file.type="file";
	file.style.display="block";
	var config=Extend({
		url:"",
		data:null,
		type:"POST",
		accept:"",
		success:null,
		error:null,
		complete:null
	},_option);


}

//ajax
window.AjaxPlus=function(_option){
	/*
	var LoadingView=null;
	AjaxPlus({
		url:'',
		data:{data:"csacsa"},
		errorMessage:"",//发生错误时的提示信息，可以忽略，忽略则系统自动处理
		beforeSend:function(){
			//创建并显示loadingbox
			LoadingView=new LoadingBox();
		},
		errorBefore:function(){
			//错误信息拦截，返回false系统不再进行处理
		},
		errorAfter:function(){
			//系统预处理错误提示结束后调用
		},
		error:function(_xhr,_textStatus,_errorThrown){
			//一旦写了这个处理函数，errorBefore和errorAfter 都不会出发，需要自己处理错误信息
		},
		success:function(_data){
			//数据页面加载成功
		},
		complete:function(_xhr,_success){
			//不管ajax执行成功与否均调用此方法，并传递是否发生错误参数
			LoadingView.remove();
		},
		loginError:function(){
			//未登录的时候触发，返回false系统不会再继续处理错误信息
		}，
		authorityError:function(){
			//没有权限的时候触发，返回false系统不会再继续处理错误信息
		}
	});
	*/
	var xhr=null;
	var ajaxSuccess=false;//是否成功
	var ajaxSuccessCallback=_option.success;
	var ajaxCompleteCallback=_option.complete;
	var ajaxErrorCallback=_option.error;
	delete _option.success;
	delete _option.complete;
	delete _option.error;
	var options={
		loginUrl:window.AjaxPlus.option.loginUrl,//登录跳转地址
		authorityUrl:window.AjaxPlus.option.authorityUrl,//无权限时跳转地址
		beforeSend:function(){},//请求发送之前执行
		type:"POST",
		dataType:"json",
		complete:function(){
			if(typeof(ajaxCompleteCallback)==="function"){ajaxCompleteCallback(xhr,ajaxSuccess);}
		},
		success:function(_data){
			//不是一个有效的数据
			if(!_data || typeof(_data)!=="object" || !_data.status){
				xhr.status=0;
				xhr.statusText="invalidData";
				return options.error(xhr,"invalidData","","错误的接口数据！");
			}
			//需要登录
			if((_data.status!=="login" && _data.status!=="location" && _data.status!=="authority" && _data.status!=="success") || _data.status==="error"){
				xhr.status=0;
				xhr.statusText=_data.status==="error"?"error":"invalidData";
				return options.error (xhr,(_data.status==="error"?"error":"invalidData"),"",_data.status==="error"?(_data.message?_data.message:"无法识别数据类型！"):"无法识别数据类型！");
			}
			//需要登录、跳转、权限验证失败情况下的处理
			if(_data.status==="login" || _data.status==="location" || _data.status==="authority"){
				if(_data.status==="login" && typeof option.loginError ==="function"){
					if(option.loginError()===false){return;}
				}
				if(_data.status==="authority" && typeof option.authorityError ==="function"){
					if(option.authorityError()===false){return;}
				}
				var locationLogin,urlPath="";
				if(_data.status==="login"){
					urlPath=options.loginUrl||window.AjaxPlus.option.loginUrl||"/";
					if(urlPath){
						locationLogin=urlPath+(String(urlPath).indexOf("?")<0?"?":"&")+"backurl="+encodeURIComponent(document.location);
					}
				}else if(_data.status==="location"){
					urlPath=(_data.location?_data.location:"/");
					if(urlPath){
						locationLogin=urlPath+(String(urlPath).indexOf("?")<0?"?":"&")+"backurl="+encodeURIComponent(document.location);
					}
				}else if(_data.status==="authority"){
					urlPath=options.authorityUrl||window.AjaxPlus.option.authorityUrl||"/";
					if(urlPath){
						locationLogin=urlPath+(String(urlPath).indexOf("?")<0?"?":"&")+"act=authority&backurl="+encodeURIComponent(document.location);
					}
				}
				document.location.replace(urlPath);
				document.close();
				return xhr;
			}
			if(typeof ajaxSuccessCallback ==="function"){ajaxSuccessCallback(_data.data);}
			return xhr;
		},
		error:function(e1,e2,e3,e4){
			if(typeof ajaxErrorCallback==="function"){
				ajaxErrorCallback(e1,e2,e4||e3);
				return ;
			}
			var errorMessage="数据请求时发生错误！";
			//自动处理
			var errorText=[
				{status:400,message:"请求无效。"},
				{status:401,message:"访问被拒绝。"},
				{status:403,message:"禁止访问。"},
				{status:404,message:"未找到要访问的网页。"},
				{status:500,message:"服务器发生错误，服务器发生错误。"},
				{status:502,message:"网关错误。"},
				{status:503,message:"无法获得服务。"},
				{status:504,message:"网关超时。"}
			];
			if(_option.errorMessage){
				errorMessage=_option.errorMessage;
			}else if(typeof(e4)==="string"){//函数内部调用自身error
				errorMessage=e4;
			}else{
				for(var i=0;i<errorText.length;i++){
					if(errorText[i].status===e1.status){
						errorMessage=errorText[i].message;
						break;
					}
				}
			}
			if(typeof(_option.errorBefore)==="function"){
				if(_option.errorBefore.call(xhr,errorMessage)===false){return;}
			}
			//errorMessage 是最终的错误信息
			new AlertView({
				title:"错误信息",//设置标题
				message:errorMessage,//设置提示信息
				buttons:{
					"确定":function(){
						if(typeof _option.errorAfter ==="function"){
							_option.errorAfter(xhr,errorMessage);
						}
					}
				}
			});
			return xhr;
		}
	};
	var option=$.extend({},options,_option);
	xhr=$.ajax(option);
	return xhr;
};
window.AjaxPlus.option={
	loginUrl:"",
	authorityUrl:""
};
//url获取对象
function RequestUrl(_url){
	var content=this;
	//获取整数参数
	this.getInt=function(_key,_default){
		if( typeof(this[_key])==="string"){
			return isNaN(parseInt((this[_key])))?(_default?_default:""):parseInt((this[_key]));
		}else{
			return _default?_default:"";
		}
	};
	//获取参数
	this.get=this.getString=function(_key,_default){
		if( typeof(this[_key])==="string"){
			return this[_key]?this[_key]:(_default?_default:"");
		}else{
			return _default?_default:"";
		}
	};
	//获取解码后的文本
	this.getUnescape=function(_key,_default){
		var str="";
		if( typeof(this[_key])==="string"){
			str= this[_key]?this[_key]:(_default?_default:"");
		}else{
			str= _default?_default:"";
		}
		return decodeURIComponent(str).replace("%21","!").replace("%27","'").replace("%28","(").replace("%29",")").replace("%2A","*").replace('%20', "+");
	};
	function analysis(_url){
		var url = _url?String(_url):String(document.location); //获取url中"?"符后的字串
		if (url.indexOf("?") <0) {return;}
		var str = url.substr(url.indexOf("?")+1);
		if(str.indexOf("#")!= -1){str=str.substr(0,str.indexOf("#"));}
		strs = str.split("&");
		for(var i = 0; i < strs.length; i ++) {
			var indexOfadd=strs[i].indexOf("=");
			var key=strs[i].substr(0,indexOfadd);
			if (indexOfadd>0 && key){
				var value=strs[i].substr(indexOfadd+1);
				if(key in content){
					if(content[key] instanceof Array){
						content[key].push(value);
					}else{
						content[key]=[content[key]];
						content[key].push(value);
					}
				}else{
					content[key]=value;
				}
			}
		}
	}
	analysis(_url);
}
window.RequestUrl=function(_url){
	if(this!=window){throw "RequestUrl：请使用无new构造创建此对象！如： var s=RequestUrl({})";}
	return new RequestUrl(_url);
};

function TabView(_target,_config){
	var config=Extend({
		titleClassName:"TabTitleView",
		bodyClassName:"TabBobyView",
		hoverClassName:"TabViewHover",
		callback:function(_index){}
	},_config);
	if(!(_target instanceof HTMLElement)){throw "无法初始化TabView对象，请查看是否输入了正确的Element参数";}
	var node=new Dom(_target).addClass("TabView");
	var content=this;

	function onMenuClick(_event){
		var targetDom=_event.target;
		if(targetDom.className.split(" ").indexOf(config.titleClassName)>=0){
			var titleList=_target.querySelectorAll("."+config.titleClassName);
			var index=titleList.indexOf(targetDom);
			if(index>=0 && typeof(config.callback)==="function"){
				if(config.callback.call(content,index)===false){
					return;
				};
			}
			content.setIndex(index);
		}
	}
	this.setIndex=function (_index) {
		var index=parseInt(_index);
		var titleList=_target.querySelectorAll("."+config.titleClassName);
		var bodyList=_target.querySelectorAll("."+config.bodyClassName);
		if(index < 0 || index>=bodyList.length || index>=titleList.length){return this;}
		for(var i=0;i<titleList.length;i++){
			var classArr=titleList[i].className.replace(/[ ]+/g," ").split(" ");
			var arrIndex=classArr.indexOf(config.hoverClassName);
			if(arrIndex>=0)classArr.splice(arrIndex,1);
			titleList[i].className=classArr.join(" ");
		}
		titleList[index].className=(titleList[index].className).split(" ").concat(config.hoverClassName).join(" ");
		for(var i=0;i<bodyList.length;i++){
			bodyList[i].style.display=(i===index?"block":"none");
		}
	}
	this.getIndex=function () {
		var titleList=_target.querySelectorAll("."+config.titleClassName);
		var bodyList=_target.querySelectorAll("."+config.bodyClassName);
		for(var i=0;i<titleList.length;i++){
			if(titleList[index].className.split(" ").indexOf(config.hoverClassName)>=0){
				return i;
			}
		}
		return -1;
	}
	node.bind("click",onMenuClick);
}
window.TabView=function(_target,_config){
	var config=Extend({
		titleClassName:"TabTitleView",
		bodyClassName:"TabBobyView",
		hoverClassName:"TabViewHover",
		callback:function(_index){}
	},_config);
	if(this!=window){throw "TabView：请使用无new构造创建此对象！如： var s=TabView({})";}

	var target=null;
	if(typeof(_target)==="string"){
		target= document.querySelector(_target) || document.getElementById(_target) || null;
	}else if(_target instanceof HTMLElement){
		target=_target;
	}
	if(!(target instanceof HTMLElement)){
		throw "初始化缺少必要的参数,请参阅API文档";
	}
	if(target.TabView){
		return target.TabView;
	}
	target.TabView=new TabView(target,config);
	return target.TabView;
}

function TreeListView(_target,_config){
	var mainContent=this;
	var mainConfig=Extend({
		lineHeight:30,
		treeList:true,//是一个树组件，不然就是个list组件
		clickSelect:true,//点击选中元素
		fileCheckMode:true,//文件check
		dirCheckMode:true,//目录check
		showIcon:false,
		dragEvent:false,
		checkCallback:function(_node,_checked,_data,_allCheckData){
			//this指向对象本省,_node指向当前选择元素本身,_checked为是否选中,_data为数据,_allCheckData为所有选中元素data
		},
		selectCallback:function(_node,_data){
			//this指向对象本省,_node指向当前选择元素本身,_data为数据
		},
		openStatusCallback:function (_node,_isOpen,_data) {
			//this指向对象本省,_node指向当前选择元素本身,_data为数据
		}
	},_config?_config:{});
	var tabIndexSize=20;//缩进
	var mainNode=new Dom((_target instanceof HTMLElement)?_target:(document.getElementById(_target)||document.createElement("div"))).addClass("TreeListView");
	var nodeFrame=new Dom("<div>").addClass("TreeListFrameView");
	mainNode.append(nodeFrame);
	var scrollView=new ScrollView(mainNode.getNode());//滚动条
	var childList=[];
	var selectNode=null;
	function TreeChildView(_title,_data,_level,_isDir,_parent,_callback) {
		var content=this;
		var childList=[];
		var parent=_parent;
		var node=new Dom(document.createElement("div")).addClass("TreeListChildView").addClass(_isDir?"":"TreeListFileChildView");
		var nodeTitleFrame=new Dom("<div>").addClass("TreeListTitleFrame");
		var nodeStatusIcon=new Dom("<div>").addClass("TreeListStatusIconView");//折叠状态图标
		var nodeCheckIcon=new Dom("<div>").addClass("TreeListCheckIcon");//check选中框图标
		var nodeTypeIcon=new Dom("<div>").addClass("TreeListTypeIconView");//文件图标
		var nodeTitle=new Dom("<div>").addClass("TreeListCaptionView").text(_title);//文件图标
		var nodeBody=new Dom("<div>").addClass("TreeListBodyView");
		node.append(nodeTitleFrame);
		nodeTitleFrame.append(nodeStatusIcon);
		nodeTitleFrame.append(nodeCheckIcon.hide());
		nodeTitleFrame.append(nodeTypeIcon.hide());
		nodeTitleFrame.append(nodeTitle);//天骄标题栏
		node.append(nodeBody);//天骄标题栏
		var config={
			title:_title,
			data:_data,
			level:_level,//层级
			iconClass:(_isDir?mainConfig.TreeDirIconView:mainConfig.TreeFileIconView),//图标
			isDir:!!_isDir,
			openStatus:false,
			selected:false,//是否选择
			isCheckMode:(_isDir?mainConfig.dirCheckMode:mainConfig.fileCheckMode),//是否检查项
			checked:false,//选中检查项
			callback:_callback
		};
		/*
		this.getHeight=function() {
			var _h=mainConfig.lineHeight;
			if(config.openStatus && config.isDir){
				for(var i=0;i<childList.length;i++){
					_h+=childList[i].getHeight();
				}
			}
			return _h;
		}
		*/
		this.isDir=function(){return config.isDir;}//是否是目录
		this.isFile=function(){return !config.isDir;}//是否是文件
		this.isCheckMode=function(){return config.isCheckMode;}//是否check模式
		this.getOpenStatus=function(){return config.openStatus;}//是否打开状态
		this.getParent=function(){return parent;}
		this.getChildList=function () {return childList;};

		this.addDir=function (_title,_data) {
			var nodeChild=new TreeChildView(_title,_data,config.level+1,true,content,childCallback);
			nodeChild.appendTo(nodeBody.getNode(0));
			childList.push(nodeChild);
			return nodeChild;
		}
		this.addFile=function(_title,_data){
			var nodeChild=new TreeChildView(_title,_data,config.level+1,false,content,childCallback);
			nodeChild.appendTo(nodeBody.getNode(0));
			childList.push(nodeChild);
			return nodeChild;
		}
		this.title=function (_title) {
			if(_title===undefined){return config.title;}
			config.title=_title;
			node.text(_title);
			return this;
		}
		this.data=function(_data){
			if(_data===undefined){return config.data;}
			config.data=_data;
			return this;
		}
		this.selected=function(_selected){
			if(_selected===undefined){return config.selected;}
			if(config.isCheckMode){
				config.selected=(_selected!==true && _selected!==false)?null:_selected;
			}
			updateStatus();
			return this;
		}
		this.iconClass=function (_iconClass){
			if(_iconClass===undefined){return config.iconClass;}
			config.iconClass=_iconClass;
			updateStatus();
			return this;
		};
		function childCallback(_type){
			if(_type==="delete"){
				var index=childList.indexOf(this);
				if(index>=0)childList.splice(index,1);
				return true;
			}
		}
		this.remove=function(){
			if(config.callback.call(content,"delete")!==false){
				node.remove();
			}
			scrollView.update();
		}
		this.removeChild=function(_index){
			if(_index>=0 && _index<childList.length-1){
				childList[parseInt(_index)].remove();
			}
		};
		//设置开关合并状态
		this.open=function(){
			if(!config.isDir){return this;}
			config.openStatus=true;
			node.addClass("TreeListViewOpen");
			scrollView.update();
		};
		this.close=function(){
			if(!config.isDir){return this;}
			config.openStatus=false;
			node.removeClass("TreeListViewOpen");
			scrollView.update();
		};
		function select(_select){
			if(!_select){
				if(selectNode!==content){return content;}
				selectNode=null;
				nodeTitleFrame.removeClass("TreeSelected");
			}else{
				if(selectNode!=null && selectNode!=content){
					selectNode.select(false);
				}
				selectNode=content;
				nodeTitleFrame.addClass("TreeSelected");
			}
			return content;
		}
		this.select=function(_select){
			return select(!!_select);
		}
		//用户操作触发事件
		function checked(_checked,_callFun){
			if(config.isCheckMode){
				config.checked=!!_checked;
			}
			if(config.isDir && (config.checked===true || config.checked===false)){
				for(var i=0;i<childList.length;i++){
					if(childList[i].isCheckMode()){
						if(childList[i].checked()!==config.checked){
							childList[i].checked(config.checked);
						}
					}
				}
			}
			if(_callFun){
				content.updateCheckUnMode();
			}else{
				//if(parent)parent.updateCheckUnMode();
			}
			return updateStatus();
		}
		this.checked=function(_checked){
			if(_checked===undefined){return config.checked;}
			return checked(_checked);
		}
		//更新选择状态
		this.updateCheckUnMode=function(){
			//设置上级显示为第三种状态
			if(!mainConfig.dirCheckMode){return this;}
			if(childList.length===0){
				if(parent)parent.updateCheckUnMode();
				return this;
			}
			var checked=childList[0].checked();
			for(var i=1;i<childList.length;i++){
				if(childList[i].checked()!==checked){
					checked=null;
					break;
				}
			}
			config.checked=checked;
			if(parent)parent.updateCheckUnMode();
			updateStatus();
			return this;
		}
		this.getAllCheck=function(){
			if(!config.isCheckMode || config.checked===false){return [];}
			var data=[content];
			for(var i=0;i<childList.length;i++){
				data=data.concat(childList[i].getAllCheck());
			}
			return data;
		};
		this.appendTo=function (_target){
			if(_target instanceof HTMLElement){
				_target.appendChild(node.getNode());
			}else if(document.getElementById(_target)){
				document.getElementById(_target).appendChild(node.getNode());
			}
			scrollView.update();
			return this;
		}
		function updateStatus() {
			var paddingLeft=config.level*20;//没一级别平移30
			paddingLeft+=6;
			if(mainConfig.treeList){
				nodeStatusIcon.css("left",paddingLeft+"px");
				paddingLeft+=20;
			}else{
				nodeStatusIcon.hide();
			}
			if(config.isCheckMode){
				nodeCheckIcon.show("inline-block").css("left",paddingLeft+"px");
				paddingLeft+=20;//添加check空间
				if(config.checked===true){
					nodeCheckIcon.addClass("TreeListCheckMode").removeClass("TreeListUnCheckMode");
				}else if(config.checked===false){
					nodeCheckIcon.removeClass("TreeListCheckMode").removeClass("TreeListUnCheckMode");
				}else{
					//第三种状态为null
					nodeCheckIcon.removeClass("TreeListCheckMode").addClass("TreeListUnCheckMode");
				}
			}else{
				nodeCheckIcon.hide();
			}
			if(config.iconClass){
				nodeTypeIcon.show("inline-block").css("left",paddingLeft+"px").addClass(config.iconClass);
				paddingLeft+=25;//增加图标显示空间
			}else{
				nodeTypeIcon.hide().getNode().className="TreeListTypeIconView";
			}
			nodeTitleFrame.css("paddingLeft",paddingLeft+"px");
			return content;
		}
		if(!config.isDir){
			delete this.addPath;
			delete this.addFile;
			node.addClass("TreeListFileChildView");
		}
		nodeStatusIcon.bind("click",function(_event){
			if(!config.isDir){return false;}
			if(mainConfig.openStatusCallback){
				//当回调函数返回fasle后取消操作
				if(mainConfig.openStatusCallback.call(mainContent,content,!config.openStatus,config.data)===false){
					_event.stopPropagation();
					return false;
				}
			}
			config.openStatus=!config.openStatus;
			node[config.openStatus?"addClass":"removeClass"]("TreeListViewOpen");
			updateStatus();
			scrollView.update();
			_event.stopPropagation();
		});
		nodeCheckIcon.bind("click",function(_event){
			if(mainConfig.checkCallback){
				//当回调函数返回fasle后取消操作
				if(mainConfig.checkCallback.call(mainContent,content,!config.checked,config.data,mainContent.getAllCheck())===false){
					_event.stopPropagation();
					return false;
				}
			}
			config.checked=!config.checked;
			checked(config.checked,true);
			//updateStatus();
			_event.stopPropagation();
		});
		nodeTitle.bind("click",function(_event){
			if(mainConfig.selectCallback){
				//当回调函数返回fasle后取消操作
				if(mainConfig.selectCallback.call(mainContent,content,config.data)===false){
					_event.stopPropagation();
					return false;
				}
			}
			if(mainConfig.clickSelect && config.isCheckMode){//点击就选中check
				if(mainConfig.checkCallback){
					//当回调函数返回fasle后取消操作
					if(mainConfig.checkCallback.call(mainContent,content,!config.checked,config.data,mainContent.getAllCheck())===false){
						_event.stopPropagation();
						return false;
					}
				}
				config.checked=!config.checked;
				checked(config.checked,true);
			}
			select(true);
			_event.stopPropagation();
		});
		updateStatus();
	}
	function childCallback(_type){
		if(_type==="delete"){
			var index=childList.indexOf(this);
			if(index>=0)childList.splice(index,1);
			return true;
		}
	}
	this.dragEvent=function(_dragEvent) {
		if(_dragEvent===undefined)return !!mainConfig.dragEvent;
		mainConfig.dragEvent=!!_dragEvent;
		if(mainConfig.dragEvent){
			nodeFrame.addClass("DragEvent");
		}else{
			nodeFrame.removeClass("DragEvent");
		}
	}
	this.updateScrollView=function () {
		scrollView.update();
		return this;
	}
	//获取所有选中元素
	this.getAllCheck=function(){
		var data=[];
		for(var i=0;i<childList.length;i++){
			data=data.concat(childList[i].getAllCheck());
		}
		return data;
	};
	//获取所有选中元素的data
	this.getAllCheckData=function(){
		var obj=content.getAllCheck();
		var dataList=[];
		for(var i=0;i<obj.length;i++){
			dataList.push(obj[i].data());
		}
		return dataList;
	};
	this.width=function (_width) {
		if(_width===undefined){return mainNode.width();}
		mainNode.width(_width);
	}
	this.height=function (_height) {
		if(_height===undefined){return mainNode.height();}
		mainNode.height(_height);
	}
	this.appendTo=function (_target){
		if(_target instanceof HTMLElement){
			_target.appendChild(mainNode.getNode());
		}else if(document.getElementById(_target)){
			document.getElementById(_target).appendChild(mainNode.getNode());
		}
		scrollView.update();
	}
	this.addDir=function (_title,_data) {
		if(!mainConfig.treeList){
			return this.addFile(_title,_data);
		}
		var nodeChild=new TreeChildView(_title,_data,0,true,null,childCallback);
		nodeChild.appendTo(nodeFrame.getNode(0));
		childList.push(nodeChild);
		scrollView.update();
		return nodeChild;
	}
	this.addFile=function(_title,_data){
		var nodeChild=new TreeChildView(_title,_data,0,false,null,childCallback);
		nodeChild.appendTo(nodeFrame.getNode(0));
		childList.push(nodeChild);
		scrollView.update();
		return nodeChild;
	}
	this.getSelectNode=function() {
		return selectNode;
	}
	this.getChildList=function() {
		return childList;
	};
	;(function(){
		mainContent.dragEvent(mainConfig.dragEvent);
	})()
}
window.TreeListView=function(_target,_config) {
	return new TreeListView(_target,_config);
}

;(function(){
	//文本对象扩展
	window.String.prototype.toNumber=function(_defaultData,_fixed){//删除左边空白
		var num=this;
		if(isNaN(Number(num)) || isNaN(parseInt(num))){return _defaultData?_defaultData:0;}
		if(Number(num)==parseInt(num)){
			return parseInt(num);
		}else{
			return Number( Number(num).toFixed(isNaN(parseInt(_fixed))?2:parseInt(_fixed)) );
		}
	};
	window.String.prototype.toInt=function(_defaultData){//删除左边空白
		var num=this;
		if(isNaN(parseInt(num))){return _defaultData===undefined?0:_defaultData;}
		return parseInt(num);
	};
	window.String.prototype.trimL=function(){//删除左边空白
		return this.repplace(/^\s+/,"");
	};
	window.String.prototype.trimR=function(){//删除右空白
		return this.replace(/\s+$/,"");
	};
	window.String.prototype.trim=function(){//删除左右空白
		return this.replace(/^\s+/,"").replace(/\s+$/,"");
	};
	window.String.prototype.toText=function(){
		if(!this.length) {return "";}
		return this.replace("&","&").replace("<","<").replace(">",">").replace(" "," ").replace(/´/g,"\'").replace('"","\"').replace(/<br>/g,'\n').replace(/<\/br>/g,'\n');
	};
	window.String.prototype.toHtml=function(){
		if(!this.length) {return "";}
		return this.replace(/&/g,"&").replace(/</g,"&lt;").replace(/>/g,">").replace(/ /g," ").replace(/\'/g,"´").replace(/\"/g,'"').replace(/\n/g,'<br>');
	};
	window.String.prototype.charLength=function(){//获取中文长度，中文占用两个字符
		var value=this,len = 0; //字符长度，汉字占有2个字节，英文占有1个字节
		for (var i = 0; i < value.length; i++) {
			if (value.substr(i,1).match(/[^\x00-\xff]/ig)){len += 2;}else {len += 1;}
		}
		return len;
	};
	window.String.prototype.subchar=function(_length,_suffix){
		//截取文本，中文占用两个字符
		var value=this,len = 0; //字符长度，汉字占有2个字节，英文占有1个字节
		var suffix=(_suffix?_suffix:"");
		for (var i = 0; i < value.length; i++) {
			if (value.substr(i,1).match(/[^\x00-\xff]/ig)){len += 2;}else {len += 1;}
			if(len>=_length){
				return value.substr(0,i+1-(len>_length?1:0))+suffix;
			}
		}
		return value;
	};
	window.Date.prototype.format =function(format){
		var o = {
			"M+" : this.getMonth()+1, //month
			"d+" : this.getDate(),    //day
			"h+" : this.getHours(),   //hour
			"m+" : this.getMinutes(), //minute
			"s+" : this.getSeconds(), //second
			"q+" : Math.floor((this.getMonth()+3)/3),  //quarter
			"S" : this.getMilliseconds() //millisecond
		};
		if(/(y+)/.test(format)){format=format.replace(RegExp.$1,(this.getFullYear()+"").substr(4- RegExp.$1.length));}
		for (var k in o) {
			if (new RegExp("(" + k + ")").test(format)) {
				format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
			}
		}
		return format;
	};
	window.NodeList.prototype.indexOf=function (_node) {
		for(var i=0;i<this.length;i++){
			if(this[i]==_node)return i;
		}
		return -1;
	}
	window.Array.prototype.indexOf=function(_value){//数组对象的扩展
		for(var i=0;i<this.length;i++){
			if(this[i]==_value)return i;
		}
		return -1;
	};
})();
})();
