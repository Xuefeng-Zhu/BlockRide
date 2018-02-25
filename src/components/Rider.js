import React, { Component } from 'react'
import { Form, Input, Col, Row, Layout, Button, Spin, Modal, notification } from 'antd';

import Map from './Map';
import Trip from './Trip';
import DriverModal from './DriverModal';
import { parseTrip } from '../utils/ride';
import { database } from '../utils/firebase';

const FormItem = Form.Item;
const ButtonGroup = Button.Group;

class Rider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      drivers: {}
    };
  }

  componentDidMount() {
    this.loadRider();
    this.subFirebase();
  }

  subFirebase = () => {
    const { account } = this.props;
    const tripRef = database.ref(`trip/${account}`);
    tripRef.on('value', (snapshot) => {
      const driverId = snapshot.val();
      if (driverId) {
        this.loadDriver(driverId, (driver) => {
          const key = `open${Date.now()}`;
          const btn = (
            <Button
              type="primary"
              size="small"
              onClick={() => {
                notification.close(key);
                this.openDriverModal(driver.id);
              }}
            >
              Check
            </Button>
          );
          notification.open({
            message: 'Trip is accepted',
            description: `${driver.name} has accepted your trip`,
            btn,
            key,
          });

        });
        tripRef.set(null);
      }
    });

    database.ref('driving/new').on('value', (snapshot) => {
      const driverId = snapshot.val();
      if (driverId) {
        this.loadDriver(driverId);
        database.ref('driving/new').set(null);
      }
    })
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
    navigator.geolocation.getCurrentPosition(({ coords }) => {
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

  loadDriver = (driver, cb) => {
    const { ride, account } = this.props;
    ride.drivers.call(driver, {
      from: account,
    }).then((result) => {
      const drivers = Object.assign({} ,this.state.drivers);
      const [id, name, car, lat, lng] = result;
      drivers[id] = {
        id,
        name,
        car,
        lat: lat.toNumber() / 100000,
        lng: lng.toNumber() / 100000,
      }
      this.setState({ drivers });

      if (cb) {
        cb(drivers[id]);
      }
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

  openDriverModal = (driver) => {
    this.setState({
      selectedDriver: driver
    })
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
    const { position, name, drivers, riders, requestRide, trip, selectedDriver } = this.state;


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
          drivers={Object.values(drivers)}
          riders={riders}
          origin={trip && trip.origin.geo}
          destination={trip && trip.destination.geo}
          onClickDriver={this.openDriverModal}
        />
        {selectedDriver &&
          <DriverModal
            ride={ride}
            account={account}
            driver={selectedDriver}
            onClose={() => this.setState({ selectedDriver: null })}
          />}
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