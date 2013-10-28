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
  Pri:          'priority',
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
      'id',
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
            name: 'id',
	    shortName: 'i',
            label: 'ID',
            required: true,
            tableWidth: '48px'
        },
        {
            name: 'priority',
	    shortName: 'p',
	    aliases: ['pr', 'pri', 'prior'],
            tableLabel: 'Pri',
            type: 'Integer',
            tableWidth: '30px',
            // TODO: move this to IntegerProperty
            preSet: function(val) {
               return parseInt(val);
            },
            required: true
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
	      // 	      var a = value.split(', ');
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
//		    this[prop].push(val);
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

var CIssueTileView = FOAM({
   model_: 'Model',

   extendsModel: 'AbstractView',

   name: 'CIssueTileView',
   label: 'CIssue Tile View',

   properties: [
      {
	 name:  'issue',
	 label: 'Issue',
	 type:  'CIssue'
      }
   ],

   methods: {
     // Implement Sink
     put: function(issue) { this.issue = issue; },

     // Implement Adapter
     f: function(issue) { this.issue = issue; return this.toHTML(); }
   },

   templates:[
     {
        model_: 'Template',

        name: 'toHTML',
        description: 'TileView',
        template: '<div class="gridtile"><table cellspacing="0" cellpadding="0"><tbody><tr><td class="id"><img src="https://ssl.gstatic.com/codesite/ph/images/star_off.gif"><a href="https://code.google.com/p/chromium/issues/detail?id=<%= this.issue.id %>"><%= this.issue.id %></a></td><td class="status"><%= this.issue.status %></td></tr><tr><td colspan="2"><div><a href="https://code.google.com/p/chromium/issues/detail?id=<%= this.issue.id %>"><%= this.issue.summary %></a></div></td></tr></tbody></table></div>'
     }
   ]
});
