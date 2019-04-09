//#region variable block
var calView = "weeks";
var isWeekView = true; //as default view will be week
var viewType = "pol";
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
    }
};
var activityRoutineSubMenu = [{
        Name: 'Show Points',
        Type: 'travel',
        SelectorName :'show-points-t'
    },
    {
        Name: 'Indicate Travel Mode',
        Type: 'travel',
        SelectorName :'travel-mode'
    },
    {
        Name: 'Snap to Road',
        Type: 'travel',
        SelectorName :'snap-road'
    },
    {
        Name: 'Show Points',
        Type: 'stop',
        SelectorName :'show-points-s'
    },
    {
        Name: 'Create Exclusion Zone',
        Type: 'stop',
        SelectorName :'create-exclusion'
    },
    {
        Name: 'Create Inclusion Zone',
        Type: 'stop',
        SelectorName :'create-inclusion'
    },
    {
        Name: 'Rename this Location',
        Type: 'stop',
        SelectorName :'rename-location'
    },
    {
        Name: 'Change Category',
        Type: 'stop',
        SelectorName :'change-category'
    },
    {
        Name: 'Place Details',
        Type: 'stop',
        SelectorName :'place-details'
    }
]
var tempResp = "";
var refreshCurrent = 0;
var isFirstCall = true;
var circles  = [];
var markers =[];
var latLongCollection = [];
var clientId = "";
var timeZoneDiff = "-05:00";
var startOfWeek = moment().utcOffset(timeZoneDiff).startOf("isoWeek"); //pol
var currentDate = moment().utcOffset(timeZoneDiff); //dar
var infowindow = new google.maps.InfoWindow();
var map, startStopPath,isPanorama=false;
//#endregion

//#region onInit functions
$(function () {
    // loader functions
    initMapObj();
    bindClients();
    bindClientZone();
    bindPolCalendar();

    $(".pol-calendar").show();
    $(".activity-routine").hide();


    if (isWeekView) {
        $("#week").attr("disabled", "true");
        $("#month").removeAttr("disabled");
    } else {
        $("#month").attr("disabled", "true");
        $("#week").removeAttr("disabled");
    }

    $(".pol-calendar .direction").click(function () {
      resetMarkers(true);
        var direction = $(this).data("direction");
        if (direction == "left") {
            startOfWeek = startOfWeek.subtract(1, calView);
        } else if (direction == "right") {
            startOfWeek = startOfWeek.add(1, calView);
        }
        bindPolCalendar();
    });

    $(".activity-routine .direction").click(function () {
      resetMarkers(true);
        var direction = $(this).data("direction");
        if (direction == "left") {
            currentDate = currentDate.subtract(1, "days");
        } else if (direction == "right") {
            currentDate = currentDate.add(1, "days");
        }
        bindActivityTable();
    });

    $(".show-hide-toggler button").click(function () {
        $(this).children().toggleClass("fa-caret-right");
        if ($(".pol-box").is(":visible")) {
            $(".pol-box-animate").width($(".pol-box").width());
            $(".pol-box").animate({
                width: "hide"
            });
        } else {
            $(".pol-box").animate({
                width: "show"
            });
        }
    });

    $(".pol-view-toggler").click(function () {
      resetMarkers(true);
        if (isWeekView) {
            isWeekView = false;
            calView = "months";
            $("#month").attr("disabled", "true");
            $("#week").removeAttr("disabled");
        } else {
            isWeekView = true;
            calView = "weeks";
            $("#week").attr("disabled", "true");
            $("#month").removeAttr("disabled");
        }
        clearInterval(refreshCurrent);
        refreshCurrent = 0;
        startOfWeek = moment().utcOffset(timeZoneDiff).startOf("isoWeek"); //reset to current week/month
        bindPolCalendar();
    });

    $(".todayBtn").click(function () {
      resetMarkers(true);
        if (viewType == "pol") {
            calView = "weeks";
            isWeekView = true;
            $("#week").attr("disabled", "true");
            $("#month").removeAttr("disabled");
            startOfWeek = moment().utcOffset(timeZoneDiff).startOf("isoWeek");
            bindPolCalendar();
        } else {
            currentDate = moment().utcOffset(timeZoneDiff);
            bindActivityTable();
        }
    });

    $("#clientSelection").change(function () {
      resetMarkers(true);
        clientId = $(this).val();
        //remove zones layer
        for (var i = 0; i < circles.length; i++) {
            circles[i].setMap(null);
        }
        clearInterval(refreshCurrent);
        refreshCurrent = 0;
        viewType == "pol" ? bindPolCalendar() : bindActivityTable();
        bindClientZone();
    });

    $(".pol-data-view").change(function () {
      resetMarkers(true);
        clearInterval(refreshCurrent);
        refreshCurrent = 0;
        var dataView = this.value;
        isFirstCall = true;
        startOfWeek = moment().utcOffset(timeZoneDiff).startOf("isoWeek");
        currentDate = moment().utcOffset(timeZoneDiff);
        if (dataView == "pol") {
            viewType = dataView;
            $(".activity-routine").hide();
            $(".pol-calendar").show();
            bindPolCalendar();
        } else if (dataView == "dar") {
            viewType = dataView;
            $(".activity-routine")
                .css({
                    height: $(".pol-calendar").height() + "px",
                    overflow: "hidden"
                })
                .show();

            $(".activity-routine .table-responsive").css({
                height: $(".activity-routine").height() - $(".activity-routine>div:first").height() - 40 + "px",
                "overflow-y": "scroll"
            });
            $(".pol-calendar").hide();
            bindActivityTable();
        }
    });

});
//#endregion

//#region bind Client
function bindClients() {
    var options = "";
    for (var key in clients) {
        if (clients.hasOwnProperty(key)) {
            options += '<option value="' + clients[key]["Id"] + '">' + clients[key]["Name"] + "</option>";
        }
    }
    $("#clientSelection").append(options);
    clientId = $("#clientSelection").val();
}
//#endregion
