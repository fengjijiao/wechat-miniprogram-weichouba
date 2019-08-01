//index.js
//获取应用实例
import Base64 from '../../utils/base64.modified.js'
const app = getApp();
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    inputShowed: false,
    inputVal: "",
    inpuTips: [],
    index_settings:{NetWorkTestFinished:false}
  },
  onLoad: function () {
    //传入appInfo参数
    this.data.appInfo=app.globalData.appInfo;
    this.setData(this.data);
  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    var that = this;
    if (!that.data.index_settings.NetWorkTestFinished){
      console.log("openId:" + (wx.getStorageSync('openId') ? wx.getStorageSync('openId') : "NULL"));
      app.sendSocketMessage({ action: 'network-test', data: { body: 'test-content' } });
      that.data.index_settings.NetWorkTestFinished = true;
    }
    app.globalData.webSocket.callback = function (res) {
      console.log('index WebSocket 返回:', res);
      var result;
      try {
        result = JSON.parse(res.data);
        console.log('JSON解码数据:', result);
      } catch (e) {
        console.error('JSON解码数据失败!');
      }
        if (!result.action) {
          console.log('WebSocket 返回不标准!');
        } else if (result.action == 'network-test') {
          if (result.data.body == 'test-content') {
            console.log('WebSocket 连接测试成功!');
          } else {
            wx.showToast({
              title: '联系不上Server!',
              icon: 'none'
            });
            console.log('WebSocket 连接测试失败!');
          }
        } else if (result.action =='get-search-suggestions'){
          console.log("搜索Tip返回:", result);
          if (!result.status) {
            console.log("搜索Tip错误返回:", res.msg);
          } else {
            that.data.inpuTips = [];
            for (var i = 0; i < result.data.inpuTips.length; i++) {
              let inpuTip = {};
              inpuTip.content = result.data.inpuTips[i].Name;
              inpuTip.id = result.data.inpuTips[i].id;
              that.data.inpuTips.push(inpuTip);
            }
            that.setData(that.data);
          }
        }
    }
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
    } else if (this.data.canIUse) {
      // 能支持open-type=getUserInfo 版本的做法
      // 无论是否被授权均尝试获取用户数据
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
      }
      // 授权判断
      // 跳转到授权页面
      wx.getStorage({
        key: 'userInfo',
        success(res) {
          console.info("Already authorized");
        },
        fail() {
          console.info("Not authorized");
          /*wx.navigateTo({
            url: '../authority/authority'
          });*/
          wx.redirectTo({
            url: '../authority/authority',
          });
        }
      });
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo;
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          });
        }
      });
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
    if (e.detail.value!=""){
      app.sendSocketMessage({ action: 'get-search-suggestions', data: { key: e.detail.value } });
      /*wx.request({
        url: 'https://' + app.globalData.appSettings.appRequestDomain + '/getSearchSuggestions?key=' + e.detail.value,
        data: {},
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          console.log("搜索Tip返回:", res);
          if (!res.data.status) {
            console.log("搜索Tip错误返回:",res.data.msg);
          }else{
            for(var i=0;i<res.data.data.inpuTips.length;i++){
              let inpuTip={};
              inpuTip.content = res.data.data.inpuTips[i].Name;
              inpuTip.id = res.data.data.inpuTips[i].id;
              that.data.inpuTips.push(inpuTip);
            }
            that.setData(that.data);
          }
        }
      });*/
    }
  },
  scanCode: function (e) {
    // 只允许从相机扫码
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
          if (res.result.substring(0, 6) !="wcb://"){
            wx.showToast({
              title: '非规范二维码!',
              icon: 'none',
              duration: 3000
            });
            console.log("非规范二维码!");
          }else{
            try {
              console.log("Qr操作信息返回:",unescape(Base64.decode(res.result.substr(6))));
              var result = JSON.parse(unescape(Base64.decode(res.result.substr(6))));
            } catch (err) {
              console.log("扫描二维码后解析出错!");
            }
            //comment
              if(result.action=="comment"){
                if(!result.id){
                  wx.showToast({
                    title: '非规范二维码!',
                    icon: 'none',
                    duration: 3000
                  });
                  consol.log("无MainPart ID.");
                }else{
                  wx.showToast({
                    title: '识别成功!',
                    icon: 'none',
                   duration: 3000
                  });
                  wx.navigateTo({
                    url: '../comment/comment?id=' + result.id
                  });
                }
              }
              //comment
            console.log("解析结果返回:",result);
          }
        console.log("扫描结果返回:",res);
      }
    });
  }
});
