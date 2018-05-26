//公共路径对象
var webPublicUrl = {
  serverInterface: "http://182.92.200.93:8290/UploadService/rest/restService/upload" //上传文件路径
};

//var webContent="http://localhost:8888/aikt";
var webContent = "";

function log() {
  if (window.console && window.console.log) {
    var agu = Array.prototype.slice.call(arguments);
    window.console.log.call(window.console, agu);
  }
}
//全站公共函数对象
function GlobalFun() {
  var content = this;
  //合并多个对象到第一对象中并返回
  this.extend = function() {
    var arg = Array.prototype.slice.call(arguments);
    for (var i = 1; i < arg.length; i++) {
      for (var name in arg[i]) {
        arg[0][name] = arg[i][name];
      }
    }
    return arg.length > 0 ? arg[0] : {};
  };
  //返回上一级路径   如果不能返回就跳转到_locationUrl,是否替换路径（默认true），后退几级
  this.goback = function(_locationUrl, _replace, _index) {
    if (window.history.length > 0) {
      window.history.go((isNaN(_index) ? -1 : parseInt(_index)));
      document.close();
      return true;
    } else if (_locationUrl !== undefined) {
      if (_replace === undefined || _replace) {
        document.location.replace(_locationUrl);
      } else {
        document.location = _locationUrl;
      }
      return true;
    }
    return false;
  };
  //检测URL路径后缀名是不是 _suffix数组中的一个
  this.checkSuffix = function(_filePath, _suffix) {
    var filePath = String(_filePath).toLowerCase();
    if (!(_suffix instanceof Array)) {
      return false;
    }
    for (var i = 0; i < _suffix.length; i++) {
      if (filePath.substr(-1 * String(_suffix[i]).length) === String(_suffix[i]).toLowerCase()) {
        return true;
      }
    }
    return false;
  };
}
//公共调用函数
var globalFun = new GlobalFun();
//ajax公共接口处理对象
function AjaxHandle(_json) {
  var authorityUrl = "/pages/login.jsp?backurl=" + encodeURIComponent(document.location);
  var loginUrl = "/pages/login.jsp?backurl=" + encodeURIComponent(document.location);
  var json = _json ? _json : null;
  //是否存在错误
  this.success = function() {
    if (json && json.status === "success") {
      return true;
    }
    return false;
  };
  //设置json
  this.setJson = function(_json) {
    if (_json !== json) {
      json = null;
    }
    if (_json && _json.status) {
      json = _json;
    }
    return (!!json);
  };
  //过滤是否需要跳转
  this.filterLocation = function(_beforeCallback) {
    if (json.status === "location") {
      if (typeof(_beforeCallback) === "function") {
        if (_beforeCallback() === false) {
          return false;
        }
      }
      var json_location = String(json.location ? json.location : "/");
      document.location.replace(json_location);
      document.close();
      return false;
    }
    return true;
  };
  //过滤是否需要登录
  this.filterLogin = function(_beforeCallback) {
    if (json.status === "authority") {
      document.location.replace(authorityUrl);
      document.close();
      return false;
    } else if (json.status === "login") {
      if (typeof(_beforeCallback) === "function") {
        if (_beforeCallback() === false) {
          return false;
        }
      }
      document.location.replace(loginUrl);
      document.close();
      return false;
    }
    return true;
  };
  //过滤是否存在错误
  this.filterError = function(_beforeCallback, _afterCallback) {
    if (json.status === "error") {
      if (typeof(_beforeCallback) === "function") {
        if (_beforeCallback((json.message ? json.message : "载入时发生错误。")) === false) {
          return false;
        }
      }
      if (typeof(alertBox) === "function") {
        alertBox(json.message, ["确定"], [function() {
          if (typeof(_afterCallback) === "function") {
            _afterCallback();
          }
        }]);
      } else {
        alert(json.message);
        if (typeof(_afterCallback) === "function") {
          _afterCallback();
        }
      }
      return false;
    }
    return true;
  };
  //获取相应的错误信息
  this.getErrorMessage = function(_error, _config) {
    if (_error instanceof Error) {
      return _error.toString();
    }
    var errorText = [{
        status: 400,
        message: "请求无效。"
      },
      {
        status: 401,
        message: "访问被拒绝。"
      },
      {
        status: 403,
        message: "禁止访问。"
      },
      {
        status: 404,
        message: "未找到要访问的网页。"
      },
      {
        status: 500,
        message: "服务器发生错误。"
      },
      {
        status: 502,
        message: "网关错误。"
      },
      {
        status: 503,
        message: "无法获得服务。"
      },
      {
        status: 504,
        message: "网关超时。"
      }
    ];
    for (var i = 0; i < errorText.length; i++) {
      if (errorText[i].status === _error.status) {
        return errorText[i].message;
      }
    }
    if (_error.status == 200) {
      return "无法解析服务器返回的数据。";
    }
    return "发生未知错误。";
  };
  //去登录
  this.toLogin = function() {
    document.location.replace(loginUrl);
  };
  //检测是否已经登录，否则去登录
  this.hasLogin = function(_toLgoin) {
    var dataInfo = (websiteInfo ? (websiteInfo.data) : {});
    if (!dataInfo.userInfo || !dataInfo.userInfo.loginStatus) {
      log("需要登录之后才可以继续浏览");
      if (_toLgoin === undefined || _toLgoin) {
        this.toLogin();
      }
      return false;
    }
    return true;
  };
}
//载入loading动画
function LoadingBox(_config) {
  var content = this,
    $obj;
  var defaultConfig = {
    target: "body",
    show: true,
    delayTime: 0
  };
  var config = {},
    timeId = 0;
  var html = '<div class="loadingbox_bg"><div class="loadingbox_icon"></div></div>';
  var node = $('<div>').append(html).addClass("loadingbox").hide();
  this.node = node;
  this.target = function(_target) {
    var target = $(_target);
    if (target.length > 0) {
      target = target.eq(0);
      if (node.get(0).parentNode === target.get(0)) {
        return;
      }
      if (node.get(0).parentNode) {
        node.get(0).parentNode.removeChild(node.get(0));
      }
      if (!target.is("body")) {
        if (target.css("position") !== "absolute" && target.css("position") !== "fixed") {
          target.css("position", "relative");
        }
        node.addClass("to_target");
      } else {
        node.removeClass("to_target");
      }
      target.get(0).appendChild(node.get(0));
    }
    return this;
  };
  this.show = function(_target) {
    if (!node.get(0).parentNode) {
      this.target(_target ? _target : "body");
    }
    node.stop(true, true).fadeIn();
    return this;
  };
  this.hide = function() {
    node.stop(true, true).fadeOut();
    return this;
  };
  //删除元素
  this.remove = function() {
    if (node.get(0).parentNode) {
      node.get(0).parentNode.removeChild(node.get(0));
    }
    return this;
  };
  //设置参数
  this.setOption = function(_config) {
    $.extend(config, defaultConfig, (_config ? _config : {}));
    this.target(config.target);
    this[config.show ? "show" : "hide"]();
    this.delayHide(config.delayTime);
    return this;
  };
  //销毁自身
  this.dispose = function() {
    this.remove();
    this.node = content = null;
  };
  //延时隐藏
  this.delayHide = function(_time) {
    if (_time) {
      clearTimeout(timeId);
      timeId = setTimeout(function() {
        content.hide();
      }, _time);
    }
    return this;
  };
  this.setOption(_config);
}

function alertBox(_message, _btCaption, _btCallback, _config) {
  //提示内容,按钮标题数组，回调函数数组，扩展对象
  var config = {
      padding: "50px 30px 0px 30px",
      boxPadding: "",
      buttonMargin: 10,
      buttonWidth: 100,
      width: 550,
      showHtml: false,
      className: [],
      btCallback: (_btCallback ? _btCallback : []),
      textAlign: "center"
    },
    alertHtml = $("<div>").addClass("alertbox").css("opacity", 0),
    alertbox_frame_html = '<div class="alertbox_bg"></div>' +
    '<div class="alertbox_frame">' +
    '<table width="100%" border="0" cellspacing="0" cellpadding="0">' +
    '<tbody><tr><td align="center" valign="middle" class="alertbox_message">' +
    '</td></tr></tbody>' +
    '</table>' +
    '<div class="alertbox_group">' +
    '</div>' +
    '</div>';
  config = globalFun.extend(config, (_config ? _config : {})); //合并对象
  alertHtml.append(alertbox_frame_html); //插入代码
  var alertbox_message = alertHtml.find(".alertbox_message").css({
      padding: config.padding,
      textAlign: config.textAlign
    }),
    group = alertHtml.find(".alertbox_group"),
    alertbox_frame = alertHtml.find(".alertbox_frame");
  if (config.boxPadding) {
    alertbox_frame.css("padding", config.boxPadding); //设置大边距
  }
  if (config.showHtml !== true) {
    alertbox_message.text(_message);
  } else {
    alertbox_message.html(_message);
  }
  for (var i = 0; i < _btCaption.length; i++) {
    var className, fn, bt;
    className = (config.className.length >= (i + 1)) ? config.className[i] : "theme_3";
    if (config.btCallback.length >= (i + 1)) {
      fn = (function(_fn) {
        return function(e) {
          _fn.call(alertHtml.get(0), e);
          alertHtml.remove();
        };
      })(config.btCallback[i]);
    } else {
      fn = function() {
        alertHtml.remove();
      };
    }
    bt = $("<button>").addClass("button").addClass(className).addClass("button_height38").width(config.buttonWidth).css("min-width", 120).css("margin-right", (_btCaption.length - 1 > i) ? config.buttonMargin : "").bind("click", fn).text(_btCaption[i]);
    group[0].appendChild(bt[0]); //插入按钮
  }
  alertbox_frame.width(config.width).css("marginLeft", (alertbox_frame.width() / -2));
  alertHtml.appendTo("body");
  alertbox_frame.animate({
    marginTop: (alertbox_frame.height() / -2)
  }, 200);
  alertHtml.animate({
    opacity: 1
  }, 200);
  return alertHtml.get(0);
}

function loadingBox(_target, _autoHideTime) {
  //显示loading效果，参数为添加到的对象
  var target = (!_target ? "body" : _target),
    $obj = $(target),
    html = $('<div>').addClass("loadingbox").css({
      opacity: 0
    });
  if ($obj.length <= 0) {
    return null;
  }
  if (!$obj.is("body")) {
    html.addClass("to_target");
    if ($obj.css("position") != "absolute" && $obj.css("position") != "fixed") {
      $obj.css("position", "relative");
    }
  }
  html.append('<div class="loadingbox_bg"><div class="loadingbox_icon"></div></div>');
  $obj.get(0).appendChild(html.get(0));
  html.stop(true).animate({
    opacity: 1
  }, 200);
  if (_autoHideTime > 0) {
    setTimeout(function() {
      html.remove();
    }, _autoHideTime);
  }
  return html.get(0);
}

function alertBoxFrame(_target, _show, _config) {
  //显示自定义弹窗
  function extend(_obj1, _obj2) {
    var obj = {},
      name;
    for (name in _obj1) {
      obj[name] = _obj1[name];
    }
    for (name in _obj2) {
      obj[name] = _obj2[name];
    }
    return obj;
  }
  var config = {
    showLoading: null,
    autoHideTime: 0
  };
  config = extend(config, _config);
  if (!$(_target).hasClass("alertboxframe")) {
    return null;
  }
  if ($(_target).find(".alertboxframe_bg").length <= 0) {
    $(_target).prepend('<div class="alertboxframe_bg"></div>');
  }
  var content = $(_target).children(":gt(0)").eq(0).css("position", "absolute"),
    loadingbox = content.find(".loadingbox");
  if (content.length <= 0) {
    return;
  }
  if (config.showLoading === true) {
    if (loadingbox.length === 0) {
      loadingbox = loadingBox(content.get(0), config.autoHideTime);
    }
  } else if (config.showLoading === false) {
    loadingbox.remove();
  }
  if (_show === false) {
    $(_target).fadeOut(300);
    $("body").css("overflow", "auto");
    clearInterval($(_target).data("alertBoxFrameTimeID"));
    return $(_target).get(0);
  }
  $("body").css("overflow", "hidden");

  function onResize() {
    if ($(_target).is(":hidden")) {
      return;
    }
    var width = content.width(),
      height = content.height(),
      paddingTop = parseInt(content.css("padding-top")),
      paddingBottom = parseInt(content.css("padding-bottom"));
    var padding = (isNaN(paddingTop) ? 0 : paddingTop) + (isNaN(paddingBottom) ? 0 : paddingBottom);
    content.css({
      position: "absolute",
      left: "50%",
      top: "50%",
      marginLeft: (width) / -2,
      marginTop: ((height) / -2) - padding / 2
    });
  }
  clearInterval($(_target).data("alertBoxFrameTimeID"));
  $(_target).stop(true, true).css("display", "block").fadeIn(300);
  onResize();

  $(_target).data("alertBoxFrameTimeID", setInterval(onResize, 1000));
  return $(_target).get(0);
}

function ajaxFilter(json) {
  if (json.status == "location" || json.status == "login") {
    if ($("body").find("loadingbox").length === 0) {
      loadingBox("body");
    }
    var gotoUrl, url = document.location;
    if (json.status == "login") {
      gotoUrl = "/pages/login.jsp"; //登录
    } else {
      gotoUrl = json.message || json.location;
    }
    gotoUrl = String(gotoUrl);
    if (json.data && json.data.flag === "noBackurl") {
      document.location.replace(gotoUrl);
      return false;
    } else if (gotoUrl.indexOf("?") < 0) {
      document.location.replace(gotoUrl + "?backurl=" + encodeURIComponent(url));
    } else {
      document.location.replace(gotoUrl + "&backurl=" + encodeURIComponent(url));
    }
    return false;
  }
  return true;
}

function ajaxFilterError(json) {
  if (json.status == "error") {
    if (json.message) {
      alertBox(json.message, ["确定"]);
    }
    return false;
  }
  return true;
}
//弹出信息框
function AlertBoxMessage(_config) {
  var content = this;
  var config = {
    width: 500,
    title: "提示信息", //设置标题
    message: "", //设置提示信息
    messageAlign: "left", //文本对齐方式
    showClose: false, //是否显示关闭按钮
    btnCaption: [],
    className: [],
    callback: []
  };
  var alertTemplete = '<div class="alertbox_bg"></div>\
					   <div class="alertFrame">\
					        <div class="alertHead">\
								<div class="alertTitle"></div>\
								<div class="closeAlertBox"></div>\
							</div>\
							<div class="alertContent"></div>\
							<div class="alertFooter"></div>\
					   </div>';
  this.node = $("<div>").append(alertTemplete).addClass("alertbox");
  this.node.append();
  //合并多个对象到第一对象中并返回
  this.extend = function() {
    var arg = Array.prototype.slice.call(arguments);
    for (var i = 1; i < arg.length; i++) {
      for (var name in arg[i]) {
        arg[0][name] = arg[i][name];
      }
    }
    return arg.length > 0 ? arg[0] : {};
  };
  config = this.extend(config, (_config ? _config : {})); //合并对象

  //设置宽度
  this.setWidth = function(_value) {
    this.node.find(".alertFrame").css({
      "width": _value,
      "margin-left": -(_value / 2)
    });
  };
  //设置高度
  this.height = function() {
    return this.node.find(".alertFrame").height();
  };
  this.marginTop = function() {
    var height = content.height();
    this.node.find(".alertFrame").css("marginTop", -height / 2);
  };
  //设置标题
  this.setTitle = function(_value) {
    this.node.find(".alertTitle").text(_value);
  };
  //是否显示关闭按钮
  this.showClose = function(_value) {
    if (_value) {
      this.node.find(".closeAlertBox").show();
    } else {
      this.node.find(".closeAlertBox").hide();
    }
  };
  //设置提示信息
  this.setMessage = function(_value) {
    this.node.find(".alertContent").text(_value);
  };
  //设置文本对齐方式
  this.setMessageAlign = function(_value) {
    this.node.find(".alertContent").css("text-align", _value ? _value : "left");
  };
  //设置按钮
  this.setBtn = function(_btnList, _classList, _callbackList) {
    for (var i = 0; i < _btnList.length; i++) {
      var className, callback, btn;
      className = (_classList.length >= (i + 1)) ? _classList[i] : "";
      if (_callbackList.length >= i + 1) {
        callback = (function(_fn) {
          return function(e) {
            _fn.call(content, e);
            content.remove();
          };
        })(_callbackList[i]);
      } else {
        callback = function() {
          content.remove();
        };
      }
      btn = $("<button>").addClass("button").addClass(className).css("marginRight", (i < _btnList.length - 1) ? 10 : "").bind("click", callback).text(_btnList[i]);
      this.node.find(".alertFooter").append(btn.get(0));
    }
  };
  //appendTo
  this.appendTo = function(_jq) {
    $(_jq).append(this.node.get(0));
    this.marginTop();
  };
  //初始化设置
  this.setConfig = function() {
    this.setWidth(config.width);
    this.setTitle(config.title);
    this.showClose(config.showClose);
    this.setMessage(config.message);
    this.setMessageAlign(config.messageAlign);
    this.setBtn(config.btnCaption, config.className, config.callback);
  };
  this.setConfig();
  //销毁弹窗事件
  this.remove = function() {
    this.node.remove();
  };
  //关闭事件
  this.node.find(".closeAlertBox").bind("click", function() {
    content.remove();
  });
}
//弹出自定义内容框
function AlertBoxFrame(_config) {
  var content = this;
  var config = {
    width: 500,
    title: "请输入内容", //设置标题
    type: 1, //1：input 2：textarea
    message: "", //内容信息
    placeholder: "", //文本提示信息
    showClose: false, //是否显示关闭按钮
    btnCaption: [],
    className: [],
    callback: []
  };
  var alertTemplete = '<div class="alertbox_bg"></div>\
					   <div class="alertFrame">\
					        <div class="alertHead">\
								<div class="alertTitle"></div>\
								<div class="closeAlertBox"></div>\
							</div>\
							<div class="alertContent">\
								<div class="contentMessage"></div>\
								<div class="contentTip"></div>\
							</div>\
							<div class="alertFooter"></div>\
					   </div>';
  this.node = $("<div>").append(alertTemplete).addClass("alertbox");
  this.node.append();
  //合并多个对象到第一对象中并返回
  this.extend = function() {
    var arg = Array.prototype.slice.call(arguments);
    for (var i = 1; i < arg.length; i++) {
      for (var name in arg[i]) {
        arg[0][name] = arg[i][name];
      }
    }
    return arg.length > 0 ? arg[0] : {};
  };
  config = this.extend(config, (_config ? _config : {})); //合并对象

  //设置宽度
  this.setWidth = function(_value) {
    this.node.find(".alertFrame").css({
      "width": _value,
      "margin-left": -(_value / 2)
    });
  };
  //设置高度
  this.height = function() {
    return this.node.find(".alertFrame").height();
  };
  this.marginTop = function() {
    var height = content.height();
    this.node.find(".alertFrame").css("marginTop", -height / 2);
  };
  //设置标题
  this.setTitle = function(_value) {
    this.node.find(".alertTitle").text(_value);
  };
  //是否显示关闭按钮
  this.showClose = function(_value) {
    if (_value) {
      this.node.find(".closeAlertBox").show();
    } else {
      this.node.find(".closeAlertBox").hide();
    }
  };
  //设置按钮
  this.setBtn = function(_btnList, _classList, _callbackList) {
    for (var i = 0; i < _btnList.length; i++) {
      var className, callback, btn;
      className = (_classList.length >= (i + 1)) ? _classList[i] : "";
      if (_callbackList.length >= i + 1) {
        callback = (function(_fn) {
          return function(e) {
            var result = _fn.call(content, e);
            if (result) {
              content.hide();
            } else {
              content.node.find(".contentTip").text("请输入内容");
            }
          };
        })(_callbackList[i]);
      } else {
        callback = function() {
          content.hide();
        };
      }
      btn = $("<button>").addClass("button").addClass(className).css("marginRight", (i < _btnList.length - 1) ? 10 : "").bind("click", callback).text(_btnList[i]);
      this.node.find(".alertFooter").append(btn.get(0));
    }
  };
  //设置文本框类型、文本信息
  this.setType = function(_type, _msg) {
    if (_type == 2) {
      this.node.find(".contentMessage").append('<textarea class="contentMsg"></textarea>');
    } else {
      this.node.find(".contentMessage").append('<input class="contentMsg" />');
    }
    this.node.find(".content_msg").val(_msg ? _msg : "");
  };
  //设置文本提示信息
  this.setPlaceholder = function(_value) {
    if (!!_value) {
      this.node.find(".contentMsg").attr("placeholder", _value);
    }
  }
  //获取文本信息
  this.getMessage = function() {
    return this.node.find(".contentMsg").val();
  }
  //显示弹窗
  this.show = function() {
    this.node.show();
  };
  //隐藏弹窗
  this.hide = function() {
    this.node.hide();
  };
  //appendTo
  this.appendTo = function(_jq) {
    $(_jq).append(this.node.get(0));
    this.marginTop();
  };
  //初始化设置
  this.setConfig = function() {
    this.setWidth(config.width);
    this.setTitle(config.title);
    this.setType(config.type, config.message);
    this.setPlaceholder(config.placeholder);
    this.showClose(config.showClose);
    this.setBtn(config.btnCaption, config.className, config.callback);
  };
  this.setConfig();
  this.hide();
  //绑定输入框监听事件
  this.node.find(".contentMsg").bind("blur change", function() {
    content.node.find(".contentTip").text("");
  });
  //关闭事件
  this.node.find(".closeAlertBox").bind("click", function() {
    content.hide();
  });

}
//layer弹出窗
function TipBox(_config) {
  var content = this;
  var config = {
    type: true,
    message: "此题未答", //设置提示信息
    time: 1000, //显示时间
    bottom: 0, //位置
    callback: ""
  };
  var alertTemplete = '<div class="tip_title"></div>';
  this.node = $("<div>").append(alertTemplete).addClass("tipBox");
  //合并多个对象到第一对象中并返回
  this.extend = function() {
    var arg = Array.prototype.slice.call(arguments);
    for (var i = 1; i < arg.length; i++) {
      for (var name in arg[i]) {
        arg[0][name] = arg[i][name];
      }
    }
    return arg.length > 0 ? arg[0] : {};
  };
  config = this.extend(config, (_config ? _config : {})); //合并对象
  //设置提示信息
  this.setMessage = function(_value) {
    this.node.find(".tip_title").text(_value ? _value : "");
  };
  //设置提示类型
  this.setType = function(_type) {
    if (_type) {
      this.node.find(".tip_title").addClass("trueTip");
    } else {
      this.node.find(".tip_title").removeClass("trueTip");
    }
  };
  //设置位置
  this.setBottom = function(_value) {
    if (_value) {
      this.node.find(".tip_title").css({
        "bottom": _value,
        "margin-top": 0,
        "top": "auto"
      });
    }
  };
  //append到body
  this.appendTo = function(_jq) {
    $(_jq).append(this.node.get(0));
  };
  this.remove = function() {
    this.node.remove();
  };
  //设置回调函数
  this.callback = function() {
    if (_callback !== undefined) {
      config.callback = _callback;
    }
  };
  //初始化设置
  this.setConfig = function() {
    this.setMessage(config.message);
    this.setType(config.type);
    this.setBottom(config.bottom);
    this.appendTo("body");
  };
  var timer = setTimeout(function() {
    content.remove();
    if (typeof(config.callback) === "function") {
      config.callback();
    }
    clearTimeout(timer);
  }, config.time);
  this.setConfig();
}
//获取url中的参数对象
function Request(_url) {
  var url = _url ? String(_url) : String(document.location); //获取url中"?"符后的字串
  var theRequest = {};
  if (url.indexOf("?") != -1) {
    var str = url.substr(url.indexOf("?") + 1);
    if (str.indexOf("#") != -1) {
      str = str.substr(0, str.indexOf("#"));
    }
    strs = str.split("&");
    for (var i = 0; i < strs.length; i++) {
      var indexOfadd = strs[i].indexOf("=");
      var key = strs[i].substr(0, indexOfadd);
      if (indexOfadd > 0 && key) {
        var value = strs[i].substr(indexOfadd + 1);
        if (key in theRequest) {
          if (theRequest[key] instanceof Array) {
            theRequest[key].push(value);
          } else {
            theRequest[key] = [theRequest[key]];
            theRequest[key].push(value);
          }
        } else {
          theRequest[key] = value;
        }
      }
    }
  }
  this.getData = function() {
    return theRequest;
  };
}
//返回上一级路径   如果不能返回就跳转到_locationUrl,是否替换路径（默认true），后退几级
function goback(_locationUrl, _replace, _index) {
  if (window.history.length > 0) {
    window.history.go((isNaN(_index) ? -1 : parseInt(_index)));
    document.close();
    return true;
  } else if (_locationUrl !== undefined) {
    if (_replace === undefined || _replace) {
      document.location.replace(_locationUrl);
    } else {
      document.location = _locationUrl;
    }
    return true;
  } else {
    document.location = "/";
  }
  return false;
}
//文本对象扩展
String.prototype.toNumber = function(_defaultData, _fixed) { //删除左边空白
  var num = this;
  if (isNaN(Number(num)) || isNaN(parseInt(num))) {
    return _defaultData ? _defaultData : 0;
  }
  if (Number(num) == parseInt(num)) {
    return parseInt(num);
  } else {
    return Number(Number(num).toFixed(isNaN(parseInt(_fixed)) ? 2 : parseInt(_fixed)));
  }
};
String.prototype.toInt = function(_defaultData) { //删除左边空白
  var num = this;
  if (isNaN(parseInt(num))) {
    return _defaultData ? _defaultData : 0;
  }
  return parseInt(num);
};
String.prototype.trimL = function() { //删除左边空白
  return this.repplace(/^\s+/, "");
};
String.prototype.trimR = function() { //删除右空白
  return this.replace(/\s+$/, "");
};
String.prototype.trim = function() { //删除左右空白
  return this.replace(/^\s+/, "").replace(/\s+$/, "");
};
String.prototype.toText = function() {
  if (!this.length) {
    return "";
  }
  return this.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&nbsp;", " ").replace(/´/g, "\'").replace("&quot;", "\"").replace(/<br>/g, '\n').replace(/<\/br>/g, '\n');
};
String.prototype.toHtml = function() {
  if (!this.length) {
    return "";
  }
  return this.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/ /g, "&nbsp;").replace(/\'/g, "´").replace(/\"/g, '&quot;').replace(/\n/g, '<br>');
};
String.prototype.charLength = function() { //获取中文长度，中文占用两个字符
  var value = this,
    len = 0; //字符长度，汉字占有2个字节，英文占有1个字节
  for (var i = 0; i < value.length; i++) {
    if (value.substr(i, 1).match(/[^\x00-\xff]/ig)) {
      len += 2;
    } else {
      len += 1;
    }
  }
  return len;
};
String.prototype.subchar = function(_length, _suffix) {
  //截取文本，中文占用两个字符
  var value = this,
    len = 0; //字符长度，汉字占有2个字节，英文占有1个字节
  var suffix = (_suffix ? _suffix : "");
  for (var i = 0; i < value.length; i++) {
    if (value.substr(i, 1).match(/[^\x00-\xff]/ig)) {
      len += 2;
    } else {
      len += 1;
    }
    if (len >= _length) {
      return value.substr(0, i + 1 - (len > _length ? 1 : 0)) + suffix;
    }
  }
  return value;
};
//日期扩展
Date.prototype.format = function(format) {
  var o = {
    "M+": this.getMonth() + 1, //month
    "d+": this.getDate(), //day
    "h+": this.getHours(), //hour
    "m+": this.getMinutes(), //minute
    "s+": this.getSeconds(), //second
    "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
    "S": this.getMilliseconds() //millisecond
  };
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    }
  }
  return format;
};
//数组对象的扩展
Array.prototype.indexOf = function(_value) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == _value) {
      return i;
    }
  }
  return -1;
};
//滚动到顶部
function ScrollTop() {
  var content = this;
  this.node = $("<div>").addClass("scrolltop").attr("title", "返回顶部").hide();
  this.show = function() {
    this.node.fadeIn();
  };
  this.hide = function() {
    this.node.fadeOut();
  };
  this.node.bind("click", function() {
    $("html,body").animate({
      scrollTop: 0
    }, 500);
  });
  this.appendTo = function(_jq) {
    if (this.node.parent().get(0)) {
      this.node.parent().get(0).removeChild(this.node.get(0));
    }
    if (!$(_jq).length) {
      return;
    }
    $(_jq).append(this.node.get(0));
    $(window).unbind("scroll", scrollEvent).bind("scroll", scrollEvent);
    scrollEvent();
  };
  var scrollEvent = function() {
    var scrollTop = $(window).scrollTop();
    if (scrollTop > 600) {
      content.show();
    } else {
      content.hide();
    }
  };
}
//ajax加载方法
$.ajaxPlus = function(_option) {
  /*
  var loadingBox=null;
  $.ajaxPlus({
  	url:indexData,
  	data:{data:"csacsa"},
  	errorMessage:"",//发生错误时的提示信息，可以忽略，忽略则系统自动处理
  	beforeSend:function(){
  		//创建并显示loadingbox
  		loadingBox=new LoadingBox();
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
  		loadingBox.remove();
  	}
  });
  */
  var xhr = null;
  var ajaxSuccess = false; //是否成功
  var ajaxSuccessCallback = _option.success;
  var ajaxCompleteCallback = _option.complete;
  var ajaxErrorCallback = _option.error;
  delete _option.success;
  delete _option.complete;
  delete _option.error;
  var options = {
    loginUrl: "/pages/login.jsp", //登录跳转地址
    authorityUrl: "/pages/login.jsp",
    beforeSend: function() {}, //请求发送之前执行
    type: "POST",
    dataType: "json",
    complete: function() {
      if (typeof(ajaxCompleteCallback) === "function") {
        ajaxCompleteCallback(xhr, ajaxSuccess);
      }
    },
    success: function(_data) {
      //不是一个有效的数据
      if (!_data || typeof(_data) !== "object" || !_data.status) {
        xhr.status = 0;
        xhr.statusText = "invalidData";
        return options.error(xhr, "invalidData", "", "错误的接口数据！");
      }
      //需要登录
      if ((_data.status !== "login" && _data.status !== "location" && _data.status !== "authority" && _data.status !== "success") || _data.status === "error") {
        xhr.status = 0;
        xhr.statusText = _data.status === "error" ? "error" : "invalidData";
        return options.error(xhr, (_data.status === "error" ? "error" : "invalidData"), "", _data.status === "error" ? (_data.message ? _data.message : "无法识别数据类型！") : "无法识别数据类型！");
      }
      //需要登录、跳转、权限验证失败情况下的处理
      if (_data.status === "login" || _data.status === "location" || _data.status === "authority") {
        document.close();
        var locationLogin = "",
          locationAddress = "",
          locationAuthority = "";
        if (_data.status === "login") {
          locationLogin = options.loginUrl + "?backurl=" + encodeURIComponent(document.location);
        } else if (_data.status === "location") {
          locationAddress = _data.location ? _data.location : "";
        } else if (_data.status === "authority") {
          locationAuthority = options.authorityUrl + "?backurl=" + encodeURIComponent(document.location);
        }
        if (locationLogin || locationAddress || locationAuthority) {
          document.location.replace(locationLogin || locationAddress || locationAuthority);
        }
        return xhr;
      }
      if (typeof ajaxSuccessCallback === "function") {
        try {
          ajaxSuccessCallback(_data.data);
        } catch (e) {
          return options.error(xhr, "error", "", e.toString())
        }
      }
      return xhr;
    },
    error: function(e1, e2, e3, e4) {
      if (typeof ajaxErrorCallback === "function") {
        ajaxErrorCallback(e1, e2, e4 || e3);
        return;
      }
      var errorMessage = "数据请求时发生错误！";
      //自动处理
      var errorText = [{
          status: 400,
          message: "请求无效。"
        },
        {
          status: 401,
          message: "访问被拒绝。"
        },
        {
          status: 403,
          message: "禁止访问。"
        },
        {
          status: 404,
          message: "未找到要访问的网页。"
        },
        {
          status: 500,
          message: "服务器发生错误，请联系系统管理员解决问题。"
        },
        {
          status: 502,
          message: "网关错误。"
        },
        {
          status: 503,
          message: "无法获得服务。"
        },
        {
          status: 504,
          message: "网关超时。"
        }
      ];
      if (_option.errorMessage) {
        errorMessage = _option.errorMessage;
      } else if (typeof(e4) === "string") { //函数内部调用自身error
        errorMessage = e4;
      } else {
        for (var i = 0; i < errorText.length; i++) {
          if (errorText[i].status === e1.status) {
            errorMessage = errorText[i].message;
            break;
          }
        }
      }

      if (typeof(_option.errorBefore) === "function") {
        if (_option.errorBefore.call(xhr, errorMessage) === false) {
          return;
        }
      }

      //errorMessage 是最终的错误信息
      var alertBoxMessage = new AlertBoxMessage({
        title: "错误信息", //设置标题
        message: errorMessage, //设置提示信息
        btnCaption: ["确定"],
        callback: [function() {
          if (typeof _option.errorAfter === "function") {
            _option.errorAfter(xhr, errorMessage);
          }
        }]
      }).appendTo("body");
      return xhr;
    }
  };
  var option = $.extend({}, options, _option);
  xhr = $.ajax(option);
  return xhr;
};
//任务消息推送
var scriptDom = document.createElement("script");
scriptDom.src = "/moocjs/plugin/websocket/notification" + ".js";
scriptDom.type = "text/javascript";
document.documentElement.getElementsByTagName("head")[0].appendChild(scriptDom);
if (websiteInfo && websiteInfo.data && websiteInfo.data.userInfo && websiteInfo.data.userInfo.ptUserId) {
  setTimeout(function() {
    new PushMessage(websiteInfo.data.userInfo.ptUserId);
  }, 2000);
}
//公共初始化
$(function() {
  var scrollTop = new ScrollTop();
  scrollTop.appendTo("body");
});
