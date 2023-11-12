
function fadeMonth() {
    const monthElem = document.getElementById("month");
    const animationClass = "fade-in";
    const childElem = monthElem.children[1];

    // Remove the animation class if it exists
    childElem.classList.remove(animationClass);

    // Trigger a reflow (force the browser to recalculate styles) before adding the class again
    void childElem.offsetWidth;

    // Add the animation class
    childElem.classList.add(animationClass);

    // Listen for the animation end event
    const onAnimationEnd = () => {
        // Remove the animation class once the animation ends
        childElem.classList.remove(animationClass);

        // Remove the event listener to avoid memory leaks
        childElem.removeEventListener("animationend", onAnimationEnd);
    };

    // Attach the event listener to reset the animation when it ends
    childElem.addEventListener("animationend", onAnimationEnd);
}

