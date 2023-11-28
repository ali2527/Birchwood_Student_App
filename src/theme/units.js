import {Dimensions, StatusBar} from 'react-native';

const HEIGHT = Dimensions.get('window').height,
  WIDTH = Dimensions.get('window').width,
  statusBarHeight = StatusBar.currentHeight;

const vh = HEIGHT * 0.01,
  vw = WIDTH * 0.01,
  carouselItemWidth = vw * 62,
  carouselSliderWidth = vw * 100;

export {
  statusBarHeight,
  HEIGHT,
  WIDTH,
  vh,
  vw,
  carouselItemWidth,
  carouselSliderWidth,
};
