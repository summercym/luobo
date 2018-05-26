function ImageList(_frame,_list){
	var node=this.node=$(_frame),index=0,zIndex=100,timeer=0;
	node.append("<div class='leftBt'>").append("<div class='rightBt'>").append("<div class='viewFrame'>").append("<div class='arrawBox'>");
	for(var i=0;i<_list.length;i++){
		node.find(".viewFrame").append( $("<img/>").addClass( (i===0?"showImg":"")).attr("src",_list[i]).get(0));
		node.find(".arrawBox").append($("<div/>").append("<p>").addClass(i===0?"hover":"").bind("click",function(event){
				if($(this).index()!==index)toImag($(this).index(),$(this).index()>index);
			}).get(0));
	}
	$(".rightBt,.leftBt").bind("click",function(event){
		var cursurIndex=(index+($(event.target).hasClass("rightBt")?1:-1));
		index=cursurIndex=( cursurIndex>=node.find(".viewFrame img").length?0:(cursurIndex<0?node.find(".viewFrame img").length-1:cursurIndex));
		toImag(cursurIndex,$(event.target).hasClass("rightBt"));
	});
	function toImag(_index,_fangxiang){
		var okComplete={width:"100%",height:"100%",left:"0",top:"0%"};
		var leftCss={width:"0%",height:"0%",left:"100%",top:"50%"};
		var right={width:"0%",height:"0%",left:"0%",top:"50%"};
		node.find(".viewFrame img").eq(_index).css(_fangxiang?leftCss:right).css("zIndex",zIndex++).animate(okComplete,500,"",function(){});
		node.find(".arrawBox div").removeClass("hover").eq(index).addClass("hover");
	}
	function setTimeer(){
		node.find(".rightBt").trigger("click");
	}
	node.hover(function(){
		clearInterval(timeer);
	},function(){
		timeer=setInterval(setTimeer,2000);
	});
}