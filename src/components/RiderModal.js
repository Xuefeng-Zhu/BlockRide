import React, { Component } from 'react'
import { Modal, Card } from 'antd';

import Map from './Map';
import { parseTrip } from '../utils/ride';

class RiderModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.loadRider();
  }

  loadRider = () => {
    const { ride, account, rider } = this.props;
    ride.riders.call(rider, {
      from: account,
    }).then((result) => {
      this.setState({
        rider: {
          name: result[1]
        }
      });
      this.loadTrip();
    });
  }

  loadTrip = () => {
    const { ride, account, rider } = this.props;

    ride.trips.call(rider, {
      from: account,
    }).then((result) => {
      const trip = parseTrip(result);

      this.setState({
        trip
      });
    });
  }

  renderRiderInfo() {
    const { rider } = this.state;

    if (!rider) {
      return
    }

    return (
      <Card title="Rider Info" style={{ width: '100%' }}>
        <div><b>Name:</b> {rider.name}</div>
      </Card>
    )
  }

  renderRiderTrip() {
    const { trip } = this.state;

    if (!trip) {
      return
    }

    return (
      <Card title="Trip Info" style={{ width: '100%' }}>
        <div><b>Origin:</b> {trip.origin.address}</div>
        <div><b>Destination:</b> {trip.destination.address}</div>
        <div><b>Price:</b> {trip.price}</div>
        <Map origin={trip.origin.geo} destination={trip.destination.geo} />
      </Card>
    )
  }


  render() {
    return (
      <Modal
        visible
        title="Rider trip"
        okText="Accept"
        cancelText="Cancel"
        onOk={this.shareTrip}
        onCancel={this.props.onClose}
      >
        {this.renderRiderInfo()}
        {this.renderRiderTrip()}
      </Modal>
    );
  }
}

export default RiderModal;