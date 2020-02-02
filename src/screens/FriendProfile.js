/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {Thumbnail, Item, Card, Input, Label} from 'native-base';
import {withNavigation} from 'react-navigation';
import firebase from 'react-native-firebase';
import AsyncStorage from '@react-native-community/async-storage';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0DBEDF',
  },
  image: {
    backgroundColor: 'grey',
    width: '40%',
    height: '60%',
    borderRadius: 100,
    alignSelf: 'center',
    marginTop: 30,
  },
  button: {
    backgroundColor: '#F4CF5D',
    marginTop: 5,
    marginRight: 10,
    marginLeft: 10,
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    borderRadius: 10,
  },
});

class FriendProfiles extends Component {
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

  componentDidMount = async () => {
    const {currentUser} = firebase.auth();
    const userId = await AsyncStorage.getItem('userid');
    const userName = await AsyncStorage.getItem('user.name');
    const userAvatar = await AsyncStorage.getItem('user.photo');
    const userEmail = await AsyncStorage.getItem('user.email');
    this.setState({currentUser, userId, userName, userAvatar, userEmail});
  };

  render() {
    return (
      <View style={styles.root}>
        <View style={{height: 50, backgroundColor: '#F4CF5D'}}>
          <View style={{marginLeft: 10, marginTop: 20}}>
            <Text style={{fontFamily: 'Think Smart', fontSize: 20}}>
              {' '}
              {this.state.person.name}{' '}
            </Text>
          </View>
        </View>
        <View style={{height: '40%'}}>
          <Thumbnail
            style={styles.image}
            source={{
              uri: this.state.person.photo,
            }}
          />
        </View>
        <Card
          style={{
            marginLeft: 10,
            marginRight: 10,
            borderRadius: 20,
            elevation: 5,
            height: '40%',
            opacity: 0.8,
            padding: 15,
            marginTop: -15,
          }}>
          <Item
            floatingLabel
            style={{marginRight: 10, marginLeft: 10, marginBottom: 10}}>
            <Label style={{marginTop: 10, fontSize: 13}}> Name </Label>
            <Input value={this.state.person.name} disabled />
          </Item>
          <Item
            floatingLabel
            style={{marginRight: 10, marginLeft: 10, marginBottom: 10}}>
            <Label style={{marginTop: 10, fontSize: 13}}>Email</Label>
            <Input
              keyboardType="email-address"
              value={this.state.person.email}
              disabled
            />
          </Item>
          <Item
            floatingLabel
            style={{marginRight: 10, marginLeft: 10, marginBottom: 10}}>
            <Label style={{marginTop: 10, fontSize: 13}}>No. Handphone</Label>
            <Input value="089695780942" disabled />
          </Item>
        </Card>
      </View>
    );
  }
}

const FriendProfile = withNavigation(FriendProfiles);
export default FriendProfile;
