<script lang="ts">
import { Cartesian3, createOsmBuildingsAsync, Math as CesiumMath, ImageryLayer, Ion, OpenStreetMapImageryProvider, Terrain, Viewer } from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";

export default {
  mounted() {
    Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjYmQ3ZmRmOC0xMWY1LTRjMjEtYTcxZS1lMjMyM2IyYzcwNDUiLCJpZCI6MjI2Mzk2LCJpYXQiOjE3MjAwODYwMjF9.EHL6IlDKMLngNDqCMHTarf0nZPOCp_Jp3KHWskMK3NA'

   // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
   const viewer = new Viewer("cesiumContainer", {
      terrain: Terrain.fromWorldTerrain(),
      // baseLayerPicker: false,
      // animation: true,
      // shouldAnimate: true,
      // baseLayer: new ImageryLayer(new OpenStreetMapImageryProvider({
      //   url: "https://tile.openstreetmap.org/"
      // })),
   });

   // Fly the camera to San Francisco at the given longitude, latitude, and height.
   viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(-74.5, 40, 400),
      orientation: {
         heading: CesiumMath.toRadians(0.0),
         pitch: CesiumMath.toRadians(-15.0),
      }
   });

   viewer.camera.changed.addEventListener(function() {
    var deg = Math.round(CesiumMath.toDegrees(viewer.camera.heading))
    console.log('Heading: ', deg)
    var deg = Math.round(CesiumMath.toDegrees(viewer.camera.pitch))
    console.log('Pitch: ', deg)
   });

  }
}
</script>

<style scoped>
.cesiumViewer {
    width: 100%;
    height: 400px
}
</style>

<template>
    <div class="cesiumViewer" id="cesiumContainer"></div>
</template>