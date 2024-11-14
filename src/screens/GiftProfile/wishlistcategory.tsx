/* eslint-disable react-native/no-inline-styles */
import {View, Text, FlatList, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Button from '../../components/Button';
import Webpage from '../../components/webpage';

export default function Wishlistcategory() {
  const route = useRoute();
  const navigation = useNavigation();
  const [showWebpage, setShowWebpage] = useState(false);
  const [productLink, setProductLink] = useState('');
  const {title, items} = route?.params ?? {};

  useEffect(() => {
    navigation.setOptions({
      headerTitle: title || 'Wishlist',
    });
  }, [navigation, title]);

  const renderWishlistItem = ({item}: {item: any; index: number}) => {
    return (
      <View style={styles.slide}>
        <View style={styles.cardContainer}>
          <View style={{width: '40%', backgroundColor: '#fff'}}>
            <FastImage
              source={{
                uri: item?.image_url,
              }}
              resizeMode="cover"
              style={{width: '100%', height: '100%'}}
            />
          </View>
          <View style={{width: '60%', backgroundColor: '#fff', padding: 15}}>
            <Text numberOfLines={1} style={styles.cardTitle}>
              {item?.product_name}
            </Text>
            <Text
              numberOfLines={1}
              style={{color: '#000', fontSize: 18, fontWeight: '500'}}>
              {item?.product_name}
            </Text>
            <Text style={styles.cardPrice}>$ {item?.price}</Text>

            <Button
              onPress={() => {
                setProductLink(item?.link);
                setShowWebpage(true);
              }}
              label="Buy as gift"
              width={'100%'}
              height={35}
              fontSize={14}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View>
      <Webpage
        isOpen={showWebpage}
        link={productLink}
        onClose={() => setShowWebpage(false)}
        key={'productPage'}
      />
      <FlatList
        data={items?.items}
        renderItem={renderWishlistItem}
        style={styles.endList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    width: '100%',
    borderRadius: 8,
    alignSelf: 'center',
    borderColor: '#000',
    marginVertical: 8,
    height: 200,
  },
  endList: {paddingVertical: 10, width: '100%', paddingHorizontal: 15},
  cardContainer: {
    flexDirection: 'row',
    width: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  cardTitle: {
    color: '#848484',
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 6,
  },
  cardPrice: {
    color: '#000',
    fontSize: 18,
    fontWeight: '400',
    marginVertical: 15,
  },
});
