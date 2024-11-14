import 'react-native';
import React from 'react';

import {it} from '@jest/globals';
import renderer from 'react-test-renderer';
import Registration from '../src/screens/Registration/registration';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {supabase} from '../src/lib/supabase';
describe('Registration', () => {
  it('App renders correctly', () => {
    renderer.create(<Registration />);
  });

  it('Input events updates state correctly', () => {
    const {getByTestId} = render(<Registration />);

    const input = getByTestId('emailPhoneInput');

    fireEvent.changeText(input, '9876543210');
    expect(input.props.defaultValue).toBe('9876543210');
  });

  it('User tries to signup without phone number', () => {
    const {getByTestId, getByText} = render(<Registration />);

    const button = getByTestId('otpBtn');
    fireEvent.press(button);
    const inputError = getByText('Please enter valid phone number');
    expect(inputError).toBeDefined();
  });

  it('User tries to login with phone number', async () => {
    const {getByTestId, getByText} = render(<Registration />);

    const input = getByTestId('emailPhoneInput');
    fireEvent.changeText(input, '9876543210');

    const button = getByTestId('otpBtn');

    fireEvent.press(button);

    await waitFor(() => {
      const otpScreen = getByText('Enter the access code');
      expect(otpScreen).toBeDefined();
    });
  });

  it('User presses back on signup screen', async () => {
    const {getByTestId} = render(<Registration />);
    const backBtn = getByTestId('backBtn');
    fireEvent.press(backBtn);
  });

  it('User tries to submit without entering otp', async () => {
    const {getByTestId, getByText} = render(<Registration />);

    const input = getByTestId('emailPhoneInput');
    fireEvent.changeText(input, '9876543210');

    const button = getByTestId('otpBtn');

    fireEvent.press(button);

    await waitFor(() => {
      const otpScreen = getByText('Enter the access code');
      expect(otpScreen).toBeDefined();
      const verifyBtn = getByTestId('verifyBtn');
      fireEvent.press(verifyBtn);

      const otpError = getByText('Please enter valid OTP');
      expect(otpError).toBeDefined();
    });
  });

  it('User tries to submit with valid otp', async () => {
    const {getByTestId, getByText} = render(<Registration />);

    const input = getByTestId('emailPhoneInput');
    fireEvent.changeText(input, '9876543210');

    const button = getByTestId('otpBtn');

    fireEvent.press(button);

    await waitFor(() => {
      const otpInput = getByTestId('otp-input');
      fireEvent.changeText(otpInput, '123456');

      const verifyBtn = getByTestId('verifyBtn');
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
        .mockResolvedValue({data: {session: true}});
      fireEvent.press(verifyBtn);
    });

    await waitFor(() => {
      // :: Step 3 ::
      //If user presses register button without name
      const continueBtn3 = getByTestId('continueBtn3');
      fireEvent.press(continueBtn3);

      const nameError = getByText('Please enter valid name');
      expect(nameError).toBeDefined();

      //If user presses register button with name
      const nameInput = getByTestId('nameInput');
      fireEvent.changeText(nameInput, 'test');
      fireEvent.press(continueBtn3);
      const surnameError = getByText('Please enter valid surname');
      expect(surnameError).toBeDefined();

      const surnameInput = getByTestId('surnameInput');
      fireEvent.changeText(surnameInput, 'test');
      fireEvent.press(continueBtn3);

      // :: Step 4 ::
      const continueBtn4 = getByTestId('continueBtn4');
      const emailInput = getByTestId('emailInput');

      //If user presses register button without email
      fireEvent.press(continueBtn4);
      const emailError = getByText('Please enter valid email');
      expect(emailError).toBeDefined();

      //with valid email
      fireEvent.changeText(emailInput, 'test@gmail.com');

      fireEvent.press(continueBtn4);
      expect(emailError).toBeDefined();
      const continueBtn5 = getByTestId('continueBtn5');
      expect(continueBtn5).toBeDefined();

      // :: Step 5 ::
      fireEvent.press(continueBtn5);
    });
    await waitFor(() => {
      // :: Step 6 ::
      //If user presses button without selecting gender
      const continueBtn6 = getByTestId('continueBtn6');
      fireEvent.press(continueBtn6);
      const genderError = getByText('Please select your gender');
      expect(genderError).toBeDefined();

      //If user presses button with selecting gender
      const Male = getByTestId('Male');
      fireEvent.press(Male);
      fireEvent.press(continueBtn6);

      // :: Step 7 ::
      const fullNameInput = getByTestId('fullNameInput');
      const addressInput = getByTestId('addressInput');
      const cityInput = getByTestId('cityInput');
      const zipInput = getByTestId('zipInput');

      //If user presses button without entering full name
      const continueBtn7 = getByTestId('continueBtn7');
      fireEvent.press(continueBtn7);

      const fullNameError = getByText('Please enter full name');
      expect(fullNameError).toBeDefined();
      fireEvent.changeText(fullNameInput, 'test test');

      //If user presses button without entering address
      fireEvent.press(continueBtn7);
      const addressError = getByText('Please enter valid address');
      expect(addressError).toBeDefined();
      fireEvent.changeText(addressInput, 'test test');

      //If user presses button without entering city
      fireEvent.press(continueBtn7);
      const cityError = getByText('Please enter valid city');
      expect(cityError).toBeDefined();
      fireEvent.changeText(cityInput, 'test test');

      //If user presses button without entering zip code
      fireEvent.press(continueBtn7);
      const zipCodeError = getByText('Please enter valid zip code');

      const notesInput = getByTestId('notesInput');
      fireEvent.changeText(notesInput, 'test');
      expect(zipCodeError).toBeDefined();
      fireEvent.changeText(zipInput, 'test test');
      fireEvent.press(continueBtn7);
    });
    await waitFor(() => {
      // :: Step 8 ::

      // :: User Image Selection Flow ::

      //User selecting image from gallery
      const imageBtn = getByTestId('imageBtn');
      fireEvent.press(imageBtn);
      const selectImgBtn = getByTestId('Select a profile picture');
      expect(selectImgBtn).toBeDefined();
      fireEvent.press(selectImgBtn);

      //User capturing image from camera
      fireEvent.press(imageBtn);
      const captureImgBtn = getByTestId('Take a profile picture');
      expect(captureImgBtn).toBeDefined();
      fireEvent.press(captureImgBtn);

      //User deleting image
      fireEvent.press(imageBtn);
      const deleteImgBtn = getByTestId('Delete the profile picture');
      expect(deleteImgBtn).toBeDefined();
      fireEvent.press(deleteImgBtn);

      const continueBtn8 = getByTestId('continueBtn8');
      jest.spyOn(supabase.auth, 'updateUser').mockResolvedValue({
        error: {
          message: 'Invalid OTP',
          code: 'invalid_token',
          status: 401,
          name: 'Error',
        },
      });
      fireEvent.press(continueBtn8);

      //User selecting image from camera
    });
  });
});
