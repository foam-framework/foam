CLASS({
  name: 'Controller',
  requires: ['foam.ui.DAOListView'],

  traits: ['foam.ui.CSSLoaderTrait'],

  properties: [
    { name: 'search', view: { factory_: 'foam.ui.TextFieldView', onKeyMode: true } },
    { name: 'dao', defaultValue: questions },
    {
      name: 'filteredDAO',
      model_: 'foam.core.types.DAOProperty',
      view: { factory_: 'foam.ui.DAOListView', mode: 'read-only' },
      dynamicValue: function() {
        return this.search.trim() ? this.dao.where(MQL(this.search)) : this.dao;
        /*
        return this.dao.where(CONTAINS_IC(SEQ(
          Question.TITLE,
          Question.QUESTION,
          Question.LABELS,
          Question.ANSWER), this.search));
          */
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
      code {
        background: #eee;
        display: inline-block;
        margin-left: 30px;
        padding: 16px;
        padding-top: 0;
      }
      .answer {
        display: inline;
      }
      * {
        overflow-wrap: break-word;
      }
    */},
    function toDetailHTML() {/*
        <hr>
        &nbsp;&nbsp; Search: $$search
        &nbsp;&nbsp;&nbsp;<a href="https://groups.google.com/forum/#!newtopic/foam-framework-discuss">Ask Question?</a>
        <hr>
        <foam f="filteredDAO" className="questions" tagName="div">
          <div>
            <a href="#q%%data.id"><b><font size="+1">Q$$id{mode: 'read-only'}.</font> $$title{mode: 'read-only'}</b></a>
          </div>
        </foam>

        <p>
        <foam f="filteredDAO" className="questions" tagName="div">
          <div>
            <hr>
            <a name="q%%data.id"><b><font size="+1">Q$$id{mode: 'read-only'}.</font> $$title{mode: 'read-only'}</b></a>
            <% if ( this.data.question.length ) { %><pre>$$question{mode: 'read-only', escapeHTML: false}</pre><% } else { %> <br> <% } %>
            <b><font size="+1">A.</font></b> <pre class="answer">$$answer{mode: 'read-only', escapeHTML: false}</pre>
            <b>labels:</b> <%= this.data.labels.join(', ') %><br>
            <% if ( this.data.src ) { %>
              <b>Source:</b> <a href="%%data.src">here</a><br>
            <% } %>
          </div>
        </foam>
    */}
  ]
});

/*
$$id{mode: 'read-only'}
*/
