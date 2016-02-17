/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'foam.u2',
  name: 'ModalOverlay',
  extends: 'foam.u2.Element',

  documentation: 'Handles the grey background and centering of some inner ' +
      'element. Generally you either want to create a ModalOverlay and put a ' +
      '$$DOC{ref:"foam.u2.md.Card"} or $$DOC{ref:"foam.u2.md.Dialog"} in it; ' +
      'or more simply, use $$DOC{ref:"foam.u2.md.EasyDialog"} for simple ' +
      'informative popups.',

  imports: [
    'document',
  ],
  exports: [
    'as overlay',
  ],

  properties: [
    'innerE',
    {
      name: 'redirectToInner_',
      defaultValue: true
    },
    {
      type: 'Array',
      name: 'innerQueue_',
    },
  ],

  methods: [
    function initE() {
      this.redirectToInner_ = false;

      var container = this.cls(this.myCls()).start().cls(this.myCls('container'));

      container.start().cls(this.myCls('background'))
          .on('click', this.close.bind(this))
          .end();

      this.innerE = container.start().cls(this.myCls('inner'));
      for (var i = 0; i < this.innerQueue_.length; i++) {
        this.innerE.add.apply(this.innerE, this.innerQueue_[i]);
      }
      this.innerE.end();

      this.redirectToInner_ = true;
    },
    function add() {
      if (this.redirectToInner_) {
        if (this.innerE) this.innerE.add.apply(this.innerE, arguments);
        else this.innerQueue_.push(Array.prototype.slice.call(arguments));
        return this;
      } else {
        return this.SUPER.apply(this, arguments);
      }
    },
    function open() {
      this.document.body.insertAdjacentHTML('beforeend', this.outerHTML);
      this.load();
    },
    function close() {
      this.remove();
    },
  ],

  templates: [
    function CSS() {/*
      ^ {
        align-items: center;
        bottom: 0;
        display: flex;
        justify-content: space-around;
        left: 0;
        position: fixed;
        right: 0;
        top: 0;
        z-index: 1000;
      }

      ^container {
        align-items: center;
        display: flex;
        height: 100%;
        justify-content: space-around;
        position: relative;
        width: 100%;
      }
      ^background {
        background-color: #000;
        bottom: 0;
        left: 0;
        opacity: 0.4;
        position: absolute;
        right: 0;
        top: 0;
      }
      ^inner {
        z-index: 3;
      }
    */},
  ]
});
