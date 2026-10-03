import React from 'react';
import {Modal, Pressable, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import fonts from '../../Assets/fonts';

const NAVY = '#0F1F4B';
const MUTED = '#8B93A7';

export default function SmallDialog({visible, title, message, actions, onClose, compact}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.root} onPress={onClose}>
        <Pressable style={[styles.card, compact && styles.cardCompact]} onPress={() => {}}>
          <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
          {message ? <Text style={[styles.message, compact && styles.messageCompact]}>{message}</Text> : null}
          <View style={styles.actions}>
            {(actions || []).map(action => (
              <TouchableOpacity
                key={action.label}
                style={[styles.action, compact && styles.actionCompact]}
                disabled={action.disabled}
                onPress={action.onPress}
                accessibilityRole="button">
                <Text style={[styles.actionLabel, compact && styles.actionLabelCompact, action.danger && styles.danger, action.disabled && styles.disabled]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: 'rgba(15, 31, 75, 0.46)',
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  title: {
    fontFamily: fonts.euclidCircularA.semiBold,
    fontSize: 17,
    color: NAVY,
  },
  message: {
    marginTop: 8,
    fontFamily: fonts.euclidCircularA.regular,
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
  },
  actions: {marginTop: 8},
  action: {paddingVertical: 12},
  actionLabel: {
    fontFamily: fonts.euclidCircularA.medium,
    fontSize: 15,
    color: NAVY,
  },
  danger: {color: '#E11D48'},
  disabled: {opacity: 0.45},
  cardCompact: {
    maxWidth: 220,
    borderRadius: 14,
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  titleCompact: {fontSize: 14},
  messageCompact: {marginTop: 4, fontSize: 12, lineHeight: 16},
  actionCompact: {paddingVertical: 8},
  actionLabelCompact: {fontSize: 13},
});
