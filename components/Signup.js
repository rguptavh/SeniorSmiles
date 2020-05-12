import * as React from 'react';
import { View, StyleSheet, Text, TouchableWithoutFeedback, Keyboard, Image, TextInput, TouchableOpacity, Dimensions, KeyboardAvoidingView } from 'react-native';
import moment from 'moment';
import Spinner from 'react-native-loading-spinner-overlay';
import RNPickerSelect from 'react-native-picker-select';

import Fire from '../Fire';


const entireScreenHeight = Dimensions.get('window').height;
const rem = entireScreenHeight / 380;
const entireScreenWidth = Dimensions.get('window').width;
const wid = entireScreenWidth / 380;

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const pickerStyle = {
  inputIOS: {
    color: 'black',
    alignSelf: 'center',
    fontSize: 15 * rem,
    height: '100%',
    width: '95%',
    marginLeft:'5%',
    fontFamily: 'SourceL'
  },
  inputAndroid: {
    color: 'black',
    alignSelf: 'center',
    fontSize: 15 * rem,
    height: '100%',
    width: '95%',
    marginLeft:'5%',
    fontFamily: 'SourceL'

  },
  placeholder: {
    color: '#9EA0A4',
    fontSize: rem*15,
    fontFamily: 'SourceL'
  },

};    
const placeholder = {
  label: 'Select an account type',
  value: null,
  color: '#9EA0A4',
  fontFamily: 'SourceL',
};
export default class Login extends React.Component {
  state = {
    username: '',
    password: '',
    email: '',
    loading: false,
    event:null
  };
  constructor() {
    super();
    Text.defaultProps = Text.defaultProps || {};
    // Ignore dynamic type scaling on iOS
    Text.defaultProps.allowFontScaling = false;

  }
  static navigationOptions = { headerMode: 'none', gestureEnabled: false };

   onPress = () => {
    var uname = this.state.username;
    var pword = this.state.password;
    var sv = this.state.event;
    var email = this.state.email
    const emailgood = validateEmail(email)
    if (uname != "" && pword != "" && sv != null && emailgood) {
      this.setState({ loading: true });
      const Http = new XMLHttpRequest();
      const url = 'https://script.google.com/macros/s/AKfycbyy9wg6h8W2WzlpnTrTAxsioEsuFfBSVjE0hTrlQoRUnoSUsAk/exec';
      var data = "?username=" + uname + "&password=" + pword + "&action=signup"+"&sv="+sv+"&email="+email;
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
            global.newuser = uname;
            Fire.shared.signout();
            Fire.shared.observeAuth();
            setTimeout(() => { alert("Succesfully signed up!"); }, 100);
            this.props.navigation.navigate('Login')

          }
          else if (ok.substring(0, 5) == "email") {
            this.setState({ loading: false });
            setTimeout(() => { alert("The email you have entered is already registered with an account."); }, 100);

          }
          else if (ok.substring(0, 8) == "username") {
            this.setState({ loading: false });
            setTimeout(() => { alert("Sorry, that username is already taken."); }, 100);

          }
          else {
            this.setState({ loading: false });
            setTimeout(() => { alert("Server Error"); }, 100);
          }

        }
      }
    }
    else {
      if (emailgood){
      alert("Please fill all fields")
      }
      else{
        alert("Please enter a valid email address")
      }
    }
  }
  render() {

    return (
      <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "height"} style={styles.container}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>

          <View style={styles.container}>
            <Spinner
              visible={this.state.loading}
              textContent={'Signing Up...'}
              textStyle={styles.spinnerTextStyle}
            />
            <View style={{ flex: 0.35 }}></View>
            <View style={{ flex: 2.5, width: '100%', alignItems: 'center', padding: 0, }}><Image source={require('../assets/logo.png')} style={styles.imagefront} resizeMode="contain"></Image></View>
            <View style={{ flex: 0.75, alignItems: 'center', justifyContent: 'center', width: '100%' }}><Text style={{ fontSize: Math.min(20 * rem, 700 * wid), color: '#BF0DFE', fontWeight: 'bold', fontFamily:'SourceB' }}>Create account.</Text></View>
            <View style={{
              flex: 2.5, width: '90%'
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
                <View style={{ width: '100%', flex: 0.4 }}></View>
                <View style={{
                  width: '100%',
                  flex: 1.5,
                  borderColor: '#3C5984',
                  borderWidth: 2,
                  borderRadius: 20
                }}>
                  <TextInput
                    style={{ fontSize: 15 * rem, width: '95%', height: '100%', marginLeft: '5%', fontFamily: 'SourceL' }}
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
                    style={{ fontSize: 15 * rem, width: '95%', height: '100%', marginLeft: '5%', fontFamily: 'SourceL' }}
                    autoCapitalize='none'
                    autoCompleteType='off'
                    placeholder="Password"
                    onChangeText={(value) => this.setState({ password: value })}
                    value={this.state.password}
                    secureTextEntry={true}

                  /></View>
                  <View style={{ width: '100%', flex: 0.4 }}></View>
                  <View style={{
                  width: '100%',
                  flex: 1.5,
                  borderColor: '#3C5984',
                  borderWidth: 2,
                  borderRadius: 20
                }}>
                  <RNPickerSelect
                    style={pickerStyle}
                    //  placeholderTextColor="red"
                    useNativeAndroidPickerStyle={false}
                    placeholder={placeholder}
                    onValueChange={(value) => this.setState({ event: value})}
                    items={[{label:'Volunteer',value:'Volunteer'},{label:'Senior',value:'Senior'}]}

                  />
                </View>
              </View>
            </View>
            <View style={{
              width: '73%',
              flex: 1.5,
              justifyContent: 'flex-start',
              alignItems:'center'
            }}>
              <View style = {{flex:1, marginTop:'4%', width:'100%', alignItems:'center',}}>
              <TouchableOpacity
                style={{
                  height: '40%',
                  width: '80%',
                  borderRadius:20,
                  backgroundColor:'#BF0DFE',
                  justifyContent:'center',
                  alignItems:'center'
                }}
                onPress={() => this.onPress()}

              >
                <Text style = {{color:'white', fontFamily:'SourceB', fontSize:Math.min(20*rem,36*wid),}}>Sign Up</Text>
                </TouchableOpacity>
              <View style={styles.row}>
                <Text style={styles.label}>Already have an account? </Text>
                <TouchableOpacity onPress={() => this.props.navigation.navigate('Login')}>
                  <Text style={styles.link}>Login</Text>
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
    marginTop: rem*10,
  },
  label: {
    color: 'black',
    fontSize:Math.min(18*wid,10*rem),
    fontFamily:'Source'
  },
  link: {
    fontWeight: 'bold',
    color: '#22B7CB',
    fontSize:Math.min(18*wid,10*rem),
    fontFamily:'SourceB'
  },

});