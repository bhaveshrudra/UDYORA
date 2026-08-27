import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Splash: undefined;
  LanguageSelection: { fromSettings?: boolean } | undefined;
  Authentication: { initialTab?: 'signin' | 'register' } | undefined;
  Permissions: undefined;
  LocationSearch: undefined;
  LocationConfirmation: { locationId?: string; isGPSDetected?: boolean } | undefined;
  BusinessInput: undefined;
  BusinessProfileReview: undefined;
  AnalysisPreparation: undefined;
  Analysis: undefined;
  ResultDashboard: { assessmentId?: string } | undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
