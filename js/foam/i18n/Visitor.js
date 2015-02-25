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
  name: 'Visitor',
  package: 'foam.i18n',
  todos: [
    'When i18n integration is stable: Turn ActionLabel into ActionTextLabel ',
    'When i18n integration is stable: Include package in model.name prefix'
  ],

  imports: [
    'console'
  ],

  methods: [
    {
      name: 'visitModel',
      code: function(model) {
        var self = this;
        var modelPrefix = model.translationHint ?
            model.translationHint + ' ' : '';
        var i, key, msg, action;
        if ( model.messages ) {
          for ( i = 0; i < model.messages.length; ++i ) {
            msg = model.messages[i];
            this.visitMessage(model, msg, i);
          }
        }
        if ( model.actions ) {
          for ( i = 0; i < model.actions.length; ++i ) {
            action = model.actions[i];
            if ( action.translationHint &&
                (action.label || action.speechLabel) ) {
              this.visitAction(model, action, i);
            }
          }
        }
        return this;
      }
    },
    {
      name: 'getMessageKey',
      code: function(model, msg) {
        return model.name + '__Message__' + msg.name;
      }
    },
    {
      name: 'getActionTextLabelKey',
      code: function(model, action) {
        return model.name + '__ActionLabel__' + action.name;

      }
    },
    {
      name: 'getActionSpeechLabelKey',
      code: function(model, action) {
        return model.name + '__ActionSpeechLabel__' + action.name;
      }
    },
    {
      name: 'getIntKey',
      code: function(strKey) {
        return Math.abs(strKey.hashCode());
      }
    },
    {
      name: 'visitMessage',
      code: function(model) {
        this.console.warn(
            'Visitor without visitMessage implementation: ' +
                this.name_);
        return this;
      }
    },
    {
      name: 'visitAction',
      code: function(model) {
        this.console.warn(
            'Visitor without visitAction implementation: ' +
                this.name_);
        return this;
      }
    }
  ]
});
