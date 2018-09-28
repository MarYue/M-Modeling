const app = getApp()
const util = require('../../utils/util')

var today = new Date()
var past = new Date()
past.setDate(-365)

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
  data: {
    loginSuccess: false,
    userInfo: null,
    activeIndex: 0,
    tabs: [
      "我要发布", "寻宠信息"
    ],
    sliderLeft: "-3em",
    sliderOffset: 0,

    contentList: [

    ],
    page: 0,
    itemPerPage: 15,
    nomore: false,
    loadBottomInProgess: true,

    lnfTypeRange: ["我丢了宠物", "我捡到了宠物"],
    lnf: { dateInput: today.format(), timeInput: today.formatTime(), lnfType: 0},
    isAgree: false,
    endDate: today.format(),
    startDate: past.format(),
    
    infoUpdated: false,
    formDisabled: false,
  },

  lnfTypeChanged: function(event) {
    this.setData({"lnf.lnfType": event.detail.value})
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
    var that = this
    this.updateUserInfo()
    wx.showLoading()
    util.gett("/user", function (res) {
      wx.hideLoading()
      if (res && res.succeed) {
        if (!res.result.infoUpdated) {
          wx.showModal({
            title: '需要完善信息',
            content: '要发布寻宠信息，请先在“我的”中完善个人联系信息',
            showCancel: false
          })
          that.setData({ infoUpdated: false})
        } else {
          that.setData({ infoUpdated: true })
        }
      } else {
        wx.showToast({
          icon: "none",
          title: "调取用户信息错误",
          complete: function(){
            that.setData({ formDisabled: true})
          }
        })
      }
    })
  },

  dateInputChanged: function (event) {
    this.setData({ dateInput: event.detail.value })
  },

  timeInputChanged: function (event) {
    this.setData({ timeInput: event.detail.value })
  },

  tabClick: function (e) {
    console.log("tabClicked", e)
    this.setData({ sliderOffset: parseInt(e.currentTarget.id) * 100 / this.data.tabs.length + 50 / this.data.tabs.length, activeIndex: parseInt(e.currentTarget.id) })
    if (e.currentTarget.id == "1") {
      this.onPullDownRefresh()
    }
  },

  formSubmit: function (event) {
    var form = event.detail.value
    var that = this
    if (form.title && form.place && form.dateInput && form.timeInput) {
      wx.showLoading({
        title: '正在提交',
      })
      var date = new Date(form.dateInput)
      var splittedTime = form.timeInput.split(":")
      date.setHours(splittedTime[0])
      date.setMinutes(splittedTime[1])

      util.post("/losts", { lnfType: form.lnfType, title: form.title, place: form.place, time: date, supplementary: form.supplementary }, function (res) {
        wx.hideLoading()
        console.log(res)
        if (res && res.succeed) {
          wx.navigateBack({
            complete: function () {
              wx.showToast({
                title: '提交成功',
              })
              that.isAgree = false
              that.tabClick({ currentTarget: { id: "1" } })
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
  },

  onReachBottom: function (event) {
    if (this.data.activeIndex != 1)
      return

    var that = this;
    this.setData({ loadBottomInProgess: true, page: this.data.page + 1 })

    util.gett(`/losts?page=${this.data.page}&itemPerPage=${this.data.itemPerPage}`, function (res) {
      if (res && res.result && res.result.losts != undefined) {
        console.log(res)
        that.adjustContentList(that.data.contentList.concat(res.result.losts))
        if (res.result.losts.length == 0) {
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
    if (this.data.activeIndex != 1)
      return

    var that = this
    this.setData({
      page: 0,
      contentList: []
    })
    this.setData({ loadBottomInProgess: true, nomore: false })
    util.gett(`/losts?page=${this.data.page}&itemPerPage=${this.data.itemPerPage}`, function (res) {
      if (res && res.result && res.result.losts != undefined) {
        console.log(res)
        that.adjustContentList(res.result.losts)
        if (res.result.losts.length == 0) {
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

  agreeChanged: function(){
    this.setData({isAgree: !this.data.isAgree})
  },

  adjustContentList: function (contentList) {
    for (var i in contentList) {
      contentList[i].time = new Date(contentList[i].time)
      contentList[i].displayableTime = contentList[i].time.formatDateTime()
      contentList[i].displayableType = contentList[i].lnfType == 0 ? "丢失": "捡到"
    }

    this.setData({ contentList: contentList })
  }

})
