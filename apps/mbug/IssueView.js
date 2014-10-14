MODEL({
  name: 'IssueView',
  extendsModel: 'UpdateDetailView',
  traits: ['VerticalScrollNativeTrait'],
  properties: [
    {
      name: 'scrollerID',
      getter: function() { return this.id + '-scroller'; }
    }
  ],
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
            <%
              // $$ syntax doesn't support embedded functions (yet), so define it here.
              var objToChoice = function(o) { return [o.status, o.status]; };
            %>
            $$status{
                model_: 'PopupChoiceView',
                iconUrl: 'images/ic_arrow_drop_down_24dp.png',
                showValue: true,
                dao: this.__ctx__.StatusDAO,
                objToChoice: objToChoice
              }
          </div>

          <div class="separator separator1"></div>
          $$owner{model_: 'CCView'}

          <div class="separator separator1"></div>
          $$cc{model_: 'CCView'}

          <div class="separator separator1"></div>
          $$labels{model_: 'IssueLabelView'}

          <div class="separator separator1"></div>
          $$content{model_: 'mdTextFieldView', label: 'Comment', onKeyMode: true }

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
