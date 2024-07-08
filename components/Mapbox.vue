<script setup lang="ts">
import { Cartesian3, createOsmBuildingsAsync, Math as CesiumMath, ImageryLayer, Ion, OpenStreetMapImageryProvider, Terrain, Viewer } from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";

import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import { useCameraState } from '@/composables/useCameraState'

const { cameraState } = useCameraState()

const initializeCesium = (lng, lat) => {
  Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjYmQ3ZmRmOC0xMWY1LTRjMjEtYTcxZS1lMjMyM2IyYzcwNDUiLCJpZCI6MjI2Mzk2LCJpYXQiOjE3MjAwODYwMjF9.EHL6IlDKMLngNDqCMHTarf0nZPOCp_Jp3KHWskMK3NA'
  // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
  const viewer = new Viewer("cesiumContainer", {
      terrain: Terrain.fromWorldTerrain(),
    });
  // Fly the camera to San Francisco at the given longitude, latitude, and height.
  viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(lng, lat, 400),
      orientation: {
         heading: CesiumMath.toRadians(cameraState.heading),
         pitch: CesiumMath.toRadians(cameraState.pitch),
      }
   });

   viewer.camera.changed.addEventListener(() => {
      const { longitude, latitude, height } = viewer.camera.positionCartographic

      cameraState.lng = CesiumMath.toDegrees(longitude)
      cameraState.lat = CesiumMath.toDegrees(latitude)
      cameraState.height = height
      cameraState.zoom = Math.log2(44330000 / height) // Approximation to convert height to zoom level
   });

   watch(cameraState, (newState) => {
    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(newState.lng, newState.lat, newState.height),
    })
  })
}

const initializeMapbox = (lng, lat) => {
  const map = new mapboxgl.Map({
    accessToken: 'pk.eyJ1IjoiY2hhcmxpZTE1MDAxIiwiYSI6ImNseWI2cjY5dTB2Ym0yanF3dWFhM3lzaGgifQ.H-XYHkcUG289Yj0cndv8TA',
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [lng, lat],
    bearing: cameraState.heading,
    pitch: cameraState.pitch,
    zoom: cameraState.zoom,
  });

  map.on('moveend', () => {
    const center = map.getCenter()
    const zoom = map.getZoom()
    const bearing = map.getBearing()
    const pitch = map.getPitch()

    cameraState.lng = center.lng
    cameraState.lat = center.lat
    cameraState.zoom = zoom
    cameraState.height = 44330000 / Math.pow(2, zoom) // Approximation to convert zoom level to height
    cameraState.heading = bearing
    cameraState.pitch = pitch
    // Note: Mapbox does not support roll
  })

  watch(cameraState, (newState) => {
    map.jumpTo({
      center: [newState.lng, newState.lat],
      zoom: newState.zoom,
    })
  })

  // Add zoom and rotation controls to the map.
  map.addControl(new mapboxgl.NavigationControl());
  // Add geolocate control to the map.
  map.addControl(
      new mapboxgl.GeolocateControl({
          positionOptions: {
              enableHighAccuracy: true
          },
          // When active the map will receive updates to the device's location as it changes.
          trackUserLocation: true,
          // Draw an arrow next to the location dot to indicate which direction the device is heading.
          showUserHeading: true
      })
  );

  var popup = new mapboxgl.Popup()
    .setHTML('<h1>Current Position</h1>')
    .addTo(map);

  // Create a default Marker and add it to the map.
  const marker1 = new mapboxgl.Marker()
    .setLngLat([lng, lat])
    .addTo(map)
    .setPopup(popup);

}

const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lng = position.coords.longitude
        const lat = position.coords.latitude
        resolve({ lng, lat })
      },
      (error) => {
        reject(error)
      }
    )
  })
}

onMounted(async () => {
  try {
    const { lng, lat } = await getUserLocation()
    initializeMapbox(lng, lat)
    initializeCesium(lng, lat)
  } catch (error) {
    console.error('Error getting user location:', error)
    const defaultLng = -74.5
    const defaultLat = 40
    initializeMapbox(defaultLng, defaultLat)
    initializeCesium(defaultLng, defaultLat)
  }
})

// onMounted(()=>{
//     const map = new mapboxgl.Map({
//         accessToken: 'pk.eyJ1IjoiY2hhcmxpZTE1MDAxIiwiYSI6ImNseWI2cjY5dTB2Ym0yanF3dWFhM3lzaGgifQ.H-XYHkcUG289Yj0cndv8TA',
//         container: 'map', // container ID
//         // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
//         style: 'mapbox://styles/mapbox/streets-v12', // style URL
//         center: [-74.5, 40], // starting position
//         zoom: 9 // starting zoom
//     });
// })
</script>

<style scoped>
.cesiumViewer {
    width: 50%;
    float: left;
    border: 1px;
}
.mapboxViewer {
    width: 50%;
    height: 100%;
    float: right;
    border: 1px;
}
.container {
  width: 100%;
  height: 400px;
}
</style>

<template>
    <div class="cesiumViewer">
      <h1>Cesium Viewer</h1>
      <div class="container" id="cesiumContainer"></div>
    </div>
    <div class="mapboxViewer">
      <h1>Mapbox Viewer</h1>
      <div class="container" id='map'></div>
    </div>
</template>