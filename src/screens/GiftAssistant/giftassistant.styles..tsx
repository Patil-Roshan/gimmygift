import {StyleSheet} from 'react-native';
import colors from '../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },

  imgContainer: {
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    resizeMode: 'cover',
    justifyContent: 'center',
    paddingTop: 50,
  },
  headTextContainer: {
    alignItems: 'center',
    paddingHorizontal: 50,
  },
  headTextStyle: {
    fontFamily: 'SFPro',
    color: '#fff',
    fontSize: 28,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 30,
    letterSpacing: 0,
    textAlign: 'center',
  },
  headSubTextStyle: {
    fontFamily: 'SFPro',
    fontSize: 16,
    color: colors.white,
    fontWeight: 'normal',
    paddingVertical: 30,
  },
  backgroundContainer: {
    width: '100%',

    justifyContent: 'center',
    marginBottom: 12,

    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'center',
    padding: 16,
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listHeadText: {
    fontFamily: 'SFPro',
    fontWeight: '600',
    color: colors.white,
    fontSize: 18,
    paddingLeft: 10,
  },

  listHeadSubText: {
    fontSize: 14,
    fontFamily: 'SFPro',
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 'normal',
    paddingTop: 8,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
  },
  imageIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    height: 34,
    borderRadius: 17,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageIcon: {
    width: 50,
    height: 34,
  },
  modalContainer: {
    height: '90%',
    width: '100%',
    backgroundColor: '#fff',
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 12,
    bottom: 0,
    overflow: 'hidden',
    paddingHorizontal: 20,
  },
  assistantLogo: {
    height: 55,
    width: 55,
  },
  assistantLabel: {
    fontSize: 25,
    fontWeight: '600',
    lineHeight: 27,
    letterSpacing: 0,
    color: '#000000',
    marginTop: 25,
  },
  descriptionLabel: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 18,
    paddingVertical: 5,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    top: 6,
    left: 0,
    right: 0,
    zIndex: 1,
    marginVertical: 10,
  },
  indicatorLabel: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 18,
    textAlign: 'center',
    paddingVertical: 15,
  },
});
