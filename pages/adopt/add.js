const app = getApp()
const util = require('../../utils/util.js')

var today = new Date()
var future = new Date()
future.setDate(365)

Date.prototype.format = function () {
  return `${this.getFullYear()}-${("0" + (this.getMonth() + 1)).slice(-2)}-${this.getDate()}`
}

Page({
  data: {
    loginSuccess: false,
    userInfo: null,
    isAgree: false,
    startDate: today.format(),
    endDate: future.format(),
    date: today.format(),
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

  onShow: function () {
    this.updateUserInfo()
    wx.showLoading()
    util.gett("/user", function (res) {
      wx.hideLoading()
      if (res && res.succeed) {
        if (!res.result.infoUpdated) {
          wx.navigateBack({
            //url: "../../pages/my/index",
            complete: function () {
              wx.showToast({
                icon: "none",
                title: "请先完善个人联系信息！"
              })
            }
          })
        }
      } else {
        wx.navigateBack({
          //url: "../../pages/my/index",
          complete: function () {
            wx.showToast({
              icon: "none",
              title: "调取用户信息错误"
            })
          }
        })

      }
    })
  },

  agreeChanged: function(event) {
    this.setData({isAgree: !this.data.isAgree})
  },

  dateChanged: function(event){
    this.setData({date: event.detail.value})
  },

  formSubmit: function(event){
    var form = event.detail.value
    if (form.title && form.departure && form.destination && form.date){
      wx.showLoading({
        title: '正在提交',
      })
      util.post("/adoptions", {title: form.title, from: form.departure, to: form.destination, adoptTime: new Date(form.date), supplementary: form.supplementary}, function(res){
        wx.hideLoading()
        console.log(res)
        if (res && res.succeed){
          wx.navigateBack({
            complete: function(){
              wx.showToast({
                title: '提交成功',
              })
            }
          })
        } else {
          wx.showToast({
            icon: "none",
            title: '提交错误！',
          })
        }
      })
    } else {
      wx.showToast({
        icon: "none",
        title: "请填写完整后再试！",
      })
    }
  }

})
