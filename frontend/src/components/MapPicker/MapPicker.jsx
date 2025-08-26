// MapPicker.jsx
import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { toast } from "react-toastify";
import config, { validateConfig } from "../../config/environment";
import "./MapPicker.css";

const MapPicker = ({
  onLocationSelect,
  initialLocation,
  isVisible = true,
  onClose,
  embedded = false,
  interactiveMode = false,
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation || null
  );
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Validate configuration on component mount
  useEffect(() => {
    if (!validateConfig()) {
      toast.error(
        "Google Maps configuration is missing. Please check your environment variables."
      );
      return;
    }
  }, []);

  useEffect(() => {
    if (!isVisible || !config.googleMaps.apiKey) return;

    const initializeMap = async () => {
      try {
        const loader = new Loader({
          apiKey: config.googleMaps.apiKey,
          version: config.googleMaps.version,
          libraries: config.googleMaps.libraries,
        });

        const google = await loader.load();

        const mapOptions = {
          center: selectedLocation || config.defaultLocation,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: false,
          zoomControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        };

        const newMap = new google.maps.Map(mapRef.current, mapOptions);
        setMap(newMap); // Update map state

        const newMarker = new google.maps.Marker({
          position: selectedLocation || config.defaultLocation,
          map: newMap,
          draggable: true,
          title: "Drag to select location",
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
              <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 25 15 25s15-16.716 15-25C30 6.716 23.284 0 15 0z" fill="#33e611"/>
                <circle cx="15" cy="15" r="8" fill="white"/>
                <circle cx="15" cy="15" r="4" fill="#33e611"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(30, 40),
            anchor: new google.maps.Point(15, 40),
          },
        });
        setMarker(newMarker); // Update marker state

        // Event listeners: Pass newMap and newMarker directly to updateLocation
        newMap.addListener("click", (event) => {
          const clickedLocation = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          };
          updateLocation(clickedLocation, newMarker, google, newMap);
        });

        newMarker.addListener("dragend", (event) => {
          const draggedLocation = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          };
          updateLocation(draggedLocation, newMarker, google, newMap);
        });

        // Initial geocoding if location exists
        if (selectedLocation) {
          reverseGeocode(selectedLocation, google);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        toast.error(
          "Failed to load map. Please check your internet connection."
        );
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [isVisible]);

  // Modified updateLocation function to accept mapInstance
  const updateLocation = (location, markerInstance, google, mapInstance) => {
    console.log("🗺️ Map clicked/dragged:", location);

    setSelectedLocation(location);
    markerInstance.setPosition(location);
    mapInstance.panTo(location);

    // For interactive mode, call onLocationSelect immediately with coordinates
    if (interactiveMode && onLocationSelect) {
      console.log("📍 Calling onLocationSelect immediately");

      // Call immediately with basic coordinates
      onLocationSelect({
        latitude: location.lat,
        longitude: location.lng,
        address: `Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(
          6
        )}`,
        roadName: "Getting address...",
      });

      reverseGeocode(location, google);
    } else {
      // For non-interactive mode, just do geocoding
      reverseGeocode(location, google);
    }
  };

  const reverseGeocode = async (location, google) => {
    try {
      const geocoder = new google.maps.Geocoder();

      const response = await new Promise((resolve, reject) => {
        geocoder.geocode({ location: location }, (results, status) => {
          if (status === "OK") {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });

      if (response && response.length > 0) {
        const result = response[0];
        const addressComponents = result.address_components;

        let roadName = "";
        let area = "";
        let city = "";

        addressComponents.forEach((component) => {
          const types = component.types;

          if (types.includes("route")) {
            roadName = component.long_name;
          } else if (
            types.includes("sublocality") ||
            types.includes("neighborhood")
          ) {
            area = component.long_name;
          } else if (
            types.includes("locality") ||
            types.includes("administrative_area_level_2")
          ) {
            city = component.long_name;
          }
        });

        let formattedAddress = "";
        if (roadName) {
          formattedAddress = roadName;
          if (area && area !== roadName) {
            formattedAddress += `, ${area}`;
          }
          if (city && city !== area) {
            formattedAddress += `, ${city}`;
          }
        } else {
          formattedAddress = result.formatted_address;
        }

        setAddress(formattedAddress);

        // Update parent with full address info
        if (onLocationSelect) {
          console.log("🏠 Updating with full address:", formattedAddress); 

          onLocationSelect({
            latitude: location.lat,
            longitude: location.lng,
            address: formattedAddress,
            roadName: roadName || formattedAddress.split(",")[0].trim(),
          });
        }
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      const fallbackAddress = `Lat: ${location.lat.toFixed(
        6
      )}, Lng: ${location.lng.toFixed(6)}`;
      setAddress(fallbackAddress);

      if (onLocationSelect) {
        onLocationSelect({
          latitude: location.lat,
          longitude: location.lng,
          address: fallbackAddress,
          roadName: "Coordinates only",
        });
      }
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser.");
      return;
    }

    setIsLoading(true);
    const locationToast = toast.loading("Getting your current location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Ensure map and marker are available from state before calling updateLocation
        if (map && marker) {
          updateLocation(currentLocation, marker, window.google, map);
          map.setZoom(17);
        }

        toast.dismiss(locationToast);
        toast.success("📍 Current location found!");
        setIsLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.dismiss(locationToast);
        toast.error(
          "Unable to get your location. Please select manually on the map."
        );
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleConfirmLocation = () => {
    if (selectedLocation && address) {
      onLocationSelect({
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        address: address,
        roadName: address.split(",")[0].trim(),
      });
      if (onClose) onClose();
      toast.success("📍 Location selected successfully!");
    } else {
      toast.error("Please select a location on the map.");
    }
  };

  if (!isVisible) return null;

  // Embedded mode - simplified layout
  if (embedded) {
    return (
      <div className="embedded-map-picker">
        <div className="embedded-map-controls">
          <button
            className="current-location-btn embedded"
            onClick={getCurrentLocation}
            disabled={isLoading}
          >
            🎯 Use Current Location
          </button>
          {selectedLocation && (
            <div className="embedded-location-info">
              <span className="embedded-coordinates">
                📍 {selectedLocation.lat.toFixed(6)},{" "}
                {selectedLocation.lng.toFixed(6)}
              </span>
              {address && (
                <span className="embedded-address">🛣️ {address}</span>
              )}
            </div>
          )}
        </div>

        <div className="embedded-map-container">
          {isLoading && (
            <div className="map-loading">
              <div className="loading-spinner"></div>
              <p>Loading map...</p>
            </div>
          )}
          <div
            ref={mapRef}
            className="google-map embedded"
            style={{
              width: "100%",
              height: "300px",
              display: isLoading ? "none" : "block",
              borderRadius: "8px",
            }}
          />
        </div>

        <div className="embedded-map-instructions">
          <p>
            💡 Click anywhere on the map to place a marker or drag the existing
            marker to adjust location
          </p>
        </div>
      </div>
    );
  }

  // Modal mode - original layout
  return (
    <div className="map-picker-overlay">
      <div className="map-picker-modal">
        <div className="map-picker-header">
          <h3>📍 Select Report Location</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="map-picker-content">
          <div className="map-controls">
            <button
              className="current-location-btn"
              onClick={getCurrentLocation}
              disabled={isLoading}
            >
              🎯 Use Current Location
            </button>
            <div className="map-location-info">
              {selectedLocation && (
                <>
                  <p className="coordinates">
                    📍 {selectedLocation.lat.toFixed(6)},{" "}
                    {selectedLocation.lng.toFixed(6)}
                  </p>
                  <p className="address">
                    🛣️ {address || "Getting address..."}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="map-container">
            {isLoading && (
              <div className="map-loading">
                <div className="loading-spinner"></div>
                <p>Loading map...</p>
              </div>
            )}
            <div
              ref={mapRef}
              className="google-map"
              style={{
                width: "100%",
                height: "400px",
                display: isLoading ? "none" : "block",
              }}
            />
          </div>

          <div className="map-instructions">
            <p>
              💡 <strong>Instructions:</strong>
            </p>
            <ul>
              <li>Click anywhere on the map to place a marker</li>
              <li>Drag the marker to fine-tune the location</li>
              <li>Use "Current Location" to auto-detect your position</li>
            </ul>
          </div>
        </div>

        <div className="map-picker-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="confirm-btn"
            onClick={handleConfirmLocation}
            disabled={!selectedLocation}
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPicker;
