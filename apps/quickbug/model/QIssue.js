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
            var r = priorities.indexOf(p1) - priorities.indexOf(p2);
            return r === 0 ? 0 : r < 0 ? -1 : 1;
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
            name: 'milestone',
            shortName: 'm',
            aliases: ['mstone'],
            tableLabel: 'M',
            type: 'Int',
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
            tableWidth: '58px',
            defaultValue: ''
        },
        {
          name: 'cc',
          preSet: function(_, a) { return a.intern(); },
          autocompleter: 'PersonCompleter'
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
            tableWidth: '350px'
//          tableWidth: '100%'
        },
        {
          name: 'summaryPlusLabels',
          label: 'Summary + Labels',
          columnLabel: 'Summary + Labels',
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
             tmp.starred = view.value;
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
      },
      {
        model_: 'StringArrayProperty',
        name: 'movedFrom',
        tableWidth: '100px',
        preSet: function(_, v) {
          if ( Array.isArray(v) ) return v;
          if ( ! v ) return undefined;

          return (this.movedFrom || []).binaryInsert(v.charAt(0) == 'M' ? parseInt(v.substring(1)) : parseInt(v));
        },
        compareProperty: function(o1, o2) {
          o1 = o1.length ? o1[0] : 0;
          o2 = o2.length ? o2[0] : 0;
          return o1 === o2 ? 0 : o1 > o2 ? 1 : -1;
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
