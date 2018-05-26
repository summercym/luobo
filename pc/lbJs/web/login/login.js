var studentListUrl = webContent + "/coursestudent/listStudentInfoLoadDataActionBeginV2", //初始化学生信息
  deleteAction = webContent + "/coursestudent/deleteRelateCourseandstudentByIdV2", //移除学生
  exportScoreListUrl = webContent + "/score/exportScoreListCYV2", //导出学生名单
  sendMessageAction = webContent + "/news/insertNoticePrivateV2", //发通知
  loadStudentUrl = webContent + "/coursestudent/listStudentInfoLoadDataActionOfTypeV2", //加载数据
  teamAutoCreateUrl = webContent + "/coursestudent/teamAutoCreate", //系统自动分组
  teamStuListUrl = webContent + "/coursestudent/teamStuList", //左侧人员列表
  teamInfoListUrl = webContent + "/coursestudent/teamInfoList", //右侧人员列表
  saveTeamUrl = webContent + "/coursestudent/saveTeam", //保存人员
  clearAllTeam = webContent + "/coursestudent/clearAllTeam", //清空全部小组
  exportTeamInfo = webContent + "/coursestudent/exportTeamInfo", //导出小组名单
  QRCodeUrl = webContent + "/coursestudent/queryQRCodeUrl", //二维码邀请学生进入班级
  uploadFileUrl = webContent + "/coursestudent/courseImportV2", //上传文件
  downloadUrl = webContent + "/coursestudent/uploadTemplate", //下载导入样例
  addStuUrl = webContent + "/coursestudent/addStu", //添加学生以及验证
  transferClassUrl = webContent + "/coursestudent/transferClass"; //确认学生转班次

var termId = (headInfo && headInfo.data) ? headInfo.data.termId : 0;
var courseId = (headInfo && headInfo.data) ? headInfo.data.courseId : 0;
document.title = "学生管理-" + headInfo.data.name;

var currentPageIndex = 0;

var studentManager = null,
  teamManager = null,
  teamStuManage = null,
  submitData = {};
submitData.termId = termId;
submitData.courseId = courseId;
submitData.currentPage = 1;
submitData.pageSize = 30;

var submitWay = 'GET',
  isSave = true; //小组修改信息是否保存


$(function() {
  
  
  
  

  
  
  
  

  
  


});







