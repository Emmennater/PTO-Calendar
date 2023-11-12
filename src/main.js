
const MONTHS = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function initListeners() {
    // Settings
    const addSettingElem = document.getElementById("setting-add");
    const subSettingElem = document.getElementById("setting-sub");
    const maxSettingElem = document.getElementById("setting-max");
    addSettingElem.addEventListener("change", ()=>{
        Settings.setSetting("add", addSettingElem.value);
    })
    subSettingElem.addEventListener("change", ()=>{
        Settings.setSetting("sub", subSettingElem.value);
    })
    maxSettingElem.addEventListener("change", ()=>{
        Settings.setSetting("max", maxSettingElem.value);
    })

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
            const obj = {
                day: i % 7,
                date: this.days.length,
                timeOff: 0,
                time: 0,
                mode: "none"
            };
            this.days.push(obj);
        }
    }

    updatePTO(startingPTO) {
        let cumulativePTO = startingPTO;
        for (const day of this.days) {
            cumulativePTO += day.time;
            day.timeOff = cumulativePTO;
        }
    }
}

class Settings {
    static add = 0;
    static sub = 0;
    static max = 0;
    static round = 1;
    
    static init() {
        Settings.setSetting("add", 12);
        Settings.setSetting("sub", 8);
        Settings.setSetting("max", 120);
    }

    static setSetting(setting, value) {
        if (typeof value == "string")
            value = parseFloat(value);
        Settings[setting] = value;
        const settingElem = document.getElementById("setting-" + setting);
        settingElem.value = value;
    }
}

(function start() {
    // Disable right click drop down
    document.addEventListener('contextmenu', event => event.preventDefault());

    // Current Date
    const date = new Date();
    
    // Settings
    Settings.init();

    // Elements
    initListeners();

    // Current month
    setMonth(new Month(date.getMonth(), date.getFullYear()));
    currentMonth.isToday = true;

    // Set current day
    const todaysDate = new Date();
    const firstDayIndex = currentMonth.firstDay + todaysDate.getDate() - 1;
    currentMonth.days[firstDayIndex].isToday = true;

    // Load data
    loadData(getItem("pto-calendar-data"));

})();
