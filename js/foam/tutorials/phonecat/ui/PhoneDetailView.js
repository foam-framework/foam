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
  package: 'foam.tutorials.phonecat.ui',
  name: 'PhoneDetailView',
  extends: 'foam.ui.DetailView',
  requires: [ 'foam.ui.animated.ImageView' ],
  templates: [
    function CSS() {/*
      img.phone {
        float: left;
        margin-right: 3em;
        margin-bottom: 2em;
        background-color: white;
        padding: 2em;
        height: 400px;
        width: 400px;
        display: block;
      }

      img.phone:first-child {
        display: block;
      }

      ul.phone-thumbs {
        margin: 0;
        list-style: none;
      }

      ul.phone-thumbs li {
        border: 1px solid black;
        display: inline-block;
        margin: 1em;
        background-color: white;
      }

      ul.phone-thumbs img {
        height: 100px;
        width: 100px;
        padding: 1em;
      }

      ul.phone-thumbs img:hover {
        cursor: pointer;
      }

      ul.specs {
        clear: both;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      ul.specs > li{
        display: inline-block;
        width: 200px;
        vertical-align: top;
      }

      ul.specs > li > span{
        font-weight: bold;
        font-size: 1.2em;
      }

      ul.specs dt {
        font-weight: bold;
      }

      h1 {
        border-bottom: 1px solid gray;
      }
    */},
    { name: 'toHTML' }
  ]
});
