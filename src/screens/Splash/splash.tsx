import React, {useEffect} from 'react';
import {Text, View} from 'react-native';
import {styles} from './splash.styles';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';
import {supabase} from '../../lib/supabase';

interface SplashProps {
  splashTimeoutRef: React.RefObject<NodeJS.Timeout>;
}

const Splash: React.FC<SplashProps> = ({splashTimeoutRef}) => {
  const navigation = useNavigation<any>();
  useEffect(() => {
    splashTimeoutRef.current = setTimeout(async () => {
      const {data: currentSession} = await supabase.auth.getSession();
      navigation.replace(currentSession?.session ? 'tabnavigator' : 'landing');
    }, 2000);

    return () => {
      if (splashTimeoutRef.current) {
        clearTimeout(splashTimeoutRef.current);
      }
    };
  }, [navigation, splashTimeoutRef]);
  return (
    <View style={styles.container}>
      <FastImage
        testID="logo-image"
        source={require('../../assets/images/app_logo.png')}
        style={styles.image}
      />
      <View style={styles.bottomContainer}>
        <Text style={styles.taglineLabel}>
          Send and receive the perfect gift.
        </Text>
        <Text style={styles.copyrightLabel}>GimmeGift Inc © 2024</Text>
      </View>
    </View>
  );
};
export default Splash;
