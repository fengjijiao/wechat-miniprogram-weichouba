// pages/publicwelfare/publicwelfare.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasRequestFinish: false,
    publicwelfare_settings: { LoadingMorePublicwelfares: false, NoMorePublicwelfares: false },
    publicwelfare_location: { prev: 0, last: 10 },
    publicwelfares: [] 
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
    var that = this;
    if ( !that.data.hasRequestFinish ){
    app.sendSocketMessage({ action: 'get-publicwelfares', data: { prev: that.data.publicwelfare_location.prev, last: that.data.publicwelfare_location.last } });
    }
    app.globalData.webSocket.callback = function (res) {
      console.log('publicwelfare WebSocket 返回:', res);
      var result;
      try {
        result = JSON.parse(res.data);
        console.log('JSON解码数据:', result);
      } catch (e) {
        console.error('JSON解码数据失败!');
      }
        if (!result.action) {
          console.log('WebSocket 返回不标准!');
        } else if (result.action == 'get-publicwelfares') {
          console.log("公益返回:", result);
          if (result.status) {
            that.data.hasRequestFinish = true;
            if (result.data.publicwelfares_length < 1) {
              that.data.publicwelfare_settings.LoadingMorePublicwelfares = true;
              that.data.publicwelfare_settings.NoMorePublicwelfares = true;
            } else {
              for (var i = 0; i < result.data.publicwelfares_length; i++) {
                let publicwelfare = {};
                publicwelfare.Name = result.data.publicwelfares[i].Name;
                publicwelfare.Describe = result.data.publicwelfares[i].Describe;
                publicwelfare.heart = result.data.publicwelfares[i].heart;
                publicwelfare.OrgName = result.data.publicwelfares[i].OrgName;
                publicwelfare.ImageUrl = result.data.publicwelfares[i].Image;
                publicwelfare.AvatarUrl = result.data.publicwelfares[i].Avatar;
                that.data.publicwelfares.push(publicwelfare);
              }
              that.data.publicwelfare_location.prev = that.data.publicwelfare_location.last;
              that.data.publicwelfare_location.last = that.data.publicwelfare_location.last + result.data.publicwelfares_length;
              that.data.hasRequestFinish = true;
              that.data.publicwelfare_settings.LoadingMorePublicwelfares = false;
              that.data.publicwelfare_settings.NoMorePublicwelfares = false;
            }
            that.setData(that.data);
          }
        }
    }
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
    if (that.data.publicwelfare_settings.LoadingMorePublicwelfares) {
      console.log("未加载完成或额外公益数不足");
    } else {
      that.data.publicwelfare_settings.LoadingMorePublicwelfares = true;
      that.data.publicwelfare_settings.NoMorePublicwelfares = false;
      that.setData(that.data);
      app.sendSocketMessage({ action: 'get-publicwelfares', data: { prev: that.data.publicwelfare_location.prev, last: that.data.publicwelfare_location.last} });
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})