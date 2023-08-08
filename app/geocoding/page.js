"use client";

import axios from "axios";
import { useState } from "react";
import Link from 'next/link'

const geocoding = () => {
    const [locationsInput, setLocationsInput] = useState("");
    const [geocodedLocations, setGeocodedLocations] = useState([]);
  
    const handleGeocode = async () => {
      const addresses = locationsInput.split("\n").filter((address) => address.trim() !== "");

      if (addresses.length === 0) {
        alert("Please enter at least one address.");
        return;
      }

      const geocoded = []

      for (const address of addresses) {
        const encodedInput = encodeURIComponent(address);
        const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedInput}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`;

        try {
            const response = await axios.get(apiUrl);
            const data = response.data;
            if (data.status === "OK") {
                const locationData = {
                    address: address,
                    latitude: data.results[0].geometry.location.lat,
                    longitude: data.results[0].geometry.location.lng,
                }
                geocoded.push(locationData);
            }
            else{
                console.error(`Geocoding failed for address: ${address}`);
                const locationData = {
                    address: address,
                    latitude: "",
                    longitude: "",
                  };
                  geocoded.push(locationData);
            }
        }
        catch {
            console.error(`Error fetching geocoding data for address: ${address}`, error);
            const locationData = {
                address: address,
                latitude: "",
                longitude: "",
              };
              geocoded.push(locationData);
        }
      }
      setGeocodedLocations(geocoded);
    };

    const toRadians = (degrees) => (degrees * Math.PI) / 180;

    const calculateDistance = (source, destination) => {
        const earthRadius = 3958.8; // Earth radius in miles
        const lat1 = parseFloat(source.latitude);
        const lon1 = parseFloat(source.longitude);
        const lat2 = parseFloat(destination.latitude);
        const lon2 = parseFloat(destination.longitude);
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = earthRadius * c * 5280; // Convert distance to feet
        return distance.toFixed(6);
      };

      const handleCopyToClipboard = () => {
        const text = geocodedLocations
          .map(
            (locationData) =>
              `${locationData.latitude}\t${locationData.longitude}\t${locationData.distance}`
          )
          .join("\n");
        navigator.clipboard.writeText(text);
        alert("Data copied to clipboard!");
      };

    const handleGenerateDistances = () => {
        const distances = geocodedLocations.map((locationData, index) => {
          if (index === 0) {
            return "";
          } else {
            const prevLocationData = geocodedLocations[index - 1];
            return calculateDistance(prevLocationData, locationData);
          }
        });
    
        const newGeocodedData = geocodedLocations.map((locationData, index) => ({
          ...locationData,
          distance: distances[index],
        }));
    
        setGeocodedLocations(newGeocodedData);
      };

    return ( 
        <div className="container-fluid">
            <h2>Geocoding Page</h2>
            <div className="form-group">
              <textarea
                rows="4"
                className="form-control"
                value={locationsInput}
                onChange={(e) => setLocationsInput(e.target.value)}
                placeholder="Paste your locations from Excel here..."
              />
            </div>
            <button className="btn btn-primary" onClick={handleGeocode}>Geocode</button>

            {/* Display the results in an Excel-like table */}
            <table className="table mt-3">
                <thead>
                <tr>
                    <th>Address</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Distance (feet)</th>
                </tr>
                </thead>
                <tbody>
                {geocodedLocations.map((locationData, index) => (
                    <tr key={index}>
                    <td>{locationData.address}</td>
                    <td>
                        <input
                        className="form-control"
                        type="text"
                        value={locationData.latitude}
                        onChange={(e) => {
                            const newGeocodedData = [...geocodedLocations];
                            newGeocodedData[index].latitude = e.target.value;
                            setGeocodedLocations(newGeocodedData);
                        }}
                        />
                    </td>
                    <td>
                        <input
                        className="form-control"
                        type="text"
                        value={locationData.longitude}
                        onChange={(e) => {
                            const newGeocodedData = [...geocodedLocations];
                            newGeocodedData[index].longitude = e.target.value;
                            setGeocodedLocations(newGeocodedData);
                        }}
                        />
                    </td>
                    <td>{locationData.distance}</td>
                    
                    </tr>
                ))}
                </tbody>
            </table>
            
            <div className="export-buttons mt-3">
              <Link
                  href={{
                  pathname: '/map',
                  query: {
                      geocodedData: JSON.stringify(geocodedLocations.map(({ latitude, longitude }) => ({ latitude, longitude })))
                  }
                  }}
              >
              <button className="btn btn-success">Mark to Map</button> 
              </Link>
              <button className="btn btn-warning" onClick={handleGenerateDistances}>Generate Distances</button>
              <button className="btn btn-info" onClick={handleCopyToClipboard}>Copy to Clipboard</button>
            </div>
        </div> 
     );
}
 
export default geocoding;