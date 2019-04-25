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
  name: 'Game',
  package: 'foam.demos.lightsout',
  requires: [
    'foam.demos.lightsout.Node',
    'foam.demos.lightsout.NodesView',
  ],
  properties: [
    {
      type: 'Array',
      swiftType: '[[Node]]',
      view: 'foam.demos.lightsout.NodesView',
      swiftView: 'NodesView',
      name: 'nodes',
    },
    {
      type: 'Int',
      name: 'height',
      defaultValue: 5,
    },
    {
      type: 'Int',
      name: 'width',
      defaultValue: 5,
    },
    {
      type: 'Boolean',
      hidden: true,
      name: 'flipping',
    },
  ],
  actions: [
    {
      name: 'newGame',
      isObjC: "true",
      code: function() {
        var nodes = [];
        for (var x = 0; x < this.width; x++) {
          nodes.push([]);
          for (var y = 0; y < this.height; y++) {
            var node = this.Node.create({
              x: x,
              y: y,
              game: this,
            });
            nodes[x][y] = node;
          }
        }
        this.nodes = nodes;
      },
      swiftCode: function() {/*
        var nodes: [[Node]] = [];
        for x in 0...width-1 {
          nodes.append([]);
          for y in 0...height-1 {
            let node = Node(args: [
              "x": x as Optional<AnyObject>,
              "y": y as Optional<AnyObject>,
              "game": self,
            ]);
            nodes[x].append(node)
          }
        }
        self.nodes = nodes;
      */},
    },
  ],
  methods: [
    {
      name: 'init',
      code: function() {
        this.SUPER();
        this.newGame();
      },
      swiftCode: function() {/*
        super._foamInit_()
        newGame()
      */},
    },
  ],
});
