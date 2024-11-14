import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');
const imageSize = 100;
const shimmerHeight = 20;

const ShimmerPlaceholder = () => {
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
          width={width * 0.4}
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
        <ShimmerPlaceHolder
          style={styles.buttonShimmer}
          width={width * 0.5}
          height={shimmerHeight * 1.5}
          LinearGradient={LinearGradient}
          shimmerColors={['#E1E9EE', '#F2F8FC', '#E1E9EE']}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 225,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 15,
    marginEnd: 16,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: 18,
    marginTop: 18,
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
    alignSelf: 'center',
    marginVertical: 8,
  },
  buttonShimmer: {
    marginTop: 8,
    borderRadius: 8,
  },
});

export default ShimmerPlaceholder;
