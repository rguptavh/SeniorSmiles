import * as React from 'react';
import { View, StyleSheet, Text, TouchableWithoutFeedback, Keyboard, Image, ImageBackground, TextInput, TouchableOpacity, Dimensions, AsyncStorage, KeyboardAvoidingView } from 'react-native';
import moment from 'moment';
import Spinner from 'react-native-loading-spinner-overlay';

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

  render() {


    const onPress = () => {
      var uname = this.state.username;
      var pword = this.state.password;
      if (uname != "" && pword != "") {
        this.setState({ loading: true });
        const Http = new XMLHttpRequest();
        const url = 'https://script.google.com/macros/s/AKfycbxMNgxSn85f9bfVMc5Ow0sG1s0tBf4d2HwAKzASfCSuu9mePQYm/exec';
        var data = "?username=" + uname + "&password=" + pword + "&action=login";
        Http.open("GET", String(url + data));
        Http.send();
        var ok;
        Http.onreadystatechange = (e) => {
          ok = Http.responseText;
          if (Http.readyState == 4) {
            console.log(String(ok));

            if (ok.substring(0, 4) == "true") {
              // console.log(response.toString());
              global.uname = uname;
              var total = parseFloat(ok.substring(5, ok.indexOf(",", 5)));
              global.hours = Math.floor(total);
              global.minutes = Math.round((total - global.hours) * 60);
              console.log(global.minutes)
              var data = JSON.parse(ok.substring(ok.indexOf(",", 5) + 1, ok.length))

              // console.log(JSON.stringify(data))
              var ongoing = [];
              var specific = [];
              var log = [];
              for (var x = 0; x < data.length; x++) {
                if (data[x].type == "Log") {
                  data[x]["id"] = "" + x;
                  log.push(data[x]);
                }
                else if (data[x].type == "Ongoing") {
                  data[x]["id"] = "" + x;
                  ongoing.push(data[x]);
                }
                else if (data[x].type == "Specific") {
                  data[x]["id"] = "" + x;
                  specific.push(data[x]);
                }
              }
              console.log(data)

              specific = specific.sort((a, b) => moment(a.date + " " + a.start, 'MM-DD-YYYY h:mm A').format('X') - moment(b.date + " " + b.start, 'MM-DD-YYYY h:mm A').format('X'))
              log = log.sort((a, b) => moment(b.date, 'MM-DD-YYYY').format('X') - moment(a.date, 'MM-DD-YYYY').format('X'))
              const map = new Map();
              let result = [];
              for (const item of log) {
                if (!map.has(item.date)) {
                  map.set(item.date, true);    // set any value to Map
                  result.push(item.date);
                }
              }
              for (var i = 0; i < log.length; i++) {
                if (result.includes(log[i].date)) {
                  result.shift();
                  // console.log(result)
                  const he = {
                    header: true,
                    id: "" + (data.length + i),
                    date: log[i].date
                  }
                  log.splice(i, 0, he);
                }
              }
              var options = []
              for (const item of ongoing) {
                options.push({ label: item.name, value: item.name })
              }
              for (const item of specific) {
                options.push({ label: item.name, value: item.name })
              }
              global.options = options;
              global.ongoing = ongoing;
              global.specific = specific;
              global.logs = log;
              // console.log(JSON.stringify(data))
              AsyncStorage.setItem('username', this.state.username);
              this.setState({ loading: false });
              this.props.navigation.replace('Main')

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
            <View style={{ flex: 0.75, alignItems: 'center', justifyContent: 'center', width: '100%' }}><Text style={{ fontSize: Math.min(20 * rem, 700 * wid), color: '#BF0DFE', fontWeight: 'bold' }}>Welcome.</Text></View>
            <View style={{
              flex: 2.25, width: '90%'
            }}>
              <View style={{ width: '100%', height: '85%', alignItems: 'flex-end' }}>
                <View style={{
                  width: '100%',
                  flex: 1.5,
                  borderColor: '#3C5984',
                  borderWidth: 2,
                  borderRadius: 20,
                }}>
                  <TextInput
                    style={{ fontSize: 15 * rem, width: '95%', height: '100%', marginLeft: '5%' }}
                    autoCapitalize='none'
                    autoCompleteType='off'
                    placeholder="Username"
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
                    style={{ fontSize: 15 * rem, width: '95%', height: '100%', marginLeft: '5%' }}
                    autoCapitalize='none'
                    autoCompleteType='off'
                    placeholder="Password"
                    onChangeText={(value) => this.setState({ password: value })}
                    value={this.state.password}
                    secureTextEntry={true}

                  /></View>
                <TouchableOpacity style={{ marginTop: 2*rem }}>
                  <Text style={{color: '#22B7CB' ,fontSize:15*wid}}>Forgot your password?</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{
              width: '73%',
              flex: 1.75,
              justifyContent: 'flex-start',
              alignItems:'center'
            }}>
              <TouchableOpacity
                style={{
                  height: entireScreenWidth * 0.73 * 276 / 1096,
                  width: '100%',
                }}
                onPress={onPress}
                disabled={this.state.loading}

              >
                <Image source={require('../assets/logbut.png')} style={{
                  height: '100%',
                  width: '100%',
                  flex: 1


                }} resizeMode="contain"></Image>
              </TouchableOpacity>
              <View style={styles.row}>
                <Text style={styles.label}>Don’t have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
                  <Text style={styles.link}>Sign up</Text>
                </TouchableOpacity>
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
    fontFamily: 'Source',
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
    marginTop: rem*10,
  },
  label: {
    color: 'black',
    fontSize:15*wid
  },
  link: {
    fontWeight: 'bold',
    color: '#22B7CB',
    fontSize:15*wid
  },

});