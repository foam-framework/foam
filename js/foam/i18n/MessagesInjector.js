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
  name: 'MessagesInjector',
  package: 'foam.i18n',
  extendsModel: 'foam.i18n.Visitor',

  imports: [ 'warn' ],

  properties: [
    {
      model_: 'BooleanProperty',
      name: 'ready_',
      defaultValue: false
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'dao',
      required: true,
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.ready_ = false;
        var map = this.map = {};
        this.dao.select({
          put: function(msg) { map[msg.id] = msg; },
          eof: function() { this.ready_ = true; }.bind(this)
        });
      }
    },
    {
      name: 'map',
      lazyFactory: function() { return {}; }
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        var ret = this.SUPER.apply(this, arguments);
        return ret;
      }
    },
    {
      name: 'initHTML',
      code: function() {
        var ret = this.SUPER.apply(this, arguments);
        return ret;
      }
    },
    {
      name: 'visitMessage',
      code: function(model, msg, msgIdx) {
        this.maybeSetMessage(
            model.messages,
            msgIdx,
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
        if ( ! this.ready_ ) {
          this.warn('MessagesInjector: Attempt to inject "' + msgKey +
              '" before injector is ready');
          return;
        }

        var i18nMessage = this.map[msgKey];
        if ( i18nMessage ) {
          obj[objKey] = i18nMessage;
        } else {
          this.warn('MessagesInjector: "' + msgKey +
              '": No such message');
        }
      }
    }
  ]
});
