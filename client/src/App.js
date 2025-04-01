import "./App.css";
import React, { useEffect, useState } from "react";
import Bus from "./components/showBus/showBus";
import Busnames from "./components/showBus/busnames";
import Locations from "./components/showBus/showloc";
import { getPlacesApi } from "./api/api";
function App() {
  const [allPlaces, setAllPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchPlaces = async () => {
      const data = await getPlacesApi(setLoading, setError);
      setAllPlaces(data);
    };

    fetchPlaces();
  }, []);

  return (
    <div className="App">
      <div className="header">
        <h1 className="title">KSWayFinder</h1>
      </div>
      <div className="contents">
        <div className="bus-names" id="bus-names">
          <Busnames />
        </div>
        <div className="container-lg">
          <br />
          <br />
          <header className="app-bar">
            <h2 className="heading">Search By Location</h2>
          </header>
          <div className="grow-in">
            <div className="container">
              <div className="grid-container">
                <div className="table">
                  <Bus allPlaces={allPlaces} Error={error} Loading={loading} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bus-names" id="location-names">
          <Locations
            allPlaces={allPlaces}
            error={error}
            loading={loading}
            setLoading={setLoading}
            setError={setError}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
