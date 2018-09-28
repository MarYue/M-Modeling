const app = getApp()
var util = require('../../utils/util.js')

Page({
  data: {
    loginSuccess: false,
    userInfo: null
  },

  updateUserInfo: function () {
    if (app.globalData.loginSuccess) {
      this.setData({
        userInfo: app.globalData.userInfo,
        loginSuccess: true
      })
    }
  },
  
  onShow: function () {
    var that = this
    this.updateUserInfo()
    util.gett("/user", function (res) {
      console.log(res)
      if (res && res.succeed) {
        that.setData({ location: res.result.location })
      } else {
        wx.showToast({
          icon: "none",
          title: "调取用户信息错误"
        })
      }
    })
  },

  findStation: function(event){
    var that = this
    this.data.location = event.detail.value
    wx.showLoading({
      title: '加载中',
    })
    util.post("/station/finder", {location: this.data.location}, function(res){
      wx.hideLoading()
      console.log(res)
      if (res && res.succeed) {
        wx.showModal({
          showCancel: false,
          title: '救助站信息',
          content: `名称：${res.result.station.name}\r\n地区：${res.result.station.location.join("-")}\r\n详细地址：${res.result.station.address}\r\n电话：${res.result.station.tel}`,
        })
      } else {
        wx.showToast({
          icon: "none",
          title: "错误：" + res.msg
        })
      }
    })
  },

  onPullDownRefresh: function(){
    wx.stopPullDownRefresh()
  }

})