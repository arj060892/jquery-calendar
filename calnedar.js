var calView = "months";
var startOfWeek = moment().startOf('isoWeek');
var dayWord;
var weekDaysArr = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
var stopTypesComp = {
  "Home": {
    "Name": "Home",
    "Color": "#00b627"
  },
  "Work": {
    "Name": "Work",
    "Color": "#808040"
  },
  "Education": {
    "Name": "Education",
    "Color": "#d9544f"
  },
  "Shopping": {
    "Name": "Shopping",
    "Color": "#92d050"
  },
  "SocialEntertainment": {
    "Name": "Social Entertainment",
    "Color": "#4b8b41"
  },
  "Recreation": {
    "Name": "Recreation",
    "Color": "#d5e9c4"
  },
  "Other": {
    "Name": "Other",
    "Color": "#fee599"
  },
  "Travel": {
    "Name": "Travel",
    "Color": "#c8bfe7"
  },
  "Worship": {
    "Name": "Worship",
    "Color": "#999999"
  },
  "Services": {
    "Name": "Services",
    "Color": "#ff0000"
  }
};
var latLongCollection = [];
var map;
var baseUrl = 'https://amsanlayticsfunction.azurewebsites.net/api/';
var apiMethod = { "months": "MonthlyPatternOfLifeHttpTrigger", "weeks": "WeeklyPatternOfLifeHTTPTrigger", "activity":"ActivityRoutine" };
var clients = [
  { "Name": "Ron", "Id": "5c2f2be4eef4c72f24500e6e" },
  { "Name": "Miranda", "Id": "5c2f2cbbeef4c72f24500e6f" }
];
var iconBase = '/Images/';
var icons = {
  Home: {
    icon: iconBase + 'sb-beacon.png'
  },
  Work: {
    icon: iconBase + 'sb-definedlocation.png'
  },
  Education: {
    icon: iconBase + 'sb-exclusion.png'
  },
  Shopping: {
    icon: iconBase + 'sb-inclusionhome.png'
  },
  SocialEntertainment: {
    icon: iconBase + 'sb-inclusionother.png'
  },
  Recreation: {
    icon: iconBase + 'sb-inclusionwork.png'
  },
  Other: {
    icon: iconBase + 'sb-multiplelocation.png'
  },
  Travel: {
    icon: iconBase + 'sb-ponitofinterest.png'
  },
  Worship: {
    icon: iconBase + 'sb-unidentifiedlocation.png'
  },
  Services: {
    icon: iconBase + 'stop-button.png'
  }
};
var clientId = '';
var markers = [];

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
      startOfWeek = startOfWeek.subtract(1, "days");
    } else if (direction == "right") {
      startOfWeek = startOfWeek.add(1, "days");
    }
    bindActivityTab();
  });

  $(".control-toggler button").click(function () {
    $(this).children().toggleClass("fa-caret-right");
    if ($(".pol-calender").is(':visible')) {
      $('.animate-fixer').width($(".pol-calender").width())
      $(".pol-calender").animate({ width: 'hide' });
    }
    else {
      $(".pol-calender").animate({ width: 'show' });

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
    startOfWeek = moment().startOf('isoWeek');
    bindPolCal();
    bindActivityTab();
  });

  $('#clientSelection').change(function () {
    clientId = $('#clientSelection').val();
    bindPolCal();
    bindActivityTab();
  });

  $('.data-viewer').change(function () {
    var dataView = this.value;
    if (dataView == 'pol') {
      $(".activity-routine").hide();
      $(".pattern-of-life").show();
      bindPolCal();
    } else if (dataView == 'dar') {
      $(".activity-routine").css({
        "height": $('.pattern-of-life').height() + "px",
        "overflow-y":"scroll"
      }).show();
      $(".pattern-of-life").hide();
      bindActivityTab();
    }
  });
});

function bindClients() {
  var option = '';
  for (var key in clients) {
    option += '<option value="' + clients[key]["Id"] + '">' + clients[key]["Name"] + '</option>';
  };
  $('#clientSelection').append(option);
  clientId = $('#clientSelection').val();
}

function bindActivityTab() {
  var headerTxt = '<b>'+startOfWeek.format('dddd') + ', ' + startOfWeek.format('LL')+'</b>';
  $('.dateDtl').html('').append(headerTxt);
  initActivityApi(startOfWeek.format('MM/DD/YYYY'));
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
      var trString = '';
      for (var key in res.ActivityTimelineDetails) {
        var tdString = '';
        var acPolCat = res.ActivityTimelineDetails[key]["POLCategory"];
        var acAddress = res.ActivityTimelineDetails[key]["PlaceName"] ? res.ActivityTimelineDetails[key]["PlaceName"] : res.ActivityTimelineDetails[key]["Address"];
        var acBeginAddress = res.ActivityTimelineDetails[key]["BeginAddress"];
        var acEndAddress = res.ActivityTimelineDetails[key]["EndAddress"];
        var acStartTime = moment(res.ActivityTimelineDetails[key]["StartTime"]).format("hh:mm A");
        var acEndTime = moment(res.ActivityTimelineDetails[key]["EndTime"]).format("hh:mm A");
        var hrs = res.ActivityTimelineDetails[key]["TotalTime"].split(':')[0] + ' hours';
        var min = res.ActivityTimelineDetails[key]["TotalTime"].split(':')[1] + ' minutes';
        var acTotalTime = hrs + ' ' + min;
        var addStr = (acPolCat.toLowerCase() == 'travel') ? '<span><b>Begin Address:</b> ' + acBeginAddress + '</span></br></br><span><b>End Address:</b> ' + acEndAddress + '</span>' : '<span>' + acAddress + '</span>';
        tdString = '<td><img src="' + icons[acPolCat].icon + '" alt="' + acPolCat + '"/></td><td><span><b>Start:</b> ' + acStartTime + '</span></br><span><b>End:</b> ' + acEndTime + '</span></br></br><span>' + acTotalTime + '</span></td><td>' + addStr + '</td><td></td><td></td>';
        trString += '<tr>' + tdString + '</tr>';
      };
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
      tbodyTdElem += "<td class='" + weekDaysArr[j] + "'><span class='" + stopTypesComp[key].Name +
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
  var startWeekDay = calView == "months" ? startOfWeek.startOf('isoWeek') : startOfWeek;
  //var startWeekDay = startOfWeek;
  for (var i = 0; i < 7; i++) {
    var isCurrentDate = moment().startOf('day').isSame(startWeekDay);
    switch (startWeekDay.day()) {
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
    startOfWeek.add(1, 'days');
  }
  $('.t-head').append(tHeadElem);

  startOfWeek.subtract(1, 'days');
  var endMonth = startOfWeek.format('MMM');
  var endDate = startOfWeek.date();
  var endYear = startOfWeek.year();
  var weekEndDate = startOfWeek.format('MM/DD/YYYY');
  startOfWeek.subtract(6, 'days');
  var weekStartDate = startOfWeek.format('MM/DD/YYYY');

  var headerTxt = calView == "weeks" ? '<b>' + startDate + ' ' + startMonth + ' ' + startYear + ' - ' + endDate + ' ' +
    endMonth + ' ' + endYear + '</b>' : "<b>" + startMonth + " " + startYear + "</b>";

  $(".monthDtl").html('').append(headerTxt);

  var tempClassCache = $(".pol").attr('class').split(' ').slice(0, 3).join(' ') + " " + startOfWeek.year().toString();
  $(".pol").removeAttr('class').addClass(tempClassCache);

  tempClassCache = $(".pol tbody").attr('class').split(' ').slice(0, 1).join(' ') + " " + (startOfWeek.month() + 1).toString();

  $(".pol tbody").removeAttr('class').addClass(tempClassCache);
  reSetMarkers();
  initPolApi(startMonthNum, startYear, weekStartDate, weekEndDate);
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

  $.ajax(settings).done(function (res) {
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

function mapDatatoCal(dtTemp, month, year) {
  var dtDay = dtTemp.Day;
  var dtDate = moment(dtTemp.date).format('MM-DD-YYYY');
  var dtPOLCategory;
  var dtTotalCategoryTime;
  for (var innerKey in dtTemp.PolCategories) {
    var dtInnerTemp = dtTemp.PolCategories[innerKey];
    dtPOLCategory = dtInnerTemp.Category;
    var hrs = dtInnerTemp.CategoryTotalTime.split(':')[0] + 'h';
    var min = dtInnerTemp.CategoryTotalTime.split(':')[1] + 'm';
    dtTotalCategoryTime = hrs + ' ' + min;
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
          startTime: moment(dtCatTemp.StartTime).format("DD MMM YYYY hh:mm a"),
          endTime: moment(dtCatTemp.EndTime).format("DD MMM YYYY hh:mm a"),
          colorCode: stopTypesComp[dtPOLCategory].Color
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

  var infoWindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();

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
        var infoContent = '<div style="margin-bottom:5px;font-size:15px;color:' + feature.colorCode + '"><b>' + feature.catName.toUpperCase() + '</b></div><div style="margin-bottom:10px">' + ((feature.placeName != null) ? feature.placeName : feature.address) + '</div>' + '<div style="margin-bottom:5px"><table><tr><td style="padding-bottom: 5px;"><b>Start Time:&nbsp;</b></td><td style="padding-bottom: 5px;">' + feature.startTime + '</td></tr><tr><td><b>End Time: </b></td><td>' + feature.endTime + '</td></tr></table></div>';
        infoWindow.setOptions({
          content: infoContent
        });
        infoWindow.open(map, mm);
      }
    })(marker, feature.address));
  });
  map.fitBounds(bounds);
}


