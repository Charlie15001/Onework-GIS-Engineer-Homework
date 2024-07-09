export const getUserLocation = () => {
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

export function filterBuildingsWithHeight(geojsonData) {
  // Initialize an array to store buildings with a height property
  const buildingsWithHeight = {
    type: 'FeatureCollection',
    features: []
  };

  // Loop through each feature in the GeoJSON data
  geojsonData.features.forEach(feature => {
    // Check if the feature has a 'height' property
    if (feature.properties && feature.properties.height) {
      // Convert height from string to number
      const height = parseFloat(feature.properties.height);
      if (!isNaN(height)) {
        // Set the new height property as a number
        feature.properties.height = height;
        buildingsWithHeight.features.push(feature);
      }
    }
  });

  return buildingsWithHeight;
}