// pages/comment/comment.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    hasRequestFinish:false,
    mainpart_id:1,
    main_data: {},
    comment_settings: { AllowPublication: true, ShowComments: true, LoadingMoreComments: false, AllowPublicationBtn: true, NoMoreComments:false },
    comment_location: { prev: 0, last: 10 },
    comment_datas: [],
    public_comment: { length: 0, content: null },
    error_tip: { show: false,content: "错误提示" },
    starMap: [
      '非常差',
      '差',
      '一般',
      '好',
      '非常好'
    ],
    evaluation: {
        name: "评分",
        star: 4,
        note: "好"
      }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.id){
      console.log("MainPart ID:"+options.id);
    }
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          });
        }
      });
    }
    var that = this;
    that.data.mainpart_id = options.id ? options.id : 0; 
    wx.request({
      url: 'https://' + app.globalData.appSettings.appRequestDomain + '/getComments?id=' + options.id,
      data: {},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log("首次访问评论返回:",res);
        if(!res.data.status){
          console.log("MainPart No Found!");
          that.data.hasRequestFinish = false;
          that.setData(that.data);
        }else{
        that.data.main_data.background = res.data.data.mainpart.mImage;
        that.data.main_data.name = res.data.data.mainpart.mName;
        that.data.main_data.introduction = res.data.data.mainpart.mDescribe;
          if (res.data.data.comments_length<1){
            that.data.comment_settings.LoadingMoreComments = true;
            that.data.comment_settings.NoMoreComments = true;
          }else{
            for (var i = 0; i < res.data.data.comments_length;i++){
              let comment = {};
              comment.nickname = res.data.data.comments[i].nickName;
              comment.avatarUrl = res.data.data.comments[i].avatarUrl;
              comment.content = res.data.data.comments[i].comment;
              comment.star = res.data.data.comments[i].evaluation;
              comment.time = res.data.data.comments[i].timestamp;
              that.data.comment_datas.push(comment);
            }
          }
        that.data.hasRequestFinish = true;
        that.setData(that.data);
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    if (that.data.comment_settings.LoadingMoreComments){
      console.log("未加载完成或额外评论数不足");
    }else{
      that.data.comment_settings.LoadingMoreComments = true;
      that.data.comment_settings.NoMoreComments = false;
      that.data.comment_location.prev = that.data.comment_location.last;
      that.data.comment_location.last = that.data.comment_location.last + 5;
      that.setData(that.data);
      let prev = that.data.comment_location.prev;
      let last = that.data.comment_location.last;
    wx.request({
      url: 'https://' + app.globalData.appSettings.appRequestDomain + '/getComments?id=' + that.data.mainpart_id + '&prev='+prev+'&last='+last,
      data: {},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log("额外加载评论:",res);
        if (!res.data.status || res.data.data.comments.length < 1){
          that.data.comment_settings.NoMoreComments=true;
          console.log("没有更多评论了!", that.data.comment_settings.NoMoreComments);
          that.setData(that.data);
        }else{
          that.data.main_data.background = res.data.data.mainpart.mImage;
          that.data.main_data.name = res.data.data.mainpart.mName;
          that.data.main_data.introduction = res.data.data.mainpart.mDescribe;
          for (var i = 0; i < res.data.data.comments_length; i++) {
            let comment = {};
            comment.nickname = res.data.data.comments[i].nickName;
            comment.avatarUrl = res.data.data.comments[i].avatarUrl;
            comment.content = res.data.data.comments[i].comment;
            comment.star = res.data.data.comments[i].evaluation;
            comment.time = res.data.data.comments[i].timestamp;
            that.data.comment_datas.push(comment);
          }
          that.data.comment_settings.LoadingMoreComments = false;
          that.setData(that.data);
        }
      }
    });
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  PublicComment: function () {
    var that = this;
    that.data.error_tip.show = false;
    that.data.comment_settings.AllowPublicationBtn = false;
    that.setData(that.data);
    if (that.data.public_comment.content == "" || that.data.public_comment.content == null){
      that.showErrorTip("评论内容不能为空!");
    }else{
      wx.showLoading({
        title: '发表中',
      });
      wx.request({
        url: 'https://' + app.globalData.appSettings.appRequestDomain + '/postComment',
        data: {
          openId: wx.getStorageSync('openId'),
          comment: that.data.public_comment.content,
          id: that.data.mainpart_id,
          evaluation: that.data.evaluation.star
        },
        method:'POST',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          console.log("发表评论返回:",res.data);
          if(res.data.status){
            that.data.comment_datas.unshift({ content: that.data.public_comment.content, avatarUrl: that.data.userInfo.avatarUrl, nickname: that.data.userInfo.nickName, time: "刚刚", star: that.data.evaluation.star });
            wx.hideLoading();
            wx.showToast({
              title: '发表成功',
              icon: 'success',
              duration: 2000
            });
            wx.navigateTo({
              url: '../notice/notice?type=success'
            });
          }else{
            wx.showToast({
              title: '评论失败',
              icon: 'none',
              duration: 2000
            });
            wx.navigateTo({
              url: '../notice/notice?type=error'
            });
          }
          that.data.comment_settings.AllowPublicationBtn = true;
          that.setData(that.data);
        }
      });
    }
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    });
  },
  bindCommentInput: function (e) {
    //console.log(e.detail.value);
    this.data.public_comment.length=e.detail.value.length;
    this.data.public_comment.content=e.detail.value;
    this.setData(this.data);
  },
  showErrorTip: function (content){
    var that=this;
    that.data.error_tip.content = content;
    that.data.error_tip.show = true;
    that.data.comment_settings.AllowPublicationBtn = true;
    that.setData(that.data);
    setTimeout(function () {
      that.data.error_tip.show = false;
      that.setData(that.data);
      },2000);
  },
  chooseStar: function (e) {
    const star = e.target.dataset.star;
    let evaluation = this.data.evaluation;
    evaluation.star = star;
    evaluation.note = this.data.starMap[star - 1];
    this.setData({
      evaluation: evaluation
    })
  }
});