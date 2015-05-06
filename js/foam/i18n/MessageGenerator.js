/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  name: 'MessageGenerator',
  package: 'foam.i18n',

  requires: [
    'foam.i18n.IdGenerator',
    'foam.i18n.Message',
    'foam.i18n.Placeholder'
  ],

  properties: [
    {
      name: 'idGenerator',
      factory: function() {
        return this.IdGenerator.create();
      }
    },
    {
      name: 'messageFactory',
      lazyFactory: function() {
        return this.Message.create.bind(this.Message);
      }
    },
    {
      name: 'placeholderFactory',
      lazyFactory: function() {
        return this.Placeholder.create.bind(this.Placeholder);
      }
    }
  ],

  methods: [
    {
      name: 'generateMessage',
      code: function(model, msg) {
        var modelPrefix = model.translationHint ?
            model.translationHint + ' ' : '';
        var placeholders = msg.placeholders.map(function(p) {
          return this.placeholderFactory(p);
        }.bind(this));
        var i18nMsg = this.messageFactory({
          id: this.idGenerator.getMessageId(model, msg),
          name: msg.name,
          value: msg.value,
          meaning: msg.meaning,
          placeholders: placeholders,
          description: modelPrefix + msg.translationHint
        });
        return i18nMsg;
      }
    },
    {
      name: 'generateActionMessages',
      code: function(model, action) {
        var modelPrefix = model.translationHint ?
            model.translationHint + ' ' : '';
        var msgs = {};
        if ( action.translationHint ) {
          if ( action.label ) {
            msgs.label = this.messageFactory({
              id: this.idGenerator.getActionTextLabelId(model, action),
              name: action.name + 'Label',
              value: action.label,
              description: modelPrefix + action.translationHint +
                  ' (text label)'
            });
          }
          if ( action.speechLabel ) {
            msgs.speechLabel = this.messageFactory({
              id: this.idGenerator.getActionSpeechLabelId(model, action),
              name: action.name + 'SpeechLabel',
              value: action.speechLabel,
              description: modelPrefix + action.translationHint +
                  ' (speech label)'
            });
          }
        }
        return msgs;
      }
    }
  ]
});
