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
    'foam.graphics.webgl.matrix.PerspectiveMatrix4',
    'foam.graphics.webgl.primitives.StandardMeshLibrary'
  ],
  extends: 'foam.graphics.webgl.GLView',

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
      factory: function() {
        return this.PerspectiveMatrix4.create();
      }
    },
    {
      name: 'view',
      postSet: function(old,nu) {
        if (old) {
          Events.unlink(old.width$, this.projectionMatrix.width$);
          Events.unlink(old.height$, this.projectionMatrix.height$);
        }
        if (nu) {
          Events.link(nu.width$, this.projectionMatrix.width$);
          Events.link(nu.height$, this.projectionMatrix.height$);
        }
      }
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
      type: 'Int',
      name: 'fps',
      postSet: function(old,nu) {
        this.performance = (nu / this.targetFps) * 100;
        this.X.document.title = "Performance: "+this.performance+"%";
      }
    },
    {
      name: 'targetFps',
      defaultValue: 50
    },
    {
      type: 'Int',
      name: 'performance',
      help: 'Performance indicator as a percentage, based on targetFps. Updated once per second.',
    },

  ],

  // listeners: [
  //   {
  //     name: 'updateProjection',
  //     code: function() {
  //       this.projectionMatrix.flat = this.makePerspective(
  //         this.fov, this.view.width/this.view.height, 0.1, 100.0
  //       );
  //     }
  //   }
  //
  // ],

  methods: [
    function init() {
      this.SUPER();
      this.positionMatrix = this.TransMatrix4.create({ z$: this.cameraDistance$ });

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





  ]

});