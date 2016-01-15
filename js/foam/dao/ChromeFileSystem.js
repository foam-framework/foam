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
  package: 'foam.dao',
  name: 'ChromeFileSystem',

  requires: [
    'foam.dao.ChromeFile',
  ],
  imports: [
    'console',
  ],

  properties: [
    {
      name: 'root',
      defaultValue: null
    },
    {
      name: 'rootChromeFile',
      type: 'foam.dao.ChromeFile',
      defaultValue: null
    },
    {
      type: 'String',
      name: 'suggestedDirName',
      defaultValue: ''
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'readyState',
      defaultValue: 'LOADING',
      choices: [
        ['LOADING', 'Loading'],
        ['CANCELLED', 'Cancelled'],
        ['READY', 'Ready']
      ]
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
        factory_: 'foam.ui.ChoiceView',
        choices: [
          'read-only',
          'read-write'
        ]
      }
    },
    {
      name: 'appWindow',
      lazyFactory: function() {
        return this.X.appWindow || window;
      },
    },
    {
      name: 'getDirectoryConfig',
      factory: function() { return { create: true, exclusive: false }; }
    },
    {
      name: 'readFileConfig',
      factory: function() { return { create: false }; }
    },
    {
      name: 'writeFileConfig',
      factory: function() { return { create: true, exclusive: false }; }
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.SUPER();

        Events.map(
            this.root$,
            this.rootChromeFile$,
            function(dirEntry) {
              return ! dirEntry ? null : this.ChromeFile.create({
                path: dirEntry.fullPath,
                parentPath: dirEntry.fullPath.slice(
                    0,
                    dirEntry.fullPath.lastIndexOf('/')),
                isDirectory: dirEntry.isDirectory
              });
            }.bind(this));

        var config = { type: 'openDirectory' };
        if ( this.suggestedDirName )
          config.suggestedName = this.suggestedDirName;
        var seq = [this.chooseEntry.bind(this, config)];
        if ( this.mode === 'read-write' )
          seq.push(this.getWritableEntry.bind(this));
        seq.push(this.putRoot.bind(this));
        return aseq.apply(null, seq)(this.updateReadyState.bind(this));
      }
    },
    {
      name: 'chooseEntry',
      code: function(config, ret) {
        with (this.appWindow) {
          chrome.fileSystem.chooseEntry(config, ret);
        }
      }
    },
    {
      name: 'getWritableEntry',
      code: function(ret, dirEntry) {
        if ( this.checkForError(dirEntry, ret, 'getWritableEntry') ) {
          return dirEntry;
        }
        with (this.appWindow) {
          chrome.fileSystem.getWritableEntry(dirEntry, ret);
        }
        return dirEntry;
      }
    },
    {
      name: 'putRoot',
      code: function(ret, dirEntry) {
        if ( this.checkForError(dirEntry, ret, 'putRoot') ) return dirEntry;
        this.root = dirEntry;
        this.clearError();
        ret && ret(dirEntry);
        return dirEntry;
      }
    },
    {
      name: 'updateReadyState',
      code: function(data) {
        console.log('ChromeFileSystem update ready state', data,
                   data.error ? 'CANCELLED' : 'READY');
        this.readyState = data.error ? 'CANCELLED' : 'READY';
      }
    },
    {
      name: 'awrite',
      code: function(rawPath, data, opt_mimeType) {
        if ( this.readyState !== 'READY' )
          throw 'Attempt to write before Chrome File System is ready';
        if ( this.mode !== 'read-write' ) throw 'Cannot write to ' +
            'non-read-write Chrome filesystem';
        var path = this.canonicalizePath(rawPath);
        if ( path[0] === '..' ) throw 'Cannot write to path: ' + path;
        var writeCtx = {
          path: '/' + path.join('/'),
          mimeType: opt_mimeType,
        };
        var seq = [];
        for ( var i = 0; i < path.length - 1; ++i ) {
          seq.push(this.getDirectory.bind(this, writeCtx, path[i]));
        }
        seq.push(this.getFile.bind(this, writeCtx, path[path.length - 1], this.writeFileConfig));
        seq.push(this.createWriter.bind(this, writeCtx));
        seq.push(this.truncateFile.bind(this, writeCtx));
        seq.push(this.writeFile.bind(this, writeCtx, data));
        return aseq.apply(null, seq);
      }
    },
    {
      name: 'aread',
      code: function(rawPath, opt_mimeType) {
        if ( this.readyState !== 'READY' )
          throw 'Attempt to read before Chrome File System is ready';
        console.log('aread', rawPath, opt_mimeType);
        var path = this.canonicalizePath(rawPath);
        if ( path[0] === '..' ) throw 'Cannot read from: ' + path;
        var readCtx = { mimeType: opt_mimeType };
        var seq = [];
        for ( var i = 0; i < path.length - 1; ++i ) {
          seq.push(this.getDirectory.bind(this, readCtx, path[i]));
        }
        seq.push(this.getFile.bind(this, readCtx, path[path.length - 1], this.readFileConfig));
        seq.push(this.getFile_.bind(this, readCtx));
        seq.push(this.readFile.bind(this, readCtx));
        return aseq.apply(null, seq);
      }
    },
    {
      name: 'aentries',
      code: function(rawPath, sink) {
        if ( this.readyState !== 'READY' )
          throw 'Attempt to get entries before Chrome File System is ready';
        var path = this.canonicalizePath(rawPath);
        if ( path[0] === '..' ) throw 'Cannot get entries from: ' + path;
        var readCtx = { sink: sink, entries: [] };
        var seq = [];
        for ( var i = 0; i < path.length; ++i ) {
          seq.push(this.getDirectory.bind(this, readCtx, path[i]));
        }
        seq.push(this.startReadEntries.bind(this, readCtx));
        seq.push(this.readMoreEntries.bind(this, readCtx));
        return aseq.apply(null, seq);
      }
    },
    {
      name: 'aentriesAll',
      code: function(rawPath, sink) {
        console.log('aentriesAll_', rawPath);
        var ctx = {
          sink: sink,
          future: afuture(),
          entries: []
        };
        var allSink = {
          put: function(X, o) {
            X.entries.push(o);
            X.sink && X.sink.put && X.sink.put(o);
          }.bind(this, ctx),
          error: function(X, e) {
            X.sink && X.sink.error && X.sink.error(e);
          }.bind(this, ctx)
        };
        this.aentriesAll_(ctx, rawPath, allSink);
        return ctx.future.get;
      }
    },
    {
      name: 'aentriesAll_',
      code: function(X, rawPath, sink) {
        console.log('aentriesAll_', rawPath);
        this.aentries(rawPath, sink)(function(X, sink, chromeFiles) {
          chromeFiles.forEach(function(X, sink, chromeFile) {
            if ( chromeFile.isDirectory ) {
              var properDirName = chromeFile.path.slice(
                  this.rootChromeFile.path.length);
              console.log('Recurse into dir', properDirName);
              this.aentriesAll_(X, properDirName, sink);
            }
          }.bind(this, X, sink));
        }.bind(this, X, sink));
      }
    },
    {
      name: 'startReadEntries',
      code: function(X, ret, dirEntry) {
        console.log('startReadEntries', dirEntry);
        if ( this.checkForError(dirEntry, undefined, 'startReadEntries') ) {
          X && X.sink && X.sink.error && X.sink.error(this.error);
          ret && ret(this.error);
          return dirEntry;
        }
        var dirReader = dirEntry.createReader();
        X.dirReader = dirReader;
        dirReader.readEntries(ret, ret);
        return dirReader;
      }
    },
    {
      name: 'readMoreEntries',
      code: function(X, ret, entries) {
        console.log('readMoreEntries', entries);
        if ( this.checkForError(entries, undefined, 'startReadEntries') ) {
          X && X.sink && X.sink.error && X.sink.error(this.error);
          ret && ret(this.error);
          return entries;
        }
        if ( ! entries.length ) {
          ret && ret(X.entries);
          return entries;
        }
        entries.forEach(function(X, entry) {
          var chromeFile = this.ChromeFile.create({
            path: entry.fullPath,
            parentPath: entry.fullPath.slice(
                0,
                entry.fullPath.lastIndexOf('/')),
            isDirectory: entry.isDirectory
          });
          if ( entry.isDirectory ) {
            X && X.sink && X.sink.put && X.sink.put(chromeFile);
            X.entries.push(chromeFile);
          } else {
            this.getFile_({}, function(chromeFile, file) {
              chromeFile.mimeType = file.type;
              X && X.sink && X.sink.put && X.sink.put(chromeFile);
              X.entries.push(chromeFile);
            }.bind(this, chromeFile), entry);
          }
        }.bind(this, X));
        var cb = this.readMoreEntries.bind(this, X, ret);
        X.dirReader.readEntries(cb, cb);
        return X.dirReader;
      }
    },
    {
      name: 'getDirectory',
      code: function(X, dirName, ret, dirEntry) {
        console.log('getDirectory', dirName, dirEntry);
        var source = dirEntry || this.root;
        if ( this.checkForError(source, ret, 'getDirectory') ) return source;
        return source.getDirectory(
            dirName,
            this.getDirectoryConfig,
            ret,
            ret);
      }
    },
    {
      name: 'getFile',
      code: function(X, fileName, config, ret, dirEntry) {
        console.log('getFile', fileName, dirEntry);
        var source = dirEntry || this.root;
        if ( this.checkForError(source, ret, 'getFile') ) return source;
        return source.getFile(
            fileName,
            config,
            ret,
            ret);
      }
    },
    {
      name: 'getFile_',
      code: function(X, ret, fileEntry) {
        console.log('getfile_', fileEntry);
        if ( this.checkForError(fileEntry, ret, 'getFile_') ) return fileEntry;
        X.fileEntry = fileEntry;
        return fileEntry.file(ret, ret);
      }
    },
    {
      name: 'readFile',
      code: function(X, ret, file) {
        console.log('readFile', file);
        if ( this.checkForError(file, ret, 'readFile') ) return file;
        if ( X.mimeType && file.type !== X.mimeType ) {
          var errMsg = 'Unexpected MIME type: "' + file.type + '" ' +
              '(expected "' + X.mimeType + '")';
          this.console.warn(errMsg);
          ret && ret({ error: { message: errMsg } });
          return file;
        }

        X.file = file;
        var fileReader = new FileReader();
        var cbX = Object.create(X);
        cbX.done = false;

        var cb = function(X, ret, e) {
          if ( X.done ) return;
          // TODO(markdittmer): We do not handle errors here (yet).
          var args = argsToArray(arguments);
          X.done = true;
          ret && ret.call(this, this.ChromeFile.create({
            path: X.fileEntry.fullPath,
            parentPath: X.fileEntry.fullPath.slice(
                0,
                X.fileEntry.fullPath.lastIndexOf('/')),
            isDirectory: false,
            mimeType: X.file.type,
            contents: e.target.result
          }));
        }.bind(this, cbX, ret);
        fileReader.onloadend = cb;
        fileReader.onerror = cb;
        fileReader.readAsText(file);
        return fileReader;
      }
    },
    {
      name: 'createWriter',
      code: function(X, ret, fileEntry) {
        console.log('createWriter', fileEntry);
        if ( this.checkForError(fileEntry, ret, 'crateWriter') )
          return fileEntry;
        fileEntry.createWriter(ret, ret);
        return fileEntry;
      }
    },
    {
      name: 'fileWriterOp',
      code: function(X, data, ret, fileWriter, op) {
        if ( this.checkForError(fileWriter, ret, 'fileWriterOp') )
          return fileWriter;
        var cbX = Object.create(X);
        cbX.done = false;
        cbX.contents = data;
        var cb = function(X, ret, e) {
          if ( X.done ) return;
          if ( this.isFileError(e) ) {
            this.error = e;
            X.error = e;
          }
          X.event = e;
          X.done = true;
          ret && ret.call(this, fileWriter);
        }.bind(this, cbX, ret);
        fileWriter.onwriteend = cb;
        fileWriter.onerror = cb;
        op(cbX, data, fileWriter);
        return fileWriter;
      }
    },
    {
      name: 'truncateFile',
      code: function(X, ret, fileWriter) {
        console.log('truncateFile', fileWriter);
        return this.fileWriterOp(X, '', ret, fileWriter, this.truncateFile_);
      }
    },
    {
      name: 'truncateFile_',
      code: function(X, data, fileWriter) {
        return fileWriter.truncate(0);
      }
    },
    {
      name: 'writeFile',
      code: function(X, data, ret, fileWriter) {
        console.log('writeFile', fileWriter);
        return this.fileWriterOp(X, data, ret, fileWriter, this.writeFile_);
      }
    },
    {
      name: 'writeFile_',
      code: function(X, data, fileWriter) {
        var contents;
        if ( data instanceof Blob )     contents = data;
        else if ( Array.isArray(data) ) contents = new Blob(data, {type: X.mimeType});
        else                            contents = new Blob([data], {type: X.mimeType});
        return fileWriter.write(contents);
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
        return o && o.constructor &&
            o.constructor.toString().indexOf('function FileError(') === 0;
      }
    },
    {
      name: 'checkForError',
      code: function(arg, ret, contextStr) {
        if ( chrome.runtime.lastError ) {
          this.error = chrome.runtime.lastError;
        } else if ( this.isFileError(arg) ) {
          this.error = arg;
        } else if ( ! arg ) {
          this.error = {
            message: 'Missing argument in context: "' + contextStr + '"'
          };
        }
        if ( this.error ) {
          ret ? ret({ error: this.error }) : this.console.error(this.error);
          return true;
        }
        return false;
      }
    },
    {
      name: 'clearError',
      code: function() { this.error = undefined; }
    }
  ]
});
