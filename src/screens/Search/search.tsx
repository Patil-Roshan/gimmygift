/* eslint-disable react-native/no-inline-styles */
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {supabase} from '../../lib/supabase';
import Icon from '../../components/Icon';
import {
  chevronBack,
  close_grey,
  ic_chevronRight,
  ic_gimmepick_close,
  ic_gimmepick_reject,
  ic_logo,
} from '../../assets/icons/icons';
import scaledSize from '../../scaleSize';

export default function Search() {
  const navigation = useNavigation();

  const [search, setSearch] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const searchCall = async (query: string) => {
    setIsLoading(true);
    const {data: searchResponse, error} = await supabase.functions.invoke(
      'search-profiles',
      {
        body: {
          requestorId: '',
          queryString: query,
        },
      },
    );

    if (!error && searchResponse.userIds) {
      const userIds = searchResponse.userIds;
      if (userIds.length > 0) {
        fetchUserDetails(userIds);
      }
    } else {
      setIsLoading(false);
    }
  };

  const fetchUserDetails = async (userIds: string[]) => {
    const {data: users, error} = await supabase
      .from('profiles')
      .select('*')
      .in('user_id', userIds);

    if (!error && users) {
      const userImages = await Promise.all(
        users.map(async user => {
          const imagePath = `${user.user_id}/${user.user_id}.png`;
          const imageUrl = await supabase.storage
            .from('profiles')
            .createSignedUrl(imagePath, 86400);

          return {...user, profile_image: imageUrl?.data?.signedUrl};
        }),
      );
      setSearch(userImages);
    } else {
      return [];
    }
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{backgroundColor: 'rgba(249, 249, 249, 0.8)'}} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: scaledSize(7),
          backgroundColor: 'rgba(249, 249, 249, 0.8)',
          width: '100%',
          borderBottomColor: 'rgba(0, 0, 0, 0.1)',
          borderBottomWidth: 1,
        }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: scaledSize(52),
            alignSelf: 'center',
            paddingHorizontal: scaledSize(13),
          }}>
          <Icon icon={chevronBack} size={26} />
        </TouchableOpacity>
        <TextInput
          placeholder="Search a Giftprofile"
          placeholderTextColor={'rgba(0, 0, 0, 0.5)'}
          value={searchInput}
          onChangeText={text => {
            setSearchInput(text);
            searchCall(text);
          }}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            height: Platform.OS === 'ios' ? 42 : 50,
            color: 'black',
            width: '84%',
            borderRadius: 22,
            fontSize: 18,
            padding: 15,
          }}
        />
        {searchInput?.length > 0 ? (
          <TouchableOpacity
            style={{position: 'absolute', right: 28}}
            onPress={() => {
              setSearchInput('');
              setSearch([]);
            }}>
            {isLoading ? (
              <ActivityIndicator />
            ) : (
              <Icon icon={close_grey} size={26} />
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      {searchInput.length > 0 ? (
        <>
          <View
            style={{
              height: 60,
              justifyContent: 'center',
              backgroundColor: '#rgba(249, 249, 249, 0.8)',
            }}>
            <Text
              style={{
                fontFamily: 'SFPro',
                fontSize: scaledSize(18),
                fontWeight: '500',
                fontStyle: 'normal',
                textAlignVertical: 'center',
                letterSpacing: 0,
                color: '#000000',
                paddingVertical: scaledSize(9),
                paddingHorizontal: scaledSize(16),
              }}>
              Results{' '}
            </Text>
          </View>
          <FlatList
            data={search}
            renderItem={({item}: {item: any}) => {
              return (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('recipientgiftprofile', {profile: item})
                  }
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: scaledSize(9),
                    paddingHorizontal: scaledSize(16),
                    backgroundColor: 'rgba(249, 249, 249, 0.8)',
                  }}>
                  <FastImage
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 50,
                      borderWidth: 1,
                    }}
                    source={{uri: item.profile_image}}
                  />
                  <Text
                    style={{
                      fontSize: 18,
                      marginLeft: 10,
                      color: '#000000',
                      paddingEnd: 7.5,
                    }}>
                    {item.full_name}
                  </Text>
                  <Icon icon={ic_logo} size={18} />
                  <View style={{position: 'absolute', right: 11}}>
                    <Icon icon={ic_chevronRight} size={22} />
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </>
      ) : (
        <FastImage
          resizeMode="contain"
          style={{
            width: '90%',
            height: 220,
            alignSelf: 'center',
            marginTop: 107,
          }}
          source={require('../../assets/images/searchvector.png')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efeff4',
  },
});
