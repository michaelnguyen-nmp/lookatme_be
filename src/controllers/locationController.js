import axios from "axios";

export const reverseGeocode = async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "lat and lon are required" });
  }

  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: { lat, lon, format: "json" },
        headers: {
          "User-Agent": "LookAtMe (michaelnguyen.nmp@gmail.com)",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Reverse geocoding error:", err.message);
    res.status(500).json({ error: "Failed to fetch location" });
  }
};
