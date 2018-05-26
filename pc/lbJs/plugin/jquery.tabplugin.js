// JavaScript Document
;(function($){
var methods={
	init:function(){
		return this.each(function(index, element) {
			$(element).unbind("click",onClick).bind("click",onClick);
			var _index=$(element).find(".tablible.hover").eq(0).index();
			if(_index<0){_index=0;}
			$(element).find(".tablible").removeClass("hover");
			$(element).find(".tablible").eq(_index).addClass("hover");
			$(element).find(".tabvalue").hide(0);
			$(element).find(".tabvalue").eq(_index).show(0);
		});
	},
	activation:function(_index){
		return this.each(function(index, element) {
			$(element).find(".tablible").eq(_index).trigger("click");
		});
	},
	callback:function(_fun){
		return this.each(function(index, element) {
			$(element).data("callback_fun",_fun);
		});
	}
};
function onClick(event){
	if(!$(event.target).hasClass("tablible") && !$(event.target).parents(".tablible").length){return true;}
	if($(event.target).hasClass("tablible_disable") && $(event.target).parents(".tablible_disable").length>0){return true;}
	
	var index=0;
	if($(event.target).hasClass("tablible")){
		index=$(event.target).index();
	}else{
		index=$(event.target).parents(".tablible").eq(0).index();
	}
	
	$(this).find(".tablible").removeClass("hover");
	$(this).find(".tablible").eq(index).addClass("hover");
	$(this).find(".tabvalue").hide(0);
	$(this).find(".tabvalue").eq(index).show(0);
	if(typeof($(this).data("callback_fun"))=="function"){
		$(this).data("callback_fun").call(this,index,event.target,$(this).find(".tabvalue").eq(index).get(0));
	}
}
$.fn.tabPlugin=function(method){
	if(typeof method === 'undefined'){
		return methods.init.apply( this);
	}else if ( typeof(methods[method])=="function" ) {
		return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
	}else if ( typeof method === 'object' || ! method ) {
		return methods.init.apply( this, Array.prototype.slice.call( arguments, 0 ) );
	}
};
$(function(e){
	$(".tabplugin").tabPlugin();
});
})(jQuery);