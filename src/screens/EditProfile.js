/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {Text, View, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {Item, Input, Label} from 'native-base';
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
    height: '75%',
    borderRadius: 100,
    alignSelf: 'center',
    marginTop: 30,
  },
  button: {
    backgroundColor: '#F4CF5D',
    marginTop: 5,
    marginBottom: 5,
    marginRight: 10,
    marginLeft: 10,
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    borderRadius: 10,
  },
});

class Headers extends Component {
  render() {
    return (
      <View style={{height: 50, backgroundColor: '#F4CF5D'}}>
        <View style={{marginLeft: 10, marginTop: 20}}>
          <Text style={{fontFamily: 'Think Smart', fontSize: 20}}>
            {' '}
            Edit Profile{' '}
          </Text>
        </View>
      </View>
    );
  }
}

class EditProfiles extends Component {
  state = {
    currentUser: null,
    userId: null,
    permissionsGranted: null,
    errorMessage: null,
    loading: false,
    updatesEnabled: false,
    location: {},
    photo: null,
    imageUri: null,
    imgSource: '',
    uploading: false,
    name: '',
    email: '',
  };

  componentDidMount = async () => {
    const id = firebase.auth().currentUser.uid;
    const db = firebase.database().ref('user/' + id);
    db.once('value').then(data => {
      const item = data.val();
      this.setState({
        name: item.name,
        email: item.email,
      });
    });
  };

  handleSave = () => {
    const {name, email} = this.state;
    this.setState({
      isLoading: true,
    });
    if ((!name, !email)) {
      // eslint-disable-next-line no-alert
      alert('Semua isi form harus di isi');
    } else {
      const id = firebase.auth().currentUser.uid;
      firebase
        .database()
        .ref('user/' + id)
        .update({
          name,
          email,
        })
        .then(data => {
          AsyncStorage.setItem('user.name', name);
          Alert.alert(
            'Succes!',
            'Your data changed!',
            [
              {
                text: 'OK',
                onPress: () => this.props.navigation.navigate('Profile'),
              },
            ],
            {cancelable: false},
          );
        })
        .catch(error => {
          //error callback
          // eslint-disable-next-line no-alert
          alert(error);
          console.log('error ', error);
        });
    }
  };

  handleChange = key => val => {
    this.setState({[key]: val});
  };

  render() {
    return (
      <View style={styles.root}>
        <Headers />
        <View style={{height: '20%'}} />
        <Item
          floatingLabel
          style={{marginRight: 10, marginLeft: 10, marginBottom: 10}}>
          <Label style={{marginTop: 10, fontSize: 13}}> Name </Label>
          <Input
            value={this.state.name}
            onChangeText={this.handleChange('name')}
          />
        </Item>
        <Item
          floatingLabel
          style={{marginRight: 10, marginLeft: 10, marginBottom: 10}}>
          <Label style={{marginTop: 10, fontSize: 13}}>Email</Label>
          <Input
            keyboardType="email-address"
            value={this.state.email}
            disable
          />
        </Item>
        <Item
          floatingLabel
          style={{marginRight: 10, marginLeft: 10, marginBottom: 10}}>
          <Label style={{marginTop: 10, fontSize: 13}}>No. Handphone</Label>
          <Input value="089695780942" disabled />
        </Item>
        <TouchableOpacity onPress={this.handleSave}>
          <View style={styles.button}>
            <Text style={{fontWeight: 'bold'}}>Save</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const EditProfile = withNavigation(EditProfiles);
export default EditProfile;
