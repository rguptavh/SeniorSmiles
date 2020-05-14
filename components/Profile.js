import * as React from 'react';
import { FlatList, View, StyleSheet, Text, TouchableWithoutFeedback, Keyboard, Image, ImageBackground, TextInput, TouchableOpacity, Dimensions, AsyncStorage, KeyboardAvoidingView, Alert } from 'react-native';
import {  ListItem} from "native-base";
import moment from 'moment';
import Spinner from 'react-native-loading-spinner-overlay';
import * as Location from 'expo-location';
import { Notifications } from 'expo';
import { NavigationActions, StackActions } from 'react-navigation'
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { LinearGradient } from 'expo-linear-gradient';
import Fire from '../Fire';
import {Ionicons } from '@expo/vector-icons';

const entireScreenHeight = Dimensions.get('window').height;
const rem = entireScreenHeight / 380;
const entireScreenWidth = Dimensions.get('window').width;
const wid = entireScreenWidth / 380;
let location = null;
let first = true;
export default class Login extends React.Component {
  state = {
    loading: false,
    items: global.items,
    status: global.status,
    userhelp: global.userhelp,
    store: global.store,
    keyboard: false,
    hours: '50',
    minutes: '47',
    badges: [{name: 'Workhorse Bronze'},{name: 'Workhorse Silver'},{name: 'Workhorse Gold'}],
    logs: [{date:'12-31-2020',time:'papi-papi',helpee:'helpee', header: false},{date:'12-31-2020',time:'papi-papi',helpee:'helpee', header: false},{date:'12-31-2020',time:'papi-papi',helpee:'helpee', header: true},{date:'12-31-2020',time:'papi-papi',helpee:'helpee', header: false}]
  };
  constructor() {
    super();
    Text.defaultProps = Text.defaultProps || {};
    // Ignore dynamic type scaling on iOS
    Text.defaultProps.allowFontScaling = false;

  }
  static navigationOptions = { headerMode: 'none', gestureEnabled: false };
  add = () => {
    var temp = this.state.items;
    if (temp[temp.length - 1].index == 15) {
      alert("Please have a maximum of 15 items")
    }
    else {
      temp.splice(temp.length - 1, 0, { index: temp.length - 1, name: '', quantity: '' });
      temp[temp.length - 1]["index"] = temp.length - 1;
      this.setState({ items: temp });
    }
  }
  chat = () => {
    global.volname = this.state.userhelp;
    global.senname = global.uname;
    console.log(global.volname + " " + global.senname)
    this.props.navigation.navigate('Chat')
  }
  onPress2 = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "No"
        },
        {
          text: "Yes", onPress: async () => {
            await AsyncStorage.removeItem('username');
            await AsyncStorage.removeItem('type');
            const Http = new XMLHttpRequest();
            Fire.shared.signout();
            const url = 'https://script.google.com/macros/s/AKfycbyy9wg6h8W2WzlpnTrTAxsioEsuFfBSVjE0hTrlQoRUnoSUsAk/exec';
            var data = "?username=" + global.uname + "&token=" + global.token + "&action=logout";
            Http.open("GET", String(url + data));
            Http.send();
            const resetAction = StackActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({ routeName: 'Login' })],
              key: null,
            });
            this.props.navigation.dispatch(resetAction);
          }
        }
      ],
      { cancelable: false }
    );

  }
  async componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    location = await Location.getCurrentPositionAsync({});

    this._notificationSubscription = Notifications.addListener(this._handleNotification);
  }
  _handleNotification = notification => {
    // do whatever you want to do with the notification
    console.log(notification.data.action)
    //  global.status = "helped"
    if (notification.data.action == 'volunteer') {
      global.status = 'yes'
      global.userhelp = notification.data.username;
      this.setState({ status: 'yes', userhelp: notification.data.username })

    }
    console.log(notification)
  };
  _keyboardDidShow = () => {
    this.setState({ keyboard: true })
  }

  _keyboardDidHide = () => {
    this.setState({ keyboard: false })
  }
  cancel = () => {
    Alert.alert(
      "Cancel Request",
      "Are you sure you want to cancel your request?",
      [
        {
          text: "No"
        },
        {
          text: "Yes", onPress: () => {
            const Http = new XMLHttpRequest();
            const url = 'https://script.google.com/macros/s/AKfycbyy9wg6h8W2WzlpnTrTAxsioEsuFfBSVjE0hTrlQoRUnoSUsAk/exec';
            var data = "?username=" + global.uname + "&action=sencancel";
            this.setState({ loading: true, message: 'Cancelling Request...' })
            Http.open("GET", String(url + data));
            Http.send();
            Http.onreadystatechange = (e) => {
              var ok = Http.responseText;
              if (Http.readyState == 4) {
                if (ok.substring(0, 4) == "true") {
                  this.setState({ loading: false, status: 'order', items: [{ index: 0, name: '', quantity: '', add: false }, { index: 1, name: '', quantity: '', add: true }], store: '' });
                  setTimeout(() => { alert("Succesfully removed your request!"); }, 100);

                }
                else if (ok == 'false') {
                  this.setState({ loading: false });
                  setTimeout(() => { alert("Sorry, your request has already been accepted by a volunteer."); }, 100);
                }
                else {
                  this.setState({ loading: false });
                  setTimeout(() => { alert("Server Error"); }, 100);
                }
              }
            }
          }
        }
      ],
      { cancelable: false }
    );
  }
  _renderItem = ({ item }) => {
    if (item.add) {
      if (this.state.status == 'order') {
        return (
          <View style={{ height: rem * 35, width: '100%', marginTop: rem * 7 }}>
            <TouchableOpacity style={{ height: '60%', width: '100%', flexDirection: 'row', alignItems: 'center', }} onPress={this.add}>
              <Image style={{ flex: 0.75, width: '100%', height: '100%', }} source={require('../assets/plus.png')} resizeMode='contain'>
              </Image>
              <View style={{ flex: 0.2 }}></View>
              <View style={{ flex: 3 }}>
                <Text style={{ fontFamily: 'SourceL', fontSize: rem * 15 }}>Add Item</Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      }
      else {
        return null;
      }
    }
    else {
      if (this.state.status == 'order') {
        return (
          <View style={{ width: '100%', marginTop: rem * 7, }}>
            <View style={{ width: '100%', flexDirection: 'row', }}>
              <View style={{ flex: 3, borderWidth: 2, borderRadius: 20, justifyContent: 'center', paddingTop: rem * 2, paddingBottom: rem * 2 }}>
                <TextInput style={{ flex: 1, width: '90%', marginLeft: '10%', fontFamily: 'SourceL', fontSize: rem * 15 }} multiline={true} placeholder="Name" onChangeText={(value) => {
                  var temp = this.state.items;
                  temp[item.index]["name"] = value;
                  this.setState({ items: temp })

                  console.log(this.state.items)
                }}></TextInput>
              </View>
              <View style={{ flex: 0.25 }}></View>
              <View style={{ flex: 1, borderWidth: 2, borderRadius: 20 }}>
                <TextInput style={{ flex: 1, width: '100%', textAlign: 'center', fontFamily: 'SourceL', fontSize: rem * 15 }} keyboardType='number-pad' maxLength={2} placeholder="#" onChangeText={(value) => {
                  var temp = this.state.items;
                  temp[item.index]["quantity"] = value;
                  this.setState({ items: temp })
                  console.log(this.state.items)
                }}></TextInput>
              </View>
            </View>
          </View>
        );
      }
      else {
        return (

          <View style={{ width: '100%', marginTop: rem * 7, }}>
            <View style={{ width: '100%', flexDirection: 'row', }}>
              <View style={{ flex: 3, borderWidth: 2, borderRadius: 20, justifyContent: 'center', paddingTop: rem * 2, paddingBottom: rem * 2 }}>
                <Text style={{ width: '90%', marginLeft: '10%', fontFamily: 'SourceL', fontSize: rem * 15, }}>{this.state.items[item.index].name}</Text>
              </View>
              <View style={{ flex: 0.25 }}></View>
              <View style={{ flex: 1, borderWidth: 2, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ width: '90%', fontFamily: 'SourceL', fontSize: rem * 15, textAlign: 'center' }}>{this.state.items[item.index].quantity}</Text>
              </View>
            </View>
          </View>
        );
      }
    }
  };
  _renderItem2 = ({ item }) => {
  if (item.name == 'Workhorse Bronze'){
    return (
      <Image style={{ height: '100%', width:entireScreenHeight/5.75 }} source={require('../assets/workbronze.png')} resizeMode='contain' >
      </Image>
    );
  }
  if (item.name == 'Workhorse Silver'){
    return (
      <Image style={{ height: '100%', width:entireScreenHeight/5.75, marginLeft:wid*10 }} source={require('../assets/worksilver.png')} resizeMode='contain' >
      </Image>
    );
  }
  if (item.name == 'Workhorse Gold'){
    return (
      <Image style={{ height: '100%', width:entireScreenHeight/5.75, marginLeft:wid*10 }} source={require('../assets/workgold.png')} resizeMode='contain' >
      </Image>
    );
  }
}
_renderItem3 = ({ item }) => {

  if (item.header) {

    
    return (

      <ListItem itemDivider>
        <Body style={{ marginRight: 0, alignItems: 'center' }}>
          <Text style={{ fontWeight: "bold" }}>
            {moment(item.date, 'MM-DD-YYYY').format('MMMM Do, YYYY')}
          </Text>
        </Body>
      </ListItem>



    );
    
  }
  else {


        <ListItem style={{ marginLeft: 0, backgroundColor: 'transparent' }}>
          <Body>
            <Text style={{ flex: 1, fontFamily: 'SourceB', color: 'white' }}>Helped {item.helpee}</Text>
            <Text style={{ flex: 1, fontFamily: 'Source', color: 'white' }}>{item.time}</Text>
          </Body>
        </ListItem>

  }
};
 onPress = async () => {
  var uname = global.uname;
  var items = this.state.items.slice();
  var store = this.state.store
  items.pop();
  var empty = false;
  for (var x = 0, l = items.length; x < l; x++) {
    if (items[x].value == '' || items[x].quantity == '') {
      empty = true;
      break;
    }
  }
  items = JSON.stringify(items);

  if (store != "" && !empty) {
    this.setState({ loading: true, message: 'Getting your location...\nPlease be patient' });
    location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
    this.setState({ loading: true, message: 'Sending Request...' });
    var loc = JSON.stringify({ coordinate: { longitude: location.coords.longitude, latitude: location.coords.latitude } });
    const Http = new XMLHttpRequest();
    const url = 'https://script.google.com/macros/s/AKfycbyy9wg6h8W2WzlpnTrTAxsioEsuFfBSVjE0hTrlQoRUnoSUsAk/exec';
    var data = "?username=" + uname + "&location=" + loc + "&items=" + items + "&store=" + store + "&action=senior";
    console.log(data);
    Http.open("GET", String(url + data));
    Http.send();
    var ok;
    Http.onreadystatechange = (e) => {
      ok = Http.responseText;
      if (Http.readyState == 4) {
        console.log(String(ok));
        if (ok == "true") {
          this.setState({ loading: false, status: 'nothelped' });
          setTimeout(() => { alert("Success!"); }, 100);
        }
        /* else if (ok.substring(0, 6) == "Senior") {
           this.setState({ loading: false });
           setTimeout(() => { alert("Senior Login"); }, 100);

         }
         else if (ok.substring(0, 5) == "false") {
           this.setState({ loading: false });
           setTimeout(() => { alert("Failed Login"); }, 100);

         }*/
        else {
          this.setState({ loading: false });
          setTimeout(() => { alert("Server Error"); }, 100);
        }

      }
    }
  }
  else {
    alert("Please fill all items")
  }
}
  render() {
    
    return (
      <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "height"} style={styles.container}>
          <View style={styles.container}>
            <Spinner
              visible={this.state.loading}
              textContent={this.state.message}
              textStyle={styles.spinnerTextStyle}
            />
            <ImageBackground style={{ flex: 1, width: '100%', alignItems: 'center' }} source={require('../assets/profile.png')}>
              <View style={{ flex: 1, width: '100%', alignItems: 'flex-start' }}>
                <Text style={{ marginTop: getStatusBarHeight(), marginLeft: wid * 20, fontSize: rem * 25, color: 'white', fontFamily: 'SourceB'}}>rgupta</Text>
              </View>
            <TouchableOpacity
                style={{
                  alignItems: 'center', 
                  position:'absolute',
                  right:wid*20,
                  top: getStatusBarHeight()+rem*5,      
                }}
                onPress={() => this.props.navigation.navigate('Map')}>
                <Ionicons
                  name="ios-arrow-round-back"
                  style={{ color: "#fff", fontSize: rem*25 }}
                />
              </TouchableOpacity>
              <View style={{ flex: 3.25, width: '100%', alignItems: 'center' }}>
                <View style={{ flex: 1, alignItems: 'center', width: '85%', backgroundColor: 'white', borderRadius: 20, shadowOffset: { width: 0, height: 4, }, shadowOpacity: 0.30, elevation: 8, marginBottom: '0%' }}>
                  <View style={{ flex: 0.2 }}></View>
                  <View style={{ flex: 0.5, justifyContent: 'center', paddingLeft: '0%', alignItems: 'flex-start', width: '90%', alignItems: 'center', backgroundColor: '#CFD4FF', borderRadius: 20 }}>
                    <Text style={{ fontSize: Math.min(24.3 * wid, 13.5 * rem), color: 'black', fontFamily: 'SourceB' }}>Total People Helped: 47</Text>
                  </View>
                  <View style={{ flex: 0.2 }}></View>
                  <View style={{ flex: 0.5, justifyContent: 'center', paddingLeft: '0%', alignItems: 'flex-start', width: '90%', alignItems: 'center', backgroundColor: '#CFD4FF', borderRadius: 20 }}>
                    <Text style={{ fontSize: Math.min(24.3 * wid, 13.5 * rem), color: 'black', fontFamily: 'SourceB' }}>
                      <Text style={{ fontSize: Math.min(45 * wid, 30 * rem), fontFamily: 'SourceB', color: 'black' }} >{this.state.hours}</Text>
                      <Text style={{ fontSize: Math.min(22.5 * wid, 12.5 * rem), fontFamily: 'SourceB', color: 'black' }}>{this.state.hours == '1' ? "hour " : "hours "}</Text>
                      <Text style={{ fontSize: Math.min(45 * wid, 30 * rem), fontFamily: 'SourceB', color: 'black' }}>{this.state.minutes}</Text>
                      <Text style={{ fontSize: Math.min(22.5 * wid, 12.5 * rem), fontFamily: 'SourceB', color: 'black' }}>{this.state.minutes == '1' ? "minute" : "minutes"}</Text>
                    </Text>
                  </View>
                  <View style={{ flex: 0.2 }}></View>
                  <View style={{ flex: 2, width: '90%', backgroundColor: '#CFD4FF', borderRadius: 20 }}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}>
                      <View style={{ borderBottomColor: 'black', borderBottomWidth: 4 }}>
                        <Text style={{ fontSize: Math.min(27 * wid, 15 * rem), fontFamily: 'SourceB' }}>Logs</Text>
                      </View>
                    </View>
                    <View style = {{flex:3.5}}>
                    <FlatList style={{ width: '100%' }}
                      data={this.state.logs}
                      renderItem={this._renderItem3}

                      keyExtractor={item => "" + item.helpee}
                    />
                    </View>
                  </View>
                  <View style={{ flex: 0.2 }}></View>
                </View>
              </View>
              <View style={{ flex: 1, width: '85%', alignItems:'center', justifyContent:'center', }}>
                <View style = {{width:'100%', height:'80%'}}>
              <FlatList style={{ width: '100%', flex:1}}
                      horizontal={true}
                      data={this.state.badges}
                      renderItem={this._renderItem2}

                      keyExtractor={item => "" + item.name}
                    />
                    </View>
              </View>
            </ImageBackground>
          </View>
      </KeyboardAvoidingView >

    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'white'
    // left: 0, top: 0, position: 'absolute'

  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    alignItems: 'center',
  },
  imagefront: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  spinnerTextStyle: {
    color: '#FFF',
    top: 60,
    alignItems: 'center',
    textAlign: 'center'
  },
  label: {
    color: '#22B7CB'
  },
  row: {
    flexDirection: 'row',
    marginTop: rem * 10,
  },
  label: {
    color: 'black',
    fontSize: 18 * wid,
    fontFamily: 'Source'
  },
  link: {
    fontWeight: 'bold',
    color: '#22B7CB',
    fontSize: 18 * wid,
    fontFamily: 'SourceB'
  },

});