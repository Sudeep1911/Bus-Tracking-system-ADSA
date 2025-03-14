import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './showBus.css'; // Import the CSS file

const ShowBus = ({ source, destination }) => {
  const [busList, setBusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filterType, setFilterType] = useState('all'); // State for filter type

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/buses?source=${source}&destination=${destination}`);
        setBusList(response.data);
        setLoading(false); // Data has been successfully retrieved
      } catch (error) {
        console.error('Error fetching bus data:', error);
        setError(error); // Set the error state
        setLoading(false); // Data retrieval failed
      }
    };

    fetchBusData();

    // Update current time every minute
    const timer = setInterval(() => {
      const currentTime = new Date();
      currentTime.setSeconds(0);
      setCurrentTime(currentTime);
    }, 60000); // Update every minute

    // Clear the timer on component unmount
    return () => clearInterval(timer);
  }, [source, destination]);

  // Check loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Check for errors
  if (error) {
    return <div>Error fetching bus data: {error.message}</div>;
  }

  const fare = [4, 7, 9, 11, 12, 12, 13, 14, 15, 15, 15, 16, 16, 16, 16];

  // Filter bus list based on routes containing source and destination, and type of bus
  const filteredBusList = busList
    .filter(bus => {
      const sourceRoute = bus.routes.find(route => route.place === source);
      const destinationRoute = bus.routes.find(route => route.place === destination);

      if (sourceRoute && destinationRoute) {
        const sourceStage = parseInt(sourceRoute.stage);
        const destinationStage = parseInt(destinationRoute.stage);

        return sourceStage < destinationStage;
      }
      return false;
    })
    .filter(bus => { // Apply bus type filter
      if (filterType === 'all') {
        return true; // Show all buses
      } else {
        return bus.type === filterType; // Show buses of selected type
      }
    })
    .map((bus, index) => {
      const sourceRoute = bus.routes.find(route => route.place === source);
      const destinationRoute = bus.routes.find(route => route.place === destination);
      const sourceStage = parseInt(sourceRoute.stage);
      const destinationStage = parseInt(destinationRoute.stage);
      const fareIndex = destinationStage - sourceStage;
      let busFare = fare[fareIndex];
      if (bus.type === 'premium') {
        busFare *= 2; // Double the fare for premium buses
      }

      // Calculate arrival time
      const arrivalTime = new Date(currentTime.getTime() + (index * 5 + 5) * 60000); // 5 minutes for each bus, starting from 5 minutes from now
      arrivalTime.setSeconds(0); // Round off seconds

      return { ...bus, fare: busFare, arrivalTime, fareIndex };
    });

  // Handle filter type change
  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  // Data loaded successfully, render the table
  return (
    <div className="bus-table-container">

      <h2>Bus Schedules</h2>

      {/* Filter buttons */}
      <div className="filter-container">
        <button className={filterType === 'all' ? 'active' : ''} onClick={() => handleFilterChange('all')}>All</button>
        <button className={filterType === 'govt' ? 'active' : ''} onClick={() => handleFilterChange('govt')}>Government</button>
        <button className={filterType === 'private' ? 'active' : ''} onClick={() => handleFilterChange('private')}>Private</button>
        <button className={filterType === 'premium' ? 'active' : ''} onClick={() => handleFilterChange('premium')}>Premium</button>
      </div>

      {filteredBusList.length === 0 ? (<div className="no-bus-alert">No buses are running on this current route.</div>) : (
        <table className="bus-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Source</th>
              <th>Destination</th>
              <th>Fare</th>
              <th>Arrival Time</th>
              <th>No Of Stops</th>
            </tr>
          </thead>
          <tbody>
            {filteredBusList.map((bus, index) => (
                            <tr key={index}>
                            <td>{bus.name}</td>
                            <td>{bus.type}</td>
                            <td>{bus.source}</td>
                            <td>{bus.destination}</td>
                            <td>{bus.fare}</td>
                            <td>{bus.arrivalTime.toLocaleTimeString()}</td>
                            <td>{bus.fareIndex}</td>
                          </tr>
                        )
                )
              }
          </tbody>
        </table>
        )
      }
    </div>
  );
};
            
            




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

const SelectLocations = ({ onLocationsSubmitted, onClear }) => {
  const [locations, setLocations] = useState({
    source: '',
    destination: ''
  });

  const handleSourceChange = (event) => {
    setLocations({ ...locations, source: event.target.value });
  };

  const handleDestinationChange = (event) => {
    setLocations({ ...locations, destination: event.target.value });
  };

  const handleSubmit = () => {
    onLocationsSubmitted(locations); // Pass locations to the parent component
  };

  const handleClear = () => {
    setLocations({ source: '', destination: '' });
    onClear(); // Notify parent component to clear submitted locations
  };

  const handleExchange = () => {
    setLocations({ source: locations.destination, destination: locations.source });
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
        <button className="clear-button" onClick={handleClear}>Clear</button>
        <button className="exchange-button" onClick={handleExchange}>Exchange</button>
      </div>
    </div>
  );
};

const BusApp = () => {
  const [submittedLocations, setSubmittedLocations] = useState(null);

  const handleLocationsSubmitted = (locations) => {
    setSubmittedLocations(locations);
  };

  const handleClear = () => {
    setSubmittedLocations(null);
  };

  return (
    <div>
      <SelectLocations onLocationsSubmitted={handleLocationsSubmitted} onClear={handleClear} />
      {submittedLocations && <ShowBus source={submittedLocations.source} destination={submittedLocations.destination} />}
    </div>
  );
};

export default BusApp;

