import React, { Component } from 'react'
import RideContract from '../build/contracts/Ride.json'
import getWeb3 from './utils/getWeb3'

import { Layout, Menu, Spin, Alert } from 'antd';

import 'antd/dist/antd.css';
import './App.css';

const { Header, Content, Footer } = Layout;

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null,
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const Ride = contract(RideContract)
    Ride.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on Ride.
    var RideInstance

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.setState({
        account: accounts[0],
      });
      Ride.deployed().then((instance) => {
        RideInstance = instance
        this.setState({
          Ride: instance
        });
      })
    })
  }

  onSelectTab = ({key}) => {
    this.setState({
      mode: key
    });
  }

  renderContent = () => {
    const { account, Ride, web3, mode } = this.state;

    if (!Ride) {
      return <Spin tip="Loading..." />;
    }

  }

  render() {
    return (
      <Layout>
        <Header className="header">
          <div className="logo">Open Ride</div>
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['employer']}
            style={{ lineHeight: '64px' }}
            onSelect={this.onSelectTab}
          >
            <Menu.Item key="employer">Rider</Menu.Item>
            <Menu.Item key="employee">Driver</Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <Layout style={{ padding: '24px 0', background: '#fff', minHeight: '600px' }}>
            {this.renderContent()}
          </Layout>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Open Ride
        </Footer>
      </Layout>
    );
  }
}

export default App