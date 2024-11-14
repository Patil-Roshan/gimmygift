import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');
const imageSize = 45;
const shimmerHeight = 15;

const ShimmerPlaceholderVertical = () => {
  return (
    <View style={styles.container}>
      <ShimmerPlaceHolder
        style={styles.imageShimmer}
        width={imageSize}
        height={imageSize}
        LinearGradient={LinearGradient}
        shimmerColors={['#E1E9EE', '#F2F8FC', '#E1E9EE']}
      />
      <View style={styles.textContainer}>
        <ShimmerPlaceHolder
          style={styles.textShimmer}
          width={width * 0.5}
          height={shimmerHeight}
          LinearGradient={LinearGradient}
          shimmerColors={['#E1E9EE', '#F2F8FC', '#E1E9EE']}
        />
        <ShimmerPlaceHolder
          style={styles.textShimmer}
          width={width * 0.3}
          height={shimmerHeight}
          LinearGradient={LinearGradient}
          shimmerColors={['#E1E9EE', '#F2F8FC', '#E1E9EE']}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: 'auto',
    alignItems: 'center',
    margin: 5,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    borderRadius: 8,
    borderColor: '#d6d6d6',
    backgroundColor: '#fff',
  },
  imageShimmer: {
    marginRight: 16,
    borderRadius: 50,
  },
  textContainer: {
    flex: 1,
    alignSelf: 'center',
  },
  textShimmer: {
    marginBottom: 8,
    // alignSelf: 'center',
    marginVertical: 8,
  },
  buttonShimmer: {
    marginTop: 8,
    borderRadius: 8,
  },
});

export default ShimmerPlaceholderVertical;
