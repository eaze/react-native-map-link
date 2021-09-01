/**
 * React Native Map Link
 */

import {Platform} from 'react-native';

export const isIOS = Platform.OS === 'ios';

export function generatePrefixes(options) {
  return {
    'apple-maps': isIOS ? 'maps://' : 'applemaps://',
    'google-maps': prefixForGoogleMaps(options.alwaysIncludeGoogle),
    waze: 'waze://',
  };
}

export function prefixForGoogleMaps(alwaysIncludeGoogle) {
  return isIOS && !alwaysIncludeGoogle
    ? 'comgooglemaps://'
    : 'https://www.google.com/maps/';
}

export function generateTitles(titles) {
  return {
    'apple-maps': 'Apple Maps',
    'google-maps': 'Google Maps',
    waze: 'Waze',
    ...(titles || {}),
  };
}

export const icons = {
  'apple-maps': require('./images/apple-maps.png'),
  'google-maps': require('./images/google-maps.png'),
  waze: require('./images/waze.png'),
};

export const appKeys = Object.keys(icons);
