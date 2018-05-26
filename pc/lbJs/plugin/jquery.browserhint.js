//浏览器检测 ie8以下版本提示升级浏览器，其他浏览器不支持html5，提示升级浏览器
//更新日期 2015年10月29日09:52:46
function isIe(){return (window.ActiveXObject ? true : false)}
function isIe6() {return isIe() && !window.XMLHttpRequest}
function isIe7() {return isIe() && window.XMLHttpRequest && !document.documentMode}
function isIe8(){return isIe() &&!-[1,]&&document.documentMode}
$(function(){
	var newBrowserUrl=typeof(downloadBrowserUrl)=="undefined"?"public_browser_tips.html":downloadBrowserUrl;//下载新浏览器的页面地址
	function showBrowser(){
		var browser=$("<div>").css({position:"fixed",width:"100%",opacity:0,height:65,bottom:0,zIndex:99999,fontSize:"16px","border-top":"none","font-family":"Microsoft YaHei,Tahoma,Helvetica,Arial,SimHei,SimSun"}),
		browserbg=$("<div>").css({position:"absolute",width:"100%",height:65,bottom:0,backgroundColor:"#3f4854",zIndex:0,opacity:0.95}),
		browserbody=$("<div>").css({width:1000,height:65,"line-height":"65px",margin:"0 auto",position:"relative",zIndex:1}),
		browserclose=$("<div>").css({width:20,height:20,"line-height":"20px",position:"absolute",right:0,top:23,textAlign:"center",fontSize:"12px",color:"#ffffff","border-radius":25,cursor:"pointer"}).text("╳"),
		browsercap=$("<div>").css({height:65,"line-height":"65px",position:"absolute",textAlign:"center",left:0,top:0,right:35,overFlow:"hidden"}),
		capspan=$("<span>").text("您的浏览器版本过低，为了不影响您的学习体验，请您点此").css("color","#ffffff"),
		alink=$("<a>").text("升级浏览器").attr("href",newBrowserUrl).css({padding:"0 5px",color:"#2196f3","text-decoration":"none"}).attr("target","_blank"),
		capelse=$("<span>").text("！").css("color","#ffffff");
		alink.hover(function(){$(this).css({"text-decoration":"underline"})},function(){$(this).css({"text-decoration":"none"})});
		browserclose.hover(function(){$(this).css({background:"#777777",color:"#ffffff"})},function(){$(this).css({background:"none",color:"#777777"})});
		
		browsercap[0].appendChild(capspan[0]);
		browsercap[0].appendChild(alink[0]);
		browsercap[0].appendChild(capelse[0]);
		browserbody[0].appendChild(browsercap[0]);
		browserbody[0].appendChild(browserclose[0]);
		browser[0].appendChild(browserbg[0]);
		browser[0].appendChild(browserbody[0]);
		browser.height(0);
		$("body")[0].appendChild(browser[0]);
		browser.animate({height:65,opacity:1},500);
		browserclose.bind("click",function(){$(window).unbind("resize scroll",resize);browser.animate({height:0},500,"",function(){
			browser.remove();
		});});
		function resize(){browser.css("top",$(window).height()+$("bodu").scrollTop()-36)};
		if(isIe6() || isIe7()){
			browser.css("position","absolute");resize();
			$(window).bind("resize scroll",resize);
		}
	}
	window.showBrowser=showBrowser;
	if((window.applicationCache)==null && (isIe6()|| isIe7()||!isIe()))showBrowser();
});