/*    JavaScript 6th Edition
 *    Chapter 7
 *    Hands-on Project 7-5

 *    Variables and functions
 *    Author: Connor Moore
 *    Date: Feburary 12th, 2020   

 *    Filename: tuba.js
 */

 "use strict";

 var delivInfo = {};
 var foodInfo = {};
 var delivSummary = document.getElementById("deliverTo");
 var foodSummary = document.getElementById("order");

 function processDeliveryInfo() {
     var prop; 
     delivInfo.name = document.getElementById("nameinput").value;
     delivInfo.addr = document.getElementById("addrinput").value;
     delivInfo.city = document.getElementById("cityinput").value;
     delivInfo.email = document.getElementById("emailinput").value;
     delivInfo.phone = document.getElementById("phoneinput").value;

     
     for (prop in delivInfo) {
         delivSummary.innerHTML += "<p>" + delivInfo[prop] + "</p>";
     }
 }


function previewOrder() {
    processDeliveryInfo()
    processFood()
    document.getElementsByTagName("section")[0].style.display = "block";
    delivSummary.style.display = "block"; 
}


function createEventListener() {
    var submitButton = document.getElementById("previewBtn");
    if (submitButton.addEventListener) {
        submitButton.addEventListener("click", previewOrder, false);
    } else if (submitButton.attachEvent) {
        submitButton.attachEvent("onclick", previewOrder);
    }
}

function processFood() {
    var prop;
    var crustOpt = document.getElementsByName("crust");
    var toppings = 0;
    var toppingBoxes = document.getElementsByName("toppings");
    var instr = document.getElementById("instructions");

    if (crustOpt[0].checked) {
        foodInfo.crust = crustOpt[0].value;
    } else {
        foodInfo.crust = crustOpt[1].value;
    }

    foodInfo.size = document.getElementById("size").value;

    for (i = 0; i < toppingBoxes.length; i++) {
        if (toppingBoxes[i].checked) {
            toppings += 1;
            console.log(foodInfo["topping" + toppings] = toppingBoxes[i].value);
            foodInfo["topping" + toppings] = toppingBoxes[i].value;
        }
    }
    if (instr.value != "") {
        foodInfo.instructions = instr.value;
    }
    // leaves it empty if nothing is input, instead of having text "undefined"
    if (instr.value == "") {
        foodInfo.instructions = "";
    }


    foodSummary.innerHTML += "<p><span>Crust</span>: " + foodInfo.crust + "</p>";
    foodSummary.innerHTML += "<p><span>Size</span>: " + foodInfo.size + "</p>";
    foodSummary.innerHTML += "<p><span>Topping(s)</span>: " + "</p>";
    foodSummary.innerHTML += "<ul>";

    for (var i = 1; i < 6; i++) {
        if (foodInfo["topping" + i]) {
            foodSummary.innerHTML += "<li>" + foodInfo["topping" + i] + "</li>";
        }
    }

    foodSummary.innerHTML += "</ul>";
    foodSummary.innerHTML += "<p><span>Instructions</span>: " + foodInfo.instructions;

    document.getElementById("order").style.display = "block";
}

if (window.addEventListener) {
    window.addEventListener("load", createEventListener, false);
 } else if (window.attachEvent) {
    window.attachEvent("onload", createEventListener);
 }
