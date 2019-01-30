var calView = "weeks";
var startOfWeek = moment().startOf('isoWeek');
var dayWord;
var weekDaysArr = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
var stopTypesComp = {
    "Home": {
        "Name": "Home",
        "Color": "#79f179"
    },
    "Work": {
        "Name": "Work",
        "Color": "#b5eac1"
    },
    "Education": {
        "Name": "Education",
        "Color": "#4ebfe8"
    },
    "Shopping": {
        "Name": "Shopping",
        "Color": "#3b6675"
    },
    "SocialEntertainment": {
        "Name": "Social Entertainment",
        "Color": "#f5a976"
    },
    "Recreation": {
        "Name": "Recreation",
        "Color": "#00980a"
    },
    "Other": {
        "Name": "Other",
        "Color": "#ecec11"
    },
    "Travel": {
        "Name": "Travel",
        "Color": "#e2e2ba"
    },
    "Worship": {
        "Name": "Worship",
        "Color": "#1c91e0"
    },
    "Services": {
        "Name": "Services",
        "Color": "Black"
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

$(function () {
    $('#week').attr('disabled', 'true');
    $('#month').removeAttr('disabled');
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

    $(".panel-heading").click(function () {
        $(".panel-body").slideToggle();
    })

    $(".control-toggler").click(function(){
        if($(".pol-calender").is(':visible'))
          {
            $(".pol-calender").animate({ width: 'hide' }); 
          }
          else
          {
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
    $(".t-head").append("<th></th>");
    var tBodyElem = "";
    var tHeadElem = "";

    // For creating Vertical Headers/Categories
    for (var key in stopTypesComp) {
        var tbodyTdElem = "";
        for (var j = 0; j < 7; j++) {
            tbodyTdElem += "<td class='" + weekDaysArr[j] + "'><span class='" + stopTypesComp[key].Name +
                "'></span></td>"
        }
        var tempString = '<div class="row"><div class="col-md-6">' + stopTypesComp[key].Name + '</div><div class="col-md-2 catColorBox" style="background-color:' + stopTypesComp[key].Color + '" ></div>';
        tBodyElem += "<tr><th scope='row'>" + tempString + "</th>" + tbodyTdElem + "</tr>";

    }
    $('.t-content').append(tBodyElem);

    // Calender Binding
    var startYear = startOfWeek.year();
    var startMonth = startOfWeek.format('MMMM');
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
            tHeadElem += "<th scope='col' class='" + todayClass + "'>" + dayWord + "<br>" + startOfWeek.date() + "</th>";
            $(".table tr td:nth-child(" + (i + 2) + ")").removeAttr('class').addClass(startOfWeek.year() + "-" + (startOfWeek.month() +
                1) + "-" + startOfWeek.date() + "").addClass(todayClass);
        } else if (calView == "months") {
            tHeadElem += "<th scope='col'>" + dayWord + "<br>&nbsp;</th>";
        }
        startOfWeek.add(1, 'days');
    }
    $('.t-head').append(tHeadElem);   

    startOfWeek.subtract(1, 'days');
    var endMonth = startOfWeek.format('MMMM');
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
    bindData();
    initMap();
}

function initMap() {
    map = new google.maps.Map(document.getElementById('googleMap'), {
        zoom: 16,
        center: new google.maps.LatLng(34.005813, -84.32682),
        mapTypeId: 'roadmap'
    });

    var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
    var icons = {
        Education: {
            icon: iconBase + 'parking_lot_maps.png'
        },
        Shopping: {
            icon: iconBase + 'library_maps.png'
        },
        Recreation: {
            icon: iconBase + 'info-i_maps.png'
        },
        Travel: {
            icon: iconBase + 'info-i_maps.png'
        }
    };

    var infoWindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    latLongCollection.forEach(function (feature) {
        var marker = new google.maps.Marker({
            position: feature.position,
            icon: icons[feature.type].icon,
            map: map
        });
        bounds.extend(marker.position);

        google.maps.event.addListener(marker, 'mouseover', (function (mm, tt) {
            return function () {
                infoWindow.setOptions({
                    content: feature.address
                });
                infoWindow.open(map, mm);
            }
        })(marker, feature.address));
    });
    map.fitBounds(bounds);
}

function bindData() {
    var dtPOLCategory;
    var dtTotalCategoryTime;
    for (var key in data.Days) {
        var dtTemp = data.Days[key];
        dtDay = dtTemp.Day;
        for (var innerKey in dtTemp.POLCategories) {
            var dtInnerTemp = dtTemp.POLCategories[innerKey];
            dtPOLCategory = dtInnerTemp.POLCategory;
            dtTotalCategoryTime = dtInnerTemp.TotalCategoryTime;
            $("." + data.Year + " ." + data.MonthNumber + " ." + dtDay + " ." + dtPOLCategory + "").html(dtTotalCategoryTime);
            for (var catKey in dtInnerTemp.MonthlyActivityRoutineSubClass) {
                var dtCatTemp = dtInnerTemp.MonthlyActivityRoutineSubClass[catKey];
                latLongCollection.push({
                    position: new google.maps.LatLng(dtCatTemp.Coordinates.coordinates[0], dtCatTemp.Coordinates.coordinates[1]),
                    type: dtPOLCategory,                    
                    address: dtCatTemp.Address
                })

            }
        }

    }
}