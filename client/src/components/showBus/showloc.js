import React, { useState } from "react";
import axios from "axios";
import "./showloc.css";

const ShowLoc = ({
  allPlaces,
  setAllPlaces,
  error,
  loading,
  setError,
  setLoading,
}) => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [busList, setBusList] = useState([]);
  const [newPlace, setNewPlace] = useState(""); // State for new place
  const [showAddPopup, setShowAddPopup] = useState(false); // Toggle popup

  const handleClick = async (place, id) => {
    setSelectedPlace(place);
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/buses/getBusByLocation`,
        {
          id: id,
        }
      );
      setBusList(response.data);
    } catch (error) {
      setError(error);
    }
    setLoading(false);
  };

  const handleAddPlace = async () => {
    if (!newPlace.trim()) return;

    try {
      const response = await axios.post(
        "http://localhost:5000/buses/addPlace",
        {
          place: newPlace,
        }
      );
      const { placeId, place } = response.data;

      setAllPlaces({ ...allPlaces, [placeId]: place });
      console.log(allPlaces, response); // Update state with new place
      setNewPlace(""); // Reset input
      setShowAddPopup(false); // Close popup
    } catch (error) {
      setError(error);
    }
  };

  const handleClosePopup = () => {
    setSelectedPlace(null);
    setBusList([]);
  };

  return (
    <div className="location-list-container">
      <div className="location-header">
        <h2>Stoppings</h2>
        <button onClick={() => setShowAddPopup(true)} className="add-place-btn">
          +
        </button>
      </div>
      <div className="location-container">
        {Object.entries(allPlaces).map(([id, name]) => (
          <div
            key={id}
            className="location-item"
            onClick={() => handleClick(name, id)}
          >
            {name}
          </div>
        ))}
      </div>

      {selectedPlace && (
        <div className="popup" id="popuploc">
          <span className="close" onClick={handleClosePopup}>
            &times;
          </span>
          <h2>Busses that stops at {selectedPlace}</h2>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error: {error.message}</p>
          ) : (
            <table className="bus-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Destination</th>
                </tr>
              </thead>
              <tbody>
                {busList.map((bus, index) => (
                  <tr key={index}>
                    <td>{bus.name}</td>
                    <td>{bus.type}</td>
                    <td>{bus.source}</td>
                    <td>{bus.destination}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {/* Add Place Popup */}
      {showAddPopup && (
        <div className="popup">
          <div className="popup-content">
            <span className="close" onClick={() => setShowAddPopup(false)}>
              &times;
            </span>
            <h2>Add a New Place</h2>
            <input
              type="text"
              placeholder="Enter place name"
              value={newPlace}
              onChange={(e) => setNewPlace(e.target.value)}
            />
            <button onClick={handleAddPlace}>Add Place</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowLoc;
