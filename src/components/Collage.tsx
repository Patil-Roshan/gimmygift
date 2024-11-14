import React from 'react';
import {View, Image, StyleSheet} from 'react-native';

const Collage = ({images}: {images: string[]}) => {
  return (
    <View style={styles.collageContainer}>
      {images.length === 1 && (
        <Image source={{uri: images[0]}} style={styles.fullImage} />
      )}
      {images.length === 2 &&
        images.map((image, index) => (
          <Image key={index} source={{uri: image}} style={styles.halfImage} />
        ))}
      {images.length === 3 && (
        <>
          <Image source={{uri: images[0]}} style={styles.thirdImageTop} />
          <View style={styles.thirdImageBottomContainer}>
            <Image source={{uri: images[1]}} style={styles.thirdImageBottom} />
            <Image source={{uri: images[2]}} style={styles.thirdImageBottom} />
          </View>
        </>
      )}
      {images.length >= 4 &&
        images
          .slice(0, 4)
          .map((image, index) => (
            <Image key={index} source={{uri: image}} style={styles.image} />
          ))}
    </View>
  );
};

const styles = StyleSheet.create({
  collageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: 150,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    padding: 5,
  },
  fullImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  halfImage: {
    width: '48%',
    height: '100%',
    borderRadius: 4,
  },
  thirdImageTop: {
    width: '100%',
    height: '48%',
    marginBottom: 4,
    borderRadius: 4,
  },
  thirdImageBottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: '48%',
    borderRadius: 4,
  },
  thirdImageBottom: {
    width: '48%',
    height: '100%',
    borderRadius: 4,
  },
  image: {
    width: '48%',
    height: '48%',
    borderRadius: 4,
  },
});

export default Collage;
