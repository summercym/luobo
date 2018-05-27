layui.use('element', function(){
  var element = layui.element;
  
});
var pageManage = null;
$(function() {
  	pageManage = new PageManage();
});

function PageManage(){
	var node = this.node = $(".webContent");
	var content = this;
	//事件
	node.find(".contentCreat").bind("click",function(){
		node.find("#contentBox iframe").attr("src","./contentCreat/editzt.html");
	})
	node.find(".contentManage").bind("click",function(){
		node.find("#contentBox iframe").attr("src","./contentCreat/zt_list.html");
	})
	node.find(".commentManage").bind("click",function(){
		node.find("#contentBox iframe").attr("src","./contentCreat/plgl.html");
	})
	node.find(".dataStatistics").bind("click",function(){
		node.find("#contentBox iframe").attr("src","./contentCreat/zttj.html");
	})
}