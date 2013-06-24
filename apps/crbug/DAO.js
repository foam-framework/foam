var IssueRestDAO = FOAM.create({
  model_: 'Model',
  extendsModel: 'RestDAO',

  name: 'IssueRestDAO',

  methods: {
    jsonToObj: function(json) {
      // Adapt IssuePerson types to just Strings
      if ( json.cc ) {
        for ( var i = 0 ; i < json.cc.length ; i++ )
	  json.cc[i] = json.cc[i].name.intern();
      }
      if ( json.owner ) json.owner = json.owner.name.intern();
      if ( json.author ) json.author = json.author.name.intern();

      if ( json.mergedInto ) json.mergedInto = json.mergedInto.issueId;
      json.state = json.state.intern();
      json.status = json.status.intern();
      if ( json.summary == json.title ) json.summary = json.title;
      delete json['kind'];
      delete json['projectId'];
      if ( json.labels ) json.labels = json.labels.intern();
      if ( json.closed ) json.closed = new Date(json.closed).getTime()/1000;
      if ( json.updated ) json.updated = new Date(new Date(json.updated).getTime());
      if ( json.published ) json.published = new Date(json.published).getTime()/1000;

      return this.model.create(json);
    }
  }
});

var IssueNetworkDAO = IssueRestDAO.create({
  url:'https://www-googleapis-staging.sandbox.google.com/projecthosting/v2/projects/chromium/issues',
  model: CIssue
});

// IssueNetworkDAO = IssueNetworkDAO.limit(10);


var IssueCommentNetworkDAO = RestDAO.create({
  url:'https://www-googleapis-staging.sandbox.google.com/projecthosting/v2/projects/chromium/issues/',
  model: IssueComment
});

IssueCommentNetworkDAO.buildURL = function(options) {
  return this.url + options.query.arg2.f() + '/comments';
};
IssueCommentNetworkDAO.jsonToObj = function(json) {
  if ( json.author ) json.author = json.author.name;

  return this.model.create(json);
};


// Usage:

var FIVE_MINS = 10 * 60 * 1000;

/*
IssueNetworkDAO
  .where(GT(CIssue.UPDATED, new Date(Date.now() - FIVE_MINS)))
  .limit(10)
  .select(console.log.json);

IssueCommentNetworkDAO.where(EQ(CrIssue.ID, 225776)).select(console.log.json);
*/
