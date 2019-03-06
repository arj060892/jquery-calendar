var calView = "weeks";
var timeZoneDiff = "-05:00";
var startOfWeek = moment().utcOffset(timeZoneDiff).startOf("isoWeek");
var viewType = "pol";
var isFirstCall = true;
var startStopPath;
var weekDaysArr = [{
    name: "Monday",
    abbreviation: "Mon"
  },
  {
    name: "Tuesday",
    abbreviation: "Tue"
  },
  {
    name: "Wednesday",
    abbreviation: "Wed"
  },
  {
    name: "Thursday",
    abbreviation: "Thu"
  },
  {
    name: "Friday",
    abbreviation: "Fri"
  },
  {
    name: "Saturday",
    abbreviation: "Sat"
  },
  {
    name: "Sunday",
    abbreviation: "Sun"
  }
];
var stopTypesComp = {
  Home: {
    Name: "Home",
    Color: "#94c63e"
  },
  Work: {
    Name: "Work",
    Color: "#339933"
  },
  Education: {
    Name: "Education",
    Color: "#14b5c7"
  },
  Shopping: {
    Name: "Shopping",
    Color: "#457987"
  },
  SocialEntertainment: {
    Name: "Social/Entertainment",
    Color: "#36c3a7"
  },
  Recreation: {
    Name: "Recreation",
    Color: "#f77d38"
  },
  Other: {
    Name: "Other",
    Color: "#ed667c"
  },
  Travel: {
    Name: "Travel",
    Color: "#ffb217"
  },
  Worship: {
    Name: "Worship",
    Color: "#e887de"
  },
  Services: {
    Name: "Services",
    Color: "#4b96f3"
  }
};
var latLongCollection = [];
var map;
var tempResp = "";
var refreshCurrent = 0;
// var baseUrl = 'https://gps-analytics-poc-function-apps.azurewebsites.net/api/'; //Prod
// var apiMethod = {
//     'months': 'MonthlyPatternOfLife',
//     'weeks': 'WeeklyPatternOfLife',
//     'activity': 'ActivityRoutine'
// };
// var clients = [{
//         'Name': 'Ron',
//         'Id': '5c66d8ca4a092a00007d423d'
//     },
//     {
//         'Name': 'Miranda',
//         'Id': '5c66d8fa4a092a00007d423f'
//     }
// ];

var baseUrl = "https://amsanlayticsfunction.azurewebsites.net/api/"; //Dev
var apiMethod = {
  months: "MonthlyPatternOfLifeHttpTrigger",
  weeks: "WeeklyPatternOfLifeHTTPTrigger",
  activity: "ActivityRoutine"
};
var clients = [{
    Name: "Ron",
    Id: "5c66d8ca4a092a00007d423d"
  },
  {
    Name: "Miranda",
    Id: "5c66d8fa4a092a00007d423f"
  }
];

var iconBase = "/Images/pol_pins/";
var icons = {
  Home: {
    icon: iconBase + "Icon_POL_home.png"
  },
  Work: {
    icon: iconBase + "Icon_POL_work.png"
  },
  Education: {
    icon: iconBase + "Icon_POL_education.png"
  },
  Shopping: {
    icon: iconBase + "Icon_POL_shopping.png"
  },
  SocialEntertainment: {
    icon: iconBase + "Icon_POL_social.png"
  },
  Recreation: {
    icon: iconBase + "Icon_POL_recreation.png"
  },
  Other: {
    icon: iconBase + "Icon_POL_other.png"
  },
  Travel: {
    icon: iconBase + "Icon_POL_travel.png"
  },
  Worship: {
    icon: iconBase + "Icon_POL_worship.png"
  },
  Services: {
    icon: iconBase + "Icon_POL_services.png"
  },
  Failure: {
    icon: iconBase + "Icon_POL_failure.png"
  }
};
var clientId = "";
var markers = [];
var currentDate = moment().utcOffset(timeZoneDiff);

$(function () {
  initMap();
  bindClients();
  $(".pattern-of-life").show();
  $(".activity-routine").hide();
  bindPolCal();

  if (calView == "weeks") {
    $("#week").attr("disabled", "true");
    $("#month").removeAttr("disabled");
  } else {
    $("#month").attr("disabled", "true");
    $("#week").removeAttr("disabled");
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
      currentDate = currentDate.subtract(1, "days");
    } else if (direction == "right") {
      currentDate = currentDate.add(1, "days");
    }
    bindActivityTab();
  });

  $(".control-toggler button").click(function () {
    $(this)
      .children()
      .toggleClass("fa-caret-right");
    if ($(".pol-calender").is(":visible")) {
      $(".animate-fixer").width($(".pol-calender").width());
      $(".pol-calender").animate({
        width: "hide"
      });
    } else {
      $(".pol-calender").animate({
        width: "show"
      });
    }
  });

  $(".viewToggle").click(function () {
    calView = calView == "weeks" ? "months" : "weeks";
    if (calView == "months") {
      clearInterval(refreshCurrent);
      refreshCurrent = 0;
      $("#month").attr("disabled", "true");
      $("#week").removeAttr("disabled");
    } else if (calView == "weeks") {
      $("#week").attr("disabled", "true");
      $("#month").removeAttr("disabled");
    }
    startOfWeek = moment()
      .utcOffset(timeZoneDiff)
      .startOf("isoWeek");
    bindPolCal();
  });

  $(".todayBtn").click(function () {
    if (viewType == "pol") {
      calView = "weeks";
      startOfWeek = moment().utcOffset(timeZoneDiff).startOf("isoWeek");
      bindPolCal();
    } else {
      currentDate = moment().utcOffset(timeZoneDiff);
      bindActivityTab();
    }
  });

  $("#clientSelection").change(function () {
    clientId = $("#clientSelection").val();
    clearInterval(refreshCurrent);
    refreshCurrent = 0;
    viewType == "pol" ? bindPolCal() : bindActivityTab();
  });

  $(".data-viewer").change(function () {
    clearInterval(refreshCurrent);
    refreshCurrent = 0;
    var dataView = this.value;
    isFirstCall = true;
    startOfWeek = moment().utcOffset(timeZoneDiff).startOf("isoWeek");
    currentDate = moment().utcOffset(timeZoneDiff);
    if (dataView == "pol") {
      viewType = dataView;
      $(".activity-routine").hide();
      $(".pattern-of-life").show();
      bindPolCal();
    } else if (dataView == "dar") {
      viewType = dataView;
      $(".activity-routine").css({
          height: $(".pattern-of-life").height() + "px",
          overflow: "hidden"
        })
        .show();

      $(".activity-routine .table-responsive").css({
        height: $(".activity-routine").height() - $(".activity-routine>div:first").height() - 40 + "px",
        "overflow-y": "scroll"
      });
      $(".pattern-of-life").hide();
      bindActivityTab();
    }
  });
});

function bindClients() {
  var option = "";
  for (var key in clients) {
    if (clients.hasOwnProperty(key)) {
      option += '<option value="' + clients[key]["Id"] + '">' + clients[key]["Name"] + "</option>";
    }
  }
  $("#clientSelection").append(option);
  clientId = $("#clientSelection").val();
}

function bindActivityTab() {
  map.getStreetView().setVisible(false);
  var headerTxt = "<b>" + currentDate.format("dddd") + ", " + currentDate.format("LL") + "</b>";
  $(".dateDtl").html("").append(headerTxt);
  $(".dar").css("text-align", "center").html('<span class="grid-loader-icon"></span>');
  resetMarkers();
  initActivityApi(currentDate.format("MM/DD/YYYY"));
}

function initActivityApi(date) {
  var activtyReqObj = {
    Date: date,
    ClientId: clientId
  };
  var requestUrl = baseUrl + apiMethod.activity;
  var settings = {
    async: true,
    crossDomain: true,
    url: requestUrl,
    method: "GET",
    data: activtyReqObj
  };

  $.ajax(settings)
    .done(function (res) {
      if (res) {
        resetMarkers();
        latLongCollection = [];
        var trString = "";
        for (var key in res.ActivityTimelineDetails) {
          if (!res.ActivityTimelineDetails.hasOwnProperty(key)) {
            break;
          }
          var tdString = "";
          var acLatitude = res.ActivityTimelineDetails[key]["PlaceCoordinates"] ? res.ActivityTimelineDetails[key]["PlaceCoordinates"].Coordinates.Latitude : 0;
          var acLongitude = res.ActivityTimelineDetails[key]["PlaceCoordinates"] ? res.ActivityTimelineDetails[key]["PlaceCoordinates"].Coordinates.Longitude : 0;
          //TODO : temp fix
          res.ActivityTimelineDetails[key]["POLCategory"] = (acLatitude == 0 && acLongitude == 0 && res.ActivityTimelineDetails[key]["POLCategory"] != "Travel") ? "Failure" : res.ActivityTimelineDetails[key]["POLCategory"];
          var acPolCat = res.ActivityTimelineDetails[key]["POLCategory"];
          var acAddress = res.ActivityTimelineDetails[key]["Address"];
          var acPlaceName = res.ActivityTimelineDetails[key]["PlaceName"];
          var acBeginAddress,
            acEndAddress,
            acBeginPlace,
            acEndPlace,
            acFullBeginAddress,
            acFullEndAddress,
            acBeginLat,
            acBeginLng,
            acEndLat,
            acEndLng;
          // Travel Category Dtls
          var acTravelPointDtls = res.ActivityTimelineDetails[key]["TravelPointLocationInformation"];
          if (acTravelPointDtls) {
            acBeginAddress = acTravelPointDtls["BeginAddress"];
            acBeginPlace = acTravelPointDtls["BeginPlaceName"];
            acEndAddress = acTravelPointDtls["EndAddress"];
            acEndPlace = acTravelPointDtls["EndPlaceName"];
            acFullBeginAddress = acBeginPlace ? "<b>" + acBeginPlace + '</b><div style="font-size: 12px;color: grey;">' + acBeginAddress + "</div>" : "<b>" + acBeginAddress + "</b>";
            acFullEndAddress = acEndPlace ? "<b>" + acEndPlace + '</b><div style="font-size: 12px;color: grey;">' + acEndAddress + "</div>" : "<b>" + acEndAddress + "</b>";
            acBeginLat = acTravelPointDtls["BeginCoordinates"]["Coordinates"]["Latitude"];
            acBeginLng = acTravelPointDtls["BeginCoordinates"]["Coordinates"]["Longitude"];
            acEndLat = acTravelPointDtls["EndCoordinates"]["Coordinates"]["Latitude"];
            acEndLng = acTravelPointDtls["EndCoordinates"]["Coordinates"]["Longitude"];
            //TODO: temp fix from UI
            if (acEndLat == "0" || acEndLng == "0") {
              for (var index = parseInt(key) + 1; index < res.ActivityTimelineDetails.length; index++) {
                if (res.ActivityTimelineDetails[index]["PlaceCoordinates"]) {
                  acEndLat = res.ActivityTimelineDetails[index]["PlaceCoordinates"].Coordinates.Latitude;
                  acEndLng = res.ActivityTimelineDetails[index]["PlaceCoordinates"].Coordinates.Longitude;
                  break;
                }
              }
            }
          }
          var acStartTime = moment(res.ActivityTimelineDetails[key]["StartTime"]).format("hh:mm A");
          var acEndTime = moment(res.ActivityTimelineDetails[key]["EndTime"]).format("hh:mm A");
          var hrs = res.ActivityTimelineDetails[key]["TotalTime"].split(":")[0] + "h";
          var min = res.ActivityTimelineDetails[key]["TotalTime"].split(":")[1] + "m";
          //TODO : temp fix
          if (min == "01m" || acPolCat.toLowerCase() == "failure") {
            continue;
          }
          var acTotalTime = hrs + " " + min;
          var onImgClickEvnt = acPolCat.toLowerCase() == "travel" ? "markRoute(" + acBeginLat + "," + acBeginLng + "," + acEndLat + "," + acEndLng + ");" : "setMapCenter(" + acLatitude + ", " + acLongitude + ");";
          var addStr = acPolCat.toLowerCase() == "travel" ? "<span><b>Begin Address:</b> " + acFullBeginAddress + "</span></br><span><b>End Address:</b> " + acFullEndAddress + "</span>" : "<span>" + (acPlaceName ? "<b><div>" + acPlaceName + '</div></b><div style="font-size:12px;color: grey;" class="stop-address">' + acAddress + "</div>" : "<b><div>" + acAddress + "</div></b>") + "</span>";
          tdString += '<div class="col-md-1"><div><img src="' + icons[acPolCat].icon + '" alt="' + stopTypesComp[acPolCat].Name + '" onClick="' + onImgClickEvnt + '" /></div></div>';
          tdString += '<div class="col-md-4"><span>' + acStartTime + " - " + acEndTime + '</span><br><span style="font-size:12px;color:grey;">' + acTotalTime + "</span></div>";
          tdString += '<div class="col-md-5">' + addStr + "</div>";
          tdString += '<div class="col-md-1"></div>';
          var menuOptions = "";
          menuOptions += '<span class="dropdown-item">Show Points</span>';
          if (acPolCat.toLowerCase() == "travel") {
            menuOptions += '<span class="dropdown-item">Indicate Travel Mode</span>';
            menuOptions += '<span class="dropdown-item"> Snap to Road</span>';
          } else {
            menuOptions += '<span class="dropdown-item">Create Exclusion Zone</span>';
            menuOptions += '<span class="dropdown-item">Create Inclusion Zone</span>';
            menuOptions += '<span class="dropdown-item">Rename this Location </span>';
            menuOptions += '<span class="dropdown-item">Change Category</span>';
            menuOptions += '<span class="dropdown-item">Place Details</span>';
          }
          tdString += '<div class="col-md-1"><div class="dropdown"><span></span><div class="dropdown-content">' + menuOptions + "</div></div></div>";
          var travelGroup = acPolCat.toLowerCase() == "travel" ? "travelGroup" : "";
          trString += '<div class="row ' + travelGroup + " " + (acLatitude.toString().replace(".", "") + acLongitude.toString().replace(".", "")) + '" >' + tdString + "</div>";
          if (res.ActivityTimelineDetails[key]["PlaceCoordinates"] != null && (res.ActivityTimelineDetails[key]["PlaceCoordinates"].Coordinates.Longitude != 0 || res.ActivityTimelineDetails[key]["PlaceCoordinates"].Coordinates.Latitude != 0)) {
            latLongCollection.push({
              position: new google.maps.LatLng(
                res.ActivityTimelineDetails[key]["PlaceCoordinates"].Coordinates.Latitude,
                res.ActivityTimelineDetails[key]["PlaceCoordinates"].Coordinates.Longitude
              ),
              catName: stopTypesComp[acPolCat].Name,
              type: acPolCat,
              address: acAddress,
              placeName: acPlaceName,
              startTime: moment.utc(res.ActivityTimelineDetails[key]["StartTime"]).format("DD MMM YYYY hh:mm a"),
              endTime: moment.utc(res.ActivityTimelineDetails[key]["EndTime"]).format("DD MMM YYYY hh:mm a"),
              colorCode: stopTypesComp[acPolCat].Color,
              isCurrentDate: false,
              duration: acTotalTime,
              lat: res.ActivityTimelineDetails[key]["PlaceCoordinates"].Coordinates.Latitude,
              lng: res.ActivityTimelineDetails[key]["PlaceCoordinates"].Coordinates.Longitude
            });
          }
        }
        $(".dar").html(trString);
        setMarkers(icons, true);
      } else {
        $(".dar").html("No data found");
      }
    })
    .fail(function (err) {
      $(".dar").html("No data found");
      console.log(err);
    });
}

function bindPolCal() {
  map.getStreetView().setVisible(false);
  $(".t-head,.t-content").html("");
  $(".t-head").append('<th class="bolder">Stop Category</th>');
  var tBodyElem = "";
  var tHeadElem = "";

  // For creating Vertical Headers/Categories
  for (var key in stopTypesComp) {
    var tbodyTdElem = "";
    for (var j = 0; j < 7; j++) {
      tbodyTdElem += '<td class="' + weekDaysArr[j].name + '"><span class="' + key + '"></span></td>';
    }
    var tempString = '<div class="col-xs-2 catColorBox"><i class="fa fa-fw fa-lg fa-stop" style="color:' + stopTypesComp[key].Color + '" ></i></div><div class="row catText"><div class="col-xs-10">' + stopTypesComp[key].Name + "</div>";
    tBodyElem += '<tr><th scope="row">' + tempString + "</th>" + tbodyTdElem + "</tr>";
  }
  $(".t-content").append(tBodyElem);

  // Calender Binding
  var startYear = startOfWeek.year();
  var startMonth = startOfWeek.format("MMM");
  var startMonthNum = startOfWeek.month() + 1;
  var startDate = startOfWeek.date();
  var dayWord;
  var haveCurrentDate = false;
  for (var i = 0; i < 7; i++) {
    var isCurrentDate;
    if (calView == "weeks") {
      if (moment(moment().utcOffset(timeZoneDiff).format("MM/DD/YYYY")).isSame(startOfWeek.format("MM/DD/YYYY"))) {
        haveCurrentDate = isCurrentDate = true;
      } else {
        isCurrentDate = false;
      }
      dayWord = weekDaysArr[startOfWeek.day() == 0 ? 6 : startOfWeek.day() - 1]["abbreviation"];
      var todayClass = isCurrentDate ? "today" : "";
      tHeadElem += '<th scope="col" class="' + todayClass + '">' + dayWord + '<br><span class="bolder">' + startOfWeek.date() + "</span></th>";
      $(".table tr td:nth-child(" + (i + 2) + ")").removeAttr("class").addClass(startOfWeek.format("MM-DD-YYYY")).addClass(todayClass);
    } else if (calView == "months") {
      dayWord = weekDaysArr[i]["abbreviation"];
      tHeadElem += '<th scope="col">' + dayWord + "<br> </th>";
    }
    calView != "months" ? startOfWeek.add(1, "days") : "";
  }
  $(".t-head").append(tHeadElem);

  var endMonth, endDate, endYear, weekEndDate, weekStartDate;
  if (calView == "weeks") {
    startOfWeek.subtract(1, "days");
    endMonth = startOfWeek.format("MMM");
    endDate = startOfWeek.date();
    endYear = startOfWeek.year();
    weekEndDate = startOfWeek.format("MM/DD/YYYY");
    startOfWeek.subtract(6, "days");
    weekStartDate = startOfWeek.format("MM/DD/YYYY");
  }

  var headerTxt = calView == "weeks" ? "<b>" + startDate + " " + startMonth + " " + startYear + " - " + endDate + " " + endMonth + " " + endYear + "</b>" : "<b>" + startMonth + " " + startYear + "</b>";
  $(".monthDtl").html("").append(headerTxt);
  var tempClassCache = $(".pol").attr("class").split(" ").slice(0, 3).join(" ") + " " + startOfWeek.year().toString();
  $(".pol").removeAttr("class").addClass(tempClassCache);
  tempClassCache = $(".pol tbody").attr("class").split(" ").slice(0, 1).join(" ") + " " + (startOfWeek.month() + 1).toString();
  $(".pol tbody").removeAttr("class").addClass(tempClassCache);

  resetMarkers();
  initPolApi(startMonthNum, startYear, weekStartDate, weekEndDate);
  if (haveCurrentDate) {
    if (refreshCurrent > 0) {
      clearInterval(refreshCurrent);
      refreshCurrent = 0;
    }
    refreshCurrent = setInterval(function () {
      initCurrentPolApi();
    }, 60000);
  } else {
    clearInterval(refreshCurrent);
    refreshCurrent = 0;
  }
}

function initPolApi(month, year, weekStartDate, weekEndDate) {
  var weekReqObj = {
    startDate: weekStartDate,
    endDate: weekEndDate,
    clientId: clientId
  };
  var monthReqObj = {
    MonthNumber: month,
    Year: year,
    ClientId: clientId
  };
  var queryParameters = calView == "weeks" ? weekReqObj : monthReqObj;
  var requestUrl = baseUrl + apiMethod[calView];
  var settings = {
    async: true,
    crossDomain: true,
    url: requestUrl,
    method: "GET",
    data: queryParameters
  };
  $(".viewControl .grid-loader-icon").show();
  $.ajax(settings)
    .done(function (res) {
      if (res) {
        latLongCollection = [];
        var responseKey = calView == "months" ? "Days" : "Dates";
        for (var key in res[responseKey]) {
          var dtTemp = res[responseKey][key];
          mapDatatoCal(dtTemp, month, year);
        }
        setMarkers(icons, true);
        if (isFirstCall) {
          isFirstCall = false;
        }
      }
    })
    .fail(function (err) {
      console.log(err);
    })
    .always(function () {
      $(".viewControl .grid-loader-icon").hide();
    });
}

function initCurrentPolApi() {
  var startDate = moment().utcOffset(timeZoneDiff).format("MM/DD/YYYY");
  var endDate = moment().utcOffset(timeZoneDiff).add(1, "days").format("MM/DD/YYYY");
  var weekReqObj = {
    startDate: startDate,
    endDate: endDate,
    clientId: clientId
  };
  var requestUrl = baseUrl + apiMethod["weeks"];
  var settings = {
    async: true,
    crossDomain: true,
    url: requestUrl,
    method: "GET",
    data: weekReqObj
  };
  $(".viewControl .grid-loader-icon").show();
  $.ajax(settings)
    .done(function (res) {
      if (res && tempResp != JSON.stringify(res)) {
        var filtered = latLongCollection.filter(function (value, index, arr) {
          return value.isCurrentDate == false;
        });
        latLongCollection = filtered;
        var responseKey = calView == "months" ? "Days" : "Dates";
        for (var key in res[responseKey]) {
          var dtTemp = res[responseKey][key];
          mapDatatoCal(dtTemp, moment().utcOffset(timeZoneDiff).month() + 1, moment().utcOffset(timeZoneDiff).year());
        }
        resetMarkers();
        setMarkers(icons, false);
        tempResp = JSON.stringify(res);
      }
    })
    .fail(function (err) {
      console.log(err);
    })
    .always(function () {
      $(".viewControl .grid-loader-icon").hide();
    });
}

function mapDatatoCal(dtTemp, month, year) {
  var dtDay = dtTemp.Day;
  var dtDate = moment(dtTemp.Date).format("MM-DD-YYYY");
  var isCurrentDate = dtDate == moment().utcOffset(timeZoneDiff).format("MM-DD-YYYY");
  var dtPOLCategory, dtTotalCategoryTime;
  for (var innerKey in dtTemp.PolCategories) {
    if (!dtTemp.PolCategories.hasOwnProperty(innerKey)) {
      break;
    }
    var dtInnerTemp = dtTemp.PolCategories[innerKey];
    dtPOLCategory = dtInnerTemp.Category;
    var hrs, mins;
    hrs = dtInnerTemp.CategoryTotalTime.split(":")[0] + "h";
    mins = dtInnerTemp.CategoryTotalTime.split(":")[1] + "m";
    if (mins == '0m' || mins == '01m') {
      return;
    }
    dtTotalCategoryTime = hrs + " " + mins;
    var dtFilter = calView == "months" ? dtDay : dtDate;
    $("." + year + " ." + month + " ." + dtFilter + " ." + dtPOLCategory + "").text(dtTotalCategoryTime);
    for (var catKey in dtInnerTemp.ActivityRoutineDetails) {
      var dtCatTemp = dtInnerTemp.ActivityRoutineDetails[catKey];
      // Temp fix
      if (dtCatTemp.Coordinates != null && (dtCatTemp.Coordinates.Coordinates.Longitude != 0 || dtCatTemp.Coordinates.Coordinates.Latitude != 0)) {
        var pointDuration = dtCatTemp.TotalTime.split(":")[0] + "h" + " " + dtCatTemp.TotalTime.split(":")[1] + "m";
        latLongCollection.push({
          position: new google.maps.LatLng(
            dtCatTemp.Coordinates.Coordinates.Latitude,
            dtCatTemp.Coordinates.Coordinates.Longitude
          ),
          catName: stopTypesComp[dtPOLCategory].Name,
          type: dtPOLCategory,
          address: dtCatTemp.Address,
          placeName: dtCatTemp.PlaceName,
          startTime: moment.utc(dtCatTemp.StartTime).format("DD MMM YYYY hh:mm a"),
          endTime: moment.utc(dtCatTemp.EndTime).format("DD MMM YYYY hh:mm a"),
          colorCode: stopTypesComp[dtPOLCategory].Color,
          duration: pointDuration,
          isCurrentDate: isCurrentDate,
          lat: dtCatTemp.Coordinates.Coordinates.Latitude,
          lng: dtCatTemp.Coordinates.Coordinates.Longitude
        });
      }
    }
  }
}

// Map operations
function setStreetView(lat, lng) {
  var streetViewService = new google.maps.StreetViewService();
  var STREETVIEW_MAX_DISTANCE = 75;
  var latLng = new google.maps.LatLng(lat, lng);
  streetViewService.getPanoramaByLocation(
    latLng,
    STREETVIEW_MAX_DISTANCE,
    function (streetViewPanoramaData, status) {
      if (status === google.maps.StreetViewStatus.OK) {
        var streetPoint = {
          lat: lat,
          lng: lng
        };
        var panorama = new google.maps.StreetViewPanorama(
          document.getElementById("googleMap"), {
            position: streetPoint,
            navigationControl: true,
            enableCloseButton: true,
            navigationControlOptions: {
              style: google.maps.NavigationControlStyle.ANDROID
            },
            addressControl: false,
            linksControl: true,
            pov: {
              heading: 34,
              pitch: 10
            }
          }
        );
        map.setStreetView(panorama);
      } else {
        console.log(
          "no street view available in this range, or some error occurred"
        );
      }
    }
  );
}

function initMap() {
  map = new google.maps.Map(document.getElementById("googleMap"), {
    zoom: 16,
    center: new google.maps.LatLng(34.005813, -84.32682),
    mapTypeId: "roadmap",
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.TOP_RIGHT
    },
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM
    },
    scaleControl: true,
    streetViewControl: true,
    streetViewControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM
    },
    fullscreenControl: true
  });
  resetMarkers();
  setMarkers(icons, true);
}

function resetMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
  if (startStopPath) {
    startStopPath.setMap(null);
  }
}

function setMarkers(icons, alignMap) {
  var bounds = new google.maps.LatLngBounds();
  var infowindow = new google.maps.InfoWindow();
  var groupedColl = latLongCollection.groupBy("address");
  var pointerCollection = [];

  for (var key in groupedColl) {
    if (!groupedColl.hasOwnProperty(key)) {
      break;
    }
    var features = groupedColl[key];
    var featureClass = features.length > 1 ? "time-range" : "";
    var multipleLatLong = '<div style="font-size:12px; margin-top:11px" class="' + featureClass + '"><table>';
    features.forEach(function (feature, i) {
      multipleLatLong += '<tr><td style="padding-bottom: 5px;"><b>Start Time: </b></td><td style="padding-bottom: 5px;">' + feature.startTime + "</td></tr>" + '<tr><td style="padding-bottom: 5px;"><b>End Time: </b></td><td style="padding-bottom: 5px;">' + feature.endTime + "</td></tr>" + '<tr><td style="padding-bottom: 10px;"><b>Duration: </b></td><td style="padding-bottom: 10px;">' + feature.duration + "</td></tr>";
      if (i == features.length - 1) {
        multipleLatLong += "</table></div>";
        pointerCollection.push({
          position: feature.position,
          catName: feature.catName,
          type: feature.type,
          address: feature.address,
          placeName: feature.placeName,
          startTimeEndTime: multipleLatLong,
          colorCode: feature.colorCode,
          isCurrentDate: feature.isCurrentDate,
          lat: feature.lat,
          lng: feature.lng
        });
      }
    });
  }
  var markerIndex = 0;
  pointerCollection.forEach(function (feature) {
    var marker = new google.maps.Marker({
      position: feature.position,
      icon: icons[feature.type].icon,
      map: map
    });
    markers.push(marker);

    if (alignMap && isFirstCall) {
      bounds.extend(marker.position);
    }

    google.maps.event.addListener(marker, "mouseover", (function (mm, tt) {
      return function () {
        var infoContent = '<div class="infowindow"><div style="margin-bottom:4px;font-size:15px;"><a href="javascript:void(0)" onclick="setStreetView(' + feature.lat + "," + feature.lng + ')"><b>' + (feature.placeName != null ? feature.placeName : feature.address) + '</b></a></div><div style="margin-bottom:4px;font-size:12px;">( ' + feature.catName + " )</div>" + (feature.placeName != null ? '<div style="margin-bottom:5px;font-size:12px;color:grey">' + feature.address + "</div>" : "") + "" + feature.startTimeEndTime + "</div>";
        infowindow.setOptions({
          content: infoContent
        });
        infowindow.open(map, mm);
      };
    })(marker, feature.address));

    marker.addListener("click", function () {
      $(".dar .row.rowHighlight").removeClass("rowHighlight");
      $('.stop-address:contains("' + feature.address + '")').parent().parent().parent('.row').each(function (i, obj) {
        $(obj).addClass("rowHighlight");
      });
    });

    $('.stop-address:contains("' + feature.address + '")')
      .closest("div").parent().parent().siblings("div").find("img").each(function (i, obj) {
        $(obj).attr("onclick", "setMapCenter(" + feature.lat + "," + feature.lng + "," + markerIndex + ")");
      });
    markerIndex++;
  });

  if (alignMap && isFirstCall) {
    map.fitBounds(bounds);
  }
}

function setMapCenter(latitude, longitude, markerIndex) {
  $(".dar .row.rowHighlight").removeClass("rowHighlight");
  if (startStopPath) {
    startStopPath.setMap(null);
  }
  if (latitude != 0 && longitude != 0) {
    map.setCenter({
      lat: latitude,
      lng: longitude
    });
  }
  triggerMarker(markerIndex);
}

function triggerMarker(index) {
  google.maps.event.trigger(markers[index], "mouseover");
}

function markRoute(startLat, startLng, stopLat, stopLng) {
  if (startStopPath) {
    startStopPath.setMap(null);
  }
  var lineSymbol = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 8,
    strokeColor: "#ffb217"
  };

  var startStopCoordinates = [{
      lat: startLat,
      lng: startLng
    },
    {
      lat: stopLat,
      lng: stopLng
    }
  ];
  startStopPath = new google.maps.Polyline({
    path: startStopCoordinates,
    geodesic: true,
    strokeColor: "#205867",
    strokeOpacity: 0.6666,
    strokeWeight: 8,
    icons: [{
      icon: lineSymbol,
      offset: "100%"
    }]
  });
  startStopPath.setMap(map);
  animateTravel(startStopPath);
}

function animateTravel(line) {
  var count = 0;
  window.setInterval(function () {
    count = (count + 1) % 200;

    var icons = line.get("icons");
    icons[0].offset = count / 2 + "%";
    line.set("icons", icons);
  }, 50);
}

Array.prototype.groupBy = function (prop) {
  return this.reduce(function (groups, item) {
    const val = item[prop];
    groups[val] = groups[val] || [];
    groups[val].push(item);
    return groups;
  }, {});
};
