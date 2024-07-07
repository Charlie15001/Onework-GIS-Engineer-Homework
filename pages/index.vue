<script setup lang="ts">
// import Alert from '~/components/Alert.vue';
// import Profile from './events/profile.vue';
// The URL on your server where CesiumJS's static files are hosted.
import { Cartesian3, createOsmBuildingsAsync, Math as CesiumMath, ImageryLayer, Ion, OpenStreetMapImageryProvider, Terrain, Viewer } from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";

// Get the current position of the device
navigator.geolocation.getCurrentPosition((position) => {
   console.log(position.coords.latitude, position.coords.longitude);
   const coord_lat = position.coords.latitude;
   const coord_long = position.coords.longitude;
});

</script>

<template>
     <div class="Main">
         <!-- <Header></Header> -->
         <div class="cesiumViewer">
            <Cesium></Cesium>
         </div>

         <div class="mapboxViewer">
            <Mapbox></Mapbox>
         </div>
         
         <!-- Show user's current location -->
         <!-- <Location/> -->
     </div>
</template>