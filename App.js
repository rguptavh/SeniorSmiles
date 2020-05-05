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
        title: "Best Place",
        description: "This is the best place in Portland",
      },
      {
        coordinate: {
          latitude: 42.243308,
          longitude: -87.951591,
        },
        title: "Second Best Place",
        description: "This is the second best place in Portland",
      },
      {
        coordinate: {
          latitude: 45.5230786,
          longitude: -122.6701034,
        },
        title: "Third Best Place",
        description: "This is the third best place in Portland",
      },
      {
        coordinate: {
          latitude: 45.521016,
          longitude: -122.6561917,
        },
        title: "Fourth Best Place",
        description: "This is the fourth best place in Portland",
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
