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
  Platform,
  PermissionsAndroid,
  ToastAndroid,
} from 'react-native';
import {Card, Item} from 'native-base';
import {withNavigation} from 'react-navigation';
import firebase from 'react-native-firebase';
import Geolocation from 'react-native-geolocation-service';

const styles = StyleSheet.create({
  image: {
    width: '55%',
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
});

class Registers extends Component {
  // state = {name: '', email: '', password: '', errorMessage: null};
  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      name: '',
      email: '',
      password: '',
      latitude: null,
      longitude: null,
      errorMessage: null,
      loading: false,
      updatesEnabled: false,
    };
  }

  componentDidMount = async () => {
    await this.getLocation();
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

    this.setState({loading: true}, () => {
      Geolocation.getCurrentPosition(
        position => {
          this.setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            loading: false,
          });
          console.warn(position);
        },
        error => {
          this.setState({errorMessage: error, loading: false});
          console.warn(error);
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

  registerButtonPress = () => {
    const {name, email, password} = this.state;
    if (name.length < 1) {
      ToastAndroid.show('Please input your fullname', ToastAndroid.LONG);
    } else if (email.length < 6) {
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
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(response => {
          console.warn(response);
          firebase
            .database()
            .ref('/user/' + response.user.uid)
            .set({
              name: this.state.name,
              status: 'Offline',
              email: this.state.email,
              photo: 'https://image.flaticon.com/icons/png/512/428/428573.png',
              latitude: this.state.latitude,
              longitude: this.state.longitude,
              id: response.user.uid,
            })
            .catch(error => {
              ToastAndroid.show(error.message, ToastAndroid.LONG);
              this.setState({
                name: '',
                email: '',
                password: '',
              });
            });
          ToastAndroid.show(
            'Your account is successfully registered!',
            ToastAndroid.LONG,
          );

          this.props.navigation.navigate('Login');
        })
        .catch(error => {
          this.setState({
            errorMessage: error.message,
            name: '',
            email: '',
            password: '',
          });
          ToastAndroid.show(this.state.errorMessage.message, ToastAndroid.LONG);
        });
      //   .then(user => this.props.navigation.navigate('Login'))
      //   .catch(error => this.setState({errorMessage: error.message}));
      // Alert.alert('Thank You ^_^');
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
            Mulai dari sini
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
              placeholder="Name"
              onChangeText={name => this.setState({name})}
              value={this.state.name}
            />
          </Item>
          <Item style={{marginRight: 10, marginLeft: 10}}>
            <TextInput
              keyboardType="email-address"
              placeholder="Email"
              onChangeText={email => this.setState({email})}
              value={this.state.email}
            />
          </Item>
          <Item style={{marginRight: 10, marginLeft: 10, marginBottom: 10}}>
            <TextInput
              secureTextEntry
              placeholder="Password"
              onChangeText={password => this.setState({password})}
              value={this.state.password}
            />
          </Item>
        </Card>
        <TouchableOpacity onPress={this.registerButtonPress}>
          <View style={styles.button}>
            <Text style={{fontWeight: 'bold'}}>Register</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const Register = withNavigation(Registers);
export default Register;
