import firebase from 'react-native-firebase';

module.exports = {
  firebase,
  db: () => firebase.database(),
  users: () => firebase.auth(),
  setListener: (endpoint, updaterFn) => {
    firebase
      .database()
      .ref(endpoint)
      .on('value', updaterFn);
    return () =>
      firebase
        .database()
        .ref(endpoint)
        .off();
  },
  setData: (endpoint, data) => {
    return firebase
      .database()
      .ref(endpoint)
      .set(data);
  },
  pushData: (endpoint, data) => {
    return firebase
      .database()
      .ref(endpoint)
      .push(data);
  },
  login: (email, pass) =>
    firebase.auth().signInWithEmailAndPassword(email, pass),
  signup: (email, pass) =>
    firebase.auth().createUserWithEmailAndPassword(email, pass),
};
