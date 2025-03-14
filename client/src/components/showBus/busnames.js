import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './busnames.css'; // Import the CSS file

const Busnames = () => {
  const [busList, setBusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/buses');
        setBusList(response.data);
        setLoading(false); // Data has been successfully retrieved
      } catch (error) {
        console.error('Error fetching bus data:', error);
        setError(error); // Set the error state
        setLoading(false); // Data retrieval failed
      }
    };

    fetchBusData();
  }, []);

  // Handle bus name click to open popup
  const handleBusClick = (busName) => {
    const selected = busList.find(bus => bus.name === busName);
    setSelectedBus(selected);
  };

  // Close popup
  const handleClosePopup = () => {
    setSelectedBus(null);
  };

  // Popup component
  const Popup = ({ bus }) => (
<div className="popup" id="bus">
  <div className="popup-content">
    <span className="close" onClick={handleClosePopup}>&times;</span>
    <h2>Name:{bus.name}</h2>
    <div className="bus-details">
      <p>Type: {bus.type}</p>
      <p>Source: {bus.source}</p>
      <p>Destination: {bus.destination}</p>
    </div>
  </div>
  <div>
    <h3>Routes:</h3>
    <ul>
      {bus.routes.map((route, index) => (
        <li key={index}>
          <p>{parseInt(route.stage) + 1}: {route.place}</p>
        </li>
      ))}
    </ul>
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
      <h2>Buses</h2>
      <div className="bus-list">
        {busList.map((bus, index) => (
          <div key={index} className="bus-box" onClick={() => handleBusClick(bus.name)}>
            <p>{bus.name}</p>
          </div>
        ))}
      </div>
      {selectedBus && <Popup bus={selectedBus} />}
    </div>
  );
};

export default Busnames;
