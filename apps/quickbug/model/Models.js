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
  Type:         'type',
  Pri:          'priority',
  Priority:     'priority',
  Mstone:       'milestone',
  M:            'milestone',
  Cr:           'category',
  Iteration:    'iteration',
  ReleaseBlock: 'releaseBlock',
  OS:           'OS'
};

var propertyLabels_ = {};

function isPropertyLabel(l) {
  if ( l in propertyLabels_ ) return propertyLabels_[l];

  var keyValue = l.match(/([^\-]*)\-(.*)/);
  if ( keyValue ) {
    var key   = labelToProperty[keyValue[1]];
    var value = keyValue[2];

    if ( key ) {
      var kv = [key, value.intern()];
      propertyLabels_[l] = kv;
      return kv;
    }
  }

  propertyLabels_[l] = false;
  return false;
}

var QIssue = FOAM({
    model_: 'Model',
    extendsModel: 'GeneratedQIssue',

    name: 'QIssue',

    tableProperties: [
      'starred',
      'id',
//      'app',
      'priority',
      'milestone',
      'iteration',
      'releaseBlock',
      'category',
      'status',
      'owner',
      'summary',
      'OS',
      'modified'
    ],

    ids: ['id'],

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
          name: 'author',
          preSet: function(a) { return a.intern(); },
          aliases: ['reporter']
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
          model_: 'StringProperty',
          name: 'type',
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
          name: 'cc',
          preSet: function(a) { return a.intern(); }
        },
        {
            name: 'owner',
            shortName: 'o',
            tableWidth: '181px',
            type: 'String',
            preSet: function(a) { return a.intern(); }
        },
        {
            name: 'summary',
            shortName: 'su',
            label: 'Summary + Labels',
            type: 'String',
            tableWidth: '100%',
            tableFormatter: function(value, row, tableView) {
              return tableView.strToHTML(value) +
                QIssue.LABELS.tableFormatter(row.labels, row);
            }
        },
        {
            name: 'OS',
            tableWidth: '61px',
            type: 'String'
        },
        {
          model_: 'BooleanProperty',
          name: 'blocked',
          tableWidth: '20px',
          getter: function() { return !! this.blockedOn.length; }
        },
        {
         model_: 'DateTimeProperty',
         name: 'modified',
         shortName: 'mod',
         mode: 'read-write',
         required: true,
         tableWidth: '100px',
         valueFactory: function() { return new Date(); }
      },
      {
        name: 'updated',
        hidden: true,
        setter: function(v) { this.modified = v; }
      },
      {
         model_: 'BooleanProperty',
         name: 'starred',
         tableLabel: '',
         tableWidth: '20px',
         tableFormatter: function(val, obj, tableView) {
           var view = ImageBooleanView.create({
               trueImage: 'data:image/gif;base64,R0lGODlhDwAPAMQfAF9h4RYVnZeQJC0u0lRQU42R6P/7Fv74L05NrRkZxi4tW52XXv71D8nAIWxnjnRxr3NuMJKOluXbBe7kCa2x7UFD1vPoB77D8Jqe6n6B5tvTUr62BMrP8lJPh1xbuv///yH5BAEAAB8ALAAAAAAPAA8AAAWD4CeOWQKMaDpESepi3tFlLgpExlK9RT9ohkYi08N8KhWP8nEwMBwIDyJRSTgO2CaDYcBOCAlMgtDYmhmTDSFQ+HAqgbLZIlAMLqiKw7m1EAYuFQsGEhITEwItKBc/EgIEAhINAUYkCBIQAQMBEGonIwAKa21iCgo7IxQDFRQjF1VtHyEAOw==', //'images/star_on.gif',
               falseImage: 'data:image/gif;base64,R0lGODlhDwAPALMPAP///8zj++r7/7vb/rHW/tPt/9Lk+qzT/rbY/sHh/8Te/N7q+Nzy/7nY/djn+f///yH5BAEAAA8ALAAAAAAPAA8AAARg8MkZjpo4k0KyNwlQBB42MICAfEF7APDRBsYzIEkewGKeDI1DgUckMg6GTdFIqC0QgyUgQVhgGkOi4OBBCJYdzILAywIGNcoOgCAQvowBRpE4kgzCQgPjQCAcEwsNTRIRADs=', //'images/star_off.gif',
             value: SimpleValue.create(obj.starred)
             });

           view.value.addListener(function() {
             var tmp = obj.clone();
             tmp.starred = view.value.get();
             tableView.browser.IssueDAO.put(tmp);
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
         tableWidth: '20px',
         help: 'Whether the authenticated user has starred this issue.'
      },
      {
         model_: 'IntegerProperty',
         name: 'stars',
         tableWidth: '20px',
         help: 'Number of stars this issue has.'
      },
        {
          name: 'labels',
          shortName: 'l',
          aliases: ['label'],
          type: 'String',
          view: 'QIssueLabelsView',
          tableFormatter: function(a, row) {
            var s = '';
            for ( var i = 0 ; i < a.length ; i++ ) {
              s += ' <span class="label">' + a[i] + '</span>';
            }
            return s;
          },
          postSet: function(_, a) {
            for ( var i = 0 ; i < a.length ; i++ ) {
              var kv = isPropertyLabel(a[i]);
              if ( kv ) {
                this[kv[0]] = kv[1];
                a.splice(i,1);
                i--;
              } else {
                a[i] = a[i].intern();
              }
            }
          }
        }
    ],

    methods: {
      isOpen: function() {
        return !! ({
          'New':       true,
          'Accepted':  true,
          'Started':   true,
          'Untriaged': true
        }[this.status]);
      },
      writeActions: function(other, out) {
        var diff = this.diff(other);
        delete diff.starred;

        if ( Object.keys(diff).length == 0 ) return;

        function convertArray(key) {
          if ( ! diff[key] ) {
            diff[key] = [];
            return;
          }

          var delta = diff[key].added;
          for ( var i = 0; i < diff[key].removed.length; i++ )
            delta.push("-" + diff[key].removed[i]);
          diff[key] = delta;
        }

        convertArray('blockedOn');
        convertArray('blocking');
        convertArray('cc');
        convertArray('labels');

        function propToLabel(prop, label) {
          if ( diff[prop] ) {
            diff.labels = diff.labels.concat(
              '-' + label + '-' + other[prop],
              label + '-' + diff[prop]);
            delete diff[prop];
          }
        }

        propToLabel('priority', 'Priority');
        propToLabel('app', 'App');
        propToLabel('milestone', 'Milestone');
        propToLabel('category', 'Cr');
        propToLabel('iteration', 'Iteration');
        propToLabel('releaseBlock', 'ReleaseBlock');
        propToLabel('OS', 'OS');

        var comment = QIssueComment.create({
          issueId: this.id,
          updates: IssueCommentUpdate.create(diff)
        });

        out(comment);
      }
    }
});

QIssue.getPrototype();

QIssue.properties.forEach(function(p) {
  if ( ! p["tableFormatter"] ) {
    p["tableFormatter"] = function(v) {
      return v || '----';
    };
  }
});

GeneratedQIssue.properties.forEach(function(p) {
  if ( ! p["tableFormatter"] ) {
    p["tableFormatter"] = function(v) {
      return v || '----';
    };
  }
  if ( ! p["tableWidth"] ) {
    p["tableWidth"] = '80px;'
  }
});

var QIssueComment = FOAM({
  model_: 'Model',
  name: 'QIssueComment',
  extendsModel: 'IssueComment',

  ids: [ 'id' ],

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
    },
    {
      model_: 'ReferenceProperty',
      name: 'issueId'
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
      postSet: function(_, newValue) {
        if ( this.preferredProjects.length == 0 ) {
          this.preferredProjects = newValue.map(function(p) { return p.name; });
        }
      }
    },
    {
      model_: 'StringArrayProperty',
      name: 'preferredProjects',
      view: 'MultiLineStringArrayView',
// Temporary fix for QuickBug v.1.10 which broke the project list
// TODO: remove next line after a while
      preSet: function(a) {
        return a.map(function(i) {
          return Array.isArray(i) ? i[0] : i;
        });
      }
    },
    {
      model_: 'StringProperty',
      name: 'defaultProject',
      defaultValue: 'chromium'
    }
  ]
});
