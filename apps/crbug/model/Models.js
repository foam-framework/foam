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
  Milestone:    'milestone',
  Cr:           'category',
  Iteration:    'iteration',
  ReleaseBlock: 'releaseBlock',
  OS:           'OS'
};


var QIssue = FOAM({
    model_: 'Model',
    extendsModel: 'GeneratedQIssue',

    name: 'QIssue',

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

            table.on('mouseover', function(e) {
              table.browser.preview(e, value);
            }, id);

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
          tableWidth: '70px'
        },
        {
            name: 'milestone',
            shortName: 'm',
            aliases: ['mstone'],
            tableLabel: 'M',
            type: 'Integer',
            tableWidth: '70px',
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
                QIssue.LABELS.tableFormatter(row.labels, row);
            }
        },
        {
            name: 'labels',
            shortName: 'l',
            aliases: ['label'],
            type: 'String',
            view: 'QIssueLabelsView',
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
           var temp = obj.clone();
           var view = ImageBooleanView.create({
               trueImage: 'data:image/gif;base64,R0lGODlhDwAPAMQfAF9h4RYVnZeQJC0u0lRQU42R6P/7Fv74L05NrRkZxi4tW52XXv71D8nAIWxnjnRxr3NuMJKOluXbBe7kCa2x7UFD1vPoB77D8Jqe6n6B5tvTUr62BMrP8lJPh1xbuv///yH5BAEAAB8ALAAAAAAPAA8AAAWD4CeOWQKMaDpESepi3tFlLgpExlK9RT9ohkYi08N8KhWP8nEwMBwIDyJRSTgO2CaDYcBOCAlMgtDYmhmTDSFQ+HAqgbLZIlAMLqiKw7m1EAYuFQsGEhITEwItKBc/EgIEAhINAUYkCBIQAQMBEGonIwAKa21iCgo7IxQDFRQjF1VtHyEAOw==', //'images/star_on.gif',
               falseImage: 'data:image/gif;base64,R0lGODlhDwAPALMPAP///8zj++r7/7vb/rHW/tPt/9Lk+qzT/rbY/sHh/8Te/N7q+Nzy/7nY/djn+f///yH5BAEAAA8ALAAAAAAPAA8AAARg8MkZjpo4k0KyNwlQBB42MICAfEF7APDRBsYzIEkewGKeDI1DgUckMg6GTdFIqC0QgyUgQVhgGkOi4OBBCJYdzILAywIGNcoOgCAQvowBRpE4kgzCQgPjQCAcEwsNTRIRADs=', //'images/star_off.gif',
               value: temp.propertyValue('starred')
             });

           temp.addPropertyListener('starred', function() {
             tableView.browser.IssueDAO.put(temp);
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
         help: 'Number of stars this issue has.'
      }
    ],

    methods: {
      createPreviewView: function() {
        return QIssuePreviewView.create({ model: QIssue });
      },

      isOpen: function() {
        return !! ({
          'New':      true,
          'Accepted': true,
          'Started':  true
        }[this.status]);
      }
    }
});

QIssue.properties.forEach(function(p) {
  if ( ! p["tableFormatter"] ) {
    p["tableFormatter"] = function(v) {
      return ('' + v).length ? v : '----';
    };
  }
});

var QIssueComment = FOAM({
  model_: 'Model',
  name: 'QIssueComment',
  extendsModel: 'IssueComment',

  properties: [
    {
      name: 'author',
      view: 'QIssueCommentAuthorView',
      preSet: function(newValue, _, prop) {
        if ( ! newValue.model_ ) return GLOBAL[prop.subType].create(newValue);
        return newValue;
      }
    },
    {
      name: 'updates',
      view: 'QIssueCommentUpdateView',
      preSet: function(newValue, _, prop) {
        if ( ! newValue.model_ ) return GLOBAL[prop.subType].create(newValue);
        return newValue;
      }
    },
    {
      name: 'published',
      view: 'RelativeDateTimeFieldView'
    }
  ]
});

var QUser = FOAM({
  model_: 'Model',
  name: 'QUser',
  extendsModel: 'User',

  properties: [
    {
      model_: 'StringProperty',
      name: 'email'
    },
    {
      name: 'projects',
      postSet: function(newValue) {
        if ( this.preferredProjects.length == 0 ) {
          this.preferredProjects = newValue.map(function(p) { return p.name; });
        }
      }
    },
    {
      model_: 'StringArrayProperty',
      name: 'preferredProjects'
    },
  ]
});
