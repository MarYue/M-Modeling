const app = getApp()
const util = require('../../utils/util.js')

var today = new Date()
var future = new Date()
future.setDate(365)

Date.prototype.format = function () {
  return `${this.getFullYear()}-${("0" + (this.getMonth() + 1)).slice(-2)}-${this.getDate()}`
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
    util.gett(`/adoption/${options.id}`, function (res) {
      wx.hideLoading()
      if (res && res.succeed) {
        that.adjustAdoption(res.result.adoption)
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

  adjustAdoption: function (adoption) {
    adoption.adoptTime = new Date(adoption.adoptTime)
    adoption.lastUpdated = new Date(adoption.lastUpdated)
    adoption.displayableAdoptTime = adoption.adoptTime.format()
    adoption.displayableLastUpdated = adoption.lastUpdated.format()
    this.setData({ adoption: adoption })
  }
})
