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
  name: 'IdGenerator',
  package: 'foam.i18n',

  methods: [
    {
      name: 'getMessageId',
      code: function(model, msg) {
        return model.name + '_Message_' + msg.name;
      }
    },
    {
      name: 'getActionTextLabelId',
      code: function(model, action) {
        return model.name + '_ActionLabel_' + action.name;

      }
    },
    {
      name: 'getActionSpeechLabelId',
      code: function(model, action) {
        return model.name + '_ActionSpeechLabel_' + action.name;
      }
    }
  ]
});
