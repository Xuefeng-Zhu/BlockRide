import React, { Component } from 'react'
import { Modal, Card, Input, Tabs, message, Rate } from 'antd';
import { ChatFeed } from 'react-chat-ui'

import Map from './Map';
import { parseTrip } from '../utils/ride';
import { database } from '../utils/firebase';

const TabPane = Tabs.TabPane;

class RiderModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: []
    };
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
      this.listenMessage();
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

  listenMessage = () => {
    const { account, rider } = this.props;
    this.messagesRef = database.ref(`messages/${rider}/${account}`);
    this.messagesRef.on('child_added', (data) => {
      const messages = this.state.messages.slice();
      const { message, sender } = data.val();
      messages.push({
        message,
        id: sender === account ? 0 : 1,
        senderName: sender === account ? 'You' : this.state.rider.name
      });
      this.setState({
        messages
      })
    });
  }

  sendMessage = (e) => {
    this.messagesRef.push({
      message: e.target.value,
      sender: this.props.driver
    });

    e.target.value = '';
  }

  acceptTrip = () => {
    const { ride, account, rider } = this.props;
    ride.acceptTrip(rider, {
      from: account,
    }).then(() => {
      message.success('Wait for the rider to confirm');
      database.ref(`trip/${rider}`).set(account);
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
        <div><b>Rating:</b> <Rate value={5} /></div>
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

  renderChat = () => {
    const { messages } = this.state;

    return (
      <div>
        <ChatFeed
          messages={messages}
          hasInputField={false}
          showSenderName
        />
        <Input placeholder="Type message"  onPressEnter={this.sendMessage}/>
      </div>
    )
  }

  render() {
    return (
      <Modal
        visible
        title="Rider trip"
        okText="Accept"
        cancelText="Cancel"
        onOk={this.acceptTrip}
        onCancel={this.props.onClose}
      >
        <Tabs>
          <TabPane tab="Info" key="info">
            {this.renderRiderInfo()}
            {this.renderRiderTrip()}
          </TabPane>
          <TabPane tab="Chat" key="chat">{this.renderChat()}</TabPane>
        </Tabs>

      </Modal>
    );
  }
}

export default RiderModal;