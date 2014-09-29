var mbug;

(function() {
    var service = analytics.getService('MBug');
    var tracker = service.getTracker('UA-47217230-4');
    tracker.sendAppView('MainView');
})();

window.onload = function() {
  var Y = bootCORE(Application.create({
    name: 'MBug'
  }));

  aseq(apar(arequire('Action'),
            arequire('Arg'),
            arequire('Method'),
            arequire('Interface'),
            arequire('Template'),
            arequire('Relationship'),
            arequire('AutocompleteView'),
            arequire('WindowHashValue'),
            arequire('AutocompleteListView'),
            arequire('VerticalScrollbarView'),
            arequire('ActionSheetView'),
            arequire('StackView'),
            arequire('GridView'),
            arequire('ScrollView'),
            arequire('Expr'),
            arequire('AbstractDAO'),
            arequire('DAOController'),
            arequire('DAOCreateController'),
            arequire('OAuth2ChromeIdentity'),
            arequire('OAuth2ChromeApp'),
            arequire('AddBookmarkDialog'),
            arequire('TextFieldView'),
            arequire('View'),
            arequire('AppController'),
            arequire('MDMonogramStringView'),
            arequire('CursorView'),
            arequire('QIssueDetailView'),
            arequire('QIssueCommentCreateView'),
            arequire('QIssueCommentUpdateDetailView'),
            arequire('QIssueTileView'),
            arequire('ConfigureProjectsView'),
            arequire('MementoMgr'),
            arequire('Browser'),
            arequire('PriorityView'),
            arequire('PriorityCitationView'),
            arequire('IssueView'),
            arequire('CitationView'),
            arequire('PersonView'),
            arequire('DefaultRowView'),
            arequire('DefaultACRowView'),
            arequire('AddRowView'),
            arequire('AutocompleteListView'),
            arequire('IssueOwnerAvatarView'),
            arequire('IssueCitationView'),
            arequire('CommentView'),
            arequire('ChangeProjectView'),
            arequire('Application'),
            arequire('IDBDAO'),
            arequire('DAOVersion'),
            arequire('MBug'),
            arequire('QBug'),
            arequire('PersistentContext'),
            arequire('Binding'),
            arequire('RestDAO'),
            arequire('TouchManager'),
            arequire('GestureManager'),
            arequire('ScrollGesture'),
            arequire('TapGesture'),
            arequire('DragGesture'),
            arequire('PinchTwistGesture'),
            arequire('DetailView'),
            arequire('OAuth2'),
            arequire('OAuthXhrFactory'),
            arequire('QIssueCommentAuthorView')),
       function(ret) {
         var w = Y.Window.create({ window: window });
         mbug = Y.MBug.create();
         w.view = mbug;
         ret();
       })(function(){});
};
