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
   "package": "com.google.mail",
   "name": "QueryParser",
   "requires": [
      "foam.lib.email.EMail"
   ],
   "properties": [
      {
         model_: "Property",
         "name": "parser",
         "lazyFactory": function () {
        var EMail = this.EMail;
        var parser = {
          __proto__: QueryParserFactory(EMail),

          id: sym('string'),

          labelMatch: seq(alt('label','l'), alt(':', '='), sym('valueList'))
        }.addActions({
          id: function(v) {
            return OR(
              CONTAINS_IC(EMail.TO, v),
              CONTAINS_IC(EMail.FROM, v),
              CONTAINS_IC(EMail.SUBJECT, v),
              CONTAINS_IC(EMail.BODY, v));
          },

          labelMatch: function(v) {
            var or = OR();
            var values = v[2];
            for ( var i = 0 ; i < values.length ; i++ ) {
              or.args.push(EQ(EMail.LABELS, values[i]))
            }
            return or;
          }
        });

        parser.expr = alt(
          sym('labelMatch'),
          parser.export('expr')
        );

        return parser;
      }
      }
   ],
   "actions": [],
   "constants": [],
   "messages": [],
   "methods": [],
   "listeners": [],
   "templates": [],
   "models": [],
   "tests": [],
   "relationships": [],
   "issues": []
});
