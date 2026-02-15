import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type CameraStackParamList = {
  CameraMain: undefined;
  ScanResults: { uri: string };
  ManualSearch: undefined;
};

export type CameraScreenNavigationProp = NativeStackNavigationProp<
  CameraStackParamList,
  'CameraMain'
>;

export type ScanResultsScreenNavigationProp = NativeStackNavigationProp<
  CameraStackParamList,
  'ScanResults'
>;

export type ScanResultsScreenRouteProp = RouteProp<
  CameraStackParamList,
  'ScanResults'
>;

export interface CameraScreenProps {
  navigation: CameraScreenNavigationProp;
}

export interface ScanResultsScreenProps {
  route: ScanResultsScreenRouteProp;
  navigation: ScanResultsScreenNavigationProp;
}
