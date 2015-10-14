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
  package: 'foam.ui',
  name: 'CSSLoaderTrait',

  documentation: function() {/*
    Loads CSS the same way foam.ui.View does. Use only where you have CSS to load that
    can't be placed inside a view.
  */},

  properties: [
    {
      model_: 'foam.core.types.DocumentInstallProperty',
      name: 'installCSS',
      documentInstallFn: function(X) {
        for ( var i = 0 ; i < this.model_.templates.length ; i++ ) {
          var t = this.model_.templates[i];
          if ( t.name === 'CSS' ) {
            t.futureTemplate(function() {
              X.addStyle(this);
            }.bind(this));
            return;
          }
        }
      }
    }
  ]
});
