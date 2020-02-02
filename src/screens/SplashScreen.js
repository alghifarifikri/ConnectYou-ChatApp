/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {StyleSheet, Text, View, Image, StatusBar} from 'react-native';
import firebase from 'react-native-firebase';

import image from '../image/logo.png';

const styles = StyleSheet.create({
  backgroundImage: {
    width: '45%',
    height: '26%',
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#F3AC14',
    justifyContent: 'center',
  },
});

export default class SplashScreen extends React.Component {
  static navigationOptions = {
    headerShown: false,
  };

  componentDidMount() {
    const {currentUser} = firebase.auth();
    setTimeout(() => {
      if (currentUser === null) {
        this.props.navigation.navigate('Login');
      } else {
        this.props.navigation.navigate('ChatScreen');
      }
    }, 2000);
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <Image source={image} style={styles.backgroundImage} />
        <Text
          style={{
            alignSelf: 'center',
            fontSize: 40,
            fontFamily: 'Think Smart',
          }}>
          ConnectYou
        </Text>
      </View>
    );
  }
}
