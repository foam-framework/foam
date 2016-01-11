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

CLASS({
  package: 'foam.graphics',
  name: 'CanvasScrollView',
  extends: 'foam.graphics.CView',
  requires: [ 'foam.input.touch.GestureTarget' ],
  properties: [
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'dao',
      onDAOUpdate: 'onDAOUpdate'
    },
    {
      type: 'Int',
      name: 'scrollTop',
      preSet: function(_, v) { if ( v < 0 ) return 0; return v; }
    },
    {
      name: 'renderer'
    },
    {
      type: 'Int',
      name: 'selectNumber'
    },
    {
      name: 'objs',
      factory: function() { return []; }
    },
    {
      name: 'offset',
      defaultValue: 0
    }
  ],
  methods: {
    init: function() {
      this.SUPER();
      this.X.dynamicFn(
        function() { this.width; this.renderer; this.offset; this.objs; }.bind(this),
        function() {
          this.renderer.width = this.width;
          this.view && this.view.paint();
        }.bind(this));
    },
    initCView: function() {
      this.X.dynamicFn(
        function() {
          this.scrollTop; this.height; this.renderer;
        }.bind(this), this.onDAOUpdate);

      if ( this.X.gestureManager ) {
        var manager = this.X.gestureManager;
        var target = this.GestureTarget.create({
          containerID: this.view.id,
          handler: this,
          gesture: 'verticalScrollMomentum'
        });
        manager.install(target);
      }
    },
    verticalScrollMove: function(dy) {
      this.scrollTop -= dy;
    },
    paintSelf: function(canvas) {
      var self = this;
      var offset = this.offset;
      for ( var i = 0; i < this.objs.length; i++ ) {
        canvas.save();
        canvas.translate(0, offset + (i * self.renderer.height));
        self.renderer.render(canvas, self.objs[i]);
        canvas.restore();
      }
    }
  },
  listeners: [
    {
      name: 'onDAOUpdate',
      code: function() {
        var selectNumber = this.selectNumber + 1;
        this.selectNumber = selectNumber;

        var limit = Math.floor(this.height / this.renderer.height) + 2;
        var skip = Math.floor(this.scrollTop / this.renderer.height);
        var self = this;


        var offset = -(this.scrollTop % this.renderer.height);

        var i = 0;
        this.dao.skip(skip).limit(limit).select([])(function(objs) {
          self.offset = offset;
          self.objs = objs;
        });

/*{
          put: function(obj, _, fc) {
            if ( selectNumber != self.selectNumber ||
                 ! self.canvas ) {
              fc.stop();
              return;
            }
            if ( i == 0 ) self.erase();

            self.canvas.save();
            self.canvas.translate(0, offset + (i * self.renderer.height));
            i = i + 1;
            self.renderer.render(self.canvas, obj);
            self.canvas.restore();
          }
        });*/
      }
    }
  ]
});
