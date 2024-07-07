<template>
    <button class="button" @click="getLocation()">Try It</button>
    <p id="demo"></p>
</template>

<style>
.button {
    background-color: #e7e7e7; 
    color: black;
}
</style>

<script setup>
    const x = document.getElementById("demo");

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else { 
            // x.innerHTML = "Geolocation is not supported by this browser.";
            console.log("Geolocation is not supported by this browser.");
        }
        }

    function showPosition(position) {
    // x.innerHTML = "Latitude: " + position.coords.latitude + 
    // "<br>Longitude: " + position.coords.longitude;
    console.log("Current Latitude: ", position.coords.latitude);
    console.log("Current Longitude: ", position.coords.longitude);
    }
</script>