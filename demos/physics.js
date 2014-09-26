/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

MODEL({
  name: 'Vector',

  properties: [
    {
      name: 'x',
      model_: 'FloatProperty',
      defaultValue: 0,
    },
    {
      name: 'y',
      model_: 'FloatProperty',
      defaultValue: 0,
    },
    {
      name: 'z',
      model_: 'FloatProperty',
      defaultValue: 0,
    },
  ],

  methods: {
    add: function(other) {
      return this.computePerDimensionInPlace(function(current, o) {
        return current + o;
      }, other);
    },
    set: function(val) {
      return this.computePerDimensionInPlace(function(current, other) {
        return val;
      }, this);
    },
    copyDivide: function(val) {
      return this.computePerDimension(function(current, other) {
        return current / val;
      }, this);
    },
    multiply: function(val) {
      return this.computePerDimensionInPlace(function(current, other) {
        return current * val;
      }, this);
    },
    computePerDimension: function(f, other) {
      return Vector.create({ x: f(this.x, other.x), y: f(this.y, other.y), z: f(this.z, other.z) });
    },
    computePerDimensionInPlace: function(f, other) {
      this.x = f(this.x, other.x);
      this.y = f(this.y, other.y);
      this.z = f(this.z, other.z);
    },
    difference: function(other) {
      return this.computePerDimension(function(current, o) {
        return current - o;
      }, other);
    },
  },
});

MODEL({
  name: 'Spring',

  properties: [
    {
      name: 'idealLength',
      type: 'Vector',
      factory: function() {
        return Vector.create();
      },
    },
    {
      name: 'first',
      type: 'Actor',
    },
    {
      name: 'last',
      type: 'Actor',
    },
  ],

  methods: {
    otherActor: function(actor) {
      if (actor === this.first)
        return this.last;
      return this.first;
    },
    dominantActor: function() {
      if (this.first.distanceFromAnchor <= this.last.distanceFromAnchor)
        return this.first;
      return this.last;
    },
    getForce: function(actor) {
      // TODO these constants should be specifiable on an instance-by-instance basis.
      var compressionFactorConstant = 1.4;
      var tensionFactorConstant = 1.0;
      var compressionExponentConstant = 1.05;
      var tensionExponentConstant = 1.08;

      var otherActor = this.otherActor(actor);
      if (actor === this.dominantActor())
        return Vector.create();

      var delta = this.first.position.difference(this.last.position);
      var first = this.first;
      var last = this.last;
      // TODO something's going wrong in here, getting drifts and different rates when scrolling from bottom
      return delta.computePerDimension(function(current, ideal) {
        var currentSign = current >= 0 ? 1 : -1;
        var idealSign = ideal >= 0 ? 1 : -1;
        var isCompression = idealSign !== currentSign ? true : Math.abs(current) < Math.abs(ideal);
        var sign = ((isCompression && actor === last) || (!isCompression && actor === first)) ? 1 : -1;
        return sign * Math.min(Math.pow(Math.abs(current - ideal) * (isCompression ? compressionFactorConstant : tensionFactorConstant), (isCompression ? compressionExponentConstant : tensionExponentConstant)), Math.abs(current - ideal) * 3 /* TODO this is mass */);
      }, this.idealLength);
    },
  },
});

MODEL({
  name: 'Actor',
  label: 'Actor',

  properties: [
    {
      name: 'mass',
      model_: 'FloatProperty',
    },
    {
      name: 'position',
      type: 'Vector',
      factory: function() {
        return Vector.create();
      },
    },
    {
      name: 'velocity',
      type: 'Vector',
      factory: function() {
        return Vector.create();
      },
    },
    {
      name: 'springs',
      model_: 'ArrayProperty',
      factory: function() {
        return [];
      },
    },
    {
      name: 'anchored',
      model_: 'BooleanProperty',
      defaultValue: false,
    },
    {
      name: 'distanceFromAnchor',
      model_: 'FloatProperty',
      defaultValue: Infinity,
    },
    {
      name: 'target',
    },
  ],

  methods: {
    computeVelocity: function(force) {
      return force.copyDivide(this.mass);
    },
    setVelocities: function() {
      if (this.anchored) {
        this.distanceFromAnchor = 0;
        return;
      }

      this.velocity.set(0);
      for ( var i = 0 ; i < this.springs.length ; i++ ) {
        this.velocity.add(this.computeVelocity(this.springs[i].getForce(this)));
      }

      this.velocity.multiply(1.5);
    },
    setPositions: function() {
      this.position.add(this.velocity);
      this.target.setPosition(this.position);
    }
  },
});

MODEL({
  name: 'PhysicsSim',

  properties: [
    {
      name: 'actors',
      model_: 'ArrayProperty',
      factory: function() {
        return [];
      },
    },
  ],

  listeners: [
    {
      name: 'tick',
      code: function(timestamp) {
        for ( var i = 0 ; i < this.actors.length ; i++ ) {
          this.actors[i].setVelocities();
          this.actors[i].setPositions();
        }
        this.X.requestAnimationFrame(this.tick);
      },
    }
  ],

  methods: {
    run: function() {
      this.X.requestAnimationFrame(this.tick);
    },
  },
});

MODEL({
  name: 'RowBackend',

  properties: [
    {
      name: 'rowView',
    },
    {
      name: 'position',
      type: 'Vector',
    },
    {
      name: 'actor',
      type: 'Actor',
    },
  ],

  methods: {
    setRowViewPosition: function() {
      this.rowView.x = this.position.x;
      this.rowView.y = this.position.y;
      this.rowView.z = this.position.z;
    },
    setPosition: function(position) {
      this.position = position;
      if (this.rowView)
        this.setRowViewPosition();
      if (this.actor)
        this.actor.position = position;
    },
    clearRowView: function() {
      this.rowView = undefined;
    },
    setRowView: function(rowView) {
      if (rowView.backend)
        rowView.backend.clearRowView();
      rowView.backend = this;
      this.rowView = rowView;
      if (this.position)
        this.setRowViewPosition();
    },
  },
});

MODEL({
  name: 'PhysicsScrollView',

  extendsModel: 'ScrollView',

  properties: [
    {
      name: 'physicsSim',
      type: 'PhysicsSim',
    },
    {
      name: 'anchor',
      model_: 'IntProperty',
      defaultValue: 0,
    },
    {
      name: 'isInitialized',
      model_: 'BooleanProperty',
      defaultValue: false,
    },
    {
      name: 'skip',
      model_: 'IntProperty,'
    },
    {
      name: 'limit',
      model_: 'IntProperty,'
    },
    {
      name: 'fullSet',
      factory: function() { return []; }
    },
  ],

  methods: {
    scrollTo: function(old, nu) {
      this.positionRowViews(-nu);
    },
    setUpPhysicsSim: function(offset) {
      this.physicsSim = PhysicsSim.create();

      for (var i = 0; i < this.fullSet.length; i++) {
        var element = this.fullSet[i];
        var rowBackend = RowBackend.create();
        rowBackend.actor = Actor.create({ mass: 3, target: rowBackend });
        this.physicsSim.actors.push(rowBackend.actor);
        element.backend = rowBackend;

        if (i > 0) {
          var previousActor = this.fullSet[i - 1].backend.actor;
          var spring = Spring.create({ first: previousActor, last: rowBackend.actor, idealLength: Vector.create({ y: -130 }) }); // TODO -130 should be specified from elsewhere
          previousActor.springs.push(spring);
          rowBackend.actor.springs.push(spring);
        }
      }

      this.physicsSim.run();
    },
    hookRowUpWithElement: function(row, element) {
      if (row)
        element.backend.setRowView(row);
    },
    hookPhysicsSimUpWithVisibleRows: function() {
      for (var i = 0; i < this.fullSet.length; i++) {
        var element = this.fullSet[i];
        var row = this.visibleRows[i];
        this.hookRowUpWithElement(row, element);
      }
    },
    updateBackend: function() {
      if (!this.isInitialized) {
        this.updateFullSet(); // TODO this may need to be called again on each dao update
        this.setUpPhysicsSim();
        this.isInitialized = true;
      }
      this.hookPhysicsSimUpWithVisibleRows();
    },
    positionRowViews: function(offset) {
      for (var i = 0; i < this.fullSet.length; i++) {
        var element = this.fullSet[i];
        var elementOffset = offset + (i * this.rowHeight);

        if (i === this.anchor) {
          element.backend.setPosition(Vector.create({ y: elementOffset }));
          element.backend.actor.anchored = true;
        } else {
          element.backend.actor.anchored = false;
        }

        element.backend.actor.distanceFromAnchor = Math.abs(this.anchor - i);
      }
    },
    distance: function(yval, el) {
      var row = this.visibleRows[el.id];
      var rowView = $(row.id);
      var rect = rowView.getBoundingClientRect();
      return Math.abs(yval - (rect.top + rect.height / 2));
    },
    updateFullSet: function() {
      this.dao.select()(function(objs) {
        this.fullSet = objs;
      }.bind(this));
    },
  },

  listeners: [
    {
      name: 'onTouchStart',
      code: function(_, _, touch) {
        if ( ! this.touch ) this.touch = touch;
        var self = this;
        var minDistance = Infinity;
        var minElement = 0;
        for (var i = 0; i < this.fullSet.length; i++) {
          var curDistance = this.distance(touch.y, this.fullSet[i]);
          if (curDistance < minDistance) {
            minDistance = curDistance;
            minElement = i;
          }
        }
        this.anchor = minElement;
        this.touch.y$.addListener(function(_, _, old, nu) {
          self.scrollTop = self.scrollTop + old - nu;
        });
      }
    },
    {
      name: 'onWheel',
      code: function(ev) {
        this.anchor = 0; // TODO use topmost one in visible rows, not full set?
        // TODO: pull from bottom when scrolling up?
        // this.anchor = ev.deltaY >= 0 ? 0 : this.fullSet.length - 1;
        this.scrollTop += ev.deltaY;
        ev.preventDefault();
      }
    },
],
});
