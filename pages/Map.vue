<script lang="ts">
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";

export default {
    mounted () {
        const map = new mapboxgl.Map({
        accessToken: 'pk.eyJ1IjoiY2hhcmxpZTE1MDAxIiwiYSI6ImNseWI2cjY5dTB2Ym0yanF3dWFhM3lzaGgifQ.H-XYHkcUG289Yj0cndv8TA',
        container: 'map', // container ID
        projection: 'globe', // Display the map as a globe, since satellite-v9 defaults to Mercator
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: 'mapbox://styles/mapbox/streets-v12', // style URL
        center: [-74.5, 40], // starting position
        zoom: 1 // starting zoom
    });
    
    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl());
    }
};
// Mounted(()=>{
//     const map = new mapboxgl.Map({
//         accessToken: 'pk.eyJ1IjoiY2hhcmxpZTE1MDAxIiwiYSI6ImNseWI2cjY5dTB2Ym0yanF3dWFhM3lzaGgifQ.H-XYHkcUG289Yj0cndv8TA',
//         container: 'map', // container ID
//         projection: 'globe', // Display the map as a globe, since satellite-v9 defaults to Mercator
//         // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
//         style: 'mapbox://styles/mapbox/streets-v12', // style URL
//         center: [-74.5, 40], // starting position
//         zoom: 1 // starting zoom
//     });
    
//     // Add zoom and rotation controls to the map.
//     map.addControl(new mapboxgl.NavigationControl());
// })
</script>

<style>
body { margin: 0; padding: 0; }
#map { position: absolute; width: 100%; height: 300px; }
</style>

<template>
    <div id='map'></div>
</template>


<!-- <template>
    <div class="mapboxViewer" id="mapboxContainer">
        <MapboxMap
            map-id=""
            :options="{
            style: 'mapbox://styles/mapbox/light-v11', // style URL
            center: [-68.137343, 45.137451], // starting position
            zoom: 5 // starting zoom
            }"
        />
    </div>
</template> -->

<!-- <script setup>
    import mapboxgl from 'mapbox-gl';

    onMounted(() => {
        createMap();
    })

    function createMap() {
        const map = new mapboxgl.Map({
            container: 'map', // container ID
            // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
            style: 'mapbox://styles/mapbox/streets-v12', // style URL
            center: [-74.5, 40], // starting position
            zoom: 9 // starting zoom
        })

        // Add zoom and rotation controls to the map.
        map.addControl(new mapboxgl.NavigationControl());
    }
</script> -->