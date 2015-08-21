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
    "ArrayProperty": true,
    "BooleanProperty": true,
    "DateProperty": true,
    "DateTimeProperty": true,
    "DocumentationProperty": true,
    "EMailProperty": true,
    "FactoryProperty": true,
    "FloatProperty": true,
    "FunctionProperty": true,
    "IntProperty": true,
    "ModelProperty": true,
    "ReferenceArrayProperty": true,
    "ReferenceProperty": true,
    "StringArrayProperty": true,
    "StringProperty": true,
    "URLProperty": true,
    "ViewFactoryProperty": true,
    "ViewProperty": true,
    "AbstractDAO":true,
    "foam.core.types.DAOProperty":true,
    "foam.dao.ProxyDAO":false,
    "foam.dao.FutureDAO":false,
    "Action":true,
    "ActionButtonCView2":true,
    "Arg":true,
    "Calc":true,
    "foam.apps.calc.CalcSpeechView":true,
    "foam.apps.calc.CalcView":true,
    "foam.apps.calc.CalcButton":true,
    "foam.apps.calc.Fonts":true,
    "Constant":true,
    "CountExpr":true,
    "DAOController":true,
    "foam.ui.DAOListView":true,
    "DOMValue":true,
    "foam.ui.DetailView":false,
    "foam.input.touch.DragGesture":true,
    "Expr":true,
    "foam.input.touch.Gesture":true,
    "foam.input.touch.GestureManager":true,
    "foam.input.touch.GestureTarget":true,
    "foam.apps.calc.History":true,
    "foam.apps.calc.HistoryCitationView":true,
    "foam.input.touch.InputPoint": true,
    "Interface":true,
    "foam.apps.calc.MainButtonsView":true,
    "Message":true,
    "Method":true,
    "Model":true,
    "foam.apps.calc.NumberFormatter":true,
    "foam.input.touch.PinchTwistGesture":true,
    "foam.ui.layout.PositionedDOMViewTrait":true,
    "foam.ui.layout.PositionedViewTrait":true,
    "Property":true,
    "foam.ui.PropertyView":true,
    "foam.ui.AsyncLoadingView":true,
    "Relationship":true,
    "foam.input.touch.ScrollGesture":true,
    "foam.apps.calc.SecondaryButtonsView":true,
    "SimpleValue":true,
    "foam.input.touch.TapGesture":true,
    "Template":true,
    "foam.apps.calc.TertiaryButtonsView":true,
    "foam.input.touch.TouchManager":true,
    "foam.ui.View":true,
    "foam.ui.SimpleView":true,
    "foam.ui.BaseView":true,
    "foam.ui.HTMLViewTrait":true,
    "foam.ui.HTMLPropertyViewTrait":true,
    "foam.ui.LeafDataView":true,
    "foam.ui.DAODataViewTrait":true,
    "foam.ui.DestructiveDataView":true,
    "foam.ui.AbstractDAOView":true,
    "foam.core.bootstrap.ModelFileDAO":true,
    "foam.graphics.AbstractCViewView":true,
    "foam.graphics.ActionButtonCView":true,
    "foam.graphics.CView":true,
    "foam.graphics.CViewView":true,
    "foam.graphics.Circle":true,
    "foam.graphics.PositionedCViewView":true,
    "foam.graphics.webgl.CViewGLView":false,
    "foam.graphics.webgl.GLView":false,
    "foam.graphics.webgl.GLViewView":false,
    "foam.html.Element":true,
    "foam.i18n.IdGenerator":true,
    "foam.i18n.ChromeMessagesInjector":true,
    "foam.i18n.GlobalController":true,
    "foam.i18n.MessagesExtractor":true,
    "foam.i18n.Visitor":true,
    "foam.patterns.ChildTreeTrait":true,
    "foam.ui.SlidePanel":true,
    "foam.ui.Window":true,
    "foam.ui.animated.Label":true,
    "foam.ui.md.Flare":true,
    "foam.ui.md.Halo":true,
    "foam.ui.FoamTagView":true
  };

  var class_ = CLASS;

  GLOBAL.CLASS = function(m) {
    var id = m.package ? m.package + '.' + m.name : m.name;
    if ( usedModels[id] ) class_(m);
  };

  var aevalTemplate_ = aevalTemplate;

  GLOBAL.aevalTemplate = function(t, model) {
    return aconstant(t.code ? t.code : function() { return ''; }) ;
  };
})();
