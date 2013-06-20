var SyncManager = FOAM.create({
   model_: 'Model',

   name: 'SyncManager',

   properties: [
      {
	 name:  'srcDAO',
	 label: 'Source DAO',
         type:  'DAO',
	 hidden: true
      },
      {
	 name:  'dstDAO',
	 label: 'Destination DAO',
         type:  'DAO',
	 hidden: true
      },
      {
	 name:  'modifiedProperty',
         type:  'Property',
	 hidden: true
      },
      {
         model_: 'IntegerProperty',
	 name:  'issuesSynced'
      },
      {
         model_: 'IntegerProperty',
	 name:  'timesSynced'
      },
      {
         model_: 'IntegerProperty',
	 name:  'syncInterval',
         units: 's',
	 defaultValue: 60
      },
      {
         model_: 'IntegerProperty',
	 name:  'delay',
	 label: 'Delay',
	 help:  'Interval of time between repeating sync.',
	 units: 's',
	 defaultValue: 1
      },
      {
         model_: 'IntegerProperty',
	 name:  'batchSize',
	 defaultValue: 10
      },
      {
         model_: 'StringProperty',
	 name:  'syncStatus',
	 displayWidth: 60
      },
      {
         model_: 'IntegerProperty',
	 name:  'lastBatchSize',
	 defaultValue: 10
      },
      {
         model_: 'BooleanProperty',
	 name:  'isSyncing'
      },
      {
         model_: 'BooleanProperty',
	 name:  'enabled'
      },
      {
         model_: 'StringProperty',
	 name:  'lastId'
      },
      {
         model_: 'DateTimeProperty',
	 name:  'lastModified'
      }
   ],

   actions: [
      {
         model_: 'Action',
	 name:  'start',
	 label: 'Start',
	 help:  'Start the timer.',

	 isAvailable: function() { return true; },
	 isEnabled:   function() { return ! this.enabled; },
	 action:      function() { this.enabled = true; this.sync(); }
      },
      {
         model_: 'Action',
	 name:  'forceSync',
	 label: 'Force Sync',
	 help:  'Force a sync.',

	 isAvailable: function() { return true; },
	 isEnabled: function()   { return true; },
	 action: function()      {
	   clearTimeout(this.timer);
	   this.sync();
	 }
      },
      {
         model_: 'Action',
	 name:  'stop',
	 label: 'Stop',
	 help:  'Stop the timer.',

	 isAvailable: function() { return true; },
	 isEnabled: function()   { return this.enabled },
	 action: function()      { this.enabled = false; clearTimeout(this.timer); }
      }
   ],

   methods: {
      init: function() {
        AbstractPrototype.init.call(this);
	var self = this;

	this.dstDAO.select(MAX(this.modifiedProperty))(function (max) {
          if ( max.max ) self.lastModified = max.max;
        });
      },
      sync: function() {
        var self = this;
	var batchSize = this.batchSize;

	this.isSyncing = true;
        this.syncStatus = 'syncing...';
	this.srcDAO
	  .limit(batchSize)
          .where(GT(this.modifiedProperty, this.lastModified))
          .select([])(function(issues) {
            self.syncStatus = 'processing sync data';
	    self.timesSynced++;
	    self.lastBatchSize = issues.length;

	    issues.select(console.log.json); // TODO: for debugging, remove
	    issues.select(self.dstDAO)(function() {
	      self.isSyncing = false;
	      self.syncStatus = '';

	      self.issuesSynced += issues.length;

	      if ( issues.length ) {
	        var issue = issues[issues.length-1];
	        self.lastId = issue.id;
	        self.lastModified = new Date(issue.updated.getTime()+1);
	      }

	      self.schedule(issues.length == batchSize ?
	        self.delay :
 		self.syncInterval);
            });
          });
      },
      schedule: function(syncInterval) {
	 if ( ! this.enabled ) return;

	 this.timer = setTimeout(this.sync.bind(this), syncInterval * 1000);
      }
   }
});
