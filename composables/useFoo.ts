export const useFoo = () => {
    // navigator.geolocation.getCurrentPosition((position) => {
    //     // console.log(position.coords.latitude, position.coords.longitude);
    //     const coord_lat = position.coords.latitude;
    //     const coord_long = position.coords.longitude;
    //  });
     const coord = () => console.log(12);
    // return useState('foo', () => 'bar')
    return {
        coord,
    };
  }