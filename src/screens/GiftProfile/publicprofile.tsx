/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useState} from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import {styles} from './giftprofile.styles';
import FastImage from 'react-native-fast-image';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import {Bar} from 'react-native-progress';
import colors from '../../theme/colors';
import Icon from '../../components/Icon';

import {
  ic_add_recipient,
  ic_assistant,
  ic_birthdate,
  ic_logo,
  ic_schedule,
  ic_share_profile,
  ic_wishlist,
  ic_wishlist_profile,
} from '../../assets/icons/icons';
import Button from '../../components/Button';
import moment from 'moment';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import activeUserInstance from '../../../store/activeUsersInstance';

interface ListType {
  id: number;
  image: any;
  title: string;
  sub_title: string;
}

const PublicProfile = () => {
  useFocusEffect(useCallback(() => {}, []));
  const navigation = useNavigation();

  const [activeToggle, setActiveToggle] = useState('GiftProfile');

  const [showShareModal, setShowShareModal] = useState(false);

  const [giftFundDetails, setGiftFundDetails] = useState([]);

  const activeUsers = activeUserInstance((state: any) => state.activeUsers);

  const selectedCategories = [
    {name: 'Book'},
    {name: 'Stamps'},
    {name: 'Coins'},
    {name: 'Bags'},
  ];

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
    {
      id: 3,
      image: require('../../assets/icons/ic_giftfund_yellow.png'),
      title: 'Gift Fund',
      sub_title: 'Gift an amount for my Gift Fund',
    },
  ];

  const renderToggle = (label: string) => {
    return (
      <TouchableOpacity
        // onPress={() => setActiveToggle(label)}
        style={{
          borderBottomColor: '#ff0000',
          borderBottomWidth: activeToggle === label ? 1 : 0,
          paddingBottom: 10,
        }}>
        <Text style={[styles.toggleLabel]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderBottomList = ({item}: {item: ListType; index: number}) => {
    return (
      <TouchableOpacity style={styles.endListContainer}>
        <View style={styles.endListSubContainer}>
          <View style={styles.endListLeftContainer}>
            <FastImage
              style={{width: 50, height: 50}}
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
                uri: 'https://images.unsplash.com/photo-1682364853177-b69f92750a96',
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
              Chanel
            </Text>
            <Text style={{color: '#000', fontSize: 18, fontWeight: '500'}}>
              Tote Bag Multicolor Indian Animals DIOR
            </Text>
            <Text
              style={{
                color: '#000',
                fontSize: 18,
                fontWeight: '400',
                marginVertical: 15,
              }}>
              $ 190
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Button
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
      <SafeAreaView style={{backgroundColor: colors.white}} />
      <View style={styles.headerContainer}>
        <Feather
          onPress={() => navigation.goBack()}
          name="chevron-left"
          color={colors.primary}
          size={26}
          style={styles.headerIcons}
        />
      </View>

      <FastImage
        testID="logo-image"
        source={
          activeUsers[0]?.profile_image
            ? {uri: activeUsers[0]?.profile_image}
            : require('../../assets/images/user_placeholder.png')
        }
        style={styles.image}
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
        <Text style={styles.nameLabel}>{activeUsers[0]?.full_name}</Text>
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

      <View
        style={{
          flexDirection: 'row',
          alignSelf: 'center',
          alignContent: 'center',
          justifyContent: 'center',
          marginTop: 15,
          backgroundColor: '#D4D3D9',
          borderRadius: 20,
          padding: 8,
          alignItems: 'center',
        }}>
        <Icon icon={ic_birthdate} size={16} />
        <Text style={styles.birthdayLabel}>
          Birthday{' '}
          {activeUsers[0]?.birthday
            ? moment(activeUsers[0]?.birthday).format('MMMM D')
            : '-'}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          width: '100%',
          marginTop: 20,
        }}>
        <View style={styles.categoryCard}>
          <Icon icon={ic_assistant} size={26} />
          <Text style={styles.categoryLabel}>Assistant</Text>
        </View>
        <View style={styles.categoryCard}>
          <Icon icon={ic_schedule} size={26} />
          <Text style={styles.categoryLabel}>Schedule</Text>
        </View>

        <View style={styles.categoryCard}>
          <Icon icon={ic_add_recipient} size={26} />
          <Text style={styles.categoryLabel}>Add</Text>
        </View>

        <View style={styles.categoryCard}>
          <Icon icon={ic_share_profile} size={26} />
          <Text style={styles.categoryLabel}>Share</Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          width: '95%',
          justifyContent: 'space-between',
          marginTop: 30,
        }}>
        {renderToggle('GiftFunds')}
        {renderToggle('Wishlist')}
        {renderToggle('Highlighted')}
      </View>

      <View
        style={{
          width: '100%',
          borderBottomWidth: 0.5,
          borderBottomColor: '#d6d6d6',
          zIndex: -1,
          marginBottom: 20,
        }}
      />

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
            <Text style={styles.giftFundLabel}>Options</Text>
          </View>

          {/* <FlatList
            data={optionsData}
            keyExtractor={item => item.id.toString()}
            renderItem={renderBottomList}
            style={styles.endList}
          /> */}
        </>
      )}

      {activeToggle === 'Wishlist' && (
        <>
          <Icon icon={ic_wishlist} size={36} />
          <Text style={styles.wishlistLabel}>
            {activeUsers[0]?.full_name
              ? `${activeUsers[0]?.full_name}'s wishlist`
              : 'Wishlist'}
          </Text>
          <Text style={styles.wishlistSubLabel}>
            25 items added in public wishlist.
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
            data={optionsData}
            horizontal
            keyExtractor={item => item.id.toString()}
            renderItem={renderGifts}
            style={styles.endList}
          />

          <FlatList
            data={optionsData}
            keyExtractor={item => item.id.toString()}
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
            4 preferences highlighted in public.
          </Text>

          <View style={styles.questionCard}>
            <View style={styles.questionSubCard}>
              <Text style={styles.questionLabel}>
                What are the gift categories…prefer?
              </Text>
              <TouchableOpacity>
                <Entypo
                  name="dots-three-horizontal"
                  size={25}
                  color={'#A9A9A9'}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={{flexDirection: 'row'}} horizontal>
              {selectedCategories.map((item: any) => {
                return (
                  <View key={item.id} style={[styles.listItem]}>
                    <Text style={[styles.listLabel]}>{item.name}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.questionCard}>
            <View style={styles.questionSubCard}>
              <Text style={styles.questionLabel}>
                Do you collect anything ?
              </Text>
              <TouchableOpacity>
                <Entypo
                  size={25}
                  name="dots-three-horizontal"
                  color={'#A9A9A9'}
                />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal style={{flexDirection: 'row'}}>
              {selectedCategories.map((item: any) => {
                return (
                  <View style={[styles.listItem]} key={item.id}>
                    <Text style={[styles.listLabel]}>{item.name}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.questionCard}>
            <View style={styles.questionSubCard}>
              <Text style={styles.questionLabel}>What are your hobbies?</Text>
              <TouchableOpacity>
                <Entypo
                  name="dots-three-horizontal"
                  color={'#A9A9A9'}
                  size={25}
                />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal style={{flexDirection: 'row'}}>
              {selectedCategories.map((item: any) => {
                return (
                  <View key={item.id} style={[styles.listItem]}>
                    <Text style={[styles.listLabel]}>{item.name}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </>
      )}

      <View
        style={{
          width: '100%',
          height: 115,
          borderRadius: 16,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          justifyContent: 'center',
          marginVertical: 15,
        }}>
        <FastImage
          source={require('../../assets/images/FilledGiftProfile.png')}
          style={{width: 36, height: 36, alignSelf: 'center'}}
        />
        <Text
          style={{
            fontFamily: 'SFPro',
            fontSize: 20,
            fontWeight: '600',
            fontStyle: 'normal',
            lineHeight: 22,
            letterSpacing: 0,
            textAlign: 'center',
            color: '#ffffff',
          }}>
          GiftProfile public view
        </Text>
        <Text
          style={{
            fontFamily: 'SFPro',
            fontSize: 16,
            fontWeight: 'normal',
            fontStyle: 'normal',
            lineHeight: 20,
            letterSpacing: 0,
            textAlign: 'center',
            color: '#d6d6d6',
          }}>
          This is how your GiftProfile appears publicly
        </Text>
      </View>
    </ScrollView>
  );
};
export default PublicProfile;
