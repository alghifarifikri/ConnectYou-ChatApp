/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {Text, View, Image} from 'react-native';
import {Container} from 'native-base';
import {GiftedChat, Send} from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-community/async-storage';
import {Bubble} from 'react-native-gifted-chat';
import firebase from 'react-native-firebase';

export default class ChatRoom extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      title: navigation.getParam('item').name,
      headerStyle: {
        backgroundColor: '#f48023',
        height: 100,
      },
      headerTitleStyle: {
        color: 'white',
      },
    };
  };
  state = {
    message: '',
    messageList: [],
    person: this.props.navigation.getParam('item'),
    userId: AsyncStorage.getItem('userid'),
    userName: AsyncStorage.getItem('user.name'),
    userAvatar: AsyncStorage.getItem('user.photo'),
  };

  onSend = async () => {
    if (this.state.message.length > 0) {
      let msgId = firebase
        .database()
        .ref('messages')
        .child(this.state.userId)
        .child(this.state.person.id)
        .push().key;
      let updates = {};
      let message = {
        _id: msgId,
        text: this.state.message,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        user: {
          _id: this.state.userId,
          name: this.state.userName,
          avatar: this.state.userAvatar,
        },
      };
      updates[
        'messages/' +
          this.state.userId +
          '/' +
          this.state.person.id +
          '/' +
          msgId
      ] = message;
      updates[
        'messages/' +
          this.state.person.id +
          '/' +
          this.state.userId +
          '/' +
          msgId
      ] = message;
      firebase
        .database()
        .ref()
        .update(updates);
      this.setState({message: ''});
    }
  };

  componentDidMount = async () => {
    const userId = await AsyncStorage.getItem('userid');
    const userName = await AsyncStorage.getItem('user.name');
    const userAvatar = await AsyncStorage.getItem('user.photo');
    this.setState({userId, userName, userAvatar});
    firebase
      .database()
      .ref('messages')
      .child(this.state.userId)
      .child(this.state.person.id)
      .on('child_added', val => {
        this.setState(previousState => ({
          messageList: GiftedChat.append(previousState.messageList, val.val()),
        }));
      });
  };

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#F3AC14',
          },
        }}
      />
    );
  }

  renderSend(props) {
    return (
      <Send {...props}>
        <View
          style={{
            marginRight: 30,
            marginBottom: 25,

            width: 35,
            height: 35,
          }}>
          <Image
            source={require('../image/send.png')}
            resizeMode={'center'}
            width={'40'}
            height={'40'}
          />
        </View>
      </Send>
    );
  }

  render() {
    // const {userName} = this.state;
    return (
      <View style={{flex: 1}}>
        <View style={{height: 50, backgroundColor: '#F4CF5D'}}>
          <View style={{marginLeft: 10, marginTop: 20, alignItems: 'center'}}>
            <Text style={{fontFamily: 'Think Smart', fontSize: 25}}>
              {this.state.person.name}
            </Text>
          </View>
        </View>
        <Container>
          <View style={{backgroundColor: '#F6F5F1', flex: 1}}>
            <GiftedChat
              renderSend={this.renderSend}
              renderBubble={this.renderBubble}
              text={this.state.message}
              onInputTextChanged={val => {
                this.setState({message: val});
              }}
              messages={this.state.messageList}
              onSend={() => this.onSend()}
              user={{
                _id: this.state.userId,
              }}
            />
          </View>
        </Container>
        {/* <FooterSend /> */}
      </View>
    );
  }
}
