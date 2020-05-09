// @flow
import React from 'react';
import { GiftedChat } from 'react-native-gifted-chat'; // 0.3.0
import * as ImagePicker from 'expo-image-picker';

import { View, TouchableOpacity, Image, Dimensions, Text } from "react-native";
import Fire from '../Fire';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import * as ImageManipulator from "expo-image-manipulator";
import { NavigationActions } from 'react-navigation'

const entireScreenHeight = Dimensions.get('window').height;
const rem = entireScreenHeight / 380;
const entireScreenWidth = Dimensions.get('window').width;
const wid = entireScreenWidth / 380;
class Chat extends React.Component {

  static navigationOptions = ({ navigation }) => ({ title: global.uname, });

  state = {
    messages: [],
    other: ''
  };

  get user() {
    return {
      name: global.uname,
      _id: Fire.shared.uid,
    };
  }
  handleOnPress =  () => {
    var x = this.guidGenerator()
    var cancel = false;
    ImagePicker.launchImageLibraryAsync({
      mediaTypes: "Images"
    }).then((result) => {

      if (!result.cancelled) {
        // User picked an image
        const { height, width, type, uri } = result;
        return this.uriToBlob(uri);

      }
      else{
        cancel = true;
      }

    }).then((blob) => {
      if (!cancel){
      return Fire.shared.uploadToFirebase(blob, x);
      }
    }).then((snapshot) => {
      if (!cancel){
      Fire.shared.getAndSend(x)
      }
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
    return (
      <View style={{ flex: 1, alignItems: 'center', paddingTop: getStatusBarHeight() }}>
        <View style={{ height: '7%', width: '100%', flexDirection: 'row'}}>
          <View style={{ flex: 1, height:'80%'}}>
            <TouchableOpacity style = {{height:'100%', width: (entireScreenHeight-getStatusBarHeight()) * 0.07, marginLeft:'10%'}} onPress = {() => this.props.navigation.dispatch(NavigationActions.back())}>
              <Image style = {{width:'100%', height:'100%'}} source={require('../assets/backarrow.png')} resizeMode='contain' >
              </Image>
              </TouchableOpacity>
          </View>
          <View style={{ flex: 1, height:'80%', alignItems:'center', justifyContent:'center'}}>
          <Text style = {{fontFamily:'SourceB', fontSize:Math.min(15*rem,27*wid)}}>{this.state.other}</Text>
          </View>
          <View style={{ flex: 1, height:'80%', alignItems:'flex-end'}}>
          <TouchableOpacity style = {{height:'100%', width: (entireScreenHeight-getStatusBarHeight()) * 0.07, marginRight:'10%'}} onPress = {this.handleOnPress}>
              <Image style = {{width:'100%', height:'100%'}} source={require('../assets/camera.png')} resizeMode='contain'>
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

  componentDidMount() {
    this.setState({other: String(global.uname) != String(global.volname) ? global.volname : global.senname})
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
