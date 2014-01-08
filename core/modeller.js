// localStorage.removeItem('Models');
    // to re-load models into local storage run the follow from JS shell: localStorage.removeItem('models');
    var models = [
       Action,
       AlternateView,
//       ApplicationPower,
//       BatteryMeter,
       BookmarkModel,
       CIssueBrowser,
//       Canvas,
//       CIssue,
//       CIssueTileView,
       Dragon,
       Circle,
       ClockView,
       DAOController,
       DAOCreateController,
       DAOUpdateController,
       EMail,
       EyeCView,
       EyesCView,
       Graph,
       Issue,
//        Method,
//       Model,
       Mouse,
//       NeedleMeter,
//       PanelCView,
//       Power,
//       Property,
       Rectangle,
//       Screen,
       StackView,
       TextAreaView,
       Template,
       Timer,
       UnitTest,
       System,
       Developer,
//       EMail
    ];

var ModelDAO = StorageDAO.create({model: Model});
ModelDAO.find(TRUE, {error: function() { console.log('Populating DAO...'); models.select(ModelDAO); }});
    
var stack = StackView.create();
stack.write(document);
FOAM.browse(Model, ModelDAO);
