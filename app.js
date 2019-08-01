//app.js
App({
  onLaunch: function () {
    var that=this;
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);
    const updateManager = wx.getUpdateManager();
    updateManager.onUpdateReady(function () {
      updateManager.applyUpdate();
    });
    wx.checkSession({
      success: function () {
        //session 未过期，并且在本生命周期一直有效
        if(!wx.getStorageSync('openId')){
          that.refreshLogin();
        }else{
          console.log('Session暂未过期!');
        }
      },
      fail: function () {
        // 登录
        that.refreshLogin();
      }
    });
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              wx.request({
                url: 'https://' + that.globalData.appSettings.appRequestDomain+'/updateUser',
                data: {
                  openId: wx.getStorageSync('openId'),
                  nickName: res.userInfo.nickName,
                  gender: res.userInfo.gender,
                  language: res.userInfo.language,
                  city: res.userInfo.city,
                  province: res.userInfo.province,
                  country: res.userInfo.country,
                  avatarUrl: res.userInfo.avatarUrl
                },
                 method:'POST',
                header: {
                  'content-type': 'application/json'
                },
                success(res) {
                  try{
                      if(res.data.status){
                        console.info("更新用户信息结果:",res.data.msg);
                      }else{
                        console.warn("更新用户信息出错:",res.data.msg);
                      }
                    console.info("更新用户信息返回:",res.data);
                   } catch(e) {
                     console.error("更新用户信息捕获错误:",e.error);
                }
                }
              });
              wx.setStorageSync('userInfo', JSON.stringify(res.userInfo));
              this.globalData.userInfo = res.userInfo;
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res);
              }
            }
          })
        }
      }
    });
  },
  refreshLogin:function (){
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        wx.request({
          //url: 'https://' + this.globalData.appSettings.appRequestDomain + '/getUserOpenId?code=' + res.code,
          //首次访问,globalData未初始化!
          url: 'https://' + this.globalData.appSettings.appRequestDomain + '/getUserOpenId?code=' + res.code,
          data: {},
          header: {
            'content-type': 'json'
          },
          success: function (res) {
            //var openid = res.data.openid; //返回openid
            //console.log('openid为' + openid);
            try {
              if (res.data.status) {
                wx.setStorageSync('openId', res.data.openId);
              } else {
                wx.setStorageSync('openId', null);
              }
            } catch (e) {
              console.error(e.error);
            }
          }
        });
      }
    });
  },
  showLoad() {
    if (!this.globalData.webSocket.Open) {
      wx.showLoading({
        title: '请稍后...',
      });
      this.globalData.webSocket.Open = false;
    }
  },
  hideLoad() {
    wx.hideLoading();
    this.globalData.webSocket.Open = true;
  },
  initwebSocket() {
    let that = this;
    that.globalData.webSocket.union = wx.connectSocket({
      url: 'wss://' + that.globalData.appSettings.appRequestDomain + '/socketTest',
      header: {
        'content-type': 'application/json'
      }
    });
    that.showLoad();
    that.globalData.webSocket.union.onOpen(function (res) {
      console.log('WebSocket连接已打开！readyState=' + that.globalData.webSocket.union.readyState);
      that.hideLoad();
      while (that.globalData.webSocket.Queue.length > 0) {
        var msg = that.globalData.webSocket.Queue.shift();
        that.sendSocketMessage(msg);
      }
    });
    that.globalData.webSocket.union.onMessage(function (res) {
      that.hideLoad();
      that.globalData.webSocket.callback(res);
    });
    that.globalData.webSocket.union.onError(function (res) {
      console.log('readyState=' + that.globalData.webSocket.union.readyState);
    });
    that.globalData.webSocket.union.onClose(function (res) {
      console.log('WebSocket连接已关闭！readyState=' + that.globalData.webSocket.union.readyState);
      that.initwebSocket();
    });
  },
  //统一发送消息
  sendSocketMessage: function (msg) {
    if (this.globalData.webSocket.union.readyState === 1) {
      this.showLoad();
      this.globalData.webSocket.union.send({
        data: JSON.stringify(msg)
      });
      console.log('发送的内容:', JSON.stringify(msg));
    } else {
      this.globalData.webSocket.Queue.push(msg);
    }
  },
  onShow: function (options) {
    if (this.globalData.webSocket.union.readyState !== 0 && this.globalData.webSocket.union.readyState !== 1) {
      console.log('开始尝试连接WebSocket！readyState=' + this.globalData.webSocket.union.readyState)
      this.initwebSocket();
    }
  },
  globalData: {
    userInfo: null,
    appInfo: { AppName: "微筹吧" },
    appSettings: {appRequestDomain: "miniprogram.fengjijiao.cn"},
    webSocket: { union: {}, Open: false, Queue: [], callback: function () { } },
  }
})