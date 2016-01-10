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
  package: 'foam.dao',
  name: 'ChromeFile',

  ids: ['path'],

  constants: [
    {
      name: 'DIR_MIME_TYPE',
      value: ''
    },
    {
      name: 'DEFAULT_MIME_TYPE',
      value: 'text/plain'
    }
  ],

  properties: [
    {
      type: 'String',
      name: 'path',
      defaultValue: '',
      required: true
    },
    {
      type: 'String',
      name: 'parentPath',
      defaultValue: '',
      required: true
    },
    // {
    //   name: 'fileSystem',
    //   type: 'foam.dao.ChromeFileSystem',
    //   defaultValue: null
    // },
    // Directory only:
    {
      type: 'Boolean',
      name: 'isDirectory',
      defaultValue: false
    },
    {
      type: 'Array',
      name: 'entries',
      factory: function() { return []; }
    },
    // File only:
    {
      type: 'String',
      name: 'mimeType',
      defaultValue: ''
    },
    {
      name: 'contents',
      defaultValue: ''
    }
  ],

  relationships: [
    {
      relatedModel: 'foam.dao.ChromeFile',
      relatedProperty: 'parentPath'
    }
  ]

  // actions: [
  //   {
  //     name: 'expand',
  //     code: function() {
  //       if ( ! this.isDirectory ) return false;
  //       this.loadEntries();
  //       return true;
  //     }
  //   }
  // ],

  // methods: [
  //   {
  //     name: 'agetEntries',
  //     code: function() {
  //       if ( ! this.isDirectory ||
  //           ! this.fileSystem ||
  //           ! this.fileSystem.ready )
  //         return aconstant({ error: {
  //           message: 'Attempt to agetEntries in bad state'
  //         } });
  //       return this.fileSystem.aentries(this.path).aseq(function(ret, entries) {
  //         this.entries = entries;
  //         ret && ret(entries);
  //         return entries;
  //       }.bind(this));
  //     }
  //   },
  //   {
  //     name: 'agetContents',
  //     code: function() {
  //       if ( this.isDirectory ||
  //           ! this.fileSystem ||
  //           ! this.fileSystem.ready )
  //         return aconstant({ error: {
  //           message: 'Attempt to agetContents in bad state'
  //         } });
  //       return this.fileSystem.aread(this.path).aseq(function(ret, entries) {
  //         this.entries = entries;
  //         ret && ret(entries);
  //         return entries;
  //       }.bind(this));
  //     }
  //   }
  // ]
});
