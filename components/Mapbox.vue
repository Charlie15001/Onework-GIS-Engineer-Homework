<script setup lang="ts">
import { Cartesian3, createOsmBuildingsAsync, Math as CesiumMath, ImageryLayer, Ion, OpenStreetMapImageryProvider, Terrain, Viewer } from 'cesium';
import mapboxgl from 'mapbox-gl'
import { useCameraState } from '@/composables/useCameraState'
import { useFetch } from '@vueuse/core'

// Import css
import "cesium/Build/Cesium/Widgets/widgets.css"
import "mapbox-gl/dist/mapbox-gl.css"
// Import the JSON file
import bikeData from '~/assets/data/youbike_immediate.json'
// Import utils
import transformToGeoJSON from '~/utils/transformToGeoJSON'
import { getUserLocation } from '~/utils'

const mapboxAccessToken = 'pk.eyJ1IjoiY2hhcmxpZTE1MDAxIiwiYSI6ImNseWI2cjY5dTB2Ym0yanF3dWFhM3lzaGgifQ.H-XYHkcUG289Yj0cndv8TA'

// create a function to make a directions request
async function getRoute(viewer, start, end) {
  // make a directions request using cycling profile
  // an arbitrary start will always be the same
  // only the end or destination will change
  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxAccessToken}`,
    { method: 'GET' }
  );
  const json = await query.json();
  const data = json.routes[0];
  const route = data.geometry.coordinates;
  const geojson = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: route
    }
  };
  // if the route already exists on the map, we'll reset it using setData
  if (viewer.getSource('route')) {
    viewer.getSource('route').setData(geojson);
  }
  // otherwise, we'll make a new request
  else {
    viewer.addLayer({
      id: 'route',
      type: 'line',
      source: {
        type: 'geojson',
        data: geojson
      },
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3887be',
        'line-width': 5,
        'line-opacity': 0.75
      }
    });
  }
  // add turn instructions here at the end
}

const { cameraState } = useCameraState()

const geoJSONData = transformToGeoJSON(bikeData)

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
         roll: CesiumMath.toDegrees(cameraState.roll)
      }
   });

   viewer.camera.changed.addEventListener(() => {
      const { longitude, latitude, height } = viewer.camera.positionCartographic
      const heading = CesiumMath.toDegrees(viewer.camera.heading)
      const pitch = CesiumMath.toDegrees(viewer.camera.pitch)

      cameraState.lng = CesiumMath.toDegrees(longitude)
      cameraState.lat = CesiumMath.toDegrees(latitude)
      cameraState.height = height
      cameraState.zoom = Math.log2(44330000 / height) // Approximation to convert height to zoom level
      cameraState.heading = heading
      cameraState.pitch = pitch
   });

   watch(cameraState, (newState) => {
    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(newState.lng, newState.lat, newState.height),
      orientation: {
        heading: CesiumMath.toRadians(newState.heading), 
        pitch: CesiumMath.toRadians(newState.pitch), 
      }
    })
  })
}

const initializeMapbox = (lng, lat) => {
  const start_coords = [lng, lat];
  const map = new mapboxgl.Map({
    accessToken: mapboxAccessToken,
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
      bearing: newState.heading,
      pitch: newState.pitch,
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

  // Show bike stations
  map.on('load', () => {
    map.loadImage(
        'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
        (error, image) => {
            if (error) throw error;

            // Add the image to the map style.
            map.addImage('custom-marker', image);

            map.addSource('points', {
            type: 'geojson',
            data: geoJSONData,
            cluster: true
            })

            map.addLayer({
            id: 'points',
            type: 'symbol',
            source: 'points',
            // paint: {
            // 'circle-radius': 6,
            // 'circle-color': '#B42222',
            // },
            layout: {
                'icon-image': 'custom-marker', 
                'icon-size': 0.5, 
                // get the station name from the source's "name" property
                'text-field': ['get', 'name_en'], 
                'text-font': [
                    'Open Sans Semibold',
                    'Arial Unicode MS Bold'
                ],
                'text-offset': [0, 1.25],
                'text-anchor': 'top', 
                'text-size': 12
            }
          })
        }
    )
    // make an initial directions request that
    // starts and ends at the same location
    getRoute(map, start_coords, start_coords);

    // Add starting point to the map
    map.addLayer({
      id: 'point',
      type: 'circle',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: start_coords
              }
            }
          ]
        }
      },
      paint: {
        'circle-radius': 10,
        'circle-color': '#3887be'
      }
    });
    // this is where the code from the next step will go
  })

  map.on('click', (event) => {
    const coords = Object.keys(event.lngLat).map((key) => event.lngLat[key]);
    const end = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: coords
          }
        }
      ]
    };
    if (map.getLayer('end')) {
      map.getSource('end').setData(end);
    } else {
      map.addLayer({
        id: 'end',
        type: 'circle',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: coords
                }
              }
            ]
          }
        },
        paint: {
          'circle-radius': 10,
          'circle-color': '#f30'
        }
      });
    }
    getRoute(map, start_coords, coords);
    console.log('Start point: ', start_coords)
    console.log('End point: ', coords)
  });

  var popup = new mapboxgl.Popup()
    .setHTML('<h1>Current Position</h1>')
    .addTo(map);

  // Create a default Marker and add it to the map.
  const marker1 = new mapboxgl.Marker()
    .setLngLat([lng, lat])
    .addTo(map)
    .setPopup(popup);

}

onMounted(async () => {
  try {
    const { lng, lat } = await getUserLocation()
    initializeMapbox(lng, lat)
    initializeCesium(lng, lat)

    const { data: jsonData, isFetching, error } = useFetch('assets/data/youbike_immediate.json')

    if (isFetching.value) return

    if (error.value) {
      console.error('Failed to load JSON data:', error.value)
      return
    }

    const data = jsonData.value
    console.log(data);

  } catch (error) {
    console.error('Error getting user location:', error)
    const defaultLng = -74.5
    const defaultLat = 40
    initializeMapbox(defaultLng, defaultLat)
    initializeCesium(defaultLng, defaultLat)
  }
})
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