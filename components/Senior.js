import * as React from 'react';
import { FlatList, View, StyleSheet, Text, TouchableWithoutFeedback, Keyboard, Image, ImageBackground, TextInput, TouchableOpacity, Dimensions, AsyncStorage, KeyboardAvoidingView, Alert, TouchableHighlight } from 'react-native';
import moment from 'moment';
import Spinner from 'react-native-loading-spinner-overlay';
import * as Location from 'expo-location';
import { Notifications } from 'expo';
import { NavigationActions, StackActions, ThemeColors } from 'react-navigation'
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { LinearGradient } from 'expo-linear-gradient';
import Fire from '../Fire';
import Swipeable from 'react-native-swipeable-row';


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
    if (temp.length == 16) {
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
    else if (notification.data.action == 'cancel') {
      global.status = 'nothelped'
      global.userhelp = '';
      this.setState({ status: 'nothelped', userhelp: '' })

    }
    else if (notification.data.action == 'deliver') {
      global.status = 'payment'
      this.setState({ status: 'payment'})

    }
    console.log(notification)
  };
  _keyboardDidShow = () => {
    this.setState({keyboard: true})
  }

  _keyboardDidHide = () => {
    this.setState({keyboard: false})
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
            this.setState({loading: true, message: 'Cancelling Request...'})
            Http.open("GET", String(url + data));
            Http.send();
            Http.onreadystatechange = (e) => {
              var ok = Http.responseText;
              if (Http.readyState == 4) {
                if (ok.substring(0, 4) == "true") {
                  this.setState({ loading: false, status : 'order', items: [{ index: 0, name: '', quantity: '', add: false }, { index: 1, name: '', quantity: '', add: true }], store: ''});
                  setTimeout(() => { alert("Succesfully removed your request!"); }, 100);
    
                }
                else if (ok == 'false'){
                  this.setState({ loading: false});
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
  verify = () => {
    Alert.alert(
      "Verify Request",
      "Please verify that\n\na) You have received the items you requested\n\nb) You have paid your volunteer the full amount of the items they have bought\n\nBy clicking yes, you certify that both of these items have been fulfuilled.",
      [
        {
          text: "No"
        },
        {
          text: "Yes", onPress: () => {
            const Http = new XMLHttpRequest();
            const url = 'https://script.google.com/macros/s/AKfycbyy9wg6h8W2WzlpnTrTAxsioEsuFfBSVjE0hTrlQoRUnoSUsAk/exec';
            var data = "?sen=" + global.uname + "&vol=" + this.state.userhelp +  "&action=verify";
            this.setState({loading: true, message: 'Verifying Request...'})
            Http.open("GET", String(url + data));
            Http.send();
            Http.onreadystatechange = (e) => {
              var ok = Http.responseText;
              if (Http.readyState == 4) {
                if (ok.substring(0, 4) == "true") {
                  this.setState({ loading: false, status : 'order', items: [{ index: 0, name: '', quantity: '', add: false }, { index: 1, name: '', quantity: '', add: true }], store: ''});
                  setTimeout(() => { alert("Succesfully verified your request!"); }, 100);
    
                }
                else if (ok == 'false'){
                  this.setState({ loading: false});
                  setTimeout(() => { alert("Sorry, there was an error, please reload the app."); }, 100);
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
  deleteNote = ( item) => {
    console.log(item)
    var temp = this.state.items
    temp.splice(item.index,1)
    for (var x = item.index; x<this.state.items.length;x++){
    this.state.items[x].index -= 1
    }
    console.log(temp)
    this.setState({items: temp})
  }
  _renderItem = ({ item }) => {
    const rightButtons = [
      <TouchableHighlight style={{ backgroundColor: 'red', height: '100%', justifyContent: 'center', marginLeft:wid*5}} onPress={() => this.deleteNote(item)}><Text style={{ color: 'white', paddingLeft: entireScreenHeight / 50 }}>Delete</Text></TouchableHighlight>,
    ];
    var f = false
    if (first) {
      f = true;
      first = false;
    }
    if (item.add) {
      if (this.state.status == 'order') {
        return (
          <View style={{ height: rem * 35, width: '100%', marginTop:rem*7 }}>
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

      <View style={{ width: '100%', marginTop:rem*7, backgroundColor:'white'}}>
                  <Swipeable rightButtons={rightButtons} rightButtonWidth={entireScreenWidth / 5} bounceOnMount={f}>
      <View style={{ width: '100%', flexDirection: 'row', }}>
        <View style={{ flex: 3, borderWidth: 2, borderRadius: 20, justifyContent: 'center', paddingTop:rem*2, paddingBottom:rem*2 }}>
                <TextInput style={{ flex: 1, width: '90%', marginLeft: '10%', fontFamily: 'SourceL', fontSize: rem * 15 }} multiline={true} placeholder="Name" onChangeText={(value) => {
                  var temp = this.state.items;
                  temp[item.index]["name"] = value;
                  this.setState({ items: temp })

                  console.log(this.state.items)
                }}></TextInput>
              </View>
              <View style={{ flex: 0.25, backgroundColor:'white' }}></View>
              <View style={{ flex: 1, borderWidth: 2, borderRadius: 20 }}>
                <TextInput style={{ flex: 1, width: '100%', textAlign: 'center', fontFamily: 'SourceL', fontSize: rem * 15 }} keyboardType='number-pad' maxLength={2} placeholder="#" onChangeText={(value) => {
                  var temp = this.state.items;
                  temp[item.index]["quantity"] = value;
                  this.setState({ items: temp })
                  console.log(this.state.items)
                }}></TextInput>
              </View>
            </View>
            </Swipeable>
          </View>

        );
      }
      else {
        return (

          <View style={{ width: '100%', marginTop:rem*7, }}>
          <View style={{ width: '100%', flexDirection: 'row', }}>
            <View style={{ flex: 3, borderWidth: 2, borderRadius: 20, justifyContent: 'center', paddingTop:rem*2, paddingBottom:rem*2 }}>
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
  render() {
    console.log(this.state.items)
    const onPress = async () => {
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
              global.status = 'nothelped'
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
    return (
      <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "height"} style={styles.container}>
 <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false} disabled= {!this.state.keyboard}>
          <View style={styles.container}>
            <Spinner
              visible={this.state.loading}
              textContent={this.state.message}
              textStyle={styles.spinnerTextStyle}
            />
            <ImageBackground style={{ flex: 1, width: '100%', alignItems: 'center' }} source={require('../assets/seniorreq.png')}>
              <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: Math.min(wid * 27, rem * 15), color: 'white', fontFamily: 'SourceB', marginTop: this.state.status == 'nothelped' ? getStatusBarHeight() : '5%', textAlign: 'center' }}>{this.state.status == 'order' ? 'No ongoing requests.' : this.state.status == 'nothelped' ? 'Request submitted' : this.state.userhelp} </Text>
                {this.state.status == 'nothelped' ? <Text style={{ fontSize: Math.min(wid * 27, rem * 15), color: 'white', fontFamily: 'SourceB', }}>Awaiting Volunteer Response</Text> : null}
                {this.state.status == 'nothelped' ? <Image
                  style={{ flex: 1, resizeMode: 'contain', }}
                  source={require('../assets/spin.gif')} /> : (this.state.status != 'nothelped' && this.state.status != 'order') ? <Text style={{ fontSize: Math.min(wid * 27, rem * 15), color: 'white', fontFamily: 'SourceB', marginTop: '2%' }}>{this.state.status == 'payment' ? 'Has delivered your items' : 'Has accepted your request'}</Text> : null}
              </View>
              <View style={{ flex: 3.25, width: '100%', alignItems: 'center' }}>
                <View style={{ flex: 1, alignItems: 'center', width: '85%', backgroundColor: 'white', borderRadius: 20, borderColor: '#3C5984', borderWidth: 2, shadowOffset: { width: 0, height: 4, }, shadowOpacity: 0.30, elevation: 8, marginBottom: '7%' }}>
                  <View style={{ flex: 0.75, justifyContent: 'center', paddingLeft: '0%', alignItems: 'flex-start', width: '100%', paddingLeft: '7.5%' }}>
                    <Text style={{ fontSize: Math.min(35 * wid, 17 * rem), color: '#BF0DFE', fontFamily: 'SourceB' }}>{this.state.status == 'order' ? 'Items Desired:' : 'Items Requested:'}</Text>
                  </View>
                  <View style={{ flex: 3, width: '85%' }}>
                    <FlatList style={{ width: '100%', backgroundColor:'white' }}
                      data={this.state.items}
                      renderItem={this._renderItem}
                      
                      keyExtractor={item => "" + item.index}
                    />
                  </View>
                  <View style={{ flex: 0.7, alignItems: 'center', width: '100%', justifyContent: 'center' }}>
                    <View style={{ height: '80%', width: '85%', borderColor: 'black', borderWidth: 2, borderRadius: 20 }}>
                      <TextInput
                        style={{ fontSize: 16 * rem, width: '95%', height: '100%', marginLeft: '5%', fontFamily: 'SourceL' }}
                        autoCapitalize='none'
                        autoCompleteType='off'
                        placeholder="Preferred Store"
                        onChangeText={(value) => this.setState({ store: value })}
                        value={this.state.store}
                        onFocus={() => {
                          if (first) {
                            Alert.alert("Preferred Store", "Please make sure that your preferred store has all of the items on your list.")
                            first = false;
                            this.setState({keyboard: true})
                          }}
                        }
                        editable = {this.state.status == 'order'}
                      />
                    </View>
                  </View>
                </View>
              </View>
              <View style={{ flex: 1, width: '90%', alignItems:'center'}}>
                {this.state.status == 'order' ?
                  <TouchableOpacity style={{ height: '45%', width: '70%', alignItems: 'center', }} onPress={onPress}>
                    <LinearGradient
                      colors={['#8B9DFD', '#BF0DFE']}
                      style={{ height: '100%', alignItems: 'center', borderRadius: 20, width: '100%', justifyContent: 'center' }}>
                      <Text style={{ color: 'white', fontFamily: 'SourceB', fontSize: Math.min(25 * rem, 45 * wid), textAlign: 'center' }}>Submit</Text>
                    </LinearGradient>
                  </TouchableOpacity> : this.state.status == 'payment' ? 
                  <View style = {{height:'45%', width:'100%', flexDirection:'row', alignItems:'center'}}>
                    <View style = {{flex:1, height:'100%', alignItems:'center'}}>
                  <TouchableOpacity style={{ height: '100%', width: '80%' }} onPress={() => this.chat()}>
                    <LinearGradient
                      colors={['#8B9DFD', '#BF0DFE']}
                      style={{ height: '100%', alignItems: 'center', borderRadius: 20, width: '100%', justifyContent: 'center' }}>
                      <Text style={{ color: 'white', fontFamily: 'SourceB', fontSize: Math.min(20 * rem, 36 * wid), textAlign: 'center' }}>Chat</Text>
                    </LinearGradient>
                  </TouchableOpacity> 
                  </View>
                  <View style = {{flex:1, height:'100%', alignItems:'center'}}>
                  <TouchableOpacity style={{ height: '100%', width: '80%', alignItems: 'center', }} onPress={() => this.verify()}>
                    <LinearGradient
                      colors={['#8B9DFD', '#BF0DFE']}
                      style={{ height: '100%', alignItems: 'center', borderRadius: 20, width: '100%', justifyContent: 'center' }}>
                      <Text style={{ color: 'white', fontFamily: 'SourceB', fontSize: Math.min(20 * rem, 36 * wid), textAlign: 'center' }}>Verify</Text>
                    </LinearGradient>
                  </TouchableOpacity> 
                  </View>
                    </View>
                  : this.state.status == 'nothelped' ? <TouchableOpacity style={{ height: '45%', width: '60%', alignItems: 'center', }} onPress={() => this.cancel()}>
                    <LinearGradient
                      colors={['#8B9DFD', '#BF0DFE']}
                      style={{ height: '100%', alignItems: 'center', borderRadius: 20, width: '100%', justifyContent: 'center' }}>
                      <Text style={{ color: 'white', fontFamily: 'SourceB', fontSize: Math.min(25 * rem, 45 * wid), textAlign: 'center' }}>Cancel</Text>
                    </LinearGradient>
                  </TouchableOpacity> : 
                  <TouchableOpacity style={{ height: '45%', width: '60%', alignItems: 'center', }} onPress={() => this.chat()}>
                    <LinearGradient
                      colors={['#8B9DFD', '#BF0DFE']}
                      style={{ height: '100%', alignItems: 'center', borderRadius: 20, width: '100%', justifyContent: 'center' }}>
                      <Text style={{ color: 'white', fontFamily: 'SourceB', fontSize: Math.min(25 * rem, 45 * wid), textAlign: 'center' }}>Chat</Text>
                    </LinearGradient>
                  </TouchableOpacity> }
                <TouchableOpacity style={{ alignSelf: 'center', justifyContent: 'center', marginTop: rem * 7 }} onPress={this.onPress2}>
                  <Text style={{ fontSize: Math.min(rem * 15, wid * 36), fontFamily: 'Source' }}>Logout</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
          </TouchableWithoutFeedback>
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
  backTextWhite: {
    color: '#FFF',
},
rowFront: {
    alignItems: 'center',
    backgroundColor: '#CCC',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    justifyContent: 'center',
    height: 50,
},
rowBack: {
    alignItems: 'center',
    backgroundColor: 'red',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
},
backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
},
backRightBtnRight: {
    backgroundColor: 'red',
    right: 0,
},

});