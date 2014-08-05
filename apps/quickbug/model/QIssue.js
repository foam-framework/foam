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
      name: 'postSet',
      defaultValue: function(_, v, prop) {
        if ( ! Array.isArray(v) ) debugger;

        v.sort();

        this.replaceLabels(prop.name.capitalize(), v);
      }
    },
    {
      name: 'compareProperty',
      defaultValue: function(o1, o2) {
        o1 = Array.isArray(o1) ? ( o1.length ? o1[o1.length-1] : 0 ) : o1;
        o2 = Array.isArray(o2) ? ( o2.length ? o2[o2.length-1] : 0 ) : o2;

        return o1.compareTo(o2);
      }
    },
    {
      name: 'transient',
      defaultValue: true
    }
  ]
});


MODEL({
  name: 'LabelStringProperty',
  extendsModel: 'StringProperty',

  help: "A String value, taken from labels.",

  properties: [
    {
      name: 'postSet',
      defaultValue: function(o, n, prop) {
        this.replaceLabels(prop.name.capitalize(), n);

        // Test for LabelStringProperties that should be LabelArrayProperties.
        if ( o && o !== n ) debugger;
      }
    },
    {
      name: 'transient',
      defaultValue: true
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
        a.sort();

        // Reset all label properties to initial values.
        for ( var i = 0 ; i < this.model_.properties.length ; i++ ) {
          var p = this.model_.properties[i];

          if ( p.model_ === LabelArrayProperty ) {
            this.instance_[p.name] = [];
          } else if ( p.model_ === LabelStringProperty ) {
            this.instance_[p.name] = "";
          }
        }

        for ( var i = 0 ; i < a.length ; i++ ) {
          var kv = isPropertyLabel(a[i]);
          a[i] = a[i].intern();
          if ( kv ) {

            // Cleanup 'movedFrom' labels
            if ( kv[0] === 'movedFrom' ) {
              kv[1] = typeof kv[1] === 'string' ? parseInt(kv[1].charAt(0) === 'M' ? kv[1].substring(1) : kv[1]) : kv[1];
            }

            if ( Array.isArray(this[kv[0]]) ) {
              this.instance_[kv[0]].binaryInsert(kv[1]);
            } else {
              this.instance_[kv[0]] = kv[1];
            }
          }
        }
      }
    },
    {
      name: 'author',
      preSet: function(_, a) { return a.intern(); },
      aliases: ['reporter']
    },
    {
      model_: 'LabelStringProperty',
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
      model_: 'LabelArrayProperty',
      name: 'app',
      tableWidth: '70px'
    },
    {
      model_: 'LabelArrayProperty',
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
      model_: 'LabelStringProperty',
      name: 'releaseBlock',
      shortName: 'rb',
      aliases: ['rBlock', 'release'],
      type: 'String',
      tableWidth: '103px',
      defaultValue: ''
    },
    {
      model_: 'LabelArrayProperty',
      name: 'cr',
      shortName: 'c',
      aliases: ['cat', 'cr'],
      label: 'Cr',
      tableWidth: '87px',
    },
    {
      model_: 'StringProperty',
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
      model_: 'LabelArrayProperty',
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
      help: 'Number of stars this issue has.',
      compareProperty: function(o2, o1) {
        return o1 === o2 ? 0 : o1 > o2 ? 1 : -1;
      }
    },
    {
      model_: 'LabelArrayProperty',
      name: 'movedFrom',
      tableWidth: '100px'
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
    replaceLabels: function(label, values) {
      var labels = this.labels.filter(function(l) { return ! l.startsWith(label); });
      if ( Array.isArray(values) ) {
        for ( var i = 0 ; i < values.length ; i++ ) {
          labels.binaryInsert(label + '-' + values[i]);
        }
      } else {
        labels.binaryInsert(label + '-' + values);
      }

      // Set this way to avoid updating lable properties and causing a feedback loop.
      this.instance_.labels = labels;
    },
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
