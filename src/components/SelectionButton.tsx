/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';

interface OptionBtnProps {
  label?: string;
  selected?: string;
  setSelected?: any;
}

const SelectionButton = ({label, selected, setSelected}: OptionBtnProps) => {
  return (
    <TouchableOpacity
      testID={label}
      style={[
        styles.btn,
        {backgroundColor: selected === label ? 'rgba(0, 0, 0, 0.5)' : '#fff'},
      ]}
      onPress={() => setSelected(label ?? '')}>
      <Text
        style={[styles.label, {color: selected === label ? '#fff' : '#000'}]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default SelectionButton;

export const styles = StyleSheet.create({
  btn: {
    width: '90%',
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  label: {
    color: '#000',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'normal',
  },
});
