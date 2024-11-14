import 'react-native';
import React from 'react';

import {it} from '@jest/globals';
import renderer from 'react-test-renderer';
import {fireEvent, render} from '@testing-library/react-native';
import Dashboard from '../src/screens/Dashboard/dashboard';

it('Dashboard renders correctly', () => {
  renderer.create(<Dashboard />);
  render(<Dashboard />);
});

it('User can use share feature', () => {
  const {getByTestId} = render(<Dashboard />);
  const btnShare = getByTestId('btnShare');
  fireEvent.press(btnShare);
  expect(btnShare).toBeDefined();
});

it('User can navigate  to menu', () => {
  jest.mock('@react-navigation/core', () => ({
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  }));
  const {getByTestId} = render(<Dashboard />);
  const btnMenu = getByTestId('btnMenu');
  fireEvent.press(btnMenu);
  expect(btnMenu).toBeDefined();
});

it('User can chage gift items list', () => {
  const {getByTestId} = render(<Dashboard />);
  const indicator1 = getByTestId('indicator1');
  fireEvent.press(indicator1);
  expect(indicator1).toBeDefined();
});
