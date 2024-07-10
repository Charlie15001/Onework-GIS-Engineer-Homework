export const useCurrentLocation = () => {
    const currentLocation = reactive ({
        lng: 0, 
        lat: 0
    })

    return {
        currentLocation
    }
}