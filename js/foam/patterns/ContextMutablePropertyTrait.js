/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  name: 'ContextMutablePropertyTrait',
  package: 'foam.patterns',
  
  documentation: function() {/* For Properties that would otherwise be imported by reference
    (imports: ['prop$']), this trait allows the property to be imported but unlinked
    when the value is changed locally. Children will see the new value, but ancestors
    will not. Ancestor changes are no longer propagated once a local change is made.
  */},
  
  properties: [
    {
      name: 'install',
      defaultValue: function(prop) {
        var actualSetter = this.__lookupSetter__(prop.name);
        var actualInit = this.init;
        var propXBindName = prop.name + "$";
        var propListenerName = prop.name + "$XListener";
         
        var setUpListener = function() {
          this.instance_[propListenerName] = function(_,_,old,nu) {
            // don't trigger our modified setter that captures non-inherited change events
            actualSetter.apply(this, [nu]);
          }.bind(this);
          this.X[propXBindName].addListener(this.instance_[propListenerName] );
        };
        var tearDownListener = function() {
          if ( this.instance_[propListenerName] ) {
            this.X[propXBindName].removeListener(this.instance_[propListenerName]);
          }
          this.instance_[propListenerName] = undefined;          
        };

        // replace init
        this.init = function() {
          // this is now the instance
          // Bind to the PropertyValue in the context, as if we had imported "propName$"
          setUpListener.apply(this);
                    
          actualInit.apply(this, arguments);
        }

        this.__defineSetter__(prop.name, function(nu) {
          // setter will be called on the instance, so "this" is an instance now
          // Unbind from context the first time the property is set from someplace other than context
          if ( this.instance_[propListenerName] ) {
            tearDownListener.apply(this);
          }
          
          return actualSetter.apply(this, [nu]);
        });
    }
  ]
  
});
