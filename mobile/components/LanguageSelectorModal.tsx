import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback
} from 'react-native';
import { COLORS } from '../utils/constants';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageTag, SupportedLanguageInfo } from '../types';

interface LanguageSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({ visible, onClose }) => {
  const { currentLanguage, supportedLanguages, setLanguage, t } = useLanguage();

  const handleSelect = async (tag: LanguageTag) => {
    await setLanguage(tag);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>{t('lang.title', 'Choose your preferred language')}</Text>
                <Text style={styles.subtitle}>
                  మీ భాషను ఎంచుకోండి • अपनी भाषा चुनें • भाषा निवडा
                </Text>
              </View>

              <View style={styles.languageList}>
                {supportedLanguages.map((lang: SupportedLanguageInfo) => {
                  const isSelected = currentLanguage === lang.tag;
                  return (
                    <TouchableOpacity
                      key={lang.tag}
                      activeOpacity={0.7}
                      onPress={() => handleSelect(lang.tag)}
                      style={[
                        styles.langItem,
                        isSelected && styles.selectedLangItem
                      ]}
                      accessible={true}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isSelected }}
                      accessibilityLabel={`${lang.nativeName}, ${lang.name}`}
                    >
                      <View style={styles.langTextContainer}>
                        <Text style={[styles.langNative, isSelected && styles.selectedLangText]}>
                          {lang.nativeName}
                        </Text>
                        <Text style={styles.langEnglish}>{lang.name}</Text>
                      </View>

                      <View style={styles.rightGroup}>
                        <Text style={[styles.codeBadge, isSelected && styles.selectedCodeBadge]}>
                          {lang.code}
                        </Text>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8
  },
  header: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  languageList: {
    gap: 8
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background
  },
  selectedLangItem: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight
  },
  langTextContainer: {
    flexDirection: 'column'
  },
  langNative: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  langEnglish: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  selectedLangText: {
    color: COLORS.primary,
    fontWeight: '900'
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  codeBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  selectedCodeBadge: {
    color: COLORS.primary,
    backgroundColor: '#DBEAFE'
  },
  checkmark: {
    color: COLORS.primary,
    fontWeight: '900',
    fontSize: 16
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: 'center'
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary
  }
});
