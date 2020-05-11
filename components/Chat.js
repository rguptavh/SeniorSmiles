// @flow
import React from 'react';
import { GiftedChat } from 'react-native-gifted-chat'; // 0.3.0
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import { View, TouchableOpacity, Image, Dimensions, Text, Platform } from "react-native";
import Fire from '../Fire';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { NavigationActions } from 'react-navigation'
import * as ImageManipulator from "expo-image-manipulator";

const entireScreenHeight = Dimensions.get('window').height;
const rem = entireScreenHeight / 380;
const entireScreenWidth = Dimensions.get('window').width;
const wid = entireScreenWidth / 380;
class Chat extends React.Component {

  static navigationOptions = ({ navigation }) => ({ title: global.uname, });

  state = {
    messages: [],
    other: '',
    camera: false,
    hasPermission: null,
    cameraType: Camera.Constants.Type.back,
  };

  get user() {
    return {
      name: global.uname,
      _id: Fire.shared.uid,
    };
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
      let photo = await this.camera.takePictureAsync();
      const manipResult = await ImageManipulator.manipulateAsync(
        photo.uri,
        [],
        { compress: 0.1, format: ImageManipulator.SaveFormat.JPEG }
      );
      this.addmessage(manipResult.uri)
      this.setState({ camera: false })

    }
  }

  pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images
    });
    if (!result.cancelled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.uri,
        [],
        { compress: 0.1, format: ImageManipulator.SaveFormat.JPEG }
      );
      this.addmessage(manipResult.uri)
      this.setState({ camera: false })
    }
  }

  addmessage = async (uri) => {
    var x = this.guidGenerator()
    this.uriToBlob(uri).then((blob) => {
      return Fire.shared.uploadToFirebase(blob, x);

    }).then((snapshot) => {
      Fire.shared.getAndSend(x)
    }).catch((error) => {

      throw error;

    });



  }
  guidGenerator = () => {
    var S4 = function () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
  }
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
  render() {
    if (this.state.camera) {
      return (
        <View style={{ flex: 1 }}>
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
    else {
      return (
        <View style={{ flex: 1, alignItems: 'center', paddingTop: getStatusBarHeight() }}>
          <View style={{ height: '7%', width: '100%', flexDirection: 'row' }}>
            <View style={{ flex: 1, height: '80%' }}>
              <TouchableOpacity style={{ height: '100%', width: (entireScreenHeight - getStatusBarHeight()) * 0.07, marginLeft: '10%' }} onPress={() => this.props.navigation.dispatch(NavigationActions.back())}>
                <Image style={{ width: '100%', height: '100%' }} source={require('../assets/backarrow.png')} resizeMode='contain' >
                </Image>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, height: '80%', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'SourceB', fontSize: Math.min(15 * rem, 27 * wid) }}>{this.state.other}</Text>
            </View>
            <View style={{ flex: 1, height: '80%', alignItems: 'flex-end' }}>
              <TouchableOpacity style={{ height: '100%', width: (entireScreenHeight - getStatusBarHeight()) * 0.07, marginRight: '10%' }} onPress={async () => {
                if (!this.state.hasPermission) {
                  await this.getPermissionAsync();
                }
                console.log(this.state.hasPermission)
                if (this.state.hasPermission) {
                  console.log('hii')
                  this.setState({ camera: true })
                }
                else {
                  alert('Please enable Camera and Camera Roll permissions')
                }
              }}>
                <Image style={{ width: '100%', height: '100%' }} source={require('../assets/camera.png')} resizeMode='contain'>
                </Image>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ height: '93%', width: '100%' }}>
            <GiftedChat
              messages={this.state.messages}
              onSend={Fire.shared.send}
              user={this.user}
            />
          </View>
        </View>
      );
    }
  }

  componentDidMount() {
    this.setState({ other: String(global.uname) != String(global.volname) ? global.volname : global.senname })
    Fire.shared.on(message =>
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, message),
      }))
    );
  }
  componentWillUnmount() {
    Fire.shared.off();
  }
}

export default Chat;
