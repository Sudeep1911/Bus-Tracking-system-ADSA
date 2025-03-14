import React, { useState } from 'react';
import axios from 'axios';
import ShowBus from '../showBus/showBus.js'; // Import the ShowBus component
import './getLocation.css';

const allPlaces = [
  "Agri University", "Air India", "Alanthurai", "Airport", "Anjugam Nagar", "Appanaickenpatti",
  "Avarampalayam", "Bharathiar University", "Chinniyampalayam", "Chinnavedampatti", "Cheran Colony",
  "Cheran Managar", "Collector Office", "Devarayapuram", "ESI", "Flower Market", "GH", "Gandhipark",
  "Gandhipuram", "Ganapathy", "Government Hospital", "Hope College", "Hopes", "Kalangal", "Kalapatti",
  "Kamaraj Road", "Karumathampatti", "K.G. Hospital", "Kangeyampalayam", "Kembanur", "KMCH", "Kuniyamuthur",
  "Kuniamuthur", "Kulathur", "Lakshmi Mill", "Lawly Road", "Madampatti", "Madapur", "Maruthamalai",
  "Molapalayam", "Muthukavundanpudur", "Nanjundapuram", "Nathegoundenpudur", "Nehru Nagar", "NGGO Colony",
  "Ondipudur", "Ondipu Sindhamanipudur", "Pachapalayam", "P.N.Palayam", "Palathurai", "Pangaja Mill Road",
  "Perur", "Peelamedu", "Podanur", "Polytechnology", "Poosaripalayam", "Puliyakulam", "Pappanaickenpalayam",
  "Rathinapuri", "Railway Station", "Ramanathapuram", "Sadivayal", "Saibaba Colony", "Saint Joseph Matriculation Secondary School",
  "Saravanampatti", "Semmedu", "Selvapuram", "Seeranaickenpalayam", "Shanthi Gears", "Singanallur", "Singanallur Police Station",
  "Sivananda Mills", "Sitra", "Sukravarpet", "Sungam", "Sulur", "Sulur Airport", "Sugarcane Institute", "Town", "Town Hall",
  "Thudiyalur", "Ukkadam", "Vellalore", "Varadharajapuram", "Vadavalli", "Vedapatti", "Velandipalayam", "Vellalore",
  "Vellalore", "Viraliur", "VOC Park"
];

const SelectLocations = () => {
  const [locations, setLocations] = useState({
    source: '',
    destination: ''
  });
  const [showBuses, setShowBuses] = useState(false); // State to control showing buses

  const handleSourceChange = (event) => {
    setLocations({ ...locations, source: event.target.value });
  };

  const handleDestinationChange = (event) => {
    setLocations({ ...locations, destination: event.target.value });
  };

  const handleSubmit = () => {
    axios.post('http://localhost:5000/buses', locations)
      .then(response => {
        setShowBuses(true); // Set showBuses to true upon successful submission
        console.log("Locations:", locations);
        console.log("Response:", response.data);
      })
      .catch(error => {
        console.error("Error:", error);
      });
  };

  return (
    <div className="select-container">
      <div className="select-row">
        <label htmlFor="source-select" className="select-label">Source:</label>
        <select id="source-select" className="select-input" value={locations.source} onChange={handleSourceChange}>
          <option value="">None</option>
          {allPlaces.map(place => (
            <option key={place} value={place} className="select-option">{place}</option>
          ))}
        </select>
      </div>

      <div className="select-row">
        <label htmlFor="destination-select" className="select-label">Destination:</label>
        <select id="destination-select" className="select-input" value={locations.destination} onChange={handleDestinationChange}>
          <option value="">None</option>
          {allPlaces.map(place => (
            <option key={place} value={place} className="select-option">{place}</option>
          ))}
        </select>
      </div>

      <div className="button">
        <button className="submit-button" onClick={handleSubmit}>Submit</button>
      </div>

      {/* Conditionally render ShowBus component if showBuses is true */}
      {showBuses && <ShowBus source={locations.source} destination={locations.destination} />}
    </div>
  );
};

export default SelectLocations;
