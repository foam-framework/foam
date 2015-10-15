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
  name: 'ChromeMessagesInjector',
  package: 'foam.i18n',
  extends: 'foam.i18n.Visitor',

  imports: [ 'warn' ],

  methods: [
    {
      name: 'visitMessage',
      code: function(model, msg, msgIdx) {
        this.maybeSetMessage(
            model.messages[msgIdx],
            'value',
            this.idGenerator.getMessageId(model, msg));
      }
    },
    {
      name: 'visitAction',
      code: function(model, action, actionIdx) {
        if ( action.translationHint ) {
          if ( action.label ) {
            this.maybeSetMessage(
                model.actions[actionIdx],
                'label',
                this.idGenerator.getActionTextLabelId(model, action));
          }
          if ( action.speechLabel ) {
            this.maybeSetMessage(
                model.actions[actionIdx],
                'speechLabel',
                this.idGenerator.getActionSpeechLabelId(model, action));
          }
        }
      }
    },
    {
      name: 'maybeSetMessage',
      code: function(obj, objKey, msgKey) {
        var i18nMessage =
            GLOBAL.chrome &&
            GLOBAL.chrome.i18n &&
            GLOBAL.chrome.i18n.getMessage &&
            GLOBAL.chrome.i18n.getMessage(msgKey);
        if ( i18nMessage ) {
          obj[objKey] = i18nMessage;
        } else {
          this.warn('ChromeMessagesInjector: "' + msgKey +
              '": No such message');
        }
      }
    }
  ]
});
