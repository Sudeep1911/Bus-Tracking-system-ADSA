import React, { useState } from "react";
import axios from "axios";
import "./showloc.css";

const ShowLoc = ({ allPlaces, error, loading, setError, setLoading }) => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [busList, setBusList] = useState([]);

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

  const handleClosePopup = () => {
    setSelectedPlace(null);
    setBusList([]);
  };

  return (
    <>
      <h2>Stoppings</h2>
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
          <div className="popup-content" id="popup-contentloc">
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
        </div>
      )}
    </>
  );
};

export default ShowLoc;
