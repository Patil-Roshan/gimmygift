import {
  CommonActions,
  createNavigationContainerRef,
} from '@react-navigation/native';

export const navigationRef: any = createNavigationContainerRef();

export function navigate(name: any, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function replace(name: any, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(CommonActions.replace(name, params));
  }
}
