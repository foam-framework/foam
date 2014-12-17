CLASS({
  name: 'QIssueTileView2',
  label: 'QIssue Tile View',

  extendsModel: 'View',

  properties: [
    {
      name:  'browser'
    },
    {
      name:  'issue',
      type:  'QIssue'
    },
    {
      name: 'map',
      defaultValue: {
        'Low': 3,
        'Medium': 2,
        'High': 1,
        'Critical': 0
      }
    }
  ],

  methods: {
    // Implement Sink
    put: function(issue) {
      if ( this.issue ) { this.issue.removeListener(this.onChange); }

      this.issue = issue.clone();
      this.issue.addListener(this.onChange);
    },

    // Implement Adapter
    f: function(issue) {
      var view = this.X.QIssueTileView2.create({ browser: this.browser });
      view.put(issue);
      return view;
    },

    dataToPriority: function(data) {
      var numeric = parseInt(data);
      if ( ! Number.isNaN(numeric) ) return numeric;
      if ( this.map[data] !== undefined ) return this.map[data];
      if ( data ) console.warn('Unknown priority "' + data + '".');
      return 3;
    },

    toString: function() { return this.toHTML(); }
  },

  listeners: [
    {
      name: 'onChange',
      code: function() {
        this.browser.IssueDAO.put(this.issue);
      }
    },
    {
      name: 'dragStart',
      code: function(e) {
        e.dataTransfer.setData('application/x-foam-id', this.issue.id);
        e.dataTransfer.effectAllowed = 'move';
      },
    },
  ],

  templates: [
    function CSS() {/*
      .gridtile.priority-0 {
        border-color: #DB4437 !important;
      }
      .gridtile.priority-1 {
        border-color: #F4B400 !important;
      }
      .gridtile.priority-2 {
        border-color: #4285F4 !important;
      }
      .gridtile.priority-3 {
        border-color: #0F9D58 !important;
      }
    */},

    function toHTML() {/*
      <%
        var starView = PropertyView.create({prop: this.X.QIssue.STARRED, data: this.issue});
        var f = function() { this.browser.location.id = this.issue.id; };
      %>
      <div draggable="true" id="<%= this.on('dragstart', this.dragStart, this.id) %>" class="gridtile priority-<%= this.dataToPriority(this.issue.priority) %>">
        <table cellspacing="0" cellpadding="0"><tbody>
          <tr>
            <td class="id">
              <%= starView %>
              <a href="" id="<%= this.on('click', f, this.nextID()) %>">{{this.issue.id}}</a>
            </td>
            <td class="status">{{this.issue.status}}</td>
          </tr>
          <tr>
            <td colspan="2">
              <div><span id="<%= this.on('click', f, this.nextID()) %>">{{this.issue.summary}}</div></div>
            </td>
          </tr>
        </tbody></table>
      </div>
    */}
  ]
});
