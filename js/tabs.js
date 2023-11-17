// HTML Element Variables
const displayEles = document.getElementsByClassName("displays");
const tabEles = document.getElementsByTagName("li");

// Add event listener to each navbar element.
for (let i=0; i<tabEles.length; i++) {
    tabEles[i].addEventListener("click", () => { changeDisplay(tabEles[i]); });
}



/**
 * When user clicks on a tab, change the display accoridngly.
 * @param {DOM Element Object} activateTab - Tab that the user clicked on navbar
 */
function changeDisplay(activateTab) {
    // No matter what, change "Stops List" display from specific stop to all stops
    if (stops_list.length!=0) displayStopList("");
    document.getElementById("search-box").value = "";

    // Change "active" tab to clicked nav element, remove "active" from all others.
    for (let i=0; i<tabEles.length; i++) tabEles[i].classList.remove("active");
    activateTab.classList.add("active");

    // Display the clicked nav element's contents, and hide all others.
    for (let i=0; i<displayEles.length; i++) displayEles[i].style.display = "none";
    let targetDisplay = `${activateTab.id}-display`;
    document.getElementById(targetDisplay).style.display = "block";
}