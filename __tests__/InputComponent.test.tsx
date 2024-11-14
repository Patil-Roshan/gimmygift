import 'react-native';
import React from 'react';

import {it} from '@jest/globals';
import renderer from 'react-test-renderer';
import Input from '../src/components/Input';

it('Input renders correctly', () => {
  renderer.create(<Input />);
});
