// Conversion from feet to meters
const ftTOm = 0.3048;

// HTML Element Variables
const nearbyDisplayEle = document.getElementById("nearby-list");


/**
 * Ask user for current location. If success, display nearby stops. 
 * If refusal/error, display error message
 */
function getPosition() {
    nearbyDisplayEle.innerHTML = `<h3>LOADING...</h3>`;
    navigator.geolocation.getCurrentPosition(getNearby, (err) => {
        nearbyDisplayEle.style.flexDirection = "column";
        nearbyDisplayEle.style.alignContent = "center";
        nearbyDisplayEle.innerHTML = `
            <h3>Could not get location. Error: ${err.message}.</h3>
            <h3>Please refresh.</h3>
        `;
    });
}



/**
 * Prepares the page to display nearby stops
 * @param {JSON} pos - User's position
 */
function getNearby(pos) {
    nearbyDisplayEle.style.flexDirection = "row";
    nearbyDisplayEle.style.alignContent = "flex-start";

    fetch(`${REQ_URL}getstopsbylatlon?key=${API_KEY}&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
        .then((response) => response.json())
        .then((data) => displayNearby(data.stops));
}



/**
 * Display all nearby stops
 * @param {array} nearby_stops - Array of nearby stops' JSON
 */
function displayNearby(nearby_stops) {
    stopsHTML = ``;
    for (let i=0; i<nearby_stops.length; i++) {
        let curr = nearby_stops[i];
        stopsHTML += `<div class="stop-ele n-ee" data-id="${curr.stop_id}"><h3>${curr.stop_name} ${displayDistance(curr.distance)}</h3></div>`;
    }
    nearbyDisplayEle.innerHTML = stopsHTML;

    addExpandEvent("n-ee");
}



/**
 * Display user's distance from a bus stop.
 * @param {int} dist - How far away the users is from a particular stop (in feet)
 * @returns {string} Properly displayed distance away from stop (in meters)
 */
function displayDistance(dist) {
    let dist_m = Math.round(dist * ftTOm);
    if (dist_m >= 1000) return `(${dist_m/1000}km)`;
    return `(${dist_m}m)`;
}