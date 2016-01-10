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
  package: 'foam.patterns.layout',
  name: 'ConstraintProperty',
  extends: 'Property',

  documentation: function() {/* Stores an integer pixel value or percentage.
    For percentages, a layoutPixelSize is imported. Export this from your
    layout items from total layout width or height depending on orientation. */},

  properties: [
    {
      name: 'view',
      defaultValue: 'foam.ui.TextFieldView'
    },
    {
      name: 'install',
      defaultValue: function(prop) {
        // define a shared 'total size' property
        this.defineProperty(
          {
            type: 'Int',
            name: 'constraintValue_TotalSize_',
            defaultValue: 0,
            hidden: true,
            documentation: function() { /* This is set by the layout implementation before
              performing a layout operation. */ },
          }
        );

        this.defineProperty(
          {
            type: 'Int',
            name: prop.name+"$Pix",
            defaultValue: 0,
            hidden: true,
            documentation: function() { /* The calculated pixel size. */ },
          }
        );

        var actualInit = this.init;
        this.init = function() {
          // this is now the instance
          var self = this;
          var pixFn = function(self, prop) {
            var propVal = self[prop];
            if ((typeof propVal === 'string' && propVal.indexOf('%') !== -1)) {
              return (parseInt(propVal.replace('%','') || 0) / 100) * self.constraintValue_TotalSize_;
            } else {
              return parseInt(propVal || 0);
            }
          };

          // bind each prop.nameerty that needs updates on pixel total size
          self.constraintValue_TotalSize_$.addListener(function(self, msg) {
            self[prop.name+"$Pix"] = pixFn(self, prop.name);
          }.bind(self));
          self[prop.name+"$"].addListener(function(self, msg) {
            self[prop.name+"$Pix"] = pixFn(self, prop.name);
          }.bind(self));

          actualInit.apply(this, arguments);
        }
      }
    }
  ]
});
