import 'react-native';
import React from 'react';

import {it} from '@jest/globals';
import Splash from '../src/screens/Splash/splash';
import {render} from '@testing-library/react-native';
import {act} from 'react-test-renderer';

jest.mock('react-native-fast-image', () => 'FastImage');
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

describe('Splash screen', () => {
  it('Splash screen renders correctly', () => {
    const {getByText, getByTestId} = render(<Splash />);

    expect(getByText('Send and receive the perfect gift.')).toBeTruthy();
    expect(getByText('GimmeGift Inc © 2024')).toBeTruthy();

    const logoImage = getByTestId('logo-image');
    expect(logoImage).toBeTruthy();
  });
  it('navigates to landing screen after a delay', async () => {
    const replace = jest.fn();
    require('@react-navigation/native').useNavigation.mockReturnValue({
      replace,
    });
    const {unmount} = render(<Splash />);
    jest.useFakeTimers();

    await act(async () => {
      unmount();
      await Promise.resolve();
    });

    jest.advanceTimersByTime(1500);
  });
});
