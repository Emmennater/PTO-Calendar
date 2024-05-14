
const MONTHS = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const FULL_WEEKS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function initListeners() {
    // Settings
    const addSettingElem = document.getElementById("setting-add");
    const subSettingElem = document.getElementById("setting-sub");
    const maxSettingElem = document.getElementById("setting-max");
    const minSettingElem = document.getElementById("setting-min");
    const carrySettingElem = document.getElementById("setting-carry");
    const startPTOElem = document.getElementById("setting-start");
    const startMonthElem = document.getElementById("pto-start-month");
    const startDayElem = document.getElementById("pto-start-day");
    const startYearElem = document.getElementById("pto-start-year");
    addSettingElem.addEventListener("change", ()=>{
        Settings.setSetting("add", parseFloat(addSettingElem.value));
        Settings.unknownMaxDate();
        updateAllPTO();
        saveChanges();
    });
    subSettingElem.addEventListener("change", ()=>{
        Settings.setSetting("sub", parseFloat(subSettingElem.value));
        Settings.unknownMaxDate();
        updateAllPTO();
        saveChanges();
    });
    maxSettingElem.addEventListener("change", ()=>{
        Settings.setSetting("max", parseFloat(maxSettingElem.value));
        Settings.unknownMaxDate();
        updateAllPTO();
        saveChanges();
    });
    minSettingElem.addEventListener("change", ()=>{
        Settings.setSetting("min", parseFloat(minSettingElem.value));
        updateAllPTO();
        saveChanges();
    });
    carrySettingElem.addEventListener("change", ()=>{
        Settings.setSetting("carry", parseFloat(carrySettingElem.value));
        Settings.unknownMaxDate();
        updateAllPTO();
        saveChanges();
    });
    startPTOElem.addEventListener("change", ()=>{
        Settings.setSetting("start", parseFloat(startPTOElem.value));
        Settings.unknownMaxDate();
        updateAllPTO();
        saveChanges();
    });
    startMonthElem.addEventListener("change", ()=>{
        Settings.startDay.month = parseFloat(startMonthElem.value) - 1;
        Settings.unknownMaxDate();
        calculateAccruals(true);
        saveChanges();
    });
    startDayElem.addEventListener("change", ()=>{
        Settings.startDay.day = parseFloat(startDayElem.value);
        Settings.unknownMaxDate();
        calculateAccruals(true);
        saveChanges();
    });
    startYearElem.addEventListener("change", ()=>{
        Settings.startDay.year = parseFloat(startYearElem.value);
        Settings.unknownMaxDate();
        calculateAccruals(true);
        saveChanges();
    });

    // Days
    const days = document.getElementsByClassName("day");
    for (let i = 0; i < days.length; ++i) {
        const day = days[i];
        const pto = Math.floor(i / 5) * 5 * 0.02;
        day.addEventListener("mousedown", (e) => dayClicked(e, day, i));
        day.children[1].innerText = "0";
    }
}

class Month {
    constructor(month, year) {
        // Month
        this.name = MONTHS[month];
        this.month = month;
        this.year = year;
        
        // Days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        this.firstDay = firstDay.getDay();
        this.lastDay = lastDay.getDate() + this.firstDay;
        
        // Last
        this.lastMonth = null;

        // Next
        this.nextMonth = null;

        this.init();
    }

    getDay(i) {
        return this.days[i - this.firstDay];
    }

    init() {
        this.days = [];
        for (let i = this.firstDay; i < this.lastDay; ++i) {
            const day = new Day(this, i % 7, this.days.length);
            this.days.push(day);
        }
    }

    updatePTO(startingPTO) {
        // Max carry over
        if (this.month == 0)
            startingPTO = Math.min(startingPTO, Settings.getSetting("carry"));

        let cumulativePTO = startingPTO;
        const maxPTO = Settings.getSetting("max");
        const minPTO = Settings.getSetting("min");
        let hitMax = startingPTO >= maxPTO;
        for (const day of this.days) {
            cumulativePTO += day.getLocalTimeOff();
            
            // Max PTO
            if (cumulativePTO >= maxPTO) {
                cumulativePTO = maxPTO;
                if (!hitMax) {
                    hitMax = true;
                    Settings.setMaxDate(day);
                }
            }

            // Min PTO
            // if (cumulativePTO < minPTO) {
            //     Settings.setMinPTOWarning(true);
            // }

            day.setTimeOff(cumulativePTO);
        }
    }

    clearAccruals() {
        for (const day of this.days)
            day.data.add = false;
    }

    updateAccruals() {
        // Clear current accruals
        this.clearAccruals();

        // Starting day of accruals
        const startMonth = Settings.startDay.month; // [0]
        const startDay = Settings.startDay.day;     // [1]
        const startYear = Settings.startDay.year;
        if (startMonth + startYear * 12 > this.month + this.year * 12)
            return;

        // Payroll settings
        const payroll = Settings.payroll;
        const payrollWeek = FULL_WEEKS.indexOf(Settings.payrollWeek);
        const payrollDay = Settings.payrollDay;

        switch (Settings.payroll) {
            case "Weekly":
                // Once a week
                for (const day of this.days)
                    if (day.dayOfWeek == payrollWeek)
                        day.data.add = true;
                break;
            case "Bi-Weekly":
                // Every other week (1st and 3rd)
                let payweek = false;
                for (const day of this.days)
                    if (day.dayOfWeek == payrollWeek && (payweek = !payweek))
                        day.data.add = true;
                break;
            case "Bi-Monthly":
                // This day and the last day
                this.days[payrollDay - 1].data.add = true;
                this.days[this.days.length - 1].data.add = true;
                break;
            case "Monthly":
                // This day only
                this.days[payrollDay - 1].data.add = true;
                break;
        }

        // Days before accrual starts are 0
        if (this.month == startMonth)
        for (let i = startDay - 2; i >= 0; --i)
            this.days[i].data.add = false;
    }
}

class Day {
    static startingDay = null;

    constructor(month, dayOfWeek, dayOfMonth) {
        this.month = month;
        this.dayOfWeek = dayOfWeek;
        this.dayOfMonth = dayOfMonth;
        this.data = {
            timeOff: 0,
            time: 0,
            add: false,
            sub: false
        };
        this.initData = { ...this.data };
    }

    getTimeOff() {
        return this.data.timeOff;
    }

    getMode() {
        let mode = "none";
        if (this.data.sub) mode = "sub";
        else if (this.data.add) mode = "add";
        else if (this.data.time < 0) mode = "sub";
        return mode;
    }

    setTimeOff(time) {
        this.data.timeOff = time;
    }

    setTime(time) {
        this.data.time = time;
    }

    toggleSub() {
        this.data.sub = !this.data.sub;
    }

    getLocalTimeOff() {
        if (this.isStartingDay()) return Settings.start;
        let time = this.data.time;
        if (this.data.add) time += Settings.getSetting("add");
        if (this.data.sub) time -= this.data.subTime || Settings.getSetting("sub");
        return time;
    }

    isChanged() {
        if (this.data.sub) return true;
        if (this.data.time != 0) return true;
        return false;
    }

    isStartingDay() {
        if (Day.startingDay !== null)
            return this == Day.startingDay;

        // Starting day of accruals
        const startMonth = Settings.startDay.month; // [0]
        const startDay = Settings.startDay.day;     // [1]
        const startYear = Settings.startDay.year;
        
        // Starting month?
        if (startMonth + startYear * 12 != this.month.month + this.month.year * 12)
            return false;

        // Starting day?
        if (startDay - 1 == this.dayOfMonth) {
            Day.startingDay = this;
            return true;
        } else return false;
    }
}

(function start() {
    // Disable right click drop down
    document.addEventListener('contextmenu', event => event.preventDefault());

    // Drop downs
    DropDowns.init();

    // Current Date
    const date = new Date();
    
    // Current month
    setMonth(new Month(date.getMonth(), date.getFullYear()));
    currentMonth.isToday = true;

    // Settings
    Settings.init();

    // Elements
    initListeners();

    // Set current day
    const todaysDate = new Date();
    const firstDayIndex = todaysDate.getDate() - 1;
    currentMonth.days[firstDayIndex].isToday = true;

    // Load data
    try {
        loadData(getItem("pto-calendar-data"));
        
        // Save if no errors
        saveChanges();
    } catch (e) {
        clearData("Error parsing stored changes.\nReset to default?");
    }

    updatePTOElems();
    calculateAccruals(true);

})();
