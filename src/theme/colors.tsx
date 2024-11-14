export interface Colors {
  primary: string;
  secondary: string;
  tertiary: string;
  black: string;
  white: string;
  pastelGreen: string;
  pastelRed: string;
  pageBg: string;
  lineColor: string;
  fontSubColor: string;
  gray: {
    light: string;
    medium: string;
    dark: string;
  };
}

const colors: Colors = {
  // primary: 'rgb(246, 87, 95)', // Red (Primary Theme For GimmeGift)
  primary: '#FF4659',
  secondary: '#fff', // White
  tertiary: '#22B3D1',
  black: '#000000',
  white: '#ffffff',
  pastelGreen: '#41B115',
  pastelRed: '#F7575F',
  pageBg: 'rgb(239,239,244)',
  lineColor: '#e2e2e7',
  fontSubColor: 'rgb(132 ,132 ,132)',
  gray: {
    light: '#f8f9fa',
    medium: '#cccccc',
    dark: '#343a40',
  },
};

export default colors;
