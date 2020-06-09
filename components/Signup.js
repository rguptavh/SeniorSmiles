import * as React from 'react';
import { View, StyleSheet, Text, TouchableWithoutFeedback, Keyboard, Image, TextInput, TouchableOpacity, Dimensions, KeyboardAvoidingView } from 'react-native';
import moment from 'moment';
import Spinner from 'react-native-loading-spinner-overlay';
import RNPickerSelect from 'react-native-picker-select';
import { Camera } from 'expo-camera';
import * as ImageManipulator from "expo-image-manipulator";
import Fire from '../Fire';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';


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
    event:null,
    cameraType: Camera.Constants.Type.front,
    camera: false,
    hasPermission: null,
  };
  constructor() {
    super();
    Text.defaultProps = Text.defaultProps || {};
    // Ignore dynamic type scaling on iOS
    Text.defaultProps.allowFontScaling = false;
  }
  getPermissionAsync = async () => {
    // Camera roll Permission 
    var roll = true;
    if (Platform.OS === 'ios') {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        roll = false
      }
    }
    // Camera Permission
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasPermission: status === 'granted' && roll });
  }
  static navigationOptions = { headerMode: 'none', gestureEnabled: false };
  uriToBlob = (uri) => {

    return new Promise((resolve, reject) => {

      const xhr = new XMLHttpRequest();

      xhr.onload = function () {
        // return the blob
        resolve(xhr.response);
      };

      xhr.onerror = function () {
        // something went wrong
        reject(new Error('uriToBlob failed'));
      };

      // this helps us get a blob
      xhr.responseType = 'blob';

      xhr.open('GET', uri, true);
      xhr.send(null);

    });

  }

  getage = async(papi) => {
    try {
      let res = await fetch('https://eastus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceAttributes=age&recognitionModel=recognition_02&returnRecognitionModel=false&detectionModel=detection_01', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/octet-stream',
          'Ocp-Apim-Subscription-Key': '98ed4babcfbb42198812199d905a9102',
        },
        body: 
          papi,
      
      });
      this.setState({ loading: false });

      res = await res.json();
      if(res.length!=0){
        console.log(res)
        console.log(res[0].faceAttributes.age)
        global.age = res[0].faceAttributes.age;
        this.setState({camera: false});
        if(global.age>60){
          this.signup();
        }
        else{
          alert("Sorry! Our algorithm determined that you do not look old enough to sign up as a senior. If you think there is a mistake or you have another condition that hinders you from going to the store please email us at SeniorSmiles@gmail.com with a picture of yourself and your age or other confirmation of your condition. Thank you!");
        }
      }
      else{
        alert("No face detected in the photo. Please retake");
      }

    } catch (e) {
      console.error(e);
    } 

  }

  handleCameraType = () => {
    const { cameraType } = this.state

    this.setState({
      cameraType:
        cameraType === Camera.Constants.Type.back
          ? Camera.Constants.Type.front
          : Camera.Constants.Type.back
    })
  }
  takePicture = async () => {
    if (this.camera) {
      console.log('pressed papi');
      //this.setState({camera: false})
      this.setState({ loading: true });

      let photo = await this.camera.takePictureAsync();
      const manipResult = await ImageManipulator.manipulateAsync(
        photo.uri,
        [],
        { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
      );


      this.uriToBlob(manipResult.uri).then((blob)  => {
          global.papito = blob;
          console.log(JSON.stringify(global.papito))
          this.getage(blob);

      }).catch((error) => {
        throw error;
      }); 
      //console.log(JSON.stringify(global.papito))

    }
  }

  pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images
    });
    if (!result.cancelled) {
      this.setState({ loading: true });

      const manipResult = await ImageManipulator.manipulateAsync(
        result.uri,
        [],
        { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
      );
        this.uriToBlob(manipResult.uri).then((blob)  => {
          global.papito = blob;
          console.log(JSON.stringify(global.papito))
          this.getage(blob);

      }).catch((error) => {
        throw error;
      }); 
    }
  }

  onPress = () => {
    var uname = this.state.username;
    var pword = this.state.password;
    var sv = this.state.event;
    var email = this.state.email
    const emailgood = validateEmail(email)
    if(sv == 'Senior'){    
      if (uname != "" && pword != "" && sv != null) {
        if(emailgood){
          this.setState({camera: true});
        }
        else{
          alert("Please enter a valid email address")
        }

      }
      else {
        alert("Please fill all fields")      
      }
    }
    else{
      this.signup();
    }
  }
   signup = () => {
    var uname = this.state.username;
    var pword = this.state.password;
    var sv = this.state.event;
    var email = this.state.email
    const emailgood = validateEmail(email)
    if (uname != "" && pword != "" && sv != null) {
      if(emailgood){
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
    else{
      alert("Please enter a valid email address")
    }
  }
    else {
      alert("Please fill all fields")
      

      
    }
  }
  render() {
    if (this.state.camera) {
      return (
        <View style={{ flex: 1 }}>
            <Spinner
              visible={this.state.loading}
              textContent={'Checking Age...'}
              textStyle={styles.spinnerTextStyle}
            />
          <Camera style={{ flex: 1 }} type={this.state.cameraType} ref={ref => { this.camera = ref }}>
            <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", margin: 30 }}>
              
            <TouchableOpacity
                style={{
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                  backgroundColor: 'transparent'
                }}
                onPress={() => this.setState({camera: false})}>
                <Ionicons
                  name="ios-arrow-back"
                  style={{ color: "#fff", fontSize: 40 }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                  backgroundColor: 'transparent'
                }}
                onPress={() => this.pickImage()}>
                <Ionicons
                  name="ios-photos"
                  style={{ color: "#fff", fontSize: 40 }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                }}
                onPress={() => this.takePicture()}
              >
                <FontAwesome
                  name="camera"
                  style={{ color: "#fff", fontSize: 40 }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                }}
                onPress={() => this.handleCameraType()}
              >
                <MaterialCommunityIcons
                  name="camera-switch"
                  style={{ color: "#fff", fontSize: 40 }}
                />
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      );
    }
    else{
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
              <View style = {{flex:1, marginTop:'4%', width:'100%', alignItems:'center', paddingTop:'5%'}}>
              <TouchableOpacity
                style={{
                  height: '40%',
                  width: '80%',
                  borderRadius:20,
                  backgroundColor:'#BF0DFE',
                  justifyContent:'center',
                  alignItems:'center',
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