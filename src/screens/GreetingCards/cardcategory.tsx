/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  FlatList,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import React from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';

import {useNavigation, useRoute} from '@react-navigation/native';
import colors from '../../theme/colors';
import Feather from 'react-native-vector-icons/Feather';
import {TouchableOpacity} from 'react-native';

export default function CardCategory() {
  const navigation = useNavigation();
  //get route params using useRoute
  const route = useRoute();
  const {type, data, recipient, occasion, occasionDate, reminderDate} =
    route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLView}>
          <AntDesign
            name="left"
            color={colors.primary}
            style={{paddingHorizontal: 15}}
            size={25}
            onPress={() => navigation.goBack()}
          />

          <Text style={styles.label}>{type}</Text>
        </View>
      </View>
      <View
        style={{backgroundColor: '#fff', width: '100%', paddingVertical: 20}}>
        <View style={styles.searchContainer}>
          <Feather name="search" color={'#717174'} size={18} />
          <TextInput
            placeholder="Search occasion, style, color…"
            style={styles.searchInput}
            placeholderTextColor={'#717174'}
          />
        </View>
      </View>

      <FlatList
        contentContainerStyle={{alignSelf: 'flex-start'}}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        data={data}
        style={{alignSelf: 'center'}}
        renderItem={({item}) => {
          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('newgreetingcard', {
                  recipient: recipient,
                  occasion: occasion,
                  occasionDate: occasionDate,
                  reminderDate: reminderDate,
                  cardURL: item.url,
                })
              }>
              <Image source={{uri: item.url}} style={styles.cardStyle} />
            </TouchableOpacity>
          );
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {},
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 0 : 15,
  },
  headerLView: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
  },

  label: {
    fontSize: 32,
    fontWeight: 'bold',
    fontStyle: 'normal',

    color: '#565459',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 22,
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  searchInput: {
    fontSize: 18,
    marginLeft: 5,
    paddingVertical: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginHorizontal: 4,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  filterLabel: {
    fontFamily: 'SFPro',
    fontSize: 15,
    fontWeight: 'normal',
    fontStyle: 'normal',
    color: '#000000',
  },

  containerGradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    height: 50,
    width: 200,
  },
  text: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  categoryLabel: {
    fontFamily: 'SFPro',
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    color: '#000000',
  },
  cardStyle: {
    width: Dimensions.get('window').width * 0.42,
    height: 200,
    marginHorizontal: 5,
    marginVertical: 8,
    borderRadius: 5,
  },
});
