//#region pattern of life Calendar
function bindPolCalendar() {
    $(".pol .t-head,.t-content").html("");
    $(".pol .t-head").append('<th class="bolder">Stop Category</th>');
    var tRowElem = tHeadElem = "";

    // For creating Vertical Headers/Categories
    for (var key in stopTypesComp) {
        var tbodyTdElem = "";
        for (var j = 0; j < 7; j++) {
            tbodyTdElem += '<td class="' + weekDaysArr[j].name + '"><span class="' + key + '"></span></td>';
        }
        var categoryColorList = '<div class="col-xs-2 cat-color">';
        categoryColorList += '<i class="fa fa-fw fa-lg fa-stop" style="color:' + stopTypesComp[key].Color + '" ></i></div>';
        categoryColorList += '<div class="row category-name"><div class="col-xs-10">' + stopTypesComp[key].Name + "</div></div>";

        tRowElem += '<tr><th scope="row">' + categoryColorList + "</th>" + tbodyTdElem + "</tr>";
    }
    $(".pol .t-content").append(tRowElem);

    // Calender Binding
    var startYear = startOfWeek.year();
    var startMonth = startOfWeek.format("MMM");
    var startMonthNum = startOfWeek.month() + 1;
    var startDate = startOfWeek.date();
    var haveCurrentDate = false;
    var dayWord;
    for (var i = 0; i < 7; i++) {
        var isCurrentDate;
        if (isWeekView) {
            if (moment().utcOffset(timeZoneDiff).format("MM/DD/YYYY").toString() === startOfWeek.format("MM/DD/YYYY").toString()) {
                haveCurrentDate = isCurrentDate = true;
            } else {
                isCurrentDate = false;
            }
            dayWord = weekDaysArr[(startOfWeek.day() == 0) ? 6 : startOfWeek.day() - 1]["abbreviation"];
            var todayClass = isCurrentDate ? "today" : "";
            tHeadElem += '<th scope="col" class="' + todayClass + '">' + dayWord + '<br/><span class="bolder">' + startOfWeek.date() + "</span></th>";
            $(".pol tr td:nth-child(" + (i + 2) + ")").removeAttr("class").addClass('' + startOfWeek.format("MM-DD-YYYY") + ' ' + todayClass + '');
        } else {
            dayWord = weekDaysArr[i]["abbreviation"];
            tHeadElem += '<th scope="col">' + dayWord + "<br/> </th>";
        }
        isWeekView ? startOfWeek.add(1, "days") : ""; //increments the startweek date with 1 for the week
    }
    $(".pol .t-head").append(tHeadElem);

    var endMonth, endDate, endYear, weekEndDate, weekStartDate, headerTxt;
    if (isWeekView) {
        startOfWeek.subtract(1, "days");
        endMonth = startOfWeek.format("MMM");
        endDate = startOfWeek.date();
        endYear = startOfWeek.year();
        weekEndDate = startOfWeek.format("MM/DD/YYYY");
        startOfWeek.subtract(6, "days"); //reset the startWeek to inital state
        weekStartDate = startOfWeek.format("MM/DD/YYYY");
        headerTxt = "<b>" + startDate + " " + startMonth + " " + startYear + " - " + endDate + " " + endMonth + " " + endYear + "</b>";
    } else {
        headerTxt = "<b>" + startMonth + " " + startYear + "</b>";
    }

    $(".month-dtl").html("").append(headerTxt);
    var tempClassCache = $(".pol").attr("class").split(" ").slice(0, 3).join(" ") + " " + startOfWeek.year().toString();
    $(".pol").removeAttr("class").addClass(tempClassCache);

    tempClassCache = $(".pol tbody").attr("class").split(" ").slice(0, 1).join(" ") + " " + (startOfWeek.month() + 1).toString();
    $(".pol tbody").removeAttr("class").addClass(tempClassCache);

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
    var reqObj = isWeekView ? weekReqObj : monthReqObj;
    var requestUrl = baseUrl + apiMethod[calView];
    $(".toggle-pol-view .grid-loader-icon").show();
    var passParameters = {
        'month': month,
        'year': year
    };
    initApiCalls(reqObj, requestUrl, 'get', fnPolSuccess, fnPolFail, passParameters);
}

function fnPolSuccess(res, parameters) {
    if (res) {
        var responseKey = (isWeekView) ? "Dates" : "Days";
        for (var key in res[responseKey]) {
            var dtTemp = res[responseKey][key];
            mapDatatoCal(dtTemp, parameters.month, parameters.year);
        }
        setMarkers(icons, true);
        isFirstCall = isFirstCall ? false : true;
    }
    $(".toggle-pol-view .grid-loader-icon").hide();
}

function fnPolFail(err) {
    $(".toggle-pol-view .grid-loader-icon").hide();
    console.log(err);
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
    $(".toggle-pol-view .grid-loader-icon").show();
    initApiCalls(weekReqObj, requestUrl, 'get', fnCurrentPolSuccess, fnCurrentPolFail);
}

function fnCurrentPolSuccess(res) {
    if (res && tempResp != JSON.stringify(res)) {
        resetMarkers();
        var filtered = latLongCollection.filter(function (value, index, arr) {
            return value.isCurrentDate == false;
        });
        latLongCollection = filtered;
        var responseKey = isWeekView ? "Dates" : "Days";
        for (var key in res[responseKey]) {
            var dtTemp = res[responseKey][key];
            mapDatatoCal(dtTemp, moment().utcOffset(timeZoneDiff).month() + 1, moment().utcOffset(timeZoneDiff).year());
        }
        setMarkers(icons, false);
        tempResp = JSON.stringify(res);
    }
    $(".toggle-pol-view .grid-loader-icon").hide();
}

function fnCurrentPolFail(err) {
    console.log(err);
    $(".toggle-pol-view .grid-loader-icon").hide();
}

function mapDatatoCal(dtTemp, month, year) {
    var dtDay = dtTemp.Day;
    var dtDate = moment.utc(dtTemp.Date).format("MM-DD-YYYY");
    var isCurrentDate = dtDate == moment().utcOffset(timeZoneDiff).format("MM-DD-YYYY");
    var dtPOLCategory, dtTotalCategoryTime;
    for (var innerKey in dtTemp.PolCategories) {
        if (dtTemp.PolCategories.hasOwnProperty(innerKey)) {
            var dtInnerTemp = dtTemp.PolCategories[innerKey];
            dtPOLCategory = dtInnerTemp.Category;
            var hrs, mins;
            hrs = dtInnerTemp.CategoryTotalTime.split(":")[0] + "h";
            mins = dtInnerTemp.CategoryTotalTime.split(":")[1] + "m";
            dtTotalCategoryTime = hrs + " " + mins;
            var dtFilter = isWeekView ? dtDate : dtDay;
            $("." + year + " ." + month + " ." + dtFilter + " ." + dtPOLCategory + "").text(dtTotalCategoryTime); //template : $('.2019 .2 .03-12-2019/.monday .home)
            for (var catKey in dtInnerTemp.ActivityRoutineDetails) {
                var dtCatTemp = dtInnerTemp.ActivityRoutineDetails[catKey];
                if (dtCatTemp.Coordinates) {
                    var pointDuration = dtCatTemp.TotalTime.split(":")[0] + "h" + " " + dtCatTemp.TotalTime.split(":")[1] + "m";
                    var lat = dtCatTemp.Coordinates.Coordinates.Latitude;
                    var lng = dtCatTemp.Coordinates.Coordinates.Longitude;
                    latLongCollection.push({
                        position: new google.maps.LatLng(lat, lng),
                        catName: stopTypesComp[dtPOLCategory].Name,
                        type: dtPOLCategory,
                        address: dtCatTemp.Address,
                        placeName: dtCatTemp.PlaceName,
                        startTime: moment.utc(dtCatTemp.StartTime).format("DD MMM YYYY hh:mm a"),
                        endTime: moment.utc(dtCatTemp.EndTime).format("DD MMM YYYY hh:mm a"),
                        colorCode: stopTypesComp[dtPOLCategory].Color,
                        duration: pointDuration,
                        isCurrentDate: isCurrentDate,
                        lat: lat,
                        lng: lng,
                        locationType: dtCatTemp.LocationType
                    });
                }
            }

        }
    }
}
//#endregion
