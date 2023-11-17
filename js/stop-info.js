/**
 * Whenever we need to expand and display a stop,
 * we need to fromat the information based on its data.
 * 
 * This file includes all such functions. Whatever relevant stop 
 * data is passed as a parameter, and the functions return the
 * corresponding message or HTML.
 */



// HTML Element Variables
const stopDisplayEle = document.getElementById("stop-list");
const searchBoxEle = document.getElementById("search-box");
const onlyFavorites = document.getElementById("only-favorites");
searchBoxEle.addEventListener("input", () => { displayStopList(searchBoxEle.value) });
onlyFavorites.addEventListener("change", () => { displayStopList(searchBoxEle.value) });



/**
 * Given a search key, display all stop names that 
 * match that key to Stops List
 * @param {string} key - User's search query
 */
function displayStopList(key) {
    let results = getSearchResults(key.toLowerCase());

    let resultsHTML = "";
    for (let i=0; i<results.length; i++) {
        resultsHTML += `<div class="stop-ele sl-ee" data-id="${results[i].id}"><h3>${results[i].name}</h3></div>`;
    }

    stopDisplayEle.style.flexDirection = "row";
    stopDisplayEle.innerHTML = (resultsHTML!="") ? resultsHTML : "<h3>No Results Found</h3>";
    
    addExpandEvent("sl-ee");
}



/**
 * This initializes the "stops_list" array with useful JSON for each stop.
 * @param {JSON} data - All stops accoridng to MTD API
 */
function fillStopList(data) {
    for (let i=0; i<data.stops.length; i++) {
        let currStop = data.stops[i];

        // Get group stop
        let stopJSON = {
            "name": currStop.stop_name,
            "id": currStop.stop_id,
            "points": []
        };

        // Get individual stops that are a part of group
        currStop.stop_points.forEach(p => {
            stopJSON.points.push({
                "name": p.stop_name,
                "id": p.stop_id,
                "lat": p.stop_lat,
                "lon": p.stop_lon
            });
        });

        // Push the each group stop to the stops_list array
        stops_list.push(stopJSON);
    }
}



/**
 * Expands a parent stop in "Stops List" to provide more information.
 * Displays all content we currently have first, before making
 * a call to MTD API to ensure that the user does not just stare at
 * a blank screen for (potentially) a few seconds).
 * @param {JSON} stop_id - Parent stop ID
 */
async function expandStop(stop_id) {
    // First ensure that a user is on the Stops List page (in case he/she is on Favorites)
    tabEles[1].click();

    let stop = getStopJSON(stop_id);

    stopDisplayEle.style.flexDirection = "column";
    displayStopContent(stop);
    createMap(stop.points);

    fetch(`${REQ_URL}getdeparturesbystop?key=${API_KEY}&stop_id=${stop.id}&pt=60`)
                .then(response => response.json())
                .then(data => displayArrivals(stop, data.departures));
                // .then(data => dipsplayStopContent(stop, data.departures));

}



/**
 * Given a stop's ID, return its JSON in stops_list array.
 * @param {string} stop_id - Parent stop ID
 * @returns {JSON} The stop's JSON
 */
function getStopJSON(stop_id) {
    for (let i=0; i<stops_list.length; i++) {
        if (stops_list[i].id==stop_id) return stops_list[i];
    }
}



/**
 * Display all the information we currently have on the stop.
 * Information we do not have (iStop, map, arrvials) has to be
 * dealt with in another function.
 * @param {JSON} stop - Parent stop JSON
 */
function displayStopContent(stop) {
    let star_img = (favorites.indexOf(stop.id)!=-1) ? "./img/stars/filled.png" : "./img/stars/empty.png";
    let favorite_img = `<img id="current-star" onclick='toggleFavorite("${stop.id}")' class="favorited-star" src="${star_img}">`;

    let stop_content = `
        <div id="stop-title">
            ${favorite_img}
            <h2>${stop.name}</h2>
            <img id="istop_img" style="display: none;">
            <img id="refresh" src="./img/refresh.png">
        </div>
        <div id="arrivals-display"><h3>LOADING...</h3></div>
        <div id="leaflet-map">
            <div class="leaflet-info">Click on a marker for its stop name</div>
        </div>
    `;
    stopDisplayEle.innerHTML = stop_content;

    document.getElementById("refresh").addEventListener("click", () => { expandStop(stop.id); });
}



/**
 * Create and display an iframe of a map with markers for bus stops.
 * Multiple bus stops are displayed, but are grouped by MTD into one parent stop.
 * e.g. "ISR (North Side)" and "ISR (South Side)" will both have markers on the "ISR" stop.
 * 
 * NOTE: Must be called AFTER the "<div id="leaflet-map"></div>" HTML has been added to the page.
 * @param {array} stop_points - Array of stop points' JSON from a given parent stop.
 */
function createMap(stop_points) {
    const center = getGeoCenter(stop_points);
    let map = L.map('leaflet-map').setView(center, 18);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a target="_blank" href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors',
    }).addTo(map);

    stop_points.forEach(point => {
        L.marker([point.lat, point.lon])
        .bindPopup(point.name)
        .addTo(map);
    });
}



/**
 * Given an array of stop points, find the geographic middle. 
 * This is used for centering the map, as opposed to just 
 * making the ma centered on the first stop point.
 * @param {array} stop_points - Array of stop points' JSON from a given parent stop.
 * @returns {array} An array of length 2.  0 -> latitude, 1 -> longitude.
 */
function getGeoCenter(stop_points) {
    let geo_center = [];
    geo_center.push(0, 0);

    stop_points.forEach(point => {
        geo_center[0] += point.lat;
        geo_center[1] += point.lon;
    });
    return geo_center.map(x => x/stop_points.length);
}