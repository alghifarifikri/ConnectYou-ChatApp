/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Modal,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Item,
  Container,
  Content,
  List,
  ListItem,
  Left,
  Body,
  Header,
  Button,
  Icon,
  Title,
  Form,
  Fab,
  Input,
} from 'native-base';
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
});

class Headers extends Component {
  render() {
    return (
      <View style={{height: 50, backgroundColor: '#F4CF5D'}}>
        <View style={{marginLeft: 10, marginTop: 20}}>
          <Text style={{fontFamily: 'Think Smart', fontSize: 20}}>
            {' '}
            Choose Contact{' '}
          </Text>
        </View>
      </View>
    );
  }
}

class Contacts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAuth: null,
      uid: null,
      email: null,
      friendList: [],
      modalVisible: false,
      modalRefresh: false,
      emailAddFriend: null,
      userId: null,
      userName: null,
      userAvatar: null,
      userEmail: null,
    };
  }

  async componentDidMount() {
    const {currentUser} = firebase.auth();
    const userId = await AsyncStorage.getItem('userid');
    const userName = await AsyncStorage.getItem('user.name');
    const userAvatar = await AsyncStorage.getItem('user.photo');
    const userEmail = await AsyncStorage.getItem('user.email');
    this.setState({currentUser, userId, userName, userAvatar, userEmail});
    await firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        await this.setState({
          isAuth: true,
          uid: user.uid,
          email: user.email,
        });
        await firebase
          .database()
          .ref('mess/' + this.state.uid)
          .on('value', async snapshot => {
            if (typeof snapshot.val().friendList !== 'undefined') {
              const keyFriendList = await Object.keys(
                snapshot.val().friendList,
              );
              const valueFriendList = await Object.values(
                snapshot.val().friendList,
              );
              await valueFriendList.map(async (item, index) => {
                const uid = await keyFriendList[index];
                await firebase
                  .database()
                  .ref('users/' + uid)
                  .on('value', async snapshot => {
                    await this.state.friendList.push({
                      uid: uid,
                      data: snapshot.val(),
                    });
                  });
              });
            }
          });
      } else {
        await this.props.navigation.replace('Login');
      }
    });
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  onSubmitAddFriend = event => {
    firebase
      .database()
      .ref('user')
      .once('value')
      .then(async snapshot => {
        const db_users = await Object.values(snapshot.val());
        const friend = await db_users.find(
          item => item.email === this.state.emailAddFriend,
        );
        if (friend.id !== undefined) {
          firebase
            .database()
            .ref('mess/')
            .child(this.state.uid)
            .once('value', async snapshot => {
              if ('friendList' in db_users) {
                const friendList = await Object.keys(snapshot.val().friendList);
                const cekFriendList = friendList.find(
                  item => item === friend.uid_users,
                );
                if (cekFriendList !== undefined) {
                  Alert.alert(
                    'Oops..',
                    'Ternyata anda sudah berteman.',
                    [
                      {
                        text: 'Ok',
                        style: 'cancel',
                      },
                    ],
                    {cancelable: false},
                  );
                }
              } else {
                await firebase
                  .database()
                  .ref('mess/')
                  .child(this.state.uid)
                  .child('/friendList/')
                  .child(friend.id)
                  .set({data: true});

                await firebase
                  .database()
                  .ref('mess/')
                  .child(this.state.uid)
                  .child('/friendList/')
                  .child(friend.id)
                  .child('/data')
                  .push({
                    email: friend.email,
                    id: friend.id,
                    name: friend.name,
                    photo: friend.photo,
                  });

                await firebase
                  .database()
                  .ref('mess/')
                  .child(friend.id)
                  .child('/friendList/')
                  .child(this.state.uid)
                  .set({data: true});

                await firebase
                  .database()
                  .ref('mess/')
                  .child(friend.id)
                  .child('/friendList/')
                  .child(this.state.uid)
                  .child('/data')
                  .push({
                    email: this.state.userEmail,
                    id: this.state.userId,
                    name: this.state.userName,
                    photo: this.state.userAvatar,
                  });

                Alert.alert(
                  'Success',
                  'Selamat anda sudah bisa mengobrol dengan teman yang anda tambahkan.',
                  [
                    {
                      text: 'Kembali Ke Home',
                      onPress: () =>
                        this.setModalVisible(!this.state.modalVisible),
                    },
                    {
                      text: 'Tambah Lagi',
                      style: 'cancel',
                    },
                  ],
                  {cancelable: false},
                );
              }
            });
        } else {
          Alert.alert(
            'Error',
            'Oops... sesuatu terjadi dan saya tidak mengerti...',
            [
              {
                text: 'Ok',
                style: 'cancel',
              },
            ],
            {cancelable: false},
          );
        }
      })
      .catch(message => {
        Alert.alert(
          'Tidak Ditemukan',
          'Pengguna dengan email tersebut tidak terdaftar, Silahkan coba lagi.',
          [
            {
              text: 'Ok',
              style: 'cancel',
            },
          ],
          {cancelable: false},
        );
      });
  };

  render() {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#F3AC14" />
        <Headers />
        <Container>
          <Content>
            <List>
              {this.state.friendList !== null ? (
                this.state.friendList.map((item, index) => {
                  return (
                    <ListItem thumbnail key={index}>
                      <Body>
                        <TouchableOpacity
                          onPress={() =>
                            this.props.navigation.navigate('ChatRoom', {
                              uidUser: this.state.uid,
                              uidFriend: item.uid,
                              emailFriend: item.data.emai,
                            })
                          }>
                          <Text>{item.email}</Text>
                        </TouchableOpacity>
                      </Body>
                    </ListItem>
                  );
                })
              ) : (
                <Text>Data Kosong</Text>
              )}
            </List>
          </Content>
          <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              Alert.alert(
                'Tutup',
                'Anda yakin untuk menutup form tambah teman ?',
                [
                  {
                    text: 'Ya, saya yakin',
                    onPress: () =>
                      this.setModalVisible(!this.state.modalVisible),
                  },
                  {
                    text: 'Tidak',
                    style: 'cancel',
                  },
                ],
                {cancelable: false},
              );
            }}>
            <Container>
              <Header
                style={{
                  backgroundColor: '#F4CF5D',
                  androidStatusBarColor: 'red',
                }}>
                <Left
                  style={{
                    flex: 0.49,
                  }}>
                  <Button
                    transparent
                    iconRight
                    onPress={() =>
                      Alert.alert(
                        'Tutup Form',
                        'Anda yakin untuk menutup form tambah teman ?',
                        [
                          {
                            text: 'Ya, saya yakin',
                            onPress: () =>
                              this.setModalVisible(!this.state.modalVisible),
                          },
                          {
                            text: 'Tidak',
                            style: 'cancel',
                          },
                        ],
                        {cancelable: false},
                      )
                    }>
                    <Icon name={'arrow-back'} />
                  </Button>
                </Left>
                <Body
                  style={{
                    flex: 1,
                  }}>
                  <Title>Tambah Teman</Title>
                </Body>
              </Header>
              <Content padder>
                <Form>
                  <Item rounded>
                    <Icon
                      type="MaterialCommunityIcons"
                      name="email"
                      style={{
                        paddingRight: 10,
                      }}
                    />
                    <Input
                      placeholder="Email"
                      value={this.state.emailAddFriend}
                      onChangeText={value =>
                        this.setState({
                          emailAddFriend: value,
                        })
                      }
                    />
                  </Item>
                  <Button
                    block
                    rounded
                    style={{
                      marginTop: 40,
                      backgroundColor: '#F4CF5D',
                    }}
                    onPress={event => this.onSubmitAddFriend(event)}>
                    <Text>Submit</Text>
                  </Button>
                </Form>
              </Content>
            </Container>
          </Modal>
          <Fab
            style={{backgroundColor: '#F4CF5D'}}
            position="bottomRight"
            onPress={() => this.setModalVisible(true)}>
            <Icon type={'MaterialCommunityIcons'} name="message-plus" />
          </Fab>
        </Container>
      </>
    );
  }
}

const Contact = withNavigation(Contacts);
export default Contact;
