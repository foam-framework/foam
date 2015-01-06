/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  name: 'Queue',
  package: 'foam.ui.polymer.gen',

  properties: [
    {
      model_: 'BooleanProperty',
      name: 'flushing',
      defaultValue: true
    },
    {
      name: 'data_',
      factory: function() { return []; }
    },
    {
      name: 'cursor_',
      defaultValue: 0
    }
  ],

  methods: [
    {
      name: 'put',
      code: function(data) {
        this.data_.push(data);
      }
    },
    {
      name: 'get',
      code: function(data) {
        if ( this.cursor_ >= this.data_.length ) {
          if ( this.cursor_ !== 0 ) {
            if ( this.flushing ) {
              this.data_ = [];
            }
            this.cursor_ = this.data_.length;
          }
          return undefined;
        }

        var rtn = this.data_[this.cursor_];
        ++this.cursor_;
        if ( this.cursor_ >= this.data_.length ) {
          if ( this.flushing ) {
            this.data_ = [];
          }
          this.cursor_ = this.data_.length;
        }
        return rtn;
      }
    }
  ]
});
