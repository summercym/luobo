var urlRequest=UrlRequest();
$(function(){
	if(urlRequest.closebutton){
		$("#close_btn").fadeIn(0);
	}
	$("#face_camera").click(function(event){
		if($(".face_camera").hasClass("loading")==true)return;
		window.flashContent.takePhoto();
		$(".faceCompareTip").text("确定并提交注册");
		$("#face_camera").fadeOut(100);
		$(".face_btn").fadeIn(100);
	});
	$("#cancel_camera").click(function(event){
		window.flashContent.cancelPhoto();
		$(".faceCompareTip").text("请点击拍照");
		$("#face_camera").fadeIn(100);
		$(".face_btn").fadeOut(100);
	});
	$("#submit_camera").click(function(event){
		if($(".face_camera").hasClass("loading")==true)return;
		$(".face_btn").fadeOut(100);
		$(".faceCompareTip").text("正在提交数据...");
		try{
			var result=window.flashContent.comparePhoto(window.location.protocol+"//"+window.location.host+":"+(window.location.port?window.location.port:(window.location.protocol=="https:"?443:80))+"/user/regiFaceImg");
			if(result){
				$("#face_camera").fadeIn(100).addClass("loading");
			}else{
				$("#face_camera").fadeOut(100).removeClass("loading");
				$(".camera_result").addClass("fail").fadeIn(100);
				$(".faceCompareTip").text("当前无法提交注册,请重试").addClass("fail");
			}
		}catch(e){
			$("#face_camera").fadeOut(100).removeClass("loading");
			$(".camera_result").addClass("fail").fadeIn(100);
			$(".faceCompareTip").text("识别失败,请重试").addClass("fail");
		}
	});
	$(".camera_retry").bind("click",function(){
		$(".faceCompareTip").text("请点击拍照").removeClass("fail");
		$("#face_camera").removeClass("loading").fadeIn(100);
		$(".face_btn").fadeOut(100);
		$(".camera_result").fadeOut(100);
		window.flashContent.cancelPhoto();
	});
	$("#close_btn").bind("click",function(){
		if(window.parent && typeof(window.parent[urlRequest.callback])==="function"){
			window.parent[urlRequest.callback](null);
		}
	});
});
//初始化成功
function cameraInit(_result){
	if(_result){
		$(".face_camera").fadeIn(200);
		$(".faceCompareTip").text("请点击拍照");
	}else{
		$(".faceCompareTip").text("无法获取摄像头权限");
	}
}
//提交进度
function compareProgressCallback(_bytesTotal,_bytesLoaded){}

//识别结果回调函数
function compareCallback(_result,_data){
	var json = eval('(' + _data + ')');
	if(!_result){
		$("#face_camera").fadeOut(100);
		$(".camera_result").addClass("fail").fadeIn(100);
		$(".faceCompareTip").text(json.message).addClass("fail");
		return ;
	}
	if(json && json.status==="success"){
		$(".camera_result").removeClass("fail").fadeIn(100);
		$(".faceCompareTip").text("注册成功").removeClass("fail");
		$("#face_camera").fadeOut(100);
		if(window.parent && typeof(window.parent[urlRequest.callback])==="function"){
			window.parent[urlRequest.callback](true);
		}
	}else if((json && json.status==="error") || (json && json.status==="fail")){
		$("#face_camera").fadeOut(100);
		$(".camera_result").addClass("fail").fadeIn(100);
		$(".faceCompareTip").text(json.message).addClass("fail");
		if(window.parent && typeof(window.parent[urlRequest.callback])==="function"){
			window.parent[urlRequest.callback](false);
		}
	}else{
		$("#face_camera").fadeOut(100);
		$(".camera_result").addClass("fail").fadeIn(100);
		$(".faceCompareTip").text("抱歉,注册过程中发生错误").addClass("fail");
		if(window.parent && typeof(window.parent[urlRequest.callback])==="function"){
			window.parent[urlRequest.callback](false);
		}
	}
}


function FaceCompare(){
	var content=this;
	var node=$(".faceCompareContent");

	var status="";

	this.showClose=function(){
		node.find("#close_btn").fadeIn(0);
	};
	this.hideClose=function(){
		node.find("#close_btn").fadeOut(0);
	};
	this.setTip=function(_str){
		node.find(".faceCompareTip").text(_str);
	};
	this.getStatus=function(){
		return status;
	};
	this.showStatus=function(_status){
		switch(_status){
			case "":

				break;
			case "":

				break;
		}
		status=_status;
	};

	function initEvent(){
		$("#face_camera").click(function(event){
			if($(".face_camera").hasClass("loading")==true)return;
			window.flashContent.takePhoto();
			$(".faceCompareTip").text("确定并提交注册");
			$("#face_camera").fadeOut(100);
			$(".face_btn").fadeIn(100);
		});

	}
}
