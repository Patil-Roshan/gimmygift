/* eslint-disable react-native/no-inline-styles */
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import colors from '../../../theme/colors';
import Icon from '../../../components/Icon';

import {ic_back} from '../../../assets/icons/icons';
import DropdownComponent from './DropdownComponent';
import {supabase} from '../../../lib/supabase';
import activeUserInstance from '../../../../store/activeUsersInstance';
import Button from '../../../components/Button';
import {useNavigation} from '@react-navigation/native';
import Input from '../../../components/Input';
import Toast from 'react-native-toast-message';

const country = [
  {label: 'United States', value: '1'},
  {label: 'India', value: '2'},
];

const Address = () => {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [add, setAdd] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [add2, setAdd2] = useState('');
  const [notes, setNotes] = useState('');
  const activeUsers = activeUserInstance((state: any) => state.activeUsers);
  const [occasionReminder, setOccasionReminder] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchAddress();
  }, []);

  const fetchAddress = async () => {
    const session = await supabase.auth.getUser();
    const {data, error} = await supabase
      .from('profile_address')
      .select('profile_address')
      .eq('user_profile_id', activeUsers[0].user_id);
    if (!error && data) {
      console.log('data', JSON.stringify(data[0].profile_address));
      setName(data[0].profile_address?.name);
      setAdd(data[0].profile_address?.address);
      setCity(data[0].profile_address?.city);
      setZipCode(data[0].profile_address?.zip_code);
      setNotes(data[0].profile_address?.notes);
      setState(data[0].profile_address?.state);
      setNumber(session.data.user.phone);
    }
  };

  const updateAddress = async () => {
    try {
      const {data: upsertedData, error} = await supabase
        .from('profile_address')
        .upsert(
          {
            user_profile_id: activeUsers[0].user_id,
            profile_address: {
              name: name,
              number: number,
              address: add,
              add2: add2,
              city: city,
              state: state,
              zip_code: zipCode,
              notes: notes,
            },
          },
          {onConflict: ['user_profile_id']},
        );

      if (error) {
        console.error('Error upserting data:', error);
      } else {
        Toast.show({
          type: 'success',
          text1: 'Address updated successfully',
          position: 'bottom',
        });
        console.log('Upserted data:', upsertedData);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={{backgroundColor: '#fff'}}>
      <StatusBar backgroundColor={colors.white} barStyle={'dark-content'} />
      <SafeAreaView style={{backgroundColor: colors.white}} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerIcon}>
          <Icon icon={ic_back} size={30} tintColor={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Delivery address</Text>
      </View>
      <Text style={styles.title}>What is your delivery address?</Text>
      <Text style={styles.subTitle}>
        Indicate where you would like to receive your gifts.
      </Text>

      <View style={styles.form}>
        <View style={styles.country}>
          {/* <DropdownComponent
            data={country}
            placeholder="Select country"
            searchPlaceholder="Find country..."
            fontSize={18}
            textColor={colors.black}
          /> */}
        </View>
        <View style={{paddingVertical: 14}}>
          <Input
            placeholder="Name"
            defaultValue={name}
            onChangeText={(value: string) => setName(value)}
          />
        </View>
        <Input
          placeholder="Phone"
          editable={false}
          defaultValue={number}
          onChangeText={(value: string) => setNumber(value)}
        />
        <View style={{paddingVertical: 14}}>
          <Input
            placeholder="Address"
            defaultValue={add}
            onChangeText={(value: string) => setAdd(value)}
          />
        </View>
        <Input
          placeholder="City"
          defaultValue={city}
          onChangeText={(value: string) => setCity(value)}
        />
        <View
          style={{
            flexDirection: 'row',
            alignSelf: 'center',
            paddingVertical: 14,
          }}>
          <View style={{width: '50%'}}>
            <Input
              placeholder="State"
              defaultValue={state}
              onChangeText={(value: string) => setState(value)}
            />
          </View>
          {/* <DropdownComponent
            data={country}
            width={'45%'}
            placeholder="Select state"
            searchPlaceholder="Find country..."
            fontSize={18}
            textColor={colors.black}
          /> */}
          <View style={{width: '45%', paddingLeft: 14}}>
            <Input
              placeholder="Zip Code"
              defaultValue={zipCode}
              onChangeText={(value: string) => setZipCode(value)}
            />
          </View>
        </View>
        <Input
          placeholder="Notes"
          defaultValue={notes}
          onChangeText={(value: string) => setNotes(value)}
        />
        <View style={styles.address}>
          <Text style={styles.addressText}>
            Allow my Recipients List to see my delivery address
          </Text>
          <Switch
            style={{
              transform: [{scaleX: 0.8}, {scaleY: 0.8}],
              alignSelf: 'center',
            }}
            trackColor={{false: '#767577', true: colors.primary}}
            thumbColor={colors.white}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setOccasionReminder(!occasionReminder)}
            value={occasionReminder}
          />
        </View>
        <Text
          style={[
            styles.addressText,
            {
              fontSize: 13,
              lineHeight: 18,
              marginTop: 10,
              paddingHorizontal: 15,
            },
          ]}>
          All contacts added to your Recipient List will be able to see your
          delivery address when purchasing a gift for you.
        </Text>
        <View style={styles.address}>
          <Text style={styles.addressText}>
            Allow everyone has my phone number to see my delivery address
          </Text>
          <Switch
            style={{
              transform: [{scaleX: 0.8}, {scaleY: 0.8}],
              alignSelf: 'center',
            }}
            trackColor={{false: '#767577', true: colors.primary}}
            thumbColor={colors.white}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setOccasionReminder(!occasionReminder)}
            value={occasionReminder}
          />
        </View>
        <Text
          style={[
            styles.addressText,
            {
              fontSize: 13,
              lineHeight: 18,
              marginTop: 10,
              paddingHorizontal: 15,
            },
          ]}>
          Everyone who has your phone number, will be able to see your delivery
          address when purchasing a gift for you.
        </Text>
        <View style={styles.address}>
          <Text style={styles.addressText}>
            Allow everyone to see my delivery address
          </Text>
          <Switch
            style={{
              transform: [{scaleX: 0.8}, {scaleY: 0.8}],
              alignSelf: 'center',
            }}
            trackColor={{false: '#767577', true: colors.primary}}
            thumbColor={colors.white}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setOccasionReminder(!occasionReminder)}
            value={occasionReminder}
          />
        </View>
        <Text
          style={[
            styles.addressText,
            {
              fontSize: 13,
              lineHeight: 18,
              marginTop: 10,
              paddingHorizontal: 15,
            },
          ]}>
          Everyone will be able to see your delivery address when purchasing a
          gift for you. We suggest using a P.O. Box or an office address.{'\n'}
        </Text>
        <Text
          style={{
            fontFamily: 'SFPro',
            fontSize: 13,
            fontWeight: '600',
            fontStyle: 'normal',
            lineHeight: 18,
            paddingHorizontal: 15,
            color: 'rgba(0, 0, 0, 0.7)',
            margin: 8,
            top: -20,
            left: 10,
          }}>
          ✨ Recommended for influencers.
        </Text>

        <View style={[styles.address, {marginTop: 5}]}>
          <Text style={styles.addressText}>
            Do not share my delivery address.
          </Text>
          <Switch
            style={{
              transform: [{scaleX: 0.8}, {scaleY: 0.8}],
              alignSelf: 'center',
            }}
            trackColor={{false: '#767577', true: colors.primary}}
            thumbColor={colors.white}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setOccasionReminder(!occasionReminder)}
            value={occasionReminder}
          />
        </View>
      </View>

      <Button label="Update" onPress={() => updateAddress()} />
    </ScrollView>
  );
};

export default Address;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 10,
    borderColor: colors.primary,
  },
  header: {
    backgroundColor: 'rgba(249, 249, 249, 0.8)',
    height: 60,
    width: '100%',
    flexDirection: 'row',

    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0.16,
    paddingHorizontal: 13,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: {
      width: 0,
      height: 0.5,
    },
    shadowRadius: 0,
    shadowOpacity: 1,
  },
  headerIcon: {
    position: 'absolute',
    left: 13,
  },
  headerText: {
    fontSize: 18,
    lineHeight: 22,
    color: colors.black,
    textAlign: 'center',
    alignSelf: 'center',
    fontWeight: '600',
  },
  title: {
    fontFamily: 'SFPro',
    fontSize: 23,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 28,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#000000',
    marginTop: 47,
  },
  subTitle: {
    fontFamily: 'SFPro',
    width: 320,
    alignSelf: 'center',
    fontSize: 18,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 22,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#000000',
  },
  form: {
    width: '110%',
    alignSelf: 'center',
    paddingHorizontal: 30,
  },
  country: {
    marginVertical: 40,
  },
  inputField: {
    color: colors.black,
    padding: Platform.OS === 'ios' ? 20 : 4,
    borderWidth: 0.5,
    fontSize: 18,
    lineHeight: 22,
    marginTop: 14,
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  address: {
    marginTop: 58,
    width: '90%',
    alignSelf: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F6575F1A',
    padding: 21,
    borderWidth: 0,
    borderRadius: 10,
    gap: 20,
  },
  addressText: {
    fontSize: 18,
    lineHeight: 22,
    color: colors.black,
    width: '90%',
    alignSelf: 'center',
  },
});
