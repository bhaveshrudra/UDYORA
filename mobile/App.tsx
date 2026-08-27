import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { PermissionProvider } from './context/PermissionContext';
import { LocationProvider } from './context/LocationContext';
import { BusinessProfileProvider } from './context/BusinessProfileContext';
import { ReportProvider } from './context/ReportContext';
import { RootStackParamList } from './types/navigation';
import { ErrorBoundary } from './components/ErrorBoundary';

// Screens
import { SplashScreen } from './screens/SplashScreen';
import { LanguageSelectionScreen } from './screens/LanguageSelectionScreen';
import { AuthenticationScreen } from './screens/AuthenticationScreen';
import { PermissionsScreen } from './screens/PermissionsScreen';
import { LocationSearchScreen } from './screens/LocationSearchScreen';
import { LocationConfirmationScreen } from './screens/LocationConfirmationScreen';
import { BusinessProfileScreen } from './screens/BusinessProfileScreen';
import { BusinessProfileReviewScreen } from './screens/BusinessProfileReviewScreen';
import { AnalysisPreparationScreen } from './screens/AnalysisPreparationScreen';
import { AnalysisScreen } from './screens/AnalysisScreen';
import { ResultsScreen } from './screens/ResultsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <LanguageProvider>
          <AuthProvider>
            <PermissionProvider>
              <LocationProvider>
                <BusinessProfileProvider>
                  <ReportProvider>
                    <NavigationContainer>
                      <StatusBar style="dark" />
                      <Stack.Navigator
                        initialRouteName="Splash"
                        screenOptions={{
                          headerShown: false,
                          animation: 'fade_from_bottom',
                          contentStyle: { backgroundColor: '#F8FAFC' }
                        }}
                      >
                        <Stack.Screen
                          name="Splash"
                          component={SplashScreen}
                          options={{ animation: 'fade' }}
                        />
                        <Stack.Screen
                          name="LanguageSelection"
                          component={LanguageSelectionScreen}
                          options={{
                            gestureEnabled: false,
                            animation: 'slide_from_right'
                          }}
                        />
                        <Stack.Screen
                          name="Authentication"
                          component={AuthenticationScreen}
                          options={{
                            gestureEnabled: false,
                            animation: 'slide_from_right'
                          }}
                        />
                        <Stack.Screen
                          name="Permissions"
                          component={PermissionsScreen}
                          options={{
                            gestureEnabled: false,
                            animation: 'slide_from_right'
                          }}
                        />
                        <Stack.Screen
                          name="LocationSearch"
                          component={LocationSearchScreen}
                          options={{
                            animation: 'slide_from_right'
                          }}
                        />
                        <Stack.Screen
                          name="LocationConfirmation"
                          component={LocationConfirmationScreen}
                          options={{
                            animation: 'slide_from_right'
                          }}
                        />
                        <Stack.Screen
                          name="BusinessInput"
                          component={BusinessProfileScreen}
                          options={{
                            animation: 'slide_from_right'
                          }}
                        />
                        <Stack.Screen
                          name="BusinessProfileReview"
                          component={BusinessProfileReviewScreen}
                          options={{
                            animation: 'slide_from_right'
                          }}
                        />
                        <Stack.Screen
                          name="AnalysisPreparation"
                          component={AnalysisPreparationScreen}
                          options={{
                            animation: 'slide_from_right'
                          }}
                        />
                        <Stack.Screen
                          name="Analysis"
                          component={AnalysisScreen}
                          options={{
                            gestureEnabled: false,
                            animation: 'fade'
                          }}
                        />
                        <Stack.Screen
                          name="ResultDashboard"
                          component={ResultsScreen}
                          options={{
                            gestureEnabled: false,
                            animation: 'slide_from_right'
                          }}
                        />
                      </Stack.Navigator>
                    </NavigationContainer>
                  </ReportProvider>
                </BusinessProfileProvider>
              </LocationProvider>
            </PermissionProvider>
          </AuthProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
