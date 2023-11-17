let stops_list = [];

/**
 * The favorites array is filled with all favorited stops from localStorage. 
 * Both localStorage and the favorites array will be updated in tandem when 
 * a user changes their favorites. The favorites array is used for convenience. 
 * User's are only allowed to favorite parent stops.
 */
let favorites = [];




/**
 * Given a search key, return an array of stops' JSON 
 * that match the given key.
 * @param {string} key - User's search query
 * @returns {array} All stops that include "key"
 */
function getSearchResults(key) {
    let results = [];
    for (let i=0; i<stops_list.length; i++) {
        let curr_stop = stops_list[i];
        if (curr_stop.name.toLowerCase().includes(key)) {
            // If "Only Show Favorites" is not checked   OR   (It is checked  AND  the stop is a favorited stop)
            if (!onlyFavorites.checked || (onlyFavorites.checked && favorites.indexOf(curr_stop.id)!=-1)) results.push(curr_stop);
        }
    }
    return results;
}



/**
 * Gets and displays all favorited stops.
 * NOTE: This does not change the user's current view. 
 * This only fills the favorites part, even if it has "display: none;"
 */
const favoritesDisplayEle = document.getElementById("favorited-list");
function displayFavorites() {
    let resultsHTML = "";
    for (let i=0; i<stops_list.length; i++) {
        let curr = stops_list[i];
        if (favorites.indexOf(curr.id)!=-1) {
            resultsHTML += `<div class="stop-ele f-ee" data-id="${curr.id}"><h3>${curr.name}</h3></div>`;
        }
    }

    favoritesDisplayEle.innerHTML = (resultsHTML!="") ? resultsHTML : "<h3>To favorite a stop, click a stop in Stops List and press the star icon.</h3>";

    addExpandEvent("f-ee");
}



/**
 * Adds an "expandStop" event listener for when a user clicks a stop element
 * @param {string} - An extra class just for identifying which stops to add 
 * an event listener to. This is needed because if not, event listener will be added 
 * to stops on other pages. This problem gets exponentially worse as the user keeps 
 * navigating around. This solution ensures there is only ever one event listener per stop.
 */
function addExpandEvent(identifier) {
    document.querySelectorAll(`.stop-ele.${identifier}`).forEach((ele) => {
        ele.addEventListener("click", () => { expandStop(ele.getAttribute("data-id")); });
    });
}



/**
 * Toggle a stop's favorite status.
 * @param {string} stop_id - Stop ID of stop being toggled
 */
function toggleFavorite(stop_id) {
    let star = document.getElementById("current-star");
    if (favorites.indexOf(stop_id)!=-1) {
        star.src = "./img/stars/empty.png";
        favorites.splice(favorites.indexOf(stop_id), 1);
    } else {
        star.src = "./img/stars/filled.png";
        favorites.push(stop_id);
    }

    localStorage.setItem("uiuc-bus-favorites", JSON.stringify({"list": favorites}));
    displayFavorites();
}






/**
 * Initalize the favorites array, and ensure that a localStorage 
 * favorited array exists. If it doesn't, make one.
 */
function fillFavorites() {
    let user_faves = localStorage.getItem("uiuc-bus-favorites");
    if (!user_faves) localStorage.setItem("uiuc-bus-favorites", JSON.stringify({"list": []}));
    else favorites = JSON.parse(user_faves).list;
}



/**
 * Requests data only once to fill "stops_list" with the current MTD stops.
 * Ensures that all pages are properly set up.
 */
async function setUp() {
    fillFavorites();


    // Display "Home" when the page loads.
    tabEles[0].click();

    await fetch(`${REQ_URL}getstops?key=${API_KEY}`)
        .then(res => res.json())
        .then(data => fillStopList(data));


    displayStopList("");
    displayFavorites();
    displayPlannerStopSections(startResultsEle, "");
    displayPlannerStopSections(endResultsEle, "");
}
setUp();