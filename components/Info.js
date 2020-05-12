import * as React from 'react';
import { FlatList, View, StyleSheet, Text, TouchableWithoutFeedback, Keyboard, Image, ImageBackground, TextInput, TouchableOpacity, Dimensions, AsyncStorage, KeyboardAvoidingView, Alert, ScrollView } from 'react-native';
import moment from 'moment';
import Spinner from 'react-native-loading-spinner-overlay';
import * as Location from 'expo-location';
import { Notifications } from 'expo';
import { NavigationActions, StackActions } from 'react-navigation'
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { LinearGradient } from 'expo-linear-gradient';
import Fire from '../Fire';
import openMap from 'react-native-open-maps';

const entireScreenHeight = Dimensions.get('window').height;
const rem = entireScreenHeight / 380;
const entireScreenWidth = Dimensions.get('window').width;
const wid = entireScreenWidth / 380;

export default class Login extends React.Component {
  state = {
    loading: false,
    senior: global.accept[0],
    index: global.accept[1],
    distance: global.accept[2],
    store: global.accept[3],
    marker: global.accept[4],
    location: null
  };
  constructor() {
    super();
    Text.defaultProps = Text.defaultProps || {};
    // Ignore dynamic type scaling on iOS
    Text.defaultProps.allowFontScaling = false;

  }
  static navigationOptions = { headerMode: 'none', gestureEnabled: false };



  _renderItem = ({ item }) => {

    return (

      <View style={{ width: '100%', marginTop: rem * 7, }}>
        <View style={{ width: '100%', flexDirection: 'row', }}>
          <View style={{ flex: 3, borderWidth: 2, borderRadius: 20, justifyContent: 'center', paddingTop: rem * 2, paddingBottom: rem * 2 }}>
            <Text style={{ width: '90%', marginLeft: '10%', fontFamily: 'SourceL', fontSize: Math.min(rem * 20, wid * 36), }}>{this.state.senior.items[item.index].name}</Text>
          </View>
          <View style={{ flex: 0.25 }}></View>
          <View style={{ flex: 1, borderWidth: 2, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ width: '90%', fontFamily: 'SourceL', fontSize: rem * 15, textAlign: 'center' }}>{this.state.senior.items[item.index].quantity}</Text>
          </View>
        </View>
      </View>
    );
  }
  cancel = () => {
    Alert.alert(
      "Cancel Request",
      "Are you sure you want to stop fulfuilling this request?",
      [
        {
          text: "No"
        },
        {
          text: "Yes", onPress: () => {
            const Http = new XMLHttpRequest();
            const url = 'https://script.google.com/macros/s/AKfycbyy9wg6h8W2WzlpnTrTAxsioEsuFfBSVjE0hTrlQoRUnoSUsAk/exec';
            var data = "?vol=" + global.uname + "&sen=" + this.state.senior.name + "&action=volcancel";
            this.setState({ loading: true })
            Http.open("GET", String(url + data));
            Http.send();
            Http.onreadystatechange = (e) => {
              var ok = Http.responseText;
              if (Http.readyState == 4) {
                console.log(ok)
                if (ok.substring(0, 4) == "true") {
                  var temp = global.seniors;
                  for (var x = 0, l = temp.length; x < l; x++) {
                    if (temp[x].name == this.state.senior.name) {
                      temp[x]['userhelp'] = '';
                      temp[x]['helped'] = 'no'
                      var cancelled = temp.splice(x, 1);
                      temp.push(cancelled[0])
                      break;
                    }
                  }
                  global.seniors = temp;
                  this.setState({ loading: false })
                  setTimeout(() => { alert("Succesfully cancelled!"); }, 100);
                  this.props.navigation.replace('Map');

                }
                else if (ok == 'false') {
                  this.setState({ loading: false });
                  setTimeout(() => { alert("Sorry, there was an error with that request."); }, 100);
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
  map = async () => {
    var y = await Location.reverseGeocodeAsync({ latitude: this.state.marker.coordinate.latitude, longitude: this.state.marker.coordinate.longitude });
    var x = y[0];
    var addy = x.name + " " + x.city + ", " + x.region + " " + x.postalCode;
    openMap({ end: addy })
  }
  accept = () => {
    var senname = this.state.senior.name;
    var uname = global.uname;
    this.setState({ loading: true });
    const Http = new XMLHttpRequest();
    const url = 'https://script.google.com/macros/s/AKfycbyy9wg6h8W2WzlpnTrTAxsioEsuFfBSVjE0hTrlQoRUnoSUsAk/exec';
    var data = "?username=" + uname + "&sen=" + senname + "&action=vol";
    console.log(data)
    Http.open("GET", String(url + data));
    Http.send();
    Http.onreadystatechange = (e) => {
      if (Http.readyState == 4) {
        var ok = Http.responseText;
        if (ok.substring(0, 4) == 'true') {
          var seniors = JSON.parse(ok.substring(5, ok.length));
          var markers = [];
          for (var x = 0, l = seniors.length; x < l; x++) {
            markers.push(seniors[x].location);
          }
          var accepted = []
          var notaccepted = [];
          for (const item of seniors) {
            if (item.userhelp == global.uname) {
              accepted.push(item)
            }
            else {
              notaccepted.push(item)
            }
          }
          seniors = accepted.concat(notaccepted)
          global.seniors = seniors;
          global.markers = markers;
          this.setState({ loading: false });
          this.props.navigation.replace('Map');
        }
        else if (ok.substring(0, 5) == 'false') {
          alert("Sorry, this request has already been accepted")
          var seniors = JSON.parse(ok.substring(6, ok.length));
          global.seniors = seniors;
          var markers = [];
          for (var x = 0, l = seniors.length; x < l; x++) {
            markers.push(seniors[x].location);
          }
          global.markers = markers;
          this.setState({ loading: false });
          this.props.navigation.replace('Map');

        }
      }
    }
  }

  render() {
    if (this.state.senior.userhelp != global.uname) {
      return (
        <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "height"} style={styles.container}>

          <View style={styles.container}>
            <Spinner
              visible={this.state.loading}
              textContent={'Accepting request...'}
              textStyle={styles.spinnerTextStyle}
            />
            <View style={{ flex: 1, width: '100%', alignItems: 'center', marginTop: getStatusBarHeight() }}>
              <View style={{ borderBottomColor: '#BF0DFE', borderBottomWidth: 10, marginTop: -entireScreenHeight * 0.01 }}>
                <Text style={{ fontSize: Math.min(wid * 54, rem * 30), color: '#BF0DFE', fontFamily: 'SourceB', textAlign: 'center' }}>{this.state.senior.name}</Text>
              </View>
              <View style={{ flexDirection: 'row', width: '80%', marginTop: '5%' }}>
                <View style={{ flex: 4 }}>
                  <Text style={{ fontSize: Math.min(wid * 31.5, rem * 17.5), color: '#BF0DFE', fontFamily: 'SourceB' }}>{this.state.distance} Miles Away</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <TouchableOpacity style={{ flex: 1 }} onPress={() => this.map()}>
                    <LinearGradient colors={['#8B9DFD', '#BF0DFE']} style={{ width: '100%', flex: 1, borderRadius: 25 }} >

                      <Image style={{ width: '100%', height: '100%' }} source={require('../assets/compass.png')} resizeMode='contain'>
                      </Image>

                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={{ fontSize: Math.min(wid * 31.5, rem * 17.5), color: '#BF0DFE', fontFamily: 'SourceB', textAlign: 'center', marginTop: '3%' }}>Preferred Store: {this.state.store}</Text>



            </View>
            <View style={{ flex: 2, width: '100%', alignItems: 'center' }}>
              <LinearGradient colors={['#22B7CB', '#BF0DFE']} style={{ flex: 1, alignItems: 'center', width: '85%', backgroundColor: 'white', borderRadius: 20, shadowOffset: { width: 0, height: 4, }, shadowOpacity: 0.30, elevation: 8, padding: 2 }}>
                <View style={{ flex: 1, width: '100%', alignItems: 'center', backgroundColor: 'white', borderRadius: 20 }}>
                  <View style={{ flex: 0.6, justifyContent: 'center', paddingLeft: '0%', alignItems: 'flex-start', width: '100%', alignItems: 'center' }}>
                    <Text style={{ fontSize: Math.min(35 * wid, 17 * rem), color: '#BF0DFE', fontFamily: 'SourceB', }}>Items List</Text>
                  </View>
                  <View style={{ flex: 3, width: '85%' }}>
                    <FlatList style={{ width: '100%', }}
                      data={this.state.senior.items}
                      renderItem={this._renderItem}
                      keyExtractor={item => "" + item.index}
                    />
                  </View>
                  <View style={{ flex: 0.2 }}></View>
                </View>
              </LinearGradient>
            </View>
            <View style={{ flex: 0.75, width: '90%', flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1, width: '90%', paddingLeft: '3%', paddingRight: '3%' }}>
                <TouchableOpacity style={{ width: '100%', height: '40%', }} onPress={() => this.props.navigation.navigate('Map')}>
                  <LinearGradient colors={['#8B9DFD', '#BF0DFE']} style={{ flex: 1, width: '100%', borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: 'white', fontFamily: 'SourceB', fontSize: Math.min(20 * rem, 36 * wid), textAlign: 'center' }}>Back</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, width: '90%', paddingLeft: '3%', paddingRight: '3%' }}>
                <TouchableOpacity style={{ width: '100%', height: '40%', }}>
                  <LinearGradient colors={['#8B9DFD', '#BF0DFE']} style={{ flex: 1, width: '100%', borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: 'white', fontFamily: 'SourceB', fontSize: Math.min(20 * rem, 36 * wid), textAlign: 'center' }} onPress={() => this.accept()}>Accept</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView >

      );
    }
    else {
      return (
        <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "height"} style={styles.container}>

          <View style={styles.container}>
            <Spinner
              visible={this.state.loading}
              textContent={'Cancelling request...'}
              textStyle={styles.spinnerTextStyle}
            />
            <View style={{ flex: 1, width: '100%', alignItems: 'center', marginTop: getStatusBarHeight() }}>
              <View style={{ borderBottomColor: '#BF0DFE', borderBottomWidth: 10, marginTop: -entireScreenHeight * 0.01 }}>
                <Text style={{ fontSize: Math.min(wid * 54, rem * 30), color: '#BF0DFE', fontFamily: 'SourceB', textAlign: 'center' }}>{this.state.senior.name}</Text>
              </View>
              <View style={{ flexDirection: 'row', width: '80%', marginTop: '5%' }}>
                <View style={{ flex: 4 }}>
                  <Text style={{ fontSize: Math.min(wid * 31.5, rem * 17.5), color: '#BF0DFE', fontFamily: 'SourceB' }}>{this.state.distance} Miles Away</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <TouchableOpacity style={{ flex: 1 }} onPress={() => this.map()}>
                    <LinearGradient colors={['#8B9DFD', '#BF0DFE']} style={{ width: '100%', flex: 1, borderRadius: 25 }} >

                      <Image style={{ width: '100%', height: '100%' }} source={require('../assets/compass.png')} resizeMode='contain'>
                      </Image>

                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={{ fontSize: Math.min(wid * 31.5, rem * 17.5), color: '#BF0DFE', fontFamily: 'SourceB', textAlign: 'center', marginTop: '3%' }}>Preferred Store: {this.state.store}</Text>



            </View>
            <View style={{ flex: 2, width: '100%', alignItems: 'center' }}>
              <LinearGradient colors={['#22B7CB', '#BF0DFE']} style={{ flex: 1, alignItems: 'center', width: '85%', backgroundColor: 'white', borderRadius: 20, shadowOffset: { width: 0, height: 4, }, shadowOpacity: 0.30, elevation: 8, padding: 2 }}>
                <View style={{ flex: 1, width: '100%', alignItems: 'center', backgroundColor: 'white', borderRadius: 20 }}>
                  <View style={{ flex: 0.6, justifyContent: 'center', paddingLeft: '0%', alignItems: 'flex-start', width: '100%', alignItems: 'center' }}>
                    <Text style={{ fontSize: Math.min(35 * wid, 17 * rem), color: '#BF0DFE', fontFamily: 'SourceB', }}>Items List</Text>
                  </View>
                  <View style={{ flex: 3, width: '85%' }}>
                    <FlatList style={{ width: '100%', }}
                      data={this.state.senior.items}
                      renderItem={this._renderItem}
                      keyExtractor={item => "" + item.index}
                    />
                  </View>
                  <View style={{ flex: 0.2 }}></View>
                </View>
              </LinearGradient>
            </View>
            <View style={{ flex: 0.75, width: '90%', flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1, width: '90%', paddingLeft: '3%', paddingRight: '3%' }}>
                <TouchableOpacity style={{ width: '100%', height: '40%', }} onPress={() => this.props.navigation.navigate('Map')}>
                  <LinearGradient colors={['#8B9DFD', '#BF0DFE']} style={{ flex: 1, width: '100%', borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: 'white', fontFamily: 'SourceB', fontSize: Math.min(20 * rem, 36 * wid), textAlign: 'center' }}>Back</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, width: '90%', paddingLeft: '3%', paddingRight: '3%' }}>
                <TouchableOpacity style={{ width: '100%', height: '40%', }}>
                  <LinearGradient colors={['#8B9DFD', '#BF0DFE']} style={{ flex: 1, width: '100%', borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: 'white', fontFamily: 'SourceB', fontSize: Math.min(20 * rem, 36 * wid), textAlign: 'center' }} onPress={() => this.cancel()}>Cancel</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView >
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
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
    top: 60
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