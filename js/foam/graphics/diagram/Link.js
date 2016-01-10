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
  package: 'foam.graphics.diagram',
  name: 'Link',
  extends: 'foam.graphics.CView',

  properties: [
    {
      name: 'start',
//       type: 'foam.graphics.diagram.LinkPoint[]',
      documentation: function () {/* The potential starting points of the link. */},
      postSet: function (old, nu) {
        if (old) old.forEach(function (pt) {
          pt.removeListener(this.propagatePointChange);
        }.bind(this));
        if (nu) nu.forEach(function (pt) {
          pt.addListener(this.propagatePointChange);
        }.bind(this));
      }
    },
    {
      name: 'end',
//      type: 'foam.graphics.diagram.LinkPoint[]',
      documentation: function () {/* The potential ending points of the link. */},
      postSet: function (old, nu) {
        if (old) old.forEach(function (pt) {
          pt.removeListener(this.propagatePointChange);
        }.bind(this));
        if (nu) nu.forEach(function (pt) {
          pt.addListener(this.propagatePointChange);
        }.bind(this));
      }
    },
    {
      name: 'style',
      type: 'String',
      defaultValue: 'manhattan',
      documentation: function () {/* The connector style. Choose from manhattan. */},
    },
    {
      name: 'arrowLength',
      type: 'Int',
      defaultValue: 20,
      documentation: function() {/* The pixel length of the arrowhead. */},
    },
    {
      name: 'arrowStyle',
      type: 'String',
      defaultValue: 'association', // aggregation, composition, generalization, dependency
      documentation: function () {/* Arrow styles:
             <ul><li>association: no arrows</li>
                 <li>aggregation: hollow diamond at start</li>
                 <li>composition: filled diamond at start</li>
                 <li>generalization: hollow arrow at start</li>
                 <li>dependency: open arrow at end</li>
              </ul>*/},
    }

  ],

  listeners: [
    {
      name: 'propagatePointChange',
      code: function() {
        // fake a prop change so the canvas repaints TODO(jacksonic): replace this with a better notification system
        this.propertyChange('x', this.x, this.x+1);
      }
    }
  ],

  methods: {
    paintSelf: function(c)  {
      this.SUPER(c);

      c.save();

      // get back to global coordinates
      if (this.parent.globalX && this.parent.globalY) {
        c.translate(-(this.parent.globalX + this.x), -(this.parent.globalY + this.y));
      }

      var H = 0;
      var V = 1;
      var sideDirs = { left: -1, right: 1, top: -1, bottom: 1 };
      var orientations = { left: H, right: H, top: V, bottom: V };

      var points = this.selectBestPoints(H,V,sideDirs,orientations, c);
      var s = points.start.offsetBy(this.arrowLength);
      var e = points.end.offsetBy(this.arrowLength);

      this.paintArrows(c, points, s, e);

      // draw connector
      if (this.style === 'manhattan')
      {
        // hor/vert orientation of points
        var sOr = (points.start.side==='left' || points.start.side==='right')? H : V;
        var eOr = (points.end.side==='left' || points.end.side==='right')? H : V;

        var sDir = sideDirs[points.start.side];
        var eDir = sideDirs[points.end.side];

        // check if the ideal direction is no good
        if (sOr === H) {
          if ((sDir > 0 && s.x > e.x)
              || (sDir < 0 && s.x < e.x)) {
            sOr = V;
            sDir = 0;
          }
        } else if (sOr === V) {
          if ((sDir > 0 && s.y > e.y)
              || (sDir < 0 && s.y < e.y)) {
            sOr = H;
            sDir = 0;
          }
        }
        if (eOr === H) {
          if ((eDir > 0 && s.x < e.x)
              || (eDir < 0 && s.x > e.x)) {
            eOr = V;
            eDir = 0;
          }
        } else if (eOr === V) {
          if ((eDir > 0 && s.y < e.y)
              || (eDir < 0 && s.y > e.y)) {
            eOr = H;
            eDir = 0;
          }
        }

        // if we reset the direction, find the new one
        if (sDir === 0) {
          if (sOr === V) {
            sDir = e.y - s.y;
          } else  {
            sDir = e.x - s.x;
          }
          sDir = sDir / Math.abs(sDir); // normalize
        }
        if (eDir === 0) {
          if (eOr === V) {
            eDir = s.y - e.y;
          } else  {
            eDir = s.x - e.x;
          }
          eDir = eDir / Math.abs(eDir); // normalize
        }

        if (sOr !== eOr) { // corner
          c.moveTo(s.x, s.y);
          if (sOr===H) {
            c.lineTo(e.x, s.y);
          } else {
            c.lineTo(s.x, e.y);
          }

          c.moveTo(e.x, e.y);
          if (eOr===H) {
            c.lineTo(s.x, e.y);
          } else {
            c.lineTo(e.x, s.y);
          }
        } else { // center split
          c.moveTo(s.x, s.y);
          if (sOr===H) {
            var half = s.x + (e.x - s.x) / 2;
            c.lineTo(half, s.y);
            c.lineTo(half, e.y);
          } else {
            var half = s.y + (e.y - s.y) / 2;
            c.lineTo(s.x, half);
            c.lineTo(e.x, half);
          }
          c.lineTo(e.x, e.y);
        }

        c.stroke();
      }

      c.restore();
    },

    selectBestPoints: function(H,V,directions,orientations, canvas) {
      /* For each starting point, find the closest ending point.
        Take the smallest link distance. */
      var self = this;
      var BIG_VAL = 999999999;
      var smallest = BIG_VAL;
      var byDist = {};
      self.start.forEach(function(startP) {
        var start = startP.offsetBy(this.arrowLength);
        self.end.forEach(function(endP) {
          var end = endP.offsetBy(this.arrowLength);
          var dist = Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
          var shortAxisOr = Math.abs(endP.x - startP.x) > Math.abs(endP.y - startP.y)? V : H;
          var shortAxisDist = shortAxisOr===H? Math.abs(end.x - start.x) : Math.abs(end.y - start.y);

          // pick smallest connector path whose points won't make a bad connector
          if (  ! this.isBannedConfiguration(startP, endP, start, end, H,V,directions,orientations, shortAxisOr, shortAxisDist)
             && ! this.isBlocked(startP, endP, start, end, canvas)) {
            // if we tie, try for the smallest short-axis (middle displacement)
            if (!byDist[dist] || byDist[dist].shortAxisDist > shortAxisDist) {
              if (dist < smallest) smallest = dist;
              byDist[dist] = { start: startP, end: endP, shortAxisDist: shortAxisDist };
            }
          }
        }.bind(this));
      }.bind(this));

      if (!byDist[smallest]) {
        // no good points, so return something
        return { start: self.start[0], end: self.end[0], shortAxisDist: 0 };
      }

      return byDist[smallest];
    },

    isBannedConfiguration: function(startP, endP, offsS, offsE, H,V,directions,orientations,shortAxisOr, shortAxisDist) {
      /* Returns true if the given set of points and directions produces a bad
      looking link. This can include protruding back into the owner, creating
      unecessary corners, or other problems. */
      var minimumPath = this.arrowLength*2;

      // don't allow points inside the other end's owner rect
      if (   this.isPointInsideItem(startP, endP.owner)
          || this.isPointInsideItem(endP, startP.owner)) return true;

      // Also check the case where we are just at the minimum path length, and make
      // sure the line isn't pushed through the other item
      var doubleOffsetS = startP.offsetBy(minimumPath);
      var doubleOffsetE = endP.offsetBy(minimumPath);
      if (   this.isPointInsideItem(doubleOffsetS, endP.owner)
          || this.isPointInsideItem(doubleOffsetE, startP.owner)) return true;

      var sOr = orientations[startP.side];
      var eOr = orientations[endP.side];
      var sDir = directions[startP.side];
      var eDir = directions[endP.side];

      var hDir = endP.x - startP.x;
      hDir /= -Math.abs(hDir);
      var vDir = endP.y - startP.y;
      vDir /= -Math.abs(vDir);

      dist = Math.abs(offsS.x - offsE.x) + Math.abs(offsS.y - offsE.y); // connector ends (after arrows)
      rawDist = Math.abs(startP.x - endP.x) + Math.abs(startP.y - endP.y); // link points

      if (sOr === eOr) {
        if (rawDist < minimumPath) {
          return sDir !== eDir;
        } else {
          if (shortAxisOr === sOr && sDir !== eDir) {
            return shortAxisDist < minimumPath;
          } else {
            return false; //sDir === eDir;
          }
        }
      } else {
        // corner
        return (sOr === H)? sDir !== hDir : sDir !== vDir
            && (eOr === H)? eDir !== hDir : eDir !== vDir;
      }
    },
    isBlocked: function(startP, endP, offsS, offsE, canvas) {
      /* Check whether any other blocking items are touching the bounding box
      of this configuration. */

      var boundX1 = Math.min(startP.x, endP.x, offsS.x, offsE.x);
      var boundY1 = Math.min(startP.y, endP.y, offsS.y, offsE.y);
      var boundX2 = Math.max(startP.x, endP.x, offsS.x, offsE.x);
      var boundY2 = Math.max(startP.y, endP.y, offsS.y, offsE.y);
      var pad = 2;
      var boundRect = { x1: boundX1+pad, x2: boundX2-pad, y1: boundY1+pad, y2: boundY2-pad };
      var self = this;
      // TODO(jacksonic): Implement a quad tree index, or some kind of range index
      var failed = false;
      var root = startP.owner.getDiagramRoot();
      if (root) {
        root.linkBlockerDAO.select({ put: function(blocker) {
            if ( ! failed && blocker !== startP.owner && blocker !== endP.owner ) {
              var blockRect = { x1: blocker.globalX, x2: blocker.globalX + blocker.width,
                                y1: blocker.globalY, y2: blocker.globalY + blocker.height };
              if (self.isIntersecting(boundRect, blockRect)) {
                failed = true;
              }
            }
        }});
      }
      return failed;
    },

    isPointInsideItem: function(point, item) {
      return point.x <= item.globalX+item.width
          && point.x >= item.globalX
          && point.y <= item.globalY+item.height
          && point.y >= item.globalY;
    },
    isIntersecting: function(rect1, rect2) {
      var isect = function(a,b) {
        return ((a.x1 > b.x1 && a.x1 < b.x2) || (a.x2 > b.x1 && a.x2 < b.x2))
            && ((a.y1 > b.y1 && a.y1 < b.y2) || (a.y2 > b.y1 && a.y2 < b.y2));
      }
      return isect(rect1, rect2) || isect(rect2, rect1);
    },

    paintArrows: function(c, points, s, e) {
      // draw arrows
      c.save();
      c.beginPath();

      // draw end line in all cases
      c.moveTo(points.end.x, points.end.y);
      c.lineTo(e.x,e.y);
      c.stroke();
      c.beginPath();

      if (this.arrowStyle === 'association') {
        c.moveTo(points.start.x, points.start.y);
        c.lineTo(s.x, s.y);
        c.stroke();
        c.beginPath();
      } else {
        c.save();

        c.translate(points.start.x, points.start.y);
        if (points.start.side==='top') c.rotate(-Math.PI/2);
        if (points.start.side==='bottom') c.rotate(Math.PI/2);
        if (points.start.side==='left') c.rotate(Math.PI);

        c.moveTo(0,0);
        if (this.arrowStyle === 'aggregation' || this.arrowStyle === 'composition' ) {
          c.lineTo(this.arrowLength/2, -this.arrowLength/4);
          c.lineTo(this.arrowLength, 0);
          c.lineTo(this.arrowLength/2, this.arrowLength/4);
          c.lineTo(0,0);
          if (this.arrowStyle==='aggregation') {
            c.stroke();
            c.beginPath();
          } else {
            c.fillStyle = this.color;
            c.fill();
          }
        } else if (this.arrowStyle === 'generalization') {
          c.lineTo(this.arrowLength/1.2, -this.arrowLength/2);
          c.lineTo(this.arrowLength/1.2, this.arrowLength/2);
          c.lineTo(0,0);
          c.moveTo(this.arrowLength/1.2, 0);
          c.lineTo(this.arrowLength, 0)
          c.stroke();
          c.beginPath();
        }
        c.restore();
      }
      c.restore();
    }

  }

});
