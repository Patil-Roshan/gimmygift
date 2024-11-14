import 'react-native';
import React from 'react';

import {it} from '@jest/globals';
import renderer from 'react-test-renderer';

import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {supabase} from '../src/lib/supabase';
import RegistrationKids from '../src/screens/Registration/registrationKids';

describe('RegistrationKids', () => {
  it('App renders correctly', () => {
    renderer.create(<RegistrationKids />);
  });

  it('User presses back on signup screen', async () => {
    const {getByTestId} = render(<RegistrationKids />);
    const backBtn = getByTestId('backBtn');
    fireEvent.press(backBtn);
  });

  it('Input events updates state correctly', () => {
    const {getByTestId} = render(<RegistrationKids />);

    const input = getByTestId('nameInput');

    fireEvent.changeText(input, 'test');
    expect(input.props.defaultValue).toBe('test');
  });

  it('User tries to signup without name', async () => {
    const {getByTestId, getByText} = render(<RegistrationKids />);

    const nameInput = getByTestId('nameInput');
    const surnameInput = getByTestId('surnameInput');

    const button = getByTestId('sendOTPBtn');
    fireEvent.press(button);
    const inputError = getByText('Please enter valid name');
    expect(inputError).toBeDefined();

    //If user tries to signup without surname

    fireEvent.changeText(nameInput, 'test');
    const button2 = getByTestId('sendOTPBtn');
    fireEvent.press(button2);
    const surnameError = getByText('Please enter valid surname');
    expect(surnameError).toBeDefined();

    fireEvent.changeText(surnameInput, 'test');
    fireEvent.press(button2);

    //Step 2
    //If user presses submit without selecting gender
    const continueBtn2 = getByTestId('continueBtn2');
    fireEvent.press(continueBtn2);
    const genderError = getByText('Please select gender');
    expect(genderError).toBeDefined();

    const genderBtn = getByTestId('Daughter');
    fireEvent.press(genderBtn);

    fireEvent.press(continueBtn2);

    //Step 3
    const continueBtn3 = getByTestId('continueBtn3');

    fireEvent.press(continueBtn3);

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

      //User selecting image from camera
    });

    //Step 4
    const continueBtn4 = getByTestId('continueBtn4');
    jest.spyOn(supabase.storage, 'from').mockReturnValue({
      getPublicUrl: jest.fn().mockResolvedValue({
        data: {
          publicUrl: 'mocked_public_url',
        },
        error: null,
      }),
    });

    const mockedPublicUrl = 'https://mocked-storage.com/image.jpg';
    jest.spyOn(supabase.storage, 'getPublicUrl').mockReturnValueOnce({
      data: {publicUrl: mockedPublicUrl},
      error: null,
    });

    // Mock `supabase.storage.upload` with successful response
    jest.spyOn(supabase.storage, 'upload').mockReturnValueOnce({
      data: [{url: mockedPublicUrl}], // No error
      error: null,
    });

    fireEvent.press(continueBtn4);
  });
});
