/*
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
   "package": "foam.util.encodings",
   "name": "QuotedPrintable",

   "properties": [],
   "actions": [],
   "constants": [],
   "messages": [],
   "methods": [
      {
         model_: "Method",
         "name": "encode",
         "code": function (str) {
    },
         "args": []
      },
      {
         model_: "Method",
         "name": "decode",
         "code": function (str, decoder) {
      var result = "";

      var normal = function(s) {
        if ( s === '=' ) state = quoted;
        else result += s;
      };

      var quoted = (function() {
        var buffer = "";
        var index = 0;

        return function(s) {
          if ( s === '\r' || s === '\n' ) {
            index = 0;
            state = normal;
            return;
          }

          buffer += s;
          index++;

          if ( index == 2 ) {
            decoder.put(parseInt(buffer, 16));
            if ( decoder.remaining == 0 ) {
              result += decoder.string;
              decoder.reset();
            }
            buffer = "";
            index = 0;
            state = normal;
          }
        };
      })();

      var state = normal;

      for ( var i = 0; i < str.length; i++ ) {
        state(str[i]);
      }

      return result;
    },
         "args": []
      }
   ],
   "listeners": [],
   "templates": [],
   "models": [],
   "tests": [],
   "relationships": [],
   "issues": []
});
