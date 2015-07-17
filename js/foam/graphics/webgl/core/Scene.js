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
  package: 'foam.graphics.webgl.core',
  name: 'Scene',
  requires: [
    'foam.graphics.webgl.matrix.Matrix4',
    'foam.graphics.webgl.matrix.TransMatrix4',
    'foam.graphics.webgl.primitives.StandardMeshLibrary'
  ],
  extendsModel: 'foam.graphics.webgl.GLView',

  exports: [
    'gl$',
    'projectionMatrix$',
    'as scene',
    'glMeshLibrary',
    'fps$',
    'performance$',
  ],

  properties: [
    {
      name: 'positionMatrix',
    },
    {
      name: 'projectionMatrix',
      lazyFactory: function() {
        return this.Matrix4.create();
      }
    },
    {
      name: 'fov',
      help: 'Field-of-view in degrees.',
      defaultValue: 45
    },
    {
      name: 'cameraDistance',
      help: 'Units to back the camera away from the XY plane.',
      defaultValue: -6.0
    },
    {
      name: 'glMeshLibrary',
      factory: function() {
        return this.StandardMeshLibrary.create();
      }
    },
    {
      model_: 'IntProperty',
      name: 'fps',
      postSet: function(old,nu) {
        this.performance = (nu / this.targetFps) * 100;
        this.X.document.title = "Performance: "+this.performance+"%";
      }
    },
    {
      name: 'targetFps',
      defaultValue: 60
    },
    {
      model_: 'IntProperty',
      name: 'performance',
      help: 'Performance indicator as a percentage, based on targetFps. Updated once per second.',
    },

  ],

  listeners: [
    {
      name: 'updateProjection',
      code: function() {
        this.projectionMatrix.flat = this.makePerspective(
          this.fov, this.view.width/this.view.height, 0.1, 100.0
        );
      }
    }

  ],

  methods: [
    function init() {
      this.SUPER();
      this.positionMatrix = this.TransMatrix4.create({ z$: this.cameraDistance$ });

      Events.dynamic(this.updateProjection);
      this.updateProjection();

      this.startTime = new Date().getTime();
    },

    function paintSelf(translucent) {
      var gl = this.gl;
      if ( ! gl ) return;

      if ( ! translucent ) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //gl.enable(gl.CULL_FACE); //TODO
        this.calcFps();
      }
    },

    function calcFps() {
      this.frameNumber++;

      var d = new Date().getTime();
      var currentTime = ( d - this.startTime ) / 1000;
      var result = Math.floor( ( this.frameNumber / currentTime ) );

      if( currentTime > 1 ) {
        this.startTime = new Date().getTime();
        this.frameNumber = 0;
        this.fps = result;
      }
    },

    //
    // gluLookAt
    //
//     function makeLookAt(ex, ey, ez,
//                         cx, cy, cz,
//                         ux, uy, uz)
//     {
//         if ( ! this.sylvesterLib.loaded ) return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1].slice();

//         var eye = $V([ex, ey, ez]);
//         var center = $V([cx, cy, cz]);
//         var up = $V([ux, uy, uz]);

//         var mag;

//         var z = eye.subtract(center).toUnitVector();
//         var x = up.cross(z).toUnitVector();
//         var y = z.cross(x).toUnitVector();

//         var m = $M([[x.e(1), x.e(2), x.e(3), 0],
//                     [y.e(1), y.e(2), y.e(3), 0],
//                     [z.e(1), z.e(2), z.e(3), 0],
//                     [0, 0, 0, 1]]);

//         var t = $M([[1, 0, 0, -ex],
//                     [0, 1, 0, -ey],
//                     [0, 0, 1, -ez],
//                     [0, 0, 0, 1]]);
//         return m.x(t);
//     },

    //
    // glOrtho
    //
    function makeOrtho(left, right,
                       bottom, top,
                       znear, zfar)
    {
        var tx = -(right+left)/(right-left);
        var ty = -(top+bottom)/(top-bottom);
        var tz = -(zfar+znear)/(zfar-znear);

        return  [ 2/(right-left), 0,              0,               0,
                  0,              2/(top-bottom), 0,               0,
                  0,              0,              -2/(zfar-znear), 0,
                  tx,             ty,             tz,              1];
    },

    //
    // gluPerspective
    //
    function makePerspective(fovy, aspect, znear, zfar)
    {
        var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
        var ymin = -ymax;
        var xmin = ymin * aspect;
        var xmax = ymax * aspect;

        return this.makeFrustum(xmin, xmax, ymin, ymax, znear, zfar);
    },

    //
    // glFrustum
    //
    function makeFrustum(left, right,
                         bottom, top,
                         znear, zfar)
    {
        var X = 2*znear/(right-left);
        var Y = 2*znear/(top-bottom);
        var A = (right+left)/(right-left);
        var B = (top+bottom)/(top-bottom);
        var C = -(zfar+znear)/(zfar-znear);
        var D = -2*zfar*znear/(zfar-znear);

        return   [X, 0,  0, 0,
                  0, Y,  0, 0,
                  A, B,  C, -1,
                  0, 0,  D, 0];
    },


  ]

});