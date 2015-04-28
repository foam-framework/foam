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
  name: 'Message',
  package: 'foam.i18n',
  extendsModel: 'Message',

  requires: [ 'foam.i18n.Placeholder' ],
  imports: [ 'console' ],

  ids: ['id'],

  properties: [
    {
      model_: 'StringProperty',
      name: 'id',
      lazyFactory: function() {
        return this.model.name + '_Message_' + this.name;
      }
    },
    {
      model_: 'StringProperty',
      name: 'description',
      required: true
    },
    {
      model_: 'StringProperty',
      name: 'meaning'
    },
    {
      model_: 'ArrayProperty',
      name: 'placeholders',
      type: 'Array[foam.i18n.Placeholder]'
    },
    {
      model_: 'FunctionProperty',
      name: 'replaceValues',
      defaultValue: function(args) {
        var phs = this.placeholders;
        var value = this.value;
        if ( typeof value === 'string' ) {
          for ( var i = 0; i < phs.length; ++i ) {
            var name = phs[i].name;
            var replacement = args.hasOwnProperty(name) ? args[name] :
                phs[i].example;
            value = value.replace((new RegExp('[$]' + name + '[$]', 'g')),
                                  replacement);
          }
        } else {
          this.console.warn('Attempt to replace values in structured message. ' +
              'This feature has not yet been implemented.');
        }

        return value;
      }
    }
  ],

  methods: [
    {
      name: 'validate',
      code: function() {
        var valueType = typeof this.value;
        if ( ! this.name ) return 'Missing name';
        if ( ! this.value ) return 'Missing value';
        if ( ! this.translationHint ) return 'Missing translation hint';
        if ( ! this.description ) return 'Missing description';
        if ( typeof this.value === 'string' ) return false;

        var errMsg;
        errMsg = this.validateSelectors_(this.value, []);
        if ( errMsg ) return errMsg;
        errMsg = this.validatePlaceholders_();
        if ( errMsg ) return errMsg;

        return false;
      }
    },
    {
      name: 'validateSelectors_',
      code: function(msg, path) {
        if ( typeof msg === 'string' ) return false;
        if ( ! (Array.isArray(msg) && msg.length === 2) ) {
          return 'Expected selector pair as array, but value is: ' +
              msg.toString() + '.\nSelector path: ' +
              path.join('.');
        }
        if ( typeof msg[0] !== 'string' ) {
          return 'Expected selector name to be string, but type is: ' +
              typeof msg[0];
        }

        path.push(msg[0]);

        var selectors = msg[1];
        var keys = Object.keys(selectors);
        for ( var i = 0; i < keys.length; ++i ) {
          var key = keys[i];

          path.push(key);

          var rtn = this.validateSelectors_(selectors[key], path);
          if ( rtn ) return rtn;

          path.pop();
        }

        path.pop();

        return false;
      }
    },
    {
      name: 'validatePlaceholders_',
      code: function() {
        var i, j, k, rtn, placeholder;
        var placeholders = this.placeholders;
        for ( i = 0; i < placeholders.length; ++i ) {
          rtn = placeholders[i].validate();
          if ( rtn ) return rtn;
        }

        var strs = this.getAllMessageStrs_(this.value, []);
        var usedPlaceholders = {};

        for ( i = 0; i < strs.length; ++i ) {
          var str = strs[i];
          var constantizedNames = str.match(/[$][a-zA-Z0-9_-][$]/g).map(
              function($name$) { return $name$.slice(1, $name$.length - 1); });
          for ( j = 0; j < constantizedNames.length; ++j ) {
            var name = constantizedNames[j];
            for ( k = 0; k < placeholders.length; ++k ) {
              placeholder = placeholders[k];
              if ( constantize(placeholder.name) === name ) {
                usedPlaceholders[placeholder.name] = true;
                break;
              }
            }
            if ( k >= placeholders.length ) {
              return 'Unbound placeholder "' + name + '" in message string "' +
                  str + '"';
            }
          }
        }

        for ( i = 0; i < placeholders.length; ++i ) {
          placeholder = placeholders[i];
          if ( ! usedPlaceholders[placeholder.name] ) return 'Unused ' +
              ' placeholder: ' + placeholder.name;
        }

        return false;
      }
    },
    {
      name: 'getAllMsgStrs_',
      code: function(msg, strs) {
        if ( typeof msg === 'string' ) {
          strs.push(msg);
          return strs;
        }

        var selectors = msg[1];
        var keys = Object.keys(selectors);
        for ( var i = 0; i < keys.length; ++i ) {
          var key = keys[i];
          this.getAllMsgStrs_(selectors[key], strs);
        }
        return strs;
      }
    },
    {
      name: 'toChromeMessage',
      todo: 'Transform placeholder format to work with chrome.getMessage',
      code: function() {
        return {
          message: this.value,
          description: this.description
        };
      }
    },
    {
      name: 'toString',
      code: function(opt_selectors, opt_placeholders) {
        if ( typeof this.value === 'string' ) return this.value;
        var selectors = opt_selectors || {};
        var placeholders = opt_placeholders || [];
        var msg = this.value;
        return this.bindPlacholders_(this.bindSelectors_(msg, selectors),
                                     placeholders);
      }
    },
    {
      name: 'bindSelectors_',
      code: function(msg, selectors) {
        while ( typeof msg !== 'string' ) {
          this.console.assert(Array.isArray(msg),
                      'Expected selector pair as array, but value is ' +
                          selectors.toString());
          this.console.assert(msg.length === 2,
                      'Expected array as selector pair, but array length is ' +
                          selectors.length);
          var selector = msg[0];
          var selectedValue = selectors[selector];
          this.console.assert(typeof selectedValue !== 'undefined',
                      'Missing selector "' + selector + '" in selector bindings');
          msg = msg[1][selectedValue] || msg[1].other;
        }
        return msg;
      }
    },
    {
      name: 'bindPlaceholders_',
      code: function(msg, placeholders) {
        var names = Object.keys(placeholders);
        for ( var i = 0; i < names.length; ++i ) {
          var name = names[i];
          msg = msg.replace((new RegExp('[$]' + name + '[$]', 'g')),
                            placeholders[name]);
        }
        return msg;
      }
    }
  ]
});
