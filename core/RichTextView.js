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
 *    add an optional HTML-sanitizer for hosted apps
 */

var Link = FOAM({
  model_: 'Model',
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
      displayWidth: 19
    }
  ],
  methods: {
    open: function(x, y) {
      var view = LinkView.create({model: Link, value: SimpleValue.create(this)});
      this.richTextView.$.parentNode.insertAdjacentHTML('beforebegin', view.toHTML());
      view.$.style.left = x + this.richTextView.$.offsetLeft;
      view.$.style.top = y + this.richTextView.$.offsetTop;
      view.initHTML();
      this.view = view;
    }
  },
  actions: [
    {
      model_: 'Action',
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


var LinkView = Model.create({
  name: 'LinkView',

  extendsModel: 'DetailView',

  properties: [
    {
      name: 'insertButton',
      valueFactory: function() {
        return ActionButton.create({
          action: Link.INSERT,
          value: SimpleValue.create(this.value.get())
        });
      }
    },
    {
      name: 'textView',
      valueFactory: function() { return this.createView(Link.LABEL); }
    },
    {
      name: 'urlView',
      valueFactory: function() {
        var v = this.createView(Link.LINK);
        v.placeholder = "Type or paste link.";
        return v;
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
      this.textView.$.focus();
    },
    close: function() { this.$.remove(); }
  },

  listeners: [
    {
      model_: 'Method',
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
        '<div id="<%= this.getID() %>" class="linkDialog" style="position:absolute">' +
        '<table><tr>' +
        '<th>Text</th><td><%= this.textView.toHTML() %></td></tr><tr>' +
        '<th>Link</th><td><%= this.urlView.toHTML() %>' +
        '<%= this.insertButton.toHTML() %></td>' +
        '</tr></table>' +
        '</div>'
    }
  ]
});


var ColorPickerView = FOAM({
  model_: 'Model',
  extendsModel: 'AbstractView',

  name: 'ColorPickerView',

  properties: [
    {
      name: 'value',
      valueFactory: function() { return SimpleValue.create({}); }
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
            self.value.set(value);
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

var RichTextView = FOAM({

  model_: 'Model',

  extendsModel: 'AbstractView',

  name: 'RichTextView',

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
      view: {
        create: function() { return ChoiceView.create({choices:[
          "read-only", "read-write", "final"
        ]}); } }
    },
    {
      name:  'value',
      type:  'Value',
      valueFactory: function() { return SimpleValue.create(); },
      postSet: function(newValue, oldValue) {
        Events.unlink(this.domValue, oldValue);
        Events.link(this.domValue, newValue);
        newValue.addListener(this.maybeShowPlaceholder);
      }
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
      model_: 'Method',
      name: 'maybeShowPlaceholder',
      code: function() { 
        var e = $(this.placeholderId);
        if ( e ) {
          e.style.visibility = this.value ? 'visible' : 'hidden';
        } else {
          console.log('***************** missing element');
        }
      }
    }
  ],
  
  methods: {
    toHTML: function() {
      var sandbox = this.mode === 'read-write' ?
        '' :
        ' sandbox="allow-same-origin"';

      var id = this.getID();
      this.dropId = this.nextID();
      this.placeholderId = this.nextID();

      return '<div class="richtext">' +
        '<div id="' + this.dropId + '" class="dropzone"><div class=spacer></div>Drop files here<div class=spacer></div></div>' +
        '<div id="' + this.placeholderId + '" class="placeholder">' + this.placeholder + '</div>' + 
        '<iframe style="width:' + this.width + 'px;min-height:' + this.height + 'px" id="' + this.getID() + '"' + sandbox + ' img-src="*"></iframe>' +
        '</div>';
    },

    setValue: function(value) {
      this.value = value;
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
      this.value.set(this.document.body.innerHTML);
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

    initHTML: function() {
      this.SUPER();
      var drop = $(this.dropId);
      this.dropzone = drop;
      this.document = this.$.contentDocument;
      var body = this.document.body;

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
      this.value = this.value; // connects listeners
      this.maybeShowPlaceholder();
    },

    removeImage: function(imageID) {
      var e = this.document.getElementById(imageID);
      if ( e ) {
        e.outerHTML = '';
        this.value.set(this.document.body.innerHTML);
      }
    },

    destroy: function() {
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
      model_: 'Action',
      name: 'bold',
      label: '<b>B</b>',
      help: 'Bold (Ctrl-B)',
      action: function () {
        this.$.contentWindow.focus();
        this.document.execCommand("bold");
      }
    },
    {
      model_: 'Action',
      name: 'italic',
      label: '<i>I</i>',
      help: 'Italic (Ctrl-I)',
      action: function () {
        this.$.contentWindow.focus();
        this.document.execCommand("italic");
      }
    },
    {
      model_: 'Action',
      name: 'underline',
      label: '<u>U</u>',
      help: 'Underline (Ctrl-U)',
      action: function () {
        this.$.contentWindow.focus();
        this.document.execCommand("underline");
      }
    },
    {
      model_: 'Action',
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
      model_: 'Action',
      name: 'fontSize',
      label: 'Font Size',
      help: 'Change the font size.',
      action: function(){}
    },
    {
      model_: 'Action',
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
      model_: 'Action',
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
      model_: 'Action',
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
      model_: 'Action',
      name: 'huge',
      help: 'Set\'s the font size to small.',
      label: 'huge',
      parent: 'fontSize',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontSize", false, "7");
      }
    },
    {
      model_: 'Action',
      name: 'fontFace',
      help: 'Set\'s the font face.',
      label: 'Font',
    },
    {
      model_: 'Action',
      name: 'sansSerif',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "arial, sans-serif");
      }
    },
    {
      model_: 'Action',
      name: 'serif',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "times new roman, serif");
      }
    },
    {
      model_: 'Action',
      name: 'wide',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "arial bold, sans-serif");
      }
    },
    {
      model_: 'Action',
      name: 'narrow',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "arial narrow, sans-serif");
      }
    },
    {
      model_: 'Action',
      name: 'comicSans',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "comic sans, sans-serif");
      }
    },
    {
      model_: 'Action',
      name: 'courierNew',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "courier new, monospace");
      }
    },
    {
      model_: 'Action',
      name: 'garamond',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "garamond, sans-serif");
      }
    },
    {
      model_: 'Action',
      name: 'georgia',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "georgia, sans-serif");
      }
    },
    {
      model_: 'Action',
      name: 'tahoma',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "tahoma, sans-serif");
      }
    },
    {
      model_: 'Action',
      name: 'trebuchet',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "trebuchet ms, sans-serif");
      }
    },
    {
      model_: 'Action',
      name: 'verdana',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "verdana, sans-serif");
      }
    },
    {
      model_: 'Action',
      name: 'removeFormatting',
      help: 'Removes formatting from the current selection.',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("removeFormat");
      }
    },
    {
      model_: 'Action',
      name: 'justification',
      action: function(){}
    },
    {
      model_: 'Action',
      name: 'leftJustify',
      parent: 'justification',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("justifyLeft");
      }
    },
    {
      model_: 'Action',
      name: 'centerJustify',
      parent: 'justification',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("justifyCenter");
      }
    },
    {
      model_: 'Action',
      name: 'rightJustify',
      parent: 'justification',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand('justifyRight');
      }
    },
    {
      model_: 'Action',
      name: 'numberedList',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand('insertOrderedList');
      }
    },
    {
      model_: 'Action',
      name: 'bulletList',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand('insertUnorderedList');
      }
    },
    {
      model_: 'Action',
      name: 'decreaseIndentation',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand('outdent');
      }
    },
    {
      model_: 'Action',
      name: 'increaseIndentation',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand('indent');
      }
    },
    {
      model_: 'Action',
      name: 'blockQuote',
      action: function() {
        this.$.contentWindow.focus();
      }
    }
  ]

});
