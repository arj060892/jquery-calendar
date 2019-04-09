//#region map operations
function initMapObj() {
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
}

function setMarkers(icons, alignMap) {
  var bounds = new google.maps.LatLngBounds();
  var groupedColl = latLongCollection.groupBy("address");
  var pointerCollection = [];
  for (var key in groupedColl) {
    if (groupedColl.hasOwnProperty(key)) {
      var features = groupedColl[key];
      var featureClass = features.length > 1 ? " point-overflow" : "";
      var multipleLatLong = '<div class="point-stop-durations' + featureClass + '"><table>';

      features.forEach(function (feature, i) {
        multipleLatLong += '<tr><td class="point-stop-time"><b>Start Time: </b></td><td class="point-stop-time">' + feature.startTime + "</td></tr>";
        multipleLatLong += '<tr><td class="point-stop-time"><b>End Time: </b></td><td class="point-stop-time">' + feature.endTime + "</td></tr>";
        multipleLatLong += '<tr><td class="point-stop-duarion"><b>Duration: </b></td><td class="point-stop-duarion">' + feature.duration + "</td></tr>";

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
            lng: feature.lng,
            locationType: feature.locationType
          });
        }
      });
    }
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
        var bingCat = feature.catName.toLowerCase() != feature.locationType.toLowerCase() ? " - " + feature.locationType : "";
        var infoContent = '<div class="infowindow"><div class="point-name">';
        infoContent += '<a href="javascript:void(0)" onclick="setStreetView(' + feature.lat + "," + feature.lng + ')"><b>' + feature.placeName + '</b></a>';
        infoContent += '</div><div class="point-type">( ' + feature.catName + "" + bingCat + " )</div>";
        infoContent += '<div class="point-address">' + feature.address + '</div>';
        infoContent += feature.startTimeEndTime + "</div>";

        infowindow.setOptions({
          content: infoContent
        });

        infowindow.open(map, mm);
      };
    })(marker, feature.address));

    marker.addListener("click", function () {
      $(".dar .row.rowHighlight").removeClass("rowHighlight");
      $('.stop-address:contains("' + feature.address + '")').parents("." + feature.type.toLowerCase() + "")
        .each(function (i, obj) {
          $(obj).addClass("rowHighlight");
        });
    });

    google.maps.event.addListener(marker, 'createInclusion', (function (mm, tt) {
      return function () {
        var onClickEvnt = "zoneAdded('" + feature.catName + "');";
        infowindow.setOptions({
          content: createZoneControl('Inclusion', feature.catName, onClickEvnt)
        });
        infowindow.open(map, mm);
      };
    })(marker, feature.address));

    google.maps.event.addListener(marker, 'createExclusion', (function (mm, tt) {
      return function () {
        var onClickEvnt = "zoneAdded('" + feature.catName + "');";
        infowindow.setOptions({
          content: createZoneControl('Exclusion', feature.catName, onClickEvnt)
        });
        infowindow.open(map, mm);
      };
    })(marker, feature.address));

    $('.stop-address:contains("' + feature.address + '")').parents("." + feature.type.toLowerCase() + "")
      .each(function (i, obj) {
        var $this = $(obj);
        $this.find('img').attr("onclick", "triggerMarker(" + feature.lat + "," + feature.lng + "," + markerIndex + ",'mouseover')");
        $this.find('.create-inclusion').attr("onclick", "triggerMarker(" + feature.lat + "," + feature.lng + "," + markerIndex + ",'createInclusion')");
        $this.find('.create-exclusion').attr("onclick", "triggerMarker(" + feature.lat + "," + feature.lng + "," + markerIndex + ",'createExclusion')");
      });
    markerIndex++;
  });

  if (alignMap && isFirstCall) {
    map.fitBounds(bounds);
  }
}

function resetMarkers(clearLatLong) {
  map.getStreetView().setVisible(false);
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
  if (startStopPath) {
    startStopPath.setMap(null);
  }
  if (clearLatLong) {
    latLongCollection = [];
  }
}

function createZoneControl(zoneType, zoneName, fnZoneSucc) {
  var infoContent = '<div class="infowindow"><div id="marker-edit-location-content"><div class="point-name">';
  infoContent += '<a href="javascript:void(0)" ><b id="lblZoneType"> ' + zoneType + ' Zone </b></a></div>';
  infoContent += '<div class="form-group form-group-sm"><label class="control-label">Name </label>';
  infoContent += '<div><input class="form-control cs-required" type="text"   value="' + zoneName + ' - Zone" id="txtAnlZoneName"/></div></div>';
  infoContent += '<div class="form-group form-group-sm" id="dvRadius"><label class="control-label">Radius (feet - get as per account config)</label>';
  infoContent += '<div><input class="form-control cs-required cs-numeric" type="text" id="txtAnlRadius" placeholder="Default to 200 (ft)" value="100"></div></div>';
  infoContent += '<div class=" margin-bottom-sm"><label class="checkbox-inline"><input type="checkbox">Refresh Report</label></div>';
  infoContent += '<div class="form-group text-right">';
  infoContent += '<button class="btn btn-sm btn-default margin-right-md" onclick="closeAnlyticsDialog()">Cancel</button>';
  infoContent += '<button class="btn btn-sm btn-default" onclick="' + fnZoneSucc + '">Save</button>';
  infoContent += '</div></div>';

  return infoContent;
}

function triggerMarker(latitude, longitude, markerIndex, eventName) {
  $(".dar .row.rowHighlight").removeClass("rowHighlight");
  if (startStopPath) {
    startStopPath.setMap(null);
  }
  map.setCenter({
    lat: latitude,
    lng: longitude
  });
  google.maps.event.trigger(markers[markerIndex], eventName);
}

function zoneAdded() {
  formValidation.validateForm($('#marker-edit-location-content'));
  if (formValidation.isFormValid) {
    var zoneName = $('#txtAnlZoneName').val().trim();
    var radius = $('#txtAnlRadius').val().trim();
    var zoneType = $('#lblZoneType').text().trim();
    alert(zoneType + ' - Name: ' + zoneName + ', Radius: ' + radius);
    closeAnlyticsDialog();
  }
}

function closeAnlyticsDialog() {
  infowindow.close();
}

function markTravelRoute(startLat, startLng, stopLat, stopLng) {
  infowindow.close();
  if (startStopPath) {
    startStopPath.setMap(null);
  }

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
    strokeWeight: 8
  });
  startStopPath.setMap(map);
}
var panorama;
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
         panorama = new google.maps.StreetViewPanorama(
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
        panorama.addListener('visible_changed', function () {
          console.log('visble changed');
          // $('.show-hide-toggler button').trigger('click');
          // google.maps.event.clearListeners(panorama, 'visible_changed');
        });
        map.setStreetView(panorama);
        $('.show-hide-toggler button').trigger('click');
      } else {
        console.log("no street view available in this range, or some error occurred");
      }
    }
  );


}
//#endregion
