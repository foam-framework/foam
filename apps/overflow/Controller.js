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
        return this.dao.where(CONTAINS_IC(SEQ(
          Question.TITLE,
          Question.QUESTION,
          Question.LABELS,
          Question.ANSWER), this.search));
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
    */},
    function toDetailHTML() {/*
        <h1>FOAM-Overflow</h1>
        &nbsp;&nbsp; Search: $$search
        <p>
        <foam f="filteredDAO" className="questions" tagName="div">
          <div>
            $$id{mode: 'read-only'} <!-- $$created{mode: 'read-only'} -->
            <b>Q. $$title{mode: 'read-only'}</b>
            <% if ( this.data.question.trim().length ) { %><pre>$$question{mode: 'read-only', escapeHTML: false}</pre><% } %>
            <pre>$$answer{mode: 'read-only', escapeHTML: false}</pre>
            <b>Labels:</b> <%= this.data.labels.join(', ') %><br>
            <% if ( this.data.src ) { %>
              <b>Source:</b> <a href="%%data.src">here</a><br>
            <% } %>
          </div>
        </foam>
    */}
  ]
});
