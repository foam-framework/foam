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
  extends: 'foam.i18n.Visitor',

  requires: [
    'foam.i18n.Message',
    'foam.i18n.MessageGenerator',
    'foam.i18n.MessageBundle',
    'foam.i18n.Placeholder'
  ],
  imports: [ 'console' ],

  properties: [
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'dao',
      lazyFactory: function() { return []; }
    },
    {
      name: 'messageGenerator',
      lazyFactory: function() {
        return this.MessageGenerator.create({
          idGenerator: this.idGenerator
        });
      }
    },
    {
      name: 'messageBundleFactory',
      lazyFactory: function() {
        return this.MessageBundle.create.bind(this.MessageBundle);
      }
    }
  ],

  methods: [
    {
      name: 'visitMessage',
      code: function(model, msg) {
        var i18nMsg = this.messageGenerator.generateMessage(model, msg);
        this.dao.put(i18nMsg);
        return i18nMsg;
      }
    },
    {
      name: 'visitAction',
      code: function(model, action) {
        var msgs = this.messageGenerator.generateActionMessages(model, action);
        var keys = Object.keys(msgs);
        for ( var i = 0; i < keys.length; ++i ) {
          this.dao.put(msgs[keys[i]]);
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
    },
    {
      name: 'ai18n',
      code: function(format, ret) {
        throw 'ERROR: i18n output format "' + format + '" not recognized';
      }
    }
  ]
});
