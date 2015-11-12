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
  name: 'Person',
  package: 'com.google.plus',
  plural: 'People',

  traits: [
    'foam.core.dao.SyncTrait',
    'foam.core.types.JSONModelTrait',
  ],
  requires: [
    'com.google.plus.Circle'
  ],

  models: [
    {
      name: 'Url',
      properties: [
        { model_: 'URLProperty', name: 'value'  },
        { model_: 'StringProperty', name: 'type',
          documentation: function() {/* "otherProfile" - URL for another profile.
            "contributor" - URL to a site for which this person is a contributor.
            "website" - URL for this Google+ Page's primary website.
            "other" - O */},
        },
        { model_: 'StringProperty', name: 'label'  },
      ]
    },
  ],

  methods: [
    function toPeople() {
      return this.id;
    },
    function toChipE() {
      /* Implement to return a contact chip view Element */
    },
  ],

  properties: [
    { model_: 'foam.core.types.JSONStringProperty', name: 'id', help: 'The FOAM and/or Google Plus ID, globally unique.' },
    { model_: 'StringProperty', name: 'objectType', defaultValue: 'person',
      documentation: function() {/* "person" - represents an actual person.
        "page" - represents a page. */},
    },
    //{ model_: 'StringProperty', name: 'plusId', help: 'GAIA/G+ ID'  },

    {
      model_: 'ArrayProperty',
      subType: 'com.google.plus.Circle',
      name: 'circles',
      help: "All of this Person's circles.",
      factory: function() { return []; },
    },
    {
      model_: 'ReferenceArrayProperty',
      subType: 'com.google.plus.Person',
      name: 'contacts',
      factory: function() { return []; },
      // TODO: make this a circle? give Circle an 'authorized' flag? Could also
      // use for 'blocked' circle. Only authorized circles would allow content
      // through.
    },


    { model_: 'foam.core.types.JSONStringProperty', name: 'nickname' },
    { model_: 'foam.core.types.JSONStringProperty', name: 'occupation'  },
    { model_: 'foam.core.types.JSONStringProperty', name: 'skills'  },
    { model_: 'foam.core.types.JSONStringProperty', name: 'birthday'  },
    { model_: 'foam.core.types.JSONStringProperty', name: 'gender'  },

    { model_: 'foam.core.types.JSONStringProperty', name: 'formattedName', jsonPath: [ 'name', 'formatted' ] },
    { model_: 'foam.core.types.JSONStringProperty', name: 'familyName', jsonPath: [ 'name', 'familyName' ] },
    { model_: 'foam.core.types.JSONStringProperty', name: 'givenName', jsonPath: [ 'name', 'givenName' ] },
    { model_: 'foam.core.types.JSONStringProperty', name: 'middleName', jsonPath: [ 'name', 'middleName' ] },
    { model_: 'foam.core.types.JSONStringProperty', name: 'honorificPrefixName', jsonPath: [ 'name', 'honorificPrefix' ] },
    { model_: 'foam.core.types.JSONStringProperty', name: 'honorificSuffixName', jsonPath: [ 'name', 'honorificSuffix' ] },

    { model_: 'foam.core.types.JSONArrayProperty', name: 'emails', fromItemJSON: function(vt) { return vt.value; } },

    { model_: 'ArrayProperty', subType: 'com.google.plus.Person.Url', name: 'urls' },

    {
      model_: 'foam.core.types.JSONStringProperty',
      name: 'displayName',
      defaultValueFn: function() {
        return [ // TODO: right-to-left i18n
          this.honorificPrefixName,
          this.givenName,
          this.middleName,
          this.familyName,
          this.honorificSuffixName ].join(' ');
      }
    },
    { model_: 'foam.core.types.JSONImageProperty', name: 'image', jsonPath: [ 'image', 'url' ] },
  ],
});
//   { model_: 'StringProperty', name: 'tagline'  },
//   { model_: 'StringProperty', name: 'braggingRights'  },
//   { model_: 'StringProperty', name: 'aboutMe'  },
//   { model_: 'StringProperty', name: 'relationshipStatus'  },
//   { model_: 'StringProperty', name: 'url'  },
//   "organizations": [
//     {
//       { model_: 'StringProperty', name: 'name'  },
//       { model_: 'StringProperty', name: 'department'  },
//       { model_: 'StringProperty', name: 'title'  },
//       { model_: 'StringProperty', name: 'type'  },
//       { model_: 'StringProperty', name: 'startDate'  },
//       { model_: 'StringProperty', name: 'endDate'  },
//       { model_: 'StringProperty', name: 'location'  },
//       { model_: 'StringProperty', name: 'description'  },
//       { model_: 'BooleanProperty', name: 'primary'  },
//     }
//   ],
//   "placesLived": [
//     {
//       { model_: 'StringProperty', name: 'value'  },
//       { model_: 'BooleanProperty', name: 'primary'  },
//     }
//   ],
//   { model_: 'BooleanProperty', name: 'isPlusUser'  },,
//   { model_: 'StringProperty', name: 'language'  },
//   "ageRange": {
//     { model_: 'IntegerProperty', name: 'min'  },,
//     { model_: 'IntegerProperty', name: 'max'  },
//   },
//   { model_: 'IntegerProperty', name: 'plusOneCount'  },,
//   { model_: 'IntegerProperty', name: 'circledByCount'  },,
//   { model_: 'BooleanProperty', name: 'verified'  },,
//   "cover": {
//     { model_: 'StringProperty', name: 'layout'  },
//     "coverPhoto": {
//       { model_: 'StringProperty', name: 'url'  },
//       { model_: 'IntegerProperty', name: 'height'  },,
//       { model_: 'IntegerProperty', name: 'width'  },
//     },
//     "coverInfo": {
//       { model_: 'IntegerProperty', name: 'topImageOffset'  },,
//       { model_: 'IntegerProperty', name: 'leftImageOffset'  },
//     }
//   },
//   { model_: 'StringProperty', name: 'domain'  },
