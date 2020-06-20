import * as React from 'react';
import { View, StyleSheet, Text, TouchableWithoutFeedback, Keyboard, Image, TextInput, TouchableOpacity, Dimensions, AsyncStorage, KeyboardAvoidingView } from 'react-native';
import moment from 'moment';
import Spinner from 'react-native-loading-spinner-overlay';
import * as Location from 'expo-location';
import Fire from '../Fire';

const entireScreenHeight = Dimensions.get('window').height;
const rem = entireScreenHeight / 380;
const entireScreenWidth = Dimensions.get('window').width;
const wid = entireScreenWidth / 380;
export default class Login extends React.Component {
  state = {
    username: '',
    password: '',
    loading: false,
  };
  constructor() {
    super();
    Text.defaultProps = Text.defaultProps || {};
    // Ignore dynamic type scaling on iOS
    Text.defaultProps.allowFontScaling = false;

  }
  static navigationOptions = { headerMode: 'none', gestureEnabled: false };
  componentDidMount() {
    this.getLocationAsync();
  }
  async getLocationAsync() {
    let { status } = await Location.requestPermissionsAsync();
    if (status !== 'granted') {
      this.setState({
        locationResult: 'Permission to access location was denied',
      });
    } else {
      this.setState({ hasLocationPermissions: true });
    }

  }
  onPress = () => {
    var uname = this.state.username;
    var pword = this.state.password;
    if (uname != "" && pword != "") {
      this.setState({ loading: true });
      const Http = new XMLHttpRequest();
      const url = 'https://script.google.com/macros/s/AKfycbyy9wg6h8W2WzlpnTrTAxsioEsuFfBSVjE0hTrlQoRUnoSUsAk/exec';
      var data = "?username=" + uname + "&password=" + pword + "&token=" + global.token + "&action=login";
      console.log(data);
      Http.open("GET", String(url + data));
      Http.send();
      var ok;
      Http.onreadystatechange = (e) => {
        ok = Http.responseText;
        if (Http.readyState == 4) {
          console.log(ok);
          if (ok.substring(0, 9) == "Volunteer") {
            global.uname = uname;
            Fire.shared.observeAuth2();
            var data = JSON.parse(ok.substring(10, ok.length));
            var seniors = data[0];
            var log = data[1];
            var hours = parseInt(log.pop());
            global.hours = Math.floor(hours / 60)
            global.minutes = Math.round(hours - 60 * global.hours);
            global.peoplehelped = log.pop();
            log = log.sort((a, b) => moment(b.end, 'MM-DD-YYYY h:mm A').format('X') - moment(a.end, 'MM-DD-YYYY h:mm A').format('X'))
            const map = new Map();
            let result = [];
            for (const item of log) {
              if (!map.has(moment(item.end, 'MM-DD-YYYY h:mm A').format('MMMM Do YYYY'))) {
                map.set(moment(item.end, 'MM-DD-YYYY h:mm A').format('MMMM Do YYYY'), true);    // set any value to Map
                result.push(moment(item.end, 'MM-DD-YYYY h:mm A').format('MMMM Do YYYY'));
              }
            }

            for (var i = 0; i < log.length; i++) {
              log[i].index = Math.random().toString(36).substr(2, 5);
              if (result.includes(moment(log[i].end, 'MM-DD-YYYY h:mm A').format('MMMM Do YYYY'))) {
                result.shift();
                // console.log(result)
                const he = {
                  header: true,
                  id: "" + (data.length + i),
                  date: moment(log[i].end, 'MM-DD-YYYY h:mm A').format('MMMM Do YYYY'),
                  index: Math.random().toString(36).substr(2, 5)
                }
                log.splice(i, 0, he);
              }
            }
            console.log(log)
            global.logs = log;
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
            var markers = [];
            for (var x = 0, l = seniors.length; x < l; x++) {
              markers.push(seniors[x].location);
            }
            global.markers = markers;
            console.log(markers)
            AsyncStorage.setItem('username', this.state.username);
            AsyncStorage.setItem('type', "Volunteer");
            this.setState({ loading: false });
            this.props.navigation.replace('Map');

          }
          else if (ok.substring(0, 6) == "Senior") {
            global.uname = uname
            console.log(ok)
            Fire.shared.observeAuth2();
            AsyncStorage.setItem('username', this.state.username);
            AsyncStorage.setItem('type', 'Senior');
            var index = ok.indexOf(",", 7);
            var status = ok.substring(7, index);
            var items = ok.substring(index + 1, ok.length);
            global.status = status;
            var temp = JSON.parse(items);
            global.store = temp[temp.length - 1].store
            temp.splice(temp.length - 1, 1);
            global.userhelp = temp[temp.length - 1].username
            temp.splice(temp.length - 1, 1);
            global.items = temp;
            AsyncStorage.setItem('type', "Senior");
            this.setState({ loading: false });
            setTimeout(() => { this.props.navigation.replace('Senior'); }, 100);

          }
          else if (ok.substring(0, 5) == "false") {
            this.setState({ loading: false });
            setTimeout(() => { alert("Failed Login"); }, 100);

          }
          else {
            this.setState({ loading: false });
            setTimeout(() => { alert("Server Error"); }, 100);
          }

        }
      }
    }
    else {
      alert("Please fill all fields")
    }
  }
  render() {



    return (
      <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "height"} style={styles.container}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>

          <View style={styles.container}>
            <Spinner
              visible={this.state.loading}
              textContent={'Logging in...'}
              textStyle={styles.spinnerTextStyle}
            />
            <View style={{ flex: 0.35 }}></View>
            <View style={{ flex: 2.5, width: '100%', alignItems: 'center', padding: 0, }}><Image source={require('../assets/logo.png')} style={styles.imagefront} resizeMode="contain"></Image></View>
            <View style={{ flex: 0.75, alignItems: 'center', justifyContent: 'center', width: '100%' }}><Text style={{ fontSize: Math.min(20 * rem, 700 * wid), color: '#BF0DFE', fontWeight: 'bold', fontFamily: 'SourceB' }}>Welcome.</Text></View>
            <View style={{
              flex: 2.25, width: '90%', alignItems: 'flex-end'
            }}>
              <View style={{ width: '100%', height: '80%', alignItems: 'flex-end' }}>
                <View style={{
                  width: '100%',
                  flex: 1.5,
                  borderColor: '#3C5984',
                  borderWidth: 2,
                  borderRadius: 20,
                }}>
                  <TextInput
                    style={{ fontSize: 18 * rem, width: '95%', height: '100%', marginLeft: '5%', fontFamily: 'SourceL' }}
                    autoCapitalize='none'
                    autoCompleteType='off'
                    placeholder="Username"
                    keyboardType={Platform.OS === 'ios' ? 'ascii-capable' : 'visible-password'}
                    onChangeText={(value) => this.setState({ username: value })}
                    value={this.state.username}

                  /></View>
                <View style={{ width: '100%', flex: 0.4 }}></View>
                <View style={{
                  width: '100%',
                  flex: 1.5,
                  borderColor: '#3C5984',
                  borderWidth: 2,
                  borderRadius: 20
                }}>
                  <TextInput
                    style={{ fontSize: 18 * rem, width: '95%', height: '100%', marginLeft: '5%', fontFamily: 'SourceL' }}
                    autoCapitalize='none'
                    autoCompleteType='off'
                    placeholder="Password"
                    onChangeText={(value) => this.setState({ password: value })}
                    value={this.state.password}
                    secureTextEntry={true}

                  />
                </View>

              </View>
              <TouchableOpacity style={{ marginTop: 2 * rem, }} onPress={() => this.props.navigation.navigate('Forgot')}>
                <Text style={{ color: '#22B7CB', fontSize: 15 * wid, fontFamily: 'Source' }}>Forgot your password?</Text>
              </TouchableOpacity>
            </View>
            <View style={{
              width: '73%',
              flex: 1.75,
              justifyContent: 'flex-start',
              alignItems: 'center'
            }}>
              <View style={{ flex: 1, marginTop: '4%', width: '100%', alignItems: 'center' }}>
                <TouchableOpacity
                  style={{
                    height: '40%',
                    width: '80%',
                    borderRadius: 20,
                    backgroundColor: '#BF0DFE',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  onPress={() => this.onPress()}
                  disabled={this.state.loading}

                >
                  <Text style={{ color: 'white', fontFamily: 'SourceB', fontSize: Math.min(25 * rem, 45 * wid) }}>Login</Text>
                </TouchableOpacity>
                <View style={styles.row}>
                  <Text style={styles.label}>Don’t have an account? </Text>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('Signup')}>
                    <Text style={styles.link}>Sign up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

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