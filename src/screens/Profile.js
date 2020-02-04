/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import {Thumbnail, Item, Card, Input, Label} from 'native-base';
import {withNavigation} from 'react-navigation';
import firebase from 'react-native-firebase';
import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'react-native-fetch-blob';

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
    width: 100,
  },
});

class Headers extends Component {
  render() {
    return (
      <View style={{height: 50, backgroundColor: '#F4CF5D'}}>
        <View style={{marginLeft: 10, marginTop: 20}}>
          <Text style={{fontFamily: 'Think Smart', fontSize: 20}}>
            {' '}
            Profile{' '}
          </Text>
        </View>
      </View>
    );
  }
}

class Profiles extends Component {
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
  };

  componentDidMount = async () => {
    const {currentUser} = firebase.auth();
    const userId = await AsyncStorage.getItem('userid');
    const userName = await AsyncStorage.getItem('user.name');
    const userAvatar = await AsyncStorage.getItem('user.photo');
    const userEmail = await AsyncStorage.getItem('user.email');
    this.setState({currentUser, userId, userName, userAvatar, userEmail});
  };

  signOutUser = async () => {
    await AsyncStorage.getItem('userid').then(async userid => {
      firebase
        .database()
        .ref('user/' + userid)
        .update({status: 'Offline'});
      await AsyncStorage.clear();
      firebase.auth().signOut();
      Alert.alert(
        'Succes!',
        'See you next time ...',
        [
          {
            text: 'OK',
            onPress: () => this.props.navigation.push('Login'),
          },
        ],
        {cancelable: false},
      );
    });
    // .then(() => this.props.navigation.navigate('Login'));
  };

  requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  changeImage = async type => {
    const Blob = RNFetchBlob.polyfill.Blob;
    window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
    window.Blob = Blob;

    const options = {
      title: 'Select Avatar',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      mediaType: 'photo',
    };

    let cameraPermission =
      (await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA)) &&
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ) &&
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
    if (!cameraPermission) {
      cameraPermission = await this.requestCameraPermission();
    } else {
      ImagePicker.showImagePicker(options, response => {
        if (response.didCancel) {
          ToastAndroid.show('You cancelled image picker', ToastAndroid.LONG);
        } else if (response.error) {
          ToastAndroid.show(response.error, ToastAndroid.LONG);
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } else {
          this.setState({loading: true});
          ToastAndroid.show('loading...', ToastAndroid.LONG);
          const imageRef = firebase
            .storage()
            .ref('avatar/' + this.state.userId)
            .child('photo');
          imageRef
            .putFile(response.path)
            .then(data => {
              ToastAndroid.show('Upload success', ToastAndroid.LONG);
              firebase
                .database()
                .ref('user/' + this.state.userId)
                .update({photo: data.downloadURL});
              this.setState({userAvatar: data.downloadURL, loading: false});
              AsyncStorage.setItem('user.photo', this.state.userAvatar);
            })

            .catch(err => console.log(err));
        }
      });
    }
  };

  render() {
    return (
      <View style={styles.root}>
        <Headers />
        {this.state.loading === false ? (
          <View style={{height: '40%'}}>
            <TouchableOpacity onPress={this.changeImage}>
              <Thumbnail
                style={styles.image}
                source={{
                  uri: this.state.userAvatar,
                }}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{height: '35%', marginTop: 30}}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
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
            <Input value={this.state.userName} disabled />
          </Item>
          <Item
            floatingLabel
            style={{marginRight: 10, marginLeft: 10, marginBottom: 10}}>
            <Label style={{marginTop: 10, fontSize: 13}}>Email</Label>
            <Input
              keyboardType="email-address"
              // value={currentUser && currentUser.email}
              value={this.state.userEmail}
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
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
          <TouchableOpacity onPress={this.signOutUser}>
            <View style={styles.button}>
              <Text style={{fontWeight: 'bold'}}>Log Out</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('EditProfile')}>
            <View style={styles.button}>
              <Text style={{fontWeight: 'bold'}}>Edit</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const Profile = withNavigation(Profiles);
export default Profile;
