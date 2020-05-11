import firebase from 'firebase'; // 4.8.1
import 'firebase/storage';

class Fire {
  constructor() {
    if (!firebase.apps.length) {
    this.init();
    }
    //this.observeAuth();
  }

  init = () =>
    firebase.initializeApp({
    apiKey: "AIzaSyBoWaoUS85-_RMqnzU35NGRxqGMb-HY3VY",
    authDomain: "seniorsmiles-e4433.firebaseapp.com",
    databaseURL: "https://seniorsmiles-e4433.firebaseio.com",
    projectId: "seniorsmiles-e4433",
    storageBucket: "seniorsmiles-e4433.appspot.com",
    messagingSenderId: "656251460102",
    appId: "1:656251460102:web:d2941a1d60ac18faeb8187",
    measurementId: "G-Y4JE80G7DN"
    });

  observeAuth = () => {
    try {
      //alert(global.newuser+"@seniorsmiles.com")
      firebase.auth().createUserWithEmailAndPassword(global.newuser+"@seniorsmiles.com","123456ABC");
      firebase.auth().signOut();
    } catch ({ message }) {
      alert(message);
    }

  }


  
  observeAuth2 = () => {
    try {
      //alert(global.newuser+"@seniorsmiles.com")
      firebase.auth().signInWithEmailAndPassword(global.uname+"@seniorsmiles.com", '123456ABC')
    } catch ({ message }) {
      alert(message);
    }
  }

  signout = () => {
  firebase.auth().signOut();
  }
  get uid() {
    return (firebase.auth().currentUser || {}).uid;
  }

  get ref() {
    return firebase.database().ref(global.volname + '+' + global.senname);
  }

  parse = snapshot => {
    //console.log(snapshot)
    const { timestamp: numberStamp, text, user, image } = snapshot.val();
    const { key: _id } = snapshot;
    const timestamp = new Date(numberStamp);
    const createdAt = new Date(numberStamp);
    const message = {
      _id,
      timestamp,
      text,
      user,
      image,
      createdAt
    };
    return message;
  };

  on = callback =>
    this.ref
      .limitToLast(20)
      .on('child_added', snapshot => callback(this.parse(snapshot)));

  get timestamp() {
    return firebase.database.ServerValue.TIMESTAMP;
  }
  // send the message to the Backend
  send = messages => {
    for (let i = 0; i < messages.length; i++) {
      const { text, user } = messages[i];
      const message = {
        text,
        user,
        timestamp: this.timestamp,
      };
      console.log(message)
      this.append(message);
    }
  };

  append = message => this.ref.push(message);

  // close the connection to the Backend
  off() {
    this.ref.off();
  }
  uploadToFirebase = (blob,id) => {

    return new Promise((resolve, reject)=>{
  
      var storageRef = firebase.storage().ref();
  
      storageRef.child('uploads/' + id + '.jpg').put(blob, {
        contentType: 'image/jpeg'
      }).then((snapshot)=>{
  
        blob.close();
  
        resolve(snapshot);
  
      }).catch((error)=>{
  
        reject(error);
  
      });
  
    });
  
  
  }    
  getAndSend = async (id) => {

  
      var storageRef = firebase.storage().ref('uploads/' + id + '.jpg');
      var x = await storageRef.getDownloadURL()
      const message = {
        text: '',
        user: {_id : (firebase.auth().currentUser || {}).uid , name: global.uname},
        image: x,
        timestamp: this.timestamp,
      };
     this.append(message);
  
  
  }    
}
  

Fire.shared = new Fire();
export default Fire;
