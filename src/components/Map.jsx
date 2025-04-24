import { useEffect, useRef } from "react";
import leaflet from "leaflet";
import useLocalStorage from "../hooks/useLocalStorage";
import useGeolocation from "../hooks/useGeolocation";
import FindMeButton from "./FindMeButton";

export default function Map() {
  const mapRef = useRef();
  const userMarkerRef = useRef();

  const [userPosition, setUserPosition] = useLocalStorage("USER_MARKER", {
    latitude: 0,
    longitude: 0,
  });

  const [nearbyMarkers, setNearbyMarkers] = useLocalStorage(
    "NEARBY_MARKERS",
    []
  );

  const { position, loading, error } = useGeolocation();

  useEffect(() => {
    mapRef.current = leaflet
      .map("map")
      .setView([userPosition.latitude, userPosition.longitude], 13);

    leaflet
      .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      })
      .addTo(mapRef.current);

    nearbyMarkers.forEach(({ latitude, longitude }) => {
      leaflet
        .marker([latitude, longitude])
        .addTo(mapRef.current)
        .bindPopup(
          `lat: ${latitude.toFixed(2)}, long: ${longitude.toFixed(2)}`
        );
    });

    // mapRef.current.addEventListener("click", (e) => {
    //   const { lat: latitude, lng: longitude } = e.latlng;
    //   leaflet
    //     .marker([latitude, longitude])
    //     .addTo(mapRef.current)
    //     .bindPopup(
    //       `lat: ${latitude.toFixed(2)}, long: ${longitude.toFixed(2)}`
    //     );

    //   setNearbyMarkers((prevMarkers) => [
    //     ...prevMarkers,
    //     { latitude, longitude },
    //   ]);
    // });
  }, []);

  const handleFindMe = () => {
    if (position.latitude !== 0 && position.longitude !== 0) {
      mapRef.current.setView([position.latitude, position.longitude], 15);
    }
  };

  useEffect(() => {
    if (position.latitude !== 0 && position.longitude !== 0) {
      setUserPosition({ ...position });

      if (userMarkerRef.current) {
        mapRef.current.removeLayer(userMarkerRef.current);
      }

      userMarkerRef.current = leaflet
        .marker([position.latitude, position.longitude])
        .addTo(mapRef.current)
        .bindPopup("Your Location");

      const el = userMarkerRef.current.getElement();
      if (el) {
        el.style.filter = "hue-rotate(120deg)";
      }
    }
  }, [position]);

  return (
    <div className="map-container">
      <div id="map" ref={mapRef}></div>
      <FindMeButton onFindMe={handleFindMe} loading={loading} error={error} />
    </div>
  );
}
