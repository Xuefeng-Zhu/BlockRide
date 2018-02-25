import React from "react";
import { compose, withProps, lifecycle } from "recompose";
import { withScriptjs, withGoogleMap, GoogleMap, Marker, DirectionsRenderer } from "react-google-maps";

const icons = {
    car: {
    scaledSize: { width: 30, height: 30 },
    url: 'https://png.icons8.com/metro/1600/car.png'
  },
  rider: {
    scaledSize: { width: 30, height: 30 },
    url: 'https://cdn1.iconfinder.com/data/icons/complete-medical-healthcare-icons-for-apps-and-web/128/human-body1-512.png'
  }
}

const renderDriverMarker = (drivers) =>
  drivers.map(driver => (
    <Marker key={driver.id} position={{ lat: driver.lat, lng: driver.lng }} icon={icons.car} />
  ))


const renderRiderMarker = (riders, onClickRider) =>
  riders.map(rider => (
    <Marker
      key={rider.id}
      position={{ lat: rider.lat, lng: rider.lng }}
      icon={icons.rider}
      onClick={() => onClickRider(rider.id)}
    />
  ))

export default compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyC4R6AN7SmujjPUIGKdyao2Kqitzr1kiRg&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withScriptjs,
  withGoogleMap,
  lifecycle({
    getDirection(props) {
      /*eslint-disable */
      const DirectionsService = new google.maps.DirectionsService();
      const { origin, destination } = props;

      if (!origin || !destination) {
        return;
      }

      DirectionsService.route({
        origin: new google.maps.LatLng(origin[0], origin[1]),
        destination: new google.maps.LatLng(destination[0], destination[1]),
        travelMode: google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.setState({
            directions: result,
          });
        } else {
          console.error(`error fetching directions ${result}`);
        }
      });
      /*eslint-enable */
    },
    componentDidMount() {
      this.getDirection(this.props);
    },

    componentWillUpdate(nextProps) {
      this.getDirection(nextProps);
    }
  })
)(({ position, drivers = [], riders = [], directions, onClickRider}) =>
  <GoogleMap
    defaultZoom={20}
    defaultCenter={position}
  >
    {renderDriverMarker(drivers)}
    {renderRiderMarker(riders, onClickRider)}
    {directions && <DirectionsRenderer directions={directions} />}
  </GoogleMap>
)