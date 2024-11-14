/* eslint-disable react-native/no-inline-styles */
//create a webviw componet which gets link in props and display it in webview
import React, {useState} from 'react';
import {WebView} from 'react-native-webview';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';

import Modal from 'react-native-modal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../theme/colors';
import FastImage from 'react-native-fast-image';
interface WebProps {
  link: string;
  isOpen: boolean;
  onClose: () => void;
}

const Webpage: React.FC<WebProps> = ({link, isOpen, onClose}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [favicon, setFavicon] = useState('');
  const [loading, setLoading] = useState(true);

  const handleWebViewMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);

    if (data.title) {
      setTitle(data.title);
    }
    if (data.url) {
      setUrl(data.url);
    }
    if (data.favicon) {
      setFavicon(data.favicon);
    }
  };

  const injectedJavaScript = `
    (function() {
      function getFavicon() {
        var favicon = '';
        var nodeList = document.querySelectorAll('link[rel~="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
        var sizes = [];
        
        nodeList.forEach(function(link) {
          if (link.href) {
            var size = link.getAttribute('sizes');
            if (size) {
              sizes.push({ size: parseInt(size.split('x')[0], 10), href: link.href });
            } else {
              sizes.push({ size: 16, href: link.href }); // Default to 16 if no size specified
            }
          }
        });

        if (sizes.length > 0) {
          sizes.sort(function(a, b) { return b.size - a.size; }); // Sort by size descending
          favicon = sizes[0].href; // Use the largest available icon
        }

        if (!favicon) {
          // Try common favicon locations if no <link> tag is found
          favicon = window.location.origin + '/favicon.ico';
        }
        
        return favicon;
      }

      function sendMetadata() {
        const metadata = {
          title: document.title,
          url: window.location.href,
          favicon: getFavicon()
        };
        window.ReactNativeWebView.postMessage(JSON.stringify(metadata));
      }

      sendMetadata();
      window.addEventListener('load', sendMetadata);
      window.addEventListener('popstate', sendMetadata);
    })();
  `;

  return (
    <Modal isVisible={isOpen} style={{margin: 0}} onBackdropPress={onClose}>
      <SafeAreaView
        style={{
          flex: 1,
        }}>
        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        <View
          style={{
            backgroundColor: '#fff',
            flexDirection: 'row',
            paddingVertical: 15,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <MaterialCommunityIcons
            name="close"
            onPress={onClose}
            color={colors.primary}
            size={26}
            style={{
              width: 30,
              height: 30,
              borderRadius: 12,
              textAlign: 'center',
              textAlignVertical: 'center',
              overflow: 'hidden',
              paddingVertical: 3,
            }}
          />
          <FastImage
            source={{uri: favicon}}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              overflow: 'hidden',
              marginHorizontal: 5,
            }}
          />
          <View
            style={{
              width: '70%',
              alignSelf: 'center',
              marginHorizontal: 12,
            }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: '#000000',
              }}
              numberOfLines={1}>
              {title}
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: '#000000',
                marginTop: 2,
              }}
              numberOfLines={1}>
              {url}
            </Text>
          </View>
        </View>

        <WebView
          source={{uri: link}}
          style={{flex: 1}}
          onMessage={handleWebViewMessage}
          injectedJavaScript={injectedJavaScript}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            Alert.alert('Link error', 'The link is not valid');
          }}
          onHttpError={() => {
            setLoading(false);
            Alert.alert('Link error', 'The link is not valid');
          }}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1,
  },
});

export default Webpage;
