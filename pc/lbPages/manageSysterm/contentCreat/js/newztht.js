$(function(){



	$(".zt_listitem .cover a").click(function(){
		var _this = $(this);
		var ewmurl = _this.parents(".zt_listitem").attr("qrcode_url");
		var zturl = _this.parents(".zt_listitem").attr("redirect_url");
		showEwm(ewmurl,zturl);
	});


	$(".ztmb_listitem .cover a").click(function(){
		var _this = $(this);
		var ewmurl = _this.parents(".ztmb_listitem").attr("qrcode_url");
		var zturl = _this.parents(".ztmb_listitem").attr("redirect_url");
		showEwm(ewmurl,zturl);
	});



    $(".dls .resetbtn").click(function(){
        var _this = $(this);
        _this.hide();



        var s1 = _this.parent().next().find(".dls_timechecker_s1");
        s1.find(".t").html("");
        s1.find("input").val("");
        s1.show();
        var s2 = _this.parent().next().find(".dls_timechecker_s2");
        s2.find("input[name='from']").val("");
        s2.find("input[name='to']").val("");
        s2.hide();
        

    });



    $(".dls_timechecker_s1").mouseenter(function(){
        var _this= $(this);
        _this.find(".dls_timechecker_s1_selectw").show();
    });

    $(".dls_timechecker_s1").mouseleave(function(){
        var _this= $(this);
        _this.find(".dls_timechecker_s1_selectw").hide();
    });

    $(".dls_timechecker_s1_selectw span").click(function(){
        var _this = $(this);
        var _t = _this.html();
        _this.parents(".dls_timechecker_s1").find(".t").html(_t);
        _this.parent().find("input[type='hidden']").val(_this.attr("day"));
        _this.parent().hide();
        _this.parents("dd").prev().find(".resetbtn").show();
    });

    $(".dls_timechecker_s1_selectw a").click(function(){
        var _this = $(this);
        _this.parents(".dls_timechecker_s1").hide();
        _this.parents(".dls_timechecker_s1").next().show();
        _this.parents("dd").prev().find(".resetbtn").show();
    });













	$(".cb_cplist_bodyw .checker").click(function(){
		var _this = $(this);
		if(_this.hasClass("checked")){
			_this.removeClass("checked");
			$(".cb_cplist_headerw .checker_all").removeClass("checked");
		}else{
			_this.addClass("checked");
		}
	});



	$(".cb_cplist_headerw .checker_all").click(function(){
		var _this = $(this);
		if(_this.hasClass("checked")){
			_this.removeClass("checked");
			$(".cb_cplist_bodyw .checker").removeClass("checked");
		}else{
			_this.addClass("checked");
			$(".cb_cplist_bodyw .checker").addClass("checked");
		}
	});


    $("#cb_slider").click(function(){
        
        var _this =  $(this);
        if(_this.hasClass("showing")){
            $("#dls_more").slideUp();
            _this.removeClass("showing");
            _this.html("展开搜索条件 ↓");
        }else{
            $("#dls_more").slideDown();
            _this.addClass("showing");
            _this.html("收起搜索条件 ↑");
        }

    });



    $(".nzt_maintabitem").click(function(){


    	var _this = $(this);
    	var _tab = _this.attr("tab");
    	$(".nzt_maintabw").hide();
    	$(".nzt_maintabw[tab="+_tab+"]").show();
    	_this.siblings().removeClass("current");
    	_this.addClass("current");

    });



    $(".page_form").on("submit",function(e){
    	var _this = $(this);
    	var _flag = _this.attr("flag");
    	if(_flag=="1"){
    		e.preventDefault();
	    	var gox = parseInt(_this.find("input[type='number']").val());
	    	var max = parseInt(_this.parents(".nzt_pagew").find(".max").html());
	    	// alert(gox);
	    	if(gox<1 || gox>max || gox=="" || !gox){
	    		showTips("请输入正确的页码");
	    	}else{
	    		// _this.parents(".nzt_pagew").find("form").submit();
	    		_this.attr("flag","0");
	    		_this.on("submit",function(e){
	    			e.returnValue = true;
	    		});
	    		_this.submit();
	    	}
    	}else{
    		
    	}
    	

    });






	$(".ztliststyles_1").click(function(){
		var _this = $(this);
		var _for = _this.attr("for");
		$(".zt_listw[list="+_for+"]").removeClass("rowstyle");
		_this.siblings().removeClass("current");
		_this.addClass("current");
	});
	$(".ztliststyles_2").click(function(){
		var _this = $(this);
		var _for = _this.attr("for");
		$(".zt_listw[list="+_for+"]").addClass("rowstyle");
		_this.siblings().removeClass("current");
		_this.addClass("current");
	});



	
	$(document).on("click","#blackbg_for_ewm",function(){
		$("#blackbg_for_ewm").fadeOut(function(){$("#blackbg_for_ewm").remove();});
		$("#ab_ewmw").fadeOut(function(){$("#ab_ewmw").remove();});
	});


});



function showTips(tips){
	$("body").append("<div class='failtips'>"+tips+"</div>");
	setTimeout(function(){
		$(".failtips").addClass("show");
	},10);
	setTimeout(function(){
		$(".failtips").removeClass("show");
		setTimeout(function(){$(".failtips").remove();},200);
	},3000);
}


function showSuccTips(tips){
	$("body").append("<div class='succtips'>"+tips+"</div>");
	setTimeout(function(){
		$(".succtips").addClass("show");
	},10);
	setTimeout(function(){
		$(".succtips").removeClass("show");
		setTimeout(function(){$(".succtips").remove();},200);
	},3000);
}



function showEwm(ewmurl,zturl){

	$("body").append("<div class='blackbg' id='blackbg_for_ewm'></div>");
	$("body").append(
		"<div class='ab_ewmw' id='ab_ewmw'><p>扫描二维码预览专题</p><img src='"+ewmurl+"'>"+
		"<input type='text' id='ab_ztlinkinput' class='ab_ztlinkinput' value="+zturl+">"+
		"<button class='ab_ztlinkinputcopybtn' id='ab_ztlinkinputcopybtn' data-clipboard-target='#ab_ztlinkinput'>复制专题链接</button>"+
		"</div>"
	);

	var clipboard = new ClipboardJS('#ab_ztlinkinputcopybtn');

    clipboard.on('success', function(e) {
    	$("#blackbg_for_ewm").fadeOut(function(){$("#blackbg_for_ewm").remove();});
		$("#ab_ewmw").fadeOut(function(){$("#ab_ewmw").remove();});
        showSuccTips("链接已生成并复制，直接粘贴即可，“快捷键Ctrl+V”");
    });

}



function ss_initDatepicker(from,to){
    eval('$("#'+from+'").datepicker({'
    +'    defaultDate: "+1w",'
    +'    changeMonth: true,'
    +'    numberOfMonths: 1,'
    +'    maxDate: "0D",'
    +'    onClose: function( selectedDate ) {'
    +'        $( "#'+to+'" ).datepicker( "option", "minDate", selectedDate );'
    +'    }'
    +'});'
    +'$("#'+to+'").datepicker({'
    +'    defaultDate: "+1w",'
    +'    changeMonth: true,'
    +'    numberOfMonths: 1,'
    +'    maxDate: "0D",'
    +'    onClose: function( selectedDate ) {'
    +'      $( "#'+from+'" ).datepicker( "option", "maxDate", selectedDate );'
    +'    }'
    +'});');
}





