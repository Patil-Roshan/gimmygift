/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Modal from 'react-native-modal';
import colors from '../theme/colors';

import Input from './Input';
import SelectionModal from './SelectionModal';
import {occasionsData, recipientSample} from '../referenceData';
import DateTimePicker from './DateTimePicker';
import RecipientSelection from './RecipientSelection';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FastImage from 'react-native-fast-image';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {supabase} from '../lib/supabase';
import Toast from 'react-native-toast-message';
import activeUserInstance from '../../store/activeUsersInstance';

interface TextMessageProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
  occasion?: string;
  onSubmit?: (item: any) => void;
}

const TextMessage: React.FC<TextMessageProps> = ({
  isOpen,
  onClose,
  type,
  occasion,
  onSubmit,
}) => {
  const navigation: NavigationProp<RootStackParamList> = useNavigation();
  const [showRecipientModal, setShowRecipientModal] = useState<boolean>(false);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(
    null,
  );

  const [showOccasionModal, setShowOccasionModal] = useState<boolean>(false);
  const [selectedOccasion, setSelectedOccasion] = useState<string | undefined>(
    occasion,
  );

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedDateTime, setSelectedDateTime] = useState<string | null>(null);

  const [message, setMessage] = useState<string | null>(null);

  const activeUsers = activeUserInstance((state: any) => state.activeUsers);

  const isButtonActive = () => {
    return !(
      selectedRecipient &&
      selectedOccasion &&
      selectedDateTime &&
      message
    );
  };

  const handleSubmit = async () => {
    if (type === 'scheduling') {
      const {data: createdMsg, error} = await supabase
        .schema('notification')
        .from('scheduled_messages')
        .insert([
          {
            message: message,
            sendee_user_id: selectedRecipient?.id,
            scheduled_at: selectedDateTime,
            created_by_user_id: activeUsers[0].user_id,
          },
        ])
        .select();

      console.log('createdMsg', createdMsg);
      console.log('error', error);

      if (!error && createdMsg) {
        onClose();
        navigation.navigate('messageconfirmation', {
          message: selectedRecipient?.name,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error scheduling message',
          position: 'bottom',
          text2: error?.message,
        });
      }
      return;
    }

    onSubmit?.({
      recipient: selectedRecipient,
      occasion: selectedOccasion,
      date: selectedDateTime,
      message: message,
    });

    onClose();
  };
  return (
    <Modal
      isVisible={isOpen}
      style={{margin: 0}}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}>
      <ScrollView style={styles.container}>
        {/* Occasion Selection Modal */}

        {/* Date Time Picker Modal */}
        <DateTimePicker
          isOpen={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onSelect={(item: string) => {
            setSelectedDateTime(item);
          }}
        />

        <View style={styles.headerContainer}>
          <Text onPress={onClose} style={styles.headerLabel}>
            Cancel
          </Text>
          <Text
            onPress={onClose}
            style={[styles.headerLabel, {color: colors.black}]}>
            Text Message
          </Text>
          <Text
            onPress={() => handleSubmit()}
            style={[
              styles.headerLabel,
              {color: isButtonActive() === true ? 'gray' : colors.primary},
            ]}
            disabled={isButtonActive()}>
            Done
          </Text>
        </View>

        <Text style={styles.inputLabel}>Recipient</Text>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            onPress={() => setShowRecipientModal(true)}
            style={styles.recipientBtn}>
            <AntDesign name="pluscircleo" color={colors.primary} size={25} />
          </TouchableOpacity>
          <FastImage
            style={{height: 50, width: 50, borderRadius: 25}}
            source={{uri: selectedRecipient?.image}}
          />
        </View>

        <Text style={styles.inputLabel}>Occasion</Text>
        <TouchableOpacity onPress={() => setShowOccasionModal(true)}>
          <Input
            editable={false}
            placeholder="Select an occasion"
            defaultValue={selectedOccasion}
            onPressIn={() => setShowOccasionModal(true)}
          />
        </TouchableOpacity>

        <Text style={styles.inputLabel}>Delivery date</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Input
            placeholder="Select a date and time"
            editable={false}
            defaultValue={selectedDateTime?.toString()}
            onPressIn={() => setShowDatePicker(true)}
          />
        </TouchableOpacity>

        <Text style={styles.inputLabel}>Message</Text>
        <Input
          numberOfLines={5}
          multiLine={true}
          placeholder="Message"
          defaultValue={message}
          onChangeText={(text: string) => setMessage(text)}
        />

        <Text style={styles.noteLabel}>
          You will receive an in-app notification on the day and time of the
          occasion, allowing you to copy and send the created message through
          the messaging apps you prefer.
        </Text>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '90%',
    width: '100%',
    backgroundColor: '#DEDDE4',
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 12,
    bottom: 0,
    overflow: 'hidden',
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 25,
  },
  headerLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
  },
  inputLabel: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginTop: 20,
    marginBottom: 10,
  },
  noteLabel: {
    width: '90%',
    textAlign: 'justify',
    alignSelf: 'center',
    fontSize: 13,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    color: 'rgba(0, 0, 0, 0.5)',
    marginVertical: 20,
  },
  recipientBtn: {
    backgroundColor: '#D3D4D9',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    marginRight: 15,
  },
});

export default TextMessage;
