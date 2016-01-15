/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CLASS({
  name: 'Component',
  package: 'foam.ui.polymer.gen',

  requires: [
    'foam.ui.MultiLineStringArrayView'
  ],

  imports: [
    'ELLIPSIS',
    'shortenURL'
  ],

  ids: ['url'],

  constants: [
    {
      name: 'SRC_HTML_PREFIX',
      type: 'String',
      value: multiline(function() {/* <code> */})
    },
    {
      name: 'SRC_HTML_POSTFIX',
      type: 'String',
      value: multiline(function() {/* </code> */})
    }
  ],

  properties: [
    {
      type: 'String',
      name: 'url',
      tableFormatter: function(url, self, tableView) {
        return self.shortenURL(url);
      },
      required: true
    },
    {
      type: 'String',
      name: 'name',
      defaultValue: ''
    },
    {
      type: 'String',
      name: 'extends',
      defaultValue: ''
    },
    {
      type: 'String',
      name: 'tagName',
      defaultValue: ''
    },
    {
      type: 'String',
      name: 'source',
      view: 'foam.ui.MultiLineStringArrayView',
      tableFormatter: function(src, self, tableView) {
        var size = 128;
        var escapeHTML = self.X.XMLUtil.escape;
        var compSrc = /<\s*polymer-element[^>]*>[\s\S]*<\s*[/]\s*polymer-element\s*>/gm
            .exec(src) ||
            /<\s*script[^>]*>[\s\S]*<\s*[/]\s*script\s*>/gm
            .exec(src) ||
            /<\s*style[^>]*>[\s\S]*<\s*[/]\s*style\s*>/gm
            .exec(src);
        src = ((compSrc && compSrc[0]) || src);
        var cutSrc = src.slice(0, size);
        var srcPreview = '';
        if ( compSrc && compSrc.index ) srcPreview += self.ELLIPSIS + '\n';
        srcPreview += cutSrc;
        if ( cutSrc.length < src.length ) srcPreview += self.ELLIPSIS;
        return self.SRC_HTML_PREFIX +
            escapeHTML(srcPreview)
            .replace(/ /g, '&nbsp;')
            .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
            .replace(/\n/g, '<br />') +
            self.SRC_HTML_POSTFIX;
      },
      defaultValue: ''
    },
    {
      type: 'StringArray',
      name: 'deps',
      view: 'foam.ui.MultiLineStringArrayView',
      tableFormatter: function(arr, self, tableView) {
        return arr.map(self.shortenURL.bind(self)).join('<br />');
      },
      factory: function() {
        return [];
      }
    },
    {
      name: 'prototype',
      hidden: true
    }
  ],

  relationships: [
    {
      relatedModel: 'foam.ui.polymer.gen.ComponentProperty',
      relatedProperty: 'url'
    },
    {
      relatedModel: 'foam.ui.polymer.gen.PolymerPrototype',
      relatedProperty: 'tagName'
    }
  ],

  methods: [
  ]
});
