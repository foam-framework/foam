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
  name: 'ChromeMessagesBuilder',
  package: 'foam.i18n',
  extendsModel: 'foam.i18n.MessagesBuilder',

  methods: [
    {
      name: 'visitModel',
      code: function(model) {
        var modelPrefix = model.translationHint ?
            model.translationHint + ' ' : '';
        var key;
        if ( model.messages ) model.messages.forEach(
            function(model, msg) {
              key = model.name + '__Message__' + msg.name;
              this.messageBundle[key] = {
                  message: msg.value,
                  description: modelPrefix + msg.translationHint
              };
            }.bind(this, model));
        if ( model.actions ) model.actions.forEach(
            function(model, action) {
              if ( action.translationHint ) {
                if ( action.label ) {
                  key = model.name + '__ActionLabel__' + action.name;
                  this.messageBundle[key] =
                      {
                        message: action.label,
                        description: modelPrefix +
                            action.translationHint +
                            ' (text label)'
                      };
                }
                if ( action.speechLabel ) {
                  key = model.name + '__ActionSpeechLabel__' + action.name;
                  this.messageBundle[key] =
                      {
                        message: action.speechLabel,
                        description: modelPrefix +
                            action.translationHint +
                            ' (speech label)'
                      };
                }
              }
            }.bind(this, model));
        return this.messageBundle;
      }
    },
    {
      name: 'messagesToString',
      code: function() {
        return JSON.stringify(this.messageBundle);
      }
    }
  ]
});
