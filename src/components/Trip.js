import React, { Component } from 'react'
import { Form, Input, Modal } from 'antd';
import _ from 'underscore';

import AddressSearch from './AddressSearch';
import Map from './Map';

const FormItem = Form.Item;

const getFormatedAddress = ({ formatted_address, geometry: { location } }) => {
  const lat = location.lat();
  const lng = location.lng();
  return `${formatted_address} at ${lat},${lng}`
}

const getAddressGeo = ({ geometry: { location } }) => {
  const lat = location.lat();
  const lng = location.lng();
  return [lat, lng];
}

class Trip extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  shareTrip = () => {
    const { ride, account, trip, onSubmit } = this.props;
    const { origin, destination } = this.state;
    const price = this.priceInput.refs.input.value;
    const formattedOrigin = origin ? getFormatedAddress(origin) : (trip && trip.origin.raw);
    const formattedDestination = destination ? getFormatedAddress(destination) : (trip && trip.destination.raw);

    ride.shareTrip(formattedOrigin, formattedDestination, price, {
      from: account,
      gas: 1000000
    }).then((result) => {
      onSubmit();
    });
  }

  renderMap = () => {
    const { origin, destination } = this.state;
    if (origin && destination) {
      const originGeo = getAddressGeo(origin);
      const destinationGeo = getAddressGeo(destination);

      return (<Map origin={originGeo} destination={destinationGeo} />);
    }
  }

  render() {
    const { trip } = this.props;
    return (
      <Modal
        visible
        title="Request a trip"
        okText="OK"
        cancelText="Cancel"
        onOk={this.shareTrip}
        onCancel={this.props.onClose}
      >
        <Form>
          <FormItem label="Origin">
            <AddressSearch
              defaultValue={trip && trip.origin.address}
              onSearchBoxMounted={el => this.originInput = el}
              onPlacesChanged={() => this.setState({origin: this.originInput.getPlaces()[0]})}
            />
          </FormItem>

          <FormItem label="Destination">
            <AddressSearch
              defaultValue={trip && trip.destination.address}
              onSearchBoxMounted={el => this.destinationInput = el}
              onPlacesChanged={() => this.setState({destination: this.destinationInput.getPlaces()[0]})}
            />
          </FormItem>

          <FormItem label="Price">
            <Input
              defaultValue={_.result(trip, 'price')}
              ref={el => this.priceInput = el}
              placeholder="Please enter the price you desired" />
          </FormItem>
        </Form>
        {this.renderMap()}
      </Modal>
    );
  }
}

export default Trip;