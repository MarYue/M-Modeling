function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//服务器
var rootDocment = 'https://mp.shunwww.cn/api';

function post(url, data, cb, method='post') {
  console.log(method, rootDocment + url, data)
  var header = {
    'Content-Type': 'application/json',
    'uid': getApp().globalData.sessionInfo ? getApp().globalData.sessionInfo['_id'] : undefined,
    'openId': getApp().globalData.sessionInfo ? getApp().globalData.sessionInfo['openId'] : undefined,
  }
  console.log(header)
  wx.request({
    url: rootDocment + url,
    data: JSON.stringify(data),
    method: method,
    header: header,
    success: function (res) {
      return typeof cb == "function" && cb(res.data)
    },
    fail: function () {
      return typeof cb == "function" && cb(false)
    }
  })
}

function gett(url, cb) {
  return post(url, {}, cb, 'get');
}

// 去前后空格  
function trim(str) {
  return str.replace(/(^\s*)|(\s*$)/g, "");
}

// 提示错误信息  
function isError(msg, that) {
  that.setData({
    showTopTips: true,
    errorMsg: msg
  })
}

// 清空错误信息  
function clearError(that) {
  that.setData({
    showTopTips: false,
    errorMsg: ""
  })
}

function getDateDiff(dateTimeStamp) {
  var minute = 1000 * 60;
  var hour = minute * 60;
  var day = hour * 24;
  var halfamonth = day * 15;
  var month = day * 30;
  var now = new Date().getTime();
  var diffValue = dateTimeStamp - now;
  if (diffValue < 0) { return; }
  var monthC = diffValue / month;
  var weekC = diffValue / (7 * day);
  var dayC = diffValue / day;
  var hourC = diffValue / hour;
  var minC = diffValue / minute;
  var result = '';
  if (monthC >= 1) {
    result = "" + parseInt(monthC) + "月后";
  }
  else if (weekC >= 1) {
    result = "" + parseInt(weekC) + "周后";
  }
  else if (dayC >= 1) {
    result = "" + parseInt(dayC) + "天后";
  }
  else if (hourC >= 1) {
    result = "" + parseInt(hourC) + "小时后";
  }
  else if (minC >= 1) {
    result = "" + parseInt(minC) + "分钟后";
  } else
    result = "刚刚";
  return result;
}

function getDateBiff(dateTimeStamp) {
  var minute = 1000 * 60;
  var hour = minute * 60;
  var day = hour * 24;
  var halfamonth = day * 15;
  var month = day * 30;
  var now = new Date().getTime();
  var diffValue = now - dateTimeStamp;
  if (diffValue < 0) { return; }
  var monthC = diffValue / month;
  var weekC = diffValue / (7 * day);
  var dayC = diffValue / day;
  var hourC = diffValue / hour;
  var minC = diffValue / minute;
  var result = '';
  if (monthC >= 1) {
    result = "" + parseInt(monthC) + "月前";
  }
  else if (weekC >= 1) {
    result = "" + parseInt(weekC) + "周前";
  }
  else if (dayC >= 1) {
    result = "" + parseInt(dayC) + "天前";
  }
  else if (hourC >= 1) {
    result = "" + parseInt(hourC) + "小时前";
  }
  else if (minC >= 1) {
    result = "" + parseInt(minC) + "分钟前";
  } else
    result = "刚刚";
  return result;
}

function escape2Html(str) {
  var arrEntities = { 'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"' };
  return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function (all, t) { return arrEntities[t]; });
}



module.exports = {
  formatTime: formatTime,
  post: post,
  gett: gett,
  trim: trim,
  isError: isError,
  clearError: clearError,
  getDateDiff: getDateDiff,
  escape2Html: escape2Html,
  getDateBiff: getDateBiff
}  