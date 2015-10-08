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
  package: 'foam.patterns',
  name: 'InheritedPropertyTrait',

  documentation: function() {/* When used on a $$DOC{ref:'Property'}
    owned by a $$DOC{ref:'foam.patterns.ChildTreeTrait'}, this trait causes the
    property to get its value from the closest ancestor with that property
    defined. If the property value is set, it becomes set locally and will
    not be inherited until unset to <code>undefined</code>.
  */},

  properties: [
    {
      name: 'install',
      defaultValue: function(prop) {
        var actualSetter = this.__lookupSetter__(prop.name);
        var actualGetter = this.__lookupGetter__(prop.name);
        var actualOnAncestryChange_ = this.onAncestryChange_;
        var propWriteFlagName = prop.name + "$writtenTo";
        var propListenerName = prop.name + "$inheritedListener";
        var propSourceName = prop.name + "$inheritedSource";
        var propSelf = this;

        var findParentValue = function(parent, propName) {
          if ( parent.hasOwnProperty(propName) ) {
            return parent[propName+"$"];
          } else {
            if ( parent.parent ) {
              return findParentValue(parent.parent, propName);
            } else {
              return undefined;
            }
          }
        };
        var setUpListener = function() {
          this.instance_[propSourceName] = findParentValue(this.parent, prop.name);
          if ( this.instance_[propSourceName] ) {
            this.instance_[propListenerName] = function(_, __,old,nu) {
              actualSetter.apply(this, [nu]);
            }.bind(this);
            this.instance_[propSourceName].addListener(this.instance_[propListenerName] );
          }
        };
        var tearDownListener = function() {
          if ( this.instance_[propSourceName] && this.instance_[propListenerName] ) {
            this.instance_[propSourceName].removeListener(this.instance_[propListenerName]);
          }
          this.instance_[propSourceName] = undefined;
          this.instance_[propListenerName] = undefined;
        };

        // replace init
        this.onAncestryChange_ = function() {
          // this is now the instance
          if ( ! this.instance_[propWriteFlagName] ) {
            // unbind the old listener
            tearDownListener.apply(this);
            // set up listener if we are inheriting
            if ( ! this.instance_[propWriteFlagName] ) {
              setUpListener.apply(this);
            }
          }

          actualOnAncestryChange_.apply(this, arguments);
        }

        this.__defineSetter__(prop.name, function(nu) {
          // setter will be called on the instance, so "this" is an instance now
          // reset to false if user sets undefined, otherwise set true
          if ( typeof nu !== 'undefined' ) {
            if ( ! this.instance_[propWriteFlagName] ) {
              this.instance_[propWriteFlagName] = true;
              // written locally, so remove inherited value listener if present
              tearDownListener.apply(this);
            }
          } else {
            if ( ! this.instance_[propWriteFlagName] ) {
              this.instance_[propWriteFlagName] = false;
              // We are now inheriting, so set up the listener
              setUpListener.apply(this);
            }
          }
          // in any case call the actual setter with local-value or undefined
          return actualSetter.apply(this, [nu]);
        });
        this.__defineGetter__(prop.name, function() {
          // getter will be called on the instance, so "this" is an instance now
          if ( ! this.instance_[propWriteFlagName] && this.instance_[propSourceName] ) {
            // we haven't been written to, so inherit the value
            return this.instance_[propSourceName].value;
          } else {
            return actualGetter.apply(this);
          }
        });
      }
    }
  ]

});
