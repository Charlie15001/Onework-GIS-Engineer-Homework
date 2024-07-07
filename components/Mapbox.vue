<script setup lang="ts">
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";

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

const location = getUserLocation();
location.then(function(result) {
    return result
})

onMounted(()=>{
    const map = new mapboxgl.Map({
        accessToken: 'pk.eyJ1IjoiY2hhcmxpZTE1MDAxIiwiYSI6ImNseWI2cjY5dTB2Ym0yanF3dWFhM3lzaGgifQ.H-XYHkcUG289Yj0cndv8TA',
        container: 'map', // container ID
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: 'mapbox://styles/mapbox/streets-v12', // style URL
        center: [-74.5, 40], // starting position
        zoom: 9 // starting zoom
    });
    
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

    // Create a default Marker and add it to the map.
    const marker1 = new mapboxgl.Marker()
        .setLngLat([12.554729, 55.70651])
        .addTo(map);
})
</script>

<style scoped>
.mapboxViewer {
    width: 100%;
    height: 400px
}
</style>

<template>
    <div class="mapboxViewer" id='map'></div>
</template>