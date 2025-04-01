import axios from "axios";

export const getPlacesApi = async (setLoading, setError) => {
  setLoading(true); // Start loading before API call
  try {
    const response = await axios.get("http://localhost:5000/buses/get_places");
    setLoading(false); // Data retrieved successfully
    const sortedEntries = Object.entries(response.data.data).sort((a, b) =>
      a[1].localeCompare(b[1])
    );

    const sortedData = Object.fromEntries(sortedEntries);

    return sortedData; // Return the fetched data
  } catch (error) {
    console.error("Error fetching places data:", error);
    setError(error); // Set the error state
    setLoading(false); // Stop loading on error
    return null; // Return null in case of failure
  }
};
