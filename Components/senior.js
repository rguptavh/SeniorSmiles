import * as React from 'react';
import { FlatList, View, StyleSheet, Text, TouchableWithoutFeedback, Keyboard, Image, ImageBackground, TextInput, TouchableOpacity, Dimensions, AsyncStorage, KeyboardAvoidingView, TextComponent } from 'react-native';
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
    items: [{ index: 0, name: '', quantity: '', add: false }, { index: 1, name: '', quantity: '', add: true }]
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
  temp.splice(temp.length-1,0,{index: temp.length-1, name:'',quantity:''});
  temp[temp.length-1]["index"] = temp.length-1;
  this.setState({items:temp});
  }
  _renderItem = ({ item }) => {
    if (item.add) {
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
  };
  render() {
    const papi = () => {
      console.log("papito");
    }

    const onPress = () => {
      console.log("papito");
      var uname = 'rgupta';
      var loc = "test";
      var items = this.state.items;
      items.pop();
      items = JSON.stringify(items);
      
      if (uname != "" && items != "") {
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
              // console.log(response.toString());
              //global.uname = uname;
              /*var total = parseFloat(ok.substring(5, ok.indexOf(",", 5)));
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
              */
              // console.log(JSON.stringify(data))
              AsyncStorage.setItem('username', this.state.username);
              this.setState({ loading: false });
              //this.props.navigation.replace('Map');
              //this.props.navigation.replace('Main')

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
        alert("Please fill all fields")
      }
    }
    return (
      <KeyboardAvoidingView behavior={Platform.OS == "ios" ? "padding" : "height"} style={styles.container}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>

          <View style={styles.container}>
            <ImageBackground style={{ flex: 1, width: '100%', alignItems: 'center' }} source={require('../assets/seniorreq.png')}>
              <View style={{ flex: 1.25, width: '100%', alignItems:'center', justifyContent:'center' }}>
                <Text style = {{fontSize:Math.min(wid*35,rem*15), color:'white', fontFamily:'SourceB'}}>No ongoing requests.</Text>
              </View>
              <View style={{ flex: 3, width: '100%', alignItems: 'center' }}>
                <View style={{ flex: 1, alignItems: 'center', width: '85%', backgroundColor: 'white', borderRadius: 20, borderColor: '#3C5984', borderWidth: 2, shadowOffset: { width: 0, height: 4, }, shadowOpacity: 0.30, elevation: 8, marginTop:'-10%',marginBottom:'7%'}}>
                  <View style={{ flex: 0.75, justifyContent: 'center', paddingLeft: '0%', alignItems: 'flex-start', width: '100%', paddingLeft: '7.5%' }}>
                    <Text style={{ fontSize: Math.min(35 * wid, 17 * rem), color: '#BF0DFE', fontFamily: 'SourceB' }}>Items Desired:</Text>
                  </View>
                  <View style={{ flex: 3, width: '85%' }}>
                    <FlatList style={{ width: '100%', }}
                      data={this.state.items}
                      renderItem={this._renderItem}
                      keyExtractor={item => "" + item.index}
                    // stickyHeaderIndices={this.state.stickyHeaderIndices}
                    />
                  </View>
                  <View style={{ flex: 0.2 }}></View>
                </View>
              </View>
              <View style={{ flex: 1, width: '70%' }}>
              <TouchableOpacity style={{flex: 0.75,width:'100%'}} onPress={onPress}  disabled={this.state.loading}
>
              <Image style={{  width: '100%', height: '100%',}} source={require('../assets/submit.png')} resizeMode='contain'>

              </Image>
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