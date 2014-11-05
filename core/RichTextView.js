/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
/*
 * TODO:
 *    handle multiple-selection
 *    map <enter> key to <br>
 *    support removing/toggling an attribute
 *    check that the selected text is actually part of the element
 *    add the rest of the common styling options
 *    improve L&F
 */

MODEL({
  name: 'Link',
  properties: [
    {
      name: 'richTextView'
    },
    {
      name: 'label',
      displayWidth: 28
    },
    {
      name: 'link',
      displayWidth: 19,
      view: { factory_: 'TextFieldView', placeholder: 'Type or paste link.' },
      preSet: function(_, value) {
        value = value.trim();
        // Disallow javascript URL's
        if ( value.toLowerCase().startsWith('javascript:') ) value = '';
        return value;
      }
    }
  ],
  methods: {
    open: function(x, y) {
      var view = LinkView.create({model: Link, data: this});
      this.richTextView.$.parentNode.insertAdjacentHTML('beforebegin', view.toHTML());
      view.$.style.left = x + this.richTextView.$.offsetLeft;
      view.$.style.top = y + this.richTextView.$.offsetTop;
      view.initHTML();
      this.view = view;
    }
  },
  actions: [
    {
      name:  'insert',
      label: 'Apply',
      help:  'Insert this link into the document.',

      action: function() {
        var a   = document.createElement('a');
        var txt = document.createTextNode(this.label);
        a.href = this.link;
        a.appendChild(txt);

        this.richTextView.insertElement(a);

        this.view.close();
      }
    }
  ]
});


MODEL({
  name: 'LinkView',

  extendsModel: 'DetailView',

  properties: [
    {
      name: 'insertButton',
      factory: function() {
        return ActionButton.create({
          action: Link.INSERT,
          data: this.data
        });
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.addChild(this.insertButton);
    },
    initHTML: function() {
      this.SUPER();
      this.$.addEventListener('keyup', this.keyUp);
      this.labelView.focus();
    },
    close: function() { this.$.remove(); }
  },

  listeners: [
    {
      name: 'keyUp',
      code: function(e) {
        if ( e.keyCode == 27 /* Esc */ ) {
          e.stopPropagation();
          this.close();
        }
      }
    }
  ],

  templates: [
    {
      name: "toHTML",
      template:
        '<div id="<%= this.id %>" class="linkDialog" style="position:absolute">\
        <table><tr>\
        <th>Text</th><td>$$label</td></tr><tr>\
        <th>Link</th><td>$$link\
        %%insertButton</td>\
        </tr></table>\
        </div>'
    }
  ]
});


MODEL({
  name: 'ColorPickerView',

  extendsModel: 'View',

  properties: [
    {
      name: 'data'
    }
  ],

  methods: {
    toHTML: function() {
      var out = '<table>';
      out += '<tr>';
      var self = this;
      var cell = function(r, g, b) {
        var value = 'rgb(' + r + ',' + g + ',' + b + ')';

        out += '<td class="pickerCell"><div id="' +
          self.on('click', function(e) {
            self.data = value;
            e.preventDefault();
          }) +
          '" class="pickerDiv" style="background-color: ' + value + '"></div></td>';
      };
      for ( var col = 0; col < 8; col++ ) {
        var shade = Math.floor(255 * col / 7);
        cell(shade, shade, shade);
      }
      out += '</tr><tr>';
      cell(255, 0, 0);
      cell(255, 153, 0);
      cell(255, 255, 0);
      cell(0, 255, 0);
      cell(0, 255, 255);
      cell(0, 0, 255);
      cell(153, 0, 255);
      cell(255, 0, 255);
      out += '</tr></table>';
      return out;
    }
  }
});


MODEL({
  name: 'RichTextView',

  extendsModel: 'View',

  properties: [
    {
      model_: 'StringProperty',
      name:  'height',
      defaultValue: '400'
    },
    {
      model_: 'StringProperty',
      name:  'width',
      defaultValue: '100%'
    },
    {
      name:  'mode',
      type:  'String',
      defaultValue: 'read-write',
      view: { factory_: 'ChoiceView', choices: ['read-only', 'read-write', 'final'] }
    },
    {
      name:  'data',
      postSet: function() { this.maybeShowPlaceholder(); }
    },
    {
      name: 'placeholder',
      help: 'Placeholder text to appear when no text is entered.'
    },
    {
      name: 'document',
      hidden: true
    }
  ],

  listeners: [
    {
      name: 'maybeShowPlaceholder',
      code: function() {
        var e = $(this.placeholderId);
        if ( e ) {
          e.style.visibility = this.data == '' ? 'visible' : 'hidden';
        }
      }
    }
  ],

  methods: {
    toHTML: function() {
      var sandbox = this.mode === 'read-write' ?
        '' :
        ' sandbox="allow-same-origin"';

      var id = this.id;
      this.dropId = this.nextID();
      this.placeholderId = this.nextID();

      return '<div class="richtext">' +
        '<div id="' + this.dropId + '" class="dropzone"><div class=spacer></div>Drop files here<div class=spacer></div></div>' +
        '<div id="' + this.placeholderId + '" class="placeholder">' + this.placeholder + '</div>' +
        '<iframe style="width:' + this.width + ';min-height:' + this.height + 'px" id="' + this.id + '"' + sandbox + ' img-src="*"></iframe>' +
        '</div>';
    },

    initHTML: function() {
      this.SUPER();
      var drop = $(this.dropId);
      this.dropzone = drop;
      this.document = this.$.contentDocument;
      var body = this.document.body;
      body.style.whiteSpace = 'pre-wrap';

      $(this.placeholderId).addEventListener('click', function() { body.focus(); });
      this.document.head.insertAdjacentHTML(
        'afterbegin',
        '<style>blockquote{border-left-color:#ccc;border-left-style:solid;padding-left:1ex;}</style>');

      body.style.overflow = 'auto';
      body.style.margin = '5px';
      body.style.height = '100%';

      var self = this;
      body.ondrop = function(e) {
        e.preventDefault();
        self.showDropMessage(false);
        var length = e.dataTransfer.files.length;
        for ( var i = 0 ; i < length ; i++ ) {
          var file = e.dataTransfer.files[i];
          var id = this.addAttachment(file);
          if ( file.type.startsWith("image/") ) {
            var img   = document.createElement('img');
            img.id = id;
            img.src = URL.createObjectURL(file);
            this.insertElement(img);
          }
        }

        length = e.dataTransfer.items.length;
        if ( length ) {
          var div = this.sanitizeDroppedHtml(e.dataTransfer.getData('text/html'));
          this.insertElement(div);
        }
      }.bind(this);
      self.dragging_ = 0;
      body.ondragenter = function(e) {
        self.dragging_++;
        self.showDropMessage(true);
      };
      body.ondragleave = function(e) {
        if ( --self.dragging_ == 0 ) self.showDropMessage(false);
      };
      if ( this.mode === 'read-write' ) {
        this.document.body.contentEditable = true;
      }
      this.domValue = DomValue.create(this.document.body, 'input', 'innerHTML');
      Events.link(this.data$, this.domValue);
      this.maybeShowPlaceholder();
    },

    getSelectionText: function() {
      var window    = this.$.contentWindow;
      var selection = window.getSelection();

      if ( selection.rangeCount ) {
        return selection.getRangeAt(0).toLocaleString();
      }

      return '';
    },

    insertElement: function(e) {
      var window    = this.$.contentWindow;
      var selection = window.getSelection();

      if ( selection.rangeCount ) {
        var r = selection.getRangeAt(0);
        r.deleteContents();
        r.insertNode(e);
      } else {
        // just insert into the body if no range selected
        var range = window.document.createRange();
        range.selectNodeContents(window.document.body);
        range.insertNode(e);
      }

      // Update the value directly because modifying the DOM programatically
      // doesn't fire an update event.
      this.updateValue();
    },

    // Force updating the value after mutating the DOM directly.
    updateValue: function() {
      this.data = this.document.body.innerHTML;
    },

    showDropMessage: function(show) {
      this.$.style.opacity = show ? '0' : '1';
    },

    sanitizeDroppedHtml: function(html) {
      var self = this;
      var allowedElements = [
        {
          name: 'B',
          attributes: []
        },
        {
          name: 'I',
          attributes: []
        },
        {
          name: 'U',
          attributes: []
        },
        {
          name: 'P',
          attributes: []
        },
        {
          name: 'SECTION',
          attributes: []
        },
        {
          name: 'BR',
          attributes: []
        },
        {
          name: 'BLOCKQUOTE',
          attributes: []
        },
        {
          name: 'DIV',
          attributes: []
        },
        {
          name: 'IMG',
          attributes: ['src'],
          clone: function(node) {
            var newNode = document.createElement('img');
            if ( node.src.startsWith('http') ) {
              var xhr = new XMLHttpRequest();
              xhr.open("GET", node.src);
              xhr.responseType = 'blob';
              xhr.asend(function(blob) {
                blob.name = 'dropped image';
                if ( blob ) {
                  newNode.id = self.addAttachment(blob);
                  newNode.src = URL.createObjectURL(blob);
                } else {
                  blob.parent.removeChild(blob);
                }
                self.updateValue();
              });
            } else if ( node.src.startsWith('data:') ) {
              var type = node.src.substring(5, node.src.indexOf(';'));
              var decoder = Base64Decoder.create([], node.src.length);
              decoder.put(node.src.substring(node.src.indexOf('base64,') + 7));
              decoder.eof();

              var blob = new Blob(decoder.sink, { type: type });
              blob.name = 'dropped image';
              newNode.id = self.addAttachment(blob);
              newNode.src = URL.createObjectURL(blob);
            } else {
              // Unsupported image scheme dropped in.
              return null;
            }

            return newNode;
          }
        },
        {
          name: 'A',
          attributes: ['href']
        },
        {
          name: '#TEXT',
          attributes: []
        },
      ];

      function copyNodes(parent, node) {
        for ( var i = 0; i < allowedElements.length; i++ ) {
          if ( allowedElements[i].name === node.nodeName ) {
            if ( allowedElements[i].clone ) {
              newNode = allowedElements[i].clone(node);
            } else if ( node.nodeType === Node.ELEMENT_NODE ) {
              newNode = document.createElement(node.nodeName);
              for ( var j = 0; j < allowedElements[i].attributes.length; j++ ) {
                if ( node.hasAttribute(allowedElements[i].attributes[j]) ) {
                  newNode.setAttribute(allowedElements[i].attributes[j],
                                       node.getAttribute(allowedElements[i].attributes[j]));
                }
              }
            } else if ( node.nodeType === Node.TEXT_NODE ) {
              newNode = document.creatTextNode(node.nodeValue);
            } else {
              newNode = document.createTextNode('');
            }
            break;
          }
        }
        if ( i === allowedElements.length ) {
          newNode = document.createElement('div');
        }
        if ( newNode ) parent.appendChild(newNode);
        for ( j = 0; j < node.children.length; j++ ) {
          copyNodes(newNode, node.children[j]);
        }
      }

      var frame = document.createElement('iframe');
      frame.sandbox = 'allow-same-origin';
      frame.style.display = 'none';
      document.body.appendChild(frame);
      frame.contentDocument.body.innerHTML = html;

      var sanitizedContent = new DocumentFragment();
      for ( var i = 0; i < frame.contentDocument.body.children.length; i++ ) {
        copyNodes(sanitizedContent, frame.contentDocument.body.children[i]);
      }
      document.body.removeChild(frame);
      return sanitizedContent;
    },

    addAttachment: function(file) {
      var id   = 'att' + {}.$UID;
      console.log('file: ', file, id);
      this.publish('attachmentAdded', file, id);
      return id;
    },

    removeImage: function(imageID) {
      var e = this.document.getElementById(imageID);
      if ( e ) {
        e.outerHTML = '';
        this.data = this.document.body.innerHTML;
      }
    },

    destroy: function() {
      this.SUPER();
      Events.unlink(this.domValue, this.value);
    },

    textToValue: function(text) { return text; },

    valueToText: function(value) { return value; },

    setForegroundColor: function(color) {
      this.$.contentWindow.focus();
      this.document.execCommand("foreColor", false, color);
    },

    setBackgroundColor: function(color) {
      this.$.contentWindow.focus();
      this.document.execCommand("backColor", false, color);
    }
  },

  actions: [
    {
      name: 'bold',
      label: '<b>B</b>',
      help: 'Bold (Ctrl-B)',
      action: function () {
        this.$.contentWindow.focus();
        this.document.execCommand("bold");
      }
    },
    {
      name: 'italic',
      label: '<i>I</i>',
      help: 'Italic (Ctrl-I)',
      action: function () {
        this.$.contentWindow.focus();
        this.document.execCommand("italic");
      }
    },
    {
      name: 'underline',
      label: '<u>U</u>',
      help: 'Underline (Ctrl-U)',
      action: function () {
        this.$.contentWindow.focus();
        this.document.execCommand("underline");
      }
    },
    {
      name: 'link',
      label: 'Link',
      help: 'Insert link (Ctrl-K)',
      action: function () {
        // TODO: determine the actual location to position
        Link.create({
          richTextView: this,
          label: this.getSelectionText()}).open(5,120);
      }
    },
    {
      name: 'fontSize',
      label: 'Font Size',
      help: 'Change the font size.',
      action: function(){}
    },
    {
      name: 'small',
      help: 'Set\'s the font size to small.',
      label: 'small',
      parent: 'fontSize',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontSize", false, "2");
      }
    },
    {
      name: 'normal',
      help: 'Set\'s the font size to normal.',
      label: 'normal',
      parent: 'fontSize',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontSize", false, "3");
      }
    },
    {
      name: 'large',
      help: 'Set\'s the font size to small.',
      label: 'large',
      parent: 'fontSize',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontSize", false, "5");
      }
    },
    {
      name: 'huge',
      help: 'Set\'s the font size to huge.',
      label: 'huge',
      parent: 'fontSize',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontSize", false, "7");
      }
    },
    {
      name: 'fontFace',
      help: 'Set\'s the font face.',
      label: 'Font',
    },
    {
      name: 'sansSerif',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "arial, sans-serif");
      }
    },
    {
      name: 'serif',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "times new roman, serif");
      }
    },
    {
      name: 'wide',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "arial bold, sans-serif");
      }
    },
    {
      name: 'narrow',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "arial narrow, sans-serif");
      }
    },
    {
      name: 'comicSans',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "comic sans, sans-serif");
      }
    },
    {
      name: 'courierNew',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "courier new, monospace");
      }
    },
    {
      name: 'garamond',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "garamond, sans-serif");
      }
    },
    {
      name: 'georgia',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "georgia, sans-serif");
      }
    },
    {
      name: 'tahoma',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "tahoma, sans-serif");
      }
    },
    {
      name: 'trebuchet',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "trebuchet ms, sans-serif");
      }
    },
    {
      name: 'verdana',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "verdana, sans-serif");
      }
    },
    {
      name: 'removeFormatting',
      help: 'Removes formatting from the current selection.',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("removeFormat");
      }
    },
    {
      name: 'justification',
      action: function(){}
    },
    {
      name: 'leftJustify',
      parent: 'justification',
      help: 'Align Left (Ctrl-Shift-W)',
      // Ctrl-Shift-L
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("justifyLeft");
      }
    },
    {
      name: 'centerJustify',
      parent: 'justification',
      help: 'Align Center (Ctrl-Shift-E)',
      // Ctrl-Shift-E
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("justifyCenter");
      }
    },
    {
      name: 'rightJustify',
      parent: 'justification',
      help: 'Align Right (Ctrl-Shift-R)',
      // Ctrl-Shift-R
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand('justifyRight');
      }
    },
    {
      name: 'numberedList',
      help: 'Numbered List (Ctrl-Shift-7)',
      // Ctrl-Shift-7
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand('insertOrderedList');
      }
    },
    {
      name: 'bulletList',
      help: 'Bulleted List (Ctrl-Shift-7)',
      // Ctrl-Shift-8
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand('insertUnorderedList');
      }
    },
    {
      name: 'decreaseIndentation',
      help: 'Indent Less (Ctrl-[)',
      // Ctrl-[
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand('outdent');
      }
    },
    {
      name: 'increaseIndentation',
      help: 'Indent More (Ctrl-])',
      // Ctrl-]
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand('indent');
      }
    },
    {
      name: 'blockQuote',
      help: 'Quote (Ctrl-Shift-9)',
      // Ctrl-Shift-9
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand('formatBlock', false, '<blockquote>');
      }
    }
  ]
});
