import {showLocation} from '../src/index';
import {Linking} from 'react-native';

jest.mock('react-native', () => ({
  Linking: {
    openURL: jest.fn(),
  },
  Platform: {
    OS: 'ios',
  },
}));

describe('showLocation', () => {
  const latitude = 123;
  const longitude = 234;
  const sourceLatitude = 567;
  const sourceLongitude = 890;

  beforeEach(() => {
    Linking.openURL.mockClear();
  });

  const verifyThatSettingsLeadToUrl = (settings, url) => {
    showLocation(settings);
    expect(Linking.openURL).toHaveBeenCalledWith(url);
  };

  describe('apple-maps', () => {
    it('opens with correct url if source is not provided', () => {
      verifyThatSettingsLeadToUrl(
        {
          latitude,
          longitude,
          app: 'apple-maps',
        },
        'maps://?ll=123,234&q=Location',
      );
    });

    it('opens with correct url if source is provided', () => {
      verifyThatSettingsLeadToUrl(
        {
          latitude,
          longitude,
          sourceLatitude,
          sourceLongitude,
          app: 'apple-maps',
        },
        'maps://?saddr=567,890&daddr=123,234&q=Location',
      );
    });

    it('opens with correct url if dstaddr is provided', () => {
      verifyThatSettingsLeadToUrl(
        {
          dstaddr: '123 Test St, Orlando, 32826',
          app: 'apple-maps',
        },
        'maps://?q=Location&daddr=123%20Test%20St%2C%20Orlando%2C%2032826',
      );
    });
  });

  describe('google-maps', () => {
    it('opens with correct url if source is not provided', () => {
      verifyThatSettingsLeadToUrl(
        {
          latitude,
          longitude,
          app: 'google-maps',
        },
        'https://www.google.com/maps/dir/?api=1&destination=123,234',
      );
    });

    it('opens with correct url if source is provided', () => {
      verifyThatSettingsLeadToUrl(
        {
          latitude,
          longitude,
          sourceLatitude,
          sourceLongitude,
          app: 'google-maps',
        },
        'https://www.google.com/maps/dir/?api=1&origin=567,890&destination=123,234',
      );
    });

    it('opens with correct url if dstaddr is provided', async () => {
      verifyThatSettingsLeadToUrl(
        {
          dstaddr: '123 Test St, Orlando, 32826',
          app: 'google-maps',
        },
        'https://www.google.com/maps/dir/?api=1&destination=123%20Test%20St%2C%20Orlando%2C%2032826&directionsmode=driving',
      );
    });
  });

  describe('waze', () => {
    it('opens with correct url if source is not provided', () => {
      verifyThatSettingsLeadToUrl(
        {
          latitude,
          longitude,
          app: 'waze',
        },
        'waze://?ll=123,234&navigate=yes',
      );
    });

    it('opens with correct url if source is provided', () => {
      verifyThatSettingsLeadToUrl(
        {
          latitude,
          longitude,
          sourceLatitude,
          sourceLongitude,
          app: 'waze',
        },
        'waze://?ll=123,234&navigate=yes',
      );
    });

    it('opens with correct url if dstaddr is provided', () => {
      verifyThatSettingsLeadToUrl(
        {
          dstaddr: '123 Test St, Orlando, 32826',
          app: 'waze',
        },
        'waze://?&q=123%20Test%20St%2C%20Orlando%2C%2032826&navigate=yes',
      );
    });
  });
});
