import React from 'react';
import { Text, View, Vibration, Platform, StyleSheet,AsyncStorage, Image, Alert } from 'react-native';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import * as Font from 'expo-font';
import Constants from 'expo-constants';
import { createStackNavigator } from 'react-navigation-stack'
import { createAppContainer } from 'react-navigation';
import log from './components/Login';
import forgot from './components/Forgot';
import map from './components/Map';
import signup from './components/Signup';
import senior from './components/Senior';
import chat from './components/Chat';
import { SplashScreen } from 'expo';
import { Asset } from 'expo-asset';
import moment from 'moment';
import Fire from './Fire';



//import moment from 'moment';
global.token = "None"
let logged = false;
let type = '';

export default class AppContainer extends React.Component {
  state = {
    notification: {},
    assetsLoaded: false,
    isAppReady: false,
  };
  constructor() {
    super();
    Text.defaultProps = Text.defaultProps || {};
    // Ignore dynamic type scaling on iOS
    Text.defaultProps.allowFontScaling = false;
    SplashScreen.preventAutoHide(); // Instruct SplashScreen not to hide yet

  }
  registerForPushNotificationsAsync = async () => {
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        asked = await AsyncStorage.getItem('asked')
        console.log(asked)
        if (asked == null || asked == 'undefined') {
          AsyncStorage.setItem('asked', "true");
          Alert.alert('Please Enable Notifications','This app uses notifications to notify you about the status of requests.');
        }

        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);

        finalStatus = status;
        console.log(status)
      }
      if (finalStatus !== 'granted') {
        return;
      }
      global.token = await Notifications.getExpoPushTokenAsync();
    } else {
      alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.createChannelAndroidAsync('default', {
        name: 'default',
        sound: true,
        priority: 'max',
        vibrate: [0, 250, 250, 250],
      });
    }
    return;
  };


  async componentDidMount() {
    await this.registerForPushNotificationsAsync();
    // Handle notifications that are received or selected while the app
    // is open. If the app was closed and then opened by tapping the
    // notification (rather than just tapping the app icon to open it),
    // this function will fire on the next tick after the app starts
    // with the notification data.
    this._notificationSubscription = Notifications.addListener(this._handleNotification);
    await Font.loadAsync({
      //'Noto': require('./assets/fonts/NotoSans-SemiBold.ttf'),
      'Source': require('./assets/fonts/SourceSansPro-Regular.otf'),
      'SourceB': require('./assets/fonts/SourceSansPro-Bold.otf'),
      'SourceL': require('./assets/fonts/SourceSansPro-Light.otf'),
    });
    this.cacheResourcesAsync() // ask for resources
    .then(() => this.setState({assetsLoaded: true})) // mark resources as loaded

    global.logging = false;
    let name;
    try {
      name = await AsyncStorage.getItem('username')
    //  // console.log(name);
    //  // console.log(global.logged);
      if (name !== null && name != 'undefined') {
        logged = true;
        global.uname = name;
      }

    } catch (e) {
      console.log('Failed to load .')
    }
    if (logged) {
      type = await AsyncStorage.getItem('type')
      const Http = new XMLHttpRequest();
      const url = 'https://script.google.com/macros/s/AKfycbyy9wg6h8W2WzlpnTrTAxsioEsuFfBSVjE0hTrlQoRUnoSUsAk/exec';
      var data = "?username=" + name + "&type=" + type + "&token=" + String(global.token) + "&action=logged";
      console.log(data)
      Http.open("GET", String(url + data));
      Http.send();
      var ok;
      Http.onreadystatechange = (e) => {
        ok = Http.responseText;
        if (Http.readyState == 4) {
            console.log(ok);
            if (type == "Volunteer") {
              global.uname = uname;
              Fire.shared.observeAuth2();
              var seniors = JSON.parse(ok.substring(10,ok.length));
              global.seniors = seniors;
              var markers = [];
              for (var x=0,l=seniors.length;x<l;x++){
                markers.push(seniors[x].location);
              }
              global.markers = markers;
              console.log(markers)
              this.setState({ loading: false, isAppReady:true });
              
            }
            else if (type == "Senior") {
              var index = ok.indexOf(",",7);
              var status = ok.substring(7,index);
              var items = ok.substring(index+1,ok.length);
              global.status = status;
              var temp = JSON.parse(items);
              global.userhelp = temp[temp.length-1].username
              temp.splice(temp.length-1, 1);
              global.items = temp;
              AsyncStorage.setItem('type', "Senior");
              this.setState({ loading: false, isAppReady:true });

            }
            else {
              this.setState({ loading: false });
              setTimeout(() => { alert("Server Error"); }, 100);
            }

        }
      }
    }
    else {
      global.hours = 0;
      global.minutes = 0;
      SplashScreen.hide();
      this.setState({ isAppReady: true });
    }
 
  }

  _handleNotification = notification => {
    Vibration.vibrate();
  };

  // Can use this function below, OR use Expo's Push Notification Tool-> https://expo.io/dashboard/notifications
  render() {
    if (!this.state.assetsLoaded) {
      return null;
  }
    if (!this.state.isAppReady) {
        return (
          <View style={{ flex: 1 }}>
          <Image
            style={{ flex: 1, resizeMode: 'cover', width: undefined, height: undefined }}
            source={require('./assets/splash.gif')}
            onLoadEnd={() => {
              SplashScreen.hide(); // Image is fully presented, instruct SplashScreen to hide
            }}
            fadeDuration={0}
          />
        </View>
      );
        }

      const AppNavigator = createStackNavigator({
        Login: {
          screen: log
        },
        Map: {
          screen: map
        },
        Signup: {
          screen:signup
        },
        Forgot: {
          screen:forgot
        },
        Senior: {
          screen:senior
        },
        Chat: {
          screen:chat
        }
      },
        {
          initialRouteName: logged ? type == 'Volunteer' ? 'Map' : 'Senior' : 'Login',
          headerMode:'none'
        });

      const AppContainer = createAppContainer(AppNavigator);
      return(
      <AppContainer/>
      );
  }
  async cacheResourcesAsync() {
    const images = [require('./assets/splash.png')];
    const cacheImages = images.map(image => Asset.fromModule(image).downloadAsync());
    return Promise.all(cacheImages);
  }
}

/*  TO GET PUSH RECEIPTS, RUN THE FOLLOWING COMMAND IN TERMINAL, WITH THE RECEIPTID SHOWN IN THE CONSOLE LOGS

    curl -H "Content-Type: application/json" -X POST "https://exp.host/--/api/v2/push/getReceipts" -d '{
      "ids": ["YOUR RECEIPTID STRING HERE"]
      }'
*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
});