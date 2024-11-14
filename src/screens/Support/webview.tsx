import React, {useEffect} from 'react';
import {WebView} from 'react-native-webview';
import {StyleSheet, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

const Webview = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {title, link} = route?.params ?? {};
  useEffect(() => {
    navigation.setOptions({
      headerTitle: title || 'GimmeGift',
    });
  }, [navigation, link, title]);
  return (
    <View style={styles.container}>
      <WebView source={{uri: link}} style={styles.webview} />
    </View>
  );
};

export default Webview;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 10,
  },
  label: {
    fontSize: 25,
    color: '#000',
    fontWeight: '500',
    paddingHorizontal: 10,
    width: '68%',
  },
  webview: {
    flex: 1,
  },
});
