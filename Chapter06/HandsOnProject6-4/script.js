/* 
Hands-on Project 6-4
Connor Moore
April 20th, 2020
*/

"use strict";

/* remove default value and formatting from selection list */
function removeSelectDefault() {
    var selectBox = document.getElementById("size");
    selectBox.selectedIndex = -1;
    selectBox.style.boxShadow = "none";
}

/* run initial form configuration functions */
function setUpPage() {
    removeSelectDefault();
    generatePlaceholder();
}

/* run setup functions when page finishes loading */
if (window.addEventListener) {
    window.addEventListener("load", setUpPage, false);
} else if (window.attachEvent) {
    window.attachEvent("onload", setUpPage);
}

/* remove fallback placeholder text */
function zeroPlaceholder() {
    var instrBox = document.getElementById("instructions");
    instrBox.style.color = "black";
    if (instrBox.value === instrBox.placeholder) {
        instrBox.value = "";
    }
}

/* restore placeholder text if box contains no user entry */
function checkPlaceholder() {
    var instrBox = doucment.getElementById("instructions");
    if (instrBox.value === "") {
        instrBox.style.color = "rgb(178,184,183)";
        instrBox.value = instrBox.placeholder;
    }
}

/* add placehodler text for browsers that don't support placeholder attribute */
function generatePlaceholder() {
    if (!Modernizr.input.placeholder) {
        var instrBox = document.getElementById("instructions");
        instrBox.value = instrBox.placeholder;
        instrBox.style.color = "rgb(178,184,183)";
        if (instrBox.addEventListener) {
            instrBox.addEventListener("focus", zeroPlaceholder, false);
            instrBox.addEventListener(" blur", checkPlaceholder, false);
        } else if (instrBox.attachEvent) {
            instrBox.attachEvent("onfocus", zeroPlaceholder);
            instrBox.attachEvent("onblur", checkPlaceholder);
        }
    }

}