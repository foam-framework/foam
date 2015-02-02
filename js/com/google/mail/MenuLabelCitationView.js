CLASS({
  name: 'MenuLabelCitationView',
  package: 'com.google.mail',
  extendsModel: 'DetailView',
  requires: ['SimpleValue'],
  imports: [
    'counts',
    'controller'
  ],
  properties: [
    {
      name: 'count',
      view: { factory_: 'TextFieldView', mode: 'read-only', extraClassName: 'count' }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      if ( this.counts.groups[this.data.name] ) this.bindGroup();
      else this.bindCounts();
    },
    bindCounts: function() {
      this.counts.addListener(this.bindGroup);
    }
  },
  listeners: [
    {
      name: 'bindGroup',
      code: function() {
        if ( this.counts.groups[this.data.name] ) {
          this.counts.removeListener(this.bindGroup);
          this.counts.groups[this.data.name].addListener(this.updateCount);
          this.updateCount();
        }
      }
    },
    {
      name: 'updateCount',
      code: function() {
        if ( this.counts.groups[this.data.name] )
          this.count = this.counts.groups[this.data.name].count;
      }
    }
  ],
  templates: [
    function CSS() {/*
      .label-row {
        height: 42px;
        line-height: 42px;
        padding-left: 15px;
        display: flex;
        align-items: center;
      }
      .label-row img {
        height: 24px;
        width: 24px;
        opacity: 0.6;
        margin-right: 25px;
        flex-grow: 0;
        flex-shrink: 0;
      }
      .label-row .label {
        flex-grow: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .label-row .count {
        flex-grow: 0;
        flex-shrink: 0;
        margin-right: 10px;
        text-align: center;
        text-align: right;
        width: 40px;
      }
    */},
    function toHTML() {/*
      <div id="%%id" class="label-row">
        $$iconUrl
        $$label{mode: 'read-only', extraClassName: 'label' }
        $$count
      </div>
      <% this.on('click', function() { this.controller.changeLabel(this.data); }, this.id); %>
    */}
  ]
});
