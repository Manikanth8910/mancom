import '@testing-library/react-native/extend-expect';

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-keychain', () => ({
    setGenericPassword: jest.fn(),
    getGenericPassword: jest.fn(),
    resetGenericPassword: jest.fn(),
}));

jest.mock('redux-persist', () => {
    const real = jest.requireActual('redux-persist');
    return {
        ...real,
        persistReducer: jest.fn().mockImplementation((config, reducers) => reducers),
    };
});
