//app.js
var util = require('utils/util.js');
App({

  onLaunch: function () {
    var that = this
    that.globalData.loginSuccess = false
    //小程序初始化先判断用户是否登录    
    wx.checkSession({
      success: function () {
        console.log("WX not expired")
        wx.getStorage({
          key: 'userInfo',
          success: function (res) {
            console.log("WX found userInfo in storage", res.data)
            that.globalData.userInfo = res.data;
            wx.getStorage({
              key: 'sessionInfo',
              success: function (res) {
                var sessionInfo = res.data;
                /* TODO : check if sessionInfo is valid */
                if (!sessionInfo) {
                  console.log("sessionInfo invalid in storage", res.data)
                  that.startLogin()
                } else {
                  console.log("found valid sessionInfo in storage", res.data)
                  that.globalData.sessionInfo = sessionInfo
                  that.setLoginSuccess()
                }
              },
              fail: function () {
                console.log("query sessionInfo failed")
                that.startLogin()
                return;
              }
            })
          },
          fail: function () {
            console.log("query userInfo failed")
            that.startLogin()
            return
          }
        })
      },
      fail: function () {
        //登录态过期
        console.log("checkSession failed")
        that.startLogin() //重新登录
      }
    })

  },

  getPage: function(route){
    return getCurrentPages().find((page)=>page.__route__==route)
  },

  needAuthorization: function (res) {
    var that = this
    console.log("needAuthorization")
    wx.showModal({
      content: "请“允许获取信息并登录”",
      showCancel: false
    })

    var indexPage = that.getPage("pages/adopt/index")
    if (indexPage) {
      console.log("setting dispGetUserInfoButton")
      indexPage.setData({ "dispGetUserInfoButton": true })
    } else {
      console.error("/adopt/index not loaded")
    }
    
  },

  setLoginSuccess: function(){
    console.log("login success")
    this.globalData.loginSuccess = true
    for (var page of getCurrentPages()) {
      page.setData({ "loginSuccess": true })
      page.updateUserInfo()
    }
  },

  getSession: function(){
    /* request to get sessionInfo */
    var that = this
    var sessionInfo;
    util.post("/user/signer", { code: that.globalData.loginRes.code, encryptedData: that.globalData.userInfoRes.encryptedData, iv: that.globalData.userInfoRes.iv}, function(res) {
      console.log("return userinfo", res)
      if (res.succeed == undefined || res.succeed == false) {
        wx.showModal({
          content: '登录失败，服务器出现错误。请稍后授权给该小程序用户信息后重新进入。',
          success: function (res) {
            that.needAuthorization()
          },
          showCancel: false
        })
      } else {
        sessionInfo = res.userData
        if (res.newUser) {
          wx.showModal({
            content: "欢迎您第一次登录，请到“我的”完善信息。",
            showCancel: false,
          })
        }
        that.setUserInfo(that.globalData.userInfoRes.userInfo)
        that.setSessionInfo(sessionInfo)
        that.setLoginSuccess()
      }
    })
  },

  checkUserInfoAuth: function() {
    var that = this
    wx.getSetting({
      success: function (res) {
        console.log("getSetting succ", res)
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function (userInfoRes) {
              console.log("getUserInfo succ", userInfoRes)
              that.globalData.userInfoRes = userInfoRes
              that.getSession()
            },
            fail: function () {
              console.log("getUserInfo fail")
              that.needAuthorization()
            }
          })
        } else {
          console.log("no auth: need auth")
          that.needAuthorization()
        }
      },
      fail: function () {
        that.needAuthorization()
      }
    })
  },

  startLogin: function () {
    var that = this
    wx.login({
      success: function(loginRes) {
        console.log("wxLogin succ", loginRes)
        that.globalData.loginRes = loginRes
        that.checkUserInfoAuth()
      },
      fail: function (err) {
        console.error(err)
        wx.showModal({
          content: "登录错误，请检查网络后重新进入小程序。",
          showCancel: false
        })
      }
    })
    
  },

  loginFail: function () {
    var that = this;
    wx.showModal({
      content: '登录失败，请授权给该小程序用户信息后重新进入。',
      showCancel: false
    });
  },

  setUserInfo: function (data) {
    this.globalData.userInfo = data;
    wx.setStorage({
      key: "userInfo",
      data: data
    })
  },

  setSessionInfo: function (data) {
    this.globalData.sessionInfo = data;
    wx.setStorage({
      key: "sessionInfo",
      data: data
    })
  },
  globalData: {
    userInfo: null,
    sessionInfo: null,
    loginSuccess: false
  },

})