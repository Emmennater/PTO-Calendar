
class DropDowns {
    static init() {
        const dropdowns = document.getElementsByClassName("dropdown");
        Array.from(dropdowns).forEach(e => DropDowns.setupDropDown(e));
    
        // Initially hide drop downs on click
        document.addEventListener("mouseup", e => {
            if (e.button !== 0) return;
            DropDowns.hideAllDropDowns();
        });

        DropDowns.initStyles();
    }

    static hideAllDropDowns() {
        const dropdowns = document.getElementsByClassName("dropdown");
        Array.from(dropdowns).forEach(e => DropDowns.hideDropDown(e));
    }

    static hideDropDown(dropdown) {
        dropdown.children[1].setAttribute("style", "visibility:hidden;");
    }

    static setupDropDown(dropdown) {
        // Initially hide drop down
        DropDowns.hideDropDown(dropdown);
        dropdown.children[0].onclick = () => {
            dropdown.children[1].setAttribute("style", "visibility:visible;");
        };

        // Hide drop down when an option is selected
        dropdown.children[1].onclick = () => {
            dropdown.children[1].setAttribute("style", "visibility:hidden;");
            saveChanges();
        }
    }

    static initStyles() {
        const payrolls = Array.from(document.getElementById("payroll-options").children);
        const weeks = Array.from(document.getElementById("week-selection").children);
        const days = Array.from(document.getElementById("day-selection").children);
        const children = [...payrolls, ...weeks, ...days];
        for (const elem of children) {
            elem.addEventListener('mousemove', (e) => {
                // const x = e.clientX / elem.offsetWidth;
                const bounds = elem.getBoundingClientRect();
                const x = (e.clientX - bounds.x) / bounds.width;
                elem.style.setProperty('--start', x);
            });
        }
    }
}

function setDaySelectionByPayroll(payroll, accrue = true) {
    switch (payroll) {
        case "Weekly": setDaySelectionToWeek(accrue); break;
        case "Bi-Weekly": setDaySelectionToWeek(accrue); break;
        case "Bi-Monthly": setDaySelectionToDay(accrue); break;
        case "Monthly": setDaySelectionToDay(accrue); break;
    }
}

function setDaySelectionToWeek(accrue = true) {
    const weekOpts = document.getElementById("week-selection");
    const dayOpts = document.getElementById("day-selection");
    dayOpts.setAttribute("style", "display: none;");
    weekOpts.setAttribute("style", "display: block;");

    // Automatically select last selected week
    Settings.setPayrollWeek(Settings.payrollWeek, accrue);
}

function setDaySelectionToDay() {
    const weekOpts = document.getElementById("week-selection");
    const dayOpts = document.getElementById("day-selection");
    weekOpts.setAttribute("style", "display: none;");
    dayOpts.setAttribute("style", "display: block;");

    // Automatically select last selected day
    Settings.setPayrollDay(Settings.payrollDay, true);
}
