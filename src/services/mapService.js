import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';

const mapboxToken = 'pk.eyJ1IjoicGFydGl1ZW50cmVnYSIsImEiOiJjbWtmajNrbjYwaWgxM2Zvc2NxaHowdWl5In0.NDkosgVOdyKJWPY2oUjhDg';
const geocodingClient = mbxGeocoding({ accessToken: mapboxToken });

export const getCoordinates = async (address) => {
  if (!address) return null;
  
  try {
    const response = await geocodingClient.forwardGeocode({
      query: address,
      countries: ['br'],
      limit: 1
    }).send();

    if (response.body && response.body.features.length > 0) {
      const [lng, lat] = response.body.features[0].center;
      return { lat, lng };
    }
    return null;
  } catch (error) {
    console.error("Erro na API Mapbox:", error);
    return null;
  }
};