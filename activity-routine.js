//#region daily activity routine functions
function bindActivityTable() {
  map.getStreetView().setVisible(false);
  var headerTxt = "<b>" + currentDate.format("dddd") + ", " + currentDate.format("LL") + "</b>";
  $(".dateDtl").html("").append(headerTxt);
  $(".dar").css("text-align", "center").html('<span class="grid-loader-icon"></span>');
  // resetMarkers();
  var activtyReqObj = {
      Date: currentDate.format("MM/DD/YYYY"),
      ClientId: clientId
  };
  //TODO : temp fix
  var requestUrl = baseUrl + apiMethod.activity;
  // var requestUrl = 'https://gps-analytics-poc-function.azurewebsites.net/api/ActivityRoutine_LiveCode';
  initApiCalls(activtyReqObj, requestUrl, 'get', fnActivitySucc, fnActivityFail);
}

function fnActivitySucc(res) {
  if (res) {
      var darContainer = "";
      for (var key in res.ActivityTimelineDetails) {
          if (res.ActivityTimelineDetails.hasOwnProperty(key)) {
              var activityTimelineDetail = res.ActivityTimelineDetails[key];
              var acLatitude = activityTimelineDetail["PlaceCoordinates"] ? activityTimelineDetail["PlaceCoordinates"].Coordinates.Latitude : 0;
              var acLongitude = activityTimelineDetail["PlaceCoordinates"] ? activityTimelineDetail["PlaceCoordinates"].Coordinates.Longitude : 0;
              var acPolCat = activityTimelineDetail["POLCategory"];
              var acAddress = activityTimelineDetail["Address"];
              var acPlaceName = activityTimelineDetail["PlaceName"];
              var acPlaceId = activityTimelineDetail["PlaceId"];
              var locationType = activityTimelineDetail["LocationType"];
              var acTravelPointDtls = activityTimelineDetail["TravelPointLocationInformation"];
              var acBeginAddress, acEndAddress, acBeginLat, acBeginLng, acEndLat, acEndLng, isTravel;
              isTravel = (acPolCat.toLowerCase() == "travel");
              // Travel Category Dtls
              if (isTravel) {
                  acBeginAddress = acTravelPointDtls["BeginAddress"];
                  acEndAddress = acTravelPointDtls["EndAddress"];
                  acBeginLat = acTravelPointDtls["BeginCoordinates"]["Coordinates"]["Latitude"];
                  acBeginLng = acTravelPointDtls["BeginCoordinates"]["Coordinates"]["Longitude"];
                  acEndLat = acTravelPointDtls["EndCoordinates"]["Coordinates"]["Latitude"];
                  acEndLng = acTravelPointDtls["EndCoordinates"]["Coordinates"]["Longitude"];
              }
              var acStartTime = moment.utc(activityTimelineDetail["StartTime"]).format("hh:mm A");
              var acEndTime = moment.utc(activityTimelineDetail["EndTime"]).format("hh:mm A");
              var timeArr = activityTimelineDetail["TotalTime"].split(":");
              var acTotalTime = timeArr[0] + "h" + " " + timeArr[1] + "m"; //00h 00m
              var onImgClickEvnt = "markTravelRoute(" + acBeginLat + "," + acBeginLng + "," + acEndLat + "," + acEndLng + ");";
              var stopDtls = "<span><div class='headerText placename' data-placeid ='" + acPlaceId + "'>";
              stopDtls += "<span class='form-control stop-name'>" + acPlaceName + "";
              stopDtls += "<span class='grid-loader-icon'></span>";
              stopDtls += '<i class="fa fa-fw fa-lg fa-caret-down"></i>';
              stopDtls += '<i class="fa fa-fw fa-lg fa-caret-up"></i></span>';
              stopDtls += '</div><div class="infoText stop-address">' + acAddress + "</div>";

              var travelDtls = "<div class='headerText'>Travel</div>";
              travelDtls += "<div class='infoText'>Begin: " + acBeginAddress + "</div>";
              travelDtls += "<div class='infoText'>End: " + acEndAddress + "</div>";

              var addStr = isTravel ? travelDtls : stopDtls;
              var divRow = '<div class="col-md-5"><img src="' + icons[acPolCat].icon + '" alt="' + stopTypesComp[acPolCat].Name + '" onClick="' + onImgClickEvnt + '" />';
              divRow += addStr + "</div>";
              divRow += '<div class="col-md-5"><div class="headerText">' + acStartTime + " - " + acEndTime + "</div>";
              divRow += '<span class="infoText">' + acTotalTime + "</span></div>";
              divRow += '<div class="col-md-1"></div>';

              //bind sub-menu options for stop and travel
              var menuOptions = "";
              for (let index = 0; index < activityRoutineSubMenu.length; index++) {
                  var stopOrTravel = (isTravel) ? 'travel' : 'stop';
                  const menu = activityRoutineSubMenu[index];
                  if (menu.Type == stopOrTravel) {
                      menuOptions += '<span class="dropdown-item '+menu.SelectorName+'">' + menu.Name + '</span>';
                  }
              }

              divRow += '<div class="col-md-1"><div class="dropdown"><span></span><div class="dropdown-content">' + menuOptions + "</div></div></div>";
              var rowClasses = 'row ' + acPolCat.toLowerCase() + " " + (acLatitude.toString().replace(".", "") + acLongitude.toString().replace(".", ""));
              darContainer += '<div class="' + rowClasses + '"style="border-left:9px solid ' + stopTypesComp[acPolCat].Color + ';margin:0 0 0 32px" >' + divRow + "</div>";
              if (!isTravel) {
                  latLongCollection.push({
                      position: new google.maps.LatLng(acLatitude, acLongitude),
                      catName: stopTypesComp[acPolCat].Name,
                      type: acPolCat,
                      address: acAddress,
                      placeName: acPlaceName,
                      startTime: moment.utc(activityTimelineDetail["StartTime"]).format("DD MMM YYYY hh:mm a"),
                      endTime: moment.utc(activityTimelineDetail["EndTime"]).format("DD MMM YYYY hh:mm a"),
                      colorCode: stopTypesComp[acPolCat].Color,
                      isCurrentDate: false,
                      duration: acTotalTime,
                      lat: acLatitude,
                      lng: acLongitude,
                      locationType: locationType
                  });
              }
          }

      }
      $(".dar").html(darContainer);

      //bind Nearby click event
      $(".dar .stop-name").click(function () {
          if ($(this).siblings(".dropdown-content").length == 0) {
              $(this).find(".grid-loader-icon").show();
              $(this).find(".fa-caret-down").hide();
              var reqPlaceId = $(this).parent().data("placeid");
              initNearbyPlaces(reqPlaceId, this);
          } else {
              $(this).find(".fa-caret-down").hide();
              $(this).find(".fa-caret-up").show();
              $(this).siblings(".dropdown-content").toggle();
          }
      });
      setMarkers(icons, true);
  } else {
      $(".dar").html("No data found");
  }
}

function fnActivityFail(err) {
  $(".dar").html("No data found");
  console.log(err);
}

function initNearbyPlaces(placeId, control) {
  var nearByReqObj = {
      PlaceId: placeId,
      ClientId: clientId
  };
  var requestUrl = "https://gps-analytics-poc-function.azurewebsites.net/api/PlaceNameUpdatiton";
  initApiCalls(nearByReqObj, requestUrl, 'get', fnNearbysucc, fnNearbyFail, control);
}

function fnNearbysucc(res, control) {
  if (res) {
      var nearByDdl = '<div class="dropdown-content nearby-places">';
      for (var key in res.NearByBusinessPlaces) {
          if (res.NearByBusinessPlaces.hasOwnProperty(key)) {
              nearByDdl += '<span class="dropdown-item">' + res.NearByBusinessPlaces[key].PlaceName + "</span>";
          }
      }
      nearByDdl += "</div>";
      $(control).after(nearByDdl);
      var ddlControl = $(control).siblings(".dropdown-content");
      ddlControl.show();
      ddlControl.find(".dropdown-item").click(function () {
          $(control).find(".fa-caret-up").hide();
          $(control).find(".fa-caret-down").show();
          $(this).parent().siblings(".stop-name").text($(this).text());
          ddlControl.hide();
      });
  }else{
    $(control).find(".fa-caret-up").hide();
    $(control).find(".fa-caret-down").show();
  }
  $(control).find(".grid-loader-icon").hide();

}

function fnNearbyFail(err, control) {
$(control).find(".fa-caret-up").hide();
  $(control).find(".fa-caret-down").show();
  $(control).find(".grid-loader-icon").hide();
  console.log(err);
}
//#endregion
