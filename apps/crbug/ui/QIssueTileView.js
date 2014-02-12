var QIssueTileView = FOAM({
   model_: 'Model',

   extendsModel: 'AbstractView',

   name: 'QIssueTileView',
   label: 'QIssue Tile View',

   properties: [
      {
         name:  'browser'
      },
      {
         name:  'issue',
         type:  'QIssue'
      }
   ],

   methods: {
     // Implement Sink
     put: function(issue) {
       if ( this.issue ) { this.issue.removeListener(this.onChange); }

       this.issue = issue.clone();
       this.issue.addListener(this.onChange);
     },

     // Implement Adapter
     f: function(issue) {
       var view = QIssueTileView.create({ browser: this.browser });
       view.put(issue);
       return view;
     },

     toString: function() { return this.toHTML(); }
   },

   listeners: [
      {
         name: 'onChange',
         code: function() {
            this.browser.IssueDAO.put(this.issue);
         }
      },
     {
       name: 'dragStart',
       code: function(e) {
         e.dataTransfer.setData('application/x-foam-id', this.issue.id);
         e.dataTransfer.effectAllowed = 'move';
       },
     },
   ],

   templates:[
     { name: 'toHTML' }
   ]
});
