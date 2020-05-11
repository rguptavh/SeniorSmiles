import React, { Component } from 'react';
import { StyleSheet, Text, View, Animated, Dimensions, Alert, AsyncStorage } from "react-native";
import MapView from "react-native-maps";
import * as Location from 'expo-location';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NavigationActions, StackActions } from 'react-navigation'
import Fire from '../Fire';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get("window");
const CARD_HEIGHT = height * 0.3;
const CARD_WIDTH = width * 0.9;
const entireScreenHeight = Dimensions.get('window').height;
const rem = entireScreenHeight / 380;
const entireScreenWidth = Dimensions.get('window').width;
const wid = entireScreenWidth / 380;
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mapRegion: null,
      hasLocationPermissions: false,
      locationResult: null,
      location: null,
      index: 0,
      markers: global.markers,
      region: {
        latitude: 45.52220671242907,
        longitude: -122.6653281029795,
        latitudeDelta: 0.02864195044303443,
        longitudeDelta: 0.020142817690068,
      },
      seniors: global.seniors,
    };
  }
  animate() {
    const { coordinate } = this.state.coordinate;
    const newCoordinate = {
      latitude: LATITUDE + (Math.random() - 0.5) * (LATITUDE_DELTA / 2),
      longitude: LONGITUDE + (Math.random() - 0.5) * (LONGITUDE_DELTA / 2),
    };

    if (Platform.OS === 'android') {
      if (this.marker) {
        this.marker._component.animateMarkerToCoordinate(newCoordinate, 500);
      }
    } else {
      coordinate.timing(newCoordinate).start();
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
            const Http = new XMLHttpRequest();
            const url = 'https://script.google.com/macros/s/AKfycbyy9wg6h8W2WzlpnTrTAxsioEsuFfBSVjE0hTrlQoRUnoSUsAk/exec';
            var data = "?username=" + global.uname + "&token=" + global.token + "&action=logout";
            Http.open("GET", String(url + data));
            Http.send();
            Fire.shared.signout();
            const resetAction = StackActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({ routeName: 'Login' })],
              key: null,
            });
            this.props.navigation.dispatch(resetAction);
          }
        }
      ],
      { cancelable: false }
    );

  }
  distance(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
      return 0;
    }
    else {
      var radlat1 = Math.PI * lat1 / 180;
      var radlat2 = Math.PI * lat2 / 180;
      var theta = lon1 - lon2;
      var radtheta = Math.PI * theta / 180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = dist * 180 / Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit == "K") { dist = dist * 1.609344 }
      if (unit == "N") { dist = dist * 0.8684 }
      return dist;
    }
  }
  componentDidMount() {
    console.log('mount')
    this.focusListener = this.props.navigation.addListener('willFocus', () => {
      this.setState({ count: 0, markers: global.markers, seniors: global.seniors });
      console.log('move')
    });
    this.getLocationAsync();
    this.index = 0;
    this.animation = new Animated.Value(0);
    this.animation.addListener(({ value }) => {

      let index = Math.floor(value / CARD_WIDTH + 0.2); // animate 20% away from landing on the next item
      if (index >= this.state.markers.length) {
        index = this.state.markers.length - 1;
      }
      if (index <= 0) {
        index = 0;
      }
      clearTimeout(this.regionTimeout);

      this.regionTimeout = setTimeout(() => {
        if (this.index !== index) {
          this.index = index;
          this.setState({ index: index })
          const { coordinate } = this.state.markers[index];
          this.map.animateToRegion(
            {
              ...coordinate,
              latitudeDelta: this.state.region.latitudeDelta,
              longitudeDelta: this.state.region.longitudeDelta,
            },
            350
          );
        }
      }, 0);
    });
  }
  details = (senior, index, distance, store) => {
    global.accept = [senior, index, distance, store];
    this.props.navigation.navigate('Info')
  }

  handleMapRegionChange = (map) => {
    //console.log(map);
    this.setState({ mapRegion: map });
  }
  componentWillUnmount() {
    // Remove the event listener before removing the screen from the stack
    this.focusListener.remove();
  }
  cards = (marker, index) => {
    if (this.state.seniors[index].userhelp != global.uname) {
      return (
        <LinearGradient colors={['#8B9DFD', '#BF0DFE']} style={styles.card} key={index}>
          <View style={{ flex: 1, width: '100%' }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ borderBottomColor: 'black', borderBottomWidth: 4 }}>
                <Text style={{ fontFamily: 'SourceB', fontSize: Math.min(15 * rem, 27 * wid) }}>{this.state.seniors[index].name}</Text>
              </View>
            </View>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'SourceB', fontSize: Math.min(15 * rem, 27 * wid) }}>Preferred Store: {this.state.seniors[index].store}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'SourceB', fontSize: Math.min(15 * rem, 27 * wid) }}>Distance: {this.state.location != null ? this.distance(marker.coordinate.latitude, marker.coordinate.longitude, this.state.location.latitude, this.state.location.longitude, 'N').toFixed(1) + ' Miles' : null}</Text>
            </View>
            <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <TouchableOpacity onPress={() => this.details(this.state.seniors[index], index, this.distance(marker.coordinate.latitude, marker.coordinate.longitude, this.state.location.latitude, this.state.location.longitude, 'N').toFixed(1), this.state.seniors[index].store)}>
                <Text style={{ fontFamily: 'SourceL', fontSize: Math.min(15 * rem, 27 * wid) }}>Click for more information</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      );
    }
    else {
      return (
        <LinearGradient colors={['#FFCD9F', '#FF6666']} style={styles.card} key={index}>
          <View style={{ flex: 1, width: '100%' }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ borderBottomColor: 'black', borderBottomWidth: 4 }}>
                <Text style={{ fontFamily: 'SourceB', fontSize: Math.min(15 * rem, 27 * wid) }}>{this.state.seniors[index].name}</Text>
              </View>
            </View>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'SourceB', fontSize: Math.min(15 * rem, 27 * wid) }}>Preferred Store: {this.state.seniors[index].store}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'SourceB', fontSize: Math.min(15 * rem, 27 * wid) }}>Distance: {this.state.location != null ? this.distance(marker.coordinate.latitude, marker.coordinate.longitude, this.state.location.latitude, this.state.location.longitude, 'N').toFixed(1) + ' Miles' : null}</Text>
            </View>
            <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <TouchableOpacity onPress={() => this.details(this.state.seniors[index])}>
                <Text style={{ fontFamily: 'SourceL', fontSize: Math.min(15 * rem, 27 * wid) }}>Click for more information</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      );
    }
  }

  async getLocationAsync() {
    let { status } = await Location.requestPermissionsAsync();
    if (status !== 'granted') {
      this.setState({
        locationResult: 'Permission to access location was denied',
      });
    } else {
      this.setState({ hasLocationPermissions: true });
    }

    let location = await Location.getCurrentPositionAsync({});
    console.log(location)
    this.setState({ mapRegion: { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 } });
    this.setState({ locationResult: JSON.stringify(location) });
    this.setState({ location: { latitude: location.coords.latitude, longitude: location.coords.longitude } });

    // Center the map on the location we just fetched.

  }

  render() {
    if (this.state.markers.length != 0) {
      return (
        <View style={styles.container}>
          <MapView
            ref={map => this.map = map}
            initialRegion={this.state.mapRegion}
            style={styles.container}
          >
            {this.state.location != null ? <MapView.Marker key={this.state.markers.length} coordinate={this.state.location} title="Your Location" pinColor='blue' isPreselected={true}></MapView.Marker> : null}


            {this.state.markers.map((marker, index) => {
              return (
                <MapView.Marker key={index} coordinate={marker.coordinate} pinColor={this.state.index == index ? 'green' : 'red'}>

                </MapView.Marker>
              );
            })}
          </MapView>
          <Animated.ScrollView
            horizontal
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH * 1.115}
            disableIntervalMomentum={true}
            onScroll={Animated.event(
              [
                {
                  nativeEvent: {
                    contentOffset: {
                      x: this.animation,
                    },
                  },
                },
              ],
              { useNativeDriver: true }
            )}
            style={styles.scrollView}
          >
            {this.state.markers.map((marker, index) => (
              this.cards(marker, index)
            ))}
          </Animated.ScrollView>
          <Animated.ScrollView style={{ position: "absolute", top: height * 0.93, left: 0, right: 0, height: 0.07 * height }} scrollEnabled={false}>
            <View style={{ height: height * 0.07, width: width, alignItems: 'center', flexDirection: 'row' }}>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity style={{ marginTop: height * 0.005 }} onPress={this.onPress2}>
                  <Text style={{ fontSize: Math.min(rem * 15, wid * 27), fontFamily: 'Source' }}>Logout</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity style={{ marginTop: height * 0.005 }} onPress={this.onPress2}>
                  <Text style={{ fontSize: Math.min(rem * 15, wid * 27), fontFamily: 'Source' }}>Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.ScrollView>

        </View>
      );
    }
    else {
      return (
        <View style={styles.container}>
          <MapView
            ref={map => this.map = map}
            initialRegion={this.state.mapRegion}
            style={styles.container}
          >
            {this.state.location != null ? <MapView.Marker key={this.state.markers.length} coordinate={this.state.location} title="Your Location" pinColor='blue' isPreselected={true}></MapView.Marker> : null}


            {this.state.markers.map((marker, index) => {
              return (
                <MapView.Marker key={index} coordinate={marker.coordinate} pinColor={this.state.index == index ? 'green' : 'red'}>

                </MapView.Marker>
              );
            })}
          </MapView>
          <Animated.ScrollView
            horizontal
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH * 1.115}
            scrollEnabled={false}
            disableIntervalMomentum={true}
            onScroll={Animated.event(
              [
                {
                  nativeEvent: {
                    contentOffset: {
                      x: this.animation,
                    },
                  },
                },
              ],
              { useNativeDriver: true }
            )}
            style={styles.scrollView}
          >

            <View style={styles.card}>
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ borderBottomColor: 'black', borderBottomWidth: 4 }}>
                  <Text style={{ fontFamily: 'SourceB', fontSize: Math.min(15 * rem, 27 * wid) }}>No Seniors</Text>
                </View>
              </View>
              <View style={{ flex: 3, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'SourceB', fontSize: Math.min(15 * rem, 27 * wid), }}>Sorry, there are no active requests. Please try again later.</Text>
              </View>
              <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}></View>
            </View>
          </Animated.ScrollView>
          <Animated.ScrollView style={{ position: "absolute", top: height * 0.93, left: 0, right: 0, height: 0.07 * height }} scrollEnabled={false}>
            <View style={{ height: height * 0.07, width: width, alignItems: 'center', flexDirection: 'row' }}>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity style={{ marginTop: height * 0.005 }} onPress={this.onPress2}>
                  <Text style={{ fontSize: Math.min(rem * 15, wid * 27), fontFamily: 'Source' }}>Logout</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity style={{ marginTop: height * 0.005 }} onPress={this.onPress2}>
                  <Text style={{ fontSize: Math.min(rem * 15, wid * 27), fontFamily: 'Source' }}>Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.ScrollView>

        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    bottom: height * 0.07,
    paddingVertical: 0,

  },
  endPadding: {
    paddingRight: 0,
  },
  card: {
    padding: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowOffset: { x: 2, y: -2 },
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    overflow: "hidden",
    marginHorizontal: width * 0.05,
    borderRadius: 25
  },
  cardImage: {
    flex: 3,
    width: "100%",
    height: "100%",
    alignSelf: "center",
  },
  textContent: {
    flex: 1,
  },
  cardtitle: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: "bold",
  },
  cardDescription: {
    fontSize: 12,
    color: "#444",
  },
});
