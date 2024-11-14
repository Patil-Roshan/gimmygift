import 'react-native';
import React from 'react';

import {it} from '@jest/globals';
import renderer from 'react-test-renderer';
import App from '../App';

it('App renders correctly', () => {
  renderer.create(<App />);
});
