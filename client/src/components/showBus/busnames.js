import React, { useState, useEffect } from "react";
import axios from "axios";
import "./busnames.css"; // Import the CSS file

const Busnames = ({ allPlaces }) => {
  const [busList, setBusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [showAddPopup, setShowAddPopup] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editBusId, setEditBusId] = useState(null);
  const [newBus, setNewBus] = useState({
    name: "",
    type: "",
    source: "",
    destination: "",
    stops: [], // Intermediate stops
  });

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/buses/");
        setBusList(response.data);
        setLoading(false); // Data has been successfully retrieved
      } catch (error) {
        console.error("Error fetching bus data:", error);
        setError(error); // Set the error state
        setLoading(false); // Data retrieval failed
      }
    };

    fetchBusData();
  }, []);

  // Handle bus name click to open popup
  const handleBusClick = (busName) => {
    const selected = busList.find((bus) => bus.name === busName);
    setSelectedBus(selected);
  };

  // Close popup
  const handleClosePopup = () => {
    setSelectedBus(null);
  };

  const handleAddBus = () => {
    setShowAddPopup(true);
  };

  const handleCloseAddPopup = () => {
    setShowAddPopup(false);
    setIsEditMode(false);
    setEditBusId(null);
    setNewBus({ name: "", type: "", source: "", destination: "", stops: [] });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBus({ ...newBus, [name]: value });
  };

  const handleAddStop = (event) => {
    const selectedStop = event.target.value;
    if (!selectedStop) return; // If no stop is selected, do nothing

    // Ensure the stop isn't a duplicate
    if (!newBus.stops.includes(selectedStop)) {
      setNewBus((prevBus) => ({
        ...prevBus,
        stops: [...prevBus.stops, selectedStop],
      }));
    }
  };

  const handleRemoveStop = (stopToRemove) => {
    setNewBus((prevBus) => ({
      ...prevBus,
      stops: prevBus.stops.filter((stop) => stop !== stopToRemove),
    }));
  };

  const handleSubmitBus = async () => {
    try {
      const placeToIdMap = Object.fromEntries(
        Object.entries(allPlaces).map(([id, place]) => [place, id])
      );
      const formattedBusData = {
        name: newBus.name,
        type: newBus.type,
        sourceId: placeToIdMap[newBus.source] || null, // Get ID from allPlaces
        destinationId: placeToIdMap[newBus.destination] || null,
        source: newBus.source,
        destination: newBus.destination,
        routes: [
          {
            place: newBus.source,
            stage: 0,
            id: placeToIdMap[newBus.source] || null,
          },
          ...newBus.stops.map((stop, index) => ({
            place: stop,
            stage: index + 1,
            id: placeToIdMap[stop] || null,
          })),
          {
            place: newBus.destination,
            stage: newBus.stops.length + 1,
            id: placeToIdMap[newBus.destination] || null,
          },
        ],
      };
      if (isEditMode) {
        const data = { data: formattedBusData, busId: editBusId };
        await axios.post("http://localhost:5000/buses/updateBus", data);

        const updatedList = busList.map((bus) =>
          bus._id === editBusId ? { ...bus, ...formattedBusData } : bus
        );
        console.log(updatedList);
        setBusList(updatedList);
      } else {
        await axios.post(
          "http://localhost:5000/buses/addBus",
          formattedBusData
        );
        setBusList([...busList, formattedBusData]);
      }
      handleCloseAddPopup();
    } catch (error) {
      console.error("Error adding bus:", error);
    }
  };

  // Popup component
  const Popup = ({ bus }) => (
    <div className="popup" id="bus">
      <div className="popup-content">
        <span className="close" onClick={handleClosePopup}>
          &times;
        </span>
        <h2>Name:{bus.name}</h2>
        <div className="bus-details">
          <p>Type: {bus.type}</p>
          <p>Source: {bus.source}</p>
          <p>Destination: {bus.destination}</p>
        </div>
        <h3>Routes:</h3>
        <ul>
          {bus.routes.map((route, index) => (
            <li key={index}>
              <p>
                {parseInt(route.stage) + 1}: {route.place}
              </p>
            </li>
          ))}
        </ul>
        <div className="Buttons">
          <button
            className="edit-btn"
            onClick={() => {
              setShowAddPopup(true);
              setIsEditMode(true);
              setEditBusId(bus.name); // Assuming your bus has a unique ID
              setNewBus({
                name: bus.name,
                type: bus.type,
                source: bus.source,
                destination: bus.destination,
                stops: bus.routes
                  .filter(
                    (r, idx) => idx !== 0 && idx !== bus.routes.length - 1 // skip source and destination
                  )
                  .map((r) => r.place),
              });
              setSelectedBus(null); // close the view popup
            }}
          >
            Edit
          </button>
          <button
            className="delete-btn"
            onClick={async () => {
              if (
                window.confirm(`Are you sure you want to delete "${bus.name}"?`)
              ) {
                try {
                  await axios.delete(`http://localhost:5000/buses/${bus.name}`);
                  const updatedList = busList.filter(
                    (b) => b.name !== bus.name
                  );
                  setBusList(updatedList);
                  alert("Bus deleted successfully!");
                  handleClosePopup();
                } catch (err) {
                  console.error("Error deleting bus:", err);
                  alert("Failed to delete bus. Please try again.");
                  handleClosePopup();
                }
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // Check loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Check for errors
  if (error) {
    return <div>Error fetching bus data: {error.message}</div>;
  }

  // Data loaded successfully, render the bus names in boxes
  return (
    <div className="bus-list-container">
      <div className="bus-header">
        <h2>Buses</h2>
        <button onClick={() => handleAddBus()}>+</button>
      </div>
      <div className="bus-list">
        {busList.map((bus, index) => (
          <div
            key={index}
            className="bus-box"
            onClick={() => handleBusClick(bus.name)}
          >
            <p>{bus.name}</p>
          </div>
        ))}
      </div>
      {selectedBus && <Popup bus={selectedBus} />}
      {showAddPopup && (
        <div className="popup-overlay">
          <div className="add-bus-popup">
            <span className="close-btn" onClick={handleCloseAddPopup}>
              &times;
            </span>
            <h2 className="h2">{isEditMode ? "Edit Bus" : "Add a New Bus"}</h2>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              placeholder="Bus Name"
              value={newBus.name}
              onChange={handleInputChange}
            />
            <label>Type:</label>
            <select
              name="type"
              value={newBus.type}
              onChange={handleInputChange}
              className="bus-type-dropdown"
            >
              <option value="" disabled>
                Select Bus Type
              </option>
              <option value="premium">Premium</option>
              <option value="govt">Government</option>
              <option value="private">Private</option>
            </select>

            {/* Source Field (Fixed as Route[0]) */}
            <label>Source:</label>
            <select
              name="source"
              value={newBus.source}
              onChange={handleInputChange}
            >
              <option value="">Select Source</option>
              {Object.entries(allPlaces).map(([index, place]) => (
                <option key={index} value={place}>
                  {place}
                </option>
              ))}
            </select>

            {/* In-Between Stops (Dropdown Selection) */}
            <label>Stops:</label>
            <select onChange={handleAddStop}>
              <option value="">Select Stop</option>
              {Object.entries(allPlaces)
                .filter(
                  ([place]) =>
                    place !== newBus.source && place !== newBus.destination
                )
                .map(([index, place]) => (
                  <option key={index} value={place}>
                    {place}
                  </option>
                ))}
            </select>

            {/* Display Stops */}
            <ul className="routes-list">
              {newBus.stops.map((stop, index) => (
                <li key={index} className="stop-item">
                  {index + 1}: {stop}
                  <button
                    className="remove-stop-btn"
                    onClick={() => handleRemoveStop(stop)}
                  >
                    x
                  </button>
                </li>
              ))}
            </ul>

            {/* Destination Field (Fixed as Route[-1]) */}
            <label>Destination:</label>
            <select
              name="destination"
              value={newBus.destination}
              onChange={handleInputChange}
            >
              <option value="">Select Destination</option>
              {Object.entries(allPlaces).map(([index, place]) => (
                <option key={index} value={place}>
                  {place}
                </option>
              ))}
            </select>

            <button onClick={handleSubmitBus} className="edit-btn">
              {isEditMode ? "Save Bus" : "Add Bus"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Busnames;
