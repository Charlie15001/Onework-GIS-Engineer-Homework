export default function transformToGeoJSON(data) {
    const geoJSON = {
        type: "FeatureCollection", 
        features: data.map(item => ({
            type: "Feature", 
            geometry: {
                type: "Point", 
                coordinates: [item.longitude, item.latitude]
            }, 
            properties: {
                name_ch: item.sna,
                name_en: item.snaen, 
                address: item.ar
            }
        })),
    }
    return geoJSON
}