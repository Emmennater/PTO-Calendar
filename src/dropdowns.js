
class DropDowns {
    static init() {
        const dropdowns = document.getElementsByClassName("dropdown");
        Array.from(dropdowns).forEach(e => DropDowns.setupDropDown(e));
    
        // Initially hide drop downs on click
        document.addEventListener("mouseup", e => {
            if (e.button !== 0) return;
            DropDowns.hideAllDropDowns();
        });
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
}

function setDaySelectionByPayroll(payroll) {
    switch (payroll) {
        case "Weekly": setDaySelectionToWeek(); break;
        case "Bi-Weekly": setDaySelectionToWeek(); break;
        case "Bi-Monthly": setDaySelectionToDay(); break;
        case "Monthly": setDaySelectionToDay(); break;
    }
}

function setDaySelectionToWeek() {
    const weekOpts = document.getElementById("week-selection");
    const dayOpts = document.getElementById("day-selection");
    dayOpts.setAttribute("style", "display: none;");
    weekOpts.setAttribute("style", "display: block;");

    // Automatically select last selected week
    Settings.setPayrollWeek(Settings.payrollWeek, true);
}

function setDaySelectionToDay() {
    const weekOpts = document.getElementById("week-selection");
    const dayOpts = document.getElementById("day-selection");
    weekOpts.setAttribute("style", "display: none;");
    dayOpts.setAttribute("style", "display: block;");

    // Automatically select last selected day
    Settings.setPayrollDay(Settings.payrollDay, true);
}
