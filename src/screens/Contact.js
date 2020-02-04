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
  ActivityIndicator,
  Image,
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
  Badge,
} from 'native-base';
import {withNavigation, FlatList} from 'react-navigation';
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
    const id = await AsyncStorage.getItem('userid');
    const name = await AsyncStorage.getItem('user.name');
    const image = await AsyncStorage.getItem('user.photo');
    const email = await AsyncStorage.getItem('user.email');
    async snapshot => {
      const db_users = await Object.values(snapshot.val());
      const friend = await db_users.find(
        item => item.email === this.state.emailAddFriend,
      );
      this.setState({currentUser, id, name, image, email, refreshing: true});
      await firebase
        .database()
        .ref('/mess/' + friend.id + 'friendlist/' + id + 'data/')
        .on('child_added', data => {
          let person = data.val();
          if (person.id !== id) {
            this.setState(prevData => {
              return {userList: [...prevData.userList, person]};
            });
            this.setState({refreshing: false});
          }
        });
    };
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
            .child(this.state.id)
            .once('value', async snapshot => {
              if ('friendList' in db_users) {
                const friendList = await Object.keys(snapshot.val().friendList);
                const cekFriendList = friendList.find(
                  item => item === friend.id_users,
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
                  .child(this.state.id)
                  .child('/friendList/')
                  .child(friend.id)
                  .set({data: true});

                await firebase
                  .database()
                  .ref('mess/')
                  .child(this.state.id)
                  .child('/friendList/')
                  .child(friend.id)
                  .child('/data')
                  .push({
                    email: friend.email,
                    id: friend.id,
                    name: friend.name,
                    image: friend.image,
                  });

                await firebase
                  .database()
                  .ref('mess/')
                  .child(friend.id)
                  .child('/friendList/')
                  .child(this.state.id)
                  .set({data: true});

                await firebase
                  .database()
                  .ref('mess/')
                  .child(friend.id)
                  .child('/friendList/')
                  .child(this.state.id)
                  .child('/data')
                  .push({
                    id: this.state.id,
                    email: this.state.email,
                    name: this.state.name,
                    image: this.state.image,
                  });

                Alert.alert(
                  'Success',
                  'Selamat anda sudah bisa mengobrol dengan teman yang anda tambahkan.',
                  [
                    {
                      text: 'Kembali Ke Contact',
                      onPress: () => this.props.navigation.navigate('Contact'),
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
                  <Item>
                    <View style={styles.row}>
                      <TouchableOpacity
                        onPress={() =>
                          this.props.navigation.navigate('FriendProfile', {
                            item,
                          })
                        }>
                        <Image source={{uri: item.photo}} style={styles.pic} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          this.props.navigation.navigate('ChatRoom', {item})
                        }>
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
                                <Text style={styles.statusol}>
                                  {item.status}
                                </Text>
                              </Badge>
                            ) : (
                              <Text style={styles.status}>{item.status}</Text>
                            )}
                          </View>
                          <View style={styles.msgContainer}>
                            <Text style={styles.email}>{item.email}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </Item>
                )}
                keyExtractor={item => item.id}
              />
            )}
          </View>
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
