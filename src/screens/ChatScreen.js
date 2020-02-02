/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import {Item, Badge} from 'native-base';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {withNavigation} from 'react-navigation';
import firebase from 'react-native-firebase';
import AsyncStorage from '@react-native-community/async-storage';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F6F5F1',
  },
  profilePic: {
    height: 50,
    width: 50,
    backgroundColor: '#eddbb9',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  listChat: {
    paddingLeft: 20,
    marginBottom: 10,
    marginTop: 10,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  personName: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  personChat: {
    color: '#1f1f1f',
  },
  statusol: {
    fontWeight: '400',
    color: '#f48023',
    fontSize: 12,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#DCDCDC',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    padding: 10,
  },
  pic: {
    borderRadius: 30,
    width: 60,
    height: 60,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 280,
  },
  nameTxt: {
    marginLeft: 15,
    fontWeight: '600',
    color: '#222',
    fontSize: 18,
    width: 170,
  },
  status: {
    fontWeight: '200',
    color: '#ccc',
    fontSize: 13,
  },
  msgContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  email: {
    fontWeight: '400',
    color: '#f48023',
    fontSize: 12,
  },
});

class Headers extends Component {
  render() {
    return (
      <View style={{height: 50, backgroundColor: '#F4CF5D'}}>
        <View style={{marginLeft: 10, marginTop: 20}}>
          <Text style={{fontFamily: 'Think Smart', fontSize: 20}}>
            {' '}
            ConnectYou{' '}
          </Text>
        </View>
      </View>
    );
  }
}

class ChatScreens extends Component {
  constructor(props) {
    super(props);
  }
  static navigationOptions = {
    headerShown: false,
  };
  state = {
    userList: [],
    refreshing: false,
    uid: '',
  };

  componentDidMount = async () => {
    const uid = await AsyncStorage.getItem('userid');
    this.setState({uid: uid, refreshing: true});
    await firebase
      .database()
      .ref('/user')
      .on('child_added', data => {
        let person = data.val();
        if (person.id !== uid) {
          this.setState(prevData => {
            return {userList: [...prevData.userList, person]};
          });
          this.setState({refreshing: false});
        }
      });
  };

  render() {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#F3AC14" />
        <Headers />
        <View style={styles.root}>
          {this.state.refreshing === true ? (
            <ActivityIndicator
              size="large"
              color="#05A0E4"
              style={{marginTop: 150}}
            />
          ) : (
            <FlatList
              data={this.state.userList}
              renderItem={({item}) => (
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate('ChatRoom', {item})
                  }
                  onLongPress={() =>
                    this.props.navigation.navigate('FriendProfile', {item})
                  }>
                  <Item>
                    <View style={styles.row}>
                      <Image source={{uri: item.photo}} style={styles.pic} />
                      <View>
                        <View style={styles.nameContainer}>
                          <Text
                            style={styles.nameTxt}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {item.name}
                          </Text>
                          {item.status == 'Online' ? (
                            <Badge success style={{justifyContent: 'center'}}>
                              <Text style={styles.statusol}>{item.status}</Text>
                            </Badge>
                          ) : (
                            <Text style={styles.status}>{item.status}</Text>
                          )}
                        </View>
                        <View style={styles.msgContainer}>
                          <Text style={styles.email}>{item.email}</Text>
                        </View>
                      </View>
                    </View>
                  </Item>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id}
            />
          )}
        </View>
      </>
    );
  }
}

const ChatScreen = withNavigation(ChatScreens);
export default ChatScreen;
