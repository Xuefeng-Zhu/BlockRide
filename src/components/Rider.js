import React, { Component } from 'react'
import { Form, Input, Col, Row, Layout, Button, Spin, Modal } from 'antd';

import Map from './Map';

const FormItem = Form.Item;

class Rider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      drivers: []
    };
  }

  componentDidMount() {
    this.loadRider();
    this.loadDrivers(0);
  }

  loadLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      this.setState({
        position: position.coords
      })
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
      this.loadLocation();
    });
  }

  loadDrivers = (index) => {
    const { ride, account } = this.props;
    ride.riderList.call(index, {
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

  }

  renderContent() {
    const { position, name, drivers } = this.state;


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
        <Map position={position} drivers={drivers}/>
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