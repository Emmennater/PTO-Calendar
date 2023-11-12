
// Left clicking on a day
// - toggle between (spend, accrue, none)
// Right clicking on a day
// - access specifics (timeoff, time)

function lastMonth(animate = true) {
    if (currentMonth.lastMonth === null) {
        let nextMonth = (currentMonth.month - 1 + 12) % 12;
        let nextYear = currentMonth.year;
        if (nextMonth > currentMonth.month) --nextYear;
        currentMonth.lastMonth = new Month(nextMonth, nextYear);
        currentMonth.lastMonth.nextMonth = currentMonth;
    }
    setMonth(currentMonth.lastMonth);
    if (animate) fadeMonth();
    updatePTO();
}

function nextMonth(animate = true) {
    if (currentMonth.nextMonth === null) {
        let nextMonth = (currentMonth.month + 1 + 12) % 12;
        let nextYear = currentMonth.year;
        if (nextMonth < currentMonth.month) ++nextYear;
        currentMonth.nextMonth = new Month(nextMonth, nextYear);
        currentMonth.nextMonth.lastMonth = currentMonth;
    }
    setMonth(currentMonth.nextMonth);
    if (animate) fadeMonth();
    updatePTO();
}

function dayClicked(e, day, i) {
    const button = ["left", "middle", "right"][e.which - 1];
    const dayObject = currentMonth.getDay(i);
    if (dayObject === undefined) return;
    // console.log(day, i);

    if (button == "left") {
        if (dayObject.mode == "none") {
            dayObject.mode = "sub";
            dayObject.time = -Settings.sub;
        } else
        if (dayObject.mode == "sub") {
            dayObject.mode = "add";
            dayObject.time = Settings.add;
        } else
        if (dayObject.mode == "add") {
            dayObject.mode = "none";
            dayObject.time = 0;
        }
        updatePTO();
    }

    saveChanges();
}

function hideDay(day) {
    day.children[0].setAttribute("style", "visibility: hidden;");
    day.children[1].setAttribute("style", "visibility: hidden;");
    day.classList.remove("add", "sub");
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
    dayElem.children[1].innerText = monthDay.timeOff;
    let timeOffRatio = monthDay.timeOff / Settings.max;
    timeOffRatio = Math.max(Math.min(timeOffRatio, 1), 0);
    dayElem.setAttribute("style", `--pto-ratio: ${timeOffRatio};`);

    // Set mode
    dayElem.classList.remove("add", "sub");
    if (monthDay.mode != "none")
        dayElem.classList.add(monthDay.mode);

    // Current day
    if (monthDay.isToday)
        dayElem.children[0].classList.add("current-day");
    else
        dayElem.children[0].classList.remove("current-day");
}

function setMonth(month) {
    // Set month elem
    const monthElem = document.getElementById("month");
    const monthName = monthElem.children[1];
    monthName.innerText = month.name + " " + month.year;
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

function updatePTOElems() {
    for (let i = currentMonth.firstDay; i < currentMonth.lastDay; ++i)
        updateDayElem(i);
}

function updatePTO() {
    // Previous months end time off
    const lastMonth = currentMonth.lastMonth;
    const lastMonthPTO = lastMonth ? lastMonth.days[lastMonth.days.length - 1].timeOff : 0;
    currentMonth.updatePTO(lastMonthPTO);
    updatePTOElems();
}

function saveData() {
    const settings = {
        add: Settings.add,
        sub: Settings.sub,
        max: Settings.max
    };
    const months = [];

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
            if (day.time != 0) {
                modifiedDays.push({
                    i,
                    time: day.time,
                    mode: day.mode
                });
            }
        }

        month = month.nextMonth;
    } while (month);

    return JSON.stringify({ settings, months });
}

function loadData(string) {
    const data = JSON.parse(string);
    if (!data) return;

    // Copy settings
    for (let k in data.settings) {
        Settings.setSetting(k, data.settings[k]);
    }

    // Go to first month
    const initMonth = currentMonth;
    const monthOffset = (currentMonth.month + currentMonth.year * 12) - (data.months[0].month + data.months[0].year * 12)
    for (let i = monthOffset; i > 0; --i)
        lastMonth(false);
    for (let i = monthOffset; i < 0; ++i)
        nextMonth(false);
    const firstMonth = currentMonth;

    // Copy data for each month
    for (let i = 0; i < data.months.length; ++i) {
        const monthData = data.months[i];
        for (let modifiedDay of monthData.modifiedDays) {
            currentMonth.days[modifiedDay.i].mode = modifiedDay.mode;
            currentMonth.days[modifiedDay.i].time = modifiedDay.time;
        }
        updatePTO();
        nextMonth(false);
    }

    setMonth(initMonth);
}

function saveChanges() {
    const dataString = saveData();
    storeItem("pto-calendar-data", dataString);
}
