const GOOGLE_API_KEY = 'AIzaSyBCMWiijEq76elDYWfYB7PzEFltoJyvz5w';

export const getCoordinates = async (address) => {
  if (!address) return null;
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}&language=pt-BR`
    );
    const data = await response.json();

    if (data.status === "OK") {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    }
    return null;
  } catch (error) {
    console.error("Erro no Geocoding do Google:", error);
    return null;
  }
};