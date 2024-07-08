<script lang="ts">
import { Cartesian3, createOsmBuildingsAsync, Math as CesiumMath, ImageryLayer, Ion, OpenStreetMapImageryProvider, Terrain, Viewer } from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
import { useCameraState } from '@/composables/useCameraState';

const { cameraState } = useCameraState();

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

   viewer.camera.changed.addEventListener(() => {
      const { longitude, latitude, height } = viewer.camera.positionCartographic
      const heading = CesiumMath.toDegrees(viewer.camera.heading)
      const pitch = CesiumMath.toDegrees(viewer.camera.pitch)
      const roll = CesiumMath.toDegrees(viewer.camera.roll)

      cameraState.lng = CesiumMath.toDegrees(longitude)
      cameraState.lat = CesiumMath.toDegrees(latitude)
      cameraState.height = height
      cameraState.heading = heading
      cameraState.pitch = pitch
      cameraState.roll = roll
   });

   watch(cameraState, (newState) => {
    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(newState.lng, newState.lat, newState.height),
      orientation: {
        heading: CesiumMath.toRadians(newState.heading),
        pitch: CesiumMath.toRadians(newState.pitch),
        roll: CesiumMath.toRadians(newState.roll),
      },
    })
  })

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