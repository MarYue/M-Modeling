const app = getApp()
const util = require('../../utils/util.js')
const genderMap = { 'f': '女', 'm': '男', 'u': '未公开' }
Page({
  app_: getApp(),

  data: {
    loginSuccess: false,
    userInfoCommunity: null,
    userInfoCommunity_old: null,
    genderMap: genderMap,
    genderKeyRange: Object.keys(genderMap),
    genderRange: Object.values(genderMap)
  },

  updateUserInfo: function () {
    if (app.globalData.loginSuccess) {
      this.setData({
        userInfo: app.globalData.userInfo,
        dispGetUserInfoButton: false,
        loginSuccess: true
      })
    }
  },

  onLoad: function () {
    var that = this
    this.updateUserInfo()
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    util.gett("/user", function(res){
      wx.hideLoading()
      console.log(res)
      if (res && res.succeed) {
        console.log(res.result)
        that.setData({ userInfoCommunity: res.result })
        that.setData({userInfoCommunity_old: res.result})
      } else {
        wx.navigateBack({complete: function(){
          wx.showToast({
            icon: "none",
            title: "调取用户信息错误"
          })
        }})
        
      }
    })
  },

  closeErr: function(event){
    console.log(event)
  },

  nickNameChanged: function(event) {
    this.setData({"userInfoCommunity.nickName": event.detail.value})
  },

  telChanged: function(event) {
    this.setData({"userInfoCommunity.tel": event.detail.value})
  },

  genderChanged: function(event) {
    this.setData({"userInfoCommunity.gender": this.data.genderKeyRange[event.detail.value]})
  },

  locationChanged: function(event) {
    this.setData({"userInfoCommunity.location": event.detail.value})
  },

  formSubmit: function(event){
    var that = this
    wx.showLoading({
      title: '正在提交……',
      mask: true
    })
    util.post("/user", this.data.userInfoCommunity, function(res) {
      if (res && res.succeed == true) {
        wx.navigateBack({complete: function(){
          wx.hideLoading()
          wx.showToast({
            title: "修改成功"
          })
        }})
      } else {
        wx.hideLoading({success: 
          wx.showToast({
            icon: "none",
            title: "服务器返回值无效，修改失败"
          })
        })
      }
    })
  }

})
