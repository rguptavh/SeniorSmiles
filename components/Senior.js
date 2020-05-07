import * as React from 'react';
import { FlatList, View, StyleSheet, Text, TouchableWithoutFeedback, Keyboard, Image, ImageBackground, TextInput, TouchableOpacity, Dimensions, AsyncStorage, KeyboardAvoidingView, Alert } from 'react-native';
import moment from 'moment';
import Spinner from 'react-native-loading-spinner-overlay';
import * as Location from 'expo-location';
import { NavigationActions, StackActions } from 'react-navigation'

const entireScreenHeight = Dimensions.get('window').height;
const rem = entireScreenHeight / 380;
const entireScreenWidth = Dimensions.get('window').width;
const wid = entireScreenWidth / 380;
let location = null;
export default class Login extends React.Component {
  state = {
    username: '',
    password: '',
    loading: false,
    items: global.items,
    status: global.status,
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
  if (temp[temp.length-1].index == 10){
    alert("Please have a maximum of 10 items")
  }
  else{
  temp.splice(temp.length-1,0,{index: temp.length-1, name:'',quantity:''});
  temp[temp.length-1]["index"] = temp.length-1;
  this.setState({items:temp});
  }
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
            const resetAction = StackActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({routeName: 'Login'})],
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
    location = await Location.getCurrentPositionAsync({});
  }
  _renderItem = ({ item }) => {
    if (item.add) {
      if (this.state.status == 'order'){
      return (
        <View style={{ height: rem * 35, width: '100%' }}>
          <TouchableOpacity style={{ height: '60%', width: '100%', flexDirection: 'row', alignItems:'center', }} onPress={this.add}>
              <Image style={{ flex: 0.75, width: '100%', height: '100%',}} source={require('../assets/plus.png')} resizeMode='contain'>
              </Image>
              <View style={{ flex: 0.2 }}></View>
            <View style={{ flex: 3 }}>
              <Text style = {{fontFamily:'SourceL', fontSize:rem*15}}>Add Item</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
      }
      else {
        return null;
        }
    }
    else{
    if (this.state.status == 'order'){
    return (

      <View style={{ height: rem * 35, width: '100%' }}>
        <View style={{ height: '80%', width: '100%', flexDirection: 'row', }}>
          <View style={{ flex: 3, borderWidth: 2, borderRadius: 20, }}>
            <TextInput style={{ flex: 1, width: '90%', marginLeft: '10%',fontFamily:'SourceL',fontSize:rem*15 }} placeholder="Name" onChangeText={(value) => {
              var temp = this.state.items;
              temp[item.index]["name"] = value;
              this.setState({items: temp})
              console.log(this.state.items)
            } }></TextInput>
          </View>
          <View style={{ flex: 0.25 }}></View>
          <View style={{ flex: 1, borderWidth: 2, borderRadius: 20 }}>
            <TextInput style={{ flex: 1, width: '100%', textAlign: 'center',fontFamily:'SourceL', fontSize:rem*15 }} placeholder="#" onChangeText={(value) => {
              var temp = this.state.items;
              temp[item.index]["quantity"] = value;
              this.setState({items: temp})
              console.log(this.state.items)
            } }></TextInput>
          </View>
        </View>
      </View>
    );
  }
  else{
    return (

      <View style={{ height: rem * 35, width: '100%' }}>
        <View style={{ height: '80%', width: '100%', flexDirection: 'row', }}>
          <View style={{ flex: 3, borderWidth: 2, borderRadius: 20, justifyContent:'center', }}>
            <Text style={{ width: '90%', marginLeft: '10%',fontFamily:'SourceL',fontSize:rem*15, }}>{this.state.items[item.index].name}</Text>
          </View>
          <View style={{ flex: 0.25 }}></View>
          <View style={{ flex: 1, borderWidth: 2, borderRadius: 20,justifyContent:'center', alignItems:'center' }}>
          <Text style={{ width: '90%',fontFamily:'SourceL',fontSize:rem*15, textAlign:'center' }}>{this.state.items[item.index].quantity}</Text>
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
      console.log("papito");
      var uname = 'rgupta';
      var items = this.state.items.slice();
      items.pop();
      var empty = false;
      for (var x=0, l = items.length; x<l; x++){
        if (items[x].value == '' || items[x].quantity == ''){
          empty = true;
          break;
        }
      }
      items = JSON.stringify(items);
      
      if (uname != "" && !empty) {
        location = await Location.getCurrentPositionAsync({});
        var loc = JSON.stringify({coordinate : {longitude : location.coords.longitude, latitude: location.coords.latitude}});
        this.setState({ loading: true });
        const Http = new XMLHttpRequest();
        const url = 'https://script.google.com/macros/s/AKfycbyy9wg6h8W2WzlpnTrTAxsioEsuFfBSVjE0hTrlQoRUnoSUsAk/exec';
        var data = "?username=" + uname + "&location=" + loc +"&items="+items+ "&action=senior";
        console.log(data);
        Http.open("GET", String(url + data));
        Http.send();
        var ok;
        Http.onreadystatechange = (e) => {
          ok = Http.responseText;
          if (Http.readyState == 4) {
            console.log(String(ok));
            if (ok == "true") {
              this.setState({ loading: false, status:'nothelped' });
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
              textContent={'Submitting request...'}
              textStyle={styles.spinnerTextStyle}
            />
            <ImageBackground style={{ flex: 1, width: '100%', alignItems: 'center' }} source={require('../assets/seniorreq.png')}>
              <View style={{ flex: 1.25, width: '100%', alignItems:'center', justifyContent:'center' }}>
                <Text style = {{fontSize:Math.min(wid*35,rem*15), color:'white', fontFamily:'SourceB'}}>{this.state.status == 'ordered' ? 'No ongoing requests.' : this.state.status == 'nothelped' ? 'Request submitted' : 'Request started'} </Text>
              </View>
              <View style={{ flex: 3, width: '100%', alignItems: 'center' }}>
                <View style={{ flex: 1, alignItems: 'center', width: '85%', backgroundColor: 'white', borderRadius: 20, borderColor: '#3C5984', borderWidth: 2, shadowOffset: { width: 0, height: 4, }, shadowOpacity: 0.30, elevation: 8, marginTop:'-10%',marginBottom:'7%'}}>
                  <View style={{ flex: 0.75, justifyContent: 'center', paddingLeft: '0%', alignItems: 'flex-start', width: '100%', paddingLeft: '7.5%' }}>
                    <Text style={{ fontSize: Math.min(35 * wid, 17 * rem), color: '#BF0DFE', fontFamily: 'SourceB' }}>{this.state.status == 'orderd' ? 'Items Desired:' : 'Items Requested:'}</Text>
                  </View>
                  <View style={{ flex: 3, width: '85%' }}>
                    <FlatList style={{ width: '100%', }}
                      data={this.state.items}
                      renderItem={this._renderItem}
                      keyExtractor={item => "" + item.index}
                    />
                  </View>
                  <View style={{ flex: 0.2 }}></View>
                </View>
              </View>
              <View style={{ flex: 1, width: '70%' }}>
              <TouchableOpacity style={{height:entireScreenWidth*0.7*240/720,width:'100%',}} onPress={onPress}>
              <Image style={{  width: '100%', height: '100%',}} source={require('../assets/submit.png')} resizeMode='contain'>
              </Image>
              </TouchableOpacity>
              <TouchableOpacity style = {{marginTop:'3%',alignSelf:'center'}} onPress={this.onPress2}>
              <Text style = {{fontSize:Math.min(rem*20,wid*30), fontFamily:'Source'}}>Logout</Text>
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