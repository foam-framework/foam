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

CLASS({
  name: 'NodesView',
  package: 'foam.demos.lightsout',
  extends: 'foam.ui.SimpleView',
  requires: [
    'foam.ui.BooleanView',
  ],
  swiftClassImports: ['UIKit'],
  properties: [
    {
      name: 'data',
      postSet: function() {
        this.updateView();
      },
      swiftPostSet: 'self.updateView()',
    },
    {
      name: 'view',
      labels: ['swift'],
      swiftType: 'UIView',
      swiftFactory: 'return UIView()',
    },
  ],
  methods: [
    {
      name: 'updateView',
      code: function() {
        if (!this.data) return;
        if (!this.$) return;

        var views = [];
        for (var x = 0; x < this.data.length; x++) {
          views.push([]);
          for (var y = 0; y < this.data[x].length; y++) {
            var view = this.BooleanView.create();
            view.data$ = this.data[x][y].data$;
            views[x].push(view);
          }
        }
        var html = '';
        for (var x = 0; x < this.data.length; x++) {
          for (var y = 0; y < this.data[x].length; y++) {
            html += views[x][y].toHTML();
          }
          html += '<br/>';
        }
        this.$.innerHTML = html;
        for (var x = 0; x < this.data.length; x++) {
          for (var y = 0; y < this.data[x].length; y++) {
            views[x][y].initHTML();
          }
        }
      },
      swiftCode: function() {/*
        if self.data == nil { return }
        let data = self.data as! [[Node]]
        if data.count == 0 { return }

        var views: [[FoamUISwitch]] = [];
        for x in 0...data.count-1 {
          views.append([])
          for y in 0...data[x].count-1 {
            let v = FoamUISwitch();
            v.data$ = data[x][y].data$;
            views[x].append(v);
          }
        }

        for v in self.view.subviews { v.removeFromSuperview() }

        var viewMap: [String:UIView] = [:]
        for x in 0...data.count-1 {
          for y in 0...data[x].count-1 {
            let v = views[x][y].view
            v.translatesAutoresizingMaskIntoConstraints = false
            view.addSubview(v)
            viewMap["x\(x)y\(y)"] = v
          }
        }

        for x in 0...data.count-1 {
          var vert: [String] = []
          for y in 0...data[x].count-1 {
            vert.append("x\(x)y\(y)")
          }
          let vertStr = vert.joinWithSeparator("]-[")
          view.addConstraints(NSLayoutConstraint.constraintsWithVisualFormat(
              "V:|-[\(vertStr)]-|",
              options: .AlignAllLeft,
              metrics: nil,
              views: viewMap))
        }

        var horiz: [String] = []
        for x in 0...data.count-1 {
          horiz.append("x\(x)y0")
        }
        let horizStr = horiz.joinWithSeparator("]-[")
        view.addConstraints(NSLayoutConstraint.constraintsWithVisualFormat(
            "H:|-[\(horizStr)]-(>=0)-|",
            options: .AlignAllCenterY,
            metrics: nil,
            views: viewMap))
      */},
    },
    {
      name: 'initHTML',
      code: function() {
        this.SUPER();
        this.updateView();
      },
    },
    {
      name: 'init',
      swiftCode: function() {/*
        super._foamInit_()
        updateView()
      */},
    },
  ],
  templates: [
    function toHTML() {/*
      <div id="%%id"></div>
    */},
  ],
});
