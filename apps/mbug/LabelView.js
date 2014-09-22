
MODEL({
  name: 'IssueLabelView',
  extendsModel: 'AutocompleteListView',
  properties: [
    {
      name: 'srcDAO',
      factory: function() { return this.X.LabelDAO; }
    },
    {
      name: 'queryFactory',
      defaultValue: function(data) {
        return CONTAINS_IC(IssueLabel.NAME, data);
      }
    },
    {
      name: 'rowView',
      defaultValue: 'LabelCitationView'
    },
    {
      name: 'acRowView',
      defaultValue: 'LabelView'
    }
  ]
});


MODEL({
  name: 'LabelCitationView',
  extendsModel: 'DefaultRowView',
  traits: ['ColoredBackgroundTrait'],
  properties: [ { name: 'className', defaultValue: 'LabelCitationView' } ],
  templates: [
    function CSS() {/*
      .IssueLabel {
        border-radius: 3px;
        color: white;
        font-size: 16px;
        margin-right: 30px;
        margin-top: 12px;
        padding: 12px;
      }
    */},
    function toInnerHTML() {/*
      <div class="IssueLabel" <%= this.generateColorStyle(this.data) %>>{{ this.data }}</div>
      $$removeRow
    */}
  ]
});


MODEL({
  name: 'LabelView',
  extendsModel: 'DetailView',
  traits: ['ColoredBackgroundTrait'],
  templates: [ function toHTML() {/*
    <div id="%%id" %%generateColorStyle(this.data.label) class="IssueLabel">{{ this.data.label }}</div>
  */} ]
});


