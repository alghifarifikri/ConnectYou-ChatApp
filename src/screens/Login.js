/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  TextInput,
  PermissionsAndroid,
  ToastAndroid,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {Card, Item} from 'native-base';
import {withNavigation} from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import Geolocation from 'react-native-geolocation-service';
import firebase from 'react-native-firebase';
// import {db, users} from '../config/initialize';

const styles = StyleSheet.create({
  image: {
    width: '60%',
    height: '85%',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#0DBEDF',
    marginTop: 10,
    marginRight: 10,
    marginLeft: 10,
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    borderRadius: 10,
  },
  buttonLoading: {
    backgroundColor: 'grey',
    marginTop: 10,
    marginRight: 10,
    marginLeft: 10,
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    borderRadius: 10,
  },
  buttonRegister: {
    backgroundColor: '#F6F5F1',
    borderWidth: 2,
    borderColor: '#0DBEDF',
    marginTop: 10,
    marginRight: 10,
    marginLeft: 10,
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    borderRadius: 10,
  },
});

class Logins extends Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      email: '',
      password: '',
      errorMesasge: null,
      refreshing: false,
    };
  }
  // state = {email: '', password: '', errorMessage: null};

  componentDidMount = async () => {
    this._isMounted = true;
    await this.getLocation();
  };

  componentWillUnmount() {
    this._isMounted = false;
    Geolocation.clearWatch();
    Geolocation.stopObserving();
  }

  inputHandler = (name, value) => {
    this.setState(() => ({[name]: value}));
  };

  hasLocationPermission = async () => {
    if (
      Platform.OS === 'ios' ||
      (Platform.OS === 'android' && Platform.Version < 23)
    ) {
      return true;
    }
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (hasPermission) {
      return true;
    }
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (status === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }
    if (status === PermissionsAndroid.RESULTS.DENIED) {
      ToastAndroid.show(
        'Location Permission Denied By User.',
        ToastAndroid.LONG,
      );
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      ToastAndroid.show(
        'Location Permission Revoked By User.',
        ToastAndroid.LONG,
      );
    }
    return false;
  };

  getLocation = async () => {
    const hasLocationPermission = await this.hasLocationPermission();

    if (!hasLocationPermission) {
      return;
    }

    this.setState(() => {
      Geolocation.getCurrentPosition(
        position => {
          this.setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            loading: false,
          });
        },
        error => {
          this.setState({errorMessage: error});
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 8000,
          distanceFilter: 50,
          forceRequestLocation: true,
        },
      );
    });
  };

  handleChange = key => val => {
    this.setState({[key]: val});
  };

  loginPress = async () => {
    const {email, password} = this.state;
    if (email.length < 6) {
      ToastAndroid.show(
        'Please input a valid email address',
        ToastAndroid.LONG,
      );
    } else if (password.length < 6) {
      ToastAndroid.show(
        'Password must be at least 6 characters',
        ToastAndroid.LONG,
      );
    } else {
      firebase
        .database()
        .ref('user/')
        .orderByChild('/email')
        .equalTo(email)
        .once('value', result => {
          let data = result.val();
          if (data !== null) {
            let user = Object.values(data);
            AsyncStorage.setItem('user.email', user[0].email);
            AsyncStorage.setItem('user.name', user[0].name);
            AsyncStorage.setItem('user.photo', user[0].photo);
          }
        });
      this.setState({refreshing: true});
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(async response => {
          firebase
            .database()
            .ref('/user/' + response.user.uid)
            .update({
              status: 'Online',
              latitude: this.state.latitude || null,
              longitude: this.state.longitude || null,
            });

          await AsyncStorage.setItem('userid', response.user.uid);
          ToastAndroid.show('Login success', ToastAndroid.LONG);
          await this.props.navigation.navigate('ChatScreen');
        })
        .catch(error => {
          this.setState({
            errorMessage: error.message,
            email: '',
            password: '',
            refreshing: false,
          });
          ToastAndroid.show(this.state.errorMessage, ToastAndroid.LONG);
        });
    }
  };
  render() {
    return (
      <View style={{backgroundColor: '#F3AC14', flex: 1}}>
        <StatusBar barStyle="light-content" backgroundColor="#F3AC14" />
        <View
          style={{
            alignItems: 'center',
            height: '40%',
            marginTop: 30,
          }}>
          <Image source={require('../image/logo.png')} style={styles.image} />
          {this.state.errorMessage && (
            <Text style={{color: 'red'}}>{this.state.errorMessage}</Text>
          )}
        </View>
        <View style={{margin: 10, alignSelf: 'center'}}>
          <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>
            Mulai Terhubung
          </Text>
        </View>
        <Card
          style={{
            marginLeft: 10,
            marginRight: 10,
            borderRadius: 20,
          }}>
          <Item style={{marginRight: 10, marginLeft: 10}}>
            <TextInput
              keyboardType="email-address"
              placeholder="Email"
              onChangeText={this.handleChange('email')}
              // onChangeText={email => this.setState({email})}
              // value={this.state.email}
            />
          </Item>
          <Item style={{marginRight: 10, marginLeft: 10, marginBottom: 10}}>
            <TextInput
              secureTextEntry
              placeholder="Password"
              onChangeText={this.handleChange('password')}
              // onChangeText={password => this.setState({password})}
              // value={this.state.password}
            />
          </Item>
        </Card>
        {this.state.refreshing === false ? (
          <TouchableOpacity onPress={this.loginPress}>
            <View style={styles.button}>
              <Text style={{fontWeight: 'bold'}}>Login</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.buttonLoading}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate('Register')}>
          <View style={styles.buttonRegister}>
            <Text style={{fontWeight: 'bold'}}>Sign Up</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const Login = withNavigation(Logins);
export default Login;
