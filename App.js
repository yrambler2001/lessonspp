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
      } else { reject(new Error(request.statusText)); }
    };
    request.onerror = () => reject(new Error(request.statusText));
    request.responseType = 'arraybuffer';

    request.open('GET', url);
    request.setRequestHeader('Content-type', 'text/plain; charset=windows-1251');
    request.send();
  });

function findNodeDFS(document, { tag, name, value, isMulti }, accumulator = [],
) {
  for (const object of Array.isArray(document) ? document : [document]) {
    if (object &&
      (tag ? object.tagName === tag || object.tag === tag || object.nodeName === tag : true) &&
      (name && value ? object.attrs && _.find(object.attrs, { value, name }) : true)
    ) { if (isMulti) { accumulator.push(object); } else { return object; } }
    const fromRecursive = object && object.childNodes &&
      findNodeDFS(object.childNodes, { tag, name, value, isMulti }, accumulator);
    if (fromRecursive && !isMulti) {
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

  const isFirstWeek = useMemo(() => {
    if (document) {
      const h3 = findNodeDFS(document, { tag: 'h3', name: 'class', value: 'Black', });
      const isFirstWeek = _.find(h3.childNodes, child => _.includes(child.value, 'перший'));
      const isSecondWeek = _.find(h3.childNodes, child => _.includes(child.value, 'другий'));
      if (!(isFirstWeek || isSecondWeek)) { alert('invalid week'); }
      return !!isFirstWeek;
    }
  }, [document]);

  const table = useMemo(() => document && findNodeDFS(document, { tag: 'table', name: 'id', value: 'ScheduleWeek', }), [document]);

  const willRenameLater = useMemo(() => {
    if (table) {
      const linesInTable = []; findNodeDFS(table, { tag: 'tr', isMulti: true }, linesInTable);

      const iHeader = []
      const q = 0;
      let k = 0;
      const headr = []; findNodeDFS(linesInTable[0], { tag: 'th', isMulti: true }, headr);
      headr.forEach((header, index) => {
        const countOfGroupsInRow = (_.find(header.attrs, { name: 'colspan', value: '2' })) ? 2:1
        iHeader[index] = countOfGroupsInRow;
        k += 1;
        iHeader[index] = countOfGroupsInRow;
        k += 1;
      })
      debugger;
    }
  }, [table]);

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
