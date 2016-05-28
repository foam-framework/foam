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
  name: 'Node',
  package: 'foam.demos.lightsout',
  properties: [
    {
      type: 'Boolean',
      name: 'data',
      postSet: function(_, n) {
        if (this.game.flipping) return;
        this.game.flipping = true;

        var toFlip = [
          [this.x+1, this.y],
          [this.x-1, this.y],
          [this.x, this.y+1],
          [this.x, this.y-1],
        ]

        var nodes = this.game.nodes;
        toFlip.forEach(function(xy) {
          var x = xy[0], y = xy[1];
          if (x < 0 || x >= nodes.length) return;
          if (y < 0 || y >= nodes[x].length) return;
          nodes[x][y].data = !nodes[x][y].data;
        });

        this.game.flipping = false;
      },
      swiftPostSet: function() {/*
        if self.game.flipping { return }
        self.game.flipping = true;

        let toFlip: [[Int]] = [
          [self.x+1, self.y],
          [self.x-1, self.y],
          [self.x, self.y+1],
          [self.x, self.y-1],
        ]

        let nodes = self.game.nodes;
        for xy in toFlip {
          let x = xy[0], y = xy[1];
          if x < 0 || x >= nodes.count { continue }
          if y < 0 || y >= nodes[x].count { continue }
          nodes[x][y].data = !nodes[x][y].data
        }

        self.game.flipping = false;
      */},
    },
    {
      type: 'FObject',
      subType: 'foam.demos.lightsout.Game',
      name: 'game',
    },
    {
      type: 'Int',
      name: 'x',
    },
    {
      type: 'Int',
      name: 'y',
    },
  ],
});
