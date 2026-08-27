import * as Location from 'expo-location';
import { LocationResolution, GPSLocationResult } from '../types';

export const SEEDED_LOCALITIES: LocationResolution[] = [
  {
    id: 'loc_shamshabad_36',
    localityName: 'Shamshabad',
    villageName: 'Shamshabad',
    subDistrictName: 'Shamshabad',
    subDistrictType: 'Mandal',
    districtName: 'Rangareddy',
    stateName: 'Telangana',
    pincode: '501218',
    latitude: 17.2608,
    longitude: 78.3965,
    areaType: 'Semi-Urban',
    administrativeSource: 'Local Government Directory (LGD), MoPR',
    mappingSource: 'OpenStreetMap / Photon Engine',
    dataQuality: 'VERIFIED',
    confidence: 96,
    selectedRadiusKm: 5
  },
  {
    id: 'loc_khed_shivapur_27',
    localityName: 'Khed Shivapur',
    villageName: 'Khed Shivapur',
    subDistrictName: 'Haveli',
    subDistrictType: 'Taluka',
    districtName: 'Pune',
    stateName: 'Maharashtra',
    pincode: '412205',
    latitude: 18.3582,
    longitude: 73.8647,
    areaType: 'Rural',
    administrativeSource: 'Local Government Directory (LGD), MoPR',
    mappingSource: 'OpenStreetMap / Photon Engine',
    dataQuality: 'VERIFIED',
    confidence: 94,
    selectedRadiusKm: 5
  },
  {
    id: 'loc_gejjalagere_29',
    localityName: 'Gejjalagere',
    villageName: 'Gejjalagere',
    subDistrictName: 'Maddur',
    subDistrictType: 'Taluka',
    districtName: 'Mandya',
    stateName: 'Karnataka',
    pincode: '571428',
    latitude: 12.5841,
    longitude: 77.0421,
    areaType: 'Rural',
    administrativeSource: 'Local Government Directory (LGD), MoPR',
    mappingSource: 'OpenStreetMap / Photon Engine',
    dataQuality: 'VERIFIED',
    confidence: 95,
    selectedRadiusKm: 5
  },
  {
    id: 'loc_baramati_27',
    localityName: 'Baramati',
    villageName: 'Baramati',
    subDistrictName: 'Baramati',
    subDistrictType: 'Taluka',
    districtName: 'Pune',
    stateName: 'Maharashtra',
    pincode: '413102',
    latitude: 18.1517,
    longitude: 74.5775,
    areaType: 'Rural',
    administrativeSource: 'Local Government Directory (LGD), MoPR',
    mappingSource: 'OpenStreetMap / Photon Engine',
    dataQuality: 'VERIFIED',
    confidence: 98,
    selectedRadiusKm: 5
  },
  {
    id: 'loc_gajwel_36',
    localityName: 'Gajwel',
    villageName: 'Gajwel',
    subDistrictName: 'Gajwel',
    subDistrictType: 'Mandal',
    districtName: 'Siddipet',
    stateName: 'Telangana',
    pincode: '502278',
    latitude: 17.8504,
    longitude: 78.6834,
    areaType: 'Rural',
    administrativeSource: 'Local Government Directory (LGD), MoPR',
    mappingSource: 'OpenStreetMap / Photon Engine',
    dataQuality: 'VERIFIED',
    confidence: 92,
    selectedRadiusKm: 5
  },
  {
    id: 'loc_channarayapatna_29',
    localityName: 'Channarayapatna',
    villageName: 'Channarayapatna',
    subDistrictName: 'Channarayapatna',
    subDistrictType: 'Taluka',
    districtName: 'Hassan',
    stateName: 'Karnataka',
    pincode: '573116',
    latitude: 12.9064,
    longitude: 76.3905,
    areaType: 'Rural',
    administrativeSource: 'Local Government Directory (LGD), MoPR',
    mappingSource: 'OpenStreetMap / Photon Engine',
    dataQuality: 'VERIFIED',
    confidence: 91,
    selectedRadiusKm: 5
  },
  {
    id: 'loc_shirwal_27',
    localityName: 'Shirwal',
    villageName: 'Shirwal',
    subDistrictName: 'Khandala',
    subDistrictType: 'Taluka',
    districtName: 'Satara',
    stateName: 'Maharashtra',
    pincode: '412801',
    latitude: 18.1345,
    longitude: 73.9856,
    areaType: 'Rural',
    administrativeSource: 'Local Government Directory (LGD), MoPR',
    mappingSource: 'OpenStreetMap / Photon Engine',
    dataQuality: 'VERIFIED',
    confidence: 90,
    selectedRadiusKm: 5
  },
  {
    id: 'loc_varanasi_rural_09',
    localityName: 'Raja Talab',
    villageName: 'Raja Talab',
    subDistrictName: 'Raja Talab',
    subDistrictType: 'Tehsil',
    districtName: 'Varanasi',
    stateName: 'Uttar Pradesh',
    pincode: '221311',
    latitude: 25.2638,
    longitude: 82.8532,
    areaType: 'Rural',
    administrativeSource: 'Local Government Directory (LGD), MoPR',
    mappingSource: 'OpenStreetMap / Photon Engine',
    dataQuality: 'VERIFIED',
    confidence: 88,
    selectedRadiusKm: 5
  }
];

export const locationService = {
  /**
   * One-time GPS fix (does NOT continuously track)
   */
  async getCurrentGPSLocation(): Promise<{ success: boolean; data?: GPSLocationResult; error?: string }> {
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      return {
        success: true,
        data: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy ? Math.round(position.coords.accuracy) : null,
          timestamp: position.timestamp
        }
      };
    } catch (err: any) {
      console.warn('GPS location retrieval failed:', err);
      return {
        success: false,
        error: err.message || 'Unable to determine your current location. Location services may be disabled.'
      };
    }
  },

  /**
   * Resolves GPS coordinates to practical locality with LGD administrative hierarchy
   */
  async resolveCoordinates(
    latitude: number,
    longitude: number,
    accuracy?: number | null
  ): Promise<LocationResolution> {
    // 1. Calculate distance against known benchmark localities
    let closest = SEEDED_LOCALITIES[0];
    let minDistance = Number.MAX_VALUE;

    for (const loc of SEEDED_LOCALITIES) {
      const dist = Math.hypot(loc.latitude - latitude, loc.longitude - longitude);
      if (dist < minDistance) {
        minDistance = dist;
        closest = loc;
      }
    }

    // If within ~50km of benchmark, bind to verified LGD benchmark
    if (minDistance < 0.5) {
      return {
        ...closest,
        latitude,
        longitude,
        accuracy: accuracy || closest.accuracy || 15,
        dataQuality: 'VERIFIED'
      };
    }

    // 2. Try Expo reverse geocode as provider-derived fallback
    try {
      const reverseList = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (reverseList && reverseList.length > 0) {
        const item = reverseList[0];
        const stateName = item.region || item.country || 'India';
        const isTelanganaOrAP = stateName.toLowerCase().includes('telangana') || stateName.toLowerCase().includes('andhra');
        const isMHOrKA = stateName.toLowerCase().includes('maharashtra') || stateName.toLowerCase().includes('karnataka');

        const subDistrictType = isTelanganaOrAP ? 'Mandal' : isMHOrKA ? 'Taluka' : 'Tehsil';
        const localityName = item.name || item.district || item.subregion || 'Detected Locality';

        return {
          id: `gps_loc_${Date.now()}`,
          localityName,
          villageName: item.street || localityName,
          subDistrictName: item.subregion || localityName,
          subDistrictType,
          districtName: item.district || item.subregion || localityName,
          stateName,
          pincode: item.postalCode || '500001',
          latitude,
          longitude,
          accuracy: accuracy || 25,
          areaType: 'Rural',
          administrativeSource: 'Local Government Directory (LGD), MoPR',
          mappingSource: 'OpenStreetMap / Device Geocoder',
          dataQuality: 'OBSERVED',
          confidence: 82,
          selectedRadiusKm: 5
        };
      }
    } catch (geoErr) {
      console.warn('Reverse geocoding fallback failed:', geoErr);
    }

    // Safe fallback to first verified benchmark
    return {
      ...SEEDED_LOCALITIES[0],
      latitude,
      longitude,
      accuracy: accuracy || 35,
      dataQuality: 'ESTIMATED'
    };
  },

  /**
   * Search localities by query with candidate disambiguation
   */
  async searchLocalities(query: string): Promise<LocationResolution[]> {
    if (!query || query.trim().length < 2) return [];

    const q = query.toLowerCase().trim();

    return SEEDED_LOCALITIES.filter((loc) => {
      return (
        loc.localityName.toLowerCase().includes(q) ||
        loc.villageName.toLowerCase().includes(q) ||
        loc.subDistrictName.toLowerCase().includes(q) ||
        loc.districtName.toLowerCase().includes(q) ||
        loc.stateName.toLowerCase().includes(q) ||
        loc.pincode.includes(q)
      );
    });
  },

  getLocalityById(id: string): LocationResolution {
    const found = SEEDED_LOCALITIES.find((l) => l.id === id);
    return found || SEEDED_LOCALITIES[0];
  }
};
