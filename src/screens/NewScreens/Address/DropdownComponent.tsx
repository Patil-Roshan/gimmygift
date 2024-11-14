import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import colors from '../../../theme/colors'; // Ensure this imports the correct color definitions

// Define props interface for TypeScript users
interface DropdownProps {
  data: Array<{label: string; value: string}>; // Define the shape of your data items
  placeholder?: string;
  searchPlaceholder?: string;
  fontSize?: number;
  textColor?: string;
  iconSource?: string;
  width?: number;
}

const DropdownComponent: React.FC<DropdownProps> = ({
  data,
  placeholder = 'Select item',
  searchPlaceholder = 'Search...',
  fontSize = 16,
  textColor = 'black',
  width = '90%',
}) => {
  const [value, setValue] = useState<string | null>(null);

  return (
    <View style={[styles.container, {width: width}]}>
      <Dropdown
        style={[styles.dropdown, {fontSize}]}
        e
        placeholderStyle={[styles.placeholderStyle, {color: textColor}]}
        selectedTextStyle={[styles.selectedTextStyle, {color: textColor}]}
        inputSearchStyle={[styles.inputSearchStyle, {color: textColor}]}
        iconStyle={[
          styles.iconStyle,
          {width: fontSize * 1.5, height: fontSize * 1.5},
        ]}
        data={data}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        value={value}
        onChange={item => {
          if (item && typeof item === 'object' && item.value !== undefined) {
            setValue(item.value);
          }
        }}
      />
    </View>
  );
};

export default DropdownComponent;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    height: 50,
    paddingHorizontal: 14,
    borderWidth: 0.5,
    borderColor: '#dadada',
    justifyContent: 'center',
    borderRadius: 10,
    width: '90%',
    alignSelf: 'center',
  },
  dropdown: {
    color: colors.gray.dark, // Adjust as necessary
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 18, // Default font size, overridden by prop if provided
  },
  selectedTextStyle: {
    fontSize: 18, // Default font size, overridden by prop if provided
  },
  iconStyle: {
    width: 20, // Default size, overridden by prop if provided
    height: 20, // Default size, overridden by prop if provided
    tintColor: '#000',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 18, // Default font size, overridden by prop if provided
    color: colors.primary, // Adjust as necessary
  },
});
