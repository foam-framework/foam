CLASS({
  name: 'AddRowView',
  package: 'foam.ui.md',
  extendsModel: 'View',
  traits: ['PositionedDOMViewTrait', 'VerticalScrollNativeTrait'],

  imports: [
    'addRowToList',
    'rowView',
    'setTimeout',
    'stack'
  ],

  properties: [
    {
      name: 'data'
    },
    {
      model_: 'DAOProperty',
      name: 'dao',
      view: {
        factory_: 'DAOListView',
        className: 'rows',
        tagName: 'div',
        useSelection: true
      }
    },
    {
      // TODO: DAO should be pre-limited instead
      name: 'limit',
      defaultValue: 40
    },
    {
      name: 'className',
      defaultValue: 'AddRowView'
    },
    {
      name: 'bodyId',
      factory: function() { return this.nextID(); }
    },
    {
      name: 'scrollerID',
      factory: function() { return this.nextID(); }
    },
    {
      name: 'hideListOnSingle',
      documentation: 'When true (the default), the suggestion list disappears when there is only one match. When false it is always visible.',
      defaultValue: true
    },
  ],

  templates: [
    function CSS() {/*
      .AddRowView {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        background: #e1e1e1;
        overflow: hidden;
      }
      .AddRowView .arvHeader {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #d2d2d2;
        background: #fff;
        flex-grow: 0;
        flex-shrink: 0;
      }
      .AddRowView .arvBody {
        flex-grow: 1;
        overflow-y: auto;
      }
      .AddRowView canvas {
        background: #3e50b4;
      }
      .AddRowView input {
        outline: none;
        border: none;
        font-size: 17px;
        flex-grow: 1;
        margin: 0 0 0 12px;
        padding: 0;
      }
      .AddRowView .rows {
        width: 100%;
        border: none;
      }
      .AddRowView .rows-row {
        padding: 0 12px 0 16px;
      }
    */},
    function toInnerHTML() {/*
      <div class="arvHeader">
        $$close $$data
      </div>
      <div class="arvBody" id="%%bodyId">
        $$dao{ rowView: this.rowView }
      </div>
    */}
  ],

  methods: {
    initHTML: function() {
      this.SUPER();

      this.data$.addListener(function() { this.close(); }.bind(this));
      this.softValue = DomValue.create(this.dataView.$, 'input');

      if ( this.hideListOnSingle ) {
        this.softValue.addListener(function() {
          var data = this.softValue.get();
          var src  = this.X.dao.limit(this.limit);
          var dao  = src.where(data ? this.X.queryFactory(data) : TRUE);

          var self = this;
          dao.limit(2).select()(function(objs) {
            self.dao = ( objs.length === 1 && objs[0].id === data /* self.f(objs[0]) === data */ ) ? src.where(FALSE) : dao;
          });
        }.bind(this));
      }

      this.dao = this.X.dao.limit(this.limit);
    },

    initInnerHTML: function() {
      this.SUPER();

      this.daoView.selection$.addListener(function(_, _, _, data) {
        this.data = data.id;
      }.bind(this));
    }
  },

  actions: [
    {
      name: 'close',
      label: '',
      iconUrl: 'images/ic_arrow_back_24dp.png',
      action: function() {
        // Don't close twice.
        if ( this.closed_ ) return;
        this.closed_ = true;

        // Hack: If you click on one of the labels the data will be updated twice:
        //  once when then text field gets the onBlur event and once when
        //  selecting the label sets it.  In this case, we only want the second
        //  value which will contain the full label text.  So we delay by a bit to give
        //  the second update time to happen.
        this.setTimeout(function() {
          this.addRowToList(this.data);
          this.stack.back();
        }.bind(this), 150);
      }
    }
  ]
});
