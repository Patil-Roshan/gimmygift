import {Dimensions} from 'react-native';

// const {width, height} = Dimensions.get('window');
// const scale = Math.min(width, height) / 375; // Base scale on iPhone 8 screen width

// const scaledSize = (size: number) => Math.round(size * scale);

const {width, height} = Dimensions.get('window');
const scaledSize = fontSize => {
  const getBaseWidth = () => {
    if (width >= 430) {
      return 430; // iPhone 14 Pro Max, 13 Pro Max, iPhone 16 Pro Max
    } else if (width >= 414) {
      return 414; // iPhone 11 Pro Max, XR, iPhone 16 Plus
    } else if (width >= 393) {
      return 393; // iPhone 14, 13, iPhone 16
    } else if (width >= 390) {
      return 390; // iPhone 12, 11
    } else if (width >= 375) {
      return 375; // iPhone 8, 7, 6s, iPhone SE (2020, 2022)
    } else if (width >= 360) {
      return 360; // iPhone 13 Mini, 12 Mini
    } else {
      return 320; // iPhone 5, 4s, original iPhone SE
    }
  };

  // Function to get base height based on iPhone model, including iPhone 16 and SE series
  const getBaseHeight = () => {
    if (height >= 932) {
      return 932; // iPhone 14 Pro Max, 13 Pro Max, iPhone 16 Pro Max
    } else if (height >= 896) {
      return 896; // iPhone 11 Pro Max, XR, iPhone 16 Plus
    } else if (height >= 852) {
      return 852; // iPhone 14, 13, iPhone 16
    } else if (height >= 844) {
      return 844; // iPhone 12, 11
    } else if (height >= 812) {
      return 812; // iPhone X, XS
    } else if (height >= 736) {
      return 736; // iPhone 6 Plus, 7 Plus, 8 Plus, iPhone SE (2020, 2022)
    } else if (height >= 667) {
      return 690; // iPhone 6, 7, 8, iPhone SE (2020, 2022)
    } else if (height >= 568) {
      return 568; // iPhone 5, 4s, original iPhone SE
    } else {
      return 480; // Older iPhones
    }
  };

  const baseWidth = getBaseWidth();
  const baseHeight = getBaseHeight();
  const scaleFactor = Math.min(width / baseWidth, height / baseHeight);
  return Math.round(fontSize * scaleFactor);
};
export default scaledSize;
