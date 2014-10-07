MODEL({
  name: 'IssueView',
  extendsModel: 'UpdateDetailView',
  properties: [
    {
      name: 'scroller$',
      getter: function() { return this.X.$(this.id + '-scroller'); }
    },
    {
      name: 'scrollHeight'
    },
    {
      name: 'viewportHeight',
      defaultValueFn: function() {
        return this.$ && this.$.offsetHeight;
      }
    },
    {
      name: 'scrollTop',
      hidden: true,
      defaultValue: 0,
      postSet: function(_, nu) {
        var s = this.$.getElementsByClassName('body')[0];
        if ( s ) s.scrollTop = nu;
      }
    },
    {
      name: 'verticalScrollbarView',
      defaultValue: 'VerticalScrollbarView'
    },
    {
      name: 'scrollGesture',
      hidden: true,
      transient: true,
      factory: function() {
        var self = this;
        return this.X.GestureTarget.create({
          container: {
            containsPoint: function(x, y, e) {
              var s = self.scroller$;
              while ( e ) {
                if ( e === s ) return true;
                e = e.parentNode;
              }
              return false;
            }
          },
          handler: this,
          gesture: 'verticalScrollMomentum'
        });
      }
    }
  ],
  // TODO: Make traits for DOM (overflow: scroll) and abspos scrolling.
  listeners: [
    {
      name: 'verticalScrollMove',
      code: function(dy, ty, y, stopMomentum) {
        this.scrollTop -= dy;

        // Cancel the momentum if we've reached the edge of the viewport.
        if ( stopMomentum && (
            this.scrollTop === 0 ||
            this.scrollTop + this.viewportHeight === this.scrollHeight ) ) {
          stopMomentum();
        }
      }
    },
    {
      name: 'updateScrollHeight',
      code: function() {
        this.scrollHeight = parseFloat(this.scroller$.style.height);
      }
    }
  ],
  methods: {
    initHTML: function() {
      this.SUPER();
      this.X.gestureManager.install(this.scrollGesture);

      /*
      var verticalScrollbar = FOAM.lookup(this.verticalScrollbarView, this.X).create({
        height$: this.viewportHeight$,
        scrollTop$: this.scrollTop$,
        scrollHeight$: this.scrollHeight$
      });

      this.$.getElementsByClassName('body')[0].insertAdjacentHTML('beforeend', verticalScrollbar.toHTML());
      this.X.setTimeout(function() { verticalScrollbar.initHTML(); }, 0);
      */
    },

    destroy: function() {
      this.SUPER();
      this.X.gestureManager.uninstall(this.scrollGesture);
    }
  },
  actions: [
    {
      name: 'back',
      label: '',
      iconUrl: 'images/ic_arrow_back_24dp.png'
    },
    {
      name: 'cancel',
      label: '',
      iconUrl: 'images/ic_clear_24dp.png'
    },
    {
      name: 'save',
      label: '',
      iconUrl: 'images/ic_done_24dp.png'
    }
  ],
  templates: [
    function headerToHTML() {/*
      <div class="header">
        <div class="toolbar">
          $$back
          $$cancel
          <span class="expand"></span>
          $$save
          $$starred{
            model_: 'ImageBooleanView',
            className:  'star',
            trueImage:  'images/ic_star_white_24dp.png',
            falseImage: 'images/ic_star_outline_white_24dp.png'
          }
        </div>
        <div class="title">
          #&nbsp;$$id{mode: 'read-only'} $$summary{mode: 'read-only'}
        </div>
      </div>
    */},

    // TODO: get options from QProject
    function bodyToHTML() {/*
      <div class="body">
        <div id="<%= this.id %>-scroller" class="body-scroller">
          <div class="choice">
          <% if ( this.data.pri ) { %>
            $$pri{ model_: 'PriorityView' }
            $$pri{
              model_: 'PopupChoiceView',
              iconUrl: 'images/ic_arrow_drop_down_24dp.png',
              showValue: true
            }
          <% } else { %>
            $$priority{ model_: 'PriorityView' }
            $$priority{
              model_: 'PopupChoiceView',
              iconUrl: 'images/ic_arrow_drop_down_24dp.png',
              showValue: true
            }
          <% } %>
          </div>
          <div class="choice">
            <img src="images/ic_keep_24dp.png" class="status-icon">
            <%=
              this.createTemplateView('STATUS', {
                model_: 'PopupChoiceView',
                iconUrl: 'images/ic_arrow_drop_down_24dp.png',
                showValue: true,
                dao: this.X.StatusDAO,
                objToChoice: function(o) { return [o.status, o.status]; }
              })
            %>
          </div>

          <div class="separator separator1"></div>
          $$owner{model_: 'CCView'}

          <div class="separator separator1"></div>
          $$cc{model_: 'CCView'}

          <div class="separator separator1"></div>
          $$labels{model_: 'IssueLabelView'}

          $$comments{ viewModel: { model_: 'DAOListView', mode: 'read-only', rowView: 'CommentView' } }
        </div>
      </div>
    */},

    function toHTML() {/*
      <div id="<%= this.id %>" class="issue-edit">
        <%= this.headerToHTML() %>
        <%= this.bodyToHTML() %>
      </div>
    */}
  ]
});
