import 'react-native';
import React from 'react';

import {it} from '@jest/globals';
import renderer from 'react-test-renderer';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import Login from '../src/screens/Login/login';
import {supabase} from '../src/lib/supabase';

jest.mock('@react-navigation/core', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
  }),
}));

describe('Login', () => {
  it('Login renders correctly', () => {
    renderer.create(<Login />);
  });

  it('Input events updates state correctly', () => {
    const {getByTestId} = render(<Login />);

    const input = getByTestId('emailPhoneInput');

    fireEvent(input, 'focus');
    fireEvent.changeText(input, '9876543210');
    fireEvent(input, 'blur');
    expect(input.props.defaultValue).toBe('9876543210');
  });

  it('User tries to login without phone number or email', () => {
    const {getByTestId, getByText} = render(<Login />);

    const button = getByTestId('otpBtn');
    fireEvent.press(button);
    const inputError = getByText('Please enter valid phone number or email');
    expect(inputError).toBeDefined();
  });

  it('User tries to login with phone number', async () => {
    const {getByTestId, getByText} = render(<Login />);

    const input = getByTestId('emailPhoneInput');
    fireEvent.changeText(input, '9876543210');

    const button = getByTestId('otpBtn');
    fireEvent.press(button);

    await waitFor(() => {
      const otpScreen = getByText('Enter the access code');
      expect(otpScreen).toBeDefined();
    });
  });

  it('User tries to login with email', async () => {
    const {getByTestId} = render(<Login />);

    const input = getByTestId('emailPhoneInput');
    fireEvent.changeText(input, 'test@gmail.com');

    const button = getByTestId('otpBtn');
    fireEvent.press(button);
  });

  it('User presses back on login screen', async () => {
    const {getByTestId, getByText} = render(<Login />);

    const input = getByTestId('emailPhoneInput');
    fireEvent.changeText(input, '9876543210');

    const button = getByTestId('otpBtn');
    fireEvent.press(button);

    await waitFor(() => {
      const backBtn = getByTestId('backBtn');
      fireEvent.press(backBtn);

      const SignInLabel = getByText('Sign in');
      expect(SignInLabel).toBeDefined();
    });
  });

  it('User tries to submit without entering otp', async () => {
    const {getByTestId, getByText} = render(<Login />);

    const input = getByTestId('emailPhoneInput');
    fireEvent.changeText(input, '9876543210');

    const button = getByTestId('otpBtn');
    fireEvent.press(button);

    await waitFor(() => {
      const otpScreen = getByText('Enter the access code');
      expect(otpScreen).toBeDefined();

      const verifyBtn = getByTestId('verifyOTPBtn');
      fireEvent.press(verifyBtn);

      const otpError = getByText('Please enter valid OTP');
      expect(otpError).toBeDefined();
    });
  });

  it('User tries to submit with valid otp', async () => {
    const {getByTestId} = render(<Login />);

    const input = getByTestId('emailPhoneInput');
    fireEvent.changeText(input, '9876543210');

    const button = getByTestId('otpBtn');
    fireEvent.press(button);

    await waitFor(() => {
      const otpInput = getByTestId('otp-input');
      fireEvent.changeText(otpInput, '123456');

      const verifyBtn = getByTestId('verifyOTPBtn');
      //If error is thrown
      jest.spyOn(supabase.auth, 'verifyOtp').mockResolvedValue({
        error: {
          message: 'Invalid OTP',
          code: 'invalid_token',
          status: 401,
          name: 'Error',
        },
      });

      fireEvent.press(verifyBtn);

      //If error is not thrown
      jest
        .spyOn(supabase.auth, 'verifyOtp')
        .mockResolvedValue({data: {success: true}});
      fireEvent.press(verifyBtn);
    });
  });

  it('User presses resend button', async () => {
    const {getByTestId} = render(<Login />);

    const input = getByTestId('emailPhoneInput');
    fireEvent.changeText(input, '9876543210');

    const button = getByTestId('otpBtn');
    fireEvent.press(button);

    await waitFor(() => {
      jest.advanceTimersByTime(2000);

      const otpBtn = getByTestId('resendOTPBtn');
      expect(otpBtn).toBeDefined();
      fireEvent.press(otpBtn);
    });
  });

  it('User presses registration button', () => {
    const {getByTestId} = render(<Login />);
    const button = getByTestId('registerBtn');
    fireEvent.press(button);
  });
});
