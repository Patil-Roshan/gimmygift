import React, {useState, useEffect} from 'react';
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

interface SelectModalProps {
  title: string;
  data: any;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (items: string[]) => void;
}

const MultiSelectionModal: React.FC<SelectModalProps> = ({
  title,
  data,
  isOpen,
  onClose,
  onSelect,
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const handleSelect = (item: any) => {
    const isSelected = selectedValues.includes(item.name);
    const newSelectedValues = isSelected
      ? selectedValues.filter(value => value !== item.name)
      : [...selectedValues, item.name];

    setSelectedValues(newSelectedValues);
    onSelect(newSelectedValues);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = data.filter((item: any) =>
      item.name.toLowerCase().includes(query.toLowerCase()),
    );
    setFilteredData(filtered);
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
          <FlatList
            data={filteredData}
            style={styles.listContainer}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            renderItem={({item}) => (
              <TouchableOpacity
                key={item.name}
                style={styles.itemContainer}
                onPress={() => handleSelect(item)}>
                <Text style={styles.itemText}>{item.name}</Text>
                <View style={styles.checkContainer}>
                  {selectedValues.includes(item.name) && (
                    <Entypo
                      name="check"
                      color={'#fff'}
                      size={18}
                      style={styles.checkMark}
                    />
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
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 16,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: 'black',
  },
  itemText: {
    fontSize: 16,
    color: '#000',
  },
  checkContainer: {
    width: 24,
    height: 24,
    alignSelf: 'center',
    borderColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    overflow: 'hidden',
    alignContent: 'center',
    alignItems: 'center',
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
});

export default MultiSelectionModal;
