const app = getApp()
const util = require('../../utils/util')

Date.prototype.format = function () {
  return `${this.getFullYear()}-${("0" + (this.getMonth() + 1)).slice(-2)}-${this.getDate()}`
}

Page({
  data: {
    dispGetUserInfoButton: false,
    loginSuccess: false,
    activeIndex: 0,
    tabs: [
      "待领养"
    ],
    sliderLeft: "-3em",
    sliderOffset: 0,
    contentList: [

    ],
    page: 0,
    itemPerPage: 15,
    nomore: false,
    loadBottomInProgess: true
  },

  getUserInfoTapped: function (res) {
    if (res.detail.encryptedData != undefined) {
      app.globalData.userInfoRes = res.detail
      app.getSession()
    }
  },

  updateUserInfo: function () {
    if (app.globalData.loginSuccess) {
      this.setData({
        userInfo: app.globalData.userInfo,
        dispGetUserInfoButton: false,
        loginSuccess: true
      })
      this.tabClick({ currentTarget: { id: "0" } })
      this.onPullDownRefresh()
    }
  },

  onLoad: function () {
    this.updateUserInfo()
    
  },

  tabClick: function (e) {
    console.log("tabClicked", e)
    this.setData({ sliderOffset: parseInt(e.currentTarget.id) * 100 / this.data.tabs.length + 50 / this.data.tabs.length, activeIndex: parseInt(e.currentTarget.id) })
  },

  onReachBottom: function (event) {
    var that = this;
    console.log("ReachBottom:", event)
    this.setData({ loadBottomInProgess: true, page: this.data.page + 1 })

    util.gett(`/adoptions?page=${this.data.page}&itemPerPage=${this.data.itemPerPage}`, function (res) {
      if (res && res.result && res.result.adoptions != undefined) {
        console.log(res)
        that.adjustContentList(that.data.contentList.concat(res.result.adoptions))
        if (res.result.adoptions.length == 0) {
          that.setData({nomore: true})
        }
      } else {
        console.log(res)
        wx.showToast({
          title: "服务器返回数据无效",
          icon: "none"
        })
        that.setData({ nomore: true })
      }
      that.setData({ loadBottomInProgess: false })
    })

  },

  onPullDownRefresh: function (event) {
    var that = this
    console.log("onPullDownRefresh", event)
    this.setData({
      page: 0,
      contentList: []
    })
    this.setData({ loadBottomInProgess: true, nomore: false })
    util.gett(`/adoptions?page=${this.data.page}&itemPerPage=${this.data.itemPerPage}`, function (res) {
      if (res && res.result && res.result.adoptions != undefined) {
        console.log(res)
        that.adjustContentList(res.result.adoptions)
        if (res.result.adoptions.length == 0) {
          that.setData({ nomore: true })
        }
      } else {
        console.log(res)
        wx.showToast({
          title: "服务器返回数据无效",
          icon: "none"
        })
        that.setData({ nomore: true })
      }
    })
    that.setData({ loadBottomInProgess: false })
    wx.stopPullDownRefresh()
  },
  
  adjustContentList: function(contentList){
    for (var i in contentList) {
      contentList[i].adoptTime = new Date(contentList[i].adoptTime)
      contentList[i].displayableDate = contentList[i].adoptTime.format()
    }

    this.setData({contentList: contentList})
  },

  searchTapped: function(){
    wx.showModal({
      title: '正在开发',
      showCancel: false,
      content: '该功能正在开发中',
    })
  }

})
