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
  package: 'foam.ui.md',
  name: 'ImagePickerView',
  extends: 'foam.ui.SimpleView',
  traits: ['foam.ui.md.MDStyleTrait'],

  properties: [
    [ 'tagName', 'image-picker' ],
    {
      name: 'data',
    },
    {
      name: '$input',
      getter: function() { return this.X.$(this.inputId); },
    },
    {
      name: 'inputId',
      getter: function() { return this.id + "-input"; },
    },
    ['hintText', 'Click to select an image or Drag & drop an image file here'],
    ['mode', 'read-write'],
    ['useCamera', false],
  ],

  methods: [
    function loadFile(files) { /* only loads the first file specified in arg */
      if ( files.length ) {
        var fr = new FileReader();
        fr.onload = this.setDataBuffer;
        fr.readAsDataURL(files[0]);
      }
    }
  ],

  listeners: [
    {
      name: 'setDataBuffer',
      code: function(e) {
        var buf = e.target.result; // an data url string from readAsDataURL
        this.data = buf;
      }
    },
    {
      name: 'inputClick',
      code: function(e) {
        // launch file browser from hidden input element
        this.$input && this.$input.click();

        e.preventDefault();
      }
    },
    {
      name: 'squelchEvent',
      code: function(e) {
        e.stopPropagation();
        e.preventDefault();
      },
    },
    {
      name: 'inputDrop',
      code: function(e) {
        e.stopPropagation();
        e.preventDefault();

        this.loadFile(e.dataTransfer.files);
      },
    },
    {
      name: 'inputFileChange',
      code: function() {
        this.loadFile(this.$input.files);
      }
    },
  ],

  templates: [
    function CSS() {/*
      image-picker {
        position: relative;
        min-height: 100px;
        min-width: 200px;
        border: 2px dashed;
        padding: 5px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        overflow: hidden;
      }

      image-picker .content {
        padding: 8px;
        margin: 8px;
        flex-grow: 0;
        background: rgba(0,0,0,0.5);
        color: white;
        z-index: 1;
      }

      image-picker .image-picker-preview {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 0;
      }

    */},
    function toHTML() {/*
      <% if ( this.mode == 'read-only' ) { %>
        $$data{ model_: 'foam.ui.ImageView' }
      <% } else { %>
        <image-picker <%= this.cssClassAttr() %> id="%%id">
          $$data{ model_: 'foam.ui.ImageView', extraClassName: 'image-picker-preview' }
          <div class="content">
            $$hintText{ mode: 'read-only', floatingLabel: false }
          </div>
          <input type="file" id="%%inputId" accept="image/*" style="display:none"
          <% if (this.useCamera) { %>capture="camera" <% } %> >
        </image-picker>
        <%
        this.on('change', this.inputFileChange, this.inputId);
        this.on('click', this.inputClick, this.id);

        this.on("dragenter", this.squelchEvent, this.id);
        this.on("dragover", this.squelchEvent, this.id);
        this.on("drop", this.inputDrop, this.id);
        this.setMDClasses();
      }
      %>
    */}
  ]
});
