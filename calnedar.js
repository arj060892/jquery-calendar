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
var data = {
  "_id": "5c4ec3598a881c2888cf7891",
  "ClientId": "5c2f2be4eef4c72f24500e6e",
  "MonthNumber": 1,
  "Year": 2019,
  "Days": [{
    "Day": "Monday",
    "POLCategories": [{
      "POLCategory": "Recreation",
      "TotalCategoryTime": "02:00:00",
      "MonthlyActivityRoutineSubClass": [{
        "Coordinates": {
          "type": "Point",
          "coordinates": [34.097862, -84.32682]
        },
        "Address": "1040 Northshore Dr, Roswell, GA 30076, USA",
        "StartTime": {
          "$date": 1548050400000
        },
        "EndTime": {
          "$date": 1548054000000
        },
        "TotalTime": "01:00:00",
        "PlaceId": null,
        "PlaceName": "Park de CTE"
      }]
    }, {
      "POLCategory": "Education",
      "TotalCategoryTime": "01:00:00",
      "MonthlyActivityRoutineSubClass": [{
        "Coordinates": {
          "type": "Point",
          "coordinates": [34.005769, -84.326865]
        },
        "Address": "1040 Northshore Dr, Roswell, GA 30076, USA",
        "StartTime": {
          "$date": 1548057600000
        },
        "EndTime": {
          "$date": 1548061200000
        },
        "TotalTime": "01:00:00",
        "PlaceId": null,
        "PlaceName": "Park de CTE"
      }]
    }]

  },
  {
    "Day": "Wednesday",
    "POLCategories": [{
      "POLCategory": "Shopping",
      "TotalCategoryTime": "02:00:00",
      "MonthlyActivityRoutineSubClass": [{
        "Coordinates": {
          "type": "Point",
          "coordinates": [34.108459, -84.257359]
        },
        "Address": "1040 Northshore Dr, Roswell, GA 30076, USA",
        "StartTime": {
          "$date": 1548050400000
        },
        "EndTime": {
          "$date": 1548054000000
        },
        "TotalTime": "01:00:00",
        "PlaceId": null,
        "PlaceName": "Park de CTE"
      }]
    }]

  }
  ]
}
var map;
var baseUrl = 'https://amsanlayticsfunction.azurewebsites.net/api/';
var apiMethod = { "Monthly": "MonthlyPatternOfLifeHttpTrigger", "Weekly": "WeeklyPatternOfLifeHTTPTrigger" };
var clientId = { "Ron": "5c2f2be4eef4c72f24500e6e", "Miranda": "" };
var markers = [];

$(function () {
  initMap();

  if (calView == "weeks") {
    $('#week').attr('disabled', 'true');
    $('#month').removeAttr('disabled');
  } else {
    $('#month').attr('disabled', 'true');
    $('#week').removeAttr('disabled');
  }
  bindCal();


  $("#plus,#sub").click(function () {
    var direction = $(this).data("direction");
    if (direction == "left") {
      startOfWeek = startOfWeek.subtract(1, calView);
    } else if (direction == "right") {
      startOfWeek = startOfWeek.add(1, calView);
    }
    bindCal();
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
    bindCal();
  })

  $("#todayBtn").click(function () {
    startOfWeek = moment().startOf('isoWeek');
    bindCal();
  })
});

function bindCal() {
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
  var startDate = startOfWeek.date();
  var startWeekDay = calView == "months" ? startOfWeek.startOf('isoWeek') : startOfWeek;
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
      $(".table tr td:nth-child(" + (i + 2) + ")").removeAttr('class').addClass(startOfWeek.year() + "-" + (startOfWeek.month() +
        1) + "-" + startOfWeek.date() + "").addClass(todayClass);
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
  startOfWeek.subtract(6, 'days');

  var headerTxt = calView == "weeks" ? '<b>' + startDate + ' ' + startMonth + ' ' + startYear + ' - ' + endDate + ' ' +
    endMonth + ' ' + endYear + '</b>' : "<b>" + startMonth + " " + startOfWeek.year() + "</b>";
  $(".monthDtl").html('').append(headerTxt);
  var tempClassCache = $(".pol").attr('class').split(' ').slice(0, 3).join(' ') + " " + startOfWeek.year().toString();
  $(".pol").removeAttr('class').addClass(tempClassCache);
  tempClassCache = $(".pol tbody").attr('class').split(' ').slice(0, 1).join(' ') + " " + (startOfWeek.month() + 1).toString();
  $(".pol tbody").removeAttr('class').addClass(tempClassCache);
  reSetMarkers();
  if (calView == "months") {
    initApi((startOfWeek.month() + 1), startOfWeek.year());
  }
}

function initApi(month, year) {
  var requestUrl = baseUrl + apiMethod.Monthly + '?MonthNumber=' + month + '&Year=' + year + '&ClientId=' + clientId.Ron;
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": requestUrl,
    "method": "GET"
  }

  $.ajax(settings).done(function (response) {
    bindData(response);
  });
}
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
        var infoContent = '<div style="margin-bottom:5px;font-size:15px;color:' + feature.colorCode + '"><b>' + feature.catName.toUpperCase() + '</b></div><div style="margin-bottom:10px">' + ((feature.placeName != null) ? feature.placeName : feature.address) + '</div>' + '<div style="margin-bottom:5px"><b>Start Time</b>: ' + feature.startTime + '<br/><b>End Time</b>: ' + feature.endTime + '</div>';
        infoWindow.setOptions({
          content: infoContent
        });
        infoWindow.open(map, mm);
      }
    })(marker, feature.address));
  });
  map.fitBounds(bounds);
}

function bindData(res) {
  var dtPOLCategory;
  var dtTotalCategoryTime;
  for (var key in res.Days) {
    var dtTemp = res.Days[key];
    dtDay = dtTemp.Day;
    for (var innerKey in dtTemp.PolCategories) {
      var dtInnerTemp = dtTemp.PolCategories[innerKey];
      dtPOLCategory = dtInnerTemp.Category;
      var hrs = dtInnerTemp.CategoryTotalTime.split(':')[0] + 'h';
      var min = dtInnerTemp.CategoryTotalTime.split(':')[1] + 'm';
      dtTotalCategoryTime = hrs + ' ' + min;
      $("." + res.Year + " ." + res.MonthNumber + " ." + dtDay + " ." + dtPOLCategory + "").html(dtTotalCategoryTime);
      for (var catKey in dtInnerTemp.MonthlyActivityRoutineDetails) {
        var dtCatTemp = dtInnerTemp.MonthlyActivityRoutineDetails[catKey];
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
  setMarkers(icons);
}
