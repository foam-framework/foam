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
  package: 'com.google.ymp.ui',
  name: 'ContactProfileView',
  extends: 'foam.u2.View',

  requires: [
    'com.google.ymp.bb.ContactProfile',
    'com.google.ymp.ui.ContactRow',
    'com.google.ymp.ui.ContactRowView',
  ],
  imports: [
    'contactProfileDAO',
  ],
  exports: [
    'as self',
  ],

  properties: [
    {
      name: 'data',
      postSet: function(old,nu) {
        var self = this;
        var pY = this.Y.sub();
        self.contactProfileDAO
          .where(EQ(self.ContactProfile.ID, nu))
          .limit(1)
          .pipe({
            put: function(profile) {
              self.contacts = profile.contactDetails.map(function(rawContact) {
                return self.buildContactRow(rawContact, pY);
              });
            }
          });
      }
    },
    {
      type: 'Array',
      subType: 'com.google.ymp.ui.ContactRow',
      name: 'contacts',
      toPropertyE: function(X) {
        return X.lookup('foam.u2.DAOListView').create({rowView: 'com.google.ymp.ui.ContactRowView'}, X);
      },
    },
  ],

  templates: [
    function initE() {/*#U2
      <div class="^">
        <self:contacts />
      </div>
    */},
  ],

  methods: [
    function buildContactRow(contactString, ctx) {
      var contactType = 'other';
      var firstChar = contactString[0];
      if (firstChar === '@') {
        contactType = 'twitter';
      } else if (firstChar === '+') {
        contactType = 'phone';
      } else if (contactString.indexOf('@') > 0) {
        contactType = 'email';
      }

      return this.ContactRow.create({
        type: contactType,
        rawContact: contactString
        }, ctx);
    },
  ]
});
