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

MODEL({
  name: 'LabelArrayProperty',
  extendsModel: 'StringArrayProperty',

  help: "An array of String values, taken from labels.",

  properties: [
    {
      name: 'preSet',
      defaultValue: function(oldValue, v) {
        return Array.isArray(v) ? v :
          ! v ? undefined :
          Array.isArray(oldValue) ? oldValue.binaryInsert(v) :
          [v];
      }
    },
    {
      name: 'compareProperty',
      defaultValue: function(o1, o2) {
        o1 = o1.length ? o1[o1.length-1] : 0;
        o2 = o2.length ? o2[o2.length-1] : 0;
        return o1 === o2 ? 0 : o1 > o2 ? 1 : -1;
      }
    }
  ]
});


var labelToProperty = {
  App:          'app',
  Type:         'type',
  Pri:          'pri',
  Priority:     'priority',
  Milestone:    'milestone',
  Mstone:       'milestone',
  M:            'milestone',
  Cr:           'cr',
  Iteration:    'iteration',
  ReleaseBlock: 'releaseBlock',
  OS:           'OS',
  MovedFrom:    'movedFrom'
};

var propertyLabels_ = {};

function isPropertyLabel(l) {
  if ( l in propertyLabels_ ) return propertyLabels_[l];

  var keyValue = l.match(/([^\-]*)\-(.*)/) || l.match(/(\D*)(.*)/);
  if ( keyValue ) {
    var key   = labelToProperty[keyValue[1]];
    var value = keyValue[2];

    if ( key ) {
      var kv = [key, value.intern()];
      propertyLabels_[l] = kv;
      return kv;
    }
  }

  return propertyLabels_[l] = false;
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
    'cr',
    'status',
    'owner',
    'summary',
    'OS',
    'modified'
  ],

  ids: ['id'],

  properties: [
    {
      model_: 'IntProperty',
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
      preSet: function(_, a) { return a.intern(); },
      aliases: ['reporter']
    },
    {
      model_: 'StringProperty',
      name: 'priority',
      shortName: 'p',
      aliases: ['pr', 'prior'],
      tableLabel: 'Priority',
      tableWidth: '60px',
      compareProperty: function(p1, p2) {
        var priorities = ['Low', 'Medium', 'High', 'Critical'];
        var i1 = priorities.indexOf(p1);
        var i2 = priorities.indexOf(p2);
        if ( i1 < 0 && i2 < 0 ) {
          // Neither is a proper priority - return normal string order.
          return p1 === p2 ? 0 : p1 < p2 ? -1 : 1;
        } else if ( i1 < 0 ) {
          return -1; // Nonstandard priorities are considered lower than Low.
        } else if ( i2 < 0 ) {
          return 1;  // Likewise.
        } else {
          var r = i1 - i2;
          return r === 0 ? 0 : r < 0 ? -1 : 1;
        }
      },
      required: true
    },
    {
      model_: 'IntProperty',
      name: 'pri',
      tableLabel: 'Pri',
      tableWidth: '60px'
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
      model_: 'LabelArrayProperty',
      name: 'milestone',
      shortName: 'm',
      aliases: ['mstone'],
      tableLabel: 'M',
      tableWidth: '70px'
    },
    {
      model_: 'LabelArrayProperty',
      name: 'iteration',
      shortName: 'it',
      aliases: ['iter'],
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
      name: 'cr',
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
      preSet: function(_, s) { return s.capitalize(); },
      tableWidth: '58px',
      autocompleter: 'StatusCompleter',
      defaultValue: ''
    },
    {
      model_: 'StringArrayProperty',
      name: 'cc',
      autocompleter: 'PersonCompleter',
      displayWidth: 70,
      preSet: function(_, a) { return a.intern(); }
    },
    {
      name: 'owner',
      shortName: 'o',
      tableWidth: '181px',
      type: 'String',
      autocompleter: 'PersonCompleter',
      preSet: function(_, a) { return a.intern(); }
    },
    {
      name: 'summary',
      shortName: 'su',
      label: 'Summary',
      type: 'String',
      tableWidth: '350px',
      displayWidth: 70,
      //          tableWidth: '100%'
      tableFormatter: function(value, row, tableView) {
        return tableView.strToHTML(value);
      }
    },
    {
      name: 'description',
      displayHeight: 20,
      displayWidth: 70
    },
    {
      name: 'summaryPlusLabels',
      label: 'Summary + Labels',
      tableLabel: 'Summary + Labels',
      type: 'String',
      tableWidth: '100%',
      tableFormatter: function(value, row, tableView) {
        return tableView.strToHTML(row.summary) +
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
      factory: function() { return new Date(); }
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
      tableWidth: '18px',
      tableFormatter: function(val, obj, tableView) {
        var view = CSSImageBooleanView.create({
          className: 'star-image',
          data: obj.starred
        });

        view.data$.addListener(function() {
          var tmp = obj.clone();
          tmp.starred = view.data;
          tableView.browser.IssueDAO.put(tmp);
        });

        tableView.addChild(view);
        return view.toHTML();
      },
      view: { model_: 'CSSImageBooleanView', className: 'star-image' },
      help: 'Whether the authenticated user has starred this issue.'
    },
    {
      model_: 'IntProperty',
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
      autocompleter: 'LabelCompleter',
      tableFormatter: function(a, row) {
        var s = '';
        for ( var i = 0 ; i < a.length ; i++ ) {
          if ( ! isPropertyLabel(a[i]) ) {
            s += ' <span class="label">' + a[i] + '</span>';
          }
        }
        return s;
      },
      postSet: function(_, a) {
        for ( var i = 0 ; i < a.length ; i++ ) {
          var kv = isPropertyLabel(a[i]);
          if ( kv ) {
            this[kv[0]] = kv[1];
            // Don't remove from labels because then label:X searches don't work.
            // a.splice(i,1);
            // i--;
          } else {
            a[i] = a[i].intern();
          }
        }
      }
    },
    {
      model_: 'LabelArrayProperty',
      name: 'movedFrom',
      tableWidth: '100px',
      preSet: function(_, v) {
        if ( Array.isArray(v) ) return v;
        if ( ! v ) return undefined;
        
        return (this.movedFrom || []).binaryInsert(v.charAt(0) == 'M' ? parseInt(v.substring(1)) : parseInt(v));
      }
    },
    {
      name: 'movedTo',
      preSet: function(_, v) {
        // TODO: looks like we're getting bad values, investigate and fix
        /*
          if ( v.length ) console.log('movedTo: ', v);
          return v;
        */
        return [];
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
      convertArray('milestone');
      convertArray('iteration');

      function propToLabel(prop, label) {
        if ( diff[prop] ) {
          if ( Array.isArray(diff[prop]) ) {
            for ( var i = 0; i < diff[prop].length; i++) {
              diff.labels.push(label + '-' + diff[prop][i]);
            }
          } else {
            diff.labels = diff.labels.concat(
              '-' + label + '-' + other[prop],
              label + '-' + diff[prop]);
          }
          delete diff[prop];
        }
      }

      propToLabel('priority', 'Priority');
      propToLabel('app', 'App');
      propToLabel('milestone', 'Milestone');
      propToLabel('cr', 'Cr');
      propToLabel('iteration', 'Iteration');
      propToLabel('releaseBlock', 'ReleaseBlock');
      propToLabel('OS', 'OS');

      var comment = QIssueComment.create({
        issueId: this.id,
        updates: QIssueCommentUpdate.create(diff)
      });

      out(comment);
    },
    newComment: function() {
      return QIssueComment.create({
        issueId: this.id,
        updates: QIssueCommentUpdate.create({
          labels: this.labels.clone(),
          owner: this.owner,
          blockedOn: this.blockedOn.clone(),
          blocking: this.blocking.clone(),
          cc: this.cc.clone(),
          mergedInto: this.mergedInto,
          status: this.status,
          summary: this.summary
        })
      })
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

QIssue.LABELS.toMQL = function() { return 'label'; };
