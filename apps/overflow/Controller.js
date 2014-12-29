CLASS({
  name: 'Controller',
  properties: [
    { name: 'search', view: { factory_: 'TextFieldView', onKeyMode: true } },
    { name: 'dao', defaultValue: questions },
    {
      name: 'filteredDAO',
      model_: 'DAOProperty',
      view: { factory_: 'DAOListView', mode: 'read-only' },
      dynamicValue: function() {
        return this.dao.where(CONTAINS_IC(SEQ(Question.TITLE, Question.QUESTION, Question.LABELS, Question.ANSWER), this.search));
      }
    }
  ],
  methods: {
    init: function() {
      this.SUPER();
      var i = window.location.href.indexOf('?q=');
      if ( i != -1 ) this.search = window.location.href.substring(i+3);
    }
  },
  templates: [
    function CSS() {/*
      .thumbnail { margin-bottom: 40px; }
      .screenshot {
        border: 1px solid gray;
        box-shadow: 5px 5px 15px gray;
        margin-left: 30px;
        margin-top: -38px;
      }
      span[name="description"] {
        margin-top: 24px;
        display: block;
        width: 500px;
    */},
    function toDetailHTML() {/*
        &nbsp;&nbsp; Search: $$search
        <p>
        <foam f="filteredDAO" className="questions" tagName="ul">
            $$id <!-- $$created -->
            <% if ( this.data.image ) { %> <br><a href="%%data.path"><img class="screenshot" width=250 height=250 src="democat/%%data.image"></a> <% } %>
            Q. $$questionTitle
            <p>$$question{mode: 'read-only', escapeHTML: false}</p>
            <p>$$answer{mode: 'read-only', escapeHTML: false}</p>
            <b>Labels:</b> <%= this.data.labels.join(', ') %><br>
            <% if ( this.data.src ) { %>
              <b>Source:</b> <a href="%%data.src">here</a><br>
            <% } %>
        </foam>
    */}
  ]
});
