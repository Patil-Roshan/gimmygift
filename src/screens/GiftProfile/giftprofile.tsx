/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  ScrollView,
  Share,
  StatusBar,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  Modal as RNModal,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import {styles} from './giftprofile.styles';
import FastImage from 'react-native-fast-image';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import {Bar} from 'react-native-progress';
import colors from '../../theme/colors';
import Icon from '../../components/Icon';
import Modal from 'react-native-modal';
import ImagePicker from 'react-native-image-crop-picker';
import {LinkPreview} from '@flyerhq/react-native-link-preview';

import Clipboard from '@react-native-clipboard/clipboard';
import RNFS from 'react-native-fs';
import DateTimePicker from '@react-native-community/datetimepicker';
import {decode} from 'base64-arraybuffer';
import {
  ic_add,
  ic_add_grey,
  ic_address,
  ic_birthdate,
  ic_birthday_profile,
  ic_copy,
  ic_date,
  ic_download,
  ic_gender,
  ic_gimmepick_reject,
  ic_instagram,
  ic_link,
  ic_logo,
  ic_new_product,
  ic_pick_profile,
  ic_quiz_profile,
  ic_remove,
  ic_share_modal,
  ic_share_profile,
  ic_wishlist,
  ic_wishlist_profile,
} from '../../assets/icons/icons';
import Button from '../../components/Button';
import {supabase} from '../../lib/supabase';
import moment from 'moment';
import Input from '../../components/Input';
import Toast from 'react-native-toast-message';
import activeUserInstance from '../../../store/activeUsersInstance';
import QRCode from 'react-native-qrcode-svg';
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from '@react-navigation/native';
import {RootStackParamList, UserInterface} from '../../types';
import {config} from '../../config';
import Webpage from '../../components/webpage';
import Collage from '../../components/Collage';
import {uploadFile} from '../../api/storage';
import {termsLink} from '../../referenceData';
import scale from '../../scale';
import shareEventLink from '../../branch/shareLinks';
import {fetchProductDetailsFromURL} from '../../lib/supabaseFunctions';
import scaledSize from '../../scaleSize';
import {checkAllMediaPermissions} from '../../permission';

interface ListType {
  id: number;
  image: any;
  title: string;
  sub_title: string;
  images: any;
  image_url: string;
  link: string;
  product_name: string;
  price: any;
}

interface Preference {
  id: string;
  type: string;
  answers: string[];
  category: string;
  question: string;
  response: string;
  timestamp: string;
}

const GiftProfile = () => {
  const navigation: NavigationProp<RootStackParamList> = useNavigation();
  const qrCodeRef = useRef(null);

  const [isChecked, setIsChecked] = useState(false);
  const [showGiftFundModal, setShowGiftFundModal] = useState(false);
  const [showNewWishlistModal, setShowNewWishlistModal] = useState(false);
  const [showFirstAccessModal, setShowFirstAccessModal] = useState(false);
  const [activeToggle, setActiveToggle] = useState('GiftFunds');
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [showNewRecipientModal, setShowNewRecipientModal] = useState(false);

  const [showOccasionModal, setShowOccasionModal] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const [showAddPrefsModal, setShowAddPrefsModal] = useState(false);
  const [showCustomAmountModal, setShowCustomAmountModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedRecipientImage, setSelectedRecipientImage] = useState('');

  const [selectedGender, setSelectedGender] = useState('');
  const [showGenderModal, setShowGenderModal] = useState(false);

  const [giftFundTitle, setGiftFundTitle] = useState('');
  const [giftFundDescription, setGiftFundDescription] = useState('');
  const [giftFundGoal, setGiftFundGoal] = useState('0.00');
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const [isImageUpdated, setIsImageUpdated] = useState(false);

  const [wishlistPicture, setWishlistPicture] = useState('');
  const [wishlistTitle, setWishlistTitle] = useState('');
  const [wishlistBrand, setWishlistBrand] = useState('');
  const [wishlistLink, setWishlistLink] = useState('');
  const [wishlistPrice, setWishlistPrice] = useState('');
  const [showWishlistUpdateModal, setShowWishlistUpdateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isWishlistImageUpdated, setIsWishlistImageUpdated] = useState(false);
  const [counters, setCounters] = useState({});
  const [selectedWishlistItem, setSelectedWishlistItem] = useState('');

  //useState<GiftFund[]>([]);
  const [giftFundDetails, setGiftFundDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [wishlistDetails, setWishlistDetails] = useState([]);
  const [showWebpage, setShowWebpage] = useState(false);
  const [currentProductLink, setCurrentProductLink] = useState('');
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [wishlistCategories, setWishlistCategories] = useState([
    {id: 1, title: 'Until $100', images: []},
    {id: 2, title: 'Until $250', images: []},
    {id: 3, title: 'Until $500', images: []},
    {id: 4, title: 'Until $1000', images: []},
    {id: 5, title: 'All', images: []},
  ]);

  const [showPublic, setShowPublic] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState('');

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const [highlightedPreferences, setHighlightedPreferences] = useState([]);
  const activeUsers = activeUserInstance((state: any) => state.activeUsers);
  const setActiveUsers = activeUserInstance(
    (state: any) => state.setActiveUsers,
  );

  const [birthdate, setBirthdate] = useState(
    new Date(activeUsers[0]?.birthday),
  );

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [productLink, setProductLink] = useState('');

  const giftFunds = [
    {
      id: '1',
      image: require('../../assets/images/giftFund2.png'),
      text: 'Have you always desired a Ferrari or a vacation? Raise funds, and finally, your dream comes true. Ask your friends to send you a gift amount and reach the goal with no time limits.',
    },
    {
      id: '2',
      image: require('../../assets/images/giftFund1.png'),
      text: 'When the goal has been reached a unique payment transfer will be made. Every sent amount is subject to a transaction fee. To learn more, read about Payments.',
    },
  ];

  const categorizeWishlist = (wishlistData, categories) => {
    const categorizedData = categories.map(category => ({
      ...category,
      items: [],
      images: [],
    }));

    // Categorize wishlist items
    wishlistData.forEach(item => {
      let foundCategory = false;
      for (let category of categorizedData) {
        switch (category.id) {
          case 1:
            if (item.price <= 100) {
              category.items.push(item);
              category.images.push(item.image_url);
              foundCategory = true;
            }
            break;
          case 2:
            if (item.price <= 250) {
              category.items.push(item);
              category.images.push(item.image_url);
              foundCategory = true;
            }
            break;
          case 3:
            if (item.price <= 500) {
              category.items.push(item);
              category.images.push(item.image_url);
              foundCategory = true;
            }
            break;
          case 4:
            if (item.price <= 1000) {
              category.items.push(item);
              category.images.push(item.image_url);
              foundCategory = true;
            }
            break;
          case 5:
            category.items.push(item);
            category.images.push(item.image_url);
            foundCategory = true;
            break;
        }
        if (foundCategory) {
          break;
        }
      }
    });

    // Remove empty categories
    const filteredCategories = categorizedData.filter(
      category => category.items.length > 0,
    );

    return filteredCategories;
  };

  const saveQR = () => {
    try {
      qrCodeRef?.current?.toDataURL(data => {
        Toast.show({
          type: 'info',
          text1: 'Saving QR code...Please wait',
          position: 'bottom',
        });
        // Define the file path
        const filePath = RNFS.CachesDirectoryPath + '/' + Date.now() + '.png';

        // Write the file to the device
        RNFS.writeFile(filePath, data, 'base64')
          .then(() => {
            Alert.alert(
              'Saved Successfully',
              'QR code saved successfully on your device.',
              [
                {
                  text: 'OK',
                  onPress: () => console.log('Done'),
                },
              ],
              {cancelable: false},
            );
          })
          .catch(error => {
            console.error('Error saving QR code:', error);
            // Show error toast
            Toast.show({
              type: 'error',
              text1: 'Failed to save QR code',
              position: 'bottom',
            });
          });
      });
    } catch (error) {
      console.error('Error saving QR code:', error);
    }
  };
  const getHighlightedPreferences = useCallback(async () => {
    try {
      const {data: highlightedDetails} = await supabase
        .from('profiles')
        .select('highlighted_preferences')
        .eq('user_id', activeUsers[0]?.user_id);

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

  const getUserGiftFunds = useCallback(async () => {
    try {
      const {data: fundDetails} = await supabase
        .schema('gift')
        .from('gift_funds')
        .select('*')
        .eq('created_by_user_id', activeUsers[0]?.user_id);
      if (fundDetails && fundDetails.length > 0) {
        //map fundDetails and add images
        const fundWithImages = fundDetails?.map(fund => {
          return {
            ...fund,
            image_url: `${config.SUPABASE_URL}/storage/v1/object/public/assets/GIFT_FUNDS/${fund?.gift_fund_id}.png`,
          };
        });

        setGiftFundDetails(fundWithImages);
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
        .eq('created_by', activeUsers[0]?.user_id)
        .single();

      if (registryError) {
        console.log('Registry Fetch Error', registryError);
        setIsLoading(false);
        setWishlistCategories([]);
        return;
      }

      const registryId = registry.registry_id;

      // Fetch all products from registry_items where registry_id matches
      const {data: products, error: productsError} = await supabase
        .schema('registry')
        .from('registry_items')
        .select('*')
        .eq('registry_id', registryId)
        .order('created_at', {ascending: false});

      if (productsError) {
        console.log('Products Fetch Error', productsError);

        Toast.show({
          type: 'error',
          text1: 'Failed to fetch products',
          position: 'bottom',
        });
        setIsLoading(false);
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
      setWishlistCategories(
        categorizeWishlist(wishlistImages, wishlistCategories),
      );
      setIsLoading(false);
    } catch (error) {
      console.log('Error', error);
      Toast.show({
        type: 'error',
        text1: 'An error occurred while fetching products',
        position: 'bottom',
      });
      setIsLoading(false);
    }
  }, [activeUsers]);

  const getCounters = useCallback(async () => {
    try {
      let giftsSent = 0;
      let giftsReceived = 0;
      let preferences = 0;

      // Fetch gift transactions
      const {data: details} = await supabase
        .schema('gift')
        .from('gift_transactions')
        .select('user_id, sendee_user_id');

      if (details && details.length > 0) {
        giftsSent = details.filter(
          transaction => transaction.user_id === activeUsers[0].user_id,
        ).length;
        giftsReceived = details.filter(
          transaction => transaction.sendee_user_id === activeUsers[0].user_id,
        ).length;
      }

      // Fetch preferences from gift_preferences table
      const {data: preferencesData} = await supabase
        .schema('gift')
        .from('gift_preferences')
        .select('user_id')
        .eq('user_id', activeUsers[0].user_id);

      if (preferencesData && preferencesData.length > 0) {
        preferences = preferencesData.length;
      }

      const counts = {
        giftsSent,
        giftsReceived,
        preferences,
      };

      setCounters(counts);
    } catch (error) {
      console.error('Unexpected error:', error);
      throw error;
    }
  }, [activeUsers]);

  useFocusEffect(
    useCallback(() => {
      getUserGiftFunds();
      getWishlistItems();
      getHighlightedPreferences();
      getCounters();
    }, [
      getHighlightedPreferences,
      getUserGiftFunds,
      getWishlistItems,
      getCounters,
    ]),
  );

  const getBarProgress = (total: string, target_amount: string) => {
    const goalAmount = parseInt(target_amount || '0');
    const progress = total / goalAmount;
    return progress || 0;
  };

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
    if (type === 'Wishlist') {
      setShowWishlistModal(true);
    }
    if (type === 'Preferences Quiz') {
      navigation.navigate('quiz');
    }
    if (type === 'GiftFund') {
      setShowFirstAccessModal(true);
    }
    if (type === 'New recipient') {
      setShowNewRecipientModal(true);
    }
    if (type === 'Occasion') {
      setShowOccasionModal(true);
    }
  };

  const renderGifts = ({item}: {item: ListType; index: number}) => {
    return (
      <TouchableOpacity
        style={styles.wishlistCatContainer}
        onPress={() =>
          navigation.navigate('wishlistcategory', {
            title: item.title,
            items: item,
          })
        }>
        <Collage images={item.images} />
        <Text style={styles.wishlistCatLabel}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  const renderWishlistItem = ({item}: {item: ListType; index: number}) => {
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
            <TouchableOpacity
              onPress={() => {
                setShowWishlistUpdateModal(true);
                setSelectedWishlistItem(item);
              }}
              style={{
                height: 28,
                width: 28,
                backgroundColor: '#fff',
                borderRadius: 45,
                position: 'absolute',
                zIndex: 1,
                left: 10,
                top: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Entypo
                name="dots-three-horizontal"
                color={'rgba(0, 0, 0, 0.5)'}
                size={20}
                style={{
                  width: 20,
                  height: 20,
                  textAlign: 'center',
                }}
              />
            </TouchableOpacity>
            <FastImage
              source={{
                uri: item?.image_url,
                cache: 'web',
              }}
              resizeMode="cover"
              style={{width: '100%', height: '100%'}}
            />
          </View>
          <View style={{width: '60%', backgroundColor: '#fff', padding: 15}}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: 'SFPro',
                color: '#a0a0a0',
                fontSize: 14,
                fontWeight: 'normal',
                paddingVertical: 6,
              }}>
              {item?.brand}
            </Text>
            <Text
              numberOfLines={2}
              style={{
                fontFamily: 'SFPro',
                width: scaledSize(193),
                fontSize: 16,
                fontWeight: '600',
                fontStyle: 'normal',
                lineHeight: 18,
                letterSpacing: 0,
                color: '#000000',
                paddingTop: 6,
              }}>
              {item?.product_name}
            </Text>
            <Text
              style={{
                fontFamily: 'SFPro',
                fontSize: 18,
                fontWeight: 'normal',
                fontStyle: 'normal',
                lineHeight: 18,
                letterSpacing: 0,
                color: '#000000',
                marginTop: 17,
                marginBottom: 24,
              }}>
              ${item?.price}
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
                height={30}
                fontSize={14}
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const handleGiftFundBtn = () => {
    setShowFirstAccessModal(false);

    setTimeout(() => {
      setShowGiftFundModal(true);
    }, 1500);
  };

  const handleNewWishlist = () => {
    setShowWishlistModal(false);
    setTimeout(() => {
      setShowNewWishlistModal(true);
    }, 2000);
  };

  const handleProductLink = async () => {
    if (!productLink) {
      Alert.alert('Error', 'Please enter a valid product link');
      return;
    }
    const productDetails = await fetchProductDetailsFromURL(productLink);
    if (productDetails) {
      const isNumeric = (str: string) =>
        !isNaN(parseFloat(str)) && isFinite(Number(str));

      setWishlistLink(productDetails?.link);
      setWishlistPrice(
        isNumeric(productDetails?.price) ? productDetails?.price : '',
      );
      setWishlistTitle(
        productDetails?.brand?.replace(/\s+/g, ' ').trim()?.slice(0, 50),
      );

      const response = await fetch(productDetails?.image);
      const blob = await response.blob();
      let imageData = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader?.result?.split(',')[1]);
        reader.readAsDataURL(blob);
      });
      setWishlistPicture('data:image/png;base64,' + imageData);
      setShowWishlistModal(false);
      setTimeout(() => {
        setShowNewWishlistModal(true);
      }, 800);
    }
  };

  const isValidURL = (link: string) => {
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    );
    return !!urlPattern.test(link);
  };

  const handleLinkChange = (text: string) => {
    if (isValidURL(text)) {
      setProductLink(text);
    } else {
      setProductLink('');
    }
  };

  const selectImage = (type: string) => {
    const options = {
      width: 400,
      height: 400,
      cropping: true,
    };
    ImagePicker.openPicker(options).then((image: any) => {
      if (type === 'GiftFund') {
        setSelectedImage(image.path);
      }
      if (type === 'Wishlist') {
        setWishlistPicture(image.path);
        setIsWishlistImageUpdated(true);
      }
    });
  };

  const renderItem = ({item}) => {
    return (
      <View
        style={{
          width: Dimensions.get('window').width * 0.9,
        }}>
        <View
          style={{
            width: '95%',
            height: 200,
            justifyContent: 'center',
            borderRadius: 8,
            alignSelf: 'center',
          }}>
          <FastImage
            resizeMode="cover"
            source={item.image}
            style={{
              borderRadius: 8,
              width: '100%',
              height: 190,
            }}
          />
        </View>
      </View>
    );
  };

  const renderIndicator = (index: number) => {
    return (
      <TouchableOpacity
        key={index}
        onPress={() => setActiveIndex(index)}
        style={{
          width: 8,
          height: 8,
          backgroundColor: index === activeIndex ? colors.primary : 'lightgray',
          marginHorizontal: 5,
          borderRadius: 8 / 2,
        }}
      />
    );
  };

  const createGiftFund = async () => {
    if (!giftFundTitle) {
      Alert.alert('Fund title is required', 'Please enter fund title', [
        {text: 'OK'},
      ]);
    } else if (!giftFundDescription) {
      Alert.alert(
        'Fund description is required',
        'Please enter fund description',
        [{text: 'OK'}],
      );
    } else if (!giftFundGoal) {
      Alert.alert('Fund goal is required', 'Please enter fund goal', [
        {text: 'OK'},
      ]);
    } else {
      setIsLoading(true);
      const {data: createdFund, error} = await supabase
        .schema('gift')
        .from('gift_funds')
        .insert([
          {
            gift_name: giftFundTitle,
            description: giftFundDescription,
            target_amount: parseInt(giftFundGoal || '0', 10),
            current_amount: 0,
            created_by_user_id: activeUsers[0]?.user_id,
          },
        ])
        .select();

      if (!error) {
        if (selectedImage.length > 0) {
          let id = createdFund[0]?.gift_fund_id;
          const {error: iError} = await uploadFile(
            'assets',
            `GIFT_FUNDS/${id}.png`,
            selectedImage,
          );
          if (iError) {
            console.log('Storage Upload Error->', iError);
            setIsLoading(false);
            return;
          }
        }
        Toast.show({
          type: 'success',
          text1: 'GiftFund created successfully',
          position: 'bottom',
        });
        setShowGiftFundModal(false);
        setSelectedImage('');
        getUserGiftFunds();
        setIsLoading(false);
      } else {
        setIsLoading(false);
        Toast.show({
          type: 'error',
          text1: 'GiftFund creation failed',
          position: 'bottom',
        });
      }
    }
  };

  const createWishlistItem = async () => {
    if (!wishlistTitle) {
      Alert.alert(
        'brand or store name is required',
        'Please enter brand or store name',
        [{text: 'OK'}],
      );
    } else if (!wishlistLink) {
      Alert.alert('product link is required', 'Please enter product link', [
        {text: 'OK'},
      ]);
    } else if (!wishlistPrice) {
      Alert.alert('Product price is required', 'Please enter wishlist price', [
        {text: 'OK'},
      ]);
    } else {
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
            product_name: wishlistTitle,
            brand: wishlistBrand,
            link: wishlistLink,
            price: wishlistPrice,
            registry_id: registryId,
          },
        ])
        .select();

      console.log('Item Insert Data', itemInsertData);

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

      if (wishlistPicture.length > 0) {
        const item_id = itemInsertData[0].item_id;
        const {error: iError} = await uploadFile(
          'assets',
          `WISHLISTS/${item_id}.png`,
          wishlistPicture,
        );

        if (iError) {
          console.log('Storage Upload Error->', iError);
          setIsLoading(false);
          return;
        }
      }

      Toast.show({
        type: 'success',
        text1: 'Wishlist item created successfully',
        position: 'bottom',
      });

      getWishlistItems();

      setShowNewWishlistModal(false);
      setIsLoading(false);
    }
  };

  const updateWishlistItem = async () => {
    if (!wishlistTitle) {
      Alert.alert(
        'brand or store name is required',
        'Please enter brand or store name',
        [{text: 'OK'}],
      );
    } else if (!wishlistLink) {
      Alert.alert('product link is required', 'Please enter product link', [
        {text: 'OK'},
      ]);
    } else if (!wishlistPrice) {
      Alert.alert('Product price is required', 'Please enter wishlist price', [
        {text: 'OK'},
      ]);
    } else {
      setIsLoading(true);

      // Update the registry item
      const {error: itemUpdateError} = await supabase
        .schema('registry')
        .from('registry_items')
        .update({
          product_name: wishlistTitle,
          brand: wishlistBrand,
          link: wishlistLink,
          price: parseFloat(wishlistPrice),
        })
        .eq('item_id', selectedWishlistItem?.item_id)
        .select();

      if (itemUpdateError) {
        console.log('Item Update Error', itemUpdateError);
        setIsLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Failed to update registry item',
          position: 'bottom',
        });
        return;
      }

      // Update the picture if a new one is provided
      if (wishlistPicture.length > 0 && isWishlistImageUpdated) {
        const {error: iError} = await uploadFile(
          'assets',
          `WISHLISTS/${selectedWishlistItem?.item_id}.png`,
          wishlistPicture,
        );

        if (iError) {
          console.log('Storage Upload Error->', iError);
          setIsLoading(false);
          Toast.show({
            type: 'error',
            text1: 'Failed to update item picture',
            position: 'bottom',
          });
          return;
        }
      }

      setIsLoading(false);
      Toast.show({
        type: 'success',
        text1: 'Wishlist item updated successfully',
        position: 'bottom',
      });

      getWishlistItems();
      setShowNewWishlistModal(false);
      setIsEditing(false);
      setIsLoading(false);
    }
  };

  const shareUser = () => {
    shareEventLink('Profile', 'profile', activeUsers[0]?.user_id);
  };

  const renderGiftFundCard = () => {
    return (
      <>
        {/* Gift Fund Card */}
        {giftFundDetails && giftFundDetails.length > 0 ? (
          <>
            <TouchableOpacity
              style={styles.giftCardHeader}
              onPress={() => setShowGiftFundModal(true)}>
              <Text style={styles.giftFundLabel}>GiftFund</Text>
              <Text style={[styles.giftFundLabel, {color: colors.primary}]}>
                Create
              </Text>
            </TouchableOpacity>
            <View style={styles.giftFundContainer}>
              <FlatList
                data={giftFundDetails}
                renderItem={({item}: any) => (
                  <View style={styles.giftFundBox}>
                    <View
                      style={{
                        width: '40%',
                        backgroundColor: '#fff',
                        borderRadius: 8,
                        height: 200,
                      }}>
                      <FastImage
                        source={{uri: item.image_url}}
                        style={{
                          width: '100%',
                          height: 200,
                          borderTopLeftRadius: 8,
                          borderBottomLeftRadius: 8,
                        }}
                      />
                    </View>
                    <View
                      style={{
                        width: '60%',
                        backgroundColor: '#fff',
                        paddingTop: 12,
                        paddingHorizontal: 14,
                        height: 200,
                        borderTopRightRadius: 8,
                        borderBottomRightRadius: 8,
                      }}>
                      <Text
                        style={{
                          color: '#000',
                          fontSize: 18,
                          fontWeight: '600',
                        }}>
                        {item.gift_name}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Inter-Regular',
                          fontSize: 14,
                          fontWeight: '500',
                          fontStyle: 'normal',
                          lineHeight: 20,
                          letterSpacing: -0.26,
                          color: '#000000',
                          paddingTop: 10,
                        }}>
                        ${item.current_amount} of ${item.target_amount}
                      </Text>

                      <View style={{width: '100%'}}>
                        <Bar
                          progress={getBarProgress(
                            item.current_amount,
                            item.target_amount,
                          )}
                          width={null}
                          color={colors.primary}
                          unfilledColor="#E6E6E6"
                          borderWidth={0}
                          height={6}
                          style={{marginVertical: 4}}
                        />
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          width: '100%',
                          justifyContent: 'space-evenly',
                          marginTop: 10,
                          position: 'absolute',
                          bottom: 18,
                          alignSelf: 'center',
                        }}>
                        <TouchableOpacity
                          onPress={() => {
                            shareEventLink(
                              item?.gift_name,
                              'giftfunds',
                              item?.gift_fund_id,
                            );
                          }}
                          style={{
                            width: scaledSize(62),
                            alignItems: 'center',
                            backgroundColor: '#E4E4E5',
                            paddingVertical: scaledSize(7),
                            borderRadius: 8,
                            marginRight: 7,
                          }}>
                          <Text
                            style={{
                              color: '#333',
                              fontSize: scaledSize(14),
                              fontWeight: '600',
                              fontFamily: 'Inter-Regular',
                            }}>
                            Share
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('giftfundinfo', {
                              fundDetails: item || {},
                            });
                          }}
                          style={{
                            width: scaledSize(120),
                            alignItems: 'center',
                            backgroundColor: colors.primary,
                            paddingVertical: scaledSize(7),
                            // paddingHorizontal: scaledSize(12),
                            borderRadius: 8,
                          }}>
                          <Text
                            style={{
                              color: '#fff',
                              fontFamily: 'Inter-Regular',
                              fontSize: scaledSize(14),
                              fontWeight: '600',
                            }}>
                            Gift an amount
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.giftCardHeader}>
              <Text style={styles.giftFundLabel}>GiftFund</Text>
              <Text
                style={[
                  styles.giftFundLabel,
                  {color: colors.primary, fontWeight: 'normal'},
                ]}
                onPress={() => setShowFirstAccessModal(true)}>
                Create
              </Text>
            </View>
            <View style={[styles.slide, {height: 195}]}>
              <View style={styles.giftCardSubContainer}>
                <View
                  style={{
                    width: '40%',
                    backgroundColor: '#dedee2',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Image
                    source={require('../../assets/images/gift_fund_grey.png')}
                    style={{width: 50, height: 50}}
                  />
                </View>
                <View
                  style={{
                    width: '60%',
                    backgroundColor: '#fff',
                    padding: 15,
                  }}>
                  <Text
                    numberOfLines={2}
                    style={{
                      color: '#000',
                      fontSize: scale(24),
                      fontWeight: '600',
                    }}>
                    Raise money with a GiftFund
                  </Text>
                  <Text style={styles.giftAmountSubLabel} numberOfLines={2}>
                    Start to raise money for something you truly desire.
                  </Text>

                  <TouchableOpacity
                    onPress={() => setShowFirstAccessModal(true)}
                    style={{
                      flexDirection: 'row',
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      height: 30,
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                      borderRadius: 8,
                      position: 'absolute',
                      alignSelf: 'center',
                      bottom: 15,
                    }}>
                    <Icon size={18} icon={ic_add} tintColor="#000" />
                    <Text
                      style={{
                        fontWeight: '600',
                        color: '#000',
                        fontSize: scale(14),
                        paddingHorizontal: 6,
                      }}>
                      Create a GiftFund
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}
      </>
    );
  };

  const renderProfileOptions = (title: string, icon: string) => {
    return (
      <TouchableOpacity
        style={styles.optionContainer}
        onPress={() => {
          handleProfileOptions(title);
        }}>
        <Icon size={24} icon={icon} />
        <Text style={styles.profileOptions}>{title}</Text>
      </TouchableOpacity>
    );
  };

  const handleProfileOptions = (title: string) => {
    if (title === 'Share') {
      setShowProfileOptions(false);
      setTimeout(() => {
        setShowShareModal(true);
      }, 750);
    } else if (title === 'Edit') {
      setShowProfileOptions(false);
      setSelectedGender(activeUsers[0].gender);
      setCurrentUser({...currentUser, full_name: activeUsers[0].full_name});

      setTimeout(() => {
        setShowEditProfileModal(true);
      }, 500);
    } else if (title === 'Virtual Gifts') {
      setShowProfileOptions(false);
      setTimeout(() => {
        navigation.navigate('VirtualGiftList');
      }, 500);
    } else if (title === 'Preferences manager') {
      setShowProfileOptions(false);
      setTimeout(() => {
        navigation.navigate('preferencesmanager');
      }, 500);
    } else if (title === 'Items manager') {
      setShowProfileOptions(false);
      setTimeout(() => {
        navigation.navigate('directpickmanager');
      }, 500);
    } else if (title === 'Public view') {
      setShowProfileOptions(false);
      setTimeout(() => {
        navigation.navigate('publicprofile');
      }, 500);
    } else if (title === 'Switch GiftProfile') {
      setShowProfileOptions(false);
      setTimeout(() => {
        setModalVisible(true);
      }, 750);
    } else if (title === 'Delete from wishlist') {
      deleteWishlistItem();
    } else if (title === 'Share ') {
      Share.share({
        message:
          'Check out this awesome item from my wishlist  ' +
          selectedWishlistItem?.link,
      });
    } else if (title === 'Edit ') {
      setShowWishlistUpdateModal(false);
      setWishlistLink(selectedWishlistItem?.link);
      setWishlistTitle(selectedWishlistItem?.product_name);
      setWishlistPicture(selectedWishlistItem?.image_url);
      setWishlistPrice(selectedWishlistItem?.price?.toString());
      setIsEditing(true);
      setTimeout(() => {
        setShowNewWishlistModal(true);
      }, 800);
    }
  };

  const deleteWishlistItem = async () => {
    setShowWishlistUpdateModal(false);

    const {data: products, error: productsError} = await supabase
      .schema('registry')
      .from('registry_items')
      .delete()
      .eq('item_id', selectedWishlistItem?.item_id);
    if (!productsError) {
      getWishlistItems();
      Toast.show({
        type: 'success',
        text1: 'Wishlist item deleted successfully',
        position: 'bottom',
      });
    }
  };
  const switchUser = (userID: any) => {
    let arr = [...activeUsers];
    const userIndex = arr.findIndex(user => user.user_id === userID);
    if (userIndex !== -1) {
      const [user] = arr.splice(userIndex, 1);
      arr.unshift(user);
    }
    setActiveUsers(arr);
    setModalVisible(false);
    Toast.show({
      type: 'success',
      text1: 'User switched to ' + arr[0].full_name,
      position: 'bottom',
    });
  };

  const renderUserList = ({item}: {item: any; index: number}) => {
    console.log('item', item);

    return (
      <>
        <TouchableOpacity
          onPress={() => switchUser(item.user_id)}
          style={styles.userListContainer}>
          <View style={styles.userListLeftContainer}>
            <FastImage
              // source={item.image}
              source={{
                uri: item.profile_image,
              }}
              style={{
                width: 30,
                height: 30,
                borderWidth: 0.5,
                borderColor: '#000',
                borderRadius: 17,
              }}
            />
            <Text style={styles.userListTextStyle}>
              {item.full_name}
              {item.relation ? ' (' + item.relation + ')' : ''}
            </Text>
          </View>
          <View style={styles.userListRightContainer}>
            {activeUsers[0]?.user_id === item.user_id ? (
              <Entypo
                name="check"
                color={colors.primary}
                size={22}
                style={{
                  width: 20,
                  height: 20,
                  textAlign: 'center',
                }}
              />
            ) : (
              <></>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.profileDivider} />
      </>
    );
  };

  const Logout = async () => {
    setActiveUsers([]);
    await supabase.auth.signOut();
    navigation.replace('landing');
  };

  const renderSwitchModal = () => {
    return (
      <Modal
        isVisible={modalVisible}
        style={{margin: 0}}
        onBackdropPress={() => setModalVisible(false)}>
        <TouchableOpacity
          style={[styles.modalContainer, {paddingHorizontal: 0}]}
          onPress={() => {
            setModalVisible(false);
          }}>
          <View style={styles.modalContent}>
            <View>
              <FlatList
                data={activeUsers}
                renderItem={renderUserList}
                style={styles.actionList}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                paddingHorizontal: 18,
                paddingVertical: 12,
                alignItems: 'center',
              }}>
              <View
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  borderRadius: 50,
                }}>
                <Icon icon={ic_add_grey} size={30} />
              </View>
              <Text
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('registrationkids');
                }}
                style={{
                  fontFamily: 'SFPro',
                  fontSize: 18,
                  fontWeight: 'normal',
                  color: colors.black,
                  paddingLeft: 10,
                }}>
                Create a GiftProfile for your kids
              </Text>
            </View>

            <Button
              onPress={Logout}
              width={'92%'}
              bg={'rgba(0, 0, 0, 0.05)'}
              fontColor={'#ff0000'}
              label={'Logout'}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const removeHighlighted = async () => {
    try {
      const {data, error} = await supabase
        .from('profiles')
        .select('highlighted_preferences')
        .eq('user_id', activeUsers[0]?.user_id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      let preferences: Preference[] = data?.highlighted_preferences || [];
      preferences = preferences.filter(p => p.id !== currentQuestion.id);

      const {error: updateError} = await supabase
        .from('profiles')
        .update({highlighted_preferences: preferences})
        .eq('user_id', activeUsers[0]?.user_id);

      console.log('updateError', updateError);

      if (updateError) {
        throw new Error(updateError.message);
      }
      getHighlightedPreferences();
      setShowAddPrefsModal(false);
    } catch (error) {
      setShowAddPrefsModal(false);
      console.error('Error updating highlighted preferences:', error.message);
    }
  };

  const renderAddPreferences = () => {
    return (
      <Modal
        isVisible={showAddPrefsModal}
        style={{margin: 0}}
        onBackdropPress={() => setShowAddPrefsModal(false)}>
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 10,
            borderRadius: 15,
            backgroundColor: '#fff',
            paddingHorizontal: 25,
            paddingTop: 20,
            paddingBottom: 30,
          }}>
          <View
            style={{
              width: '12%',
              height: 6,
              backgroundColor: '#D4D4D4',
              alignSelf: 'center',
              marginBottom: 10,
              borderRadius: 5,
            }}
          />
          <TouchableOpacity
            onPress={() => removeHighlighted()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
            }}>
            <Icon icon={ic_remove} size={24} />
            <Text style={{marginLeft: 10, fontSize: 18}}>
              Delete to your GiftProfile
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  const onChange = (event: any, selectedDate: any) => {
    setBirthdate(selectedDate);

    setShowDatePicker(false);
  };

  const updateProfile = async () => {
    try {
      setIsLoading(true);
      const userID = activeUsers[0]?.user_id;
      if (!userID) {
        throw new Error('User ID is missing');
      }

      const updatedUserObj = {
        full_name: currentUser?.full_name,
        gender: selectedGender?.toUpperCase(),
        birthday: birthdate,
      };

      if (isImageUpdated) {
        const imageData = await RNFS.readFile(selectedProfileImage, 'base64');
        const {error: updateError} = await supabase.storage
          .from('profiles')
          .update(`${userID}/${userID}.png`, decode(imageData), {
            contentType: 'image/png',
            cacheControl: 'no-cache',
          });

        if (updateError?.message?.includes('not found')) {
          const {error: uploadError} = await supabase.storage
            .from('profiles')
            .upload(`${userID}/${userID}.png`, decode(imageData), {
              contentType: 'image/png',
              cacheControl: 'no-cache',
            });
          console.error('Error while uploading image', uploadError);
        }
      }

      const {error: updateError} = await supabase
        .from('profiles')
        .update(updatedUserObj)
        .eq('user_id', userID);

      if (updateError) {
        console.error('Error while updating profile', updateError);
        setIsLoading(false);
        throw new Error('Profile update failed');
      }

      const updatedUser = {
        ...activeUsers[0],
        ...updatedUserObj,
      };

      const updatedActiveUsers = activeUsers.map((user: UserInterface) =>
        user.id === activeUsers[0]?.id ? updatedUser : user,
      );

      updatedActiveUsers.sort((a: any, b: any) => {
        if (a.user_type === 'NORMAL' && b.user_type !== 'NORMAL') {
          return -1;
        }
        if (a.user_type !== 'NORMAL' && b.user_type === 'NORMAL') {
          return 1;
        }
        return 0;
      });

      const usersWithImages = await Promise.all(
        updatedActiveUsers.map(async (user: UserInterface) => {
          const imagePath = `${user.user_id}/${user.user_id}.png`;
          const {data: imageUrlData} = await supabase.storage
            .from('profiles')
            .createSignedUrl(imagePath, 86400);
          return {...user, profile_image: imageUrlData?.signedUrl};
        }),
      );

      setActiveUsers(usersWithImages);
      setShowEditProfileModal(false);
      setIsImageUpdated(false);
      setIsLoading(false);

      Toast.show({
        type: 'success',
        text1: 'Profile Updated Successfully',
        position: 'bottom',
      });
    } catch (error) {
      console.error('Error updating profile', error);
      setIsLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Profile Update Failed',
        position: 'bottom',
      });
    }
  };
  const selectImageProfile = async () => {
    try {
      const options = {
        width: 400,
        height: 400,
        cropping: true,
      };
      await ImagePicker.openPicker(options).then(async (image: any) => {
        await setSelectedProfileImage(image.path);
        await setIsImageUpdated(true);
      });
    } catch (error) {
      console.log('Error', error);
    }
  };

  const renderEditModal = () => {
    return (
      <Modal
        isVisible={showEditProfileModal}
        style={{margin: 0}}
        onBackButtonPress={() => setShowEditProfileModal(false)}
        onBackdropPress={() => setShowEditProfileModal(false)}>
        <ScrollView
          style={{
            height: '90%',
            width: '100%',
            backgroundColor: '#efeff4',
            position: 'absolute',
            alignSelf: 'center',
            borderRadius: 12,
            bottom: 0,
            overflow: 'hidden',
            paddingHorizontal: 15,
          }}>
          {/* gender modal */}
          <Modal
            isVisible={showGenderModal}
            style={{margin: 0}}
            onBackdropPress={() => setShowGenderModal(false)}>
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 10,
                borderRadius: 15,
                backgroundColor: '#ECECF3',
                paddingHorizontal: 20,
                paddingVertical: 20,
                height: '75%',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                }}>
                <Text
                  style={[
                    styles.wishlistModalLabel,
                    {fontWeight: '700', fontSize: 25},
                  ]}>
                  Gender
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: '#fff',
                  paddingVertical: 12,
                  borderRadius: 10,
                }}>
                <TouchableOpacity
                  style={{flexDirection: 'row', paddingHorizontal: 6}}>
                  <Text
                    style={[
                      styles.wishlistModalLabel,
                      {
                        fontWeight: '400',
                        fontSize: 18,
                        paddingVertical: 15,

                        width: '90%',
                      },
                    ]}>
                    Female
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedGender('Female');
                      setShowGenderModal(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Entypo
                      name="check"
                      color={'#fff'}
                      size={18}
                      style={{
                        width: 24,
                        height: 24,
                        borderWidth: 0.5,
                        borderColor: '#000',
                        textAlignVertical: 'center',
                        borderRadius: 12,
                        textAlign: 'center',
                        backgroundColor:
                          selectedGender === 'Female' ? colors.primary : '#fff',
                        overflow: 'hidden',
                      }}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
                <View
                  style={{
                    height: 1,
                    backgroundColor: '#d6d6d6',
                    width: '100%',
                  }}
                />
                <TouchableOpacity
                  style={{flexDirection: 'row', paddingHorizontal: 6}}>
                  <Text
                    style={[
                      styles.wishlistModalLabel,
                      {
                        fontWeight: '400',
                        fontSize: 18,
                        paddingVertical: 15,

                        width: '90%',
                      },
                    ]}>
                    Male
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedGender('Male');
                      setShowGenderModal(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Entypo
                      name="check"
                      color={'#fff'}
                      size={18}
                      style={{
                        width: 24,
                        height: 24,
                        borderWidth: 0.5,
                        borderColor: '#000',
                        textAlignVertical: 'center',
                        borderRadius: 12,
                        textAlign: 'center',
                        backgroundColor:
                          selectedGender === 'Male' ? colors.primary : '#fff',
                        overflow: 'hidden',
                      }}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>

                <View
                  style={{
                    height: 1,
                    backgroundColor: '#d6d6d6',
                    width: '100%',
                  }}
                />

                <TouchableOpacity
                  style={{flexDirection: 'row', paddingHorizontal: 6}}>
                  <Text
                    style={[
                      styles.wishlistModalLabel,
                      {
                        fontWeight: '400',
                        fontSize: 18,
                        paddingVertical: 15,
                        width: '90%',
                      },
                    ]}>
                    Other
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedGender('Other');
                      setShowGenderModal(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Entypo
                      name="check"
                      color={'#fff'}
                      size={18}
                      style={{
                        width: 24,
                        height: 24,
                        borderWidth: 0.5,
                        borderColor: '#000',
                        textAlignVertical: 'center',
                        borderRadius: 12,
                        textAlign: 'center',
                        backgroundColor:
                          selectedGender === 'Other' ? colors.primary : '#fff',
                        overflow: 'hidden',
                      }}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          {/* gender modal */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 21,
            }}>
            <Text
              onPress={() => setShowEditProfileModal(false)}
              style={{
                fontSize: 17,
                fontWeight: 'normal',
                lineHeight: 27,
                letterSpacing: 0,
                color: colors.primary,
                width: '33.33%',
              }}>
              Cancel
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                lineHeight: 27,
                letterSpacing: 0,
                color: '#000000',
                width: '33.33%',
                textAlign: 'center',
              }}>
              Edit
            </Text>

            {isLoading ? (
              <View
                style={{
                  right: 0,
                  width: '33.33%',
                  alignItems: 'flex-end',
                }}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : (
              <Text
                onPress={() => updateProfile()}
                style={{
                  fontSize: 17,
                  fontWeight: '600',
                  lineHeight: 27,
                  letterSpacing: 0,
                  color: colors.primary,
                  width: '33.33%',
                  textAlign: 'right',
                }}>
                Save
              </Text>
            )}
          </View>

          <Image
            style={{
              height: 170,
              width: 170,
              borderRadius: 85,
              borderWidth: 0.2,
              overflow: 'hidden',
              alignSelf: 'center',
              marginTop: 31,
              marginBottom: 17,
            }}
            source={
              isImageUpdated
                ? {uri: selectedProfileImage}
                : activeUsers[0]?.profile_image
                ? {uri: activeUsers[0]?.profile_image}
                : require('../../assets/images/user_placeholder.png')
            }
          />

          <View
            style={{
              width: '60%',
              alignSelf: 'center',
              borderRadius: 12,
              marginBottom: 15,
            }}>
            <TouchableOpacity
              onPress={async () => {
                const hasPermission = await checkAllMediaPermissions();
                if (hasPermission) {
                  selectImageProfile();
                } else {
                  Alert.alert(
                    'Permission Required',
                    'Please enable photo access in your device settings to use this feature.',
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      },
                      {
                        text: 'Open Settings',
                        onPress: () => Linking.openSettings(),
                      },
                    ],
                  );
                }
              }}
              style={[
                styles.btnContainer,
                {
                  width: '55%',
                  borderRadius: 45,
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                },
              ]}>
              <Text style={styles.btnLabel}>Add a picture</Text>
            </TouchableOpacity>
          </View>

          <Input
            placeholder="Name"
            defaultValue={activeUsers[0]?.full_name}
            onChangeText={(text: string) =>
              setCurrentUser({...currentUser, full_name: text})
            }
            customContainerStyle={{width: '100%'}}
            customSubStyle={{borderWidth: 0}}
          />
          {/* <Input placeholder="Surname" /> */}

          <TouchableOpacity
            style={[styles.cards, {marginTop: 15, width: '100%'}]}
            onPress={() => {
              setShowGenderModal(true);
            }}>
            <Icon icon={ic_gender} size={24} />
            <Text style={[styles.btnLabel, {width: '70%', paddingLeft: 14}]}>
              Gender
            </Text>
            <Text style={[styles.btnLabel, {color: '#797979'}]}>
              {selectedGender}
            </Text>
            <Image
              source={require('../../assets/icons/ic_chevronRight.png')}
              style={styles.arrow}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cards, {width: '100%'}]}
            onPress={() => {
              setShowEditProfileModal(false);
              navigation.navigate('Address');
            }}>
            <Icon icon={ic_address} size={24} />
            <Text style={[styles.btnLabel, {width: '65%', paddingLeft: 14}]}>
              Address
            </Text>
            {/* <Text style={[styles.btnLabel, {color: '#797979'}]}>
              {selectedGender}
            </Text> */}
            <Image
              source={require('../../assets/icons/ic_chevronRight.png')}
              style={styles.arrow}
            />
          </TouchableOpacity>

          <View
            style={{
              width: '100%',
              alignSelf: 'center',
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: '#fff',
              paddingHorizontal: 16,
              marginVertical: 5,
              zIndex: 1,
              marginTop: 50,
              borderBottomRightRadius: 0,
              borderBottomLeftRadius: 0,
            }}>
            <TouchableOpacity
              style={[
                styles.cards,
                {
                  width: '100%',
                  height: null,
                  paddingHorizontal: 0,
                  paddingVertical: 7,
                },
              ]}>
              <Icon icon={ic_birthdate} size={24} />
              <Text style={[styles.btnLabel, {width: 'auto', paddingLeft: 14}]}>
                Birthday
              </Text>

              <TouchableOpacity
                onPress={() => setShowDatePicker(!showDatePicker)}
                style={{
                  backgroundColor: 'rgba(118, 118, 128, 0.12)',
                  borderRadius: 8,
                  position: 'absolute',
                  right: 0,
                }}>
                <Text style={[styles.btnLabel, {padding: 6}]}>
                  {moment(birthdate).format('MMMM D YYYY')}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
            {showDatePicker && (
              <View style={[styles.cards, {width: '100%', height: null}]}>
                <DateTimePicker
                  onChange={onChange}
                  style={{width: '100%'}}
                  value={birthdate}
                  mode={'date'}
                  display={'inline'}
                  themeVariant="light"
                />
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.cards,
              {
                width: '100%',
                marginTop: -4,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                paddingHorizontal: 16,
                paddingVertical: 11,
                marginBottom: 0,
              },
            ]}>
            <Icon icon={ic_date} size={24} tintColor={colors.primary} />
            <Text style={[styles.btnLabel, {width: 'auto', paddingLeft: 14}]}>
              Show the year of birth
            </Text>

            <Switch
              style={{
                transform: [{scaleX: 0.9}, {scaleY: 0.9}],
                alignSelf: 'center',
                position: 'absolute',
                right: 12,
              }}
              trackColor={{false: '#767577', true: colors.primary}}
              thumbColor={colors.white}
              ios_backgroundColor="#a9a8ab"
              onValueChange={() => setShowPublic(!showPublic)}
              value={showPublic}
            />
          </TouchableOpacity>

          <Text
            style={{
              color: 'rgba(0, 0, 0, 0.5)',
              textAlign: 'left',
              alignSelf: 'center',
              width: '100%',
              marginBottom: 10,
              marginTop: 12,
              paddingHorizontal: 17,
            }}>
            If enabled, the year of birth will be public on your GiftProfile.
          </Text>
        </ScrollView>
      </Modal>
    );
  };

  const renderWishlistUpdateModal = () => {
    return (
      <Modal
        isVisible={showWishlistUpdateModal}
        style={{margin: 0}}
        onBackdropPress={() => setShowWishlistUpdateModal(false)}>
        <View style={styles.wishlistmodalContainer}>
          <TouchableOpacity
            onPress={() => setShowWishlistUpdateModal(false)}
            style={{
              position: 'absolute',
              bottom: 430,
              alignSelf: 'center',
              width: 50,
              height: 34,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              borderRadius: 17,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <MaterialCommunityIcons
              name="window-close"
              color={'#fff'}
              size={24}
              style={{
                width: 24,
                height: 24,
                textAlignVertical: 'center',
                borderRadius: 12,
                textAlign: 'center',
                overflow: 'hidden',
              }}
            />
          </TouchableOpacity>
          <View
            style={{
              width: '100%',
              alignSelf: 'center',
              backgroundColor: '#fff',
              position: 'absolute',
              bottom: 220,
              zIndex: 1,
              borderRadius: 8,
            }}>
            <View style={[styles.slide, {marginVertical: 0}]}>
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
                      uri: selectedWishlistItem?.image_url,
                    }}
                    resizeMode="cover"
                    style={{width: '100%', height: '100%'}}
                  />
                </View>
                <View
                  style={{width: '60%', backgroundColor: '#fff', padding: 15}}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: '#848484',
                      fontSize: 14,
                      fontWeight: 'normal',
                      paddingVertical: 6,
                    }}>
                    {selectedWishlistItem?.brand}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{color: '#000', fontSize: 16, fontWeight: '600'}}>
                    {selectedWishlistItem?.product_name}
                  </Text>
                  <Text
                    style={{
                      color: '#000',
                      fontSize: 18,
                      fontWeight: 'normal',
                      marginVertical: 15,
                    }}>
                    $ {selectedWishlistItem?.price}
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
                        Linking.openURL(selectedWishlistItem?.link);
                        // setCurrentProductLink(item?.link);
                        // setShowWebpage(true);
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
          </View>

          <View style={styles.confirmationModalContainer}>
            {renderProfileOptions(
              'Edit ',
              require('../../assets/icons/ic_pick_edit.png'),
            )}
            {renderProfileOptions(
              'Share ',
              require('../../assets/icons/ic_share_gray.png'),
            )}
            {renderProfileOptions(
              'Delete from wishlist',
              require('../../assets/icons/ic_delete.png'),
            )}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SafeAreaView style={{backgroundColor: colors.white}} />

      <StatusBar barStyle="dark-content" />
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
      {renderSwitchModal()}
      {renderAddPreferences()}
      {renderEditModal()}
      {renderWishlistUpdateModal()}
      <Modal
        isVisible={showShareModal}
        style={{margin: 0}}
        onBackdropPress={() => setShowShareModal(false)}>
        <View style={styles.modalContainer}>
          <FastImage
            testID="logo-image"
            source={
              activeUsers[0]?.profile_image
                ? {uri: activeUsers[0]?.profile_image}
                : require('../../assets/images/user_placeholder.png')
            }
            style={styles.shareProfileImage}
          />
          <Text style={styles.shareUsername}>{activeUsers[0]?.full_name}</Text>

          <View style={{alignSelf: 'center', marginBottom: 35}}>
            <QRCode
              getRef={c => (qrCodeRef.current = c)}
              value={`gimmegift.com/${activeUsers[0]?.user_id}`}
              color={colors.primary}
              size={156}
            />
          </View>

          <TextInput
            placeholderTextColor={'#737273'}
            editable={false}
            style={styles.shareUserLink}
            placeholder={`gimmegift.com/${activeUsers[0]?.user_id}`}
          />

          <View style={styles.shareOptionContainer}>
            <TouchableOpacity
              onPress={() => {
                Clipboard.setString(`gimmegift.com/${activeUsers[0]?.user_id}`);
                alert('Link Copied');
              }}
              style={[
                styles.categoryCard,
                {backgroundColor: 'rgba(0, 0, 0, 0.05)', height: 60},
              ]}>
              <Icon icon={ic_copy} size={24} />
              <Text style={styles.categoryLabel}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => saveQR()}
              style={[
                styles.categoryCard,
                {backgroundColor: 'rgba(0, 0, 0, 0.05)', height: 60},
              ]}>
              <Icon icon={ic_download} size={24} />
              <Text style={styles.categoryLabel}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.categoryCard,
                {backgroundColor: 'rgba(0, 0, 0, 0.05)', height: 60},
              ]}
              onPress={() => shareUser()}>
              <Icon icon={ic_instagram} size={24} />
              <Text style={styles.categoryLabel}>Post</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.categoryCard,
                {backgroundColor: 'rgba(0, 0, 0, 0.05)', height: 60},
              ]}
              onPress={() => shareUser()}>
              <Icon icon={ic_share_modal} size={24} />
              <Text style={styles.categoryLabel}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.headerContainer}>
        <Feather
          onPress={() => navigation.navigate('settings')}
          name="settings"
          color={colors.primary}
          size={26}
          style={styles.headerIcons}
        />
        <MaterialCommunityIcons
          onPress={() => setShowProfileOptions(true)}
          name="dots-horizontal-circle-outline"
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
        style={[styles.image, {marginTop: -45}]}
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
        <Text style={styles.countsLabel}>
          <Text style={styles.countNumber}>{counters?.giftsSent || 0}</Text>{' '}
          sent gifts
        </Text>
        <Text style={styles.countsLabel}>
          <Text style={styles.countNumber}>{counters?.giftsReceived || 0}</Text>{' '}
          received gifts
        </Text>
        <Text style={styles.countsLabel}>
          <Text style={styles.countNumber}>{counters?.preferences || 0}</Text>{' '}
          preferences
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignSelf: 'center',
          alignContent: 'center',
          justifyContent: 'center',
          marginTop: 15,
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
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
          justifyContent: 'center',
          width: '100%',
          marginTop: 20,
        }}>
        <TouchableOpacity
          style={styles.categoryCard}
          onPress={() => navigation.navigate('VirtualGiftList')}>
          <Icon icon={ic_birthday_profile} size={24} />
          <Text style={styles.categoryLabel}>Virtual Gifts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.categoryCard}
          onPress={() => navigation.navigate('quiz')}>
          <Icon icon={ic_quiz_profile} size={24} />
          <Text style={styles.categoryLabel}>Quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.categoryCard}
          onPress={() => navigation.navigate('gimmepick')}>
          <Icon icon={ic_pick_profile} size={24} />
          <Text style={styles.categoryLabel}>GimmePick</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.categoryCard}
          onPress={() => setShowShareModal(true)}>
          <Icon icon={ic_share_profile} size={24} />
          <Text style={styles.categoryLabel}>Share</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: 'row',
          width: '95%',
          justifyContent: 'space-between',
          marginTop: 30,
          marginBottom: 30,
        }}>
        {renderToggle('GiftFunds')}
        {renderToggle('Wishlist')}
        {renderToggle('Highlighted')}

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

      {/* Profile Options */}
      <Modal
        isVisible={showProfileOptions}
        style={{margin: 0, backgroundColor: 'rgba(0, 0, 0, 0.01)'}}
        onBackdropPress={() => setShowProfileOptions(false)}>
        <View style={styles.confirmationModalContainer}>
          {renderProfileOptions(
            'Edit',
            require('../../assets/icons/ic_pick_edit.png'),
          )}
          {renderProfileOptions(
            'Virtual Gifts',
            require('../../assets/icons/ic_vgifts.png'),
          )}
          {renderProfileOptions(
            'Preferences manager',
            require('../../assets/icons/ic_pick_preference.png'),
          )}
          {renderProfileOptions(
            'Items manager',
            require('../../assets/icons/ic_pick_manageadded.png'),
          )}
          {renderProfileOptions(
            'Public view',
            require('../../assets/icons/ic_eye.png'),
          )}
          {renderProfileOptions(
            'Switch GiftProfile',
            require('../../assets/icons/ic_payment_transfer.png'),
          )}
          {renderProfileOptions(
            'Share',
            require('../../assets/icons/ic_share_gray.png'),
          )}
        </View>
      </Modal>
      <Modal
        isVisible={showWishlistModal}
        style={{margin: 0}}
        onBackdropPress={() => setShowWishlistModal(false)}>
        <ScrollView
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
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
            }}>
            <Icon icon={ic_link} size={24} />
            <Text style={styles.wishlistModalLabel}>Add a link</Text>
          </View>

          <TextInput
            placeholderTextColor={'#737273'}
            style={{
              backgroundColor: '#eeeeee',
              padding: 12,
              borderRadius: 5,
              margin: 5,
            }}
            placeholder={'Paste the product link here'}
            onChangeText={handleLinkChange}
          />

          {productLink && (
            <>
              <LinkPreview
                renderDescription={text => (
                  <Text
                    ellipsizeMode="tail"
                    style={{color: '#000', fontWeight: '400'}}
                    numberOfLines={2}>
                    {text}
                  </Text>
                )}
                renderText={text => (
                  <Text
                    ellipsizeMode="tail"
                    style={{color: '#000', fontWeight: '700'}}
                    numberOfLines={1}>
                    {text}
                  </Text>
                )}
                renderImage={PreviewDataImage => {
                  return (
                    <Image
                      source={
                        PreviewDataImage ||
                        require('../../assets/images/placeholder-image.jpg')
                      }
                      style={{
                        height: 120,
                        width: '95%',
                        alignSelf: 'center',
                        borderRadius: 8,
                        marginBottom: 5,
                      }}
                    />
                  );
                }}
                containerStyle={{
                  width: '100%',
                  maxHeight: 250,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                }}
                enableAnimation
                text={productLink}
              />
              <Button
                bg="#4b494d"
                width={'100%'}
                height={44}
                onPress={() => handleProductLink()}
                label="Add in wishlist"
              />
            </>
          )}

          <View
            style={{
              width: '100%',
              borderBottomColor: '#d6d6d6',
              borderBottomWidth: 0.8,
              paddingVertical: 5,
            }}
          />
          <TouchableOpacity
            onPress={() => handleNewWishlist()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
            }}>
            <Icon icon={ic_new_product} size={24} />
            <Text style={styles.wishlistModalLabel}>
              Add a product manually
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      {/* Wishlist Modal */}
      <Modal
        isVisible={showNewWishlistModal}
        style={{margin: 0}}
        onBackButtonPress={() => setShowNewWishlistModal(false)}
        onBackdropPress={() => setShowNewWishlistModal(false)}>
        <ScrollView
          style={{
            height: '90%',
            width: '100%',
            backgroundColor: '#efeff4',
            position: 'absolute',
            alignSelf: 'center',
            borderRadius: 12,
            bottom: 0,
            overflow: 'hidden',
            paddingHorizontal: 20,
          }}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text
              onPress={() => setShowNewWishlistModal(false)}
              style={styles.modalBtnLabel}>
              Cancel
            </Text>
            <Text style={styles.modalBtnTitle}>New item</Text>

            {isLoading ? (
              <ActivityIndicator
                size={'small'}
                color={'#000'}
                style={{marginTop: 25}}
              />
            ) : isEditing ? (
              <Text
                onPress={() => updateWishlistItem()}
                style={styles.modalBtnLabel}>
                Update
              </Text>
            ) : (
              <Text
                onPress={() => createWishlistItem()}
                style={styles.modalBtnLabel}>
                Add
              </Text>
            )}
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 20,
              alignItems: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                width: scaledSize(140),
                backgroundColor: '#fff',
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
                borderRadius: 12,
                height: scaledSize(194),
              }}>
              <Image
                resizeMode="cover"
                style={{
                  height: wishlistPicture ? '99%' : 44,
                  width: wishlistPicture ? '99%' : 44,
                  borderRadius: 10,
                }}
                source={
                  wishlistPicture
                    ? {uri: wishlistPicture}
                    : require('../../assets/icons/ic_image_placeholder.png')
                }
              />
            </View>
            <View
              style={{
                justifyContent: 'center',
                alignContent: 'center',
                borderRadius: 12,
                height: 150,
                paddingHorizontal: 25,
              }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '600',
                  letterSpacing: 0,
                  color: '#000',
                }}>
                Picture
              </Text>
              <Text
                style={{
                  fontFamily: 'SFPro',
                  fontSize: 16,
                  fontWeight: 'normal',
                  fontStyle: 'normal',
                  lineHeight: 18,
                  letterSpacing: 0,
                  color: 'rgba(0, 0, 0, 0.5)',
                  paddingTop: 8,
                }}>
                Add a photo of the product
              </Text>
              <TouchableOpacity
                onPress={() => selectImage('Wishlist')}
                style={[
                  styles.btnContainer,
                  {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    width: scaledSize(158),
                    height: scaledSize(34),
                    borderRadius: 45,
                    alignSelf: 'flex-start',
                    marginTop: scaledSize(18),
                  },
                ]}>
                <Text style={styles.btnLabel}>Upload a picture</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.inputLabel}>Title</Text>
          <Input
            placeholder="“Sunglasses”"
            maxLength={40}
            defaultValue={wishlistTitle}
            customContainerStyle={{width: '100%'}}
            onChangeText={(value: string) => setWishlistTitle(value)}
          />
          <Text
            style={{
              alignSelf: 'flex-end',
              fontFamily: 'SFPro',
              fontSize: 13,
              fontWeight: 'normal',
              fontStyle: 'normal',
              lineHeight: 18,
              letterSpacing: 0,
              padding: 6,
              textAlign: 'right',
              color: 'rgba(0, 0, 0, 0.5)',
            }}>
            {wishlistTitle.length}/40
          </Text>

          <Text style={styles.inputLabel}>Brand or store name</Text>
          <Input
            placeholder="Type the brand or store name"
            defaultValue={wishlistBrand}
            customContainerStyle={{width: '100%'}}
            onChangeText={(value: string) => setWishlistBrand(value)}
          />

          <Text style={styles.inputLabel}>Link</Text>
          <Input
            numberOfLines={5}
            multiLine={true}
            defaultValue={wishlistLink}
            customContainerStyle={{width: '100%'}}
            placeholder="Paste the product link here"
            onChangeText={(value: string) => setWishlistLink(value)}
          />

          <Text style={styles.inputLabel}>Price</Text>
          <Input
            defaultValue={wishlistPrice}
            customContainerStyle={{width: '100%'}}
            leftIcon={
              <Text
                style={{
                  color: colors.black,
                  paddingVertical: 5,
                  fontSize: 20,
                  textAlign: 'center',
                }}>
                $
              </Text>
            }
            onChangeText={(value: string) => setWishlistPrice(value)}
          />
        </ScrollView>
      </Modal>

      {/* Wishlist Modal */}
      {activeToggle === 'GiftFunds' && (
        <>
          <Modal
            style={{margin: 0}}
            isVisible={showFirstAccessModal}
            onBackButtonPress={() => setShowFirstAccessModal(false)}
            onBackdropPress={() => setShowFirstAccessModal(false)}>
            <View
              style={{
                height: '90%',
                width: '100%',
                backgroundColor: '#fff',
                borderRadius: 12,
                bottom: 0,
                overflow: 'hidden',
                paddingHorizontal: 20,
                position: 'absolute',
                alignSelf: 'center',
              }}>
              <Image
                style={{
                  marginTop: '10%',
                  height: 72,
                  width: 72,
                }}
                source={require('../../assets/images/gift_fund.png')}
              />

              <Text
                style={{
                  fontSize: 25,
                  fontWeight: '600',
                  lineHeight: 27,
                  letterSpacing: 0,
                  color: '#000000',
                  marginTop: 25,
                }}>
                GiftFund
              </Text>
              <Text
                style={{
                  color: '#000',
                  fontSize: 16,
                  fontWeight: 'normal',
                  lineHeight: 18,
                  paddingVertical: 5,
                }}>
                Raise money for something you truly desire.
              </Text>

              <FlatList
                data={giftFunds}
                style={{maxHeight: 220, marginTop: 10}}
                renderItem={renderItem}
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                horizontal
                pagingEnabled
                onScroll={event => {
                  const contentOffsetX = event.nativeEvent.contentOffset.x;
                  const index = Math.round(
                    contentOffsetX / Dimensions.get('window').width,
                  );
                  setActiveIndex(index);
                }}
              />
              <View
                style={{
                  justifyContent: 'center',
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginVertical: 10,
                  top: 6,
                  left: 0,
                  right: 0,
                  zIndex: 1,
                }}>
                {giftFunds.map((_, index) => renderIndicator(index))}
              </View>

              <Text
                style={{
                  color: '#000',
                  fontSize: 16,
                  lineHeight: 18,
                  textAlign: 'center',
                  fontWeight: 'normal',
                  paddingVertical: 10,
                }}>
                {giftFunds[activeIndex].text}
              </Text>

              <TouchableOpacity
                onPress={() => setIsChecked(!isChecked)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Entypo
                  name="check"
                  color={'#fff'}
                  size={18}
                  style={{
                    width: 24,
                    height: 24,
                    borderWidth: 0.5,
                    borderColor: '#000',
                    textAlignVertical: 'center',
                    borderRadius: 12,
                    textAlign: 'center',
                    backgroundColor: isChecked ? colors.primary : '#fff',
                    overflow: 'hidden',
                  }}
                />
                <Text style={{marginLeft: 8, color: '#000'}}>
                  Don't show it again next time.
                </Text>
              </TouchableOpacity>

              <Button
                label="Continue"
                width={'100%'}
                onPress={() => {
                  handleGiftFundBtn();
                }}
              />

              <Text
                style={{
                  color: '#a3a3a3',
                  textAlign: 'center',
                  width: '100%',
                  marginBottom: 10,
                }}>
                By continuing you accept our{' '}
                <Text
                  onPress={() => Linking.openURL(termsLink)}
                  style={{
                    color: colors.primary,
                    textAlign: 'center',
                    width: '100%',
                  }}>
                  Conditions.
                </Text>
              </Text>
            </View>
          </Modal>

          <Modal
            isVisible={showGiftFundModal}
            style={{margin: 0}}
            onBackButtonPress={() => setShowFirstAccessModal(false)}
            onBackdropPress={() => setShowFirstAccessModal(false)}>
            <ScrollView
              automaticallyAdjustKeyboardInsets={true}
              style={{
                height: '90%',
                width: '100%',
                backgroundColor: '#efeff4',
                position: 'absolute',
                alignSelf: 'center',
                borderRadius: 12,
                bottom: 0,
                overflow: 'hidden',
                paddingHorizontal: 20,
              }}>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text
                  onPress={() => setShowGiftFundModal(false)}
                  style={styles.modalBtnLabel}>
                  Cancel
                </Text>
                <Text style={styles.modalBtnTitle}>GiftFund</Text>
                {isLoading ? (
                  <ActivityIndicator
                    color={colors.primary}
                    style={{marginTop: 25}}
                  />
                ) : (
                  <Text
                    onPress={() => createGiftFund()}
                    style={[styles.modalBtnLabel, {fontWeight: '600'}]}>
                    Publish
                  </Text>
                )}
              </View>
              <View style={{flexDirection: 'row', marginTop: 20}}>
                <View
                  style={{
                    flexDirection: 'row',
                    width: '40%',
                    backgroundColor: '#fff',
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                    borderRadius: 12,
                    height: 195,
                  }}>
                  <Image
                    style={{
                      height: selectedImage ? '99%' : 44,
                      width: selectedImage ? '99%' : 44,
                      borderRadius: 10,
                    }}
                    source={
                      selectedImage
                        ? {uri: selectedImage}
                        : require('../../assets/icons/ic_image_placeholder.png')
                    }
                  />
                </View>
                <View
                  style={{
                    width: '65%',
                    justifyContent: 'center',
                    alignContent: 'center',
                    borderRadius: 12,
                    height: 195,
                    paddingHorizontal: 25,
                  }}>
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: '600',
                      letterSpacing: 0,
                      color: '#000',
                    }}>
                    Cover
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '400',
                      color: '#7F7E7F',
                      paddingVertical: 8,
                    }}>
                    Add a photo describing this GiftFund
                  </Text>
                  <TouchableOpacity
                    onPress={() => selectImage('GiftFund')}
                    style={[
                      styles.btnContainer,
                      {
                        width: 158,
                        borderRadius: 45,
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        marginVertical: 15,
                        alignSelf: 'flex-start',
                      },
                    ]}>
                    <Text style={styles.btnLabel}>Upload a picture</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={[styles.inputLabel, {paddingTop: 5}]}>Title</Text>
              <View style={{width: '110%', alignSelf: 'center'}}>
                <Input
                  placeholder="“Annual aqua aerobics subscription”"
                  onChangeText={(value: string) => setGiftFundTitle(value)}
                  numberOfLines={1}
                  maxLength={40}
                />
              </View>
              <Text
                style={{
                  alignSelf: 'flex-end',
                  fontFamily: 'SFPro',
                  fontSize: 13,
                  fontWeight: 'normal',
                  fontStyle: 'normal',
                  lineHeight: 18,
                  letterSpacing: 0,
                  padding: 6,
                  textAlign: 'right',
                  color: 'rgba(0, 0, 0, 0.5)',
                }}>
                {giftFundTitle.length}/40
              </Text>

              <Text style={styles.inputLabel}>Description</Text>
              {/* <Input
                numberOfLines={5}
                multiLine={true}
                placeholder="“Your contribution, big or small, will make a significant impact.”"
                onChangeText={(value: string) => setGiftFundDescription(value)}
              /> */}

              <TextInput
                multiline={true}
                numberOfLines={5}
                placeholder="“Your contribution, big or small, will make a significant impact.”"
                placeholderTextColor={'#747474'}
                onChangeText={(value: string) => setGiftFundDescription(value)}
                onFocus={() => {
                  setIsDescriptionFocused(true);
                }}
                onBlur={() => {
                  setIsDescriptionFocused(false);
                }}
                style={{
                  width: '100%',
                  alignSelf: 'center',
                  borderRadius: 8,
                  fontSize: 18,
                  height: 120,
                  textAlignVertical: 'top',
                  backgroundColor: '#fff',
                  padding: 15,
                  paddingTop: 15,
                  borderColor: isDescriptionFocused
                    ? colors.primary
                    : '#DBD6D7',
                  borderWidth: 1,
                }}
              />

              <Text style={styles.inputLabel}>Goal</Text>
              <TouchableOpacity
                onPress={() => setShowCustomAmountModal(true)}
                style={{
                  height: 50,
                  flexDirection: 'row',
                  paddingHorizontal: 12,
                  width: '100%',
                  alignSelf: 'center',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  borderColor: '#DBD6D7',
                  borderWidth: 1,
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    color: colors.black,
                    fontSize: 22,
                  }}>
                  $
                </Text>
                <Text
                  style={{
                    color: colors.black,
                    fontSize: 17,
                  }}>
                  {giftFundGoal}
                </Text>
              </TouchableOpacity>

              {/* <Input
                leftIcon={
                  <Text
                    style={{
                      color: colors.black,
                      paddingVertical: 5,
                      fontSize: 20,
                      textAlign: 'center',
                    }}>
                    $
                  </Text>
                }
                keyboardType="number-pad"
                onChangeText={(value: string) => setGiftFundGoal(value)}
              /> */}

              {/* Custom Amount Modal */}
              <RNModal
                transparent={true}
                visible={showCustomAmountModal}
                onRequestClose={() => setShowCustomAmountModal(false)}>
                <TouchableWithoutFeedback
                  onPress={() => setShowCustomAmountModal(false)}>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                    }}>
                    <KeyboardAvoidingView
                      behavior={Platform.OS === 'ios' ? 'padding' : 'position'}>
                      <View
                        style={{
                          // position: 'absolute',
                          // left: 0,
                          // right: 0,
                          // bottom: 0,
                          width: Dimensions.get('screen').width,

                          borderTopLeftRadius: 12,
                          borderTopRightRadius: 12,
                          backgroundColor: '#efeff4',
                          paddingHorizontal: 25,
                          paddingVertical: 25,
                        }}>
                        <Text
                          style={{
                            fontFamily: 'SFPro',
                            fontSize: 18,
                            fontWeight: '500',
                            fontStyle: 'normal',
                            lineHeight: 18,
                            letterSpacing: 0,
                            color: '#000000',
                            textAlign: 'center',
                          }}>
                          Goal
                        </Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Text
                            style={{
                              fontSize: 36,
                              fontFamily: 'Inter-Regular',
                              fontWeight: '500',
                            }}>
                            $
                          </Text>
                          <TextInput
                            maxLength={5}
                            placeholder="0"
                            keyboardType="number-pad"
                            onChangeText={text => {
                              if (text === '') {
                                setGiftFundGoal('0');
                              } else {
                                setGiftFundGoal(text);
                              }
                            }}
                            defaultValue={giftFundGoal}
                            style={{
                              fontSize: 36,
                              fontFamily: 'Inter-Regular',
                              textAlign: 'center',
                              fontWeight: '500',
                              marginVertical: 20,
                            }}
                          />
                        </View>

                        <TouchableOpacity
                          style={styles.giftButton}
                          onPress={() => {
                            setShowCustomAmountModal(false);
                          }}>
                          <Text
                            style={[styles.giftButtonText, {color: '#000'}]}>
                            Done
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </KeyboardAvoidingView>
                  </View>
                </TouchableWithoutFeedback>
              </RNModal>

              <Text
                style={{
                  color: '#a3a3a3',
                  textAlign: 'auto',
                  alignSelf: 'center',
                  width: '90%',
                  marginBottom: 10,
                  marginTop: 12,
                }}>
                Every donation is subject to a transaction fee. Read about{' '}
                <Text
                  style={{
                    color: colors.primary,
                    textAlign: 'center',
                    width: '100%',
                  }}>
                  Payments
                </Text>
              </Text>
            </ScrollView>
          </Modal>

          {renderGiftFundCard()}
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
            {wishlistDetails?.length} items added in public wishlist.
          </Text>

          <TouchableOpacity
            onPress={() => {
              setShowWishlistModal(true);
              setWishlistTitle('');
              setWishlistPicture('');
              setWishlistLink('');
              setWishlistPrice('');
            }}
            style={{
              flexDirection: 'row',
              alignSelf: 'center',
              alignContent: 'center',
              justifyContent: 'center',
              marginTop: 27,
              marginBottom: 30,
              backgroundColor: '#DFDFE5',
              borderRadius: 12,
              padding: 10,
              alignItems: 'center',
            }}>
            <AntDesign name="pluscircleo" color={'#000'} size={16} />
            <Text
              style={[styles.birthdayLabel, {fontSize: 14, fontWeight: '600'}]}>
              Add an item
            </Text>
          </TouchableOpacity>

          <FlatList
            data={wishlistCategories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id.toString()}
            renderItem={renderGifts}
            style={styles.endList}
          />

          <View
            style={{
              height: 0.5,
              width: '110%',
              backgroundColor: '#rgba(0, 0, 0, 0.15)',
            }}
          />

          <View
            style={{
              alignSelf: 'flex-start',
              marginVertical: 21,
            }}>
            <Text style={styles.giftFundLabel}>All items</Text>
          </View>

          <FlatList
            data={wishlistDetails}
            // keyExtractor={item => item.id.toString()}
            renderItem={renderWishlistItem}
          />
        </>
      )}

      {activeToggle === 'Highlighted' && (
        <>
          <Icon icon={ic_wishlist_profile} size={36} />
          <Text style={styles.wishlistLabel}>Highlighted preferences</Text>
          <Text style={[styles.wishlistSubLabel, {marginBottom: 28}]}>
            {highlightedPreferences?.length || 0} preferences highlighted in
            public.
          </Text>

          <FlatList
            data={highlightedPreferences}
            style={{marginBottom: 20}}
            renderItem={({item}) => {
              return (
                <View style={styles.questionCard}>
                  <View style={styles.questionSubCard}>
                    <Text style={styles.questionLabel}>{item?.question}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setCurrentQuestion(item);
                        setShowAddPrefsModal(true);
                      }}>
                      <Entypo
                        name="dots-three-horizontal"
                        size={25}
                        color={'#A9A9A9'}
                      />
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={{flexDirection: 'row'}} horizontal>
                    {item?.answers?.map((option: any) => {
                      return (
                        <View key={item.id} style={[styles.listItem]}>
                          {item?.type === 'image' ? (
                            <Image
                              source={{
                                uri: `${
                                  config.SUPABASE_URL
                                }/storage/v1/object/public${option?.trim()}`,
                              }}
                              style={{width: 50, height: 50}}
                            />
                          ) : (
                            <Text style={[styles.listLabel]}>{option}</Text>
                          )}
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
export default GiftProfile;
