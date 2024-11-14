import {StyleSheet, Platform, Dimensions, StatusBar} from 'react-native';
import colors from '../../theme/colors';
colors;

const {width, height} = Dimensions.get('window');
const scale = Math.min(width, height) / 375; // Base scale on iPhone 8 screen width

const scaledSize = size => Math.round(size * scale);

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop:
      Platform.OS === 'android'
        ? StatusBar?.currentHeight + scaledSize(10)
        : scaledSize(40),
  },
  image: {
    width: scaledSize(56),
    aspectRatio: 1,
    marginBottom: scaledSize(17),
    // margin: scaledSize(8),
  },
  welcomeLabel: {
    fontFamily: 'SFPro',
    fontSize: scaledSize(24),
    color: colors.black,
    marginBottom: scaledSize(3),
    fontWeight: '600',
  },
  welcomeSubLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SFPro' : 'Roboto',
    fontSize: scaledSize(16),
    color: colors.black,
    fontWeight: 'normal',
    marginBottom: scaledSize(36),
    lineHeight: 18,
  },
  btnContainer: {
    flexDirection: 'row',
    width: '90%',
    borderRadius: scaledSize(27),
    borderWidth: 1,
    borderColor: '#D9D9D9',
    height: scaledSize(48),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scaledSize(12),
  },
  btnLabel: {
    fontFamily: Platform.OS === 'ios' ? 'SFPro' : 'Roboto',
    fontSize: scaledSize(16),
    color: colors.black,
    padding: scaledSize(8),
  },
  signinLabel: {
    fontSize: scaledSize(18),
    fontWeight: 'normal',
    color: colors.black,
    marginTop: scaledSize(63),
    marginBottom: scaledSize(36),
  },
  signinLabelRed: {
    fontSize: scaledSize(18),
    color: colors.pastelRed,
    fontWeight: '700',
  },
});
