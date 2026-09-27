import React, {useMemo, useState} from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import fonts from '../../Assets/fonts';
import {colors} from '../../theme/colors';
import {
  PHONE_COUNTRIES,
  PLACEHOLDER_COLOR,
  getPhoneCountry,
} from './phoneMask';

export default function CountryCodePicker({visible, selectedIso, onSelect, onClose}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const selected = getPhoneCountry(selectedIso);

  const data = useMemo(() => {
    const term = query.trim().toLowerCase().replace(/^\+/, '');
    if (!term) {
      return PHONE_COUNTRIES;
    }
    return PHONE_COUNTRIES.filter(item => {
      return (
        item.name.toLowerCase().includes(term) ||
        item.dial.includes(term) ||
        item.iso.toLowerCase().includes(term)
      );
    });
  }, [query]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[styles.sheet, {paddingBottom: Math.max(insets.bottom, 16)}]}>
          <View style={styles.handle} />
          <Text style={styles.title}>Select country code</Text>
          <View style={styles.search}>
            <Icon name="search" size={16} color={PLACEHOLDER_COLOR} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search country or code"
              placeholderTextColor={PLACEHOLDER_COLOR}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              autoCapitalize="none"
              autoComplete="off"
              textContentType="none"
              importantForAutofill="no"
              underlineColorAndroid="transparent"
            />
          </View>
          <FlatList
            data={data}
            keyExtractor={item => item.iso}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.list}
            renderItem={({item}) => {
              const active = item.iso === selected.iso;
              return (
                <TouchableOpacity
                  style={[styles.row, active && styles.rowActive]}
                  onPress={() => {
                    onSelect(item.iso);
                    setQuery('');
                    onClose();
                  }}
                  activeOpacity={0.7}>
                  <Text style={styles.flag}>{item.flag}</Text>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.dial}>+{item.dial}</Text>
                  {active ? (
                    <Icon name="check" size={16} color={colors.theme.primary} />
                  ) : (
                    <View style={styles.checkSpacer} />
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.empty}>No countries match that search.</Text>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
    maxHeight: '78%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginBottom: 14,
  },
  title: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 17,
    color: '#111827',
    marginBottom: 12,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 0,
  },
  list: {
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  rowActive: {
    backgroundColor: '#F3F7FB',
  },
  flag: {
    fontSize: 20,
    marginRight: 10,
  },
  name: {
    flex: 1,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 15,
    color: '#111827',
  },
  dial: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 14,
    color: PLACEHOLDER_COLOR,
    marginRight: 10,
  },
  checkSpacer: {
    width: 16,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 28,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14,
    color: PLACEHOLDER_COLOR,
  },
});
