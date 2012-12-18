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
      postition: opt_skip || 0,
      blob: blob
    };
  },

  nextSlice_: function() {
    if (this.position >= this.blob.size)
      return null;

    // TODO what happens if we stop on a multibyte character boundary?

    var slice = this.blob;
    if ( this.position + 500 < this.blob.size ) {
      slice = slice.slice(this.postition, this.position + 4096);
      this.position += 500;
    } else {
      this.position = this.blob.size;
    }
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
        this.error = e;
      }
    };

    var reader = new FileReader();
    var self = this;

    reader.readAsText(slice);

    reader.onload = function(e) {
      callback && callback.put && callback.put(reader.result, null, fc);
      if (fc.aborted || fc.error) return;

      self.read(callback);
    };

    reader.onerror = function(e) {
      callback && callback.error && callback.error(e);
    };
  }
};
