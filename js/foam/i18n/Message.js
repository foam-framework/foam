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
  extends: 'Message',

  requires: [ 'foam.i18n.Placeholder' ],
  imports: [ 'console' ],

  ids: ['id'],

  properties: [
    {
      type: 'String',
      name: 'id',
      lazyFactory: function() {
        return this.model.name + '_Message_' + this.name;
      }
    },
    {
      type: 'String',
      name: 'description',
      required: true
    },
    {
      type: 'String',
      name: 'meaning'
    },
    {
      type: 'Array',
      name: 'placeholders',
    },
    {
      type: 'Function',
      name: 'replaceValues',
      defaultValue: function(opt_selectors, opt_placeholders) {
        // TODO(markdittmer): Should we replace replaceValues() with toString()
        // at the core Message level?
        return this.toString(opt_selectors, opt_placeholders);
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
        var placeholders = opt_placeholders || {};
        var selectors = opt_selectors || {};
        var msg = this.value;
        return this.bindSelectorsAndPlaceholders_(
            msg, selectors, placeholders, null).str;
      }
    },
    {
      name: 'bindSelectorsAndPlaceholders_',
      code: function(msgPart, selectors, placeholders, plural) {
        this.console.assert(typeof msgPart !== 'undefined', 'Message ' +
            'fragment is undefined');

        // Bind placeholders to strings (leaves in message tree).
        if ( typeof msgPart === 'string' ) {
          // Return bound string current state of plural value
          // (latter required for placeholders).
          return {
            str: this.bindPlaceholders_(msgPart, placeholders, plural),
            plural: plural
          };
        }

        var str = '';
        var strAndPlural;
        if ( Array.isArray(msgPart) ) {
          // Handle array-of-message-parts.
          for ( var i = 0; i < msgPart.length; ++i ) {
            strAndPlural = this.bindSelectorsAndPlaceholders_(
                msgPart[i], selectors, placeholders, plural);
            str += strAndPlural.str;
            plural = strAndPlural.plural;
          }
        } else {
          // Handle non-string message-part (selector/plural object).
          var selectorName = msgPart.name;
          this.console.assert(selectorName, 'Selector with no name');

          var selectedValue = selectors[selectorName];
          this.console.assert(typeof selectedValue !== 'undefined', 'Missing ' +
              'selector "' + selectorName + '" in selector bindings');

          // TODO(markdittmer): We may want a less brittle way of detecting
          // that this is a "Plural" rather than "Selector" interface.
          if ( msgPart.name_ === 'Plural' ) plural = selectedValue;

          strAndPlural = this.bindSelectorsAndPlaceholders_(
              msgPart.values[selectedValue] || msgPart.values.other, selectors,
              placeholders, plural);
          str += strAndPlural.str;
          plural = strAndPlural.plural;
        }

        // Return bound string current state of plural value (latter required
        // for placeholders).
        return { str: msgPart, plural: plural };
      }
    },
    {
      name: 'bindPlaceholders_',
      code: function(msgPart, args, plural) {
        var phs = this.placeholders;
        var value = msgPart;
        // Bind known placeholders to message string.
        for ( var i = 0; i < phs.length; ++i ) {
          var name = phs[i].name;
          var replacement = args.hasOwnProperty(name) ? args[name] :
              phs[i].example;
          value = value.replace((new RegExp('[$]' + name + '[$]', 'g')),
                                replacement);
        }
        // If message string is within a plural selector, bind "#" to plural
        // value.
        if ( plural ) value = value.replace(/#/g, plural);

        return value;
      }
    }
  ]
});
