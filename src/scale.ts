import {Dimensions, PixelRatio} from 'react-native';

const {width} = Dimensions.get('window');
const baseWidth = () => {
  if (width >= 430) {
    return 430; // iPhone 14
  } else if (width >= 414) {
    return 414; // iPhone 11
  } else if (width >= 393) {
    return 393; // iPhone 14, 13
  } else if (width >= 390) {
    return 390; // iPhone 12, 11
  } else if (width >= 375) {
    return 375; // iPhone 8, 7, 6s
  } else if (width >= 360) {
    return 360; // iPhone 13 Mini, 12 Mini
  } else {
    return 320; // iPhone 5, 4s
  }
};
const BASE_WIDTH = baseWidth();

const scale = (size: number) => {
  const scaling = width / BASE_WIDTH;
  return PixelRatio.roundToNearestPixel(size * scaling);
};

export default scale;
