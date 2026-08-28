# UDYORA Mobile — Hyper-Local Business Advisory Platform

**UDYORA Mobile** is a standalone, multilingual React Native (Expo SDK 57) client designed for rural and semi-urban Indian micro-entrepreneurs. It delivers location-aware feasibility analytics, multi-agent advisory synthesis, deterministic financial structuring (SIH26091 standard), and rule-based government scheme matching across 5 Indian vernacular languages.

---

## 🚀 Key Architectural Highlights

1. **Multi-Agent Advisory Pipeline**:
   - `Evidence Agent`: Audits official Local Government Directory (LGD), OpenStreetMap POIs, Census demographics, and RBI norms.
   - `Business Agent`: Evaluates operating requirements, scale fit, and cost/revenue drivers.
   - `Market Agent`: Maps 5km / 10km spatial POIs, mandi access, and transport connectivity.
   - `Financial Engine`: Pure deterministic arithmetic calculating 10% promoter equity, 5-year term loan, 60-month EMI, and DSCR.
   - `Scheme Agent`: Rule-based matching for PMEGP (up to 35% rural grant), MUDRA Tarun/Kishore, and AHIDF/PMFME.
   - `Risk Agent`: Severity-ranked risk matrix with operational and financial mitigations.
   - `Aggregator / Validator`: Cross-module state consistency & arithmetic bound checking.
   - `Final Advisor`: Synthesizes multilingual executive summaries and actionable guidance.

2. **Multilingual & Voice-First UX**:
   - English (`en-IN`), Telugu (`te-IN`), Hindi (`hi-IN`), Marathi (`mr-IN`), and Kannada (`kn-IN`).
   - Voice input with live transcript streaming and audio level metering (`expo-audio`).
   - Text-to-speech summary readout in the user's selected language (`expo-speech`).

3. **Geospatial & LGD Administrative Integrity**:
   - One-time foreground GPS fix with dynamic sub-district nomenclature (*Mandal* in TS/AP, *Taluka* in MH/KA, *Tehsil* in UP/MP).
   - Interactive Leaflet OpenStreetMap catchment visualization (5 km and 10 km circular zones).
   - Strict dual provenance: Administrative Directory (LGD: `VERIFIED`) vs Map Provider (OSM: `OBSERVED`).

---

## 🛠️ Quick Start & Setup

### Prerequisites
- Node.js `>= 18.x`
- npm `>= 9.x`
- Expo CLI (`npx expo`)

### Installation
```bash
# Navigate to the mobile client
cd mobile

# Install dependencies
npm install

# Start development server
npx expo start
```

### Run on Android Device / Emulator
```bash
# Start directly on connected Android device or emulator
npx expo start --android
```

---

## 📦 Production & Standalone Android Builds (EAS)

Configure EAS build profiles in `eas.json`:

### 1. Build Internal Distribution Test APK
```bash
# Generate standalone APK for direct side-loading on test devices
eas build --platform android --profile preview
```

### 2. Build Production Google Play Store App Bundle (AAB)
```bash
# Generate signed production AAB
eas build --platform android --profile production
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_API_BASE_URL` | Public backend endpoint for hosted agents | `https://api.udyora.gov.in` |
| `EXPO_PUBLIC_MAP_PROVIDER` | Public tile layer provider | `OPENSTREETMAP` |
| `EXPO_PUBLIC_APP_ENV` | Application environment | `production` |

*Security Notice: No private API keys or database credentials are embedded in client code.*

---

## 📱 Android Permissions

Configured in `app.json`:
- `ACCESS_FINE_LOCATION` & `ACCESS_COARSE_LOCATION`: Foreground location for one-time locality resolution.
- `RECORD_AUDIO`: Voice input recognition in regional languages.

*Note: Background location is explicitly NOT requested to protect battery and privacy.*

---

## 🧪 Verification & Type Safety

```bash
# Run TypeScript compilation check (Zero errors)
npx tsc --noEmit

# Run Expo health check
npx expo-doctor
```

---

## 📄 License & Attribution
Developed for the **Smart India Hackathon (SIH26091)**.  
Administrative data sourced via Local Government Directory (LGD), Ministry of Panchayati Raj, Government of India.
