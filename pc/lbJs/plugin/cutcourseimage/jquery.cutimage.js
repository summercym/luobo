;(function($){
/*version: 2016-01-30 16:58:45
例：
$.cutImage("/images/cnu/focusimg/focus_01.jpg",
	function(img_256,img_128,img_64,callback){
		//提交图片（img_256,img_128,img_64）信息
		//在提交后的ajax中 success:function(){
			//callback(true);//用于取消组件自带的loading效果
		//}
	}
);*/
var cutImageHtml='<div class="cutImage">\
    <div class="cutImage_box_bg"></div>\
	<div class="cutImage_loading_animate"></div>\
    <div class="cutImage_box">\
		<canvas id="userhead_frame_sub" style="display:none" width="180" height="180"></canvas>\
    	<div class="cutImage_box_title">截取图片</div>\
    	<div class="cutImage_box_close"></div>\
        <div class="cutImage_canvas_box">\
			<div class="cutImage_canvas_mask"></div>\
            <canvas id="userhead_frame" width="500" height="280"></canvas>\
        </div>\
		<div class="cutImage_canvas_box_tip">500 * 280</div>\
        <div class="cutImage_canvas_s_box">\
            <canvas id="userhead_frame_s" width="376" height="210"></canvas>\
        </div>\
        <div class="cutImage_canvas_s_box_tip">376 * 210</div>\
        <div class="cutImage_canvas_l_box">\
            <canvas id="userhead_frame_l" width="280" height="157"></canvas>\
        </div>\
        <div class="cutImage_canvas_l_box_tip">280 * 157</div>\
        <div class="cutImage_canvas_submit">确 定</div>\
    </div>\
</div>';
$.cutImage=function(src,callback){
	if($('.cutImage').length===0){
		$(document.body).append(cutImageHtml);
	}
	var cutImageObj=$(document.body).data("cutImageObj");
	var canvas=document.getElementById("userhead_frame_sub");
	if(!canvas || !canvas.getContext("2d") || typeof(canvas.toDataURL)!="function"){
		return false;
	}
	if(cutImageObj){
		cutImageObj.load(src,callback);
	}else{
		$(document.body).data("cutImageObj",new initCutImage(src,callback));
	}
	return true;
};
function initCutImage(_src,_callback){
	$(".cutImage_box_close").unbind("click").bind("click",function(){
		$(".cutImage_box").hide(0);
		$(".cutImage_loading_animate").hide(0);
		$(".cutImage").fadeOut(200);
	});
	var status="load";
	var callback=_callback;
	var frameW=250,frameH=140;
	var scale=1,imgW=0,imgH=0;
	var mouseData=null;
	var img=new Image();
    var timestamp = new Date().getTime();
	img.crossOrigin="anonymous";
	this.load=function(__src,__callback){
		status="load";
		$(".cutImage_box").hide(0);
		$(".cutImage_loading_animate").show(0);
		$(".cutImage_canvas_box img").remove();
		img=new Image();
        img.crossOrigin="anonymous";
		img.onload=onload;
		img.src=__src + '?' + timestamp;
		callback=__callback;
		$(".cutImage").fadeIn(200);
	};
	//$(".cutImage_canvas_mask canvas").css({"opacity":0});
	$(".cutImage_canvas_mask").hover(function(){
		$(".cutImage_canvas_mask").addClass("noimgmask");
	},null);
	$(".cutImage_box").hide(0);
	$(".cutImage_loading_animate").show(0);
	$(".cutImage").fadeIn(200);
	$(".cutImage_box_close").unbind("click").bind("click",function(){
		$(".cutImage").fadeOut(100);
	});
	img.onload=onload;
	function onload(){
		mouseData=null;
		$(img).css("opacity",0);
		$(".cutImage_box").fadeIn(200);
		$(".cutImage_loading_animate").hide(0);
		imgW=img.width;
		imgH=img.height;
		if(imgW ==false ||  imgH==false || imgH<=0 || imgW<=0 ){
			if(typeof window.alertBox ==="function"){
				alertBox("头像上传失败，请重新选择图像!",["确定"]);
			}else{
				alert("头像上传失败，请重新选择图像!");
			}
			$(".cutImage_box").hide(0);
			$(".cutImage_loading_animate").hide(0);
			$(".cutImage").fadeOut(200);
			status="error";
			return false;
		}
		scale=frameW/imgW,
		imgSW=frameW,
		imgSH=imgH*scale;
		if(imgSH<frameH){
			scale=frameH/imgH;
			imgSH=frameH;
			imgSW=imgW*scale;
		}
		var offset={
			pageX:(imgSW-frameW)/-2,
			pageY:(imgSH-frameH)/-2
		};
		if($(".cutImage_canvas_box img").length===0){
			$(".cutImage_canvas_box")[0].appendChild(img);
		}
		$(img).css({left:offset.pageX,top:offset.pageY}).width(imgSW).height(imgSH);
		status="done";
		$(".cutImage_canvas_mask").unbind('mousewheel').bind('mousewheel',onCutImageMousewheel);
		setImageData();
	};
	
	img.onerror=function(){
		if(typeof window.alertBox ==="function"){
			alertBox("图像加载失败，请重新选择图像!",["确定"]);
		}else{
			alert("图像加载失败，请重新上传图像！");
		}
		$(".cutImage_box").hide(0);
		$(".cutImage_loading_animate").hide(0);
		$(".cutImage").fadeOut(200);
	};
	function onMouseEvent(event){
		if(status!=="done"){
			return;
		}
		switch(event.type){
			case "mousedown":
				var imgoffset=$(img).offset();
				imgoffset.right=imgoffset.left+$(img).width();
				imgoffset.bottom=imgoffset.top+$(img).height();
				if(event.pageX<imgoffset.left || event.pageY<imgoffset.top || 
					event.pageX>imgoffset.right || event.pageY>imgoffset.bottom){
					return;
				}
				mouseData={
					imgX:parseInt($(img).css("left")),
					imgY:parseInt($(img).css("top")),
					pageX:event.pageX,
					pageY:event.pageY
				};
			break;
			case "mousemove":
				if(mouseData===null){return;}
				$(img).css("left",mouseData.imgX-(mouseData.pageX-event.pageX));
				$(img).css("top",mouseData.imgY-(mouseData.pageY-event.pageY));
				setImageData();
			break;
			case "mouseup":
				mouseData=null;
			break;
			case "mouseleave":
				mouseData=null;
			break;
		}
	}
	function onCutImageMousewheel(event, delta, deltaX, deltaY){
		if(status!=="done"){return;}
		var imgX=parseInt($(img).css("left"));
		var imgY=parseInt($(img).css("top"));
		var imgNW=$(img).width();
		var imgNH=$(img).height();
		if(delta>0){
			scale+=0.1;
		}else if(delta<0){
			scale-=0.1;
			if(scale<0.1){scale=0.1;}
		}else{return false;}
		var imgSW=scale*imgW,imgSH=scale*imgH;
		var DW=imgSW-imgNW;
		var DH=imgSH-imgNH;//比之前大了多少
		var offset={
			pageX:event.pageX-$(".cutImage_canvas_box").offset().left,
			pageY:event.pageY-$(".cutImage_canvas_box").offset().top
		};
		
		var imgoffset={
			pageX:event.pageX-$(img).offset().left,
			pageY:event.pageY-$(img).offset().top
		};
		if(imgoffset.pageX<=0 || imgoffset.pageY<=0){return;}
		$(img).css({
			left:imgX-(imgoffset.pageX/imgNW)*(DW),
			top:imgY-(imgoffset.pageY/imgNH)*(DH)}).width(imgSW).height(imgSH);
		setImageData();
		return false;
	}
	function setImageData(){
		var offset=$(".cutImage_canvas_box").offset();
		var imgoffset=$(img).offset();
		var x=(offset.left-imgoffset.left)/scale;
		var y=(offset.top-imgoffset.top)/scale;
		var imgNW=$(img).width();
		var imgNH=$(img).height();
		var w=frameW/scale;
		var h=frameH/scale;
		
		var canvas = document.getElementById("userhead_frame");
		var context = canvas.getContext("2d");
		context.clearRect(0,0,500,500);
		context.drawImage(img,x,y,w,h,0,0,500,280);
		
		var canvas_s = document.getElementById("userhead_frame_s");
		var context_s = canvas_s.getContext("2d");
		context_s.clearRect(0,0,500,500);
		context_s.drawImage(img,x,y,w,h,0,0,376,210);
		
		var canvas_l = document.getElementById("userhead_frame_l");
		var context_l = canvas_l.getContext("2d");
		context_l.clearRect(0,0,500,500);
		context_l.drawImage(img,x,y,w,h,0,0,280,157);
	}
	$(".cutImage_canvas_box").unbind("mousedown").bind("mousedown",onMouseEvent); 
	$(".cutImage_canvas_box").unbind("mousemove").bind("mousemove",onMouseEvent); 
	$(".cutImage_canvas_box").unbind("mouseup").bind("mouseup",onMouseEvent); 
	$(".cutImage_canvas_box").unbind("mouseleave").bind("mouseleave",onMouseEvent);
	$(".cutImage_canvas_submit").unbind("click").bind("click",function(){
		if (typeof callback==="function"){
			$(".cutImage_box").hide(0);
			$(".cutImage_loading_animate").fadeIn(200);
			var canvas=document.getElementById("userhead_frame");
			var canvas_s = document.getElementById("userhead_frame_s");
			var canvas_l = document.getElementById("userhead_frame_l");
			callback.call($(".cutImage").get(0),
				canvas.toDataURL("image/png"),
				canvas_s.toDataURL("image/png"),
                canvas_l.toDataURL("image/png"),
				function(_result,message){
					if(_result){
						$(".cutImage_box").hide(0);
						$(".cutImage_loading_animate").hide(0);
						$(".cutImage").fadeOut(200);
					}else{
						$(".cutImage_box").show(0);
						$(".cutImage_loading_animate").hide(0);
						$(".cutImage").fadeIn(200);
					}
				}
			);
		}else{
			$(".cutImage").fadeOut(200);
		}
	});
	img.src=_src;
}
})(jQuery);