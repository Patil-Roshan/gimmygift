import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface DividerProps {
  label: string;
}

const Divider: React.FC<DividerProps> = ({label}) => {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.labelStyle}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
};

export default Divider;

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  line: {
    backgroundColor: '#E5E5E5',
    height: 1.5,
    flex: 1,
  },
  labelStyle: {paddingHorizontal: 10, color: '#B2B2B2'},
});
