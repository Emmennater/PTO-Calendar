// Function to store an item in local storage
function storeItem(key, value) {
    // Convert the value to a JSON string before storing
    const serializedValue = JSON.stringify(value);

    // Use the localStorage API to store the item
    localStorage.setItem(key, serializedValue);
}

// Function to retrieve an item from local storage
function getItem(key) {
    // Use the localStorage API to retrieve the item
    const serializedValue = localStorage.getItem(key);

    // If the item is not found, return null
    if (serializedValue === null) {
        return null;
    }

    // Parse the JSON string to get the original value
    const value = JSON.parse(serializedValue);

    return value;
}

function rnd(n, d) {
    const precision = 10 ** d;
    return Math.round(n * precision) / precision;
}

function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        // console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}

function copyTextToClipboard(text, notif = false) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function () {
        // console.log('Async: Copying to clipboard was successful!');
        if (notif) Notification.show("Copied to Clipboard!");
    }, function (err) {
        console.error('Async: Could not copy text: ', err);
        alert('Could not copy text: ', err);
    });
}

async function pasteTextFromClipboard(input, notif = false) {
    const text = await navigator.clipboard.readText();
    input.value = text;
    if (notif) Notification.show("Pasted!");
}
