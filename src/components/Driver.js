import React, { Component } from 'react'
import { Form, Input, Col, Row, Layout, Button, Spin, Modal } from 'antd';
import _ from 'underscore';

import Map from './Map';
import RiderModal from './RiderModal';
import { parseTrip } from '../utils/ride';
import { database } from '../utils/firebase';

const FormItem = Form.Item;

class Driver extends Component {
  constructor(props) {
    super(props);
    this.state = {
      riders: {}
    };
  }

  componentDidMount() {
    this.loadDriver();
    this.subFirebase();
  }

  subFirebase = () => {
    const { account } = this.props
    database.ref(`confirm/${account}`).on('value', (snapshot) => {
      const riderId = snapshot.val();

      if (riderId) {
        database.ref(`confirm/${account}`).set(null);
        this.setState({
          trip: riderId
        })
        this.loadRider(riderId);
      }
    })
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
      console.log(coords)
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

      if (trip === '0x0000000000000000000000000000000000000000') {
        this.loadRiders(0);
      } else {
        this.loadRider(trip);
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

      const riders = Object.assign({}, this.state.riders);
      riders[rider] = {
        id: trip.rider,
        lat: trip.origin.geo[0],
        lng: trip.origin.geo[1],
      }
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
    const { lat, lng} = position

    ride.shareLoc(lat * 100000, lng * 100000, {
      from: account,
      gas: 1000000
    }).then((result) => {
      this.setState({
        driving: true
      });

      database.ref('driving/new').set(account);
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

  onRiderModal = (rider) => {
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
    const { driving, riders, trip } = this.state;
    const { account } = this.props;

    if (_(riders[trip], 'trip.driver') === account) {
      return (<Button>On a trip</Button>)
    }

    if (!driving) {
      return (<Button type="primary" onClick={this.startDriving}>Prove of Drive!</Button>)
    }

    return (<Button type="danger" onClick={this.stopDriving}>Stop driving</Button>)
  }

  renderContent() {
    const { position, name, drivers, riders, selectedRider } = this.state;
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
        <Map
          position={position}
          drivers={drivers}
          riders={Object.values(riders)}
          onClickRider={this.onRiderModal}
        />
        {selectedRider &&
          <RiderModal
            ride={ride}
            rider={selectedRider}
            account={account}
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