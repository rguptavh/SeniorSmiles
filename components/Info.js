import * as React from 'react';
import { FlatList, View, StyleSheet, Text, TouchableWithoutFeedback, Keyboard, Image, ImageBackground, TextInput, TouchableOpacity, Dimensions, AsyncStorage, KeyboardAvoidingView, Alert } from 'react-native';
import moment from 'moment';
import Spinner from 'react-native-loading-spinner-overlay';
import * as Location from 'expo-location';
import { Notifications } from 'expo';
import { NavigationActions, StackActions } from 'react-navigation'
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { LinearGradient } from 'expo-linear-gradient';
import Fire from '../Fire';

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
    store: global.accept[3]
  };
  constructor() {
    super();
    Text.defaultProps = Text.defaultProps || {};
    // Ignore dynamic type scaling on iOS
    Text.defaultProps.allowFontScaling = false;

  }
  static navigationOptions = { headerMode: 'none', gestureEnabled: false };

  chat = () => {
    global.volname = this.state.userhelp;
    global.senname = global.uname;
    console.log(global.volname + " " + global.senname)
    this.props.navigation.navigate('Chat')
  }

  async componentDidMount() {


  }

  _renderItem = ({ item }) => {

    return (

      <View style={{ height: rem * 35, width: '100%' }}>
        <View style={{ height: '80%', width: '100%', flexDirection: 'row', }}>
          <View style={{ flex: 3, borderWidth: 2, borderRadius: 20, justifyContent: 'center', }}>
            <Text style={{ width: '90%', marginLeft: '10%', fontFamily: 'SourceL', fontSize: rem * 15, }}>{this.state.senior.items[item.index].name}</Text>
          </View>
          <View style={{ flex: 0.25 }}></View>
          <View style={{ flex: 1, borderWidth: 2, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ width: '90%', fontFamily: 'SourceL', fontSize: rem * 15, textAlign: 'center' }}>{this.state.senior.items[item.index].quantity}</Text>
          </View>
        </View>
      </View>
    );
  }
  render() {
    console.log(this.state.senior.items)
    const onPress = async () => {
      var uname = global.uname;
      var items = this.state.senior.items.slice();
      items.pop();
      var empty = false;
      for (var x = 0, l = items.length; x < l; x++) {
        if (items[x].value == '' || items[x].quantity == '') {
          empty = true;
          break;
        }
      }
      items = JSON.stringify(items);

      if (uname != "" && !empty) {
        location = await Location.getCurrentPositionAsync({});
        var loc = JSON.stringify({ coordinate: { longitude: location.coords.longitude, latitude: location.coords.latitude } });
        this.setState({ loading: true });
        const Http = new XMLHttpRequest();
        const url = 'https://script.google.com/macros/s/AKfycbyy9wg6h8W2WzlpnTrTAxsioEsuFfBSVjE0hTrlQoRUnoSUsAk/exec';
        var data = "?username=" + uname + "&location=" + loc + "&items=" + items + "&action=senior";
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
    return (
      <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "height"} style={styles.container}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>

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
                  <TouchableOpacity style={{ flex: 1 }}>
                    <LinearGradient colors={['#8B9DFD', '#BF0DFE']} style={{ width: '100%', flex: 1, borderRadius: 25 }}>

                      <Image style={{ width: '100%', height: '100%', }} source={require('../assets/compass.png')} resizeMode='contain'>
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
                  <View style={{ flex: 0.75, justifyContent: 'flex-start', paddingLeft: '0%', alignItems: 'flex-start', width: '100%', alignItems: 'center' }}>
                    <Text style={{ fontSize: Math.min(35 * wid, 17 * rem), color: '#BF0DFE', fontFamily: 'SourceB' }}>Items List</Text>
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
                <TouchableOpacity style={{ width: '100%', height: '40%', }}>
                  <LinearGradient colors={['#8B9DFD', '#BF0DFE']} style={{ flex: 1, width: '100%', borderRadius: 25, alignItems:'center', justifyContent:'center' }}>
                    <Text style = {{color:'white', fontFamily:'SourceB', fontSize:  Math.min(20*rem,36*wid), textAlign:'center'}}>Back</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, width: '90%', paddingLeft: '3%', paddingRight: '3%' }}>
                <TouchableOpacity style={{ width: '100%', height: '40%', }}>
                  <LinearGradient colors={['#8B9DFD', '#BF0DFE']} style={{ flex: 1, width: '100%', borderRadius: 25, alignItems:'center', justifyContent:'center' }}>
                    <Text style = {{color:'white', fontFamily:'SourceB', fontSize:  Math.min(20*rem,36*wid), textAlign:'center'}}>Accept</Text>
                  </LinearGradient>
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