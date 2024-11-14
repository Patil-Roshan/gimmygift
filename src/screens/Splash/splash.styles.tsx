import {StyleSheet} from 'react-native';
import colors from '../../theme/colors';
import scaledSize from '../../scaleSize';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: colors.primary,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 126,
    aspectRatio: 1,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 42,
  },
  taglineLabel: {
    fontSize: 13,
    color: colors.white,
    marginBottom: 5,
  },
  copyrightLabel: {
    fontSize: 13,
    color: colors.white,
    marginBottom: scaledSize(8),
  },
});
