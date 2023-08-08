"use client";

import { useState, useEffect } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";


const Map = ({ geocodedLocations, old_pins }) => {
  const {data: session} = useSession();
  const router = useRouter();
  const [pins, setPins] = useState([]);
  const [lastHeading, setLastHeading] = useState(NaN); 
  const [mapOptions, setMapOptions] = useState({
    zoom: 10,
    center: {lat: 40.6, lng: -74}
  });
  const [showModal, setShowModal] = useState(false);
  const [mapName, setMapName] = useState("");
 
  
  // Custom marker icon for the geocoded locations (e.g., red color)
  const geocodedMarkerIcon = {
    url: "https://maps.google.com/mapfiles/ms/icons/purple-dot.png",
    origin: new window.google.maps.Point(0, 0),
    anchor: new window.google.maps.Point(20, 40),
  };

  const [geocodedMarkers, setGeocodedMarkers] = useState([]);
   
   useEffect(() => {
    if (geocodedLocations && typeof geocodedLocations === "string") {
      try {
        const parsedLocations = JSON.parse(geocodedLocations);
        if (Array.isArray(parsedLocations)) {
          setGeocodedMarkers(
            parsedLocations.map((location, index) => ({
              position: { lat: location.latitude, lng: location.longitude },
              icon: geocodedMarkerIcon,
              key: `geocoded-marker-${index}`,
            }))
          );
        }
      } catch (error) {
        console.error("Error parsing geocodedLocations:", error);
      }
    }

  }, [geocodedLocations]);

  useEffect(() => {
    if (old_pins && typeof old_pins === "string") {
      try {
        const parsedLocations = JSON.parse(old_pins);
        if (Array.isArray(parsedLocations)) {
          setPins(parsedLocations);
        }
      } catch (error) {
        console.error("Error parsing old_pins:", error);
      }
    }
  }, [old_pins])

  
  const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
  };
  
  const calculateHeading = (source, destination) => {
    const lat1 = toRadians(source.latitude);
    const lon1 = toRadians(source.longitude);
    const lat2 = toRadians(destination.latitude);
    const lon2 = toRadians(destination.longitude);
    const deltaLon = lon2 - lon1;
  
    const y = Math.sin(deltaLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
  
    let heading = (Math.atan2(y, x) * 180) / Math.PI;
    heading = (heading + 360) % 360; // Convert to positive degrees
  
    return heading;
  };
  

  const handleMapClick = (event) => {
    const latLng = event.latLng;
    const latitude = latLng.lat();
    const longitude = latLng.lng();
    
    let heading = 0;
    if (pins.length > 0) {
      const lastPin = pins[pins.length - 1];
      heading = calculateHeading(lastPin, { latitude, longitude });
  
      // Update the last heading before adding the new pin
      setLastHeading(heading);
    }
  
    setPins((prevPins) => {
      if (prevPins.length > 0) {
        // Get the last pin and update its heading
        const updatedLastPin = { ...prevPins[prevPins.length - 1], heading };
        // Replace the last pin with the updated one and add the new pin
        return [...prevPins.slice(0, prevPins.length - 1), updatedLastPin, { latitude, longitude, heading }];
      } else {
        return [...prevPins, { latitude, longitude, heading }];
      }
    });
  };

  const handleExportToClipboard = () => {
    const text = pins.map((pin) => `${pin.latitude}\t${pin.longitude}\t${pin.heading}`).join("\n");
    navigator.clipboard.writeText(text);
    alert("Pins copied to clipboard!");
  };

  const handleDeleteLast = () => {
    setPins((prevPins) => {
      if (prevPins.length > 0) {
        // Remove the last pin from the array
        const updatedPins = prevPins.slice(0, prevPins.length - 1);

        // Update the heading of the new last pin (if applicable)
        if (updatedPins.length > 1) {
          const secondLastPin = updatedPins[updatedPins.length - 2];
          const heading = secondLastPin.heading;
          const lastPin = { ...updatedPins[updatedPins.length - 1], heading };
          updatedPins[updatedPins.length - 1] = lastPin;
        }

        return updatedPins;
      } else {
        return prevPins; // No pins to remove
      }
    });
  };

  // handle show and hide modal
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  // handle save map 
  const createMap = async () => {
    try {
      const map = {
      mapName: mapName,
      geocodedLocations: geocodedLocations,
      pins: pins,
      userID: session?.user?.id
      }
      // console.log('frontend', map)
      const res = await fetch('/api/save-map', {
        method: 'POST',
        body: JSON.stringify(map),
      })
      if (res.ok) {
        router.push('/');
      }
    } catch (error) {
      console.error(error);
    }
    
  }
  
  return (
    <>
    <div style={{ display: "flex" }}>
      <GoogleMap
        zoom={mapOptions.zoom}
        center={mapOptions.center}
        mapContainerClassName="map-container"
        onClick={handleMapClick} // Call handleMapClick on map click
      >
        {/* Render the markers for geocodedLocations */}
        {geocodedMarkers.map((marker) => (
            <Marker {...marker} />
        ))}
        
        {pins.map((pin, index) => (
          <Marker
            key={index}
            position={{ lat: pin.latitude, lng: pin.longitude }}
            label={(index + 1).toString()} 
          />
        ))}
      </GoogleMap>

      <div className="recorded-pins-container">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2>Recorded Pins:</h2>
        <Button variant="primary" onClick={handleShow}>
          Save Map 
        </Button>
         </div> 
        <ul className="list-group">
          {pins.map((pin, index) => (
            <li key={index}>
            <strong>Pin {index + 1}:</strong>{" "}
            Latitude: {pin.latitude.toFixed(6)}, Longitude: {pin.longitude.toFixed(6)}, Heading: {pin.heading.toFixed(0)}
          </li>
          ))}
        </ul>
        <div className="export-buttons mt-3">
            <button className="btn btn-info" onClick={handleExportToClipboard}>Copy To Clipboard</button>
            <button className="btn btn-dark" onClick={handleDeleteLast}>Delete Last Pin</button>
        </div>
      </div>

    </div>
    {/* Modal */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Enter Your Map's Name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formMapName">

            <Form.Control 
              type="text" 
              placeholder="Enter map name" 
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={createMap}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>

  );
};

export default Map;