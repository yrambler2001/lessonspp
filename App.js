/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { useState, useMemo, Fragment, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';

import Test from './include/Test';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import iconv from 'iconv-lite';
// eslint-disable-next-line import/no-nodejs-modules
import { Buffer } from 'buffer';
import parse5 from 'parse5';
import _ from 'lodash';

const fetchJSON = url =>
  new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.onload = () => {
      if (request.status === 200) {
        resolve(iconv.decode(Buffer.from(request.response), 'windows-1251'));
      } else {
        reject(new Error(request.statusText));
      }
    };
    request.onerror = () => reject(new Error(request.statusText));
    request.responseType = 'arraybuffer';

    request.open('GET', url);
    request.setRequestHeader(
      'Content-type',
      'text/plain; charset=windows-1251',
    );
    request.send();
  });

function findNodeDFS(document, id) {
  for (const object of Array.isArray(document) ? document : [document]) {
    if (object && object.attrs && _.find(object.attrs, { value: id })) {
      return object;
    }
    const fromRecursive =
      object && object.childNodes && findNodeDFS(object.childNodes, id);
    if (fromRecursive) {
      return fromRecursive;
    }
  }
}

const App = () => {
  const [document, setDocument] = useState();

  useEffect(() => {
    const f = async () => {
      const document = await fetchJSON(
        'http://tntu.edu.ua/?p=uk/schedule&s=fis-sp21',
      ).then(xmlData => parse5.parse(xmlData));
      setDocument(document);
    };
    f();
  }, []);

  const table = useMemo(
    () => document && findNodeDFS(document, 'ScheduleWeek'),
    [document],
  );

  console.log(table);

  return <Test />;
};

// const styles = StyleSheet.create({
//   scrollView: {
//     backgroundColor: Colors.lighter,
//   },
//   engine: {
//     position: 'absolute',
//     right: 0,
//   },
//   body: {
//     backgroundColor: Colors.white,
//   },
// });

export default gestureHandlerRootHOC(App);
