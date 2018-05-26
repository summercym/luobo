/*$("表单").verifier({
	setExcursion:0//设置表单验证提示错误位置的垂直偏移量
	,submitAllCheck:true//检测模式,提交表单检测时一个一个检测，还是全部检测出来
	,setSttings:{//设置
		"#course_name":{//jQ筛选器
			required:true//必填
			,strLenInterval:[1,10]//字符限制
		}
		,"#course_english":{//jQ筛选器
			equalTo:"#course_name"//必须和这个输入框的内容一致
			,showTo:"#course_english_tip"//错误信息输出到这
		}
		,"#selectbox_classly_one":{
			//其中的this指向为上边这个jquery选择器
			hookCheck:function(){
				//表单拦截器：拦截检查函数，如果这里不反回true，表单也是不会提交的（写了这个函数其他函数就不执行检测）
				if($(this).find("input").val()==""){
					$("#selectboxmessage").addClass("verifier_error").text("请选择一级分类")
					return false;
				}
				return true;
			}
		}
	}
	,submitHandlerBefore:function(){
		//表单批量验证之前执行此方法
		return true;
	}
	,submitHandler:function(){
		//表单批量验证之后,这里可以 return false 阻止表单提交，用自己的方法ajax 提交
		return true;
	}
})*/
;(function($){
//正则表达式列表
var regexpList={
	intege:"^-?[1-9]\\d*$",					//整数
	intege1:"^[1-9]\\d*$",					//正整数
	intege2:"^-[1-9]\\d*$",					//负整数
	num:"^([+-]?)\\d*\.?\d+$",				//数字
	num1:"^[1-9]\\d*|0$",					//正数（正整数 + 0）
	num2:"^-[1-9]\\d*|0$",					//负数（负整数 + 0）
	decmal:"^[\-]?\d+\.?\d?$",			//浮点数
	email:"^\\w+((-\\w+)|(\\.\\w+))*\\@[A-Za-z0-9]+((\\.|-)[A-Za-z0-9]+)*\\.[A-Za-z0-9]+$", //邮件
	color:"^[a-fA-F0-9]{6}$",				//颜色
	url:"^http[s]?:\\/\\/([\\w-]+\\.)+[\\w-]+([\\w-./?%&=]*)?$",	//url
	chinese:"^[\\u4E00-\\u9FA5\\uF900-\\uFA2D]+$",					//仅中文
	ascii:"^[^\u9fa5-\uffff]+$",				//仅ACSII字符
	zipcode:"^\\d{6}$",						//邮编
	mobile:"^(13|15)[0-9]{9}$",				//手机
	ip4:"^(25[0-5]|2[0-4]\\d|[0-1]\\d{2}|[1-9]?\\d)\\.(25[0-5]|2[0-4]\\d|[0-1]\\d{2}|[1-9]?\\d)\\.(25[0-5]|2[0-4]\\d|[0-1]\\d{2}|[1-9]?\\d)\\.(25[0-5]|2[0-4]\\d|[0-1]\\d{2}|[1-9]?\\d)$",	//ip地址
	notempty:"^[^]+[\s\S]*[^ ]+$",						//非空
	//date:"^\\d{4}(\\-|\\/|\.)\\d{1,2}\\1\\d{1,2}$",					//日期
	tel:"^(([0\\+]\\d{2,3}-)?(0\\d{2,3})-)?(\\d{7,8})(-(\\d{3,}))?$",	//电话号码的函数(包括验证国内区号,国际区号,分机号)
	username:"^\\w+$",						//用来用户注册。匹配由数字、26个英文字母或者下划线组成的字符串
	letter:"^[A-Za-z]+$",					//字母
	letter_u:"^[A-Z]+$",						//大写字母
	letter_l:"^[a-z]+$",						//小写字母
	phone:"^1[0-9]{10}$", //手机
	idcard:"^[1-9]([0-9]{16}([0-9]|X|x))$", //	//身份证
	china:"^[\u4e00-\u9fa5]*$",				//仅仅是中文
	english:"^[a-zA-Z]*$",					//英文
	englishNumber:"^[a-zA-Z0-9]*$",			//英文加数字
	date:"^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$"
}
function log(){
	if($.fn.verifier.debug==false)return;
	if(window.console!=null && window.console.log!=null){
		window.console.log(arguments);
	}
}
//处理器
var verifier={
	//是否为空
	required:function(){
		var result= checkTagFun.call(this,{
			text:function(){
				return !(this.value==null || this.value=="");
			}
			,checkbox:function(){
				return $(this).prop("checked");
			}
			,radio:function(form){
				var name=$(this).attr("name")
				if(form.length==0)form=$("body");
				var result=false;
				form.find('input[name="'+ name +'"]').each(function(index, element) {
					if($(element).prop("checked")==true){
						result=true;
						return false;
					}
				})
				return result;
			}
		})
		return result===null?null:(result==true?true:$.fn.verifier.messages["required"]);
	}
	//是否为数值区间
	,interval:function(_min,_max){
		var regObj=new RegExp(regexpList.intege);
		var resoult=(regObj.test(""+_min)!=false) && (regObj.test(""+_max)!=false) && (regObj.test(""+this.value)!=false);
		if(resoult==false)return false;
		return (parseInt(this.value)>=parseInt(_min) && parseInt(this.value)<=parseInt(_max))?true:isFunctionReturn($.fn.verifier.messages["interval"],null).call(this,_min,_max);
	}
	//是否为中文文本长度区间
	,strChinaLenInterval:function(_min,_max){
		var len=String(""+this.value).replace(/[^\x00-\xff]/g,"aa").length;
		var _min=parseInt(""+_min),_max=parseInt(""+_max);
		return (len>=_min && len<=_max)?true:isFunctionReturn($.fn.verifier.messages["strChinaLenInterval"],null).call(this,_min,_max);
	}
	//是否为文本长度区间
	,strLenInterval:function(_min,_max){
		var len=String(""+this.value).length;
		var _min=parseInt(""+_min),_max=parseInt(""+_max);
		return (len>=_min && len<=_max)?true:isFunctionReturn($.fn.verifier.messages["strLenInterval"],null).call(this,_min,_max);
	}
	//限制最小长度
	,minlength:function(_min){
		var len=String(""+this.value).length;
		var _min=parseInt(""+_min)
		return (len>=_min)?true:isFunctionReturn($.fn.verifier.messages["minlength"],null).call(this,_min);
	}
	//限制最大长度
	,maxlength:function(_max){
		var len=String(""+this.value).length;
		var _max=parseInt(""+_max)
		return (len>_max)?true:isFunctionReturn($.fn.verifier.messages["maxlength"],null).call(this,_max);
	}
	//限制中文最小长度
	,minChinaLength:function(_min){
		var len=String(""+this.value).replace(/[^\x00-\xff]/g,"aa").length;
		var _min=parseInt(""+_min)
		return (len>=_min)?true:isFunctionReturn($.fn.verifier.messages["minChinaLength"],null).call(this,_min);
	}
	//限制中文最大长度
	,maxChinaLength:function(_max){
		var len=String(""+this.value).replace(/[^\x00-\xff]/g,"aa").length;
		var _max=parseInt(""+_max)
		return (len<=_max)?true:isFunctionReturn($.fn.verifier.messages["maxChinaLength"],null).call(this,_max);
	}
	//输入的最大数值
	,maxNumber:function(_num){
		var _val=parseInt(""+this.value);
		var _max=parseInt(""+_num);
		return (_val<=_max)?true:isFunctionReturn($.fn.verifier.messages["maxNumber"],null).call(this,_max);
	}
	//输入的最小数值
	,minNumber:function(_num){
		var _val=parseInt(""+this.value);
		var _min=parseInt(""+_num);
		return (_val>=_min)?true:isFunctionReturn($.fn.verifier.messages["minNumber"],null).call(this,_min);
	}
	//输入的值相同
	,equalTo:function(_target){
		var target=$(_target);
		if(this.value!=target.val()){
			return isFunctionReturn($.fn.verifier.messages["equalTo"],null).call(this);
		}
		return true;
	}
}
//扩充检测范围
for(var name in regexpList){
	if(verifier[name]!=null)continue;
	verifier[name]=(function (_name){
		return function(){
			var result= checkTagFun.call(this,{
				text:function(){
					return new RegExp(regexpList[_name]).test(this.value);
				}
			})
			return result===null?null:(result==true?true:isFunctionReturn($.fn.verifier.messages[_name],null).call(this));
		}
	})(name)
}
//是否是函数
function isFunctionReturn(_fun,_result){
	if(typeof(_fun)=="function"){
		return _fun;
	}else if(typeof(_fun)=="string"){
		return function(){return _fun}
	}else{
		return function(){return _result}
	}
}
//检测标签并执行相应检测函数
function checkTagFun(obj){
	var tag=tagis.call(this);
	for(var name in obj){
		if(tag==name){
			if(typeof(obj[name])=="function"){
				return obj[name].call(this,(tag=="radio"?$(this).parents("form:first"):null));
			}
		}
	}
	return null;
}
//获取标签名
function tagis(_tag){
	var tag=""
	if($(this).is("input")){
		tag=($(this).attr("type")=="hidden"?"text":($(this).attr("type")?$(this).attr("type"):"text"));
		return tag.toLowerCase();
	}else if($(this).is("textarea")){
		return "text";
	}else if($(this).is("select")){
		tag="select";
	}
	return tag.toLowerCase();
}
//显示错误信息
function runResult(_result,_target){
	var target=$(_target);
	var errHtml=_result==true?"":"<label id='"+ this.id +"_error' class='verifier_error'>"+ _result +"</label>"
	checkTagFun.call(this,{
			text:function(){
				if(_result!==true){
					$(this).addClass("error");
					if(target.length>0){
						if(target.find("#"+this.id +"_error").length>0){
							target.find("#"+this.id +"_error").text(_result);
						}else{
							target.append(errHtml);
						}
					}else{
						if($(this).parent().find("#"+this.id +"_error").length>0){
							$(this).parent().find("#"+this.id +"_error").text(_result);
						}else{
							$(errHtml).insertAfter(this);
						}
					}
				}else{
					$(this).removeClass("error");
					if(target.length>0){
						target.find(".verifier_error").remove();
					}else{
						$(this).parent().find("#"+this.id+"_error").remove();
					}
				}
			}
			,checkbox:function(){
				if(_result!==true){
					if(target.length>0){
						if(target.find("#"+this.id +"_error").length>0){
							target.find("#"+this.id +"_error").text(_result);
						}else{
							target.append(errHtml);
						}
					}else{
						if($(this).parent().find("#"+this.id +"_error").length>0){
							$(this).parent().find("#"+this.id +"_error").text(_result);
						}else{
							if($(this).next().is("label")){
								$(errHtml).insertAfter($(this).next());
							}else{
								$(errHtml).insertAfter(this);
							}
						}
					}
				}else{
					if(target.length>0){
						target.find(".verifier_error").remove();
					}else{
						$(this).parent().find("#"+this.id+"_error").remove();
					}
				}
			}
			,radio:function(form){
				if(_result!==true){
					if(target.length>0){
						if(target.find("#"+this.id +"_error").length>0){
							target.find("#"+this.id +"_error").text(_result);
						}else{
							target.append(errHtml)
						}
					}
				}else{
					if(target.length>0){
						target.find(".verifier_error").remove();
					}
				}
			}
	})

}
//检测函数
function checkVal(data){
	if(typeof data["hookCheck"]=="function"){
		var result=data["hookCheck"].call(this);
		log("hookCheck",result,this)
		return result;
	}
	for(var name in data){
		if(name!="hookCheckResult" && name!="showTo" && verifier[name]!=null){
			var param=data[name];
			//匹配并返回结果，true为通过检查，文本为出错，null 就是没有配置提示文字
			var resoult=verifier[name].apply(this, param instanceof Array?param:[param]);
			log(name,resoult,this)
			if(resoult!==true && resoult!==null){
				if(typeof data["hookCheckResult"]=="function"){
					//钩子处理
					data["hookCheckResult"](this,resoult);
				}else{
					runResult.call(this,resoult,data["showTo"]);
				}
				return false;
			}
		}
	}
	if(typeof data["hookCheckResult"]=="function"){
		//钩子处理
		data["hookCheckResult"](this,resoult);
	}else{
		runResult.call(this,true,data["showTo"]);
	}
	return true;
}

//交互事件
function onCheck(event){
	if(event.type=="blur")$(this).data("canVerifier",true);
	if($(this).data("canVerifier")!=true)return true;
	checkVal.call(event.target,event.data);
	return true;
}
function onSubmit(event){
	//提交前回调函数
	var submitHandlerBefore=$(this).data("submitHandlerBefore");
	if(typeof(submitHandlerBefore)=="function"){
		if(submitHandlerBefore.call(this,this)!==true)return false;
	}
	var settings=$(this).data("settings");
	var top=null,result=true;
	for(var name in settings){
		if($(name).length==0)continue;
		var data=settings[name];
		var mode=($(this).data("submitAllCheck")==true);

		$(name).each(function(index, element) {
			if(checkVal.call(element,data)!==true){
				var targetTop=$(element).offset().top
				if(top==null){
					top=targetTop;
				}else{
					top=(targetTop<top?targetTop:top);
				}
				result=false;
				if(mode==false)return mode;
			};
		})
		if (result!==true && mode==false)break;
	}
	if(result!==true){
		if($(this).data("gotoErrorSeat")==true){
			top=(top?top:0)-60;
			var _y=$(this).data("excursion")
			_y=isNaN(parseInt(_y)+"")==false?parseInt(_y):0;
			$('html,body').animate({scrollTop:(top>0?top:0)+_y},200);
		}
		return false;
	}
	var submitHandler=$(this).data("submitHandler");
	if(typeof(submitHandler)=="function"){
		if(submitHandler.call(this,this)!==true)return false;
	}
	return true;
}
var fun={
	init:function(_option){
		this.each(function(index, element) {
			$(element).data("gotoErrorSeat",true)
			for (var name in _option){
				if (name=="init")continue;
				if(fun[name]!=null)(fun[name]).call($(element),_option[name]);
			}
			if($(element).data("verifierInit")==null){
				$(element).unbind("submit",onSubmit).bind("submit",onSubmit);
				$(element).data("verifierInit",true);

			};
		})
	}
	,setExcursion:function(_y){
		this.each(function(index, element) {
			$(element).data("excursion",isNaN(parseInt(_y)+"")==false?parseInt(_y):0);
		})
	}
	,setSttings:function(obj){
		this.each(function(index, element) {
			var settings=$(element).data("settings");
			var newSettings=$.extend(true,{},settings,obj);
			$(element).data("settings",newSettings);
			for(var name in newSettings){
				try{
					if($(name).length==0)continue;
					var data=newSettings[name];
					if(data==null)continue;
					if(data["hookCheck"]!=null)continue;
					$(name).unbind("blur keyup change",onCheck).bind("blur keyup change",data,onCheck);
				}catch(e){log(e)}
			}
		})
	}
	,submitAllCheck:function(_mode){
		this.each(function(index, element) {
			$(element).data("submitAllCheck",_mode);
		})
	}
	,submitHandlerBefore:function(_fun){
		this.each(function(index, element) {
			$(element).data("submitHandlerBefore",_fun);
		})
	}
	,submitHandler:function(_fun){
		this.each(function(index, element) {
			$(element).data("submitHandler",_fun);
		})
	}
	,gotoErrorSeat:function(_can){
		this.each(function(index, element) {
			$(element).data("gotoErrorSeat",(_can==true));
		})
		return this;
	}
	,checkForm:function(){
		var submitResult=false;
		this.each(function(index, element) {
			submitResult=onSubmit.call(element);
			return false
		})
		return submitResult
	}
	,unBind:function(){
		this.each(function(index, element) {
			$(element).unbind("submit",onSubmit);
		})
	}
}

$.fn.verifier=function(_option){
	var option=Array.prototype.slice.call(arguments,0);
	var result=null;
	if(_option!=null && fun[_option]!=null){
		result= fun[_option].apply(this,option.slice(1));
	}else{
		result= fun.init.call(this,_option);
	}
	return (result==null?this:result);
}
$.fn.verifier.format=function(_val){
	return function(){
		var arg=Array.prototype.slice.call(arguments,0);
		for(var i=0;i<arg.length;i++){
			_val=_val.replace("{"+i+"}",arg[i]);
		}
		return _val;
	}
}
//检测文本输入框的值
$.fn.verifier.chectInput=function(_data){
	return checkVal.call(this,_data);
}
//检测文本
$.fn.verifier.chect=function(_value,_data){
	for(var name in _data){
		if(regexpList[name]!=null){
			if( new RegExp(regexpList[name]).test(_value)==false){
				return isFunctionReturn($.fn.verifier.messages[name],null)();
			};
		}
	}
	return true;
}
$.fn.verifier.debug=false;
$.fn.verifier.messages={
	required: "此项不允许为空",
	notempty: "此项不允许为空",
	remote: "请修正该字段",
	letter:"此项只允许输入英文字母",
	email: "请输入正确格式的电子邮件",
	url: "请输入合法的网址",
	date: "请输入合法的日期",
	ascii:"请输入中文、全角字符、特殊符号之外的字符",
	china:"请输入中文字符",
	english:"请输入英文字符",
	englishNumber:"请输入英文字符或阿拉伯数字",
	username:"请输入英文字符、阿拉伯数字、下划线格式的字符",
	number: "请输入合法的数字",
	intege: "只能输入整数",
	intege1: "只能输入正整数",
	intege2: "只能输入负整数",
	tel:"请输入正确的电话号码格式",
	phone:"请输入正确的手机号码格式",
	creditcard: "请输入合法的信用卡号",
	equalTo: "请再次输入相同的值",
	accept: "请输入拥有合法后缀名的字符串",
	idcard:"请输入合法的身份证帐号",
	strLenInterval:$.fn.verifier.format("请输入 {0} 到 {1} 个字符"),
	strChinaLenInterval:$.fn.verifier.format("请输入 {0} 到 {1} 个字符，中文占两个字符"),
	interval: $.fn.verifier.format("请输入一个介于 {0} 与 {1} 之间的值"),
	maxlength: $.fn.verifier.format("请输入一个长度最多是 {0} 的字符串"),
	minlength: $.fn.verifier.format("请输入一个长度最少是 {0} 的字符串"),
	maxChinaLength: $.fn.verifier.format("请输入一个长度最多是 {0} 的字符串,中文占两个字符数量"),
	minChinaLength: $.fn.verifier.format("请输入一个长度最少是 {0} 的字符串,中文占两个字符数量"),
	rangelength: $.fn.verifier.format("请输入 一个长度介于 {0} 和 {1} 之间的字符串"),
	maxNumber: $.fn.verifier.format("请输入一个小于 {0} 的值"),
	minNumber: $.fn.verifier.format("请输入一个大于 {0} 的值")
};
//序列化表单数组
$.fn.verifier.formSerialize = function (formdate) {
    var element = $(this);
    if (!!formdate) {
        for (var key in formdate) {
            var $id = element.find('#' + key);
            var value = $.trim(formdate[key]).replace(/ /g, '');
            var type = $id.attr('type');
            if ($id.hasClass("select2-hidden-accessible")) {
                type = "select";
            }
            switch (type) {
                case "checkbox":
                    if (value == "true") {
                        $id.attr("checked", 'checked');
                    } else {
                        $id.removeAttr("checked");
                    }
                    break;
                case "select":
                    $id.val(value).trigger("change");
                    break;
                default:
                    $id.val(value);
                    break;
            }
        };
        return false;
    }
    var postdata = {};
    element.find('input,select,textarea').each(function (r) {
        var $this = $(this);
        var id = $this.attr('id');
        var type = $this.attr('type');
        switch (type) {
            case "checkbox":
                postdata[id] = $this.is(":checked");
                break;
            default:
                var value = $this.val() == "" ? " " : $this.val();
                if (!$.request("keyValue")) {
                    value = value.replace(/ /g, '');
                }
                postdata[id] = value;
                break;
        }
    });
    if ($('[name=__RequestVerificationToken]').length > 0) {
        postdata["__RequestVerificationToken"] = $('[name=__RequestVerificationToken]').val();
    }
    return postdata;
};
})(jQuery)
