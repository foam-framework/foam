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
      name: 'visitMessage',
      code: function(model, msg) {
        var modelPrefix = model.translationHint ?
            model.translationHint + ' ' : '';
        var key = this.getMessageKey(model, msg).hashCode();
        this.messageBundle[key] = {
          message: msg.value,
          description: modelPrefixc + msg.translationHint
        };
      }
    },
    {
      name: 'visitAction',
      code: function(model, action) {
        var modelPrefix = model.translationHint ?
            model.translationHint + ' ' : '';
        var key;
        if ( action.translationHint ) {
          if ( action.label ) {
            key = this.getActionTextLabelKey(model, action).hashCode();
            this.messageBundle[key] =
                {
                  message: action.label,
                  description: modelPrefix +
                      action.translationHint +
                      ' (text label)'
                };
          }
          if ( action.speechLabel ) {
            key = this.getActionSpeechLabelKey(model, action).hashCode();
            this.messageBundle[key] =
                {
                  message: action.speechLabel,
                  description: modelPrefix +
                      action.translationHint +
                      ' (speech label)'
                };
          }
        }
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
