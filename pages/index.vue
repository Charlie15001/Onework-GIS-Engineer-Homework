<script setup lang="ts">
// The URL on your server where CesiumJS's static files are hosted.
import { Cartesian3, createOsmBuildingsAsync, Math as CesiumMath, ImageryLayer, Ion, OpenStreetMapImageryProvider, Terrain, Viewer } from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";

// const options = {
//   enableHighAccuracy: true,
//   timeout: 5000,
//   maximumAge: 0,
// };

// function success(pos) {
//   const crd = pos.coords;

//   console.log("Your current position is:");
//   console.log(`Latitude : ${crd.latitude}`);
//   console.log(`Longitude: ${crd.longitude}`);
//   console.log(`More or less ${crd.accuracy} meters.`);

//   current_pos.push({
//    lat: crd.latitude, 
//    long: crd.longitude
//   })

// }

// function error(err) {
//   console.warn(`ERROR(${err.code}): ${err.message}`);
// }

// window.onload = function getLocation() {
//     if (navigator.geolocation) {
//         // navigator.geolocation.getCurrentPosition(showPosition);
//         navigator.geolocation.getCurrentPosition(success, error, options);
//     }
// }
</script>

<template>
     <div class="Main">
         <!-- <Header></Header> -->
         <!-- <div class="cesiumViewer">
            <Cesium></Cesium>
         </div> -->

         <!-- <div class="mapboxViewer">
            <Mapbox></Mapbox>
         </div> -->
         <Mapbox></Mapbox>
         <!-- Show user's current location -->
         <!-- <Location/> -->
     </div>
</template>