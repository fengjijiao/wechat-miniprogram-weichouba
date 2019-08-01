// pages/notice/notice.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: {
      type: "success"
    },
    hasRequestFinish: false,
    notes: {
      success: {
        tip: "操作成功",
        icon: "success"
      },
      error: {
        tip: "操作失败",
        icon: "warn"
      }
    },
    note: {},
    publicwelfares: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.data.page.type = options.type;
    if (options.type == "success") {
      that.data.note.tip = that.data.notes.success.tip;
      that.data.note.icon = that.data.notes.success.icon;
    } else {
      that.data.note.tip = that.data.notes.error.tip;
      that.data.note.icon = that.data.notes.error.icon;
    }
    that.setData(that.data);
    wx.request({
      url: 'https://' + app.globalData.appSettings.appRequestDomain + '/getPublicWelfares',
      data: {},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log("评论后捐赠返回:", res.data);
        if (res.data.status) {
          that.data.hasRequestFinish = true;
          for (var i = 0; i < res.data.data.publicwelfares.length; i++) {
            let publicwelfare = {};
            publicwelfare.Name = res.data.data.publicwelfares[i].Name;
            publicwelfare.Describe = res.data.data.publicwelfares[i].Describe;
            publicwelfare.heart = res.data.data.publicwelfares[i].heart;
            publicwelfare.OrgName = res.data.data.publicwelfares[i].OrgName;
            publicwelfare.ImageUrl = res.data.data.publicwelfares[i].Image;
            publicwelfare.AvatarUrl = res.data.data.publicwelfares[i].Avatar;
            that.data.publicwelfares.push(publicwelfare);
          }
          that.setData(that.data);
        } else {
          console.log('Occur Eroor!');
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
});