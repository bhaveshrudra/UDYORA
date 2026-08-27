import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native';
import { COLORS } from '../utils/constants';
import { MapPlace } from '../types';
import { Badge } from './Badge';

interface PlaceDetailModalProps {
  place: MapPlace | null;
  onClose: () => void;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({ place, onClose }) => {
  if (!place) return null;

  return (
    <Modal visible={!!place} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.header}>
                <View style={styles.titleCol}>
                  <Text style={styles.placeName}>{place.name}</Text>
                  <Text style={styles.categoryLabel}>{place.categoryLabel}</Text>
                </View>
                <Badge label={place.dataQuality} variant="success" />
              </View>

              <View style={styles.infoList}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Distance:</Text>
                  <Text style={styles.infoValue}>📍 {place.distanceKm} km from center</Text>
                </View>

                {place.address && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Location / Street:</Text>
                    <Text style={styles.infoValue}>{place.address}</Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Data Source:</Text>
                  <Text style={styles.infoValue}>{place.source}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Source Type:</Text>
                  <Text style={styles.infoValue}>Map Provider (Observed POI)</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Observed At:</Text>
                  <Text style={styles.infoValue}>
                    {new Date(place.retrievedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
              </View>

              <View style={styles.disclaimerBox}>
                <Text style={styles.disclaimerText}>
                  ℹ️ Map-based observations are retrieved via OpenStreetMap provider data and represent verified ground facilities.
                </Text>
              </View>

              <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.closeText}>Close Details</Text>
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
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 480,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
    marginBottom: 14
  },
  titleCol: {
    flex: 1,
    marginRight: 10
  },
  placeName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 2
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary
  },
  infoList: {
    gap: 8,
    marginBottom: 14
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  infoValue: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  disclaimerBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16
  },
  disclaimerText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    lineHeight: 14
  },
  closeBtn: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  closeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF'
  }
});
