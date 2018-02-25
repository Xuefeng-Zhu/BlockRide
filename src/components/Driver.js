import React, { Component } from 'react'
import { Form, Input, Col, Row, Layout, Button, Spin, Modal } from 'antd';

import Map from './Map';
import RiderModal from './RiderModal';
import { parseTrip } from '../utils/ride';

const FormItem = Form.Item;

class Driver extends Component {
  constructor(props) {
    super(props);
    this.state = {
      riders: []
    };
  }

  componentDidMount() {
    this.loadDriver();
  }

  loadLocation = () => {
    const { name, car } = this.state;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const drivers = [{
        name,
        car,
        id: this.props.account,
        lat: coords.latitude,
        lng: coords.longitude
      }]
      this.setState({
        drivers,
        position: {
          lat: coords.latitude,
          lng: coords.longitude
        }
      })
    })
  }

  loadDriver = () => {
    const { ride, account } = this.props;
    ride.drivers.call(account, {
      from: account,
    }).then((result) => {
      const [id, name, car, lat, lng, trip] = result;
      this.setState({
        name,
        car,
        driver: id,
        driving: !!lat.toNumber(),
        loaded: true
      });
      this.loadLocation();

      if (!trip) {
        this.loadRiders(0);
      }
    });
  }

  loadRiders = (index) => {
    const { ride, account } = this.props;
    ride.riderList.call(index, {
      from: account,
    }).then((result) => {
      this.loadRider(result);
      this.loadRiders(index + 1);
    });
  }

  loadRider = (rider) => {
    const { ride, account } = this.props;
    ride.trips.call(rider, {
      from: account,
    }).then((result) => {
      const trip = parseTrip(result);

      if (!trip) {
        return;
      }

      const riders = this.state.riders.slice();
      riders.push({
        id: trip.rider,
        lat: trip.origin.geo[0],
        lng: trip.origin.geo[1],
      })
      this.setState({ riders });
    });
  }

  register = () => {
    const { ride, account } = this.props;
    const name = this.nameInput.refs.input.value;
    const car = this.carInput.refs.input.value;

    ride.becomeDriver(name, car, {
      from: account,
      gas: 1000000
    }).then((result) => {
      this.setState({
        name
      });
    });
  }

  startDriving = () => {
    const { ride, account } = this.props;
    const { position } = this.state;
    const { latitude, longitude } = position

    ride.shareLoc(latitude * 100000, longitude * 100000, {
      from: account,
      gas: 1000000
    }).then((result) => {
      this.setState({
        driving: true
      });
    });
  }

  stopDriving = () => {
    const { ride, account } = this.props;

    ride.removeLoc({
      from: account,
      gas: 1000000
    }).then((result) => {
      this.setState({
        driving: false
      });
    });
  }

  onClickRider = (rider) => {
    this.setState({
      selectedRider: rider
    })
  }

  renderRegister = () =>
    <Modal
      className="register-modal"
      title="Register as a driver"
      closable={false}
      visible
      okText="OK"
      onOk={this.register}
    >
      <Form>
        <FormItem label="Name">
          <Input ref={el => this.nameInput = el} placeholder="Please enter your name" />
        </FormItem>

        <FormItem label="Car model">
          <Input ref={el => this.carInput = el} placeholder="Please enter your car model" />
        </FormItem>
      </Form>
    </Modal>

  renderActions() {
    const { driving } = this.state;

    if (!driving) {
      return (<Button type="primary" onClick={this.startDriving}>Prove of Drive!</Button>)
    }

    return (<Button type="danger" onClick={this.stopDriving}>Stop driving</Button>)
  }

  renderContent() {
    const { position, name, drivers, riders, selectedRider, driver } = this.state;
    const { ride, account } = this.props;

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
        <Map position={position} drivers={drivers} riders={riders} onClickRider={this.onClickRider}/>
        {selectedRider &&
          <RiderModal
            ride={ride}
            account={account}
            rider={selectedRider}
            driver={driver}
            onClose={() => this.setState({ selectedRider: null })}
          />}
      </div>
    );
  }

  render() {
    const { name, loaded } = this.state;

    if (!loaded) {
      return <Spin tip="Loading Driver Info..." />;
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

export default Driver;