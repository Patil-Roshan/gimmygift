/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import Modal from 'react-native-modal';
import colors from '../theme/colors';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FastImage from 'react-native-fast-image';
import Icon from './Icon';
import {ic_add, ic_logo_bordered} from '../assets/icons/icons';
import {relationshipsTags} from '../referenceData';

interface RecipientSelectionProps {
  title: string;
  data: any;
  isOpen: boolean;
  selected: any;
  onClose: () => void;
  onSelect: (item: string) => void;
}

const RecipientSelection: React.FC<RecipientSelectionProps> = ({
  title,
  data,
  isOpen,
  selected,
  onClose,
  onSelect,
}) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(selected);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredData, setFilteredData] = useState(data);
  const [selectedTag, setSelectedTag] = useState('All');

  useEffect(() => {
    if (isOpen) {
      setSelectedValue(null);
    }
  }, [isOpen]);

  const handleSelect = (item: any) => {
    setSelectedValue(item?.full_name);
    onSelect(item);
    // onClose();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = data.filter((item: any) =>
      item?.full_name?.toLowerCase().includes(query.toLowerCase()),
    );
    setFilteredData(filtered);
  };

  const handleTags = (tag: string) => {
    if (tag === 'All') {
      setFilteredData(data);
      return;
    }
    const filteredRecipients = data.filter((occasion: any) => {
      const eventTypeMatches = occasion?.relationships
        ?.toLowerCase()
        .includes(tag?.toLowerCase());
      return eventTypeMatches;
    });
    setFilteredData(filteredRecipients);
  };

  return (
    <Modal isVisible={isOpen} onBackdropPress={onClose} style={{margin: 0}}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.doneLabel} onPress={onClose}>
              Done
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <AntDesign
              name="search1"
              color={'rgba(0, 0, 0, 0.36)'}
              size={18}
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Search"
              placeholderTextColor="rgba(0, 0, 0, 0.36)"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>

          <View style={styles.labelContainer}>
            <FlatList
              data={relationshipsTags}
              horizontal
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.label,
                    {
                      backgroundColor:
                        selectedTag === item.title
                          ? 'rgba(0, 0, 0, 0.5)'
                          : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    setSelectedTag(item.title);
                    handleTags(item.title);
                  }}>
                  <Text
                    style={[
                      styles.labelText,
                      {
                        color: selectedTag === item.title ? '#fff' : '#000',
                      },
                    ]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.title}
            />
          </View>
          <FlatList
            data={filteredData}
            renderItem={({item}) => (
              <TouchableOpacity
                key={item?.full_name}
                style={styles.itemContainer}
                onPress={() => handleSelect(item)}>
                <View>
                  <FastImage
                    source={
                      item.profile_image
                        ? {uri: item.profile_image}
                        : require('../assets/images/user_placeholder.png')
                    }
                    style={styles.recipientImage}
                  />
                  {item?.type !== 'contact' && (
                    <View
                      style={{
                        position: 'absolute',
                        right: 5,
                        bottom: -5,
                        zIndex: 10,
                      }}>
                      <Icon icon={ic_logo_bordered} size={22} />
                    </View>
                  )}
                </View>
                <View style={{width: '65%'}}>
                  <Text style={styles.itemText}>{item?.full_name}</Text>
                  <Text style={styles.itemSubText}>
                    {item?.relationships ?? 'No relationship added'}
                  </Text>
                </View>

                <View style={styles.checkContainer}>
                  {selectedValue === item.full_name ? (
                    <Entypo
                      name="check"
                      color={'#fff'}
                      size={18}
                      style={styles.checkMark}
                    />
                  ) : (
                    <Icon icon={ic_add} size={25} />
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '100%',
    height: '90%',
    backgroundColor: '#efeff4',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 12,
    bottom: 0,
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    margin: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  doneLabel: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: '500',
    color: colors.primary,
  },
  recipientImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    height: 68,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    margin: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    borderRadius: 11,
    paddingHorizontal: 11,
    marginTop: 20,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    height: 40,
    color: 'black',
    fontSize: 19,
  },
  itemText: {
    fontSize: 16,
    width: '70%',
    color: '#000',
  },
  itemSubText: {
    fontSize: 14,
    width: '70%',
    color: '#848484',
  },
  checkContainer: {
    width: 24,
    height: 24,
    alignSelf: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    overflow: 'hidden',
    alignContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkMark: {
    width: 24,
    height: 24,
    paddingVertical: 2,
    borderRadius: 12,
    textAlign: 'center',
    overflow: 'hidden',
    textAlignVertical: 'center',
    backgroundColor: colors.primary,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
  },
  label: {
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 7,
    fontSize: 14,
    margin: 7,
  },
  selectedLabelText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  labelText: {
    fontSize: 14,
    color: '#333333',
  },
});

export default RecipientSelection;
