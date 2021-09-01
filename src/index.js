/**
 * React Native Map Link
 */

import {Linking} from 'react-native';

import {generatePrefixes, generateTitles} from './constants';
import {askAppChoice, checkOptions} from './utils';

/**
 * Open a maps app, or let the user choose what app to open, with the given location.
 *
 * @param {{
 *     latitude: number | string,
 *     longitude: number | string,
 *     sourceLatitude: number | undefined | null,
 *     sourceLongitude: number | undefined | null,
 *     alwaysIncludeGoogle: boolean | undefined | null,
 *     googleForceLatLon: boolean | undefined | null,
 *     googlePlaceId: number | undefined | null,
 *     title: string | undefined | null,
 *     app: string | undefined | null
 *     dialogTitle: string | undefined | null
 *     dialogMessage: string | undefined | null
 *     cancelText: string | undefined | null
 *     appsWhiteList: array | undefined | null
 *     appTitles: object | undefined | null
 *     naverCallerName: string | undefined
 * }} options
 */
export async function showLocation(options) {
  const prefixes = generatePrefixes(options);
  checkOptions(options, prefixes);

  let useSourceDestiny = false;
  let sourceLat;
  let sourceLng;
  let sourceLatLng;

  if ('sourceLatitude' in options && 'sourceLongitude' in options) {
    useSourceDestiny = true;
    sourceLat = parseFloat(options.sourceLatitude);
    sourceLng = parseFloat(options.sourceLongitude);
    sourceLatLng = `${sourceLat},${sourceLng}`;
  }

  const dstaddr =
    options.dstaddr && options.dstaddr.length ? options.dstaddr : null;
  const encodedDstaddr = dstaddr ? encodeURIComponent(dstaddr) : null;
  const lat = parseFloat(options.latitude);
  const lng = parseFloat(options.longitude);
  const latlng = `${lat},${lng}`;
  const title = options.title && options.title.length ? options.title : null;
  const encodedTitle = encodeURIComponent(title);
  let app = options.app && options.app.length ? options.app : null;
  const dialogTitle =
    options.dialogTitle && options.dialogTitle.length
      ? options.dialogTitle
      : 'Open in Maps';
  const dialogMessage =
    options.dialogMessage && options.dialogMessage.length
      ? options.dialogMessage
      : 'What app would you like to use?';
  const cancelText =
    options.cancelText && options.cancelText.length
      ? options.cancelText
      : 'Cancel';
  const appsWhiteList =
    options.appsWhiteList && options.appsWhiteList.length
      ? options.appsWhiteList
      : null;

  if (!app) {
    app = await askAppChoice({
      dialogTitle,
      dialogMessage,
      cancelText,
      appsWhiteList,
      prefixes,
      appTitles: generateTitles(options.appTitles),
    });
  }

  let url = null;

  switch (app) {
    case 'apple-maps':
      url = prefixes['apple-maps'];
      if (dstaddr) {
        url += `?q=${title ? encodedTitle : 'Location'}`;
        url += `&daddr=${encodedDstaddr}`;
        url += useSourceDestiny ? `&saddr=${sourceLatLng}` : '';
      } else {
        url = useSourceDestiny
          ? `${url}?saddr=${sourceLatLng}&daddr=${latlng}`
          : `${url}?ll=${latlng}`;
        url += `&q=${title ? encodedTitle : 'Location'}`;
      }
      break;
    case 'google-maps':
      if (dstaddr) {
        url = 'https://www.google.com/maps/dir/?api=1';
        url += useSourceDestiny ? `&saddr=${sourceLatLng}` : '';
        url += `&destination=${encodedDstaddr}`;
        url += '&directionsmode=driving';
      } else {
        // Always using universal URL instead of URI scheme since the latter doesn't support all parameters (#155)
        url = 'https://www.google.com/maps/dir/?api=1';
        if (useSourceDestiny) {
          url += `&origin=${sourceLatLng}`;
        }
        if (!options.googleForceLatLon && title) {
          url += `&destination=${encodedTitle}`;
        } else {
          url += `&destination=${latlng}`;
        }

        url += options.googlePlaceId
          ? `&destination_place_id=${options.googlePlaceId}`
          : '';
      }
      break;
    case 'waze':
      if (dstaddr) {
        url = `${prefixes.waze}?`;
        url += `&q=${encodedDstaddr}`;
        url += `&navigate=yes`;
      } else {
        url = `${prefixes.waze}?ll=${latlng}&navigate=yes`;
        if (title) {
          url += `&q=${encodedTitle}`;
        }
      }
      break;
  }

  if (url) {
    return Linking.openURL(url).then(() => Promise.resolve(app));
  }
}
