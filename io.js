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

var BufferedTextReader = {
  create: function(blob, opt_buffersize, opt_skip) {
    return {
      __proto__: this,
      buffersize: opt_buffersize || 4096,
      position: opt_skip || 0,
      blob: blob
    };
  },

  nextSlice_: function() {
    if (this.position >= this.blob.size)
      return null;

    // TODO what happens if we stop on a multibyte character boundary?

    var slice = this.blob;
    var size = Math.min(this.buffersize, this.blob.size - this.position)
    slice = this.blob.slice(this.position, this.position + size);
    this.position += size;
    return slice;
  },

  read: function(callback) {
    slice = this.nextSlice_();

    if (!slice) {
      callback && callback.eof && callback.eof();
      return;
    }

    var fc = {
      abort: function() {
        this.aborted = true;
      },
      error: function(e) {
        this.errorEvt = e;
      }
    };

    var reader = new FileReader();
    var self = this;

    reader.readAsText(slice);

    reader.onload = function(e) {
      callback && callback.put && callback.put(reader.result, fc);
      if (fc.aborted || fc.errorEvt) return;

      self.read(callback);
    };

    reader.onerror = function(e) {
      callback && callback.error && callback.error(e);
    };
  }
};

var LineBasedReader = {
    create: function(reader) {
        return {
            __proto__: this,
            reader: reader,
            index: 0
        };
    },

    put: function(blob, fc) {
        this.buffer += blob;
        this.fc = fc;
        for (; this.index < this.buffer.length; this.index++) {
            if (fc.stopped || fc.errorEvt) break;

            if (this.buffer[this.index] == '\n') {
                this.index++;
                var line = this.buffer.slice(0, this.index);
                this.buffer = this.buffer.slice(this.index);
                this.index = 0;
                this.callback.put(line, fc);
            }
        }
    },

    eof: function() {
        if (this.buffer.length > 0) {
            if (!this.fc.stopped && !this.fc.errorEvt) {
                this.callback.put(this.buffer, this.fc);
            }
        }
        this.callback.eof && this.callback.eof();
    },

    read: function(callback) {
        this.callback = callback;
        this.reader.read(this);
    }
};

/**
 * <input type="file" id="fileinput">
 * reader = LineBasedReader.create(BufferedTextReader.create(document.getElementById("fileinput").files[0]))
 * reader.read(console.log);
 */