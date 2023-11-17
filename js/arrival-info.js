/**
 * Whenever we need to display the buses that are coming soon, 
 * we need to get information specific to each bus and its arrival. The information
 * is placed on each bus' arrival card.
 * 
 * This file includes all such functions. Whatever relevant bus 
 * data is passed as a parameter, and the functions return the
 * corresponding message or HTML.
 */



/**
 * Creates and outputs all bus arrivals for a given stop.
 * NOTE: Must be called AFTER arrivals-display is present on the page.
 * @param {JSON} stop - Group stop
 * @param {array} deps - All incoming departures from a stop
 */
function displayArrivals(stop, deps) {
    const arrivalsDisplayEle = document.getElementById("arrivals-display");
    
    let allArrivalsHTML = ``;

    for (let i=0; i<deps.length; i++) {

        // Find out which point this departure is going to/from
        let point;
        stop.points.forEach(s => {
            if (deps[i].stop_id==s.id) point = s;
        });

        allArrivalsHTML += `${getArrivalHTML(point, deps[i])}`;
    }
    
    arrivalsDisplayEle.innerHTML = (allArrivalsHTML!=``) ? allArrivalsHTML : "<h2>No departures in the next 60 minutes</h2>";

    showIStop(deps);
}



/**
 * Given a stop and a departure from that stop, 
 * @param {JSON} stop - Point stop JSON, not to be confused with parent stop
 * @param {JSON} dep - Point departure JSON
 * @returns {string} The HTML for the corresponding arrival
 */
function getArrivalHTML(stop, dep) {
    let nameHTML = `<span>${geHeadsignAndDir(dep)}</span>`;

    let specificStop = `<span><h4 style="font-weight: 200;">${stop.name}</h4></span>`;

    let timeHTML = `<span>${getArrivalTimeText(dep.expected_mins)} ${getTime(dep.expected, dep.expected_mins)}</span>`;

    let distance = parseInt(getSLD(dep.location.lat,
                                    dep.location.lon,
                                    stop.lat,
                                    stop.lon));
    let distanceHTML = `<span>${getBusDistance(dep.expected_mins, distance)} <h4 style="font-weight: 200;">away</h4></span>`;

    return `
        <div class="arrival" style="background-color: #${dep.route.route_color};"><div class="arrival-content">
            <div>${nameHTML} ${specificStop}</div>
            <div>${timeHTML} ${distanceHTML}</div>
        </div></div>
    `;


}



/**
 * Get formatted bus name and destination
 * @param {JSON} dep - Specific departure JSON
 * @returns {string} The HTML for displaying the bus route name and destination
 */
function geHeadsignAndDir(dep) {
    return `<h3 style="font-weight: 700;">${dep.headsign}</h3> <i><h5 style="font-weight: 200;"> to ${dep.trip.trip_headsign}</h5></i>`;
}



/**
 * Get the proper text for arrival time.
 * @param {int} exp_min - Amount of minutes the bus will arrive in, according to MTD API
 * @returns {string} The text for arrival time
 */
function getArrivalTimeText(exp_min) {
    let returnHTML = `<h4 style="color: ${getArrivalTextColor(exp_min)}">`;

    if (exp_min == 0) returnHTML += "due!</h4>";
    else if (exp_min == 1) returnHTML += "1 min!</h4>";
    else returnHTML += `${exp_min} mins</h4>`;

    return returnHTML;
}



/**
 * Get the proper text color for arrival time.
 * @param {int} exp_min - Amount of minutes the bus will arrive in, according to MTD API
 * @returns {string} The text color (HEX code) for arrival time (red, orange, green, black for 2, 5, 10, 10+ minutes respectively)
 */
function getArrivalTextColor(exp_min) {
    if (exp_min <= 2) return "#fe0000";
    else if (exp_min <= 5) return "#fe8800";
    else if (exp_min <= 10) return "#008800";
    return "#000000";
}



/**
 * Get the properly formatted time at which the bus will arrive at a stop
 * @param {Time} exp - Time the bus will arrive at (not to be confused with minutes until arrival) according to the MTD API
 * @param {Time} exp_min - Amount of minutes the bus will arrive in, according to MTD API
 * @returns {string} The string representation of the time that the bus will arrive at
 */
function getTime(exp, exp_min) {
    if (exp_min==0) return ``;

    const arrivalTime = new Date(exp);

    let hours = arrivalTime.getHours();
    let arrivalHours = (hours < 10) ? `0${hours}` : `${hours}`;
    let minutes = arrivalTime.getMinutes();
    let arrivalMinutes = (minutes < 10) ? `0${minutes}` : `${minutes}`;

    return `<h4 style="font-weight: 300;">(${arrivalHours}:${arrivalMinutes})</h4>`;
}



/**
 * Get the bus distance message
 * @param {int} exp_min - Amount of minutes the bus will arrive in, according to MTD API
 * @param {int} dist - How far away the bus is (in meters) form the stop, according to MTD API
 * @returns {string} The calculated bus distance message
 */
function getBusDistance(exp_min, dist) {
    if (exp_min >= 15) return "<h4>-</h4>";
    // else if (dist > 1000) return `<h4>${parseInt(dist/100) / 10}km</h4>`;
    else if (dist >= 1000) return `<h4>${dist/1000}km</h4>`;
    return `<h4>${dist}m</h4>`;
}



/**
 * Calculates the distance between two lat/long coordinates
 * @param {double} lat1 - Origin latitude
 * @param {double} lon1 - Origin longitude
 * @param {double} lat2 - Destination latitude
 * @param {double} lon2 - Destination longitude
 * @returns {double} The calculated straight-line distance between the points
 */
function getSLD(lat1, lon1, lat2, lon2) {
	// Use the haversine formula to calculate the straight-line distance
	// where "phi" is latitude, "lambda" is longitude, "radius" is earth’s radius (mean radius = 6,371km).
	// NOTE: Angles need to be in radians to pass to trig functions!
	// Adapted from https://www.movable-type.co.uk/scripts/latlong.html
	const radius = 6371000
	const phi1 = lat1 * Math.PI/180
	const phi2 = lat2 * Math.PI/180
	const delta_phi = (lat2-lat1) * Math.PI/180
	const delta_lambda = (lon2-lon1) * Math.PI/180

	const alpha = Math.sin(delta_phi/2) * Math.sin(delta_phi/2) +
						Math.cos(phi1) * Math.cos(phi2) *
						Math.sin(delta_lambda/2) * Math.sin(delta_lambda/2)

	// c = 2 ⋅ atan2( √a, √(1−a) )
	// d = radius ⋅ c (result in metres)
	return radius * 2 * Math.atan2(Math.sqrt(alpha), Math.sqrt(1-alpha))
}



/**
 * Given a list of departures, see if the stop is an iStop. If
 * so, display the iStop icon.
 * 
 * NOTE: Unfortuanately, this is the only way to see if a stop is an
 * iStop. Theoretically, if there are no incoming buses for the next 60
 * minutes, it would be impossible to tell if the stop is an iStop. I have
 * emailed MTD Developer team about this issue, and they have said 
 * that their new version of the API will include "is_istop" in the 
 * GetStops call. This version has not been released yet.
 * @param {array} deps - All incoming departures from a stop
 */
function showIStop(deps) {
    if (deps.length!=0 && deps[0].is_istop) {
        document.getElementById("istop_img").style.display = "block";
        document.getElementById("istop_img").src = "./img/istop.png";
    }
}