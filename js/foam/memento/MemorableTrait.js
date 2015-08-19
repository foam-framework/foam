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
  package: 'foam.memento',
  name: 'MemorableTrait',
  properties: [
    {
      name: 'memento',
      hidden: true
    }
  ],

  methods: {
    init: function(args) {
      this.SUPER(args);

      var properties = this.model_.getRuntimeProperties();
      for ( var i = 0, prop ; prop = properties[i] ; i++ ) {
        if ( ! prop.memorable ) continue;
        this.addPropertyListener(prop.name, this.updateMemento);
        if ( this[prop.name] != null && this[prop.name].model_ &&
            typeof this[prop.name].memento !== 'undefined' ) {
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
      var memento = {
        __proto__: MementoProto
      };

      var properties = this.model_.getRuntimeProperties();
      for ( var i = 0, prop ; prop = properties[i] ; i ++ ) {
        if ( ! prop.memorable ) continue;
        if ( this[prop.name] != null ) {
          var key = typeof prop.memorable === 'string' ? prop.memorable : prop.name;
          var value = this[prop.name];
          if (prop.toMemento) {
            memento[key] = prop.toMemento(value);
          } else {
            memento[key] = typeof value.memento !== 'undefined' ?
                value.memento :
                (value.toMemento ? value.toMemento() : value.toString());
          }
        }
      }
      return memento;
    }
  },

  listeners: [
    {
      name: 'updateFromMemento',
      code: function(src, topic, old, memento) {
        if ( this.mementoFeedback_ || !memento ) {
          return;
        }

        var properties = this.model_.getRuntimeProperties();
        for ( var i = 0, prop ; prop = properties[i] ; i++ ) {
          if (prop.memorable) {
            var key = typeof prop.memorable === 'string' ? prop.memorable : prop.name;
            if (prop.fromMemento) {
              this[prop.name] = prop.fromMemento(memento[key]);
            } else if (typeof this[prop.name].memento !== 'undefined') {
              this[prop.name].memento = memento[key];
            } else {
              this[prop.name] = memento[key];
            }
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

        this.mementoFeedback_ = true;
        this.memento = this.toMemento_();
        this.mementoFeedback_ = false;
      }
    }
  ]
});
