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
    }
};

function bindData() {
    $("." + data.Year + " ." + data.MonthNumber + " ." + data.Day + " ." + data.POLCategory + "").html(data.TotalCategoryTime);


    // bookingArray.forEach(function (el) {
    //     $("." + el.start).html(el.name);
    //     // $("." + el.end).addClass("end").html("end");
    //     var startDate = moment(el.start);
    //     var endDate = moment(el.end);
    //     console.log(startDate, endDate);
    // });
}
var data = {
    "_id": "5c4ec3598a881c2888cf7891",
    "ClientId": "5c2f2be4eef4c72f24500e6e",
    "POLCategory": "Recreation",
    "MonthNumber": 1,
    "Day": "Monday",
    "Year": 2019,
    "TotalCategoryTime": "02:00:00",
    "MonthlyActivityRoutineSubClass": [{
            "Coordinates": {
                "type": "Point",
                "coordinates": [34.005813, -84.32682]
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
        },
        {
            "Coordinates": {
                "type": "Point",
                "coordinates": [34.005813, -84.32682]
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
        }
    ]
}

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
});

function bindCal() {
    $(".t-head,.t-content").html('');
    $(".t-head").append("<th></th>");
    var tBodyElem = "";
    var tHeadElem = "";
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
    var startMonth = startOfWeek.format('MMMM');
    var startDate = startOfWeek.date();
    var startWeekDay = calView == "months" ? startOfWeek.startOf('isoWeek') : startOfWeek;
    for (var i = 0; i < 7; i++) {
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

            tHeadElem += "<th scope='col'>" + dayWord + "<br>" + startOfWeek.date() + "</th>";
            $(".table tr td:nth-child(" + (i + 2) + ")").removeAttr('class').addClass(startOfWeek.year() + "-" + (startOfWeek.month() +
                1) + "-" + startOfWeek.date() + "");
        } else if (calView == "months") {
            tHeadElem += "<th scope='col'>" + dayWord + "<br>&nbsp;</th>";
        }
        startOfWeek.add(1, 'days');
    }
    $('.t-head').append(tHeadElem);


    startOfWeek.subtract(1, 'days');
    var endMonth = startOfWeek.format('MMMM');
    var endDate = startOfWeek.date();
    startOfWeek.subtract(6, 'days');
    var headerTxt = calView == "weeks" ? '<b>' + startDate + ' ' + startMonth + ' - ' + endDate + ' ' +
        endMonth + '</b>' : "<b>" + startMonth + " " + startOfWeek.year() + "</b>";
    $(".monthDtl").html('').append(headerTxt);
    var tempClassCache = $(".pol").attr('class').split(' ').slice(0, 3).join(' ') + " " + startOfWeek.year().toString();
    $(".pol").removeAttr('class').addClass(tempClassCache);
    tempClassCache = $(".pol tbody").attr('class').split(' ').slice(0, 1).join(' ') + " " + (startOfWeek.month() + 1).toString();
    $(".pol tbody").removeAttr('class').addClass(tempClassCache);
    bindData();

}



$("." + moment().format("YYYY-MM-D")).addClass("today");

var bookingArray = [{
    "end": "2019-1-30",
    "id": "3",
    "name": "Amirul",
    "property": "Homestay terbilang",
    "ref": "17111-3",
    "slug": "homestay-terbilang",
    "start": "2019-1-29"
}, {
    "end": "2019-1-29",
    "id": "4",
    "name": "test",
    "property": "Homestay terbilang",
    "ref": "17111-4",
    "slug": "homestay-terbilang",
    "start": "2019-1-28"
}]

// make different booking different class that have different color. :) 

bookingArray.forEach(function (el) {
    $("." + el.start).html(el.name);
    // $("." + el.end).addClass("end").html("end");
    var startDate = moment(el.start);
    var endDate = moment(el.end);
    console.log(startDate, endDate);
});