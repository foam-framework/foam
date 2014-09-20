/**
 * Mobile QuickBug.
 **/

MODEL({
  name: 'CCView',
  extendsModel: 'AutocompleteListView',
  properties: [
    {
      name: 'srcDAO',
      factory: function() { return this.X.PersonDAO; }
    },
    {
      name: 'queryFactory',
      defaultValue: function(data) {
        return STARTS_WITH_IC(IssuePerson.NAME, data);
      }
    },
    {
      name: 'rowView',
      defaultValue: 'CitationView'
    },
    {
      name: 'acRowView',
      defaultValue: 'PersonView'
    }
  ]
});

MODEL({
  name: 'CitationView',
  extendsModel: 'DefaultRowView',
  properties: [ { name: 'className', defaultValue: 'CitationView' } ],
  templates: [
    function CSS() {/*
      .CitationView {
        padding: 12px 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        color: #575757;
      }
    */},
    function toInnerHTML() {/* 
      <%= this.X.IssueOwnerAvatarView.create({ data: this.data }) %>
      <div class="owner-name">{{ this.data }}</div>
      $$removeRow
    */}
  ]
});


MODEL({
  name: 'PersonView',
  extendsModel: 'DetailView',
  templates: [ function toHTML() {/*
    <div id="%%id" class="CitationView">
      $$name{model_: 'IssueOwnerAvatarView'}
      <div class="owner-name">{{ this.data.name }}</div>
    </div>
  */} ]
});


