/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import Entypo from 'react-native-vector-icons/Entypo';
import Modal from 'react-native-modal';
import AntDesign from 'react-native-vector-icons/AntDesign';
import TinderCard from 'react-tinder-card';
import FastImage from 'react-native-fast-image';
import Icon from '../../components/Icon';
import {
  ic_pick_edit,
  ic_pick_manageadded,
  ic_pick_preference,
} from '../../assets/icons/icons';
import {useNavigation} from '@react-navigation/native';
import activeUserInstance from '../../../store/activeUsersInstance';
import {fetchGimmePickGifts} from '../../lib/supabaseFunctions';
import colors from '../../theme/colors';
import {supabase} from '../../lib/supabase';
import Toast from 'react-native-toast-message';
import {uploadFile} from '../../api/storage';

export default function Gimmepick() {
  const navigation = useNavigation();
  const activeUsers = activeUserInstance(state => state.activeUsers);
  const [giftsData, setGiftsData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const swipedCards = useRef(new Set()).current;
  useEffect(() => {
    fetchGimmeGifts();
  }, [activeUsers]);

  const fetchGimmeGifts = async () => {
    const userID = activeUsers[0].user_id;
    const gifts = await fetchGimmePickGifts(userID);

    const transformedGifts = gifts.map((item: any, index: number) => ({
      id: index,
      img: item.image,
      name: item.name,
      tag: item.price,
      link: item.direct_url,
    }));

    setGiftsData(transformedGifts || []);
    setCurrentIndex(transformedGifts.length - 1);
    setIsLoading(false);
  };

  const tags = [
    {id: '1', name: 'All'},
    {id: '2', name: 'Clothings'},
    {id: '3', name: 'Shoes'},
    {id: '4', name: 'Bags and accessories'},
  ];

  const childRefs = useMemo(
    () =>
      Array(giftsData.length)
        .fill(0)
        .map(() => React.createRef()),
    [giftsData.length],
  );
  const swiped = async (
    direction: string,
    nameToDelete: string,
    index: number,
  ) => {
    const swipedItem = giftsData[index];
    swipedCards.add(nameToDelete);
    setCurrentIndex(index - 1);

    const {data: giftData, error: giftError} = await supabase
      .schema('gift')
      .from('gift_preferences')
      .insert([
        {
          user_id: activeUsers[0].user_id,
          gift_metadata: swipedItem,
          action:
            direction === 'right'
              ? 'LIKED'
              : direction === 'left'
              ? 'DISLIKED'
              : direction === 'up'
              ? 'ADDED_TO_WISHLIST'
              : '',
        },
      ])
      .select();
    console.log('error->', giftError);

    if (!giftError) {
      Toast.show({
        type: 'success',
        text1: 'Preferences Updated',
        position: 'bottom',
      });
    }

    if (direction === 'up') {
      createWishlistItem(swipedItem);
      Toast.show({
        type: 'success',
        text1: 'Item Added to Wishlist',
        text2: 'Preferences Updated',
        position: 'bottom',
      });
    }
  };

  const createWishlistItem = async (item: any) => {
    setIsLoading(true);
    let registryId;

    // Check if registry already exists for the user
    const {data: existingRegistry, error: fetchError} = await supabase
      .schema('registry')
      .from('registries')
      .select('registry_id')
      .eq('created_by', activeUsers[0]?.user_id)
      .single();

    if (!existingRegistry && fetchError?.code === 'PGRST116') {
      // If registry doesn't exist, create one
      const {data: createdRegistry, error: createError} = await supabase
        .schema('registry')
        .from('registries')
        .insert([
          {
            title: activeUsers[0]?.full_name,
            description: '',
            created_by: activeUsers[0]?.user_id,
          },
        ])
        .select();

      if (createError) {
        console.log('Create Error', createError);
        setIsLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Failed to create registry',
          position: 'bottom',
        });
        return;
      }

      registryId = createdRegistry[0]?.registry_id;
    } else {
      // If registry exists, get the id

      registryId = existingRegistry?.registry_id;
    }

    // Insert item into registry_items
    const {data: itemInsertData, error: itemInsertError} = await supabase
      .schema('registry')
      .from('registry_items')
      .insert([
        {
          product_name: item?.name,
          link: item?.link,
          price: item?.tag,
          registry_id: registryId,
        },
      ])
      .select();

    if (itemInsertError) {
      console.log('Item Insert Error', itemInsertError);
      setIsLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Failed to add item to registry',
        position: 'bottom',
      });
      return;
    }

    const response = await fetch(item?.img);
    const blob = await response.blob();
    let imageData = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader?.result?.split(',')[1]);
      reader.readAsDataURL(blob);
    });

    const item_id = itemInsertData[0].item_id;
    const {error: iError} = await uploadFile(
      'assets',
      `WISHLISTS/${item_id}.png`,
      'data:image/png;base64,' + imageData,
    );

    if (iError) {
      console.log('Storage Upload Error->', iError);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  };
  const outOfFrame = (name, idx) => {
    swipedCards.add(name);
    if (currentIndex === idx) {
      setCurrentIndex(idx - 1);
    }
  };

  const swipe = async (dir: string) => {
    if (currentIndex < 0) {
      return;
    }
    await childRefs[currentIndex].current.swipe(dir);
  };

  const canGoBack = currentIndex < giftsData.length - 1;
  const restorePrevCard = async () => {
    if (!canGoBack) {
      return;
    }
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    await childRefs[newIndex].current.restoreCard();
  };
  const renderItem = ({item}: {item: {name: string}}) => (
    <TouchableOpacity>
      <View style={[styles.label, item.name === 'All' && styles.selectedLabel]}>
        <Text
          style={[
            styles.labelText,
            item.name === 'All' && styles.selectedLabelText,
          ]}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
    <>
      <View style={styles.container}>
        <SafeAreaView style={{backgroundColor: 'rgba(249, 249, 249, 0.8)'}} />
        <Modal
          isVisible={showSkipModal}
          style={{margin: 0}}
          onBackdropPress={() => setShowSkipModal(false)}>
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 10,
              borderRadius: 15,
              backgroundColor: '#fff',
              paddingHorizontal: 25,
              paddingVertical: 25,
            }}>
            <TouchableOpacity
              style={styles.modalContainer}
              onPress={() => {
                setShowSkipModal(false);
                navigation.navigate('directpickmanager');
              }}>
              <Icon icon={ic_pick_manageadded} size={24} />
              <Text style={styles.modalLabel}>Manage added items</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalContainer}
              onPress={() => {
                setShowSkipModal(false);
                navigation.navigate('directpickmanager');
              }}>
              <Icon icon={ic_pick_edit} size={24} />
              <Text style={styles.modalLabel}>Recover excluded items</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalContainer}
              onPress={() => {
                setShowSkipModal(false);
                navigation.navigate('preferencesmanager');
              }}>
              <Icon icon={ic_pick_preference} size={24} />
              <Text style={styles.modalLabel}>Manage your preferences</Text>
            </TouchableOpacity>
          </View>
        </Modal>
        <View
          style={{
            flexDirection: 'row',
            marginTop: StatusBar.currentHeight,
            alignItems: 'center',
            width: '100%',
            paddingVertical: 10,
            paddingHorizontal: 15,
          }}>
          <FastImage
            style={{width: 42, height: 42, marginRight: 15, borderRadius: 21}}
            source={
              activeUsers[0]?.profile_image
                ? {uri: activeUsers[0]?.profile_image}
                : require('../../assets/images/user_placeholder.png')
            }
          />
          <View style={{width: '62%'}}>
            <Text
              style={{
                fontFamily: 'SFPro',
                fontSize: 22,
                fontWeight: '600',
                fontStyle: 'normal',
                lineHeight: 24,
                letterSpacing: 0,
                color: '#000000',
              }}>
              GimmePick
            </Text>
            <Text
              style={{
                fontFamily: 'SFPro',
                fontSize: 14,
                fontWeight: 'normal',
                fontStyle: 'normal',
                letterSpacing: 0,
                color: 'rgba(0, 0, 0, 0.5)',
              }}>
              Add all items you like to GiftProfile
            </Text>
          </View>
          <AntDesign
            onPress={() => navigation.goBack()}
            style={{paddingRight: 20}}
            name="close"
            color={'#000'}
            size={26}
          />
          <Entypo
            onPress={() => setShowSkipModal(true)}
            name="dots-three-horizontal"
            color={'#000'}
            size={26}
          />
        </View>

        <FlatList
          data={tags}
          contentContainerStyle={{
            height: 50,
            maxHeight: 50,
          }}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
        />

        <View style={styles.cardContainer}>
          {giftsData.map((character: any, index) => (
            <TinderCard
              ref={childRefs[index]}
              key={character.id}
              onSwipe={dir => swiped(dir, character.name, index)}
              preventSwipe={['down']}
              onCardLeftScreen={() => outOfFrame(character.name, index)}>
              <View style={styles.card}>
                <ImageBackground
                  style={styles.cardImage}
                  source={{uri: character.img}}>
                  <View
                    style={{width: '100%', position: 'absolute', bottom: 0}}>
                    <Text style={styles.cardTitle}>
                      {character.name} {index}
                    </Text>
                    <Text style={styles.cardSubTitle}>{character.tag}</Text>
                  </View>
                </ImageBackground>

                <View style={styles.btnContainer}>
                  <TouchableOpacity
                    style={styles.cardSideButtons}
                    onPress={() => restorePrevCard()}>
                    <AntDesign name="left" color={'#717174'} size={18} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => swipe('left')}>
                    <Image
                      style={styles.imageBtn}
                      source={require('../../assets/icons/ic_gimmepick_reject.png')}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => swipe('right')}>
                    <Image
                      style={styles.imageBtn}
                      source={require('../../assets/icons/ic_gimmepick_add.png')}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cardSideButtons}>
                    <Entypo
                      name="dots-three-horizontal"
                      color={'#717174'}
                      size={18}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </TinderCard>
          ))}
        </View>

        {!isLoading && (
          <Text style={styles.infoText}>No more items to pick</Text>
        )}
      </View>
      {renderLoader()}
    </>
  );
}

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#EDEDF3',
  },
  header: {
    color: '#000',
    fontSize: 30,
    marginBottom: 30,
  },
  cardContainer: {
    width: '90%',
    height: 100,
    marginVertical: 15,
  },
  card: {
    position: 'absolute',
    backgroundColor: '#fff',
    width: '100%',
    height: Dimensions.get('window').height / 1.4,
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderRadius: 20,
    resizeMode: 'cover',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  cardImage: {
    width: '100%',
    height: '80%',
    overflow: 'hidden',
    borderRadius: 20,
  },
  cardTitle: {
    fontFamily: 'SFPro',
    width: '90%',

    marginTop: 20,
    alignSelf: 'center',
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 22,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#000000',
  },
  cardSubTitle: {
    fontFamily: 'SFPro',
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 18,
    padding: 6,
    textAlign: 'center',
    color: '#3b3b3b',
  },
  infoText: {
    height: 28,
    justifyContent: 'center',
    display: 'flex',
    fontSize: 20,
    zIndex: -100,
  },
  label: {
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    padding: 7,
    fontSize: 14,
    margin: 10,
  },
  selectedLabelText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  labelText: {
    fontSize: 14,
    color: '#333333',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 90,
  },
  btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'space-evenly',
    marginVertical: 15,
  },
  selectedLabel: {
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#77777A',
  },
  imageBtn: {
    height: 64,
    width: 64,
  },
  cardSideButtons: {
    width: 44,
    height: 44,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  modalLabel: {
    fontFamily: 'SFPro',
    fontSize: 18,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    color: '#000000',
    paddingHorizontal: 12,
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
