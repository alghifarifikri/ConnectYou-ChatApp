import React, {Component} from 'react';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from 'react-native-firebase';
import AsyncStorage from '@react-native-community/async-storage';

import SplashScreen from './src/screens/SplashScreen';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import ChatScreen from './src/screens/ChatScreen';
import Maps from './src/screens/Maps';
import Contact from './src/screens/Contact';
import Profile from './src/screens/Profile';
import ChatRoom from './src/screens/ChatRoom';
import FriendProfile from './src/screens/FriendProfile';
import EditProfile from './src/screens/EditProfile';
import {Alert} from 'react-native';

const SplashNav = createStackNavigator(
  {
    SplashScreen: {
      screen: SplashScreen,
      navigationOptions: {
        headerShown: false,
      },
    },
  },
  {
    initialRouteName: 'SplashScreen',
  },
);

const AuthNav = createStackNavigator(
  {
    Login: {
      screen: Login,
      navigationOptions: {
        headerShown: false,
      },
    },
    Register: {
      screen: Register,
      navigationOptions: {
        headerShown: false,
      },
    },
  },
  {
    initialRouteName: 'Login',
  },
);

const ChatNav = createStackNavigator(
  {
    ChatScreen: {
      screen: ChatScreen,
      navigationOptions: {
        headerShown: false,
      },
    },
    ChatRoom: {
      screen: ChatRoom,
      navigationOptions: {
        headerShown: false,
      },
    },
    FriendProfile: {
      screen: FriendProfile,
      navigationOptions: {
        headerShown: false,
      },
    },
  },
  {
    initialRouteName: 'ChatScreen',
  },
);

ChatNav.navigationOptions = ({navigation}) => {
  let tabBarVisible = true;
  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }

  return {
    tabBarVisible,
  };
};

const MapsNav = createStackNavigator(
  {
    Maps: {
      screen: Maps,
      navigationOptions: {
        headerShown: false,
      },
    },
  },
  {
    initialRouteName: 'Maps',
  },
);

const ContactNav = createStackNavigator(
  {
    Contact: {
      screen: Contact,
      navigationOptions: {
        headerShown: false,
      },
    },
    ChatRoom: {
      screen: ChatRoom,
      navigationOptions: {
        headerShown: false,
      },
    },
  },
  {
    initialRouteName: 'Contact',
  },
);

ContactNav.navigationOptions = ({navigation}) => {
  let tabBarVisible = true;
  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }

  return {
    tabBarVisible,
  };
};

const ProfileNav = createStackNavigator(
  {
    Profile: {
      screen: Profile,
      navigationOptions: {
        headerShown: false,
      },
    },
    EditProfile: {
      screen: EditProfile,
      navigationOptions: {
        headerShown: false,
      },
    },
  },
  {
    initialRouteName: 'Profile',
  },
);

ProfileNav.navigationOptions = ({navigation}) => {
  let tabBarVisible = true;
  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }

  return {
    tabBarVisible,
  };
};

const BottomNav = createBottomTabNavigator(
  {
    Chat: {
      screen: ChatNav,
      navigationOptions: {
        tabBarIcon: ({tintColor}) => {
          return <Icon name="chat" size={25} color={tintColor} />;
        },
      },
    },
    Maps: {
      screen: MapsNav,
      navigationOptions: {
        tabBarIcon: ({tintColor}) => {
          return <Icon name="google-maps" size={25} color={tintColor} />;
        },
      },
    },
//     Contact: {
//       screen: ContactNav,
//       navigationOptions: {
//         tabBarIcon: ({tintColor}) => {
//           return <Icon name="contacts" size={25} color={tintColor} />;
//         },
//       },
//     },
    Profile: {
      screen: ProfileNav,
      navigationOptions: {
        tabBarIcon: ({tintColor}) => {
          return <Icon name="account" size={25} color={tintColor} />;
        },
      },
    },
  },
  {
    initialRouteName: 'Chat',
    tabBarOptions: {
      activeTintColor: 'white',
      activeBackgroundColor: '#F3AC14',
      inactiveTintColor: '#F3AC14',
      style: {
        backgroundColor: 'white',
        borderTopColor: 'transparent',
      },
    },
  },
);

const SwitchNav = createSwitchNavigator(
  {
    SplashNav,
    AuthNav,
    BottomNav,
  },
  {
    initialRouteName: 'SplashNav',
  },
);

const AppContainer = createAppContainer(SwitchNav);

class App extends Component {
  async componentDidMount() {
    this.checkPermission();
    this.createNotificationListeners();
  }

  async createNotificationListeners() {
    /*
     * Triggered when a particular notification has been received in foreground
     * */
    this.notificationListener = firebase
      .notifications()
      .onNotification(notification => {
        const {title, body} = notification;
        this.showAlert(title, body);
      });

    /*
     * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
     * */
    this.notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened(notificationOpen => {
        const {title, body} = notificationOpen.notification;
        this.showAlert(title, body);
      });

    /*
     * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
     * */
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      const {title, body} = notificationOpen.notification;
      this.showAlert(title, body);
    }
    /*
     * Triggered for data only payload in foreground
     * */
    this.messageListener = firebase.messaging().onMessage(message => {
      //process data message
      console.log(JSON.stringify(message));
    });
  }

  showAlert(title, body) {
    Alert.alert(
      title,
      body,
      [{text: 'OK', onPress: () => console.log('OK Pressed')}],
      {cancelable: false},
    );
  }

  //1
  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  }

  //3
  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        // user has a device token
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    }
  }

  //2
  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
      this.getToken();
    } catch (error) {
      // User has rejected permissions
      console.log('permission rejected');
    }
  }
  render() {
    return <AppContainer />;
  }
}

export default App;
