/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Button,
  Alert,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import ViewShot from 'react-native-view-shot';
import RNFS from 'react-native-fs';
import {request, PERMISSIONS} from 'react-native-permissions';

const GiftGifGenerator = ({renderGiftContent}: any) => {
  const viewShotRef = useRef();
  const [gifUrl, setGifUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [capturedFrames, setCapturedFrames] = useState([]);

  const confettiRef = useRef(null);

  const captureAndSaveFrames = useCallback(async () => {
    setIsGenerating(true);
    const newCapturedFrames = [];
    const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
    console.log('result of storage --->', result);

    try {
      confettiRef?.current?.start();
      const tempDir = RNFS.CachesDirectoryPath + '/gift-frames/';
      await RNFS.mkdir(tempDir);

      // Capture confetti animation frames
      for (let i = 0; i < 50; i++) {
        const uri = await viewShotRef?.current?.capture();
        const fileName = `frame_${i}.png`;
        const fileUri = tempDir + fileName;
        if (await RNFS.exists(fileUri)) {
          await RNFS.unlink(fileUri);
        }
        await RNFS.moveFile(uri, fileUri);
        newCapturedFrames.push(fileUri);
        await new Promise(resolve => setTimeout(resolve, 33));
      }

      // Capture gift content frame
      const giftContentUri = await viewShotRef?.current?.capture();
      const giftFileName = 'gift_content.png';
      const giftFileUri = tempDir + giftFileName;
      await RNFS.moveFile(giftContentUri, giftFileUri);
      await newCapturedFrames.push(giftFileUri);

      await setCapturedFrames(newCapturedFrames);
      await generateGif(newCapturedFrames);
    } catch (error) {
      console.error('Error capturing or saving frames:', error);
      Alert.alert('Error', 'Failed to generate GIF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearCapturedFrames = useCallback(async () => {
    try {
      const tempDir = RNFS.CachesDirectoryPath + '/gift-frames/';
      await RNFS.unlink(tempDir);
      setCapturedFrames([]);
    } catch (error) {
      console.error('Error clearing captured frames:', error);
    }
  }, []);

  async function uploadFiles(filePaths: any) {
    // const filePaths = capturedFrames;
    const formData = new FormData();

    // Append the Auth token
    formData.append('Auth', 'secret_BrCbrik2Dwol2wT4');

    // Append each file
    for (let i = 0; i < filePaths.length; i++) {
      try {
        const fileExists = await RNFS.exists(filePaths[i]);

        if (fileExists) {
          const file = {
            uri:
              Platform.OS === 'android'
                ? `file://${filePaths[i]}`
                : filePaths[i],
            type: 'image/png',
            name: filePaths[i].split('/').pop(),
          };

          formData.append(`Files[${i}]`, file);
        } else {
          console.error(`File does not exist: ${filePaths[i]}`);
        }
      } catch (error) {
        console.error(`Error processing file ${filePaths[i]}:`, error);
      }
    }

    // Append StoreFile parameter
    formData.append('StoreFile', 'true');
    formData.append('AnimationDelay', '11');

    return formData;
  }

  const generateGif = async (frames : File[]) => {
    try {
      const fileInput = await uploadFiles(frames);

      console.log('got fileInput', fileInput);

      const myHeaders = new Headers();
      myHeaders.append('Authorization', 'Bearer secret_BrCbrik2Dwol2wT4');
      myHeaders.append('Content-Type', 'multipart/form-data');

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: fileInput,
        redirect: 'follow',
      };

      fetch('https://v2.convertapi.com/convert/jpg/to/gif', requestOptions)
        .then(response => response.json())
        .then(result => console.log('Generated GIF:', result))
        .catch(error => console.error(error));
    } catch (error) {
      console.log('Error generating GIF::::', error);
    }
  };

  return (
    <View style={styles.container}>
      <ViewShot
        ref={viewShotRef}
        options={{format: 'png', quality: 0.9}}
        style={{position: 'absolute', top: -9999, left: -9999}}>
        <View style={styles.animationContainer}>
          <ConfettiCannon
            ref={confettiRef}
            explosionSpeed={50}
            fallSpeed={5000}
            count={250}
            origin={{x: -10, y: 0}}
            autoStart={false}
            fadeOut={true}
          />
          {/* {!isGenerating && renderGiftContent()} */}

          <View style={{backgroundColor: '#00ff00'}}>
            {renderGiftContent()}
          </View>
        </View>
      </ViewShot>

      {gifUrl && (
        <View style={styles.gifContainer}>
          <Image source={{uri: gifUrl}} style={styles.generatedGif} />
          <Button
            title="Share GIF"
            onPress={() => {
              /* Implement sharing logic */
            }}
          />
        </View>
      )}
      <View style={{marginTop: 100}} />

      <Button
        title={isGenerating ? 'Generating...' : 'Generate GIF'}
        onPress={captureAndSaveFrames}
        disabled={isGenerating}
      />
      <ScrollView
        horizontal
        contentContainerStyle={{flexGrow: 1, backgroundColor: '#d6d6d6'}}>
        {capturedFrames.map((uri, index) => (
          <Image
            key={index}
            source={{uri: 'file://' + uri}}
            style={{
              width: 100,
              height: 100,
              margin: 5,
              borderWidth: 0.5,
              borderColor: '#a3a3a3',
            }}
          />
        ))}
      </ScrollView>
      <Button title="Clear Frames" onPress={clearCapturedFrames} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  animationContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  gifContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  generatedGif: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
});

export default GiftGifGenerator;
