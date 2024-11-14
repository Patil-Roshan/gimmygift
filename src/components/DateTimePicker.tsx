import React, {useState} from 'react';
import {Platform, ScrollView, StyleSheet, Text, View} from 'react-native';
import Modal from 'react-native-modal';
import colors from '../theme/colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-native-date-picker';
interface DateTimePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: string) => void;
}

const DateTimePickerModal: React.FC<DateTimePickerProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [selectedValue, setSelectedValue] = useState<any>(new Date());

  //create onChange function for date picker

  const onChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || selectedValue;

    setSelectedValue(currentDate);
    onSelect(currentDate);
  };

  return (
    <Modal isVisible={isOpen} onBackdropPress={onClose} style={{margin: 0}}>
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text onPress={onClose} style={styles.headerLabel}>
            Cancel
          </Text>
          <Text onPress={onClose} style={styles.headerLabel}>
            Confirm
          </Text>
        </View>

        <View style={styles.divider} />
        {Platform.OS === 'ios' ? (
          <DateTimePicker
            onChange={onChange}
            style={styles.calendarStyle}
            value={selectedValue}
            mode={'datetime'}
            display={'inline'}
          />
        ) : (
          <DatePicker
            date={selectedValue}
            mode="datetime"
            theme="auto"
            onDateChange={(date: any) => onChange(null, date)}
          />
        )}
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '60%',
    width: '100%',
    backgroundColor: '#DEDDE4',
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 12,
    bottom: 0,
    overflow: 'hidden',
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: 'black',
  },
  itemText: {
    fontSize: 16,
  },
  calendarStyle: {
    width: '100%',
    height: 500,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginTop: 15,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  headerLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default DateTimePickerModal;
