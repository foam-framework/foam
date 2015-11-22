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
  package: 'com.google.ow.content',
  name: 'Notifier',

  documentation: function() {/* Creates notifications when some event happens. */},

  requires: [
    'foam.u2.Element',
    'foam.ui.Icon',
    'com.google.ow.model.Envelope',
    'foam.u2.md.QuickActionButton',
    'com.google.ow.content.Notification',
  ],

  exports: [
    'this as data',
  ],

  imports: [
    'envelope', // used client-side
    'streamDAO',
  ],

  properties: [
    {
      name: 'sid',
      defaultValueFn: function() { return this.id; }
    },
    {
      name: 'substreams',
      documentation: 'This model uses matching substream and sid, so all instances across owners are notified as peers when one changes.',
      defaultValueFn: function() { return [this.id]; },
    },
    {
      model_: 'StringProperty',
      name: 'titleText',
      defaultValue: 'Notification!',
    },
  ],

  methods: [
    function put(envelope, sink, yourEnvelope) {
      /* Server: this is a substream target, implement put handler */
      console.log("Notifier", envelope.sid);
      
      var self = this;
      var found = false;
      this.streamDAO.where(AND(
        EQ(this.Envelope.SOURCE, this.id),
        EQ(this.Envelope.OWNER, yourEnvelope.owner)
      )).select({
        put: function(existing) {
          found = true;
          existing.data.count += 1;
          self.streamDAO.put(existing);
        },
        eof: function() {
          if ( ! found ) {
            // create new

            self.streamDAO.put(this.Envelope.create({
              source: this.id,
              owner: yourEnvelope.owner,
              sid: '',
              data: this.Notification.create({
                id: createGUID(),
                count: 1,
                source: envelope.sid,
                content: this.titleText,
              })
            }));
          }
        }
      });
    },
  ],
});
