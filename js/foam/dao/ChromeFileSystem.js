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

MODEL({
  name: 'ChromeFileSystem',
  package: 'foam.dao',

  properties: [
    {
      name: 'cfs',
      factory: function() {
        return chrome.fileSystem;
      }
    },
    {
      model_: 'StringProperty',
      name: 'suggestedDirName',
      defaultValue: ''
    },
    {
      model_: 'BooleanProperty',
      name: 'ready',
      defaultValue: false
    },
    {
      name: 'error',
      defaultValue: undefined
    },
    {
      model_:  'StringProperty',
      name:  'mode',
      defaultValue: 'read-write',
      view: {
        factory_: 'ChoiceView',
        choices: [
          'read-only',
          'read-write'
        ]
      }
    },
    {
      name: 'getDirectoryConfig',
      factory: function() { return { create: true, exclusive: false }; }
    },
    {
      name: 'getFileConfig',
      factory: function() { return { create: true, exclusive: false }; }
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.SUPER();
        var config = { type: 'openDirectory' };
        if ( this.suggestedDirName )
          config.suggestedName = this.suggestedDirName;
        var seq = [this.chooseEntry.bind(this, config)];
        if ( this.mode === 'read-write' )
          seq.push(this.getWritableEntry.bind(this));
        seq.push(this.putRoot.bind(this));
        return aseq.apply(null, seq)();
      }
    },
    {
      name: 'chooseEntry',
      code: function(config, ret) {
        this.cfs.chooseEntry(config, ret);
      }
    },
    {
      name: 'getWritableEntry',
      code: function(ret, dirEntry) {
        if ( chrome.runtime.lastError ) {
          this.error = chrome.runtime.lastError;
        }
        if ( ! dirEntry || this.error ) ret(this.error);
        this.cfs.getWritableEntry(dirEntry, ret);
      }
    },
    {
      name: 'putRoot',
      code: function(ret, dirEntry) {
        if ( chrome.runtime.lastError ) {
          this.error = chrome.runtime.lastError;
        }
        if ( ! dirEntry || this.error ) {
          ret(this.error);
          return this.error;
        }
        this.root = dirEntry;
        this.ready = true;
        this.error = undefined;
        ret && ret(dirEntry);
        return dirEntry;
      }
    },
    {
      name: 'write',
      code: function(rawPath, data) {
        if ( this.mode !== 'read-write' ) throw 'Cannot write to ' +
            'non-read-write Chrome filesystem';
        var path = this.canonicalizePath(rawPath);
        if ( path[0] === '..' ) throw 'Cannot write to path: ' + path;
        var seq = [];
        for ( var i = 0; i < path.length - 1; ++i ) {
          seq.push(this.getDirectory.bind(this, path[i]));
        }
        seq.push(this.getFile.bind(this, path[path.length - 1]));
        seq.push(this.createWriter.bind(this));
        seq.push(this.writeFile.bind(this, data));
        return aseq.apply(null, seq)();
      }
    },
    {
      name: 'read',
      code: function(rawPath) {
        var path = this.canonicalizePath(rawPath);
        if ( path[0] === '..' ) throw 'Cannot read from: ' + path;
        var seq = [];
        for ( var i = 0; i < path.length - 1; ++i ) {
          seq.push(this.getDirectory.bind(this, path[i]));
        }
        seq.push(this.getFile.bind(this, path[path.length - 1]));
        seq.push(this.getFile_.bind(this));
        seq.push(this.readFile.bind(this));
        return aseq.apply(null, seq)(function(e) {
          console.log('Got file read', e.target.result);
        }.bind(this));
      }
    },
    {
      name: 'getDirectory',
      code: function(dirName, ret, dirEntry) {
        if ( this.isFileError(dirEntry) ) {
          this.error = dirEntry;
          ret(this.error);
          return this.error;
        }
        return (dirEntry || this.root).getDirectory(
            dirName,
            this.getDirectoryConfig,
            ret,
            ret);
      }
    },
    {
      name: 'getFile',
      code: function(fileName, ret, dirEntry) {
        if ( this.isFileError(dirEntry) ) {
          this.error = dirEntry;
          ret(this.error);
          return this.error;
        }
        return (dirEntry || this.root).getFile(
            fileName,
            this.getFileConfig,
            ret,
            ret);
      }
    },
    {
      name: 'getFile_',
      code: function(ret, fileEntry) {
        if ( this.isFileError(fileEntry) ) {
          this.error = fileEntry;
          ret(this.error);
          return this.error;
        }
        if ( ! fileEntry ) return undefined;
        return fileEntry.file(ret, ret);
      }
    },
    {
      name: 'readFile',
      code: function(ret, file) {
        if ( this.isFileError(file) ) {
          this.error = file;
          ret(this.error);
          return this.error;
        }
        var fileReader = new FileReader();
        var X = { done: false };
        var cb = function(X, ret) {
          if ( X.done ) return;
          var args = argsToArray(arguments);
          X.done = true;
          ret && ret.apply(this, args.slice(2));
        }.bind(this, X, ret);
        fileReader.onloadend = cb;
        fileReader.onerror = cb;
        fileReader.readAsText(file);
        return fileReader;
      }
    },
    {
      name: 'createWriter',
      code: function(ret, fileEntry) {
        if ( this.isFileError(fileEntry) ) {
          this.error = fileEntry;
          ret(this.error);
          return this.error;
        }
        fileEntry.createWriter(ret, ret);
        return fileEntry;
      }
    },
    {
      name: 'writeFile',
      code: function(data, ret, fileWriter) {
        if ( this.isFileError(fileWriter) ) {
          this.error = fileWriter;
          ret(this.error);
          return this.error;
        }
        var X = { done: false };
        var cb = function(X, ret) {
          if ( X.done ) return;
          var args = argsToArray(arguments);
          X.done = true;
          ret && ret.apply(this, args.slice(2));
        }.bind(this, X, ret);
        fileWriter.onwriteend = cb;
        fileWriter.onerror = cb;
        fileWriter.write(new Blob([data], {type: 'text/plain'}));
        return fileWriter;
      }
    },
    {
      name: 'canonicalizePath',
      code: function(path) {
        var parts = path.split('/').filter(function(part) {
          return part !== '.';
        });
        for ( var i = 1; i < parts.length; ++i ) {
          if ( i > 0 && parts[i] === '..' && parts[i - 1] !== '..' ) {
            parts = parts.slice(0, i - 1).concat(parts.slice(i + 1));
            i = i - 2;
          }
        }
        return parts;
      }
    },
    {
      name: 'isFileError',
      code: function(o) {
        if ( ! o ) return false;
        return Object.getPrototypeOf(o) === FileError.prototype;
      }
    }
  ]
});
