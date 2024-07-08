<script lang="ts">
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import bikeData from '~/assets/data/youbike_immediate.json' // Import the JSON file
import jsonData from '~/assets/data/data.json' // Import the JSON file

const mapboxAccessToken = 'pk.eyJ1IjoiY2hhcmxpZTE1MDAxIiwiYSI6ImNseWI2cjY5dTB2Ym0yanF3dWFhM3lzaGgifQ.H-XYHkcUG289Yj0cndv8TA'

console.log(bikeData[0])
console.log(jsonData)

function transformToGeoJSON(data) {
    const geoJSON = {
        type: "FeatureCollection", 
        features: data.map(item => ({
            type: "Feature", 
            geometry: {
                type: "Point", 
                coordinates: [item.longitude, item.latitude]
            }, 
            properties: {
                name: item.sna,
                address: item.ar
            }
        })),
    }
    return geoJSON
}

// // Example usage
// const jsonData2 = [
//   {
//     id: 1,
//     name: "Location A",
//     latitude: 34.0522,
//     longitude: -118.2437
//   },
//   {
//     id: 2,
//     name: "Location B",
//     latitude: 40.7128,
//     longitude: -74.0060
//   }
// ]

const geoJSONData = transformToGeoJSON(bikeData)
// console.log(JSON.stringify(geoJSONData, null, 2))

export default {
    mounted () {
        const map = new mapboxgl.Map({
        accessToken: mapboxAccessToken,
        container: 'map', // container ID
        projection: 'globe', // Display the map as a globe, since satellite-v9 defaults to Mercator
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: 'mapbox://styles/mapbox/streets-v12', // style URL
        center: [-74.5, 40], // starting position
        zoom: 1 // starting zoom
    });
    
    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl());

    map.on('load', () => {

        map.addSource('points', {
            type: 'geojson',
            data: geoJSONData,
            cluster: true
        })

        map.addLayer({
            id: 'points',
            type: 'circle',
            source: 'points',
            paint: {
            'circle-radius': 6,
            'circle-color': '#B42222',
            },
        })
    })
    
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
#map { position: absolute; width: 100%; height: 500px; }
</style>

<template>
    <div id='map'></div>
</template>