
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
