import React from "react";
import { compose, withProps } from "recompose";
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps";
import { Icon } from 'antd';

const icons = {
    car: {
    scaledSize: { width: 30, height: 30 },
    url: 'https://png.icons8.com/metro/1600/car.png'
  },
  rider: {
    scaledSize: { width: 30, height: 30 },
    url: 'http://www.iconexperience.com/_img/i_collection_png/512x512/plain/person.png'
  }
}

const renderDriverMarker = (drivers) =>
  drivers.map(driver => (
    <Marker key={driver.id} position={{ lat: driver.lat, lng: driver.lng }} icon={icons.car} />
  ))


const renderRiderMarker = (riders) =>
  riders.map(rider => (
    <Marker key={rider.id} position={{ lat: rider.lat, lng: rider.lng }} icon={icons.rider} />
  ))

export default compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withScriptjs,
  withGoogleMap
)(({ position, drivers = [], riders = []}) =>
  <GoogleMap
    defaultZoom={20}
    defaultCenter={{ lat: position.latitude, lng: position.longitude }}
  >
    {renderDriverMarker(drivers)}
    {renderRiderMarker(riders)}
  </GoogleMap>
)