
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
        return CONTAINS_IC(QIssueLabel.LABEL, data);
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
        flex-direction: row;
        align-items: center;
        display: flex;

        border-radius: 50px;
        color: white;
        font-size: 14px;
        margin-right: 12px;
        margin-top: 12px;
        padding: 10px;
        padding-left: 28px;
border: 1px solid rgba(0,0,0,.1);
      }
      .IssueLabel canvas {
        background: rgba(0,0,0,0);
      }
    */},
    function toInnerHTML() {/*
      <div class="IssueLabel" <%= this.generateColorStyle(this.data.match(/[^-]+/)[0]) %>>
        <div style="flex: 1 0 auto;">{{ this.data }}</div>
        $$removeRow{width: 20, height: 20, iconUrl: 'images/ic_clear_24dp.png'}
      </div>
    */}
  ]
});


MODEL({
  name: 'LabelView',
  extendsModel: 'DetailView',
  traits: ['ColoredBackgroundTrait'],
  templates: [ function toHTML() {/*
    <div id="%%id" %%generateColorStyle(this.data.label.match(/[^-]+/)[0]) class="IssueLabel">{{ this.data.label }}</div>
  */} ]
});
