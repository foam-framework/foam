CLASS({
  package: 'com.google.drive',
  name: 'FileDAOTest',
  requires: [
    'XHR',
    'com.google.drive.FileDAO',
    'foam.oauth2.AutoOAuth2',
    'foam.demos.olympics.Medal'
  ],
  tests: [
    {
      model_: 'UnitTest',
      name: 'abc',
      async: true,
      code: function(ret) {
        console.log("Testing");
        var authX = this.AutoOAuth2.create().Y;
        var agent = authX.lookup('foam.oauth2.EasyOAuth2').create({
          scopes: [
            'https://www.googleapis.com/auth/drive.appfolder'
          ],
          clientId: '982012106580-juaqtmvoue69plra0v6dlqv4ttbggqi3.apps.googleusercontent.com',
          clientSecret: '-uciG4ePPT5DXFccHn4kNHWq'
        }, authX);

        authX.registerModel(
          this.XHR.xbind({
            authAgent: agent,
          }));

        var dao = this.FileDAO.create({
          model: this.Medal
        }, authX);

        dao.select(console.log.json);
      }
    }
  ]
});
