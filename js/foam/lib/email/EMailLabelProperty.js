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
  "package": "foam.lib.email",
  "name": "EMailLabelProperty",
  "extends": "BooleanProperty",
  "properties": [
    {
      "name": "setter",
      "defaultValue": function (v, name) {
        var old = this.v;
        var label = this.model_[constantize(name)].labelName;
        if ( v ) this.addLabel(label); else this.removeLabel(label);
        this.propertyChange_(this.propertyTopic(name), old, v);
      }
    },
    {
      "name": "getter",
      "defaultValue": function (name) {
        var label = this.model_[constantize(name)].labelName;
        return this.hasLabel(label);
      }
    }
  ]
});
