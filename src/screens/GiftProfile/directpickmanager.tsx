/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import colors from '../../theme/colors';
import AntDesign from 'react-native-vector-icons/AntDesign';

import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';
import activeUserInstance from '../../../store/activeUsersInstance';
import {supabase} from '../../lib/supabase';
export default function DirectPickManager() {
  const navigation = useNavigation();
  const [activeToggle, setActiveToggle] = useState('Added');

  const activeUsers = activeUserInstance(state => state.activeUsers);
  const [addedArray, setAddedArray] = useState<any>([]);
  const [discardedArray, setDiscardedArray] = useState<any>([]);
  const [filteredAddedArray, setFilteredAddedArray] = useState<any>([]);
  const [filteredDiscardedArray, setFilteredDiscardedArray] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<any>(0);
  useEffect(() => {
    fetchPreferences();
  }, [activeUsers]);

  useEffect(() => {
    applyPriceFilter();
  }, [selectedTag, addedArray, discardedArray]);

  const fetchPreferences = async () => {
    setIsLoading(true);
    const {data, error} = await supabase
      .schema('gift')
      .from('gift_preferences')
      .select('*')
      .eq('user_id', activeUsers[0].user_id);
    if (data && !error) {
      const likedArray = data.filter(item => item?.action === 'LIKED');
      const discardArray = data.filter(item => item?.action === 'DISLIKED');

      setAddedArray(likedArray);
      setDiscardedArray(discardArray);

      setFilteredAddedArray(likedArray);
      setFilteredDiscardedArray(discardArray);
      setIsLoading(false);
    }
  };

  const priceTags: any = [
    {
      name: 'All',
      amount: 0,
    },
    {
      name: 'Until $25',
      amount: 25,
    },
    {
      name: 'Until $50',
      amount: 50,
    },
    {
      name: 'Until $100',
      amount: 100,
    },
    {
      name: 'Until $150',
      amount: 150,
    },
  ];

  const renderToggle = (label: string) => {
    return (
      <TouchableOpacity
        onPress={() => setActiveToggle(label)}
        style={{
          borderBottomColor:
            activeToggle === label ? colors.primary : '#d6d6d6',
          borderBottomWidth: 1,
          paddingBottom: 10,
          width: '50%',
        }}>
        <Text
          style={[
            styles.toggleLabel,
            {color: activeToggle === label ? '#000' : '#797979'},
          ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const applyPriceFilter = async () => {
    const filterItems = (items: any[]) => {
      if (selectedTag === 0) {
        return items;
      }
      return items.filter(item => {
        const price = parseFloat(item.gift_metadata?.tag || '0');
        return price <= selectedTag;
      });
    };
    setFilteredAddedArray(await filterItems(addedArray));
    setFilteredDiscardedArray(await filterItems(discardedArray));
  };

  const renderLoader = () => {
    if (isLoading) {
      return (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SafeAreaView style={{backgroundColor: '#fff'}} />
      <StatusBar barStyle="dark-content" />
      {renderLoader()}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <AntDesign
          name="left"
          color={colors.primary}
          size={24}
          onPress={() => navigation.goBack()}
        />
        <FastImage
          style={{
            width: 42,
            height: 42,
            marginHorizontal: 10,
            borderRadius: 24,
          }}
          source={{uri: activeUsers[0].profile_image}}
          resizeMode="contain"
        />
        <Text
          style={{
            fontSize: 25,
            color: '#000',
            fontWeight: '500',
            paddingHorizontal: 10,
            width: '68%',
          }}>
          {activeUsers[0].full_name}
        </Text>
        {/* <Feather name="search" color={colors.primary} size={26} /> */}
      </View>
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-evenly',
          marginTop: 30,
          backgroundColor: '#fff',
        }}>
        {renderToggle('Added')}
        {renderToggle('Discarded')}
      </View>

      <View
        style={{
          backgroundColor: '#ECECF3',
          width: '100%',
          height: Dimensions.get('screen').height,
          paddingBottom: 50,
          paddingHorizontal: 5,
        }}>
        <FlatList
          data={priceTags}
          horizontal
          style={{marginTop: 20, maxHeight: 35}}
          renderItem={({item}: any) => {
            return (
              <TouchableOpacity
                onPress={() => setSelectedTag(item?.amount)}
                style={{
                  marginHorizontal: 6,
                }}>
                <Text
                  style={[
                    styles.filterLabel,
                    {
                      backgroundColor:
                        item?.amount === selectedTag ? '#6C6C6F' : '#fff',
                      color: item?.amount === selectedTag ? '#fff' : '#000',
                    },
                  ]}>
                  {item?.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        <View style={{marginTop: 40}} />
        {activeToggle === 'Added' && (
          <>
            <Text
              style={{
                fontFamily: 'SFPro',
                fontSize: 18,
                fontWeight: '500',
                fontStyle: 'normal',
                lineHeight: 18,
                letterSpacing: 0,
                color: '#000000',
                paddingHorizontal: 12,
              }}>
              Added items
            </Text>
            <Text
              style={{
                fontFamily: 'SFPro',
                fontSize: 14,
                fontWeight: 'normal',
                fontStyle: 'normal',
                lineHeight: 18,
                letterSpacing: 0,
                color: '#000000',
                marginTop: 5,
                paddingHorizontal: 12,
              }}>
              Drag the added items in order of preference for the selected price
              point. Tap on the item to manage it.
            </Text>

            <FlatList
              data={filteredAddedArray}
              renderItem={({item}: any) => {
                return (
                  <View style={styles.cardMainContainer}>
                    <FastImage
                      style={styles.cardMainImage}
                      source={{
                        uri: item?.gift_metadata?.img,
                      }}
                      resizeMode="cover"
                    />
                    <View style={{width: '60%'}}>
                      <Text style={styles.cardMainTitle}>
                        {item?.gift_metadata?.name}
                      </Text>
                      <Text style={[styles.cardMainTitle, {fontWeight: '500'}]}>
                        {item?.gift_metadata?.name}
                      </Text>
                      <Text style={[styles.cardMainTitle, {fontWeight: '500'}]}>
                        {item?.gift_metadata?.tag}
                      </Text>
                    </View>
                    {/* <TouchableOpacity>
                      <Entypo name="menu" color={'#A9A9A9'} size={25} />
                    </TouchableOpacity> */}
                  </View>
                );
              }}
            />
          </>
        )}

        {activeToggle === 'Discarded' && (
          <View>
            <Text
              style={{
                fontFamily: 'SFPro',
                fontSize: 18,
                fontWeight: '500',
                fontStyle: 'normal',
                lineHeight: 18,
                letterSpacing: 0,
                color: '#000000',
                paddingHorizontal: 12,
              }}>
              Discarded items
            </Text>
            <Text
              style={{
                fontFamily: 'SFPro',
                fontSize: 14,
                fontWeight: 'normal',
                fontStyle: 'normal',
                lineHeight: 18,
                letterSpacing: 0,
                color: '#000000',
                marginTop: 5,
                paddingHorizontal: 12,
              }}>
              Tap the item you discarded for each price point to edit your
              choice.
            </Text>

            <FlatList
              data={filteredDiscardedArray}
              renderItem={({item}: any) => {
                return (
                  <View style={styles.cardMainContainer}>
                    <FastImage
                      style={styles.cardMainImage}
                      source={{
                        uri: item?.gift_metadata?.img,
                      }}
                      resizeMode="cover"
                    />
                    <View style={{width: '60%'}}>
                      <Text style={styles.cardMainTitle}>
                        {item?.gift_metadata?.name}
                      </Text>
                      <Text style={[styles.cardMainTitle, {fontWeight: '500'}]}>
                        {item?.gift_metadata?.name}
                      </Text>
                      <Text style={[styles.cardMainTitle, {fontWeight: '500'}]}>
                        {item?.gift_metadata?.tag}
                      </Text>
                    </View>
                    {/* <TouchableOpacity>
                      <Entypo name="menu" color={'#A9A9A9'} size={25} />
                    </TouchableOpacity> */}
                  </View>
                );
              }}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    height: '100%',
    flexGrow: 1,
  },
  toggleLabel: {
    fontFamily: 'SFPro',
    fontSize: 18,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'center',
    color: '#000000',
  },
  filterLabel: {
    fontFamily: 'SFPro',
    fontSize: 15,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    color: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    overflow: 'hidden',
    borderRadius: 8,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    width: '95%',
    marginTop: 12,
  },
  card: {
    backgroundColor: '#fff',
    width: '48%',
    height: 75,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },

  questionCard: {
    backgroundColor: '#fff',
    width: '95%',
    alignSelf: 'center',
    borderRadius: 10,
    padding: 18,
    overflow: 'hidden',
    marginTop: 12,
  },
  questionSubCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  questionLabel: {
    color: '#000',
    fontWeight: '600',
    fontSize: 18,
    width: '95%',
  },
  listItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    margin: 5,
    borderRadius: 21,
    borderColor: '#E5E5E5',
    borderWidth: 1,
    width: 'auto',
  },
  listLabel: {
    fontSize: 16,
    color: '#000',
  },
  cardMainContainer: {
    backgroundColor: '#fff',
    width: '95%',
    alignSelf: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 15,
    overflow: 'hidden',
    marginTop: 12,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
  },
  cardMainImage: {
    width: 78,
    height: 70,
    marginRight: 15,
    marginLeft: 12,
    borderRadius: 6,
    borderWidth: 0.2,
  },
  cardMainTitle: {
    color: '#000',
    fontWeight: '300',
    fontSize: 14,
    width: '95%',
  },
  loader: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
