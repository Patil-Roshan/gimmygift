/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {styles} from './giftprofile.styles';
import FastImage from 'react-native-fast-image';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Bar} from 'react-native-progress';
import colors from '../../theme/colors';
import Icon from '../../components/Icon';
import Modal from 'react-native-modal';
import QRCode from 'react-native-qrcode-svg';
import {
  chevronBack,
  ic_add_recipient,
  ic_assistant,
  ic_birthdate,
  ic_logo,
  ic_remove_recipient,
  ic_share_profile,
  ic_wishlist,
  ic_wishlist_profile,
} from '../../assets/icons/icons';
import Button from '../../components/Button';
import {supabase} from '../../lib/supabase';
import moment from 'moment';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import activeUserInstance from '../../../store/activeUsersInstance';
import Toast from 'react-native-toast-message';
import {config} from '../../config';
import Webpage from '../../components/webpage';
import shareEventLink from '../../branch/shareLinks';

interface ListType {
  id: number;
  image: any;
  title: string;
  sub_title: string;
}

const RecipientGiftProfile = () => {
  const qrCodeRef = useRef(null);
  useFocusEffect(
    useCallback(() => {
      checkRecipientStatus();
      getUserGiftFunds();
      getWishlistItems();
      getHighlightedPreferences();
    }, []),
  );
  const navigation = useNavigation();

  const route = useRoute();
  const {profile} = route.params;

  const [activeToggle, setActiveToggle] = useState('GiftProfile');

  const [showShareModal, setShowShareModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [wishlistDetails, setWishlistDetails] = useState([]);
  const [highlightedPreferences, setHighlightedPreferences] = useState([]);
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [giftFundDetails, setGiftFundDetails] = useState([]);
  const [recipientStatus, setRecipientStatus] = useState(false);
  const [showWebpage, setShowWebpage] = useState(false);
  const [currentProductLink, setCurrentProductLink] = useState('');

  const activeUsers = activeUserInstance((state: any) => state.activeUsers);

  const checkRecipientStatus = async () => {
    const {data, error} = await supabase
      .from('user_relationships')
      .select('*')
      .eq('user_id', activeUsers[0].user_id)
      .eq('relationship_id', profile?.user_id);

    if (!error && data.length > 0) {
      setRecipientStatus(true);
      // console.error('Error fetching follow status:', error);
      return false;
    }
  };
  const addRecipient = async () => {
    const {data, error} = await supabase
      .from('user_relationships')
      .insert([
        {user_id: activeUsers[0].user_id, relationship_id: profile?.user_id},
      ])
      .select('*');

    if (!error && data?.length > 0) {
      setRecipientStatus(true);
      Toast.show({
        type: 'success',
        text1: 'Recipient Added Successfully',
        position: 'bottom',
      });
      return false;
    }
  };

  const getHighlightedPreferences = useCallback(async () => {
    try {
      const {data: highlightedDetails} = await supabase
        .from('profiles')
        .select('highlighted_preferences')
        .eq('user_id', profile?.user_id);

      if (highlightedDetails && highlightedDetails.length > 0) {
        setHighlightedPreferences(
          highlightedDetails[0]?.highlighted_preferences,
        );
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      throw error;
    }
  }, [activeUsers]);

  const getWishlistItems = useCallback(async () => {
    try {
      // Fetch the registry ID for the current user
      const {data: registry, error: registryError} = await supabase
        .schema('registry')
        .from('registries')
        .select('registry_id, created_by')
        .eq('created_by', profile?.user_id)
        .single();

      if (registryError) {
        console.log('Registry Fetch Error', registryError);

        return;
      }

      const registryId = registry.registry_id;

      // Fetch all products from registry_items where registry_id matches
      const {data: products, error: productsError} = await supabase
        .schema('registry')
        .from('registry_items')
        .select('*')
        .eq('registry_id', registryId);

      if (productsError) {
        Toast.show({
          type: 'error',
          text1: 'Failed to fetch products',
          position: 'bottom',
        });

        return;
      }

      //map products and add images
      const wishlistImages = products?.map(product => {
        return {
          ...product,
          image_url: `${config.SUPABASE_URL}/storage/v1/object/public/assets/WISHLISTS/${product?.item_id}.png`,
        };
      });

      setWishlistDetails(wishlistImages);
    } catch (error) {
      console.log('Error', error);
      Toast.show({
        type: 'error',
        text1: 'An error occurred while fetching products',
        position: 'bottom',
      });
    }
  }, [activeUsers]);

  const removeRecipient = async () => {
    const {data, error} = await supabase
      .from('user_relationships')
      .delete()
      .eq('user_id', activeUsers[0].user_id)
      .eq('relationship_id', profile?.user_id)
      .select('*');

    if (!error && data?.length > 0) {
      setRecipientStatus(false);
      setShowConfirmationModal(false);
      Toast.show({
        type: 'success',
        text1: 'Recipient Removed Successfully',
        position: 'bottom',
      });
      return false;
    }
  };

  const getUserGiftFunds = async () => {
    try {
      const {data: fundDetails} = await supabase
        .from('gift_funds')
        .select('*')
        .eq('created_by', profile?.id)
        .limit(1);

      if (fundDetails && fundDetails.length > 0) {
        setGiftFundDetails(fundDetails);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      throw error;
    }
  };

  const optionsData: ListType[] = [
    {
      id: 0,
      image: require('../../assets/icons/ic_rounded_gift.png'),
      title: 'Gift',
      sub_title: 'Find a gift for an occasion',
    },
    {
      id: 1,
      image: require('../../assets/icons/ic_filled_text.png'),
      title: 'Text Messsage',
      sub_title: 'Schedule a message for an occasion',
    },
    {
      id: 2,
      image: require('../../assets/icons/ic_greeting_card.png'),
      title: 'Virtual Greeting Card',
      sub_title: 'Send a greeting card for an occasion',
    },
  ];

  const renderToggle = (label: string) => {
    return (
      <TouchableOpacity
        onPress={() => setActiveToggle(label)}
        style={{
          paddingHorizontal: 15,
          borderBottomColor: '#ff0000',
          borderBottomWidth: activeToggle === label ? 1 : 0,
          paddingBottom: 10,
        }}>
        <Text
          style={[
            styles.toggleLabel,
            {color: activeToggle === label ? '#000' : '#848484'},
          ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleOptions = (type: string) => {
    if (type === 'Gift') {
      navigation.navigate('giftquiz', {
        selectedRecipient: {...profile, type: 'giftprofile'},
      });
    }

    if (type === 'Text Messsage') {
      navigation.navigate('messagequiz', {
        selectedRecipient: {...profile, type: 'giftprofile'},
      });
    }

    if (type === 'Virtual Greeting Card') {
      navigation.navigate('cardquiz', {
        selectedRecipient: {...profile, type: 'giftprofile'},
      });
    }
  };

  const renderBottomList = ({item}: {item: ListType; index: number}) => {
    return (
      <TouchableOpacity
        style={styles.endListContainer}
        onPress={() => handleOptions(item.title)}>
        <View style={styles.endListSubContainer}>
          <View style={styles.endListLeftContainer}>
            <FastImage
              style={{width: 40, height: 40}}
              source={item.image}
              resizeMode="contain"
            />
            <View style={styles.endListLeftSubContainer}>
              <Text style={styles.endListTitleText}>{item.title}</Text>
              <Text style={styles.endListSubTitleText}>{item.sub_title}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGifts = ({item}: {item: ListType; index: number}) => {
    return (
      <View
        style={{
          width: Dimensions.get('window').width / 2.6,
          margin: 8,

          borderRadius: 10,
          overflow: 'hidden',
        }}>
        <FastImage
          resizeMode="cover"
          source={{
            uri: 'https://images.unsplash.com/photo-1605733513597-a8f8341084e6',
          }}
          style={{
            width: '100%',
            height: 150,
            alignSelf: 'center',
            borderRadius: 10,
            borderWidth: 1,
            padding: 5,
            borderColor: '#d6d6d6',
          }}
        />
        <Text
          style={{
            fontSize: 16,
            color: '#000',
            fontWeight: '500',
            paddingHorizontal: 15,
            paddingTop: 15,
          }}>
          Until $100
        </Text>
      </View>
    );
  };

  const renderAllItems = ({item}: {item: ListType; index: number}) => {
    return (
      <View style={styles.slide}>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            alignSelf: 'center',
            overflow: 'hidden',
            borderRadius: 8,
            backgroundColor: '#fff',
          }}>
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
            <Text
              style={{
                color: '#848484',
                fontSize: 14,
                fontWeight: '500',
                paddingVertical: 6,
              }}>
              {item?.product_name}
            </Text>
            <Text style={{color: '#000', fontSize: 18, fontWeight: '500'}}>
              {item?.product_name}
            </Text>
            <Text
              style={{
                color: '#000',
                fontSize: 18,
                fontWeight: '400',
                marginVertical: 15,
              }}>
              $ {item?.price}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                position: 'absolute',
                alignContent: 'center',
                alignSelf: 'center',
                bottom: 0,
              }}>
              <Button
                onPress={() => {
                  setCurrentProductLink(item?.link);
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
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SafeAreaView />
      <Webpage
        isOpen={showWebpage}
        link={
          currentProductLink.startsWith('http://') ||
          currentProductLink.startsWith('https://')
            ? currentProductLink
            : `https://${currentProductLink}`
        }
        onClose={() => setShowWebpage(false)}
        key={'productPage'}
      />
      <Modal
        isVisible={showConfirmationModal}
        style={{margin: 0}}
        onBackdropPress={() => setShowConfirmationModal(false)}>
        <View style={styles.confirmationModalContainer}>
          <Text style={styles.confirmationLabel}>
            Do you really want remove {profile?.full_name}?
          </Text>
          <Text style={styles.confirmationSubLabel}>
            This profile will be removed from your recipient list.
          </Text>
          <View style={styles.confirmationDivider} />
          <Text
            onPress={() => {
              setShowConfirmationModal(false);
            }}
            style={styles.confirmationBtnLabel}>
            Cancel
          </Text>
          <View style={styles.confirmationDivider} />
          <Text
            onPress={() => removeRecipient()}
            style={styles.confirmationBtnLabel}>
            Remove
          </Text>
        </View>
      </Modal>

      <Modal
        isVisible={showBlockModal}
        style={{margin: 0}}
        onBackdropPress={() => setShowBlockModal(false)}>
        <View style={styles.confirmationModalContainer}>
          <Text style={styles.confirmationLabel}>
            Do you really want block {profile?.full_name}?
          </Text>
          <Text style={styles.confirmationSubLabel}>
            The user will not be able to find your GiftProfile by searching for
            your phone number, email or full name.
          </Text>
          <View style={styles.confirmationDivider} />
          <Text
            onPress={() => {
              setShowBlockModal(false);
            }}
            style={styles.confirmationBtnLabel}>
            Block this user
          </Text>
          <View style={styles.confirmationDivider} />
          <Text
            onPress={() => setShowBlockModal(false)}
            style={[styles.confirmationBtnLabel, {color: '#000'}]}>
            Cancel
          </Text>
        </View>
      </Modal>

      <Modal
        isVisible={showProfileOptions}
        style={{margin: 0}}
        onBackdropPress={() => setShowProfileOptions(false)}>
        <View style={styles.confirmationModalContainer}>
          <TouchableOpacity
            style={styles.optionContainer}
            onPress={() => {
              setShowProfileOptions(false);
              shareEventLink('Referral', 'referral', profile?.user_id);
              // setTimeout(() => {
              //   setShowShareModal(true);
              // }, 500);
            }}>
            <MaterialCommunityIcons
              onPress={() => setShowProfileOptions(true)}
              name="share-outline"
              color={'rgba(0, 0, 0, 0.5)'}
              size={26}
              style={{
                width: 26,
                height: 26,
                overflow: 'hidden',
                marginRight: 10,
              }}
            />
            <Text style={styles.profileOptions}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionContainer}
            onPress={() => {
              setShowProfileOptions(false);
              setTimeout(() => {
                setShowBlockModal(true);
              }, 600);
            }}>
            <Feather
              onPress={() => setShowProfileOptions(true)}
              name="minus-circle"
              color={'rgba(0, 0, 0, 0.5)'}
              size={26}
              style={{
                width: 26,
                height: 26,
                overflow: 'hidden',
                marginRight: 10,
              }}
            />
            <Text
              onPress={() => removeRecipient()}
              style={styles.profileOptions}>
              Block
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        isVisible={showShareModal}
        style={{margin: 0}}
        onBackdropPress={() => setShowShareModal(false)}>
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
          <FastImage
            testID="logo-image"
            source={{uri: profile?.profile_image}}
            style={{
              width: 76,
              borderRadius: 60,
              aspectRatio: 1,
              borderWidth: 1,
              alignSelf: 'center',
              borderColor: '#000',
              marginVertical: 15,
            }}
          />
          <Text
            style={{
              fontFamily: 'SpaceGrotesk',
              fontSize: 30,
              fontWeight: 'bold',
              fontStyle: 'normal',
              lineHeight: 32,
              letterSpacing: -1.2,
              textAlign: 'center',
              color: colors.black,
            }}>
            {profile?.full_name}
          </Text>

          <View style={{alignSelf: 'center', padding: 20}}>
            <QRCode
              getRef={c => (qrCodeRef.current = c)}
              value={`gimmegift.com/${profile.user_id}`}
              color={colors.primary}
              size={160}
            />
          </View>

          <TextInput
            placeholderTextColor={'#737273'}
            editable={false}
            style={{
              borderColor: 'rgba(0, 0, 0, 0.1)',
              borderWidth: 1,
              padding: 12,
              borderRadius: 25,
              margin: 5,
              width: '90%',
              alignSelf: 'center',
              textAlign: 'center',
            }}
            placeholder={`gimmegift.com/${profile?.user_id}`}
          />
        </View>
      </Modal>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon icon={chevronBack} size={26} />
        </TouchableOpacity>
        {profile?.type !== 'contact' && (
          <MaterialCommunityIcons
            onPress={() => setShowProfileOptions(true)}
            name="dots-horizontal-circle-outline"
            color={colors.primary}
            size={26}
            style={styles.headerIcons}
          />
        )}
      </View>

      <FastImage
        testID="logo-image"
        source={
          profile?.profile_image
            ? {uri: profile?.profile_image}
            : require('../../assets/images/user_placeholder.png')
        }
        style={{
          marginTop: -42,
          width: 120,
          borderRadius: 60,
          aspectRatio: 1,
          borderWidth: 0.5,
          borderColor: '#d6d6d6',
        }}
      />

      <View
        style={{
          flexDirection: 'row',
          alignSelf: 'center',
          alignContent: 'center',
          justifyContent: 'center',
          marginTop: 15,
          alignItems: 'center',
        }}>
        <Text style={styles.nameLabel}>{profile?.full_name}</Text>
        <Icon icon={ic_logo} size={24} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '90%',
        }}>
        <Text style={styles.countsLabel}>0 sent gifts</Text>
        <Text style={styles.countsLabel}>0 received gifts</Text>
        <Text style={styles.countsLabel}>0 preferences</Text>
      </View>
      {profile?.type !== 'contact' && (
        <View
          style={{
            flexDirection: 'row',
            alignSelf: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            marginTop: 15,
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            borderRadius: 15,
            padding: 8,
            alignItems: 'center',
          }}>
          <Icon icon={ic_birthdate} size={16} />
          <Text style={styles.birthdayLabel}>
            Birthday{' '}
            {profile?.birthday
              ? moment(profile?.birthday).format('MMMM D')
              : '-'}
          </Text>
        </View>
      )}

      {profile?.type !== 'contact' && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            width: '100%',
            marginTop: 20,
          }}>
          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() =>
              navigation.navigate('giftassistantrecipient', {
                selectedRecipient: {...profile, type: 'giftprofile'},
              })
            }>
            <Icon icon={ic_assistant} size={26} />
            <Text style={styles.categoryLabel}>Assistant</Text>
          </TouchableOpacity>
          {recipientStatus ? (
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => setShowConfirmationModal(true)}>
              <Icon icon={ic_remove_recipient} size={26} />
              <Text style={styles.categoryLabel}>Remove</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => addRecipient()}>
              <Icon icon={ic_add_recipient} size={26} />
              <Text style={styles.categoryLabel}>Add</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => setShowShareModal(true)}>
            <Icon icon={ic_share_profile} size={26} />
            <Text style={styles.categoryLabel}>Share</Text>
          </TouchableOpacity>
        </View>
      )}

      <View
        style={{
          flexDirection: 'row',
          width: '95%',
          justifyContent: 'space-between',
          marginTop: 30,
          marginBottom: 30,
        }}>
        {renderToggle('GiftProfile')}
        {profile?.type !== 'contact' && (
          <>
            {renderToggle('Wishlist')}
            {renderToggle('Highlighted')}
          </>
        )}

        <View
          style={{
            width: Dimensions.get('window').width * 2,
            borderBottomWidth: 1,
            left: -50,
            borderBottomColor: '#d6d6d6',
            alignSelf: 'center',
            zIndex: -1,
            bottom: 0,
            position: 'absolute',
          }}
        />
      </View>

      {/* Wishlist Modal */}
      {activeToggle === 'GiftProfile' && (
        <>
          {/* Gift Fund Card */}
          {giftFundDetails && giftFundDetails.length > 0 && (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  width: '95%',
                  justifyContent: 'space-between',
                  marginTop: 30,
                }}>
                <Text style={styles.giftFundLabel}>Gift Fund</Text>
              </View>
              <View style={styles.slide}>
                <View
                  style={{
                    flexDirection: 'row',
                    width: '90%',
                    height: '95%',
                    alignSelf: 'center',
                    overflow: 'hidden',
                    borderRadius: 8,
                    backgroundColor: '#fff',
                  }}>
                  <View style={{width: '40%', backgroundColor: '#fff'}}>
                    <FastImage
                      source={{
                        uri: 'https://images.unsplash.com/photo-1682364853177-b69f92750a96',
                      }}
                      style={{width: '100%', height: '100%'}}
                    />
                  </View>
                  <View
                    style={{
                      width: '60%',
                      backgroundColor: '#fff',
                      padding: 15,
                    }}>
                    <Text
                      style={{color: '#000', fontSize: 18, fontWeight: '500'}}>
                      {giftFundDetails[0]?.gift_name}
                    </Text>
                    <Text
                      style={{
                        color: '#000',
                        fontSize: 18,
                        fontWeight: '400',
                        marginTop: 10,
                      }}>
                      $ 0 of $ {giftFundDetails[0]?.target_amount}
                    </Text>

                    <View style={{width: '100%'}}>
                      <Bar
                        progress={0.4}
                        width={null}
                        color={colors.primary}
                        style={{marginHorizontal: 10, marginVertical: 15}}
                      />
                    </View>

                    <FastImage
                      resizeMode="cover"
                      source={{
                        uri: 'https://images.unsplash.com/photo-1682364853177-b69f92750a96',
                      }}
                      style={{
                        width: 20,
                        height: 20,
                        top: 0,
                        left: 10,
                        borderRadius: 20,
                        borderWidth: 0.5,
                        borderColor: '#fff',
                      }}
                    />

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Button
                        label="Share"
                        bg="#E4E4E5"
                        fontColor="#141414"
                        width={'35%'}
                        height={40}
                        fontSize={14}
                      />
                      <Button
                        onPress={() =>
                          navigation.navigate('giftfundinfo', {
                            fundDetails: giftFundDetails[0] || {},
                          })
                        }
                        label="Gift an amount"
                        width={'60%'}
                        height={40}
                        fontSize={14}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </>
          )}

          <View style={{alignSelf: 'flex-start'}}>
            <Text style={[styles.giftFundLabel, {paddingVertical: 10}]}>
              Options
            </Text>
          </View>

          <FlatList
            data={optionsData}
            renderItem={renderBottomList}
            style={styles.endList}
          />
        </>
      )}

      {activeToggle === 'Wishlist' && (
        <>
          <Icon icon={ic_wishlist} size={36} />
          <Text style={styles.wishlistLabel}>
            {profile.full_name ? `${profile.full_name}'s wishlist` : 'Wishlist'}
          </Text>
          <Text style={styles.wishlistSubLabel}>
            {wishlistDetails?.length} items added in public wishlist.
          </Text>

          <View
            style={{
              alignSelf: 'flex-start',
              paddingHorizontal: 10,
              paddingVertical: 10,
            }}>
            <Text style={styles.giftFundLabel}>All items</Text>
          </View>

          <FlatList
            data={wishlistDetails}
            renderItem={renderAllItems}
            style={styles.endList}
          />
        </>
      )}

      {activeToggle === 'Highlighted' && (
        <>
          <Icon icon={ic_wishlist_profile} size={36} />
          <Text style={styles.wishlistLabel}>Highlighted preferences</Text>
          <Text style={styles.wishlistSubLabel}>
            {highlightedPreferences?.length || 0} preferences highlighted in
            public.
          </Text>

          <FlatList
            data={highlightedPreferences}
            renderItem={({item}) => {
              return (
                <View style={[styles.questionCard, {width: '100%'}]}>
                  <View style={styles.questionSubCard}>
                    <Text style={styles.questionLabel}>{item?.question}</Text>
                  </View>
                  <ScrollView style={{flexDirection: 'row'}} horizontal>
                    {item?.answers?.map((item: any) => {
                      return (
                        <View key={item.id} style={[styles.listItem]}>
                          <Text style={[styles.listLabel]}>{item}</Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              );
            }}
          />
        </>
      )}
    </ScrollView>
  );
};
export default RecipientGiftProfile;
