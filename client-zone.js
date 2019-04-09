//#region zones
function bindClientZone() {
  var zoneReqObj = {
      ClientId: clientId
  };
  // var requestUrl = baseUrl + apiMethod.activity;
  var requestUrl =
      "https://gps-analytics-poc-function-apps.azurewebsites.net/api/GetClientZone";
  var settings = {
      async: true,
      crossDomain: true,
      url: requestUrl,
      method: "GET",
      data: zoneReqObj
  };
  circles = [];
  $.ajax(settings)
      .done(function (res) {
          if (res) {
              for (var key in res.ClientZoneDetails) {
                  if (!res.ClientZoneDetails.hasOwnProperty(key)) {
                      break;
                  }
                  var zone = res.ClientZoneDetails[key];
                  var centerLatLong = {
                      lat: zone.ZoneCoordinates.Coordinates.Latitude,
                      lng: zone.ZoneCoordinates.Coordinates.Longitude
                  };
                  var radius = zone.ZoneRadius;
                  var zoneCircle = new google.maps.Circle({
                      strokeColor: "RGBA(0,159,60,.5)",
                      strokeOpacity: 0.8,
                      strokeWeight: 2,
                      fillColor: "RGBA(0,159,60,.5)",
                      fillOpacity: 0.35,
                      map: map,
                      center: centerLatLong,
                      radius: radius
                  });
                  circles.push(zoneCircle);
              }
          }
      })
      .fail(function (err) {
          console.log("error");
      });
}
//#endregion
