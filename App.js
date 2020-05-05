import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Animated,
  Image,
  Dimensions,
} from "react-native";
import MapView from "react-native-maps";
import * as Location from 'expo-location';

const { width, height } = Dimensions.get("window");
const CARD_HEIGHT = height*0.3;
const CARD_WIDTH = width*0.9;

export default class App extends Component {
  constructor(props) {
    super(props);
  this.state = {
    mapRegion: null,
    hasLocationPermissions: false,
    locationResult: null,
    location: null,
    markers: [
      {
        coordinate: {
          latitude: 42.227131,
          longitude: -87.949499,
        },
      },
      {
        coordinate: {
          latitude: 42.243308,
          longitude: -87.951591,
        },
      },
      {
        coordinate: {
          latitude: 42.273745,
          longitude: -87.955041,
        },
      },
      {
        coordinate: {
          latitude: 42.239369,
          longitude: -87.958517,
        },
      },
    ],
    region: {
      latitude: 45.52220671242907,
      longitude: -122.6653281029795,
      latitudeDelta: 0.04864195044303443,
      longitudeDelta: 0.040142817690068,
    },
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
  componentDidMount() {
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
      }, 10);
    });
  }

  handleMapRegionChange = (map) => {
      //console.log(map);
      this.setState({mapRegion: map });
    }

  async getLocationAsync (){
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
   this.setState({mapRegion: { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }});
   this.setState({ locationResult: JSON.stringify(location) });
   this.setState({ location: {latitude: location.coords.latitude, longitude: location.coords.longitude}});
   
   // Center the map on the location we just fetched.

  }

  render() {
    return (
      <View style={styles.container}>
        <MapView
          ref={map => this.map = map}
          initialRegion={this.state.mapRegion}
          style={styles.container}
        >
          {this.state.markers.map((marker, index) => {
            return (
              <MapView.Marker key={index} coordinate={marker.coordinate}>

              </MapView.Marker>
            );
          })}
        </MapView>
        <Animated.ScrollView
          horizontal
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH*1.115}
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
          contentContainerStyle={styles.endPadding}
        >
          {this.state.markers.map((marker, index) => (
            <View style={styles.card} key={index}>
            </View>
          ))}
        </Animated.ScrollView>
      </View>
    );
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
    bottom: height*0.07,
    paddingVertical: 0,
    
  },
  endPadding: {
    paddingRight: 0,
  },
  card: {
    padding: 10,
    elevation: 2,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowOffset: { x: 2, y: -2 },
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    overflow: "hidden",
    marginHorizontal:width*0.05
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
  markerWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
