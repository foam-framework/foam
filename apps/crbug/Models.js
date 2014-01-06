/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
var labelToProperty = {
  App:          'app',
  Priority:     'priority',
  M:            'milestone',
  Cr:           'category',
  Iteration:    'iteration',
  ReleaseBlock: 'releaseBlock',
  OS:           'OS'
};


var CIssue = FOAM({
    model_: 'Model',
    extendsModel: 'GeneratedCIssue',

    name: 'CIssue',

    tableProperties:
    [
      'starred',
      'id',
'app',
      'priority',
      'milestone',
      'iteration',
      'releaseBlock',
      'category',
      'status',
      'owner',
      'summary',
      'OS',
      'updated'
    ],

    properties: [
        {
          model_: 'IntegerProperty',
          name: 'id',
          shortName: 'i',
          label: 'ID',
          required: true,
          tableWidth: '48px',
          tableFormatter: function(value, row, table) {
            var id = table.nextID();

            table.on('mouseover', function() { console.log('mouseover'); }, id);
            table.on('mouseout',  function() { console.log('mouseout');  }, id);

            return '<div id="' + id + '">' + value + '</div>';
          }
        },
        {
          model_: 'StringProperty',
          name: 'priority',
          shortName: 'p',
          aliases: ['pr', 'pri', 'prior'],
          tableLabel: 'Priority',
          tableWidth: '60px',
          compareProperty: function(p1, p2) {
            var priorities = ['Low', 'Medium', 'High', 'Critical'];
            var r = priorities.indexOf(p1) - priorities.indexOf(p2);
            return r === 0 ? 0 : r < 0 ? -1 : 1;
          },
          required: true
        },
        {
          model_: 'StringProperty',
          name: 'app',
          tableWidth: '60px'
        },
        {
            name: 'milestone',
            shortName: 'm',
            aliases: ['mstone'],
            tableLabel: 'M',
            type: 'Integer',
            tableWidth: '40px',
            defaultValue: ''
        },
        {
            name: 'iteration',
            shortName: 'it',
            aliases: ['iter'],
            type: 'String',
            tableWidth: '69px'
        },
        {
            name: 'releaseBlock',
            shortName: 'rb',
            aliases: ['rBlock', 'release'],
            type: 'String',
            tableWidth: '103px',
            defaultValue: ''
        },
        {
            name: 'category',
            shortName: 'c',
            aliases: ['cat', 'cr'],
            label: 'Cr',
            tableWidth: '87px',
            type: 'String',
            defaultValue: ''
        },
        {
            name: 'status',
            shortName: 's',
            aliases: ['stat'],
            type: 'String',
            tableWidth: '58px',
            defaultValue: ''
        },
        {
            name: 'owner',
            shortName: 'o',
            tableWidth: '181px',
            type: 'String'
        },
        {
            name: 'summary',
            shortName: 'su',
            label: 'Summary + Labels',
            type: 'String',
            tableWidth: '100%',
            tableFormatter: function(value, row) {
              return value +
                CIssue.LABELS.tableFormatter(row.labels, row);
            }
        },
        {
            name: 'labels',
            shortName: 'l',
            aliases: ['label'],
            type: 'String',
            tableFormatter: function(value, row) {
              var sb = [];
              //              var a = value.split(', ');
              var a = value;
              for ( var i = 0 ; i < a.length ; i++ ) {
                // The the column is already being shown, then exclude it's label
                if ( row.model_.tableProperties.indexOf(labelToProperty[a[i].split('-')[0]]) == -1 ) {
                  sb.push(' <span class="label">');
                  sb.push(a[i]);
                  sb.push('</span>');
                }
              }
              return sb.join('');
            },
            postSet: function(a) {
              for ( var i = 0 ; i < a.length ; i++ ) {
                for ( var key in labelToProperty ) {
                  if ( a[i].substring(0, key.length) == key ) {
                    var prop = labelToProperty[key];
                    var val = a[i].substring(key.length+1).intern();
                    // ???: Should be treated as last value or an array?
                    this[prop] = val;
//                  this[prop].push(val);
                    a.splice(i,1);
                    i--;
                    break;
                  }
                }
              }
            }
        },
        {
            name: 'OS',
            tableWidth: '61px',
            type: 'String'
        },
        {
         model_: 'DateTimeProperty',
         name: 'updated',
         shortName: 'mod',
         mode: 'read-write',
         required: true,
         tableWidth: '100',
         valueFactory: function() { return new Date(); }
      },
      {
         model_: 'BooleanProperty',
         name: 'starred',
         tableLabel: '',
         tableFormatter: function(val, obj, tableView) {
           var view = ImageBooleanView.create({
               trueImage: 'images/star_on.gif',
               falseImage: 'images/star_off.gif',
               value: SimpleValue.create(val)
             });

           tableView.addChild(view);

           return view.toHTML();
         },
         view: {
           // TODO: make it so that initialized objects can be used as factories
           create: function() {
             return ImageBooleanView.create({
               trueImage: 'images/star_on.gif',
               falseImage: 'images/star_off.gif'
             });
           }
         },
         tableWidth: '20',
         help: 'Whether the authenticated user has starred this issue.'
      },
      {
         model_: 'IntegerProperty',
         name: 'stars',
         help: 'Number of stars this issue has.',
         valueFactory: function() { return []; }
      }
    ],

    methods: {
    }
});

CIssue.properties.forEach(function(p) {
  if ( ! p["tableFormatter"] ) {
    p["tableFormatter"] = function(v) {
      return ('' + v).length ? v : '----';
    };
  }
});
