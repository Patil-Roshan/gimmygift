jest.useFakeTimers();
// jest.mock('react-native-image-crop-picker', () => ({
//   openPicker: jest.fn(),
//   openCamera: jest.fn(),
// }));

jest.mock('react-native-image-crop-picker', () => ({
  openPicker: jest.fn(() => Promise.resolve({path: 'mocked_image_path'})),
  openCamera: jest.fn(() => Promise.resolve({path: 'mocked_image_path'})),
}));

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

jest.mock('@react-navigation/native');

jest.mock('react-native-share', () => ({
  open: jest.fn().mockResolvedValue(), // Return a resolved Promise
}));
// jest.setup.js
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(key => Promise.resolve(mockedData[key])),
  setItem: jest.fn((key, value) => Promise.resolve()),
  removeItem: jest.fn(key => Promise.resolve()),
  // Mock other AsyncStorage methods as needed
}));

const mockedData = {
  // Key-value pairs to simulate stored data
};

jest.mock('react-native-fs', () => {
  return {
    mkdir: jest.fn(),
    moveFile: jest.fn(),
    copyFile: jest.fn(),
    pathForBundle: jest.fn(),
    pathForGroup: jest.fn(),
    getFSInfo: jest.fn(),
    getAllExternalFilesDirs: jest.fn(),
    unlink: jest.fn(),
    exists: jest.fn(),
    stopDownload: jest.fn(),
    resumeDownload: jest.fn(),
    isResumable: jest.fn(),
    stopUpload: jest.fn(),
    completeHandlerIOS: jest.fn(),
    readDir: jest.fn(),
    readDirAssets: jest.fn(),
    existsAssets: jest.fn(),
    readdir: jest.fn(),
    setReadable: jest.fn(),
    stat: jest.fn(),
    readFile: jest.fn(),
    read: jest.fn(),
    readFileAssets: jest.fn(),
    hash: jest.fn(),
    copyFileAssets: jest.fn(),
    copyFileAssetsIOS: jest.fn(),
    copyAssetsVideoIOS: jest.fn(),
    writeFile: jest.fn(),
    appendFile: jest.fn(),
    write: jest.fn(),
    downloadFile: jest.fn(),
    uploadFiles: jest.fn(),
    touch: jest.fn(),
    MainBundlePath: jest.fn(),
    CachesDirectoryPath: jest.fn(),
    DocumentDirectoryPath: jest.fn(),
    ExternalDirectoryPath: jest.fn(),
    ExternalStorageDirectoryPath: jest.fn(),
    TemporaryDirectoryPath: jest.fn(),
    LibraryDirectoryPath: jest.fn(),
    PicturesDirectoryPath: jest.fn(),
  };
});

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

jest.mock('./App', () => {
  return {
    __esModule: true,
    default: () => <mocked-App />,
  };
});

jest.mock('@supabase/supabase-js', () => {
  let testData = [
    {
      id: 'mockedRoleId',
      org_users: [{id: 'mockUserId', status: 'active'}],
    },
  ];

  return {
    createClient: jest.fn().mockImplementation(() => {
      return {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockImplementation(() => ({
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnThis(),
          is: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          data: testData,
          error: null,
        })),
        update: jest.fn().mockImplementation(() => ({
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnThis(),
          is: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          data: testData,
          error: null,
        })),
        auth: {
          signInWithOtp: jest.fn().mockReturnThis(),
          verifyOtp: jest.fn().mockReturnThis(),
          updateUser: jest.fn().mockReturnThis(),
        },
        insert: jest
          .fn()
          .mockImplementation(() => Promise.resolve({data: [], error: null})),

        storage: {
          from: jest.fn().mockReturnThis(),
          upload: jest.fn().mockResolvedValue({
            // Mocking the 'upload' method
            error: null, // No error
          }),
          getPublicUrl: jest.fn().mockResolvedValue({
            data: {publicUrl: 'mocked_public_url'},
            // error: null,
          }),
        },
      };
    }),
    setTestData: newData => {
      testData = newData;
    },
  };
});

jest.mock('@react-navigation/core', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock('react-native-country-picker-modal');
