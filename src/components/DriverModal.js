import React, { Component } from 'react'
import { Modal, Card, Input, Tabs, Rate } from 'antd';
import { ChatFeed } from 'react-chat-ui'
import _ from 'underscore';

import { database } from '../utils/firebase';
import Map from './Map';

const TabPane = Tabs.TabPane;

class DriverModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: []
    };
  }

  componentDidMount() {
    this.loadDriver();
  }

  loadDriver = () => {
    const { ride, account, driver } = this.props;
    ride.drivers.call(driver, {
      from: account,
    }).then((result) => {
      const [id, name, car, lat, lng] = result;
      this.setState({
        driver: {
          id,
          name,
          car,
          lat: lat.toNumber() / 100000,
          lng: lng.toNumber() / 100000,
        }
      });
      this.listenMessage();
    });
  }

  listenMessage = () => {
    const { driver, account } = this.props;
    this.messagesRef = database.ref(`messages/${account}/${driver}`);
    this.messagesRef.on('child_added', (data) => {
      const messages = this.state.messages.slice();
      const { message, sender } = data.val();
      messages.push({
        message,
        id: sender === account ? 0 : 1,
        senderName: sender === account ? 'You' : this.state.driver.name
      });
      this.setState({
        messages
      })
    });
  }

  sendMessage = (e) => {
    this.messagesRef.push({
      message: e.target.value,
      sender: this.props.account
    });

    e.target.value = '';
  }


  confirmTrip = () => {
    const { ride, account, driver, onClose } = this.props;
    ride.confirmTrip(driver, {
      from: account
    }).then(() => {
      database.ref(`confirm/${driver}`).set(account);
      onClose();
    });
  }

  denyTrip = () => {
    const { ride, account, driver, onClose } = this.props;
    onClose();
    // ride.denyTrip(driver, {
    //   from: account,
    //   gas: 10000000
    // }).then(() => {
    // });
  }

  renderDriverInfo() {
    const { driver } = this.state;

    if (!driver) {
      return
    }

    return (
      <Card title="Driver Info" style={{ width: '100%' }}>
        <div><b>Name:</b> {driver.name}</div>
        <div><b>Car:</b> {driver.car}</div>
        <div><b>Rating:</b> <Rate value={4.5} /></div>
        <Map position={driver} drivers={[driver]}/>
      </Card>
    )
  }

  renderChat = () => {
    const { messages } = this.state;

    return (
      <div>
        <ChatFeed
          messages={messages}
          hasInputField={false}
          showSenderName
        />
        <Input placeholder="Type message" onPressEnter={this.sendMessage} />
      </div>
    )
  }

  render() {
    return (
      <Modal
        visible
        title="Rider trip"
        okText="Confirm"
        cancelText="Deny"
        onOk={this.confirmTrip}
        onCancel={this.denyTrip}
      >
        <Tabs>
          <TabPane tab="Info" key="info">
            {this.renderDriverInfo()}
          </TabPane>
          <TabPane tab="Chat" key="chat">{this.renderChat()}</TabPane>
        </Tabs>

      </Modal>
    );
  }
}

export default DriverModal;