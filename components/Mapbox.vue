<script setup lang="ts">
import { Cartesian3, createOsmBuildingsAsync, Math as CesiumMath, ImageryLayer, Ion, OpenStreetMapImageryProvider, Terrain, Viewer } from 'cesium';
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import { point, nearestPoint } from '@turf/turf'
import { useCameraState } from '@/composables/useCameraState'
import { useCurrentLocation } from '~/composables/useCoordinates';
import { useFetch } from '@vueuse/core'

// Import css
import "cesium/Build/Cesium/Widgets/widgets.css"
import "mapbox-gl/dist/mapbox-gl.css"
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
// Import the JSON file
import bikeData from '~/assets/data/youbike_immediate.json'
// Import utils
import transformToGeoJSON from '~/utils/transformToGeoJSON'
import { getUserLocation } from '~/utils'

const mapboxAccessToken = 'pk.eyJ1IjoiY2hhcmxpZTE1MDAxIiwiYSI6ImNseWI2cjY5dTB2Ym0yanF3dWFhM3lzaGgifQ.H-XYHkcUG289Yj0cndv8TA'

// ref(null) creates a reactive reference with an initial value of null, 
// which is a reactive reference that you can use to store a value or a DOM element.
const geocoderContainer = ref(null)
const destination = ref(null)

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
const { currentLocation } = useCurrentLocation()

const geoJSONData = transformToGeoJSON(bikeData)
// console.log(geoJSONData)

const naviButton = ref(null)

const startNavi = () => {
  console.log('Button was clicked!')
  // Additional logic for the button click event
}

// Access the button element after the component has been mounted
onMounted(() => {
  if (naviButton.value) {
    // Example of setting an attribute directly
    naviButton.value.setAttribute('data-custom-attr', 'exampleValue')
    
    // Example of adding an event listener
    naviButton.value.addEventListener('mouseover', () => {
      console.log('Mouse is over the button!')
    })

    naviButton.value.addEventListener('click', () => {
      console.log('Button was clicked!')
    })
  }
})

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

  const size = 200;

  // This implements `StyleImageInterface`
  // to draw a pulsing dot icon on the map.
  const pulsingDot = {
      width: size,
      height: size,
      data: new Uint8Array(size * size * 4),

      // When the layer is added to the map,
      // get the rendering context for the map canvas.
      onAdd: function () {
          const canvas = document.createElement('canvas');
          canvas.width = this.width;
          canvas.height = this.height;
          this.context = canvas.getContext('2d');
      },

      // Call once before every frame where the icon will be used.
      render: function () {
          const duration = 1000;
          const t = (performance.now() % duration) / duration;

          const radius = (size / 2) * 0.3;
          const outerRadius = (size / 2) * 0.7 * t + radius;
          const context = this.context;

          // Draw the outer circle.
          context.clearRect(0, 0, this.width, this.height);
          context.beginPath();
          context.arc(
              this.width / 2,
              this.height / 2,
              outerRadius,
              0,
              Math.PI * 2
          );
          context.fillStyle = `rgba(255, 200, 200, ${1 - t})`;
          context.fill();

          // Draw the inner circle.
          context.beginPath();
          context.arc(
              this.width / 2,
              this.height / 2,
              radius,
              0,
              Math.PI * 2
          );
          context.fillStyle = 'rgba(255, 100, 100, 1)';
          context.strokeStyle = 'white';
          context.lineWidth = 2 + 4 * (1 - t);
          context.fill();
          context.stroke();

          // Update this image's data with data from the canvas.
          this.data = context.getImageData(
              0,
              0,
              this.width,
              this.height
          ).data;

          // Continuously repaint the map, resulting
          // in the smooth animation of the dot.
          map.triggerRepaint();

          // Return `true` to let the map know that the image was updated.
          return true;
      }
  };

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
  // Add the control to the map.
  const geocoder = new MapboxGeocoder({
        accessToken: mapboxAccessToken,
        mapboxgl: mapboxgl, 
        marker: true, // Add marker on geocode result
        placeholder: 'Search for places', // Placeholder text in the search bar
    });

  // Add the geocoder to the geocoderContainer
  geocoderContainer.value.appendChild(geocoder.onAdd(map))

  // Listen for the geocoder result event
  geocoder.on('result', (event) => {
    const coordinates = event.result.geometry.coordinates
    console.log('Coordinates:', coordinates)
    // Perform actions with the coordinates
  })

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
    // Show the nearest bike station on the map
    map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
    
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
    
    // Find the nearest bike station to the starting point
    const targetPoint = point(start_coords)
    const nearest = nearestPoint(targetPoint, geoJSONData)
    const nearest_lng = nearest['geometry']['coordinates'][0]
    const nearest_lat = nearest['geometry']['coordinates'][1]
    console.log('Nearest Point to the starting point: ', nearest)

    var popup2 = new mapboxgl.Popup()
      .setText('Nearest Station to Current Location')
      .addTo(map)
    
    // Add the bike station nearest to the starting point to the map
    // Create a default Marker, colored black, rotated 45 degrees.
    const nearestStart_marker = new mapboxgl.Marker({ color: 'black' })
        .setLngLat([nearest_lng, nearest_lat])
        .addTo(map)
        .setPopup(popup2);
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
    destination.value = coords

    // Find the nearest bike station to the end point
    const targetPoint = point(coords)
    const nearest = nearestPoint(targetPoint, geoJSONData)
    const nearest_lng = nearest['geometry']['coordinates'][0]
    const nearest_lat = nearest['geometry']['coordinates'][1]
    console.log('Nearest Point to the end point: ', nearest)

    const end_dot = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [nearest_lng, nearest_lat] // icon position [lng, lat]
          }
        }
      ]
    }

    // // Show the nearest bike station on the map
    // map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

    if (map.getLayer('layer-with-pulsing-dot')) {
      map.getSource('layer-with-pulsing-dot').setData(end_dot);
    } else {
      map.addLayer({
        id: 'layer-with-pulsing-dot',
        type: 'symbol',
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
                  coordinates: [nearest_lng, nearest_lat] // icon position [lng, lat]
                }
              }
            ]
          }
        },

        layout: {
          'icon-image': 'pulsing-dot', 
        }
      });
    }
  });

  var popup1 = new mapboxgl.Popup()
    .setHTML('<h1>Current Location</h1>')
    .addTo(map);

  // Create a default Marker and add it to the map.
  // Show current location
  const currentLocation_marker = new mapboxgl.Marker()
    .setLngLat([lng, lat])
    .addTo(map)
    .setPopup(popup1);

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
    <h1>Search for your destination:</h1>
    <div ref="geocoderContainer"></div>
    <div>
      <!-- <button ref="naviButton">Start Navigation</button> -->
       <h1>Click your destination on the mapbox viewer</h1>
    </div>
    <div class="cesiumViewer">
      <h1>Cesium Viewer</h1>
      <div class="container" id="cesiumContainer"></div>
    </div>
    <div class="mapboxViewer">
      <h1>Mapbox Viewer</h1>
      <div class="container" id='map'></div>
    </div>
</template>