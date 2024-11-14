/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
    Text,
    View,
    Image,
    FlatList,
    Dimensions,
    TouchableOpacity,
    ImageBackground,
} from 'react-native';
import Modal from 'react-native-modal';
import Button from '../../components/Button';
import FastImage from 'react-native-fast-image';
import colors from '../../theme/colors';
import Entypo from 'react-native-vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from '../GiftAssistant/giftassistant.styles.';

interface ListData {
    id: number;
    image: any;
    title: string;
    sub_title: string;
}

const SharingOptions = () => {
    const [showFirstAccessModal, setShowFirstAccessModal] = useState(true);

    const giftFunds = [
        {
            id: '1',
            image: require('../../assets/images/assistantPic1.png'),
            text: 'Share to GimmeGift to automatically add the item to your wishlist. If you cannot find the GimmeGift icon, scroll the list and select More ’, then ’Edit’ and add the app from the ’Suggestions’ list.',
        },
        {
            id: '2',
            image: require('../../assets/images/assistantPic2.png'),
            text: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Itaque porro sunt error vitae in, autem suscipit assumenda, quaerat quas consequatur repudiandae debitis cupiditate dignissimos officia nihil iste! Impedit sequi obcaecati adipisci blanditiis?",
        },
    ];

    const [activeIndex, setActiveIndex] = useState(0);

    const renderItem = ({ item }: { item: { image: any } }) => {
        return (
            <View
                style={{
                    width: Dimensions.get('window').width * 0.9,
                }}>
                <View
                    style={{
                        width: '95%',
                        height: 200,
                        alignSelf: 'center',
                        justifyContent: 'center',
                        borderRadius: 8,
                    }}>
                    <FastImage
                        source={item.image}
                        resizeMode="cover"
                        style={{
                            width: '100%',
                            height: 190,
                            borderRadius: 8,
                        }}
                    />
                </View>
            </View>
        );
    };

    const renderIndicator = (index: number) => {
        return (
            <TouchableOpacity
                key={index}
                style={{
                    width: 8,
                    height: 8,
                    borderRadius: 8 / 2,
                    marginHorizontal: 5,
                    backgroundColor: index === activeIndex ? colors.primary : 'lightgray',
                }}
                onPress={() => setActiveIndex(index)}
            />
        );
    };

    const renderFirstAccessModal = () => {
        return (
            <Modal
                isVisible={showFirstAccessModal}
                style={{ margin: 0 }}
                onBackButtonPress={() => setShowFirstAccessModal(false)}
                onBackdropPress={() => setShowFirstAccessModal(false)}>
                <View
                    style={{
                        height: '90%',
                        width: '100%',
                        backgroundColor: '#fff',
                        position: 'absolute',
                        alignSelf: 'center',
                        borderRadius: 12,
                        bottom: 0,
                        overflow: 'hidden',
                        paddingHorizontal: 20,
                    }}>
                    <Image
                        style={{
                            marginTop: '10%',
                            height: 72,
                            width: 72,
                        }}
                        source={require('../../assets/icons/ic_logo.png')}
                    />

                    <Text
                        style={{
                            fontSize: 25,
                            fontWeight: '600',
                            lineHeight: 27,
                            letterSpacing: 0,
                            color: '#000000',
                            marginTop: 25,
                        }}>
                        Sharing option
                    </Text>
                    <Text
                        style={{
                            color: '#000',
                            fontSize: 16,
                            fontWeight: 'normal',
                            lineHeight: 18,
                            paddingVertical: 5,
                        }}>
                        From the online store to your wishlist
                    </Text>

                    <FlatList
                        data={giftFunds}
                        style={{ maxHeight: 220, marginTop: 20 }}
                        renderItem={renderItem}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={item => item.id}
                        onScroll={event => {
                            const contentOffsetX = event.nativeEvent.contentOffset.x;
                            const index = Math.round(
                                contentOffsetX / Dimensions.get('window').width,
                            );
                            setActiveIndex(index);
                        }}
                    />
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            top: 6,
                            left: 0,
                            right: 0,
                            zIndex: 1,
                            marginVertical: 10,
                        }}>
                        {giftFunds.map((_, index) => renderIndicator(index))}
                    </View>

                    <Text
                        style={{
                            color: '#000',
                            fontSize: 16,
                            fontWeight: 'normal',
                            lineHeight: 18,
                            textAlign: 'center',
                            paddingVertical: 10,
                        }}>
                        {giftFunds[activeIndex].text}
                    </Text>


                    <View style={{ marginTop: 50, marginBottom: 20, flexDirection: "row", justifyContent: "space-between" }}>
                        <Button
                            label="Back"
                            width={'48%'}
                            bg={colors.gray.medium}
                            fontColor={colors.black}
                            onPress={() => {
                                setShowFirstAccessModal(false);
                            }}
                        />
                        <Button
                            label="Continue"
                            width={'48%'}
                            onPress={() => {
                                setShowFirstAccessModal(false);
                            }}
                        />
                    </View>
                    <Text
                        style={{
                            color: '#a3a3a3',
                            textAlign: 'center',
                            width: '100%',
                            marginBottom: 10,
                        }}>
                        By continuing you accept our{' '}
                        <Text
                            style={{
                                color: colors.primary,
                                textAlign: 'center',
                                width: '100%',
                            }}>
                            Conditions.
                        </Text>
                    </Text>
                </View>
            </Modal>
        );
    };



    return (
        <View style={styles.container}>
            {renderFirstAccessModal()}
            <TouchableOpacity onPress={setShowFirstAccessModal}>
                <Text style={{ color: colors.primary }}>Thisis sharing page</Text>
            </TouchableOpacity>
        </View>
    );
};
export default SharingOptions;
