/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function () {
  var usedModels = {
    "AbstractDAO":true,
    "AbstractDAOView":true,
    "Action":true,
    "ActionButtonCView2":true,
    "Arg":true,
    "Calc":true,
    "CalcSpeechView":true,
    "CalcView":true,
    "Constant":true,
    "CountExpr":true,
    "DAOController":true,
    "DAOListView":true,
    "DOMValue":true,
    "DetailView":true,
    "DragGesture":true,
    "Expr":true,
    "Gesture":true,
    "GestureManager":true,
    "GestureTarget":true,
    "History":true,
    "HistoryCitationView":true,
    "InputPoint": true,
    "Interface":true,
    "MainButtonsView":true,
    "Message":true,
    "Method":true,
    "Model":true,
    "NumberFormatter":true,
    "PinchTwistGesture":true,
    "PositionedDOMViewTrait":true,
    "PositionedViewTrait":true,
    "Property":true,
    "PropertyView":true,
    "Relationship":true,
    "ScrollGesture":true,
    "SecondaryButtonsView":true,
    "SimpleValue":true,
    "TapGesture":true,
    "Template":true,
    "TertiaryButtonsView":true,
    "TouchManager":true,
    "View":true,
    "WindowHashValue":true,
    "foam.core.bootstrap.ModelFileDAO":true,
    "foam.graphics.AbstractCViewView":true,
    "foam.graphics.ActionButtonCView":true,
    "foam.graphics.CView":true,
    "foam.graphics.CViewView":true,
    "foam.graphics.Circle":true,
    "foam.graphics.PositionedCViewView":true,
    "foam.html.Element":true,
    "foam.i18n.ChromeMessagesBuilder":true,
    "foam.i18n.ChromeMessagesExtractor":true,
    "foam.i18n.GlobalController":true,
    "foam.i18n.MessagesBuilder":true,
    "foam.i18n.Visitor":true,
    "foam.patterns.ChildTreeTrait":true,
    "foam.ui.SlidePanel":true,
    "foam.ui.Window":true,
    "foam.ui.animated.Label":true,
    "foam.ui.md.Flare":true,
    "foam.ui.md.Halo":true
  };

  var class_ = CLASS;

  GLOBAL.CLASS = function(m) {
    var id = m.package ? m.package + '.' + m.name : m.name;
    if ( usedModels[id] ) class_(m);
  };

  var templates = {
    'CalcView.CSS' : true,
    'foam.ui.animated.Label.CSS' : true,
    'CalcView.toHTML' : true,
    'HistoryCitationView.toHTML' : true,
    'foam.ui.SlidePanel.toHTML' : true,
    'MainButtonsView.toHTML' : true,
    'SecondaryButtonsView.toHTML' : true,
    'TertiaryButtonsView.toHTML' : true
  };

  var aevalTemplate_ = aevalTemplate;

  GLOBAL.aevalTemplate = function(t, model) {
    return templates[model.id + '.' + t.name] ?
      aevalTemplate_(t, model)  :
      aconstant(function() { return ''; }) ;
  };

})();
