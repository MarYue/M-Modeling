const app = getApp()
const util = require('../../utils/util')

Date.prototype.format = function () {
  return `${this.getFullYear()}-${("0" + (this.getMonth() + 1)).slice(-2)}-${this.getDate()}`
}

Page({
  data: {
    contentList: [

    ],
    page: 0,
    itemPerPage: 15,
    nomore: false,
    loadBottomInProgess: true
  },

  updateUserInfo: function () {
    if (app.globalData.loginSuccess) {
      this.setData({
        userInfo: app.globalData.userInfo,
        dispGetUserInfoButton: false,
        loginSuccess: true
      })
      this.onPullDownRefresh()
    }
  },

  onLoad: function () {
    this.updateUserInfo()

  },

  onReachBottom: function (event) {
    var that = this;
    console.log("ReachBottom:", event)
    this.setData({ loadBottomInProgess: true, page: this.data.page + 1 })

    util.gett(`/infos?page=${this.data.page}&itemPerPage=${this.data.itemPerPage}`, function (res) {
      if (res && res.result && res.result.infos != undefined) {
        that.adjustContentList(that.data.contentList.concat(res.result.infos))
        if (res.result.infos.length == 0) {
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
    util.gett(`/infos?page=${this.data.page}&itemPerPage=${this.data.itemPerPage}`, function (res) {
      if (res && res.result && res.result.infos != undefined) {
        that.adjustContentList(res.result.infos)
        if (res.result.infos.length == 0) {
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

  adjustContentList: function (contentList) {
    for (var i in contentList) {
      contentList[i].preview = contentList[i].text.substr(0,20)
    }

    this.setData({ contentList: contentList })
  },

})
