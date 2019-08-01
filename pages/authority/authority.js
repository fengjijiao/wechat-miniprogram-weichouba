// pages/authority/authority.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    this.data.appInfo = app.globalData.appInfo;
    this.setData(this.data);
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  getUserInfo: function (e) {
    console.log(e);
    app.globalData.userInfo = e.detail.userInfo;
    wx.setStorageSync('userInfo', JSON.stringify(e.detail.userInfo));
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    });
    //tabBar方法switchTab
    /*wx.switchTab({
      url: '../index/index'
    });*/
    /*wx.navigateBack({
      delta: 1
    });*/
    wx.switchTab({
      url: '../index/index',
    });
    /*wx.redirectTo({
      url: '../index/index',
    });*/
  }
});