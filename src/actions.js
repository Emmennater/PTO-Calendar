
// Left clicking on a day
// - toggle between (spend, accrue, none)
// Right clicking on a day
// - access specifics (timeoff, time)

// Switching months
function lastMonth(user = true) {
    if (currentMonth.lastMonth === null) {
        let nextMonth = (currentMonth.month - 1 + 12) % 12;
        let nextYear = currentMonth.year;
        if (nextMonth > currentMonth.month) --nextYear;
        currentMonth.lastMonth = new Month(nextMonth, nextYear);
        currentMonth.lastMonth.nextMonth = currentMonth;
    }
    setMonth(currentMonth.lastMonth);
    if (user) {
        currentMonth.updateAccruals();
        fadeMonth();
    }
    updatePTO();
}

function nextMonth(user = true) {
    if (currentMonth.nextMonth === null) {
        let nextMonth = (currentMonth.month + 1 + 12) % 12;
        let nextYear = currentMonth.year;
        if (nextMonth < currentMonth.month) ++nextYear;
        currentMonth.nextMonth = new Month(nextMonth, nextYear);
        currentMonth.nextMonth.lastMonth = currentMonth;
    }
    setMonth(currentMonth.nextMonth);
    if (user) {
        currentMonth.updateAccruals();
        fadeMonth();
    }
    updatePTO();
}

function setMonth(month) {
    // Set month elem
    const monthElem = document.getElementById("month");
    const monthName = monthElem.children[1];
    monthName.innerText = month.name + " " + month.year + ` — ${month.month + 1} / ${month.year}`;
    currentMonth = month;

    // Todays month
    if (currentMonth.isToday)
        monthName.classList.add("current-month");
    else
        monthName.classList.remove("current-month");

    // Set day elems
    for (let i = 0; i < 42; ++i)
        updateDayElem(i);
}

// Modifying days
function dayClicked(e, day, i) {
    const button = ["left", "middle", "right"][e.which - 1];
    const dayObject = currentMonth.getDay(i);
    if (dayObject === undefined) return;
    
    if (button == "left") {
        Settings.setMinPTOWarning(false);
        dayObject.toggleSub();
        updatePTO();
    }

    saveChanges();
}

function hideDay(day) {
    day.children[0].setAttribute("style", "visibility: hidden;");
    day.children[1].setAttribute("style", "visibility: hidden;");
    day.classList.remove("add", "sub", "starting-day");
    day.classList.add("blank");
    day.setAttribute("style", "--pto-ratio: 0.0;");
}

function showDay(day) {
    day.children[0].setAttribute("style", "visibility: visible;");
    day.children[1].setAttribute("style", "visibility: visible;");
    day.classList.remove("blank");
}

function updateDayElem(i) {
    const days = document.getElementsByClassName("day");
    const dayElem = days[i];
    const monthDay = currentMonth.getDay(i);
    if (monthDay === undefined) {
        hideDay(dayElem);
        return;
    } else {
        showDay(dayElem);
    }

    // Set day number
    dayElem.children[0].innerText = i - currentMonth.firstDay + 1;

    // Set time off
    dayElem.children[1].innerText = rnd(monthDay.getTimeOff(), Settings.getSetting("round"));
    const dayTimeOff = monthDay.getTimeOff();
    let timeOffRatio = dayTimeOff / Settings.getSetting("max");
    timeOffRatio = Math.max(Math.min(timeOffRatio, 1), 0);
    dayElem.setAttribute("style", `--pto-ratio: ${timeOffRatio};`);

    // Set mode
    dayElem.classList.remove("add", "sub");
    if (monthDay.getMode() != "none")
        dayElem.classList.add(monthDay.getMode());

    // Current day
    if (monthDay.isToday)
        dayElem.children[0].classList.add("current-day");
    else
        dayElem.children[0].classList.remove("current-day");

    // Starting day
    if (monthDay.isStartingDay())
        dayElem.classList.add("starting-day");
    else
        dayElem.classList.remove("starting-day");

    // Hit max
    if (dayTimeOff >= Settings.getSetting("max") ||
        dayTimeOff < Settings.getSetting("min")) {
        dayElem.classList.add("hit-max");
        dayElem.setAttribute("style", `--pto-ratio: 1;`);
    } else {
        dayElem.classList.remove("hit-max");
    }

}

function updatePTOElems() {
    for (let i = currentMonth.firstDay; i < currentMonth.lastDay; ++i)
        updateDayElem(i);
}

function updatePTO() {
    // Previous months end time off
    const lastMonth = currentMonth.lastMonth;
    const lastMonthPTO = lastMonth ? lastMonth.days[lastMonth.days.length - 1].getTimeOff() : 0;
    currentMonth.updatePTO(lastMonthPTO);
    updatePTOElems();
}

function updateAllPTO() {
    Settings.maxPTO = null;
    // Settings.setMinPTOWarning(false);
    const initMonth = currentMonth;
    while (true) {
        if (!currentMonth.lastMonth) break;
        currentMonth = currentMonth.lastMonth;
    }
    currentMonth.updatePTO(0);
    while (currentMonth.nextMonth) {
        currentMonth = currentMonth.nextMonth;
        updatePTO();
    }
    setMonth(initMonth);
}

function calculateAccruals(calcPTO = false) {
    Day.startingDay = null;
    
    // Starting day of accruals
    const startMonth = Settings.startDay.month;
    const startYear = Settings.startDay.year;

    // Calculate all past accruals
    currentMonth.updateAccruals();
    const initMonth = currentMonth;
    const monthOffset = (currentMonth.month + currentMonth.year * 12) - (startMonth + startYear * 12);
    for (let i = monthOffset; i > 0; --i) {
        lastMonth(false);
        currentMonth.updateAccruals();
    }
    for (let i = monthOffset; i < 0; ++i)
        nextMonth(false);

    // Reset months before
    while (true) {
        if (!currentMonth.lastMonth) break;
        currentMonth = currentMonth.lastMonth;
        currentMonth.clearAccruals();
    }

    // Recalculating PTO
    if (calcPTO) {
        currentMonth.updatePTO(0);
        while (currentMonth != initMonth) {
            currentMonth = currentMonth.nextMonth;
            updatePTO();
        }
    }

    // Return to initial month
    setMonth(initMonth);
}

// Saving and Loading
function saveData() {
    const settings = {
        add: Settings.getSetting("add"),
        sub: Settings.getSetting("sub"),
        max: Settings.getSetting("max"),
        min: Settings.getSetting("min"),
        carry: Settings.getSetting("carry"),
        start: Settings.getSetting("start")
    };
    const payroll = {
        payroll: Settings.getSetting("payroll"),
        payrollWeek: Settings.getSetting("payrollWeek"),
        payrollDay: Settings.getSetting("payrollDay"),
    };
    const startDay = { ...Settings.startDay };
    const months = [];
    const version = "1";

    // Get first month
    let month = currentMonth;
    while (month.lastMonth)
        month = month.lastMonth;

    // Go until last month
    do {
        const modifiedDays = [];
        months.push({
            year: month.year,
            month: month.month,
            modifiedDays
        });

        // Add modified days
        for (let i = 0; i < month.days.length; ++i) {
            const day = month.days[i];
            if (day.isChanged()) {
                modifiedDays.push({
                    i,
                    data: day.data
                });
            }
        }

        month = month.nextMonth;
    } while (month);

    return JSON.stringify({ settings, months, payroll, startDay, version });
}

function loadData(string) {
    const data = JSON.parse(string);
    if (!data) return;

    // Copy settings
    if (data.settings)
    for (let k in data.settings) {
        Settings.setSetting(k, data.settings[k]);
    }

    // Copy payroll
    if (data.payroll) {
        Settings.payrollWeek = data.payroll.payrollWeek;
        Settings.payrollDay = data.payroll.payrollDay;
        Settings.setPayroll(data.payroll.payroll);
    }

    // Copy start day
    if (data.startDay) {
        Settings.setStartDate(data.startDay.month, data.startDay.day, data.startDay.year);
    }

    // Set accruals
    calculateAccruals();

    // Copy months
    if (data.months) {
        // Go to first month
        const initMonth = currentMonth;
        const monthOffset = (currentMonth.month + currentMonth.year * 12) - (data.months[0].month + data.months[0].year * 12)
        for (let i = monthOffset; i > 0; --i)
            lastMonth(false);
        for (let i = monthOffset; i < 0; ++i)
            nextMonth(false);
    
        // Copy data for each month
        for (let i = 0; i < data.months.length; ++i) {
            const monthData = data.months[i];
            for (let modifiedDay of monthData.modifiedDays) {
                const day = currentMonth.days[modifiedDay.i];
                for (let k in modifiedDay.data)
                    day.data[k] = modifiedDay.data[k];
            }
            updatePTO();
            nextMonth(false);
        }
    
        // Return to initial month
        setMonth(initMonth);
    }

}

function clearData(msg) {
    if (confirm(msg ?? "Are you sure you want to clear saved data?")) {
        storeItem("pto-calendar-data", null);
        location.reload();
    }
}

function saveChanges() {
    const dataString = saveData();
    storeItem("pto-calendar-data", dataString);
    return dataString;
}

function copySaveData() {
    const saveData = saveChanges();
    copyTextToClipboard(saveData, true);
    const jsonElem = document.getElementById("json-data");
    jsonElem.value = saveData;
}

function pasteSaveData() {
    const jsonElem = document.getElementById("json-data");
    pasteTextFromClipboard(jsonElem);
}

function loadSaveData() {
    const jsonElem = document.getElementById("json-data");
    try {
        loadData(jsonElem.value);
        Notification.show("Loaded!");
    } catch (e) {
        console.error("Error loading data: ", e);
    }
}
