/*
 * Copyright 2012 Google Inc. All Rights Reserved.
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

var BlobReader = {
    create: function(blob, opt_buffersize, opt_skip) {
        return {
            __proto__: this,
            blob: blob,
            buffersize: opt_buffersize || 2048,
            position: opt_skip || 0
        };
    },

  nextSlice_: function() {
    if (this.position >= this.blob.size)
      return null;

    // TODO what happens if we stop on a multibyte character boundary?

    var slice = this.blob;
    var size = Math.min(this.buffersize, this.blob.size - this.position);
    slice = this.blob.slice(this.position, this.position + size);
    this.position += size;
    return slice;
  },

  read: function(sink) {
      slice = this.nextSlice_();

      if (!slice) {
          sink.eof && sink(slice);
          return;
      }
      sink.put && sink.put(slice);
  }
};

var TextReader = {
    create: function(reader) {
        return {
            __proto__: this,
            reader: reader,
            sink: sink
        }
    },

    read: function(sink) {
        var s = {
            __proto__: sink,
            put: function(blob) {
                var reader = new FileReader();
                var self = this;

                reader.readAsText(blob);

                reader.onload = function(e) {
                    self.__proto__.put && self.__proto__.put(reader.result);
                };

                reader.onerror = function(e) {
                    self.__proto__.error && self.__proto__.error(e);
                };
            }
        };
        this.reader.read(s);
    }
};

var LineBasedReader = {
    create: function(reader) {
        return {
            __proto__: this,
            reader: reader,
            index: 0,
            buffer: '',
        };
    },

    emitLine_: function() {
        for (; this.index < this.buffer.length; this.index++) {
            if (this.buffer[this.index] == '\n') {
                this.index++;
                var line = this.buffer.slice(0, this.index);
                this.buffer = this.buffer.slice(this.index);
                this.index = 0;
                this.sink.put && this.sink.put(line);
                return true;
            }
        }
        return false;
    },

    read: function(sink) {
        this.sink = sink;
        if (this.emitLine_()) return;
        this.reader.read(this);
    },

    put: function(data) {
        this.buffer += data;
        if (this.emitLine_()) return;
        this.reader.read(this);
    },

    eof: function() {
        this.sink.eof && this.sink.eof();
    }
};

var FullReader = {
    create: function(reader) {
        return {
            __proto__: this,
            reader: reader
        };
    },

    read: function(sink) {
        var reader = this.reader;
        var s = {
            __proto__: sink,
            put: function(data) {
                this.__proto__.put(data);
                reader.read(this);
            }
        };
        reader.read(s);
    }
};

var AsBlobReader = {
    create: function(reader) {
        return {
            __proto__: this,
            reader: reader
        };
    },

    read: function(sink) {
        var s = {
            __proto__: sink,
            put: function(buffer) {
                this.__proto__.put && this.__proto__.put(new Blob([buffer]));
            }
        };
        this.reader.read(s);
    }
};

var SocketReader = {
    create: function(socket, opt_buffersize) {
        return {
            __proto__: this,
            socket: socket,
            buffersize: opt_buffersize || 2048
        };
    },

    read: function(sink) {
        chrome.socket.read(this.socket.socketId, function(result) {
            if (result.resultCode < 0) {
                sink.error && sink.error(result.resultCode);
                return;
            }
            if (result.resultCode == 0) {
                sink.eof && sink.eof();
            }
            sink.put(result.data);
        });
    }
};

/**
 * <input type="file" id="fileinput">
 * reader = LineBasedReader.create(BufferedTextReader.create(document.getElementById("fileinput").files[0]))
 * reader.read(console.log);
 */

/*

MBOXLoader.dao = [];

reader = LineBasedReader.create(BufferedTextReader.create(document.getElementById("fileinput").files[0]))
reader.read(MBOXLoader);


 */