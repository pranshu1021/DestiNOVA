import axios from "axios";

// Replace this with your actual LocationIQ API key
const API_KEY = "pk.68c54cf31541f4384e2db68fcbc417a7";

const locationIQ = axios.create({
  baseURL: "https://api.locationiq.com/v1",
  timeout: 10000,
});

export const searchPlaces = async (query) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const response = await locationIQ.get("/autocomplete", {
      params: {
        key: API_KEY,
        q: query.trim(),
        format: "json",
        limit: 8,
        addressdetails: 1,
        dedupe: 1,
      },
    });

    if (!Array.isArray(response.data)) {
      return [];
    }

    return response.data.map((item) => ({
      place_id: item.place_id,
      display_name: item.display_name,
      lat: item.lat,
      lon: item.lon,
    }));
  } catch (error) {
    console.log("LocationIQ Error:", error?.response?.data || error.message);
    return [];
  }
};