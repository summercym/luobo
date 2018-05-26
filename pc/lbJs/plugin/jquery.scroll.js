// JavaScript Document
(function($){
var options={
	width:10,
	radius:10,
	marginTop:0,
	marginBottom:0,
	maxHeight:190,
	minHeight:60,
	bgColor:"#000000",
	opacity:0.2,
	hoverOpacity:0.3,
	gap:10,
	rightGap:5
}
$.fn.scrollView=function(_options){
	var arg=Array.prototype.slice.call(arguments,1);
	var result=null;
	if(typeof(_options)=="object")_options=$.extend({},options,_options);
	if(typeof(_options)=="string" && typeof(fun[_options])=="function"){
		result=fun[_options].apply(this,arg)
	}else{
		result=fun["init"].call(this,_options);
	}
	return result?result:this;
}
function onScrollViewHover(event){
	var setting=$(this).data("bindElement").data("setting");
	if(setting!=null && typeof(setting)=="object"){
		$(this).find(">.scrollviewbox>.scrollviewchild").css("opacity",(event.type=="mouseover"?setting.hoverOpacity:setting.opacity))
	}
	fun.update.call($(this).data("bindElement"),true);
}
function getCssNumber(_css,_float){
	var data=0;
	if(isNaN(_float)){
		data=parseInt($(this).css(_css));
	}else{
		data=parseFloat($(this).css(_css)).toFixed(_float);
	}
	return isNaN(data)?0:data;
}
function checkShow(){
	
}
var fun={
	init:function(_options){
		return this.each(function(index,element){
			if($(element).data("scrollInit")==true)return;
			if($(element).parent().css("position")!="absolute" && $(element).parent().css("position")!="fixed"){
				$(element).parent().css("position","relative").css("overflow","hidden");
			}
			if($(element).find(">.scrollviewbox").length==0){
				var html='<span class="scrollviewbox"><span class="scrollviewchild"></span></span>'
				$(element).parent().append(html);
			}
			
			var setting=$.extend({},options,_options)
			$(element).data("setting",setting);
			
			$(element).css("position","relative");
			var scrollviewbox=$(element).parent().find(">.scrollviewbox");
			scrollviewbox.css("position","absolute").css("right",0).css("top",0).width(options.width)
			scrollviewbox.find(">.scrollviewchild").css({
				top:setting.marginTop,
				position:"absolute",
				left:0,
				bottom:setting.marginBottom,
				width:"100%",
				opacity:setting.opacity,
				filter:"alpha(opacity="+ (setting.opacity*100) +")",
				borderRadius:setting.radius,
				backgroundColor:setting.bgColor
			})
			$(element).parent().data("bindElement",$(element)).unbind("mouseover",onScrollViewHover).bind("mouseover",onScrollViewHover).unbind("mouseout",onScrollViewHover).bind("mouseout",onScrollViewHover);
			$(element).data("paddingRight",(isNaN(parseInt($(element).css("padding-right")))?0:parseInt($(element).css("padding-right"))));
			unBindMouseWheel.call($(element).parent().get(0),onMouseWheel);
			bindMouseWheel.call($(element).parent().get(0),onMouseWheel);
			scrollviewbox.data("bindElement",$(element)).unbind("mousedown").bind({mousedown:onscrollDown,click:function (event){event.stopPropagation()}});
			fun.update.call($(element));
			$(element).data("scrollInit",true);
		})
	}
	,toTop:function(){
		return this.each(function(index,element){
			$(element).css("top",0)
			$(element).parent().find(".scrollviewbox").css("top",0);
		})
	}
	,update:function(_status){
		return this.each(function(index,element){
			var bodyFrame=$(element).parent();
			var scrollView=bodyFrame.find(">.scrollviewbox");
			var scrollViewHeight=scrollView.height();
			var setting=$(element).data("setting");
			var bodyHeight=$(element).height()+getCssNumber.call(element,"padding-top")+getCssNumber.call(element,"padding-bottom");
			var paddingRight=$(element).data("paddingRight");
			if(bodyHeight<setting["minHeight"]){
				scrollView.hide(0);
				bodyFrame.css("height",setting["minHeight"]);
				$(element).css("padding-right",paddingRight);
				return;
			}else if(bodyHeight<setting["maxHeight"]){
				scrollView.hide(0);
				bodyFrame.css("height","auto");
				$(element).css("padding-right",paddingRight);
				return;
			}else{
				bodyFrame.height(setting["maxHeight"])
				var scrollHeight=setting["maxHeight"]*(setting["maxHeight"]/bodyHeight)
				scrollView.height(scrollHeight).css("display","block");
				$(element).css("padding-right",paddingRight+setting.width+setting.rightGap);
			}
			if(_status==true)return;
			var bodyTop=parseInt($(element).css("top"))||0
			,frameHeight=bodyFrame.height()+getCssNumber.call(bodyFrame,"padding-top")+getCssNumber.call(bodyFrame,"padding-bottom");
			if (bodyTop>0){
				bodyTop=0;
				scrolltop=0;
			}else if (frameHeight-bodyHeight>=bodyTop){
				bodyTop=-(bodyHeight-frameHeight);
				scrolltop=frameHeight-scrollViewHeight;
			}else{
				bodyTop=bodyTop;
				scrolltop=Math.floor((Math.abs(bodyTop)/bodyHeight)*frameHeight);
			}
			$(element).css("top",bodyTop);
			scrollView.css("top",scrolltop);
		})
	}
}
function onMouseWheel(event){
	var orgEvent		= event || window.event
		,delta		= event.delta = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3
		,target		=event.currentTarget||event.srcElement;
		
	var bodyFrame=$(target)
		,scrollView=bodyFrame.find(">.scrollviewbox")
		,bodyView=$(target).children("div").eq(0)
		,setting=bodyView.data("setting")
		,bodyHeight=bodyView.height()+getCssNumber.call(bodyView,"padding-top")+getCssNumber.call(bodyView,"padding-bottom")
		,scrollHeight=scrollView.height()
		,frameHeight=bodyFrame.height()+getCssNumber.call(target,"padding-top")+getCssNumber.call(target,"padding-bottom")||0;
		
	if(bodyView.length<1)return;
	if(bodyHeight<=frameHeight){
		bodyView.css("top",0);
		bodyFrame.data("bindElement").css("padding-right",bodyFrame.data("bindElement").data("paddingRight"));
		scrollView.css("top",0).css("display","none");
		return;
	}
	var diff=(delta>0?1:-1) * setting["gap"]
		,bodyTop=parseInt(bodyView.css("top"))||0
		,scrolltop=0;
	if (bodyTop+diff>0){
		bodyTop=0;
		scrolltop=0;
	}else if (frameHeight-bodyHeight>=bodyTop+diff){
		bodyTop=-(bodyHeight-frameHeight);
		scrolltop=frameHeight-scrollHeight;
	}else{
		bodyTop=bodyTop+diff;
		scrolltop=Math.floor((Math.abs(bodyTop)/bodyHeight)*frameHeight);
	}
	bodyView.css("top",bodyTop);
	var scrollHeight=setting["maxHeight"]*(setting["maxHeight"]/bodyHeight)
	bodyFrame.data("bindElement").css("padding-right",bodyFrame.data("bindElement").data("paddingRight")+setting.width+setting.rightGap);
	scrollView.css({"top":scrolltop,"height":scrollHeight,"display":"block"});
	if (event.preventDefault)event.preventDefault();  
	event.returnValue = false;
}
function bindMouseWheel(_fun){
	var element=$(this).get(0);
	if(element.addEventListener){
		element.addEventListener("mousewheel",_fun,false)
		element.addEventListener("DomMouseScroll",_fun,false)
		element.addEventListener("MozMousePixelScroll",_fun,false)
	}else{
		element.attachEvent("onmousewheel",_fun);
	}
}
function unBindMouseWheel(_fun){
	var element=$(this).get(0);
	if(element.removeEventListener){
		element.removeEventListener("mousewheel",_fun)
		element.removeEventListener("DomMouseScroll",_fun)
		element.removeEventListener("MozMousePixelScroll",_fun)
	}else{
		element.detachEvent("onmousewheel",_fun);
	}
}
function onscrollDown(event){
	var targetobj=this;
	var args={target:targetobj,pageX:event.pageX,pageY:event.pageY,top:parseInt($(targetobj).css("top"))||0}
	$("body").unbind({mousemove:onMousemove,mouseup:onMouseup,selectstart:null}).bind("mousemove",args,onMousemove).bind("mouseup",args,onMouseup).bind("selectstart",function(){return false});
	return false;
}

function onMousemove(event){
	var target=event.data.target
	,pageX=event.data.pageX
	,pageY=event.data.pageY
	,top=event.data.top
	,bodyView=$(target).data("bindElement")
	
	var diff=event.pageY - pageY
	,scrollHeight=$(target).height()
	,bodyHeight=bodyView.height()+getCssNumber.call(bodyView,"padding-top")+getCssNumber.call(bodyView,"padding-bottom")
	,height=$(target).parent().height()+getCssNumber.call($(target).parent(),"padding-top")+getCssNumber.call($(target).parent(),"padding-bottom")
	top=top+diff;
	
	if(top<0){
		top=0
	}else if(top>height-scrollHeight){
		top=height-scrollHeight
	}
	$(target).css("top",top);
	top=top/height*-bodyHeight;
	//if(top<scrollbox_heght-bodyHeight)top=scrollbox_heght-bodyHeight;
	bodyView.css("top",top);
}

function onMouseup(event){
	var target=event.data.target
	,pageX=event.data.pageX
	,pageY=event.data.pageY
	
	$(document.body).unbind("mousemove",onMousemove);
	$(document.body).unbind("mouseup",onMouseup);
	$("body").unbind("selectstart");
}
	
	
})(jQuery)