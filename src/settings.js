
class Settings {
    static add = 0;
    static sub = 0;
    static max = 0;
    static carry = 0;
    static round = 1;
    static payroll = "Weekly";
    static payrollWeek = "Saturday";
    static payrollDay = 1;
    static startDay = { month: 0, day: 0, year: 0 };

    static init() {
        Settings.setSetting("add", 4);
        Settings.setSetting("sub", 8);
        Settings.setSetting("max", 120);
        Settings.setSetting("carry", 120);
        
        // Current day
        const currentDay = new Date();
        Settings.setStartDate(currentDay.getMonth(), 1, currentDay.getFullYear());
    
    }

    static setSetting(setting, value) {
        Settings[setting] = value;
        const settingElem = document.getElementById("setting-" + setting);
        settingElem.value = value;
    }

    static getSetting(setting) {
        return Settings[setting];
    }

    static setPayroll(payroll, accrue = false) {
        Settings.payroll = payroll;

        // Set elements
        setDaySelectionByPayroll(payroll);
        const payrollElem = document.getElementById("payroll");
        payrollElem.innerHTML = payroll;
        if (accrue) calculateAccruals(true);
    }

    static setPayrollWeek(week, accrue = false) {
        Settings.payrollWeek = week;

        // Set elements
        const dayElem = document.getElementById("day");
        dayElem.innerHTML = week;
        if (accrue) calculateAccruals(true);
    }

    static setStartDate(month, day, year) {
        Settings.startDay.month = month;
        Settings.startDay.day = day;
        Settings.startDay.year = year;

        // Set elements
        const startMonthElem = document.getElementById("pto-start-month");
        const startDayElem = document.getElementById("pto-start-day");
        const startYearElem = document.getElementById("pto-start-year");
        startMonthElem.value = month + 1;
        startDayElem.value = day;
        startYearElem.value = year;
    }

    static setPayrollDay(day, accrue = false) {
        Settings.payrollDay = day;

        // Set elements
        const dayElem = document.getElementById("day");
        dayElem.innerHTML = day;
        if (accrue) calculateAccruals(true);
    }

    static setMaxDate(dayObj) {
        const elem = document.getElementById("max-date");
        const month = dayObj.month.month + 1;
        const day = dayObj.dayOfMonth + 1;
        const year = dayObj.month.year;
        elem.innerText = `${month}/${day}/${year}`;
        Settings.maxPTOFound = true;
    }

    static unknownMaxDate() {
        const elem = document.getElementById("max-date");
        elem.innerText = `???`;
    }
}
