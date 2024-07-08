export const useCameraState = () => {
  const cameraState = reactive({
    lng: 0,
    lat: 0,
    height: 400, // For Cesium
    zoom: 12, // For Mapbox
    heading: -30.0,
    pitch: -15.0,
    roll: 0.0,
  })

  return {
    cameraState
  }
}