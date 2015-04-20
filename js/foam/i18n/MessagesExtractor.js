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
  name: 'MessagesExtractor',
  package: 'foam.i18n',
  extendsModel: 'foam.i18n.Visitor',

  requires: [
    'foam.i18n.Message',
    'foam.i18n.MessageBundle'
  ],
  imports: [ 'console' ],

  properties: [
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'dao',
      lazyFactory: function() { return []; }
    },
    {
      name: 'messageBundleFactory',
      lazyFactory: function() {
        return this.MessageBundle.create;
      }
    },
    {
      name: 'messageFactory',
      lazyFactory: function() {
        return this.Message.create;
      }
    }
  ],

  methods: [
    {
      name: 'visitMessage',
      code: function(model, msg) {
        var modelPrefix = model.translationHint ?
            model.translationHint + ' ' : '';
        var i18nMsg = this.messageFactory({
          id: this.getMessageKey(model, msg),
          name: msg.name,
          value: msg.value,
          description: modelPrefix + msg.translationHint
        });
        this.dao.put(i18nMsg);
        return i18nMsg;
      }
    },
    {
      name: 'visitAction',
      code: function(model, action) {
        var modelPrefix = model.translationHint ?
            model.translationHint + ' ' : '';
        var msgs = [];
        var key, i18nMsg;
        if ( action.translationHint ) {
          if ( action.label ) {
            key = this.getActionTextLabelKey(model, action);
            i18nMsg = this.messageFactory({
              id: this.getActionTextLabelKey(model, action),
              name: action.name + 'Label',
              value: action.label,
              description: modelPrefix + action.translationHint +
                  ' (text label)'
            });
            this.dao.put(i18nMsg);
            msgs.push(i18nMsg);
          }
          if ( action.speechLabel ) {
            key = this.getActionSpeechLabelKey(model, action);
            i18nMsg = this.messageFactory({
              id: this.getActionSpeechLabelKey(model, action),
              name: action.name + 'SpeechLabel',
              value: action.speechLabel,
              description: modelPrefix + action.translationHint +
                  ' (speech label)'
            });
            this.dao.put(i18nMsg);
            msgs.push(i18nMsg);
          }
        }
        return msgs;
      }
    },
    {
      name: 'achromeMessages',
      code: function(ret) {
        var msgs = {};
        this.dao.select({
          put: function(msg) { msgs[msg.id] = msg.toChromeMessage(); },
          eof: function() { ret(msgs); }
        });
      }
    },
    {
      name: 'amessages',
      code: function(ret) {
        this.abuildMessages_(ret);
      }
    },
    {
      name: 'amessagesFile',
      code: function(dataId, ret) {
        this.abuildMessages_(function(msgs) {
          msgs.id = dataId;
          ret('__DATA(' +
              JSONUtil.compact.where(NOT_TRANSIENT).stringify(msgs) + ');');
        });
      }
    },
    {
      name: 'abuildMessages_',
      code: function(ret) {
        var msgs = this.messageBundleFactory();
        var arr = msgs.messages;
        this.dao.select({
          put: function(msg) { arr.push(msg); }.bind(this),
          eof: function() { ret(msgs); }
        });
      }
    }
  ]
});
