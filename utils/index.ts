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