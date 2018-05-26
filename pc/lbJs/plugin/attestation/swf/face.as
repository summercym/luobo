package {
	import flash.net.URLVariables;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLLoader;
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display.Sprite;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;
	import flash.events.*;
	import flash.external.ExternalInterface;
	import flash.geom.Rectangle;
	import flash.media.Camera;
	import flash.media.Video;
	import flash.system.Security;
	import flash.ui.ContextMenu;
	import flash.geom.*;
	import flash.utils.ByteArray;
	import PNGEncoder;
	import flash.display.MovieClip;
	import flash.display.Shape;


	public class face extends Sprite {
		private var camera: Camera;
		private var _video: Video;
		private var _num=0;
		private var videoMc:MovieClip=new MovieClip();
		public function face() {
			Security.allowDomain("*");
			Security.allowInsecureDomain("*");
			stage.align = StageAlign.TOP_LEFT;
			stage.scaleMode = StageScaleMode.NO_SCALE;
			stage.addEventListener(Event.RESIZE, onResize);
			root.loaderInfo.addEventListener(Event.COMPLETE, onCOMPLETE);
			
			var contexMenu: ContextMenu = new ContextMenu();
			contexMenu.hideBuiltInItems();
			this.contextMenu = contexMenu;
			stage.addEventListener(MouseEvent.CLICK, onStageClick);
		}
		private function onStageClick(event:MouseEvent){
			_num="2017年07月20日16:10:51";
			ExternalInterface.call("console.log",_num);
		}
		protected function onCOMPLETE(event: Event) {
			try {
				ExternalInterface.addCallback("takePhoto", takePhoto);
				ExternalInterface.addCallback("cancelPhoto", cancelPhoto);
				ExternalInterface.addCallback("comparePhoto", comparePhoto);
				ExternalInterface.addCallback("compareVersion", compareVersion);
			} catch (e:Error) {}
			 initFace();
			_setupCamera();
			onResize(null);
		}
		private function compareVersion():String{
			var version:String=("2016-12-23 11:36:00");
			version.replace("-","").replace(" ","").replace(":","");
			return version;
		}
		private function initFace():void{
		}
		private function takePhoto(): Boolean {
			if (camera == null || _video == null) return false;
			var bitmap = new BitmapData(stage.stageWidth,stage.stageHeight, true, 0xffffff);
			bitmap.draw(stage);
			//camera.copyToByteArray(new Rectangle(0,0,camera.width,camera.height),bitmap);
			var bmp = new Bitmap(bitmap);
			bmp.smoothing = true;

			var W: int = stage.stageWidth;
			var H: int = stage.stageHeight;
			bmp.width=W;
			bmp.height=H;
			this.addChild(bmp);
			return true;
		}
		public function cancelPhoto(): void {
			for (var i: int = this.numChildren - 1; i >= 0; i--) {
				if (this.getChildAt(i) is Bitmap) {
					this.removeChildAt(i);
				}
			}
		}
		
		private function getPhoto():Bitmap{
			for (var i: int = this.numChildren - 1; i >= 0; i--) {
				if (this.getChildAt(i) is Bitmap) {
					return this.removeChildAt(i) as Bitmap;
				}
			}
			return null;
		}
		
		protected function onResize(event: Event=null): void {
			var W: int = stage.stageWidth;
			var H: int = stage.stageHeight;
			var cameraW: int = camera.width;
			var cameraH: int = camera.height;
			var scale: Number = W / cameraW;
			if (cameraH * scale < H) {
				scale = H / cameraH;
				W = cameraW * scale;
			} else {
				H = cameraH * scale;
			}                               
			if (_video != null) {
				_video.width = W;
				_video.height = H;
				_video.x = (stage.stageWidth - W) / 2;
				_video.y = (stage.stageHeight - H) / 2;
			}
		}
		//初始化摄像头
		private function _setupCamera(): void {
			camera = Camera.getCamera();
			if (camera == null) {
				try {
					ExternalInterface.call("cameraInit", false)
				} catch (e: Error) {}
				return;
			}                                 
			addChild(videoMc);
			
			
			camera.addEventListener(StatusEvent.STATUS, statusHandler)
			_video = new Video(camera.width, camera.height);
			_video.smoothing = true;
			_video.attachCamera(camera);
			videoMc.graphics.beginFill(0xffffff);
			videoMc.graphics.drawRect(0,0,stage.stageWidth,stage.stageHeight);
			videoMc.graphics.endFill();
			videoMc.addChild(_video);  
			videoMc.rotationY=180;
			videoMc.x=stage.stageWidth;
			onResize();
		}
		private function statusHandler(event: StatusEvent): void {
			trace(event.code)
			if (event.code == "Camera.Unmuted") {
				try {
					ExternalInterface.call("cameraInit", true)
				} catch (e:Error) {
					trace("摄像头初始化成功")
				}
			} else {
				try {
					ExternalInterface.call("cameraInit", false)
				} catch (e:Error) {
					trace("摄像头初始化失败")
				}
			};
		}
		
		private function comparePhoto(webURL:String=""): Boolean {
			var bitmap:Bitmap=getPhoto();
			if(bitmap==null){
					return false ;
			}
			var urlVariables: URLVariables = new URLVariables();
			var bytesArr:ByteArray = PNGEncoder.encode(bitmap.bitmapData);
			var request: URLRequest = new URLRequest();
			request.url = webURL;
			request.method = URLRequestMethod.POST;
			request.data = bytesArr;
			request.contentType = "application/octet-stream";
			var loader: URLLoader = new URLLoader();
			loader.dataFormat = URLLoaderDataFormat.BINARY;
			loader.addEventListener(Event.COMPLETE, onCompleteEvent);
			loader.addEventListener(ProgressEvent.PROGRESS, onProgressEvent);
			loader.addEventListener(IOErrorEvent.IO_ERROR,onIOErrorEvent);
			loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR,onSecurityErrorEvent);
			loader.load(request);
			return true;
		}
		
		private function onCompleteEvent(event:Event):void{
			var loader:URLLoader = URLLoader(event.target);
			trace("completeHandler: " + loader.data);
			//var vars:URLVariables = new URLVariables(loader.data);
			//trace("The answer is " + vars.answer);
			ExternalInterface.call("compareCallback",true,""+loader.data);
		}
		
		private function onSecurityErrorEvent(event:SecurityErrorEvent):void{
			try {
					ExternalInterface.call("compareCallback", false,'{status:"error",message:"安全沙箱出错，无法识别！"}');
				} catch (e:Error) {
					trace("安全沙箱出错，无法识别！");
				}
		}
		
		private function onProgressEvent(event:ProgressEvent):void{
			try {
					ExternalInterface.call("compareProgressCallback", event.bytesTotal,event.bytesLoaded);
				} catch (e:Error) {
					trace("提交进度：" + event.bytesTotal+"  --  "+event.bytesLoaded);
				}
		}
		
		private function onIOErrorEvent(event:IOErrorEvent):void{
			
			try {
					ExternalInterface.call("compareCallback", false,'{status:"error",message:"网络出现故障，无法识别('+event.text+')！"}');
				} catch (e:Error) {
					trace("网络出现故障，无法识别！");
				}
		}
		
		
	}
}