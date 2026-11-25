// Location developer: geolocation, 2 minute update and error messages

// we get the session ID from the local storage, which was set when the player logged in
const locationSessionID = localStorage.getItem("session");

// The location is sent every 2 minutes (in milliseconds)
const UPDATE_TIME = 2 * 60 * 1000;

// Get the HTML element that shows the location messages
const locationElement =
    document.getElementById("locationMessage");

// Show a message to the player (red for errors, green when everything is fine)
function showLocationMessage(message, isError) {

    if (!locationElement) {
        return;
    }

    locationElement.textContent = message;

    if (isError) {
        locationElement.style.color = "red";
    } else {
        locationElement.style.color = "green";
    }
}

// Send the player's location to the API
async function sendLocation(latitude, longitude) {

    try {


        const LOCATION_URL =
            "https://codecyprus.org/th/api/location?session=" +
            encodeURIComponent(locationSessionID) +
            "&latitude=" +
            latitude +
            "&longitude=" +
            longitude;

        const response = await fetch(LOCATION_URL);
        const data = await response.json();

        if (data.status === "OK") {

            // Print the location on the console for debugging
            console.log("Location sent: " + latitude + ", " + longitude);

            const time = new Date().toLocaleTimeString();

            showLocationMessage(
                "Location updated at " + time,
                false
            );

        } else {

            showLocationMessage(
                "Unable to update your location.",
                true
            );

            console.error(data.errorMessages);
        }

    } catch (error) {

        showLocationMessage(
            "Could not reach the server. Check your internet connection.",
            true
        );

        console.error(error);
    }
}

// Runs when the browser finds the location
function locationFound(position) {

    sendLocation(
        position.coords.latitude,
        position.coords.longitude
    );
}

// Runs when the browser cannot find the location (each error has its own message)
function locationError(error) {

    if (error.code === error.PERMISSION_DENIED) {

        showLocationMessage(
            "Location permission was denied. Please allow location in your browser settings.",
            true
        );

    } else if (error.code === error.POSITION_UNAVAILABLE) {

        showLocationMessage(
            "Your position is not available right now. Check your GPS or signal.",
            true
        );

    } else if (error.code === error.TIMEOUT) {

        showLocationMessage(
            "Finding your location took too long. It will try again in 2 minutes.",
            true
        );

    } else {

        showLocationMessage(
            "Something went wrong while finding your location.",
            true
        );
    }
}

// Ask the browser for the current position
function getLocation() {

    if (!navigator.geolocation) {
        showLocationMessage(
            "Your browser does not support location.",
            true
        );
        return;
    }

    navigator.geolocation.getCurrentPosition(
        locationFound,
        locationError,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

// Start the location updates (send now, then every 2 minutes)

let locationIntervalID = null;

function stopLocationUpdates() {
    if (locationIntervalID !== null) {
        clearInterval(locationIntervalID);
        locationIntervalID = null;
    }

}

if (locationSessionID) {
    getLocation();
    locationIntervalID = setInterval(getLocation, UPDATE_TIME);
}
// Send a fresh location straight away, used just before an answer is submitted

function sendLocationNow(){
    return new Promise(function(resolve, reject) {
        if (!navigator.geolocation) {
            showLocationMessage(
                        "your browser does not support location.",
                true

            );
            resolve();
            return;

        }
        navigator.geolocation.getCurrentPosition(
            async function (position) {
                await sendLocation(
                    position.coords.latitude,
                    position.coords.longitude
                );
                resolve();
            },
            function (error) {
                locationError(error);
                resolve();
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );


    });

}