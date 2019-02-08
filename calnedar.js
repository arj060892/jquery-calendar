var calView = "months";
var startOfWeek = moment().startOf('week');
var viewType = "pol";
var weekDaysArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var stopTypesComp = {
  "Home": {
    "Name": "Home",
    "Color": "#99cc66"
  },
  "Work": {
    "Name": "Work",
    "Color": "#339933"
  },
  "Education": {
    "Name": "Education",
    "Color": "#14b5c7"
  },
  "Shopping": {
    "Name": "Shopping",
    "Color": "#7b9eb1"
  },
  "SocialEntertainment": {
    "Name": "Social/Entertainment",
    "Color": "#36c3a7"
  },
  "Recreation": {
    "Name": "Recreation",
    "Color": "#f77d38"
  },
  "Other": {
    "Name": "Other",
    "Color": "#ed667c"
  },
  "Travel": {
    "Name": "Travel",
    "Color": "#ffc90e"
  },
  "Worship": {
    "Name": "Worship",
    "Color": "#e887de"
  },
  "Services": {
    "Name": "Services",
    "Color": "#4b96f3"
  }
};
var latLongCollection = [];
var map;
var tempResp = '';
var refreshCurrent;
var baseUrl = 'https://gps-analytics-poc-function-apps.azurewebsites.net/api/';
var apiMethod = {
  "months": "MonthlyPatternOfLife",
  "weeks": "WeeklyPatternOfLife",
  "activity": "ActivityRoutine"
};
var clients = [{
  "Name": "Ron",
  "Id": "5c2f2be4eef4c72f24500e6e"
},
{
  "Name": "Miranda",
  "Id": "5c2f2cbbeef4c72f24500e6f"
}
];
var iconBase = '/Images/pol_pins/';
var icons = {
  Home: {
    icon: iconBase + 'Icon_POL_home.png'
  },
  Work: {
    icon: iconBase + 'Icon_POL_work.png'
  },
  Education: {
    icon: iconBase + 'Icon_POL_education.png'
  },
  Shopping: {
    icon: iconBase + 'Icon_POL_shopping.png'
  },
  SocialEntertainment: {
    icon: iconBase + 'Icon_POL_social.png'
  },
  Recreation: {
    icon: iconBase + 'Icon_POL_recreation.png'
  },
  Other: {
    icon: iconBase + 'Icon_POL_other.png'
  },
  Travel: {
    icon: iconBase + 'Icon_POL_travel.png'
  },
  Worship: {
    icon: iconBase + 'Icon_POL_worship.png'
  },
  Services: {
    icon: iconBase + 'Icon_POL_services.png'
  }
};
var clientId = '';
var markers = [];
var currentDate = moment();

$(function () {
  initMap();
  bindClients();
  $(".pattern-of-life").show();
  $(".activity-routine").hide();
  bindPolCal();

  if (calView == "weeks") {
    $('#week').attr('disabled', 'true');
    $('#month').removeAttr('disabled');
  } else {
    $('#month').attr('disabled', 'true');
    $('#week').removeAttr('disabled');
  }

  $(".resetBtn").click(function () {
    calView = "months";
     startOfWeek = moment().startOf('week');
    $(".viewToggle").trigger("click");
  });

  $(".pattern-of-life .direction").click(function () {
    var direction = $(this).data("direction");
    if (direction == "left") {
      startOfWeek = startOfWeek.subtract(1, calView);
    } else if (direction == "right") {
      startOfWeek = startOfWeek.add(1, calView);
    }
    bindPolCal();
  });

  $(".activity-routine .direction").click(function () {
    var direction = $(this).data("direction");
    if (direction == "left") {
      currentDate = currentDate.subtract(1, "days");
    } else if (direction == "right") {
      currentDate = currentDate.add(1, "days");
    }
    bindActivityTab(false);
  });

  $(".control-toggler button").click(function () {
    $(this).children().toggleClass("fa-caret-right");
    if ($(".pol-calender").is(':visible')) {
      $('.animate-fixer').width($(".pol-calender").width())
      $(".pol-calender").animate({
        width: 'hide'
      });
    } else {
      $(".pol-calender").animate({
        width: 'show'
      });

    }
  });

  $(".viewToggle").click(function () {
    calView = calView == "weeks" ? "months" : "weeks";
    if (calView == "months") {
      $('#month').attr('disabled', 'true');
      $('#week').removeAttr('disabled');
    } else if (calView == "weeks") {
      $('#week').attr('disabled', 'true');
      $('#month').removeAttr('disabled');
    }
    bindPolCal();
  })

  $(".todayBtn").click(function () {
    if (viewType == 'pol') {
      startOfWeek = moment().startOf('week');
      bindPolCal();
    } else {
      bindActivityTab(true);
    }
  });

  $('#clientSelection').change(function () {
    clientId = $('#clientSelection').val();
    viewType == 'pol' ? bindPolCal() : bindActivityTab(true);
  });

  $('.data-viewer').change(function () {
    var dataView = this.value;
    if (dataView == 'pol') {
      viewType = dataView;
      $(".activity-routine").hide();
      $(".pattern-of-life").show();
      bindPolCal();
    } else if (dataView == 'dar') {
      viewType = dataView;
      $(".activity-routine").css({
        "height": $('.pattern-of-life').height() + "px",
        "overflow": "hidden"
      }).show();

      $(".activity-routine .table-responsive").css({
        "height": ($('.activity-routine').height() - $('.activity-routine>div:first').height()) - 40 + "px",
        "overflow-y": "scroll"
      })

      $(".pattern-of-life").hide();
      bindActivityTab(true);
    }
  });
});

function bindClients() {
  var option = '';
  for (var key in clients) {
    if (clients.hasOwnProperty(key)) {
      option += '<option value="' + clients[key]["Id"] + '">' + clients[key]["Name"] + '</option>';
    }
  };
  $('#clientSelection').append(option);
  clientId = $('#clientSelection').val();
}

function bindActivityTab(isToday) {
  currentDate = isToday ? moment() : currentDate;
  var headerTxt = '<b>' + currentDate.format('dddd') + ', ' + currentDate.format('LL') + '</b>';
  $('.dateDtl').html('').append(headerTxt);
  initActivityApi(currentDate.format('MM/DD/YYYY'));

}

function initActivityApi(date) {
  var activtyReqObj = {
    'Date': date,
    'ClientId': clientId
  };
  var requestUrl = baseUrl + apiMethod.activity;
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": requestUrl,
    "method": "GET",
    "data": activtyReqObj
  };

  $.ajax(settings).done(function (res) {
    if (res) {
      reSetMarkers();
      latLongCollection = [];
      var trString = '';
      for (var key in res.ActivityTimelineDetails) {
        if (!res.ActivityTimelineDetails.hasOwnProperty(key)) {
          break;
        }
        var tdString = '';
        var acPolCat = res.ActivityTimelineDetails[key]["POLCategory"];
        var acAddress = res.ActivityTimelineDetails[key]["PlaceName"] ? res.ActivityTimelineDetails[key]["PlaceName"] : res.ActivityTimelineDetails[key]["Address"];
        var acBeginAddress = res.ActivityTimelineDetails[key]["BeginAddress"];
        var acEndAddress = res.ActivityTimelineDetails[key]["EndAddress"];
        var acStartTime = moment(res.ActivityTimelineDetails[key]["StartTime"]).format("hh:mm A");
        var acEndTime = moment(res.ActivityTimelineDetails[key]["EndTime"]).format("hh:mm A");
        var hrs = res.ActivityTimelineDetails[key]["TotalTime"].split(':')[0] + ' Hrs';
        var min = res.ActivityTimelineDetails[key]["TotalTime"].split(':')[1] + ' Mins';
        var acTotalTime = hrs + ' ' + min;
        var addStr = (acPolCat.toLowerCase() == 'travel') ? '<span><b>Begin Address:</b> ' + acBeginAddress + '</span></br></br><span><b>End Address:</b> ' + acEndAddress + '</span>' : '<span>' + acAddress + '</span>';
        tdString = '<td><div><img src="' + icons[acPolCat].icon + '" alt="' + stopTypesComp[acPolCat].Name + '"/></div></td><td><span><b>Start:</b> ' + acStartTime + '</span></br><span><b>End:</b> ' + acEndTime + '</span></br></br><span>' + acTotalTime + '</span></td><td><b>' + stopTypesComp[acPolCat].Name + '</b></br>' + addStr + '</td><td></td><td></td>';
        trString += '<tr>' + tdString + '</tr>';
        if (res.ActivityTimelineDetails[key]["placeCoordinates"] != null && (res.ActivityTimelineDetails[key]["placeCoordinates"].Coordinates.Longitude != 0 || res.ActivityTimelineDetails[key]["placeCoordinates"].Coordinates.Latitude != 0)) {
          latLongCollection.push({
            position: new google.maps.LatLng(res.ActivityTimelineDetails[key]["placeCoordinates"].Coordinates.Longitude, res.ActivityTimelineDetails[key]["placeCoordinates"].Coordinates.Latitude),
            catName: stopTypesComp[acPolCat].Name,
            type: acPolCat,
            address: acAddress,
            placeName: acAddress,
            startTime: acStartTime,
            endTime: acEndTime,
            colorCode: stopTypesComp[acPolCat].Color,
            isCurrentDate: false
          });
        }
      };
      setMarkers(icons);
      $('.dar').html(trString);
    } else {
      $('.dar').html('No data found')
    }
  });
}

function bindPolCal() {
  $(".t-head,.t-content").html('');
  $(".t-head").append("<th class='bolder'>Stop Category</th>");
  var tBodyElem = "";
  var tHeadElem = "";

  // For creating Vertical Headers/Categories
  for (var key in stopTypesComp) {
    var tbodyTdElem = "";
    for (var j = 0; j < 7; j++) {
      tbodyTdElem += "<td class='" + weekDaysArr[j] + "'><span class='" + key +
        "'></span></td>"
    }
    var tempString = '<div class="col-xs-2 catColorBox"><i class="fa fa-fw fa-lg fa-stop" style="color:' + stopTypesComp[key].Color + '" ></i></div><div class="row catText"><div class="col-xs-10">' + stopTypesComp[key].Name + '</div>';
    tBodyElem += "<tr><th scope='row'>" + tempString + "</th>" + tbodyTdElem + "</tr>";

  }
  $('.t-content').append(tBodyElem);

  // Calender Binding
  var startYear = startOfWeek.year();
  var startMonth = startOfWeek.format('MMM');
  var startMonthNum = (startOfWeek.month() + 1);
  var startDate = startOfWeek.date();
  var startWeekDay = startOfWeek;
  var dayWord;
  var haveCurrentDate = false;
  for (var i = 0; i < 7; i++) {
    var isCurrentDate;
    if (moment().startOf('day').isSame(startWeekDay)) {
      haveCurrentDate = isCurrentDate = true;
    } else { isCurrentDate = false; }
    switch (calView == "months" ? i : startWeekDay.day()) {
      case 0:
        dayWord = "Sun";
        break;
      case 1:
        dayWord = "Mon";
        break;
      case 2:
        dayWord = "Tue";
        break;
      case 3:
        dayWord = "Wed";
        break;
      case 4:
        dayWord = "Thu";
        break;
      case 5:
        dayWord = "Fri";
        break;
      case 6:
        dayWord = "Sat";
        break;
      default:
        console.log("day error");
    }
    if (calView == "weeks") {
      var todayClass = isCurrentDate ? "today" : "";
      tHeadElem += "<th scope='col' class='" + todayClass + "'>" + dayWord + "<br><span class='bolder'>" + startOfWeek.date() + "</span></th>";
      $(".table tr td:nth-child(" + (i + 2) + ")").removeAttr('class').addClass(startOfWeek.format('MM-DD-YYYY')).addClass(todayClass);
    } else if (calView == "months") {
      tHeadElem += "<th scope='col'>" + dayWord + "<br>&nbsp;</th>";
    }
    calView != "months" ? startOfWeek.add(1, 'days') : '';
  }
  $('.t-head').append(tHeadElem);

  var endMonth, endDate, endYear, weekEndDate, weekStartDate;
  if (calView == "weeks") {
    startOfWeek.subtract(1, 'days');
    endMonth = startOfWeek.format('MMM');
    endDate = startOfWeek.date();
    endYear = startOfWeek.year();
    weekEndDate = startOfWeek.format('MM/DD/YYYY');
    startOfWeek.subtract(6, 'days');
    weekStartDate = startOfWeek.format('MM/DD/YYYY');
  }

  var headerTxt = calView == "weeks" ? '<b>' + startDate + ' ' + startMonth + ' ' + startYear + ' - ' + endDate + ' ' +
    endMonth + ' ' + endYear + '</b>' : "<b>" + startMonth + " " + startYear + "</b>";

  $(".monthDtl").html('').append(headerTxt);

  var tempClassCache = $(".pol").attr('class').split(' ').slice(0, 3).join(' ') + " " + startOfWeek.year().toString();
  $(".pol").removeAttr('class').addClass(tempClassCache);

  tempClassCache = $(".pol tbody").attr('class').split(' ').slice(0, 1).join(' ') + " " + (startOfWeek.month() + 1).toString();

  $(".pol tbody").removeAttr('class').addClass(tempClassCache);
  reSetMarkers();
  initPolApi(startMonthNum, startYear, weekStartDate, weekEndDate);
  //if (haveCurrentDate) {
  //  refreshCurrent = setInterval(function () {
  //    initCurrentPolApi();
  //  }, 60000);
  //} else {
  //  clearInterval(refreshCurrent);
  //}
}

function initPolApi(month, year, weekStartDate, weekEndDate) {
  var weekReqObj = {
    'startDate': weekStartDate,
    'endDate': weekEndDate,
    'ClientIdFromRequest': clientId
  };
  var monthReqObj = {
    'MonthNumber': month,
    'Year': year,
    'ClientId': clientId
  };
  var queryParameters = calView == "weeks" ? weekReqObj : monthReqObj;

  var requestUrl = baseUrl + apiMethod[calView];
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": requestUrl,
    "method": "GET",
    "data": queryParameters
  }
  $('.viewControl .grid-loader-icon').show();
  $.ajax(settings).done(function (res) {
    $('.viewControl .grid-loader-icon').hide();
    if (res) {
      latLongCollection = [];
      var responseKey = calView == 'months' ? "Days" : "Dates";
      for (var key in res[responseKey]) {
        var dtTemp = res[responseKey][key];
        mapDatatoCal(dtTemp, month, year);
      }
      setMarkers(icons);
    }
  });
}

function initCurrentPolApi() {
  var startDate = moment().format('MM/DD/YYYY');
  var endDate = moment().add(1, 'days').format('MM/DD/YYYY');
  var weekReqObj = {
    'startDate': startDate,
    'endDate': endDate,
    'ClientIdFromRequest': clientId
  };
  var requestUrl = baseUrl + apiMethod['weeks'];
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": requestUrl,
    "method": "GET",
    "data": weekReqObj
  }
  $('.viewControl .grid-loader-icon').show();
  $.ajax(settings).done(function (res) {
    $('.viewControl .grid-loader-icon').hide();
    if (res && tempResp != JSON.stringify(res)) {
      var filtered = latLongCollection.filter(function (value, index, arr) {
        return value.isCurrentDate == false;
      });
      latLongCollection = filtered;
      var responseKey = calView == 'months' ? "Days" : "Dates";
      for (var key in res[responseKey]) {
        var dtTemp = res[responseKey][key];
        mapDatatoCal(dtTemp, (moment().month() + 1), (moment().year()));
      }
      setMarkers(icons);
      tempResp = JSON.stringify(res);
    }
  });
}

function mapDatatoCal(dtTemp, month, year) {
  var dtDay = dtTemp.Day;
  var dtDate = moment(dtTemp.date).format('MM-DD-YYYY');
  var isCurrentDate = dtDate == moment().format('MM-DD-YYYY');
  var dtPOLCategory;
  var dtTotalCategoryTime;
  for (var innerKey in dtTemp.PolCategories) {
    if (!dtTemp.PolCategories.hasOwnProperty(innerKey)) {
      break;
    }
    var dtInnerTemp = dtTemp.PolCategories[innerKey];
    dtPOLCategory = dtInnerTemp.Category;
    var hrs, mins;
    hrs = dtInnerTemp.CategoryTotalTime.split(':')[0] + 'h';
    mins = dtInnerTemp.CategoryTotalTime.split(':')[1] + 'm';

    dtTotalCategoryTime = hrs + ' ' + mins;
    var dtFilter = calView == 'months' ? dtDay : dtDate
    $("." + year + " ." + month + " ." + dtFilter + " ." + dtPOLCategory + "").text(dtTotalCategoryTime);
    for (var catKey in dtInnerTemp.ActivityRoutineDetails) {
      var dtCatTemp = dtInnerTemp.ActivityRoutineDetails[catKey];
      // Temp fix
      if (dtCatTemp.Coordinates != null && (dtCatTemp.Coordinates.Coordinates.Longitude != 0 || dtCatTemp.Coordinates.Coordinates.Latitude != 0)) {
        latLongCollection.push({
          position: new google.maps.LatLng(dtCatTemp.Coordinates.Coordinates.Longitude, dtCatTemp.Coordinates.Coordinates.Latitude),
          catName: stopTypesComp[dtPOLCategory].Name,
          type: dtPOLCategory,
          address: dtCatTemp.Address,
          placeName: dtCatTemp.PlaceName,
          startTime: moment.utc(dtCatTemp.StartTime).format("DD MMM YYYY hh:mm a"),
          endTime: moment.utc(dtCatTemp.EndTime).format("DD MMM YYYY hh:mm a"),
          colorCode: stopTypesComp[dtPOLCategory].Color,
          isCurrentDate: isCurrentDate
        });
      }

    }
  }
}

// Map operations

function initMap() {
  map = new google.maps.Map(document.getElementById('googleMap'), {
    zoom: 16,
    center: new google.maps.LatLng(34.005813, -84.32682),
    mapTypeId: 'roadmap'
  });
  reSetMarkers();
  setMarkers(icons);
}

function reSetMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}

function setMarkers(icons) {
  var bounds = new google.maps.LatLngBounds();
  var infowindow = new google.maps.InfoWindow();
  var groupedColl = latLongCollection.groupBy('address');
  latLongCollection = [];

  for (var key in groupedColl) {
    if (!groupedColl.hasOwnProperty(key)) {
      break;
    }
    var features = groupedColl[key];
    var featureClass = (features.length > 1) ? "time-range" : ""
    var multipleLatLong = '<div class="' + featureClass + '">';
    features.forEach(function (feature, i) {
      multipleLatLong += '<div style="margin-bottom:5px"><table><tr><td style="padding-bottom: 5px;"><b>Start Time:&nbsp;</b></td><td style="padding-bottom: 5px;">' + feature.startTime + '</td></tr><tr><td><b>End Time: </b></td><td>' + feature.endTime + '</td></tr></table></div><hr>';
      if (i == (features.length - 1)) {
        multipleLatLong += '</div>';
        latLongCollection.push({
          position: feature.position,
          catName: feature.catName,
          type: feature.type,
          address: feature.address,
          placeName: feature.placeName,
          startTimeEndTime: multipleLatLong,
          colorCode: feature.colorCode,
          isCurrentDate: feature.isCurrentDate
        });
      }
    });
  };

  latLongCollection.forEach(function (feature) {
    var marker = new google.maps.Marker({
      position: feature.position,
      icon: icons[feature.type].icon,
      map: map
    });
    markers.push(marker);
    bounds.extend(marker.position);

    google.maps.event.addListener(marker, 'mouseover', (function (mm, tt) {
      return function () {
        var infoContent = '<div class="infowindow"><div style="margin-bottom:5px;font-size:15px;"><b>' + ((feature.placeName != null) ? feature.placeName : feature.address) + '</b></div><div style="margin-bottom:10px;font-size:12px;">( ' + feature.catName + ' )</div>' + feature.startTimeEndTime + '</div>';
        //var infoContent = '<div class="infowindow"><div style="margin-bottom:5px;font-size:15px;color:' + feature.colorCode + '"><b>' + ((feature.placeName != null) ? feature.placeName : feature.address)feature.catName.toUpperCase() + '</b></div><div style="margin-bottom:10px">' + ((feature.placeName != null) ? feature.placeName : feature.address) + '</div>' + feature.startTimeEndTime + '</div>';
        infowindow.setOptions({
          content: infoContent
        });
        infowindow.open(map, mm);
      }
    })(marker, feature.address));

    //google.maps.event.addListener(marker, 'mouseout', function () {
    //  infowindow.close();
    //});
  });
  map.fitBounds(bounds);
}

Array.prototype.groupBy = function (prop) {
  return this.reduce(function (groups, item) {
    const val = item[prop]
    groups[val] = groups[val] || []
    groups[val].push(item)
    return groups
  }, {})
}
