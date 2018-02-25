import React, { Component } from 'react'
import { Form, Input, Col, Row, Layout, Button, Spin, Modal } from 'antd';

import Map from './Map';
import Trip from './Trip';

import { parseTrip } from '../utils/ride';

const FormItem = Form.Item;
const ButtonGroup = Button.Group;

class Rider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      drivers: []
    };
  }

  componentDidMount() {
    this.loadRider();
  }

  loadRider = () => {
    const { ride, account } = this.props;
    ride.riders.call(account, {
      from: account,
    }).then((result) => {
      this.setState({
        loaded: true,
        name: result[1]
      });
      this.loadDrivers(0);
      this.loadLocation();
      this.loadTrip();
    });
  }

  loadLocation = () => {
    navigator.geolocation.getCurrentPosition(({ coords}) => {
      const riders = [{
        id: this.props.account,
        name,
        lat: coords.latitude,
        lng: coords.longitude
      }]
      this.setState({
        riders,
        position: {
          lat: coords.latitude,
          lng: coords.longitude
        }
      })
    })
  }

  loadTrip = () => {
    const { ride, account } = this.props;

    ride.trips.call(account, {
      from: account,
    }).then((result) => {
      const trip = parseTrip(result);
      if (!trip) {
        return;
      }

      this.setState({
        trip,
        requestRide: false
      });
    });
  }

  loadDrivers = (index) => {
    const { ride, account } = this.props;
    ride.driverList.call(index, {
      from: account,
    }).then((result) => {
      this.loadDriver(result);
      this.loadDrivers(index + 1);
    });
  }

  loadDriver = (driver) => {
    const { ride, account } = this.props;
    ride.drivers.call(driver, {
      from: account,
    }).then((result) => {
      const drivers = this.state.drivers.slice();
      drivers.push({
        id: result[0],
        name: result[1],
        car: result[2],
        lat: result[3].toNumber() / 100000,
        lng: result[4].toNumber() / 100000,
      })
      this.setState({ drivers });
    });
  }

  register = () => {
    const { ride, account } = this.props;
    const name = this.nameInput.refs.input.value;

    ride.becomeRider(name, {
      from: account,
      gas: 1000000
    }).then((result) => {
      this.setState({
        name
      });
    });
  }

  cancelTrip = () => {
    const { ride, account } = this.props;

    ride.stopTrip({
      from: account,
      gas: 1000000
    }).then((result) => {
      this.setState({
        trip: null
      });
    });
  }

  openTripModal = () => {
    this.setState({ requestRide: true });
  }

  renderRegister = () =>
    <Modal
      className="register-modal"
      title="Register as a rider"
      closable={false}
      visible
      okText="OK"
      onOk={this.register}
    >
      <Form>
        <FormItem label="Name">
          <Input ref={el => this.nameInput = el} placeholder="Please enter your name" />
        </FormItem>
      </Form>
    </Modal>

  renderActions() {
    const { trip } = this.state;

    if (!trip) {
      return (<Button type="primary" onClick={this.openTripModal}>Request a ride</Button>)
    }

    return (
      <ButtonGroup>
        <Button onClick={this.openTripModal}>Update the ride</Button>
        <Button type="danger" onClick={this.cancelTrip}>Cancel the ride</Button>
      </ButtonGroup>
    )
  }

  renderContent() {
    const { ride, account } = this.props;
    const { position, name, drivers, riders, requestRide, trip } = this.state;


    if (!position) {
      return <Spin tip="Loading Location..." />;
    }

    if (!name) {
      return this.renderRegister();
    }

    return (
      <div>
        <Row className="header-row" type="flex" align="middle" justify="space-between">
          <Col>
            <h2>Hi {name}!</h2>
          </Col>
          <Col>
            {this.renderActions()}
          </Col>
        </Row>
        {
          requestRide &&
          <Trip
            ride={ride}
            account={account}
            trip={trip}
            onClose={() => this.setState({requestRide: false})}
            onSubmit={this.loadTrip}
          />
        }
        <Map
          position={position}
          drivers={drivers}
          riders={riders}
          origin={trip && trip.origin.geo}
          destination={trip && trip.destination.geo}
        />
      </div>
    );
  }

  render() {
    const { name, loaded } = this.state;

    if (!loaded) {
      return <Spin tip="Loading Rider Info..." />;
    }

    if (!name) {
      return this.renderRegister();
    }

    return (
      <Layout style={{ padding: '0 24px', background: '#fff' }}>
        {this.renderContent()}
      </Layout >
    );
  }
}

export default Rider;