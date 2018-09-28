const app = getApp()
const util = require('../../utils/util.js')

Date.prototype.format = function () {
  return `${this.getFullYear()}-${("0" + (this.getMonth() + 1)).slice(-2)}-${this.getDate()}`
}

Date.prototype.formatTime = function () {
  return `${("0" + (this.getHours())).slice(-2)}:${("0" + (this.getMinutes())).slice(-2)}`
}

Date.prototype.formatDateTime = function () {
  return this.format() + " " + this.formatTime()
}


Page({
  app_: getApp(),

  data: {
    loginSuccess: false,
    userInfo: null,

  },

  getUserInfo: function (res) {
    app.getSessionInfoAndContinueLogin(res.detail)
  },

  updateUserInfo: function () {
    if (app.globalData.loginSuccess) {
      this.setData({
        userInfo: app.globalData.userInfo,
        loginSuccess: true
      })
    }
  },

  onLoad: function (options) {
    this.updateUserInfo()
    var that = this
    wx.showLoading()
    if (!options || !options.id) {
      wx.hideLoading()
      wx.navigateBack({
        //url: "../../pages/my/index",
        complete: function () {
          wx.showToast({
            icon: "none",
            title: "没有页面参数"
          })
        }
      })
      return
    }
    util.gett(`/lost/${options.id}`, function (res) {
      wx.hideLoading()
      if (res && res.succeed) {
        that.adjustLost(res.result.lost)
      } else {
        wx.navigateBack({
          //url: "../../pages/my/index",
          complete: function () {
            wx.showToast({
              icon: "none",
              title: "调取信息错误"
            })
          }
        })

      }
    })
  },

  adjustLost: function (lost) {
    lost.time = new Date(lost.time)
    lost.lastUpdated = new Date(lost.lastUpdated)
    lost.displayableType = lost.lnfType == 0 ? "丢失宠物" : "捡到宠物"
    lost.displayableTime = lost.time.formatDateTime()
    lost.displayableLastUpdated = lost.lastUpdated.format()
    this.setData({ lost: lost })
  }
})
