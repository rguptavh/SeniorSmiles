import * as React from 'react';
import { View, StyleSheet, Text, TouchableWithoutFeedback, Keyboard, Image, TextInput, TouchableOpacity, Dimensions, AsyncStorage, KeyboardAvoidingView } from 'react-native';
import moment from 'moment';
import Spinner from 'react-native-loading-spinner-overlay';
import RNPickerSelect from 'react-native-picker-select';


const entireScreenHeight = Dimensions.get('window').height;
const rem = entireScreenHeight / 380;
const entireScreenWidth = Dimensions.get('window').width;
const wid = entireScreenWidth / 380;

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export default class Login extends React.Component {
  state = {
    email: '',
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
      var email = this.state.email;

      if (validateEmail(email)) {
        this.setState({ loading: true });
        const Http = new XMLHttpRequest();
        const url = 'https://script.google.com/macros/s/AKfycbyy9wg6h8W2WzlpnTrTAxsioEsuFfBSVjE0hTrlQoRUnoSUsAk/exec';
        var data = "?action=forgot"+"&email="+email;
        console.log(data);
        Http.open("GET", String(url + data));
        Http.send();
        var ok;
        Http.onreadystatechange = (e) => {
          ok = Http.responseText;
          if (Http.readyState == 4) {
            console.log(String(ok));

            if (ok.substring(0, 4) == "true") {
              this.setState({ loading: false });
              setTimeout(() => { alert("Succesfully Sent Email"); }, 100);
              this.props.navigation.navigate('Login')

            }
            else if (ok.substring(0, 5) == "false") {
              this.setState({ loading: false });
              setTimeout(() => { alert("Sorry, we don't have an account registered with the email you have entered"); }, 100);

            }
            else {
              this.setState({ loading: false });
              setTimeout(() => { alert("Server Error"); }, 100);
            }

          }
        }
      }
      else {
        alert("Please enter a valid email")
      }
    }
    return (
      <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "height"} style={styles.container}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>

          <View style={styles.container}>
            <Spinner
              visible={this.state.loading}
              textContent={'Checking Database...'}
              textStyle={styles.spinnerTextStyle}
            />
            <View style={{ flex: 0.35 }}></View>
            <View style={{ flex: 2.5, width: '100%', alignItems: 'center', padding: 0, }}><Image source={require('../assets/logo.png')} style={styles.imagefront} resizeMode="contain"></Image></View>
            <View style={{ flex: 0.75, alignItems: 'center', justifyContent: 'center', width: '100%' }}><Text style={{ fontSize: Math.min(20 * rem, 700 * wid), color: '#BF0DFE', fontWeight: 'bold', fontFamily:'SourceB' }}>Forgot Login.</Text></View>
            <View style={{
              flex: 1, width: '90%'
            }}>
              <View style={{ width: '100%', height: '100%', alignItems: 'flex-end' }}>
                <View style={{
                  width: '100%',
                  flex: 1.5,
                  borderColor: '#3C5984',
                  borderWidth: 2,
                  borderRadius: 20,
                }}>
                  <TextInput
                    style={{ fontSize: 15 * rem, width: '95%', height: '100%', marginLeft: '5%', fontFamily: 'SourceL' }}
                    autoCapitalize='none'
                    autoCompleteType='off'
                    placeholder="Email"
                    keyboardType={Platform.OS === 'ios' ? 'ascii-capable' : 'visible-password'}
                    onChangeText={(value) => this.setState({ email: value })}
                    value={this.state.email}

                  /></View>
              <View style = {{flex:0.5}}></View>
              </View>

            </View>
            <View style={{
              width: '85%',
              flex: 3,
              justifyContent: 'flex-start',
              alignItems:'center'
            }}>
              <TouchableOpacity
                style={{
                  height: '20%',
                  width: '90%',
                  borderRadius:20,
                  backgroundColor:'#BF0DFE',
                  justifyContent:'center',
                  marginTop:'10%',
                  alignItems:'center'
                }}
                onPress={onPress}
                disabled={this.state.loading}

              >
                <Text style = {{color:'white', fontFamily:'SourceB', fontSize:Math.min(20*rem,36*wid)}}>Send Login Info</Text>
              </TouchableOpacity>
              <View style={styles.row}>
                <Text style={styles.label}>Check email for your credentials. </Text>
                <TouchableOpacity onPress={() => this.props.navigation.navigate('Login')}>
                  <Text style={styles.link}>Login</Text>
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
    marginTop: rem*20,
  },
  label: {
    color: 'black',
    fontSize:18*wid,
    fontFamily:'Source'
  },
  link: {
    fontWeight: 'bold',
    color: '#22B7CB',
    fontSize:18*wid,
    fontFamily:'SourceB'
  },

});