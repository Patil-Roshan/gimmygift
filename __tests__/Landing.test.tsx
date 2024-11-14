import 'react-native';
import React from 'react';

import {it} from '@jest/globals';
import renderer from 'react-test-renderer';
import Landing from '../src/screens/Landing/landing';
import {render, fireEvent} from '@testing-library/react-native';

it('App renders correctly', () => {
  renderer.create(<Landing />);
});

it('User can navigate to Create your GiftProfile', () => {
  const {getByTestId} = render(<Landing />);
  const button = getByTestId('Create your GiftProfile');
  fireEvent.press(button);
  expect(button).toBeDefined();
});

it('User can navigate to Login screen', () => {
  const {getByTestId} = render(<Landing />);
  const btnLogin = getByTestId('btnLogin');
  fireEvent.press(btnLogin);
  expect(btnLogin).toBeDefined();
});
