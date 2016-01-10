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
  name: 'PolymerPrototypeImporter',
  package: 'foam.ui.polymer.gen',
  extends: 'foam.ui.polymer.gen.ComponentBuilderBase',

  requires: [
    'foam.ui.polymer.gen.Component',
    'foam.ui.polymer.gen.ComponentProperty',
    'foam.ui.polymer.gen.PolymerPrototype'
  ],

  imports: [
    'propertyDAO',
    'prototypeDAO'
  ],

  properties: [
    {
      type: 'Boolean',
      name: 'imported',
      defaultValue: false
    }
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.run();
        return this.SUPER();
      }
    },
    {
      name: 'run',
      code: function() {
        if ( this.imported ) return;
        this.prototypeDAO.find(this.comp.tagName, {
          put: function(p) {
            this.importPrototype(p.proto);
          }.bind(this),
          error: function() {
            this.prototypeDAO.pipe({
              put: function(p) {
                if ( p.tagName !== this.comp.tagName ) return;
                this.importPrototype(p.proto);
              }.bind(this)
            });
          }.bind(this)
        });
      }
    },
    {
      name: 'importPrototype',
      code: function(p) {
        var proto = {};
        Object.getOwnPropertyNames(p).forEach(function(p, propName) {
          if ( propName !== 'publish' ) proto[propName] = p[propName];
        }.bind(this, p));
        if ( p.publish ) {
          Object.getOwnPropertyNames(p.publish).forEach(
              function(p, proto, propName) {
                if ( Object.getOwnPropertyNames(proto).some(function(pn1, pn2) {
                  return pn1 === pn2;
                }.bind(this, propName)) )
                  console.warn('Overwriting property: ', propName);
                proto[propName] = p.publish[propName];
              }.bind(this, p, proto));
        }
        Object.getOwnPropertyNames(proto).forEach(function(proto, propName) {
          this.putProperty(propName, proto[propName]);
        }.bind(this, proto));
      }
    },
    {
      name: 'putProperty',
      code: function(name, rawValue) {
        var propConfig = {
          url: this.comp.url,
          name: name
        };
        var value = this.getPropertyValue(rawValue);
        var propertyModel = this.getPropertyModel(value);
        if ( propertyModel ) propConfig.propertyModel = propertyModel;
        if ( value !== undefined ) {
          if ( propertyModel === '' ||
              propertyModel === 'FunctionProperty' ||
              propertyModel === 'ArrayProperty' ) {
                console.log('Building factory for ', propConfig.url, propConfig.name, propertyModel);
                var valueStr = propertyModel === 'FunctionProperty' ?
                    value.toString() : JSON.stringify(value);
                var evalStr = multiline(function() {/*
                  propConfig.factory = function() {
                    return */}) +
                    valueStr +
                    multiline(function() {/*;
                      };
                    */});
                eval(evalStr);
              } else {
                propConfig.defaultValue = value;
              }
        }
        this.propertyDAO.put(this.ComponentProperty.create(propConfig));
        this.imported = true;
      }
    },
    {
      name: 'getPropertyValue',
      code: function(value) {
        if ( value !== null && typeof value === 'object' &&
            Object.getOwnPropertyNames(value).some(function(name) {
              return name === 'value';
            }) ) { return value.value; }
        else       return value;
      }
    },
    {
      name: 'getPropertyModel',
      code: function(value) {
        if (value === undefined) return '';

        var typeOf = typeof value;
        if ( typeOf === 'boolean' ) {
          return 'BooleanProperty';
        } else if ( typeOf === 'number' ) {
          if ( Number.isInteger(value) ) {
            return 'IntProperty';
          } else {
            return 'FloatProperty';
          }
        } else if ( typeOf === 'string' ) {
          return 'StringProperty';
        } else if ( typeOf === 'function' ) {
          return 'FunctionProperty';
        } else if ( Array.isArray(value) ) {
          return 'ArrayProperty';
        } else {
          return '';
        }
      }
    }
  ]
});
