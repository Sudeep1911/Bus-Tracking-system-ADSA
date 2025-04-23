import React, { useState, useEffect } from "react";
import axios from "axios";
import "./showBus.css"; // Import the CSS file
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

const ShowBus = ({ source, destination }) => {
  const [busList, setBusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filterType, setFilterType] = useState("all"); // State for filter type
  const [sortBy, setSortBy] = useState("all");
  const [graphOrMst, setGraphOrMst] = useState(false);
  const [totalFare, setTotalFare] = useState(0);

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        const response = await axios.post(
          `http://localhost:5000/buses/`,
          { source: source, destination: destination, sort: sortBy }, // Data payload
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setBusList(response.data);
        setGraphOrMst(false);
        setError(false);
        setLoading(false); // Data has been successfully retrieved
      } catch (error) {
        console.error("Error fetching bus data:", error);
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
  }, [source, destination, sortBy]);

  // Check loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Check for errors
  if (error) {
    return <div>Error fetching bus data: {error.message}</div>;
  }
  // Filter bus list based on routes containing source and destination, and type of bus
  const filteredBusList = busList
    .filter((bus) => {
      // Apply bus type filter
      if (filterType === "all") {
        return true; // Show all buses
      } else {
        return bus.type === filterType; // Show buses of selected type
      }
    })
    .map((bus, index) => {
      // Calculate arrival time
      const arrivalTime = new Date(
        currentTime.getTime() + (index * 5 + 5) * 60000
      ); // 5 minutes for each bus, starting from 5 minutes from now
      arrivalTime.setSeconds(0); // Round off seconds

      return { ...bus, arrivalTime };
    });

  const handleMST = async () => {
    try {
      setLoading(true); // Set loading before starting the request
      const response = await axios.post(
        `http://localhost:5000/buses/mst`,
        { source: source, destination: destination },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { segments } = response.data;
      const totalFare = segments.reduce(
        (sum, segment) => sum + segment.fare,
        0
      );
      setTotalFare(totalFare);
      setBusList(segments); // Set highlighted path (segments)
      setGraphOrMst(true); // Show MST view
      setError(null); // Clear any previous error
    } catch (error) {
      console.error("Error fetching MST data:", error);
      setError(error);
    } finally {
      setLoading(false); // Always stop loading after request
    }
  };

  const handleGraph = async () => {
    // logic to open/show full graph
    try {
      const response = await axios.post(
        `http://localhost:5000/buses/graph`,
        { source: source, destination: destination }, // Data payload
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { segments } = response.data;
      const totalFare = segments.reduce(
        (sum, segment) => sum + segment.fare,
        0
      );
      setTotalFare(totalFare);
      setBusList(segments); // Show fare segments
      setGraphOrMst(true);
      setLoading(false); // Data has been successfully retrieved
    } catch (error) {
      console.error("Error fetching bus data:", error);
      setError(error); // Set the error state
      setLoading(false); // Data retrieval failed
    }
  };
  console.log(graphOrMst);

  // Data loaded successfully, render the table
  return (
    <div className="bus-table-container">
      <h2>Bus Schedules</h2>

      {/* Filter buttons */}
      {filteredBusList.length !== 0 && !graphOrMst && (
        <div className="filter-and-sort">
          <div className="filter-container">
            <label htmlFor="bus-filter">Filter: </label>
            <select
              id="bus-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All</option>
              <option value="govt">Government</option>
              <option value="private">Private</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div className="sort-container">
            <label htmlFor="sort-filter">Sort by:</label>
            <select
              id="sort-filter"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="all">All</option>
              <option value="stops">No of Stops</option>
              <option value="fare">Fare</option>
            </select>
          </div>
        </div>
      )}

      {filteredBusList.length === 0 && (
        <p className="no-bus-text">
          No buses are running on this current route.
        </p>
      )}
      {(filteredBusList.length === 0 || graphOrMst) && (
        <div className="no-bus-container">
          <div className="button-container">
            <button className="mst-button" onClick={handleMST}>
              View MST
            </button>
            <button className="graph-button" onClick={handleGraph}>
              View Graph
            </button>
          </div>
        </div>
      )}
      {filteredBusList.length !== 0 && (
        <>
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
              ))}
            </tbody>
          </table>
          {graphOrMst && (
            <>
              <p>Total Fare:{totalFare}</p>
              <p>Total Changes:{filteredBusList.length}</p>
            </>
          )}
        </>
      )}
    </div>
  );
};

const SelectLocations = ({
  onLocationsSubmitted,
  onClear,
  allPlaces,
  Error,
  Loading,
}) => {
  const [locations, setLocations] = useState({
    source: "",
    destination: "",
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
    setLocations({ source: "", destination: "" });
    onClear(); // Notify parent component to clear submitted locations
  };

  const handleExchange = () => {
    setLocations({
      source: locations.destination,
      destination: locations.source,
    });
  };

  return (
    <div className="select-container">
      {Loading ? (
        <p>Loading...</p>
      ) : Error ? (
        <p>Error: {Error.message}</p>
      ) : (
        <>
          <div className="select-row">
            <label htmlFor="source-select" className="select-label">
              Source:
            </label>
            <select
              id="source-select"
              className="select-input"
              value={locations.source}
              onChange={handleSourceChange}
            >
              <option value="">None</option>
              {Object.entries(allPlaces).map(([id, name]) => (
                <option key={id} value={id} className="select-option">
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="select-row">
            <label htmlFor="destination-select" className="select-label">
              Destination:
            </label>
            <select
              id="destination-select"
              className="select-input"
              value={locations.destination}
              onChange={handleDestinationChange}
            >
              <option value="">None</option>
              {Object.entries(allPlaces).map(([id, name]) => (
                <option key={id} value={id} className="select-option">
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="button">
            <button className="submit-button" onClick={handleSubmit}>
              Submit
            </button>
            <button className="clear-button" onClick={handleClear}>
              Clear
            </button>
            <button className="exchange-button" onClick={handleExchange}>
              Exchange
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const BusApp = ({ allPlaces, Error, Loading }) => {
  const [submittedLocations, setSubmittedLocations] = useState(null);

  const handleLocationsSubmitted = (locations) => {
    setSubmittedLocations(locations);
  };

  const handleClear = () => {
    setSubmittedLocations(null);
  };

  return (
    <div>
      <SelectLocations
        onLocationsSubmitted={handleLocationsSubmitted}
        onClear={handleClear}
        allPlaces={allPlaces}
        Error={Error}
        Loading={Loading}
      />
      {submittedLocations && (
        <ShowBus
          source={submittedLocations.source}
          destination={submittedLocations.destination}
        />
      )}
    </div>
  );
};

export default BusApp;
