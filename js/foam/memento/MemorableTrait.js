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
  name: 'MemorableTrait',
  package: 'foam.memento',
  properties: [
    {
      name: 'memento',
      hidden: true
    }
  ],

  methods: {
    init: function(args) {
      this.SUPER(args);

      for ( var i = 0, prop ; prop = this.model_.properties_[i] ; i++ ) {
        if ( ! prop.memorable ) continue;
        this.addPropertyListener(prop.name, this.updateMemento);
        if ( this[prop.name] != null && this[prop.name].model_ && this[prop.name].memento ) {
          this[prop.name].addPropertyListener('memento', this.updateMemento);
        }
      }
      this.addPropertyListener('memento', this.updateFromMemento);

      if ( this.hasOwnProperty('memento') ) {
        this.updateFromMemento(null, null, null, this.memento);
      } else {
        this.updateMemento();
      }
    },
    toMemento_: function() {
      var memento = {};

      for ( var i = 0, prop ; prop = this.model_.properties[i] ; i ++ ) {
        if ( ! prop.memorable ) continue;
        if ( this[prop.name] != null ) {
          var value = this[prop.name];
          memento[prop.name] = value.memento || (value.toMemento ?
              value.toMemento() : value.toString());
        }
      }
      return memento;
    }
  },

  listeners: [
    {
      name: 'updateFromMemento',
      code: function(src, topic, old, memento) {
        for ( var key in memento ) {
          if ( this[key] && this[key].memento ) {
            this[key].memento = memento[key];
          } else {
            this[key] = memento[key]
          }
        }
      }
    },
    {
      name: 'updateMemento',
      code: function(src, topic, old, nu) {
        // If the new property value is a memorable modelled object
        // then we need to subscribe for changes to that object.
        if ( src === this && old && old.model_ && old.memento ) {
          old.removePropertyListener('memento', this.updateMemento);
        }

        if ( src === this && nu && nu.model_ && nu.memento ) {
          nu.addPropertyListener('memento', this.updateMemento);
        }

        this.memento = this.toMemento_();
      }
    }
  ]
});
