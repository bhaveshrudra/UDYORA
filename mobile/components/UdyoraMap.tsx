import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS } from '../utils/constants';
import { MapPlace, POICategory } from '../types';

interface UdyoraMapProps {
  latitude: number;
  longitude: number;
  localityName: string;
  subDistrictName?: string;
  districtName?: string;
  radiusKm?: number;
  places?: MapPlace[];
  selectedCategory?: POICategory;
  accuracy?: number | null;
  height?: number;
  onRadiusChange?: (radius: number) => void;
  onSelectPlace?: (place: MapPlace) => void;
}

export const UdyoraMap: React.FC<UdyoraMapProps> = ({
  latitude,
  longitude,
  localityName,
  subDistrictName,
  districtName,
  radiusKm = 5,
  places = [],
  selectedCategory = 'ALL',
  accuracy,
  height = 300,
  onRadiusChange,
  onSelectPlace
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);

  const serializedPlaces = JSON.stringify(places);

  // Generate Leaflet HTML Map with OSM Tiles, Custom Centered Pin, 5km/10km Catchment Circle, and Interactive POI Markers
  const mapHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html, #map {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #F1F5F9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .center-pin {
      background: #1D4ED8;
      color: #FFFFFF;
      border: 2.5px solid #FFFFFF;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.45);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(29, 78, 216, 0.6); }
      70% { box-shadow: 0 0 0 14px rgba(29, 78, 216, 0); }
      100% { box-shadow: 0 0 0 0 rgba(29, 78, 216, 0); }
    }
    .poi-pin {
      background: #059669;
      color: #FFFFFF;
      border: 2px solid #FFFFFF;
      border-radius: 50%;
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.25);
      cursor: pointer;
    }
    .poi-bank { background: #0284C7; }
    .poi-market { background: #D97706; }
    .poi-health { background: #DC2626; }
    .poi-dairy { background: #2563EB; }
    .poi-retail { background: #7C3AED; }
    .poi-transport { background: #475569; }

    .leaflet-popup-content-wrapper {
      border-radius: 12px;
      padding: 4px;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.2);
    }
    .popup-title {
      font-weight: 800;
      font-size: 13px;
      color: #0F172A;
      margin-bottom: 2px;
    }
    .popup-sub {
      font-size: 11px;
      color: #64748B;
      margin-bottom: 4px;
    }
    .popup-badge {
      display: inline-block;
      font-size: 9px;
      font-weight: 800;
      background: #EFF6FF;
      color: #1D4ED8;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var centerLat = ${latitude};
    var centerLng = ${longitude};
    var radiusMeters = ${radiusKm * 1000};
    var rawPlaces = ${serializedPlaces};

    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([centerLat, centerLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    // Visual 5km / 10km Catchment Circle
    var circle = L.circle([centerLat, centerLng], {
      color: '#1D4ED8',
      fillColor: '#3B82F6',
      fillOpacity: 0.12,
      weight: 2,
      dashArray: '5, 8',
      radius: radiusMeters
    }).addTo(map);

    // Center Location Marker
    var centerIcon = L.divIcon({
      className: 'center-pin-wrapper',
      html: '<div class="center-pin">📍</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    var centerMarker = L.marker([centerLat, centerLng], { icon: centerIcon }).addTo(map);
    centerMarker.bindPopup(
      '<div class="popup-title">${localityName}</div>' +
      '<div class="popup-sub">${subDistrictName || ''}, ${districtName || ''}</div>' +
      '<span class="popup-badge">SELECTED LOCALITY</span>'
    ).openPopup();

    var poiLayerGroup = L.layerGroup().addTo(map);

    function getCategoryClass(cat) {
      if (cat === 'BANKS') return 'poi-bank';
      if (cat === 'MARKETS') return 'poi-market';
      if (cat === 'HEALTHCARE') return 'poi-health';
      if (cat === 'DAIRY_SERVICES') return 'poi-dairy';
      if (cat === 'RETAIL') return 'poi-retail';
      if (cat === 'TRANSPORT') return 'poi-transport';
      return 'poi-pin';
    }

    function getCategoryEmoji(cat) {
      if (cat === 'BANKS') return '🏦';
      if (cat === 'MARKETS') return '🌾';
      if (cat === 'HEALTHCARE') return '🏥';
      if (cat === 'DAIRY_SERVICES') return '🥛';
      if (cat === 'RETAIL') return '🛍️';
      if (cat === 'TRANSPORT') return '🚌';
      if (cat === 'AGRICULTURAL_SERVICES') return '🌱';
      return '📍';
    }

    function renderPlaces(placesList) {
      poiLayerGroup.clearLayers();
      placesList.forEach(function(place) {
        var iconHtml = '<div class="poi-pin ' + getCategoryClass(place.category) + '">' + getCategoryEmoji(place.category) + '</div>';
        var poiIcon = L.divIcon({
          className: 'poi-icon-wrapper',
          html: iconHtml,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        var m = L.marker([place.latitude, place.longitude], { icon: poiIcon });
        m.on('click', function() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_PLACE', place: place }));
          }
        });
        m.bindPopup(
          '<div class="popup-title">' + place.name + '</div>' +
          '<div class="popup-sub">' + place.categoryLabel + ' • ' + place.distanceKm + ' km</div>' +
          '<span class="popup-badge">OBSERVED POI</span>'
        );
        poiLayerGroup.addLayer(m);
      });
    }

    renderPlaces(rawPlaces);

    function recenter() {
      map.setView([centerLat, centerLng], 13);
    }

    function zoomIn() {
      map.zoomIn();
    }

    function zoomOut() {
      map.zoomOut();
    }

    function updateRadius(newRadiusKm) {
      if (circle) {
        circle.setRadius(newRadiusKm * 1000);
      }
    }
  </script>
</body>
</html>
  `;

  useEffect(() => {
    if (!isLoading && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        renderPlaces(${JSON.stringify(places)});
        updateRadius(${radiusKm});
        true;
      `);
    }
  }, [places, radiusKm, isLoading]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_PLACE' && onSelectPlace && data.place) {
        onSelectPlace(data.place);
      }
    } catch (e) {
      console.warn('Map message parse error:', e);
    }
  };

  const handleRecenter = () => {
    webViewRef.current?.injectJavaScript(`recenter(); true;`);
  };

  const handleZoomIn = () => {
    webViewRef.current?.injectJavaScript(`zoomIn(); true;`);
  };

  const handleZoomOut = () => {
    webViewRef.current?.injectJavaScript(`zoomOut(); true;`);
  };

  const handleRadiusClick = (radius: number) => {
    if (onRadiusChange) {
      onRadiusChange(radius);
    }
    webViewRef.current?.injectJavaScript(`updateRadius(${radius}); true;`);
  };

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.webview}
        onLoadEnd={() => setIsLoading(false)}
        onMessage={handleMessage}
        scrollEnabled={false}
      />

      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loaderText}>Rendering Locality Intelligence Map...</Text>
        </View>
      )}

      {/* Floating Zoom Controls Top Right */}
      <View style={styles.zoomControls}>
        <TouchableOpacity activeOpacity={0.8} onPress={handleZoomIn} style={styles.zoomBtn}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} onPress={handleZoomOut} style={styles.zoomBtn}>
          <Text style={styles.zoomText}>−</Text>
        </TouchableOpacity>
      </View>

      {/* Map Control Bar Overlay (Recenter + Radius Selector) */}
      <View style={styles.controlBar}>
        <TouchableOpacity activeOpacity={0.8} onPress={handleRecenter} style={styles.recenterBtn}>
          <Text style={styles.recenterText}>🎯 Recenter</Text>
        </TouchableOpacity>

        <View style={styles.radiusContainer}>
          <Text style={styles.radiusLabel}>Radius:</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleRadiusClick(5)}
            style={[styles.radiusPill, radiusKm === 5 && styles.activeRadiusPill]}
          >
            <Text style={[styles.radiusPillText, radiusKm === 5 && styles.activeRadiusPillText]}>
              5 km
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleRadiusClick(10)}
            style={[styles.radiusPill, radiusKm === 10 && styles.activeRadiusPill]}
          >
            <Text style={[styles.radiusPillText, radiusKm === 10 && styles.activeRadiusPillText]}>
              10 km
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: '#F1F5F9',
    position: 'relative'
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  loader: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  loaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary
  },
  zoomControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  zoomBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border
  },
  zoomText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary
  },
  controlBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  recenterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F1F5F9'
  },
  recenterText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary
  },
  radiusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  radiusLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textTransform: 'uppercase'
  },
  radiusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  activeRadiusPill: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary
  },
  radiusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary
  },
  activeRadiusPillText: {
    color: COLORS.primary
  }
});
