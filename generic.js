//#region common functions
Array.prototype.groupBy = function (prop) {
  return this.reduce(function (groups, item) {
      const val = item[prop];
      groups[val] = groups[val] || [];
      groups[val].push(item);
      return groups;
  }, {});
};

function initApiCalls(reqObj, requestUrl, reqMethod, fnSuccess, fnFailure, optionalParameters) {
  var reqOtions = {
      async: true,
      crossDomain: true,
      url: requestUrl,
      method: reqMethod,
      data: reqObj
  }
  $.ajax(reqOtions).done(function (res) {
      fnSuccess(res, optionalParameters);
  }).fail(function (err) {
      fnFailure(err, optionalParameters);
  });

}

$.fn.extend({
  hasClasses: function (selectors) {
      var self = this;
      for (var i in selectors) {
          if ($(self).hasClass(selectors[i]))
              return true;
      }
      return false;
  }
});
//#endregion
