import React, { useState } from 'react';
import axios from 'axios';
import "./showloc.css"

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

const ShowLoc = () => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [busList, setBusList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async (place) => {
    setSelectedPlace(place);
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/buses`);
      const filteredBuses = response.data.filter(bus => {
        return bus.routes.some(route => route.place === place);
      });
      setBusList(filteredBuses);
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
        {allPlaces.map((place, index) => (
          <div key={index} className="location-item" onClick={() => handleClick(place)}>
            {place}
          </div>
        ))}
      </div>

      {selectedPlace && (
        <div className="popup" id='popuploc'>
          <div className="popup-content" id='popup-contentloc'>
            <span className="close" onClick={handleClosePopup}>&times;</span>
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

