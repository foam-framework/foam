/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
// @version 0.5.4
window.PolymerGestures = {};

(function(scope) {
  var hasFullPath = false;

  // test for full event path support
  var pathTest = document.createElement('meta');
  if (pathTest.createShadowRoot) {
    var sr = pathTest.createShadowRoot();
    var s = document.createElement('span');
    sr.appendChild(s);
    pathTest.addEventListener('testpath', function(ev) {
      if (ev.path) {
        // if the span is in the event path, then path[0] is the real source for all events
        hasFullPath = ev.path[0] === s;
      }
      ev.stopPropagation();
    });
    var ev = new CustomEvent('testpath', {bubbles: true});
    // must add node to DOM to trigger event listener
    document.head.appendChild(pathTest);
    s.dispatchEvent(ev);
    pathTest.parentNode.removeChild(pathTest);
    sr = s = null;
  }
  pathTest = null;

  var target = {
    shadow: function(inEl) {
      if (inEl) {
        return inEl.shadowRoot || inEl.webkitShadowRoot;
      }
    },
    canTarget: function(shadow) {
      return shadow && Boolean(shadow.elementFromPoint);
    },
    targetingShadow: function(inEl) {
      var s = this.shadow(inEl);
      if (this.canTarget(s)) {
        return s;
      }
    },
    olderShadow: function(shadow) {
      var os = shadow.olderShadowRoot;
      if (!os) {
        var se = shadow.querySelector('shadow');
        if (se) {
          os = se.olderShadowRoot;
        }
      }
      return os;
    },
    allShadows: function(element) {
      var shadows = [], s = this.shadow(element);
      while(s) {
        shadows.push(s);
        s = this.olderShadow(s);
      }
      return shadows;
    },
    searchRoot: function(inRoot, x, y) {
      var t, st, sr, os;
      if (inRoot) {
        t = inRoot.elementFromPoint(x, y);
        if (t) {
          // found element, check if it has a ShadowRoot
          sr = this.targetingShadow(t);
        } else if (inRoot !== document) {
          // check for sibling roots
          sr = this.olderShadow(inRoot);
        }
        // search other roots, fall back to light dom element
        return this.searchRoot(sr, x, y) || t;
      }
    },
    owner: function(element) {
      if (!element) {
        return document;
      }
      var s = element;
      // walk up until you hit the shadow root or document
      while (s.parentNode) {
        s = s.parentNode;
      }
      // the owner element is expected to be a Document or ShadowRoot
      if (s.nodeType != Node.DOCUMENT_NODE && s.nodeType != Node.DOCUMENT_FRAGMENT_NODE) {
        s = document;
      }
      return s;
    },
    findTarget: function(inEvent) {
      if (hasFullPath && inEvent.path && inEvent.path.length) {
        return inEvent.path[0];
      }
      var x = inEvent.clientX, y = inEvent.clientY;
      // if the listener is in the shadow root, it is much faster to start there
      var s = this.owner(inEvent.target);
      // if x, y is not in this root, fall back to document search
      if (!s.elementFromPoint(x, y)) {
        s = document;
      }
      return this.searchRoot(s, x, y);
    },
    findTouchAction: function(inEvent) {
      var n;
      if (hasFullPath && inEvent.path && inEvent.path.length) {
        var path = inEvent.path;
        for (var i = 0; i < path.length; i++) {
          n = path[i];
          if (n.nodeType === Node.ELEMENT_NODE && n.hasAttribute('touch-action')) {
            return n.getAttribute('touch-action');
          }
        }
      } else {
        n = inEvent.target;
        while(n) {
          if (n.nodeType === Node.ELEMENT_NODE && n.hasAttribute('touch-action')) {
            return n.getAttribute('touch-action');
          }
          n = n.parentNode || n.host;
        }
      }
      // auto is default
      return "auto";
    },
    LCA: function(a, b) {
      if (a === b) {
        return a;
      }
      if (a && !b) {
        return a;
      }
      if (b && !a) {
        return b;
      }
      if (!b && !a) {
        return document;
      }
      // fast case, a is a direct descendant of b or vice versa
      if (a.contains && a.contains(b)) {
        return a;
      }
      if (b.contains && b.contains(a)) {
        return b;
      }
      var adepth = this.depth(a);
      var bdepth = this.depth(b);
      var d = adepth - bdepth;
      if (d >= 0) {
        a = this.walk(a, d);
      } else {
        b = this.walk(b, -d);
      }
      while (a && b && a !== b) {
        a = a.parentNode || a.host;
        b = b.parentNode || b.host;
      }
      return a;
    },
    walk: function(n, u) {
      for (var i = 0; n && (i < u); i++) {
        n = n.parentNode || n.host;
      }
      return n;
    },
    depth: function(n) {
      var d = 0;
      while(n) {
        d++;
        n = n.parentNode || n.host;
      }
      return d;
    },
    deepContains: function(a, b) {
      var common = this.LCA(a, b);
      // if a is the common ancestor, it must "deeply" contain b
      return common === a;
    },
    insideNode: function(node, x, y) {
      var rect = node.getBoundingClientRect();
      return (rect.left <= x) && (x <= rect.right) && (rect.top <= y) && (y <= rect.bottom);
    },
    path: function(event) {
      var p;
      if (hasFullPath && event.path && event.path.length) {
        p = event.path;
      } else {
        p = [];
        var n = this.findTarget(event);
        while (n) {
          p.push(n);
          n = n.parentNode || n.host;
        }
      }
      return p;
    }
  };
  scope.targetFinding = target;
  /**
   * Given an event, finds the "deepest" node that could have been the original target before ShadowDOM retargetting
   *
   * @param {Event} Event An event object with clientX and clientY properties
   * @return {Element} The probable event origninator
   */
  scope.findTarget = target.findTarget.bind(target);
  /**
   * Determines if the "container" node deeply contains the "containee" node, including situations where the "containee" is contained by one or more ShadowDOM
   * roots.
   *
   * @param {Node} container
   * @param {Node} containee
   * @return {Boolean}
   */
  scope.deepContains = target.deepContains.bind(target);

  /**
   * Determines if the x/y position is inside the given node.
   *
   * Example:
   *
   *     function upHandler(event) {
   *       var innode = PolymerGestures.insideNode(event.target, event.clientX, event.clientY);
   *       if (innode) {
   *         // wait for tap?
   *       } else {
   *         // tap will never happen
   *       }
   *     }
   *
   * @param {Node} node
   * @param {Number} x Screen X position
   * @param {Number} y screen Y position
   * @return {Boolean}
   */
  scope.insideNode = target.insideNode;

})(window.PolymerGestures);

(function() {
  function shadowSelector(v) {
    return 'html /deep/ ' + selector(v);
  }
  function selector(v) {
    return '[touch-action="' + v + '"]';
  }
  function rule(v) {
    return '{ -ms-touch-action: ' + v + '; touch-action: ' + v + ';}';
  }
  var attrib2css = [
    'none',
    'auto',
    'pan-x',
    'pan-y',
    {
      rule: 'pan-x pan-y',
      selectors: [
        'pan-x pan-y',
        'pan-y pan-x'
      ]
    },
    'manipulation'
  ];
  var styles = '';
  // only install stylesheet if the browser has touch action support
  var hasTouchAction = typeof document.head.style.touchAction === 'string';
  // only add shadow selectors if shadowdom is supported
  var hasShadowRoot = !window.ShadowDOMPolyfill && document.head.createShadowRoot;

  if (hasTouchAction) {
    attrib2css.forEach(function(r) {
      if (String(r) === r) {
        styles += selector(r) + rule(r) + '\n';
        if (hasShadowRoot) {
          styles += shadowSelector(r) + rule(r) + '\n';
        }
      } else {
        styles += r.selectors.map(selector) + rule(r.rule) + '\n';
        if (hasShadowRoot) {
          styles += r.selectors.map(shadowSelector) + rule(r.rule) + '\n';
        }
      }
    });

    var el = document.createElement('style');
    el.textContent = styles;
    document.head.appendChild(el);
  }
})();

/**
 * This is the constructor for new PointerEvents.
 *
 * New Pointer Events must be given a type, and an optional dictionary of
 * initialization properties.
 *
 * Due to certain platform requirements, events returned from the constructor
 * identify as MouseEvents.
 *
 * @constructor
 * @param {String} inType The type of the event to create.
 * @param {Object} [inDict] An optional dictionary of initial event properties.
 * @return {Event} A new PointerEvent of type `inType` and initialized with properties from `inDict`.
 */
(function(scope) {

  var MOUSE_PROPS = [
    'bubbles',
    'cancelable',
    'view',
    'detail',
    'screenX',
    'screenY',
    'clientX',
    'clientY',
    'ctrlKey',
    'altKey',
    'shiftKey',
    'metaKey',
    'button',
    'relatedTarget',
    'pageX',
    'pageY'
  ];

  var MOUSE_DEFAULTS = [
    false,
    false,
    null,
    null,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null,
    0,
    0
  ];

  var NOP_FACTORY = function(){ return function(){}; };

  var eventFactory = {
    // TODO(dfreedm): this is overridden by tap recognizer, needs review
    preventTap: NOP_FACTORY,
    makeBaseEvent: function(inType, inDict) {
      var e = document.createEvent('Event');
      e.initEvent(inType, inDict.bubbles || false, inDict.cancelable || false);
      e.preventTap = eventFactory.preventTap(e);
      return e;
    },
    makeGestureEvent: function(inType, inDict) {
      inDict = inDict || Object.create(null);

      var e = this.makeBaseEvent(inType, inDict);
      for (var i = 0, keys = Object.keys(inDict), k; i < keys.length; i++) {
        k = keys[i];
        e[k] = inDict[k];
      }
      return e;
    },
    makePointerEvent: function(inType, inDict) {
      inDict = inDict || Object.create(null);

      var e = this.makeBaseEvent(inType, inDict);
      // define inherited MouseEvent properties
      for(var i = 0, p; i < MOUSE_PROPS.length; i++) {
        p = MOUSE_PROPS[i];
        e[p] = inDict[p] || MOUSE_DEFAULTS[i];
      }
      e.buttons = inDict.buttons || 0;

      // Spec requires that pointers without pressure specified use 0.5 for down
      // state and 0 for up state.
      var pressure = 0;
      if (inDict.pressure) {
        pressure = inDict.pressure;
      } else {
        pressure = e.buttons ? 0.5 : 0;
      }

      // add x/y properties aliased to clientX/Y
      e.x = e.clientX;
      e.y = e.clientY;

      // define the properties of the PointerEvent interface
      e.pointerId = inDict.pointerId || 0;
      e.width = inDict.width || 0;
      e.height = inDict.height || 0;
      e.pressure = pressure;
      e.tiltX = inDict.tiltX || 0;
      e.tiltY = inDict.tiltY || 0;
      e.pointerType = inDict.pointerType || '';
      e.hwTimestamp = inDict.hwTimestamp || 0;
      e.isPrimary = inDict.isPrimary || false;
      e._source = inDict._source || '';
      return e;
    }
  };

  scope.eventFactory = eventFactory;
})(window.PolymerGestures);

/**
 * This module implements an map of pointer states
 */
(function(scope) {
  var USE_MAP = window.Map && window.Map.prototype.forEach;
  var POINTERS_FN = function(){ return this.size; };
  function PointerMap() {
    if (USE_MAP) {
      var m = new Map();
      m.pointers = POINTERS_FN;
      return m;
    } else {
      this.keys = [];
      this.values = [];
    }
  }

  PointerMap.prototype = {
    set: function(inId, inEvent) {
      var i = this.keys.indexOf(inId);
      if (i > -1) {
        this.values[i] = inEvent;
      } else {
        this.keys.push(inId);
        this.values.push(inEvent);
      }
    },
    has: function(inId) {
      return this.keys.indexOf(inId) > -1;
    },
    'delete': function(inId) {
      var i = this.keys.indexOf(inId);
      if (i > -1) {
        this.keys.splice(i, 1);
        this.values.splice(i, 1);
      }
    },
    get: function(inId) {
      var i = this.keys.indexOf(inId);
      return this.values[i];
    },
    clear: function() {
      this.keys.length = 0;
      this.values.length = 0;
    },
    // return value, key, map
    forEach: function(callback, thisArg) {
      this.values.forEach(function(v, i) {
        callback.call(thisArg, v, this.keys[i], this);
      }, this);
    },
    pointers: function() {
      return this.keys.length;
    }
  };

  scope.PointerMap = PointerMap;
})(window.PolymerGestures);

(function(scope) {
  var CLONE_PROPS = [
    // MouseEvent
    'bubbles',
    'cancelable',
    'view',
    'detail',
    'screenX',
    'screenY',
    'clientX',
    'clientY',
    'ctrlKey',
    'altKey',
    'shiftKey',
    'metaKey',
    'button',
    'relatedTarget',
    // DOM Level 3
    'buttons',
    // PointerEvent
    'pointerId',
    'width',
    'height',
    'pressure',
    'tiltX',
    'tiltY',
    'pointerType',
    'hwTimestamp',
    'isPrimary',
    // event instance
    'type',
    'target',
    'currentTarget',
    'which',
    'pageX',
    'pageY',
    'timeStamp',
    // gesture addons
    'preventTap',
    'tapPrevented',
    '_source'
  ];

  var CLONE_DEFAULTS = [
    // MouseEvent
    false,
    false,
    null,
    null,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null,
    // DOM Level 3
    0,
    // PointerEvent
    0,
    0,
    0,
    0,
    0,
    0,
    '',
    0,
    false,
    // event instance
    '',
    null,
    null,
    0,
    0,
    0,
    0,
    function(){},
    false
  ];

  var HAS_SVG_INSTANCE = (typeof SVGElementInstance !== 'undefined');

  var eventFactory = scope.eventFactory;

  // set of recognizers to run for the currently handled event
  var currentGestures;

  /**
   * This module is for normalizing events. Mouse and Touch events will be
   * collected here, and fire PointerEvents that have the same semantics, no
   * matter the source.
   * Events fired:
   *   - pointerdown: a pointing is added
   *   - pointerup: a pointer is removed
   *   - pointermove: a pointer is moved
   *   - pointerover: a pointer crosses into an element
   *   - pointerout: a pointer leaves an element
   *   - pointercancel: a pointer will no longer generate events
   */
  var dispatcher = {
    IS_IOS: false,
    pointermap: new scope.PointerMap(),
    requiredGestures: new scope.PointerMap(),
    eventMap: Object.create(null),
    // Scope objects for native events.
    // This exists for ease of testing.
    eventSources: Object.create(null),
    eventSourceList: [],
    gestures: [],
    // map gesture event -> {listeners: int, index: gestures[int]}
    dependencyMap: {
      // make sure down and up are in the map to trigger "register"
      down: {listeners: 0, index: -1},
      up: {listeners: 0, index: -1}
    },
    gestureQueue: [],
    /**
     * Add a new event source that will generate pointer events.
     *
     * `inSource` must contain an array of event names named `events`, and
     * functions with the names specified in the `events` array.
     * @param {string} name A name for the event source
     * @param {Object} source A new source of platform events.
     */
    registerSource: function(name, source) {
      var s = source;
      var newEvents = s.events;
      if (newEvents) {
        newEvents.forEach(function(e) {
          if (s[e]) {
            this.eventMap[e] = s[e].bind(s);
          }
        }, this);
        this.eventSources[name] = s;
        this.eventSourceList.push(s);
      }
    },
    registerGesture: function(name, source) {
      var obj = Object.create(null);
      obj.listeners = 0;
      obj.index = this.gestures.length;
      for (var i = 0, g; i < source.exposes.length; i++) {
        g = source.exposes[i].toLowerCase();
        this.dependencyMap[g] = obj;
      }
      this.gestures.push(source);
    },
    register: function(element, initial) {
      var l = this.eventSourceList.length;
      for (var i = 0, es; (i < l) && (es = this.eventSourceList[i]); i++) {
        // call eventsource register
        es.register.call(es, element, initial);
      }
    },
    unregister: function(element) {
      var l = this.eventSourceList.length;
      for (var i = 0, es; (i < l) && (es = this.eventSourceList[i]); i++) {
        // call eventsource register
        es.unregister.call(es, element);
      }
    },
    // EVENTS
    down: function(inEvent) {
      this.requiredGestures.set(inEvent.pointerId, currentGestures);
      this.fireEvent('down', inEvent);
    },
    move: function(inEvent) {
      // pipe move events into gesture queue directly
      inEvent.type = 'move';
      this.fillGestureQueue(inEvent);
    },
    up: function(inEvent) {
      this.fireEvent('up', inEvent);
      this.requiredGestures.delete(inEvent.pointerId);
    },
    cancel: function(inEvent) {
      inEvent.tapPrevented = true;
      this.fireEvent('up', inEvent);
      this.requiredGestures.delete(inEvent.pointerId);
    },
    addGestureDependency: function(node, currentGestures) {
      var gesturesWanted = node._pgEvents;
      if (gesturesWanted && currentGestures) {
        var gk = Object.keys(gesturesWanted);
        for (var i = 0, r, ri, g; i < gk.length; i++) {
          // gesture
          g = gk[i];
          if (gesturesWanted[g] > 0) {
            // lookup gesture recognizer
            r = this.dependencyMap[g];
            // recognizer index
            ri = r ? r.index : -1;
            currentGestures[ri] = true;
          }
        }
      }
    },
    // LISTENER LOGIC
    eventHandler: function(inEvent) {
      // This is used to prevent multiple dispatch of events from
      // platform events. This can happen when two elements in different scopes
      // are set up to create pointer events, which is relevant to Shadow DOM.

      var type = inEvent.type;

      // only generate the list of desired events on "down"
      if (type === 'touchstart' || type === 'mousedown' || type === 'pointerdown' || type === 'MSPointerDown') {
        if (!inEvent._handledByPG) {
          currentGestures = {};
        }

        // in IOS mode, there is only a listener on the document, so this is not re-entrant
        if (this.IS_IOS) {
          var ev = inEvent;
          if (type === 'touchstart') {
            var ct = inEvent.changedTouches[0];
            // set up a fake event to give to the path builder
            ev = {target: inEvent.target, clientX: ct.clientX, clientY: ct.clientY, path: inEvent.path};
          }
          // use event path if available, otherwise build a path from target finding
          var nodes = inEvent.path || scope.targetFinding.path(ev);
          for (var i = 0, n; i < nodes.length; i++) {
            n = nodes[i];
            this.addGestureDependency(n, currentGestures);
          }
        } else {
          this.addGestureDependency(inEvent.currentTarget, currentGestures);
        }
      }

      if (inEvent._handledByPG) {
        return;
      }
      var fn = this.eventMap && this.eventMap[type];
      if (fn) {
        fn(inEvent);
      }
      inEvent._handledByPG = true;
    },
    // set up event listeners
    listen: function(target, events) {
      for (var i = 0, l = events.length, e; (i < l) && (e = events[i]); i++) {
        this.addEvent(target, e);
      }
    },
    // remove event listeners
    unlisten: function(target, events) {
      for (var i = 0, l = events.length, e; (i < l) && (e = events[i]); i++) {
        this.removeEvent(target, e);
      }
    },
    addEvent: function(target, eventName) {
      target.addEventListener(eventName, this.boundHandler);
    },
    removeEvent: function(target, eventName) {
      target.removeEventListener(eventName, this.boundHandler);
    },
    // EVENT CREATION AND TRACKING
    /**
     * Creates a new Event of type `inType`, based on the information in
     * `inEvent`.
     *
     * @param {string} inType A string representing the type of event to create
     * @param {Event} inEvent A platform event with a target
     * @return {Event} A PointerEvent of type `inType`
     */
    makeEvent: function(inType, inEvent) {
      var e = eventFactory.makePointerEvent(inType, inEvent);
      e.preventDefault = inEvent.preventDefault;
      e.tapPrevented = inEvent.tapPrevented;
      e._target = e._target || inEvent.target;
      return e;
    },
    // make and dispatch an event in one call
    fireEvent: function(inType, inEvent) {
      var e = this.makeEvent(inType, inEvent);
      return this.dispatchEvent(e);
    },
    /**
     * Returns a snapshot of inEvent, with writable properties.
     *
     * @param {Event} inEvent An event that contains properties to copy.
     * @return {Object} An object containing shallow copies of `inEvent`'s
     *    properties.
     */
    cloneEvent: function(inEvent) {
      var eventCopy = Object.create(null), p;
      for (var i = 0; i < CLONE_PROPS.length; i++) {
        p = CLONE_PROPS[i];
        eventCopy[p] = inEvent[p] || CLONE_DEFAULTS[i];
        // Work around SVGInstanceElement shadow tree
        // Return the <use> element that is represented by the instance for Safari, Chrome, IE.
        // This is the behavior implemented by Firefox.
        if (p === 'target' || p === 'relatedTarget') {
          if (HAS_SVG_INSTANCE && eventCopy[p] instanceof SVGElementInstance) {
            eventCopy[p] = eventCopy[p].correspondingUseElement;
          }
        }
      }
      // keep the semantics of preventDefault
      eventCopy.preventDefault = function() {
        inEvent.preventDefault();
      };
      return eventCopy;
    },
    /**
     * Dispatches the event to its target.
     *
     * @param {Event} inEvent The event to be dispatched.
     * @return {Boolean} True if an event handler returns true, false otherwise.
     */
    dispatchEvent: function(inEvent) {
      var t = inEvent._target;
      if (t) {
        t.dispatchEvent(inEvent);
        // clone the event for the gesture system to process
        // clone after dispatch to pick up gesture prevention code
        var clone = this.cloneEvent(inEvent);
        clone.target = t;
        this.fillGestureQueue(clone);
      }
    },
    gestureTrigger: function() {
      // process the gesture queue
      for (var i = 0, e, rg; i < this.gestureQueue.length; i++) {
        e = this.gestureQueue[i];
        rg = e._requiredGestures;
        if (rg) {
          for (var j = 0, g, fn; j < this.gestures.length; j++) {
            // only run recognizer if an element in the source event's path is listening for those gestures
            if (rg[j]) {
              g = this.gestures[j];
              fn = g[e.type];
              if (fn) {
                fn.call(g, e);
              }
            }
          }
        }
      }
      this.gestureQueue.length = 0;
    },
    fillGestureQueue: function(ev) {
      // only trigger the gesture queue once
      if (!this.gestureQueue.length) {
        requestAnimationFrame(this.boundGestureTrigger);
      }
      ev._requiredGestures = this.requiredGestures.get(ev.pointerId);
      this.gestureQueue.push(ev);
    }
  };
  dispatcher.boundHandler = dispatcher.eventHandler.bind(dispatcher);
  dispatcher.boundGestureTrigger = dispatcher.gestureTrigger.bind(dispatcher);
  scope.dispatcher = dispatcher;

  /**
   * Listen for `gesture` on `node` with the `handler` function
   *
   * If `handler` is the first listener for `gesture`, the underlying gesture recognizer is then enabled.
   *
   * @param {Element} node
   * @param {string} gesture
   * @return Boolean `gesture` is a valid gesture
   */
  scope.activateGesture = function(node, gesture) {
    var g = gesture.toLowerCase();
    var dep = dispatcher.dependencyMap[g];
    if (dep) {
      var recognizer = dispatcher.gestures[dep.index];
      if (!node._pgListeners) {
        dispatcher.register(node);
        node._pgListeners = 0;
      }
      // TODO(dfreedm): re-evaluate bookkeeping to avoid using attributes
      if (recognizer) {
        var touchAction = recognizer.defaultActions && recognizer.defaultActions[g];
        var actionNode;
        switch(node.nodeType) {
          case Node.ELEMENT_NODE:
            actionNode = node;
          break;
          case Node.DOCUMENT_FRAGMENT_NODE:
            actionNode = node.host;
          break;
          default:
            actionNode = null;
          break;
        }
        if (touchAction && actionNode && !actionNode.hasAttribute('touch-action')) {
          actionNode.setAttribute('touch-action', touchAction);
        }
      }
      if (!node._pgEvents) {
        node._pgEvents = {};
      }
      node._pgEvents[g] = (node._pgEvents[g] || 0) + 1;
      node._pgListeners++;
    }
    return Boolean(dep);
  };

  /**
   *
   * Listen for `gesture` from `node` with `handler` function.
   *
   * @param {Element} node
   * @param {string} gesture
   * @param {Function} handler
   * @param {Boolean} capture
   */
  scope.addEventListener = function(node, gesture, handler, capture) {
    if (handler) {
      scope.activateGesture(node, gesture);
      node.addEventListener(gesture, handler, capture);
    }
  };

  /**
   * Tears down the gesture configuration for `node`
   *
   * If `handler` is the last listener for `gesture`, the underlying gesture recognizer is disabled.
   *
   * @param {Element} node
   * @param {string} gesture
   * @return Boolean `gesture` is a valid gesture
   */
  scope.deactivateGesture = function(node, gesture) {
    var g = gesture.toLowerCase();
    var dep = dispatcher.dependencyMap[g];
    if (dep) {
      if (node._pgListeners > 0) {
        node._pgListeners--;
      }
      if (node._pgListeners === 0) {
        dispatcher.unregister(node);
      }
      if (node._pgEvents) {
        if (node._pgEvents[g] > 0) {
          node._pgEvents[g]--;
        } else {
          node._pgEvents[g] = 0;
        }
      }
    }
    return Boolean(dep);
  };

  /**
   * Stop listening for `gesture` from `node` with `handler` function.
   *
   * @param {Element} node
   * @param {string} gesture
   * @param {Function} handler
   * @param {Boolean} capture
   */
  scope.removeEventListener = function(node, gesture, handler, capture) {
    if (handler) {
      scope.deactivateGesture(node, gesture);
      node.removeEventListener(gesture, handler, capture);
    }
  };
})(window.PolymerGestures);

(function(scope) {
  var dispatcher = scope.dispatcher;
  var pointermap = dispatcher.pointermap;
  // radius around touchend that swallows mouse events
  var DEDUP_DIST = 25;

  var WHICH_TO_BUTTONS = [0, 1, 4, 2];

  var currentButtons = 0;

  var FIREFOX_LINUX = /Linux.*Firefox\//i;

  var HAS_BUTTONS = (function() {
    // firefox on linux returns spec-incorrect values for mouseup.buttons
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent.buttons#See_also
    // https://codereview.chromium.org/727593003/#msg16
    if (FIREFOX_LINUX.test(navigator.userAgent)) {
      return false;
    }
    try {
      return new MouseEvent('test', {buttons: 1}).buttons === 1;
    } catch (e) {
      return false;
    }
  })();

  // handler block for native mouse events
  var mouseEvents = {
    POINTER_ID: 1,
    POINTER_TYPE: 'mouse',
    events: [
      'mousedown',
      'mousemove',
      'mouseup'
    ],
    exposes: [
      'down',
      'up',
      'move'
    ],
    register: function(target) {
      dispatcher.listen(target, this.events);
    },
    unregister: function(target) {
      if (target === document) {
        return;
      }
      dispatcher.unlisten(target, this.events);
    },
    lastTouches: [],
    // collide with the global mouse listener
    isEventSimulatedFromTouch: function(inEvent) {
      var lts = this.lastTouches;
      var x = inEvent.clientX, y = inEvent.clientY;
      for (var i = 0, l = lts.length, t; i < l && (t = lts[i]); i++) {
        // simulated mouse events will be swallowed near a primary touchend
        var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DIST && dy <= DEDUP_DIST) {
          return true;
        }
      }
    },
    prepareEvent: function(inEvent) {
      var e = dispatcher.cloneEvent(inEvent);
      e.pointerId = this.POINTER_ID;
      e.isPrimary = true;
      e.pointerType = this.POINTER_TYPE;
      e._source = 'mouse';
      if (!HAS_BUTTONS) {
        var type = inEvent.type;
        var bit = WHICH_TO_BUTTONS[inEvent.which] || 0;
        if (type === 'mousedown') {
          currentButtons |= bit;
        } else if (type === 'mouseup') {
          currentButtons &= ~bit;
        }
        e.buttons = currentButtons;
      }
      return e;
    },
    mousedown: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var p = pointermap.has(this.POINTER_ID);
        var e = this.prepareEvent(inEvent);
        e.target = scope.findTarget(inEvent);
        pointermap.set(this.POINTER_ID, e.target);
        dispatcher.down(e);
      }
    },
    mousemove: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var target = pointermap.get(this.POINTER_ID);
        if (target) {
          var e = this.prepareEvent(inEvent);
          e.target = target;
          // handle case where we missed a mouseup
          if ((HAS_BUTTONS ? e.buttons : e.which) === 0) {
            if (!HAS_BUTTONS) {
              currentButtons = e.buttons = 0;
            }
            dispatcher.cancel(e);
            this.cleanupMouse(e.buttons);
          } else {
            dispatcher.move(e);
          }
        }
      }
    },
    mouseup: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        e.relatedTarget = scope.findTarget(inEvent);
        e.target = pointermap.get(this.POINTER_ID);
        dispatcher.up(e);
        this.cleanupMouse(e.buttons);
      }
    },
    cleanupMouse: function(buttons) {
      if (buttons === 0) {
        pointermap.delete(this.POINTER_ID);
      }
    }
  };

  scope.mouseEvents = mouseEvents;
})(window.PolymerGestures);

(function(scope) {
  var dispatcher = scope.dispatcher;
  var allShadows = scope.targetFinding.allShadows.bind(scope.targetFinding);
  var pointermap = dispatcher.pointermap;
  var touchMap = Array.prototype.map.call.bind(Array.prototype.map);
  // This should be long enough to ignore compat mouse events made by touch
  var DEDUP_TIMEOUT = 2500;
  var DEDUP_DIST = 25;
  var CLICK_COUNT_TIMEOUT = 200;
  var HYSTERESIS = 20;
  var ATTRIB = 'touch-action';
  // TODO(dfreedm): disable until http://crbug.com/399765 is resolved
  // var HAS_TOUCH_ACTION = ATTRIB in document.head.style;
  var HAS_TOUCH_ACTION = false;

  // handler block for native touch events
  var touchEvents = {
    IS_IOS: false,
    events: [
      'touchstart',
      'touchmove',
      'touchend',
      'touchcancel'
    ],
    exposes: [
      'down',
      'up',
      'move'
    ],
    register: function(target, initial) {
      if (this.IS_IOS ? initial : !initial) {
        dispatcher.listen(target, this.events);
      }
    },
    unregister: function(target) {
      if (!this.IS_IOS) {
        dispatcher.unlisten(target, this.events);
      }
    },
    scrollTypes: {
      EMITTER: 'none',
      XSCROLLER: 'pan-x',
      YSCROLLER: 'pan-y',
    },
    touchActionToScrollType: function(touchAction) {
      var t = touchAction;
      var st = this.scrollTypes;
      if (t === st.EMITTER) {
        return 'none';
      } else if (t === st.XSCROLLER) {
        return 'X';
      } else if (t === st.YSCROLLER) {
        return 'Y';
      } else {
        return 'XY';
      }
    },
    POINTER_TYPE: 'touch',
    firstTouch: null,
    isPrimaryTouch: function(inTouch) {
      return this.firstTouch === inTouch.identifier;
    },
    setPrimaryTouch: function(inTouch) {
      // set primary touch if there no pointers, or the only pointer is the mouse
      if (pointermap.pointers() === 0 || (pointermap.pointers() === 1 && pointermap.has(1))) {
        this.firstTouch = inTouch.identifier;
        this.firstXY = {X: inTouch.clientX, Y: inTouch.clientY};
        this.firstTarget = inTouch.target;
        this.scrolling = null;
        this.cancelResetClickCount();
      }
    },
    removePrimaryPointer: function(inPointer) {
      if (inPointer.isPrimary) {
        this.firstTouch = null;
        this.firstXY = null;
        this.resetClickCount();
      }
    },
    clickCount: 0,
    resetId: null,
    resetClickCount: function() {
      var fn = function() {
        this.clickCount = 0;
        this.resetId = null;
      }.bind(this);
      this.resetId = setTimeout(fn, CLICK_COUNT_TIMEOUT);
    },
    cancelResetClickCount: function() {
      if (this.resetId) {
        clearTimeout(this.resetId);
      }
    },
    typeToButtons: function(type) {
      var ret = 0;
      if (type === 'touchstart' || type === 'touchmove') {
        ret = 1;
      }
      return ret;
    },
    findTarget: function(touch, id) {
      if (this.currentTouchEvent.type === 'touchstart') {
        if (this.isPrimaryTouch(touch)) {
          var fastPath = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            path: this.currentTouchEvent.path,
            target: this.currentTouchEvent.target
          };
          return scope.findTarget(fastPath);
        } else {
          return scope.findTarget(touch);
        }
      }
      // reuse target we found in touchstart
      return pointermap.get(id);
    },
    touchToPointer: function(inTouch) {
      var cte = this.currentTouchEvent;
      var e = dispatcher.cloneEvent(inTouch);
      // Spec specifies that pointerId 1 is reserved for Mouse.
      // Touch identifiers can start at 0.
      // Add 2 to the touch identifier for compatibility.
      var id = e.pointerId = inTouch.identifier + 2;
      e.target = this.findTarget(inTouch, id);
      e.bubbles = true;
      e.cancelable = true;
      e.detail = this.clickCount;
      e.buttons = this.typeToButtons(cte.type);
      e.width = inTouch.webkitRadiusX || inTouch.radiusX || 0;
      e.height = inTouch.webkitRadiusY || inTouch.radiusY || 0;
      e.pressure = inTouch.webkitForce || inTouch.force || 0.5;
      e.isPrimary = this.isPrimaryTouch(inTouch);
      e.pointerType = this.POINTER_TYPE;
      e._source = 'touch';
      // forward touch preventDefaults
      var self = this;
      e.preventDefault = function() {
        self.scrolling = false;
        self.firstXY = null;
        cte.preventDefault();
      };
      return e;
    },
    processTouches: function(inEvent, inFunction) {
      var tl = inEvent.changedTouches;
      this.currentTouchEvent = inEvent;
      for (var i = 0, t, p; i < tl.length; i++) {
        t = tl[i];
        p = this.touchToPointer(t);
        if (inEvent.type === 'touchstart') {
          pointermap.set(p.pointerId, p.target);
        }
        if (pointermap.has(p.pointerId)) {
          inFunction.call(this, p);
        }
        if (inEvent.type === 'touchend' || inEvent._cancel) {
          this.cleanUpPointer(p);
        }
      }
    },
    // For single axis scrollers, determines whether the element should emit
    // pointer events or behave as a scroller
    shouldScroll: function(inEvent) {
      if (this.firstXY) {
        var ret;
        var touchAction = scope.targetFinding.findTouchAction(inEvent);
        var scrollAxis = this.touchActionToScrollType(touchAction);
        if (scrollAxis === 'none') {
          // this element is a touch-action: none, should never scroll
          ret = false;
        } else if (scrollAxis === 'XY') {
          // this element should always scroll
          ret = true;
        } else {
          var t = inEvent.changedTouches[0];
          // check the intended scroll axis, and other axis
          var a = scrollAxis;
          var oa = scrollAxis === 'Y' ? 'X' : 'Y';
          var da = Math.abs(t['client' + a] - this.firstXY[a]);
          var doa = Math.abs(t['client' + oa] - this.firstXY[oa]);
          // if delta in the scroll axis > delta other axis, scroll instead of
          // making events
          ret = da >= doa;
        }
        return ret;
      }
    },
    findTouch: function(inTL, inId) {
      for (var i = 0, l = inTL.length, t; i < l && (t = inTL[i]); i++) {
        if (t.identifier === inId) {
          return true;
        }
      }
    },
    // In some instances, a touchstart can happen without a touchend. This
    // leaves the pointermap in a broken state.
    // Therefore, on every touchstart, we remove the touches that did not fire a
    // touchend event.
    // To keep state globally consistent, we fire a
    // pointercancel for this "abandoned" touch
    vacuumTouches: function(inEvent) {
      var tl = inEvent.touches;
      // pointermap.pointers() should be < tl.length here, as the touchstart has not
      // been processed yet.
      if (pointermap.pointers() >= tl.length) {
        var d = [];
        pointermap.forEach(function(value, key) {
          // Never remove pointerId == 1, which is mouse.
          // Touch identifiers are 2 smaller than their pointerId, which is the
          // index in pointermap.
          if (key !== 1 && !this.findTouch(tl, key - 2)) {
            var p = value;
            d.push(p);
          }
        }, this);
        d.forEach(function(p) {
          this.cancel(p);
          pointermap.delete(p.pointerId);
        }, this);
      }
    },
    touchstart: function(inEvent) {
      this.vacuumTouches(inEvent);
      this.setPrimaryTouch(inEvent.changedTouches[0]);
      this.dedupSynthMouse(inEvent);
      if (!this.scrolling) {
        this.clickCount++;
        this.processTouches(inEvent, this.down);
      }
    },
    down: function(inPointer) {
      dispatcher.down(inPointer);
    },
    touchmove: function(inEvent) {
      if (HAS_TOUCH_ACTION) {
        // touchevent.cancelable == false is sent when the page is scrolling under native Touch Action in Chrome 36
        // https://groups.google.com/a/chromium.org/d/msg/input-dev/wHnyukcYBcA/b9kmtwM1jJQJ
        if (inEvent.cancelable) {
          this.processTouches(inEvent, this.move);
        }
      } else {
        if (!this.scrolling) {
          if (this.scrolling === null && this.shouldScroll(inEvent)) {
            this.scrolling = true;
          } else {
            this.scrolling = false;
            inEvent.preventDefault();
            this.processTouches(inEvent, this.move);
          }
        } else if (this.firstXY) {
          var t = inEvent.changedTouches[0];
          var dx = t.clientX - this.firstXY.X;
          var dy = t.clientY - this.firstXY.Y;
          var dd = Math.sqrt(dx * dx + dy * dy);
          if (dd >= HYSTERESIS) {
            this.touchcancel(inEvent);
            this.scrolling = true;
            this.firstXY = null;
          }
        }
      }
    },
    move: function(inPointer) {
      dispatcher.move(inPointer);
    },
    touchend: function(inEvent) {
      this.dedupSynthMouse(inEvent);
      this.processTouches(inEvent, this.up);
    },
    up: function(inPointer) {
      inPointer.relatedTarget = scope.findTarget(inPointer);
      dispatcher.up(inPointer);
    },
    cancel: function(inPointer) {
      dispatcher.cancel(inPointer);
    },
    touchcancel: function(inEvent) {
      inEvent._cancel = true;
      this.processTouches(inEvent, this.cancel);
    },
    cleanUpPointer: function(inPointer) {
      pointermap['delete'](inPointer.pointerId);
      this.removePrimaryPointer(inPointer);
    },
    // prevent synth mouse events from creating pointer events
    dedupSynthMouse: function(inEvent) {
      var lts = scope.mouseEvents.lastTouches;
      var t = inEvent.changedTouches[0];
      // only the primary finger will synth mouse events
      if (this.isPrimaryTouch(t)) {
        // remember x/y of last touch
        var lt = {x: t.clientX, y: t.clientY};
        lts.push(lt);
        var fn = (function(lts, lt){
          var i = lts.indexOf(lt);
          if (i > -1) {
            lts.splice(i, 1);
          }
        }).bind(null, lts, lt);
        setTimeout(fn, DEDUP_TIMEOUT);
      }
    }
  };

  // prevent "ghost clicks" that come from elements that were removed in a touch handler
  var STOP_PROP_FN = Event.prototype.stopImmediatePropagation || Event.prototype.stopPropagation;
  document.addEventListener('click', function(ev) {
    var x = ev.clientX, y = ev.clientY;
    // check if a click is within DEDUP_DIST px radius of the touchstart
    var closeTo = function(touch) {
      var dx = Math.abs(x - touch.x), dy = Math.abs(y - touch.y);
      return (dx <= DEDUP_DIST && dy <= DEDUP_DIST);
    };
    // if click coordinates are close to touch coordinates, assume the click came from a touch
    var wasTouched = scope.mouseEvents.lastTouches.some(closeTo);
    // if the click came from touch, and the touchstart target is not in the path of the click event,
    // then the touchstart target was probably removed, and the click should be "busted"
    var path = scope.targetFinding.path(ev);
    if (wasTouched) {
      for (var i = 0; i < path.length; i++) {
        if (path[i] === touchEvents.firstTarget) {
          return;
        }
      }
      ev.preventDefault();
      STOP_PROP_FN.call(ev);
    }
  }, true);

  scope.touchEvents = touchEvents;
})(window.PolymerGestures);

(function(scope) {
  var dispatcher = scope.dispatcher;
  var pointermap = dispatcher.pointermap;
  var HAS_BITMAP_TYPE = window.MSPointerEvent && typeof window.MSPointerEvent.MSPOINTER_TYPE_MOUSE === 'number';
  var msEvents = {
    events: [
      'MSPointerDown',
      'MSPointerMove',
      'MSPointerUp',
      'MSPointerCancel',
    ],
    register: function(target) {
      dispatcher.listen(target, this.events);
    },
    unregister: function(target) {
      if (target === document) {
        return;
      }
      dispatcher.unlisten(target, this.events);
    },
    POINTER_TYPES: [
      '',
      'unavailable',
      'touch',
      'pen',
      'mouse'
    ],
    prepareEvent: function(inEvent) {
      var e = inEvent;
      e = dispatcher.cloneEvent(inEvent);
      if (HAS_BITMAP_TYPE) {
        e.pointerType = this.POINTER_TYPES[inEvent.pointerType];
      }
      e._source = 'ms';
      return e;
    },
    cleanup: function(id) {
      pointermap['delete'](id);
    },
    MSPointerDown: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      e.target = scope.findTarget(inEvent);
      pointermap.set(inEvent.pointerId, e.target);
      dispatcher.down(e);
    },
    MSPointerMove: function(inEvent) {
      var target = pointermap.get(inEvent.pointerId);
      if (target) {
        var e = this.prepareEvent(inEvent);
        e.target = target;
        dispatcher.move(e);
      }
    },
    MSPointerUp: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      e.relatedTarget = scope.findTarget(inEvent);
      e.target = pointermap.get(e.pointerId);
      dispatcher.up(e);
      this.cleanup(inEvent.pointerId);
    },
    MSPointerCancel: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      e.relatedTarget = scope.findTarget(inEvent);
      e.target = pointermap.get(e.pointerId);
      dispatcher.cancel(e);
      this.cleanup(inEvent.pointerId);
    }
  };

  scope.msEvents = msEvents;
})(window.PolymerGestures);

(function(scope) {
  var dispatcher = scope.dispatcher;
  var pointermap = dispatcher.pointermap;
  var pointerEvents = {
    events: [
      'pointerdown',
      'pointermove',
      'pointerup',
      'pointercancel'
    ],
    prepareEvent: function(inEvent) {
      var e = dispatcher.cloneEvent(inEvent);
      e._source = 'pointer';
      return e;
    },
    register: function(target) {
      dispatcher.listen(target, this.events);
    },
    unregister: function(target) {
      if (target === document) {
        return;
      }
      dispatcher.unlisten(target, this.events);
    },
    cleanup: function(id) {
      pointermap['delete'](id);
    },
    pointerdown: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      e.target = scope.findTarget(inEvent);
      pointermap.set(e.pointerId, e.target);
      dispatcher.down(e);
    },
    pointermove: function(inEvent) {
      var target = pointermap.get(inEvent.pointerId);
      if (target) {
        var e = this.prepareEvent(inEvent);
        e.target = target;
        dispatcher.move(e);
      }
    },
    pointerup: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      e.relatedTarget = scope.findTarget(inEvent);
      e.target = pointermap.get(e.pointerId);
      dispatcher.up(e);
      this.cleanup(inEvent.pointerId);
    },
    pointercancel: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      e.relatedTarget = scope.findTarget(inEvent);
      e.target = pointermap.get(e.pointerId);
      dispatcher.cancel(e);
      this.cleanup(inEvent.pointerId);
    }
  };

  scope.pointerEvents = pointerEvents;
})(window.PolymerGestures);

/**
 * This module contains the handlers for native platform events.
 * From here, the dispatcher is called to create unified pointer events.
 * Included are touch events (v1), mouse events, and MSPointerEvents.
 */
(function(scope) {

  var dispatcher = scope.dispatcher;
  var nav = window.navigator;

  if (window.PointerEvent) {
    dispatcher.registerSource('pointer', scope.pointerEvents);
  } else if (nav.msPointerEnabled) {
    dispatcher.registerSource('ms', scope.msEvents);
  } else {
    dispatcher.registerSource('mouse', scope.mouseEvents);
    if (window.ontouchstart !== undefined) {
      dispatcher.registerSource('touch', scope.touchEvents);
    }
  }

  // Work around iOS bugs https://bugs.webkit.org/show_bug.cgi?id=135628 and https://bugs.webkit.org/show_bug.cgi?id=136506
  var ua = navigator.userAgent;
  var IS_IOS = ua.match(/iPad|iPhone|iPod/) && 'ontouchstart' in window;

  dispatcher.IS_IOS = IS_IOS;
  scope.touchEvents.IS_IOS = IS_IOS;

  dispatcher.register(document, true);
})(window.PolymerGestures);

/**
 * This event denotes the beginning of a series of tracking events.
 *
 * @module PointerGestures
 * @submodule Events
 * @class trackstart
 */
/**
 * Pixels moved in the x direction since trackstart.
 * @type Number
 * @property dx
 */
/**
 * Pixes moved in the y direction since trackstart.
 * @type Number
 * @property dy
 */
/**
 * Pixels moved in the x direction since the last track.
 * @type Number
 * @property ddx
 */
/**
 * Pixles moved in the y direction since the last track.
 * @type Number
 * @property ddy
 */
/**
 * The clientX position of the track gesture.
 * @type Number
 * @property clientX
 */
/**
 * The clientY position of the track gesture.
 * @type Number
 * @property clientY
 */
/**
 * The pageX position of the track gesture.
 * @type Number
 * @property pageX
 */
/**
 * The pageY position of the track gesture.
 * @type Number
 * @property pageY
 */
/**
 * The screenX position of the track gesture.
 * @type Number
 * @property screenX
 */
/**
 * The screenY position of the track gesture.
 * @type Number
 * @property screenY
 */
/**
 * The last x axis direction of the pointer.
 * @type Number
 * @property xDirection
 */
/**
 * The last y axis direction of the pointer.
 * @type Number
 * @property yDirection
 */
/**
 * A shared object between all tracking events.
 * @type Object
 * @property trackInfo
 */
/**
 * The element currently under the pointer.
 * @type Element
 * @property relatedTarget
 */
/**
 * The type of pointer that make the track gesture.
 * @type String
 * @property pointerType
 */
/**
 *
 * This event fires for all pointer movement being tracked.
 *
 * @class track
 * @extends trackstart
 */
/**
 * This event fires when the pointer is no longer being tracked.
 *
 * @class trackend
 * @extends trackstart
 */

 (function(scope) {
   var dispatcher = scope.dispatcher;
   var eventFactory = scope.eventFactory;
   var pointermap = new scope.PointerMap();
   var track = {
     events: [
       'down',
       'move',
       'up',
     ],
     exposes: [
      'trackstart',
      'track',
      'trackx',
      'tracky',
      'trackend'
     ],
     defaultActions: {
       'track': 'none',
       'trackx': 'pan-y',
       'tracky': 'pan-x'
     },
     WIGGLE_THRESHOLD: 4,
     clampDir: function(inDelta) {
       return inDelta > 0 ? 1 : -1;
     },
     calcPositionDelta: function(inA, inB) {
       var x = 0, y = 0;
       if (inA && inB) {
         x = inB.pageX - inA.pageX;
         y = inB.pageY - inA.pageY;
       }
       return {x: x, y: y};
     },
     fireTrack: function(inType, inEvent, inTrackingData) {
       var t = inTrackingData;
       var d = this.calcPositionDelta(t.downEvent, inEvent);
       var dd = this.calcPositionDelta(t.lastMoveEvent, inEvent);
       if (dd.x) {
         t.xDirection = this.clampDir(dd.x);
       } else if (inType === 'trackx') {
         return;
       }
       if (dd.y) {
         t.yDirection = this.clampDir(dd.y);
       } else if (inType === 'tracky') {
         return;
       }
       var gestureProto = {
         bubbles: true,
         cancelable: true,
         trackInfo: t.trackInfo,
         relatedTarget: inEvent.relatedTarget,
         pointerType: inEvent.pointerType,
         pointerId: inEvent.pointerId,
         _source: 'track'
       };
       if (inType !== 'tracky') {
         gestureProto.x = inEvent.x;
         gestureProto.dx = d.x;
         gestureProto.ddx = dd.x;
         gestureProto.clientX = inEvent.clientX;
         gestureProto.pageX = inEvent.pageX;
         gestureProto.screenX = inEvent.screenX;
         gestureProto.xDirection = t.xDirection;
       }
       if (inType !== 'trackx') {
         gestureProto.dy = d.y;
         gestureProto.ddy = dd.y;
         gestureProto.y = inEvent.y;
         gestureProto.clientY = inEvent.clientY;
         gestureProto.pageY = inEvent.pageY;
         gestureProto.screenY = inEvent.screenY;
         gestureProto.yDirection = t.yDirection;
       }
       var e = eventFactory.makeGestureEvent(inType, gestureProto);
       t.downTarget.dispatchEvent(e);
     },
     down: function(inEvent) {
       if (inEvent.isPrimary && (inEvent.pointerType === 'mouse' ? inEvent.buttons === 1 : true)) {
         var p = {
           downEvent: inEvent,
           downTarget: inEvent.target,
           trackInfo: {},
           lastMoveEvent: null,
           xDirection: 0,
           yDirection: 0,
           tracking: false
         };
         pointermap.set(inEvent.pointerId, p);
       }
     },
     move: function(inEvent) {
       var p = pointermap.get(inEvent.pointerId);
       if (p) {
         if (!p.tracking) {
           var d = this.calcPositionDelta(p.downEvent, inEvent);
           var move = d.x * d.x + d.y * d.y;
           // start tracking only if finger moves more than WIGGLE_THRESHOLD
           if (move > this.WIGGLE_THRESHOLD) {
             p.tracking = true;
             p.lastMoveEvent = p.downEvent;
             this.fireTrack('trackstart', inEvent, p);
           }
         }
         if (p.tracking) {
           this.fireTrack('track', inEvent, p);
           this.fireTrack('trackx', inEvent, p);
           this.fireTrack('tracky', inEvent, p);
         }
         p.lastMoveEvent = inEvent;
       }
     },
     up: function(inEvent) {
       var p = pointermap.get(inEvent.pointerId);
       if (p) {
         if (p.tracking) {
           this.fireTrack('trackend', inEvent, p);
         }
         pointermap.delete(inEvent.pointerId);
       }
     }
   };
   dispatcher.registerGesture('track', track);
 })(window.PolymerGestures);

/**
 * This event is fired when a pointer is held down for 200ms.
 *
 * @module PointerGestures
 * @submodule Events
 * @class hold
 */
/**
 * Type of pointer that made the holding event.
 * @type String
 * @property pointerType
 */
/**
 * Screen X axis position of the held pointer
 * @type Number
 * @property clientX
 */
/**
 * Screen Y axis position of the held pointer
 * @type Number
 * @property clientY
 */
/**
 * Type of pointer that made the holding event.
 * @type String
 * @property pointerType
 */
/**
 * This event is fired every 200ms while a pointer is held down.
 *
 * @class holdpulse
 * @extends hold
 */
/**
 * Milliseconds pointer has been held down.
 * @type Number
 * @property holdTime
 */
/**
 * This event is fired when a held pointer is released or moved.
 *
 * @class release
 */

(function(scope) {
  var dispatcher = scope.dispatcher;
  var eventFactory = scope.eventFactory;
  var hold = {
    // wait at least HOLD_DELAY ms between hold and pulse events
    HOLD_DELAY: 200,
    // pointer can move WIGGLE_THRESHOLD pixels before not counting as a hold
    WIGGLE_THRESHOLD: 16,
    events: [
      'down',
      'move',
      'up',
    ],
    exposes: [
      'hold',
      'holdpulse',
      'release'
    ],
    heldPointer: null,
    holdJob: null,
    pulse: function() {
      var hold = Date.now() - this.heldPointer.timeStamp;
      var type = this.held ? 'holdpulse' : 'hold';
      this.fireHold(type, hold);
      this.held = true;
    },
    cancel: function() {
      clearInterval(this.holdJob);
      if (this.held) {
        this.fireHold('release');
      }
      this.held = false;
      this.heldPointer = null;
      this.target = null;
      this.holdJob = null;
    },
    down: function(inEvent) {
      if (inEvent.isPrimary && !this.heldPointer) {
        this.heldPointer = inEvent;
        this.target = inEvent.target;
        this.holdJob = setInterval(this.pulse.bind(this), this.HOLD_DELAY);
      }
    },
    up: function(inEvent) {
      if (this.heldPointer && this.heldPointer.pointerId === inEvent.pointerId) {
        this.cancel();
      }
    },
    move: function(inEvent) {
      if (this.heldPointer && this.heldPointer.pointerId === inEvent.pointerId) {
        var x = inEvent.clientX - this.heldPointer.clientX;
        var y = inEvent.clientY - this.heldPointer.clientY;
        if ((x * x + y * y) > this.WIGGLE_THRESHOLD) {
          this.cancel();
        }
      }
    },
    fireHold: function(inType, inHoldTime) {
      var p = {
        bubbles: true,
        cancelable: true,
        pointerType: this.heldPointer.pointerType,
        pointerId: this.heldPointer.pointerId,
        x: this.heldPointer.clientX,
        y: this.heldPointer.clientY,
        _source: 'hold'
      };
      if (inHoldTime) {
        p.holdTime = inHoldTime;
      }
      var e = eventFactory.makeGestureEvent(inType, p);
      this.target.dispatchEvent(e);
    }
  };
  dispatcher.registerGesture('hold', hold);
})(window.PolymerGestures);

/**
 * This event is fired when a pointer quickly goes down and up, and is used to
 * denote activation.
 *
 * Any gesture event can prevent the tap event from being created by calling
 * `event.preventTap`.
 *
 * Any pointer event can prevent the tap by setting the `tapPrevented` property
 * on itself.
 *
 * @module PointerGestures
 * @submodule Events
 * @class tap
 */
/**
 * X axis position of the tap.
 * @property x
 * @type Number
 */
/**
 * Y axis position of the tap.
 * @property y
 * @type Number
 */
/**
 * Type of the pointer that made the tap.
 * @property pointerType
 * @type String
 */
(function(scope) {
  var dispatcher = scope.dispatcher;
  var eventFactory = scope.eventFactory;
  var pointermap = new scope.PointerMap();
  var tap = {
    events: [
      'down',
      'up'
    ],
    exposes: [
      'tap'
    ],
    down: function(inEvent) {
      if (inEvent.isPrimary && !inEvent.tapPrevented) {
        pointermap.set(inEvent.pointerId, {
          target: inEvent.target,
          buttons: inEvent.buttons,
          x: inEvent.clientX,
          y: inEvent.clientY
        });
      }
    },
    shouldTap: function(e, downState) {
      var tap = true;
      if (e.pointerType === 'mouse') {
        // only allow left click to tap for mouse
        tap = (e.buttons ^ 1) && (downState.buttons & 1);
      }
      return tap && !e.tapPrevented;
    },
    up: function(inEvent) {
      var start = pointermap.get(inEvent.pointerId);
      if (start && this.shouldTap(inEvent, start)) {
        // up.relatedTarget is target currently under finger
        var t = scope.targetFinding.LCA(start.target, inEvent.relatedTarget);
        if (t) {
          var e = eventFactory.makeGestureEvent('tap', {
            bubbles: true,
            cancelable: true,
            x: inEvent.clientX,
            y: inEvent.clientY,
            detail: inEvent.detail,
            pointerType: inEvent.pointerType,
            pointerId: inEvent.pointerId,
            altKey: inEvent.altKey,
            ctrlKey: inEvent.ctrlKey,
            metaKey: inEvent.metaKey,
            shiftKey: inEvent.shiftKey,
            _source: 'tap'
          });
          t.dispatchEvent(e);
        }
      }
      pointermap.delete(inEvent.pointerId);
    }
  };
  // patch eventFactory to remove id from tap's pointermap for preventTap calls
  eventFactory.preventTap = function(e) {
    return function() {
      e.tapPrevented = true;
      pointermap.delete(e.pointerId);
    };
  };
  dispatcher.registerGesture('tap', tap);
})(window.PolymerGestures);

/*
 * Basic strategy: find the farthest apart points, use as diameter of circle
 * react to size change and rotation of the chord
 */

/**
 * @module pointer-gestures
 * @submodule Events
 * @class pinch
 */
/**
 * Scale of the pinch zoom gesture
 * @property scale
 * @type Number
 */
/**
 * Center X position of pointers causing pinch
 * @property centerX
 * @type Number
 */
/**
 * Center Y position of pointers causing pinch
 * @property centerY
 * @type Number
 */

/**
 * @module pointer-gestures
 * @submodule Events
 * @class rotate
 */
/**
 * Angle (in degrees) of rotation. Measured from starting positions of pointers.
 * @property angle
 * @type Number
 */
/**
 * Center X position of pointers causing rotation
 * @property centerX
 * @type Number
 */
/**
 * Center Y position of pointers causing rotation
 * @property centerY
 * @type Number
 */
(function(scope) {
  var dispatcher = scope.dispatcher;
  var eventFactory = scope.eventFactory;
  var pointermap = new scope.PointerMap();
  var RAD_TO_DEG = 180 / Math.PI;
  var pinch = {
    events: [
      'down',
      'up',
      'move',
      'cancel'
    ],
    exposes: [
      'pinchstart',
      'pinch',
      'pinchend',
      'rotate'
    ],
    defaultActions: {
      'pinch': 'none',
      'rotate': 'none'
    },
    reference: {},
    down: function(inEvent) {
      pointermap.set(inEvent.pointerId, inEvent);
      if (pointermap.pointers() == 2) {
        var points = this.calcChord();
        var angle = this.calcAngle(points);
        this.reference = {
          angle: angle,
          diameter: points.diameter,
          target: scope.targetFinding.LCA(points.a.target, points.b.target)
        };

        this.firePinch('pinchstart', points.diameter, points);
      }
    },
    up: function(inEvent) {
      var p = pointermap.get(inEvent.pointerId);
      var num = pointermap.pointers();
      if (p) {
        if (num === 2) {
          // fire 'pinchend' before deleting pointer
          var points = this.calcChord();
          this.firePinch('pinchend', points.diameter, points);
        }
        pointermap.delete(inEvent.pointerId);
      }
    },
    move: function(inEvent) {
      if (pointermap.has(inEvent.pointerId)) {
        pointermap.set(inEvent.pointerId, inEvent);
        if (pointermap.pointers() > 1) {
          this.calcPinchRotate();
        }
      }
    },
    cancel: function(inEvent) {
        this.up(inEvent);
    },
    firePinch: function(type, diameter, points) {
      var zoom = diameter / this.reference.diameter;
      var e = eventFactory.makeGestureEvent(type, {
        bubbles: true,
        cancelable: true,
        scale: zoom,
        centerX: points.center.x,
        centerY: points.center.y,
        _source: 'pinch'
      });
      this.reference.target.dispatchEvent(e);
    },
    fireRotate: function(angle, points) {
      var diff = Math.round((angle - this.reference.angle) % 360);
      var e = eventFactory.makeGestureEvent('rotate', {
        bubbles: true,
        cancelable: true,
        angle: diff,
        centerX: points.center.x,
        centerY: points.center.y,
        _source: 'pinch'
      });
      this.reference.target.dispatchEvent(e);
    },
    calcPinchRotate: function() {
      var points = this.calcChord();
      var diameter = points.diameter;
      var angle = this.calcAngle(points);
      if (diameter != this.reference.diameter) {
        this.firePinch('pinch', diameter, points);
      }
      if (angle != this.reference.angle) {
        this.fireRotate(angle, points);
      }
    },
    calcChord: function() {
      var pointers = [];
      pointermap.forEach(function(p) {
        pointers.push(p);
      });
      var dist = 0;
      // start with at least two pointers
      var points = {a: pointers[0], b: pointers[1]};
      var x, y, d;
      for (var i = 0; i < pointers.length; i++) {
        var a = pointers[i];
        for (var j = i + 1; j < pointers.length; j++) {
          var b = pointers[j];
          x = Math.abs(a.clientX - b.clientX);
          y = Math.abs(a.clientY - b.clientY);
          d = x + y;
          if (d > dist) {
            dist = d;
            points = {a: a, b: b};
          }
        }
      }
      x = Math.abs(points.a.clientX + points.b.clientX) / 2;
      y = Math.abs(points.a.clientY + points.b.clientY) / 2;
      points.center = { x: x, y: y };
      points.diameter = dist;
      return points;
    },
    calcAngle: function(points) {
      var x = points.a.clientX - points.b.clientX;
      var y = points.a.clientY - points.b.clientY;
      return (360 + Math.atan2(y, x) * RAD_TO_DEG) % 360;
    }
  };
  dispatcher.registerGesture('pinch', pinch);
})(window.PolymerGestures);

(function (global) {
    'use strict';

    var Token,
        TokenName,
        Syntax,
        Messages,
        source,
        index,
        length,
        delegate,
        lookahead,
        state;

    Token = {
        BooleanLiteral: 1,
        EOF: 2,
        Identifier: 3,
        Keyword: 4,
        NullLiteral: 5,
        NumericLiteral: 6,
        Punctuator: 7,
        StringLiteral: 8
    };

    TokenName = {};
    TokenName[Token.BooleanLiteral] = 'Boolean';
    TokenName[Token.EOF] = '<end>';
    TokenName[Token.Identifier] = 'Identifier';
    TokenName[Token.Keyword] = 'Keyword';
    TokenName[Token.NullLiteral] = 'Null';
    TokenName[Token.NumericLiteral] = 'Numeric';
    TokenName[Token.Punctuator] = 'Punctuator';
    TokenName[Token.StringLiteral] = 'String';

    Syntax = {
        ArrayExpression: 'ArrayExpression',
        BinaryExpression: 'BinaryExpression',
        CallExpression: 'CallExpression',
        ConditionalExpression: 'ConditionalExpression',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        Identifier: 'Identifier',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        ObjectExpression: 'ObjectExpression',
        Program: 'Program',
        Property: 'Property',
        ThisExpression: 'ThisExpression',
        UnaryExpression: 'UnaryExpression'
    };

    // Error messages should be identical to V8.
    Messages = {
        UnexpectedToken:  'Unexpected token %0',
        UnknownLabel: 'Undefined label \'%0\'',
        Redeclaration: '%0 \'%1\' has already been declared'
    };

    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.

    function assert(condition, message) {
        if (!condition) {
            throw new Error('ASSERT: ' + message);
        }
    }

    function isDecimalDigit(ch) {
        return (ch >= 48 && ch <= 57);   // 0..9
    }


    // 7.2 White Space

    function isWhiteSpace(ch) {
        return (ch === 32) ||  // space
            (ch === 9) ||      // tab
            (ch === 0xB) ||
            (ch === 0xC) ||
            (ch === 0xA0) ||
            (ch >= 0x1680 && '\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF'.indexOf(String.fromCharCode(ch)) > 0);
    }

    // 7.3 Line Terminators

    function isLineTerminator(ch) {
        return (ch === 10) || (ch === 13) || (ch === 0x2028) || (ch === 0x2029);
    }

    // 7.6 Identifier Names and Identifiers

    function isIdentifierStart(ch) {
        return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
            (ch >= 65 && ch <= 90) ||         // A..Z
            (ch >= 97 && ch <= 122);          // a..z
    }

    function isIdentifierPart(ch) {
        return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
            (ch >= 65 && ch <= 90) ||         // A..Z
            (ch >= 97 && ch <= 122) ||        // a..z
            (ch >= 48 && ch <= 57);           // 0..9
    }

    // 7.6.1.1 Keywords

    function isKeyword(id) {
        return (id === 'this')
    }

    // 7.4 Comments

    function skipWhitespace() {
        while (index < length && isWhiteSpace(source.charCodeAt(index))) {
           ++index;
        }
    }

    function getIdentifier() {
        var start, ch;

        start = index++;
        while (index < length) {
            ch = source.charCodeAt(index);
            if (isIdentifierPart(ch)) {
                ++index;
            } else {
                break;
            }
        }

        return source.slice(start, index);
    }

    function scanIdentifier() {
        var start, id, type;

        start = index;

        id = getIdentifier();

        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id.length === 1) {
            type = Token.Identifier;
        } else if (isKeyword(id)) {
            type = Token.Keyword;
        } else if (id === 'null') {
            type = Token.NullLiteral;
        } else if (id === 'true' || id === 'false') {
            type = Token.BooleanLiteral;
        } else {
            type = Token.Identifier;
        }

        return {
            type: type,
            value: id,
            range: [start, index]
        };
    }


    // 7.7 Punctuators

    function scanPunctuator() {
        var start = index,
            code = source.charCodeAt(index),
            code2,
            ch1 = source[index],
            ch2;

        switch (code) {

        // Check for most common single-character punctuators.
        case 46:   // . dot
        case 40:   // ( open bracket
        case 41:   // ) close bracket
        case 59:   // ; semicolon
        case 44:   // , comma
        case 123:  // { open curly brace
        case 125:  // } close curly brace
        case 91:   // [
        case 93:   // ]
        case 58:   // :
        case 63:   // ?
            ++index;
            return {
                type: Token.Punctuator,
                value: String.fromCharCode(code),
                range: [start, index]
            };

        default:
            code2 = source.charCodeAt(index + 1);

            // '=' (char #61) marks an assignment or comparison operator.
            if (code2 === 61) {
                switch (code) {
                case 37:  // %
                case 38:  // &
                case 42:  // *:
                case 43:  // +
                case 45:  // -
                case 47:  // /
                case 60:  // <
                case 62:  // >
                case 124: // |
                    index += 2;
                    return {
                        type: Token.Punctuator,
                        value: String.fromCharCode(code) + String.fromCharCode(code2),
                        range: [start, index]
                    };

                case 33: // !
                case 61: // =
                    index += 2;

                    // !== and ===
                    if (source.charCodeAt(index) === 61) {
                        ++index;
                    }
                    return {
                        type: Token.Punctuator,
                        value: source.slice(start, index),
                        range: [start, index]
                    };
                default:
                    break;
                }
            }
            break;
        }

        // Peek more characters.

        ch2 = source[index + 1];

        // Other 2-character punctuators: && ||

        if (ch1 === ch2 && ('&|'.indexOf(ch1) >= 0)) {
            index += 2;
            return {
                type: Token.Punctuator,
                value: ch1 + ch2,
                range: [start, index]
            };
        }

        if ('<>=!+-*%&|^/'.indexOf(ch1) >= 0) {
            ++index;
            return {
                type: Token.Punctuator,
                value: ch1,
                range: [start, index]
            };
        }

        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
    }

    // 7.8.3 Numeric Literals
    function scanNumericLiteral() {
        var number, start, ch;

        ch = source[index];
        assert(isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'),
            'Numeric literal must start with a decimal digit or a decimal point');

        start = index;
        number = '';
        if (ch !== '.') {
            number = source[index++];
            ch = source[index];

            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            if (number === '0') {
                // decimal number starts with '0' such as '09' is illegal.
                if (ch && isDecimalDigit(ch.charCodeAt(0))) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
            }

            while (isDecimalDigit(source.charCodeAt(index))) {
                number += source[index++];
            }
            ch = source[index];
        }

        if (ch === '.') {
            number += source[index++];
            while (isDecimalDigit(source.charCodeAt(index))) {
                number += source[index++];
            }
            ch = source[index];
        }

        if (ch === 'e' || ch === 'E') {
            number += source[index++];

            ch = source[index];
            if (ch === '+' || ch === '-') {
                number += source[index++];
            }
            if (isDecimalDigit(source.charCodeAt(index))) {
                while (isDecimalDigit(source.charCodeAt(index))) {
                    number += source[index++];
                }
            } else {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
        }

        if (isIdentifierStart(source.charCodeAt(index))) {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        return {
            type: Token.NumericLiteral,
            value: parseFloat(number),
            range: [start, index]
        };
    }

    // 7.8.4 String Literals

    function scanStringLiteral() {
        var str = '', quote, start, ch, octal = false;

        quote = source[index];
        assert((quote === '\'' || quote === '"'),
            'String literal must starts with a quote');

        start = index;
        ++index;

        while (index < length) {
            ch = source[index++];

            if (ch === quote) {
                quote = '';
                break;
            } else if (ch === '\\') {
                ch = source[index++];
                if (!ch || !isLineTerminator(ch.charCodeAt(0))) {
                    switch (ch) {
                    case 'n':
                        str += '\n';
                        break;
                    case 'r':
                        str += '\r';
                        break;
                    case 't':
                        str += '\t';
                        break;
                    case 'b':
                        str += '\b';
                        break;
                    case 'f':
                        str += '\f';
                        break;
                    case 'v':
                        str += '\x0B';
                        break;

                    default:
                        str += ch;
                        break;
                    }
                } else {
                    if (ch ===  '\r' && source[index] === '\n') {
                        ++index;
                    }
                }
            } else if (isLineTerminator(ch.charCodeAt(0))) {
                break;
            } else {
                str += ch;
            }
        }

        if (quote !== '') {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        return {
            type: Token.StringLiteral,
            value: str,
            octal: octal,
            range: [start, index]
        };
    }

    function isIdentifierName(token) {
        return token.type === Token.Identifier ||
            token.type === Token.Keyword ||
            token.type === Token.BooleanLiteral ||
            token.type === Token.NullLiteral;
    }

    function advance() {
        var ch;

        skipWhitespace();

        if (index >= length) {
            return {
                type: Token.EOF,
                range: [index, index]
            };
        }

        ch = source.charCodeAt(index);

        // Very common: ( and ) and ;
        if (ch === 40 || ch === 41 || ch === 58) {
            return scanPunctuator();
        }

        // String literal starts with single quote (#39) or double quote (#34).
        if (ch === 39 || ch === 34) {
            return scanStringLiteral();
        }

        if (isIdentifierStart(ch)) {
            return scanIdentifier();
        }

        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch === 46) {
            if (isDecimalDigit(source.charCodeAt(index + 1))) {
                return scanNumericLiteral();
            }
            return scanPunctuator();
        }

        if (isDecimalDigit(ch)) {
            return scanNumericLiteral();
        }

        return scanPunctuator();
    }

    function lex() {
        var token;

        token = lookahead;
        index = token.range[1];

        lookahead = advance();

        index = token.range[1];

        return token;
    }

    function peek() {
        var pos;

        pos = index;
        lookahead = advance();
        index = pos;
    }

    // Throw an exception

    function throwError(token, messageFormat) {
        var error,
            args = Array.prototype.slice.call(arguments, 2),
            msg = messageFormat.replace(
                /%(\d)/g,
                function (whole, index) {
                    assert(index < args.length, 'Message reference must be in range');
                    return args[index];
                }
            );

        error = new Error(msg);
        error.index = index;
        error.description = msg;
        throw error;
    }

    // Throw an exception because of the token.

    function throwUnexpected(token) {
        throwError(token, Messages.UnexpectedToken, token.value);
    }

    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.

    function expect(value) {
        var token = lex();
        if (token.type !== Token.Punctuator || token.value !== value) {
            throwUnexpected(token);
        }
    }

    // Return true if the next token matches the specified punctuator.

    function match(value) {
        return lookahead.type === Token.Punctuator && lookahead.value === value;
    }

    // Return true if the next token matches the specified keyword

    function matchKeyword(keyword) {
        return lookahead.type === Token.Keyword && lookahead.value === keyword;
    }

    function consumeSemicolon() {
        // Catch the very common case first: immediately a semicolon (char #59).
        if (source.charCodeAt(index) === 59) {
            lex();
            return;
        }

        skipWhitespace();

        if (match(';')) {
            lex();
            return;
        }

        if (lookahead.type !== Token.EOF && !match('}')) {
            throwUnexpected(lookahead);
        }
    }

    // 11.1.4 Array Initialiser

    function parseArrayInitialiser() {
        var elements = [];

        expect('[');

        while (!match(']')) {
            if (match(',')) {
                lex();
                elements.push(null);
            } else {
                elements.push(parseExpression());

                if (!match(']')) {
                    expect(',');
                }
            }
        }

        expect(']');

        return delegate.createArrayExpression(elements);
    }

    // 11.1.5 Object Initialiser

    function parseObjectPropertyKey() {
        var token;

        skipWhitespace();
        token = lex();

        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.
        if (token.type === Token.StringLiteral || token.type === Token.NumericLiteral) {
            return delegate.createLiteral(token);
        }

        return delegate.createIdentifier(token.value);
    }

    function parseObjectProperty() {
        var token, key;

        token = lookahead;
        skipWhitespace();

        if (token.type === Token.EOF || token.type === Token.Punctuator) {
            throwUnexpected(token);
        }

        key = parseObjectPropertyKey();
        expect(':');
        return delegate.createProperty('init', key, parseExpression());
    }

    function parseObjectInitialiser() {
        var properties = [];

        expect('{');

        while (!match('}')) {
            properties.push(parseObjectProperty());

            if (!match('}')) {
                expect(',');
            }
        }

        expect('}');

        return delegate.createObjectExpression(properties);
    }

    // 11.1.6 The Grouping Operator

    function parseGroupExpression() {
        var expr;

        expect('(');

        expr = parseExpression();

        expect(')');

        return expr;
    }


    // 11.1 Primary Expressions

    function parsePrimaryExpression() {
        var type, token, expr;

        if (match('(')) {
            return parseGroupExpression();
        }

        type = lookahead.type;

        if (type === Token.Identifier) {
            expr = delegate.createIdentifier(lex().value);
        } else if (type === Token.StringLiteral || type === Token.NumericLiteral) {
            expr = delegate.createLiteral(lex());
        } else if (type === Token.Keyword) {
            if (matchKeyword('this')) {
                lex();
                expr = delegate.createThisExpression();
            }
        } else if (type === Token.BooleanLiteral) {
            token = lex();
            token.value = (token.value === 'true');
            expr = delegate.createLiteral(token);
        } else if (type === Token.NullLiteral) {
            token = lex();
            token.value = null;
            expr = delegate.createLiteral(token);
        } else if (match('[')) {
            expr = parseArrayInitialiser();
        } else if (match('{')) {
            expr = parseObjectInitialiser();
        }

        if (expr) {
            return expr;
        }

        throwUnexpected(lex());
    }

    // 11.2 Left-Hand-Side Expressions

    function parseArguments() {
        var args = [];

        expect('(');

        if (!match(')')) {
            while (index < length) {
                args.push(parseExpression());
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }

        expect(')');

        return args;
    }

    function parseNonComputedProperty() {
        var token;

        token = lex();

        if (!isIdentifierName(token)) {
            throwUnexpected(token);
        }

        return delegate.createIdentifier(token.value);
    }

    function parseNonComputedMember() {
        expect('.');

        return parseNonComputedProperty();
    }

    function parseComputedMember() {
        var expr;

        expect('[');

        expr = parseExpression();

        expect(']');

        return expr;
    }

    function parseLeftHandSideExpression() {
        var expr, args, property;

        expr = parsePrimaryExpression();

        while (true) {
            if (match('[')) {
                property = parseComputedMember();
                expr = delegate.createMemberExpression('[', expr, property);
            } else if (match('.')) {
                property = parseNonComputedMember();
                expr = delegate.createMemberExpression('.', expr, property);
            } else if (match('(')) {
                args = parseArguments();
                expr = delegate.createCallExpression(expr, args);
            } else {
                break;
            }
        }

        return expr;
    }

    // 11.3 Postfix Expressions

    var parsePostfixExpression = parseLeftHandSideExpression;

    // 11.4 Unary Operators

    function parseUnaryExpression() {
        var token, expr;

        if (lookahead.type !== Token.Punctuator && lookahead.type !== Token.Keyword) {
            expr = parsePostfixExpression();
        } else if (match('+') || match('-') || match('!')) {
            token = lex();
            expr = parseUnaryExpression();
            expr = delegate.createUnaryExpression(token.value, expr);
        } else if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
            throwError({}, Messages.UnexpectedToken);
        } else {
            expr = parsePostfixExpression();
        }

        return expr;
    }

    function binaryPrecedence(token) {
        var prec = 0;

        if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
            return 0;
        }

        switch (token.value) {
        case '||':
            prec = 1;
            break;

        case '&&':
            prec = 2;
            break;

        case '==':
        case '!=':
        case '===':
        case '!==':
            prec = 6;
            break;

        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec = 7;
            break;

        case 'in':
            prec = 7;
            break;

        case '+':
        case '-':
            prec = 9;
            break;

        case '*':
        case '/':
        case '%':
            prec = 11;
            break;

        default:
            break;
        }

        return prec;
    }

    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators

    function parseBinaryExpression() {
        var expr, token, prec, stack, right, operator, left, i;

        left = parseUnaryExpression();

        token = lookahead;
        prec = binaryPrecedence(token);
        if (prec === 0) {
            return left;
        }
        token.prec = prec;
        lex();

        right = parseUnaryExpression();

        stack = [left, token, right];

        while ((prec = binaryPrecedence(lookahead)) > 0) {

            // Reduce: make a binary expression from the three topmost entries.
            while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
                right = stack.pop();
                operator = stack.pop().value;
                left = stack.pop();
                expr = delegate.createBinaryExpression(operator, left, right);
                stack.push(expr);
            }

            // Shift.
            token = lex();
            token.prec = prec;
            stack.push(token);
            expr = parseUnaryExpression();
            stack.push(expr);
        }

        // Final reduce to clean-up the stack.
        i = stack.length - 1;
        expr = stack[i];
        while (i > 1) {
            expr = delegate.createBinaryExpression(stack[i - 1].value, stack[i - 2], expr);
            i -= 2;
        }

        return expr;
    }


    // 11.12 Conditional Operator

    function parseConditionalExpression() {
        var expr, consequent, alternate;

        expr = parseBinaryExpression();

        if (match('?')) {
            lex();
            consequent = parseConditionalExpression();
            expect(':');
            alternate = parseConditionalExpression();

            expr = delegate.createConditionalExpression(expr, consequent, alternate);
        }

        return expr;
    }

    // Simplification since we do not support AssignmentExpression.
    var parseExpression = parseConditionalExpression;

    // Polymer Syntax extensions

    // Filter ::
    //   Identifier
    //   Identifier "(" ")"
    //   Identifier "(" FilterArguments ")"

    function parseFilter() {
        var identifier, args;

        identifier = lex();

        if (identifier.type !== Token.Identifier) {
            throwUnexpected(identifier);
        }

        args = match('(') ? parseArguments() : [];

        return delegate.createFilter(identifier.value, args);
    }

    // Filters ::
    //   "|" Filter
    //   Filters "|" Filter

    function parseFilters() {
        while (match('|')) {
            lex();
            parseFilter();
        }
    }

    // TopLevel ::
    //   LabelledExpressions
    //   AsExpression
    //   InExpression
    //   FilterExpression

    // AsExpression ::
    //   FilterExpression as Identifier

    // InExpression ::
    //   Identifier, Identifier in FilterExpression
    //   Identifier in FilterExpression

    // FilterExpression ::
    //   Expression
    //   Expression Filters

    function parseTopLevel() {
        skipWhitespace();
        peek();

        var expr = parseExpression();
        if (expr) {
            if (lookahead.value === ',' || lookahead.value == 'in' &&
                       expr.type === Syntax.Identifier) {
                parseInExpression(expr);
            } else {
                parseFilters();
                if (lookahead.value === 'as') {
                    parseAsExpression(expr);
                } else {
                    delegate.createTopLevel(expr);
                }
            }
        }

        if (lookahead.type !== Token.EOF) {
            throwUnexpected(lookahead);
        }
    }

    function parseAsExpression(expr) {
        lex();  // as
        var identifier = lex().value;
        delegate.createAsExpression(expr, identifier);
    }

    function parseInExpression(identifier) {
        var indexName;
        if (lookahead.value === ',') {
            lex();
            if (lookahead.type !== Token.Identifier)
                throwUnexpected(lookahead);
            indexName = lex().value;
        }

        lex();  // in
        var expr = parseExpression();
        parseFilters();
        delegate.createInExpression(identifier.name, indexName, expr);
    }

    function parse(code, inDelegate) {
        delegate = inDelegate;
        source = code;
        index = 0;
        length = source.length;
        lookahead = null;
        state = {
            labelSet: {}
        };

        return parseTopLevel();
    }

    global.esprima = {
        parse: parse
    };
})(this);

// Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
// This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
// The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
// The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
// Code distributed by Google as part of the polymer project is also
// subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt

(function (global) {
  'use strict';

  function prepareBinding(expressionText, name, node, filterRegistry) {
    var expression;
    try {
      expression = getExpression(expressionText);
      if (expression.scopeIdent &&
          (node.nodeType !== Node.ELEMENT_NODE ||
           node.tagName !== 'TEMPLATE' ||
           (name !== 'bind' && name !== 'repeat'))) {
        throw Error('as and in can only be used within <template bind/repeat>');
      }
    } catch (ex) {
      console.error('Invalid expression syntax: ' + expressionText, ex);
      return;
    }

    return function(model, node, oneTime) {
      var binding = expression.getBinding(model, filterRegistry, oneTime);
      if (expression.scopeIdent && binding) {
        node.polymerExpressionScopeIdent_ = expression.scopeIdent;
        if (expression.indexIdent)
          node.polymerExpressionIndexIdent_ = expression.indexIdent;
      }

      return binding;
    }
  }

  // TODO(rafaelw): Implement simple LRU.
  var expressionParseCache = Object.create(null);

  function getExpression(expressionText) {
    var expression = expressionParseCache[expressionText];
    if (!expression) {
      var delegate = new ASTDelegate();
      esprima.parse(expressionText, delegate);
      expression = new Expression(delegate);
      expressionParseCache[expressionText] = expression;
    }
    return expression;
  }

  function Literal(value) {
    this.value = value;
    this.valueFn_ = undefined;
  }

  Literal.prototype = {
    valueFn: function() {
      if (!this.valueFn_) {
        var value = this.value;
        this.valueFn_ = function() {
          return value;
        }
      }

      return this.valueFn_;
    }
  }

  function IdentPath(name) {
    this.name = name;
    this.path = Path.get(name);
  }

  IdentPath.prototype = {
    valueFn: function() {
      if (!this.valueFn_) {
        var name = this.name;
        var path = this.path;
        this.valueFn_ = function(model, observer) {
          if (observer)
            observer.addPath(model, path);

          return path.getValueFrom(model);
        }
      }

      return this.valueFn_;
    },

    setValue: function(model, newValue) {
      if (this.path.length == 1)
        model = findScope(model, this.path[0]);

      return this.path.setValueFrom(model, newValue);
    }
  };

  function MemberExpression(object, property, accessor) {
    this.computed = accessor == '[';

    this.dynamicDeps = typeof object == 'function' ||
                       object.dynamicDeps ||
                       (this.computed && !(property instanceof Literal));

    this.simplePath =
        !this.dynamicDeps &&
        (property instanceof IdentPath || property instanceof Literal) &&
        (object instanceof MemberExpression || object instanceof IdentPath);

    this.object = this.simplePath ? object : getFn(object);
    this.property = !this.computed || this.simplePath ?
        property : getFn(property);
  }

  MemberExpression.prototype = {
    get fullPath() {
      if (!this.fullPath_) {

        var parts = this.object instanceof MemberExpression ?
            this.object.fullPath.slice() : [this.object.name];
        parts.push(this.property instanceof IdentPath ?
            this.property.name : this.property.value);
        this.fullPath_ = Path.get(parts);
      }

      return this.fullPath_;
    },

    valueFn: function() {
      if (!this.valueFn_) {
        var object = this.object;

        if (this.simplePath) {
          var path = this.fullPath;

          this.valueFn_ = function(model, observer) {
            if (observer)
              observer.addPath(model, path);

            return path.getValueFrom(model);
          };
        } else if (!this.computed) {
          var path = Path.get(this.property.name);

          this.valueFn_ = function(model, observer, filterRegistry) {
            var context = object(model, observer, filterRegistry);

            if (observer)
              observer.addPath(context, path);

            return path.getValueFrom(context);
          }
        } else {
          // Computed property.
          var property = this.property;

          this.valueFn_ = function(model, observer, filterRegistry) {
            var context = object(model, observer, filterRegistry);
            var propName = property(model, observer, filterRegistry);
            if (observer)
              observer.addPath(context, [propName]);

            return context ? context[propName] : undefined;
          };
        }
      }
      return this.valueFn_;
    },

    setValue: function(model, newValue) {
      if (this.simplePath) {
        this.fullPath.setValueFrom(model, newValue);
        return newValue;
      }

      var object = this.object(model);
      var propName = this.property instanceof IdentPath ? this.property.name :
          this.property(model);
      return object[propName] = newValue;
    }
  };

  function Filter(name, args) {
    this.name = name;
    this.args = [];
    for (var i = 0; i < args.length; i++) {
      this.args[i] = getFn(args[i]);
    }
  }

  Filter.prototype = {
    transform: function(model, observer, filterRegistry, toModelDirection,
                        initialArgs) {
      var fn = filterRegistry[this.name];
      var context = model;
      if (fn) {
        context = undefined;
      } else {
        fn = context[this.name];
        if (!fn) {
          console.error('Cannot find function or filter: ' + this.name);
          return;
        }
      }

      // If toModelDirection is falsey, then the "normal" (dom-bound) direction
      // is used. Otherwise, it looks for a 'toModel' property function on the
      // object.
      if (toModelDirection) {
        fn = fn.toModel;
      } else if (typeof fn.toDOM == 'function') {
        fn = fn.toDOM;
      }

      if (typeof fn != 'function') {
        console.error('Cannot find function or filter: ' + this.name);
        return;
      }

      var args = initialArgs || [];
      for (var i = 0; i < this.args.length; i++) {
        args.push(getFn(this.args[i])(model, observer, filterRegistry));
      }

      return fn.apply(context, args);
    }
  };

  function notImplemented() { throw Error('Not Implemented'); }

  var unaryOperators = {
    '+': function(v) { return +v; },
    '-': function(v) { return -v; },
    '!': function(v) { return !v; }
  };

  var binaryOperators = {
    '+': function(l, r) { return l+r; },
    '-': function(l, r) { return l-r; },
    '*': function(l, r) { return l*r; },
    '/': function(l, r) { return l/r; },
    '%': function(l, r) { return l%r; },
    '<': function(l, r) { return l<r; },
    '>': function(l, r) { return l>r; },
    '<=': function(l, r) { return l<=r; },
    '>=': function(l, r) { return l>=r; },
    '==': function(l, r) { return l==r; },
    '!=': function(l, r) { return l!=r; },
    '===': function(l, r) { return l===r; },
    '!==': function(l, r) { return l!==r; },
    '&&': function(l, r) { return l&&r; },
    '||': function(l, r) { return l||r; },
  };

  function getFn(arg) {
    return typeof arg == 'function' ? arg : arg.valueFn();
  }

  function ASTDelegate() {
    this.expression = null;
    this.filters = [];
    this.deps = {};
    this.currentPath = undefined;
    this.scopeIdent = undefined;
    this.indexIdent = undefined;
    this.dynamicDeps = false;
  }

  ASTDelegate.prototype = {
    createUnaryExpression: function(op, argument) {
      if (!unaryOperators[op])
        throw Error('Disallowed operator: ' + op);

      argument = getFn(argument);

      return function(model, observer, filterRegistry) {
        return unaryOperators[op](argument(model, observer, filterRegistry));
      };
    },

    createBinaryExpression: function(op, left, right) {
      if (!binaryOperators[op])
        throw Error('Disallowed operator: ' + op);

      left = getFn(left);
      right = getFn(right);

      switch (op) {
        case '||':
          this.dynamicDeps = true;
          return function(model, observer, filterRegistry) {
            return left(model, observer, filterRegistry) ||
                right(model, observer, filterRegistry);
          };
        case '&&':
          this.dynamicDeps = true;
          return function(model, observer, filterRegistry) {
            return left(model, observer, filterRegistry) &&
                right(model, observer, filterRegistry);
          };
      }

      return function(model, observer, filterRegistry) {
        return binaryOperators[op](left(model, observer, filterRegistry),
                                   right(model, observer, filterRegistry));
      };
    },

    createConditionalExpression: function(test, consequent, alternate) {
      test = getFn(test);
      consequent = getFn(consequent);
      alternate = getFn(alternate);

      this.dynamicDeps = true;

      return function(model, observer, filterRegistry) {
        return test(model, observer, filterRegistry) ?
            consequent(model, observer, filterRegistry) :
            alternate(model, observer, filterRegistry);
      }
    },

    createIdentifier: function(name) {
      var ident = new IdentPath(name);
      ident.type = 'Identifier';
      return ident;
    },

    createMemberExpression: function(accessor, object, property) {
      var ex = new MemberExpression(object, property, accessor);
      if (ex.dynamicDeps)
        this.dynamicDeps = true;
      return ex;
    },

    createCallExpression: function(expression, args) {
      if (!(expression instanceof IdentPath))
        throw Error('Only identifier function invocations are allowed');

      var filter = new Filter(expression.name, args);

      return function(model, observer, filterRegistry) {
        return filter.transform(model, observer, filterRegistry, false);
      };
    },

    createLiteral: function(token) {
      return new Literal(token.value);
    },

    createArrayExpression: function(elements) {
      for (var i = 0; i < elements.length; i++)
        elements[i] = getFn(elements[i]);

      return function(model, observer, filterRegistry) {
        var arr = []
        for (var i = 0; i < elements.length; i++)
          arr.push(elements[i](model, observer, filterRegistry));
        return arr;
      }
    },

    createProperty: function(kind, key, value) {
      return {
        key: key instanceof IdentPath ? key.name : key.value,
        value: value
      };
    },

    createObjectExpression: function(properties) {
      for (var i = 0; i < properties.length; i++)
        properties[i].value = getFn(properties[i].value);

      return function(model, observer, filterRegistry) {
        var obj = {};
        for (var i = 0; i < properties.length; i++)
          obj[properties[i].key] =
              properties[i].value(model, observer, filterRegistry);
        return obj;
      }
    },

    createFilter: function(name, args) {
      this.filters.push(new Filter(name, args));
    },

    createAsExpression: function(expression, scopeIdent) {
      this.expression = expression;
      this.scopeIdent = scopeIdent;
    },

    createInExpression: function(scopeIdent, indexIdent, expression) {
      this.expression = expression;
      this.scopeIdent = scopeIdent;
      this.indexIdent = indexIdent;
    },

    createTopLevel: function(expression) {
      this.expression = expression;
    },

    createThisExpression: notImplemented
  }

  function ConstantObservable(value) {
    this.value_ = value;
  }

  ConstantObservable.prototype = {
    open: function() { return this.value_; },
    discardChanges: function() { return this.value_; },
    deliver: function() {},
    close: function() {},
  }

  function Expression(delegate) {
    this.scopeIdent = delegate.scopeIdent;
    this.indexIdent = delegate.indexIdent;

    if (!delegate.expression)
      throw Error('No expression found.');

    this.expression = delegate.expression;
    getFn(this.expression); // forces enumeration of path dependencies

    this.filters = delegate.filters;
    this.dynamicDeps = delegate.dynamicDeps;
  }

  Expression.prototype = {
    getBinding: function(model, filterRegistry, oneTime) {
      if (oneTime)
        return this.getValue(model, undefined, filterRegistry);

      var observer = new CompoundObserver();
      // captures deps.
      var firstValue = this.getValue(model, observer, filterRegistry);
      var firstTime = true;
      var self = this;

      function valueFn() {
        // deps cannot have changed on first value retrieval.
        if (firstTime) {
          firstTime = false;
          return firstValue;
        }

        if (self.dynamicDeps)
          observer.startReset();

        var value = self.getValue(model,
                                  self.dynamicDeps ? observer : undefined,
                                  filterRegistry);
        if (self.dynamicDeps)
          observer.finishReset();

        return value;
      }

      function setValueFn(newValue) {
        self.setValue(model, newValue, filterRegistry);
        return newValue;
      }

      return new ObserverTransform(observer, valueFn, setValueFn, true);
    },

    getValue: function(model, observer, filterRegistry) {
      var value = getFn(this.expression)(model, observer, filterRegistry);
      for (var i = 0; i < this.filters.length; i++) {
        value = this.filters[i].transform(model, observer, filterRegistry,
            false, [value]);
      }

      return value;
    },

    setValue: function(model, newValue, filterRegistry) {
      var count = this.filters ? this.filters.length : 0;
      while (count-- > 0) {
        newValue = this.filters[count].transform(model, undefined,
            filterRegistry, true, [newValue]);
      }

      if (this.expression.setValue)
        return this.expression.setValue(model, newValue);
    }
  }

  /**
   * Converts a style property name to a css property name. For example:
   * "WebkitUserSelect" to "-webkit-user-select"
   */
  function convertStylePropertyName(name) {
    return String(name).replace(/[A-Z]/g, function(c) {
      return '-' + c.toLowerCase();
    });
  }

  var parentScopeName = '@' + Math.random().toString(36).slice(2);

  // Single ident paths must bind directly to the appropriate scope object.
  // I.e. Pushed values in two-bindings need to be assigned to the actual model
  // object.
  function findScope(model, prop) {
    while (model[parentScopeName] &&
           !Object.prototype.hasOwnProperty.call(model, prop)) {
      model = model[parentScopeName];
    }

    return model;
  }

  function isLiteralExpression(pathString) {
    switch (pathString) {
      case '':
        return false;

      case 'false':
      case 'null':
      case 'true':
        return true;
    }

    if (!isNaN(Number(pathString)))
      return true;

    return false;
  };

  function PolymerExpressions() {}

  PolymerExpressions.prototype = {
    // "built-in" filters
    styleObject: function(value) {
      var parts = [];
      for (var key in value) {
        parts.push(convertStylePropertyName(key) + ': ' + value[key]);
      }
      return parts.join('; ');
    },

    tokenList: function(value) {
      var tokens = [];
      for (var key in value) {
        if (value[key])
          tokens.push(key);
      }
      return tokens.join(' ');
    },

    // binding delegate API
    prepareInstancePositionChanged: function(template) {
      var indexIdent = template.polymerExpressionIndexIdent_;
      if (!indexIdent)
        return;

      return function(templateInstance, index) {
        templateInstance.model[indexIdent] = index;
      };
    },

    prepareBinding: function(pathString, name, node) {
      var path = Path.get(pathString);

      if (!isLiteralExpression(pathString) && path.valid) {
        if (path.length == 1) {
          return function(model, node, oneTime) {
            if (oneTime)
              return path.getValueFrom(model);

            var scope = findScope(model, path[0]);
            return new PathObserver(scope, path);
          };
        }
        return; // bail out early if pathString is simple path.
      }

      return prepareBinding(pathString, name, node, this);
    },

    prepareInstanceModel: function(template) {
      var scopeName = template.polymerExpressionScopeIdent_;
      if (!scopeName)
        return;

      var parentScope = template.templateInstance ?
          template.templateInstance.model :
          template.model;

      var indexName = template.polymerExpressionIndexIdent_;

      return function(model) {
        return createScopeObject(parentScope, model, scopeName, indexName);
      };
    }
  };

  var createScopeObject = ('__proto__' in {}) ?
    function(parentScope, model, scopeName, indexName) {
      var scope = {};
      scope[scopeName] = model;
      scope[indexName] = undefined;
      scope[parentScopeName] = parentScope;
      scope.__proto__ = parentScope;
      return scope;
    } :
    function(parentScope, model, scopeName, indexName) {
      var scope = Object.create(parentScope);
      Object.defineProperty(scope, scopeName,
          { value: model, configurable: true, writable: true });
      Object.defineProperty(scope, indexName,
          { value: undefined, configurable: true, writable: true });
      Object.defineProperty(scope, parentScopeName,
          { value: parentScope, configurable: true, writable: true });
      return scope;
    };

  global.PolymerExpressions = PolymerExpressions;
  PolymerExpressions.getExpression = getExpression;
})(this);

Polymer = {
  version: '0.5.4'
};

// TODO(sorvell): this ensures Polymer is an object and not a function
// Platform is currently defining it as a function to allow for async loading
// of polymer; once we refine the loading process this likely goes away.
if (typeof window.Polymer === 'function') {
  Polymer = {};
}


(function(scope) {

  function withDependencies(task, depends) {
    depends = depends || [];
    if (!depends.map) {
      depends = [depends];
    }
    return task.apply(this, depends.map(marshal));
  }

  function module(name, dependsOrFactory, moduleFactory) {
    var module;
    switch (arguments.length) {
      case 0:
        return;
      case 1:
        module = null;
        break;
      case 2:
        // dependsOrFactory is `factory` in this case
        module = dependsOrFactory.apply(this);
        break;
      default:
        // dependsOrFactory is `depends` in this case
        module = withDependencies(moduleFactory, dependsOrFactory);
        break;
    }
    modules[name] = module;
  };

  function marshal(name) {
    return modules[name];
  }

  var modules = {};

  function using(depends, task) {
    HTMLImports.whenImportsReady(function() {
      withDependencies(task, depends);
    });
  };

  // exports

  scope.marshal = marshal;
  // `module` confuses commonjs detectors
  scope.modularize = module;
  scope.using = using;

})(window);

/*
	Build only script.

  Ensures scripts needed for basic x-platform compatibility
  will be run when platform.js is not loaded.
 */
if (!window.WebComponents) {

/*
	On supported platforms, platform.js is not needed. To retain compatibility
	with the polyfills, we stub out minimal functionality.
 */
if (!window.WebComponents) {

  WebComponents = {
  	flush: function() {},
    flags: {log: {}}
  };

  Platform = WebComponents;

  CustomElements = {
  	useNative: true,
    ready: true,
    takeRecords: function() {},
    instanceof: function(obj, base) {
      return obj instanceof base;
    }
  };
  
  HTMLImports = {
  	useNative: true
  };

  
  addEventListener('HTMLImportsLoaded', function() {
    document.dispatchEvent(
      new CustomEvent('WebComponentsReady', {bubbles: true})
    );
  });


  // ShadowDOM
  ShadowDOMPolyfill = null;
  wrap = unwrap = function(n){
    return n;
  };

}

/*
  Create polyfill scope and feature detect native support.
*/
window.HTMLImports = window.HTMLImports || {flags:{}};

(function(scope) {

/**
  Basic setup and simple module executer. We collect modules and then execute
  the code later, only if it's necessary for polyfilling.
*/
var IMPORT_LINK_TYPE = 'import';
var useNative = Boolean(IMPORT_LINK_TYPE in document.createElement('link'));

/**
  Support `currentScript` on all browsers as `document._currentScript.`

  NOTE: We cannot polyfill `document.currentScript` because it's not possible
  both to override and maintain the ability to capture the native value.
  Therefore we choose to expose `_currentScript` both when native imports
  and the polyfill are in use.
*/
// NOTE: ShadowDOMPolyfill intrusion.
var hasShadowDOMPolyfill = Boolean(window.ShadowDOMPolyfill);
var wrap = function(node) {
  return hasShadowDOMPolyfill ? ShadowDOMPolyfill.wrapIfNeeded(node) : node;
};
var rootDocument = wrap(document);

var currentScriptDescriptor = {
  get: function() {
    var script = HTMLImports.currentScript || document.currentScript ||
        // NOTE: only works when called in synchronously executing code.
        // readyState should check if `loading` but IE10 is
        // interactive when scripts run so we cheat.
        (document.readyState !== 'complete' ?
        document.scripts[document.scripts.length - 1] : null);
    return wrap(script);
  },
  configurable: true
};

Object.defineProperty(document, '_currentScript', currentScriptDescriptor);
Object.defineProperty(rootDocument, '_currentScript', currentScriptDescriptor);

/**
  Add support for the `HTMLImportsLoaded` event and the `HTMLImports.whenReady`
  method. This api is necessary because unlike the native implementation,
  script elements do not force imports to resolve. Instead, users should wrap
  code in either an `HTMLImportsLoaded` hander or after load time in an
  `HTMLImports.whenReady(callback)` call.

  NOTE: This module also supports these apis under the native implementation.
  Therefore, if this file is loaded, the same code can be used under both
  the polyfill and native implementation.
 */

var isIE = /Trident/.test(navigator.userAgent);

// call a callback when all HTMLImports in the document at call time
// (or at least document ready) have loaded.
// 1. ensure the document is in a ready state (has dom), then
// 2. watch for loading of imports and call callback when done
function whenReady(callback, doc) {
  doc = doc || rootDocument;
  // if document is loading, wait and try again
  whenDocumentReady(function() {
    watchImportsLoad(callback, doc);
  }, doc);
}

// call the callback when the document is in a ready state (has dom)
var requiredReadyState = isIE ? 'complete' : 'interactive';
var READY_EVENT = 'readystatechange';
function isDocumentReady(doc) {
  return (doc.readyState === 'complete' ||
      doc.readyState === requiredReadyState);
}

// call <callback> when we ensure the document is in a ready state
function whenDocumentReady(callback, doc) {
  if (!isDocumentReady(doc)) {
    var checkReady = function() {
      if (doc.readyState === 'complete' ||
          doc.readyState === requiredReadyState) {
        doc.removeEventListener(READY_EVENT, checkReady);
        whenDocumentReady(callback, doc);
      }
    };
    doc.addEventListener(READY_EVENT, checkReady);
  } else if (callback) {
    callback();
  }
}

function markTargetLoaded(event) {
  event.target.__loaded = true;
}

// call <callback> when we ensure all imports have loaded
function watchImportsLoad(callback, doc) {
  var imports = doc.querySelectorAll('link[rel=import]');
  var loaded = 0, l = imports.length;
  function checkDone(d) {
    if ((loaded == l) && callback) {
       callback();
    }
  }
  function loadedImport(e) {
    markTargetLoaded(e);
    loaded++;
    checkDone();
  }
  if (l) {
    for (var i=0, imp; (i<l) && (imp=imports[i]); i++) {
      if (isImportLoaded(imp)) {
        loadedImport.call(imp, {target: imp});
      } else {
        imp.addEventListener('load', loadedImport);
        imp.addEventListener('error', loadedImport);
      }
    }
  } else {
    checkDone();
  }
}

// NOTE: test for native imports loading is based on explicitly watching
// all imports (see below).
// However, we cannot rely on this entirely without watching the entire document
// for import links. For perf reasons, currently only head is watched.
// Instead, we fallback to checking if the import property is available
// and the document is not itself loading.
function isImportLoaded(link) {
  return useNative ? link.__loaded ||
      (link.import && link.import.readyState !== 'loading') :
      link.__importParsed;
}

// TODO(sorvell): Workaround for
// https://www.w3.org/Bugs/Public/show_bug.cgi?id=25007, should be removed when
// this bug is addressed.
// (1) Install a mutation observer to see when HTMLImports have loaded
// (2) if this script is run during document load it will watch any existing
// imports for loading.
//
// NOTE: The workaround has restricted functionality: (1) it's only compatible
// with imports that are added to document.head since the mutation observer
// watches only head for perf reasons, (2) it requires this script
// to run before any imports have completed loading.
if (useNative) {
  new MutationObserver(function(mxns) {
    for (var i=0, l=mxns.length, m; (i < l) && (m=mxns[i]); i++) {
      if (m.addedNodes) {
        handleImports(m.addedNodes);
      }
    }
  }).observe(document.head, {childList: true});

  function handleImports(nodes) {
    for (var i=0, l=nodes.length, n; (i<l) && (n=nodes[i]); i++) {
      if (isImport(n)) {
        handleImport(n);
      }
    }
  }

  function isImport(element) {
    return element.localName === 'link' && element.rel === 'import';
  }

  function handleImport(element) {
    var loaded = element.import;
    if (loaded) {
      markTargetLoaded({target: element});
    } else {
      element.addEventListener('load', markTargetLoaded);
      element.addEventListener('error', markTargetLoaded);
    }
  }

  // make sure to catch any imports that are in the process of loading
  // when this script is run.
  (function() {
    if (document.readyState === 'loading') {
      var imports = document.querySelectorAll('link[rel=import]');
      for (var i=0, l=imports.length, imp; (i<l) && (imp=imports[i]); i++) {
        handleImport(imp);
      }
    }
  })();

}

// Fire the 'HTMLImportsLoaded' event when imports in document at load time
// have loaded. This event is required to simulate the script blocking
// behavior of native imports. A main document script that needs to be sure
// imports have loaded should wait for this event.
whenReady(function() {
  HTMLImports.ready = true;
  HTMLImports.readyTime = new Date().getTime();
  rootDocument.dispatchEvent(
    new CustomEvent('HTMLImportsLoaded', {bubbles: true})
  );
});

// exports
scope.IMPORT_LINK_TYPE = IMPORT_LINK_TYPE;
scope.useNative = useNative;
scope.rootDocument = rootDocument;
scope.whenReady = whenReady;
scope.isIE = isIE;

})(HTMLImports);

(function(scope) {

  // TODO(sorvell): It's desireable to provide a default stylesheet 
  // that's convenient for styling unresolved elements, but
  // it's cumbersome to have to include this manually in every page.
  // It would make sense to put inside some HTMLImport but 
  // the HTMLImports polyfill does not allow loading of stylesheets 
  // that block rendering. Therefore this injection is tolerated here.
  var style = document.createElement('style');
  style.textContent = ''
      + 'body {'
      + 'transition: opacity ease-in 0.2s;' 
      + ' } \n'
      + 'body[unresolved] {'
      + 'opacity: 0; display: block; overflow: hidden;' 
      + ' } \n'
      ;
  var head = document.querySelector('head');
  head.insertBefore(style, head.firstChild);

})(Platform);

/*
	Build only script.

  Ensures scripts needed for basic x-platform compatibility
  will be run when platform.js is not loaded.
 */
}
(function(global) {
  'use strict';

  var testingExposeCycleCount = global.testingExposeCycleCount;

  // Detect and do basic sanity checking on Object/Array.observe.
  function detectObjectObserve() {
    if (typeof Object.observe !== 'function' ||
        typeof Array.observe !== 'function') {
      return false;
    }

    var records = [];

    function callback(recs) {
      records = recs;
    }

    var test = {};
    var arr = [];
    Object.observe(test, callback);
    Array.observe(arr, callback);
    test.id = 1;
    test.id = 2;
    delete test.id;
    arr.push(1, 2);
    arr.length = 0;

    Object.deliverChangeRecords(callback);
    if (records.length !== 5)
      return false;

    if (records[0].type != 'add' ||
        records[1].type != 'update' ||
        records[2].type != 'delete' ||
        records[3].type != 'splice' ||
        records[4].type != 'splice') {
      return false;
    }

    Object.unobserve(test, callback);
    Array.unobserve(arr, callback);

    return true;
  }

  var hasObserve = detectObjectObserve();

  function detectEval() {
    // Don't test for eval if we're running in a Chrome App environment.
    // We check for APIs set that only exist in a Chrome App context.
    if (typeof chrome !== 'undefined' && chrome.app && chrome.app.runtime) {
      return false;
    }

    // Firefox OS Apps do not allow eval. This feature detection is very hacky
    // but even if some other platform adds support for this function this code
    // will continue to work.
    if (typeof navigator != 'undefined' && navigator.getDeviceStorage) {
      return false;
    }

    try {
      var f = new Function('', 'return true;');
      return f();
    } catch (ex) {
      return false;
    }
  }

  var hasEval = detectEval();

  function isIndex(s) {
    return +s === s >>> 0 && s !== '';
  }

  function toNumber(s) {
    return +s;
  }

  function isObject(obj) {
    return obj === Object(obj);
  }

  var numberIsNaN = global.Number.isNaN || function(value) {
    return typeof value === 'number' && global.isNaN(value);
  }

  function areSameValue(left, right) {
    if (left === right)
      return left !== 0 || 1 / left === 1 / right;
    if (numberIsNaN(left) && numberIsNaN(right))
      return true;

    return left !== left && right !== right;
  }

  var createObject = ('__proto__' in {}) ?
    function(obj) { return obj; } :
    function(obj) {
      var proto = obj.__proto__;
      if (!proto)
        return obj;
      var newObject = Object.create(proto);
      Object.getOwnPropertyNames(obj).forEach(function(name) {
        Object.defineProperty(newObject, name,
                             Object.getOwnPropertyDescriptor(obj, name));
      });
      return newObject;
    };

  var identStart = '[\$_a-zA-Z]';
  var identPart = '[\$_a-zA-Z0-9]';
  var identRegExp = new RegExp('^' + identStart + '+' + identPart + '*' + '$');

  function getPathCharType(char) {
    if (char === undefined)
      return 'eof';

    var code = char.charCodeAt(0);

    switch(code) {
      case 0x5B: // [
      case 0x5D: // ]
      case 0x2E: // .
      case 0x22: // "
      case 0x27: // '
      case 0x30: // 0
        return char;

      case 0x5F: // _
      case 0x24: // $
        return 'ident';

      case 0x20: // Space
      case 0x09: // Tab
      case 0x0A: // Newline
      case 0x0D: // Return
      case 0xA0:  // No-break space
      case 0xFEFF:  // Byte Order Mark
      case 0x2028:  // Line Separator
      case 0x2029:  // Paragraph Separator
        return 'ws';
    }

    // a-z, A-Z
    if ((0x61 <= code && code <= 0x7A) || (0x41 <= code && code <= 0x5A))
      return 'ident';

    // 1-9
    if (0x31 <= code && code <= 0x39)
      return 'number';

    return 'else';
  }

  var pathStateMachine = {
    'beforePath': {
      'ws': ['beforePath'],
      'ident': ['inIdent', 'append'],
      '[': ['beforeElement'],
      'eof': ['afterPath']
    },

    'inPath': {
      'ws': ['inPath'],
      '.': ['beforeIdent'],
      '[': ['beforeElement'],
      'eof': ['afterPath']
    },

    'beforeIdent': {
      'ws': ['beforeIdent'],
      'ident': ['inIdent', 'append']
    },

    'inIdent': {
      'ident': ['inIdent', 'append'],
      '0': ['inIdent', 'append'],
      'number': ['inIdent', 'append'],
      'ws': ['inPath', 'push'],
      '.': ['beforeIdent', 'push'],
      '[': ['beforeElement', 'push'],
      'eof': ['afterPath', 'push']
    },

    'beforeElement': {
      'ws': ['beforeElement'],
      '0': ['afterZero', 'append'],
      'number': ['inIndex', 'append'],
      "'": ['inSingleQuote', 'append', ''],
      '"': ['inDoubleQuote', 'append', '']
    },

    'afterZero': {
      'ws': ['afterElement', 'push'],
      ']': ['inPath', 'push']
    },

    'inIndex': {
      '0': ['inIndex', 'append'],
      'number': ['inIndex', 'append'],
      'ws': ['afterElement'],
      ']': ['inPath', 'push']
    },

    'inSingleQuote': {
      "'": ['afterElement'],
      'eof': ['error'],
      'else': ['inSingleQuote', 'append']
    },

    'inDoubleQuote': {
      '"': ['afterElement'],
      'eof': ['error'],
      'else': ['inDoubleQuote', 'append']
    },

    'afterElement': {
      'ws': ['afterElement'],
      ']': ['inPath', 'push']
    }
  }

  function noop() {}

  function parsePath(path) {
    var keys = [];
    var index = -1;
    var c, newChar, key, type, transition, action, typeMap, mode = 'beforePath';

    var actions = {
      push: function() {
        if (key === undefined)
          return;

        keys.push(key);
        key = undefined;
      },

      append: function() {
        if (key === undefined)
          key = newChar
        else
          key += newChar;
      }
    };

    function maybeUnescapeQuote() {
      if (index >= path.length)
        return;

      var nextChar = path[index + 1];
      if ((mode == 'inSingleQuote' && nextChar == "'") ||
          (mode == 'inDoubleQuote' && nextChar == '"')) {
        index++;
        newChar = nextChar;
        actions.append();
        return true;
      }
    }

    while (mode) {
      index++;
      c = path[index];

      if (c == '\\' && maybeUnescapeQuote(mode))
        continue;

      type = getPathCharType(c);
      typeMap = pathStateMachine[mode];
      transition = typeMap[type] || typeMap['else'] || 'error';

      if (transition == 'error')
        return; // parse error;

      mode = transition[0];
      action = actions[transition[1]] || noop;
      newChar = transition[2] === undefined ? c : transition[2];
      action();

      if (mode === 'afterPath') {
        return keys;
      }
    }

    return; // parse error
  }

  function isIdent(s) {
    return identRegExp.test(s);
  }

  var constructorIsPrivate = {};

  function Path(parts, privateToken) {
    if (privateToken !== constructorIsPrivate)
      throw Error('Use Path.get to retrieve path objects');

    for (var i = 0; i < parts.length; i++) {
      this.push(String(parts[i]));
    }

    if (hasEval && this.length) {
      this.getValueFrom = this.compiledGetValueFromFn();
    }
  }

  // TODO(rafaelw): Make simple LRU cache
  var pathCache = {};

  function getPath(pathString) {
    if (pathString instanceof Path)
      return pathString;

    if (pathString == null || pathString.length == 0)
      pathString = '';

    if (typeof pathString != 'string') {
      if (isIndex(pathString.length)) {
        // Constructed with array-like (pre-parsed) keys
        return new Path(pathString, constructorIsPrivate);
      }

      pathString = String(pathString);
    }

    var path = pathCache[pathString];
    if (path)
      return path;

    var parts = parsePath(pathString);
    if (!parts)
      return invalidPath;

    var path = new Path(parts, constructorIsPrivate);
    pathCache[pathString] = path;
    return path;
  }

  Path.get = getPath;

  function formatAccessor(key) {
    if (isIndex(key)) {
      return '[' + key + ']';
    } else {
      return '["' + key.replace(/"/g, '\\"') + '"]';
    }
  }

  Path.prototype = createObject({
    __proto__: [],
    valid: true,

    toString: function() {
      var pathString = '';
      for (var i = 0; i < this.length; i++) {
        var key = this[i];
        if (isIdent(key)) {
          pathString += i ? '.' + key : key;
        } else {
          pathString += formatAccessor(key);
        }
      }

      return pathString;
    },

    getValueFrom: function(obj, directObserver) {
      for (var i = 0; i < this.length; i++) {
        if (obj == null)
          return;
        obj = obj[this[i]];
      }
      return obj;
    },

    iterateObjects: function(obj, observe) {
      for (var i = 0; i < this.length; i++) {
        if (i)
          obj = obj[this[i - 1]];
        if (!isObject(obj))
          return;
        observe(obj, this[i]);
      }
    },

    compiledGetValueFromFn: function() {
      var str = '';
      var pathString = 'obj';
      str += 'if (obj != null';
      var i = 0;
      var key;
      for (; i < (this.length - 1); i++) {
        key = this[i];
        pathString += isIdent(key) ? '.' + key : formatAccessor(key);
        str += ' &&\n     ' + pathString + ' != null';
      }
      str += ')\n';

      var key = this[i];
      pathString += isIdent(key) ? '.' + key : formatAccessor(key);

      str += '  return ' + pathString + ';\nelse\n  return undefined;';
      return new Function('obj', str);
    },

    setValueFrom: function(obj, value) {
      if (!this.length)
        return false;

      for (var i = 0; i < this.length - 1; i++) {
        if (!isObject(obj))
          return false;
        obj = obj[this[i]];
      }

      if (!isObject(obj))
        return false;

      obj[this[i]] = value;
      return true;
    }
  });

  var invalidPath = new Path('', constructorIsPrivate);
  invalidPath.valid = false;
  invalidPath.getValueFrom = invalidPath.setValueFrom = function() {};

  var MAX_DIRTY_CHECK_CYCLES = 1000;

  function dirtyCheck(observer) {
    var cycles = 0;
    while (cycles < MAX_DIRTY_CHECK_CYCLES && observer.check_()) {
      cycles++;
    }
    if (testingExposeCycleCount)
      global.dirtyCheckCycleCount = cycles;

    return cycles > 0;
  }

  function objectIsEmpty(object) {
    for (var prop in object)
      return false;
    return true;
  }

  function diffIsEmpty(diff) {
    return objectIsEmpty(diff.added) &&
           objectIsEmpty(diff.removed) &&
           objectIsEmpty(diff.changed);
  }

  function diffObjectFromOldObject(object, oldObject) {
    var added = {};
    var removed = {};
    var changed = {};

    for (var prop in oldObject) {
      var newValue = object[prop];

      if (newValue !== undefined && newValue === oldObject[prop])
        continue;

      if (!(prop in object)) {
        removed[prop] = undefined;
        continue;
      }

      if (newValue !== oldObject[prop])
        changed[prop] = newValue;
    }

    for (var prop in object) {
      if (prop in oldObject)
        continue;

      added[prop] = object[prop];
    }

    if (Array.isArray(object) && object.length !== oldObject.length)
      changed.length = object.length;

    return {
      added: added,
      removed: removed,
      changed: changed
    };
  }

  var eomTasks = [];
  function runEOMTasks() {
    if (!eomTasks.length)
      return false;

    for (var i = 0; i < eomTasks.length; i++) {
      eomTasks[i]();
    }
    eomTasks.length = 0;
    return true;
  }

  var runEOM = hasObserve ? (function(){
    return function(fn) {
      return Promise.resolve().then(fn);
    }
  })() :
  (function() {
    return function(fn) {
      eomTasks.push(fn);
    };
  })();

  var observedObjectCache = [];

  function newObservedObject() {
    var observer;
    var object;
    var discardRecords = false;
    var first = true;

    function callback(records) {
      if (observer && observer.state_ === OPENED && !discardRecords)
        observer.check_(records);
    }

    return {
      open: function(obs) {
        if (observer)
          throw Error('ObservedObject in use');

        if (!first)
          Object.deliverChangeRecords(callback);

        observer = obs;
        first = false;
      },
      observe: function(obj, arrayObserve) {
        object = obj;
        if (arrayObserve)
          Array.observe(object, callback);
        else
          Object.observe(object, callback);
      },
      deliver: function(discard) {
        discardRecords = discard;
        Object.deliverChangeRecords(callback);
        discardRecords = false;
      },
      close: function() {
        observer = undefined;
        Object.unobserve(object, callback);
        observedObjectCache.push(this);
      }
    };
  }

  /*
   * The observedSet abstraction is a perf optimization which reduces the total
   * number of Object.observe observations of a set of objects. The idea is that
   * groups of Observers will have some object dependencies in common and this
   * observed set ensures that each object in the transitive closure of
   * dependencies is only observed once. The observedSet acts as a write barrier
   * such that whenever any change comes through, all Observers are checked for
   * changed values.
   *
   * Note that this optimization is explicitly moving work from setup-time to
   * change-time.
   *
   * TODO(rafaelw): Implement "garbage collection". In order to move work off
   * the critical path, when Observers are closed, their observed objects are
   * not Object.unobserve(d). As a result, it's possible that if the observedSet
   * is kept open, but some Observers have been closed, it could cause "leaks"
   * (prevent otherwise collectable objects from being collected). At some
   * point, we should implement incremental "gc" which keeps a list of
   * observedSets which may need clean-up and does small amounts of cleanup on a
   * timeout until all is clean.
   */

  function getObservedObject(observer, object, arrayObserve) {
    var dir = observedObjectCache.pop() || newObservedObject();
    dir.open(observer);
    dir.observe(object, arrayObserve);
    return dir;
  }

  var observedSetCache = [];

  function newObservedSet() {
    var observerCount = 0;
    var observers = [];
    var objects = [];
    var rootObj;
    var rootObjProps;

    function observe(obj, prop) {
      if (!obj)
        return;

      if (obj === rootObj)
        rootObjProps[prop] = true;

      if (objects.indexOf(obj) < 0) {
        objects.push(obj);
        Object.observe(obj, callback);
      }

      observe(Object.getPrototypeOf(obj), prop);
    }

    function allRootObjNonObservedProps(recs) {
      for (var i = 0; i < recs.length; i++) {
        var rec = recs[i];
        if (rec.object !== rootObj ||
            rootObjProps[rec.name] ||
            rec.type === 'setPrototype') {
          return false;
        }
      }
      return true;
    }

    function callback(recs) {
      if (allRootObjNonObservedProps(recs))
        return;

      var observer;
      for (var i = 0; i < observers.length; i++) {
        observer = observers[i];
        if (observer.state_ == OPENED) {
          observer.iterateObjects_(observe);
        }
      }

      for (var i = 0; i < observers.length; i++) {
        observer = observers[i];
        if (observer.state_ == OPENED) {
          observer.check_();
        }
      }
    }

    var record = {
      objects: objects,
      get rootObject() { return rootObj; },
      set rootObject(value) {
        rootObj = value;
        rootObjProps = {};
      },
      open: function(obs, object) {
        observers.push(obs);
        observerCount++;
        obs.iterateObjects_(observe);
      },
      close: function(obs) {
        observerCount--;
        if (observerCount > 0) {
          return;
        }

        for (var i = 0; i < objects.length; i++) {
          Object.unobserve(objects[i], callback);
          Observer.unobservedCount++;
        }

        observers.length = 0;
        objects.length = 0;
        rootObj = undefined;
        rootObjProps = undefined;
        observedSetCache.push(this);
        if (lastObservedSet === this)
          lastObservedSet = null;
      },
    };

    return record;
  }

  var lastObservedSet;

  function getObservedSet(observer, obj) {
    if (!lastObservedSet || lastObservedSet.rootObject !== obj) {
      lastObservedSet = observedSetCache.pop() || newObservedSet();
      lastObservedSet.rootObject = obj;
    }
    lastObservedSet.open(observer, obj);
    return lastObservedSet;
  }

  var UNOPENED = 0;
  var OPENED = 1;
  var CLOSED = 2;
  var RESETTING = 3;

  var nextObserverId = 1;

  function Observer() {
    this.state_ = UNOPENED;
    this.callback_ = undefined;
    this.target_ = undefined; // TODO(rafaelw): Should be WeakRef
    this.directObserver_ = undefined;
    this.value_ = undefined;
    this.id_ = nextObserverId++;
  }

  Observer.prototype = {
    open: function(callback, target) {
      if (this.state_ != UNOPENED)
        throw Error('Observer has already been opened.');

      addToAll(this);
      this.callback_ = callback;
      this.target_ = target;
      this.connect_();
      this.state_ = OPENED;
      return this.value_;
    },

    close: function() {
      if (this.state_ != OPENED)
        return;

      removeFromAll(this);
      this.disconnect_();
      this.value_ = undefined;
      this.callback_ = undefined;
      this.target_ = undefined;
      this.state_ = CLOSED;
    },

    deliver: function() {
      if (this.state_ != OPENED)
        return;

      dirtyCheck(this);
    },

    report_: function(changes) {
      try {
        this.callback_.apply(this.target_, changes);
      } catch (ex) {
        Observer._errorThrownDuringCallback = true;
        console.error('Exception caught during observer callback: ' +
                       (ex.stack || ex));
      }
    },

    discardChanges: function() {
      this.check_(undefined, true);
      return this.value_;
    }
  }

  var collectObservers = !hasObserve;
  var allObservers;
  Observer._allObserversCount = 0;

  if (collectObservers) {
    allObservers = [];
  }

  function addToAll(observer) {
    Observer._allObserversCount++;
    if (!collectObservers)
      return;

    allObservers.push(observer);
  }

  function removeFromAll(observer) {
    Observer._allObserversCount--;
  }

  var runningMicrotaskCheckpoint = false;

  global.Platform = global.Platform || {};

  global.Platform.performMicrotaskCheckpoint = function() {
    if (runningMicrotaskCheckpoint)
      return;

    if (!collectObservers)
      return;

    runningMicrotaskCheckpoint = true;

    var cycles = 0;
    var anyChanged, toCheck;

    do {
      cycles++;
      toCheck = allObservers;
      allObservers = [];
      anyChanged = false;

      for (var i = 0; i < toCheck.length; i++) {
        var observer = toCheck[i];
        if (observer.state_ != OPENED)
          continue;

        if (observer.check_())
          anyChanged = true;

        allObservers.push(observer);
      }
      if (runEOMTasks())
        anyChanged = true;
    } while (cycles < MAX_DIRTY_CHECK_CYCLES && anyChanged);

    if (testingExposeCycleCount)
      global.dirtyCheckCycleCount = cycles;

    runningMicrotaskCheckpoint = false;
  };

  if (collectObservers) {
    global.Platform.clearObservers = function() {
      allObservers = [];
    };
  }

  function ObjectObserver(object) {
    Observer.call(this);
    this.value_ = object;
    this.oldObject_ = undefined;
  }

  ObjectObserver.prototype = createObject({
    __proto__: Observer.prototype,

    arrayObserve: false,

    connect_: function(callback, target) {
      if (hasObserve) {
        this.directObserver_ = getObservedObject(this, this.value_,
                                                 this.arrayObserve);
      } else {
        this.oldObject_ = this.copyObject(this.value_);
      }

    },

    copyObject: function(object) {
      var copy = Array.isArray(object) ? [] : {};
      for (var prop in object) {
        copy[prop] = object[prop];
      };
      if (Array.isArray(object))
        copy.length = object.length;
      return copy;
    },

    check_: function(changeRecords, skipChanges) {
      var diff;
      var oldValues;
      if (hasObserve) {
        if (!changeRecords)
          return false;

        oldValues = {};
        diff = diffObjectFromChangeRecords(this.value_, changeRecords,
                                           oldValues);
      } else {
        oldValues = this.oldObject_;
        diff = diffObjectFromOldObject(this.value_, this.oldObject_);
      }

      if (diffIsEmpty(diff))
        return false;

      if (!hasObserve)
        this.oldObject_ = this.copyObject(this.value_);

      this.report_([
        diff.added || {},
        diff.removed || {},
        diff.changed || {},
        function(property) {
          return oldValues[property];
        }
      ]);

      return true;
    },

    disconnect_: function() {
      if (hasObserve) {
        this.directObserver_.close();
        this.directObserver_ = undefined;
      } else {
        this.oldObject_ = undefined;
      }
    },

    deliver: function() {
      if (this.state_ != OPENED)
        return;

      if (hasObserve)
        this.directObserver_.deliver(false);
      else
        dirtyCheck(this);
    },

    discardChanges: function() {
      if (this.directObserver_)
        this.directObserver_.deliver(true);
      else
        this.oldObject_ = this.copyObject(this.value_);

      return this.value_;
    }
  });

  function ArrayObserver(array) {
    if (!Array.isArray(array))
      throw Error('Provided object is not an Array');
    ObjectObserver.call(this, array);
  }

  ArrayObserver.prototype = createObject({

    __proto__: ObjectObserver.prototype,

    arrayObserve: true,

    copyObject: function(arr) {
      return arr.slice();
    },

    check_: function(changeRecords) {
      var splices;
      if (hasObserve) {
        if (!changeRecords)
          return false;
        splices = projectArraySplices(this.value_, changeRecords);
      } else {
        splices = calcSplices(this.value_, 0, this.value_.length,
                              this.oldObject_, 0, this.oldObject_.length);
      }

      if (!splices || !splices.length)
        return false;

      if (!hasObserve)
        this.oldObject_ = this.copyObject(this.value_);

      this.report_([splices]);
      return true;
    }
  });

  ArrayObserver.applySplices = function(previous, current, splices) {
    splices.forEach(function(splice) {
      var spliceArgs = [splice.index, splice.removed.length];
      var addIndex = splice.index;
      while (addIndex < splice.index + splice.addedCount) {
        spliceArgs.push(current[addIndex]);
        addIndex++;
      }

      Array.prototype.splice.apply(previous, spliceArgs);
    });
  };

  function PathObserver(object, path) {
    Observer.call(this);

    this.object_ = object;
    this.path_ = getPath(path);
    this.directObserver_ = undefined;
  }

  PathObserver.prototype = createObject({
    __proto__: Observer.prototype,

    get path() {
      return this.path_;
    },

    connect_: function() {
      if (hasObserve)
        this.directObserver_ = getObservedSet(this, this.object_);

      this.check_(undefined, true);
    },

    disconnect_: function() {
      this.value_ = undefined;

      if (this.directObserver_) {
        this.directObserver_.close(this);
        this.directObserver_ = undefined;
      }
    },

    iterateObjects_: function(observe) {
      this.path_.iterateObjects(this.object_, observe);
    },

    check_: function(changeRecords, skipChanges) {
      var oldValue = this.value_;
      this.value_ = this.path_.getValueFrom(this.object_);
      if (skipChanges || areSameValue(this.value_, oldValue))
        return false;

      this.report_([this.value_, oldValue, this]);
      return true;
    },

    setValue: function(newValue) {
      if (this.path_)
        this.path_.setValueFrom(this.object_, newValue);
    }
  });

  function CompoundObserver(reportChangesOnOpen) {
    Observer.call(this);

    this.reportChangesOnOpen_ = reportChangesOnOpen;
    this.value_ = [];
    this.directObserver_ = undefined;
    this.observed_ = [];
  }

  var observerSentinel = {};

  CompoundObserver.prototype = createObject({
    __proto__: Observer.prototype,

    connect_: function() {
      if (hasObserve) {
        var object;
        var needsDirectObserver = false;
        for (var i = 0; i < this.observed_.length; i += 2) {
          object = this.observed_[i]
          if (object !== observerSentinel) {
            needsDirectObserver = true;
            break;
          }
        }

        if (needsDirectObserver)
          this.directObserver_ = getObservedSet(this, object);
      }

      this.check_(undefined, !this.reportChangesOnOpen_);
    },

    disconnect_: function() {
      for (var i = 0; i < this.observed_.length; i += 2) {
        if (this.observed_[i] === observerSentinel)
          this.observed_[i + 1].close();
      }
      this.observed_.length = 0;
      this.value_.length = 0;

      if (this.directObserver_) {
        this.directObserver_.close(this);
        this.directObserver_ = undefined;
      }
    },

    addPath: function(object, path) {
      if (this.state_ != UNOPENED && this.state_ != RESETTING)
        throw Error('Cannot add paths once started.');

      var path = getPath(path);
      this.observed_.push(object, path);
      if (!this.reportChangesOnOpen_)
        return;
      var index = this.observed_.length / 2 - 1;
      this.value_[index] = path.getValueFrom(object);
    },

    addObserver: function(observer) {
      if (this.state_ != UNOPENED && this.state_ != RESETTING)
        throw Error('Cannot add observers once started.');

      this.observed_.push(observerSentinel, observer);
      if (!this.reportChangesOnOpen_)
        return;
      var index = this.observed_.length / 2 - 1;
      this.value_[index] = observer.open(this.deliver, this);
    },

    startReset: function() {
      if (this.state_ != OPENED)
        throw Error('Can only reset while open');

      this.state_ = RESETTING;
      this.disconnect_();
    },

    finishReset: function() {
      if (this.state_ != RESETTING)
        throw Error('Can only finishReset after startReset');
      this.state_ = OPENED;
      this.connect_();

      return this.value_;
    },

    iterateObjects_: function(observe) {
      var object;
      for (var i = 0; i < this.observed_.length; i += 2) {
        object = this.observed_[i]
        if (object !== observerSentinel)
          this.observed_[i + 1].iterateObjects(object, observe)
      }
    },

    check_: function(changeRecords, skipChanges) {
      var oldValues;
      for (var i = 0; i < this.observed_.length; i += 2) {
        var object = this.observed_[i];
        var path = this.observed_[i+1];
        var value;
        if (object === observerSentinel) {
          var observable = path;
          value = this.state_ === UNOPENED ?
              observable.open(this.deliver, this) :
              observable.discardChanges();
        } else {
          value = path.getValueFrom(object);
        }

        if (skipChanges) {
          this.value_[i / 2] = value;
          continue;
        }

        if (areSameValue(value, this.value_[i / 2]))
          continue;

        oldValues = oldValues || [];
        oldValues[i / 2] = this.value_[i / 2];
        this.value_[i / 2] = value;
      }

      if (!oldValues)
        return false;

      // TODO(rafaelw): Having observed_ as the third callback arg here is
      // pretty lame API. Fix.
      this.report_([this.value_, oldValues, this.observed_]);
      return true;
    }
  });

  function identFn(value) { return value; }

  function ObserverTransform(observable, getValueFn, setValueFn,
                             dontPassThroughSet) {
    this.callback_ = undefined;
    this.target_ = undefined;
    this.value_ = undefined;
    this.observable_ = observable;
    this.getValueFn_ = getValueFn || identFn;
    this.setValueFn_ = setValueFn || identFn;
    // TODO(rafaelw): This is a temporary hack. PolymerExpressions needs this
    // at the moment because of a bug in it's dependency tracking.
    this.dontPassThroughSet_ = dontPassThroughSet;
  }

  ObserverTransform.prototype = {
    open: function(callback, target) {
      this.callback_ = callback;
      this.target_ = target;
      this.value_ =
          this.getValueFn_(this.observable_.open(this.observedCallback_, this));
      return this.value_;
    },

    observedCallback_: function(value) {
      value = this.getValueFn_(value);
      if (areSameValue(value, this.value_))
        return;
      var oldValue = this.value_;
      this.value_ = value;
      this.callback_.call(this.target_, this.value_, oldValue);
    },

    discardChanges: function() {
      this.value_ = this.getValueFn_(this.observable_.discardChanges());
      return this.value_;
    },

    deliver: function() {
      return this.observable_.deliver();
    },

    setValue: function(value) {
      value = this.setValueFn_(value);
      if (!this.dontPassThroughSet_ && this.observable_.setValue)
        return this.observable_.setValue(value);
    },

    close: function() {
      if (this.observable_)
        this.observable_.close();
      this.callback_ = undefined;
      this.target_ = undefined;
      this.observable_ = undefined;
      this.value_ = undefined;
      this.getValueFn_ = undefined;
      this.setValueFn_ = undefined;
    }
  }

  var expectedRecordTypes = {
    add: true,
    update: true,
    delete: true
  };

  function diffObjectFromChangeRecords(object, changeRecords, oldValues) {
    var added = {};
    var removed = {};

    for (var i = 0; i < changeRecords.length; i++) {
      var record = changeRecords[i];
      if (!expectedRecordTypes[record.type]) {
        console.error('Unknown changeRecord type: ' + record.type);
        console.error(record);
        continue;
      }

      if (!(record.name in oldValues))
        oldValues[record.name] = record.oldValue;

      if (record.type == 'update')
        continue;

      if (record.type == 'add') {
        if (record.name in removed)
          delete removed[record.name];
        else
          added[record.name] = true;

        continue;
      }

      // type = 'delete'
      if (record.name in added) {
        delete added[record.name];
        delete oldValues[record.name];
      } else {
        removed[record.name] = true;
      }
    }

    for (var prop in added)
      added[prop] = object[prop];

    for (var prop in removed)
      removed[prop] = undefined;

    var changed = {};
    for (var prop in oldValues) {
      if (prop in added || prop in removed)
        continue;

      var newValue = object[prop];
      if (oldValues[prop] !== newValue)
        changed[prop] = newValue;
    }

    return {
      added: added,
      removed: removed,
      changed: changed
    };
  }

  function newSplice(index, removed, addedCount) {
    return {
      index: index,
      removed: removed,
      addedCount: addedCount
    };
  }

  var EDIT_LEAVE = 0;
  var EDIT_UPDATE = 1;
  var EDIT_ADD = 2;
  var EDIT_DELETE = 3;

  function ArraySplice() {}

  ArraySplice.prototype = {

    // Note: This function is *based* on the computation of the Levenshtein
    // "edit" distance. The one change is that "updates" are treated as two
    // edits - not one. With Array splices, an update is really a delete
    // followed by an add. By retaining this, we optimize for "keeping" the
    // maximum array items in the original array. For example:
    //
    //   'xxxx123' -> '123yyyy'
    //
    // With 1-edit updates, the shortest path would be just to update all seven
    // characters. With 2-edit updates, we delete 4, leave 3, and add 4. This
    // leaves the substring '123' intact.
    calcEditDistances: function(current, currentStart, currentEnd,
                                old, oldStart, oldEnd) {
      // "Deletion" columns
      var rowCount = oldEnd - oldStart + 1;
      var columnCount = currentEnd - currentStart + 1;
      var distances = new Array(rowCount);

      // "Addition" rows. Initialize null column.
      for (var i = 0; i < rowCount; i++) {
        distances[i] = new Array(columnCount);
        distances[i][0] = i;
      }

      // Initialize null row
      for (var j = 0; j < columnCount; j++)
        distances[0][j] = j;

      for (var i = 1; i < rowCount; i++) {
        for (var j = 1; j < columnCount; j++) {
          if (this.equals(current[currentStart + j - 1], old[oldStart + i - 1]))
            distances[i][j] = distances[i - 1][j - 1];
          else {
            var north = distances[i - 1][j] + 1;
            var west = distances[i][j - 1] + 1;
            distances[i][j] = north < west ? north : west;
          }
        }
      }

      return distances;
    },

    // This starts at the final weight, and walks "backward" by finding
    // the minimum previous weight recursively until the origin of the weight
    // matrix.
    spliceOperationsFromEditDistances: function(distances) {
      var i = distances.length - 1;
      var j = distances[0].length - 1;
      var current = distances[i][j];
      var edits = [];
      while (i > 0 || j > 0) {
        if (i == 0) {
          edits.push(EDIT_ADD);
          j--;
          continue;
        }
        if (j == 0) {
          edits.push(EDIT_DELETE);
          i--;
          continue;
        }
        var northWest = distances[i - 1][j - 1];
        var west = distances[i - 1][j];
        var north = distances[i][j - 1];

        var min;
        if (west < north)
          min = west < northWest ? west : northWest;
        else
          min = north < northWest ? north : northWest;

        if (min == northWest) {
          if (northWest == current) {
            edits.push(EDIT_LEAVE);
          } else {
            edits.push(EDIT_UPDATE);
            current = northWest;
          }
          i--;
          j--;
        } else if (min == west) {
          edits.push(EDIT_DELETE);
          i--;
          current = west;
        } else {
          edits.push(EDIT_ADD);
          j--;
          current = north;
        }
      }

      edits.reverse();
      return edits;
    },

    /**
     * Splice Projection functions:
     *
     * A splice map is a representation of how a previous array of items
     * was transformed into a new array of items. Conceptually it is a list of
     * tuples of
     *
     *   <index, removed, addedCount>
     *
     * which are kept in ascending index order of. The tuple represents that at
     * the |index|, |removed| sequence of items were removed, and counting forward
     * from |index|, |addedCount| items were added.
     */

    /**
     * Lacking individual splice mutation information, the minimal set of
     * splices can be synthesized given the previous state and final state of an
     * array. The basic approach is to calculate the edit distance matrix and
     * choose the shortest path through it.
     *
     * Complexity: O(l * p)
     *   l: The length of the current array
     *   p: The length of the old array
     */
    calcSplices: function(current, currentStart, currentEnd,
                          old, oldStart, oldEnd) {
      var prefixCount = 0;
      var suffixCount = 0;

      var minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
      if (currentStart == 0 && oldStart == 0)
        prefixCount = this.sharedPrefix(current, old, minLength);

      if (currentEnd == current.length && oldEnd == old.length)
        suffixCount = this.sharedSuffix(current, old, minLength - prefixCount);

      currentStart += prefixCount;
      oldStart += prefixCount;
      currentEnd -= suffixCount;
      oldEnd -= suffixCount;

      if (currentEnd - currentStart == 0 && oldEnd - oldStart == 0)
        return [];

      if (currentStart == currentEnd) {
        var splice = newSplice(currentStart, [], 0);
        while (oldStart < oldEnd)
          splice.removed.push(old[oldStart++]);

        return [ splice ];
      } else if (oldStart == oldEnd)
        return [ newSplice(currentStart, [], currentEnd - currentStart) ];

      var ops = this.spliceOperationsFromEditDistances(
          this.calcEditDistances(current, currentStart, currentEnd,
                                 old, oldStart, oldEnd));

      var splice = undefined;
      var splices = [];
      var index = currentStart;
      var oldIndex = oldStart;
      for (var i = 0; i < ops.length; i++) {
        switch(ops[i]) {
          case EDIT_LEAVE:
            if (splice) {
              splices.push(splice);
              splice = undefined;
            }

            index++;
            oldIndex++;
            break;
          case EDIT_UPDATE:
            if (!splice)
              splice = newSplice(index, [], 0);

            splice.addedCount++;
            index++;

            splice.removed.push(old[oldIndex]);
            oldIndex++;
            break;
          case EDIT_ADD:
            if (!splice)
              splice = newSplice(index, [], 0);

            splice.addedCount++;
            index++;
            break;
          case EDIT_DELETE:
            if (!splice)
              splice = newSplice(index, [], 0);

            splice.removed.push(old[oldIndex]);
            oldIndex++;
            break;
        }
      }

      if (splice) {
        splices.push(splice);
      }
      return splices;
    },

    sharedPrefix: function(current, old, searchLength) {
      for (var i = 0; i < searchLength; i++)
        if (!this.equals(current[i], old[i]))
          return i;
      return searchLength;
    },

    sharedSuffix: function(current, old, searchLength) {
      var index1 = current.length;
      var index2 = old.length;
      var count = 0;
      while (count < searchLength && this.equals(current[--index1], old[--index2]))
        count++;

      return count;
    },

    calculateSplices: function(current, previous) {
      return this.calcSplices(current, 0, current.length, previous, 0,
                              previous.length);
    },

    equals: function(currentValue, previousValue) {
      return currentValue === previousValue;
    }
  };

  var arraySplice = new ArraySplice();

  function calcSplices(current, currentStart, currentEnd,
                       old, oldStart, oldEnd) {
    return arraySplice.calcSplices(current, currentStart, currentEnd,
                                   old, oldStart, oldEnd);
  }

  function intersect(start1, end1, start2, end2) {
    // Disjoint
    if (end1 < start2 || end2 < start1)
      return -1;

    // Adjacent
    if (end1 == start2 || end2 == start1)
      return 0;

    // Non-zero intersect, span1 first
    if (start1 < start2) {
      if (end1 < end2)
        return end1 - start2; // Overlap
      else
        return end2 - start2; // Contained
    } else {
      // Non-zero intersect, span2 first
      if (end2 < end1)
        return end2 - start1; // Overlap
      else
        return end1 - start1; // Contained
    }
  }

  function mergeSplice(splices, index, removed, addedCount) {

    var splice = newSplice(index, removed, addedCount);

    var inserted = false;
    var insertionOffset = 0;

    for (var i = 0; i < splices.length; i++) {
      var current = splices[i];
      current.index += insertionOffset;

      if (inserted)
        continue;

      var intersectCount = intersect(splice.index,
                                     splice.index + splice.removed.length,
                                     current.index,
                                     current.index + current.addedCount);

      if (intersectCount >= 0) {
        // Merge the two splices

        splices.splice(i, 1);
        i--;

        insertionOffset -= current.addedCount - current.removed.length;

        splice.addedCount += current.addedCount - intersectCount;
        var deleteCount = splice.removed.length +
                          current.removed.length - intersectCount;

        if (!splice.addedCount && !deleteCount) {
          // merged splice is a noop. discard.
          inserted = true;
        } else {
          var removed = current.removed;

          if (splice.index < current.index) {
            // some prefix of splice.removed is prepended to current.removed.
            var prepend = splice.removed.slice(0, current.index - splice.index);
            Array.prototype.push.apply(prepend, removed);
            removed = prepend;
          }

          if (splice.index + splice.removed.length > current.index + current.addedCount) {
            // some suffix of splice.removed is appended to current.removed.
            var append = splice.removed.slice(current.index + current.addedCount - splice.index);
            Array.prototype.push.apply(removed, append);
          }

          splice.removed = removed;
          if (current.index < splice.index) {
            splice.index = current.index;
          }
        }
      } else if (splice.index < current.index) {
        // Insert splice here.

        inserted = true;

        splices.splice(i, 0, splice);
        i++;

        var offset = splice.addedCount - splice.removed.length
        current.index += offset;
        insertionOffset += offset;
      }
    }

    if (!inserted)
      splices.push(splice);
  }

  function createInitialSplices(array, changeRecords) {
    var splices = [];

    for (var i = 0; i < changeRecords.length; i++) {
      var record = changeRecords[i];
      switch(record.type) {
        case 'splice':
          mergeSplice(splices, record.index, record.removed.slice(), record.addedCount);
          break;
        case 'add':
        case 'update':
        case 'delete':
          if (!isIndex(record.name))
            continue;
          var index = toNumber(record.name);
          if (index < 0)
            continue;
          mergeSplice(splices, index, [record.oldValue], 1);
          break;
        default:
          console.error('Unexpected record type: ' + JSON.stringify(record));
          break;
      }
    }

    return splices;
  }

  function projectArraySplices(array, changeRecords) {
    var splices = [];

    createInitialSplices(array, changeRecords).forEach(function(splice) {
      if (splice.addedCount == 1 && splice.removed.length == 1) {
        if (splice.removed[0] !== array[splice.index])
          splices.push(splice);

        return
      };

      splices = splices.concat(calcSplices(array, splice.index, splice.index + splice.addedCount,
                                           splice.removed, 0, splice.removed.length));
    });

    return splices;
  }

  // Export the observe-js object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, export as a global object.

  var expose = global;

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      expose = exports = module.exports;
    }
    expose = exports;
  } 

  expose.Observer = Observer;
  expose.Observer.runEOM_ = runEOM;
  expose.Observer.observerSentinel_ = observerSentinel; // for testing.
  expose.Observer.hasObjectObserve = hasObserve;
  expose.ArrayObserver = ArrayObserver;
  expose.ArrayObserver.calculateSplices = function(current, previous) {
    return arraySplice.calculateSplices(current, previous);
  };

  expose.ArraySplice = ArraySplice;
  expose.ObjectObserver = ObjectObserver;
  expose.PathObserver = PathObserver;
  expose.CompoundObserver = CompoundObserver;
  expose.Path = Path;
  expose.ObserverTransform = ObserverTransform;
  
})(typeof global !== 'undefined' && global && typeof module !== 'undefined' && module ? global : this || window);

// Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
// This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
// The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
// The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
// Code distributed by Google as part of the polymer project is also
// subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt

(function(global) {
  'use strict';

  var filter = Array.prototype.filter.call.bind(Array.prototype.filter);

  function getTreeScope(node) {
    while (node.parentNode) {
      node = node.parentNode;
    }

    return typeof node.getElementById === 'function' ? node : null;
  }

  Node.prototype.bind = function(name, observable) {
    console.error('Unhandled binding to Node: ', this, name, observable);
  };

  Node.prototype.bindFinished = function() {};

  function updateBindings(node, name, binding) {
    var bindings = node.bindings_;
    if (!bindings)
      bindings = node.bindings_ = {};

    if (bindings[name])
      binding[name].close();

    return bindings[name] = binding;
  }

  function returnBinding(node, name, binding) {
    return binding;
  }

  function sanitizeValue(value) {
    return value == null ? '' : value;
  }

  function updateText(node, value) {
    node.data = sanitizeValue(value);
  }

  function textBinding(node) {
    return function(value) {
      return updateText(node, value);
    };
  }

  var maybeUpdateBindings = returnBinding;

  Object.defineProperty(Platform, 'enableBindingsReflection', {
    get: function() {
      return maybeUpdateBindings === updateBindings;
    },
    set: function(enable) {
      maybeUpdateBindings = enable ? updateBindings : returnBinding;
      return enable;
    },
    configurable: true
  });

  Text.prototype.bind = function(name, value, oneTime) {
    if (name !== 'textContent')
      return Node.prototype.bind.call(this, name, value, oneTime);

    if (oneTime)
      return updateText(this, value);

    var observable = value;
    updateText(this, observable.open(textBinding(this)));
    return maybeUpdateBindings(this, name, observable);
  }

  function updateAttribute(el, name, conditional, value) {
    if (conditional) {
      if (value)
        el.setAttribute(name, '');
      else
        el.removeAttribute(name);
      return;
    }

    el.setAttribute(name, sanitizeValue(value));
  }

  function attributeBinding(el, name, conditional) {
    return function(value) {
      updateAttribute(el, name, conditional, value);
    };
  }

  Element.prototype.bind = function(name, value, oneTime) {
    var conditional = name[name.length - 1] == '?';
    if (conditional) {
      this.removeAttribute(name);
      name = name.slice(0, -1);
    }

    if (oneTime)
      return updateAttribute(this, name, conditional, value);


    var observable = value;
    updateAttribute(this, name, conditional,
        observable.open(attributeBinding(this, name, conditional)));

    return maybeUpdateBindings(this, name, observable);
  };

  var checkboxEventType;
  (function() {
    // Attempt to feature-detect which event (change or click) is fired first
    // for checkboxes.
    var div = document.createElement('div');
    var checkbox = div.appendChild(document.createElement('input'));
    checkbox.setAttribute('type', 'checkbox');
    var first;
    var count = 0;
    checkbox.addEventListener('click', function(e) {
      count++;
      first = first || 'click';
    });
    checkbox.addEventListener('change', function() {
      count++;
      first = first || 'change';
    });

    var event = document.createEvent('MouseEvent');
    event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false,
        false, false, false, 0, null);
    checkbox.dispatchEvent(event);
    // WebKit/Blink don't fire the change event if the element is outside the
    // document, so assume 'change' for that case.
    checkboxEventType = count == 1 ? 'change' : first;
  })();

  function getEventForInputType(element) {
    switch (element.type) {
      case 'checkbox':
        return checkboxEventType;
      case 'radio':
      case 'select-multiple':
      case 'select-one':
        return 'change';
      case 'range':
        if (/Trident|MSIE/.test(navigator.userAgent))
          return 'change';
      default:
        return 'input';
    }
  }

  function updateInput(input, property, value, santizeFn) {
    input[property] = (santizeFn || sanitizeValue)(value);
  }

  function inputBinding(input, property, santizeFn) {
    return function(value) {
      return updateInput(input, property, value, santizeFn);
    }
  }

  function noop() {}

  function bindInputEvent(input, property, observable, postEventFn) {
    var eventType = getEventForInputType(input);

    function eventHandler() {
      observable.setValue(input[property]);
      observable.discardChanges();
      (postEventFn || noop)(input);
      Platform.performMicrotaskCheckpoint();
    }
    input.addEventListener(eventType, eventHandler);

    return {
      close: function() {
        input.removeEventListener(eventType, eventHandler);
        observable.close();
      },

      observable_: observable
    }
  }

  function booleanSanitize(value) {
    return Boolean(value);
  }

  // |element| is assumed to be an HTMLInputElement with |type| == 'radio'.
  // Returns an array containing all radio buttons other than |element| that
  // have the same |name|, either in the form that |element| belongs to or,
  // if no form, in the document tree to which |element| belongs.
  //
  // This implementation is based upon the HTML spec definition of a
  // "radio button group":
  //   http://www.whatwg.org/specs/web-apps/current-work/multipage/number-state.html#radio-button-group
  //
  function getAssociatedRadioButtons(element) {
    if (element.form) {
      return filter(element.form.elements, function(el) {
        return el != element &&
            el.tagName == 'INPUT' &&
            el.type == 'radio' &&
            el.name == element.name;
      });
    } else {
      var treeScope = getTreeScope(element);
      if (!treeScope)
        return [];
      var radios = treeScope.querySelectorAll(
          'input[type="radio"][name="' + element.name + '"]');
      return filter(radios, function(el) {
        return el != element && !el.form;
      });
    }
  }

  function checkedPostEvent(input) {
    // Only the radio button that is getting checked gets an event. We
    // therefore find all the associated radio buttons and update their
    // check binding manually.
    if (input.tagName === 'INPUT' &&
        input.type === 'radio') {
      getAssociatedRadioButtons(input).forEach(function(radio) {
        var checkedBinding = radio.bindings_.checked;
        if (checkedBinding) {
          // Set the value directly to avoid an infinite call stack.
          checkedBinding.observable_.setValue(false);
        }
      });
    }
  }

  HTMLInputElement.prototype.bind = function(name, value, oneTime) {
    if (name !== 'value' && name !== 'checked')
      return HTMLElement.prototype.bind.call(this, name, value, oneTime);

    this.removeAttribute(name);
    var sanitizeFn = name == 'checked' ? booleanSanitize : sanitizeValue;
    var postEventFn = name == 'checked' ? checkedPostEvent : noop;

    if (oneTime)
      return updateInput(this, name, value, sanitizeFn);


    var observable = value;
    var binding = bindInputEvent(this, name, observable, postEventFn);
    updateInput(this, name,
                observable.open(inputBinding(this, name, sanitizeFn)),
                sanitizeFn);

    // Checkboxes may need to update bindings of other checkboxes.
    return updateBindings(this, name, binding);
  }

  HTMLTextAreaElement.prototype.bind = function(name, value, oneTime) {
    if (name !== 'value')
      return HTMLElement.prototype.bind.call(this, name, value, oneTime);

    this.removeAttribute('value');

    if (oneTime)
      return updateInput(this, 'value', value);

    var observable = value;
    var binding = bindInputEvent(this, 'value', observable);
    updateInput(this, 'value',
                observable.open(inputBinding(this, 'value', sanitizeValue)));
    return maybeUpdateBindings(this, name, binding);
  }

  function updateOption(option, value) {
    var parentNode = option.parentNode;;
    var select;
    var selectBinding;
    var oldValue;
    if (parentNode instanceof HTMLSelectElement &&
        parentNode.bindings_ &&
        parentNode.bindings_.value) {
      select = parentNode;
      selectBinding = select.bindings_.value;
      oldValue = select.value;
    }

    option.value = sanitizeValue(value);

    if (select && select.value != oldValue) {
      selectBinding.observable_.setValue(select.value);
      selectBinding.observable_.discardChanges();
      Platform.performMicrotaskCheckpoint();
    }
  }

  function optionBinding(option) {
    return function(value) {
      updateOption(option, value);
    }
  }

  HTMLOptionElement.prototype.bind = function(name, value, oneTime) {
    if (name !== 'value')
      return HTMLElement.prototype.bind.call(this, name, value, oneTime);

    this.removeAttribute('value');

    if (oneTime)
      return updateOption(this, value);

    var observable = value;
    var binding = bindInputEvent(this, 'value', observable);
    updateOption(this, observable.open(optionBinding(this)));
    return maybeUpdateBindings(this, name, binding);
  }

  HTMLSelectElement.prototype.bind = function(name, value, oneTime) {
    if (name === 'selectedindex')
      name = 'selectedIndex';

    if (name !== 'selectedIndex' && name !== 'value')
      return HTMLElement.prototype.bind.call(this, name, value, oneTime);

    this.removeAttribute(name);

    if (oneTime)
      return updateInput(this, name, value);

    var observable = value;
    var binding = bindInputEvent(this, name, observable);
    updateInput(this, name,
                observable.open(inputBinding(this, name)));

    // Option update events may need to access select bindings.
    return updateBindings(this, name, binding);
  }
})(this);

// Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
// This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
// The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
// The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
// Code distributed by Google as part of the polymer project is also
// subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt

(function(global) {
  'use strict';

  function assert(v) {
    if (!v)
      throw new Error('Assertion failed');
  }

  var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

  function getFragmentRoot(node) {
    var p;
    while (p = node.parentNode) {
      node = p;
    }

    return node;
  }

  function searchRefId(node, id) {
    if (!id)
      return;

    var ref;
    var selector = '#' + id;
    while (!ref) {
      node = getFragmentRoot(node);

      if (node.protoContent_)
        ref = node.protoContent_.querySelector(selector);
      else if (node.getElementById)
        ref = node.getElementById(id);

      if (ref || !node.templateCreator_)
        break

      node = node.templateCreator_;
    }

    return ref;
  }

  function getInstanceRoot(node) {
    while (node.parentNode) {
      node = node.parentNode;
    }
    return node.templateCreator_ ? node : null;
  }

  var Map;
  if (global.Map && typeof global.Map.prototype.forEach === 'function') {
    Map = global.Map;
  } else {
    Map = function() {
      this.keys = [];
      this.values = [];
    };

    Map.prototype = {
      set: function(key, value) {
        var index = this.keys.indexOf(key);
        if (index < 0) {
          this.keys.push(key);
          this.values.push(value);
        } else {
          this.values[index] = value;
        }
      },

      get: function(key) {
        var index = this.keys.indexOf(key);
        if (index < 0)
          return;

        return this.values[index];
      },

      delete: function(key, value) {
        var index = this.keys.indexOf(key);
        if (index < 0)
          return false;

        this.keys.splice(index, 1);
        this.values.splice(index, 1);
        return true;
      },

      forEach: function(f, opt_this) {
        for (var i = 0; i < this.keys.length; i++)
          f.call(opt_this || this, this.values[i], this.keys[i], this);
      }
    };
  }

  // JScript does not have __proto__. We wrap all object literals with
  // createObject which uses Object.create, Object.defineProperty and
  // Object.getOwnPropertyDescriptor to create a new object that does the exact
  // same thing. The main downside to this solution is that we have to extract
  // all those property descriptors for IE.
  var createObject = ('__proto__' in {}) ?
      function(obj) { return obj; } :
      function(obj) {
        var proto = obj.__proto__;
        if (!proto)
          return obj;
        var newObject = Object.create(proto);
        Object.getOwnPropertyNames(obj).forEach(function(name) {
          Object.defineProperty(newObject, name,
                               Object.getOwnPropertyDescriptor(obj, name));
        });
        return newObject;
      };

  // IE does not support have Document.prototype.contains.
  if (typeof document.contains != 'function') {
    Document.prototype.contains = function(node) {
      if (node === this || node.parentNode === this)
        return true;
      return this.documentElement.contains(node);
    }
  }

  var BIND = 'bind';
  var REPEAT = 'repeat';
  var IF = 'if';

  var templateAttributeDirectives = {
    'template': true,
    'repeat': true,
    'bind': true,
    'ref': true,
    'if': true
  };

  var semanticTemplateElements = {
    'THEAD': true,
    'TBODY': true,
    'TFOOT': true,
    'TH': true,
    'TR': true,
    'TD': true,
    'COLGROUP': true,
    'COL': true,
    'CAPTION': true,
    'OPTION': true,
    'OPTGROUP': true
  };

  var hasTemplateElement = typeof HTMLTemplateElement !== 'undefined';
  if (hasTemplateElement) {
    // TODO(rafaelw): Remove when fix for
    // https://codereview.chromium.org/164803002/
    // makes it to Chrome release.
    (function() {
      var t = document.createElement('template');
      var d = t.content.ownerDocument;
      var html = d.appendChild(d.createElement('html'));
      var head = html.appendChild(d.createElement('head'));
      var base = d.createElement('base');
      base.href = document.baseURI;
      head.appendChild(base);
    })();
  }

  var allTemplatesSelectors = 'template, ' +
      Object.keys(semanticTemplateElements).map(function(tagName) {
        return tagName.toLowerCase() + '[template]';
      }).join(', ');

  function isSVGTemplate(el) {
    return el.tagName == 'template' &&
           el.namespaceURI == 'http://www.w3.org/2000/svg';
  }

  function isHTMLTemplate(el) {
    return el.tagName == 'TEMPLATE' &&
           el.namespaceURI == 'http://www.w3.org/1999/xhtml';
  }

  function isAttributeTemplate(el) {
    return Boolean(semanticTemplateElements[el.tagName] &&
                   el.hasAttribute('template'));
  }

  function isTemplate(el) {
    if (el.isTemplate_ === undefined)
      el.isTemplate_ = el.tagName == 'TEMPLATE' || isAttributeTemplate(el);

    return el.isTemplate_;
  }

  // FIXME: Observe templates being added/removed from documents
  // FIXME: Expose imperative API to decorate and observe templates in
  // "disconnected tress" (e.g. ShadowRoot)
  document.addEventListener('DOMContentLoaded', function(e) {
    bootstrapTemplatesRecursivelyFrom(document);
    // FIXME: Is this needed? Seems like it shouldn't be.
    Platform.performMicrotaskCheckpoint();
  }, false);

  function forAllTemplatesFrom(node, fn) {
    var subTemplates = node.querySelectorAll(allTemplatesSelectors);

    if (isTemplate(node))
      fn(node)
    forEach(subTemplates, fn);
  }

  function bootstrapTemplatesRecursivelyFrom(node) {
    function bootstrap(template) {
      if (!HTMLTemplateElement.decorate(template))
        bootstrapTemplatesRecursivelyFrom(template.content);
    }

    forAllTemplatesFrom(node, bootstrap);
  }

  if (!hasTemplateElement) {
    /**
     * This represents a <template> element.
     * @constructor
     * @extends {HTMLElement}
     */
    global.HTMLTemplateElement = function() {
      throw TypeError('Illegal constructor');
    };
  }

  var hasProto = '__proto__' in {};

  function mixin(to, from) {
    Object.getOwnPropertyNames(from).forEach(function(name) {
      Object.defineProperty(to, name,
                            Object.getOwnPropertyDescriptor(from, name));
    });
  }

  // http://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/templates/index.html#dfn-template-contents-owner
  function getOrCreateTemplateContentsOwner(template) {
    var doc = template.ownerDocument
    if (!doc.defaultView)
      return doc;
    var d = doc.templateContentsOwner_;
    if (!d) {
      // TODO(arv): This should either be a Document or HTMLDocument depending
      // on doc.
      d = doc.implementation.createHTMLDocument('');
      while (d.lastChild) {
        d.removeChild(d.lastChild);
      }
      doc.templateContentsOwner_ = d;
    }
    return d;
  }

  function getTemplateStagingDocument(template) {
    if (!template.stagingDocument_) {
      var owner = template.ownerDocument;
      if (!owner.stagingDocument_) {
        owner.stagingDocument_ = owner.implementation.createHTMLDocument('');
        owner.stagingDocument_.isStagingDocument = true;
        // TODO(rafaelw): Remove when fix for
        // https://codereview.chromium.org/164803002/
        // makes it to Chrome release.
        var base = owner.stagingDocument_.createElement('base');
        base.href = document.baseURI;
        owner.stagingDocument_.head.appendChild(base);

        owner.stagingDocument_.stagingDocument_ = owner.stagingDocument_;
      }

      template.stagingDocument_ = owner.stagingDocument_;
    }

    return template.stagingDocument_;
  }

  // For non-template browsers, the parser will disallow <template> in certain
  // locations, so we allow "attribute templates" which combine the template
  // element with the top-level container node of the content, e.g.
  //
  //   <tr template repeat="{{ foo }}"" class="bar"><td>Bar</td></tr>
  //
  // becomes
  //
  //   <template repeat="{{ foo }}">
  //   + #document-fragment
  //     + <tr class="bar">
  //       + <td>Bar</td>
  //
  function extractTemplateFromAttributeTemplate(el) {
    var template = el.ownerDocument.createElement('template');
    el.parentNode.insertBefore(template, el);

    var attribs = el.attributes;
    var count = attribs.length;
    while (count-- > 0) {
      var attrib = attribs[count];
      if (templateAttributeDirectives[attrib.name]) {
        if (attrib.name !== 'template')
          template.setAttribute(attrib.name, attrib.value);
        el.removeAttribute(attrib.name);
      }
    }

    return template;
  }

  function extractTemplateFromSVGTemplate(el) {
    var template = el.ownerDocument.createElement('template');
    el.parentNode.insertBefore(template, el);

    var attribs = el.attributes;
    var count = attribs.length;
    while (count-- > 0) {
      var attrib = attribs[count];
      template.setAttribute(attrib.name, attrib.value);
      el.removeAttribute(attrib.name);
    }

    el.parentNode.removeChild(el);
    return template;
  }

  function liftNonNativeTemplateChildrenIntoContent(template, el, useRoot) {
    var content = template.content;
    if (useRoot) {
      content.appendChild(el);
      return;
    }

    var child;
    while (child = el.firstChild) {
      content.appendChild(child);
    }
  }

  var templateObserver;
  if (typeof MutationObserver == 'function') {
    templateObserver = new MutationObserver(function(records) {
      for (var i = 0; i < records.length; i++) {
        records[i].target.refChanged_();
      }
    });
  }

  /**
   * Ensures proper API and content model for template elements.
   * @param {HTMLTemplateElement} opt_instanceRef The template element which
   *     |el| template element will return as the value of its ref(), and whose
   *     content will be used as source when createInstance() is invoked.
   */
  HTMLTemplateElement.decorate = function(el, opt_instanceRef) {
    if (el.templateIsDecorated_)
      return false;

    var templateElement = el;
    templateElement.templateIsDecorated_ = true;

    var isNativeHTMLTemplate = isHTMLTemplate(templateElement) &&
                               hasTemplateElement;
    var bootstrapContents = isNativeHTMLTemplate;
    var liftContents = !isNativeHTMLTemplate;
    var liftRoot = false;

    if (!isNativeHTMLTemplate) {
      if (isAttributeTemplate(templateElement)) {
        assert(!opt_instanceRef);
        templateElement = extractTemplateFromAttributeTemplate(el);
        templateElement.templateIsDecorated_ = true;
        isNativeHTMLTemplate = hasTemplateElement;
        liftRoot = true;
      } else if (isSVGTemplate(templateElement)) {
        templateElement = extractTemplateFromSVGTemplate(el);
        templateElement.templateIsDecorated_ = true;
        isNativeHTMLTemplate = hasTemplateElement;
      }
    }

    if (!isNativeHTMLTemplate) {
      fixTemplateElementPrototype(templateElement);
      var doc = getOrCreateTemplateContentsOwner(templateElement);
      templateElement.content_ = doc.createDocumentFragment();
    }

    if (opt_instanceRef) {
      // template is contained within an instance, its direct content must be
      // empty
      templateElement.instanceRef_ = opt_instanceRef;
    } else if (liftContents) {
      liftNonNativeTemplateChildrenIntoContent(templateElement,
                                               el,
                                               liftRoot);
    } else if (bootstrapContents) {
      bootstrapTemplatesRecursivelyFrom(templateElement.content);
    }

    return true;
  };

  // TODO(rafaelw): This used to decorate recursively all templates from a given
  // node. This happens by default on 'DOMContentLoaded', but may be needed
  // in subtrees not descendent from document (e.g. ShadowRoot).
  // Review whether this is the right public API.
  HTMLTemplateElement.bootstrap = bootstrapTemplatesRecursivelyFrom;

  var htmlElement = global.HTMLUnknownElement || HTMLElement;

  var contentDescriptor = {
    get: function() {
      return this.content_;
    },
    enumerable: true,
    configurable: true
  };

  if (!hasTemplateElement) {
    // Gecko is more picky with the prototype than WebKit. Make sure to use the
    // same prototype as created in the constructor.
    HTMLTemplateElement.prototype = Object.create(htmlElement.prototype);

    Object.defineProperty(HTMLTemplateElement.prototype, 'content',
                          contentDescriptor);
  }

  function fixTemplateElementPrototype(el) {
    if (hasProto)
      el.__proto__ = HTMLTemplateElement.prototype;
    else
      mixin(el, HTMLTemplateElement.prototype);
  }

  function ensureSetModelScheduled(template) {
    if (!template.setModelFn_) {
      template.setModelFn_ = function() {
        template.setModelFnScheduled_ = false;
        var map = getBindings(template,
            template.delegate_ && template.delegate_.prepareBinding);
        processBindings(template, map, template.model_);
      };
    }

    if (!template.setModelFnScheduled_) {
      template.setModelFnScheduled_ = true;
      Observer.runEOM_(template.setModelFn_);
    }
  }

  mixin(HTMLTemplateElement.prototype, {
    bind: function(name, value, oneTime) {
      if (name != 'ref')
        return Element.prototype.bind.call(this, name, value, oneTime);

      var self = this;
      var ref = oneTime ? value : value.open(function(ref) {
        self.setAttribute('ref', ref);
        self.refChanged_();
      });

      this.setAttribute('ref', ref);
      this.refChanged_();
      if (oneTime)
        return;

      if (!this.bindings_) {
        this.bindings_ = { ref: value };
      } else {
        this.bindings_.ref = value;
      }

      return value;
    },

    processBindingDirectives_: function(directives) {
      if (this.iterator_)
        this.iterator_.closeDeps();

      if (!directives.if && !directives.bind && !directives.repeat) {
        if (this.iterator_) {
          this.iterator_.close();
          this.iterator_ = undefined;
        }

        return;
      }

      if (!this.iterator_) {
        this.iterator_ = new TemplateIterator(this);
      }

      this.iterator_.updateDependencies(directives, this.model_);

      if (templateObserver) {
        templateObserver.observe(this, { attributes: true,
                                         attributeFilter: ['ref'] });
      }

      return this.iterator_;
    },

    createInstance: function(model, bindingDelegate, delegate_) {
      if (bindingDelegate)
        delegate_ = this.newDelegate_(bindingDelegate);
      else if (!delegate_)
        delegate_ = this.delegate_;

      if (!this.refContent_)
        this.refContent_ = this.ref_.content;
      var content = this.refContent_;
      if (content.firstChild === null)
        return emptyInstance;

      var map = getInstanceBindingMap(content, delegate_);
      var stagingDocument = getTemplateStagingDocument(this);
      var instance = stagingDocument.createDocumentFragment();
      instance.templateCreator_ = this;
      instance.protoContent_ = content;
      instance.bindings_ = [];
      instance.terminator_ = null;
      var instanceRecord = instance.templateInstance_ = {
        firstNode: null,
        lastNode: null,
        model: model
      };

      var i = 0;
      var collectTerminator = false;
      for (var child = content.firstChild; child; child = child.nextSibling) {
        // The terminator of the instance is the clone of the last child of the
        // content. If the last child is an active template, it may produce
        // instances as a result of production, so simply collecting the last
        // child of the instance after it has finished producing may be wrong.
        if (child.nextSibling === null)
          collectTerminator = true;

        var clone = cloneAndBindInstance(child, instance, stagingDocument,
                                         map.children[i++],
                                         model,
                                         delegate_,
                                         instance.bindings_);
        clone.templateInstance_ = instanceRecord;
        if (collectTerminator)
          instance.terminator_ = clone;
      }

      instanceRecord.firstNode = instance.firstChild;
      instanceRecord.lastNode = instance.lastChild;
      instance.templateCreator_ = undefined;
      instance.protoContent_ = undefined;
      return instance;
    },

    get model() {
      return this.model_;
    },

    set model(model) {
      this.model_ = model;
      ensureSetModelScheduled(this);
    },

    get bindingDelegate() {
      return this.delegate_ && this.delegate_.raw;
    },

    refChanged_: function() {
      if (!this.iterator_ || this.refContent_ === this.ref_.content)
        return;

      this.refContent_ = undefined;
      this.iterator_.valueChanged();
      this.iterator_.updateIteratedValue(this.iterator_.getUpdatedValue());
    },

    clear: function() {
      this.model_ = undefined;
      this.delegate_ = undefined;
      if (this.bindings_ && this.bindings_.ref)
        this.bindings_.ref.close()
      this.refContent_ = undefined;
      if (!this.iterator_)
        return;
      this.iterator_.valueChanged();
      this.iterator_.close()
      this.iterator_ = undefined;
    },

    setDelegate_: function(delegate) {
      this.delegate_ = delegate;
      this.bindingMap_ = undefined;
      if (this.iterator_) {
        this.iterator_.instancePositionChangedFn_ = undefined;
        this.iterator_.instanceModelFn_ = undefined;
      }
    },

    newDelegate_: function(bindingDelegate) {
      if (!bindingDelegate)
        return;

      function delegateFn(name) {
        var fn = bindingDelegate && bindingDelegate[name];
        if (typeof fn != 'function')
          return;

        return function() {
          return fn.apply(bindingDelegate, arguments);
        };
      }

      return {
        bindingMaps: {},
        raw: bindingDelegate,
        prepareBinding: delegateFn('prepareBinding'),
        prepareInstanceModel: delegateFn('prepareInstanceModel'),
        prepareInstancePositionChanged:
            delegateFn('prepareInstancePositionChanged')
      };
    },

    set bindingDelegate(bindingDelegate) {
      if (this.delegate_) {
        throw Error('Template must be cleared before a new bindingDelegate ' +
                    'can be assigned');
      }

      this.setDelegate_(this.newDelegate_(bindingDelegate));
    },

    get ref_() {
      var ref = searchRefId(this, this.getAttribute('ref'));
      if (!ref)
        ref = this.instanceRef_;

      if (!ref)
        return this;

      var nextRef = ref.ref_;
      return nextRef ? nextRef : ref;
    }
  });

  // Returns
  //   a) undefined if there are no mustaches.
  //   b) [TEXT, (ONE_TIME?, PATH, DELEGATE_FN, TEXT)+] if there is at least one mustache.
  function parseMustaches(s, name, node, prepareBindingFn) {
    if (!s || !s.length)
      return;

    var tokens;
    var length = s.length;
    var startIndex = 0, lastIndex = 0, endIndex = 0;
    var onlyOneTime = true;
    while (lastIndex < length) {
      var startIndex = s.indexOf('{{', lastIndex);
      var oneTimeStart = s.indexOf('[[', lastIndex);
      var oneTime = false;
      var terminator = '}}';

      if (oneTimeStart >= 0 &&
          (startIndex < 0 || oneTimeStart < startIndex)) {
        startIndex = oneTimeStart;
        oneTime = true;
        terminator = ']]';
      }

      endIndex = startIndex < 0 ? -1 : s.indexOf(terminator, startIndex + 2);

      if (endIndex < 0) {
        if (!tokens)
          return;

        tokens.push(s.slice(lastIndex)); // TEXT
        break;
      }

      tokens = tokens || [];
      tokens.push(s.slice(lastIndex, startIndex)); // TEXT
      var pathString = s.slice(startIndex + 2, endIndex).trim();
      tokens.push(oneTime); // ONE_TIME?
      onlyOneTime = onlyOneTime && oneTime;
      var delegateFn = prepareBindingFn &&
                       prepareBindingFn(pathString, name, node);
      // Don't try to parse the expression if there's a prepareBinding function
      if (delegateFn == null) {
        tokens.push(Path.get(pathString)); // PATH
      } else {
        tokens.push(null);
      }
      tokens.push(delegateFn); // DELEGATE_FN
      lastIndex = endIndex + 2;
    }

    if (lastIndex === length)
      tokens.push(''); // TEXT

    tokens.hasOnePath = tokens.length === 5;
    tokens.isSimplePath = tokens.hasOnePath &&
                          tokens[0] == '' &&
                          tokens[4] == '';
    tokens.onlyOneTime = onlyOneTime;

    tokens.combinator = function(values) {
      var newValue = tokens[0];

      for (var i = 1; i < tokens.length; i += 4) {
        var value = tokens.hasOnePath ? values : values[(i - 1) / 4];
        if (value !== undefined)
          newValue += value;
        newValue += tokens[i + 3];
      }

      return newValue;
    }

    return tokens;
  };

  function processOneTimeBinding(name, tokens, node, model) {
    if (tokens.hasOnePath) {
      var delegateFn = tokens[3];
      var value = delegateFn ? delegateFn(model, node, true) :
                               tokens[2].getValueFrom(model);
      return tokens.isSimplePath ? value : tokens.combinator(value);
    }

    var values = [];
    for (var i = 1; i < tokens.length; i += 4) {
      var delegateFn = tokens[i + 2];
      values[(i - 1) / 4] = delegateFn ? delegateFn(model, node) :
          tokens[i + 1].getValueFrom(model);
    }

    return tokens.combinator(values);
  }

  function processSinglePathBinding(name, tokens, node, model) {
    var delegateFn = tokens[3];
    var observer = delegateFn ? delegateFn(model, node, false) :
        new PathObserver(model, tokens[2]);

    return tokens.isSimplePath ? observer :
        new ObserverTransform(observer, tokens.combinator);
  }

  function processBinding(name, tokens, node, model) {
    if (tokens.onlyOneTime)
      return processOneTimeBinding(name, tokens, node, model);

    if (tokens.hasOnePath)
      return processSinglePathBinding(name, tokens, node, model);

    var observer = new CompoundObserver();

    for (var i = 1; i < tokens.length; i += 4) {
      var oneTime = tokens[i];
      var delegateFn = tokens[i + 2];

      if (delegateFn) {
        var value = delegateFn(model, node, oneTime);
        if (oneTime)
          observer.addPath(value)
        else
          observer.addObserver(value);
        continue;
      }

      var path = tokens[i + 1];
      if (oneTime)
        observer.addPath(path.getValueFrom(model))
      else
        observer.addPath(model, path);
    }

    return new ObserverTransform(observer, tokens.combinator);
  }

  function processBindings(node, bindings, model, instanceBindings) {
    for (var i = 0; i < bindings.length; i += 2) {
      var name = bindings[i]
      var tokens = bindings[i + 1];
      var value = processBinding(name, tokens, node, model);
      var binding = node.bind(name, value, tokens.onlyOneTime);
      if (binding && instanceBindings)
        instanceBindings.push(binding);
    }

    node.bindFinished();
    if (!bindings.isTemplate)
      return;

    node.model_ = model;
    var iter = node.processBindingDirectives_(bindings);
    if (instanceBindings && iter)
      instanceBindings.push(iter);
  }

  function parseWithDefault(el, name, prepareBindingFn) {
    var v = el.getAttribute(name);
    return parseMustaches(v == '' ? '{{}}' : v, name, el, prepareBindingFn);
  }

  function parseAttributeBindings(element, prepareBindingFn) {
    assert(element);

    var bindings = [];
    var ifFound = false;
    var bindFound = false;

    for (var i = 0; i < element.attributes.length; i++) {
      var attr = element.attributes[i];
      var name = attr.name;
      var value = attr.value;

      // Allow bindings expressed in attributes to be prefixed with underbars.
      // We do this to allow correct semantics for browsers that don't implement
      // <template> where certain attributes might trigger side-effects -- and
      // for IE which sanitizes certain attributes, disallowing mustache
      // replacements in their text.
      while (name[0] === '_') {
        name = name.substring(1);
      }

      if (isTemplate(element) &&
          (name === IF || name === BIND || name === REPEAT)) {
        continue;
      }

      var tokens = parseMustaches(value, name, element,
                                  prepareBindingFn);
      if (!tokens)
        continue;

      bindings.push(name, tokens);
    }

    if (isTemplate(element)) {
      bindings.isTemplate = true;
      bindings.if = parseWithDefault(element, IF, prepareBindingFn);
      bindings.bind = parseWithDefault(element, BIND, prepareBindingFn);
      bindings.repeat = parseWithDefault(element, REPEAT, prepareBindingFn);

      if (bindings.if && !bindings.bind && !bindings.repeat)
        bindings.bind = parseMustaches('{{}}', BIND, element, prepareBindingFn);
    }

    return bindings;
  }

  function getBindings(node, prepareBindingFn) {
    if (node.nodeType === Node.ELEMENT_NODE)
      return parseAttributeBindings(node, prepareBindingFn);

    if (node.nodeType === Node.TEXT_NODE) {
      var tokens = parseMustaches(node.data, 'textContent', node,
                                  prepareBindingFn);
      if (tokens)
        return ['textContent', tokens];
    }

    return [];
  }

  function cloneAndBindInstance(node, parent, stagingDocument, bindings, model,
                                delegate,
                                instanceBindings,
                                instanceRecord) {
    var clone = parent.appendChild(stagingDocument.importNode(node, false));

    var i = 0;
    for (var child = node.firstChild; child; child = child.nextSibling) {
      cloneAndBindInstance(child, clone, stagingDocument,
                            bindings.children[i++],
                            model,
                            delegate,
                            instanceBindings);
    }

    if (bindings.isTemplate) {
      HTMLTemplateElement.decorate(clone, node);
      if (delegate)
        clone.setDelegate_(delegate);
    }

    processBindings(clone, bindings, model, instanceBindings);
    return clone;
  }

  function createInstanceBindingMap(node, prepareBindingFn) {
    var map = getBindings(node, prepareBindingFn);
    map.children = {};
    var index = 0;
    for (var child = node.firstChild; child; child = child.nextSibling) {
      map.children[index++] = createInstanceBindingMap(child, prepareBindingFn);
    }

    return map;
  }

  var contentUidCounter = 1;

  // TODO(rafaelw): Setup a MutationObserver on content which clears the id
  // so that bindingMaps regenerate when the template.content changes.
  function getContentUid(content) {
    var id = content.id_;
    if (!id)
      id = content.id_ = contentUidCounter++;
    return id;
  }

  // Each delegate is associated with a set of bindingMaps, one for each
  // content which may be used by a template. The intent is that each binding
  // delegate gets the opportunity to prepare the instance (via the prepare*
  // delegate calls) once across all uses.
  // TODO(rafaelw): Separate out the parse map from the binding map. In the
  // current implementation, if two delegates need a binding map for the same
  // content, the second will have to reparse.
  function getInstanceBindingMap(content, delegate_) {
    var contentId = getContentUid(content);
    if (delegate_) {
      var map = delegate_.bindingMaps[contentId];
      if (!map) {
        map = delegate_.bindingMaps[contentId] =
            createInstanceBindingMap(content, delegate_.prepareBinding) || [];
      }
      return map;
    }

    var map = content.bindingMap_;
    if (!map) {
      map = content.bindingMap_ =
          createInstanceBindingMap(content, undefined) || [];
    }
    return map;
  }

  Object.defineProperty(Node.prototype, 'templateInstance', {
    get: function() {
      var instance = this.templateInstance_;
      return instance ? instance :
          (this.parentNode ? this.parentNode.templateInstance : undefined);
    }
  });

  var emptyInstance = document.createDocumentFragment();
  emptyInstance.bindings_ = [];
  emptyInstance.terminator_ = null;

  function TemplateIterator(templateElement) {
    this.closed = false;
    this.templateElement_ = templateElement;
    this.instances = [];
    this.deps = undefined;
    this.iteratedValue = [];
    this.presentValue = undefined;
    this.arrayObserver = undefined;
  }

  TemplateIterator.prototype = {
    closeDeps: function() {
      var deps = this.deps;
      if (deps) {
        if (deps.ifOneTime === false)
          deps.ifValue.close();
        if (deps.oneTime === false)
          deps.value.close();
      }
    },

    updateDependencies: function(directives, model) {
      this.closeDeps();

      var deps = this.deps = {};
      var template = this.templateElement_;

      var ifValue = true;
      if (directives.if) {
        deps.hasIf = true;
        deps.ifOneTime = directives.if.onlyOneTime;
        deps.ifValue = processBinding(IF, directives.if, template, model);

        ifValue = deps.ifValue;

        // oneTime if & predicate is false. nothing else to do.
        if (deps.ifOneTime && !ifValue) {
          this.valueChanged();
          return;
        }

        if (!deps.ifOneTime)
          ifValue = ifValue.open(this.updateIfValue, this);
      }

      if (directives.repeat) {
        deps.repeat = true;
        deps.oneTime = directives.repeat.onlyOneTime;
        deps.value = processBinding(REPEAT, directives.repeat, template, model);
      } else {
        deps.repeat = false;
        deps.oneTime = directives.bind.onlyOneTime;
        deps.value = processBinding(BIND, directives.bind, template, model);
      }

      var value = deps.value;
      if (!deps.oneTime)
        value = value.open(this.updateIteratedValue, this);

      if (!ifValue) {
        this.valueChanged();
        return;
      }

      this.updateValue(value);
    },

    /**
     * Gets the updated value of the bind/repeat. This can potentially call
     * user code (if a bindingDelegate is set up) so we try to avoid it if we
     * already have the value in hand (from Observer.open).
     */
    getUpdatedValue: function() {
      var value = this.deps.value;
      if (!this.deps.oneTime)
        value = value.discardChanges();
      return value;
    },

    updateIfValue: function(ifValue) {
      if (!ifValue) {
        this.valueChanged();
        return;
      }

      this.updateValue(this.getUpdatedValue());
    },

    updateIteratedValue: function(value) {
      if (this.deps.hasIf) {
        var ifValue = this.deps.ifValue;
        if (!this.deps.ifOneTime)
          ifValue = ifValue.discardChanges();
        if (!ifValue) {
          this.valueChanged();
          return;
        }
      }

      this.updateValue(value);
    },

    updateValue: function(value) {
      if (!this.deps.repeat)
        value = [value];
      var observe = this.deps.repeat &&
                    !this.deps.oneTime &&
                    Array.isArray(value);
      this.valueChanged(value, observe);
    },

    valueChanged: function(value, observeValue) {
      if (!Array.isArray(value))
        value = [];

      if (value === this.iteratedValue)
        return;

      this.unobserve();
      this.presentValue = value;
      if (observeValue) {
        this.arrayObserver = new ArrayObserver(this.presentValue);
        this.arrayObserver.open(this.handleSplices, this);
      }

      this.handleSplices(ArrayObserver.calculateSplices(this.presentValue,
                                                        this.iteratedValue));
    },

    getLastInstanceNode: function(index) {
      if (index == -1)
        return this.templateElement_;
      var instance = this.instances[index];
      var terminator = instance.terminator_;
      if (!terminator)
        return this.getLastInstanceNode(index - 1);

      if (terminator.nodeType !== Node.ELEMENT_NODE ||
          this.templateElement_ === terminator) {
        return terminator;
      }

      var subtemplateIterator = terminator.iterator_;
      if (!subtemplateIterator)
        return terminator;

      return subtemplateIterator.getLastTemplateNode();
    },

    getLastTemplateNode: function() {
      return this.getLastInstanceNode(this.instances.length - 1);
    },

    insertInstanceAt: function(index, fragment) {
      var previousInstanceLast = this.getLastInstanceNode(index - 1);
      var parent = this.templateElement_.parentNode;
      this.instances.splice(index, 0, fragment);

      parent.insertBefore(fragment, previousInstanceLast.nextSibling);
    },

    extractInstanceAt: function(index) {
      var previousInstanceLast = this.getLastInstanceNode(index - 1);
      var lastNode = this.getLastInstanceNode(index);
      var parent = this.templateElement_.parentNode;
      var instance = this.instances.splice(index, 1)[0];

      while (lastNode !== previousInstanceLast) {
        var node = previousInstanceLast.nextSibling;
        if (node == lastNode)
          lastNode = previousInstanceLast;

        instance.appendChild(parent.removeChild(node));
      }

      return instance;
    },

    getDelegateFn: function(fn) {
      fn = fn && fn(this.templateElement_);
      return typeof fn === 'function' ? fn : null;
    },

    handleSplices: function(splices) {
      if (this.closed || !splices.length)
        return;

      var template = this.templateElement_;

      if (!template.parentNode) {
        this.close();
        return;
      }

      ArrayObserver.applySplices(this.iteratedValue, this.presentValue,
                                 splices);

      var delegate = template.delegate_;
      if (this.instanceModelFn_ === undefined) {
        this.instanceModelFn_ =
            this.getDelegateFn(delegate && delegate.prepareInstanceModel);
      }

      if (this.instancePositionChangedFn_ === undefined) {
        this.instancePositionChangedFn_ =
            this.getDelegateFn(delegate &&
                               delegate.prepareInstancePositionChanged);
      }

      // Instance Removals
      var instanceCache = new Map;
      var removeDelta = 0;
      for (var i = 0; i < splices.length; i++) {
        var splice = splices[i];
        var removed = splice.removed;
        for (var j = 0; j < removed.length; j++) {
          var model = removed[j];
          var instance = this.extractInstanceAt(splice.index + removeDelta);
          if (instance !== emptyInstance) {
            instanceCache.set(model, instance);
          }
        }

        removeDelta -= splice.addedCount;
      }

      // Instance Insertions
      for (var i = 0; i < splices.length; i++) {
        var splice = splices[i];
        var addIndex = splice.index;
        for (; addIndex < splice.index + splice.addedCount; addIndex++) {
          var model = this.iteratedValue[addIndex];
          var instance = instanceCache.get(model);
          if (instance) {
            instanceCache.delete(model);
          } else {
            if (this.instanceModelFn_) {
              model = this.instanceModelFn_(model);
            }

            if (model === undefined) {
              instance = emptyInstance;
            } else {
              instance = template.createInstance(model, undefined, delegate);
            }
          }

          this.insertInstanceAt(addIndex, instance);
        }
      }

      instanceCache.forEach(function(instance) {
        this.closeInstanceBindings(instance);
      }, this);

      if (this.instancePositionChangedFn_)
        this.reportInstancesMoved(splices);
    },

    reportInstanceMoved: function(index) {
      var instance = this.instances[index];
      if (instance === emptyInstance)
        return;

      this.instancePositionChangedFn_(instance.templateInstance_, index);
    },

    reportInstancesMoved: function(splices) {
      var index = 0;
      var offset = 0;
      for (var i = 0; i < splices.length; i++) {
        var splice = splices[i];
        if (offset != 0) {
          while (index < splice.index) {
            this.reportInstanceMoved(index);
            index++;
          }
        } else {
          index = splice.index;
        }

        while (index < splice.index + splice.addedCount) {
          this.reportInstanceMoved(index);
          index++;
        }

        offset += splice.addedCount - splice.removed.length;
      }

      if (offset == 0)
        return;

      var length = this.instances.length;
      while (index < length) {
        this.reportInstanceMoved(index);
        index++;
      }
    },

    closeInstanceBindings: function(instance) {
      var bindings = instance.bindings_;
      for (var i = 0; i < bindings.length; i++) {
        bindings[i].close();
      }
    },

    unobserve: function() {
      if (!this.arrayObserver)
        return;

      this.arrayObserver.close();
      this.arrayObserver = undefined;
    },

    close: function() {
      if (this.closed)
        return;
      this.unobserve();
      for (var i = 0; i < this.instances.length; i++) {
        this.closeInstanceBindings(this.instances[i]);
      }

      this.instances.length = 0;
      this.closeDeps();
      this.templateElement_.iterator_ = undefined;
      this.closed = true;
    }
  };

  // Polyfill-specific API.
  HTMLTemplateElement.forAllTemplatesFrom_ = forAllTemplatesFrom;
})(this);

(function(scope) {
  'use strict';

  // feature detect for URL constructor
  var hasWorkingUrl = false;
  if (!scope.forceJURL) {
    try {
      var u = new URL('b', 'http://a');
      u.pathname = 'c%20d';
      hasWorkingUrl = u.href === 'http://a/c%20d';
    } catch(e) {}
  }

  if (hasWorkingUrl)
    return;

  var relative = Object.create(null);
  relative['ftp'] = 21;
  relative['file'] = 0;
  relative['gopher'] = 70;
  relative['http'] = 80;
  relative['https'] = 443;
  relative['ws'] = 80;
  relative['wss'] = 443;

  var relativePathDotMapping = Object.create(null);
  relativePathDotMapping['%2e'] = '.';
  relativePathDotMapping['.%2e'] = '..';
  relativePathDotMapping['%2e.'] = '..';
  relativePathDotMapping['%2e%2e'] = '..';

  function isRelativeScheme(scheme) {
    return relative[scheme] !== undefined;
  }

  function invalid() {
    clear.call(this);
    this._isInvalid = true;
  }

  function IDNAToASCII(h) {
    if ('' == h) {
      invalid.call(this)
    }
    // XXX
    return h.toLowerCase()
  }

  function percentEscape(c) {
    var unicode = c.charCodeAt(0);
    if (unicode > 0x20 &&
       unicode < 0x7F &&
       // " # < > ? `
       [0x22, 0x23, 0x3C, 0x3E, 0x3F, 0x60].indexOf(unicode) == -1
      ) {
      return c;
    }
    return encodeURIComponent(c);
  }

  function percentEscapeQuery(c) {
    // XXX This actually needs to encode c using encoding and then
    // convert the bytes one-by-one.

    var unicode = c.charCodeAt(0);
    if (unicode > 0x20 &&
       unicode < 0x7F &&
       // " # < > ` (do not escape '?')
       [0x22, 0x23, 0x3C, 0x3E, 0x60].indexOf(unicode) == -1
      ) {
      return c;
    }
    return encodeURIComponent(c);
  }

  var EOF = undefined,
      ALPHA = /[a-zA-Z]/,
      ALPHANUMERIC = /[a-zA-Z0-9\+\-\.]/;

  function parse(input, stateOverride, base) {
    function err(message) {
      errors.push(message)
    }

    var state = stateOverride || 'scheme start',
        cursor = 0,
        buffer = '',
        seenAt = false,
        seenBracket = false,
        errors = [];

    loop: while ((input[cursor - 1] != EOF || cursor == 0) && !this._isInvalid) {
      var c = input[cursor];
      switch (state) {
        case 'scheme start':
          if (c && ALPHA.test(c)) {
            buffer += c.toLowerCase(); // ASCII-safe
            state = 'scheme';
          } else if (!stateOverride) {
            buffer = '';
            state = 'no scheme';
            continue;
          } else {
            err('Invalid scheme.');
            break loop;
          }
          break;

        case 'scheme':
          if (c && ALPHANUMERIC.test(c)) {
            buffer += c.toLowerCase(); // ASCII-safe
          } else if (':' == c) {
            this._scheme = buffer;
            buffer = '';
            if (stateOverride) {
              break loop;
            }
            if (isRelativeScheme(this._scheme)) {
              this._isRelative = true;
            }
            if ('file' == this._scheme) {
              state = 'relative';
            } else if (this._isRelative && base && base._scheme == this._scheme) {
              state = 'relative or authority';
            } else if (this._isRelative) {
              state = 'authority first slash';
            } else {
              state = 'scheme data';
            }
          } else if (!stateOverride) {
            buffer = '';
            cursor = 0;
            state = 'no scheme';
            continue;
          } else if (EOF == c) {
            break loop;
          } else {
            err('Code point not allowed in scheme: ' + c)
            break loop;
          }
          break;

        case 'scheme data':
          if ('?' == c) {
            query = '?';
            state = 'query';
          } else if ('#' == c) {
            this._fragment = '#';
            state = 'fragment';
          } else {
            // XXX error handling
            if (EOF != c && '\t' != c && '\n' != c && '\r' != c) {
              this._schemeData += percentEscape(c);
            }
          }
          break;

        case 'no scheme':
          if (!base || !(isRelativeScheme(base._scheme))) {
            err('Missing scheme.');
            invalid.call(this);
          } else {
            state = 'relative';
            continue;
          }
          break;

        case 'relative or authority':
          if ('/' == c && '/' == input[cursor+1]) {
            state = 'authority ignore slashes';
          } else {
            err('Expected /, got: ' + c);
            state = 'relative';
            continue
          }
          break;

        case 'relative':
          this._isRelative = true;
          if ('file' != this._scheme)
            this._scheme = base._scheme;
          if (EOF == c) {
            this._host = base._host;
            this._port = base._port;
            this._path = base._path.slice();
            this._query = base._query;
            break loop;
          } else if ('/' == c || '\\' == c) {
            if ('\\' == c)
              err('\\ is an invalid code point.');
            state = 'relative slash';
          } else if ('?' == c) {
            this._host = base._host;
            this._port = base._port;
            this._path = base._path.slice();
            this._query = '?';
            state = 'query';
          } else if ('#' == c) {
            this._host = base._host;
            this._port = base._port;
            this._path = base._path.slice();
            this._query = base._query;
            this._fragment = '#';
            state = 'fragment';
          } else {
            var nextC = input[cursor+1]
            var nextNextC = input[cursor+2]
            if (
              'file' != this._scheme || !ALPHA.test(c) ||
              (nextC != ':' && nextC != '|') ||
              (EOF != nextNextC && '/' != nextNextC && '\\' != nextNextC && '?' != nextNextC && '#' != nextNextC)) {
              this._host = base._host;
              this._port = base._port;
              this._path = base._path.slice();
              this._path.pop();
            }
            state = 'relative path';
            continue;
          }
          break;

        case 'relative slash':
          if ('/' == c || '\\' == c) {
            if ('\\' == c) {
              err('\\ is an invalid code point.');
            }
            if ('file' == this._scheme) {
              state = 'file host';
            } else {
              state = 'authority ignore slashes';
            }
          } else {
            if ('file' != this._scheme) {
              this._host = base._host;
              this._port = base._port;
            }
            state = 'relative path';
            continue;
          }
          break;

        case 'authority first slash':
          if ('/' == c) {
            state = 'authority second slash';
          } else {
            err("Expected '/', got: " + c);
            state = 'authority ignore slashes';
            continue;
          }
          break;

        case 'authority second slash':
          state = 'authority ignore slashes';
          if ('/' != c) {
            err("Expected '/', got: " + c);
            continue;
          }
          break;

        case 'authority ignore slashes':
          if ('/' != c && '\\' != c) {
            state = 'authority';
            continue;
          } else {
            err('Expected authority, got: ' + c);
          }
          break;

        case 'authority':
          if ('@' == c) {
            if (seenAt) {
              err('@ already seen.');
              buffer += '%40';
            }
            seenAt = true;
            for (var i = 0; i < buffer.length; i++) {
              var cp = buffer[i];
              if ('\t' == cp || '\n' == cp || '\r' == cp) {
                err('Invalid whitespace in authority.');
                continue;
              }
              // XXX check URL code points
              if (':' == cp && null === this._password) {
                this._password = '';
                continue;
              }
              var tempC = percentEscape(cp);
              (null !== this._password) ? this._password += tempC : this._username += tempC;
            }
            buffer = '';
          } else if (EOF == c || '/' == c || '\\' == c || '?' == c || '#' == c) {
            cursor -= buffer.length;
            buffer = '';
            state = 'host';
            continue;
          } else {
            buffer += c;
          }
          break;

        case 'file host':
          if (EOF == c || '/' == c || '\\' == c || '?' == c || '#' == c) {
            if (buffer.length == 2 && ALPHA.test(buffer[0]) && (buffer[1] == ':' || buffer[1] == '|')) {
              state = 'relative path';
            } else if (buffer.length == 0) {
              state = 'relative path start';
            } else {
              this._host = IDNAToASCII.call(this, buffer);
              buffer = '';
              state = 'relative path start';
            }
            continue;
          } else if ('\t' == c || '\n' == c || '\r' == c) {
            err('Invalid whitespace in file host.');
          } else {
            buffer += c;
          }
          break;

        case 'host':
        case 'hostname':
          if (':' == c && !seenBracket) {
            // XXX host parsing
            this._host = IDNAToASCII.call(this, buffer);
            buffer = '';
            state = 'port';
            if ('hostname' == stateOverride) {
              break loop;
            }
          } else if (EOF == c || '/' == c || '\\' == c || '?' == c || '#' == c) {
            this._host = IDNAToASCII.call(this, buffer);
            buffer = '';
            state = 'relative path start';
            if (stateOverride) {
              break loop;
            }
            continue;
          } else if ('\t' != c && '\n' != c && '\r' != c) {
            if ('[' == c) {
              seenBracket = true;
            } else if (']' == c) {
              seenBracket = false;
            }
            buffer += c;
          } else {
            err('Invalid code point in host/hostname: ' + c);
          }
          break;

        case 'port':
          if (/[0-9]/.test(c)) {
            buffer += c;
          } else if (EOF == c || '/' == c || '\\' == c || '?' == c || '#' == c || stateOverride) {
            if ('' != buffer) {
              var temp = parseInt(buffer, 10);
              if (temp != relative[this._scheme]) {
                this._port = temp + '';
              }
              buffer = '';
            }
            if (stateOverride) {
              break loop;
            }
            state = 'relative path start';
            continue;
          } else if ('\t' == c || '\n' == c || '\r' == c) {
            err('Invalid code point in port: ' + c);
          } else {
            invalid.call(this);
          }
          break;

        case 'relative path start':
          if ('\\' == c)
            err("'\\' not allowed in path.");
          state = 'relative path';
          if ('/' != c && '\\' != c) {
            continue;
          }
          break;

        case 'relative path':
          if (EOF == c || '/' == c || '\\' == c || (!stateOverride && ('?' == c || '#' == c))) {
            if ('\\' == c) {
              err('\\ not allowed in relative path.');
            }
            var tmp;
            if (tmp = relativePathDotMapping[buffer.toLowerCase()]) {
              buffer = tmp;
            }
            if ('..' == buffer) {
              this._path.pop();
              if ('/' != c && '\\' != c) {
                this._path.push('');
              }
            } else if ('.' == buffer && '/' != c && '\\' != c) {
              this._path.push('');
            } else if ('.' != buffer) {
              if ('file' == this._scheme && this._path.length == 0 && buffer.length == 2 && ALPHA.test(buffer[0]) && buffer[1] == '|') {
                buffer = buffer[0] + ':';
              }
              this._path.push(buffer);
            }
            buffer = '';
            if ('?' == c) {
              this._query = '?';
              state = 'query';
            } else if ('#' == c) {
              this._fragment = '#';
              state = 'fragment';
            }
          } else if ('\t' != c && '\n' != c && '\r' != c) {
            buffer += percentEscape(c);
          }
          break;

        case 'query':
          if (!stateOverride && '#' == c) {
            this._fragment = '#';
            state = 'fragment';
          } else if (EOF != c && '\t' != c && '\n' != c && '\r' != c) {
            this._query += percentEscapeQuery(c);
          }
          break;

        case 'fragment':
          if (EOF != c && '\t' != c && '\n' != c && '\r' != c) {
            this._fragment += c;
          }
          break;
      }

      cursor++;
    }
  }

  function clear() {
    this._scheme = '';
    this._schemeData = '';
    this._username = '';
    this._password = null;
    this._host = '';
    this._port = '';
    this._path = [];
    this._query = '';
    this._fragment = '';
    this._isInvalid = false;
    this._isRelative = false;
  }

  // Does not process domain names or IP addresses.
  // Does not handle encoding for the query parameter.
  function jURL(url, base /* , encoding */) {
    if (base !== undefined && !(base instanceof jURL))
      base = new jURL(String(base));

    this._url = url;
    clear.call(this);

    var input = url.replace(/^[ \t\r\n\f]+|[ \t\r\n\f]+$/g, '');
    // encoding = encoding || 'utf-8'

    parse.call(this, input, null, base);
  }

  jURL.prototype = {
    get href() {
      if (this._isInvalid)
        return this._url;

      var authority = '';
      if ('' != this._username || null != this._password) {
        authority = this._username +
            (null != this._password ? ':' + this._password : '') + '@';
      }

      return this.protocol +
          (this._isRelative ? '//' + authority + this.host : '') +
          this.pathname + this._query + this._fragment;
    },
    set href(href) {
      clear.call(this);
      parse.call(this, href);
    },

    get protocol() {
      return this._scheme + ':';
    },
    set protocol(protocol) {
      if (this._isInvalid)
        return;
      parse.call(this, protocol + ':', 'scheme start');
    },

    get host() {
      return this._isInvalid ? '' : this._port ?
          this._host + ':' + this._port : this._host;
    },
    set host(host) {
      if (this._isInvalid || !this._isRelative)
        return;
      parse.call(this, host, 'host');
    },

    get hostname() {
      return this._host;
    },
    set hostname(hostname) {
      if (this._isInvalid || !this._isRelative)
        return;
      parse.call(this, hostname, 'hostname');
    },

    get port() {
      return this._port;
    },
    set port(port) {
      if (this._isInvalid || !this._isRelative)
        return;
      parse.call(this, port, 'port');
    },

    get pathname() {
      return this._isInvalid ? '' : this._isRelative ?
          '/' + this._path.join('/') : this._schemeData;
    },
    set pathname(pathname) {
      if (this._isInvalid || !this._isRelative)
        return;
      this._path = [];
      parse.call(this, pathname, 'relative path start');
    },

    get search() {
      return this._isInvalid || !this._query || '?' == this._query ?
          '' : this._query;
    },
    set search(search) {
      if (this._isInvalid || !this._isRelative)
        return;
      this._query = '?';
      if ('?' == search[0])
        search = search.slice(1);
      parse.call(this, search, 'query');
    },

    get hash() {
      return this._isInvalid || !this._fragment || '#' == this._fragment ?
          '' : this._fragment;
    },
    set hash(hash) {
      if (this._isInvalid)
        return;
      this._fragment = '#';
      if ('#' == hash[0])
        hash = hash.slice(1);
      parse.call(this, hash, 'fragment');
    },

    get origin() {
      var host;
      if (this._isInvalid || !this._scheme) {
        return '';
      }
      // javascript: Gecko returns String(""), WebKit/Blink String("null")
      // Gecko throws error for "data://"
      // data: Gecko returns "", Blink returns "data://", WebKit returns "null"
      // Gecko returns String("") for file: mailto:
      // WebKit/Blink returns String("SCHEME://") for file: mailto:
      switch (this._scheme) {
        case 'data':
        case 'file':
        case 'javascript':
        case 'mailto':
          return 'null';
      }
      host = this.host;
      if (!host) {
        return '';
      }
      return this._scheme + '://' + host;
    }
  };

  // Copy over the static methods
  var OriginalURL = scope.URL;
  if (OriginalURL) {
    jURL.createObjectURL = function(blob) {
      // IE extension allows a second optional options argument.
      // http://msdn.microsoft.com/en-us/library/ie/hh772302(v=vs.85).aspx
      return OriginalURL.createObjectURL.apply(OriginalURL, arguments);
    };
    jURL.revokeObjectURL = function(url) {
      OriginalURL.revokeObjectURL(url);
    };
  }

  scope.URL = jURL;

})(this);

(function(scope) {

var iterations = 0;
var callbacks = [];
var twiddle = document.createTextNode('');

function endOfMicrotask(callback) {
  twiddle.textContent = iterations++;
  callbacks.push(callback);
}

function atEndOfMicrotask() {
  while (callbacks.length) {
    callbacks.shift()();
  }
}

new (window.MutationObserver || JsMutationObserver)(atEndOfMicrotask)
  .observe(twiddle, {characterData: true})
  ;

// exports
scope.endOfMicrotask = endOfMicrotask;
// bc 
Platform.endOfMicrotask = endOfMicrotask;

})(Polymer);


(function(scope) {

/**
 * @class Polymer
 */

// imports
var endOfMicrotask = scope.endOfMicrotask;

// logging
var log = window.WebComponents ? WebComponents.flags.log : {};

// inject style sheet
var style = document.createElement('style');
style.textContent = 'template {display: none !important;} /* injected by platform.js */';
var head = document.querySelector('head');
head.insertBefore(style, head.firstChild);


/**
 * Force any pending data changes to be observed before 
 * the next task. Data changes are processed asynchronously but are guaranteed
 * to be processed, for example, before painting. This method should rarely be 
 * needed. It does nothing when Object.observe is available; 
 * when Object.observe is not available, Polymer automatically flushes data 
 * changes approximately every 1/10 second. 
 * Therefore, `flush` should only be used when a data mutation should be 
 * observed sooner than this.
 * 
 * @method flush
 */
// flush (with logging)
var flushing;
function flush() {
  if (!flushing) {
    flushing = true;
    endOfMicrotask(function() {
      flushing = false;
      log.data && console.group('flush');
      Platform.performMicrotaskCheckpoint();
      log.data && console.groupEnd();
    });
  }
};

// polling dirty checker
// flush periodically if platform does not have object observe.
if (!Observer.hasObjectObserve) {
  var FLUSH_POLL_INTERVAL = 125;
  window.addEventListener('WebComponentsReady', function() {
    flush();
    // watch document visiblity to toggle dirty-checking
    var visibilityHandler = function() {
      // only flush if the page is visibile
      if (document.visibilityState === 'hidden') {
        if (scope.flushPoll) {
          clearInterval(scope.flushPoll);
        }
      } else {
        scope.flushPoll = setInterval(flush, FLUSH_POLL_INTERVAL);
      }
    };
    if (typeof document.visibilityState === 'string') {
      document.addEventListener('visibilitychange', visibilityHandler);
    }
    visibilityHandler();
  });
} else {
  // make flush a no-op when we have Object.observe
  flush = function() {};
}

if (window.CustomElements && !CustomElements.useNative) {
  var originalImportNode = Document.prototype.importNode;
  Document.prototype.importNode = function(node, deep) {
    var imported = originalImportNode.call(this, node, deep);
    CustomElements.upgradeAll(imported);
    return imported;
  };
}

// exports
scope.flush = flush;
// bc
Platform.flush = flush;

})(window.Polymer);


(function(scope) {

var urlResolver = {
  resolveDom: function(root, url) {
    url = url || baseUrl(root);
    this.resolveAttributes(root, url);
    this.resolveStyles(root, url);
    // handle template.content
    var templates = root.querySelectorAll('template');
    if (templates) {
      for (var i = 0, l = templates.length, t; (i < l) && (t = templates[i]); i++) {
        if (t.content) {
          this.resolveDom(t.content, url);
        }
      }
    }
  },
  resolveTemplate: function(template) {
    this.resolveDom(template.content, baseUrl(template));
  },
  resolveStyles: function(root, url) {
    var styles = root.querySelectorAll('style');
    if (styles) {
      for (var i = 0, l = styles.length, s; (i < l) && (s = styles[i]); i++) {
        this.resolveStyle(s, url);
      }
    }
  },
  resolveStyle: function(style, url) {
    url = url || baseUrl(style);
    style.textContent = this.resolveCssText(style.textContent, url);
  },
  resolveCssText: function(cssText, baseUrl, keepAbsolute) {
    cssText = replaceUrlsInCssText(cssText, baseUrl, keepAbsolute, CSS_URL_REGEXP);
    return replaceUrlsInCssText(cssText, baseUrl, keepAbsolute, CSS_IMPORT_REGEXP);
  },
  resolveAttributes: function(root, url) {
    if (root.hasAttributes && root.hasAttributes()) {
      this.resolveElementAttributes(root, url);
    }
    // search for attributes that host urls
    var nodes = root && root.querySelectorAll(URL_ATTRS_SELECTOR);
    if (nodes) {
      for (var i = 0, l = nodes.length, n; (i < l) && (n = nodes[i]); i++) {
        this.resolveElementAttributes(n, url);
      }
    }
  },
  resolveElementAttributes: function(node, url) {
    url = url || baseUrl(node);
    URL_ATTRS.forEach(function(v) {
      var attr = node.attributes[v];
      var value = attr && attr.value;
      var replacement;
      if (value && value.search(URL_TEMPLATE_SEARCH) < 0) {
        if (v === 'style') {
          replacement = replaceUrlsInCssText(value, url, false, CSS_URL_REGEXP);
        } else {
          replacement = resolveRelativeUrl(url, value);
        }
        attr.value = replacement;
      }
    });
  }
};

var CSS_URL_REGEXP = /(url\()([^)]*)(\))/g;
var CSS_IMPORT_REGEXP = /(@import[\s]+(?!url\())([^;]*)(;)/g;
var URL_ATTRS = ['href', 'src', 'action', 'style', 'url'];
var URL_ATTRS_SELECTOR = '[' + URL_ATTRS.join('],[') + ']';
var URL_TEMPLATE_SEARCH = '{{.*}}';
var URL_HASH = '#';

function baseUrl(node) {
  var u = new URL(node.ownerDocument.baseURI);
  u.search = '';
  u.hash = '';
  return u;
}

function replaceUrlsInCssText(cssText, baseUrl, keepAbsolute, regexp) {
  return cssText.replace(regexp, function(m, pre, url, post) {
    var urlPath = url.replace(/["']/g, '');
    urlPath = resolveRelativeUrl(baseUrl, urlPath, keepAbsolute);
    return pre + '\'' + urlPath + '\'' + post;
  });
}

function resolveRelativeUrl(baseUrl, url, keepAbsolute) {
  // do not resolve '/' absolute urls
  if (url && url[0] === '/') {
    return url;
  }
  // do not resolve '#' links, they are used for routing
  if (url && url[0] === '#') {
    return url;
  }
  var u = new URL(url, baseUrl);
  return keepAbsolute ? u.href : makeDocumentRelPath(u.href);
}

function makeDocumentRelPath(url) {
  var root = baseUrl(document.documentElement);
  var u = new URL(url, root);
  if (u.host === root.host && u.port === root.port &&
      u.protocol === root.protocol) {
    return makeRelPath(root, u);
  } else {
    return url;
  }
}

// make a relative path from source to target
function makeRelPath(sourceUrl, targetUrl) {
  var source = sourceUrl.pathname;
  var target = targetUrl.pathname;
  var s = source.split('/');
  var t = target.split('/');
  while (s.length && s[0] === t[0]){
    s.shift();
    t.shift();
  }
  for (var i = 0, l = s.length - 1; i < l; i++) {
    t.unshift('..');
  }
  // empty '#' is discarded but we need to preserve it.
  var hash = (targetUrl.href.slice(-1) === URL_HASH) ? URL_HASH : targetUrl.hash;
  return t.join('/') + targetUrl.search + hash;
}

// exports
scope.urlResolver = urlResolver;

})(Polymer);

(function(scope) {
  var endOfMicrotask = Polymer.endOfMicrotask;

  // Generic url loader
  function Loader(regex) {
    this.cache = Object.create(null);
    this.map = Object.create(null);
    this.requests = 0;
    this.regex = regex;
  }
  Loader.prototype = {

    // TODO(dfreedm): there may be a better factoring here
    // extract absolute urls from the text (full of relative urls)
    extractUrls: function(text, base) {
      var matches = [];
      var matched, u;
      while ((matched = this.regex.exec(text))) {
        u = new URL(matched[1], base);
        matches.push({matched: matched[0], url: u.href});
      }
      return matches;
    },
    // take a text blob, a root url, and a callback and load all the urls found within the text
    // returns a map of absolute url to text
    process: function(text, root, callback) {
      var matches = this.extractUrls(text, root);

      // every call to process returns all the text this loader has ever received
      var done = callback.bind(null, this.map);
      this.fetch(matches, done);
    },
    // build a mapping of url -> text from matches
    fetch: function(matches, callback) {
      var inflight = matches.length;

      // return early if there is no fetching to be done
      if (!inflight) {
        return callback();
      }

      // wait for all subrequests to return
      var done = function() {
        if (--inflight === 0) {
          callback();
        }
      };

      // start fetching all subrequests
      var m, req, url;
      for (var i = 0; i < inflight; i++) {
        m = matches[i];
        url = m.url;
        req = this.cache[url];
        // if this url has already been requested, skip requesting it again
        if (!req) {
          req = this.xhr(url);
          req.match = m;
          this.cache[url] = req;
        }
        // wait for the request to process its subrequests
        req.wait(done);
      }
    },
    handleXhr: function(request) {
      var match = request.match;
      var url = match.url;

      // handle errors with an empty string
      var response = request.response || request.responseText || '';
      this.map[url] = response;
      this.fetch(this.extractUrls(response, url), request.resolve);
    },
    xhr: function(url) {
      this.requests++;
      var request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.send();
      request.onerror = request.onload = this.handleXhr.bind(this, request);

      // queue of tasks to run after XHR returns
      request.pending = [];
      request.resolve = function() {
        var pending = request.pending;
        for(var i = 0; i < pending.length; i++) {
          pending[i]();
        }
        request.pending = null;
      };

      // if we have already resolved, pending is null, async call the callback
      request.wait = function(fn) {
        if (request.pending) {
          request.pending.push(fn);
        } else {
          endOfMicrotask(fn);
        }
      };

      return request;
    }
  };

  scope.Loader = Loader;
})(Polymer);

(function(scope) {

var urlResolver = scope.urlResolver;
var Loader = scope.Loader;

function StyleResolver() {
  this.loader = new Loader(this.regex);
}
StyleResolver.prototype = {
  regex: /@import\s+(?:url)?["'\(]*([^'"\)]*)['"\)]*;/g,
  // Recursively replace @imports with the text at that url
  resolve: function(text, url, callback) {
    var done = function(map) {
      callback(this.flatten(text, url, map));
    }.bind(this);
    this.loader.process(text, url, done);
  },
  // resolve the textContent of a style node
  resolveNode: function(style, url, callback) {
    var text = style.textContent;
    var done = function(text) {
      style.textContent = text;
      callback(style);
    };
    this.resolve(text, url, done);
  },
  // flatten all the @imports to text
  flatten: function(text, base, map) {
    var matches = this.loader.extractUrls(text, base);
    var match, url, intermediate;
    for (var i = 0; i < matches.length; i++) {
      match = matches[i];
      url = match.url;
      // resolve any css text to be relative to the importer, keep absolute url
      intermediate = urlResolver.resolveCssText(map[url], url, true);
      // flatten intermediate @imports
      intermediate = this.flatten(intermediate, base, map);
      text = text.replace(match.matched, intermediate);
    }
    return text;
  },
  loadStyles: function(styles, base, callback) {
    var loaded=0, l = styles.length;
    // called in the context of the style
    function loadedStyle(style) {
      loaded++;
      if (loaded === l && callback) {
        callback();
      }
    }
    for (var i=0, s; (i<l) && (s=styles[i]); i++) {
      this.resolveNode(s, base, loadedStyle);
    }
  }
};

var styleResolver = new StyleResolver();

// exports
scope.styleResolver = styleResolver;

})(Polymer);

(function(scope) {

  // copy own properties from 'api' to 'prototype, with name hinting for 'super'
  function extend(prototype, api) {
    if (prototype && api) {
      // use only own properties of 'api'
      Object.getOwnPropertyNames(api).forEach(function(n) {
        // acquire property descriptor
        var pd = Object.getOwnPropertyDescriptor(api, n);
        if (pd) {
          // clone property via descriptor
          Object.defineProperty(prototype, n, pd);
          // cache name-of-method for 'super' engine
          if (typeof pd.value == 'function') {
            // hint the 'super' engine
            pd.value.nom = n;
          }
        }
      });
    }
    return prototype;
  }


  // mixin

  // copy all properties from inProps (et al) to inObj
  function mixin(inObj/*, inProps, inMoreProps, ...*/) {
    var obj = inObj || {};
    for (var i = 1; i < arguments.length; i++) {
      var p = arguments[i];
      try {
        for (var n in p) {
          copyProperty(n, p, obj);
        }
      } catch(x) {
      }
    }
    return obj;
  }

  // copy property inName from inSource object to inTarget object
  function copyProperty(inName, inSource, inTarget) {
    var pd = getPropertyDescriptor(inSource, inName);
    Object.defineProperty(inTarget, inName, pd);
  }

  // get property descriptor for inName on inObject, even if
  // inName exists on some link in inObject's prototype chain
  function getPropertyDescriptor(inObject, inName) {
    if (inObject) {
      var pd = Object.getOwnPropertyDescriptor(inObject, inName);
      return pd || getPropertyDescriptor(Object.getPrototypeOf(inObject), inName);
    }
  }

  // exports

  scope.extend = extend;
  scope.mixin = mixin;

  // for bc
  Platform.mixin = mixin;

})(Polymer);

(function(scope) {
  
  // usage
  
  // invoke cb.call(this) in 100ms, unless the job is re-registered,
  // which resets the timer
  // 
  // this.myJob = this.job(this.myJob, cb, 100)
  //
  // returns a job handle which can be used to re-register a job

  var Job = function(inContext) {
    this.context = inContext;
    this.boundComplete = this.complete.bind(this)
  };
  Job.prototype = {
    go: function(callback, wait) {
      this.callback = callback;
      var h;
      if (!wait) {
        h = requestAnimationFrame(this.boundComplete);
        this.handle = function() {
          cancelAnimationFrame(h);
        }
      } else {
        h = setTimeout(this.boundComplete, wait);
        this.handle = function() {
          clearTimeout(h);
        }
      }
    },
    stop: function() {
      if (this.handle) {
        this.handle();
        this.handle = null;
      }
    },
    complete: function() {
      if (this.handle) {
        this.stop();
        this.callback.call(this.context);
      }
    }
  };
  
  function job(job, callback, wait) {
    if (job) {
      job.stop();
    } else {
      job = new Job(this);
    }
    job.go(callback, wait);
    return job;
  }
  
  // exports 

  scope.job = job;
  
})(Polymer);

(function(scope) {

  // dom polyfill, additions, and utility methods

  var registry = {};

  HTMLElement.register = function(tag, prototype) {
    registry[tag] = prototype;
  };

  // get prototype mapped to node <tag>
  HTMLElement.getPrototypeForTag = function(tag) {
    var prototype = !tag ? HTMLElement.prototype : registry[tag];
    // TODO(sjmiles): creating <tag> is likely to have wasteful side-effects
    return prototype || Object.getPrototypeOf(document.createElement(tag));
  };

  // we have to flag propagation stoppage for the event dispatcher
  var originalStopPropagation = Event.prototype.stopPropagation;
  Event.prototype.stopPropagation = function() {
    this.cancelBubble = true;
    originalStopPropagation.apply(this, arguments);
  };
  
  
  // polyfill DOMTokenList
  // * add/remove: allow these methods to take multiple classNames
  // * toggle: add a 2nd argument which forces the given state rather
  //  than toggling.

  var add = DOMTokenList.prototype.add;
  var remove = DOMTokenList.prototype.remove;
  DOMTokenList.prototype.add = function() {
    for (var i = 0; i < arguments.length; i++) {
      add.call(this, arguments[i]);
    }
  };
  DOMTokenList.prototype.remove = function() {
    for (var i = 0; i < arguments.length; i++) {
      remove.call(this, arguments[i]);
    }
  };
  DOMTokenList.prototype.toggle = function(name, bool) {
    if (arguments.length == 1) {
      bool = !this.contains(name);
    }
    bool ? this.add(name) : this.remove(name);
  };
  DOMTokenList.prototype.switch = function(oldName, newName) {
    oldName && this.remove(oldName);
    newName && this.add(newName);
  };

  // add array() to NodeList, NamedNodeMap, HTMLCollection

  var ArraySlice = function() {
    return Array.prototype.slice.call(this);
  };

  var namedNodeMap = (window.NamedNodeMap || window.MozNamedAttrMap || {});

  NodeList.prototype.array = ArraySlice;
  namedNodeMap.prototype.array = ArraySlice;
  HTMLCollection.prototype.array = ArraySlice;

  // utility

  function createDOM(inTagOrNode, inHTML, inAttrs) {
    var dom = typeof inTagOrNode == 'string' ?
        document.createElement(inTagOrNode) : inTagOrNode.cloneNode(true);
    dom.innerHTML = inHTML;
    if (inAttrs) {
      for (var n in inAttrs) {
        dom.setAttribute(n, inAttrs[n]);
      }
    }
    return dom;
  }

  // exports

  scope.createDOM = createDOM;

})(Polymer);

(function(scope) {
    // super

    // `arrayOfArgs` is an optional array of args like one might pass
    // to `Function.apply`

    // TODO(sjmiles):
    //    $super must be installed on an instance or prototype chain
    //    as `super`, and invoked via `this`, e.g.
    //      `this.super();`

    //    will not work if function objects are not unique, for example,
    //    when using mixins.
    //    The memoization strategy assumes each function exists on only one 
    //    prototype chain i.e. we use the function object for memoizing)
    //    perhaps we can bookkeep on the prototype itself instead
    function $super(arrayOfArgs) {
      // since we are thunking a method call, performance is important here: 
      // memoize all lookups, once memoized the fast path calls no other 
      // functions
      //
      // find the caller (cannot be `strict` because of 'caller')
      var caller = $super.caller;
      // memoized 'name of method' 
      var nom = caller.nom;
      // memoized next implementation prototype
      var _super = caller._super;
      if (!_super) {
        if (!nom) {
          nom = caller.nom = nameInThis.call(this, caller);
        }
        if (!nom) {
          console.warn('called super() on a method not installed declaratively (has no .nom property)');
        }
        // super prototype is either cached or we have to find it
        // by searching __proto__ (at the 'top')
        // invariant: because we cache _super on fn below, we never reach 
        // here from inside a series of calls to super(), so it's ok to 
        // start searching from the prototype of 'this' (at the 'top')
        // we must never memoize a null super for this reason
        _super = memoizeSuper(caller, nom, getPrototypeOf(this));
      }
      // our super function
      var fn = _super[nom];
      if (fn) {
        // memoize information so 'fn' can call 'super'
        if (!fn._super) {
          // must not memoize null, or we lose our invariant above
          memoizeSuper(fn, nom, _super);
        }
        // invoke the inherited method
        // if 'fn' is not function valued, this will throw
        return fn.apply(this, arrayOfArgs || []);
      }
    }

    function nameInThis(value) {
      var p = this.__proto__;
      while (p && p !== HTMLElement.prototype) {
        // TODO(sjmiles): getOwnPropertyNames is absurdly expensive
        var n$ = Object.getOwnPropertyNames(p);
        for (var i=0, l=n$.length, n; i<l && (n=n$[i]); i++) {
          var d = Object.getOwnPropertyDescriptor(p, n);
          if (typeof d.value === 'function' && d.value === value) {
            return n;
          }
        }
        p = p.__proto__;
      }
    }

    function memoizeSuper(method, name, proto) {
      // find and cache next prototype containing `name`
      // we need the prototype so we can do another lookup
      // from here
      var s = nextSuper(proto, name, method);
      if (s[name]) {
        // `s` is a prototype, the actual method is `s[name]`
        // tag super method with it's name for quicker lookups
        s[name].nom = name;
      }
      return method._super = s;
    }

    function nextSuper(proto, name, caller) {
      // look for an inherited prototype that implements name
      while (proto) {
        if ((proto[name] !== caller) && proto[name]) {
          return proto;
        }
        proto = getPrototypeOf(proto);
      }
      // must not return null, or we lose our invariant above
      // in this case, a super() call was invoked where no superclass
      // method exists
      // TODO(sjmiles): thow an exception?
      return Object;
    }

    // NOTE: In some platforms (IE10) the prototype chain is faked via 
    // __proto__. Therefore, always get prototype via __proto__ instead of
    // the more standard Object.getPrototypeOf.
    function getPrototypeOf(prototype) {
      return prototype.__proto__;
    }

    // utility function to precompute name tags for functions
    // in a (unchained) prototype
    function hintSuper(prototype) {
      // tag functions with their prototype name to optimize
      // super call invocations
      for (var n in prototype) {
        var pd = Object.getOwnPropertyDescriptor(prototype, n);
        if (pd && typeof pd.value === 'function') {
          pd.value.nom = n;
        }
      }
    }

    // exports

    scope.super = $super;

})(Polymer);

(function(scope) {

  function noopHandler(value) {
    return value;
  }

  // helper for deserializing properties of various types to strings
  var typeHandlers = {
    string: noopHandler,
    'undefined': noopHandler,
    date: function(value) {
      return new Date(Date.parse(value) || Date.now());
    },
    boolean: function(value) {
      if (value === '') {
        return true;
      }
      return value === 'false' ? false : !!value;
    },
    number: function(value) {
      var n = parseFloat(value);
      // hex values like "0xFFFF" parseFloat as 0
      if (n === 0) {
        n = parseInt(value);
      }
      return isNaN(n) ? value : n;
      // this code disabled because encoded values (like "0xFFFF")
      // do not round trip to their original format
      //return (String(floatVal) === value) ? floatVal : value;
    },
    object: function(value, currentValue) {
      if (currentValue === null) {
        return value;
      }
      try {
        // If the string is an object, we can parse is with the JSON library.
        // include convenience replace for single-quotes. If the author omits
        // quotes altogether, parse will fail.
        return JSON.parse(value.replace(/'/g, '"'));
      } catch(e) {
        // The object isn't valid JSON, return the raw value
        return value;
      }
    },
    // avoid deserialization of functions
    'function': function(value, currentValue) {
      return currentValue;
    }
  };

  function deserializeValue(value, currentValue) {
    // attempt to infer type from default value
    var inferredType = typeof currentValue;
    // invent 'date' type value for Date
    if (currentValue instanceof Date) {
      inferredType = 'date';
    }
    // delegate deserialization via type string
    return typeHandlers[inferredType](value, currentValue);
  }

  // exports

  scope.deserializeValue = deserializeValue;

})(Polymer);

(function(scope) {

  // imports

  var extend = scope.extend;

  // module

  var api = {};

  api.declaration = {};
  api.instance = {};

  api.publish = function(apis, prototype) {
    for (var n in apis) {
      extend(prototype, apis[n]);
    }
  };

  // exports

  scope.api = api;

})(Polymer);

(function(scope) {

  /**
   * @class polymer-base
   */

  var utils = {

    /**
      * Invokes a function asynchronously. The context of the callback
      * function is bound to 'this' automatically. Returns a handle which may 
      * be passed to <a href="#cancelAsync">cancelAsync</a> to cancel the 
      * asynchronous call.
      *
      * @method async
      * @param {Function|String} method
      * @param {any|Array} args
      * @param {number} timeout
      */
    async: function(method, args, timeout) {
      // when polyfilling Object.observe, ensure changes 
      // propagate before executing the async method
      Polymer.flush();
      // second argument to `apply` must be an array
      args = (args && args.length) ? args : [args];
      // function to invoke
      var fn = function() {
        (this[method] || method).apply(this, args);
      }.bind(this);
      // execute `fn` sooner or later
      var handle = timeout ? setTimeout(fn, timeout) :
          requestAnimationFrame(fn);
      // NOTE: switch on inverting handle to determine which time is used.
      return timeout ? handle : ~handle;
    },

    /**
      * Cancels a pending callback that was scheduled via 
      * <a href="#async">async</a>. 
      *
      * @method cancelAsync
      * @param {handle} handle Handle of the `async` to cancel.
      */
    cancelAsync: function(handle) {
      if (handle < 0) {
        cancelAnimationFrame(~handle);
      } else {
        clearTimeout(handle);
      }
    },

    /**
      * Fire an event.
      *
      * @method fire
      * @returns {Object} event
      * @param {string} type An event name.
      * @param {any} detail
      * @param {Node} onNode Target node.
      * @param {Boolean} bubbles Set false to prevent bubbling, defaults to true
      * @param {Boolean} cancelable Set false to prevent cancellation, defaults to true
      */
    fire: function(type, detail, onNode, bubbles, cancelable) {
      var node = onNode || this;
      var detail = detail === null || detail === undefined ? {} : detail;
      var event = new CustomEvent(type, {
        bubbles: bubbles !== undefined ? bubbles : true,
        cancelable: cancelable !== undefined ? cancelable : true,
        detail: detail
      });
      node.dispatchEvent(event);
      return event;
    },

    /**
      * Fire an event asynchronously.
      *
      * @method asyncFire
      * @param {string} type An event name.
      * @param detail
      * @param {Node} toNode Target node.
      */
    asyncFire: function(/*inType, inDetail*/) {
      this.async("fire", arguments);
    },

    /**
      * Remove class from old, add class to anew, if they exist.
      *
      * @param classFollows
      * @param anew A node.
      * @param old A node
      * @param className
      */
    classFollows: function(anew, old, className) {
      if (old) {
        old.classList.remove(className);
      }
      if (anew) {
        anew.classList.add(className);
      }
    },

    /**
      * Inject HTML which contains markup bound to this element into
      * a target element (replacing target element content).
      *
      * @param String html to inject
      * @param Element target element
      */
    injectBoundHTML: function(html, element) {
      var template = document.createElement('template');
      template.innerHTML = html;
      var fragment = this.instanceTemplate(template);
      if (element) {
        element.textContent = '';
        element.appendChild(fragment);
      }
      return fragment;
    }
  };

  // no-operation function for handy stubs
  var nop = function() {};

  // null-object for handy stubs
  var nob = {};

  // deprecated

  utils.asyncMethod = utils.async;

  // exports

  scope.api.instance.utils = utils;
  scope.nop = nop;
  scope.nob = nob;

})(Polymer);

(function(scope) {

  // imports

  var log = window.WebComponents ? WebComponents.flags.log : {};
  var EVENT_PREFIX = 'on-';

  // instance events api
  var events = {
    // read-only
    EVENT_PREFIX: EVENT_PREFIX,
    // event listeners on host
    addHostListeners: function() {
      var events = this.eventDelegates;
      log.events && (Object.keys(events).length > 0) && console.log('[%s] addHostListeners:', this.localName, events);
      // NOTE: host events look like bindings but really are not;
      // (1) we don't want the attribute to be set and (2) we want to support
      // multiple event listeners ('host' and 'instance') and Node.bind
      // by default supports 1 thing being bound.
      for (var type in events) {
        var methodName = events[type];
        PolymerGestures.addEventListener(this, type, this.element.getEventHandler(this, this, methodName));
      }
    },
    // call 'method' or function method on 'obj' with 'args', if the method exists
    dispatchMethod: function(obj, method, args) {
      if (obj) {
        log.events && console.group('[%s] dispatch [%s]', obj.localName, method);
        var fn = typeof method === 'function' ? method : obj[method];
        if (fn) {
          fn[args ? 'apply' : 'call'](obj, args);
        }
        log.events && console.groupEnd();
        // NOTE: dirty check right after calling method to ensure 
        // changes apply quickly; in a very complicated app using high 
        // frequency events, this can be a perf concern; in this case,
        // imperative handlers can be used to avoid flushing.
        Polymer.flush();
      }
    }
  };

  // exports

  scope.api.instance.events = events;

  /**
   * @class Polymer
   */

  /**
   * Add a gesture aware event handler to the given `node`. Can be used 
   * in place of `element.addEventListener` and ensures gestures will function
   * as expected on mobile platforms. Please note that Polymer's declarative
   * event handlers include this functionality by default.
   * 
   * @method addEventListener
   * @param {Node} node node on which to listen
   * @param {String} eventType name of the event
   * @param {Function} handlerFn event handler function
   * @param {Boolean} capture set to true to invoke event capturing
   * @type Function
   */
  // alias PolymerGestures event listener logic
  scope.addEventListener = function(node, eventType, handlerFn, capture) {
    PolymerGestures.addEventListener(wrap(node), eventType, handlerFn, capture);
  };

  /**
   * Remove a gesture aware event handler on the given `node`. To remove an
   * event listener, the exact same arguments are required that were passed
   * to `Polymer.addEventListener`.
   * 
   * @method removeEventListener
   * @param {Node} node node on which to listen
   * @param {String} eventType name of the event
   * @param {Function} handlerFn event handler function
   * @param {Boolean} capture set to true to invoke event capturing
   * @type Function
   */
  scope.removeEventListener = function(node, eventType, handlerFn, capture) {
    PolymerGestures.removeEventListener(wrap(node), eventType, handlerFn, capture);
  };

})(Polymer);

(function(scope) {

  // instance api for attributes

  var attributes = {
    // copy attributes defined in the element declaration to the instance
    // e.g. <polymer-element name="x-foo" tabIndex="0"> tabIndex is copied
    // to the element instance here.
    copyInstanceAttributes: function () {
      var a$ = this._instanceAttributes;
      for (var k in a$) {
        if (!this.hasAttribute(k)) {
          this.setAttribute(k, a$[k]);
        }
      }
    },
    // for each attribute on this, deserialize value to property as needed
    takeAttributes: function() {
      // if we have no publish lookup table, we have no attributes to take
      // TODO(sjmiles): ad hoc
      if (this._publishLC) {
        for (var i=0, a$=this.attributes, l=a$.length, a; (a=a$[i]) && i<l; i++) {
          this.attributeToProperty(a.name, a.value);
        }
      }
    },
    // if attribute 'name' is mapped to a property, deserialize
    // 'value' into that property
    attributeToProperty: function(name, value) {
      // try to match this attribute to a property (attributes are
      // all lower-case, so this is case-insensitive search)
      var name = this.propertyForAttribute(name);
      if (name) {
        // filter out 'mustached' values, these are to be
        // replaced with bound-data and are not yet values
        // themselves
        if (value && value.search(scope.bindPattern) >= 0) {
          return;
        }
        // get original value
        var currentValue = this[name];
        // deserialize Boolean or Number values from attribute
        var value = this.deserializeValue(value, currentValue);
        // only act if the value has changed
        if (value !== currentValue) {
          // install new value (has side-effects)
          this[name] = value;
        }
      }
    },
    // return the published property matching name, or undefined
    propertyForAttribute: function(name) {
      var match = this._publishLC && this._publishLC[name];
      return match;
    },
    // convert representation of `stringValue` based on type of `currentValue`
    deserializeValue: function(stringValue, currentValue) {
      return scope.deserializeValue(stringValue, currentValue);
    },
    // convert to a string value based on the type of `inferredType`
    serializeValue: function(value, inferredType) {
      if (inferredType === 'boolean') {
        return value ? '' : undefined;
      } else if (inferredType !== 'object' && inferredType !== 'function'
          && value !== undefined) {
        return value;
      }
    },
    // serializes `name` property value and updates the corresponding attribute
    // note that reflection is opt-in.
    reflectPropertyToAttribute: function(name) {
      var inferredType = typeof this[name];
      // try to intelligently serialize property value
      var serializedValue = this.serializeValue(this[name], inferredType);
      // boolean properties must reflect as boolean attributes
      if (serializedValue !== undefined) {
        this.setAttribute(name, serializedValue);
        // TODO(sorvell): we should remove attr for all properties
        // that have undefined serialization; however, we will need to
        // refine the attr reflection system to achieve this; pica, for example,
        // relies on having inferredType object properties not removed as
        // attrs.
      } else if (inferredType === 'boolean') {
        this.removeAttribute(name);
      }
    }
  };

  // exports

  scope.api.instance.attributes = attributes;

})(Polymer);

(function(scope) {

  /**
   * @class polymer-base
   */

  // imports

  var log = window.WebComponents ? WebComponents.flags.log : {};

  // magic words

  var OBSERVE_SUFFIX = 'Changed';

  // element api

  var empty = [];

  var updateRecord = {
    object: undefined,
    type: 'update',
    name: undefined,
    oldValue: undefined
  };

  var numberIsNaN = Number.isNaN || function(value) {
    return typeof value === 'number' && isNaN(value);
  };

  function areSameValue(left, right) {
    if (left === right)
      return left !== 0 || 1 / left === 1 / right;
    if (numberIsNaN(left) && numberIsNaN(right))
      return true;
    return left !== left && right !== right;
  }

  // capture A's value if B's value is null or undefined,
  // otherwise use B's value
  function resolveBindingValue(oldValue, value) {
    if (value === undefined && oldValue === null) {
      return value;
    }
    return (value === null || value === undefined) ? oldValue : value;
  }

  var properties = {

    // creates a CompoundObserver to observe property changes
    // NOTE, this is only done there are any properties in the `observe` object
    createPropertyObserver: function() {
      var n$ = this._observeNames;
      if (n$ && n$.length) {
        var o = this._propertyObserver = new CompoundObserver(true);
        this.registerObserver(o);
        // TODO(sorvell): may not be kosher to access the value here (this[n]);
        // previously we looked at the descriptor on the prototype
        // this doesn't work for inheritance and not for accessors without
        // a value property
        for (var i=0, l=n$.length, n; (i<l) && (n=n$[i]); i++) {
          o.addPath(this, n);
          this.observeArrayValue(n, this[n], null);
        }
      }
    },

    // start observing property changes
    openPropertyObserver: function() {
      if (this._propertyObserver) {
        this._propertyObserver.open(this.notifyPropertyChanges, this);
      }
    },

    // handler for property changes; routes changes to observing methods
    // note: array valued properties are observed for array splices
    notifyPropertyChanges: function(newValues, oldValues, paths) {
      var name, method, called = {};
      for (var i in oldValues) {
        // note: paths is of form [object, path, object, path]
        name = paths[2 * i + 1];
        method = this.observe[name];
        if (method) {
          var ov = oldValues[i], nv = newValues[i];
          // observes the value if it is an array
          this.observeArrayValue(name, nv, ov);
          if (!called[method]) {
            // only invoke change method if one of ov or nv is not (undefined | null)
            if ((ov !== undefined && ov !== null) || (nv !== undefined && nv !== null)) {
              called[method] = true;
              // TODO(sorvell): call method with the set of values it's expecting;
              // e.g. 'foo bar': 'invalidate' expects the new and old values for
              // foo and bar. Currently we give only one of these and then
              // deliver all the arguments.
              this.invokeMethod(method, [ov, nv, arguments]);
            }
          }
        }
      }
    },

    // call method iff it exists.
    invokeMethod: function(method, args) {
      var fn = this[method] || method;
      if (typeof fn === 'function') {
        fn.apply(this, args);
      }
    },

    /**
     * Force any pending property changes to synchronously deliver to
     * handlers specified in the `observe` object.
     * Note, normally changes are processed at microtask time.
     *
     * @method deliverChanges
     */
    deliverChanges: function() {
      if (this._propertyObserver) {
        this._propertyObserver.deliver();
      }
    },

    observeArrayValue: function(name, value, old) {
      // we only care if there are registered side-effects
      var callbackName = this.observe[name];
      if (callbackName) {
        // if we are observing the previous value, stop
        if (Array.isArray(old)) {
          log.observe && console.log('[%s] observeArrayValue: unregister observer [%s]', this.localName, name);
          this.closeNamedObserver(name + '__array');
        }
        // if the new value is an array, being observing it
        if (Array.isArray(value)) {
          log.observe && console.log('[%s] observeArrayValue: register observer [%s]', this.localName, name, value);
          var observer = new ArrayObserver(value);
          observer.open(function(splices) {
            this.invokeMethod(callbackName, [splices]);
          }, this);
          this.registerNamedObserver(name + '__array', observer);
        }
      }
    },

    emitPropertyChangeRecord: function(name, value, oldValue) {
      var object = this;
      if (areSameValue(value, oldValue)) {
        return;
      }
      // invoke property change side effects
      this._propertyChanged(name, value, oldValue);
      // emit change record
      if (!Observer.hasObjectObserve) {
        return;
      }
      var notifier = this._objectNotifier;
      if (!notifier) {
        notifier = this._objectNotifier = Object.getNotifier(this);
      }
      updateRecord.object = this;
      updateRecord.name = name;
      updateRecord.oldValue = oldValue;
      notifier.notify(updateRecord);
    },

    _propertyChanged: function(name, value, oldValue) {
      if (this.reflect[name]) {
        this.reflectPropertyToAttribute(name);
      }
    },

    // creates a property binding (called via bind) to a published property.
    bindProperty: function(property, observable, oneTime) {
      if (oneTime) {
        this[property] = observable;
        return;
      }
      var computed = this.element.prototype.computed;
      // Binding an "out-only" value to a computed property. Note that
      // since this observer isn't opened, it doesn't need to be closed on
      // cleanup.
      if (computed && computed[property]) {
        var privateComputedBoundValue = property + 'ComputedBoundObservable_';
        this[privateComputedBoundValue] = observable;
        return;
      }
      return this.bindToAccessor(property, observable, resolveBindingValue);
    },

    // NOTE property `name` must be published. This makes it an accessor.
    bindToAccessor: function(name, observable, resolveFn) {
      var privateName = name + '_';
      var privateObservable  = name + 'Observable_';
      // Present for properties which are computed and published and have a
      // bound value.
      var privateComputedBoundValue = name + 'ComputedBoundObservable_';
      this[privateObservable] = observable;
      var oldValue = this[privateName];
      // observable callback
      var self = this;
      function updateValue(value, oldValue) {
        self[privateName] = value;
        var setObserveable = self[privateComputedBoundValue];
        if (setObserveable && typeof setObserveable.setValue == 'function') {
          setObserveable.setValue(value);
        }
        self.emitPropertyChangeRecord(name, value, oldValue);
      }
      // resolve initial value
      var value = observable.open(updateValue);
      if (resolveFn && !areSameValue(oldValue, value)) {
        var resolvedValue = resolveFn(oldValue, value);
        if (!areSameValue(value, resolvedValue)) {
          value = resolvedValue;
          if (observable.setValue) {
            observable.setValue(value);
          }
        }
      }
      updateValue(value, oldValue);
      // register and return observable
      var observer = {
        close: function() {
          observable.close();
          self[privateObservable] = undefined;
          self[privateComputedBoundValue] = undefined;
        }
      };
      this.registerObserver(observer);
      return observer;
    },

    createComputedProperties: function() {
      if (!this._computedNames) {
        return;
      }
      for (var i = 0; i < this._computedNames.length; i++) {
        var name = this._computedNames[i];
        var expressionText = this.computed[name];
        try {
          var expression = PolymerExpressions.getExpression(expressionText);
          var observable = expression.getBinding(this, this.element.syntax);
          this.bindToAccessor(name, observable);
        } catch (ex) {
          console.error('Failed to create computed property', ex);
        }
      }
    },

    // property bookkeeping
    registerObserver: function(observer) {
      if (!this._observers) {
        this._observers = [observer];
        return;
      }
      this._observers.push(observer);
    },

    closeObservers: function() {
      if (!this._observers) {
        return;
      }
      // observer array items are arrays of observers.
      var observers = this._observers;
      for (var i = 0; i < observers.length; i++) {
        var observer = observers[i];
        if (observer && typeof observer.close == 'function') {
          observer.close();
        }
      }
      this._observers = [];
    },

    // bookkeeping observers for memory management
    registerNamedObserver: function(name, observer) {
      var o$ = this._namedObservers || (this._namedObservers = {});
      o$[name] = observer;
    },

    closeNamedObserver: function(name) {
      var o$ = this._namedObservers;
      if (o$ && o$[name]) {
        o$[name].close();
        o$[name] = null;
        return true;
      }
    },

    closeNamedObservers: function() {
      if (this._namedObservers) {
        for (var i in this._namedObservers) {
          this.closeNamedObserver(i);
        }
        this._namedObservers = {};
      }
    }

  };

  // logging
  var LOG_OBSERVE = '[%s] watching [%s]';
  var LOG_OBSERVED = '[%s#%s] watch: [%s] now [%s] was [%s]';
  var LOG_CHANGED = '[%s#%s] propertyChanged: [%s] now [%s] was [%s]';

  // exports

  scope.api.instance.properties = properties;

})(Polymer);

(function(scope) {

  /**
   * @class polymer-base
   */

  // imports

  var log = window.WebComponents ? WebComponents.flags.log : {};

  // element api supporting mdv
  var mdv = {

    /**
     * Creates dom cloned from the given template, instantiating bindings
     * with this element as the template model and `PolymerExpressions` as the
     * binding delegate.
     *
     * @method instanceTemplate
     * @param {Template} template source template from which to create dom.
     */
    instanceTemplate: function(template) {
      // ensure template is decorated (lets' things like <tr template ...> work)
      HTMLTemplateElement.decorate(template);
      // ensure a default bindingDelegate
      var syntax = this.syntax || (!template.bindingDelegate &&
          this.element.syntax);
      var dom = template.createInstance(this, syntax);
      var observers = dom.bindings_;
      for (var i = 0; i < observers.length; i++) {
        this.registerObserver(observers[i]);
      }
      return dom;
    },

    // Called by TemplateBinding/NodeBind to setup a binding to the given
    // property. It's overridden here to support property bindings
    // in addition to attribute bindings that are supported by default.
    bind: function(name, observable, oneTime) {
      var property = this.propertyForAttribute(name);
      if (!property) {
        // TODO(sjmiles): this mixin method must use the special form
        // of `super` installed by `mixinMethod` in declaration/prototype.js
        return this.mixinSuper(arguments);
      } else {
        // use n-way Polymer binding
        var observer = this.bindProperty(property, observable, oneTime);
        // NOTE: reflecting binding information is typically required only for
        // tooling. It has a performance cost so it's opt-in in Node.bind.
        if (Platform.enableBindingsReflection && observer) {
          observer.path = observable.path_;
          this._recordBinding(property, observer);
        }
        if (this.reflect[property]) {
          this.reflectPropertyToAttribute(property);
        }
        return observer;
      }
    },

    _recordBinding: function(name, observer) {
      this.bindings_ = this.bindings_ || {};
      this.bindings_[name] = observer;
    },

    // Called by TemplateBinding when all bindings on an element have been 
    // executed. This signals that all element inputs have been gathered
    // and it's safe to ready the element, create shadow-root and start
    // data-observation.
    bindFinished: function() {
      this.makeElementReady();
    },

    // called at detached time to signal that an element's bindings should be
    // cleaned up. This is done asynchronously so that users have the chance
    // to call `cancelUnbindAll` to prevent unbinding.
    asyncUnbindAll: function() {
      if (!this._unbound) {
        log.unbind && console.log('[%s] asyncUnbindAll', this.localName);
        this._unbindAllJob = this.job(this._unbindAllJob, this.unbindAll, 0);
      }
    },
    
    /**
     * This method should rarely be used and only if 
     * <a href="#cancelUnbindAll">`cancelUnbindAll`</a> has been called to 
     * prevent element unbinding. In this case, the element's bindings will 
     * not be automatically cleaned up and it cannot be garbage collected 
     * by the system. If memory pressure is a concern or a 
     * large amount of elements need to be managed in this way, `unbindAll`
     * can be called to deactivate the element's bindings and allow its 
     * memory to be reclaimed.
     *
     * @method unbindAll
     */
    unbindAll: function() {
      if (!this._unbound) {
        this.closeObservers();
        this.closeNamedObservers();
        this._unbound = true;
      }
    },

    /**
     * Call in `detached` to prevent the element from unbinding when it is 
     * detached from the dom. The element is unbound as a cleanup step that 
     * allows its memory to be reclaimed. 
     * If `cancelUnbindAll` is used, consider calling 
     * <a href="#unbindAll">`unbindAll`</a> when the element is no longer
     * needed. This will allow its memory to be reclaimed.
     * 
     * @method cancelUnbindAll
     */
    cancelUnbindAll: function() {
      if (this._unbound) {
        log.unbind && console.warn('[%s] already unbound, cannot cancel unbindAll', this.localName);
        return;
      }
      log.unbind && console.log('[%s] cancelUnbindAll', this.localName);
      if (this._unbindAllJob) {
        this._unbindAllJob = this._unbindAllJob.stop();
      }
    }

  };

  function unbindNodeTree(node) {
    forNodeTree(node, _nodeUnbindAll);
  }

  function _nodeUnbindAll(node) {
    node.unbindAll();
  }

  function forNodeTree(node, callback) {
    if (node) {
      callback(node);
      for (var child = node.firstChild; child; child = child.nextSibling) {
        forNodeTree(child, callback);
      }
    }
  }

  var mustachePattern = /\{\{([^{}]*)}}/;

  // exports

  scope.bindPattern = mustachePattern;
  scope.api.instance.mdv = mdv;

})(Polymer);

(function(scope) {

  /**
   * Common prototype for all Polymer Elements.
   * 
   * @class polymer-base
   * @homepage polymer.github.io
   */
  var base = {
    /**
     * Tags this object as the canonical Base prototype.
     *
     * @property PolymerBase
     * @type boolean
     * @default true
     */
    PolymerBase: true,

    /**
     * Debounce signals. 
     * 
     * Call `job` to defer a named signal, and all subsequent matching signals, 
     * until a wait time has elapsed with no new signal.
     * 
     *     debouncedClickAction: function(e) {
     *       // processClick only when it's been 100ms since the last click
     *       this.job('click', function() {
     *        this.processClick;
     *       }, 100);
     *     }
     *
     * @method job
     * @param String {String} job A string identifier for the job to debounce.
     * @param Function {Function} callback A function that is called (with `this` context) when the wait time elapses.
     * @param Number {Number} wait Time in milliseconds (ms) after the last signal that must elapse before invoking `callback`
     * @type Handle
     */
    job: function(job, callback, wait) {
      if (typeof job === 'string') {
        var n = '___' + job;
        this[n] = Polymer.job.call(this, this[n], callback, wait);
      } else {
        // TODO(sjmiles): suggest we deprecate this call signature
        return Polymer.job.call(this, job, callback, wait);
      }
    },

    /**
     * Invoke a superclass method. 
     * 
     * Use `super()` to invoke the most recently overridden call to the 
     * currently executing function. 
     * 
     * To pass arguments through, use the literal `arguments` as the parameter 
     * to `super()`.
     *
     *     nextPageAction: function(e) {
     *       // invoke the superclass version of `nextPageAction`
     *       this.super(arguments); 
     *     }
     *
     * To pass custom arguments, arrange them in an array.
     *
     *     appendSerialNo: function(value, serial) {
     *       // prefix the superclass serial number with our lot # before
     *       // invoking the superlcass
     *       return this.super([value, this.lotNo + serial])
     *     }
     *
     * @method super
     * @type Any
     * @param {args) An array of arguments to use when calling the superclass method, or null.
     */
    super: Polymer.super,

    /**
     * Lifecycle method called when the element is instantiated.
     * 
     * Override `created` to perform custom create-time tasks. No need to call 
     * super-class `created` unless you are extending another Polymer element.
     * Created is called before the element creates `shadowRoot` or prepares
     * data-observation.
     * 
     * @method created
     * @type void
     */
    created: function() {
    },

    /**
     * Lifecycle method called when the element has populated it's `shadowRoot`,
     * prepared data-observation, and made itself ready for API interaction.
     * 
     * @method ready
     * @type void
     */
    ready: function() {
    },

    /**
     * Low-level lifecycle method called as part of standard Custom Elements
     * operation. Polymer implements this method to provide basic default 
     * functionality. For custom create-time tasks, implement `created` 
     * instead, which is called immediately after `createdCallback`. 
     * 
     * @method createdCallback
     */
    createdCallback: function() {
      if (this.templateInstance && this.templateInstance.model) {
        console.warn('Attributes on ' + this.localName + ' were data bound ' +
            'prior to Polymer upgrading the element. This may result in ' +
            'incorrect binding types.');
      }
      this.created();
      this.prepareElement();
      if (!this.ownerDocument.isStagingDocument) {
        this.makeElementReady();
      }
    },

    // system entry point, do not override
    prepareElement: function() {
      if (this._elementPrepared) {
        console.warn('Element already prepared', this.localName);
        return;
      }
      this._elementPrepared = true;
      // storage for shadowRoots info
      this.shadowRoots = {};
      // install property observers
      this.createPropertyObserver();
      this.openPropertyObserver();
      // install boilerplate attributes
      this.copyInstanceAttributes();
      // process input attributes
      this.takeAttributes();
      // add event listeners
      this.addHostListeners();
    },

    // system entry point, do not override
    makeElementReady: function() {
      if (this._readied) {
        return;
      }
      this._readied = true;
      this.createComputedProperties();
      this.parseDeclarations(this.__proto__);
      // NOTE: Support use of the `unresolved` attribute to help polyfill
      // custom elements' `:unresolved` feature.
      this.removeAttribute('unresolved');
      // user entry point
      this.ready();
    },

    /**
     * Low-level lifecycle method called as part of standard Custom Elements
     * operation. Polymer implements this method to provide basic default 
     * functionality. For custom tasks in your element, implement `attributeChanged` 
     * instead, which is called immediately after `attributeChangedCallback`. 
     * 
     * @method attributeChangedCallback
     */
    attributeChangedCallback: function(name, oldValue) {
      // TODO(sjmiles): adhoc filter
      if (name !== 'class' && name !== 'style') {
        this.attributeToProperty(name, this.getAttribute(name));
      }
      if (this.attributeChanged) {
        this.attributeChanged.apply(this, arguments);
      }
    },

    /**
     * Low-level lifecycle method called as part of standard Custom Elements
     * operation. Polymer implements this method to provide basic default 
     * functionality. For custom create-time tasks, implement `attached` 
     * instead, which is called immediately after `attachedCallback`. 
     * 
     * @method attachedCallback
     */
     attachedCallback: function() {
      // when the element is attached, prevent it from unbinding.
      this.cancelUnbindAll();
      // invoke user action
      if (this.attached) {
        this.attached();
      }
      if (!this.hasBeenAttached) {
        this.hasBeenAttached = true;
        if (this.domReady) {
          this.async('domReady');
        }
      }
    },

     /**
     * Implement to access custom elements in dom descendants, ancestors, 
     * or siblings. Because custom elements upgrade in document order, 
     * elements accessed in `ready` or `attached` may not be upgraded. When
     * `domReady` is called, all registered custom elements are guaranteed
     * to have been upgraded.
     * 
     * @method domReady
     */

    /**
     * Low-level lifecycle method called as part of standard Custom Elements
     * operation. Polymer implements this method to provide basic default 
     * functionality. For custom create-time tasks, implement `detached` 
     * instead, which is called immediately after `detachedCallback`. 
     * 
     * @method detachedCallback
     */
    detachedCallback: function() {
      if (!this.preventDispose) {
        this.asyncUnbindAll();
      }
      // invoke user action
      if (this.detached) {
        this.detached();
      }
      // TODO(sorvell): bc
      if (this.leftView) {
        this.leftView();
      }
    },

    /**
     * Walks the prototype-chain of this element and allows specific
     * classes a chance to process static declarations.
     * 
     * In particular, each polymer-element has it's own `template`.
     * `parseDeclarations` is used to accumulate all element `template`s
     * from an inheritance chain.
     *
     * `parseDeclaration` static methods implemented in the chain are called
     * recursively, oldest first, with the `<polymer-element>` associated
     * with the current prototype passed as an argument.
     * 
     * An element may override this method to customize shadow-root generation. 
     * 
     * @method parseDeclarations
     */
    parseDeclarations: function(p) {
      if (p && p.element) {
        this.parseDeclarations(p.__proto__);
        p.parseDeclaration.call(this, p.element);
      }
    },

    /**
     * Perform init-time actions based on static information in the
     * `<polymer-element>` instance argument.
     *
     * For example, the standard implementation locates the template associated
     * with the given `<polymer-element>` and stamps it into a shadow-root to
     * implement shadow inheritance.
     *  
     * An element may override this method for custom behavior. 
     * 
     * @method parseDeclaration
     */
    parseDeclaration: function(elementElement) {
      var template = this.fetchTemplate(elementElement);
      if (template) {
        var root = this.shadowFromTemplate(template);
        this.shadowRoots[elementElement.name] = root;
      }
    },

    /**
     * Given a `<polymer-element>`, find an associated template (if any) to be
     * used for shadow-root generation.
     *
     * An element may override this method for custom behavior. 
     * 
     * @method fetchTemplate
     */
    fetchTemplate: function(elementElement) {
      return elementElement.querySelector('template');
    },

    /**
     * Create a shadow-root in this host and stamp `template` as it's 
     * content. 
     *
     * An element may override this method for custom behavior. 
     * 
     * @method shadowFromTemplate
     */
    shadowFromTemplate: function(template) {
      if (template) {
        // make a shadow root
        var root = this.createShadowRoot();
        // stamp template
        // which includes parsing and applying MDV bindings before being
        // inserted (to avoid {{}} in attribute values)
        // e.g. to prevent <img src="images/{{icon}}"> from generating a 404.
        var dom = this.instanceTemplate(template);
        // append to shadow dom
        root.appendChild(dom);
        // perform post-construction initialization tasks on shadow root
        this.shadowRootReady(root, template);
        // return the created shadow root
        return root;
      }
    },

    // utility function that stamps a <template> into light-dom
    lightFromTemplate: function(template, refNode) {
      if (template) {
        // TODO(sorvell): mark this element as an eventController so that
        // event listeners on bound nodes inside it will be called on it.
        // Note, the expectation here is that events on all descendants
        // should be handled by this element.
        this.eventController = this;
        // stamp template
        // which includes parsing and applying MDV bindings before being
        // inserted (to avoid {{}} in attribute values)
        // e.g. to prevent <img src="images/{{icon}}"> from generating a 404.
        var dom = this.instanceTemplate(template);
        // append to shadow dom
        if (refNode) {
          this.insertBefore(dom, refNode);
        } else {
          this.appendChild(dom);
        }
        // perform post-construction initialization tasks on ahem, light root
        this.shadowRootReady(this);
        // return the created shadow root
        return dom;
      }
    },

    shadowRootReady: function(root) {
      // locate nodes with id and store references to them in this.$ hash
      this.marshalNodeReferences(root);
    },

    // locate nodes with id and store references to them in this.$ hash
    marshalNodeReferences: function(root) {
      // establish $ instance variable
      var $ = this.$ = this.$ || {};
      // populate $ from nodes with ID from the LOCAL tree
      if (root) {
        var n$ = root.querySelectorAll("[id]");
        for (var i=0, l=n$.length, n; (i<l) && (n=n$[i]); i++) {
          $[n.id] = n;
        };
      }
    },

    /**
     * Register a one-time callback when a child-list or sub-tree mutation
     * occurs on node. 
     *
     * For persistent callbacks, call onMutation from your listener. 
     * 
     * @method onMutation
     * @param Node {Node} node Node to watch for mutations.
     * @param Function {Function} listener Function to call on mutation. The function is invoked as `listener.call(this, observer, mutations);` where `observer` is the MutationObserver that triggered the notification, and `mutations` is the native mutation list.
     */
    onMutation: function(node, listener) {
      var observer = new MutationObserver(function(mutations) {
        listener.call(this, observer, mutations);
        observer.disconnect();
      }.bind(this));
      observer.observe(node, {childList: true, subtree: true});
    }
  };

  /**
   * @class Polymer
   */
  
  /**
   * Returns true if the object includes <a href="#polymer-base">polymer-base</a> in it's prototype chain.
   * 
   * @method isBase
   * @param Object {Object} object Object to test.
   * @type Boolean
   */
  function isBase(object) {
    return object.hasOwnProperty('PolymerBase')
  }

  // name a base constructor for dev tools

  /**
   * The Polymer base-class constructor.
   * 
   * @property Base
   * @type Function
   */
  function PolymerBase() {};
  PolymerBase.prototype = base;
  base.constructor = PolymerBase;

  // exports

  scope.Base = PolymerBase;
  scope.isBase = isBase;
  scope.api.instance.base = base;

})(Polymer);

(function(scope) {

  // imports

  var log = window.WebComponents ? WebComponents.flags.log : {};
  var hasShadowDOMPolyfill = window.ShadowDOMPolyfill;

  // magic words
  
  var STYLE_SCOPE_ATTRIBUTE = 'element';
  var STYLE_CONTROLLER_SCOPE = 'controller';
  
  var styles = {
    STYLE_SCOPE_ATTRIBUTE: STYLE_SCOPE_ATTRIBUTE,
    /**
     * Installs external stylesheets and <style> elements with the attribute 
     * polymer-scope='controller' into the scope of element. This is intended
     * to be a called during custom element construction.
    */
    installControllerStyles: function() {
      // apply controller styles, but only if they are not yet applied
      var scope = this.findStyleScope();
      if (scope && !this.scopeHasNamedStyle(scope, this.localName)) {
        // allow inherited controller styles
        var proto = getPrototypeOf(this), cssText = '';
        while (proto && proto.element) {
          cssText += proto.element.cssTextForScope(STYLE_CONTROLLER_SCOPE);
          proto = getPrototypeOf(proto);
        }
        if (cssText) {
          this.installScopeCssText(cssText, scope);
        }
      }
    },
    installScopeStyle: function(style, name, scope) {
      var scope = scope || this.findStyleScope(), name = name || '';
      if (scope && !this.scopeHasNamedStyle(scope, this.localName + name)) {
        var cssText = '';
        if (style instanceof Array) {
          for (var i=0, l=style.length, s; (i<l) && (s=style[i]); i++) {
            cssText += s.textContent + '\n\n';
          }
        } else {
          cssText = style.textContent;
        }
        this.installScopeCssText(cssText, scope, name);
      }
    },
    installScopeCssText: function(cssText, scope, name) {
      scope = scope || this.findStyleScope();
      name = name || '';
      if (!scope) {
        return;
      }
      if (hasShadowDOMPolyfill) {
        cssText = shimCssText(cssText, scope.host);
      }
      var style = this.element.cssTextToScopeStyle(cssText,
          STYLE_CONTROLLER_SCOPE);
      Polymer.applyStyleToScope(style, scope);
      // cache that this style has been applied
      this.styleCacheForScope(scope)[this.localName + name] = true;
    },
    findStyleScope: function(node) {
      // find the shadow root that contains this element
      var n = node || this;
      while (n.parentNode) {
        n = n.parentNode;
      }
      return n;
    },
    scopeHasNamedStyle: function(scope, name) {
      var cache = this.styleCacheForScope(scope);
      return cache[name];
    },
    styleCacheForScope: function(scope) {
      if (hasShadowDOMPolyfill) {
        var scopeName = scope.host ? scope.host.localName : scope.localName;
        return polyfillScopeStyleCache[scopeName] || (polyfillScopeStyleCache[scopeName] = {});
      } else {
        return scope._scopeStyles = (scope._scopeStyles || {});
      }
    }
  };

  var polyfillScopeStyleCache = {};
  
  // NOTE: use raw prototype traversal so that we ensure correct traversal
  // on platforms where the protoype chain is simulated via __proto__ (IE10)
  function getPrototypeOf(prototype) {
    return prototype.__proto__;
  }

  function shimCssText(cssText, host) {
    var name = '', is = false;
    if (host) {
      name = host.localName;
      is = host.hasAttribute('is');
    }
    var selector = WebComponents.ShadowCSS.makeScopeSelector(name, is);
    return WebComponents.ShadowCSS.shimCssText(cssText, selector);
  }

  // exports

  scope.api.instance.styles = styles;
  
})(Polymer);

(function(scope) {

  // imports

  var extend = scope.extend;
  var api = scope.api;

  // imperative implementation: Polymer()

  // specify an 'own' prototype for tag `name`
  function element(name, prototype) {
    if (typeof name !== 'string') {
      var script = prototype || document._currentScript;
      prototype = name;
      name = script && script.parentNode && script.parentNode.getAttribute ?
          script.parentNode.getAttribute('name') : '';
      if (!name) {
        throw 'Element name could not be inferred.';
      }
    }
    if (getRegisteredPrototype(name)) {
      throw 'Already registered (Polymer) prototype for element ' + name;
    }
    // cache the prototype
    registerPrototype(name, prototype);
    // notify the registrar waiting for 'name', if any
    notifyPrototype(name);
  }

  // async prototype source

  function waitingForPrototype(name, client) {
    waitPrototype[name] = client;
  }

  var waitPrototype = {};

  function notifyPrototype(name) {
    if (waitPrototype[name]) {
      waitPrototype[name].registerWhenReady();
      delete waitPrototype[name];
    }
  }

  // utility and bookkeeping

  // maps tag names to prototypes, as registered with
  // Polymer. Prototypes associated with a tag name
  // using document.registerElement are available from
  // HTMLElement.getPrototypeForTag().
  // If an element was fully registered by Polymer, then
  // Polymer.getRegisteredPrototype(name) === 
  //   HTMLElement.getPrototypeForTag(name)

  var prototypesByName = {};

  function registerPrototype(name, prototype) {
    return prototypesByName[name] = prototype || {};
  }

  function getRegisteredPrototype(name) {
    return prototypesByName[name];
  }

  function instanceOfType(element, type) {
    if (typeof type !== 'string') {
      return false;
    }
    var proto = HTMLElement.getPrototypeForTag(type);
    var ctor = proto && proto.constructor;
    if (!ctor) {
      return false;
    }
    if (CustomElements.instanceof) {
      return CustomElements.instanceof(element, ctor);
    }
    return element instanceof ctor;
  }

  // exports

  scope.getRegisteredPrototype = getRegisteredPrototype;
  scope.waitingForPrototype = waitingForPrototype;
  scope.instanceOfType = instanceOfType;

  // namespace shenanigans so we can expose our scope on the registration 
  // function

  // make window.Polymer reference `element()`

  window.Polymer = element;

  // TODO(sjmiles): find a way to do this that is less terrible
  // copy window.Polymer properties onto `element()`

  extend(Polymer, scope);

  // Under the HTMLImports polyfill, scripts in the main document
  // do not block on imports; we want to allow calls to Polymer in the main
  // document. WebComponents collects those calls until we can process them, which
  // we do here.

  if (WebComponents.consumeDeclarations) {
    WebComponents.consumeDeclarations(function(declarations) {
      if (declarations) {
        for (var i=0, l=declarations.length, d; (i<l) && (d=declarations[i]); i++) {
          element.apply(null, d);
        }
      }
    });
  }

})(Polymer);

(function(scope) {

/**
 * @class polymer-base
 */

 /**
  * Resolve a url path to be relative to a `base` url. If unspecified, `base`
  * defaults to the element's ownerDocument url. Can be used to resolve
  * paths from element's in templates loaded in HTMLImports to be relative
  * to the document containing the element. Polymer automatically does this for
  * url attributes in element templates; however, if a url, for
  * example, contains a binding, then `resolvePath` can be used to ensure it is 
  * relative to the element document. For example, in an element's template,
  *
  *     <a href="{{resolvePath(path)}}">Resolved</a>
  * 
  * @method resolvePath
  * @param {String} url Url path to resolve.
  * @param {String} base Optional base url against which to resolve, defaults
  * to the element's ownerDocument url.
  * returns {String} resolved url.
  */

var path = {
  resolveElementPaths: function(node) {
    Polymer.urlResolver.resolveDom(node);
  },
  addResolvePathApi: function() {
    // let assetpath attribute modify the resolve path
    var assetPath = this.getAttribute('assetpath') || '';
    var root = new URL(assetPath, this.ownerDocument.baseURI);
    this.prototype.resolvePath = function(urlPath, base) {
      var u = new URL(urlPath, base || root);
      return u.href;
    };
  }
};

// exports
scope.api.declaration.path = path;

})(Polymer);

(function(scope) {

  // imports

  var log = window.WebComponents ? WebComponents.flags.log : {};
  var api = scope.api.instance.styles;
  var STYLE_SCOPE_ATTRIBUTE = api.STYLE_SCOPE_ATTRIBUTE;

  var hasShadowDOMPolyfill = window.ShadowDOMPolyfill;

  // magic words

  var STYLE_SELECTOR = 'style';
  var STYLE_LOADABLE_MATCH = '@import';
  var SHEET_SELECTOR = 'link[rel=stylesheet]';
  var STYLE_GLOBAL_SCOPE = 'global';
  var SCOPE_ATTR = 'polymer-scope';

  var styles = {
    // returns true if resources are loading
    loadStyles: function(callback) {
      var template = this.fetchTemplate();
      var content = template && this.templateContent();
      if (content) {
        this.convertSheetsToStyles(content);
        var styles = this.findLoadableStyles(content);
        if (styles.length) {
          var templateUrl = template.ownerDocument.baseURI;
          return Polymer.styleResolver.loadStyles(styles, templateUrl, callback);
        }
      }
      if (callback) {
        callback();
      }
    },
    convertSheetsToStyles: function(root) {
      var s$ = root.querySelectorAll(SHEET_SELECTOR);
      for (var i=0, l=s$.length, s, c; (i<l) && (s=s$[i]); i++) {
        c = createStyleElement(importRuleForSheet(s, this.ownerDocument.baseURI),
            this.ownerDocument);
        this.copySheetAttributes(c, s);
        s.parentNode.replaceChild(c, s);
      }
    },
    copySheetAttributes: function(style, link) {
      for (var i=0, a$=link.attributes, l=a$.length, a; (a=a$[i]) && i<l; i++) {
        if (a.name !== 'rel' && a.name !== 'href') {
          style.setAttribute(a.name, a.value);
        }
      }
    },
    findLoadableStyles: function(root) {
      var loadables = [];
      if (root) {
        var s$ = root.querySelectorAll(STYLE_SELECTOR);
        for (var i=0, l=s$.length, s; (i<l) && (s=s$[i]); i++) {
          if (s.textContent.match(STYLE_LOADABLE_MATCH)) {
            loadables.push(s);
          }
        }
      }
      return loadables;
    },
    /**
     * Install external stylesheets loaded in <polymer-element> elements into the 
     * element's template.
     * @param elementElement The <element> element to style.
     */
    installSheets: function() {
      this.cacheSheets();
      this.cacheStyles();
      this.installLocalSheets();
      this.installGlobalStyles();
    },
    /**
     * Remove all sheets from element and store for later use.
     */
    cacheSheets: function() {
      this.sheets = this.findNodes(SHEET_SELECTOR);
      this.sheets.forEach(function(s) {
        if (s.parentNode) {
          s.parentNode.removeChild(s);
        }
      });
    },
    cacheStyles: function() {
      this.styles = this.findNodes(STYLE_SELECTOR + '[' + SCOPE_ATTR + ']');
      this.styles.forEach(function(s) {
        if (s.parentNode) {
          s.parentNode.removeChild(s);
        }
      });
    },
    /**
     * Takes external stylesheets loaded in an <element> element and moves
     * their content into a <style> element inside the <element>'s template.
     * The sheet is then removed from the <element>. This is done only so 
     * that if the element is loaded in the main document, the sheet does
     * not become active.
     * Note, ignores sheets with the attribute 'polymer-scope'.
     * @param elementElement The <element> element to style.
     */
    installLocalSheets: function () {
      var sheets = this.sheets.filter(function(s) {
        return !s.hasAttribute(SCOPE_ATTR);
      });
      var content = this.templateContent();
      if (content) {
        var cssText = '';
        sheets.forEach(function(sheet) {
          cssText += cssTextFromSheet(sheet) + '\n';
        });
        if (cssText) {
          var style = createStyleElement(cssText, this.ownerDocument);
          content.insertBefore(style, content.firstChild);
        }
      }
    },
    findNodes: function(selector, matcher) {
      var nodes = this.querySelectorAll(selector).array();
      var content = this.templateContent();
      if (content) {
        var templateNodes = content.querySelectorAll(selector).array();
        nodes = nodes.concat(templateNodes);
      }
      return matcher ? nodes.filter(matcher) : nodes;
    },
    /**
     * Promotes external stylesheets and <style> elements with the attribute 
     * polymer-scope='global' into global scope.
     * This is particularly useful for defining @keyframe rules which 
     * currently do not function in scoped or shadow style elements.
     * (See wkb.ug/72462)
     * @param elementElement The <element> element to style.
    */
    // TODO(sorvell): remove when wkb.ug/72462 is addressed.
    installGlobalStyles: function() {
      var style = this.styleForScope(STYLE_GLOBAL_SCOPE);
      applyStyleToScope(style, document.head);
    },
    cssTextForScope: function(scopeDescriptor) {
      var cssText = '';
      // handle stylesheets
      var selector = '[' + SCOPE_ATTR + '=' + scopeDescriptor + ']';
      var matcher = function(s) {
        return matchesSelector(s, selector);
      };
      var sheets = this.sheets.filter(matcher);
      sheets.forEach(function(sheet) {
        cssText += cssTextFromSheet(sheet) + '\n\n';
      });
      // handle cached style elements
      var styles = this.styles.filter(matcher);
      styles.forEach(function(style) {
        cssText += style.textContent + '\n\n';
      });
      return cssText;
    },
    styleForScope: function(scopeDescriptor) {
      var cssText = this.cssTextForScope(scopeDescriptor);
      return this.cssTextToScopeStyle(cssText, scopeDescriptor);
    },
    cssTextToScopeStyle: function(cssText, scopeDescriptor) {
      if (cssText) {
        var style = createStyleElement(cssText);
        style.setAttribute(STYLE_SCOPE_ATTRIBUTE, this.getAttribute('name') +
            '-' + scopeDescriptor);
        return style;
      }
    }
  };

  function importRuleForSheet(sheet, baseUrl) {
    var href = new URL(sheet.getAttribute('href'), baseUrl).href;
    return '@import \'' + href + '\';';
  }

  function applyStyleToScope(style, scope) {
    if (style) {
      if (scope === document) {
        scope = document.head;
      }
      if (hasShadowDOMPolyfill) {
        scope = document.head;
      }
      // TODO(sorvell): necessary for IE
      // see https://connect.microsoft.com/IE/feedback/details/790212/
      // cloning-a-style-element-and-adding-to-document-produces
      // -unexpected-result#details
      // var clone = style.cloneNode(true);
      var clone = createStyleElement(style.textContent);
      var attr = style.getAttribute(STYLE_SCOPE_ATTRIBUTE);
      if (attr) {
        clone.setAttribute(STYLE_SCOPE_ATTRIBUTE, attr);
      }
      // TODO(sorvell): probably too brittle; try to figure out 
      // where to put the element.
      var refNode = scope.firstElementChild;
      if (scope === document.head) {
        var selector = 'style[' + STYLE_SCOPE_ATTRIBUTE + ']';
        var s$ = document.head.querySelectorAll(selector);
        if (s$.length) {
          refNode = s$[s$.length-1].nextElementSibling;
        }
      }
      scope.insertBefore(clone, refNode);
    }
  }

  function createStyleElement(cssText, scope) {
    scope = scope || document;
    scope = scope.createElement ? scope : scope.ownerDocument;
    var style = scope.createElement('style');
    style.textContent = cssText;
    return style;
  }

  function cssTextFromSheet(sheet) {
    return (sheet && sheet.__resource) || '';
  }

  function matchesSelector(node, inSelector) {
    if (matches) {
      return matches.call(node, inSelector);
    }
  }
  var p = HTMLElement.prototype;
  var matches = p.matches || p.matchesSelector || p.webkitMatchesSelector 
      || p.mozMatchesSelector;
  
  // exports

  scope.api.declaration.styles = styles;
  scope.applyStyleToScope = applyStyleToScope;
  
})(Polymer);

(function(scope) {

  // imports

  var log = window.WebComponents ? WebComponents.flags.log : {};
  var api = scope.api.instance.events;
  var EVENT_PREFIX = api.EVENT_PREFIX;

  var mixedCaseEventTypes = {};
  [
    'webkitAnimationStart',
    'webkitAnimationEnd',
    'webkitTransitionEnd',
    'DOMFocusOut',
    'DOMFocusIn',
    'DOMMouseScroll'
  ].forEach(function(e) {
    mixedCaseEventTypes[e.toLowerCase()] = e;
  });

  // polymer-element declarative api: events feature
  var events = {
    parseHostEvents: function() {
      // our delegates map
      var delegates = this.prototype.eventDelegates;
      // extract data from attributes into delegates
      this.addAttributeDelegates(delegates);
    },
    addAttributeDelegates: function(delegates) {
      // for each attribute
      for (var i=0, a; a=this.attributes[i]; i++) {
        // does it have magic marker identifying it as an event delegate?
        if (this.hasEventPrefix(a.name)) {
          // if so, add the info to delegates
          delegates[this.removeEventPrefix(a.name)] = a.value.replace('{{', '')
              .replace('}}', '').trim();
        }
      }
    },
    // starts with 'on-'
    hasEventPrefix: function (n) {
      return n && (n[0] === 'o') && (n[1] === 'n') && (n[2] === '-');
    },
    removeEventPrefix: function(n) {
      return n.slice(prefixLength);
    },
    findController: function(node) {
      while (node.parentNode) {
        if (node.eventController) {
          return node.eventController;
        }
        node = node.parentNode;
      }
      return node.host;
    },
    getEventHandler: function(controller, target, method) {
      var events = this;
      return function(e) {
        if (!controller || !controller.PolymerBase) {
          controller = events.findController(target);
        }

        var args = [e, e.detail, e.currentTarget];
        controller.dispatchMethod(controller, method, args);
      };
    },
    prepareEventBinding: function(pathString, name, node) {
      if (!this.hasEventPrefix(name))
        return;

      var eventType = this.removeEventPrefix(name);
      eventType = mixedCaseEventTypes[eventType] || eventType;

      var events = this;

      return function(model, node, oneTime) {
        var handler = events.getEventHandler(undefined, node, pathString);
        PolymerGestures.addEventListener(node, eventType, handler);

        if (oneTime)
          return;

        // TODO(rafaelw): This is really pointless work. Aside from the cost
        // of these allocations, NodeBind is going to setAttribute back to its
        // current value. Fixing this would mean changing the TemplateBinding
        // binding delegate API.
        function bindingValue() {
          return '{{ ' + pathString + ' }}';
        }

        return {
          open: bindingValue,
          discardChanges: bindingValue,
          close: function() {
            PolymerGestures.removeEventListener(node, eventType, handler);
          }
        };
      };
    }
  };

  var prefixLength = EVENT_PREFIX.length;

  // exports
  scope.api.declaration.events = events;

})(Polymer);

(function(scope) {

  // element api

  var observationBlacklist = ['attribute'];

  var properties = {
    inferObservers: function(prototype) {
      // called before prototype.observe is chained to inherited object
      var observe = prototype.observe, property;
      for (var n in prototype) {
        if (n.slice(-7) === 'Changed') {
          property = n.slice(0, -7);
          if (this.canObserveProperty(property)) {
            if (!observe) {
              observe  = (prototype.observe = {});
            }
            observe[property] = observe[property] || n;
          }
        }
      }
    },
    canObserveProperty: function(property) {
      return (observationBlacklist.indexOf(property) < 0);
    },
    explodeObservers: function(prototype) {
      // called before prototype.observe is chained to inherited object
      var o = prototype.observe;
      if (o) {
        var exploded = {};
        for (var n in o) {
          var names = n.split(' ');
          for (var i=0, ni; ni=names[i]; i++) {
            exploded[ni] = o[n];
          }
        }
        prototype.observe = exploded;
      }
    },
    optimizePropertyMaps: function(prototype) {
      if (prototype.observe) {
        // construct name list
        var a = prototype._observeNames = [];
        for (var n in prototype.observe) {
          var names = n.split(' ');
          for (var i=0, ni; ni=names[i]; i++) {
            a.push(ni);
          }
        }
      }
      if (prototype.publish) {
        // construct name list
        var a = prototype._publishNames = [];
        for (var n in prototype.publish) {
          a.push(n);
        }
      }
      if (prototype.computed) {
        // construct name list
        var a = prototype._computedNames = [];
        for (var n in prototype.computed) {
          a.push(n);
        }
      }
    },
    publishProperties: function(prototype, base) {
      // if we have any properties to publish
      var publish = prototype.publish;
      if (publish) {
        // transcribe `publish` entries onto own prototype
        this.requireProperties(publish, prototype, base);
        // warn and remove accessor names that are broken on some browsers
        this.filterInvalidAccessorNames(publish);
        // construct map of lower-cased property names
        prototype._publishLC = this.lowerCaseMap(publish);
      }
      var computed = prototype.computed;
      if (computed) {
        // warn and remove accessor names that are broken on some browsers
        this.filterInvalidAccessorNames(computed);
      }
    },
    // Publishing/computing a property where the name might conflict with a
    // browser property is not currently supported to help users of Polymer
    // avoid browser bugs:
    //
    // https://code.google.com/p/chromium/issues/detail?id=43394
    // https://bugs.webkit.org/show_bug.cgi?id=49739
    //
    // We can lift this restriction when those bugs are fixed.
    filterInvalidAccessorNames: function(propertyNames) {
      for (var name in propertyNames) {
        // Check if the name is in our blacklist.
        if (this.propertyNameBlacklist[name]) {
          console.warn('Cannot define property "' + name + '" for element "' +
            this.name + '" because it has the same name as an HTMLElement ' +
            'property, and not all browsers support overriding that. ' +
            'Consider giving it a different name.');
          // Remove the invalid accessor from the list.
          delete propertyNames[name];
        }
      }
    },
    //
    // `name: value` entries in the `publish` object may need to generate 
    // matching properties on the prototype.
    //
    // Values that are objects may have a `reflect` property, which
    // signals that the value describes property control metadata.
    // In metadata objects, the prototype default value (if any)
    // is encoded in the `value` property.
    //
    // publish: {
    //   foo: 5, 
    //   bar: {value: true, reflect: true},
    //   zot: {}
    // }
    //
    // `reflect` metadata property controls whether changes to the property
    // are reflected back to the attribute (default false). 
    //
    // A value is stored on the prototype unless it's === `undefined`,
    // in which case the base chain is checked for a value.
    // If the basal value is also undefined, `null` is stored on the prototype.
    //
    // The reflection data is stored on another prototype object, `reflect`
    // which also can be specified directly.
    //
    // reflect: {
    //   foo: true
    // }
    //
    requireProperties: function(propertyInfos, prototype, base) {
      // per-prototype storage for reflected properties
      prototype.reflect = prototype.reflect || {};
      // ensure a prototype value for each property
      // and update the property's reflect to attribute status
      for (var n in propertyInfos) {
        var value = propertyInfos[n];
        // value has metadata if it has a `reflect` property
        if (value && value.reflect !== undefined) {
          prototype.reflect[n] = Boolean(value.reflect);
          value = value.value;
        }
        // only set a value if one is specified
        if (value !== undefined) {
          prototype[n] = value;
        }
      }
    },
    lowerCaseMap: function(properties) {
      var map = {};
      for (var n in properties) {
        map[n.toLowerCase()] = n;
      }
      return map;
    },
    createPropertyAccessor: function(name, ignoreWrites) {
      var proto = this.prototype;

      var privateName = name + '_';
      var privateObservable  = name + 'Observable_';
      proto[privateName] = proto[name];

      Object.defineProperty(proto, name, {
        get: function() {
          var observable = this[privateObservable];
          if (observable)
            observable.deliver();

          return this[privateName];
        },
        set: function(value) {
          if (ignoreWrites) {
            return this[privateName];
          }

          var observable = this[privateObservable];
          if (observable) {
            observable.setValue(value);
            return;
          }

          var oldValue = this[privateName];
          this[privateName] = value;
          this.emitPropertyChangeRecord(name, value, oldValue);

          return value;
        },
        configurable: true
      });
    },
    createPropertyAccessors: function(prototype) {
      var n$ = prototype._computedNames;
      if (n$ && n$.length) {
        for (var i=0, l=n$.length, n, fn; (i<l) && (n=n$[i]); i++) {
          this.createPropertyAccessor(n, true);
        }
      }
      var n$ = prototype._publishNames;
      if (n$ && n$.length) {
        for (var i=0, l=n$.length, n, fn; (i<l) && (n=n$[i]); i++) {
          // If the property is computed and published, the accessor is created
          // above.
          if (!prototype.computed || !prototype.computed[n]) {
            this.createPropertyAccessor(n);
          }
        }
      }
    },
    // This list contains some property names that people commonly want to use,
    // but won't work because of Chrome/Safari bugs. It isn't an exhaustive
    // list. In particular it doesn't contain any property names found on
    // subtypes of HTMLElement (e.g. name, value). Rather it attempts to catch
    // some common cases.
    propertyNameBlacklist: {
      children: 1,
      'class': 1,
      id: 1,
      hidden: 1,
      style: 1,
      title: 1,
    }
  };

  // exports

  scope.api.declaration.properties = properties;

})(Polymer);

(function(scope) {

  // magic words

  var ATTRIBUTES_ATTRIBUTE = 'attributes';
  var ATTRIBUTES_REGEX = /\s|,/;

  // attributes api

  var attributes = {
    
    inheritAttributesObjects: function(prototype) {
      // chain our lower-cased publish map to the inherited version
      this.inheritObject(prototype, 'publishLC');
      // chain our instance attributes map to the inherited version
      this.inheritObject(prototype, '_instanceAttributes');
    },

    publishAttributes: function(prototype, base) {
      // merge names from 'attributes' attribute into the 'publish' object
      var attributes = this.getAttribute(ATTRIBUTES_ATTRIBUTE);
      if (attributes) {
        // create a `publish` object if needed.
        // the `publish` object is only relevant to this prototype, the 
        // publishing logic in `declaration/properties.js` is responsible for
        // managing property values on the prototype chain.
        // TODO(sjmiles): the `publish` object is later chained to it's 
        //                ancestor object, presumably this is only for 
        //                reflection or other non-library uses. 
        var publish = prototype.publish || (prototype.publish = {}); 
        // names='a b c' or names='a,b,c'
        var names = attributes.split(ATTRIBUTES_REGEX);
        // record each name for publishing
        for (var i=0, l=names.length, n; i<l; i++) {
          // remove excess ws
          n = names[i].trim();
          // looks weird, but causes n to exist on `publish` if it does not;
          // a more careful test would need expensive `in` operator
          if (n && publish[n] === undefined) {
            publish[n] = undefined;
          }
        }
      }
    },

    // record clonable attributes from <element>
    accumulateInstanceAttributes: function() {
      // inherit instance attributes
      var clonable = this.prototype._instanceAttributes;
      // merge attributes from element
      var a$ = this.attributes;
      for (var i=0, l=a$.length, a; (i<l) && (a=a$[i]); i++) {  
        if (this.isInstanceAttribute(a.name)) {
          clonable[a.name] = a.value;
        }
      }
    },

    isInstanceAttribute: function(name) {
      return !this.blackList[name] && name.slice(0,3) !== 'on-';
    },

    // do not clone these attributes onto instances
    blackList: {
      name: 1,
      'extends': 1,
      constructor: 1,
      noscript: 1,
      assetpath: 1,
      'cache-csstext': 1
    }
    
  };

  // add ATTRIBUTES_ATTRIBUTE to the blacklist
  attributes.blackList[ATTRIBUTES_ATTRIBUTE] = 1;

  // exports

  scope.api.declaration.attributes = attributes;

})(Polymer);

(function(scope) {

  // imports
  var events = scope.api.declaration.events;

  var syntax = new PolymerExpressions();
  var prepareBinding = syntax.prepareBinding;

  // Polymer takes a first crack at the binding to see if it's a declarative
  // event handler.
  syntax.prepareBinding = function(pathString, name, node) {
    return events.prepareEventBinding(pathString, name, node) ||
           prepareBinding.call(syntax, pathString, name, node);
  };

  // declaration api supporting mdv
  var mdv = {
    syntax: syntax,
    fetchTemplate: function() {
      return this.querySelector('template');
    },
    templateContent: function() {
      var template = this.fetchTemplate();
      return template && template.content;
    },
    installBindingDelegate: function(template) {
      if (template) {
        template.bindingDelegate = this.syntax;
      }
    }
  };

  // exports
  scope.api.declaration.mdv = mdv;

})(Polymer);

(function(scope) {

  // imports
  
  var api = scope.api;
  var isBase = scope.isBase;
  var extend = scope.extend;

  var hasShadowDOMPolyfill = window.ShadowDOMPolyfill;

  // prototype api

  var prototype = {

    register: function(name, extendeeName) {
      // build prototype combining extendee, Polymer base, and named api
      this.buildPrototype(name, extendeeName);
      // register our custom element with the platform
      this.registerPrototype(name, extendeeName);
      // reference constructor in a global named by 'constructor' attribute
      this.publishConstructor();
    },

    buildPrototype: function(name, extendeeName) {
      // get our custom prototype (before chaining)
      var extension = scope.getRegisteredPrototype(name);
      // get basal prototype
      var base = this.generateBasePrototype(extendeeName);
      // implement declarative features
      this.desugarBeforeChaining(extension, base);
      // join prototypes
      this.prototype = this.chainPrototypes(extension, base);
      // more declarative features
      this.desugarAfterChaining(name, extendeeName);
    },

    desugarBeforeChaining: function(prototype, base) {
      // back reference declaration element
      // TODO(sjmiles): replace `element` with `elementElement` or `declaration`
      prototype.element = this;
      // transcribe `attributes` declarations onto own prototype's `publish`
      this.publishAttributes(prototype, base);
      // `publish` properties to the prototype and to attribute watch
      this.publishProperties(prototype, base);
      // infer observers for `observe` list based on method names
      this.inferObservers(prototype);
      // desugar compound observer syntax, e.g. 'a b c' 
      this.explodeObservers(prototype);
    },

    chainPrototypes: function(prototype, base) {
      // chain various meta-data objects to inherited versions
      this.inheritMetaData(prototype, base);
      // chain custom api to inherited
      var chained = this.chainObject(prototype, base);
      // x-platform fixup
      ensurePrototypeTraversal(chained);
      return chained;
    },

    inheritMetaData: function(prototype, base) {
      // chain observe object to inherited
      this.inheritObject('observe', prototype, base);
      // chain publish object to inherited
      this.inheritObject('publish', prototype, base);
      // chain reflect object to inherited
      this.inheritObject('reflect', prototype, base);
      // chain our lower-cased publish map to the inherited version
      this.inheritObject('_publishLC', prototype, base);
      // chain our instance attributes map to the inherited version
      this.inheritObject('_instanceAttributes', prototype, base);
      // chain our event delegates map to the inherited version
      this.inheritObject('eventDelegates', prototype, base);
    },

    // implement various declarative features
    desugarAfterChaining: function(name, extendee) {
      // build side-chained lists to optimize iterations
      this.optimizePropertyMaps(this.prototype);
      this.createPropertyAccessors(this.prototype);
      // install mdv delegate on template
      this.installBindingDelegate(this.fetchTemplate());
      // install external stylesheets as if they are inline
      this.installSheets();
      // adjust any paths in dom from imports
      this.resolveElementPaths(this);
      // compile list of attributes to copy to instances
      this.accumulateInstanceAttributes();
      // parse on-* delegates declared on `this` element
      this.parseHostEvents();
      //
      // install a helper method this.resolvePath to aid in 
      // setting resource urls. e.g.
      // this.$.image.src = this.resolvePath('images/foo.png')
      this.addResolvePathApi();
      // under ShadowDOMPolyfill, transforms to approximate missing CSS features
      if (hasShadowDOMPolyfill) {
        WebComponents.ShadowCSS.shimStyling(this.templateContent(), name,
          extendee);
      }
      // allow custom element access to the declarative context
      if (this.prototype.registerCallback) {
        this.prototype.registerCallback(this);
      }
    },

    // if a named constructor is requested in element, map a reference
    // to the constructor to the given symbol
    publishConstructor: function() {
      var symbol = this.getAttribute('constructor');
      if (symbol) {
        window[symbol] = this.ctor;
      }
    },

    // build prototype combining extendee, Polymer base, and named api
    generateBasePrototype: function(extnds) {
      var prototype = this.findBasePrototype(extnds);
      if (!prototype) {
        // create a prototype based on tag-name extension
        var prototype = HTMLElement.getPrototypeForTag(extnds);
        // insert base api in inheritance chain (if needed)
        prototype = this.ensureBaseApi(prototype);
        // memoize this base
        memoizedBases[extnds] = prototype;
      }
      return prototype;
    },

    findBasePrototype: function(name) {
      return memoizedBases[name];
    },

    // install Polymer instance api into prototype chain, as needed 
    ensureBaseApi: function(prototype) {
      if (prototype.PolymerBase) {
        return prototype;
      }
      var extended = Object.create(prototype);
      // we need a unique copy of base api for each base prototype
      // therefore we 'extend' here instead of simply chaining
      api.publish(api.instance, extended);
      // TODO(sjmiles): sharing methods across prototype chains is
      // not supported by 'super' implementation which optimizes
      // by memoizing prototype relationships.
      // Probably we should have a version of 'extend' that is 
      // share-aware: it could study the text of each function,
      // look for usage of 'super', and wrap those functions in
      // closures.
      // As of now, there is only one problematic method, so 
      // we just patch it manually.
      // To avoid re-entrancy problems, the special super method
      // installed is called `mixinSuper` and the mixin method
      // must use this method instead of the default `super`.
      this.mixinMethod(extended, prototype, api.instance.mdv, 'bind');
      // return buffed-up prototype
      return extended;
    },

    mixinMethod: function(extended, prototype, api, name) {
      var $super = function(args) {
        return prototype[name].apply(this, args);
      };
      extended[name] = function() {
        this.mixinSuper = $super;
        return api[name].apply(this, arguments);
      }
    },

    // ensure prototype[name] inherits from a prototype.prototype[name]
    inheritObject: function(name, prototype, base) {
      // require an object
      var source = prototype[name] || {};
      // chain inherited properties onto a new object
      prototype[name] = this.chainObject(source, base[name]);
    },

    // register 'prototype' to custom element 'name', store constructor 
    registerPrototype: function(name, extendee) { 
      var info = {
        prototype: this.prototype
      }
      // native element must be specified in extends
      var typeExtension = this.findTypeExtension(extendee);
      if (typeExtension) {
        info.extends = typeExtension;
      }
      // register the prototype with HTMLElement for name lookup
      HTMLElement.register(name, this.prototype);
      // register the custom type
      this.ctor = document.registerElement(name, info);
    },

    findTypeExtension: function(name) {
      if (name && name.indexOf('-') < 0) {
        return name;
      } else {
        var p = this.findBasePrototype(name);
        if (p.element) {
          return this.findTypeExtension(p.element.extends);
        }
      }
    }

  };

  // memoize base prototypes
  var memoizedBases = {};

  // implementation of 'chainObject' depends on support for __proto__
  if (Object.__proto__) {
    prototype.chainObject = function(object, inherited) {
      if (object && inherited && object !== inherited) {
        object.__proto__ = inherited;
      }
      return object;
    }
  } else {
    prototype.chainObject = function(object, inherited) {
      if (object && inherited && object !== inherited) {
        var chained = Object.create(inherited);
        object = extend(chained, object);
      }
      return object;
    }
  }

  // On platforms that do not support __proto__ (versions of IE), the prototype
  // chain of a custom element is simulated via installation of __proto__.
  // Although custom elements manages this, we install it here so it's
  // available during desugaring.
  function ensurePrototypeTraversal(prototype) {
    if (!Object.__proto__) {
      var ancestor = Object.getPrototypeOf(prototype);
      prototype.__proto__ = ancestor;
      if (isBase(ancestor)) {
        ancestor.__proto__ = Object.getPrototypeOf(ancestor);
      }
    }
  }

  // exports

  api.declaration.prototype = prototype;

})(Polymer);

(function(scope) {

  /*

    Elements are added to a registration queue so that they register in 
    the proper order at the appropriate time. We do this for a few reasons:

    * to enable elements to load resources (like stylesheets) 
    asynchronously. We need to do this until the platform provides an efficient
    alternative. One issue is that remote @import stylesheets are 
    re-fetched whenever stamped into a shadowRoot.

    * to ensure elements loaded 'at the same time' (e.g. via some set of
    imports) are registered as a batch. This allows elements to be enured from
    upgrade ordering as long as they query the dom tree 1 task after
    upgrade (aka domReady). This is a performance tradeoff. On the one hand,
    elements that could register while imports are loading are prevented from 
    doing so. On the other, grouping upgrades into a single task means less
    incremental work (for example style recalcs),  Also, we can ensure the 
    document is in a known state at the single quantum of time when 
    elements upgrade.

  */
  var queue = {

    // tell the queue to wait for an element to be ready
    wait: function(element) {
      if (!element.__queue) {
        element.__queue = {};
        elements.push(element);
      }
    },

    // enqueue an element to the next spot in the queue.
    enqueue: function(element, check, go) {
      var shouldAdd = element.__queue && !element.__queue.check;
      if (shouldAdd) {
        queueForElement(element).push(element);
        element.__queue.check = check;
        element.__queue.go = go;
      }
      return (this.indexOf(element) !== 0);
    },

    indexOf: function(element) {
      var i = queueForElement(element).indexOf(element);
      if (i >= 0 && document.contains(element)) {
        i += (HTMLImports.useNative || HTMLImports.ready) ? 
          importQueue.length : 1e9;
      }
      return i;  
    },

    // tell the queue an element is ready to be registered
    go: function(element) {
      var readied = this.remove(element);
      if (readied) {
        element.__queue.flushable = true;
        this.addToFlushQueue(readied);
        this.check();
      }
    },

    remove: function(element) {
      var i = this.indexOf(element);
      if (i !== 0) {
        //console.warn('queue order wrong', i);
        return;
      }
      return queueForElement(element).shift();
    },

    check: function() {
      // next
      var element = this.nextElement();
      if (element) {
        element.__queue.check.call(element);
      }
      if (this.canReady()) {
        this.ready();
        return true;
      }
    },

    nextElement: function() {
      return nextQueued();
    },

    canReady: function() {
      return !this.waitToReady && this.isEmpty();
    },

    isEmpty: function() {
      for (var i=0, l=elements.length, e; (i<l) && 
          (e=elements[i]); i++) {
        if (e.__queue && !e.__queue.flushable) {
          return;
        }
      }
      return true;
    },

    addToFlushQueue: function(element) {
      flushQueue.push(element);  
    },

    flush: function() {
      // prevent re-entrance
      if (this.flushing) {
        return;
      }
      this.flushing = true;
      var element;
      while (flushQueue.length) {
        element = flushQueue.shift();
        element.__queue.go.call(element);
        element.__queue = null;
      }
      this.flushing = false;
    },

    ready: function() {
      // TODO(sorvell): As an optimization, turn off CE polyfill upgrading
      // while registering. This way we avoid having to upgrade each document
      // piecemeal per registration and can instead register all elements
      // and upgrade once in a batch. Without this optimization, upgrade time
      // degrades significantly when SD polyfill is used. This is mainly because
      // querying the document tree for elements is slow under the SD polyfill.
      var polyfillWasReady = CustomElements.ready;
      CustomElements.ready = false;
      this.flush();
      if (!CustomElements.useNative) {
        CustomElements.upgradeDocumentTree(document);
      }
      CustomElements.ready = polyfillWasReady;
      Polymer.flush();
      requestAnimationFrame(this.flushReadyCallbacks);
    },

    addReadyCallback: function(callback) {
      if (callback) {
        readyCallbacks.push(callback);
      }
    },

    flushReadyCallbacks: function() {
      if (readyCallbacks) {
        var fn;
        while (readyCallbacks.length) {
          fn = readyCallbacks.shift();
          fn();
        }
      }
    },
  
    /**
    Returns a list of elements that have had polymer-elements created but 
    are not yet ready to register. The list is an array of element definitions.
    */
    waitingFor: function() {
      var e$ = [];
      for (var i=0, l=elements.length, e; (i<l) && 
          (e=elements[i]); i++) {
        if (e.__queue && !e.__queue.flushable) {
          e$.push(e);
        }
      }
      return e$;
    },

    waitToReady: true

  };

  var elements = [];
  var flushQueue = [];
  var importQueue = [];
  var mainQueue = [];
  var readyCallbacks = [];

  function queueForElement(element) {
    return document.contains(element) ? mainQueue : importQueue;
  }

  function nextQueued() {
    return importQueue.length ? importQueue[0] : mainQueue[0];
  }

  function whenReady(callback) {
    queue.waitToReady = true;
    Polymer.endOfMicrotask(function() {
      HTMLImports.whenReady(function() {
        queue.addReadyCallback(callback);
        queue.waitToReady = false;
        queue.check();
    });
    });
  }

  /**
    Forces polymer to register any pending elements. Can be used to abort
    waiting for elements that are partially defined.
    @param timeout {Integer} Optional timeout in milliseconds
  */
  function forceReady(timeout) {
    if (timeout === undefined) {
      queue.ready();
      return;
    }
    var handle = setTimeout(function() {
      queue.ready();
    }, timeout);
    Polymer.whenReady(function() {
      clearTimeout(handle);
    });
  }

  // exports
  scope.elements = elements;
  scope.waitingFor = queue.waitingFor.bind(queue);
  scope.forceReady = forceReady;
  scope.queue = queue;
  scope.whenReady = scope.whenPolymerReady = whenReady;
})(Polymer);

(function(scope) {

  // imports

  var extend = scope.extend;
  var api = scope.api;
  var queue = scope.queue;
  var whenReady = scope.whenReady;
  var getRegisteredPrototype = scope.getRegisteredPrototype;
  var waitingForPrototype = scope.waitingForPrototype;

  // declarative implementation: <polymer-element>

  var prototype = extend(Object.create(HTMLElement.prototype), {

    createdCallback: function() {
      if (this.getAttribute('name')) {
        this.init();
      }
    },

    init: function() {
      // fetch declared values
      this.name = this.getAttribute('name');
      this.extends = this.getAttribute('extends');
      queue.wait(this);
      // initiate any async resource fetches
      this.loadResources();
      // register when all constraints are met
      this.registerWhenReady();
    },

    // TODO(sorvell): we currently queue in the order the prototypes are 
    // registered, but we should queue in the order that polymer-elements
    // are registered. We are currently blocked from doing this based on 
    // crbug.com/395686.
    registerWhenReady: function() {
     if (this.registered
       || this.waitingForPrototype(this.name)
       || this.waitingForQueue()
       || this.waitingForResources()) {
          return;
      }
      queue.go(this);
    },

    _register: function() {
      //console.log('registering', this.name);
      // warn if extending from a custom element not registered via Polymer
      if (isCustomTag(this.extends) && !isRegistered(this.extends)) {
        console.warn('%s is attempting to extend %s, an unregistered element ' +
            'or one that was not registered with Polymer.', this.name,
            this.extends);
      }
      this.register(this.name, this.extends);
      this.registered = true;
    },

    waitingForPrototype: function(name) {
      if (!getRegisteredPrototype(name)) {
        // then wait for a prototype
        waitingForPrototype(name, this);
        // emulate script if user is not supplying one
        this.handleNoScript(name);
        // prototype not ready yet
        return true;
      }
    },

    handleNoScript: function(name) {
      // if explicitly marked as 'noscript'
      if (this.hasAttribute('noscript') && !this.noscript) {
        this.noscript = true;
        // imperative element registration
        Polymer(name);
      }
    },

    waitingForResources: function() {
      return this._needsResources;
    },

    // NOTE: Elements must be queued in proper order for inheritance/composition
    // dependency resolution. Previously this was enforced for inheritance,
    // and by rule for composition. It's now entirely by rule.
    waitingForQueue: function() {
      return queue.enqueue(this, this.registerWhenReady, this._register);
    },

    loadResources: function() {
      this._needsResources = true;
      this.loadStyles(function() {
        this._needsResources = false;
        this.registerWhenReady();
      }.bind(this));
    }

  });

  // semi-pluggable APIs 

  // TODO(sjmiles): should be fully pluggable (aka decoupled, currently
  // the various plugins are allowed to depend on each other directly)
  api.publish(api.declaration, prototype);

  // utility and bookkeeping

  function isRegistered(name) {
    return Boolean(HTMLElement.getPrototypeForTag(name));
  }

  function isCustomTag(name) {
    return (name && name.indexOf('-') >= 0);
  }

  // boot tasks

  whenReady(function() {
    document.body.removeAttribute('unresolved');
    document.dispatchEvent(
      new CustomEvent('polymer-ready', {bubbles: true})
    );
  });

  // register polymer-element with document

  document.registerElement('polymer-element', {prototype: prototype});

})(Polymer);

(function(scope) {

/**
 * @class Polymer
 */

var whenReady = scope.whenReady;

/**
 * Loads the set of HTMLImports contained in `node`. Notifies when all
 * the imports have loaded by calling the `callback` function argument.
 * This method can be used to lazily load imports. For example, given a 
 * template:
 *     
 *     <template>
 *       <link rel="import" href="my-import1.html">
 *       <link rel="import" href="my-import2.html">
 *     </template>
 *
 *     Polymer.importElements(template.content, function() {
 *       console.log('imports lazily loaded'); 
 *     });
 * 
 * @method importElements
 * @param {Node} node Node containing the HTMLImports to load.
 * @param {Function} callback Callback called when all imports have loaded.
 */
function importElements(node, callback) {
  if (node) {
    document.head.appendChild(node);
    whenReady(callback);
  } else if (callback) {
    callback();
  }
}

/**
 * Loads an HTMLImport for each url specified in the `urls` array.
 * Notifies when all the imports have loaded by calling the `callback` 
 * function argument. This method can be used to lazily load imports. 
 * For example,
 *
 *     Polymer.import(['my-import1.html', 'my-import2.html'], function() {
 *       console.log('imports lazily loaded'); 
 *     });
 * 
 * @method import
 * @param {Array} urls Array of urls to load as HTMLImports.
 * @param {Function} callback Callback called when all imports have loaded.
 */
function _import(urls, callback) {
  if (urls && urls.length) {
      var frag = document.createDocumentFragment();
      for (var i=0, l=urls.length, url, link; (i<l) && (url=urls[i]); i++) {
        link = document.createElement('link');
        link.rel = 'import';
        link.href = url;
        frag.appendChild(link);
      }
      importElements(frag, callback);
  } else if (callback) {
    callback();
  }
}

// exports
scope.import = _import;
scope.importElements = importElements;

})(Polymer);

/**
 * The `auto-binding` element extends the template element. It provides a quick 
 * and easy way to do data binding without the need to setup a model. 
 * The `auto-binding` element itself serves as the model and controller for the 
 * elements it contains. Both data and event handlers can be bound. 
 *
 * The `auto-binding` element acts just like a template that is bound to 
 * a model. It stamps its content in the dom adjacent to itself. When the 
 * content is stamped, the `template-bound` event is fired.
 *
 * Example:
 *
 *     <template is="auto-binding">
 *       <div>Say something: <input value="{{value}}"></div>
 *       <div>You said: {{value}}</div>
 *       <button on-tap="{{buttonTap}}">Tap me!</button>
 *     </template>
 *     <script>
 *       var template = document.querySelector('template');
 *       template.value = 'something';
 *       template.buttonTap = function() {
 *         console.log('tap!');
 *       };
 *     <\/script>
 *
 * @module Polymer
 * @status stable
*/

(function() {

  var element = document.createElement('polymer-element');
  element.setAttribute('name', 'auto-binding');
  element.setAttribute('extends', 'template');
  element.init();

  Polymer('auto-binding', {

    createdCallback: function() {
      this.syntax = this.bindingDelegate = this.makeSyntax();
      // delay stamping until polymer-ready so that auto-binding is not
      // required to load last.
      Polymer.whenPolymerReady(function() {
        this.model = this;
        this.setAttribute('bind', '');
        // we don't bother with an explicit signal here, we could ust a MO
        // if necessary
        this.async(function() {
          // note: this will marshall *all* the elements in the parentNode
          // rather than just stamped ones. We'd need to use createInstance
          // to fix this or something else fancier.
          this.marshalNodeReferences(this.parentNode);
          // template stamping is asynchronous so stamping isn't complete
          // by polymer-ready; fire an event so users can use stamped elements
          this.fire('template-bound');
        });
      }.bind(this));
    },

    makeSyntax: function() {
      var events = Object.create(Polymer.api.declaration.events);
      var self = this;
      events.findController = function() { return self.model; };

      var syntax = new PolymerExpressions();
      var prepareBinding = syntax.prepareBinding;  
      syntax.prepareBinding = function(pathString, name, node) {
        return events.prepareEventBinding(pathString, name, node) ||
               prepareBinding.call(syntax, pathString, name, node);
      };
      return syntax;
    }

  });

})();
;
Polymer.mixin2 = function(prototype, mixin) {

  // adds a single mixin to prototype

  if (mixin.mixinPublish) {
    prototype.publish = prototype.publish || {};
    Polymer.mixin(prototype.publish, mixin.mixinPublish);
  }

  if (mixin.mixinDelegates) {
    prototype.eventDelegates = prototype.eventDelegates || {};
    for (var e in mixin.mixinDelegates) {
      if (!prototype.eventDelegates[e]) {
        prototype.eventDelegates[e] = mixin.mixinDelegates[e];
      }
    }
  }

  if (mixin.mixinObserve) {
    prototype.observe = prototype.observe || {};
    for (var o in mixin.mixinObserve) {
      if (!prototype.observe[o] && !prototype[o + 'Changed']) {
        prototype.observe[o] = mixin.mixinObserve[o];
      }
    }
  }

  Polymer.mixin(prototype, mixin);

  delete prototype.mixinPublish;
  delete prototype.mixinDelegates;
  delete prototype.mixinObserve;

  return prototype;
};;
/**
 * @group Polymer Mixins
 *
 * `Polymer.CoreFocusable` is a mixin for elements that the user can interact with.
 * Elements using this mixin will receive attributes reflecting the focus, pressed
 * and disabled states.
 *
 * @element Polymer.CoreFocusable
 * @status unstable
 */

Polymer.CoreFocusable = {

  mixinPublish: {

    /**
     * If true, the element is currently active either because the
     * user is touching it, or the button is a toggle
     * and is currently in the active state.
     *
     * @attribute active
     * @type boolean
     * @default false
     */
    active: {value: false, reflect: true},

    /**
     * If true, the element currently has focus due to keyboard
     * navigation.
     *
     * @attribute focused
     * @type boolean
     * @default false
     */
    focused: {value: false, reflect: true},

    /**
     * If true, the user is currently holding down the button.
     *
     * @attribute pressed
     * @type boolean
     * @default false
     */
    pressed: {value: false, reflect: true},

    /**
     * If true, the user cannot interact with this element.
     *
     * @attribute disabled
     * @type boolean
     * @default false
     */
    disabled: {value: false, reflect: true},

    /**
     * If true, the button toggles the active state with each tap.
     * Otherwise, the button becomes active when the user is holding
     * it down.
     *
     * @attribute toggle
     * @type boolean
     * @default false
     */
    toggle: false

  },

  mixinDelegates: {
    contextMenu: '_contextMenuAction',
    down: '_downAction',
    up: '_upAction',
    focus: '_focusAction',
    blur: '_blurAction'
  },

  mixinObserve: {
    disabled: '_disabledChanged'
  },

  _disabledChanged: function() {
    if (this.disabled) {
      this.style.pointerEvents = 'none';
      this.removeAttribute('tabindex');
      this.setAttribute('aria-disabled', '');
    } else {
      this.style.pointerEvents = '';
      this.setAttribute('tabindex', 0);
      this.removeAttribute('aria-disabled');
    }
  },

  _downAction: function() {
    this.pressed = true;

    if (this.toggle) {
      this.active = !this.active;
    } else {
      this.active = true;
    }
  },

  // Pulling up the context menu for an item should focus it; but we need to
  // be careful about how we deal with down/up events surrounding context
  // menus. The up event typically does not fire until the context menu
  // closes: so we focus immediately.
  //
  // This fires _after_ downAction.
  _contextMenuAction: function(e) {
    // Note that upAction may fire _again_ on the actual up event.
    this._upAction(e);
    this._focusAction();
  },

  _upAction: function() {
    this.pressed = false;

    if (!this.toggle) {
      this.active = false;
    }
  },

  _focusAction: function() {
    if (!this.pressed) {
      // Only render the "focused" state if the element gains focus due to
      // keyboard navigation.
      this.focused = true;
    }
  },

  _blurAction: function() {
    this.focused = false;
  }

}
;
/**
* @license
* Copyright 2012 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var DEBUG=DEBUG||false;
var GLOBAL=GLOBAL||this;
function MODEL(model){
var proto;
if(model.name){
if(!GLOBAL[model.name]){
if(model.extendsModel){
GLOBAL[model.name]={__proto__:GLOBAL[model.extendsModel]};
}else{
GLOBAL[model.name]={};
}
}
proto=GLOBAL[model.name];
}else{
proto=model.extendsProto?GLOBAL[model.extendsProto].prototype:
GLOBAL[model.extendsObject];
}
model.properties && model.properties.forEach(function(p){
Object.defineProperty(
proto,
p.name,
{get:p.getter,enumerable:false});
});
for(key in model.constants)
Object.defineProperty(
proto,
key,
{value:model.constants[key],writable:true,enumerable:false});
if(Array.isArray(model.methods)){
model.methods.forEach(function(m){
Object.defineProperty(
proto,
m.name,
{value:m,writable:true,enumerable:false});
});
}else{
for(var key in model.methods)
Object.defineProperty(
proto,
key,
{value:model.methods[key],writable:true,enumerable:false});
}
}
MODEL({
extendsObject:'GLOBAL',
methods:[
function memoize(f){
var cache={};
var g=function(){
var key=argsToArray(arguments).toString();
if(!cache.hasOwnProperty(key))cache[key]=f.apply(this,arguments);
return cache[key];
};
g.name=f.name;
return g;
},
function memoize1(f){
var cache={};
var g=function(arg){
var key=arg.toString();
if(!cache.hasOwnProperty(key))cache[key]=f.call(this,arg);
return cache[key];
};
g.name=f.name;
return g;
},
function constantFn(v){
/* Create a function which always returns the supplied constant value. */
return function(){return v;};
},
function argsToArray(args){
var array=new Array(args.length);
for(var i=0;i<args.length;i++)array[i]=args[i];
return array;
},
function StringComparator(s1,s2){
if(s1==s2)return 0;
return s1<s2?-1:1;
},
function toCompare(c){
if(Array.isArray(c))return CompoundComparator.apply(null,c);
return c.compare?c.compare.bind(c):c;
},
function CompoundComparator(){
var args=argsToArray(arguments);
var cs=[];
for(var i=0;i<args.length;i++)
cs[i]=toCompare(args[i]);
var f=function(o1,o2){
for(var i=0;i<cs.length;i++){
var r=cs[i](o1,o2);
if(r !=0)return r;
}
return 0;
};
f.toSQL=function(){return args.map(function(s){return s.toSQL();}).join(',');};
f.toMQL=function(){return args.map(function(s){return s.toMQL();}).join(' ');};
f.toBQL=function(){return args.map(function(s){return s.toBQL();}).join(' ');};
f.toString=f.toSQL;
return f;
},
function randomAct(){
/**
* Take an array where even values are weights and odd values are functions,
* and execute one of the functions with propability equal to it's relative
* weight.
*/
var totalWeight=0.0;
for(var i=0;i<arguments.length;i +=2)totalWeight +=arguments[i];
var r=Math.random();
for(var i=0,weight=0;i<arguments.length;i +=2){
weight +=arguments[i];
if(r<=weight / totalWeight){
arguments[i+1]();
return;
}
}
},
function Object_forEach(obj,fn){
for(var key in obj)if(obj.hasOwnProperty(key))fn(obj[key],key);
},
function predicatedSink(predicate,sink){
if(predicate===TRUE||!sink)return sink;
return{
__proto__:sink,
$UID:sink.$UID,
put:function(obj,s,fc){
if(sink.put &&(!obj||predicate.f(obj)))sink.put(obj,s,fc);
},
remove:function(obj,s,fc){
if(sink.remove &&(!obj||predicate.f(obj)))sink.remove(obj,s,fc);
},
toString:function(){
return 'PredicatedSink(' +
sink.$UID+','+predicate+','+sink+')';
}
};
},
function limitedSink(count,sink){
var i=0;
return{
__proto__:sink,
put:function(obj,s,fc){
if(i++>=count && fc){
fc.stop();
}else{
sink.put(obj,s,fc);
}
}/*,
eof:function(){
sink.eof && sink.eof();
}*/
};
},
function skipSink(skip,sink){
var i=0;
return{
__proto__:sink,
put:function(obj,s,fc){
if(i++>=skip)sink.put(obj,s,fc);
}
};
},
function orderedSink(comparator,sink){
comparator=toCompare(comparator);
return{
__proto__:sink,
i:0,
arr:[],
put:function(obj,s,fc){
this.arr.push(obj);
},
eof:function(){
this.arr.sort(comparator);
this.arr.select(sink);
}
};
},
function defineLazyProperty(target,name,definitionFn){
Object.defineProperty(target,name,{
get:function(){
var definition=definitionFn.call(this);
Object.defineProperty(this,name,definition);
return definition.get?
definition.get.call(this):
definition.value;
},
configurable:true
});
},
function multiline(f){
var s=f.toString();
var start=s.indexOf('/*');
var end=s.lastIndexOf('*/');
return s.substring(start+2,end);
},
function findPageXY(node){
var x=0;
var y=0;
var parent;
while(node){
parent=node;
x +=node.offsetLeft;
y +=node.offsetTop;
node=node.offsetParent;
}
return [x,y,parent];
},
function findViewportXY(node){
var rect=node.getBoundingClientRect();
return [rect.left,rect.top];
},
function nop(){/** NOP function. **/},
function stringtoutf8(str){
var res=[];
for(var i=0;i<str.length;i++){
var code=str.charCodeAt(i);
var count=0;
if(code<0x80){
res.push(code);
continue;
}
}
return res;
}
]
});
var constantize=memoize1(function(str){
return str==='x'?
'X_':
str.replace(/[a-z_][^0-9a-z_]/g,function(a){
return a.substring(0,1)+ '_'+a.substring(1,2);
}).toUpperCase();
});
MODEL({
extendsProto:'Object',
properties:[
{
name:'$UID',
getter:(function(){
var id=1;
return function(){
if(this.$UID__)return this.$UID__;
Object.defineProperty(this,'$UID__',{value:id});
++id;
return this.$UID__;
};
})()
}
],
methods:[
function clone(){return this;},
function deepClone(){return this.clone();},
function become(other){
var local=Object.getOwnPropertyNames(this);
for(var i=0;i<local.length;i++){
delete this[local[i]];
}
var remote=Object.getOwnPropertyNames(other);
for(i=0;i<remote.length;i++){
Object.defineProperty(
this,
remote[i],
Object.getOwnPropertyDescriptor(other,remote[i]));
}
this.__proto__=other.__proto__;
}
]
});
MODEL({
extendsProto:'Array',
constants:{
oldForEach_:Array.prototype.forEach
},
methods:[
function forEach(f,opt_this){
/* Replace Array.forEach with a faster version. */
if(!this||!f||opt_this)return this.oldForEach_.call(this,f,opt_this);
var l=this.length;
for(var i=0;i<l;i++)f(this[i],i,this);
},
function binaryInsert(item){
/* binaryInsert into a sorted array,removing duplicates */
var start=0;
var end=this.length-1;
while(end>=start){
var m=start+Math.floor((end-start)/ 2);
var c=item.compareTo(this[m]);
if(c==0)return this;
if(c<0){end=m-1;}else{start=m+1;}
}
this.splice(start,0,item);
return this;
},
function union(other){
return this.concat(
other.filter(function(o){return this.indexOf(o)==-1;}.bind(this)));
},
function intersection(other){
return this.filter(function(o){return other.indexOf(o)!=-1;});
},
function intern(){
for(var i=0;i<this.length;i++)
if(this[i].intern)this[i]=this[i].intern();
return this;
},
function compareTo(other){
if(this.length !==other.length)return -1;
for(var i=0;i<this.length;i++){
var result=this[i].compareTo(other[i]);
if(result !==0)return result;
}
return 0;
},
function fReduce(comparator,arr){
compare=toCompare(comparator);
var result=[];
var i=0;
var j=0;
var k=0;
while(i<this.length && j<arr.length){
var a=compare(this[i],arr[j]);
if(a<0){
result[k++]=this[i++];
continue;
}
if(a==0){
result[k++]=this[i++];
result[k++]=arr[j++];
continue;
}
result[k++]=arr[j++];
}
if(i !=this.length)result=result.concat(this.slice(i));
if(j !=arr.length)result=result.concat(arr.slice(j));
return result;
},
function pushAll(arr){
/**
* Push an array of values onto an array.
* @param arr array of values
* @return new length of this array
*/
this.push.apply(this,arr);
return this.length;
},
function mapFind(map){
/**
* Search for a single element in an array.
* @param predicate used to determine element to find
*/
for(var i=0;i<this.length;i++){
var result=map(this[i],i);
if(result)return result;
}
},
function mapProp(prop){
return this.map(function(x){return x[prop];});
},
function mapCall(){
var args=Array.prototype.slice.call(arguments,0);
var func=args.shift();
return this.map(function(x){return x[func] && x[func].apply(x[func],args);});
}
]
});
MODEL({
extendsProto:'String',
methods:[
function indexOfIC(a){return(a.length>this.length)?-1:this.toUpperCase().indexOf(a.toUpperCase());},
function equals(other){return this.compareTo(other)===0;},
function equalsIC(other){return other && this.toUpperCase()===other.toUpperCase();},
function capitalize(){return this.charAt(0).toUpperCase()+ this.slice(1);},
function labelize(){
return this.replace(/[a-z][A-Z]/g,function(a){return a.charAt(0)+ ' '+a.charAt(1);}).capitalize();
},
function clone(){return this.toString();},
function compareTo(o){return(o==this)?0:this<o?-1:1;},
String.prototype.startsWith||function startsWith(a){
return 0==this.lastIndexOf(a,0);
},
function startsWithIC(a){
if(a.length>this.length)return false;
var l=a.length;
for(var i=0;i<l;i++){
if(this[i].toUpperCase()!==a[i].toUpperCase())return false;
}
return true;
},
function put(obj){return this+obj.toJSON();},
(function(){
var map={};
return function intern(){
/** Convert a string to an internal canonical copy. **/
return map[this]||(map[this]=this.toString());
};
})(),
function hashCode(){
var hash=0;
if(this.length==0)return hash;
for(i=0;i<this.length;i++){
var code=this.charCodeAt(i);
hash=((hash<<5)- hash)+ code;
hash &=hash;
}
return hash;
}
]
});
MODEL({
extendsProto:'Function',
methods:[
/**
* Replace Function.bind with a version
* which is ~10X faster for the common case
* where you're only binding 'this'.
**/
(function(){
var oldBind=Function.prototype.bind;
var simpleBind=function(f,self){
return function(){return f.apply(self,arguments);};
/*
var ret=function(){return f.apply(self,arguments);};
ret.toString=function bind(){
return f.toString();
};
return ret;
*/
};
return function bind(arg){
return arguments.length==1?
simpleBind(this,arg):
oldBind.apply(this,argsToArray(arguments));
};
})(),
function equals(o){return this===o;},
function compareTo(o){
return this===o?0:(this.name.compareTo(o.name)||1);
},
function o(f2){
var f1=this;
return function(){
return f1.call(this,f2.apply(this,argsToArray(arguments)));
};
}
]
});
MODEL({
extendsProto:'Date',
methods:[
function toRelativeDateString(){
var seconds=Math.floor((Date.now()- this.getTime())/1000);
if(seconds<60)return 'moments ago';
var minutes=Math.floor((seconds)/60);
if(minutes==1)return '1 minute ago';
if(minutes<60)return minutes+' minutes ago';
var hours=Math.floor(minutes/60);
if(hours==1)return '1 hour ago';
if(hours<24)return hours+' hours ago';
var days=Math.floor(hours / 24);
if(days==1)return '1 day ago';
if(days<7)return days+' days ago';
if(days<365){
var year=1900+this.getYear();
var noyear=this.toDateString().replace(" "+year,"");
return noyear.substring(4);
}
return this.toDateString().substring(4);
},
function compareTo(o){
if(o===this)return 0;
if(!o)return 1;
var d=this.getTime()- o.getTime();
return d==0?0:d>0?1:-1;
},
function toMQL(){
return this.getFullYear()+ '/' +(this.getMonth()+ 1)+ '/'+this.getDate();
},
function toBQL(){
var str=this.toISOString();
return str.substring(0,str.indexOf('.'));
}
]
});
MODEL({
extendsProto:'Number',
methods:[
function compareTo(o){return(o==this)?0:this<o?-1:1;},
function clone(){return +this;}
]
});
MODEL({
extendsProto:'Boolean',
methods:[
function compareTo(o){return(this.valueOf()?1:0)-(o?1:0);}
]
});
MODEL({
extendsProto:'RegExp',
methods:[
function quote(str){
return(str+'').replace(/([.?*+^$[\]\\(){}|-])/g,'\\$1');
}
]
});
function defineProperties(proto,fns){
for(var key in fns){
try{
Object.defineProperty(proto,key,{
value:fns[key],
configurable:true,
writable:true
});
}catch(x){
console.log('Warning:'+x);
}
}
}
console.log.json=function(){
var args=[];
for(var i=0;i<arguments.length;i++){
var arg=arguments[i];
args.push(arg && arg.toJSON?arg.toJSON():arg);
}
console.log.apply(console,args);
};
console.log.str=function(){
var args=[];
for(var i=0;i<arguments.length;i++){
var arg=arguments[i];
args.push(arg && arg.toString?arg.toString():arg);
}
console.log.apply(console,args);
};
console.log.put=console.log.bind(console);
console.log.remove=console.log.bind(console,'remove:');
console.log.error=console.log.bind(console,'error:');
console.log.json.put=console.log.json.bind(console);
console.log.json.reduceI=console.log.json.bind(console,'reduceI:');
console.log.json.remove=console.log.json.bind(console,'remove:');
console.log.json.error=console.log.json.bind(console,'error:');
console.log.str.put=console.log.str.bind(console);
console.log.str.remove=console.log.str.bind(console,'remove:');
console.log.str.error=console.log.str.bind(console,'error:');
document.put=function(obj){
if(obj.write){
obj.write(this);
}else{
this.write(obj.toString());
}
};
window.requestFileSystem=window.requestFileSystem||
window.webkitRequestFileSystem;
window.requestAnimationFrame=window.requestAnimationFrame||
window.webkitRequestAnimationFrame||
window.setImmediate;
if(window.Blob){
Blob.prototype.slice=Blob.prototype.slice||Blob.prototype.webkitSlice;
}
if(window.XMLHttpRequest){
/**
* Add an afunc send to XMLHttpRequest
*/
XMLHttpRequest.prototype.asend=function(ret,opt_data){
var xhr=this;
xhr.onerror=function(){
console.log('XHR Error:',arguments);
};
xhr.onloadend=function(){
ret(xhr.response,xhr);
};
xhr.send(opt_data);
};
}
String.fromCharCode=(function(){
var oldLookup=String.fromCharCode;
var lookupTable=[];
return function(a){
if(arguments.length==1)return lookupTable[a]||(lookupTable[a]=oldLookup(a));
var result="";
for(var i=0;i<arguments.length;i++){
result +=lookupTable[arguments[i]]||(lookupTable[arguments[i]]=oldLookup(arguments[i]));
}
return result;
};
})();
/**
* @license
* Copyright 2013 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
MODEL({
extendsProto:'Function',
methods:[
function abind(self){
/** Adapt a synchronous method into a psedo-afunc. **/
return function(ret){this.apply(self,arguments);ret();}.bind(this);
},
function ao(f2){
/** Async Compose(like Function.prototype.O,but for async functions **/
var f1=this;
return function(ret){
var args=argsToArray(arguments);
args[0]=f1.bind(this,ret);
f2.apply(this,args);
}
},
function aseq(f2){return f2.ao(this);}
]
});
MODEL({
extendsObject:'GLOBAL',
methods:[
/** NOP afunc. **/
function anop(ret){ret && ret(undefined);},
/** afunc log. **/
function alog(){
var args=arguments;
return function(ret){
console.log.apply(console,args);
ret && ret.apply(this,[].slice.call(arguments,1));
};
},
/** console.profile an afunc. **/
function aprofile(afunc){
return function(ret){
var a=argsToArray(arguments);
console.profile('aprofile');
var ret2=function(){
console.profileEnd();
ret && ret(arguments);
};
aapply_(afunc,ret2,a);
};
},
/** Create an afunc which always returns the supplied constant value. **/
function aconstant(v){return function(ret){ret && ret(v);};},
/** Execute the supplied afunc N times. **/
function arepeat(n,afunc){
if(!n)return anop;
return function(ret){
var a=argsToArray(arguments);
a.splice(1,0,0,n);
var next=atramp(function(){
if(a[1]==n-1){a[0]=ret;afunc.apply(this,a);return;};
afunc.apply(this,a);
a[1]++;
});
a[0]=next;
next.apply(this,a);
};
},
/** Execute the supplied afunc on each element of an array. */
function aforEach(arr,afunc){
},
/** Execute the supplied afunc until cond()returns false. */
function awhile(cond,afunc){
return function(ret){
var a=argsToArray(arguments);
var g=function(){
if(!cond()){ret.apply(undefined,arguments);return;}
afunc.apply(this,a);
};
a[0]=g;
g.apply(this,a);
};
},
/** Execute the supplied afunc if cond. */
function aif(cond,afunc,aelse){
return function(ret){
if(typeof cond==='function'?cond():cond){
afunc.apply(this,arguments);
}else{
if(aelse)aelse.apply(this,arguments);
else ret();
}
};
},
/** Execute afunc if the acond returns true */
function aaif(acond,afunc,aelse){
return function(ret){
var args=argsToArray(arguments);
args[0]=function(c){
args[0]=ret;
if(c)afunc.apply(null,args);
else if(aelse)aelse.apply(null,args);
else ret();
};
acond.apply(null,args);
}
},
/** Time an afunc. **/
(function(){
var id=1;
var activeOps={};
return function atime(str,afunc,opt_endCallback,opt_startCallback){
var name=str;
return aseq(
function(ret){
if(activeOps[str]){
name +='-'+id++;
activeOps[str]++;
}else{
activeOps[str]=1;
}
var start=performance.now();
if(opt_startCallback)opt_startCallback(name);
if(!opt_endCallback)console.time(name);
ret.apply(null,[].slice.call(arguments,1));
},
afunc,
function(ret){
activeOps[str]--;
if(opt_endCallback){
var end=performance.now();
opt_endCallback(name,end - start);
}else{
console.timeEnd(name);
}
ret && ret.apply(null,[].slice.call(arguments,1));
}
);
};
})(),
/** Time an afunc and record its time as a metric. **/
function ametric(){
return this.atime.apply(this,arguments);
},
/** Sleep for the specified delay. **/
function asleep(ms){
return function(ret){
window.setTimeout(ret,ms);
};
},
function ayield(){
return function(ret){
window.setTimeout(ret,0);
};
},
/** Create a future value. **/
function afuture(){
var set=false;
var values=undefined;
var waiters=[];
return{
set:function(){
if(set){
console.log('ERROR:redundant set on future');
return;
}
values=arguments;
set=true;
for(var i=0;i<waiters.length;i++){
waiters[i].apply(null,values);
}
waiters=undefined;
},
get:function(ret){
if(set){ret.apply(null,values);return;}
waiters.push(ret);
}
};
},
function aapply_(f,ret,args){
args.unshift(ret);
f.apply(this,args);
},
/**
* A request queue that reduces each request against the pending requests.
* Also limits the queue to a maximum size and operates in a LIFO manner.
* TODO:This could probably be split into decorators and integrated with asynchronized.
*/
function arequestqueue(f,opt_lock,opt_max){
var lock=opt_lock||{};
if(!lock.q){lock.q=[];lock.active=null;}
var onExit=function(){
var next=lock.active=lock.q.pop();
if(next){
setTimeout(function(){f(onExit,next);},0);
}
};
var reduceDown=function(o,q){
for(var i=q.length -1;i>=0;i--){
var result=o.reduce(q[i]);
if(result){
q.splice(i,1);
reduceDown(result,q);
break;
}
}
q.push(o);
}
return function(o){
if(lock.active){
var first=o.reduce(lock.active);
if(first && first.equals(lock.active))return;
}
reduceDown(o,lock.q,lock.q.length - 1);
if(lock.q.length>opt_max)lock.q.length=opt_max;
if(!lock.active)onExit();
};
},
/**
* A Binary Semaphore which only allows the delegate function to be
* executed by a single thread of execution at once.
* Like Java's synchronized blocks.
* @param opt_lock an empty map{}to be used as a lock
* sharable across multiple asynchronized instances
**/
function asynchronized(f,opt_lock){
var lock=opt_lock||{};
if(!lock.q){lock.q=[];lock.active=false;}
function onExit(ret){
return function(){
var next=lock.q.shift();
if(next){
setTimeout(next,0);
}else{
lock.active=false;
}
ret();
};
}
return function(ret){
if(lock.active){
lock.q.push(function(){f(onExit(ret));});
return;
}
lock.active=true;
f(onExit(ret));
};
},
/**
* Execute an optional timeout function and abort the continuation
* of the delegate function,if it doesn't finish in the specified
* time.
**/
function atimeout(delay,f,opt_timeoutF){
return function(ret){
var timedOut=false;
var completed=false;
setTimeout(function(){
if(completed)return;
timedOut=true;
console.log('timeout');
opt_timeoutF && opt_timeoutF();
},delay);
f(aseq(
function(ret){
if(!timedOut)completed=true;
if(completed)ret();
},ret));
};
},
/**
* Memoize an async function.
**/
function amemo(f,opt_ttl){
var memoized=false;
var values;
var waiters;
var age=0;
var pending=false
return function(ret){
if(memoized){
ret.apply(null,values);
if(opt_ttl !=undefined && !pending && Date.now()>age+opt_ttl){
pending=true;
f(function(){
values=arguments;
age=Date.now();
pending=false;
})
}
return;
}
var first=!waiters;
if(first)waiters=[];
waiters.push(ret);
if(first){
f(function(){
values=arguments;
age=Date.now();
for(var i=0;i<waiters.length;i++){
waiters[i] && waiters[i].apply(null,values);
}
if(opt_ttl==undefined)f=undefined;
memoized=true;
waiters=undefined;
});
}
};
},
/**
* Decorates an afunc to merge all calls to one active execution of the
* delegate.
* Similar to asynchronized,but doesn't queue up a number of calls
* to the delegate.
*/
function amerged(f){
var waiters;
return function(ret){
var first=!waiters;
if(first){
waiters=[];
var args=argsToArray(arguments);
}
waiters.push(ret);
if(first){
args[0]=function(){
var calls=waiters;
waiters=undefined;
for(var i=0;i<calls.length;i++){
calls[i] && calls[i].apply(null,arguments);
}
}
f.apply(null,args);
}
};
},
/**
* Decorates an afunc to merge calls.
* NB:This does not return an afunc itself!
*
* Immediately fires on the first call. If more calls come in while the first is
* active,they are merged into one subsequent call with the latest arguments.
* Once the first call is complete,the afunc will fire again if any further
* calls have come in. If there are no more,then it will rest.
*
* The key difference from amerged is that it makes one call to the afunc but
* calls its own ret once for *each* call it has received. This calls only once.
*/
function mergeAsync(f){
var active=false;
var args;
return function(){
if(active){
args=argsToArray(arguments);
return;
}
active=true;
var ret=function(){
if(args){
args.unshift(ret);
f.apply(null,args);
args=undefined;
}else{
active=false;
}
};
var a=argsToArray(arguments);
a.unshift(ret);
f.apply(null,a);
};
},
/** Compose a variable number of async functions. **/
function ao(/* ... afuncs */){
var ret=arguments[arguments.length-1];
for(var i=0;i<arguments.length-1;i++){
ret=arguments[i].ao(ret);
}
return ret;
},
/** Compose a variable number of async functions. **/
function aseq(/* ... afuncs */){
var f=arguments[arguments.length-1];
for(var i=arguments.length-2;i>=0;i--){
f=arguments[i].aseq(f);
}
return f;
},
/**
* Create a function which executes several afunc's in parallel and passes
* their joined return values to an optional afunc.
*
* Usage:apar(f1,f2,f3)(opt_afunc,opt_args)
* @param opt_afunc called with joined results after all afuncs finish
* @param opt_args passed to all afuncs
**/
function apar(/* ... afuncs */){
var aargs=[];
var count=0;
var fs=arguments;
return function(ret /* opt_args */){
if(fs.length==0){
ret && ret();
return;
}
var opt_args=Array.prototype.splice.call(arguments,1);
var join=function(i){
aargs[i]=Array.prototype.splice.call(arguments,1);
if(++count==fs.length){
var a=[];
for(var j=0;j<fs.length;j++)
for(var k=0;k<aargs[j].length;k++)
a.push(aargs[j][k]);
ret && ret.apply(null,a);
}
};
for(var i=0;i<fs.length;i++)
fs[i].apply(null,[join.bind(null,i)].concat(opt_args));
};
},
/** Convert the supplied afunc into a trampolined-afunc. **/
(function(){
var active=false;
var jobs=[];
return function atramp(afunc){
return function(){
jobs.push([afunc,arguments]);
if(!active){
console.assert(jobs.length<=1,'atramp with multiple jobs');
active=true;
var job;
while((job=jobs.pop())!=null){
job[0].apply(this,job[1]);
}
active=false;
}
};
};
})(),
/** Execute the supplied afunc concurrently n times. **/
function arepeatpar(n,afunc){
return function(ret /* opt_args */){
if(n===0){
ret && ret();
return;
}
var aargs=[];
var count=0;
var opt_args=Array.prototype.splice.call(arguments,1);
var join=function(i){
if(++count==n){
var a=[];
/*
for(var j=0;j<n;j++)
for(var k=0;k<aargs[j].length;k++)
a.push(aargs[j][k]);
*/
ret && ret.apply(null,a);
}
};
for(var i=0;i<n;i++){
afunc.apply(null,[join.bind(null,i)].concat([i,n]).concat(opt_args));
}
};
},
function axhr(url,opt_op,opt_params){
var op=opt_op||"GET";
var params=opt_params||[];
return function(ret){
var xhr=new XMLHttpRequest();
xhr.open(op,url);
xhr.asend(function(json){ret(JSON.parse(json));},params && params.join('&'));
};
},
function futurefn(future){
return function(){
var args=arguments;
future.get(function(f){
f.apply(undefined,args);
});
};
},
function adelay(afunc,delay){
var queue=[];
var timeout;
function pump(){
if(timeout)return;
if(!queue.length)return;
var top=queue.shift();
var f=top[0];
var args=top[1];
var ret=args[0];
args[0]=function(){
ret.apply(null,arguments);
pump();
};
timeout=setTimeout(function(){
timeout=0;
f.apply(null,args);
},delay)
}
return function(){
var args=arguments;
queue.push([
afunc,
args
]);
pump();
};
}
]
});
var __JSONP_CALLBACKS__={};
var wrapJsonpCallback=(function(){
var nextID=0;
return function(ret,opt_nonce){
var id='c' +(nextID++);
if(opt_nonce)id +=Math.floor(Math.random()* 0xffffff).toString(16);
var cb=__JSONP_CALLBACKS__[id]=function(data){
delete __JSONP_CALLBACKS__[id];
ret && ret.call(this,data);
};
cb.id=id;
return cb;
};
})();
var ajsonp=function(url,params){
return function(ret){
var cb=wrapJsonpCallback(ret);
var script=document.createElement('script');
script.src=url+'?callback=__JSONP_CALLBACKS__.'+cb.id +(params?'&'+params.join('&'):'');
script.onload=function(){
document.body.removeChild(this);
};
script.onerror=function(){
cb(null);
document.body.removeChild(this);
};
document.body.appendChild(script);
};
};
/**
* @license
* Copyright 2012 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/*
var ErrorReportingPS={
create:function(delegate,opt_pos){
console.log('ERPS:',delegate.head);
return{
__proto__:this,
pos:opt_pos||0,
delegate:delegate
};
},
get head(){
console.log('head:',this.pos,this.delegate.head);
return this.delegate.head;
},
get tail(){
return this.tail_||(this.tail_=this.create(this.delegate.tail,this.pos+1));
},
get value(){
return this.delegate.value;
},
setValue:function(value){
console.log('setValue:',value);
this.delegate=this.delegate.setValue(value);
return this;
}
};
*/
/** String PStream **/
var StringPS={
create:function(str){
var o=Object.create(this);
o.pos=0;
o.str_=[str];
o.tail_=[];
return o;
},
set str(str){this.str_[0]=str;},
get head(){return this.pos>=this.str_[0].length?null:this.str_[0].charAt(this.pos);},
get value(){return this.hasOwnProperty('value_')?this.value_:this.str_[0].charAt(this.pos-1);},
get tail(){
if(!this.tail_[0]){
var tail=Object.create(this.__proto__);
tail.str_=this.str_;
tail.pos=this.pos+1;
tail.tail_=[];
this.tail_[0]=tail;
}
return this.tail_[0];
},
setValue:function(value){
var ret=Object.create(this.__proto__);
ret.str_=this.str_;
ret.pos=this.pos;
ret.tail_=this.tail_;
ret.value_=value;
return ret;
},
toString:function(){
return this.str_[0].substring(this.pos);
}
};
function prep(arg){
if(typeof arg==='string')return literal(arg);
return arg;
}
function prepArgs(args){
for(var i=0;i<args.length;i++){
args[i]=prep(args[i]);
}
return args;
}
function range(c1,c2){
var f=function(ps){
if(!ps.head)return undefined;
if(ps.head<c1||ps.head>c2)return undefined;
return ps.tail.setValue(ps.head);
};
f.toString=function(){return 'range('+c1+','+c2+')';};
return f;
}
function literal(str,opt_value){
var f=function(ps){
for(var i=0;i<str.length;i++,ps=ps.tail){
if(str.charAt(i)!==ps.head)return undefined;
}
return ps.setValue(opt_value||str);
};
f.toString=function(){return '"'+str+'"';};
return f;
}
/**
* Case-insensitive String literal.
* Doesn't work for Unicode characters.
**/
function literal_ic(str,opt_value){
str=str.toLowerCase();
var f=function(ps){
for(var i=0;i<str.length;i++,ps=ps.tail){
if(!ps.head||str.charAt(i)!==ps.head.toLowerCase())return undefined;
}
return ps.setValue(opt_value||str);
};
f.toString=function(){return '"'+str+'"';};
return f;
}
function anyChar(ps){
return ps.head?ps.tail/*.setValue(ps.head)*/:undefined;
}
function notChar(c){
return function(ps){
return ps.head && ps.head !==c?ps.tail.setValue(ps.head):undefined;
};
}
function notChars(s){
return function(ps){
return ps.head && s.indexOf(ps.head)==-1?ps.tail.setValue(ps.head):undefined;
};
}
function not(p,opt_else){
p=prep(p);
opt_else=prep(opt_else);
var f=function(ps){
return this.parse(p,ps)?undefined:
opt_else?this.parse(opt_else,ps):ps;
};
f.toString=function(){return 'not('+p+')';};
return f;
}
function optional(p){
p=prep(p);
var f=function(ps){return this.parse(p,ps)||ps.setValue(undefined);};
f.toString=function(){return 'optional('+p+')';};
return f;
}
function copyInput(p){
p=prep(p);
var f=function(ps){
var res=this.parse(p,ps);
return res?res.setValue(ps.str_.toString().substring(ps.pos,res.pos)):res;
};
f.toString=function(){return 'copyInput('+p+')';};
return f;
}
/** Parses if the delegate parser parses,but doesn't advance the pstream. **/
function lookahead(p){
p=prep(p);
var f=function(ps){return this.parse(p,ps)&& ps;};
f.toString=function(){return 'lookahead('+p+')';};
return f;
}
function repeat(p,opt_delim,opt_min,opt_max){
p=prep(p);
opt_delim=prep(opt_delim);
var f=function(ps){
var ret=[];
for(var i=0;!opt_max||i<opt_max;i++){
var res;
if(opt_delim && ret.length !=0){
if(!(res=this.parse(opt_delim,ps)))break;
ps=res;
}
if(!(res=this.parse(p,ps)))break;
ret.push(res.value);
ps=res;
}
if(opt_min && ret.length<opt_min)return undefined;
return ps.setValue(ret);
};
f.toString=function(){return 'repeat('+p+','+opt_delim+','+opt_min+','+opt_max+')';};
return f;
}
function plus(p){return repeat(p,undefined,1);}
function noskip(p){
return function(ps){
this.skip_=false;
ps=this.parse(p,ps);
this.skip_=true;
return ps;
};
}
/** A simple repeat which doesn't build an array of parsed values. **/
function repeat0(p){
p=prep(p);
return function(ps){
var res;
while(res=this.parse(p,ps))ps=res;
return ps.setValue('');
};
}
function seq(/* vargs */){
var args=prepArgs(arguments);
var f=function(ps){
var ret=[];
for(var i=0;i<args.length;i++){
if(!(ps=this.parse(args[i],ps)))return undefined;
ret.push(ps.value);
}
return ps.setValue(ret);
};
f.toString=function(){return 'seq('+argsToArray(args).join(',')+ ')';};
return f;
}
/**
* A Sequence which only returns one of its arguments.
* Ex. seq1(1,'"',sym('string'),'"'),
**/
function seq1(n /*,vargs */){
var args=prepArgs(argsToArray(arguments).slice(1));
var f=function(ps){
var ret;
for(var i=0;i<args.length;i++){
if(!(ps=this.parse(args[i],ps)))return undefined;
if(i==n)ret=ps.value;
}
return ps.setValue(ret);
};
f.toString=function(){return 'seq1('+n+','+argsToArray(args).join(',')+ ')';};
return f;
}
var parserVersion_=1;
function invalidateParsers(){
parserVersion_++;
}
function simpleAlt(/* vargs */){
var args=prepArgs(arguments);
var f=function(ps){
for(var i=0;i<args.length;i++){
var res=this.parse(args[i],ps);
if(res)return res;
}
return undefined;
};
f.toString=function(){return 'alt('+argsToArray(args).join(' | ')+ ')';};
return f;
}
function alt(/* vargs */){
var SIMPLE_ALT=simpleAlt.apply(null,arguments);
var args=prepArgs(arguments);
var map={};
var parserVersion=parserVersion_;
function nullParser(){return undefined;}
function testParser(p,ps){
var c=ps.head;
var trapPS={
getValue:function(){return this.value;},
setValue:function(v){this.value=v;},
value:ps.value,
head:c
};
var goodChar=false;
trapPS.__defineGetter__('tail',function(){
goodChar=true;
return{
value:this.value,
getValue:function(){return this.value;},
setValue:function(v){this.value=v;}
};
});
this.parse(p,trapPS);
return goodChar;
}
function getParserForChar(ps){
var c=ps.head;
var p=map[c];
if(!p){
var alts=[];
for(var i=0;i<args.length;i++){
var parser=args[i];
if(testParser.call(this,parser,ps))alts.push(parser);
}
p=alts.length==0?nullParser:
alts.length==1?alts[0]:
simpleAlt.apply(null,alts);
map[c]=p;
}
return p;
}
return function(ps){
if(parserVersion !==parserVersion_){
map={};
parserVersion=parserVersion_;
}
var r1=this.parse(getParserForChar.call(this,ps),ps);
/*
var r2=this.parse(SIMPLE_ALT,ps);
if(!r1 !==!r2)debugger;
if(r1 &&(r1.pos !==r2.pos))debugger;
*/
return r1;
};
}
/** Takes a parser which returns an array,and converts its result to a String. **/
function str(p){
p=prep(p);
var f=function(ps){
var ps=this.parse(p,ps);
return ps?ps.setValue(ps.value.join('')):undefined;
};
f.toString=function(){return 'str('+p+')';};
return f;
}
/** Ex. attr:pick([0,2],seq(sym('label'),'=',sym('value')))**/
function pick(as,p){
p=prep(p);
var f=function(ps){
var ps=this.parse(p,ps);
if(!ps)return undefined;
var ret=[];
for(var i=0;i<as.length;i++)ret.push(ps.value[as[i]]);
return ps.setValue(ret);
};
f.toString=function(){return 'pick('+as+','+p+')';};
return f;
}
function parsedebug(p){
return function(ps){
debugger;
var old=DEBUG_PARSE;
DEBUG_PARSE=true;
var ret=this.parse(p,ps);
DEBUG_PARSE=old;
return ret;
};
}
function sym(name){
var f=function(ps){
var p=this[name];
if(!p)console.log('PARSE ERROR:Unknown Symbol<'+name+'>');
return this.parse(p,ps);
};
f.toString=function(){return '<'+name+'>';};
return f;
}
var DEBUG_PARSE=false;
var grammar={
parseString:function(str){
var ps=this.stringPS;
ps.str=str;
var res=this.parse(this.START,ps);
return res && res.value;
},
parse:function(parser,pstream){
if(DEBUG_PARSE && pstream.str_){
console.log(new Array(pstream.pos).join('.'),pstream.head);
console.log(pstream.pos+'>'+pstream.str_[0].substring(0,pstream.pos)+ '('+pstream.head+')');
}
var ret=parser.call(this,pstream);
if(DEBUG_PARSE){
console.log(parser+'==>' +(!!ret)+ ' ' +(ret && ret.value));
}
return ret;
},
/** Export a symbol for use in another grammar or stand-alone. **/
'export':function(str){
return this[str].bind(this);
},
addAction:function(sym,action){
var p=this[sym];
this[sym]=function(ps){
var val=ps.value;
var ps2=this.parse(p,ps);
return ps2 && ps2.setValue(action.call(this,ps2.value,val));
};
this[sym].toString=function(){return '<<'+sym+'>>';};
},
addActions:function(map){
for(var key in map)this.addAction(key,map[key]);
return this;
}
};
function defineTTLProperty(obj,name,ttl,f){
Object.defineProperty(obj,name,{
get:function(){
var accessed;
var value=undefined;
Object.defineProperty(this,name,{
get:function(){
function scheduleTimer(){
setTimeout(function(){
if(accessed){
scheduleTimer();
}else{
value=undefined;
}
accessed=false;
},ttl);
}
if(!value){
accessed=false;
value=f();
scheduleTimer();
}else{
accessed=true;
}
return value;
}
});
return this[name];
}
});
}
defineTTLProperty(grammar,'stringPS',30000,function(){return StringPS.create("");});
var SkipGrammar={
create:function(gramr,skipp){
return{
__proto__:gramr,
skip_:true,
parse:function(parser,pstream){
if(this.skip_)pstream=this.skip.call(grammar,pstream)||pstream;
return this.__proto__.parse.call(this,parser,pstream);
},
skip:skipp
};
}
};
/**
* @license
* Copyright 2012 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/** Publish and Subscribe Event Notification Service. **/
MODEL({
name:'EventService',
constants:{
/** If listener thows this exception,it will be removed. **/
UNSUBSCRIBE_EXCEPTION:'unsubscribe',
/** Used as topic suffix to specify broadcast to all sub-topics. **/
WILDCARD:'*'
},
methods:{
/** Create a "one-time" listener which unsubscribes itself after its first invocation. **/
oneTime:function(listener){
return function(){
listener.apply(this,argsToArray(arguments));
throw EventService.UNSUBSCRIBE_EXCEPTION;
};
},
/** Log all listener invocations to console. **/
consoleLog:function(listener){
return function(){
var args=argsToArray(arguments);
console.log(args);
listener.apply(this,args);
};
},
/**
* Merge all notifications occuring in the specified time window into a single notification.
* Only the last notification is delivered.
*
* @param opt_delay time in milliseconds of time-window,defaults to 16ms,which is
* the smallest delay that humans aren't able to perceive.
**/
merged:function(listener,opt_delay,opt_X){
var setTimeoutX=(opt_X && opt_X.setTimeout)||setTimeout;
var delay=opt_delay||16;
return function(){
var triggered=false;
var unsubscribed=false;
var lastArgs=null;
var f=function(){
lastArgs=arguments;
if(unsubscribed)throw EventService.UNSUBSCRIBE_EXCEPTION;
if(!triggered){
triggered=true;
try{
setTimeoutX(
function(){
triggered=false;
var args=argsToArray(lastArgs);
lastArgs=null;
try{
listener.apply(this,args);
}catch(x){
if(x===EventService.UNSUBSCRIBE_EXCEPTION)unsubscribed=true;
}
},delay);
}catch(e){
throw EventService.UNSUBSCRIBE_EXCEPTION;
}
}
};
f.toString=function(){
return 'MERGED('+delay+','+listener.$UID+','+listener+')';
};
return f;
}();
},
/**
* Merge all notifications occuring until the next animation frame.
* Only the last notification is delivered.
**/
framed:function(listener,opt_X){
opt_X=opt_X||this.X;
var requestAnimationFrameX=(opt_X && opt_X.requestAnimationFrame)||requestAnimationFrame;
return function(){
var triggered=false;
var unsubscribed=false;
var lastArgs=null;
var f=function(){
lastArgs=arguments;
if(unsubscribed)throw EventService.UNSUBSCRIBE_EXCEPTION;
if(!triggered){
triggered=true;
requestAnimationFrameX(
function(){
triggered=false;
var args=argsToArray(lastArgs);
lastArgs=null;
try{
listener.apply(this,args);
}catch(x){
if(x===EventService.UNSUBSCRIBE_EXCEPTION)unsubscribed=true;
}
});
}
};
f.toString=function(){
return 'ANIMATE('+listener.$UID+','+listener+')';
};
return f;
}();
},
/** Decroate a listener so that the event is delivered asynchronously. **/
async:function(listener,opt_X){
return this.delay(0,listener,opt_X);
},
delay:function(delay,listener,opt_X){
opt_X=opt_X||this.X;
return function(){
var args=argsToArray(arguments);
(opt_X && opt_X.setTimeout?opt_X.setTimeout:setTimeout)(function(){listener.apply(this,args);},delay);
};
},
hasListeners:function(topic){
console.log('TODO:haslisteners');
return true;
},
/**
* Publish a notification to the specified topic.
*
* @return number of subscriptions notified
**/
publish:function(topic){
return this.subs_?
this.pub_(
this.subs_,
0,
topic,
this.appendArguments([this,topic],arguments,1)):
0;
},
/** Publish asynchronously. **/
publishAsync:function(topic){
var args=argsToArray(arguments);
var me=this;
setTimeout(function(){me.publish.apply(me,args);},0);
},
/**
* Publishes a message to this object and all of its children.
* Objects/Protos which have children should override the
* standard definition,which is the same as just calling publish().
**/
deepPublish:function(topic){
return this.publish.apply(this,arguments);
},
/**
* Publish a message supplied by a factory function.
*
* This is useful if the message is expensive to generate and you
* don't want to waste the effort if there are no listeners.
*
* arg fn:function which returns array
**/
lazyPublish:function(topic,fn){
if(this.hasListeners(topic))return this.publish.apply(this,fn());
return 0;
},
/** Subscribe to notifications for the specified topic. **/
subscribe:function(topic,listener){
if(!this.subs_)this.subs_={};
this.sub_(this.subs_,0,topic,listener);
},
/** Unsubscribe a listener from the specified topic. **/
unsubscribe:function(topic,listener){
if(!this.subs_)return;
this.unsub_(this.subs_,0,topic,listener);
},
/** Unsubscribe all listeners from this service. **/
unsubscribeAll:function(){
this.sub_={};
},
pub_:function(map,topicIndex,topic,msg){
var count=0;
if(map==null)return 0;
if(topicIndex<topic.length){
var t=topic[topicIndex];
if(t==this.WILDCARD)
return this.notifyListeners_(topic,map,msg);
if(t)count +=this.pub_(map[t],topicIndex+1,topic,msg);
}
count +=this.notifyListeners_(topic,map[null],msg);
return count;
},
sub_:function(map,topicIndex,topic,listener){
if(topicIndex==topic.length){
if(!map[null])map[null]=[];
map[null].push(listener);
}else{
var key=topic[topicIndex];
if(!map[key])map[key]={};
this.sub_(map[key],topicIndex+1,topic,listener);
}
},
unsub_:function(map,topicIndex,topic,listener){
if(topicIndex==topic.length){
if(!map[null])return true;
if(!map[null].deleteI(listener)){
console.warn('phantom unsubscribe,size:',map[null].length);
}else{
}
if(!map[null].length)delete map[null];
}else{
var key=topic[topicIndex];
if(!map[key])return false;
if(this.unsub_(map[key],topicIndex+1,topic,listener))
delete map[key];
}
return Object.keys(map).length==0;
},
/** @return true if the message was delivered without error. **/
notifyListener_:function(topic,listener,msg){
try{
listener.apply(null,msg);
}catch(err){
if(err !==this.UNSUBSCRIBE_EXCEPTION){
console.error('Error delivering event(removing listener):',topic.join('.'),err);
}else{
console.warn('Unsubscribing listener:',topic.join('.'));
}
return false;
}
return true;
},
/** @return number of listeners notified **/
notifyListeners_:function(topic,listeners,msg){
if(listeners==null)return 0;
if(Array.isArray(listeners)){
for(var i=0;i<listeners.length;i++){
var listener=listeners[i];
if(!this.notifyListener_(topic,listener,msg)){
listeners.splice(i,1);
i--;
}
}
return listeners.length;
}
var count=0;
for(var key in listeners){
count +=this.notifyListeners_(topic,listeners[key],msg);
}
return count;
},
appendArguments:function(a,args,start){
for(var i=start;i<args.length;i++)a.push(args[i]);
return a;
}
}
});
/** Extend EventService with support for dealing with property-change notification. **/
MODEL({
name:'PropertyChangeSupport',
extendsModel:'EventService',
constants:{
/** Root for property topics. **/
PROPERTY_TOPIC:'property'
},
methods:{
/** Create a topic for the specified property name. **/
propertyTopic:function(property){
return [ this.PROPERTY_TOPIC,property ];
},
/** Indicate that a specific property has changed. **/
propertyChange:function(property,oldValue,newValue){
if(!this.subs_)return;
if(property !=null &&(
oldValue===newValue||
(/*NaN check*/(oldValue !==oldValue)&&(newValue !==newValue)))
)return;
this.publish(this.propertyTopic(property),oldValue,newValue);
},
propertyChange_:function(propertyTopic,oldValue,newValue){
if(!this.subs_)return;
if(oldValue===newValue||(/*NaN check*/(oldValue !==oldValue)&&(newValue !==newValue)))return;
this.publish(propertyTopic,oldValue,newValue);
},
/** Indicates that one or more unspecified properties have changed. **/
globalChange:function(){
this.publish(this.propertyTopic(this.WILDCARD),null,null);
},
addListener:function(listener){
console.assert(listener,'Listener cannot be null.');
this.addPropertyListener(null,listener);
},
removeListener:function(listener){
this.removePropertyListener(null,listener);
},
/** @arg property the name of the property to listen to or 'null' to listen to all properties. **/
addPropertyListener:function(property,listener){
this.subscribe(this.propertyTopic(property),listener);
},
removePropertyListener:function(property,listener){
this.unsubscribe(this.propertyTopic(property),listener);
},
/** Create a Value for the specified property. **/
propertyValue:function(prop){
if(!prop)throw 'Property Name required for propertyValue().';
var name=prop+'Value___';
return Object.hasOwnProperty.call(this,name)?this[name]:(this[name]=PropertyValue.create(this,prop));
}
}
});
var FunctionStack={
create:function(){
var stack=[false];
return{
stack:stack,
push:function(f){stack.unshift(f);},
pop:function(){stack.shift();},
};
}
};
var PropertyValue={
create:function(obj,prop){
return{__proto__:this,$UID:obj.$UID+'.'+prop,obj:obj,prop:prop};
},
get:function(){return this.obj[this.prop];},
set:function(val){this.obj[this.prop]=val;},
asDAO:function(){
console.warn('ProperytValue.asDAO()deprecated. Use property$Proxy instead.');
if(!this.proxy){
this.proxy=ProxyDAO.create({delegate:this.get()});
this.addListener(function(){proxy.delegate=this.get();}.bind(this));
}
return this.proxy;
},
get value(){return this.get();},
set value(val){this.set(val);},
addListener:function(listener){this.obj.addPropertyListener(this.prop,listener);},
removeListener:function(listener){this.obj.removePropertyListener(this.prop,listener);},
toString:function(){return 'PropertyValue('+this.prop+')';}
};
/** Static support methods for working with Events. **/
var Events={
/** Collection of all 'following' listeners. **/
listeners_:new WeakMap(),
recordListener:function(src,dst,listener,opt_dontCallListener){
var srcMap=this.listeners_.get(src);
if(!srcMap){
srcMap=new WeakMap();
this.listeners_.set(src,srcMap);
}
console.assert(!srcMap.get(dst),'recordListener:duplicate follow');
srcMap.set(dst,listener);
src.addListener(listener);
if(!opt_dontCallListener)listener();
},
identity:function(x){return x;},
/** Have the dstValue listen to changes in the srcValue and update its value to be the same. **/
follow:function(srcValue,dstValue){
if(!srcValue||!dstValue)return;
this.recordListener(srcValue,dstValue,function(){
var sv=srcValue.get();
var dv=dstValue.get();
if(sv !==dv)dstValue.set(sv);
});
},
/** Have the dstValue stop listening for changes to the srcValue. **/
unfollow:function(src,dst){
if(!src||!dst)return;
var srcMap=this.listeners_.get(src);
if(!srcMap)return;
var listener=srcMap.get(dst);
if(listener){
srcMap.delete(dst);
src.removeListener(listener);
}
},
/**
* Maps values from one model to another.
* @param f maps values from srcValue to dstValue
*/
map:function(srcValue,dstValue,f){
if(!srcValue||!dstValue)return;
this.recordListener(srcValue,dstValue,function(){
var s=f(srcValue.get());
var d=dstValue.get();
if(s !==d)dstValue.set(s);
});
},
/**
* Link the values of two models by having them follow each other.
* Initial value is copied from srcValue to dstValue.
**/
link:function(srcValue,dstValue){
this.follow(srcValue,dstValue);
this.follow(dstValue,srcValue);
},
/**
* Relate the values of two models.
* @param f maps value1 to model2
* @param fprime maps model2 to value1
* @param removeFeedback disables feedback
*/
relate:function(srcValue,dstValue,f,fprime,removeFeedback){
if(!srcValue||!dstValue)return;
var feedback=false;
var l=function(sv,dv,f){return function(){
if(removeFeedback && feedback)return;
var s=f(sv.get());
var d=dv.get();
if(s !==d){
feedback=true;
dv.set(s);
feedback=false;
}
}};
var l1=l(srcValue,dstValue,f);
var l2=l(dstValue,srcValue,fprime);
this.recordListener(srcValue,dstValue,l1,true);
this.recordListener(dstValue,srcValue,l2,true);
l1();
},
/** Unlink the values of two models by having them no longer follow each other. **/
unlink:function(value1,value2){
this.unfollow(value1,value2);
this.unfollow(value2,value1);
},
/**
* Trap the dependencies of 'fn' and re-invoke whenever
* their values change. The return value of 'fn' is
* passed to 'opt_fn'.
* @param opt_fn also invoked when dependencies change,
* but its own dependencies are not tracked.
* @returns a cleanup object. call ret.destroy();to
* destroy the dynamic function and listeners.
*/
dynamic:function(fn,opt_fn,opt_X){
var fn2=opt_fn?function(){opt_fn(fn());}:fn;
var listener=EventService.framed(fn2,opt_X);
var destroyHelper={
listener:listener,
propertyValues:[].clone(),
destroy:function(){
this.propertyValues.forEach(function(p){
p.removeListener(this.listener);
}.bind(this))
}
};
Events.onGet.push(function(obj,name,value){
obj.propertyValue(name).addListener(listener);
destroyHelper.propertyValues.push(obj.propertyValue(name));
});
var ret=fn();
Events.onGet.pop();
opt_fn && opt_fn(ret);
return destroyHelper;
},
onSet:FunctionStack.create(),
onGet:FunctionStack.create(),
}
/*
subscribe(subject,topic,listener);
addCleanupTask(fn)
cleanup();
*/
MODEL({
name:'Movement',
methods:{
distance:function(x,y){return Math.sqrt(x*x+y*y);},
/** Combinator to create the composite of two functions. **/
o:function(f1,f2){return function(x){return f1(f2(x));};},
/** Combinator to create the average of two functions. **/
avg:function(f1,f2){return function(x){return(f1(x)+ f2(x))/2;};},
/** Constant speed. **/
linear:function(x){return x;},
/** Move to target value and then return back to original value. **/
back:function(x){return x<0.5?2*x:2-2*x;},
/** Start slow and accelerate until half-way,then start slowing down. **/
accelerate:function(x){return(Math.sin(x * Math.PI - Math.PI/2)+1)/2;},
/** Start slow and ease-in to full speed. **/
easeIn:function(a){
var v=1/(1-a/2);
return function(x){
var x1=Math.min(x,a);
var x2=Math.max(x-a,0);
return(a?0.5*x1*(x1/a)*v:0)+ x2*v;
};
},
/** Combinator to reverse behaviour of supplied function. **/
reverse:function(f){return function(x){return 1-f(1-x);};},
/** Reverse of easeIn. **/
easeOut:function(b){return Movement.reverse(Movement.easeIn(b));},
/**
* Cause an oscilation at the end of the movement.
* @param b percentage of time to to spend bouncing [0,1]
* @param a amplitude of maximum bounce
* @param opt_c number of cycles in bounce(default:3)
*/
oscillate:function(b,a,opt_c){
var c=opt_c||3;
return function(x){
if(x<(1-b))return x/(1-b);
var t=(x-1+b)/b;
return 1+(1-t)*2*a*Math.sin(2*c*Math.PI * t);
};
},
/**
* Cause an bounce at the end of the movement.
* @param b percentage of time to to spend bouncing [0,1]
* @param a amplitude of maximum bounce
*/
bounce:function(b,a,opt_c){
var c=opt_c||3;
return function(x){
if(x<(1-b))return x/(1-b);
var t=(x-1+b)/b;
return 1-(1-t)*2*a*Math.abs(Math.sin(2*c*Math.PI * t));
};
},
bounce2:function(a){
var v=1 /(1-a);
return function(x){
if(x<(1-a))return v*x;
var p=(x-1+a)/a;
return 1-(x-1+a)*v/2;
};
},
/** Move backwards a% before continuing to end. **/
stepBack:function(a){
return function(x){
return(x<a)?-x:-2*a+(1+2*a)*x;
};
},
/** Combination of easeIn and easeOut. **/
ease:function(a,b){
return Movement.o(Movement.easeIn(a),Movement.easeOut(b));
},
seq:function(f1,f2){
return(f1 && f2)?function(){f1.apply(this,argsToArray(arguments));f2();}:
f1?f1
:f2;
},
/** @return a latch function which can be called to stop the animation. **/
animate:function(duration,fn,opt_interp,opt_onEnd,opt_X){
var requestAnimationFrameX=(opt_X && opt_X.requestAnimationFrame)||requestAnimationFrame;
if(duration==0)return Movement.seq(fn,opt_onEnd);
var interp=opt_interp||Movement.linear;
return function(){
var ranges=[];
var stopped=false;
function stop(){
stopped=true;
opt_onEnd && opt_onEnd();
opt_onEnd=null;
}
if(fn){
Events.onSet.push(function(obj,name,value2){
ranges.push([obj,name,obj[name],value2]);
});
fn.apply(this,argsToArray(arguments));
Events.onSet.pop();
}
var startTime=Date.now();
function go(){
if(stopped)return;
var now=Date.now();
var p=interp((Math.min(now,startTime+duration)-startTime)/duration);
var last=now>=startTime+duration;
for(var i=0;i<ranges.length;i++){
var r=ranges[i];
var obj=r[0],name=r[1],value1=r[2],value2=r[3];
obj[name]=last?value2:value1 +(value2-value1)* p;
}
if(last)stop();else requestAnimationFrameX(go);
}
if(ranges.length>0){
requestAnimationFrameX(go);
}else{
var setTimeoutX=(opt_X && opt_X.setTimeout)||setTimeout;
setTimeoutX(stop,duration);
}
return stop;
};
},
/*
animate2:function(timer,duration,fn){
return function(){
var startTime=timer.time;
Events.onSet.push(function(obj,name,value2){
var value1=obj[name];
Events.dynamic(function(){
var now=timer.time;
obj[name]=value1 +(value2-value1)*(now-startTime)/duration;
if(now>startTime+duration)throw EventService.UNSUBSCRIBE_EXCEPTION;
});
return false;
});
fn.apply(this,argsToArray(arguments));
Events.onSet.pop();
update();
};
},
*/
compile:function(a,opt_rest){
function noop(){}
function isPause(op){
return Array.isArray(op)&& op[0]==0;
}
function compilePause(op,rest){
return function(){
document.onclick=function(){
document.onclick=null;
rest();
};
};
}
function isSimple(op){
return Array.isArray(op)&& typeof op[0]==='number';
}
function compileSimple(op,rest){
op[3]=Movement.seq(op[3],rest);
return function(){Movement.animate.apply(null,op)();};
}
function isParallel(op){
return Array.isArray(op)&& Array.isArray(op[0]);
}
function compileParallel(op,rest){
var join=(function(num){
return function(){--num||rest();};
})(op.length);
return function(){
for(var i=0;i<op.length;i++)
if(isSimple(op[i]))
Movement.animate(op[i][0],op[i][1],op[i][2],Movement.seq(op[i][3],join))();
else
Movement.compile(op[i],join)();
};
}
function compileFn(fn,rest){
return Movement.seq(fn,rest);
}
function compile_(a,i){
if(i>=a.length)return opt_rest||noop;
var rest=compile_(a,i+1);
var op=a[i];
if(isPause(op))return compilePause(op,rest);
if(isSimple(op))return compileSimple(op,rest);
if(isParallel(op))return compileParallel(op,rest);
return compileFn(op,rest);
}
return compile_(a,0);
},
onIntersect:function(o1,o2,fn){
if(o1.model_.R){
Events.dynamic(function(){o1.x;o1.y;o2.x;o2.y;},function(){
var dx=o1.x - o2.x;
var dy=o1.y - o2.y;
var d=dx*dx+dy*dy;
var r2=o1.r+o2.r;
if(d<r2*r2)
fn.call(null,o1,o2);
});
}else{
Events.dynamic(function(){o1.x;o1.y;o2.x;o2.y;},function(){
if((o1.x<=o2.x && o1.x+o1.width>o2.x &&
o1.y<=o2.y && o1.y+o1.height>o2.y)||
(o2.x<=o1.x && o2.x+o2.width>o1.x &&
o2.y<=o1.y && o2.y+o2.height>o1.y))
{
fn.call(null,o1,o2);
}
});
}
},
stepTowards:function(src,dst,maxStep){
var dx=src.x - dst.x;
var dy=src.y - dst.y;
var theta=Math.atan2(dy,dx);
var r=Math.sqrt(dx*dx+dy*dy);
r=r<0?Math.max(-maxStep,r):Math.min(maxStep,r);
dst.x +=r*Math.cos(-theta);
dst.y -=r*Math.sin(-theta);
},
/**
* Cause one object to move towards another at a specified rate.
*
* @arg t timer
* @arg body body to be orbitted
* @arg sat object to orbit body
* @arg r radius of orbit
* @arg p period of orbit
*/
moveTowards:function(t,body,sat,v){
var bodyX=body.propertyValue('x');
var bodyY=body.propertyValue('y');
var satX=sat.propertyValue('x');
var satY=sat.propertyValue('y');
t.addListener(function(){
var dx=bodyX.get()- satX.get();
var dy=(bodyY.get()- satY.get());
var theta=Math.atan2(dy,dx);
var r=Math.sqrt(dx*dx+dy*dy);
r=r<0?Math.max(-v,r):Math.min(v,r);
satX.set(satX.get()+ r*Math.cos(-theta));
satY.set(satY.get()- r*Math.sin(-theta));
});
},
/**
* Cause one object to orbit another.
*
* @arg t timer
* @arg body body to be orbitted
* @arg sat object to orbit body
* @arg r radius of orbit
* @arg p period of orbit
*/
orbit:function(t,body,sat,r,p,opt_start){
var bodyX=body.x$;
var bodyY=body.y$;
var satX=sat.x$;
var satY=sat.y$;
var start=opt_start||0;
t.addListener(EventService.framed(function(){
var time=t.time;
satX.set(bodyX.get()+ r*Math.sin(time/p*Math.PI*2+start));
satY.set(bodyY.get()+ r*Math.cos(time/p*Math.PI*2+start));
}));
},
strut:function(mouse,c,dx,dy){
Events.dynamic(function(){mouse.x;mouse.y;},function(){
c.x=mouse.x+dx;
c.y=mouse.y+dy;
});
},
friction:function(c,opt_coef){
var coef=opt_coef||0.9;
Events.dynamic(function(){c.vx;c.vy;},function(){
c.vx *=coef;
c.vy *=coef;
});
},
inertia:function(c){
Events.dynamic(function(){c.vx;c.vy;c.x;c.y;},function(){
c.x +=c.vx;
c.y +=c.vy;
if(c.x<0.1)c.x=0;
if(c.y<0.1)c.y=0;
});
},
spring:function(mouse,c,dx,dy,opt_strength){
var strength=opt_strength||8;
Events.dynamic(function(){mouse.x;mouse.y;c.x;c.y;},function(){
if(dx===0 && dy===0){
c.x=mouse.x;
c.y=mouse.y;
}else{
var d=Movement.distance(dx,dy);
var dx2=mouse.x+dx - c.x;
var dy2=mouse.y+dy - c.y;
var d2=Movement.distance(dx2,dy2);
var dv=strength * d2/d;
var a=Math.atan2(dy2,dx2);
c.vx +=dv * Math.cos(a);
c.vy +=dv * Math.sin(a);
}
});
},
spring2:function(c1,c2,length,opt_strength){
var strength=opt_strength||4;
Events.dynamic(function(){c1.x;c1.y;c2.x;c2.y;},function(){
var d=c1.distanceTo(c2);
var a=Math.atan2(c2.y-c1.y,c2.x-c1.x);
if(d>length){
c1.applyMomentum(strength *(d/length-1),a);
c2.applyMomentum(-strength *(d/length-1),a);
}else if(d<length){
c1.applyMomentum(-strength *(length/d-1),a);
c2.applyMomentum(strength *(length/d-1),a);
}
});
},
createAnimatedPropertyInstallFn:function(duration,interpolation){
/* Returns a function that can be assigned as a $$DOC{ref:'Property'}
$$DOC{ref:'Property.install'}function. Any assignments to the property
will be automatically animated.</p>
<p><code>
properties:[
&nbsp;&nbsp;{name:'myProperty',
&nbsp;&nbsp;&nbsp;&nbsp;install:createAnimatedPropertyInstallFn(500,Movement.ease(0.2,0.2)),
&nbsp;&nbsp;&nbsp;&nbsp;...
&nbsp;&nbsp;}]
</code>*/
return function(prop){
this.defineProperty(
{
name:prop.name+"$AnimationLatch",
defaultValue:0,
hidden:true,
documentation:function(){/* The animation controller. */},
}
);
var actualSetter=this.__lookupSetter__(prop.name);
this.defineProperty(
{
name:prop.name+"$AnimationSetValue",
defaultValue:0,
hidden:true,
documentation:function(){/* The animation value setter. */},
postSet:function(_,nu){
actualSetter.call(this,nu);
}
}
);
this.__defineSetter__(prop.name,function(nu){
var latch=this[prop.name+"$AnimationLatch"];
latch && latch();
var anim=Movement.animate(
duration,
function(){
this[prop.name+"$AnimationSetValue"]=nu;
}.bind(this),
interpolation
);
this[prop.name+"$AnimationLatch"]=anim();
});
};
}
}
});
/**
* @license
* Copyright 2012 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* JSONUtil -- Provides JSON++ marshalling support.
*
* Like regular JSON,with the following differences:
* 1. Marshalls to/from FOAM Objects,rather than maps.
* 2. Object Model information is encoded as 'model:"ModelName"'
* 3. Default Values are not marshalled,saving disk space and network bandwidth.
* 4. Support for marshalling functions.
* 5. Support for property filtering,ie. only output non-transient properties.
* 6. Support for 'pretty' and 'compact' modes.
*
* TODO:
* Replace with JSONParser.js,when finished.
* Maybe rename to FON(FOAM Object Notation,pronounced 'phone')to avoid
* confusion with regular JSON syntax.
**/
var AbstractFormatter={
/** @param p a predicate function or an mLang **/
where:function(p){
return{
__proto__:this,
p:(p.f && p.f.bind(p))||p
};
},
p:function(){return true;}
};
var JSONUtil={
keyify:function(str){
return '"'+str+'"';
},
escape:function(str){
return str
.replace(/\\/g,'\\\\')
.replace(/"/g,'\\"')
.replace(/[\x00-\x1f]/g,function(c){
return "\\u00" +((c.charCodeAt(0)<0x10)?
'0'+c.charCodeAt(0).toString(16):
c.charCodeAt(0).toString(16));
});
},
parseToMap:function(str){
return eval('('+str+')');
},
parse:function(X,str,seq){
return this.mapToObj(X,this.parseToMap(str),undefined,seq);
},
arrayToObjArray:function(X,a,opt_defaultModel,seq){
for(var i=0;i<a.length;i++){
a[i]=this.mapToObj(X,a[i],opt_defaultModel,seq);
}
return a;
},
/**
* Convert JS-Maps which contain the 'model_' property,into
* instances of that model.
**/
mapToObj:function(X,obj,opt_defaultModel,seq){
if(!obj||typeof obj.model_==='object')return obj;
if(Array.isArray(obj))return this.arrayToObjArray(X,obj,undefined,seq);
if(obj instanceof Function)return obj;
if(obj instanceof Date)return obj;
if(obj instanceof Object){
var j=0;
for(var key in obj){
if(key !='model_' && key !='prototype_')obj[key]=this.mapToObj(X,obj[key],null,seq);
j++;
}
/* var keys=Object.keys(obj);
for(var j=0,key;key=keys[j];j++){
if(key !='model_' && key !='prototype_')obj[key]=this.mapToObj(obj[key]);
}
*/
if(opt_defaultModel && !obj.model_)return opt_defaultModel.create(obj);
if(obj.model_){
var newObj=FOAM.lookup(obj.model_,X);
if(!newObj && seq){
var future=afuture();
seq.push(future.get);
arequire(obj.model_)(function(model){
if(!model){
if(obj.model_ !=='Template')
console.warn('Failed to dynamically load:',obj.model_);
future.set(obj);
return;
}
var tmp=model.create(obj);
obj.become(tmp);
future.set(obj);
});
}
return newObj?newObj.create(obj,X):obj;
}
return obj
}
return obj;
},
compact:{
__proto__:AbstractFormatter,
stringify:function(obj){
var buf='';
this.output(function(){
for(var i=0;i<arguments.length;i++)
buf +=arguments[i];
},obj);
return buf;
},
output:function(out,obj){
if(Array.isArray(obj)){
this.outputArray_(out,obj);
}
else if(typeof obj==='string'){
out('"');
out(JSONUtil.escape(obj));
out('"');
}
else if(obj instanceof Function){
out(obj);
}
else if(obj instanceof Date){
out(obj.getTime());
}
else if(obj instanceof Object){
if(obj.model_)
this.outputObject_(out,obj);
else
this.outputMap_(out,obj);
}
else if(typeof obj==='number'){
if(!isFinite(obj))obj=null;
out(obj);
}
else{
if(obj===undefined)obj=null;
out(obj);
}
},
outputObject_:function(out,obj){
var str='';
out('{');
this.outputModel_(out,obj);
for(var key in obj.model_.properties){
var prop=obj.model_.properties[key];
if(!this.p(prop))continue;
if(prop.name in obj.instance_){
var val=obj[prop.name];
if(val==prop.defaultValue)continue;
out(',');
out(JSONUtil.keyify(prop.name),':');
this.output(out,val);
}
}
out('}');
},
outputModel_:function(out,obj){
out('"model_":"')
if(obj.model_.package)out(obj.model_.package,'.')
out(obj.model_.name,'"');
},
outputMap_:function(out,obj){
var str='';
var first=true;
out('{');
for(var key in obj){
var val=obj[key];
if(!first)out(',');
out(JSONUtil.keyify(key),':');
this.output(out,val);
first=false;
}
out('}');
},
outputArray_:function(out,a){
if(a.length==0){out('[]');return out;}
var str='';
var first=true;
out('[');
for(var i=0;i<a.length;i++,first=false){
var obj=a[i];
if(!first)out(',');
this.output(out,obj);
}
out(']');
}
},
pretty:{
__proto__:AbstractFormatter,
stringify:function(obj){
var buf='';
this.output(function(){
for(var i=0;i<arguments.length;i++)
buf +=arguments[i];
},obj);
return buf;
},
output:function(out,obj,opt_indent){
var indent=opt_indent||'';
if(Array.isArray(obj)){
this.outputArray_(out,obj,indent);
}
else if(typeof obj=='string'){
out('"');
out(JSONUtil.escape(obj));
out('"');
}
else if(obj instanceof Function){
out(obj);
}
else if(obj instanceof Date){
out("new Date('",obj,"')");
}
else if(obj instanceof Object){
if(obj.model_)
this.outputObject_(out,obj,indent);
else
this.outputMap_(out,obj,indent);
}else if(typeof obj==='number'){
if(!isFinite(obj))obj=null;
out(obj);
}else{
if(obj===undefined)obj=null;
out(obj);
}
},
outputObject_:function(out,obj,opt_indent){
var indent=opt_indent||'';
var nestedIndent=indent+' ';
var str='';
out(/*"\n",*/indent,'{\n');
this.outputModel_(out,obj,nestedIndent);
for(var key in obj.model_.properties){
var prop=obj.model_.properties[key];
if(!this.p(prop))continue;
if(prop.name==='parent')continue;
if(prop.name in obj.instance_){
var val=obj[prop.name];
out(",\n");
out(nestedIndent,'"',prop.name,'"',':');
this.output(out,val,nestedIndent);
}
}
out('\n',indent,'}');
},
outputModel_:function(out,obj,indent){
out(indent,'"model_":"')
if(obj.model_.package)out(obj.model_.package,'.')
out(obj.model_.name,'"');
},
outputMap_:function(out,obj,opt_indent){
var indent=opt_indent||'';
var nestedIndent=indent+' ';
var str='';
var first=true;
out(/*"\n",*/ indent,'{\n',nestedIndent);
for(var key in obj)
{
var val=obj[key];
if(!first)out(',\n');
out(nestedIndent,JSONUtil.keyify(key),':');
this.output(out,val,nestedIndent);
first=false;
}
out('\n',indent,'}');
},
outputArray_:function(out,a,opt_indent){
if(a.length==0){out('[]');return out;}
var indent=opt_indent||'';
var nestedIndent=indent+' ';
var str='';
var first=true;
out('[\n');
for(var i=0;i<a.length;i++,first=false){
var obj=a[i];
if(!first)out(',\n');
if(typeof obj=='string'){
out(nestedIndent);
}
this.output(out,obj,nestedIndent);
}
out('\n',indent,']');
}
},
moreCompact:{
__proto__:AbstractFormatter,
},
compressed:{
__proto__:AbstractFormatter,
stringify:function(obj){
return Iuppiter.Base64.encode(Iuppiter.compress(JSONUtil.compact.stringify(obj),true));
}
}
};
JSONUtil.stringify=JSONUtil.pretty.stringify.bind(JSONUtil.pretty);
JSONUtil.output=JSONUtil.pretty.output.bind(JSONUtil.pretty);;
JSONUtil.where=JSONUtil.pretty.where.bind(JSONUtil.pretty);;
var NOT_TRANSIENT=function(prop){return !prop.transient;};
/**
* @license
* Copyright 2012 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var XMLParser={
__proto__:grammar,
START:seq1(1,sym('whitespace'),sym('tag'),sym('whitespace')),
tag:seq(
'<',
sym('tagName'),
sym('whitespace'),
repeat(sym('attribute'),sym('whitespace')),
sym('whitespace'),
'>',
repeat(alt(
sym('tag'),
sym('text')
)),
'</',sym('tagName'),'>'
),
label:str(plus(notChars('=/\t\r\n<>\'"'))),
tagName:sym('label'),
text:str(plus(notChar('<'))),
attribute:seq(sym('label'),'=',sym('value')),
value:str(alt(
seq1(1,'"',repeat(notChar('"')),'"'),
seq1(1,"'",repeat(notChar("'")),"'")
)),
whitespace:repeat(alt(' ','\t','\r','\n'))
};
XMLParser.addActions({
tag:function(xs){
if(xs[1] !=xs[8])return undefined;
var obj={tag:xs[1],attrs:{},children:xs[6]};
xs[3].forEach(function(attr){obj.attrs[attr[0]]=attr[2];});
return obj;
}
});
var XMLUtil={
escape:function(str){
return str && str.toString()
.replace(/&/g,'&amp;')
.replace(/</g,'&lt;')
.replace(/>/g,'&gt;');
},
unescape:function(str){
return str && str.toString()
.replace(/&lt;/g,'<')
.replace(/&gt;/g,'>')
.replace(/&amp;/g,'&');
},
escapeAttr:function(str){
return str && str.replace(/"/g,'&quot;');
},
unescapeAttr:function(str){
return str && str.replace(/&quot;/g,'"');
},
parse:function(str){
var result=XMLParser.parseString(str);
if(!result)return result;
return this.parseArray(result.children);
},
parseObject:function(tag){
var obj={};
var self=this;
tag.children.forEach(function(c){
if(typeof c==='object' && c.attrs && c.attrs.name){
var result;
if(c.attrs.type && c.attrs.type=='function'){
var code=XMLUtil.unescape(c.children.join(''));
if(code.startsWith('function')){
result=eval('('+code+')');
}else{
result=new Function(code);
}
}else{
result=self.parseArray(c.children);
}
obj[self.unescapeAttr(c.attrs.name)]=result;
}
});
if(!tag.attrs.model)return obj;
var model=this.unescapeAttr(tag.attrs.model);
return GLOBAL[model]?GLOBAL[model].create(obj):obj;
},
parseArray:function(a){
var self=this;
var ret=[];
a.forEach(function(x){
if(typeof x !=='object')return;
if(x.tag=='i'){
ret.push(XMLUtil.unescape(x.children[0]));
}else{
ret.push(self.parseObject(x));
}
});
return ret.length?ret:XMLUtil.unescape(a.join(''));
},
compact:{
stringify:function(obj){
var buf=[];
this.output(buf.push.bind(buf),obj);
return '<foam>'+buf.join('')+ '</foam>';
},
output:function(out,obj){
if(Array.isArray(obj)){
this.outputArray_(out,obj);
}
else if(typeof obj=='string'){
out(XMLUtil.escape(obj));
}
else if(obj instanceof Function){
this.outputFunction_(out,obj);
}
else if(obj instanceof Object){
if(obj.model_)
this.outputObject_(out,obj);
else
this.outputMap_(out,obj);
}
else{
out(obj);
}
},
outputObject_:function(out,obj){
out('<object model="',XMLUtil.escapeAttr(obj.model_.name),'">');
for(var key in obj.model_.properties){
var prop=obj.model_.properties[key];
if(prop.name==='parent')continue;
if(obj.instance_ && prop.name in obj.instance_){
var val=obj[prop.name];
if(Array.isArray(val)&& val.length==0)continue;
if(val==prop.defaultValue)continue;
out('<property name="',XMLUtil.escapeAttr(prop.name),'" ' +
(typeof val==='function'?'type="function"':'')+ '>');
this.output(out,val);
out('</property>');
}
}
out('</object>');
},
outputMap_:function(out,obj){
out('<object>');
for(var key in obj){
var val=obj[key];
out('<property name="',XMLUtil.escapeAttr(key),'">');
this.output(out,val);
out('</property>');
}
out('</object>');
},
outputArray_:function(out,a){
if(a.length==0)return out;
for(var i=0;i<a.length;i++,first=false){
var obj=a[i];
if(typeof obj==='string'||typeof obj==='number')
out('<i>',XMLUtil.escape(obj),'</i>');
else
this.output(out,obj);
}
},
outputFunction_:function(out,f){
out(XMLUtil.escape(f.toString()));
}
},
pretty:{
stringify:function(obj){
var buf=[];
this.output(buf.push.bind(buf),obj);
return '<foam>\n'+buf.join('')+ '</foam>\n';
},
output:function(out,obj,opt_indent){
var indent=opt_indent||"";
if(Array.isArray(obj)){
this.outputArray_(out,obj,indent);
}
else if(typeof obj=='string'){
out(XMLUtil.escape(obj));
}
else if(obj instanceof Function){
this.outputFunction_(out,obj,indent);
}
else if(obj instanceof Object){
try{
if(obj.model_ && typeof obj.model_ !=='string')
this.outputObject_(out,obj,indent);
else
this.outputMap_(out,obj,indent);
}
catch(x){
console.log('toXMLError:',x);
}
}
else{
out(obj);
}
},
outputObject_:function(out,obj,opt_indent){
var indent=opt_indent||"";
var nestedIndent=indent+" ";
out(indent,'<object model="',XMLUtil.escapeAttr(obj.model_.name),'">');
for(var key in obj.model_.properties){
var prop=obj.model_.properties[key];
if(prop.name==='parent')continue;
if(obj.instance_ && prop.name in obj.instance_){
var val=obj[prop.name];
if(Array.isArray(val)&& val.length==0)continue;
if(val==prop.defaultValue)continue;
var type=typeof obj[prop.name]=='function'?
' type="function"':'';
out("\n",nestedIndent,'<property name="',
XMLUtil.escapeAttr(prop.name),'"',type,'>');
this.output(out,val,nestedIndent);
out('</property>');
}
}
out('\n',indent,'</object>');
out('\n');
},
outputMap_:function(out,obj,opt_indent){
var indent=opt_indent||"";
var nestedIndent=indent+" ";
out(indent,'<object>');
for(var key in obj){
var val=obj[key];
out("\n",nestedIndent,'<property name="',XMLUtil.escapeAttr(key),'">');
this.output(out,val,nestedIndent);
out('</property>');
}
out("\n",indent,'</object>\n');
},
outputArray_:function(out,a,opt_indent){
if(a.length==0)return out;
var indent=opt_indent||"";
var nestedIndent=indent+" ";
for(var i=0;i<a.length;i++,first=false){
var obj=a[i];
out('\n');
if(typeof obj==='string'||typeof obj==='number')
out(nestedIndent,'<i>',XMLUtil.escape(obj),'</i>');
else
this.output(out,obj,nestedIndent);
}
out('\n',indent);
},
outputFunction_:function(out,f,opt_indent){
out(XMLUtil.escape(f.toString())+ '\n' +(opt_indent||''));
}
}
};
XMLUtil.stringify=XMLUtil.pretty.stringify.bind(XMLUtil.pretty);
XMLUtil.output=XMLUtil.pretty.output.bind(XMLUtil.pretty);;
/**
* @license
* Copyright 2013 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/** Update a Context binding. **/
function set(key,value){
Object.defineProperty(
this,
key,
{
value:value,
writable:key !=='window',
configurable:true
}
);
}
function setValue(key,value){
var X=this;
Object.defineProperty(
this,
key,
{
get:function(){X.set(key,value.get());return X[key];},
configurable:true
}
);
}
/** Create a sub-context,populating with bindings from opt_args. **/
function sub(opt_args,opt_name){
var sub=Object.create(this);
if(opt_args)for(var key in opt_args){
if(opt_args.hasOwnProperty(key)){
sub.set(key,opt_args[key]);
}
}
if(opt_name){
sub.NAME=opt_name;
sub.toString=function(){return 'CONTEXT('+opt_name+')';};
}
return sub;
}
function subWindow(w,opt_name,isBackground){
if(!w)return this.sub();
return foam.ui.Window.create({window:w,name:opt_name,isBackground:isBackground},this).X;
}
var X=sub({});
var _ROOT_X=X;
var foam={};
X.foam=foam;
var registerFactory=function(model,factory){
};
var registerModelForModel=function(modelType,targetModel,model){
};
var registerFactoryForModel=function(factory,targetModel,model){
};
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* JSON Parser.
*/
var JSONParser=SkipGrammar.create({
__proto__:grammar,
START:copyInput(sym('objAsString')),
objAsString:copyInput(sym('obj')),
obj:seq1(1,'{',repeat(sym('pair'),','),'}'),
pair:seq(sym('key'),':',sym('value')),
key:alt(
sym('symbol'),
sym('string')),
symbol:noskip(str(seq(sym('char'),str(repeat(sym('alpha')))))),
char:alt(range('a','z'),range('A','Z'),'_','$'),
alpha:alt(sym('char'),range('0','9')),
value:simpleAlt(
sym('function literal'),
sym('expr'),
sym('number'),
sym('string'),
sym('obj'),
sym('bool'),
sym('array')
),
expr:str(seq(
sym('symbol'),optional(str(alt(
seq('.',sym('expr')),
seq('(',str(repeat(sym('value'),',')),')')))))),
number:noskip(seq(
optional('-'),
repeat(range('0','9'),null,1),
optional(seq('.',repeat(range('0','9')))))),
string:noskip(alt(
sym('single quoted string'),
sym('double quoted string'))),
'double quoted string':seq1(1,'"',str(repeat(sym('double quoted char'))),'"'),
'double quoted char':alt(
sym('escape char'),
literal('\\"','"'),
notChar('"')),
'single quoted string':seq1(1,"'",str(repeat(sym('single quoted char'))),"'"),
'single quoted char':alt(
sym('escape char'),
literal("\\'","'"),
notChar("'")),
'escape char':alt(
literal('\\\\','\\'),
literal('\\n','\n')),
bool:alt(
literal('true',true),
literal('false',false)),
array:seq1(1,'[',repeat(sym('value'),','),']'),
'function literal':seq(
'function',
optional(sym('symbol')),
'(',
repeat(sym('symbol'),','),
')',
'{',
repeat(notChar('}')),
'}')
}.addActions({
obj:function(v){
var m={};
for(var i=0;i<v.length;i++)m[v[i][0]]=v[i][2];
return m;
}
}),repeat0(alt(' ','\t','\n','\r')));
/*
TODO:move to FUNTest
var res=JSONParser.parseString('{a:1,b:"2",c:false,d:f(),e:g(1,2),f:h.j.k(1),g:[1,"a",false,[]]}');
console.log(res);
*//**
* @license
* Copyright 2013 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Simple template system modelled after JSP's.
*
* Syntax:
*<% code %>:code inserted into template,but nothing implicitly output
*<%=comma-separated-values %>:all values are appended to template output
*<%# expression %>:dynamic(auto-updating)expression is output
* \<new-line>:ignored
* %%value(<whitespace>|<):output a single value to the template output
* $$feature(<whitespace>|<):output the View or Action for the current Value
*/
var FOAMTagParser={
__proto__:grammar,
create:function(){
return{
__proto__:this,
html:HTMLParser.create().export('START')
};
},
START:sym('tag'),
tag:seq(
'<',
literal_ic('foam'),
sym('whitespace'),
sym('attributes'),
sym('whitespace'),
alt(sym('closed'),sym('matching'))
),
closed:literal('/>'),
matching:seq1(1,'>',sym('html'),sym('endTag')),
endTag:seq1(1,'</',literal_ic('foam'),'>'),
label:str(plus(notChars('=/\t\r\n<>\'"'))),
attributes:repeat(sym('attribute'),sym('whitespace')),
attribute:seq(sym('label'),'=',sym('value')),
value:str(alt(
plus(alt(range('a','z'),range('A','Z'),range('0','9'))),
seq1(1,'"',repeat(notChar('"')),'"')
)),
whitespace:repeat(alt(' ','\t','\r','\n'))
}.addActions({
attribute:function(xs){return{name:xs[0],value:xs[2]};},
tag:function(xs){
return X.foam.html.Element.create({nodeName:xs[1],attributes:xs[3],childNodes:xs[5]});
},
closed:function(){return [];},
matching:function(xs){return xs.children;}
});
MODEL({
name:'TemplateParser',
extendsModel:'grammar',
methods:{
START:sym('markup'),
markup:repeat0(alt(
sym('comment'),
sym('foamTag'),
sym('create child'),
sym('simple value'),
sym('live value tag'),
sym('raw values tag'),
sym('values tag'),
sym('code tag'),
sym('ignored newline'),
sym('newline'),
sym('single quote'),
sym('text')
)),
'comment':seq1(1,'<!--',repeat0(not('-->',anyChar)),'-->'),
'foamTag':sym('foamTag_'),
'foamTag_':function(){},
'create child':seq(
'$$',
repeat(notChars(' $\n<{')),
optional(JSONParser.export('objAsString'))),
'simple value':seq('%%',repeat(notChars(' -"\n<'))),
'live value tag':seq('<%#',repeat(not('%>',anyChar)),'%>'),
'raw values tag':alt(
seq('<%=',repeat(not('%>',anyChar)),'%>'),
seq('{{{',repeat(not('}}}',anyChar)),'}}}')
),
'values tag':seq('{{',repeat(not('}}',anyChar)),'}}'),
'code tag':seq('<%',repeat(not('%>',anyChar)),'%>'),
'ignored newline':literal('\\\n'),
newline:literal('\n'),
'single quote':literal("'"),
text:anyChar
}
});
var TemplateOutput={
/**
* obj - Parent object. If objects are output and have an initHTML()method,then they
* are added to the parent by calling obj.addChild().
**/
create:function(obj){
var buf='';
var f=function(/* arguments */){
for(var i=0;i<arguments.length;i++){
var o=arguments[i];
if(o && o.toView_)o=o.toView_();
if(!(o===null||o===undefined)){
if(o.appendHTML){
o.appendHTML(this);
}else if(o.toHTML){
buf +=o.toHTML();
}else{
buf +=o;
}
if(o.initHTML && obj.addChild)obj.addChild(o);
}
}
};
f.toString=function(){return buf;};
return f;
}
};
function elementFromString(str){
return str.element||(str.element=HTMLParser.create().parseString(str).children[0]);
}
var ConstantTemplate=function(str){return function(opt_out){
var out=opt_out?opt_out:TemplateOutput.create(this);
out(str);
return out.toString();
}};
var TemplateCompiler={
__proto__:TemplateParser,
out:[],
simple:true,
push:function(){this.simple=false;this.pushSimple.apply(this,arguments);},
pushSimple:function(){this.out.push.apply(this.out,arguments);},
header:'var self=this;var X=this.X;var escapeHTML=XMLUtil.escape;' +
'var out=opt_out?opt_out:TemplateOutput.create(this);' +
"out('",
footer:"');" +
"return out.toString();"
}.addActions({
markup:function(v){
var wasSimple=this.simple;
var ret=wasSimple?null:this.header+this.out.join('')+ this.footer;
this.out=[];
this.simple=true;
return [wasSimple,ret];
},
'create child':function(v){
var name=v[1].join('');
this.push(
"',self.createTemplateView('",name,"'",
v[2]?','+v[2]:'',
"),\n'");
},
foamTag:function(e){
function buildAttrs(e,attrToDelete){
var attrs={};
for(var i=0;i<e.attributes.length;i++){
var attr=e.attributes[i];
if(attr.name !==attrToDelete)
attrs[attr.name]=attr.value;
}
return attrs;
}
var fName=e.getAttribute('f');
if(fName){
this.push("',self.createTemplateView('",fName,"',");
this.push(JSON.stringify(buildAttrs(e,'f')));
this.push(')');
}
else{
var modelName=e.getAttribute('model');
if(modelName){
this.push("',",modelName,'.create(');
this.push(JSON.stringify(buildAttrs(e,'model')));
this.push(',X.sub({data:this.data}))');
}else{
console.error('Foam tag must define either "model" or "f" attribute.');
}
}
if(e.children.length){
e.attributes=[];
this.push('.fromElement(elementFromString("'+e.outerHTML.replace(/\n/g,'\\n').replace(/"/g,'\\"')+ '"))');
}
this.push(",\n'");
},
'simple value':function(v){this.push("',\n self.",v[1].join(''),",\n'");},
'raw values tag':function(v){this.push("',\n",v[1].join(''),",\n'");},
'values tag':function(v){this.push("',\nescapeHTML(",v[1].join(''),"),\n'");},
'live value tag':function(v){this.push("',\nself.dynamicTag('span',function(){return ",v[1].join(''),";}.bind(this)),\n'");},
'code tag':function(v){this.push("');\n",v[1].join(''),";out('");},
'single quote':function(){this.pushSimple("\\'");},
newline:function(){this.pushSimple('\\n');},
text:function(v){this.pushSimple(v);}
});
MODEL({
name:'TemplateUtil',
methods:{
/** Create a method which only compiles the template when first used. **/
lazyCompile:function(t){
var delegate;
var f=function(){
if(!delegate){
if(!t.template)
throw 'Must arequire()template model before use for '+this.name_+'.'+t.name;
delegate=TemplateUtil.compile(Template.isInstance(t)?t:Template.create(t));
}
return delegate.apply(this,arguments);
};
f.toString=function(){return delegate?delegate.toString():t;};
return f;
},
compile_:function(t,code){
var args=['opt_out'];
for(var i=0;i<t.args.length;i++){
args.push(t.args[i].name);
}
args.push(code);
return Function.apply(null,args);
},
compile:function(t){
var code=TemplateCompiler.parseString(t.template);
if(code[0])return ConstantTemplate(t.template);
try{
return this.compile_(t,code[1]);
}catch(err){
console.log('Template Error:',err);
console.log(code);
return function(){};
}
},
/**
* Combinator which takes a template which expects an output parameter and
* converts it into a function which returns a string.
*/
stringifyTemplate:function(template){
return function(){
var buf=[];
this.output(buf.push.bind(buf),obj);
return buf.join('');
};
},
expandTemplate:function(self,t,opt_X){
/*
* If a template is supplied as a function,treat it as a multiline string.
* Parse function arguments to populate template.args.
* Load template from file if external.
* Setup template future.
*/
var X=opt_X||self.X;
if(typeof t==='function'){
t=X.Template.create({
name:t.name,
args:t.toString().match(/\((.*?)\)/)[1].split(',').slice(1).map(function(a){
return X.Arg.create({name:a.trim()});
}),
template:multiline(t)});
}else if(typeof t==='string'){
t=docTemplate=X.Template.create({
name:'body',
template:t
});
}else if(!t.template){
var future=afuture();
var path=self.sourcePath;
t.futureTemplate=future.get;
path=path.substring(0,path.lastIndexOf('/')+1);
path +=self.name+'_'+t.name+'.ft';
var xhr=new XMLHttpRequest();
xhr.open("GET",path);
xhr.asend(function(data){
t.template=data;
future.set(Template.create(t));
t.futureTemplate=undefined;
});
}else if(typeof t.template==='function'){
t.template=multiline(t.template);
}
if(!t.futureTemplate)t.futureTemplate=aconstant(t);
if(!t.template$){
t=(typeof X.Template !=='undefined')?
JSONUtil.mapToObj(X,t,X.Template):
JSONUtil.mapToObj(X,t);
}
return t;
},
expandModelTemplates:function(self){
var templates=self.templates;
for(var i=0;i<templates.length;i++){
templates[i]=TemplateUtil.expandTemplate(self,templates[i]);
}
}
}
});
/** Is actually synchronous but is replaced in ChromeApp with an async version. **/
var aeval=function(src){
return aconstant(eval('('+src+')'));
};
var evalTemplate=function(t,model){
var doEval_=function(t){
var code=TemplateCompiler.parseString(t.template);
if(code[0])return ConstantTemplate(t.template);
var args=['opt_out'];
if(t.args){
for(var i=0;i<t.args.length;i++){
args.push(t.args[i].name);
}
}
return eval('(function('+args.join(',')+ '){'+code[1]+'})');
};
try{
return doEval_(t);
}catch(err){
console.log('Template Error:',err);
console.log(code);
return function(){return 'TemplateError:Check console.';};
}
};
var aevalTemplate=function(t,model){
function lazyTemplate(t){
var f;
return function(){
if(!f){
f=evalTemplate(t,model);
}
return f.apply(this,arguments);
};
}
return aseq(
t.futureTemplate,
function(ret,t){
ret(lazyTemplate(t));
});
};
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
TemplateUtil.compile=function(){
return function(){
return this.name_+" wasn't required. Models must be arequired()'ed for Templates to be compiled in Packaged Apps.";
};
};
var __EVAL_CALLBACKS__={};
var aeval=(function(){
var nextID=0;
var future=afuture();
if(!document.body)window.addEventListener('load',future.set);
else future.set();
return function(src){
return aseq(
future.get,
function(ret){
var id='c' +(nextID++);
var newjs=['__EVAL_CALLBACKS__["'+id+'"]('+src+');'];
var blob=new Blob(newjs,{type:'text/javascript'});
var url=window.URL.createObjectURL(blob);
__EVAL_CALLBACKS__[id]=function(data){
delete __EVAL_CALLBACKS__[id];
ret && ret.call(this,data);
};
var script=document.createElement('script');
script.src=url;
script.onload=function(){
this.remove();
window.URL.revokeObjectURL(url);
};
document.body.appendChild(script);
});
};
})();
var TEMPLATE_FUNCTIONS=[];
var aevalTemplate=function(t,model){
var doEval_=function(t){
var code=TemplateCompiler.parseString(t.template);
if(code[0])return aconstant(ConstantTemplate(t.template));
var args=['opt_out'];
if(t.args){
for(var i=0;i<t.args.length;i++){
args.push(t.args[i].name);
}
}
return /*atime('eval '+model.id+'.'+t.name,*/ aeval('function('+args.join(',')+ '){'+code[1]+'}');
};
var doEval=function(t){
try{
return doEval_(t);
}catch(err){
console.log('Template Error:',err);
console.log(code);
return aconstant(function(){return 'TemplateError:Check console.';});
}
}
var i=TEMPLATE_FUNCTIONS.length;
TEMPLATE_FUNCTIONS[i]='';
return aseq(
t.futureTemplate,
function(ret,t){doEval(t)(ret);},
function(ret,f){
TEMPLATE_FUNCTIONS[i]=f;
ret(f);
}
);
};
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var $documents=[];
if(window)$documents.push(window.document);
var $WID__=0;
function $addWindow(w){
w.window.$WID=$WID__++;
$documents.push(w.document);
}
function $removeWindow(w){
for(var i=$documents.length - 1;i>=0;i--){
if(!$documents[i].defaultView||$documents[i].defaultView===w)
$documents.splice(i,1);
}
}
/** Replacement for getElementById **/
var $=function(id){
for(var i=0;i<$documents.length;i++){
if(document.FOAM_OBJECTS && document.FOAM_OBJECTS[id])
return document.FOAM_OBJECTS[id];
var ret=$documents[i].getElementById(id);
if(ret)return ret;
}
return undefined;
};
/** Replacement for getElementByClassName **/
var $$=function(cls){
for(var i=0;i<$documents.length;i++){
var ret=$documents[i].getElementsByClassName(cls);
if(ret.length>0)return ret;
}
return [];
};
var FOAM=function(map,opt_X,seq){
var obj=JSONUtil.mapToObj(opt_X||X,map,undefined,seq);
return obj;
};
/**
* Register a lazy factory for the specified name within a
* specified context.
* The first time the name is looked up,the factory will be invoked
* and its value will be stored in the named slot and then returned.
* Future lookups to the same slot will return the originally created
* value.
**/
FOAM.putFactory=function(ctx,name,factory){
ctx.__defineGetter__(name,function(){
console.log('Bouncing Factory:',name);
delete ctx[name];
return ctx[name]=factory();
});
};
var USED_MODELS={};
var UNUSED_MODELS={};
var NONMODEL_INSTANCES={};
FOAM.browse=function(model,opt_dao,opt_X){
var Y=opt_X||X.sub(undefined,"FOAM BROWSER");
if(typeof model==='string')model=Y[model];
var dao=opt_dao||Y[model.name+'DAO']||Y[model.plural];
if(!dao){
dao=Y.StorageDAO.create({model:model});
Y[model.name+'DAO']=dao;
}
var ctrl=Y.DAOController.create({
model:model,
dao:dao,
useSearchView:false
});
if(!Y.stack){
var w=opt_X?opt_X.window:window;
Y.stack=Y.StackView.create();
var win=Y.foam.ui.layout.Window.create({window:w,data:Y.stack},Y);
document.body.insertAdjacentHTML('beforeend',win.toHTML());
win.initHTML();
Y.stack.setTopView(ctrl);
}else{
Y.stack.pushView(ctrl);
}
};
FOAM.lookup=function(key,opt_X){
if(!key)return undefined;
if(!(typeof key==='string'))return key;
var root=opt_X||X;
var cache=root.hasOwnProperty('lookupCache_')?root.lookupCache_:(root.lookupCache_={});
var ret=cache[key];
if(!ret){
var path=key.split('.');
for(var i=0;root && i<path.length;i++)root=root[path[i]];
ret=root;
cache[key]=ret;
}
return ret;
};
function arequire(modelName,opt_X){
var X=opt_X||GLOBAL.X;
var model=FOAM.lookup(modelName,X);
if(!model){
if(!X.ModelDAO){
if(modelName !=='Template')console.warn('Unknown Model in arequire:',modelName);
return aconstant(undefined);
}
if(!X.arequire$ModelLoadsInProgress){
X.set('arequire$ModelLoadsInProgress',{});
}else{
if(X.arequire$ModelLoadsInProgress[modelName]){
return X.arequire$ModelLoadsInProgress[modelName];
}
}
var future=afuture();
X.ModelDAO.find(modelName,{
put:function(m){
var m=FOAM.lookup(modelName,X);
arequireModel(m,X)(future.set);
},
error:function(){
var args=argsToArray(arguments);
console.warn.apply(console,['Could not load model:',modelName].concat(args));
future.set(undefined);
}
});
X.arequire$ModelLoadsInProgress[modelName]=future.get;
return future.get;
}else{
if(X.arequire$ModelLoadsInProgress){
delete X.arequire$ModelLoadsInProgress.modelName;
}
}
/** This is so that if the model is arequire'd concurrently the
* initialization isn't done more than once.
**/
if(!model){console.log(modelName,'not found');return;}
return arequireModel(model,X);
}
function arequireModel(model,X){
if(model.ready__){
var future=afuture();
model.ready__(function(){
delete model.ready__;
arequireModel(model,X)(future.set);
});
return future.get;
}
if(!model.required__){
var args=[];
var future=afuture();
model.required__=future.get;
if(model.extendsModel)args.push(arequire(model.extendsModel,X));
var i;
if(model.traits){
for(i=0;i<model.traits.length;i++){
args.push(arequire(model.traits[i]));
}
}
if(model.templates)for(i=0;i<model.templates.length;i++){
var t=model.templates[i];
args.push(
aevalTemplate(model.templates[i],model),
(function(t){return function(ret,m){
model.getPrototype()[t.name]=m;
ret();
};})(t)
);
}
if(args.length)args=[aseq.apply(null,args)];
if(model.requires){
for(var i=0;i<model.requires.length;i++){
var r=model.requires[i];
var m=r.split(' as ');
if(m[0]==model.id){
console.warn("Model requires itself:"+model.id);
}else{
args.push(arequire(m[0]));
}
}
}
aseq(
apar.apply(apar,args),
(X && X.i18nModel && X.i18nModel.bind(this,model,X))||
aconstant(model))(future.set);
}else{
X && X.i18nModel && X.i18nModel(model,X);
}
return model.required__;
}
var FOAM_POWERED='<a style="text-decoration:none;" href="https://github.com/foam-framework/foam/" target="_blank">\
<font size=+1 face="catull" style="text-shadow:rgba(64,64,64,0.3)3px 3px 4px;">\
<font color="#3333FF">F</font><font color="#FF0000">O</font><font color="#FFCC00">A</font><font color="#33CC00">M</font>\
<font color="#555555">POWERED</font></font></a>';
function packagePath(X,path){
function packagePath_(Y,path,i){
return i==path.length?Y:packagePath_(Y[path[i]]||(Y[path[i]]={}),path,i+1);
}
return path?packagePath_(X,path.split('.'),0):X;
}
function registerModel(model,opt_name){
var root=this;
function contextualizeModel(path,model,name){
console.assert(model.getPrototype,'Model missing getPrototype');
var xModel=root==X?model:{
__proto__:model,
create:function(args,opt_X){
return model.create(args,opt_X||root);
}
};
Object.defineProperty(
path,
name,
{
get:function(){
var THIS=this.__this__||this;
if(THIS===root)return xModel;
THIS.registerModel(model,name);
return THIS[name];
},
configurable:true
});
}
var name=model.name;
var package=model.package;
if(opt_name){
var a=opt_name.split('.');
name=a.pop();
package=a.join('.');
}
if(package){
var path=packagePath(root,package);
Object.defineProperty(path,name,{value:model,configurable:true});
}else{
contextualizeModel(root,model,name)
}
this.registerModel_(model);
}
function CLASS(m){
/** Lazily create and register Model first time it's accessed. **/
function registerModelLatch(path,m){
var id=m.package?m.package+'.'+m.name:m.name;
UNUSED_MODELS[id]=true;
if(!m.package)
Object.defineProperty(GLOBAL,m.name,{get:function(){return path[m.name];},configurable:true});
Object.defineProperty(path,m.name,{
get:function(){
USED_MODELS[id]=true;
delete UNUSED_MODELS[id];
Object.defineProperty(path,m.name,{value:null,configurable:true});
var work=[];
var model=JSONUtil.mapToObj(X,m,Model,work);
if(work.length>0)model.ready__=aseq.apply(null,work);
_ROOT_X.registerModel(model);
return this[m.name];
},
configurable:true
});
}
if(document && document.currentScript)m.sourcePath=document.currentScript.src;
registerModelLatch(packagePath(X,m.package),m);
}
var MODEL=CLASS;
function INTERFACE(imodel){
var i=JSONUtil.mapToObj(X,imodel,Interface);
packagePath(X,i.package)[i.name]=i;
var id=i.package?i.package+'.'+i.name:i.name;
NONMODEL_INSTANCES[id]=true;
}
/** Called when a Model is registered. **/
function registerModel_(m){
}
/**
* @license
* Copyright 2012 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* The Prototype for all Generated Prototypes.
* The common ancestor of all FOAM Objects.
**/
var FObject={
__proto__:PropertyChangeSupport,
name_:'FObject',
replaceModel_:function(model,otherModel,X){
while(otherModel){
var replacementName=
(model.package?model.package+'.':'')+
(otherModel.name?otherModel.name:otherModel)+
model.name;
var replacementModel=FOAM.lookup(replacementName,X);
if(replacementModel)return replacementModel;
otherModel=FOAM.lookup(otherModel.extendsModel,X);
}
return undefined;
},
create_:function(){return Object.create(this);},
create:function(args,opt_X){
if(args && args.model &&(opt_X||X).Model.isInstance(args.model)){
var ret=this.replaceModel_(this.model_,args.model,opt_X||X);
if(ret)return ret.create(args,opt_X);
}
var o=this.create_(this);
o.instance_={};
o.X=(opt_X||X).sub({});
if(this.model_.imports && this.model_.imports.length){
if(!Object.prototype.hasOwnProperty.call(this,'imports_')){
this.imports_=this.model_.imports.map(function(e){
var s=e.split(' as ');
return [s[0],s[1]||s[0]];
});
}
for(var i=0;i<this.imports_.length;i++){
var im=this.imports_[i];
if(!args||!args.hasOwnProperty(im[1]))o[im[1]]=o.X[im[0]];
}
}
if(o.model_){
var agents=this.initAgents();
for(var i=0;i<agents.length;i++)agents[i][1](o,o.X,args);
}
o.init(args);
return o;
},
init:nop,
xbind:function(map){
return{
__proto__:this,
create:function(args,X){
args=args||{};
for(var key in map){
if(!args.hasOwnProperty(key))args[key]=map[key];
}
return this.__proto__.create(args,X);
},
xbind:function(m2){
for(var key in map){
if(!m2.hasOwnProperty(key))m2[key]=map[key];
}
return this.__proto__.xbind(m2);
}
}
},
/** Context defaults to the global namespace by default. **/
X:X,
addInitAgent:function(priority,desc,agent){
agent.toString=function(){return desc;};
this.initAgents_.push([priority,agent]);
},
initAgents:function(){
if(!this.model_)return;
if(!Object.hasOwnProperty.call(this,'initAgents_')){
var agents=this.initAgents_=[];
var self=this;
Object_forEach(this.model_.exports,function(e){
var exp=e.split('as ');
if(exp.length==0)return;
var key=exp[0].trim();
var alias=exp[1]||exp[0];
if(key){
var asValue=key !=='$' && key !='$$' && key.charAt(key.length-1)=='$';
if(asValue)key=key.slice(0,key.length-1);
var prop=self.model_.getProperty(key);
if(prop){
if(asValue){
self.addInitAgent(1,'export property value '+key,function(o,X){X.set(alias,FOAM.lookup(prop.name$_,o));});
}else{
self.addInitAgent(1,'export property '+key,function(o,X){X.setValue(alias,FOAM.lookup(prop.name$_,o));});
}
}else{
self.addInitAgent(0,'export other '+key,function(o,X){
var out=typeof o[key]==="function"?o[key].bind(o):o[key];
X.set(alias,out);
});
}
}else{
self.addInitAgent(0,'export this',function(o,X){X.set(alias,o);});
}
});
this.model_.properties.forEach(function(prop){
if(prop.initPropertyAgents){
prop.initPropertyAgents(self);
}else{
self.addInitAgent(
0,
'set proto-property '+prop.name,
function(o,X,m){
if(m && m.hasOwnProperty(prop.name))
o[prop.name]=m[prop.name];
});
}
});
self.addInitAgent(0,'Add create()to Model',function(o,X){
if(Model.isInstance(o)&& o.name !='Model')o.create=BootstrapModel.create;
});
for(key in agents)agents[key][2]=key;
agents.sort(CompoundComparator(
function(o1,o2){return o1[0] - o2[0];},
function(o1,o2){return o1[2] - o2[2];}));
/*
for(var i=0;i<agents.length;i++)
console.log(i,agents[i][0],agents[i][1].toString());
*/
}
return this.initAgents_;
},
fromElement:function(e){
var elements=this.elementMap_;
if(!elements){
elements={};
for(var i=0;i<this.model_.properties.length;i++){
var p=this.model_.properties[i];
elements[p.name]=p;
elements[p.name.toUpperCase()]=p;
if(p.singular){
elements[p.singular]=p;
elements[p.singular.toUpperCase()]=p;
}
}
this.elementMap_=elements;
}
for(var i=0;i<e.attributes.length;i++){
var attr=e.attributes[i];
var p=elements[attr.name];
var val=attr.value;
if(p){
if(val.startsWith('#')){
val=val.substring(1);
this[attr.name]=$(val);
}else{
p.fromString.call(this,val,p);
}
}else{
if(!{id:true,model:true,view:true}[attr.name])
console.warn('Unknown attribute name:"'+attr.name+'"');
}
}
for(var i=0;i<e.children.length;i++){
var c=e.children[i];
var p=elements[c.nodeName];
if(p){
p.fromElement.call(this,c,p);
}else{
console.warn('Unknown element name:"'+c.nodeName+'"');
}
}
return this;
},
installInDocument:function(X,document){
for(var i=0;i<this.model_.templates.length;i++){
var t=this.model_.templates[i];
if(t.name==='CSS'){
t.futureTemplate(function(){
X.addStyle(this.CSS());
}.bind(this));
return;
}
}
},
defineFOAMGetter:function(name,getter){
var stack=Events.onGet.stack;
this.__defineGetter__(name,function(){
var value=getter.call(this,name);
var f=stack[0];
f && f(this,name,value);
return value;
});
},
defineFOAMSetter:function(name,setter){
var stack=Events.onSet.stack;
this.__defineSetter__(name,function(newValue){
var f=stack[0];
if(f && !f(this,name,newValue))return;
setter.call(this,newValue,name);
});
},
toString:function(){
return this.model_.name+"Prototype";
},
hasOwnProperty:function(name){
return typeof this.instance_[name] !=='undefined';
},
writeActions:function(other,out){
for(var i=0,property;property=this.model_.properties[i];i++){
if(property.actionFactory){
var actions=property.actionFactory(this,property.f(this),property.f(other));
for(var j=0;j<actions.length;j++)
out(actions[j]);
}
}
},
equals:function(other){return this.compareTo(other)==0;},
compareTo:function(other){
if(other===this)return 0;
if(this.model_ !==other.model_){
return this.model_.name.compareTo(other.model_.name)||1;
}
var ps=this.model_.properties;
for(var i=0;i<ps.length;i++){
var r=ps[i].compare(this,other);
if(r)return r;
}
return 0;
},
diff:function(other){
var diff={};
for(var i=0,property;property=this.model_.properties[i];i++){
if(Array.isArray(property.f(this))){
var subdiff=property.f(this).diff(property.f(other));
if(subdiff.added.length !==0||subdiff.removed.length !==0){
diff[property.name]=subdiff;
}
continue;
}
if(property.f(this).compareTo(property.f(other))!==0){
diff[property.name]=property.f(other);
}
}
return diff;
},
/** Reset a property to its default value. **/
clearProperty:function(name){delete this.instance_[name];},
defineProperty:function(prop){
var name=prop.name;
prop.name$_=name+'$';
if(!this.__lookupGetter__(prop.name$_)){
Object.defineProperty(this,prop.name$_,{
get:function(){return this.propertyValue(name);},
set:function(value){Events.link(value,this.propertyValue(name));},
configurable:true
});
}
if(prop.getter){
this.defineFOAMGetter(name,prop.getter);
}else{
if(prop.lazyFactory){
var getter=function(){
if(typeof this.instance_[name] !=='undefined')return this.instance_[name];
this.instance_[name]=prop.lazyFactory.call(this,prop);
return this.instance_[name];
};
}else if(prop.factory){
getter=function(){
if(typeof this.instance_[name]=='undefined'){
this.instance_[name]=null;
var val=prop.factory.call(this,prop);
this[name]=val;
}
return this.instance_[name];
};
}else if(prop.defaultValueFn){
getter=function(){
return typeof this.instance_[name] !=='undefined'?this.instance_[name]:prop.defaultValueFn.call(this,prop);
};
}else{
getter=function(){
return typeof this.instance_[name] !=='undefined'?this.instance_[name]:prop.defaultValue;
};
}
this.defineFOAMGetter(name,getter);
}
if(prop.setter){
this.defineFOAMSetter(name,prop.setter);
}else{
var setter=function(oldValue,newValue){
this.instance_[name]=newValue;
};
if(prop.type==='int'||prop.type==='float'){
setter=(function(setter){return function(oldValue,newValue){
setter.call(this,oldValue,typeof newValue !=='number'?Number(newValue):newValue);
};})(setter);
}
if(prop.onDAOUpdate){
if(typeof prop.onDAOUpdate==='string'){
setter=(function(setter,onDAOUpdate,listenerName){return function(oldValue,newValue){
setter.call(this,oldValue,newValue);
var listener=this[listenerName]||(this[listenerName]=this[onDAOUpdate].bind(this));
if(oldValue)oldValue.unlisten(listener);
if(newValue){
newValue.listen(listener);
listener();
}
};})(setter,prop.onDAOUpdate,prop.name+'_onDAOUpdate');
}else{
setter=(function(setter,onDAOUpdate,listenerName){return function(oldValue,newValue){
setter.call(this,oldValue,newValue);
var listener=this[listenerName]||(this[listenerName]=onDAOUpdate.bind(this));
if(oldValue)oldValue.unlisten(listener);
if(newValue){
newValue.listen(listener);
listener();
}
};})(setter,prop.onDAOUpdate,prop.name+'_onDAOUpdate');
}
}
if(prop.postSet){
setter=(function(setter,postSet){return function(oldValue,newValue){
setter.call(this,oldValue,newValue);
postSet.call(this,oldValue,newValue,prop)
};})(setter,prop.postSet);
}
var propertyTopic=PropertyChangeSupport.propertyTopic(name);
setter=(function(setter){return function(oldValue,newValue){
setter.call(this,oldValue,newValue);
this.propertyChange_(propertyTopic,oldValue,newValue);
};})(setter);
if(prop.preSet){
setter=(function(setter,preSet){return function(oldValue,newValue){
setter.call(this,oldValue,preSet.call(this,oldValue,newValue,prop));
};})(setter,prop.preSet);
}
/* TODO:New version that doesn't trigger lazyFactory or getter. */
setter=(function(setter){return function(newValue){
setter.call(this,typeof this.instance_[name]=='undefined'?prop.defaultValue:this.instance_[name],newValue);
};})(setter);
/*
setter=(function(setter){return function(newValue){
setter.call(this,this[name],newValue);
};})(setter);
*/
this.defineFOAMSetter(name,setter);
}
prop.install && prop.install.call(this,prop);
},
hashCode:function(){
var hash=17;
for(var i=0;i<this.model_.properties.length;i++){
var prop=this[this.model_.properties[i].name];
var code=!prop?0:
prop.hashCode?prop.hashCode()
:prop.toString().hashCode();
hash=((hash<<5)- hash)+ code;
hash &=hash;
}
return hash;
},
toProtobuf:function(){
var out=ProtoWriter.create();
this.outProtobuf(out);
return out.value;
},
outProtobuf:function(out){
for(var i=0;i<this.model_.properties.length;i++){
var prop=this.model_.properties[i];
if(Number.isFinite(prop.prototag))
prop.outProtobuf(this,out);
}
},
/** Create a shallow copy of this object. **/
clone:function(){
var c=Object.create(this.__proto__);
c.instance_={};
c.X=this.X;
for(var key in this.instance_){
var value=this[key];
c.instance_[key]=Array.isArray(value)?value.clone():value;
}
return c;
},
/** Create a deep copy of this object. **/
deepClone:function(){
var cln=this.clone();
for(var key in cln.instance_){
var val=cln.instance_[key];
if(Array.isArray(val)){
for(var i=0;i<val.length;i++){
var obj=val[i];
val[i]=obj.deepClone();
}
}
}
return cln;
},
/** @return this **/
copyFrom:function(src){
/*
if(src && this.model_){
for(var i=0;i<this.model_.properties.length;i++){
var prop=this.model_.properties[i];
if(src.model_ && src.instance_ &&
!src.instance_.hasOwnProperty(prop.name))continue;
if(prop.name in src)this[prop.name]=src[prop.name];
}
}
*/
if(src && this.model_){
var ps=this.model_.properties;
for(var i=0;i<ps.length;i++){
var prop=ps[i];
if(src.hasOwnProperty(prop.name))this[prop.name]=src[prop.name];
if(src.hasOwnProperty(prop.name$_))this[prop.name$_]=src[prop.name$_];
}
}
return this;
},
output:function(out){return JSONUtil.output(out,this);},
toJSON:function(){return JSONUtil.stringify(this);},
toXML:function(){return XMLUtil.stringify(this);},
write:function(document,opt_view){
var view=(opt_view||DetailView).create({
model:this.model_,
data:this,
showActions:true
});
document.writeln(view.toHTML());
view.initHTML();
},
decorate:function(name,func,that){
var delegate=this[name];
this[name]=function(){
return func.call(this,that,delegate.bind(this),arguments);
};
return this;
},
addDecorator:function(decorator){
if(decorator.decorateObject)
decorator.decorateObject(this);
for(var i=0;i<decorator.model_.methods.length;i++){
var method=decorator.model_.methods[i];
if(method.name !=='decorateObject')
this.decorate(method.name,method.code,decorator);
}
return this;
},
getMyFeature:function(featureName){
featureName=featureName.toUpperCase();
return [
this.properties?this.properties:[],
this.actions?this.actions:[],
this.methods?this.methods:[],
this.listeners?this.listeners:[],
this.templates?this.templates:[],
this.models?this.models:[],
this.tests?this.tests:[],
this.relationships?this.relationships:[],
this.issues?this.issues:[]
].mapFind(function(list){return list.mapFind(function(f){
return f.name && f.name.toUpperCase()===featureName && f;
})});
},
getAllMyFeatures:function(){
var featureList=[];
[
this.properties?this.properties:[],
this.actions?this.actions:[],
this.methods?this.methods:[],
this.listeners?this.listeners:[],
this.templates?this.templates:[],
this.models?this.models:[],
this.tests?this.tests:[],
this.relationships?this.relationships:[],
this.issues?this.issues:[]
].map(function(list){
featureList=featureList.concat(list);
});
return featureList;
},
getFeature:function(featureName){
var feature=this.getMyFeature(featureName);
if(!feature && this.extendsModel){
var ext=FOAM.lookup(this.extendsModel,this.X);
if(ext){
return ext.getFeature(featureName);
}
}else{
return feature;
}
},
getAllFeatures:function(){
var featureList=this.getAllMyFeatures();
if(this.extendsModel){
var ext=FOAM.lookup(this.extendsModel,this.X);
if(ext){
ext.getAllFeatures().map(function(subFeat){
var subName=subFeat.name.toUpperCase();
if(!featureList.mapFind(function(myFeat){
return myFeat && myFeat.name && myFeat.name.toUpperCase()===subName;
})){
featureList.push(subFeat);
}
});
}
}
return featureList;
}
};
/**
* @license
* Copyright 2012 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* Prototype for original proto-Models.
* Used during bootstrapping to create the real Model
* and PropertyModel.
*
* TODO:The handling of the various property types(properties,
* templates,listeners,etc.)shouldn't be handled here because
* it isn't extensible. The handling should be defined in the
* properties property(so meta).
*
* TODO:Is still used by a few views in view.js. Those views
* should be fixed and then BootstrapModel should be deleted at
* the end of metamodel.js once the real Model is created.
**/
function defineLocalProperty(cls,name,factory){
Object.defineProperty(cls,name,{get:function(){
if(this==cls)return null;
var value=factory.call(this);
Object.defineProperty(this,name,{value:value});
return value;
},configurable:true});
}
this.Constant=null;
this.Method=null;
this.Action=null;
this.Relationship=null;
/**
* Override a method,making calling the overridden method possible by
* calling this.SUPER();
**/
function override(cls,methodName,method){
var super_=cls[methodName];
var SUPER=function(){return super_.apply(this,arguments);};
var slowF=function(OLD_SUPER,args){
try{
return method.apply(this,args);
}finally{
this.SUPER=OLD_SUPER;
}
};
var f=function(){
var OLD_SUPER=this.SUPER;
this.SUPER=SUPER;
if(OLD_SUPER)return slowF.call(this,OLD_SUPER,arguments);
var ret=method.apply(this,arguments);
this.SUPER=null;
return ret;
};
f.toString=function(){return method.toString();};
f.super_=super_;
cls[methodName]=f;
}
var BootstrapModel={
__proto__:PropertyChangeSupport,
name_:'BootstrapModel<startup only,error if you see this>',
buildPrototype:function(){/* Internal use only. */
if(DEBUG)BootstrapModel.saveDefinition(this);
function addTraitToModel(traitModel,parentModel){
var parentName=parentModel && parentModel.id?parentModel.id.replace(/\./g,'__'):'';
var traitName=traitModel.id?traitModel.id.replace(/\./g,'__'):'';
var name=parentName+'_ExtendedWith_'+traitName;
if(!FOAM.lookup(name)){
var model=traitModel.deepClone();
model.package="";
model.name=name;
model.extendsModel=parentModel && parentModel.id;
GLOBAL.X.registerModel(model);
}
var ret=FOAM.lookup(name);
console.assert(ret,'Unknown name.');
return ret;
}
if(this.extendsModel && !FOAM.lookup(this.extendsModel,this.X))throw 'Unknown Model in extendsModel:'+this.extendsModel;
var extendsModel=this.extendsModel && FOAM.lookup(this.extendsModel,this.X);
if(this.traits)for(var i=0;i<this.traits.length;i++){
var trait=this.traits[i];
var traitModel=FOAM.lookup(trait,this.X);
console.assert(traitModel,'Unknown trait:'+trait);
if(traitModel){
extendsModel=addTraitToModel(traitModel,extendsModel);
}else{
console.warn('Missing trait:',trait,',in Model:',this.name);
}
}
var proto=extendsModel?extendsModel.getPrototype():FObject;
var cls=Object.create(proto);
cls.model_=this;
cls.name_=this.name;
/*
if(this.name && this.name !=='Model' && !(window.chrome && chrome.runtime && chrome.runtime.id)){
var s='(function(){var XXX=function(){};XXX.prototype=this;return function(){return new XXX();};})'.replace(/XXX/g,this.name);
try{cls.create_=eval(s).call(cls);}catch(e){}
}*/
/** Add a method to 'cls' and set it's name. **/
function addMethod(name,method){
if(cls.__proto__[name]){
override(cls,name,method);
}else{
cls[name]=method;
}
}
this.models && Object_forEach(this.models,function(m){
cls.model_[m.name]=cls[m.name]=JSONUtil.mapToObj(X,m,Model);
});
if(extendsModel)this.requires=this.requires.concat(extendsModel.requires);
Object_forEach(this.requires,function(i){
var imp=i.split(' as ');
var m=imp[0];
var path=m.split('.');
var key=imp[1]||path[path.length-1];
defineLocalProperty(cls,key,function(){
var Y=this.X;
var model=FOAM.lookup(m,this.X);
console.assert(model,'Unknown Model:'+m+' in '+this.name_);
var proto=model.getPrototype();
return{
__proto__:model,
create:function(args,X){return proto.create(args,X||Y);}
};
});
});
if(!this.properties)this.properties=[];
var props=this.properties;
function findProp(name){
for(var i=0;i<props.length;i++){
if(props[i].name==name)return i;
}
return -1;
}
if(extendsModel)this.imports=this.imports.concat(extendsModel.imports);
Object_forEach(this.imports,function(i){
var imp=i.split(' as ');
var key=imp[0];
var alias=imp[1]||imp[0];
if(alias.length && alias.charAt(alias.length-1)=='$')
alias=alias.slice(0,alias.length-1);
var i=findProp(alias);
if(i==-1){
props.push(Property.create({
name:alias,
transient:true,
hidden:true
}));
}/*
TODO(kgr):Do I need to do anything in this case?
else{
var p=props[i];
}*/
});
for(var i=0;i<props.length;i++){
var p=props[i];
if(extendsModel){
var superProp=extendsModel.getProperty(p.name);
if(superProp){
p=superProp.clone().copyFrom(p);
props[i]=p;
this[constantize(p.name)]=p;
}
}
cls.defineProperty(p);
}
this.propertyMap_=null;
if(extendsModel){
for(var i=0;i<extendsModel.properties.length;i++){
var p=extendsModel.properties[i];
var name=constantize(p.name);
if(!this[name])this[name]=p;
}
for(i=0;i<extendsModel.relationships.length;i++){
var r=extendsModel.relationships[i];
var name=constantize(r.name);
if(!this[name])this[name]=r;
}
}
if(extendsModel)this.exports=this.exports.concat(extendsModel.exports);
this.templates && Object_forEach(this.templates,function(t){
addMethod(t.name,TemplateUtil.lazyCompile(t));
});
if(this.actions){
for(var i=0;i<this.actions.length;i++){
(function(a){
if(extendsModel){
var superAction=extendsModel.getAction(a.name);
if(superAction){
a=superAction.clone().copyFrom(a);
this.actions[i]=a;
}
}
addMethod(a.name,function(opt_x){a.callIfEnabled(opt_x||this.X,this);});
}.bind(this))(this.actions[i]);
}
}
var key;
for(key in this.constants){
var c=this.constants[key];
if(Constant){
if(!Constant.isInstance(c)){
c=this.constants[key]=Constant.create(c);
}
Object.defineProperty(cls,c.name,{value:c.value});
Object.defineProperty(this,c.name,{value:c.value});
}else{
console.warn('Defining constant before Constant.');
}
}
for(key in this.messages){
var c=this.messages[key];
if(Message){
if(!Message.isInstance(c)){
c=this.messages[key]=Message.create(c);
}
Object.defineProperty(
cls,
c.name,
{get:function(){return c.value;}});
Object.defineProperty(
this,
c.name,
{get:function(){return c.value;}});
}else{
console.warn('Defining message before Message.');
}
}
for(key in this.methods){
var m=this.methods[key];
if(Method && Method.isInstance(m)){
addMethod(m.name,m.generateFunction());
}else{
addMethod(key,m);
}
}
var self=this;
this.relationships && this.relationships.forEach(function(r){
var name=constantize(r.name);
if(!self[name])self[name]=r;
defineLazyProperty(cls,r.name,function(){
var m=this.X[r.relatedModel];
var lcName=m.name[0].toLowerCase()+ m.name.substring(1);
var dao=this.X[lcName+'DAO']||this.X[m.name+'DAO']||
this.X[m.plural];
if(!dao){
console.error('Relationship '+r.name+' needs ' +(m.name+'DAO')+ ' or ' +
m.plural+' in the context,and neither was found.');
}
return{
get:function(){return dao.where(EQ(m.getProperty(r.relatedProperty),this.id));},
configurable:true
};
});
});
var createListenerTrampoline=function(cls,name,fn,isMerged,isFramed){
console.assert(fn,'createListenerTrampoline:fn not defined');
fn.name=name;
Object.defineProperty(cls,name,{
get:function(){
var l=fn.bind(this);
/*
if((isFramed||isMerged)&& this.X.isBackground){
console.log('*********************** ',this.model_.name);
}
*/
if(isFramed)
l=EventService.framed(l,this.X);
else if(isMerged){
l=EventService.merged(
l,
(isMerged===true)?undefined:isMerged,this.X);
}
Object.defineProperty(this,name,{value:l});
return l;
},
configurable:true
});
};
if(Array.isArray(this.listeners)){
for(var i=0;i<this.listeners.length;i++){
var l=this.listeners[i];
createListenerTrampoline(cls,l.name,l.code,l.isMerged,l.isFramed);
}
}else if(this.listeners){
Object_forEach(this.listeners,function(l,key){
createListenerTrampoline(cls,key,l);
});
}
this.topics && Object_forEach(this.topics,function(t){
});
if(extendsModel){
for(var i=extendsModel.properties.length-1;i>=0;i--){
var p=extendsModel.properties[i];
if(!(this.getProperty && this.getPropertyWithoutCache_(p.name)))
this.properties.unshift(p);
}
this.propertyMap_=null;
this.actions=extendsModel.actions.concat(this.actions);
}
if(this.properties.length>0 && !cls.__lookupGetter__('id')){
var primaryKey=this.ids;
if(primaryKey.length==1){
cls.__defineGetter__('id',function(){return this[primaryKey[0]];});
cls.__defineSetter__('id',function(val){this[primaryKey[0]]=val;});
}else if(primaryKey.length>1){
cls.__defineGetter__('id',function(){
return primaryKey.map(function(key){return this[key];}.bind(this));});
cls.__defineSetter__('id',function(val){
primaryKey.map(function(key,i){this[key]=val[i];}.bind(this));});
}
}
return cls;
},
getAllRequires:function(){
var requires={};
this.requires.forEach(function(r){requires[r.split(' ')[0]]=true;});
this.traits.forEach(function(t){requires[t]=true;});
if(this.extendsModel)requires[this.extendsModel]=true;
function setModel(o){if(o && o.model_)requires[o.model_.id]=true;}
this.properties.forEach(setModel);
this.actions.forEach(setModel);
this.templates.forEach(setModel);
this.listeners.forEach(setModel);
return Object.keys(requires);
},
getPrototype:function(){/* Returns the definition $$DOC{ref:'Model'}of this instance. */
return this.instance_.prototype_||(this.instance_.prototype_=this.buildPrototype());
},
saveDefinition:function(self){
self.definition_={};
if(Array.isArray(self.methods))self.definition_.methods=[].concat(self.methods);
if(Array.isArray(self.templates))self.definition_.templates=[].concat(self.templates);
if(Array.isArray(self.relationships))self.definition_.relationships=[].concat(self.relationships);
if(Array.isArray(self.properties))self.definition_.properties=[].concat(self.properties);
if(Array.isArray(self.actions))self.definition_.actions=[].concat(self.actions);
if(Array.isArray(self.listeners))self.definition_.listeners=[].concat(self.listeners);
if(Array.isArray(self.models))self.definition_.models=[].concat(self.models);
if(Array.isArray(self.tests))self.definition_.tests=[].concat(self.tests);
if(Array.isArray(self.issues))self.definition_.issues=[].concat(self.issues);
self.definition_.__proto__=FObject;
},
create:function(args,opt_X){return this.getPrototype().create(args,opt_X);},
isSubModel:function(model){
/* Returns true if the given instance extends this $$DOC{ref:'Model'}or a descendant of this. */
try{
return model && model.getPrototype &&(model.getPrototype()===this.getPrototype()||this.isSubModel(model.getPrototype().__proto__.model_));
}catch(x){
return false;
}
},
getPropertyWithoutCache_:function(name){/* Internal use only. */
for(var i=0;i<this.properties.length;i++){
var p=this.properties[i];
if(p.name===name)return p;
}
return null;
},
getProperty:function(name){/* Returns the requested $$DOC{ref:'Property'}of this instance. */
if(!this.propertyMap_){
if(!this.properties.length)return undefined;
var m={};
for(var i=0;i<this.properties.length;i++){
var prop=this.properties[i];
m[prop.name]=prop;
}
this.propertyMap_=m;
}
return this.propertyMap_[name];
},
getAction:function(name){/* Returns the requested $$DOC{ref:'Action'}of this instance. */
for(var i=0;i<this.actions.length;i++)
if(this.actions[i].name===name)return this.actions[i];
},
hashCode:function(){
var string="";
for(var key in this.properties){
string +=this.properties[key].toString();
}
return string.hashCode();
},
isInstance:function(obj){/* Returns true if the given instance extends this $$DOC{ref:'Model'}. */
return obj && obj.model_ && this.isSubModel(obj.model_);
},
toString:function(){return "BootstrapModel("+this.name+")";}
};
/*
* Ex.
* OR(EQ(Issue.ASSIGNED_TO,'kgr'),EQ(Issue.SEVERITY,'Minor')).toSQL();
* ->"(assignedTo='kgr' OR severity='Minor')"
* OR(EQ(Issue.ASSIGNED_TO,'kgr'),EQ(Issue.SEVERITY,'Minor')).f(Issue.create({assignedTo:'kgr'}));
* ->true
*/
/**
* @license
* Copyright 2012 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var BinaryProtoGrammar;
var DocumentationBootstrap={
name:'documentation',
type:'Documentation',
view:function(){return DetailView.create({model:Documentation});},
help:'Documentation associated with this entity.',
documentation:"The developer documentation for this $$DOC{ref:'.'}. Use a $$DOC{ref:'DocModelView'}to view documentation.",
setter:function(nu){
if(!DEBUG)return;
this.instance_.documentation=nu;
},
getter:function(){
if(!DEBUG)return '';
var doc=this.instance_.documentation;
if(doc && typeof Documentation !="undefined" && Documentation
&&(!doc.model_
||!doc.model_.getPrototype
||!Documentation.isInstance(doc)
)){
if(doc.body){
this.instance_.documentation=Documentation.create(doc);
}else{
this.instance_.documentation=Documentation.create({body:doc});
}
}
return this.instance_.documentation;
}
}
var Model={
__proto__:BootstrapModel,
instance_:{},
name:'Model',
plural:'Models',
help:"Describes the attributes and properties of an entity.",
documentation:{
body:function(){/*
<p>In FOAM,$$DOC{ref:'Model'}is the basic unit for describing data and behavior.
$$DOC{ref:'Model'}itself is a $$DOC{ref:'Model'},since it defines what can be defined,
but also defines itself. See
$$DOC{ref:'developerDocs.Welcome.chapters.modelsAtRuntime',text:'Models in Action'}
for more details.</p>
<p>To create an instance of a $$DOC{ref:'Model'},add it in your
$$DOC{ref:'Model.requires'}list,then,in Javascript:</p>
<p>
<code>this.YourModel.create({propName:val...})</code>creates an instance.
</p>
<p>
Under the covers,$$DOC{ref:'Model.requires'}is creating an alias for the
$$DOC{ref:'Model'}instance that exists in your context. You can access it
directly at<code>this.X.yourPackage.YourModel</code>.</p>
<p>Note:
<ul>
<li>The definition of your model is a $$DOC{ref:'Model'}instance
(with YourModel.model_===Model),while instances
of your model have your new type(myInstance.model_===YourModel). This
differs from other object-oriented systems where the definition of a class
and instances of the class are completely separate entities. In FOAM every
class definition
is an instance of $$DOC{ref:'Model'},including itself.</li>
<li>$$DOC{ref:'Model.exports',text:'Exporting'}a model property allows
seamless dependency injection. See the
$$DOC{ref:'developerDocs.Context',text:'Context documentation'}
for more information.</li>
<li>Calling .create direclty on a $$DOC{ref:'Model'}from your context,
without using the $$DOC{ref:'.requires'}shortcut,must include the
context:<code>this.X.MyModel.create({args},this.X);</code>. Use
$$DOC{ref:'.requires'}unless you have some compelling reason not to!</li>
</ul>
</p>
<p>For more information about how $$DOC{ref:'Model',usePlural:true}are instantiated,
see $$DOC{ref:'developerDocs.Welcome.chapters.modelsAtRuntime',text:'Welcome to Models at Runtime'}.
*/}
},
tableProperties:[
'package','name','label','plural'
],
properties:[
{
name:'id'
},
{
name:'sourcePath',
help:'Source location of this Model.',
defaultValue:''
},
{
name:'abstract',
type:'boolean',
defaultValue:false,
help:'If the java class is abstract.',
documentation:function(){/* When running FOAM in a Java environment,specifies whether the
Java class built from this $$DOC{ref:'Model'}should be declared abstract.*/}
},
{
name:'package',
help:'Package that this Model belongs to.',
defaultValue:'',
postSet:function(_,p){return this.id=p?p+'.'+this.name:this.name;},
documentation:function(){/*
<p>The package(or namespace)in which the $$DOC{ref:'.'}belongs. The
dot-separated package name is prepended to the $$DOC{ref:'.'}name.</p>
<p>For example:</p>
<p><code>MODEL({name:'Train',package:'com.company.modules'});<br/>
...<br/>
is this.X):<br/>
this.X.com.company.modules.Train.create();<br/>
</code></p>
<p>Use $$DOC{ref:'Model.imports'}to avoid typing the package name repeatedly.</p>
<p>When running FOAM in a Java environment,specifies the
package in which to declare the Java class built from this $$DOC{ref:'Model'}.
</p>
*/}
},
{
name:'name',
type:'String',
postSet:function(_,n){return this.id=this.package?this.package+'.'+n:n;},
required:true,
displayWidth:30,
displayHeight:1,
defaultValue:'',
help:'The coding identifier for the entity.',
documentation:function(){/* The identifier used in code to represent this $$DOC{ref:'.'}.
$$DOC{ref:'Model.name'}should generally only contain identifier-safe characters.
$$DOC{ref:'Model'}definition names should use CamelCase starting with a capital letter,while
$$DOC{ref:'Property',usePlural:true},$$DOC{ref:'Method',usePlural:true},and other features
defined inside a $$DOC{ref:'Model'}should use camelCase staring with a lower case letter.
*/}
},
{
name:'label',
type:'String',
displayWidth:70,
displayHeight:1,
defaultValueFn:function(){return this.name.labelize();},
help:'The display label for the entity.',
documentation:function(){/* A human readable label for the $$DOC{ref:'Model'}. May
contain spaces or other odd characters.
*/}
},
{
name:'javaClassName',
type:'String',
displayWidth:70,
displayHeight:1,
defaultValueFn:function(){return(this.abstract?'Abstract':'')+ this.name;},
help:'The Java classname of this Model.',
documentation:function(){/* When running FOAM in a Java environment,specifies the name of the
Java class to be built from this $$DOC{ref:'Model'}.*/}
},
{
name:'extendsModel',
type:'String',
displayWidth:70,
displayHeight:1,
defaultValue:'',
help:'The parent model of this model.',
documentation:function(){/*
<p>Specifies the $$DOC{ref:'Model.name'}of the $$DOC{ref:'Model'}that
this model should inherit from. Like object-oriented inheritance,this $$DOC{ref:'Model'}will gain the
$$DOC{ref:'Property',usePlural:true},$$DOC{ref:'Method',usePlural:true},and other features
defined inside the $$DOC{ref:'Model'}you extend.</p>
<p>You may override features by redefining them in your $$DOC{ref:'Model'}.</p>
<p>Like most inheritance schemes,instances of your $$DOC{ref:'Model'}may be used in place of
instances of the $$DOC{ref:'Model'}you extend.</p>
*/}
},
{
name:'plural',
type:'String',
displayWidth:70,
displayHeight:1,
defaultValueFn:function(){return this.name+'s';},
help:'The plural form of this model\'s name.',
documentation:function(){/* The plural form of $$DOC{ref:'Model.name'},for use in database
table naming,labels and documentation. The format generally follows the same
contsraints as $$DOC{ref:'.name'}. */}
},
{
name:'version',
type:'int',
defaultValue:1,
help:'Version number of model.',
documentation:function(){/* For backwards compatibility,major changes should be marked by
incrementing the version number. */}
},
{
name:'ids',
label:'Key Properties',
type:'Array[String]',
view:'StringArrayView',
defaultValueFn:function(){
var id=this.getProperty('id');
if(id)return ['id'];
return this.properties.length?[this.properties[0].name]:[];
},
help:'Properties which make up unique id.',
documentation:function(){/* An optional list of names of $$DOC{ref:'Property',usePlural:true}from
this $$DOC{ref:'Model'},which can be used together as a primary key. The $$DOC{ref:'Property',usePlural:true},
when combined,should uniquely identify an instance of your $$DOC{ref:'Model'}.
$$DOC{ref:'DAO',usePlural:true}that support indexing can use this as a suggestion on how to index
instances of your $$DOC{ref:'Model'}. */}
},
{
name:'requires',
type:'Array[String]',
view:'StringArrayView',
defaultValueFn:function(){return [];},
help:'Model imports.',
documentation:function(){/*
<p>List of model imports,as strings of the form:
<code>'Model-Path [as Alias]'</code>.</p>
<p>Aliases are created on your instances that reference the full
path of the model,taking it from your this.X
$$DOC{ref:'developerDocs.Context',text:'context'}.</p>
<p>For example:</p>
<p><code>requires:[ 'mypackage.DataLayer.BigDAO',
'mypackage.UI.SmallTextView as TextView' ]<br/>
...<br/>
this.BigDAO.create();
this.TextView.create();
</code></p>
*/}
},
{
name:'imports',
type:'Array[String]',
view:'StringArrayView',
defaultValueFn:function(){return [];},
help:'Context imports.',
documentation:function(){/*
<p>List of context items to import,as strings of the form:
<code>Key [as Alias]</code>.</p>
<p>Imported items are installed into your $$DOC{ref:'Model'}
as pseudo-properties,using their $$DOC{ref:'Model.name',text:'name'}
or the alias specified here.</p>
<p><code>imports:[ 'selectedItem',
'selectionDAO as dao' ]<br/>
...<br/>
this.selectedItem.get();
this.dao.select();
</code></p>
<p>If you have $$DOC{ref:'.exports',text:'exported'}properties from a
$$DOC{ref:'Model'}in a parent context,you can import those items and give
them aliases for convenient access without the<code>this.X</code>.</p>
<p>You can also re-export items you have imported,either with a different
name or to replace the item you imported with a different property. While
everyone can see changes to the value inside the imported property,only
children(instances you create in your $$DOC{ref:'Model'})will see
$$DOC{ref:'Model.exports'}replacing the property itself.
*/}
},
{
name:'exports',
type:'Array[String]',
view:'StringArrayView',
defaultValueFn:function(){return [];},
help:'Context exports.',
documentation:function(){/*
<p>A list of $$DOC{ref:'Property',usePlural:true}to export to your sub-context,
as strings of the form:
<code>PropertyName [as Alias]</code>.</p>
<p>Properties you wish to share with other instances you create
(like sub-$$DOC{ref:'View',usePlural:true})
can be exported automatically by listing them here.
You are automatically sub-contexted,so your parent context does not
see exported properties. In other words,exports are seen by children,
not by parents.</p>
<p>Instances you create can declare $$DOC{ref:'Model.imports'}to
conveniently grab your exported items from the context.<p>
<p><code>MODEL({name:firstModel<br/>
&nbsp;&nbsp;exports:[ 'myProperty','name as parentName' ],<br/>
&nbsp;&nbsp;properties:[<br/>
&nbsp;&nbsp;{<br/>
&nbsp;&nbsp;&nbsp;&nbsp;name:'proper',<br/>
<br/>
&nbsp;&nbsp;&nbsp;&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;view:{factory_:'DetailView',<br/>
<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;imports:[ 'myProperty','parentName' ],<br/>
<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;methods:{toHTML:function(){<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;this.myProperty=4;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;out.print(this.parentName);
&nbsp;&nbsp;&nbsp;&nbsp;}}},<br/>
&nbsp;&nbsp;&nbsp;&nbsp;...<br/>
&nbsp;&nbsp;&nbsp;&nbsp;{name:'myProperty'},<br/>
&nbsp;&nbsp;&nbsp;&nbsp;{name:'name'}<br/>
&nbsp;&nbsp;]<br/>
&nbsp;&nbsp;...<br/>
</code></p>
*/}
},
{
name:'implements',
type:'Array[String]',
view:'StringArrayView',
defaultValueFn:function(){return [];},
help:'Interfaces implemented by this Model.',
documentation:function(){/* $$DOC{ref:'Interface',usePlural:true}implemented by this $$DOC{ref:'Model'}.*/}
},
{
name:'traits',
type:'Array[String]',
view:'StringArrayView',
defaultValueFn:function(){return [];},
help:'Traits to mix-into this Model.',
documentation:function(){/* Traits allow you to mix extra features into your $$DOC{ref:'Model'}
through composition,avoiding inheritance where unecesssary. */}
},
{
name:'tableProperties',
type:'Array[String]',
view:'StringArrayView',
displayWidth:70,
lazyFactory:function(){
return this.properties.map(function(o){return o.name;});
},
help:'Properties to be displayed in table view. Defaults to all properties.',
documentation:function(){/* Indicates the $$DOC{ref:'Property',usePlural:true}to display when viewing a list of instances
of this $$DOC{ref:'Model'}in a table or other $$DOC{ref:'Property'}viewer. */}
},
{
name:'searchProperties',
type:'Array[String]',
view:'StringArrayView',
displayWidth:70,
defaultValueFn:function(){
return this.tableProperties;
},
help:'Properties display in a search view. Defaults to table properties.',
documentation:function(){/* Indicates the $$DOC{ref:'Property',usePlural:true}to display when viewing
of this $$DOC{ref:'Model'}in a search view. */}
},
{
name:'properties',
type:'Array[Property]',
subType:'Property',
view:'ArrayView',
factory:function(){return [];},
defaultValue:[],
help:'Properties associated with the entity.',
preSet:function(oldValue,newValue){
if(!Property)return;
for(var i=0;i<newValue.length;i++){
var p=newValue[i];
if(typeof p==='string')newValue[i]=p={name:p};
if(!p.model_){
p=newValue[i]=Property.create(p);
}else if(typeof p.model_==='string'){
p=newValue[i]=FOAM(p);
}
this[constantize(p.name)]=newValue[i];
}
this.propertyMap_=null;
return newValue;
},
documentation:function(){/*
<p>The $$DOC{ref:'Property',usePlural:true}of a $$DOC{ref:'Model'}act as data members
and connection points. A $$DOC{ref:'Property'}can store a modelled value,and bind
to other $$DOC{ref:'Property',usePlural:true}for easy reactive programming.</p>
<p>Note that,like $$DOC{ref:'Model'}being a $$DOC{ref:'Model'}itself,the
$$DOC{ref:'Model.properties'}feature of all models is itself a $$DOC{ref:'Property'}.
*/}
},
{
name:'actions',
type:'Array[Action]',
subType:'Action',
view:'ArrayView',
factory:function(){return [];},
propertyToJSON:function(visitor,output,o){
if(o[this.name].length)output[this.name]=o[this.name];
},
defaultValue:[],
help:'Actions associated with the entity.',
preSet:function(_,newValue){
if(!Action)return newValue;
for(var i=0;i<newValue.length;i++){
var p=newValue[i];
if(!p.model_){
newValue[i]=Action.create(p);
}else if(typeof p.model_==='string'){
newValue[i]=FOAM(p);
}
this[constantize(p.name)]=newValue[i];
}
return newValue;
},
documentation:function(){/*
<p>$$DOC{ref:'Action',usePlural:true}implement a behavior and attach a label,icon,and typically a
button-like $$DOC{ref:'View'}or menu item to activate the behavior.</p>
*/}
},
{
name:'constants',
type:'Array[Constant]',
subType:'Constant',
view:'ArrayView',
factory:function(){return [];},
propertyToJSON:function(visitor,output,o){
if(o[this.name].length)output[this.name]=o[this.name];
},
defaultValue:[],
help:'Constants associated with the entity.',
preSet:function(_,newValue){
if(!Constant)return newValue;
if(Array.isArray(newValue))return JSONUtil.arrayToObjArray(this.X,newValue,Constant);
var constants=[];
for(var key in newValue){
var oldValue=newValue[key];
var constant=Constant.create({
name:key,
value:oldValue
});
constants.push(constant);
}
return constants;
}
},
{
name:'messages',
type:'Array[Message]',
subType:'Constant',
view:'ArrayView',
factory:function(){return [];},
propertyToJSON:function(visitor,output,o){
if(o[this.name].length)output[this.name]=o[this.name];
},
defaultValue:[],
help:'Messages associated with the entity.',
preSet:function(_,newValue){
if(!GLOBAL.Message)return newValue;
if(Array.isArray(newValue))return JSONUtil.arrayToObjArray(this.X,newValue,Message);
var messages=[];
for(var key in newValue){
var oldValue=newValue[key];
var message=Message.create({
name:key,
value:oldValue
});
messages.push(message);
}
return messages;
}
},
{
name:'methods',
type:'Array[Method]',
subType:'Method',
view:'ArrayView',
factory:function(){return [];},
propertyToJSON:function(visitor,output,o){
if(o[this.name].length)output[this.name]=o[this.name];
},
defaultValue:[],
help:'Methods associated with the entity.',
preSet:function(_,newValue){
if(!Method)return newValue;
if(Array.isArray(newValue))return JSONUtil.arrayToObjArray(this.X,newValue,Method);
var methods=[];
for(var key in newValue){
var oldValue=newValue[key];
var method=Method.create({
name:key,
code:oldValue
});
if(typeof oldValue=='function'){
if(Arg && DEBUG){
var str=oldValue.toString();
method.args=str.
match(/^function[ _$\w]*\(([,\w]*)/)[1].
split(',').
filter(function(name){return name;}).
map(function(name){return Arg.create({name:name.trim()});});
}
}else{
console.warn('Constant defined as Method:',this.name+'.'+key);
}
methods.push(method);
}
return methods;
},
documentation:function(){/*
<p>$$DOC{ref:'Method',usePlural:true}contain code that runs in the instance's scope,so code
in your $$DOC{ref:'Method'}has access to the other $$DOC{ref:'Property',usePlural:true}and
features of your $$DOC{ref:'Model'}.</p>
<ul>
<li><code>this.propertyName</code>gives the value of a $$DOC{ref:'Property'}</li>
<li><code>this.propertyName$</code>is the binding point for the $$DOC{ref:'Property'}. Assignment
will bind bi-directionally,or<code>Events.follow(src,dst)</code>will bind from
src to dst.</li>
<li><code>this.methodName</code>calls another $$DOC{ref:'Method'}of this
$$DOC{ref:'Model'}</li>
<li><code>this.SUPER()</code>calls the $$DOC{ref:'Method'}implementation from the
base $$DOC{ref:'Model'}(specified in $$DOC{ref:'Model.extendsModel'}). Calling
<code>this.SUPER()</code>is extremely important in your<code>init()</code>
$$DOC{ref:'Method'},if you provide one.</li>
</ul>
<p>In JSON,$$DOC{ref:'Model.methods'}may be specified as a dictionary:</p>
<p><code>methods:{methodName:function(arg1){...your code here...},anotherMethod:...}</code></p>
*/}
},
{
name:'listeners',
type:'Array[Method]',
subType:'Method',
view:'ArrayView',
factory:function(){return [];},
propertyToJSON:function(visitor,output,o){
if(o[this.name].length)output[this.name]=o[this.name];
},
preSet:function(_,newValue){
if(Array.isArray(newValue))return JSONUtil.arrayToObjArray(this.X,newValue,Method);
return newValue;
},
defaultValue:[],
help:'Event listeners associated with the entity.',
documentation:function(){/*
<p>The $$DOC{ref:'Model.listeners'}$$DOC{ref:'Property'}contains a list of $$DOC{ref:'Method',usePlural:true},
but is separate and differs from the $$DOC{ref:'Model.methods'}$$DOC{ref:'Property'}in how the scope
is handled. For a listener,<code>this</code>is bound to your instance,so when the listener is
invoked by an event from elsewhere in the system it can still access the features of its $$DOC{ref:'Model'}
instance.</p>
<p>In javascript,listeners are connected using
<code>OtherProperty.addListener(myModelInstance.myListener);</code></p>
*/}
},
/*
{
name:'topics',
type:'Array[topic]',
subType:'Topic',
view:'ArrayView',
factory:function(){return [];},
defaultValue:[],
help:'Event topics associated with the entity.'
},
*/
{
name:'templates',
type:'Array[Template]',
subType:'Template',
view:'ArrayView',
factory:function(){return [];},
propertyToJSON:function(visitor,output,o){
if(o[this.name].length)output[this.name]=o[this.name];
},
defaultValue:[],
postSet:function(_,templates){
TemplateUtil.expandModelTemplates(this);
},
help:'Templates associated with this entity.',
documentation:function(){/*
The $$DOC{ref:'Template',usePlural:true}to process and install into instances of this
$$DOC{ref:'Model'}. $$DOC{ref:'View',usePlural:true}created inside each $$DOC{ref:'Template'}
using the $$DOC{ref:'.templates',text:'$$propertyName{args}'}view creation tag become available
as<code>myInstance.propertyNameView</code>.
*/}
},
{
name:'models',
type:'Array[Model]',
subType:'Model',
view:'ArrayView',
factory:function(){return [];},
propertyToJSON:function(visitor,output,o){
if(o[this.name].length)output[this.name]=o[this.name];
},
defaultValue:[],
help:'Sub-models embedded within this model.',
documentation:function(){/*
$$DOC{ref:'Model',usePlural:true}may be nested inside one another to better organize them.
$$DOC{ref:'Model',usePlural:true}declared this way do not gain special access to their containing
$$DOC{ref:'Model'},but are only accessible through their container.
*/}
},
{
name:'tests',
label:'Unit Tests',
type:'Array[Unit Test]',
subType:'UnitTest',
view:'ArrayView',
factory:function(){return [];},
propertyToJSON:function(visitor,output,o){
if(o[this.name].length)output[this.name]=o[this.name];
},
defaultValue:[],
help:'Unit tests associated with this model.',
documentation:function(){/*
Create $$DOC{ref:'UnitTest',usePlural:true}that should run to test the functionality of this
$$DOC{ref:'Model'}here.
*/}
},
{
name:'relationships',
subType:'Relationship',
view:'ArrayView',
factory:function(){return [];},
propertyToJSON:function(visitor,output,o){
if(o[this.name].length)output[this.name]=o[this.name];
},
defaultValue:[],
help:'Relationships of this model to other models.',
preSet:function(_,newValue){
if(!Relationship)return newValue;
for(var i=0;i<newValue.length;i++){
var p=newValue[i];
if(!p.model_){
p=newValue[i]=Relationship.create(p);
}else if(typeof p.model_==='string'){
p=newValue[i]=FOAM(p);
}
this[constantize(p.name)]=newValue[i];
}
return newValue;
},
documentation:function(){/*
<p>$$DOC{ref:'Relationship',usePlural:true}indicate a parent-child relation between instances of
this $$DOC{ref:'Model'}and the indicated $$DOC{ref:'Model',usePlural:true},through the indicated
$$DOC{ref:'Property',usePlural:true}. If your $$DOC{ref:'Model',usePlural:true}build a tree
structure of instances,they could likely benefit from a declared $$DOC{ref:'Relationship'}.
</p>
*/}
},
{
name:'issues',
type:'Array[Issue]',
subType:'Issue',
view:'ArrayView',
factory:function(){return [];},
propertyToJSON:function(visitor,output,o){
if(o[this.name].length)output[this.name]=o[this.name];
},
defaultValue:[],
help:'Issues associated with this model.',
documentation:function(){/*
Bug tracking inside the FOAM system can attach $$DOC{ref:'Issue',usePlural:true}directly to the
affected $$DOC{ref:'Model',usePlural:true}.
*/}
},
{
name:'help',
label:'Help Text',
type:'String',
displayWidth:70,
displayHeight:6,
view:'TextAreaView',
defaultValue:'',
help:'Help text associated with the entity.',
documentation:function(){/*
This $$DOC{ref:'.help'}text informs end users how to use the $$DOC{ref:'Model'}or
$$DOC{ref:'Property'},through field labels or tooltips.
*/}
},
{
name:'i18nComplete_',
defaultValue:false,
hidden:true,
transient:true
},
{
name:'translationHint',
label:'Description for Translation',
type:'String',
defaultValueFn:function(){return this.name;}
},
DocumentationBootstrap,
{
name:'notes',
type:'String',
displayWidth:70,
displayHeight:6,
view:'TextAreaView',
defaultValue:'',
help:'Internal documentation associated with this entity.',
documentation:function(){/*
Internal documentation or implementation-specific 'todo' notes.
*/}
},
{
name:'createActionFactory',
type:'Function',
required:false,
displayWidth:70,
displayHeight:3,
rows:3,
view:'FunctionView',
defaultValue:'',
help:'Factory to create the action object for creating this object',
documentation:function(){/* Factory to create the action object for creating this object */}
},
{
name:'deleteActionFactory',
type:'Function',
required:false,
displayWidth:70,
displayHeight:3,
rows:3,
view:'FunctionView',
defaultValue:'',
help:'Factory to create the action object for deleting this object',
documentation:function(){/* Factory to create the action object for deleting this object */}
}
],
templates:[
{
model_:'Template',
name:'javaSource',
description:'Java Source',
"template":"// Generated by FOAM,do not modify.\u000a// Version<%=this.version %>\u000a<%\u000a var className=this.javaClassName;\u000a var parentClassName=this.extendsModel?this.extendsModel:'FObject';\u000a\u000a if(GLOBAL[parentClassName] && GLOBAL[parentClassName].abstract)parentClassName='Abstract'+parentClassName;\u000a\u000a%>\u000a<% if(this.package){%>\\\u000apackage<%=this.package %>;\u000a\u000a<%}%>\\\u000aimport foam.core.*;\u000a\u000apublic<%=this.abstract?' abstract':'' %>class<%=className %>\u000a extends<%=parentClassName %>\u000a{\u000a<% for(var key in this.properties){var prop=this.properties[key];%>\u000a public final static Property<%=constantize(prop.name)%>=new Abstract<%=prop.javaType.capitalize()%>Property(){\u000a public String getName(){return \"<%=prop.name %>_\";}\u000a public String getLabel(){return \"<%=prop.label %>\";}\u000a public Object get(Object o){return((<%=this.name %>)o).get<%=prop.name.capitalize()%>();}\u000a public void set(Object o,Object v){((<%=this.name %>)o).set<%=prop.name.capitalize()%>(toNative(v));}\u000a public int compare(Object o1,Object o2){return compareValues(((<%=this.name%>)o1).<%=prop.name %>_,((<%=this.name%>)o2).<%=prop.name %>_);}\u000a};\u000a<%}%>\u000a\u000a final static Model model__=new AbstractModel(new Property[]{<% for(var key in this.properties){var prop=this.properties[key];%><%=constantize(prop.name)%>,<%}%>}){\u000a public String getName(){return \"<%=this.name %>\";}\u000a public String getLabel(){return \"<%=this.label %>\";}\u000a public Property id(){return<%=this.ids.length?constantize(this.ids[0]):'null' %>;}\u000a};\u000a\u000a public Model model(){\u000a return model__;\u000a}\u000a public static Model MODEL(){\u000a return model__;\u000a}\u000a\u000a<% for(var key in this.properties){var prop=this.properties[key];%>\u000a private<%=prop.javaType %><%=prop.name %>_;<%}%>\u000a\u000a public<%=className %>()\u000a{\u000a}\u000a<% if(this.properties.length){%>\u000a public<%=className %>(<% for(var key in this.properties){var prop=this.properties[key];%><%=prop.javaType,' ',prop.name,key<this.properties.length-1?',':'' %><%}%>)\u000a{<% for(var key in this.properties){var prop=this.properties[key];%>\u000a<%=prop.name %>_=<%=prop.name %>;<%}%>\u000a}\u000a<%}%>\u000a\u000a<% for(var key in this.properties){var prop=this.properties[key];%>\u000a public<%=prop.javaType %>get<%=prop.name.capitalize()%>(){\u000a return<%=prop.name %>_;\u000a};\u000a public void set<%=prop.name.capitalize()%>(<%=prop.javaType,' ',prop.name %>){\u000a<%=prop.name %>_=<%=prop.name %>;\u000a};\u000a<%}%>\u000a\u000a public int hashCode(){\u000a int hash=1;\u000a<% for(var key in this.properties){var prop=this.properties[key];%>\u000a hash=hash * 31+hash(<%=prop.name %>_);<%}%>\u000a\u000a return hash;\u000a}\u000a\u000a public int compareTo(Object obj){\u000a if(obj==this)return 0;\u000a if(obj==null)return 1;\u000a\u000a<%=this.name %>other=(<%=this.name %>)obj;\u000a \u000a int cmp;\u000a<% for(var key in this.properties){var prop=this.properties[key];%>\u000a if((cmp=compare(get<%=prop.name.capitalize()%>(),other.get<%=prop.name.capitalize()%>()))!=0)return cmp;<%}%>\u000a\u000a return 0;\u000a}\u000a\u000a public StringBuilder append(StringBuilder b){\u000a return b\u000a<% for(var key in this.properties){var prop=this.properties[key];%>\\\u000a .append(\"<%=prop.name %>=\").append(get<%=prop.name.capitalize()%>())<%=key<this.properties.length-1?'.append(\",\")':'' %>\u000a<%}%>;\u000a}\u000a\u000a public Object fclone(){\u000a<%=this.name %>c=new<%=this.name %>();\u000a<% for(var key in this.properties){var prop=this.properties[key];%>\\\u000ac.set<%=prop.name.capitalize()%>(get<%=prop.name.capitalize()%>());\u000a<%}%>\\\u000areturn c;\u000a}\u000a\u000a}"
},
{
model_:'Template',
name:'closureExterns',
description:'Closure Externs JavaScript Source',
template:'/**\n' +
' * @constructor\n' +
' */\n' +
'<%=this.name %>=function(){};\n' +
'<% for(var i=0;i<this.properties.length;i++){var prop=this.properties[i];%>' +
'\n<%=prop.closureSource(undefined,this.name)%>\n' +
'<%}%>' +
'<% for(var i=0;i<this.methods.length;i++){var meth=this.methods[i];%>' +
'\n<%=meth.closureSource(undefined,this.name)%>\n' +
'<%}%>'
},
{
model_:'Template',
name:'dartSource',
description:'Dart Class Source',
template:'<% out(this.name);%>\n{\n<% for(var key in this.properties){var prop=this.properties[key];%>var<%=prop.name %>;\n<%}%>\n\n<%=this.name %>()\n{\n\n}\n\n<%=this.name %>(<% for(var key in this.properties){var prop=this.properties[key];%>this.<%=prop.name,key<this.properties.length-1?",":"" %><%}%>)\n}'
},
{
model_:'Template',
name:'protobufSource',
description:'Protobuf source',
template:'message<%=this.name %>{\n<% for(var i=0,prop;prop=this.properties[i];i++){if(prop.prototag==null)continue;if(prop.help){%>//<%=prop.help %>\n<%}%><% if(prop.type.startsWith("Array")){%>repeated<%}else if(false){%>required<%}else{%>optional<%}%><%=prop.protobufType %><%=prop.name %>=<%=prop.prototag %>;\n\n<%}%>}\n'
}
],
toString:function(){return "Model";}
};
/**
* @license
* Copyright 2012 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var Property={
__proto__:BootstrapModel,
instance_:{},
name:'Property',
plural:'Properties',
help:'Describes a properties of a modelled entity.',
ids:[ 'name' ],
tableProperties:[
'name',
'label',
'type',
'required',
'defaultValue'
],
documentation:function(){/*
<p>The $$DOC{ref:'Property',usePlural:true}of a $$DOC{ref:'Model'}act as data members
and connection points. A $$DOC{ref:'Property'}can store a modelled value,and bind
to other $$DOC{ref:'Property',usePlural:true}for easy reactive programming.</p>
<p>Note that,like $$DOC{ref:'Model'}being a $$DOC{ref:'Model'}itself,the
$$DOC{ref:'Model.properties'}feature of all models is itself a $$DOC{ref:'Property'}.
<p>
*/},
properties:[
{
name:'name',
type:'String',
required:true,
displayWidth:30,
displayHeight:1,
defaultValue:'',
help:'The coding identifier for the property.',
documentation:function(){/* The identifier used in code to represent this $$DOC{ref:'.'}.
$$DOC{ref:'.name'}should generally only contain identifier-safe characters.
$$DOC{ref:'.'}names should use camelCase staring with a lower case letter.
*/}
},
{
name:'label',
type:'String',
required:false,
displayWidth:70,
displayHeight:1,
defaultValueFn:function(){return this.name.labelize();},
help:'The display label for the property.',
documentation:function(){/* A human readable label for the $$DOC{ref:'.'}. May
contain spaces or other odd characters.
*/}
},
{
name:'speechLabel',
type:'String',
required:false,
displayWidth:70,
displayHeight:1,
defaultValueFn:function(){return this.label;},
help:'The speech label for the property.',
documentation:function(){/* A speakable label for the $$DOC{ref:'.'}. Used for accesibility.
*/}
},
{
name:'tableLabel',
type:'String',
displayWidth:70,
displayHeight:1,
defaultValueFn:function(){return this.name.labelize();},
help:'The table display label for the entity.',
documentation:function(){/* A human readable label for the $$DOC{ref:'Model'}for use in tables. May
contain spaces or other odd characters.
*/}
},
{
name:'type',
type:'String',
required:true,
view:{
factory_:'ChoiceView',
choices:[
'Array',
'Boolean',
'Color',
'Date',
'DateTime',
'Email',
'Enum',
'Float',
'Function',
'Image',
'Int',
'Object',
'Password',
'String',
'String[]',
'URL'
]
},
defaultValue:'String',
help:'The type of the property.',
documentation:function(){/*<p>The type of the $$DOC{ref:'.'},either a primitive type or
a $$DOC{ref:'Model'}.</p><p>Primitives include:</p>
<ul>
<li>Array</li>
<li>Boolean</li>
<li>Color</li>
<li>Date</li>
<li>DateTime</li>
<li>Email</li>
<li>Enum</li>
<li>Float</li>
<li>Function</li>
<li>Image</li>
<li>Int</li>
<li>Object</li>
<li>Password</li>
<li>String</li>
<li>String[]</li>
<li>URL</li>
</ul>
*/}
},
{
name:'protobufType',
type:'String',
required:false,
help:'The protobuf type that represents the type of this property.',
defaultValueFn:function(){return this.type.toLowerCase();},
documentation:function(){/* When generating protobuf definitions,specifies the type to use for the field this represents. */}
},
{
name:'javaType',
type:'String',
required:false,
defaultValueFn:function(){return this.type;},
help:'The java type that represents the type of this property.',
documentation:function(){/* When running FOAM in a Java environment,specifies the Java type
or class to use. */}
},
{
name:'javascriptType',
type:'String',
required:false,
defaultValueFn:function(){return this.type;},
help:'The javascript type that represents the type of this property.',
documentation:function(){/* When running FOAM in a javascript environment,specifies the javascript
type to use. */}
},
{
name:'shortName',
type:'String',
required:true,
displayWidth:10,
displayHeight:1,
defaultValue:'',
help:'A short alternate name to be used for compact encoding.',
documentation:"A short alternate $$DOC{ref:'.name'}to be used for compact encoding."
},
{
name:'aliases',
type:'Array[String]',
view:'StringArrayView',
defaultValue:[],
help:'Alternate names for this property.',
documentation:function(){/*
Aliases can be used as synonyms for this $$DOC{ref:'Property'}in code or to look it up by name.
*/}
},
{
name:'mode',
type:'String',
defaultValue:'read-write',
view:{factory_:'ChoiceView',choices:['read-only','read-write','final']},
documentation:function(){/*
To restrict modification to a $$DOC{ref:'Property'},the $$DOC{ref:'.mode'}can be set to read-only
to block changes,or to final to block overriding this $$DOC{ref:'Property'}in descendents of
the $$DOC{ref:'Model'}that owns this $$DOC{ref:'Property'}.
*/}
},
{
name:'subType',
label:'Sub-Type',
type:'String',
displayWidth:30,
help:'The type of the property.',
documentation:function(){/*
In array types,the $$DOC{ref:'.subType'}indicates the type that the array contains.
*/}
},
{
name:'units',
type:'String',
required:true,
displayWidth:70,
displayHeight:1,
defaultValue:'',
help:'The units of the property.',
documentation:function(){/*
The units of the $$DOC{ref:'Property'}.
*/}
},
{
name:'required',
type:'Boolean',
view:'BooleanView',
defaultValue:true,
help:'Indicates if the property is a required field.',
documentation:function(){/*
Indicates whether the $$DOC{ref:'Property'}is required for its owner $$DOC{ref:'Model'}to
function properly.
*/}
},
{
name:'hidden',
type:'Boolean',
view:'BooleanView',
defaultValue:false,
help:'Indicates if the property is hidden.',
documentation:function(){/*
Indicates whether the $$DOC{ref:'Property'}is for internal use and should be hidden from
the user when viewing tables or other views of $$DOC{ref:'Model'}
$$DOC{ref:'Property',usePlural:true}.
*/}
},
{
name:'transient',
type:'Boolean',
view:'BooleanView',
defaultValue:false,
help:'Indicates if the property is transient.',
documentation:function(){/*
Indicates whether the $$DOC{ref:'Property'}is transient,and should not be saved permanently
or serialized.
*/}
},
{
name:'displayWidth',
type:'int',
displayWidth:8,
displayHeight:1,
defaultValue:'30',
help:'The display width of the property.',
documentation:function(){/*
A width suggestion for views that automatically render the $$DOC{ref:'Property'}.
*/}
},
{
name:'displayHeight',
type:'int',
displayWidth:8,
displayHeight:1,
defaultValue:1,
help:'The display height of the property.',
documentation:function(){/*
A height suggestion for views that automatically render the $$DOC{ref:'Property'}.
*/}
},
{
model_:'ViewFactoryProperty',
name:'view',
type:'view',
defaultValue:'TextFieldView',
help:'View component for the property.',
documentation:function(){/*
The default $$DOC{ref:'View'}to use when rendering the $$DOC{ref:'Property'}.
Specify a string or an object with factory_ and other properties specified.
*/}
},
{
model_:'ViewFactoryProperty',
name:'detailView',
type:'view',
defaultValueFn:function(){return this.view;},
help:'View component for the property when rendering within a DetailView.',
documentation:function(){/*
The default $$DOC{ref:'View'}to use when rendering the $$DOC{ref:'Property'}
as a part of a $$DOC{ref:'DetailView'}. Specify a string or an object with
factory_ and other properties specified.
*/}
},
{
model_:'ViewFactoryProperty',
name:'citationView',
type:'view',
defaultValueFn:function(){return this.view;},
help:'View component for the property when rendering within a CitationView.',
documentation:function(){/*
The default $$DOC{ref:'View'}to use when rendering the $$DOC{ref:'Property'}
as a part of a $$DOC{ref:'CitationView'}. Specify a string or an object with
factory_ and other properties specified.
*/}
},
{
name:'detailViewPreRow',
defaultValue:function(){return "";},
help:'Inject HTML before row in DetailView.',
documentation:function(){/*
An optional function to
inject HTML before the row in $$DOC{ref:'DetailView'}.
*/}
},
{
name:'detailViewPostRow',
defaultValue:function(){return "";},
help:'Inject HTML before row in DetailView.',
documentation:function(){/*
An optional function to
inject HTML after the row in $$DOC{ref:'DetailView'}.
*/}
},
{
name:'defaultValue',
type:'String',
required:false,
displayWidth:70,
displayHeight:1,
defaultValue:'',
postSet:function(old,nu){
if(nu && this.defaultValueFn)this.defaultValueFn=undefined;
},
help:'The property\'s default value.',
documentation:function(){/*
An optional function to
inject HTML before the row in $$DOC{ref:'DetailView'}.
*/}
},
{
name:'defaultValueFn',
label:'Default Value Function',
type:'Function',
required:false,
displayWidth:70,
displayHeight:3,
rows:3,
view:'FunctionView',
defaultValue:'',
postSet:function(old,nu){
if(nu && this.defaultValue)this.defaultValue=undefined;
},
help:'The property\'s default value function.',
documentation:function(){/*
Optional function that is evaluated when a default value is required. Will unset any
$$DOC{ref:'.defaultValue'}that has been set.
*/}
},
{
name:'dynamicValue',
label:"Value's Dynamic Function",
type:'Function',
required:false,
displayWidth:70,
displayHeight:3,
rows:3,
view:'FunctionView',
defaultValue:'',
help:"A dynamic function which computes the property's value.",
documentation:function(){/*
Allows the value of this $$DOC{ref:'Property'}to be calculated dynamically.
Other $$DOC{ref:'Property',usePlural:true}and bindable objects used inside the function will be
automatically bound and the function re-evaluated when a dependency changes.
*/}
},
{
name:'factory',
type:'Function',
required:false,
displayWidth:70,
displayHeight:3,
rows:3,
view:'FunctionView',
defaultValue:'',
help:'Factory for creating initial value when new object instantiated.',
documentation:function(){/*
An optional function that creates the instance used to store the $$DOC{ref:'Property'}value.
This is useful when the $$DOC{ref:'Property'}type is a complex $$DOC{ref:'Model'}that requires
construction parameters.
*/}
},
{
name:'lazyFactory',
type:'Function',
required:false,
view:'FunctionView',
help:'Factory for creating the initial value. Only called when the property is accessed for the first time.',
documentation:function(){/*
Like the $$DOC{ref:'.factory'}function,but only evaulated when this $$DOC{ref:'Property'}is
accessed for the first time.
*/}
},
{
name:'getter',
type:'Function',
required:false,
displayWidth:70,
displayHeight:3,
view:'FunctionView',
defaultValue:'',
help:'The property\'s default value function.',
documentation:function(){/*
For advanced use. Supplying a $$DOC{ref:'.getter'}allows you to completely re-implement the $$DOC{ref:'Property'}
storage mechanism,to calculcate the value,or cache,or pre-process the value as it is requested.
In most cases you can just supply a $$DOC{ref:'.preSet'}or $$DOC{ref:'.postSet'}instead.
*/}
},
{
name:'preSet',
type:'Function',
required:false,
displayWidth:70,
displayHeight:3,
view:'FunctionView',
defaultValue:'',
help:'An adapter function called before normal setter logic.',
documentation:function(){/*
Allows you to modify the incoming value before it is set. Parameters<code>(old,nu)</code>are
supplied with the old and new value. Return the value you want to be set.
*/}
},
{
name:'postSet',
type:'Function',
required:false,
displayWidth:70,
displayHeight:3,
view:'FunctionView',
defaultValue:'',
help:'A function called after normal setter logic,but before property change event fired.',
documentation:function(){/*
Allows you to react after the value of the $$DOC{ref:'Property'}has been set,
but before property change event is fired.
Parameters<code>(old,nu)</code>are supplied with the old and new value.
*/}
},
{
name:'setter',
type:'Function',
required:false,
displayWidth:70,
displayHeight:3,
view:'FunctionView',
defaultValue:'',
help:'The property\'s default value function.',
documentation:function(){/*
For advanced use. Supplying a $$DOC{ref:'.setter'}allows you to completely re-implement the $$DOC{ref:'Property'}
storage mechanism,to calculcate the value,or cache,or pre-process the value as it is set.
In most cases you can just supply a $$DOC{ref:'.preSet'}or $$DOC{ref:'.postSet'}instead.
*/}
},
{
name:'tableFormatter',
label:'Table Cell Formatter',
type:'Function',
required:false,
displayWidth:70,
displayHeight:3,
rows:3,
view:'FunctionView',
defaultValue:'',
help:'Function to format value for display in TableView.',
documentation:"A function to format the value for display in a $$DOC{ref:'TableView'}."
},
{
name:'summaryFormatter',
label:'Summary Formatter',
type:'Function',
required:false,
displayWidth:70,
displayHeight:3,
rows:3,
view:'FunctionView',
defaultValue:'',
help:'Function to format value for display in SummaryView.',
documentation:"A function to format the value for display in a $$DOC{ref:'SummaryView'}."
},
{
name:'tableWidth',
type:'String',
required:false,
defaultValue:'',
help:'Table View Column Width.',
documentation:"A Suggestion for $$DOC{ref:'TableView'}column width."
},
{
name:'help',
label:'Help Text',
type:'String',
required:false,
displayWidth:70,
displayHeight:6,
view:'TextAreaView',
defaultValue:'',
help:'Help text associated with the property.',
documentation:function(){/*
This $$DOC{ref:'.help'}text informs end users how to use the $$DOC{ref:'Property'},
through field labels or tooltips.
*/}
},
DocumentationBootstrap,
{
name:'prototag',
label:'Protobuf tag',
type:'Int',
required:false,
help:'The protobuf tag number for this field.',
documentation:'The protobuf tag number for this field.'
},
{
name:'actionFactory',
type:'Function',
required:false,
displayWidth:70,
displayHeight:3,
rows:3,
view:'FunctionView',
defaultValue:'',
help:'Factory to create the action objects for taking this property from value A to value B',
documentation:"Factory to create the $$DOC{ref:'Action'}objects for taking this $$DOC{ref:'Property'}from value A to value B"
},
{
name:'compareProperty',
type:'Function',
view:'FunctionView',
displayWidth:70,
displayHeight:5,
defaultValue:function(o1,o2){
return(o1.localeCompare||o1.compareTo).call(o1,o2);
},
help:'Comparator function.',
documentation:"A comparator function two compare two instances of this $$DOC{ref:'Property'}."
},
{
name:'fromString',
defaultValue:function(s,p){this[p.name]=s;},
help:'Function to extract value from a String.'
},
{
name:'fromElement',
defaultValue:function(e,p){p.fromString.call(this,e.innerHTML,p);},
help:'Function to extract from a DOM Element.',
documentation:"Function to extract a value from a DOM Element."
},
{
name:'propertyToJSON',
defaultValue:function(visitor,output,o){
if(!this.transient)output[this.name]=visitor.visit(o[this.name]);
},
help:'Function to extract from a DOM Element.',
documentation:"Function to extract a value from a DOM Element."
},
{
name:'autocompleter',
subType:'Autocompleter',
help:'Name or model for the autocompleter for this property.',
documentation:function(){/*
Name or $$DOC{ref:'Model'}for the $$DOC{ref:'Autocompleter'}for this $$DOC{ref:'Property'}.
*/}
},
{
name:'install',
type:'Function',
required:false,
displayWidth:70,
displayHeight:3,
rows:3,
view:'FunctionView',
defaultValue:'',
help:"A function which installs additional features into the Model's prototype.",
documentation:function(){/*
A function which installs additional features into our $$DOC{ref:'Model'}prototype.
This allows extra language dependent features or accessors to be added to instances
for use in code.
*/}
},
{
name:'exclusive',
type:'Boolean',
view:'BooleanView',
defaultValue:true,
help:'Indicates if the property can only have a single value.',
documentation:function(){/*
Indicates if the $$DOC{ref:'Property'}can only have a single value.
*/}
}
],
methods:{
partialEval:function(){return this;},
f:function(obj){return obj[this.name]},
compare:function(o1,o2){
return this.compareProperty(this.f(o1),this.f(o2));
},
toSQL:function(){return this.name;},
toMQL:function(){return this.name;},
toBQL:function(){return this.name;},
initPropertyAgents:function(proto){
var prop=this;
var name=prop.name;
var name$_=prop.name$_;
/* Is handled by copyFrom(),but could be done here instead. */
proto.addInitAgent((this.postSet||this.setter)?9:0,name+':' +(this.postSet||this.setter?'copy arg(postSet)':'copy arg'),function(o,X,m){
if(!m)return;
if(m.hasOwnProperty(name))o[name]=m[name];
if(m.hasOwnProperty(name$_))o[name$_]=m[name$_];
});
if(this.dynamicValue){
proto.addInitAgent(10,name+':dynamicValue',function(o,X){
var dynamicValue=prop.dynamicValue;
Events.dynamic(
dynamicValue.bind(o),
function(value){o[name]=value;});
});
}
if(this.factory){
proto.addInitAgent(11,name+':factory',function(o,X){
if(!o.hasOwnProperty(name))o[name];
});
}
}
},
templates:[
{
model_:'Template',
name:'closureSource',
description:'Closure Externs JavaScript Source',
template:
'/**\n' +
' * @type{<%=this.javascriptType %>}\n' +
' */\n' +
'<%=arguments[1] %>.prototype.<%=this.name %>=undefined;'
}
],
toString:function(){return "Property";}
};
Model.methods={
getPropertyWithoutCache_:BootstrapModel.getPropertyWithoutCache_,
getProperty:BootstrapModel.getProperty,
getAction:BootstrapModel.getAction,
hashCode:BootstrapModel.hashCode,
buildPrototype:BootstrapModel.buildPrototype,
getPrototype:BootstrapModel.getPrototype,
isSubModel:BootstrapModel.isSubModel,
isInstance:BootstrapModel.isInstance,
getAllRequires:BootstrapModel.getAllRequires
};
Model=Model.create(Model);
Model.model_=Model;
Model.create=BootstrapModel.create;
Property=Model.create(Property);
for(var i=0;i<Property.properties.length;i++)
Property[constantize(Property.properties[i].name)]=
Property.properties[i]=Property.create(Property.properties[i]);
USED_MODELS.Property=true;
USED_MODELS.Model=true;
/**
* @license
* Copyright 2012 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var StringProperty=Model.create({
extendsModel:'Property',
name:'StringProperty',
help:"Describes a properties of type String.",
properties:[
{
name:'displayHeight',
type:'int',
displayWidth:8,
defaultValue:1,
help:'The display height of the property.'
},
{
name:'type',
type:'String',
displayWidth:20,
defaultValue:'String',
help:'The FOAM type of this property.'
},
{
name:'preSet',
defaultValue:function(_,v){
return v===undefined||v===null?'':
typeof v==='function'?multiline(v):v.toString();
}
},
{
name:'javaType',
type:'String',
displayWidth:70,
defaultValue:'String',
help:'The Java type of this property.'
},
{
name:'view',
defaultValue:'TextFieldView'
},
{
name:'pattern',
help:'Regex pattern for property.'
},
{
name:'prototag',
label:'Protobuf tag',
type:'Int',
required:false,
help:'The protobuf tag number for this field.'
}
]
});
var BooleanProperty=Model.create({
extendsModel:'Property',
name:'BooleanProperty',
help:"Describes a properties of type String.",
properties:[
{
name:'type',
type:'String',
displayWidth:20,
defaultValue:'Boolean',
help:'The FOAM type of this property.'
},
{
name:'javaType',
type:'String',
displayWidth:70,
defaultValue:'bool',
help:'The Java type of this property.'
},
{
name:'view',
defaultValue:'BooleanView'
},
{
name:'defaultValue',
defaultValue:false
},
{
name:'preSet',
defaultValue:function(_,v){return !!v;}
},
{
name:'prototag',
label:'Protobuf tag',
type:'Int',
required:false,
help:'The protobuf tag number for this field.'
},
{
name:'fromString',
defaultValue:function(s,p){
var txt=s.trim();
this[p.name]=
txt.equalsIC('y')||
txt.equalsIC('yes')||
txt.equalsIC('true')||
txt.equalsIC('t');
},
help:'Function to extract value from a String.'
}
]
});
var DateProperty=Model.create({
extendsModel:'Property',
name:'DateProperty',
help:"Describes a properties of type String.",
properties:[
{
name:'type',
type:'String',
displayWidth:20,
defaultValue:'Date',
help:'The FOAM type of this property.'
},
{
name:'displayWidth',
defaultValue:50
},
{
name:'javaType',
type:'String',
defaultValue:'Date',
help:'The Java type of this property.'
},
{
name:'view',
defaultValue:'DateFieldView'
},
{
name:'prototag',
label:'Protobuf tag',
type:'Int',
required:false,
help:'The protobuf tag number for this field.'
},
{
name:'preSet',
defaultValue:function(_,d){
return typeof d==='string'?new Date(d):d;
}
},
{
name:'tableFormatter',
defaultValue:function(d){
return d?d.toRelativeDateString():'';
}
},
{
name:'compareProperty',
defaultValue:function(o1,o2){
if(!o1)return(!o2)?0:-1;
if(!o2)return 1;
return o1.compareTo(o2);
}
}
]
});
var DateTimeProperty=Model.create({
extendsModel:'DateProperty',
name:'DateTimeProperty',
help:"Describes a properties of type String.",
properties:[
{
name:'type',
type:'String',
displayWidth:25,
defaultValue:'datetime',
help:'The FOAM type of this property.'
},
{
name:'preSet',
defaultValue:function(_,d){
if(typeof d==='number')return new Date(d);
if(typeof d==='string')return new Date(d);
return d;
}
},
{
name:'view',
defaultValue:'DateTimeFieldView'
}
]
});
var IntProperty=Model.create({
extendsModel:'Property',
name:'IntProperty',
help:"Describes a properties of type Int.",
properties:[
{
name:'type',
type:'String',
displayWidth:20,
defaultValue:'Int',
help:'The FOAM type of this property.'
},
{
name:'displayWidth',
defaultValue:10
},
{
name:'javaType',
type:'String',
displayWidth:10,
defaultValue:'int',
help:'The Java type of this property.'
},
{
name:'view',
defaultValue:'IntFieldView'
},
{
name:'preSet',
defaultValue:function(_,v){return parseInt(v||0);}
},
{
name:'defaultValue',
defaultValue:0
},
{
name:'prototag',
label:'Protobuf tag',
type:'Int',
required:false,
help:'The protobuf tag number for this field.'
},
{
name:'compareProperty',
defaultValue:function(o1,o2){
return o1===o2?0:o1>o2?1:-1;
}
}
]
});
var FloatProperty=Model.create({
extendsModel:'Property',
name:'FloatProperty',
help:'Describes a properties of type Float.',
properties:[
{
name:'type',
type:'String',
displayWidth:20,
defaultValue:'Float',
help:'The FOAM type of this property.'
},
{
name:'defaultValue',
defaultValue:0.0
},
{
name:'javaType',
type:'String',
displayWidth:10,
defaultValue:'double',
help:'The Java type of this property.'
},
{
name:'displayWidth',
defaultValue:15
},
{
name:'view',
defaultValue:'FloatFieldView'
},
{
name:'preSet',
defaultValue:function(_,v){return parseFloat(v||0.0);}
},
{
name:'prototag',
label:'Protobuf tag',
type:'Int',
required:false,
help:'The protobuf tag number for this field.'
}
]
});
var FunctionProperty=Model.create({
extendsModel:'Property',
name:'FunctionProperty',
help:"Describes a properties of type Function.",
properties:[
{
name:'type',
type:'String',
displayWidth:20,
defaultValue:'Function',
help:'The FOAM type of this property.'
},
{
name:'javaType',
type:'String',
displayWidth:10,
defaultValue:'Function',
help:'The Java type of this property.'
},
{
name:'displayWidth',
defaultValue:15
},
{
name:'view',
defaultValue:'FunctionView'
},
{
name:'defaultValue',
defaultValue:function(){}
},
{
name:'fromElement',
defaultValue:function(e,p){
var txt=e.innerHTML.trim();
this[p.name]=txt.startsWith('function')?
eval('('+txt+')'):
new Function(txt);
}
},
{
name:'preSet',
defaultValue:function(_,value){
if(typeof value==='string'){
return value.startsWith('function')?
eval('('+value+')'):
new Function(value);
}
return value;
}
}
]
});
var ArrayProperty=Model.create({
extendsModel:'Property',
name:'ArrayProperty',
help:"Describes a properties of type Array.",
properties:[
{
name:'type',
type:'String',
displayWidth:20,
defaultValue:'Array',
help:'The FOAM type of this property.'
},
{
name:'singular',
type:'String',
displayWidth:70,
defaultValueFn:function(){return this.name.replace(/s$/,'');},
help:'The plural form of this model\'s name.',
documentation:function(){/* The singular form of $$DOC{ref:'Property.name'}.*/}
},
{
name:'subType',
type:'String',
displayWidth:20,
defaultValue:'',
help:'The FOAM sub-type of this property.'
},
{
name:'protobufType',
defaultValueFn:function(){return this.subType;}
},
{
name:'preSet',
defaultValue:function(_,a,prop){
var m=FOAM.lookup(prop.subType,this.X)||
FOAM.lookup(prop.subType,GLOBAL);
if(!m)return a;
for(var i=0;i<a.length;i++)
a[i]=a[i].model_?FOAM(a[i]):m.create(a[i]);
return a;
}
},
{
name:'postSet',
defaultValue:function(oldA,a,prop){
var name=prop.name+'ArrayRelay_';
var l=this[name]||(this[name]=function(){
this.propertyChange(prop.name,null,this[prop.name]);
}.bind(this));
if(oldA && oldA.unlisten)oldA.unlisten(l);
if(a && a.listen)a.listen(l);
}
},
{
name:'javaType',
type:'String',
displayWidth:10,
defaultValueFn:function(p){return p.subType+'[]';},
help:'The Java type of this property.'
},
{
name:'view',
defaultValue:'ArrayView'
},
{
name:'factory',
defaultValue:function(){return [];}
},
{
name:'propertyToJSON',
defaultValue:function(visitor,output,o){
if(!this.transient && o[this.name].length)
output[this.name]=visitor.visitArray(o[this.name]);
}
},
{
name:'install',
defaultValue:function(prop){
defineLazyProperty(this,prop.name+'$Proxy',function(){
var proxy=ProxyDAO.create({delegate:this[prop.name].dao});
this.addPropertyListener(prop.name,function(_,_,_,a){
proxy.delegate=a.dao;
});
return{
get:function(){return proxy;},
configurable:true
};
});
}
},
{
name:'fromElement',
defaultValue:function(e,p){
var model=FOAM.lookup(e.getAttribute('model')||p.subType,this.X);
var o=model.create(null,this.X);
o.fromElement(e);
this[p.name]=this[p.name].pushF(o);
}
},
{
name:'prototag',
label:'Protobuf tag',
type:'Int',
required:false,
help:'The protobuf tag number for this field.'
}
]
});
var ReferenceProperty=Model.create({
extendsModel:'Property',
name:'ReferenceProperty',
help:"A foreign key reference to another Entity.",
properties:[
{
name:'type',
type:'String',
displayWidth:20,
defaultValue:'Reference',
help:'The FOAM type of this property.'
},
{
name:'subType',
type:'String',
displayWidth:20,
defaultValue:'',
help:'The FOAM sub-type of this property.'
},
{
name:'subKey',
type:'EXPR',
displayWidth:20,
factory:function(){return this.subType+'.ID';},
help:'The foreign key that this property references.'
},
{
name:'javaType',
type:'String',
displayWidth:10,
defaultValueFn:function(p){return 'Object';},
help:'The Java type of this property.'
},
{
name:'view',
defaultValue:'TextFieldView'
},
{
name:'prototag',
label:'Protobuf tag',
type:'Int',
required:false,
help:'The protobuf tag number for this field.'
}
]
});
var StringArrayProperty=Model.create({
extendsModel:'Property',
name:'StringArrayProperty',
help:"An array of String values.",
properties:[
{
name:'type',
type:'String',
displayWidth:20,
defaultValue:'Array[]',
help:'The FOAM type of this property.'
},
{
name:'singular',
type:'String',
displayWidth:70,
defaultValueFn:function(){return this.name.replace(/s$/,'');},
help:'The plural form of this model\'s name.',
documentation:function(){/* The singular form of $$DOC{ref:'Property.name'}.*/}
},
{
name:'subType',
type:'String',
displayWidth:20,
defaultValue:'String',
help:'The FOAM sub-type of this property.'
},
{
name:'displayWidth',
defaultValue:50
},
{
name:'preSet',
defaultValue:function(_,v){return Array.isArray(v)?v:[v];}
},
{
name:'factory',
defaultValue:function(){return [];}
},
{
name:'javaType',
type:'String',
displayWidth:10,
defaultValue:'String[]',
help:'The Java type of this property.'
},
{
name:'view',
defaultValue:'StringArrayView'
},
{
name:'prototag',
label:'Protobuf tag',
type:'Int',
required:false,
help:'The protobuf tag number for this field.'
},
{
name:'exclusive',
defaultValue:false
},
{
name:'fromElement',
defaultValue:function(e,p){
this[p.name]=this[p.name].pushF(e.innerHTML);
}
}
]
});
var DAOProperty=Model.create({
extendsModel:'Property',
name:'DAOProperty',
help:"Describes a DAO property.",
properties:[
{
name:'type',
defaultValue:'DAO',
help:'The FOAM type of this property.'
},
{
name:'view',
defaultValue:'ArrayView'
},
{
name:'onDAOUpdate'
},
{
name:'install',
defaultValue:function(prop){
defineLazyProperty(this,prop.name+'$Proxy',function(){
if(!this[prop.name]){
var future=afuture();
var delegate=FutureDAO.create({
future:future.get
});
}else
delegate=this[prop.name];
var proxy=ProxyDAO.create({delegate:delegate});
this.addPropertyListener(prop.name,function(_,_,_,dao){
if(future){
future.set(dao);
future=null;
return;
}
proxy.delegate=dao;
});
return{
get:function(){return proxy;},
configurable:true
};
});
}
}
]
});
var ModelProperty=Model.create({
name:'ModelProperty',
extendsModel:'Property',
help:"Describes a Model property.",
properties:[
{
name:'type',
defaultValue:'Model'
},
{
name:'getter',
defaultValue:function(name){
var value=this.instance_[name];
if(typeof value==='undefined'){
var prop=this.model_.getProperty(name);
if(prop && prop.defaultValueFn)
value=prop.defaultValueFn.call(this,prop);
else
value=prop.defaultValue;
}
return FOAM.lookup(value,this.X);
}
},
{
name:'propertyToJSON',
defaultValue:function(visitor,output,o){
if(!this.transient)output[this.name]=o[this.name].id;
}
}
]
});
var ViewProperty=Model.create({
name:'ViewProperty',
extendsModel:'Property',
help:"Describes a View-Factory property.",
properties:[
{
name:'preSet',
doc:"Can be specified as either a function,a Model,a Model path,or a JSON object.",
defaultValue:function(_,f){
if(typeof f==='function')return f;
if(typeof f==='string'){
return function(d,opt_X){
return FOAM.lookup(f,opt_X||this.X).create(d);
}.bind(this);
}
if(typeof f.create==='function')return f.create.bind(f);
if(typeof f.model_==='string')return function(d,opt_X){
return FOAM(f,opt_X||this.X).copyFrom(d);
}
console.error('******* Unknown view factory:',f);
return f;
}
},
{
name:'defaultValue',
preSet:function(_,f){return ViewProperty.PRE_SET.defaultValue.call(this,null,f);}
}
]
});
var FactoryProperty=Model.create({
name:'FactoryProperty',
extendsModel:'Property',
help:'Describes a Factory property.',
properties:[
{
name:'preSet',
doc:"Can be specified as either a function,a Model,a Model path,or a JSON object.",
defaultValue:function(_,f){
if(typeof f==='function')return f;
if(typeof f==='string')return function(map,opt_X){
return FOAM.lookup(f,opt_X||this.X).create(map);
}.bind(this);
if(Model.isInstance(f))return f.create.bind(f);
if(f.factory_)return function(map,opt_X){
var X=opt_X||this.X;
var m=FOAM.lookup(f.factory_,X);
console.assert(m,'Unknown Factory Model:'+f.factory_);
return m.create(f,X);
}.bind(this);
console.error('******* Invalid Factory:',f);
return f;
}
}
]
});
var ViewFactoryProperty=Model.create({
name:'ViewFactoryProperty',
extendsModel:'FactoryProperty',
help:'Describes a View Factory property.',
/* Doesn't work yet!
constants:{
VIEW_CACHE:{}
},
*/
properties:[
{
name:'defaultValue',
preSet:function(_,f){return ViewFactoryProperty.PRE_SET.defaultValue.call(this,null,f);}
},
{
name:'fromElement',
defaultValue:function(e,p){
this[p.name]=e.innerHTML_||(e.innerHTML_=e.innerHTML);
}
},
{
name:'preSet',
doc:"Can be specified as either a function,a Model,a Model path,or a JSON object.",
defaultValue:function(_,f){
if(typeof f==='function')return f;
if(typeof f==='string'){
if(/[^0-9a-zA-Z$_.]/.exec(f)){
var VIEW_CACHE=ViewFactoryProperty.VIEW_CACHE||
(ViewFactoryProperty.VIEW_CACHE={});
var viewModel=VIEW_CACHE[f];
if(!viewModel){
viewModel=VIEW_CACHE[f]=Model.create({
name:'InnerDetailView'+this.$UID,
extendsModel:'DetailView',
templates:[{name:'toHTML',template:f}]
});
arequireModel(viewModel);
}
return function(args,X){return viewModel.create(args,X||this.X);};
}
return function(map,opt_X){
return FOAM.lookup(f,opt_X||this.X).create(map,opt_X||this.X);
}.bind(this);
}
if(Model.isInstance(f))return f.create.bind(f);
if(f.factory_)return function(map,opt_X){
var X=opt_X||this.X;
var m=FOAM.lookup(f.factory_,X);
console.assert(m,'Unknown ViewFactory Model:'+f.factory_);
return m.create(f,X).copyFrom(map);
}.bind(this);
if(View.isInstance(f))return constantFn(f);
console.error('******* Invalid Factory:',f);
return f;
}
}
]
});
var ReferenceArrayProperty=Model.create({
name:'ReferenceArrayProperty',
extendsModel:'ReferenceProperty',
properties:[
{
name:'type',
defaultValue:'Array',
displayWidth:20,
help:'The FOAM type of this property.'
},
{
name:'factory',
defaultValue:function(){return [];},
},
{
name:'view',
defaultValue:'StringArrayView',
}
]
});
var EMailProperty=StringProperty;
var URLProperty=StringProperty;
var DocumentationProperty=Model.create({
extendsModel:'Property',
name:'DocumentationProperty',
help:'Describes the documentation properties found on Models,Properties,Actions,Methods,etc.',
documentation:"The developer documentation for this $$DOC{ref:'.'}. Use a $$DOC{ref:'DocModelView'}to view documentation.",
properties:[
{
name:'type',
type:'String',
defaultvalue:'Documentation'
},
{
name:'getter',
type:'Function',
factory:function(){return function(){
var doc=this.instance_.documentation;
if(doc && typeof Documentation !="undefined" && Documentation
&&(!doc.model_
||!doc.model_.getPrototype
||!Documentation.isInstance(doc)
)){
if(doc.body){
this.instance_.documentation=Documentation.create(doc);
}else{
this.instance_.documentation=Documentation.create({body:doc});
}
}
return this.instance_.documentation;
};}
},
{
name:'view',
defaultValue:'DetailView'
},
{
name:'help',
defaultValue:'Documentation for this entity.'
},
{
name:'documentation',
factory:function(){return "The developer documentation for this $$DOC{ref:'.'}. Use a $$DOC{ref:'DocModelView'}to view documentation.";}
}
]
});
CLASS({
name:'EnumPropertyTrait',
properties:[
{
name:'choices',
type:'Array',
help:'Array of [value,label] choices.',
preSet:function(_,a){return a.map(function(c){return Array.isArray(c)?c:[c,c];});},
required:true
},
{
name:'view',
defaultValue:'ChoiceView'
}
]
});
CLASS({
name:'StringEnumProperty',
traits:['EnumPropertyTrait'],
extendsModel:'StringProperty'
});
CLASS({
name:'DOMElementProperty',
extendsModel:'StringProperty',
properties:[
{
name:'getter',
defaultValue:function(name){return this.X.document.getElementById(this.instance_[name]);}
}
]
});
/**
* @license
* Copyright 2012-2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
name:'Action',
plural:'Actions',
tableProperties:[
'name',
'label'
],
documentation:function(){/*
<p>An executable behavior that can be triggered by the user.
$$DOC{ref:'Action',usePlural:true}are typically represented as buttons
or menu items. Activating the $$DOC{ref:'Action'}causes the
$$DOC{ref:'.action'}function $$DOC{ref:'Property'}to run. The user-facing
control's state is handled by $$DOC{ref:'.isEnabled'}and $$DOC{ref:'.isAvailable'}.
</p>
*/},
properties:[
{
name:'name',
type:'String',
required:true,
displayWidth:30,
displayHeight:1,
defaultValue:'',
help:'The coding identifier for the action.',
documentation:function(){/* The identifier used in code to represent this $$DOC{ref:'.'}.
$$DOC{ref:'.name'}should generally only contain identifier-safe characters.
$$DOC{ref:'.'}names should use camelCase staring with a lower case letter.
*/}
},
{
name:'label',
type:'String',
displayWidth:70,
displayHeight:1,
defaultValueFn:function(){return this.name.labelize();},
help:'The display label for the action.',
documentation:function(){/* A human readable label for the $$DOC{ref:'.'}. May
contain spaces or other odd characters.
*/}
},
{
name:'speechLabel',
type:'String',
displayWidth:70,
displayHeight:1,
defaultValueFn:function(){return this.label;},
help:'The speech label for the action.',
documentation:"A speakable label for the $$DOC{ref:'.'}. Used for accessibility."
},
{
name:'help',
label:'Help Text',
type:'String',
displayWidth:70,
displayHeight:6,
defaultValue:'',
help:'Help text associated with the action.',
documentation:function(){/*
This $$DOC{ref:'.help'}text informs end users how to use the $$DOC{ref:'.'},
through field labels or tooltips.
*/}
},
{
model_:'DocumentationProperty',
name:'documentation',
documentation:function(){/*
The developer documentation.
*/}
},
{
name:'default',
type:'Boolean',
view:'BooleanView',
defaultValue:false,
help:'Indicates if this is the default action.',
documentation:function(){/*
Indicates if this is the default $$DOC{ref:'Action'}.
*/}
},
{
model_:'FunctionProperty',
name:'isAvailable',
label:'Available',
displayWidth:70,
displayHeight:3,
defaultValue:function(){return true;},
help:'Function to determine if action is available.',
documentation:function(){/*
A function used to determine if the $$DOC{ref:'Action'}is available.
*/}
},
{
model_:'FunctionProperty',
name:'isEnabled',
label:'Enabled',
displayWidth:70,
displayHeight:3,
defaultValue:function(){return true;},
help:'Function to determine if action is enabled.',
documentation:function(){/*
A function used to determine if the $$DOC{ref:'Action'}is enabled.
*/}
},
{
model_:'FunctionProperty',
name:'labelFn',
label:'Label Function',
defaultValue:function(action){return action.label;},
help:"Function to determine label. Defaults to 'this.label'.",
documentation:function(){/*
A function used to determine the label. Defaults to $$DOC{ref:'.label'}.
*/}
},
{
name:'iconUrl',
type:'String',
defaultValue:undefined,
help:'Provides a url for an icon to render for this action',
documentation:function(){/*
A url for the icon to render for this $$DOC{ref:'Action'}.
*/}
},
{
name:'showLabel',
type:'String',
defaultValue:true,
help:'Property indicating whether the label should be rendered alongside the icon',
documentation:function(){/*
Indicates whether the $$DOC{ref:'.label'}should be rendered alongside the icon.
*/}
},
{
name:'children',
type:'Array',
factory:function(){return [];},
subType:'Action',
view:'ArrayView',
help:'Child actions of this action.',
persistent:false,
documentation:function(){/*
Child $$DOC{ref:'Action',usePlural:true}of this instance.
*/}
},
{
name:'parent',
type:'String',
help:'The parent action of this action',
documentation:function(){/*
The parent $$DOC{ref:'Action'}of this instance.
*/}
},
{
model_:'FunctionProperty',
name:'action',
displayWidth:80,
displayHeight:20,
defaultValue:'',
help:'Function to implement action.',
documentation:function(){/*
This function supplies the execution of the $$DOC{ref:'Action'}when triggered.
*/}
},
{
model_:'StringArrayProperty',
name:'keyboardShortcuts',
documentation:function(){/*
Keyboard shortcuts for the $$DOC{ref:'Action'}.
*/}
},
{
name:'translationHint',
label:'Description for Translation',
type:'String',
defaultValue:''
}
],
methods:{
callIfEnabled:function(X,that){/* Executes this action if $$DOC{ref:'.isEnabled'}is allows it. */
if(this.isEnabled.call(that,this)){
this.action.call(that,X,this);
that.publish(['action',this.name],this);
}
}
}
});
/* Not used yet
MODEL({
name:'Topic',
tableProperties:[
'name',
'description'
],
properties:[
{
name:'name',
type:'String',
required:true,
displayWidth:30,
displayHeight:1,
defaultValue:'',
preSet:function(newValue){
return newValue.toUpperCase();
},
help:'The coding identifier for this topic.'
},
{
name:'description',
type:'String',
displayWidth:70,
displayHeight:1,
defaultValue:'',
help:'A brief description of this topic.'
}
]
});
*/
CLASS({
name:'Arg',
tableProperties:[
'type',
'name',
'description'
],
documentation:function(){/*
<p>Represents one $$DOC{ref:'Method'}argument,including the type information.</p>
*/},
properties:[
{
name:'type',
type:'String',
required:true,
displayWidth:30,
displayHeight:1,
defaultValue:'Object',
help:'The type of this argument.',
documentation:function(){/*<p>The type of the $$DOC{ref:'.'},either a primitive type or a $$DOC{ref:'Model'}.</p>
*/}
},
{
name:'javaType',
type:'String',
required:false,
defaultValueFn:function(){return this.type;},
help:'The java type that represents the type of this property.',
documentation:function(){/* When running FOAM in a Java environment,specifies the Java type
or class to use. */}
},
{
name:'javascriptType',
type:'String',
required:false,
defaultValueFn:function(){return this.type;},
help:'The javascript type that represents the type of this property.',
documentation:function(){/* When running FOAM in a javascript environment,specifies the javascript
type to use. */}
},
{
name:'name',
type:'String',
required:true,
displayWidth:30,
displayHeight:1,
defaultValue:'',
help:'The coding identifier for the entity.',
documentation:function(){/* The identifier used in code to represent this $$DOC{ref:'.'}.
$$DOC{ref:'.name'}should generally only contain identifier-safe characters.
$$DOC{ref:'.'}names should use camelCase staring with a lower case letter.
*/}
},
{
model_:'BooleanProperty',
name:'required',
defaultValue:true,
documentation:function(){/*
Indicates that this arugment is required for calls to the containing $$DOC{ref:'Method'}.
*/}
},
{
name:'defaultValue',
help:'Default Value if not required and not provided.',
documentation:function(){/*
The default value to use if this argument is not required and not provided to the $$DOC{ref:'Method'}call.
*/}
},
{
name:'description',
type:'String',
displayWidth:70,
displayHeight:1,
defaultValue:'',
help:'A brief description of this argument.',
documentation:function(){/*
A human-readable description of the argument.
*/}
},
{
name:'help',
label:'Help Text',
type:'String',
displayWidth:70,
displayHeight:6,
defaultValue:'',
help:'Help text associated with the entity.',
documentation:function(){/*
This $$DOC{ref:'.help'}text informs end users how to use the $$DOC{ref:'.'},
through field labels or tooltips.
*/}
},
{
model_:'DocumentationProperty',
name:'documentation',
documentation:function(){/*
The developer documentation.
*/}
}
],
methods:{
decorateFunction:function(f,i){
if(this.type==='Object')return f;
var type=this.type;
return this.required?
function(){
console.assert(arguments[i] !==undefined,'Missing required argument# '+i);
console.assert(typeof arguments[i]===type,'argument# '+i+' type expected to be '+type+',but was ' +(typeof arguments[i])+ ':'+arguments[i]);
return f.apply(this,arguments);
}:
function(){
console.assert(arguments[i]===undefined||typeof arguments[i]===type,
'argument# '+i+' type expected to be '+type+',but was ' +(typeof arguments[i])+ ':'+arguments[i]);
return f.apply(this,arguments);
};
}
},
templates:[
{
model_:'Template',
name:'javaSource',
description:'Java Source',
template:'<%=this.type %><%=this.name %>'
},
{
model_:'Template',
name:'closureSource',
description:'Closure JavaScript Source',
template:'@param{<%=this.javascriptType %>}<%=this.name %>.'
},
{
model_:'Template',
name:'webIdl',
description:'Web IDL Source',
template:'<%=this.type %><%=this.name %>'
}
]
});
CLASS({
name:'Constant',
plural:'constants',
tableProperties:[
'name',
'value',
'description'
],
documentation:function(){/*
*/},
properties:[
{
name:'name',
type:'String',
required:true,
displayWidth:30,
displayHeight:1,
defaultValue:'',
help:'The coding identifier for the entity.',
documentation:function(){/* The identifier used in code to represent this $$DOC{ref:'.'}.
$$DOC{ref:'.name'}should generally only contain identifier-safe characters.
$$DOC{ref:'.'}names should use camelCase staring with a lower case letter.
*/}
},
{
name:'description',
type:'String',
displayWidth:70,
displayHeight:1,
defaultValue:'',
help:'A brief description of this method.',
documentation:function(){/* A human readable description of the $$DOC{ref:'.'}.
*/}
},
{
model_:'DocumentationProperty',
name:'documentation',
documentation:function(){/*
The developer documentation.
*/}
},
{
name:'value',
help:'The value of the constant..'
},
{
name:'type',
defaultValue:'',
help:'Type of the constant.'
},
{
name:'translationHint',
label:'Description for Translation',
type:'String',
defaultValue:''
}
]
});
CLASS({
name:'Message',
plural:'messages',
tableProperties:[
'name',
'value',
'translationHint'
],
documentation:function(){/*
*/},
properties:[
{
name:'name',
type:'String',
required:true,
displayWidth:30,
displayHeight:1,
defaultValue:'',
help:'The coding identifier for the message.',
documentation:function(){/* The identifier used in code to represent this $$DOC{ref:'.'}.
$$DOC{ref:'.name'}should generally only contain identifier-safe characters.
$$DOC{ref:'.'}names should use camelCase staring with a lower case letter.
*/}
},
{
name:'value',
type:'String',
help:'The message itself.'
},
{
name:'translationHint',
type:'String',
displayWidth:70,
displayHeight:1,
defaultValue:'',
help:'A brief description of this message and the context in which it used.',
documentation:function(){/* A human readable description of the
$$DOC{ref:'.'}and its context for the purpose of translation.
*/}
}
]
});
CLASS({
name:'Method',
plural:'Methods',
tableProperties:[
'name',
'description'
],
documentation:function(){/*
<p>A $$DOC{ref:'Method'}represents a callable piece of code with
$$DOC{ref:'.args',text:'arguments'}and an optional return value.
</p>
<p>$$DOC{ref:'Method',usePlural:true}contain code that runs in the instance's scope,so code
in your $$DOC{ref:'Method'}has access to the other $$DOC{ref:'Property',usePlural:true}and
features of your $$DOC{ref:'Model'}.</p>
<ul>
<li><code>this.propertyName</code>gives the value of a $$DOC{ref:'Property'}</li>
<li><code>this.propertyName$</code>is the binding point for the $$DOC{ref:'Property'}. Assignment
will bind bi-directionally,or<code>Events.follow(src,dst)</code>will bind from
src to dst.</li>
<li><code>this.methodName</code>calls another $$DOC{ref:'Method'}of this
$$DOC{ref:'Model'}</li>
<li><p><code>this.SUPER()</code>calls the $$DOC{ref:'Method'}implementation from the
base $$DOC{ref:'Model'}(specified in $$DOC{ref:'Model.extendsModel'}).</p>
<ul>
<li>
<p>Calling
<code>this.SUPER()</code>is extremely important in your<code>init()</code>
$$DOC{ref:'Method'},if you provide one.</p>
<p>You can also specify<code>SUPER</code>as the
first argument of your Javascript function,and it will be populated with the
correct base function automatically:</p>
<p><code>function(other_arg){<br/>
&nbsp;&nbsp;this.SUPER(other_arg);
&nbsp;&nbsp;...<br/></code>
</p>
</li>
</ul>
</li>
</ul>
*/},
properties:[
{
name:'name',
type:'String',
required:true,
displayWidth:30,
displayHeight:1,
defaultValue:'',
help:'The coding identifier for the entity.',
documentation:function(){/* The identifier used in code to represent this $$DOC{ref:'.'}.
$$DOC{ref:'.name'}should generally only contain identifier-safe characters.
$$DOC{ref:'.'}names should use camelCase staring with a lower case letter.
*/}
},
{
name:'description',
type:'String',
displayWidth:70,
displayHeight:1,
defaultValue:'',
help:'A brief description of this method.',
documentation:function(){/* A human readable description of the $$DOC{ref:'.'}.
*/}
},
{
name:'help',
label:'Help Text',
type:'String',
displayWidth:70,
displayHeight:6,
defaultValue:'',
help:'Help text associated with the entity.',
documentation:function(){/*
This $$DOC{ref:'.help'}text informs end users how to use the $$DOC{ref:'.'},
through field labels or tooltips.
*/}
},
{
model_:'DocumentationProperty',
name:'documentation',
documentation:function(){/*
The developer documentation.
*/}
},
{
name:'code',
type:'Function',
displayWidth:80,
displayHeight:30,
view:'FunctionView',
help:'Javascript code to implement this method.',
postSet:function(){
if(!DEBUG)return;
var multilineComment=/^\s*function\s*\([\$\s\w\,]*?\)\s*{\s*\/\*([\s\S]*?)\*\/[\s\S]*$|^\s*\/\*([\s\S]*?)\*\/([\s\S]*)/.exec(this.code.toString());
if(multilineComment){
var bodyFn=multilineComment[1];
this.documentation=this.X.Documentation.create({
name:this.name,
body:bodyFn
})
}
},
documentation:function(){/*
<p>The code to execute for the $$DOC{ref:'Method'}call.</p>
<p>In a special case for javascript documentation,an initial multiline comment,if present,
will be pulled from your code and used as a documentation template:
<code>function(){\/\* docs here \*\/ code...}</code></p>
*/}
},
{
name:'returnType',
defaultValue:'',
help:'Return type.',
documentation:function(){/*
The return type of the $$DOC{ref:'Method'}.
*/}
},
{
model_:'BooleanProperty',
name:'returnTypeRequired',
defaultValue:true,
documentation:function(){/*
Indicates whether the return type is checked.
*/}
},
{
model_:'ArrayProperty',
name:'args',
type:'Array[Arg]',
subType:'Arg',
view:'ArrayView',
factory:function(){return [];},
defaultValue:[],
help:'Method arguments.',
documentation:function(){/*
The $$DOC{ref:'Arg',text:'Arguments'}for the method.
*/}
},
{
name:'isMerged',
help:'As a listener,should this be merged?',
documentation:function(){/*
For a listener $$DOC{ref:'Method'},indicates that the events should be merged to avoid
repeated activations.
*/}
},
{
model_:'BooleanProperty',
name:'isFramed',
help:'As a listener,should this be animated?',
defaultValue:false,
documentation:function(){/*
For a listener $$DOC{ref:'Method'},indicates that this listener is animated,
and events should be merged to trigger only once per frame.
*/}
},
],
templates:[
{
model_:'Template',
name:'javaSource',
description:'Java Source',
template:'<%=this.returnType||"void" %><%=this.name %>(' +
'<% for(var i=0;i<this.args.length;i++){var arg=this.args[i];%>' +
'<%=arg.javaSource()%><% if(i<this.args.length-1)out(",");%>' +
'<%}%>' +
')'
},
{
model_:'Template',
name:'closureSource',
description:'Closure JavaScript Source',
template:
'/**\n' +
'<% for(var i=0;i<this.args.length;i++){var arg=this.args[i];%>' +
' *<%=arg.closureSource()%>\n' +
'<%}%>' +
'<% if(this.returnType){%>' +
' * @return{<%=this.returnType %>}.\n' +
'<%}%>' +
' */\n' +
'<%=arguments[1] %>.prototype.<%=this.name %>=goog.abstractMethod;'
},
{
model_:'Template',
name:'webIdl',
description:'Web IDL Source',
template:
'<%=this.returnType||\'void\' %><%=this.name %>(' +
'<% for(var i=0;i<this.args.length;i++){var arg=this.args[i];%>' +
'<%=arg.webIdl()%><% if(i<this.args.length-1)out(",");%>' +
'<%}%>' +
')'
}
]
});
Method.getPrototype().decorateFunction=function(f){
for(var i=0;i<this.args.length;i++){
var arg=this.args[i];
f=arg.decorateFunction(f,i);
}
var returnType=this.returnType;
return returnType?
function(){
var ret=f.apply(this,arguments);
console.assert(typeof ret===returnType,'return type expected to be '+returnType+',but was ' +(typeof ret)+ ':'+ret);
return ret;
}:f;
};
Method.getPrototype().generateFunction=function(){
var f=this.code;
return DEBUG?this.decorateFunction(f):f;
};
Method.methods={
decorateFunction:Method.getPrototype().decorateFunction,
generateFunction:Method.getPrototype().generateFunction
};
CLASS({
name:'Interface',
plural:'Interfaces',
tableProperties:[
'package','name','description'
],
documentation:function(){/*
<p>$$DOC{ref:'Interface',usePlural:true}specify a set of methods with no
implementation. $$DOC{ref:'Model',usePlural:true}implementing $$DOC{ref:'Interface'}
fill in the implementation as needed. This is analogous to
$$DOC{ref:'Interface',usePlural:true}in object-oriented languages.</p>
*/},
properties:[
{
name:'name',
required:true,
help:'Interface name.',
documentation:function(){/* The identifier used in code to represent this $$DOC{ref:'.'}.
$$DOC{ref:'.name'}should generally only contain identifier-safe characters.
$$DOC{ref:'.'}definition names should use CamelCase starting with a capital letter.
*/}
},
{
name:'package',
help:'Interface package.',
documentation:Model.PACKAGE.documentation.clone()
},
{
name:'extends',
type:'Array[String]',
view:'StringArrayView',
help:'Interfaces extended by this interface.',
documentation:function(){/*
The other $$DOC{ref:'Interface',usePlural:true}this $$DOC{ref:'Interface'}inherits
from. Like a $$DOC{ref:'Model'}instance can $$DOC{ref:'Model.extendsModel'}other
$$DOC{ref:'Model',usePlural:true},
$$DOC{ref:'Interface',usePlural:true}should only extend other
instances of $$DOC{ref:'Interface'}.</p>
<p>Do not specify<code>extendsModel:'Interface'</code>unless you are
creating a new interfacing system.
*/}
},
{
name:'description',
type:'String',
required:true,
displayWidth:70,
displayHeight:1,
defaultValue:'',
help:'The interface\'s description.',
documentation:function(){/* A human readable description of the $$DOC{ref:'.'}. */}
},
{
name:'help',
label:'Help Text',
displayWidth:70,
displayHeight:6,
view:'TextAreaView',
help:'Help text associated with the argument.',
documentation:function(){/*
This $$DOC{ref:'.help'}text informs end users how to use the $$DOC{ref:'.'},
through field labels or tooltips.
*/}
},
{
model_:'DocumentationProperty',
name:'documentation'
},
{
model_:'ArrayProperty',
name:'methods',
type:'Array[Method]',
subType:'Method',
view:'ArrayView',
factory:function(){return [];},
defaultValue:[],
help:'Methods associated with the interface.',
documentation:function(){/*
<p>The $$DOC{ref:'Method',usePlural:true}that the interface requires
extenders to implement.</p>
*/}
}
],
templates:[
{
model_:'Template',
name:'javaSource',
description:'Java Source',
template:'public interface<% out(this.name);%>\n' +
'<% if(this.extends.length){%>extends<%=this.extends.join(",")%>\n<%}%>' +
'{\n<% for(var i=0;i<this.methods.length;i++){var meth=this.methods[i];%>' +
'<%=meth.javaSource()%>;\n' +
'<%}%>' +
'}'
},
{
model_:'Template',
name:'closureSource',
description:'Closure JavaScript Source',
template:
'goog.provide(\'<%=this.name %>\');\n' +
'\n' +
'/**\n' +
' * @interface\n' +
'<% for(var i=0;i<this.extends.length;i++){var ext=this.extends[i];%>' +
' * @extends{<%=ext %>}\n' +
'<%}%>' +
' */\n' +
'<%=this.name %>=function(){};\n' +
'<% for(var i=0;i<this.methods.length;i++){var meth=this.methods[i];%>' +
'\n<%=meth.closureSource(undefined,this.name)%>\n' +
'<%}%>'
},
{
model_:'Template',
name:'webIdl',
description:'Web IDL Source',
template:
'interface<%=this.name %><% if(this.extends.length){%>:<%=this.extends[0] %><%}%>{\n' +
'<% for(var i=0;i<this.methods.length;i++){var meth=this.methods[i];%>' +
'<%=meth.webIdl()%>;\n' +
'<%}%>' +
'}'
}
]
});
CLASS({
name:'Template',
tableProperties:[
'name','description'
],
documentation:function(){/*
<p>A $$DOC{ref:'.'}is processed to create a method that generates content for a $$DOC{ref:'View'}.
Sub-views can be created from inside the
$$DOC{ref:'Template'}using special tags. The content is lazily processed,so the first time you ask for
a $$DOC{ref:'Template'}
the content is compiled,tags expanded and sub-views created. Generally a template is included in a
$$DOC{ref:'View'},since after compilation a method is created and attached to the $$DOC{ref:'View'}
containing the template.
</p>
<p>For convenience,$$DOC{ref:'Template',usePlural:true}can be specified as a function with a block
comment inside to avoid line wrapping problems:
<code>templates:[ myTemplate:function(){\/\* my template content \*\/}]</code>
</p>
<p>HTML $$DOC{ref:'Template',usePlural:true}can include the following JSP-style tags:
</p>
<ul>
<li><code>&lt;% code %&gt;</code>:code inserted into template,but nothing implicitly output</li>
<li><code>&lt;%=comma-separated-values %&gt;</code>:all values are appended to template output</li>
<li><code>&lt;%# expression %&gt;</code>:dynamic(auto-updating)expression is output</li>
<li><code>\\&lt;new-line&gt;</code>:ignored</li>
<li><code>$$DOC{ref:'Template',text:'%%value'}(&lt;whitespace&gt;|{parameters})</code>:output a single value to the template output</li>
<li><code>$$DOC{ref:'Template',text:'$$feature'}(&lt;whitespace&gt;|{parameters})</code>:output the View or Action for the current Value</li>
<li><code>&lt;!-- comment --&gt;</code>comments are stripped from $$DOC{ref:'Template',usePlural:true}.</li>
</ul>
*/},
properties:[
{
name:'name',
type:'String',
required:true,
displayWidth:30,
displayHeight:1,
defaultValue:'',
help:'The template\'s unique name.',
documentation:function(){/* The identifier used in code to represent this $$DOC{ref:'.'}.
$$DOC{ref:'.name'}should generally only contain identifier-safe characters.
$$DOC{ref:'.'}names should use camelCase staring with a lower case letter.
*/}
},
{
name:'description',
type:'String',
required:true,
displayWidth:70,
displayHeight:1,
defaultValue:'',
help:'The template\'s description.',
documentation:"A human readable description of the $$DOC{ref:'.'}."
},
{
model_:'ArrayProperty',
name:'args',
type:'Array[Arg]',
subType:'Arg',
view:'ArrayView',
factory:function(){return [];},
defaultValue:[],
help:'Method arguments.',
documentation:function(){/*
The $$DOC{ref:'Arg',text:'Arguments'}for the $$DOC{ref:'Template'}.
*/}
},
{
name:'template',
type:'String',
displayWidth:180,
displayHeight:30,
rows:30,cols:80,
defaultValue:'',
view:'TextAreaView',
help:'Template text.<%=expr %>or<% out(...);%>',
documentation:"The string content of the uncompiled $$DOC{ref:'Template'}body."
},
{
name:'futureTemplate',
transient:true
},
/*
{
name:'templates',
type:'Array[Template]',
subType:'Template',
view:'ArrayView',
defaultValue:[],
help:'Sub-templates of this template.'
},*/
{
model_:'DocumentationProperty',
name:'documentation'
}
]
});
CLASS({
name:'Documentation',
tableProperties:[
'name'
],
documentation:function(){/*
<p>The $$DOC{ref:'Documentation'}model is used to store documentation text to
describe the use of other models. Set the $$DOC{ref:'Model.documentation'}property
of your model and specify the body text:</p>
<ul>
<li><p>Fully define the Documentation model:</p><p>documentation:
{model_:'Documentation',body:function(){\/\* your doc text \*\/}}</p>
</li>
<li><p>Define as a function:</p><p>documentation:
function(){\/\* your doc text \*\/}</p>
</li>
<li><p>Define as a one-line string:</p><p>documentation:
"your doc text"</p>
</li>
</ul>
*/},
properties:[
{
name:'name',
type:'String',
required:true,
displayWidth:30,
displayHeight:1,
defaultValue:'documentation',
help:'The Document\'s unique name.',
documentation:"An optional name for the document. Documentation is normally referenced by the name of the containing Model."
},
{
name:'label',
type:'String',
required:true,
displayWidth:30,
displayHeight:1,
defaultValue:'',
help:'The Document\'s title or descriptive label.',
documentation:"A human readable title to display. Used for books of documentation and chapters."
},
{
name:'body',
type:'Template',
defaultValue:'',
help:'The main content of the document.',
documentation:"The main body text of the document. Any valid template can be used,including the $$DOC{ref:'foam.documentation.DocView'}specific $$DOC{ref:'foam.documentation.DocView',text:'$$DOC{\"ref\"}'}tag.",
preSet:function(_,template){
return TemplateUtil.expandTemplate(this,template);
}
},
{
model_:'ArrayProperty',
name:'chapters',
type:'Array[Document]',
subtype:'Documentation',
view:'ArrayView',
factory:function(){return [];},
defaultValue:[],
help:'Sub-documents comprising the full body of this document.',
documentation:"Optional sub-documents to be included in this document. A viewer may choose to provide an index or a table of contents.",
preSet:function(old,nu){
if(!DEBUG)return [];
var self=this;
var foamalized=[];
nu.forEach(function(chapter){
if(chapter && typeof self.X.Documentation !="undefined" && self.X.Documentation
&&(!chapter.model_
||!chapter.model_.getPrototype
||!self.X.Documentation.isInstance(chapter)
)){
if(chapter.body){
foamalized.push(self.X.Documentation.create(chapter));
}else{
foamalized.push(self.X.Documentation.create({body:chapter}));
}
}else{
foamalized.push(chapter);
}
});
return foamalized;
},
}
]
});
TemplateUtil.expandModelTemplates(Property);
TemplateUtil.expandModelTemplates(Method);
TemplateUtil.expandModelTemplates(Model);
TemplateUtil.expandModelTemplates(Arg);
/**
* @license
* Copyright 2012 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
name:'UnitTest',
plural:'Unit Tests',
documentation:function(){/*
<p>A basic unit test. $$DOC{ref:".atest"}is the main method,it executes this test.</p>
<p>A<tt>UnitTest</tt>may contain child tests,under the $$DOC{ref:".tests"}$$DOC{ref:"Relationship"}. These tests are run when the parent is,if $$DOC{ref:".runChildTests"}is truthy(the default).</p>
<p>After the test has finished running,its $$DOC{ref:".passed"}and $$DOC{ref:".failed"}properties count the number of assertions that passed and failed in this<em>subtree</em>(that is,including the children,if run).</p>
<p>Before the children are run,if $$DOC{ref:".failed"}is nonzero,$$DOC{ref:".atest"}will check for<tt>this.X.onTestFailure</tt>. If this function is defined,it will be called with the<tt>UnitTest</tt>object as the first argument. This makes it easy for test runners to hook in their error reporting.</p>
<p>Test failure is abstracted by the $$DOC{ref:".hasFailed"}method;this method should always be used,since other subclasses have different definitions of failure.</p>
*/},
tableProperties:[ 'description','passed','failed' ],
properties:
[
{
model_:'Property',
name:'name',
type:'String',
required:true,
displayWidth:50,
documentation:'The unit test\'s name.'
},
{
model_:'Property',
name:'description',
type:'String',
displayWidth:70,
displayHeight:5,
defaultValue:'',
documentation:'A multi-line description of the unit test.'
},
{
model_:'BooleanProperty',
name:'disabled',
documentation:'When true,this test is ignored. Test runners should exclude disabled tests from their DAOs.',
defaultValue:false
},
{
model_:'IntProperty',
name:'passed',
required:true,
transient:true,
displayWidth:8,
displayHeight:1,
view:'IntFieldView',
documentation:'Number of assertions which have passed.'
},
{
model_:'IntProperty',
name:'failed',
required:true,
transient:true,
displayWidth:8,
displayHeight:1,
documentation:'Number of assertions which have failed.'
},
{
model_:'BooleanProperty',
name:'async',
defaultValue:false,
documentation:'Set to make this test asynchronoous. Async tests receive a<tt>ret</tt>parameter as their first argument,and $$DOC{ref:".atest"}will not return until<tt>ret</tt>is called by the test code.'
},
{
model_:'FunctionProperty',
name:'code',
label:'Test Code',
displayWidth:80,
displayHeight:30,
documentation:'The code for the test. Should not include the<tt>function(){...}</tt>,just the body. Should expect a<tt>ret</tt>parameter when the test is async,see $$DOC{ref:".async",text:"above"}.',
fromElement:function(e,p){
var txt=e.innerHTML;
txt=
txt.trim().startsWith('function')?txt:
this.async?'function(ret){\n'+txt+'\n}':
'function(){\n'+txt+'\n}';
this[p.name]=eval('('+txt+')');
},
preSet:function(_,value){
if(typeof value==='string'){
if(value.startsWith('function')){
value=eval('('+value+')');
}else{
value=new Function(value);
}
}
if(typeof value==='function' && this.async && value.length===0){
var str=value.toString();
return eval('(function(ret)'+str.substring(str.indexOf('{'))+ ')');
}else{
return value;
}
}
},
{
model_:'BooleanProperty',
name:'hasRun',
transient:true,
hidden:true,
defaultValue:false,
documentation:'Set after the test has finished executing. Prevents the test from running twice.'
},
{
model_:'Property',
name:'results',
type:'String',
mode:'read-only',
view:'UnitTestResultView',
transient:true,
required:true,
displayWidth:80,
displayHeight:20,
documentation:'Log output for this test. Written to by $$DOC{ref:".log"},as well as $$DOC{ref:".assert"}and its friends $$DOC{ref:".fail"}and $$DOC{ref:".ok"}.'
},
{
model_:'StringArrayProperty',
name:'tags',
label:'Tags',
documentation:'A list of tags for this test. Gives the environment(s)in which a test can be run. Currently in use:node,web.'
},
{
model_:'ArrayProperty',
name:'tests',
subType:'UnitTest',
label:'Tests',
view:'DAOListView',
documentation:'An array of child tests. Will be run in order after the parent test.'
},
{
model_:'BooleanProperty',
name:'runChildTests',
documentation:'Whether the nested child tests should be run when this test is. Defaults to<tt>true</tt>,but some test runners set it to<tt>false</tt>so they can integrate with displaying the results.',
transient:true,
defaultValue:true
}
],
actions:[
{
name:'test',
documentation:'Synchronous helper to run the tests. Simply calls $$DOC{ref:".atest"}.',
action:function(obj){asynchronized(this.atest(),this.LOCK)(function(){});}
}
],
constants:{
LOCK:{}
},
methods:{
atest:function(){
var self=this;
if(this.hasRun)return anop;
this.hasRun=true;
this.X=this.X.sub({},this.name);
this.X.log=this.log.bind(this);
this.X.jlog=this.jlog.bind(this);
this.X.assert=this.assert.bind(this);
this.X.fail=this.fail.bind(this);
this.X.ok=this.ok.bind(this);
this.X.append=this.append.bind(this);
this.X.test=this;
this.results='';
this.passed=0;
this.failed=0;
var code;
code=eval('('+this.code.toString()+ ')');
var afuncs=[];
var oldLog;
afuncs.push(function(ret){
oldLog=console.log;
console.log=self.log.bind(self.X);
ret();
});
afuncs.push(this.async?code.bind(this.X):code.abind(this.X));
afuncs.push(function(ret){
console.log=oldLog;
ret();
});
if(this.runChildTests){
var query=this.X.childTestsFilter||TRUE;
var future=this.tests.dao.where(query).select([].sink);
afuncs.push(function(ret){
future(function(innerTests){
var afuncsInner=[];
innerTests.forEach(function(test){
afuncsInner.push(function(ret){
test.X=self.X.sub();
test.atest()(ret);
});
});
if(afuncsInner.length){
aseq.apply(this,afuncsInner)(ret);
}else{
ret();
}
});
});
}
afuncs.push(function(ret){
self.hasRun=true;
self.X.onTestFailure && self.hasFailed()&& self.X.onTestFailure(self);
ret();
});
return aseq.apply(this,afuncs);
},
append:function(s){this.results +=s;},
log:function(/*arguments*/){
for(var i=0;i<arguments.length;i++)
this.append(arguments[i]);
this.append('\n');
},
jlog:function(/*arguments*/){
for(var i=0;i<arguments.length;i++)
this.append(JSONUtil.stringify(arguments[i]));
this.append('\n');
},
addHeader:function(name){
this.log('<tr><th colspan=2 class="resultHeader">'+name+'</th></tr>');
},
assert:function(condition,comment){
if(condition)this.passed++;else this.failed++;
this.log(
(comment?comment:'(no message)')+
' ' +
(condition?"<font color=green>OK</font>":"<font color=red>ERROR</font>"));
},
fail:function(comment){
this.assert(false,comment);
},
ok:function(comment){
this.assert(true,comment);
},
hasFailed:function(){
return this.failed>0;
}
}
});
CLASS({
name:'RegressionTest',
label:'Regression Test',
documentation:'A $$DOC{ref:"UnitTest"}with a "gold master",which is compared with the output of the live test.',
extendsModel:'UnitTest',
properties:[
{
name:'master',
documentation:'The "gold" version of the output. Compared with the $$DOC{ref:".results"}using<tt>.equals()</tt>,and the test passes if they match.'
},
{
name:'results',
view:'RegressionTestResultView'
},
{
model_:'BooleanProperty',
name:'regression',
hidden:true,
transient:true,
defaultValue:false,
documentation:'Set after $$DOC{ref:".atest"}:<tt>true</tt>if $$DOC{ref:".master"}and $$DOC{ref:".results"}match,<tt>false</tt>if they don\'t.'
}
],
methods:{
atest:function(){
var sup=this.SUPER();
return aseq(
sup,
function(ret){
this.regression=this.hasRun && !this.results.equals(this.master);
ret();
}.bind(this)
);
},
hasFailed:function(){
return this.regression||this.hasRun && !this.results.equals(this.master);
}
}
});
CLASS({
name:'UITest',
label:'UI Test',
extendsModel:'UnitTest',
properties:[
{
name:'results',
view:'UITestResultView'
},
{
name:'runChildTests',
help:'Don\'t run child tests by default for UITests;they need a view to be run properly.',
defaultValue:false
}
]
});
CLASS({
name:'Relationship',
tableProperties:[
'name','label','relatedModel','relatedProperty'
],
documentation:function(){/*
$$DOC{ref:'Relationship',usePlural:true}indicate a parent-child relation
between instances of
a $$DOC{ref:'Model'}and some child $$DOC{ref:'Model',usePlural:true},
through the indicated
$$DOC{ref:'Property',usePlural:true}. If your $$DOC{ref:'Model',usePlural:true}
build a tree
structure of instances,they could likely benefit from a declared
$$DOC{ref:'Relationship'}.
*/},
properties:[
{
name:'name',
type:'String',
displayWidth:30,
displayHeight:1,
defaultValueFn:function(){return GLOBAL[this.relatedModel]?GLOBAL[this.relatedModel].plural:'';},
documentation:function(){/* The identifier used in code to represent this $$DOC{ref:'.'}.
$$DOC{ref:'.name'}should generally only contain identifier-safe characters.
$$DOC{ref:'.'}names should use camelCase staring with a lower case letter.
*/},
help:'The coding identifier for the relationship.'
},
{
name:'label',
type:'String',
displayWidth:70,
displayHeight:1,
defaultValueFn:function(){return this.name.labelize();},
documentation:function(){/* A human readable label for the $$DOC{ref:'.'}. May
contain spaces or other odd characters.
*/},
help:'The display label for the relationship.'
},
{
name:'help',
label:'Help Text',
type:'String',
displayWidth:70,
displayHeight:6,
defaultValue:'',
documentation:function(){/*
This $$DOC{ref:'.help'}text informs end users how to use the $$DOC{ref:'.'},
through field labels or tooltips.
*/},
help:'Help text associated with the relationship.'
},
{
model_:'DocumentationProperty',
name:'documentation',
documentation:function(){/*
The developer documentation.
*/}
},
{
name:'relatedModel',
type:'String',
required:true,
displayWidth:30,
displayHeight:1,
defaultValue:'',
documentation:function(){/* The $$DOC{ref:'Model.name'}of the related $$DOC{ref:'Model'}.*/},
help:'The name of the related Model.'
},
{
name:'relatedProperty',
type:'String',
required:true,
displayWidth:30,
displayHeight:1,
defaultValue:'',
documentation:function(){/*
The join $$DOC{ref:'Property'}of the related $$DOC{ref:'Model'}.
This is the property that links back to this $$DOC{ref:'Model'}from the other
$$DOC{ref:'Model',usePlural:true}.
*/},
help:'The join property of the related Model.'
}
]/*,
methods:{
dao:function(){
var m=this.X[this.relatedModel];
return this.X[m.name+'DAO'];
},
JOIN:function(sink,opt_where){
var m=this.X[this.relatedModel];
var dao=this.X[m.name+'DAO']||this.X[m.plural];
return MAP(JOIN(
dao.where(opt_where||TRUE),
m.getProperty(this.relatedProperty),
[]),sink);
}
}*/
});
CLASS({
name:'Issue',
plural:'Issues',
help:'An issue describes a question,feature request,or defect.',
ids:[
'id'
],
tableProperties:
[
'id','severity','status','summary','assignedTo'
],
documentation:function(){/*
An issue describes a question,feature request,or defect.
*/},
properties:
[
{
model_:'IntProperty',
name:'id',
label:'Issue ID',
displayWidth:12,
documentation:function(){/* $$DOC{ref:'Issue'}unique sequence number. */},
help:'Issue\'s unique sequence number.'
},
{
name:'severity',
view:{
factory_:'ChoiceView',
choices:[
'Feature',
'Minor',
'Major',
'Question'
]
},
defaultValue:'String',
documentation:function(){/* The severity of the issue. */},
help:'The severity of the issue.'
},
{
name:'status',
type:'String',
required:true,
view:{
factory_:'ChoiceView',
choices:[
'Open',
'Accepted',
'Complete',
'Closed'
]
},
defaultValue:'String',
documentation:function(){/* The status of the $$DOC{ref:'Issue'}. */},
help:'The status of the issue.'
},
{
model_:'Property',
name:'summary',
type:'String',
required:true,
displayWidth:70,
displayHeight:1,
documentation:function(){/* A one line summary of the $$DOC{ref:'Issue'}. */},
help:'A one line summary of the issue.'
},
{
model_:'Property',
name:'created',
type:'DateTime',
required:true,
displayWidth:50,
displayHeight:1,
factory:function(){return new Date();},
documentation:function(){/* When this $$DOC{ref:'Issue'}was created. */},
help:'When this issue was created.'
},
{
model_:'Property',
name:'createdBy',
type:'String',
defaultValue:'kgr',
required:true,
displayWidth:30,
displayHeight:1,
documentation:function(){/* Who created the $$DOC{ref:'Issue'}. */},
help:'Who created the issue.'
},
{
model_:'Property',
name:'assignedTo',
type:'String',
defaultValue:'kgr',
displayWidth:30,
displayHeight:1,
documentation:function(){/* Who the $$DOC{ref:'Issue'}is currently assigned to. */},
help:'Who the issue is currently assigned to.'
},
{
model_:'Property',
name:'notes',
displayWidth:75,
displayHeight:20,
view:'TextAreaView',
documentation:function(){/* Notes describing $$DOC{ref:'Issue'}. */},
help:'Notes describing issue.'
}
],
tests:[
{
model_:'UnitTest',
description:'test1',
code:function(){this.addHeader("header");this.ok("pass");this.fail("fail");}
}
]
});
(function(){
for(var i=0;i<Model.templates.length;i++)
Model.templates[i]=JSONUtil.mapToObj(X,Model.templates[i]);
(function(){
var a=Model.properties;
for(var i=0;i<a.length;i++){
if(!Property.isInstance(a[i])){
a[i]=Property.getPrototype().create(a[i]);
}
}
})();
})();
function recopyModelFeatures(m){
m.model_=Model;
m.methods=m.methods;
m.templates=m.templates;
m.relationships=m.relationships;
m.properties=m.properties;
m.actions=m.actions;
m.listeners=m.listeners;
m.models=m.models;
m.tests=m.tests;
m.issues=m.issues;
if(DEBUG)BootstrapModel.saveDefinition(m);
}
for(var id in USED_MODELS){
recopyModelFeatures(FOAM.lookup(id));
}
USED_MODELS['Model']=true;
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
package:'foam.ui',
name:'Window',
exports:[
'$$',
'$',
'addStyle',
'animate',
'cancelAnimationFrame',
'clearInterval',
'clearTimeout',
'console',
'document',
'dynamic',
'error',
'info',
'log',
'memento',
'registerModel_',
'requestAnimationFrame',
'setInterval',
'setTimeout',
'warn',
'window'
],
properties:[
{
model_:'StringProperty',
name:'name',
defaultValue:'window'
},
{
name:'window',
postSet:function(_,w){
if(this.X.subDocument)this.X.subDocument(w.document);
w.X=this.X;
this.document=w.document;
}
},
{
name:'document'
},
{
name:'installedModels',
lazyFactory:function(){
return this.document.installedModels||(this.document.installedModels={});
}
},
{
model_:'BooleanProperty',
name:'isBackground',
defaultValue:false
},
{
name:'console',
lazyFactory:function(){return this.window.console;}
},
{
name:'memento',
lazyFactory:function(){this.window.WindowHashValue.create({window:this.window});}
}
],
methods:{
registerModel_:function(model){
var X=this.X;
var document=this.document;
for(var m=model;m && m.getPrototype;m=m.extendsModel && this[m.extendsModel]){
if(this.installedModels[m.id])return;
this.installedModels[m.id]=true;
arequireModel(m)(function(m){
m.getPrototype().installInDocument(X,document);
});
}
},
addStyle:function(css){
if(!this.document||!this.document.createElement)return;
var s=this.document.createElement('style');
s.innerHTML=css;
this.document.head.appendChild(s);
},
log:function(){this.console.log.apply(this.console,arguments);},
warn:function(){this.console.warn.apply(this.console,arguments);},
info:function(){this.console.info.apply(this.console,arguments);},
error:function(){this.console.error.apply(this.console,arguments);},
$:function(id){
return(this.document.FOAM_OBJECTS && this.document.FOAM_OBJECTS[id])?
this.document.FOAM_OBJECTS[id]:
this.document.getElementById(id);
},
$$:function(cls){
return this.document.getElementsByClassName(cls);
},
dynamic:function(fn,opt_fn){
Events.dynamic(fn,opt_fn,this.X);
},
animate:function(duration,fn,opt_interp,opt_onEnd){
return Movement.animate(duration,fn,opt_interp,opt_onEnd,this.X);
},
setTimeout:function(f,t){
return this.window.setTimeout.apply(this.window,arguments);
},
clearTimeout:function(id){this.window.clearTimeout(id);},
setInterval:function(f,t){
return this.window.setInterval.apply(this.window,arguments);
},
clearInterval:function(id){this.window.clearInterval(id);},
requestAnimationFrame:function(f){
if(this.isBackground)return this.setTimeout(f,16);
console.assert(
this.window.requestAnimationFrame,
'requestAnimationFrame not defined');
return this.window.requestAnimationFrame(f);
},
cancelAnimationFrame:function(id){
if(this.isBackground){
this.clearTimeout(id);
return;
}
this.window.cancelAnimationFrame && this.window.cancelAnimationFrame(id);
}
}
});
foam.ui.Window.create(
{
window:window,
name:'DEFAULT WINDOW',
isBackground:typeof process==='object'
},
{__proto__:X,sub:function(){return X;}}
);
/**
* @license
* Copyright 2013 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
name:'SimpleValue',
properties:[{name:'value'}],
methods:{
init:function(value){this.value=value||"";},
get:function(){return this.value;},
set:function(val){this.value=val;},
toString:function(){return "SimpleValue("+this.value+")";}
}
});
CLASS({
name:'SimpleReadOnlyValue',
extendsModel:'SimpleValue',
documentation:"A simple value that can only be set during initialization.",
properties:[
{
name:'value',
preSet:function(old,nu){
if(typeof this.instance_.value=='undefined'){
return nu;
}
return old;
}
}
],
methods:{
set:function(val){
/* Only allow set once. The first initialized value is the only one. */
if(typeof this.instance_.value=='undefined'){
this.SUPER(val);
}
},
toString:function(){return "SimpleReadOnlyValue("+this.value+")";}
}
});
/**
* @license
* Copyright 2013 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
function KeyboardShortcutController(win,view){
this.contexts_={};
this.body_={};
this.processView_(view);
win.addEventListener('keydown',this.processKey_.bind(this));
}
KeyboardShortcutController.prototype.processView_=function(view){
var keyShortcuts=view.shortcuts;
if(keyShortcuts){
keyShortcuts.forEach(function(nav){
var key=nav[0];
var cb=nav[1];
var context=nav[2];
this.addAccelerator(key,cb,context);
}.bind(this));
}
try{
var children=view.children;
children.forEach(this.processView_.bind(this));
}catch(e){console.log(e);}
};
KeyboardShortcutController.prototype.addAccelerator=function(key,callback,context){
if(context){
if(typeof(context)!='string')
throw "Context must be an identifier for a DOM node.";
if(!(context in this.contexts_))
this.contexts_[context]={};
this.contexts_[context][key]=callback;
}else{
this.body_[key]=callback;
}
};
KeyboardShortcutController.prototype.shouldIgnoreKeyEventsForTarget_=function(event){
var target=event.target;
return target.isContentEditable||target.tagName=='INPUT'||target.tagName=='TEXTAREA';
};
KeyboardShortcutController.prototype.processKey_=function(event){
if(this.shouldIgnoreKeyEventsForTarget_(event))
return;
for(var node=event.target;node && node !=document.body;node=node.parentNode){
var id=node.id;
if(id &&(id in this.contexts_)){
var cbs=this.contexts_[id];
if(event.keyIdentifier in cbs){
var cb=cbs[event.keyIdentifier];
cb(event);
event.preventDefault();
return;
}
}
}
console.log('Looking for '+event.keyIdentifier);
if(event.keyIdentifier in this.body_){
var cb=this.body_[event.keyIdentifier];
cb(event);
event.preventDefault();
}
};
var DOM={
/** Instantiate FOAM Objects in a document. **/
init:function(X){
if(!X.document.FOAM_OBJECTS)X.document.FOAM_OBJECTS={};
var fs=X.document.querySelectorAll('foam');
var models=[];
for(var i=0;i<fs.length;i++){
var e=fs[i];
FOAM.lookup(e.getAttribute('view'),X);
FOAM.lookup(e.getAttribute('model'),X);
if(e.getAttribute('view'))models.push(arequire(e.getAttribute('view')));
if(e.getAttribute('model'))models.push(arequire(e.getAttribute('model')));
}
for(var key in USED_MODELS){
models.push(arequire(key));
}
atime('DOMInit',aseq(apar.apply(null,models),function(ret){
for(var i=0;i<fs.length;i++){
this.initElement(fs[i],X,X.document);
}
ret();
}.bind(this)))();
},
initElementChildren:function(e,X){
var a=[];
for(var i=0;i<e.children.length;i++){
var c=e.children[i];
if(c.tagName==='FOAM'){
a.push(DOM.initElement(c,X));
}
}
return a;
},
/** opt_document -- if supplied the object's view will be added to the document. **/
initElement:function(e,X,opt_document){
if(opt_document && !opt_document.body.contains(e))return;
var args={};
var modelName=e.getAttribute('model');
var model=FOAM.lookup(modelName,X);
if(!model){
console.error('Unknown Model:',modelName);
e.outerHTML='Unknown Model:'+modelName;
return;
}
model.getPrototype();
for(var i=0;i<e.attributes.length;i++){
var a=e.attributes[i];
var key=a.name;
var val=a.value;
var p=model.getProperty(key);
if(p){
if(val.startsWith('#')){
val=val.substring(1);
val=X.$(val);
}
args[key]=val;
}else{
if(!{model:true,view:true,id:true,oninit:true,showactions:true}[key]){
console.log('unknown attribute:',key);
}
}
}
function findProperty(name){
for(var j=0;j<model.properties.length;j++){
var p=model.properties[j];
if(p.name.toUpperCase()==name)return p;
}
return null;
}
var obj=model.create(undefined,X);
obj.fromElement(e);
var onLoad=e.getAttribute('oninit');
if(onLoad){
Function(onLoad).bind(obj)();
}
if(opt_document){
var viewName=e.getAttribute('view');
var view;
if(viewName){
var viewModel=FOAM.lookup(viewName,X);
view=viewModel.create({model:model,data:obj});
}
else if(View.isInstance(obj)||('CView' in GLOBAL && CView.isInstance(obj))){
view=obj;
}else if(obj.toView_){
view=obj.toView_();
}else{
var a=e.getAttribute('showActions');
var showActions=a?
a.equalsIC('y')||a.equalsIC('yes')||a.equalsIC('true')||a.equalsIC('t'):
true;
view=DetailView.create({model:model,data:obj,showActions:showActions})
}
if(e.id)opt_document.FOAM_OBJECTS[e.id]=obj;
obj.view_=view;
e.outerHTML=view.toHTML();
view.initHTML();
}
return obj;
},
setClass:function(e,className,opt_enabled){
var oldClassName=e.className||'';
var enabled=opt_enabled===undefined?true:opt_enabled;
e.className=oldClassName.replace(' '+className,'').replace(className,'');
if(enabled)e.className=e.className+' '+className;
}
};
window &&
window.addEventListener &&
window.addEventListener('load',function(){DOM.init(X);},false);
/** Convert a style size to an Int. Ex. '10px' to 10. **/
function toNum(p){return p.replace?parseInt(p.replace('px','')):p;};
CLASS({
name:'View',
label:'View',
traits:['foam.patterns.ChildTreeTrait'],
documentation:function(){/*
<p>$$DOC{ref:'View',usePlural:true}render data. This could be a specific
$$DOC{ref:'Model'}or a $$DOC{ref:'DAO'}. In the case of $$DOC{ref:'DetailView'},
<em>any</em>$$DOC{ref:'Model'}can be rendered by walking through the
$$DOC{ref:'Property',usePlural:true}of the data.
</p>
<p>$$DOC{ref:'View'}instances are arranged in a tree with parent-child links.
This represents containment in most cases,where a sub-view appears inside
its parent.
</p>
<p>HTML $$DOC{ref:'View',usePlural:true}should provide a $$DOC{ref:'.toInnerHTML'}
$$DOC{ref:'Method'}or $$DOC{ref:'Template'}. If direct control is required,
at minimum you must implement $$DOC{ref:'.toHTML'}and $$DOC{ref:'.initHTML'}.
</p>
*/},
properties:[
{
name:'id',
label:'Element ID',
type:'String',
factory:function(){return this.instance_.id||this.nextID();},
documentation:function(){/*
The DOM element id for the outermost tag of
this $$DOC{ref:'View'}.
*/}
},
{
name:'shortcuts',
type:'Array[Shortcut]',
factory:function(){return [];},
documentation:function(){/*
Keyboard shortcuts for the view. TODO???
*/}
},
{
name:'$',
hidden:true,
mode:"read-only",
getter:function(){
return this.X.document.getElementById(this.id);
},
help:'DOM Element.'
},
{
name:'tagName',
defaultValue:'span',
documentation:function(){/*
The HTML tag name to use for HTML $$DOC{ref:'View',usePlural:true}.
*/}
},
{
name:'className',
help:'CSS class name(s),space separated.',
defaultValue:'',
documentation:function(){/*
The CSS class names to use for HTML $$DOC{ref:'View',usePlural:true}.
Separate class names with spaces. Each instance of a $$DOC{ref:'View'}
may have different classes specified.
*/}
},
{
name:'tooltip'
},
{
name:'tabIndex'
},
{
name:'extraClassName',
defaultValue:'',
documentation:function(){/*
For custom $$DOC{ref:'View',usePlural:true},you may wish to add standard
CSS classes in addition to user-specified ones. Set those here and
they will be appended to those from $$DOC{ref:'.className'}.
*/}
},
{
model_:'BooleanProperty',
name:'showActions',
defaultValue:false,
postSet:function(oldValue,showActions){
if(!oldValue && showActions){
this.addDecorator(this.X.ActionBorder.create());
}
},
documentation:function(){/*
If $$DOC{ref:'Action',usePlural:true}are set on this $$DOC{ref:'View'},
this property enables their automatic display in an $$DOC{ref:'ActionBorder'}.
If you do not want to show $$DOC{ref:'Action',usePlural:true}or want
to show them in a different way,leave this false.
*/}
},
{
name:'propertyViewProperty',
type:'Property',
defaultValueFn:function(){return this.X.Property.VIEW;}
},
{
name:'initializers_',
factory:function(){return [];},
documentation:function(){/*
When creating new HTML content,intializers are run. This corresponds
to the lifecycle of the HTML(which may be replaced by toHTML()at any
time),not the lifecycle of this $$DOC{ref:'View'}.
*/}
},
{
name:'destructors_',
factory:function(){return [];},
documentation:function(){/*
When destroying HTML content,destructors are run. This corresponds
to the lifecycle of the HTML(which may be replaced by toHTML()at any
time),not the lifecycle of this $$DOC{ref:'View'}.
*/}
}
],
listeners:[
{
name:'openTooltip',
code:function(e){
console.assert(!this.tooltip_,'Tooltip already defined');
this.tooltip_=this.X.Tooltip.create({
text:this.tooltip,
target:this.$
});
}
},
{
name:'closeTooltip',
code:function(e){
if(this.tooltip_){
this.tooltip_.close();
this.tooltip_=null;
}
}
},
{
name:'onKeyboardShortcut',
code:function(evt){
var action=this.keyMap_[this.evtToKeyCode(evt)];
if(action){
action();
evt.preventDefault();
evt.stopPropagation();
}
},
documentation:function(){/*
Automatic mapping of keyboard events to $$DOC{ref:'Action'}trigger.
To handle keyboard shortcuts,create and attach $$DOC{ref:'Action',usePlural:true}
to your $$DOC{ref:'View'}.
*/}
}
],
constants:{
ON_HIDE:['onHide'],
ON_SHOW:['onShow']
},
methods:{
toView_:function(){return this;},
strToHTML:function(str){
/*
Escape the string to make it HTML safe.
*/
return XMLUtil.escape(str.toString())
},
cssClassAttr:function(){
/*
Returns the full CSS class to use for the $$DOC{ref:'View'}DOM element.
*/
if(!this.className && !this.extraClassName)return '';
var s=' class="';
if(this.className){
s +=this.className
if(this.extraClassName)s +=' ';
}
if(this.extraClassName)s +=this.extraClassName;
return s+'"';
},
dynamicTag:function(tagName,f){
/*
Creates a dynamic HTML tag whose content will be automatically updated.
*/
var id=this.nextID();
this.addInitializer(function(){
this.X.dynamic(function(){
var html=f();
var e=this.X.$(id);
if(e)e.innerHTML=html;
}.bind(this));
}.bind(this));
return '<'+tagName+' id="'+id+'"></'+tagName+'>';
},
bindSubView:function(view,prop){
/*
Bind a sub-$$DOC{ref:'View'}to a $$DOC{ref:'Property'}of this.
*/
view.setValue(this.propertyValue(prop.name));
},
viewModel:function(){
/* The $$DOC{ref:'Model'}definition of this $$DOC{ref:'View'}. */
return this.model_;
},
createView:function(prop,opt_args){
/* Creates a sub-$$DOC{ref:'View'}from $$DOC{ref:'Property'}info. */
var X=(opt_args && opt_args.X)||this.X;
var v=X.PropertyView.create({prop:prop,args:opt_args},X);
this.addChild(v);
return v;
},
createActionView:function(action,opt_args){
/* Creates a sub-$$DOC{ref:'View'}from $$DOC{ref:'Property'}info
specifically for $$DOC{ref:'Action',usePlural:true}. */
var X=(opt_args && opt_args.X)||this.X;
var modelName=opt_args && opt_args.model_?
opt_args.model_:
'ActionButton';
var v=X[modelName].create({action:action}).copyFrom(opt_args);
this[action.name+'View']=v;
return v;
},
createRelationshipView:function(r,opt_args){
var X=(opt_args && opt_args.X)||this.X;
return X.RelationshipView.create({
relationship:r,
args:opt_args
});
},
createTemplateView:function(name,opt_args){
/*
Used by the $$DOC{ref:'Template',text:'$$propName'}sub-$$DOC{ref:'View'}
creation tag in $$DOC{ref:'Template',usePlural:true}.
*/
var o=this.model_[constantize(name)];
if(!o)throw 'Unknown View Name:'+name;
var args=opt_args;
if(Action.isInstance(o))
var v=this.createActionView(o,args);
else if(Relationship.isInstance(o))
v=this.createRelationshipView(o,args);
else
v=this.createView(o,args);
v.data=this;
return v;
},
focus:function(){
/* Cause the view to take focus. */
if(this.$ && this.$.focus)this.$.focus();
},
addChild:function(child){
/*
Maintains the tree structure of $$DOC{ref:'View',usePlural:true}. When
a sub-$$DOC{ref:'View'}is created,add it to the tree with this method.
*/
if(child.toView_)child=child.toView_();
if(this.children.indexOf(child)!=-1)return;
return this.SUPER(child);
},
addShortcut:function(key,callback,context){
/* Add a keyboard shortcut. */
this.shortcuts.push([key,callback,context]);
},
nextID:function(){
/* Convenience method to return unique DOM element ids. */
return "view" +(arguments.callee._nextId=(arguments.callee._nextId||0)+ 1);
},
addInitializer:function(f){
/* Adds a DOM initializer */
this.initializers_.push(f);
},
addDestructor:function(f){
/* Adds a DOM destructor. */
this.destructors_.push(f);
},
tapClick:function(){
},
on:function(event,listener,opt_id){
/*
<p>To create DOM event handlers,use this method to set up your listener:</p>
<p><code>this.on('click',this.myListener);</code></p>
*/
opt_id=opt_id||this.nextID();
listener=listener.bind(this);
if(event==='click' && this.X.gestureManager){
var self=this;
var manager=this.X.gestureManager;
var target=this.X.GestureTarget.create({
containerID:opt_id,
handler:{
tapClick:function(){
return listener({
preventDefault:function(){},
stopPropagation:function(){}
});
}
},
gesture:'tap'
});
manager.install(target);
this.addDestructor(function(){
manager.uninstall(target);
});
return opt_id;
}
this.addInitializer(function(){
var e=this.X.$(opt_id);
if(e)e.addEventListener(event,listener,false);
}.bind(this));
return opt_id;
},
setAttribute:function(attributeName,valueFn,opt_id){
/* Set a dynamic attribute on the DOM element. */
opt_id=opt_id||this.nextID();
valueFn=valueFn.bind(this);
this.addInitializer(function(){
this.X.dynamic(valueFn,function(){
var e=this.X.$(opt_id);
if(!e)throw EventService.UNSUBSCRIBE_EXCEPTION;
var newValue=valueFn(e.getAttribute(attributeName));
if(newValue==undefined)e.removeAttribute(attributeName);
else e.setAttribute(attributeName,newValue);
}.bind(this))
}.bind(this));
},
setClass:function(className,predicate,opt_id){
/* Set a dynamic CSS class on the DOM element. */
opt_id=opt_id||this.nextID();
predicate=predicate.bind(this);
this.addInitializer(function(){
this.X.dynamic(predicate,function(){
var e=this.X.$(opt_id);
if(!e)throw EventService.UNSUBSCRIBE_EXCEPTION;
DOM.setClass(e,className,predicate());
}.bind(this));
}.bind(this));
return opt_id;
},
setClasses:function(map,opt_id){
/* Set a map of dynamic CSS classes on the DOM element. Mapped as
className:predicate.*/
opt_id=opt_id||this.nextID();
var keys=Objects.keys(map);
for(var i=0;i<keys.length;i++){
this.setClass(keys[i],map[keys[i]],opt_id);
}
return opt_id;
},
insertInElement:function(name){
/* Insert this View's toHTML into the Element of the supplied name. */
var e=this.X.$(name);
e.innerHTML=this.toHTML();
this.initHTML();
},
write:function(document){
/* Write the View's HTML to the provided document and then initialize. */
document.writeln(this.toHTML());
this.initHTML();
},
updateHTML:function(){
/* Cause the HTML content to be recreated using a call to
$$DOC{ref:'.toInnerHTML'}. */
if(!this.$)return;
this.destroy();
this.construct();
},
construct:function(){/* rebuilds the children of the view */
this.SUPER();
if(!this.$)return;
this.$.innerHTML=this.toInnerHTML();
this.initInnerHTML();
},
toInnerHTML:function(){
/*<p>In most cases you can override this method to provide all of your HTML
content. Calling $$DOC{ref:'.updateHTML'}will cause this method to
be called again,regenerating your content. $$DOC{ref:'Template',usePlural:true}
are usually called from here,or you may create a
$$DOC{ref:'.toInnerHTML'}$$DOC{ref:'Template'}.</p>
<p>If you are generating your content here,you may also need to override
$$DOC{ref:'.initInnerHTML'}to create event handlers such as
<code>this.on('click')</code>. */
return '';
},
toHTML:function(){
/* Generates the complete HTML content of this view,including outermost
element. This element is managed by $$DOC{ref:'View'},so in most cases
you should use $$DOC{ref:'.toInnerHTML'}to generate your content. */
this.invokeDestructors();
return '<'+this.tagName+' id="'+this.id+'"'+this.cssClassAttr()+ '>' +
this.toInnerHTML()+
'</'+this.tagName+'>';
},
initHTML:function(){
/* This must be called once after your HTML content has been inserted into
the DOM. Calling $$DOC{ref:'.updateHTML'}will automatically call
$$DOC{ref:'.initHTML'}. */
this.initInnerHTML();
this.initKeyboardShortcuts();
this.maybeInitTooltip();
},
maybeInitTooltip:function(){
if(!this.tooltip)return;
this.$.addEventListener('mouseenter',this.openTooltip);
this.$.addEventListener('mouseleave',this.closeTooltip);
},
initInnerHTML:function(){
/* Initialize this View and all of it's children. Usually just call
$$DOC{ref:'.initHTML'}instead. When implementing a new $$DOC{ref:'View'}
and adding listeners(including<code>this.on('click')</code>)that
will be destroyed each time $$DOC{ref:'.toInnerHTML'}is called,you
will have to override this $$DOC{ref:'Method'}and add them here.
*/
this.invokeInitializers();
this.initChildren();
},
initChildren:function(){
/* Initialize all of the children. Usually just call
$$DOC{ref:'.initHTML'}instead. */
if(this.children){
for(var i=0;i<this.children.length;i++){
try{
this.children[i].initHTML();
}catch(x){
console.log('Error on View.child.initHTML',x,x.stack);
}
}
}
},
invokeInitializers:function(){
/* Calls all the DOM $$DOC{ref:'.initializers_'}. */
for(var i=0;i<this.initializers_.length;i++)this.initializers_[i]();
this.initializers_=[];
},
invokeDestructors:function(){
/* Calls all the DOM $$DOC{ref:'.destructors_'}. */
for(var i=0;i<this.destructors_.length;i++)this.destructors_[i]();
this.destructors_=[];
},
evtToKeyCode:function(evt){
/* Maps an event keycode to a string */
var s='';
if(evt.altKey)s +='alt-';
if(evt.ctrlKey)s +='ctrl-';
if(evt.shiftKey)s +='shift-';
if(evt.metaKey)s +='meta-';
s +=evt.keyCode;
return s;
},
initKeyboardShortcuts:function(){
/* Initializes keyboard shortcuts. */
var keyMap={};
var found=false;
var self=this;
function init(actions,opt_value){
actions.forEach(function(action){
for(var j=0;j<action.keyboardShortcuts.length;j++){
var key=action.keyboardShortcuts[j];
if(typeof key==='string' && key.length==1)
key=key.toUpperCase().charCodeAt(0);
keyMap[key]=opt_value?
function(){action.callIfEnabled(self.X,opt_value.get());}:
action.callIfEnabled.bind(action,self.X,self);
found=true;
}
});
}
init(this.model_.actions);
if(DetailView.isInstance(this)&&
this.model &&
this.model.actions)
init(this.model.actions,this.data$);
if(found){
console.assert(this.$,'View must define outer id when using keyboard shortcuts:'+this.name_);
this.keyMap_=keyMap;
this.$.parentElement.addEventListener('keydown',this.onKeyboardShortcut);
}
},
destroy:function(){
/* Cleans up the DOM when regenerating content. You should call this before
creating new HTML in your $$DOC{ref:'.toInnerHTML'}or $$DOC{ref:'.toHTML'}. */
this.invokeDestructors();
this.SUPER();
delete this.instance_.$;
},
close:function(){
/* Call when permanently closing the $$DOC{ref:'View'}. */
this.$ && this.$.remove();
this.destroy();
this.publish('closed');
}
}
});
CLASS({
name:'PropertyView',
extendsModel:'View',
documentation:function(){/*
Used by $$DOC{ref:'DetailView'}to generate a sub-$$DOC{ref:'View'}for one
$$DOC{ref:'Property'}. The $$DOC{ref:'View'}chosen can be based off the
$$DOC{ref:'Property.view',text:'Property.view'}value,the $$DOC{ref:'.innerView'}value,or
$$DOC{ref:'.args'}.model_.
*/},
properties:[
{
name:'prop',
type:'Property',
documentation:function(){/*
The $$DOC{ref:'Property'}for which to generate a $$DOC{ref:'View'}.
*/}
},
{
name:'propValue',
documentation:function(){/*
The value of the $$DOC{ref:'Property'}of $$DOC{ref:'.data'}.
*/},
},
{
name:'parent',
type:'View',
postSet:function(_,p){
if(p)p[this.prop.name+'View']=this.view;
if(this.view)this.view.parent=p;
},
documentation:function(){/*
The $$DOC{ref:'View'}to use as the parent container for the new
sub-$$DOC{ref:'View'}.
*/}
},
{
name:'data',
postSet:function(oldData,data){
this.unbindData(oldData);
this.bindData(data);
},
documentation:function(){/*
The data to feed into the new sub-$$DOC{ref:'View'}. The data set here
is linked bi-directionally to the $$DOC{ref:'View'}. Typically this
data is the property value.
*/}
},
{
name:'innerView',
help:'Override for prop.view',
documentation:function(){/*
The optional name of the desired sub-$$DOC{ref:'View'}. If not specified,
prop.$$DOC{ref:'Property.view'}is used.
*/}
},
{
name:'view',
type:'View',
documentation:function(){/*
The new sub-$$DOC{ref:'View'}generated for the given $$DOC{ref:'Property'}.
*/}
},
{
name:'args',
documentation:function(){/*
Optional arguments to be used for sub-$$DOC{ref:'View'}creation. args.model_
in particular specifies the exact $$DOC{ref:'View'}to use.
*/}
}
],
methods:{
init:function(){
/* Sets up the new sub-$$DOC{ref:'View'}immediately. */
this.SUPER();
if(this.args && this.args.model_){
var model=FOAM.lookup(this.args.model_,this.X);
console.assert(model,'Unknown View:'+this.args.model_);
if(this.args.model)this.prop.model=this.args.model;
var view=model.create(this.prop,this.X);
delete this.args.model_;
}else{
view=this.createViewFromProperty(this.prop);
}
view.copyFrom(this.args);
view.parent=this.parent;
view.prop=this.prop;
this.view=view;
this.bindData(this.data);
},
fromElement:function(e){
this.view.fromElement(e);
return this;
},
createViewFromProperty:function(prop){
/* Helper to determine the $$DOC{ref:'View'}to use. */
var viewName=this.innerView||prop.view
if(!viewName)return this.X.TextFieldView.create(prop);
if(typeof viewName==='string')return FOAM.lookup(viewName,this.X).create(prop);
if(viewName.model_ && typeof viewName.model_==='string')return FOAM(prop.view);
if(viewName.model_){var v=viewName.model_.create(viewName,this.X).copyFrom(prop);v.id=this.nextID();return v;}
if(viewName.factory_){
var v=FOAM.lookup(viewName.factory_,this.X).create(viewName,this.X).copyFrom(prop);
v.id=this.nextID();
return v;
}
if(typeof viewName==='function')return viewName(prop,this);
return viewName.create(prop);
},
unbindData:function(oldData){
/* Unbind the data from the old view. */
var view=this.view;
if(!view||!oldData||!oldData.model_)return;
var pValue=oldData.propertyValue(this.prop.name);
Events.unlink(pValue,view.data$);
},
bindData:function(data){
/* Bind data to the new view. */
var view=this.view;
if(!view||!data||!data.model_)return;
var pValue=data.propertyValue(this.prop.name);
Events.link(pValue,view.data$);
},
toHTML:function(){/* Passthrough to $$DOC{ref:'.view'}*/ return this.view.toHTML();},
toString:function(){/* Name info. */ return 'PropertyView('+this.prop.name+','+this.view+')';},
initHTML:function(){/* Passthrough to $$DOC{ref:'.view'}*/ this.view.initHTML();},
destroy:function(){/* Passthrough to $$DOC{ref:'.view'}*/
this.SUPER();
this.view.destroy();
}
}
});
CLASS({
name:'Tooltip',
extendsModel:'View',
properties:[
{
name:'text',
help:'Help text to be shown in tooltip.'
},
{
name:'target',
help:'Target element to provide tooltip for.'
},
{
name:'className',
defaultValue:'tooltip'
},
{
name:'closed',
defaultValue:false
}
],
templates:[
function CSS(){/*
.tooltip{
background:rgba(80,80,80,0.9);
border-radius:4px;
color:white;
font-size:10pt;
left:0;
padding:5px 8px;
position:absolute;
top:0;
visibility:hidden;
z-index:999;
-webkit-transform:translate3d(0,0,2px);
}
.tooltip.animated{
transition:top 0.5s ease-in-out;
visibility:visible;
}
.tooltip.fadeout{
opacity:0;
transition:opacity 0.5s ease-in-out;
}
*/}
],
methods:{
init:function(){
this.SUPER();
var document=this.X.document;
document.previousTooltip_=this;
this.X.setTimeout(function(){
if(this.closed)return;
if(document.previousTooltip_ !=this)return;
var div=document.createElement('div');
this.X.setTimeout(this.close.bind(this),5000);
div.className=this.className;
div.id=this.id;
div.innerHTML=this.toInnerHTML();
document.body.appendChild(div);
var s=this.X.window.getComputedStyle(div);
var pos=findViewportXY(this.target);
var screenHeight=this.X.document.body.clientHeight;
var scrollY=this.X.window.scrollY;
var above=pos[1] - scrollY>screenHeight / 2;
var left=pos[0] +(this.target.clientWidth - toNum(s.width))/ 2;
var maxLeft=this.X.document.body.clientWidth+this.X.window.scrollX - 15 - div.clientWidth;
var targetHeight=this.target.clientHeight||this.target.offsetHeight;
div.style.top=above?
pos[1] - targetHeight/2 - 4:
pos[1]+targetHeight/2+4;
div.style.left=Math.max(this.X.window.scrollX+15,Math.min(maxLeft,left));
DOM.setClass(div,'animated');
this.X.setTimeout(function(){
div.style.top=above?
pos[1] - targetHeight - 8:
pos[1]+targetHeight+8;
},10);
this.initHTML();
}.bind(this),800);
},
toInnerHTML:function(){return this.text;},
close:function(){
if(this.closed)return;
this.closed=true;
this.X.setTimeout(function(){
if(this.$){
this.X.setTimeout(this.$.remove.bind(this.$),1000);
DOM.setClass(this.$,'fadeout');
}
}.bind(this),500);
},
destroy:function(){
this.SUPER();
this.close();
}
}
});
var DomValue={
DEFAULT_EVENT:'change',
DEFAULT_PROPERTY:'value',
create:function(element,opt_event,opt_property){
if(!element){
throw "Missing Element in DomValue";
}
return{
__proto__:this,
element:element,
event:opt_event||this.DEFAULT_EVENT,
property:opt_property||this.DEFAULT_PROPERTY};
},
setElement:function(element){this.element=element;},
get:function(){return this.element[this.property];},
set:function(value){
if(this.element[this.property] !==value)
this.element[this.property]=value;
},
addListener:function(listener){
if(!this.event)return;
try{
this.element.addEventListener(this.event,listener,false);
}catch(x){
}
},
removeListener:function(listener){
if(!this.event)return;
try{
this.element.removeEventListener(this.event,listener,false);
}catch(x){
}
},
toString:function(){
return "DomValue("+this.event+","+this.property+")";
}
};
CLASS({
name:'DOMValue',
properties:[
{
name:'element',
required:true
},
{
name:'property',
defaultValue:'value'
},
{
name:'event',
defaultValue:'change'
},
{
name:'value',
postSet:function(_,value){this.element[this.property]=value;}
},
{
name:'firstListener_',
defaultValue:true
}
],
methods:{
init:function(){
this.SUPER();
this.value=this.element[this.property];
},
get:function(){return this.value;},
set:function(value){this.value=value;},
addListener:function(listener){
if(this.firstListener_){
if(this.event){
this.element.addEventListener(
this.event,
function(){debugger;/* TODO */},
false);
}
this.firstListener_=false;
}
this.value$.addListener(listener);
},
removeListener:function(listener){
this.value$.removeListener(listener);
},
toString:function(){
return 'DOMValue('+this.event+','+this.property+')';
}
}
});
CLASS({
name:'WindowHashValue',
properties:[
{
name:'window',
defaultValueFn:function(){return this.X.window;}
}
],
methods:{
get:function(){return this.window.location.hash?this.window.location.hash.substring(1):'';},
set:function(value){this.window.location.hash=value;},
addListener:function(listener){
this.window.addEventListener('hashchange',listener,false);
},
removeListener:function(listener){
this.window.removeEventListener('hashchange',listener,false);
},
toString:function(){return "WindowHashValue("+this.get()+ ")";}
}
});
X.memento=X.WindowHashValue.create();
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
name:'StaticHTML',
extendsModel:'View',
properties:[
{
model_:'StringProperty',
name:'content'
},
{
model_:'BooleanProperty',
name:'escapeHTML',
defaultValue:false
}
],
methods:{
toHTML:function(){
if(this.escapeHTML){
return this.strToHTML(this.content);
}
return this.content;
}
}
});
CLASS({
name:'MenuSeparator',
extendsModel:'StaticHTML',
properties:[
{
name:'content',
defaultValue:'<hr class="menuSeparator">'
}
]
});
CLASS({
name:'BlobImageView',
extendsModel:'View',
help:'Image view for rendering a blob as an image.',
properties:[
{
name:'data',
postSet:function(){this.onValueChange();}
},
{
model_:'IntProperty',
name:'displayWidth'
},
{
model_:'IntProperty',
name:'displayHeight'
}
],
methods:{
toHTML:function(){
return '<img id="'+this.id+'">';
},
initHTML:function(){
this.SUPER();
var self=this;
this.$.style.width=self.displayWidth;
this.$.style.height=self.displayHeight;
this.onValueChange();
}
},
listeners:[
{
name:'onValueChange',
code:function(){
if(this.data && this.$)
this.$.src=URL.createObjectURL(this.data);
}
}
]
});
CLASS({
name:'TextFieldView',
label:'Text Field',
extendsModel:'View',
documentation:function(){/*
The default $$DOC{ref:'View'}for a string. Supports autocomplete
when an autocompleter is installed in $$DOC{ref:'.autocompleter'}.
*/},
properties:[
{
model_:'StringProperty',
name:'name',
defaultValue:'field',
documentation:function(){/* The name of the field. */}
},
{
model_:'IntProperty',
name:'displayWidth',
defaultValue:30,
documentation:function(){/* The width to fix the HTML text box. */}
},
{
model_:'IntProperty',
name:'displayHeight',
defaultValue:1,
documentation:function(){/* The height to fix the HTML text box. */}
},
{
model_:'StringProperty',
name:'type',
defaultValue:'text',
documentation:function(){/* The type of field to create. */}
},
{
model_:'StringProperty',
name:'placeholder',
defaultValue:undefined,
documentation:function(){/* Placeholder to use when empty. */}
},
{
model_:'BooleanProperty',
name:'onKeyMode',
help:'If true,value is updated on each keystroke.',
documentation:function(){/* If true,value is updated on each keystroke. */}
},
{
model_:'BooleanProperty',
name:'escapeHTML',
defaultValue:true,
help:'If true,HTML content is escaped in display mode.',
documentation:function(){/* If true,HTML content is escaped in display mode. */}
},
{
model_:'StringProperty',
name:'mode',
defaultValue:'read-write',
view:{factory_:'ChoiceView',choices:['read-only','read-write','final']},
documentation:function(){/* Can be 'read-only','read-write' or 'final'. */}
},
{
model_:'BooleanProperty',
name:'required',
documentation:'If value is required.'
},
{
model_:'StringProperty',
name:'pattern',
documentation:'Regex pattern for value.'
},
{
name:'domValue',
hidden:true
},
{
name:'data',
documentation:function(){/* The object to bind to the user's entered text. */}
},
{
model_:'StringProperty',
name:'readWriteTagName',
defaultValueFn:function(){
return this.displayHeight===1?'input':'textarea';
},
hidden:true
},
{
model_:'BooleanProperty',
name:'autocomplete',
defaultValue:true,
documentation:function(){/* Set to true to enable autocomplete. */}
},
{
name:'autocompleter',
documentation:function(){/* The autocompleter model to use. */}
},
{
name:'autocompleteView',
documentation:function(){/* The autocomplete view created. */}
}
],
constants:{
/** Escape topic published when user presses 'escape' key to abort edits. **/
ESCAPE:['escape']
},
methods:{
toHTML:function(){
/* Selects read-only versus read-write DOM output */
return this.mode==='read-write'?
this.toReadWriteHTML():
this.toReadOnlyHTML();
},
toReadWriteHTML:function(){
/* Supplies the correct element for read-write mode */
var str='<'+this.readWriteTagName+' id="'+this.id+'"';
str +=' type="'+this.type+'" '+this.cssClassAttr();
this.on('click',this.onClick,this.id);
str +=this.readWriteTagName==='input'?
' size="'+this.displayWidth+'"':
' rows="'+this.displayHeight+'" cols="'+this.displayWidth+'"';
if(this.required)str +=' required';
if(this.pattern)str +=' pattern="'+this.pattern+'"';
str +=this.extraAttributes();
str +=' name="'+this.name+'">';
str +='</'+this.readWriteTagName+'>';
return str;
},
extraAttributes:function(){return '';},
toReadOnlyHTML:function(){
/* Supplies the correct element for read-only mode */
var self=this;
this.setClass('placeholder',function(){return self.data==='';},this.id);
return '<'+this.tagName+' id="'+this.id+'"'+this.cssClassAttr()+ ' name="'+this.name+'"></'+this.tagName+'>';
},
setupAutocomplete:function(){
/* Initializes autocomplete,if $$DOC{ref:'.autocomplete'}and
$$DOC{ref:'.autocompleter'}are set. */
if(!this.autocomplete||!this.autocompleter)return;
var view=this.autocompleteView=this.X.AutocompleteView.create({
autocompleter:this.autocompleter,
target:this
});
this.bindAutocompleteEvents(view);
},
onAutocomplete:function(data){
this.data=data;
},
bindAutocompleteEvents:function(view){
this.$.addEventListener('blur',function(){
view.publish('blur');
});
this.$.addEventListener('input',(function(){
view.autocomplete(this.textToValue(this.$.value));
}).bind(this));
this.$.addEventListener('focus',(function(){
view.autocomplete(this.textToValue(this.$.value));
}).bind(this));
},
initHTML:function(){
/* Connects key events. */
if(!this.$)return;
this.SUPER();
if(this.mode==='read-write'){
if(this.placeholder)this.$.placeholder=this.placeholder;
this.domValue=DomValue.create(
this.$,
this.onKeyMode?'input':'change');
Events.relate(
this.data$,
this.domValue,
this.valueToText.bind(this),
this.textToValue.bind(this),
this.onKeyMode);
if(this.onKeyMode)
this.$.addEventListener('blur',this.onBlur);
this.$.addEventListener('keydown',this.onKeyDown);
this.setupAutocomplete();
}else{
this.domValue=DomValue.create(
this.$,
'undefined',
this.escapeHTML?'textContent':'innerHTML');
Events.map(
this.data$,
this.domValue,
this.valueToText.bind(this))
}
},
textToValue:function(text){/* Passthrough */ return text;},
valueToText:function(value){/* Filters for read-only mode */
if(this.mode==='read-only')
return(value==='')?this.placeholder:value;
return value;
},
destroy:function(){/* Unlinks key handler. */
this.SUPER();
Events.unlink(this.domValue,this.data$);
}
},
listeners:[
{
name:'onKeyDown',
code:function(e){
if(e.keyCode==27 /* ESCAPE KEY */){
this.domValue.set(this.data);
this.publish(this.ESCAPE);
}else{
this.publish(['keydown'],e);
}
}
},
{
name:'onBlur',
code:function(e){
if(this.domValue.get()!==this.data)
this.domValue.set(this.data);
}
},
{
name:'onClick',
code:function(e){
this.$ && this.$.focus();
}
},
]
});
CLASS({
name:'TextAreaView',
extendsModel:'TextFieldView',
label:'Text-Area View',
properties:[
{
model_:'IntProperty',
name:'displayHeight',
defaultValue:5
},
{
model_:'IntProperty',
name:'displayWidth',
defaultValue:70
}
]
});
CLASS({
name:'ActionButton',
extendsModel:'View',
properties:[
{
name:'action',
postSet:function(old,nu){
old && old.removeListener(this.render)
nu.addListener(this.render);
}
},
{
name:'data'
},
{
name:'className',
factory:function(){return 'actionButton actionButton-'+this.action.name;}
},
{
name:'tagName',
defaultValue:'button'
},
{
name:'showLabel',
defaultValueFn:function(){return this.action.showLabel;}
},
{
name:'label',
defaultValueFn:function(){
return this.data?
this.action.labelFn.call(this.data,this.action):
this.action.label;
}
},
{
name:'iconUrl',
defaultValueFn:function(){return this.action.iconUrl;}
},
{
name:'tooltip',
defaultValueFn:function(){return this.action.help;}
}
],
listeners:[
{
name:'render',
isFramed:true,
code:function(){this.updateHTML();}
}
],
methods:{
toHTML:function(){
var superResult=this.SUPER();
var self=this;
this.on('click',function(){
self.action.callIfEnabled(self.X,self.data);
},this.id);
this.setAttribute('disabled',function(){
self.closeTooltip();
return self.action.isEnabled.call(self.data,self.action)?undefined:'disabled';
},this.id);
this.setClass('available',function(){
self.closeTooltip();
return self.action.isAvailable.call(self.data,self.action);
},this.id);
this.X.dynamic(function(){self.action.labelFn.call(self.data,self.action);self.updateHTML();});
return superResult;
},
toInnerHTML:function(){
var out='';
if(this.iconUrl){
out +='<img src="'+XMLUtil.escapeAttr(this.iconUrl)+ '">';
}
if(this.showLabel){
out +=this.label;
}
return out;
}
}
});
CLASS({
name:'ActionLink',
extendsModel:'ActionButton',
properties:[
{
name:'className',
factory:function(){return 'actionLink actionLink-'+this.action.name;}
},
{
name:'tagName',
defaultValue:'a'
}
],
methods:{
toHTML:function(){
var superResult=this.SUPER();
this.setAttribute('href',function(){return '#'},this.id);
return superResult;
},
toInnerHTML:function(){
if(this.action.iconUrl){
return '<img src="'+XMLUtil.escapeAttr(this.action.iconUrl)+ '" />';
}
if(this.action.showLabel){
return this.label;
}
}
}
});
/** Add Action Buttons to a decorated View. **/
/* TODO:
These are left over Todo's from the previous ActionBorder,not sure which still apply.
The view needs a standard interface to determine it's Model(getModel())
listen for changes to Model and change buttons displayed and enabled
isAvailable
*/
CLASS({
name:'ActionBorder',
methods:{
toHTML:function(border,delegate,args){
var str="";
str +=delegate.apply(this,args);
str +='<div class="actionToolbar">';
var actions=this.model_.actions;
for(var i=0;i<actions.length;i++){
var v=this.createActionView(actions[i]);
v.data=this;
str +=' '+v.toView_().toHTML()+ ' ';
this.addChild(v);
}
if(DetailView.isInstance(this)){
actions=this.model.actions;
for(var i=0;i<actions.length;i++){
var v=this.createActionView(actions[i]);
v.data$=this.data$;
str +=' '+v.toView_().toHTML()+ ' ';
this.addChild(v);
}
}
str +='</div>';
return str;
}
}
});
CLASS({
name:'AbstractNumberFieldView',
extendsModel:'TextFieldView',
abstractModel:true,
properties:[
{name:'type',defaultValue:'number'},
{name:'step'}
],
methods:{
extraAttributes:function(){
return this.step?' step="'+this.step+'"':'';
}
}
});
CLASS({
name:'FloatFieldView',
extendsModel:'AbstractNumberFieldView',
properties:[
{name:'precision',defaultValue:undefined}
],
methods:{
formatNumber:function(val){
if(!val)return '0';
val=val.toFixed(this.precision);
var i=val.length-1;
for(;i>0 && val.charAt(i)==='0';i--);
return val.substring(0,val.charAt(i)==='.'?i:i+1);
},
valueToText:function(val){
return this.hasOwnProperty('precision')?
this.formatNumber(val):
''+val;
},
textToValue:function(text){return parseFloat(text)||0;}
}
});
CLASS({
name:'IntFieldView',
extendsModel:'AbstractNumberFieldView',
methods:{
textToValue:function(text){return parseInt(text)||'0';},
valueToText:function(value){return value?value:'0';}
}
});
CLASS({
name:'UnitTestResultView',
extendsModel:'View',
properties:[
{
name:'data'
},
{
name:'test',
defaultValueFn:function(){return this.parent.data;}
}
],
templates:[
function toHTML(){/*
<br>
<div>Output:</div>
<pre>
<div class="output" id="<%=this.setClass('error',function(){return this.parent.data.failed;},this.id)%>">
</div>
</pre>
*/},
function toInnerHTML(){/*
<%=TextFieldView.create({data:this.data,mode:'read-only',escapeHTML:false})%>
*/}
],
methods:{
initHTML:function(){
this.SUPER();
var self=this;
this.preTest();
this.test.atest()(function(){
self.postTest();
self.X.asyncCallback && self.X.asyncCallback();
});
},
preTest:function(){
},
postTest:function(){
this.updateHTML();
}
}
});
CLASS({
name:'RegressionTestValueView',
extendsModel:'TextFieldView',
properties:[
{
name:'mode',
defaultValue:'read-only'
},
{
name:'escapeHTML',
defaultValue:false
}
]
});
CLASS({
name:'RegressionTestResultView',
label:'Regression Test Result View',
documentation:'Displays the output of a $$DOC{.ref:"RegressionTest"},either master or live.',
extendsModel:'UnitTestResultView',
properties:[
{
name:'masterView',
defaultValue:'RegressionTestValueView'
},
{
name:'liveView',
defaultValue:'RegressionTestValueView'
},
{
name:'masterID',
factory:function(){return this.nextID();}
},
{
name:'liveID',
factory:function(){return this.nextID();}
}
],
actions:[
{
name:'update',
label:'Update Master',
documentation:'Overwrite the old master output with the new. Be careful that the new result is legit!',
isEnabled:function(){return this.test.regression;},
action:function(){
this.test.master=this.test.results;
this.test.regression=false;
if(this.X.testUpdateListener)this.X.testUpdateListener();
}
}
],
templates:[
function toHTML(){/*
<br>
<div>Output:</div>
<table id="<%=this.setClass('error',function(){return this.test.regression;})%>">
<tbody>
<tr>
<th>Master</th>
<th>Live</th>
</tr>
<tr>
<td class="output" id="<%=this.setClass('error',function(){return this.test.regression;},this.masterID)%>">
<% this.masterView=FOAM.lookup(this.masterView,this.X).create({data$:this.test.master$});out(this.masterView);%>
</td>
<td class="output" id="<%=this.setClass('error',function(){return this.test.regression;},this.liveID)%>">
<% this.liveView=FOAM.lookup(this.liveView,this.X).create({data$:this.test.results$});out(this.liveView);%>
</td>
</tr>
</tbody>
</table>
$$update
*/}
]
});
CLASS({
name:'UITestResultView',
label:'UI Test Result View',
help:'Overrides the inner masterView and liveView for UITests.',
extendsModel:'UnitTestResultView',
properties:[
{
name:'liveView',
getter:function(){return this.X.$(this.liveID);}
},
{
name:'liveID',
factory:function(){return this.nextID();}
}
],
methods:{
preTest:function(){
var test=this.test;
var $=this.liveView;
test.append=function(s){$.insertAdjacentHTML('beforeend',s);};
test.X.render=function(v){
test.append(v.toHTML());
v.initHTML();
};
}
},
templates:[
function toHTML(){/*
<br>
<div>Output:</div>
<div class="output" id="<%=this.setClass('error',function(){return this.test.failed>0;},this.liveID)%>">
</div>
</div>
*/}
]
});
CLASS({
name:'FutureView',
extendsModel:'View',
documentation:'Expects a Future for a $$DOC{ref:"View"}. Shows a ' +
'$$DOC{ref:"SpinnerView"}until the future resolves.',
imports:[
'clearTimeout',
'setTimeout'
],
properties:[
{
model_:'ViewFactoryProperty',
name:'spinnerView',
documentation:'The view to use for the spinner. Defaults to SpinnerView.',
defaultValue:'SpinnerView'
},
{
name:'future',
required:true,
documentation:'The Future for this View. Returns a View.'
},
{
name:'timer',
hidden:true,
factory:function(){
return this.setTimeout(this.onTimer,500);
}
},
{
name:'spinner',
documentation:'The View instance for the spinner.'
},
{
name:'childView',
documentation:'The real child view passed in the Future.'
}
],
listeners:[
{
name:'onTimer',
documentation:'If the future resolves before the timer fires,the ' +
'timer gets canceled. Since it fired,we know to render the spinner.',
code:function(){
this.timer='';
this.spinner=this.spinnerView();
if(this.$){
this.$.outerHTML=this.spinner.toHTML();
this.spinner.initHTML();
}
}
},
{
name:'onFuture',
code:function(view){
if(this.timer)this.clearTimeout(this.timer);
var el;
if(this.spinner){
el=this.spinner.$;
this.spinner.destroy();
this.spinner='';
}else{
el=this.$;
}
this.childView=view;
el.outerHTML=view.toHTML();
view.initHTML();
}
}
],
methods:{
toHTML:function(){
if(this.childView)return this.childView.toHTML();
if(this.spinner)return this.spinner.toHTML();
return this.SUPER();
},
initHTML:function(){
if(this.childView)this.childView.initHTML();
if(this.spinner)this.spinner.initHTML();
this.SUPER();
(this.future.get||this.future)(this.onFuture);
},
destroy:function(){
if(this.spinner)this.spinner.destroy();
if(this.childView)this.childView.destroy();
}
}
});
CLASS({
name:'PopupView',
extendsModel:'View',
properties:[
{
name:'view',
type:'View',
},
{
name:'x'
},
{
name:'y'
},
{
name:'width',
defaultValue:undefined
},
{
name:'maxWidth',
defaultValue:undefined
},
{
name:'maxHeight',
defaultValue:undefined
},
{
name:'height',
defaultValue:undefined
}
],
methods:{
open:function(_,opt_delay){
if(this.$)return;
var document=this.X.document;
var div=document.createElement('div');
div.style.left=this.x+'px';
div.style.top=this.y+'px';
if(this.width)div.style.width=this.width+'px';
if(this.height)div.style.height=this.height+'px';
if(this.maxWidth)div.style.maxWidth=this.maxWidth+'px';
if(this.maxHeight)div.style.maxHeight=this.maxHeight+'px';
div.style.position='absolute';
div.id=this.id;
div.innerHTML=this.view.toHTML();
document.body.appendChild(div);
this.view.initHTML();
},
close:function(){
this.$ && this.$.remove();
},
destroy:function(){
this.SUPER();
this.close();
this.view.destroy();
}
}
});
CLASS({
name:'AutocompleteView',
extendsModel:'PopupView',
help:'Default autocomplete popup.',
properties:[
'closeTimeout',
'autocompleter',
'completer',
'current',
{
model_:'IntProperty',
name:'closeTime',
units:'ms',
help:'Time to delay the actual close on a .close call.',
defaultValue:200
},
{
name:'view',
postSet:function(prev,v){
if(prev){
prev.data$.removeListener(this.complete);
prev.choices$.removeListener(this.choicesUpdate);
}
v.data$.addListener(this.complete);
v.choices$.addListener(this.choicesUpdate);
}
},
{
name:'target',
postSet:function(prev,v){
prev && prev.unsubscribe(['keydown'],this.onKeyDown);
v.subscribe(['keydown'],this.onKeyDown);
}
},
{
name:'maxHeight',
defaultValue:400
},
{
name:'className',
defaultValue:'autocompletePopup'
}
],
methods:{
autocomplete:function(partial){
if(!this.completer){
var proto=FOAM.lookup(this.autocompleter,this.X);
this.completer=proto.create();
}
if(!this.view){
this.view=this.makeView();
}
this.current=partial;
this.open(this.target);
this.completer.autocomplete(partial);
},
makeView:function(){
return this.X.ChoiceListView.create({
dao:this.completer.autocompleteDao$Proxy,
extraClassName:'autocomplete',
orientation:'vertical',
mode:'final',
objToChoice:this.completer.f,
useSelection:true
});
},
init:function(args){
this.SUPER(args);
this.subscribe('blur',(function(){
this.close();
}).bind(this));
},
open:function(e,opt_delay){
if(this.closeTimeout){
this.X.clearTimeout(this.closeTimeout);
this.closeTimeout=0;
}
if(this.$){this.position(this.$.firstElementChild,e.$||e);return;}
var parentNode=e.$||e;
var document=parentNode.ownerDocument;
console.assert(this.X.document===document,'X.document is not global document');
var div=document.createElement('div');
var window=document.defaultView;
console.assert(this.X.window===window,'X.window is not global window');
parentNode.insertAdjacentHTML('afterend',this.toHTML().trim());
this.position(this.$.firstElementChild,parentNode);
this.initHTML();
},
close:function(opt_now){
if(opt_now){
if(this.closeTimeout){
this.X.clearTimeout(this.closeTimeout);
this.closeTimeout=0;
}
this.SUPER();
return;
}
if(this.closeTimeout)return;
var realClose=this.SUPER;
var self=this;
this.closeTimeout=this.X.setTimeout(function(){
self.closeTimeout=0;
realClose.call(self);
},this.closeTime);
},
position:function(div,parentNode){
var document=parentNode.ownerDocument;
var pos=findPageXY(parentNode);
var pageWH=[document.firstElementChild.offsetWidth,document.firstElementChild.offsetHeight];
if(pageWH[1] -(pos[1]+parentNode.offsetHeight)<(this.height||this.maxHeight||400)){
div.style.bottom=parentNode.offsetHeight;
document.defaultView.innerHeight - pos[1];
}
if(pos[2].offsetWidth - pos[0]<600)
div.style.left=600 - pos[2].offsetWidth;
else
div.style.left=-parentNode.offsetWidth;
if(this.width)div.style.width=this.width+'px';
if(this.height)div.style.height=this.height+'px';
if(this.maxWidth){
div.style.maxWidth=this.maxWidth+'px';
div.style.overflowX='auto';
}
if(this.maxHeight){
div.style.maxHeight=this.maxHeight+'px';
div.style.overflowY='auto';
}
}
},
listeners:[
{
name:'onKeyDown',
code:function(_,_,e){
if(!this.view)return;
if(e.keyCode===38 /* arrow up */){
this.view.index--;
this.view.scrollToSelection(this.$);
e.preventDefault();
}else if(e.keyCode===40 /* arrow down */){
this.view.index++;
this.view.scrollToSelection(this.$);
e.preventDefault();
}else if(e.keyCode===13 /* enter */){
this.view.commit();
e.preventDefault();
}
}
},
{
name:'complete',
code:function(){
this.target.onAutocomplete(this.view.data);
this.view=this.makeView();
this.close(true);
}
},
{
name:'choicesUpdate',
code:function(){
if(this.view &&
(this.view.choices.length===0||
(this.view.choices.length===1 &&
this.view.choices[0][1]===this.current))){
this.close(true);
}
}
}
],
templates:[
function toHTML(){/*
<span id="<%=this.id %>" style="position:relative"><div<%=this.cssClassAttr()%>style="position:absolute"><%=this.view %></div></span>
*/}
]
});
CLASS({
name:'ImageView',
extendsModel:'View',
properties:[
{
name:'data'
},
{
name:'className',
defaultValue:'imageView'
},
{
name:'backupImage'
},
{
name:'domValue',
postSet:function(oldValue,newValue){
oldValue && Events.unfollow(this.data$,oldValue);
newValue && Events.follow(this.data$,newValue);
}
},
{
name:'displayWidth',
postSet:function(_,newValue){
if(this.$){
this.$.style.width=newValue;
}
}
},
{
name:'displayHeight',
postSet:function(_,newValue){
if(this.$){
this.$.style.height=newValue;
}
}
}
],
methods:{
toHTML:function(){
var src=window.IS_CHROME_APP?
(this.backupImage?' src="'+this.backupImage+'"':''):
' src="'+this.data+'"';
return '<img '+this.cssClassAttr()+ ' id="'+this.id+'"'+src+'>';
},
isSupportedUrl:function(url){
url=url.trim().toLowerCase();
return url.startsWith('data:')||url.startsWith('blob:')||url.startsWith('filesystem:');
},
initHTML:function(){
this.SUPER();
if(this.backupImage)this.$.addEventListener('error',function(){
this.data=this.backupImage;
}.bind(this));
if(window.IS_CHROME_APP && !this.isSupportedUrl(this.data)){
var self=this;
var xhr=new XMLHttpRequest();
xhr.open("GET",this.data);
xhr.responseType='blob';
xhr.asend(function(blob){
if(blob){
self.$.src=URL.createObjectURL(blob);
}
});
}else{
this.domValue=DomValue.create(this.$,undefined,'src');
this.displayHeight=this.displayHeight;
this.displayWidth=this.displayWidth;
}
}
}
});
CLASS({
name:'DateFieldView',
label:'Date Field',
extendsModel:'TextFieldView',
properties:[
{
model_:'StringProperty',
name:'type',
defaultValue:'date'
}
],
methods:{
initHTML:function(){
this.domValue=DomValue.create(this.$,undefined,'valueAsDate');
Events.link(this.data$,this.domValue);
}
}
});
CLASS({
name:'DateTimeFieldView',
label:'Date-Time Field',
extendsModel:'View',
properties:[
{
model_:'StringProperty',
name:'name'
},
{
model_:'StringProperty',
name:'mode',
defaultValue:'read-write'
},
{
name:'domValue',
postSet:function(oldValue){
if(oldValue && this.value){
Events.unlink(oldValue,this.value);
}
}
},
{
name:'data',
}
],
methods:{
valueToDom:function(value){return value?value.getTime():0;},
domToValue:function(dom){return new Date(dom);},
toHTML:function(){
return(this.mode==='read-write')?
'<input id="'+this.id+'" type="datetime-local" name="'+this.name+'"/>':
'<span id="'+this.id+'" name="'+this.name+'" '+this.cssClassAttr()+ '></span>';
},
initHTML:function(){
this.SUPER();
this.domValue=DomValue.create(
this.$,
this.mode==='read-write'?'input':undefined,
this.mode==='read-write'?'valueAsNumber':'textContent');
Events.relate(
this.data$,
this.domValue,
this.valueToDom.bind(this),
this.domToValue.bind(this));
}
}
});
CLASS({
name:'RelativeDateTimeFieldView',
label:'Relative Date-Time Field',
extendsModel:'DateTimeFieldView',
properties:[
{name:'mode',defaultValue:'read-only'}
],
methods:{
valueToDom:function(value){
return value?value.toRelativeDateString():'';
}
}
});
CLASS({
name:'HTMLView',
label:'HTML Field',
extendsModel:'View',
properties:[
{
name:'name',
type:'String',
defaultValue:''
},
{
model_:'StringProperty',
name:'tag',
defaultValue:'span'
},
{
name:'data'
}
],
methods:{
toHTML:function(){
var s='<'+this.tag+' id="'+this.id+'"';
if(this.name)s+=' name="'+this.name+'"';
s +='></'+this.tag+'>';
return s;
},
initHTML:function(){
var e=this.$;
if(!e){
console.log('stale HTMLView');
return;
}
this.domValue=DomValue.create(e,undefined,'innerHTML');
if(this.mode==='read-write'){
Events.link(this.data$,this.domValue);
}else{
Events.follow(this.data$,this.domValue);
}
},
destroy:function(){
this.SUPER();
Events.unlink(this.domValue,this.data$);
}
}
});
CLASS({
name:'RoleView',
extendsModel:'View',
properties:[
{
name:'data'
},
{
name:'roleName',
type:'String',
defaultValue:''
},
{
name:'models',
type:'Array[String]',
defaultValue:[]
},
{
name:'selection'
},
{
name:'model',
type:'Model'
}
],
methods:{
initHTML:function(){
var e=this.$;
this.domValue=DomValue.create(e);
Events.link(this.data$,this.domValue);
},
toHTML:function(){
var str="";
str +='<select id="'+this.id+'" name="'+this.name+'" size='+this.size+'/>';
for(var i=0;i<this.choices.length;i++){
str +="\t<option>"+this.choices[i].toString()+ "</option>";
}
str +='</select>';
return str;
},
destroy:function(){
this.SUPER();
Events.unlink(this.domValue,this.data$);
}
}
});
CLASS({
name:'BooleanView',
extendsModel:'View',
properties:[
{
name:'data'
},
{
name:'name',
label:'Name',
type:'String',
defaultValue:'field'
}
],
methods:{
toHTML:function(){
return '<input type="checkbox" id="'+this.id+'" name="'+this.name+'"'+this.cssClassAttr()+ '/>';
},
initHTML:function(){
var e=this.$;
this.domValue=DomValue.create(e,'change','checked');
Events.link(this.data$,this.domValue);
},
destroy:function(){
this.SUPER();
Events.unlink(this.domValue,this.data$);
}
}
});
CLASS({
name:'ImageBooleanView',
extendsModel:'View',
properties:[
{
name:'name',
label:'Name',
type:'String',
defaultValue:''
},
{
name:'data',
postSet:function(){this.updateHTML();}
},
{
name:'trueImage'
},
{
name:'falseImage'
},
{
name:'trueClass'
},
{
name:'falseClass'
}
],
methods:{
image:function(){
return this.data?this.trueImage:this.falseImage;
},
toHTML:function(){
var id=this.id;
this.on('click',this.onClick,id);
return this.name?
'<img id="'+id+'" '+this.cssClassAttr()+ '" name="'+this.name+'">':
'<img id="'+id+'" '+this.cssClassAttr()+ '>';
},
initHTML:function(){
if(!this.$)return;
this.SUPER();
this.updateHTML();
},
updateHTML:function(){
if(!this.$)return;
this.$.src=this.image();
if(this.data){
this.trueClass && this.$.classList.add(this.trueClass);
this.falseClass && this.$.classList.remove(this.falseClass);
}else{
this.trueClass && this.$.classList.remove(this.trueClass);
this.falseClass && this.$.classList.add(this.falseClass);
}
},
},
listeners:[
{
name:'onClick',
code:function(e){
e.stopPropagation();
this.data=!this.data;
}
}
]
});
CLASS({
name:'CSSImageBooleanView',
extendsModel:'View',
properties:[
'data',
],
methods:{
initHTML:function(){
if(!this.$)return;
this.data$.addListener(this.update);
this.$.addEventListener('click',this.onClick);
},
toHTML:function(){
return '<span id="'+this.id+'" class="'+this.className+' ' +(this.data?'true':'')+ '">&nbsp;&nbsp;&nbsp;</span>';
}
},
listeners:[
{
name:'update',
code:function(){
if(!this.$)return;
DOM.setClass(this.$,'true',this.data);
}
},
{
name:'onClick',
code:function(e){
e.stopPropagation();
this.data=!this.data;
this.update();
}
}
]
});
CLASS({
name:'FunctionView',
extendsModel:'TextFieldView',
properties:[
{
name:'onKeyMode',
defaultValue:true
},
{
name:'displayWidth',
defaultValue:80
},
{
name:'displayHeight',
defaultValue:8
},
{
name:'errorView',
factory:function(){return TextFieldView.create({mode:'read-only'});}
}
],
methods:{
initHTML:function(){
this.SUPER();
this.errorView.initHTML();
this.errorView.$.style.color='red';
this.errorView.$.style.display='none';
},
toHTML:function(){
return this.errorView.toHTML()+ ' '+this.SUPER();
},
setError:function(err){
this.errorView.data=err||"";
this.errorView.$.style.display=err?'block':'none';
},
textToValue:function(text){
if(!text)return null;
try{
var ret=eval("("+text+")");
this.setError(undefined);
return ret;
}catch(x){
console.log("JS Error:",x,text);
this.setError(x);
return nop;
}
},
valueToText:function(value){
return value?value.toString():"";
}
}
});
CLASS({
name:'JSView',
extendsModel:'TextAreaView',
properties:[
{name:'displayWidth',defaultValue:100},
{name:'displayHeight',defaultValue:100}
],
methods:{
textToValue:function(text){
try{
return JSONUtil.parse(this.X,text);
}catch(x){
console.log("error");
}
return text;
},
valueToText:function(val){
return JSONUtil.pretty.stringify(val);
}
}
});
CLASS({
name:'XMLView',
label:'XML View',
extendsModel:'TextAreaView',
properties:[
{name:'displayWidth',defaultValue:100},
{name:'displayHeight',defaultValue:100}
],
methods:{
textToValue:function(text){
return this.val_;
return text;
},
valueToText:function(val){
this.val_=val;
return XMLUtil.stringify(val);
}
}
});
/** A display-only summary view. **/
CLASS({
name:'SummaryView',
extendsModel:'View',
properties:[
{
name:'model',
type:'Model'
},
{
name:'data'
}
],
methods:{
toHTML:function(){
return(this.model.getPrototype().toSummaryHTML||this.defaultToHTML).call(this);
},
defaultToHTML:function(){
this.children=[];
var model=this.model;
var obj=this.data;
var out=[];
out.push('<div id="'+this.id+'" class="summaryView">');
out.push('<table>');
for(var i=0;i<model.properties.length;i++){
var prop=model.properties[i];
if(prop.hidden)continue;
var value=obj[prop.name];
if(!value)continue;
out.push('<tr>');
out.push('<td class="label">'+prop.label+'</td>');
out.push('<td class="value">');
if(prop.summaryFormatter){
out.push(prop.summaryFormatter(this.strToHTML(value)));
}else{
out.push(this.strToHTML(value));
}
out.push('</td></tr>');
}
out.push('</table>');
out.push('</div>');
return out.join('');
}
}
});
/** A display-only on-line help view. **/
CLASS({
name:'HelpView',
extendsModel:'View',
properties:[
{
name:'model',
type:'Model'
}
],
methods:{
toHTML:function(){
var model=this.model;
var out=[];
out.push('<div id="'+this.id+'" class="helpView">');
out.push('<div class="intro">');
out.push(model.help);
out.push('</div>');
for(var i=0;i<model.properties.length;i++){
var prop=model.properties[i];
if(prop.hidden)continue;
out.push('<div class="label">');
out.push(prop.label);
out.push('</div><div class="text">');
if(prop.subType /*&& value instanceof Array*/ && prop.type.indexOf('[')!=-1){
var subModel=this.X[prop.subType];
var subView=HelpView.create({model:subModel});
if(subModel !=model)
out.push(subView.toHTML());
}else{
out.push(prop.help);
}
out.push('</div>');
}
out.push('</div>');
return out.join('');
}
}
});
CLASS({
name:'ToolbarView',
label:'Toolbar',
requires:[
'ActionButton',
'MenuSeparator'
],
extendsModel:'View',
properties:[
{
model_:'BooleanProperty',
name:'horizontal',
defaultValue:true
},
{
model_:'BooleanProperty',
name:'icons',
defaultValueFn:function(){
return this.horizontal;
}
},
{
name:'data'
},
{
name:'left'
},
{
name:'top'
},
{
name:'bottom'
},
{
name:'right'
},
{
name:'document'
},
{
model_:'BooleanProperty',
name:'openedAsMenu',
defaultValue:false
},
{
name:'tagName',
defaultValue:'div'
},
{
name:'className',
defaultValueFn:function(){return this.openedAsMenu?'ActionMenu':'ActionToolbar';}
}
],
methods:{
preButton:function(button){return ' ';},
postButton:function(){return this.horizontal?' ':'<br>';},
openAsMenu:function(){
var div=this.document.createElement('div');
this.openedAsMenu=true;
div.id=this.nextID();
div.className='ActionMenuPopup';
this.top?div.style.top=this.top:div.style.bottom=this.bottom;
this.left?div.style.left=this.left:div.style.right=this.right;
div.innerHTML=this.toHTML(true);
var self=this;
div.onclick=function(){self.close();};
div.onmouseout=function(e){
if(e.toElement.parentNode !=div && e.toElement.parentNode.parentNode !=div){
self.close();
}
};
this.document.body.appendChild(div);
this.initHTML();
},
close:function(){
if(!this.openedAsMenu)return this.SUPER();
this.openedAsMenu=false;
this.$.parentNode.remove();
this.destroy();
this.publish('closed');
},
toInnerHTML:function(){
var str='';
for(var i=0;i<this.children.length;i++){
str +=this.preButton(this.children[i])+
this.children[i].toHTML()+
(MenuSeparator.isInstance(this.children[i])?
'':this.postButton(this.children[i]));
}
return str;
},
initHTML:function(){
this.SUPER();
this.addShortcut('Right',function(e){
var i=0;
for(;i<this.children.length && e.target !=this.children[i].$;i++);
i=(i+1)% this.children.length;
this.children[i].$.focus();
}.bind(this),this.id);
this.addShortcut('Left',function(e){
var i=0;
for(;i<this.children.length && e.target !=this.children[i].$;i++);
i=(i+this.children.length - 1)% this.children.length;
this.children[i].$.focus();
}.bind(this),this.id);
},
addAction:function(a){
var view=this.ActionButton.create({action:a,data$:this.data$});
if(a.children.length>0){
var self=this;
view.action=a.clone();
view.action.action=function(){
var toolbar=this.X.ToolbarView.create({
data$:self.data$,
document:self.document,
left:view.$.offsetLeft,
top:view.$.offsetTop
});
toolbar.addActions(a.children);
toolbar.openAsMenu(view);
};
}
this.addChild(view);
},
addActions:function(actions){
actions.forEach(this.addAction.bind(this));
},
addSeparator:function(){
this.addChild(this.MenuSeparator.create());
}
}
});
CLASS({
name:'ProgressView',
extendsModel:'View',
properties:[
{
model_:'FloatProperty',
name:'data',
postSet:function(){this.updateValue();}
}
],
methods:{
toHTML:function(){
return '<progress value="25" id="'+this.id+'" max="100">25</progress>';
},
updateValue:function(){
var e=this.$;
e.value=parseInt(this.data);
},
initHTML:function(){
this.updateValue();
}
}
});
/*
var ArrayView={
create:function(prop){
console.assert(prop.subType,'Array properties must specify "subType".');
var view=DAOController.create({
model:GLOBAL[prop.subType]
});
return view;
}
};
*/
CLASS({
name:'Mouse',
properties:[
{
name:'x',
type:'int',
view:'IntFieldView',
defaultValue:0
},
{
name:'y',
type:'int',
view:'IntFieldView',
defaultValue:0
}
],
methods:{
connect:function(e){
e.addEventListener('mousemove',this.onMouseMove);
return this;
}
},
listeners:[
{
name:'onMouseMove',
isFramed:true,
code:function(evt){
this.x=evt.offsetX;
this.y=evt.offsetY;
}
}
]
});
CLASS({
name:'ViewChoice',
tableProperties:[
'label',
'view'
],
properties:[
{
name:'label',
type:'String',
displayWidth:20,
defaultValue:'',
help:"View's label."
},
{
model_:'ViewFactoryProperty',
name:'view',
type:'view',
defaultValue:'DetailView',
help:'View factory.'
}
]
});
CLASS({
name:'AlternateView',
extendsModel:'View',
properties:[
'data',
{
name:'dao',
getter:function(){return this.data;},
setter:function(dao){this.data=dao;}
},
{
model_:'ArrayProperty',
name:'views',
subType:'ViewChoice',
help:'View choices.'
},
{
name:'choice',
postSet:function(_,v){
this.view=v.view;
},
hidden:true
},
{
model_:'ViewFactoryProperty',
name:'view',
defaultValue:'View',
postSet:function(old,v){
if(!this.$)return;
this.removeAllChildren();
var view=this.view();
view.data=this.data;
this.addChild(view);
this.viewContainer.innerHTML=view.toHTML();
view.initHTML();
},
hidden:true
},
{
name:'mode',
getter:function(){return this.choice.label;},
setter:function(label){
for(var i=0;i<this.views.length;i++){
if(this.views[i].label===label){
var oldValue=this.mode;
this.choice=this.views[i];
this.propertyChange('mode',oldValue,label);
return;
}
}
}
},
{
model_:'ViewFactoryProperty',
name:'headerView',
defaultValue:'View'
},
{
model_:'DOMElementProperty',
name:'viewContainer'
}
],
templates:[
function choiceButton(_,i,length,choice){/*<%
var id=this.on('click',function(){self.choice=choice;});
this.setClass('mode_button_active',function(){return self.choice===choice;},id);
%><a id="<%=id %>" class="buttonify<%=i==0?' capsule_left':'' %><%=
i==length - 1?' capsule_right':'' %>"><%=choice.label %></a>*/},
function toHTML(){/*
<div id="<%=this.id %>" class="AltViewOuter column" style="margin-bottom:5px;">
<div class="altViewButtons rigid">
<%=this.headerView()%>
<% for(var i=0,choice;choice=this.views[i];i++){
this.choiceButton(out,i,this.views.length,choice);
}%>
</div>
<br/>
<div class="altView column" id="<%=this.viewContainer=this.nextID()%>"><%=this.view({data$:this.data$})%></div>
</div>
*/}
]
});
CLASS({
name:'SwipeAltView',
extendsModel:'View',
properties:[
{
name:'views',
type:'Array',
subType:'ViewChoice',
view:'ArrayView',
factory:function(){return [];},
help:'View Choices'
},
{
name:'index',
help:'The index of the currently selected view',
defaultValue:0,
preSet:function(old,nu){
if(nu<0)return 0;
if(nu>=this.views.length)return this.views.length - 1;
return nu;
},
postSet:function(oldValue,viewChoice){
this.views[oldValue].view().deepPublish(this.ON_HIDE);
this.snapToCurrent(Math.abs(oldValue - viewChoice));
},
hidden:true
},
{
name:'headerView',
help:'Optional View to be displayed in header.',
factory:function(){
return this.X.ChoiceListView.create({
choices:this.views.map(function(x){
return x.label;
}),
index$:this.index$,
className:'swipeAltHeader foamChoiceListView horizontal'
});
}
},
{
name:'data',
help:'Generic data field for the views. Proxied to all the child views.',
postSet:function(old,nu){
this.views.forEach(function(c){
c.view().data=nu;
});
}
},
{
name:'slider',
help:'Internal element which gets translated around',
hidden:true
},
{
name:'width',
help:'Set when we know the width',
hidden:true
},
{
name:'x',
help:'X coordinate of the translation',
hidden:true,
postSet:function(old,nu){
this.slider.style['-webkit-transform']='translate3d(-' +
nu+'px,0,0)';
}
},
{
name:'swipeGesture',
hidden:true,
transient:true,
factory:function(){
return this.X.GestureTarget.create({
containerID:this.id,
handler:this,
gesture:'horizontalScroll'
});
}
}
],
methods:{
init:function(){
this.SUPER();
var self=this;
this.views.forEach(function(choice,index){
if(index !=self.index)
choice.view().deepPublish(self.ON_HIDE);
});
this.views[this.index].view().deepPublish(this.ON_SHOW);
},
toHTML:function(){
var str=[];
var viewChoice=this.views[this.index];
if(this.headerView){
str.push(this.headerView.toHTML());
this.addChild(this.headerView);
}
str.push('<div id="'+this.id+'" class="swipeAltOuter">');
str.push('<div class="swipeAltSlider" style="width:100%">');
str.push('<div class="swipeAltInner" style="left:0px">');
str.push(viewChoice.view().toHTML());
str.push('</div>');
str.push('</div>');
str.push('</div>');
return str.join('');
},
initHTML:function(){
if(!this.$)return;
this.SUPER();
this.slider=this.$.children[0];
this.width=this.$.clientWidth;
var str=[];
for(var i=0;i<this.views.length;i++){
str.push('<div class="swipeAltInner"' +(i?' style="visibility:hidden;"':'')+ '>');
str.push(this.views[i].view().toHTML());
str.push('</div>');
}
this.slider.innerHTML=str.join('');
window.addEventListener('resize',this.resize,false);
this.X.gestureManager.install(this.swipeGesture);
var self=this;
window.setTimeout(function(){
self.resize();
self.views.forEach(function(choice){
choice.view().initHTML();
});
var vs=self.slider.querySelectorAll('.swipeAltInner');
for(var i=0;i<vs.length;i++)vs[i].style.visibility='';
},0);
},
destroy:function(){
this.SUPER();
this.X.gestureManager.uninstall(this.swipeGesture);
this.views.forEach(function(c){c.view().destroy();});
},
snapToCurrent:function(sizeOfMove){
var self=this;
var time=150+sizeOfMove * 150;
Movement.animate(time,function(evt){
self.x=self.index * self.width;
},Movement.ease(150/time,150/time),function(){
self.views[self.index].view().deepPublish(self.ON_SHOW);
})();
}
},
listeners:[
{
name:'resize',
isMerged:100,
code:function(){
if(!this.$){
window.removeEventListener('resize',this.resize,false);
return;
}
this.width=this.$.clientWidth;
var self=this;
var frame=window.requestAnimationFrame(function(){
self.x=self.index * self.width;
for(var i=0;i<self.slider.children.length;i++){
self.slider.children[i].style.left=(i * 100)+ '%';
self.slider.children[i].style.visibility='';
}
window.cancelAnimationFrame(frame);
});
}
},
{
name:'horizontalScrollMove',
code:function(dx,tx,x){
var x=this.index * this.width - tx;
if(x<0)x=0;
var maxWidth=(this.views.length - 1)* this.width;
if(x>maxWidth)x=maxWidth;
this.x=x;
}
},
{
name:'horizontalScrollEnd',
code:function(dx,tx,x){
if(Math.abs(tx)>this.width / 3){
if(tx<0){
this.index++;
}else{
this.index--;
}
}else{
this.snapToCurrent(1);
}
}
}
],
templates:[
function CSS(){/*
.swipeAltInner{
position:absolute;
top:0px;
height:100%;
width:100%;
}
.swipeAltOuter{
display:flex;
overflow:hidden;
min-width:240px;
width:100%;
height:100%;
}
.swipeAltSlider{
position:relative;
width:100%;
top:0px;
-webkit-transform:translate3d(0,0,0);
}
*/}
]
});
CLASS({
name:'GalleryView',
extendsModel:'SwipeAltView',
properties:[
{
name:'images',
required:true,
help:'List of image URLs for the gallery',
postSet:function(old,nu){
this.views=nu.map(function(src){
return ViewChoice.create({
view:GalleryImageView.create({source:src})
});
});
}
},
{
name:'height',
help:'Optionally set the height'
},
{
name:'headerView',
factory:function(){return null;}
}
],
methods:{
initHTML:function(){
this.SUPER();
var circlesDiv=document.createElement('div');
circlesDiv.classList.add('galleryCirclesOuter');
for(var i=0;i<this.views.length;i++){
var circle=document.createElement('div');
circle.classList.add('galleryCircle');
if(this.index==i)circle.classList.add('selected');
circlesDiv.appendChild(circle);
}
this.$.appendChild(circlesDiv);
this.$.classList.add('galleryView');
this.$.style.height=this.height;
this.index$.addListener(function(obj,prop,old,nu){
circlesDiv.children[old].classList.remove('selected');
circlesDiv.children[nu].classList.add('selected');
});
}
}
});
CLASS({
name:'GalleryImageView',
extendsModel:'View',
properties:[ 'source' ],
methods:{
toHTML:function(){
return '<img class="galleryImage" src="'+this.source+'" />';
}
}
});
CLASS({
name:'ModelAlternateView',
extendsModel:'AlternateView',
methods:{
init:function(){
this.views=FOAM([
{
model_:'ViewChoice',
label:'GUI',
view:'DetailView'
},
{
model_:'ViewChoice',
label:'JS',
view:'JSView'
},
{
model_:'ViewChoice',
label:'XML',
view:'XMLView'
},
{
model_:'ViewChoice',
label:'UML',
view:'XMLView'
},
{
model_:'ViewChoice',
label:'Split',
view:'SplitView'
}
]);
}
}
});
CLASS({
name:'StringArrayView',
extendsModel:'TextFieldView',
methods:{
findCurrentValues:function(){
var start=this.$.selectionStart;
var value=this.$.value;
var values=value.split(',');
var i=0;
var sum=0;
while(sum+values[i].length<start){
sum +=values[i].length+1;
i++;
}
return{values:values,i:i};
},
setValues:function(values,index){
this.domValue.set(this.valueToText(values)+ ',');
this.data=this.textToValue(this.domValue.get());
var isLast=values.length - 1===index;
var selection=0;
for(var i=0;i<=index;i++){
selection +=values[i].length+1;
}
this.$.setSelectionRange(selection,selection);
isLast && this.X.setTimeout((function(){
this.autocompleteView.autocomplete('');
}).bind(this),0);
},
onAutocomplete:function(data){
var current=this.findCurrentValues();
current.values[current.i]=data;
this.setValues(current.values,current.i);
},
bindAutocompleteEvents:function(view){
var self=this;
function onInput(){
var values=self.findCurrentValues();
view.autocomplete(values.values[values.i]);
}
this.$.addEventListener('input',onInput);
this.$.addEventListener('focus',onInput);
this.$.addEventListener('blur',function(){
view.publish('blur');
});
},
textToValue:function(text){return text===""?[]:text.replace(/\s/g,'').split(',');},
valueToText:function(value){return value?value.toString():"";}
}
});
CLASS({
name:'MultiLineStringArrayView',
extendsModel:'View',
properties:[
{
model_:'StringProperty',
name:'name'
},
{
model_:'StringProperty',
name:'type',
defaultValue:'text'
},
{
model_:'IntProperty',
name:'displayWidth',
defaultValue:30
},
{
model_:'BooleanProperty',
name:'onKeyMode',
defaultValue:true
},
{
model_:'BooleanProperty',
name:'autocomplete',
defaultValue:true
},
{
name:'data'
},
'autocompleter',
{
model_:'ArrayProperty',
subType:'MultiLineStringArrayView.RowView',
name:'inputs'
}
],
models:[
{
model_:'Model',
name:'RowView',
extendsModel:'View',
properties:[
'field',
{
name:'tagName',
defaultValue:'div'
}
],
methods:{
toInnerHTML:function(){
this.children=[this.field];
return this.field.toHTML()+ '<input type="button" id="' +
this.on('click',(function(){this.publish('remove');}).bind(this))+
'" class="multiLineStringRemove" value="X">';
}
}
}
],
methods:{
toHTML:function(){
var toolbar=ToolbarView.create({
data:this
});
toolbar.addActions([this.model_.ADD]);
this.children=[toolbar];
return '<div id="'+this.id+'"><div></div>' +
toolbar.toHTML()+
'</div>';
},
initHTML:function(){
this.SUPER();
this.data$.addListener(this.update);
this.update();
},
row:function(){
var view=this.model_.RowView.create({
field:this.X.TextFieldView.create({
name:this.name,
type:this.type,
displayWidth:this.displayWidth,
onKeyMode:this.onKeyMode,
autocomplete:this.autocomplete,
autocompleter:this.autocompleter
})
});
return view;
},
setValue:function(value){
this.value=value;
}
},
listeners:[
{
name:'update',
code:function(){
if(!this.$)return;
var inputs=this.inputs;
var inputElement=this.$.firstElementChild;
var newViews=[];
var data=this.data;
if(inputs.length>data.length){
for(var i=data.length;i<inputs.length;i++){
inputs[i].$.remove();
this.removeChild(inputs[i]);
}
inputs.length=data.length;
}else{
var extra="";
for(i=inputs.length;i<data.length;i++){
var view=this.row();
this.addChild(view);
newViews.push(view);
inputs.push(view);
view.subscribe('remove',this.onRemove);
view.field.data$.addListener(this.onInput);
extra +=view.toHTML();
}
if(extra)inputElement.insertAdjacentHTML('beforeend',extra);
}
for(i=0;i<data.length;i++){
if(inputs[i].field.data !==data[i])
inputs[i].field.data=data[i];
}
this.inputs=inputs;
for(i=0;i<newViews.length;i++)
newViews[i].initHTML();
}
},
{
name:'onRemove',
code:function(src){
var inputs=this.inputs;
for(var i=0;i<inputs.length;i++){
if(inputs[i]===src){
this.data=this.data.slice(0,i).concat(this.data.slice(i+1));
break;
}
}
}
},
{
name:'onInput',
code:function(e){
if(!this.$)return;
var inputs=this.inputs;
var newdata=[];
for(var i=0;i<inputs.length;i++){
newdata.push(inputs[i].field.data);
}
this.data=newdata;
}
}
],
actions:[
{
name:'add',
label:'Add',
action:function(){
this.data=this.data.pushF('');
}
}
]
});
CLASS({
extendsModel:'View',
name:'SplitView',
properties:[
{
name:'data'
},
{
name:'view1',
label:'View 1'
},
{
name:'view2',
label:'View 2'
}
],
methods:{
init:function(){
this.SUPER();
this.view1=DetailView.create({data$:this.data$});
this.view2=JSView.create({data$:this.data$});
},
toHTML:function(){
var str=[];
str.push('<table width=80%><tr><td width=40%>');
str.push(this.view1.toHTML());
str.push('</td><td>');
str.push(this.view2.toHTML());
str.push('</td></tr></table><tr><td width=40%>');
return str.join('');
},
initHTML:function(){
this.view1.initHTML();
this.view2.initHTML();
}
}
});
CLASS({
name:'ListValueView',
help:'Combines an input view with a value view for the edited value.',
extendsModel:'View',
properties:[
{
name:'valueView'
},
{
name:'inputView'
},
{
name:'placeholder',
postSet:function(_,newValue){
this.inputView.placeholder=newValue;
}
},
{
name:'data',
factory:function(){return [];}
}
],
methods:{
focus:function(){this.inputView.focus();},
toHTML:function(){
this.valueView.lastView=this.inputView;
return this.valueView.toHTML();
},
initHTML:function(){
this.SUPER();
this.valueView.data$=this.data$;
this.inputView.data$=this.data$;
this.valueView.initHTML();
}
}
});
CLASS({
name:'ArrayListView',
extendsModel:'View',
properties:[
{
name:'data',
postSet:function(oldValue,newValue){
this.update();
}
},
{
model_:'ModelProperty',
name:'listView'
},
{
model_:'ModelProperty',
name:'subType'
}
],
methods:{
toHTML:function(){
return '<div id="'+this.id+'"></div>';
},
initHTML:function(){
this.SUPER();
this.update();
}
},
listeners:[
{
name:'update',
isFramed:true,
code:function(){
if(!this.$)return;
this.$.innerHTML='';
var objs=this.data;
var children=new Array(objs.length);
for(var i=0;i<objs.length;i++){
var view=this.listView.create();
children[i]=view;
view.data=objs[i];
}
this.$.innerHTML=children.map(function(c){return c.toHTML();}).join('');
children.forEach(function(c){c.initHTML();});
}
}
]
});
CLASS({
name:'KeyView',
extendsModel:'View',
properties:[
{
name:'dao',
factory:function(){return this.X[this.subType+'DAO'];}
},
{name:'mode'},
{
name:'data',
postSet:function(_,value){
var self=this;
var subKey=FOAM.lookup(this.subKey,this.X);
var sink={put:function(o){self.innerData=o;}};
if(subKey.name==='id')this.dao.find(value,sink);
else this.dao.where(EQ(subKey,value)).limit(1).select(sink);
}
},
{
name:'innerData',
},
{name:'subType'},
{
name:'model',
defaultValueFn:function(){return this.X[this.subType];}
},
{name:'subKey'},
{
name:'innerView',
defaultValue:'DetailView'
},
],
methods:{
toHTML:function(){
this.children=[];
var view=FOAM.lookup(this.innerView).create({model:this.model,mode:this.mode,data$:this.innerData$});
this.addChild(view);
return view.toHTML();
}
}
});
CLASS({
name:'DAOKeyView',
extendsModel:'View',
properties:[
{
name:'dao',
factory:function(){return this.X[this.subType+'DAO'];}
},
{name:'mode'},
{
name:'data',
postSet:function(_,value){
var self=this;
var subKey=FOAM.lookup(this.subKey,this.X);
this.innerData=this.dao.where(IN(subKey,value));
}
},
{
name:'innerData',
},
{name:'subType'},
{
name:'model',
defaultValueFn:function(){return this.X[this.subType];}
},
{name:'subKey'},
{
name:'innerView',
defaultValue:'DAOListView'
},
'dataView'
],
methods:{
toHTML:function(){
this.children=[];
var view=FOAM.lookup(this.innerView).create({model:this.model,mode:this.mode,data$:this.innerData$});
this.addChild(view);
return view.toHTML();
}
}
});
CLASS({
name:'AutocompleteListView',
extendsModel:'View',
properties:[
{
name:'dao',
postSet:function(oldValue,newValue){
oldValue && oldValue.unlisten(this.paint);
newValue.listen(this.paint);
this.data='';
this.paint();
},
hidden:true
},
{
name:'data',
hidden:true
},
{
name:'model',
hidden:true
},
{
name:'innerView',
type:'View',
preSet:function(_,value){
if(typeof value==="string")value=GLOBAL[value];
return value;
},
defaultValueFn:function(){
return this.model.listView;
}
},
{
model_:'ArrayProperty',
name:'objs'
},
{
model_:'IntProperty',
name:'selection',
defaultValue:0,
postSet:function(oldValue,newValue){
this.data=this.objs[newValue];
if(this.$){
if(this.$.children[oldValue])
this.$.children[oldValue].className='autocompleteListItem';
this.$.children[newValue].className +=' autocompleteSelectedItem';
}
}
},
{
model_:'IntProperty',
name:'count',
defaultValue:20
},
{
model_:'IntProperty',
name:'left'
},
{
model_:'IntProperty',
name:'top'
},
],
methods:{
initHTML:function(){
this.SUPER();
this.$.style.display='none';
var self=this;
this.propertyValue('left').addListener(function(v){
self.$.left=v;
});
this.propertyValue('top').addListener(function(v){
self.$.top=v;
});
},
nextSelection:function(){
if(this.objs.length===0)return;
var next=this.selection+1;
if(next>=this.objs.length)
next=0;
this.selection=next;
},
prevSelection:function(){
if(this.objs.length===0)return;
var next=this.selection - 1;
if(next<0)
next=this.objs.length - 1;
this.selection=next;
}
},
templates:[
{
name:'toHTML',
template:'<ul class="autocompleteListView" id="<%=this.id %>"></ul>'
}
],
listeners:[
{
name:'paint',
isFramed:true,
code:function(){
if(!this.$)return;
var objs=[];
var newSelection=0;
var value=this.data;
var self=this;
this.dao.limit(this.count).select({
put:function(obj){
objs.push(obj);
if(obj.id===value.id)
newSelection=objs.length - 1;
},
eof:function(){
self.$.innerHTML='';
self.objs=objs;
if(objs.length===0){
self.$.style.display='none';
return;
}
for(var i=0;i<objs.length;i++){
var obj=objs[i];
var view=self.innerView.create({});
var container=document.createElement('li');
container.onclick=(function(index){
return function(e){
self.selection=index;
self.publish('selected');
};
})(i);
container.className='autocompleteListItem';
self.$.appendChild(container);
view.data=obj;
container.innerHTML=view.toHTML();
view.initHTML();
}
self.selection=newSelection;
self.$.style.display='';
}
});
}
}
]
});
CLASS({
name:'ViewSwitcher',
extendsModel:'View',
help:'A view which cycles between an array of views.',
properties:[
{
name:'views',
factory:function(){return [];},
postSet:function(){
this.viewIndex=this.viewIndex;
},
},
{
name:'data',
postSet:function(_,data){this.activeView.data=data;}
},
{
name:'activeView',
postSet:function(old,view){
if(old){
old.unsubscribe('nextview',this.onNextView);
old.unsubscribe('prevview',this.onPrevView);
}
view.subscribe('nextview',this.onNextView);
view.subscribe('prevview',this.onPrevView);
view.data=this.data;
}
},
{
model_:'IntProperty',
name:'viewIndex',
preSet:function(_,value){
if(value>=this.views.length)return 0;
if(value<0)return this.views.length - 1;
return value;
},
postSet:function(){
this.activeView=this.views[this.viewIndex];
}
}
],
methods:{
toHTML:function(){
return '<div id="'+this.id+'" style="display:none"></div>'+this.toInnerHTML();
},
updateHTML:function(){
if(!this.$)return;
this.$.nextElementSibling.outerHTML=this.toInnerHTML();
this.initInnerHTML();
},
toInnerHTML:function(){
return this.activeView.toHTML();
},
initInnerHTML:function(){
this.activeView.initInnerHTML();
}
},
listeners:[
{
name:'onNextView',
code:function(){
this.viewIndex=this.viewIndex+1;
this.updateHTML();
}
},
{
name:'onPrevView',
code:function(){
this.viewIndex=this.viewIndex - 1;
this.updateHTML();
}
}
]
});
CLASS({
name:'ListInputView',
extendsModel:'AbstractDAOView',
properties:[
{
name:'name'
},
{
name:'dao',
help:'The DAO to fetch autocomplete objects from.',
},
{
name:'property',
help:'The property model to map autocomplete objecst to values with.'
},
{
model_:'ArrayProperty',
name:'searchProperties',
help:'The properties with which to construct the autocomplete query with.'
},
{
name:'autocompleteView',
postSet:function(oldValue,newValue){
oldValue && oldValue.unsubscribe('selected',this.selected);
newValue.subscribe('selected',this.selected);
}
},
{
name:'placeholder',
postSet:function(oldValue,newValue){
if(this.$ && this.usePlaceholer)this.$.placeholder=newValue;
}
},
{
model_:'BooleanValue',
name:'usePlaceholder',
defaultValue:true,
postSet:function(_,newValue){
if(this.$)this.$.placeholder=newValue?
this.placeholder:'';
}
},
{
name:'data',
help:'The array value we are editing.',
factory:function(){return [];}
},
{
name:'domInputValue'
}
],
methods:{
toHTML:function(){
this.on('keydown',this.onKeyDown,this.id);
this.on('blur',this.framed(this.delay(200,this.framed(this.framed(this.onBlur)))),this.id);
this.on('focus',this.onInput,this.id);
return '<input name="'+this.name+'" type="text" id="'+this.id+'" class="listInputView">'+this.autocompleteView.toHTML();
},
initHTML:function(){
this.SUPER();
if(this.usePlaceholder && this.placeholder)
this.$.placeholder=this.placeholder;
this.autocompleteView.initHTML();
this.domInputValue=DomValue.create(this.$,'input');
this.domInputValue.addListener(this.onInput);
},
pushValue:function(v){
this.data=this.data.concat(v);
this.domInputValue.set('');
this.onInput();
},
popValue:function(){
var a=this.data.slice();
a.pop();
this.data=a;
}
},
listeners:[
{
name:'selected',
code:function(){
if(this.autocompleteView.data){
this.pushValue(
this.property.f(this.autocompleteView.data));
}
this.scrollContainer=e||window;
this.scrollContainer.addEventListener('scroll',this.onScroll,false);
}
},
{
name:'onInput',
code:function(){
var value=this.domInputValue.get();
if(value.charAt(value.length - 1)===','){
if(value.length>1)this.pushValue(value.substring(0,value.length - 1));
else this.domInputValue.set('');
return;
}
if(value===''){
this.autocompleteView.dao=[];
return;
}
var predicate=OR();
value=this.domInputValue.get();
for(var i=0;i<this.searchProperties.length;i++){
predicate.args.push(STARTS_WITH(this.searchProperties[i],value));
}
value=this.data;
if(value.length>0){
predicate=AND(NOT(IN(this.property,value)),predicate);
}
this.autocompleteView.dao=this.dao.where(predicate);
}
},
{
name:'onKeyDown',
code:function(e){
if(e.keyCode===40 /* down */){
this.autocompleteView.nextSelection();
e.preventDefault();
}else if(e.keyCode===38 /* up */){
this.autocompleteView.prevSelection();
e.preventDefault();
}else if(e.keyCode===13 /* RET */||e.keyCode===9 /* TAB */){
if(this.autocompleteView.data){
this.pushValue(
this.property.f(this.autocompleteView.data));
e.preventDefault();
}
}else if(e.keyCode===8 && this.domInputValue.get()===''){
this.popValue();
}
}
},
{
name:'onBlur',
code:function(e){
var value=this.domInputValue.get();
if(value.length>0){
this.pushValue(value);
}else{
this.domInputValue.set('');
}
this.autocompleteView.dao=[];
}
},
{
name:'onValueChange',
code:function(){
this.usePlaceholder=this.data.length==0;
}
}
]
});
/**
* The default vertical scrollbar view for a ScrollView. It appears during
* scrolling and fades out after scrolling stops.
*
* TODO:create a version that can respond to mouse input.
* TODO:a horizontal scrollbar. Either a separate view,or a generalization of
* this one.
*/
CLASS({
name:'VerticalScrollbarView',
extendsModel:'View',
properties:[
{
name:'scrollTop',
model_:'IntProperty',
postSet:function(old,nu){
this.show();
if(this.timeoutID)
clearTimeout(this.timeoutID);
if(!this.mouseOver){
this.timeoutID=setTimeout(function(){
this.timeoutID=0;
this.hide();
}.bind(this),200);
}
var maxScrollTop=this.scrollHeight - this.height;
if(maxScrollTop<=0)
return 0;
var ratio=this.scrollTop / maxScrollTop;
this.thumbPosition=ratio *(this.height - this.thumbHeight);
}
},
{
name:'scrollHeight',
model_:'IntProperty'
},
{
name:'mouseOver',
model_:'BooleanProperty',
defaultValue:false
},
{
name:'height',
model_:'IntProperty',
postSet:function(old,nu){
if(this.$){
this.$.style.height=nu+'px';
}
}
},
{
name:'width',
model_:'IntProperty',
defaultValue:12,
postSet:function(old,nu){
if(this.$){
this.$.style.width=nu+'px';
}
var thumb=this.thumb();
if(thumb){
thumb.style.width=nu+'px';
}
}
},
{
name:'thumbID',
factory:function(){
return this.nextID();
}
},
{
name:'thumbHeight',
dynamicValue:function(){
var id=this.thumbID;
var height=this.height;
if(!this.scrollHeight)
return 0;
return height * height / this.scrollHeight;
},
postSet:function(old,nu){
var thumb=this.thumb();
if(thumb){
thumb.style.height=nu+'px';
}
}
},
{
name:'thumbPosition',
defaultValue:0,
postSet:function(old,nu){
var old=this.oldThumbPosition_||old;
if(Math.abs(old-nu)<2.0)return;
var thumb=this.thumb();
if(thumb){
this.oldThumbPosition_=nu;
thumb.style.webkitTransform='translate3d(0px,'+nu+'px,0px)';
}
}
},
{
name:'lastDragY',
model_:'IntProperty'
}
],
methods:{
thumb:function(){return this.X.$(this.thumbID);},
initHTML:function(){
this.SUPER();
if(!this.$)return;
this.$.addEventListener('mouseover',this.onMouseEnter);
this.$.addEventListener('mouseout',this.onMouseOut);
this.$.addEventListener('click',this.onTrackClick);
this.thumb().addEventListener('mousedown',this.onStartThumbDrag);
this.thumb().addEventListener('click',function(e){e.stopPropagation();});
this.shown_=false;
},
show:function(){
if(this.shown_)return;
this.shown_=true;
var thumb=this.thumb();
if(thumb){
thumb.style.webkitTransition='';
thumb.style.opacity='0.3';
}
},
hide:function(){
if(!this.shown_)return;
this.shown_=false;
var thumb=this.thumb();
if(thumb){
thumb.style.webkitTransition='200ms opacity';
thumb.style.opacity='0';
}
},
maxScrollTop:function(){
return this.scrollHeight - this.height;
}
},
listeners:[
{
name:'onMouseEnter',
code:function(e){
this.mouseOver=true;
this.show();
}
},
{
name:'onMouseOut',
code:function(e){
this.mouseOver=false;
this.hide();
}
},
{
name:'onStartThumbDrag',
code:function(e){
this.lastDragY=e.screenY;
document.body.addEventListener('mousemove',this.onThumbDrag);
document.body.addEventListener('mouseup',this.onStopThumbDrag);
e.preventDefault();
}
},
{
name:'onThumbDrag',
code:function(e){
if(this.maxScrollTop()<=0)
return;
var dy=e.screenY - this.lastDragY;
var newScrollTop=this.scrollTop +(this.maxScrollTop()* dy)/(this.height - this.thumbHeight);
this.scrollTop=Math.min(this.maxScrollTop(),Math.max(0,newScrollTop));
this.lastDragY=e.screenY;
e.preventDefault();
}
},
{
name:'onStopThumbDrag',
code:function(e){
document.body.removeEventListener('mousemove',this.onThumbDrag);
document.body.removeEventListener('mouseup',this.onStopThumbDrag,true);
e.preventDefault();
}
},
{
name:'onTrackClick',
code:function(e){
if(this.maxScrollTop()<=0)
return;
var delta=this.height;
if(e.clientY<this.thumbPosition)
delta *=-1;
var newScrollTop=this.scrollTop+delta;
this.scrollTop=Math.min(this.maxScrollTop(),Math.max(0,newScrollTop));
}
}
],
templates:[
function toHTML(){/*
<div id="%%id" style="position:absolute;
width:<%=this.width %>px;
height:<%=this.height %>px;
right:0px;
background:rgba(0,0,0,0.1);
z-index:2;">
<div id="%%thumbID" style="
opacity:0;
position:absolute;
width:<%=this.width %>px;
background:#333;">
</div>
</div>
*/}
]
});
CLASS({
name:'ActionSheetView',
extendsModel:'View',
traits:['PositionedDOMViewTrait'],
properties:[
'actions',
'data',
{name:'className',defaultValue:'actionSheet'},
{name:'preferredWidth',defaultValue:200},
],
help:'A controller that shows a list of actions.',
templates:[
function toInnerHTML(){/*
<% for(var i=0,action;action=this.actions[i];i++){
var view=this.createActionView(action);
view.data$=this.data$;
out(view);
}%>
*/},
function CSS(){/*
.actionSheet{
background:white;
}
*/}
]
});
CLASS({
extendsModel:'View',
name:'CollapsibleView',
properties:[
{
name:'data'
},
{
name:'fullView',
preSet:function(old,nu){
if(old){
this.removeChild(old);
Events.unlink(old.data$,this.data$);
}
return nu;
},
postSet:function(){
if(this.fullView.data$)
{
this.addChild(this.fullView);
this.fullView.data$=this.data$;
}
this.updateHTML();
}
},
{
name:'collapsedView',
preSet:function(old,nu){
if(old){
this.removeChild(old);
Events.unlink(old.data$,this.data$);
}
return nu;
},
postSet:function(){
if(this.collapsedView.data$)
{
this.addChild(this.collapsedView);
this.collapsedView.data$=this.data$;
}
this.updateHTML();
}
},
{
name:'collapsed',
defaultValue:true,
postSet:function(){
if(this.collapsed){
this.collapsedView.$.style.height="";
this.fullView.$.style.height="0";
}else{
this.collapsedView.$.style.height="0";
this.fullView.$.style.height="";
}
}
}
],
methods:{
toInnerHTML:function(){
var retStr=this.collapsedView.toHTML()+ this.fullView.toHTML();
return retStr;
},
initHTML:function(){
this.SUPER();
this.collapsedView.$.style.display="block";
this.fullView.$.style.display="block";
this.collapsedView.$.style.overflow="hidden";
this.fullView.$.style.overflow="hidden";
this.collapsed=true;
}
},
actions:[
{
name:'toggle',
help:'Toggle collapsed state.',
labelFn:function(){
return this.collapsed?'Expand':'Hide';
},
isAvailable:function(){
return true;
},
isEnabled:function(){
return true;//this.collapsedView.toHTML && this.fullView.toHTML;
},
action:function(){
this.collapsed=!this.collapsed;
}
},
]
});
CLASS({
name:'SimpleDynamicViewTrait',
properties:[
{name:'data',postSet:function(){this.updateHTML();}}
],
methods:{
updateHTML:function(){
if(!this.$)return;
this.$.outerHTML=this.toHTML();
this.initHTML();
}
}
});
CLASS({
name:'SpinnerView',
extendsModel:'View',
documentation:'Renders a spinner in the Material Design style. Has a ' +
'$$DOC{ref:".data"}property and acts like a $$DOC{ref:"BooleanView"},' +
'that creates and destroys and the spinner when the value changes.',
properties:[
{
name:'data',
documentation:'Defaults to true,so that the spinner will show itself ' +
'by default,if data is not set.',
defaultValue:true,
postSet:function(old,nu){
if(!this.$)return;
if(!nu)this.$.innerHTML='';
else if(!old && nu){
this.$.innerHTML=this.toInnerHTML();
this.initInnerHTML();
}
}
},
{
name:'color',
documentation:'The color to use for the spinner.',
defaultValue:'#4285F4'
},
{
name:'extraClassName',
defaultValue:'spinner-container'
}
],
constants:{
DURATION:'1333'
},
methods:{
initHTML:function(){
this.SUPER();
this.data=this.data;
}
},
templates:[
function CSS(){/*
<% var prefixes=['-webkit-','-moz-',''];%>
<% var bezier='cubic-bezier(0.4,0.0,0.2,1)';%>
.spinner-container{
display:flex;
align-items:center;
justify-content:center;
height:100%;
width:100%;
}
.spinner-fixed-box{
position:relative;
height:64px;
width:64px;
<% for(var i=0;i<prefixes.length;i++){%>
<%=prefixes[i] %>transform:translate3d(0px,0px,0px);
<%}%>
}
.spinner-turning-box{
<% for(var i=0;i<prefixes.length;i++){%>
<%=prefixes[i] %>animation:container-rotate 1568ms linear infinite;
<%}%>
width:100%;
height:100%;
}
.spinner-layer{
position:absolute;
height:100%;
width:100%;
<% for(var j=0;j<prefixes.length;j++){%>
<%=prefixes[j] %>animation:fill-unfill-rotate<%=4*this.DURATION %>ms<%=bezier %>infinite both;
<%}%>
}
.spinner-circle-clipper{
overflow:hidden;
border-color:inherit;
display:inline-block;
height:100%;
position:relative;
width:50%;
}
.spinner-circle-clipper.spinner-clipper-left .spinner-circle{
<% for(var i=0;i<prefixes.length;i++){%>
<%=prefixes[i] %>animation:left-spin<%=this.DURATION %>ms<%=bezier %>infinite;
<%=prefixes[i] %>transform:rotate(129deg);
<%}%>
border-right-color:transparent !important;
}
.spinner-circle-clipper.spinner-clipper-right .spinner-circle{
<% for(var i=0;i<prefixes.length;i++){%>
<%=prefixes[i] %>animation:right-spin<%=this.DURATION %>ms<%=bezier %>infinite;
<%=prefixes[i] %>transform:rotate(-129deg);
<%}%>
border-left-color:transparent !important;
left:-100%
}
.spinner-circle-clipper .spinner-circle{
width:200%;
}
.spinner-circle{
position:absolute;
top:0;
bottom:0;
left:0;
right:0;
box-sizing:border-box;
height:100%;
border-width:4px;
border-style:solid;
border-color:inherit;
border-bottom-color:transparent !important;
border-radius:50%;
<% for(var i=0;i<prefixes.length;i++){%>
<%=prefixes[i] %>animation:none;
<%}%>
}
.spinner-gap-patch{
position:absolute;
box-sizing:border-box;
top:0;
left:45%;
width:10%;
height:100%;
overflow:hidden;
border-color:inherit;
}
.spinner-gap-patch .spinner-circle{
width:1000%;
left:-450%;
}
<% for(var i=0;i<prefixes.length;i++){%>
@<%=prefixes[i] %>keyframes fill-unfill-rotate{
12.5%{<%=prefixes[i] %>transform:rotate(135deg);}
25%{<%=prefixes[i] %>transform:rotate(270deg);}
37.5%{<%=prefixes[i] %>transform:rotate(405deg);}
50%{<%=prefixes[i] %>transform:rotate(540deg);}
62.5%{<%=prefixes[i] %>transform:rotate(675deg);}
75%{<%=prefixes[i] %>transform:rotate(810deg);}
87.5%{<%=prefixes[i] %>transform:rotate(945deg);}
to{<%=prefixes[i] %>transform:rotate(1080deg);}
}
@<%=prefixes[i] %>keyframes left-spin{
from{<%=prefixes[i] %>transform:rotate(130deg);}
50%{<%=prefixes[i] %>transform:rotate(-5deg);}
to{<%=prefixes[i] %>transform:rotate(130deg);}
}
@<%=prefixes[i] %>keyframes right-spin{
from{<%=prefixes[i] %>transform:rotate(-130deg);}
50%{<%=prefixes[i] %>transform:rotate(5deg);}
to{<%=prefixes[i] %>transform:rotate(-130deg);}
}
@<%=prefixes[i] %>keyframes container-rotate{
to{<%=prefixes[i] %>transform:rotate(360deg);
}
<%}%>
*/},
function toInnerHTML(){/*
<div class="spinner-fixed-box">
<div class="spinner-turning-box">
<div class="spinner-layer" style="border-color:<%=this.color %>">
<div class="spinner-circle-clipper spinner-clipper-left"><div class="spinner-circle"></div></div><div class="spinner-gap-patch"><div class="spinner-circle"></div></div><div class="spinner-circle-clipper spinner-clipper-right"><div class="spinner-circle"></div></div>
</div>
</div>
</div>
*/}
]
});
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
name:'PositionedViewTrait',
properties:[
{model_:'FloatProperty',name:'x',units:'px',defaultValue:0},
{model_:'FloatProperty',name:'y',units:'px',defaultValue:0},
{model_:'FloatProperty',name:'z',units:'px',defaultValue:0},
{model_:'IntProperty',name:'width',units:'px',defaultValue:100},
{model_:'IntProperty',name:'height',units:'px',defaultValue:100},
{model_:'IntProperty',name:'preferredWidth',units:'px',defaultValue:100},
{model_:'IntProperty',name:'preferredHeight',units:'px',defaultValue:100}
]
});
CLASS({
name:'PositionedDOMViewTrait',
traits:['PositionedViewTrait'],
properties:[
{
name:'tagName',
defaultValue:'div'
}
],
methods:{
toHTML:function(){
return '<'+this.tagName+' id="'+this.id+'"'+this.layoutStyle()+ this.cssClassAttr()+ '>' +
this.toInnerHTML()+
'</div>';
},
layoutStyle:function(){
return ' style="' +
'-webkit-transform:'+this.transform()+
';width:'+this.styleWidth()+
';height:'+this.styleHeight()+
';position:absolute;"';
},
initHTML:function(){
this.SUPER();
var self=this;
this.X.dynamic(
function(){self.x;self.y;self.z;},
this.position);
this.X.dynamic(
function(){self.width;self.height;},
this.resize);
this.$.style.position='absolute';
this.position();
this.resize();
},
transform:function(){
return 'translate3d(' +
this.x+'px,' +
this.y+'px,' +
this.z+'px)';
},
styleWidth:function(){return this.width+'px';},
styleHeight:function(){return this.height+'px';}
},
listeners:[
{
name:'position',
code:function(){
if(!this.$)return;
this.$.style.webkitTransform=this.transform();
}
},
{
name:'resize',
code:function(){
if(!this.$)return;
this.$.style.width=this.styleWidth();
this.$.style.height=this.styleHeight();
}
}
]
});
CLASS({
name:'FloatingView',
extendsModel:'View',
traits:['PositionedDOMViewTrait'],
properties:[
{name:'view'},
{name:'width',defaultValue:300},
{name:'height',defaultValue:300},
{name:'className',defaultValue:'floatingView'}
],
templates:[
function toInnerHTML(){/* %%view */}
]
});
CLASS({
name:'ViewSlider',
traits:['PositionedDOMViewTrait'],
extendsModel:'View',
properties:[
{
name:'view'
},
{
name:'incomingView'
},
{
model_:'StringEnumProperty',
name:'direction',
choices:['horizontal','vertical'],
defaultValue:'horizontal'
},
{
model_:'BooleanProperty',
name:'reverse',
defaultValue:false
},
{
model_:'FloatProperty',
name:'slideAmount',
defaultValue:0
},
'latch'
],
methods:{
init:function(){
this.SUPER();
var self=this;
this.X.dynamic(
function(){
self.width;
self.height;
self.direction;
self.slideAmount;
self.reverse;
},
this.layout);
},
toHTML:function(){
this.children=[];
return this.SUPER();
},
initHTML:function(){
this.layout();
this.SUPER();
},
setView:function(view){
if(this.view){
this.view.destroy();
this.$.removeChild(this.view.$);
}
this.view=view;
this.layout();
this.$.insertAdjacentHTML('beforeend',view.toHTML());
view.initHTML();
},
slideView:function(view,opt_interp,opt_time,opt_delay){
if(!this.$)return;
if(this.latch){
this.latch();
this.latch='';
}
this.incomingView=view;
this.layout();
this.$.insertAdjacentHTML('beforeend',view.toHTML());
view.initHTML();
opt_interp=opt_interp||Movement.easeOut(1);
opt_time=opt_time||300;
var self=this;
var fn=function(){self.slideAmount=1.0;};
window.setTimeout(function(){
self.latch=this.X.animate(opt_time,fn,opt_interp,function(){
if(self.view){
self.$.removeChild(self.view.$);
self.view.destroy();
}
self.view=view;
self.incomingView='';
self.latch='';
self.slideAmount=0;
})();
},opt_delay||0)
}
},
templates:[
function toInnerHTML(){/*<%=this.view %>*/}
],
listeners:[
{
name:'layout',
code:function(){
this.view.width=this.width;
this.view.height=this.height;
if(this.incomingView){
this.incomingView.width=this.width;
this.incomingView.height=this.height;
}
var r=1;
if(this.reverse)r=-1;
if(this.direction==='horizontal'){
this.view.x=-(r * this.slideAmount * this.width);
this.view.y=0;
if(this.incomingView){
this.incomingView.x=r * this.width -(r * this.slideAmount * this.width);
this.incomingView.y=0;
}
}else{
this.view.x=0;
this.view.y=-(r * this.slideAmount * this.height);
if(this.incomingView){
this.incomingView.x=0;
this.incomingView.y=r * this.height -(r * this.slideAmount * this.height);
}
}
}
}
]
});
CLASS({
name:'OverlaySlider',
traits:['PositionedDOMViewTrait'],
extendsModel:'View',
properties:[
{
name:'view',
postSet:function(old,v){
old && old.destroy();
if(this.$){this.updateHTML();}
}
},
{model_:'FloatProperty',name:'slideAmount',defaultValue:0}
],
methods:{
init:function(){
this.SUPER();
var self=this;
this.X.dynamic(function(){self.width;self.height;self.slideAmount;},this.layout);
},
updateHTML:function(){
this.children=[];
this.layout();
this.SUPER();
}
},
templates:[
function toInnerHTML(){/*
<% this.on('click',this.onClick,this.id+'-slider');%>
<div id="<%=this.id %>-slider" class="overlay-slider"></div>%%view */},
function CSS(){/*
.overlay-slider{
position:absolute;
background:black;
}
*{
transform-style:preserve-3d;
-webkit-transform-style:preserve-3d;
}
*/}
],
listeners:[
{
name:'onClick',
code:function(){this.publish(['click']);}
},
{
name:'layout',
code:function(){
var width=Math.min(this.view.preferredWidth,this.width);
if(this.$){
var overlay=this.X.$(this.id+'-slider');
overlay.style.webkitTransform='translate3d(0,0,0px)';
overlay.style.width=this.width+'px';
overlay.style.height=this.height+'px';
overlay.style.opacity=this.slideAmount * 0.4;
}
if(this.view){
this.view.width=width;
this.view.height=this.height;
this.view.x=-((1 - this.slideAmount)* width);
this.view.y=0;
this.view.z=1;
}
}
}
]
});
/**
* @license
* Copyright 2015 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
package:'foam.ui',
name:'SlidePanel',
extendsModel:'View',
requires:[
'GestureTarget'
],
imports:[
'clearTimeout',
'document',
'gestureManager',
'setTimeout'
],
constants:{
CLOSED:{
name:'CLOSED',
layout:function(){
return [ this.parentWidth - this.stripWidth,this.minPanelWidth,this.stripWidth ];
},
onResize:function(){
if(this.parentWidth>this.minWidth+this.minPanelWidth)
this.state=this.EXPANDED;
},
toggle:function(){this.open();},
open:function(){this.state=this.OPEN;},
over:true
},
EXPANDED:{
name:'EXPANDED',
layout:function(){
var extraWidth=this.parentWidth - this.minWidth - this.minPanelWidth;
var panelWidth=this.minPanelWidth+extraWidth * this.panelRatio;
return [ this.parentWidth - panelWidth,panelWidth,panelWidth ];
},
onResize:function(){
if(this.parentWidth<this.minWidth+this.minPanelWidth)
this.state=this.CLOSED;
}
},
OPEN:{
name:'OPEN',
layout:function(){
return [ this.parentWidth - this.stripWidth,this.minPanelWidth,this.panelWidth ];
},
onResize:function(){
if(this.parentWidth>this.minWidth+this.minPanelWidth)
this.state=this.OPEN_EXPANDED;
},
close:function(){this.state=this.CLOSED;},
toggle:function(){this.close();},
over:true
},
OPEN_EXPANDED:{
name:'OPEN_EXPANDED',
layout:function(){return this.EXPANDED.layout.call(this);},
onResize:function(){
if(this.parentWidth<this.minWidth+this.minPanelWidth)
this.state=this.OPEN;
}
}
},
help:'A controller that shows a main view with a small strip of the ' +
'secondary view visible at the right edge. This "panel" can be dragged ' +
'by a finger or mouse pointer to any position from its small strip to ' +
'fully exposed. If the containing view is wide enough,both panels ' +
'will always be visible.',
properties:[
{
name:'state',
postSet:function(oldState,newState){
var layout=this.state.layout.call(this);
if(oldState===newState && !this.af_){
this.currentLayout=layout;
}else{
this.desiredLayout=layout;
}
}
},
{
name:'currentLayout',
postSet:function(_,layout){
this.panelWidth=Math.max(layout[1]+2,this.minPanelWidth);
this.panelX=Math.min(this.parentWidth-this.stripWidth,this.parentWidth-layout[2]);
this.mainWidth=Math.max(layout[0],this.panelX);
}
},
{
name:'desiredLayout',
postSet:function(_,layout){
if(!this.currentLayout){
this.currentLayout=layout;
return;
}
var startLayout=this.currentLayout;
var start=Date.now();
var end=start+150;
var animate=function(){
var now=Date.now();
var p=(now-start)/(end-start);
if(p<1){
var mainWidth=
this.currentLayout=[
startLayout[0] *(1 - p)+ layout[0] * p,
startLayout[1] *(1 - p)+ layout[1] * p,
startLayout[2] *(1 - p)+ layout[2] * p
];
if(this.af_)this.X.cancelAnimationFrame(this.af_);
this.af_=this.X.requestAnimationFrame(animate);
}else{
this.currentLayout=layout;
this.af_=null;
}
}.bind(this);
animate();
}
},
{model_:'ViewFactoryProperty',name:'mainView'},
{model_:'ViewFactoryProperty',name:'panelView'},
{
model_:'IntProperty',
name:'minWidth',
defaultValueFn:function(){
var e=this.main$();
return e?toNum(this.X.window.getComputedStyle(e).width):300;
}
},
{
model_:'IntProperty',
name:'mainWidth',
model_:'IntProperty',
hidden:true,
help:'Set internally by the resize handler',
postSet:function(_,x){
this.main$().style.width=x+'px';
}
},
{
model_:'IntProperty',
name:'panelWidth',
model_:'IntProperty',
hidden:true,
help:'Set internally by the resize handler',
postSet:function(_,x){
this.panel$().style.width=(x+1)+ 'px';
}
},
{
model_:'IntProperty',
name:'minPanelWidth',
defaultValueFn:function(){
if(this.panelView && this.panelView.minWidth)
return this.panelView.minWidth +(this.panelView.stripWidth||0);
var e=this.panel$();
return e?toNum(this.X.window.getComputedStyle(e).width):250;
}
},
{
model_:'IntProperty',
name:'parentWidth',
help:'A pseudoproperty that returns the current width(CSS pixels)of the containing element',
getter:function(){return toNum(this.X.window.getComputedStyle(this.$.parentNode).width);}
},
{
model_:'IntProperty',
name:'stripWidth',
help:'The width in(CSS)pixels of the minimal visible strip of panel',
defaultValue:30
},
{
model_:'FloatProperty',
name:'panelRatio',
help:'The ratio(0-1)of the total width occupied by the panel,when ' +
'the containing element is wide enough for expanded view.',
defaultValue:0.5
},
{
model_:'IntProperty',
name:'panelX',
preSet:function(oldX,x){
if(oldX !==x)this.dir_=oldX.compareTo(x);
if(x<=this.parentWidth - this.panelWidth)
return this.parentWidth - this.panelWidth;
if(x>=this.parentWidth - this.stripWidth)
return this.parentWidth - this.stripWidth;
return x;
},
postSet:function(_,x){
this.panel$().style.webkitTransform='translate3d('+x+'px,0,0)';
}
},
{
name:'dragGesture',
hidden:true,
transient:true,
lazyFactory:function(){
return this.GestureTarget.create({
containerID:this.id+'-panel',
handler:this,
gesture:'drag'
});
}
},
{
name:'tapGesture',
hidden:true,
transient:true,
lazyFactory:function(){
return this.GestureTarget.create({
containerID:this.id+'-panel',
handler:this,
gesture:'tap'
});
}
},
{
name:'expanded',
help:'If the panel is wide enough to expand the panel permanently.',
defaultValue:false
}
],
templates:[
function CSS(){/*
.SlidePanel .shadow{
background:linear-gradient(to left,rgba(0,0,0,0.15)0%,
rgba(0,0,0,0)100%);
height:100%;
left:-8px;
position:absolute;
width:8px;
}
*/},
function toHTML(){/*
<div id="%%id" style="display:inline-block;position:relative;" class="SlidePanel">
<div id="%%id-main">
<div style="width:0;position:absolute;"></div>
<%=this.mainView()%>
</div>
<div id="%%id-panel" style="position:absolute;top:0;left:-1;">
<div id="%%id-shadow" class="shadow"></div>
<%=this.panelView()%>
</div>
</div>
*/}
],
methods:{
initHTML:function(){
this.state=this.state=this.CLOSED;
this.gestureManager.install(this.dragGesture);
this.gestureManager.install(this.tapGesture);
this.X.window.addEventListener('resize',this.onResize);
this.main$().addEventListener('click',this.onMainFocus);
this.main$().addEventListener('DOMFocusIn',this.onMainFocus);
this.panel$().addEventListener('DOMFocusIn',this.onPanelFocus);
this.onResize();
this.initChildren();
},
interpolate:function(state1,state2){
var layout1=state1.layout.call(this);
var layout2=state2.layout.call(this);
return [
layout1[0] * this.progress+layout2[0] *(1 - this.progress),
layout1[1] * this.progress+layout2[1] *(1 - this.progress),
layout1[2] * this.progress+layout2[2] *(1 - this.progress),
];
},
main$:function(){return this.X.$(this.id+'-main');},
panel$:function(){return this.X.$(this.id+'-panel');},
shadow$:function(){return this.X.$(this.id+'-shadow');},
open:function(){this.state.open && this.state.open.call(this);},
close:function(){this.state.close && this.state.close.call(this);},
toggle:function(){this.state.toggle && this.state.toggle.call(this);}
},
listeners:[
{
name:'onPanelFocus',
isMerged:1,
code:function(e){this.open();}
},
{
name:'onMainFocus',
isMerged:1,
code:function(e){this.close();}
},
{
name:'onResize',
isFramed:true,
code:function(e){
if(!this.$)return;
this.state.onResize.call(this);
this.shadow$().style.display=this.state.over?'inline':'none';
this.state=this.state;
var parentWidth=this.parentWidth;
this.X.setTimeout(function(){
if(this.parentWidth !==parentWidth)this.onResize();
}.bind(this),100);
}
},
{
name:'tapClick',
code:function(){this.toggle();}
},
{
name:'dragStart',
code:function(point){
if(this.expanded)return;
var self=this;
var originalX=this.panelX;
Events.map(point.x$,this.panelX$,function(x){
return originalX+point.totalX;
});
}
},
{
name:'dragEnd',
code:function(point){
if(this.dir_<0)this.close();else this.open();
this.state=this.state;
}
}
]
});
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
name:'AbstractDAOView',
extendsModel:'View',
documentation:function(){/*
<p>For $$DOC{ref:'View',usePlural:true}that take data items from a $$DOC{ref:'DAO'}
and display them all,$$DOC{ref:'.'}provides the basic interface. Set or bind
either $$DOC{ref:'.data'}or $$DOC{ref:'.dao'}to your source $$DOC{ref:'DAO'}.</p>
<p>Call $$DOC{ref:'.onDAOUpdate'}to indicate a data change that should be
re-rendered.</p>
*/},
exports:['dao$ as daoViewCurrentDAO$'],
properties:[
{
name:'data',
postSet:function(oldDAO,dao){
if(this.dao !==dao){
this.dao=dao;
}
},
documentation:function(){/*
Sets the $$DOC{ref:'DAO'}to render items from. Use $$DOC{ref:'.data'}
or $$DOC{ref:'.dao'}interchangeably.
*/}
},
{
model_:'DAOProperty',
name:'dao',
label:'DAO',
help:'An alias for the data property.',
onDAOUpdate:'onDAOUpdate',
postSet:function(oldDAO,dao){
if(!dao){
this.data="";
}else if(this.data !==dao){
this.data=dao;
}
},
documentation:function(){/*
Sets the $$DOC{ref:'DAO'}to render items from. Use $$DOC{ref:'.data'}
or $$DOC{ref:'.dao'}interchangeably.
*/}
}
],
methods:{
onDAOUpdate:function(){/* Implement this $$DOC{ref:'Method'}in
sub-models to respond to changes in $$DOC{ref:'.dao'}. */}
}
});
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
name:'DAOListView',
extendsModel:'AbstractDAOView',
properties:[
{
model_:'BooleanProperty',
name:'hidden',
defaultValue:false,
postSet:function(_,hidden){
if(this.dao && !hidden)this.onDAOUpdate();
}
},
{
model_:'ViewFactoryProperty',
name:'rowView',
defaultValue:'DetailView'
},
{
name:'mode',
defaultValue:'read-write',
view:{factory_:'ChoiceView',choices:['read-only','read-write','final']}
},
{
name:'useSelection',
help:'Backward compatibility for selection mode. Create a X.selection$ value in your context instead.',
postSet:function(old,nu){
if(this.useSelection && !this.X.selection$)this.X.selection$=this.X.SimpleValue.create();
this.selection$=this.X.selection$;
}
},
{
name:'selection',
help:'Backward compatibility for selection mode. Create a X.selection$ value in your context instead.',
factory:function(){
return this.X.SimpleValue.create();
}
},
{
name:'scrollContainer',
help:'Containing element that is responsible for scrolling.'
},
{
name:'chunkSize',
defaultValue:0,
help:'Number of entries to load in each infinite scroll chunk.'
},
{
name:'chunksLoaded',
hidden:true,
defaultValue:1,
help:'The number of chunks currently loaded.'
}
],
methods:{
init:function(){
this.SUPER();
var self=this;
this.subscribe(this.ON_HIDE,function(){
self.hidden=true;
});
this.subscribe(this.ON_SHOW,function(){
self.hidden=false;
});
if(this.X.selection$){
this.selection$=this.X.selection$;
}
},
initHTML:function(){
this.SUPER();
if(this.chunkSize>0){
var e=this.$;
while(e){
if(window.getComputedStyle(e).overflow==='scroll')break;
e=e.parentElement;
}
this.scrollContainer=e||window;
this.scrollContainer.addEventListener('scroll',this.onScroll,false);
}
if(!this.hidden)this.updateHTML();
},
updateHTML:function(){
if(!this.dao||!this.$)return;
if(this.painting){
this.repaintRequired=true;
return;
}
this.painting=true;
var out=[];
this.children=[];
this.initializers_=[];
var doneFirstItem=false;
var d=this.dao;
if(this.chunkSize){
d=d.limit(this.chunkSize * this.chunksLoaded);
}
d.select({put:function(o){
if(this.mode==='read-write')o=o.model_.create(o,this.X);
var view=this.rowView({data:o,model:o.model_},this.X);
view.DAO=this.dao;
if(this.mode==='read-write'){
o.addListener(function(){
this.dao.put(o.deepClone());
}.bind(this,o));
}
this.addChild(view);
if(!doneFirstItem){
doneFirstItem=true;
}else{
this.separatorToHTML(out);
}
if(this.X.selection$){
out.push('<div class="'+this.className+'-row'+'" id="'+this.on('click',(function(){
this.selection=o;
}).bind(this))+ '">');
}
out.push(view.toHTML());
if(this.X.selection$){
out.push('</div>');
}
}.bind(this)})(function(){
if(this.repaintRequired){
this.repaintRequired=false;
this.painting=false;
this.realDAOUpdate();
return;
}
var e=this.$;
if(!e)return;
e.innerHTML=out.join('');
this.initInnerHTML();
this.children=[];
this.painting=false;
}.bind(this));
},
/** Allow rowView to be optional when defined using HTML. **/
fromElement:function(e){
var children=e.children;
if(children.length==1 && children[0].nodeName==='rowView'){
this.SUPER(e);
}else{
this.rowView=e.innerHTML;
}
},
separatorToHTML:function(out){
/* Template method. Override to provide a separator if required. This
method is called<em>before</em>each list item,except the first. Use
out.push("<myhtml>...")for efficiency. */
}
},
listeners:[
{
name:'onDAOUpdate',
code:function(){
this.realDAOUpdate();
}
},
{
name:'realDAOUpdate',
isFramed:true,
code:function(){
if(!this.hidden)this.updateHTML();
}
},
{
name:'onScroll',
code:function(){
var e=this.scrollContainer;
if(this.chunkSize>0 && e.scrollTop+e.offsetHeight>=e.scrollHeight){
this.chunksLoaded++;
this.updateHTML();
}
}
}
]
});
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
name:'DetailView',
extendsModel:'View',
requires:[ 'Property' ],
imports:[ 'data' ],
exports:[
'propertyViewProperty'
],
documentation:function(){/*
When a view based on $$DOC{ref:'Property'}values is desired,$$DOC{ref:'DetailView'}
is the place to start. Either using $$DOC{ref:'DetailView'}directly,implementing
a .toDetailHTML()$$DOC{ref:'Method'}in your model,or extending
$$DOC{ref:'DetailView'}to add custom formatting.
</p>
<p>Set the $$DOC{ref:'.data'}$$DOC{ref:'Property'}to the $$DOC{ref:'Model'}instance
you want to display. $$DOC{ref:'DetailView'}will extract the $$DOC{ref:'Model'}
definition,create editors for the $$DOC{ref:'Property',usePlural:true},and
display the current values of your instance. Set $$DOC{ref:'.mode',usePlural:true}
to indicate read-only if desired.
</p>
<p>$$DOC{ref:'Model',usePlural:true}may specify a .toDetailHTML()$$DOC{ref:'Method'}or
$$DOC{ref:'Template'}to render their contents instead of
$$DOC{ref:'DetailView.defaultToHTML'}.
</p>
<p>For each $$DOC{ref:'Property'}in the $$DOC{ref:'.data'}instance specified,
a $$DOC{ref:'PropertyView'}is created that selects the appropriate $$DOC{ref:'View'}
to construct.
*/},
properties:[
{
name:'className',
defaultValue:'detailView',
documentation:function(){/*
The CSS class names to use for HTML $$DOC{ref:'View',usePlural:true}.
Separate class names with spaces. Each instance of a $$DOC{ref:'DetailView'}
may have different classes specified.
*/}
},
{
name:'data',
postSet:function(_,data){
if(data && data.model_ && this.model !==data.model_){
this.model=data.model_;
}
this.onValueChange_();
},
documentation:function(){/*
The $$DOC{ref:'Model'}to view. The $$DOC{ref:'Property',usePlural:true}
of this $$DOC{ref:'Model'}instance will be examined and a $$DOC{ref:'PropertyView'}
created for each with editors for the current value.
</p>
<p>Sub-views of $$DOC{ref:'DetailView'}are passed this $$DOC{ref:'.data'}
property,from which $$DOC{ref:'PropertyView'}will extract its named
$$DOC{ref:'Property'}
and bind the property to the sub-view $$DOC{ref:'DetailView.data'}.
*/}
},
{
name:'model',
type:'Model',
postSet:function(_,m){
if(this.$){
this.children=[];
this.$.outerHTML=this.toHTML();
this.initHTML();
}
},
documentation:function(){/*
The $$DOC{ref:'.model'}is extracted from $$DOC{ref:'.data'},or can be
set in advance when the type of $$DOC{ref:'.data'}is known. The $$DOC{ref:'Model'}
is used to set up the structure of the $$DOC{ref:'DetailView'},by examining the
$$DOC{ref:'Property',usePlural:true}. Changing the $$DOC{ref:'.data'}out
for another instance of the same $$DOC{ref:'Model'}will refresh the contents
of the sub-views without destroying and re-creating them.
*/}
},
{
name:'title',
defaultValueFn:function(){return "Edit "+this.model.label;},
documentation:function(){/*
<p>The display title for the $$DOC{ref:'View'}.
</p>
*/}
},
{
model_:'StringProperty',
name:'mode',
defaultValue:'read-write',
documentation:function(){/*
The editing mode. To disable editing set to 'read-only'.
*/}
},
{
model_:'BooleanProperty',
name:'showRelationships',
defaultValue:false,
documentation:function(){/*
Set true to create sub-views to display $$DOC{ref:'Relationship',usePlural:true}
for the $$DOC{ref:'.model'}.
*/}
},
{
name:'propertyViewProperty',
type:'Property',
defaultValueFn:function(){return this.Property.DETAIL_VIEW;}
}
],
methods:{
onValueChange_:function(){/* Override with value update code. */},
viewModel:function(){/* The $$DOC{ref:'Model'}type of the $$DOC{ref:'.data'}. */
return this.model;
},
createTemplateView:function(name,opt_args){
/* Overridden here to set the new View.$$DOC{ref:'.data'}to this.$$DOC{ref:'.data'}.
See $$DOC{ref:'View.createTemplateView'}. */
if(this.viewModel()){
var o=this.viewModel().getFeature(name);
if(o){
var v;
if(Action.isInstance(o))
v=this.createActionView(o,opt_args);
else if(Relationship.isInstance(o))
v=this.createRelationshipView(o,opt_args);
else
v=this.createView(o,opt_args);
v.data$=this.data$;
return v;
}
}
return this.SUPER(name,opt_args);
},
titleHTML:function(){
/* Title text HTML formatter */
var title=this.title;
return title?
'<tr><th colspan=2 class="heading">'+title+'</th></tr>':
'';
},
startForm:function(){/* HTML formatter */ return '<table>';},
endForm:function(){/* HTML formatter */ return '</table>';},
startColumns:function(){/* HTML formatter */ return '<tr><td colspan=2><table valign=top><tr><td valign=top><table>';},
nextColumn:function(){/* HTML formatter */ return '</table></td><td valign=top><table valign=top>';},
endColumns:function(){/* HTML formatter */ return '</table></td></tr></table></td></tr>';},
rowToHTML:function(prop,view){
/* HTML formatter for each $$DOC{ref:'Property'}row. */
var str="";
if(prop.detailViewPreRow)str +=prop.detailViewPreRow(this);
str +='<tr class="detail-'+prop.name+'">';
if(DAOController.isInstance(view)){
str +="<td colspan=2><div class=detailArrayLabel>"+prop.label+"</div>";
str +=view.toHTML();
str +='</td>';
}else{
str +="<td class='label'>"+prop.label+"</td>";
str +='<td>';
str +=view.toHTML();
str +='</td>';
}
str +='</tr>';
if(prop.detailViewPostRow)str +=prop.detailViewPostRow(this);
return str;
},
toHTML:function(){
/* Overridden to create the complete HTML content for the $$DOC{ref:'View'}.</p>
<p>$$DOC{ref:'Model',usePlural:true}may specify a .toDetailHTML()$$DOC{ref:'Method'}or
$$DOC{ref:'Template'}to render their contents instead of the
$$DOC{ref:'DetailView.defaultToHTML'}we supply here.
*/
if(!this.model)throw "DetailView:either 'data' or 'model' must be specified.";
return(this.model.getPrototype().toDetailHTML||this.defaultToHTML).call(this);
},
defaultToHTML:function(){
/* For $$DOC{ref:'Model',usePlural:true}that don't supply a .toDetailHTML()
$$DOC{ref:'Method'}or $$DOC{ref:'Template'},a default listing of
$$DOC{ref:'Property'}editors is implemented here.
*/
this.children=[];
var model=this.model;
var str="";
str +='<div id="'+this.id+'" '+this.cssClassAttr()+ '" name="form">';
str +=this.startForm();
str +=this.titleHTML();
for(var i=0;i<model.properties.length;i++){
var prop=model.properties[i];
if(prop.hidden)continue;
var view=this.createView(prop);
view.data$=this.data$;
str +=this.rowToHTML(prop,view);
}
str +=this.endForm();
if(this.showRelationships){
var view=this.X.RelationshipsView.create({
data:this.data
});
view.data$=this.data$;
str +=view.toHTML();
this.addChild(view);
}
str +='</div>';
return str;
}
}
});
CLASS({
name:'CitationView',
requires:[ 'Property' ],
exports:[ 'propertyViewProperty' ],
properties:[
{
name:'propertyViewProperty',
type:'Property',
defaultValueFn:function(){return this.Property.CITATION_VIEW;}
}
]
});
CLASS({
name:'UpdateDetailView',
extendsModel:'DetailView',
imports:[
'DAO as dao',
'stack'
],
properties:[
{
name:'rawData',
documentation:'The uncloned original input data.',
postSet:function(old,nu){
if(old)old.removeListener(this.rawUpdate);
if(nu)nu.addListener(this.rawUpdate);
}
},
{
name:'originalData',
documentation:'A clone of the input data,for comparison with edits.'
},
{
name:'data',
preSet:function(_,v){
if(!v)return;
this.rawData=v;
return v.deepClone();
},
postSet:function(_,data){
if(!data)return;
this.originalData=data.deepClone();
if(!this.model && data && data.model_)this.model=data.model_;
data.addListener(function(){
this.version++;
this.rawData='';
}.bind(this));
}
},
{
name:'view'
},
{
model_:'IntProperty',
name:'version'
}
],
listeners:[
{
name:'rawUpdate',
code:function(){
this.data=this.rawData;
}
}
],
actions:[
{
name:'save',
help:'Save updates.',
isAvailable:function(){this.version;return !this.originalData.equals(this.data);},
action:function(){
var self=this;
var obj=this.data;
this.stack.back();
this.dao.put(obj,{
put:function(){
console.log("Saving:",obj.toJSON());
self.originalData.copyFrom(obj);
},
error:function(){
console.error("Error saving",arguments);
}
});
}
},
{
name:'cancel',
help:'Cancel update.',
isAvailable:function(){this.version;return !this.originalData.equals(this.data);},
action:function(){this.stack.back();}
},
{
name:'back',
isAvailable:function(){this.version;return this.originalData.equals(this.data);},
action:function(){this.stack.back();}
},
{
name:'reset',
isAvailable:function(){this.version;return !this.originalData.equals(this.data);},
action:function(){this.data.copyFrom(this.originalData);}
}
]
});
CLASS({
name:'RelationshipView',
extendsModel:'View',
properties:[
{
name:'relationship',
required:true
},
{
name:'args'
},
{
model_:'ViewFactoryProperty',
name:'viewModel',
defaultValue:'DAOController'
},
{
name:'data',
postSet:function(){
this.updateView();
}
},
{
name:'view'
}
],
methods:{
init:function(args){
this.SUPER(args);
if(this.args && this.args.model_)this.viewModel=this.args.model_
},
updateView:function(){
if(this.view)this.view.destroy();
this.view=this.viewModel({
dao:this.data[this.relationship.name],
model:this.relationship.relatedModel
},this.X).copyFrom(this.args);
if(this.$){
this.updateHTML();
}
}
},
templates:[
function toInnerHTML(){/* %%view */}
]
});
CLASS({
name:'RelationshipsView',
extendsModel:'DetailView',
templates:[
function toHTML(){/*
<%
for(var i=0,relationship;relationship=this.model.relationships[i];i++){
out(this.X.RelationshipView.create({
data$:this.data$,
relationship:relationship
}));
}
%>
*/}
]
});
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
name:'ChildTreeTrait',
package:'foam.patterns',
properties:[
{
name:'parent',
type:'foam.patterns.ChildTreeTrait',
hidden:true
},
{
name:'children',
type:'Array[foam.patterns.ChildTreeTrait]',
factory:function(){return [];},
documentation:function(){/*
$$DOC{ref:'ChildTreeTrait',usePlural:true}children are arranged in a tree.
*/}
}
],
methods:{
onAncestryChange_:function(){
/* Called when our parent or an ancestor's parent changes. Override to
react to ancestry changes. Remember to call<code>this.SUPER()</code>. */
Array.prototype.forEach.call(this.children,function(c){c.onAncestryChange_()});
},
addChild:function(child){
/*
Maintains the tree structure of $$DOC{ref:'View',usePlural:true}. When
a sub-$$DOC{ref:'View'}is created,add it to the tree with this method.
*/
if(this.children.indexOf(child)!=-1)return;
try{
child.parent=this;
}catch(x){console.log(x);}
child.onAncestryChange_ && child.onAncestryChange_();
var children=this.children;
children.push(child);
this.children=children;
return this;
},
removeChild:function(child){
/*
Maintains the tree structure of $$DOC{ref:'View',usePlural:true}. When
a sub-$$DOC{ref:'View'}is destroyed,remove it from the tree with this method.
*/
child.destroy();
this.children.deleteI(child);
child.parent=undefined;
child.onAncestryChange_();
return this;
},
removeAllChildren:function(){
var list=this.children.slice();
Array.prototype.forEach.call(list,this.removeChild.bind(this));
},
addChildren:function(){
/* Adds multiple children at once. */
if(Array.isArray(arguments)){
Array.prototype.forEach.call(arguments,this.addChild.bind(this));
}else{
for(var key in arguments)this.addChild(arguments[key]);
}
return this;
},
destroy:function(){
/* Destroys children and removes them from this. Override to include your own
cleanup code,but always call this.SUPER()after you are done. */
this.removeAllChildren();
return this;
},
construct:function(){
/* After a destroy(),construct()is called to fill in the object again. If
any special children need to be re-created,do it here. */
return this;
},
deepPublish:function(topic){
/*
Publish an event and cause all children to publish as well.
*/
var count=this.publish.apply(this,arguments);
if(this.children){
for(var i=0;i<this.children.length;i++){
var child=this.children[i];
count +=child.deepPublish.apply(child,arguments);
}
}
return count;
}
}
});
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
package:'foam.graphics',
name:'AbstractCViewView',
extendsModel:'View',
documentation:function(){/*
Forming the DOM component for a $$DOC{ref:'foam.graphics.CView',text:'canvas view'},
the $$DOC{ref:'.'}provides a canvas and DOM event integration. When you
create a $$DOC{ref:'foam.graphics.CView'}and $$DOC{ref:'foam.graphics.CView.write'}it into your
document,an $$DOC{ref:'.'}is created automatically to host your view.</p>
<p>Changes to your $$DOC{ref:'foam.graphics.CView'}or its children ripple down and
cause a repaint,starting with a $$DOC{ref:'.paint'}call.
*/},
properties:[
{
name:'cview',
type:'foam.graphics.CView',
postSet:function(_,cview){
cview.view=this;
},
documentation:function(){/*
The $$DOC{ref:'foam.graphics.CView'}root node that contains all the content to render.
*/}
},
{
name:'className',
help:'CSS class name(s),space separated.',
defaultValue:'',
documentation:'CSS class name(s),space separated.'
},
{
model_:'IntProperty',
name:'scalingRatio',
preSet:function(_,v){if(v<0)return 1;return v;},
postSet:function(_,v){/* console.log('Scaling to:',v);*/},
defaultValue:1,
documentation:function(){/*
If scaling is required to render the canvas at a higher resolution than
CSS pixels(for high DPI devices,for instance),the scaling value can
be used to set the pixel scale. This is set automatically by
$$DOC{ref:'.initHTML'}.
*/}
},
'speechLabel',
'role',
'tabIndex',
{
model_:'IntProperty',
name:'width',
defaultValue:100,
documentation:function(){/*
The CSS width of the canvas. See also $$DOC{ref:'.canvasWidth'}and
$$DOC{ref:'.styleWidth'}.
*/}
},
{
model_:'IntProperty',
name:'height',
defaultValue:100,
documentation:function(){/*
The CSS height of the canvas. See also $$DOC{ref:'.canvasHeight'}and
$$DOC{ref:'.styleHeight'}.
*/}
},
{
name:'canvas',
getter:function(){
return this.instance_.canvas?
this.instance_.canvas:
this.instance_.canvas=this.$ && this.$.getContext('2d');
},
documentation:'The HTML canvas context. Use this to render.'
}
],
listeners:[
{
name:'resize',
isFramed:true,
code:function(){
if(!this.$)return;
this.$.width=this.canvasWidth();
this.$.style.width=this.styleWidth();
this.$.style.minWidth=this.styleWidth();
this.$.height=this.canvasHeight();
this.$.style.height=this.styleHeight();
this.$.style.minHeight=this.styleHeight();
this.paint();
},
documentation:'Reacts to resize events to fix the size of the canvas.'
},
{
name:'paint',
isFramed:true,
code:function(){
if(!this.$)throw EventService.UNSUBSCRIBE_EXCEPTION;
this.canvas.save();
this.canvas.scale(this.scalingRatio,this.scalingRatio);
this.cview.erase();
this.cview.paint();
this.canvas.restore();
},
documentation:function(){/*
Clears the canvas and triggers a repaint of the root $$DOC{ref:'foam.graphics.CView'}
and its children.
*/}
}
],
methods:{
init:function(){/* Connects resize listeners. */
this.SUPER();
this.X.dynamic(
function(){this.scalingRatio;this.width;this.height;}.bind(this),
this.resize);
},
styleWidth:function(){/* The CSS width string */ return(this.width)+ 'px';},
canvasWidth:function(){/* The scaled width */ return this.width * this.scalingRatio;},
styleHeight:function(){/* The CSS height string */ return(this.height)+ 'px';},
canvasHeight:function(){/* The scaled height */ return this.height * this.scalingRatio;},
toString:function(){/* The description of this. */ return 'CViewView('+this.cview+')';},
toHTML:function(){/* Creates the canvas element. */
var className=this.className?' class="'+this.className+'"':'';
var title=this.speechLabel?' aria-role="button" aria-label="'+this.speechLabel+'"':'';
var tabIndex=this.tabIndex?' tabindex="'+this.tabIndex+'"':'';
var role=this.role?' role="'+this.role+'"':'';
return '<canvas id="'+this.id+'"'+className+title+tabIndex+role+' width="'+this.canvasWidth()+ '" height="'+this.canvasHeight()+ '" style="width:'+this.styleWidth()+ ';height:'+this.styleHeight()+ ';min-width:'+this.styleWidth()+ ';min-height:'+this.styleHeight()+ '"></canvas>';
},
initHTML:function(){/* Computes the scaling ratio from the window.devicePixelRatio
and canvas.backingStoreRatio. */
if(!this.$)return;
this.maybeInitTooltip();
this.canvas=this.$.getContext('2d');
var devicePixelRatio=this.X.window.devicePixelRatio||1;
var backingStoreRatio=this.canvas.backingStoreRatio||
this.canvas.webkitBackingStorePixelRatio||1;
if(devicePixelRatio !==backingStoreRatio)
this.scalingRatio=devicePixelRatio / backingStoreRatio;
var style=this.X.window.getComputedStyle(this.$);
if(style.backgroundColor && !this.cview.hasOwnProperty('background'))
this.cview.background=style.backgroundColor;
this.paint();
},
destroy:function(){/* Call to clean up this and child views. */
this.SUPER();
this.cview.destroy();
}
}
});
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
package:'foam.graphics',
name:'PositionedCViewView',
extendsModel:'foam.graphics.AbstractCViewView',
traits:['PositionedDOMViewTrait'],
properties:[
{
name:'tagName',
factory:function(){return 'canvas';}
}
],
methods:{
init:function(){
this.SUPER();
this.X.dynamic(function(){
this.cview;this.width;this.height;
}.bind(this),function(){
if(!this.cview)return;
this.cview.width=this.width;
this.cview.height=this.height;
}.bind(this));
},
toHTML:function(){
var className=this.className?' class="'+this.className+'"':'';
return '<canvas id="'+this.id+'"'+className+' width="'+this.canvasWidth()+ '" height="'+this.canvasHeight()+ '" '+this.layoutStyle()+ '></canvas>';
}
},
listeners:[
{
name:'resize',
isFramed:true,
code:function(){
if(!this.$)return;
this.$.width=this.canvasWidth();
this.$.style.width=this.styleWidth();
this.$.height=this.canvasHeight();
this.$.style.height=this.styleHeight();
this.cview.width=this.width;
this.cview.height=this.height;
this.paint();
}
}
]
});
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
package:'foam.graphics',
name:'CViewView',
extendsModel:'foam.graphics.AbstractCViewView',
help:'DOM wrapper for a CView,auto adjusts it size to fit the given cview.',
documentation:function(){/*
DOM wrapper for a $$DOC{ref:'foam.graphics.CView'},that auto adjusts it size to fit
he given view.
*/},
properties:[
{
name:'cview',
postSet:function(_,cview){
cview.view=this;
this.X.dynamic(function(){
this.width=cview.x+cview.width;
this.height=cview.y+cview.height;
}.bind(this));
}
}
]
});
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
package:'foam.graphics',
name:'ActionButtonCView',
extendsModel:'foam.graphics.CView',
requires:[ 'foam.ui.md.Halo' ],
imports:[ 'gestureManager' ],
properties:[
{
name:'action',
postSet:function(oldValue,action){
this.bindIsAvailable();
}
},
{
name:'font',
type:'String',
defaultValue:''
},
{
name:'data',
postSet:function(){
this.bindIsAvailable();
}
},
{
name:'showLabel',
defaultValueFn:function(){return this.action.showLabel;}
},
{
name:'iconUrl',
postSet:function(_,v){this.image_ &&(this.image_.src=v);},
defaultValueFn:function(){return this.action.iconUrl;}
},
{
name:'haloColor',
defaultValue:'rgb(241,250,65)'
},
{
name:'halo',
factory:function(){
return this.Halo.create({
alpha:0,
r:10,
color:this.haloColor
/* This gives a ring halo:
,style:'ring'
*/
});
},
postSet:function(old,nu){
if(old)this.removeChild(old);
if(nu)this.addChild(nu);
}
},
{
name:'iconWidth',
type:'int',
defaultValue:0
},
{
name:'iconHeight',
type:'int',
defaultValue:0
},
{
name:'radius',
type:'int',
defaultValue:0,
postSet:function(_,r){
if(r)this.width=this.height=2 * r;
}
},
{
name:'tapGesture',
hidden:true,
transient:true,
lazyFactory:function(){
return this.X.GestureTarget.create({
containerID:this.view.id,
handler:this,
gesture:'tap'
});
}
},
{
name:'className',
help:'CSS class name(s),space separated.',
defaultValueFn:function(){
return 'actionButtonCView actionButtonCView-'+this.action.name;
}
},
{
name:'tooltip',
defaultValueFn:function(){return this.action.help;}
},
{
name:'speechLabel',
defaultValueFn:function(){return this.action.speechLabel;}
},
'tabIndex',
'role',
{
name:'state_',
defaultValue:'default'
}
],
listeners:[
{
name:'tapClick',
code:function(){this.action.callIfEnabled(this.X,this.data);}
}
],
methods:{
init:function(){
this.SUPER();
if(this.iconUrl){
this.image_=new Image();
this.image_.onload=function(){
if(!this.iconWidth)this.iconWidth=this.image_.width;
if(!this.iconHeight)this.iconHeight=this.image_.height;
if(this.canvas){
this.canvas.save();
this.paint();
this.canvas.restore();
}
}.bind(this);
this.image_.src=this.iconUrl;
}
},
bindIsAvailable:function(){
if(!this.action||!this.data)return;
var self=this;
Events.dynamic(
function(){self.action.isAvailable.call(self.data,self.action);},
function(){
if(self.action.isAvailable.call(self.data,self.action)){
if(self.oldWidth_ && self.oldHeight_){
self.x=self.oldX_;
self.y=self.oldY_;
self.width=self.oldWidth_;
self.height=self.oldHeight_;
}
}else if(self.width||self.height){
self.oldX_=self.x;
self.oldY_=self.y;
self.oldWidth_=self.width;
self.oldHeight_=self.height;
self.width=0;
self.height=0;
self.x=0;
self.y=0;
}
});
},
initCView:function(){
this.halo.view=this.view;
this.halo.addListener(this.view.paint);
if(this.gestureManager){
this.gestureManager.install(this.tapGesture);
}
this.$.addEventListener('keypress',function(e){
if(e.charCode==32 && !(e.altKey||e.ctrlKey||e.shiftKey)){
e.preventDefault();
e.stopPropagation();
this.tapClick();
}
}.bind(this));
this.$.addEventListener('click',function(e){
e.preventDefault();
e.stopPropagation();
if(!e.x && !e.y)this.tapClick();
}.bind(this));
},
destroy:function(){
this.SUPER();
if(this.gestureManager){
this.gestureManager.uninstall(this.tapGesture);
}
},
erase:function(){
var c=this.canvas;
c.clearRect(0,0,this.width,this.height);
var r=Math.min(this.width,this.height)/2;
c.fillStyle=this.background;
c.beginPath();
c.arc(this.width/2,this.height/2,r,0,Math.PI*2,true);
c.closePath();
c.fill();
},
paintSelf:function(){
var c=this.canvas;
this.halo.paint();
if(this.font)c.font=this.font;
c.globalAlpha=this.alpha;
c.textAlign='center';
c.textBaseline='middle';
c.fillStyle=this.color;
if(this.image_ && this.image_.width){
c.drawImage(
this.image_,
this.x +(this.width - this.iconWidth)/2,
this.y +(this.height - this.iconHeight)/2,
this.iconWidth,
this.iconHeight);
}
c.fillText(
this.action.labelFn.call(this.data,this.action),
this.x+this.width/2,
this.y+this.height/2);
}
}
});
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
package:'foam.graphics',
name:'CView',
label:'CView',
requires:[
'foam.graphics.PositionedCViewView',
'foam.graphics.CViewView'
],
traits:[ 'foam.patterns.ChildTreeTrait' ],
documentation:function(){/*
The base class for a canvas item. A $$DOC{ref:'.'}can be directly inserted
into the DOM with $$DOC{ref:'.write'},and will generate a $$DOC{ref:'CViewView'}
wrapper.</p>
<p>$$DOC{ref:'.'}submodels directly nest inside each other,with a single
root $$DOC{ref:'.'}attached to the canvas. Use $$DOC{ref:'.addChild'}to attach a new
$$DOC{ref:'.'}to the scene graph:</p>
<p><code>
var rootNode=this.X.CView.create({width:300,height:200});<br/>
<br/>
rootNode.write(document);
<br/>
rootNode.addChild(this.X.Circle.create({x:30,y:50,radius:30,color:'blue'});<br/>
rootNode.addChild(this.X.Label.create({x:50,y:30,text:"Hello",color:'black'});<br/>
</code></p>
<p>When modeling your own $$DOC{ref:'foam.graphics.CView'}submodel,override $$DOC{ref:'.paintSelf'}
to render your content. Children will automatically be painted for you. For more direct
control over child rendering,override $$DOC{ref:'.paint'}.
*/},
properties:[
{
name:'view',
type:'Canvas2',
postSet:function(_,view){
for(var key in this.children){
var child=this.children[key];
child.view=view;
if(view)child.addListener(view.paint);
}
},
transient:true,
hidden:true,
documentation:function(){/* The canvas view this scene draws into */}
},
{
name:'canvas',
getter:function(){return this.view && this.view.canvas;},
transient:true,
hidden:true,
documentation:function(){/* Safe getter for the canvas view this scene draws into */}
},
{
name:'$',
getter:function(){return this.view && this.view.$;},
transient:true,
hidden:true,
documentation:function(){/* Safe getter for the canvas DOM element this scene draws into */}
},
{
name:'state',
defaultValue:'initial',
documentation:function(){/* Indicates if canvas setup is in progress('initial'),
or ready to paint('active'). */}
},
{
name:'suspended',
model_:'BooleanProperty',
defaultValue:false,
documentation:function(){/*
Suspend painting. While this property is true,this
$$DOC{ref:'foam.graphics.CView'}will not paint itself or its
children.
*/},
},
{
name:'className',
help:'CSS class name(s),space separated. Used if adapted with a CViewView.',
defaultValue:'',
documentation:function(){/* CSS class name(s),space separated.
Only used if this is the root node adapted with a $$DOC{ref:'CViewView'}. */}
},
{
name:'x',
type:'int',
view:'IntFieldView',
defaultValue:0,
documentation:function(){/*
The X offset of this view relative to its parent. */}
},
{
name:'y',
type:'int',
view:'IntFieldView',
defaultValue:0,
documentation:function(){/*
The Y offset of this view relative to its parent. */}
},
{
name:'width',
type:'int',
view:'IntFieldView',
defaultValue:10,
documentation:function(){/*
The width of this view. Painting is not automatically clipped,so a view
may render outside of its apparent rectangle. */},
},
{
name:'height',
type:'int',
view:'IntFieldView',
defaultValue:10,
documentation:function(){/*
The height of this view. Painting is not automatically clipped,so a view
may render outside of its apparent rectangle. */}
},
{
name:'alpha',
type:'float',
defaultValue:1,
documentation:function(){/*
The desired opacity of the content,from 0:transparent to 1:opaque.
Child views do not inherit and are not limited by this value. */}
},
{
name:'color',
label:'Foreground Color',
type:'String',
defaultValue:'black',
documentation:function(){/*
The foreground color for rendering primary content. */}
},
{
name:'background',
label:'Background Color',
type:'String',
defaultValue:'white',
documentation:function(){/*
The optional background color for opaque items that $$DOC{ref:'.erase'}
their background. */}
},
{
name:'font',
documentation:function(){/*
The font to use for rendering text,in CSS string format:<code>'24px Roboto'</code>. */}
},
{
name:'clipped',
model_:'BooleanProperty',
defaultValue:false
}
],
methods:{
toView_:function(){/* Internal. Creates a CViewView wrapper. */
if(!this.view){
var params={cview:this};
if(this.className)params.className=this.className;
if(this.tooltip)params.tooltip=this.tooltip;
if(this.speechLabel)params.speechLabel=this.speechLabel;
if(this.tabIndex)params.tabIndex=this.tabIndex;
if(this.role)params.role=this.role;
this.view=this.CViewView.create(params);
}
return this.view;
},
toPositionedView_:function(){/* Internal. Creates a PositionedCViewView wrapper. */
if(!this.view){
var params={cview:this};
if(this.className)params.className=this.className;
this.view=this.PositionedCViewView.create(params);
}
return this.view;
},
initCView:function(){/* Override in submodels for initialization. Callled
once on first $$DOC{ref:'.paint'}when transitioning from 'initial'
to 'active' '$$DOC{ref:'.state'}. */},
write:function(document){/* Inserts this $$DOC{ref:'foam.graphics.CView'}into the DOM
with an $$DOC{ref:'foam.graphics.AbstractCViewView'}wrapper. */
var v=this.toView_();
document.writeln(v.toHTML());
v.initHTML();
},
addChild:function(child){/* Adds a child $$DOC{ref:'foam.graphics.CView'}to the scene
under this. */
this.SUPER(child);
if(this.view){
child.view=this.view;
child.addListener(this.view.paint);
}
return this;
},
removeChild:function(child){/* Removes a child from the scene. */
this.SUPER(child);
child.view=undefined;
child.removeListener(this.view.paint);
return this;
},
erase:function(){/* Wipes the canvas area of this $$DOC{ref:'.'}. Primarily used
by the root node to clear the entire canvas,but an opaque child
may choose to erase its own area,if required. */
this.canvas.clearRect(0,0,this.width,this.height);
this.canvas.fillStyle=this.background;
this.canvas.fillRect(0,0,this.width,this.height);
},
paintChildren:function(){/* Paints each child. */
for(var i=0;i<this.children.length;i++){
var child=this.children[i];
this.canvas.save();
this.canvas.beginPath();
child.paint();
this.canvas.restore();
}
},
paintSelf:function(){/* Implement this in sub-models to do your painting. */},
paint:function(){/* Translates the canvas to our($$DOC{ref:'.x'},$$DOC{ref:'.y'}),
does a $$DOC{ref:'.paintSelf'}then paints all the children. */
if(!this.$)return;
if(this.state==='initial'){
this.initCView();
this.state='active';
}
if(this.suspended)return;
this.canvas.save();
this.canvas.translate(this.x,this.y);
if(this.clipped){
this.canvas.rect(0,0,this.width,this.height);
this.canvas.clip();
}
this.paintSelf();
this.paintChildren();
this.canvas.restore();
},
mapToParent:function(point){/* Maps a coordinate from this to our parents'. */
point.x +=this.x;
point.y +=this.y;
return point;
},
mapToCanvas:function(point){/* Maps a coordinate from this to the canvas.
Useful for sharing a point between sibling or cousin items. */
this.mapToParent(point);
if(this.parent && this.parent.mapToCanvas){
return this.parent.mapToCanvas(point);
}else{
return point;
}
},
}
});
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
package:'foam.graphics',
name:'Circle',
extendsModel:'foam.graphics.CView',
properties:[
{
name:'border',
label:'Border Color',
type:'String',
defaultValue:undefined
},
{
name:'borderWidth',
type:'int',
defaultValue:1
},
{
name:'r',
label:'Radius',
type:'int',
defaultValue:20
},
{
name:'startAngle',
defaultValue:0
},
{
name:'endAngle',
label:'Radius',
type:'int',
defaultValue:Math.PI*2
},
{
name:'width',
defaultValueFn:function(){return 2*this.r;}
},
{
name:'height',
defaultValueFn:function(){return 2*this.r;}
}
],
methods:{
paintSelf:function(){
var c=this.canvas;
if(!c)return;
c.globalAlpha=this.alpha;
if(!this.r)return;
if(this.color){
c.beginPath();
c.moveTo(0,0);
c.arc(0,0,this.r,-this.endAngle,-this.startAngle,false);
c.closePath();
c.fillStyle=this.color;
c.fill();
}
if(this.border){
c.lineWidth=this.borderWidth;
c.beginPath();
c.arc(0,0,this.r+this.borderWidth/2-0.1,-this.endAngle,-this.startAngle,false);
c.closePath();
c.strokeStyle=this.border;
c.stroke();
}
}
}
});
/**
* @license
* Copyright 2015 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
name:'Halo',
package:'foam.ui.md',
extendsModel:'foam.graphics.Circle',
constant:{
RING_INNER_COLOR:'rgba(0,0,0,0)'
},
properties:[
{
name:'style',
documentation:'solid|ring',
defaultValue:'solid',
postSet:function(_,nu){
if(nu !==this.RING_INNER_COLOR)this.setColorAndBorder();
}
},
{
name:'state_',
defaultValue:'default'
},
{
name:'easeInTime',
defaultValue:200
},
{
name:'easeOutTime',
defaultValue:150
},
{
name:'startAlpha',
defaultValue:0.8
},
{
name:'pressedAlpha',
defaultValue:0.4
},
{
name:'finishAlpha',
defaultValue:0
}
],
methods:[
{
name:'setColorAndBorder',
code:function(){
if(this.style==='ring'){
var color=this.color;
this.border=color;
this.borderWidth=12;
this.color=this.RING_INNER_COLOR;
}
}
},
{
name:'initCView',
code:function(){
this.$.addEventListener('mousedown',this.onMouseDown);
this.$.addEventListener('mouseup',this.onMouseUp);
this.$.addEventListener('mouseleave',this.onMouseUp);
this.$.addEventListener('touchstart',this.onMouseDown);
this.$.addEventListener('touchend',this.onMouseUp);
this.$.addEventListener('touchleave',this.onMouseUp);
this.$.addEventListener('touchcancel',this.onMouseUp);
}
}
],
listeners:[
{
name:'onMouseDown',
code:function(evt){
if(this.state_ !=='default')return;
this.state_='pressing';
if(evt.type==='touchstart'){
var rect=this.$.getBoundingClientRect();
var t=evt.touches[0];
this.x=t.pageX - rect.left;
this.y=t.pageY - rect.top;
}else{
this.x=evt.offsetX;
this.y=evt.offsetY;
}
this.r=2;
this.alpha=this.startAlpha;
this.X.animate(this.easeInTime,function(){
this.x=this.parent.width/2;
this.y=this.parent.height/2;
this.r=Math.min(28,Math.min(this.$.width,this.parent.height)/2);
this.alpha=this.pressedAlpha;
}.bind(this),undefined,function(){
if(this.state_==='cancelled'){
this.state_='pressed';
this.onMouseUp();
}else{
this.state_='pressed';
}
}.bind(this))();
}
},
{
name:'onMouseUp',
code:function(evt){
if(this.state_==='default')return;
if(this.state_==='pressing'){this.state_='cancelled';return;}
if(this.state_==='cancelled')return;
this.state_='released';
this.X.animate(
this.easeOutTime,
function(){this.alpha=this.finishAlpha;}.bind(this),
Movement.easeIn(.5),
function(){this.state_='default';}.bind(this))();
}
}
]
});
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
* A sub-set of the DOM Element interface that we use for FOAM tag parsing.
* This lets us transparently build FOAM objects and views from either real DOM
* or from the output of FOAM's HTML parser.
**/
CLASS({
package:'foam.html',
name:'Element',
constants:{
OPTIONAL_CLOSE_TAGS:{
HTML:true,
HEAD:true,
BODY:true,
P:true,
DT:true,
DD:true,
LI:true,
OPTION:true,
THEAD:true,
TH:true,
TBODY:true,
TR:true,
TD:true,
TFOOT:true,
COLGROUP:true,
},
ILLEGAL_CLOSE_TAGS:{
IMG:true,
INPUT:true,
BR:true,
HR:true,
FRAME:true,
AREA:true,
BASE:true,
BASEFONT:true,
COL:true,
ISINDEX:true,
LINK:true,
META:true,
PARAM:true
}
},
properties:[
{
name:'id'
},
{
name:'nodeName'/*,
preSet:function(_,v){
return v.toLowerCase();
}*/
},
{
name:'attributeMap_',
factory:function(){return{};}
},
{
name:'attributes',
factory:function(){return [];},
postSet:function(_,attrs){
for(var i=0;i<attrs.length;i++)
this.attributeMap_[attrs[i].name]=attrs[i];
}
},
{
name:'childNodes',
factory:function(){return [];}
},
{
name:'children',
getter:function(){
return this.childNodes.filter(function(c){return typeof c !=='string';});
}
},
{
name:'outerHTML',
getter:function(){
var out='<'+this.nodeName;
if(this.id)out +=' id="'+this.id+'"';
for(key in this.attributeMap_){
var value=this.attributeMap_[key].value;
out +=value==undefined?
' '+key:
' '+key+'="'+this.attributeMap_[key].value+'"';
}
if(!this.ILLEGAL_CLOSE_TAGS[this.nodeName] &&
(!this.OPTIONAL_CLOSE_TAGS[this.nodeName]||this.childNodes.length)){
out +='>';
out +=this.innerHTML;
out +='</'+this.nodeName;
}
out +='>';
return out;
}
},
{
name:'innerHTML',
getter:function(){
var out='';
for(var i=0;i<this.childNodes.length;i++)
out +=this.childNodes[i].toString();
return out;
}
}
],
methods:{
setAttribute:function(name,value){
var attr=this.getAttributeNode(name);
if(attr){
attr.value=value;
}else{
attr={name:name,value:value};
this.attributes.push(attr);
this.attributeMap_[name]=attr;
}
},
getAttributeNode:function(name){return this.attributeMap_[name];},
getAttribute:function(name){
var attr=this.getAttributeNode(name);
return attr && attr.value;
},
appendChild:function(c){this.childNodes.push(c);},
toString:function(){return this.outerHTML;}
}
});
var HTMLParser={
__proto__:grammar,
create:function(){
return{
__proto__:this,
stack:[ X.foam.html.Element.create({nodeName:'html'})]
}
},
peek:function(){return this.stack[this.stack.length-1];},
START:sym('html'),
html:repeat(simpleAlt(
sym('comment'),
sym('text'),
sym('endTag'),
sym('startTag'))),
startTag:seq(
'<',
sym('tagName'),
sym('whitespace'),
sym('attributes'),
sym('whitespace'),
optional('/'),
'>'),
endTag:(function(){
var endTag_=sym('endTag_');
return function(ps){
return this.stack.length>1?this.parse(endTag_,ps):undefined;
};
})(),
endTag_:seq1(1,'</',sym('tagName'),'>'),
comment:seq('<!--',repeat(not('-->',anyChar)),'-->'),
attributes:repeat(sym('attribute'),sym('whitespace')),
label:str(plus(notChars('=/\t\r\n<>\'"'))),
tagName:sym('label'),
text:str(plus(alt('<%',notChar('<')))),
attribute:seq(sym('label'),optional(seq1(1,'=',sym('value')))),
value:str(alt(
plus(alt(range('a','z'),range('A','Z'),range('0','9'))),
seq1(1,'"',repeat(notChar('"')),'"')
)),
whitespace:repeat(alt(' ','\t','\r','\n'))
}.addActions({
START:function(xs){
var ret=this.stack[0];
this.stack=[ X.foam.html.Element.create({nodeName:'html'})];
return ret;
},
attribute:function(xs){return{name:xs[0],value:xs[1]};},
text:function(xs){this.peek()&& this.peek().appendChild(xs);},
startTag:function(xs){
var tag=xs[1];
var obj=X.foam.html.Element.create({nodeName:tag,attributes:xs[3]});
this.peek()&& this.peek().appendChild(obj);
if(xs[5] !='/')this.stack.push(obj);
return obj;
},
endTag:function(tag){
var stack=this.stack;
while(stack.length>1){
if(this.peek().nodeName===tag){
stack.pop();
return;
}
var top=stack.pop();
this.peek().childNodes=this.peek().childNodes.concat(top.childNodes);
top.childNodes=[];
}
}
});
/*
function test(html){
console.log('\n\nparsing:',html);
var p=HTMLParser.create();
var res=p.parseString(html);
if(res){
console.log('Result:',res.toString());
}else{
console.log('error');
}
}
test('<ba>foo</ba>');
test('<p>');
test('foo');
test('foo bar');
test('foo</end>');
test('<b>foo</b></foam>');
test('<pA a="1">foo</pA>');
test('<pA a="1" b="2">foo<b>bold</b></pA>');
*/
TemplateParser.foamTag_=FOAMTagParser.create().export('START');
invalidateParsers();
/**
* @license
* Copyright 2012 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var Visitor={
create:function(){
return{__proto__:this,stack:[]};
},
push:function(o){this.stack.push(o);},
pop:function(){return this.stack.pop();},
top:function(){
return this.stack.length && this.stack[this.stack.length-1];
},
visit:function(o){
return Array.isArray(o)?this.visitArray(o):
(typeof o==='string')?this.visitString(o):
(typeof o==='number')?this.visitNumber(o):
(o instanceof Function)?this.visitFunction(o):
(o instanceof Date)?this.visitDate(o):
(o===true)?this.visitTrue():
(o===false)?this.visitFalse():
(o===null)?this.visitNull():
(o instanceof Object)?(o.model_?
this.visitObject(o):
this.visitMap(o)
):this.visitUndefined();
},
visitArray:function(o){
var len=o.length;
for(var i=0;i<len;i++)this.visitArrayElement(o,i);
return o;
},
visitArrayElement:function(arr,i){this.visit(arr[i]);},
visitString:function(o){return o;},
visitFunction:function(o){return o;},
visitNumber:function(o){return o;},
visitDate:function(o){return o;},
visitObject:function(o){
for(var key in o.model_.properties){
var prop=o.model_.properties[key];
if(prop.name in o.instance_){
this.visitProperty(o,prop);
}
}
return o;
},
visitProperty:function(o,prop){this.visit(o[prop.name]);},
visitMap:function(o){
for(var key in o){this.visitMapElement(key,o[key]);};
return o;
},
visitMapElement:function(key,value){},
visitTrue:function(){return true;},
visitFalse:function(){return false;},
visitNull:function(){return null;},
visitUndefined:function(){return undefined;}
};
/**
* @license
* Copyright 2012 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
INTERFACE({
name:'FlowControl',
description:'DAO FLow Control. Used to control select()behavior.',
methods:[
{
name:'stop'
},
{
name:'error',
args:[
{name:'e',type:'Object'}
]
},
{
name:'isStopped',
description:'Returns true iff this selection has been stopped.',
returnType:'Boolean'
},
{
name:'getError',
description:'Returns error passed to error(),or undefined if error()never called',
returnType:'Object'
}
/*
{
name:'advance',
description:'Advance selection to the specified key.',
args:[
{name:'key',type:'Object'},
{name:'inclusive',type:'Object',optional:true,defaultValue:true},
]
}*/
]
});
INTERFACE({
name:'Sink',
description:'Data Sink',
documentation:function(){/*
<p>The $$DOC{ref:'Sink'}$$DOC{ref:'Interface'}forms the basis for all data
access. At a minimum,data stores must support the
$$DOC{ref:'.put'}and $$DOC{ref:'.remove'}operations.</p>
*/},
methods:[
{
name:'put',
description:'Put(add)an object to the Sink.',
documentation:"<p>Adds the given object to the store.<p>",
args:[
{name:'obj',type:'Object',documentation:'The object to add.'},
{name:'sink',type:'Sink',documentation:'<p>The next sink to chain:sink.put(obj)is called after this.put()completes.</p>'}
]
},
{
name:'remove',
description:'Remove a single object.',
documentation:"Removes the given object from the store.",
args:[
{name:'obj',type:'Object',documentation:'The object to remove.'},
{name:'sink',type:'Sink',documentation:'<p>The next sink to chain:sink.remove(obj)is called after this.remove()completes.</p>'}
]
},
{
name:'error',
description:'Report an error.',
documentation:"<p>Report an error to the $$DOC{ref:'Sink'}.</p>",
args:[
{name:'obj',type:'Object'}
]
},
{
name:'eof',
description:'Indicate that no more operations will be performed on the Sink.',
documentation:"<p>Indicates that no more operations will be performed on the $$DOC{ref:'Sink'}.</p>"
}
]
});
INTERFACE({
name:'Predicate',
description:'A boolean Predicate.',
methods:[
{
name:'f',
description:'Find a single object,using either a Predicate or the primary-key.',
returnType:'Boolean',
args:[
{name:'o',description:'The object to be predicated.'}
]
},
]
});
INTERFACE({
name:'Comparator',
description:'A strategy for comparing pairs of Objects.',
methods:[
{
name:'compare',
description:'Compare two objects,returning 0 if they are equal,>0 if the first is larger,and<0 if the second is.',
returnType:'Int',
args:[
{name:'o1',description:'The first object to be compared.'},
{name:'o2',description:'The second object to be compared.'}
]
},
]
});
INTERFACE({
name:'DAO',
description:'Data Access Object',
extends:['Sink'],
methods:[
{
name:'find',
description:'Find a single object,using either a Predicate or the primary-key.',
args:[
{name:'key',type:'Predicate|Object'},
{name:'sink',type:'Sink'}
]
},
{
name:'removeAll',
description:'Remove all(scoped)objects.',
args:[
{name:'sink',type:'Sink'},
{name:'options',type:'Object',optional:true}
]
},
{
name:'select',
description:'Select all(scoped)objects.',
args:[
{name:'sink',type:'SinkI',optional:true,help:'Defaults to [].'},
{name:'options',type:'Object',optional:true}
]
},
{
name:'pipe',
description:'The equivalent of doing a select()followed by a listen().',
args:[
{name:'sink',type:'Sink'},
{name:'options',type:'Object',optional:true}
]
},
{
name:'listen',
description:'Listen for future(scoped)updates to the DAO.',
args:[
{name:'sink',type:'Sink'},
{name:'options',type:'Object',optional:true}
]
},
{
name:'unlisten',
description:'Remove a previously registered listener.',
args:[
{name:'sink',type:'Sink'}
]
},
{
name:'where',
description:'Return a DAO that will be filtered to the specified predicate.',
returnValue:'DAO',
args:[
{name:'query',type:'Predicate'}
]
},
{
name:'limit',
description:'Return a DAO that will limit future select()\'s to the specified number of results.',
returnValue:'DAO',
args:[
{name:'count',type:'Int'}
]
},
{
name:'skip',
description:'Return a DAO that will skip the specified number of objects from future select()\'s',
returnValue:'DAO',
args:[
{name:'skip',type:'Int'}
]
},
{
name:'orderBy',
description:'Return a DAO that will order future selection()\'s by the specified sort order.',
returnValue:'DAO',
args:[
{
name:'comparators',
rest:true,
type:'Comparator',
description:'One or more comparators that specify the sort-order.'
}
]
}
]
});
var LoggingDAO={
create:function(/*[logger],delegate*/){
var logger,delegate;
if(arguments.length==2){
logger=arguments[0];
delegate=arguments[1];
}else{
logger=console.log.bind(console);
delegate=arguments[0];
}
return{
__proto__:delegate,
put:function(obj,sink){
logger('put',obj);
delegate.put(obj,sink);
},
remove:function(query,sink){
logger('remove',query);
delegate.remove(query,sink);
},
select:function(sink,options){
logger('select',options||"");
return delegate.select(sink,options);
},
removeAll:function(sink,options){
logger('removeAll',options);
return delegate.removeAll(sink,options);
}
};
}
};
var TimingDAO={
create:function(name,delegate){
var id;
var activeOps={put:0,remove:0,find:0,select:0};
function start(op){
var str=name+'-'+op;
var key=activeOps[op]++?str+'-' +(id++):str;
console.time(id);
return [key,str,window.performance.now(),op];
}
function end(act){
activeOps[act[3]]--;
id--;
console.timeEnd(act[0]);
console.log('Timing:',act[1],' ',(window.performance.now()-act[2]).toFixed(3),' ms');
}
function endSink(act,sink){
return{
put:function(){end(act);sink && sink.put && sink.put.apply(sink,arguments);},
remove:function(){end(act);sink && sink.remove && sink.remove.apply(sink,arguments);},
error:function(){end(act);sink && sink.error && sink.error.apply(sink,arguments);},
eof:function(){end(act);sink && sink.eof && sink.eof.apply(sink,arguments);}
};
}
return{
__proto__:delegate,
put:function(obj,sink){
var act=start('put');
delegate.put(obj,endSink(act,sink));
},
remove:function(query,sink){
var act=start('remove');
delegate.remove(query,endSink(act,sink));
},
find:function(key,sink){
var act=start('find');
delegate.find(key,endSink(act,sink));
},
select:function(sink,options){
var act=start('select');
var fut=afuture();
delegate.select(sink,options)(function(s){
end(act);
fut.set(s);
});
return fut.get;
}
};
}
};
var ObjectToJSON={
__proto__:Visitor.create(),
visitFunction:function(o){
return o.toString();
},
visitObject:function(o){
this.push({
model_:(o.model_.package?o.model_.package+'.':'')+ o.model_.name
});
this.__proto__.visitObject.call(this,o);
return this.pop();
},
visitProperty:function(o,prop){
prop.propertyToJSON(this,this.top(),o);
},
visitMap:function(o){
this.push({});
Visitor.visitMap.call(this,o);
return this.pop();
},
visitMapElement:function(key,value){this.top()[key]=this.visit(value);},
visitArray:function(o){
this.push([]);
this.__proto__.visitArray.call(this,o);
return this.pop();
},
visitArrayElement:function(arr,i){this.top().push(this.visit(arr[i]));}
};
var JSONToObject={
__proto__:ObjectToJSON.create(),
visitString:function(o){
try{
return o.substr(0,9)==='function('?
eval('('+o+')'):
o;
}catch(x){
console.log(x,o);
return o;
}
},
visitObject:function(o){
var model=FOAM.lookup(o.model_);
if(!model)throw('Unknown Model:',o.model_);
var obj=model.create();
Object_forEach(o,(function(value,key){
if(key !=='model_')obj[key]=this.visit(value);
}).bind(this));
return obj;
},
visitArray:Visitor.visitArray,
visitArrayElement:function(arr,i){arr[i]=this.visit(arr[i]);}
};
CLASS({
name:'AbstractDAO',
documentation:function(){/*
The base for most DAO implementations,$$DOC{ref:'.'}provides basic facilities for
$$DOC{ref:'.where'},$$DOC{ref:'.limit'},$$DOC{ref:'.skip'},and $$DOC{ref:'.orderBy'}
operations,and provides for notifications of updates through $$DOC{ref:'.listen'}.
*/},
properties:[
{
name:'daoListeners_',
transient:true,
hidden:true,
factory:function(){return [];}
}
],
methods:{
update:function(expr){/* Applies a change to the DAO contents. */
return this.select(UPDATE(expr,this));
},
listen:function(sink,options){/* Send future changes to sink. */
sink=this.decorateSink_(sink,options,true);
this.daoListeners_.push(sink);
},
select:function(sink,options){
/* Template method. Override to copy the contents of this DAO(filtered or ordered as
necessary)to sink. */
},
remove:function(query,sink){
/* Template method. Override to remove matching items and put them into sink if supplied. */
},
pipe:function(sink,options){/* A $$DOC{ref:'.select'}followed by $$DOC{ref:'.listen'}.
Dump our contents to sink,then send future changes there as well. */
sink=this.decorateSink_(sink,options,true);
var fc=this.createFlowControl_();
var self=this;
this.select({
put:function(){
sink.put && sink.put.apply(sink,arguments);
},
remove:function(){
sink.remove && sink.remove.apply(sink,arguments);
},
error:function(){
sink.error && sink.error.apply(sink,arguments);
},
eof:function(){
if(fc.stopped){
sink.eof && sink.eof();
}else{
self.listen(sink,options);
}
}
},options,fc);
},
decorateSink_:function(sink,options,isListener,disableLimit){
if(options){
if(!disableLimit){
if(options.limit)sink=limitedSink(options.limit,sink);
if(options.skip)sink=skipSink(options.skip,sink);
}
if(options.order && !isListener){
sink=orderedSink(options.order,sink);
}
if(options.query){
sink=predicatedSink(
options.query.partialEval?
options.query.partialEval():
options.query,
sink);
}
}
return sink;
},
createFlowControl_:function(){
return{
stop:function(){this.stopped=true;},
error:function(e){this.errorEvt=e;}
};
},
where:function(query){/* Return a DAO that contains a filtered subset of this one. */
return(this.X||X).FilteredDAO_.create({query:query,delegate:this});
},
limit:function(count){/* Return a DAO that contains a count limited subset of this one. */
return(this.X||X).LimitedDAO_.create({count:count,delegate:this});
},
skip:function(skip){/* Return a DAO that contains a subset of this one,skipping initial items. */
return(this.X||X).SkipDAO_.create({skip:skip,delegate:this});
},
orderBy:function(){/* Return a DAO that contains a subset of this one,ordered as specified. */
return(this.X||X).OrderedDAO_.create({comparator:arguments.length==1?arguments[0]:argsToArray(arguments),delegate:this});
},
unlisten:function(sink){/* Stop sending updates to the given sink. */
var ls=this.daoListeners_;
for(var i=0;i<ls.length;i++){
if(ls[i].$UID===sink.$UID){
ls.splice(i,1);
return true;
}
}
},
removeAll:function(sink,options){/* Default $$DOC{ref:'.removeAll'}:calls
$$DOC{ref:'.select'}with the same options and calls $$DOC{ref:'.remove'}
for all returned values. */
var self=this;
var future=afuture();
this.select({
put:function(obj){
self.remove(obj,{remove:sink && sink.remove});
}
})(function(){
sink && sink.eof();
future.set();
});
return future.get;
},
/**
* Notify all listeners of update to DAO.
* @param fName the name of the method in the listeners to call.
* possible values:'put','remove'
**/
notify_:function(fName,args){
for(var i=0;i<this.daoListeners_.length;i++){
var l=this.daoListeners_[i];
var fn=l[fName];
if(fn){
args[2]={
stop:(function(fn,l){
return function(){fn(l);};
})(this.unlisten.bind(this),l),
error:function(e){/* Don't care. */}
};
try{
fn.apply(l,args);
}catch(err){
if(err !==this.UNSUBSCRIBE_EXCEPTION){
console.error('Error delivering event(removing listener):',fName,err);
}
this.unlisten(l);
}
}
}
}
}
});
function limitedDAO(count,dao){
return{
__proto__:dao,
select:function(sink,options){
if(options){
if('limit' in options){
options={
__proto__:options,
limit:Math.min(count,options.limit)
};
}else{
options={__proto__:options,limit:count};
}
}
else{
options={limit:count};
}
return dao.select(sink,options);
},
toString:function(){
return dao+'.limit('+count+')';
}
};
}
var WaitCursorDAO=FOAM({
model_:'Model',
name:'WaitCursorDAO',
extendsModel:'ProxyDAO',
properties:[
{
name:'count',
defaultValue:0,
postSet:function(oldValue,newValue){
if(!this.window)return;
if(oldValue==0)DOM.setClass(this.window.document.body,'waiting');
else if(newValue==0)DOM.setClass(this.window.document.body,'waiting',false);
}
},
{
name:'window'
}
],
methods:{
select:function(sink,options){
var self=this;
var future=afuture();
this.count++;
var f=function(){
self.delegate.select(sink,options)(function(sink){
try{
future.set(sink);
}finally{
self.count--;
}
});
};
if(this.count>1){f();}else{this.window.setTimeout(f,1);};
return future.get;
}
}
});
Function.prototype.put=function(){this.apply(this,arguments);};
Function.prototype.remove=function(){this.apply(this,arguments);};
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
(function(){
var pmap={};
for(var key in AbstractDAO.methods){
pmap[AbstractDAO.methods[key].name]=AbstractDAO.methods[key].code;
}
defineProperties(Array.prototype,pmap);
})();
defineLazyProperty(Array.prototype,'daoListeners_',function(){
return{
value:[],
configurable:true
};
});
var ArraySink={
__proto__:Array.prototype,
put:function(obj,sink){
this.push(obj);
this.notify_('put',arguments);
sink && sink.put && sink.put(obj);
},
clone:function(){
return this.slice(0).sink;
},
deepClone:function(){
var a=this.slice(0);
for(var i=0;i<a.length;i++){
a[i]=a[i].deepClone();
}
return a.sink;
}
};
Object.defineProperty(Array.prototype,'dao',{
get:function(){this.__proto__=Array.prototype;return this;},
writeable:true
});
Object.defineProperty(Array.prototype,'sink',{
get:function(){this.__proto__=ArraySink;return this;},
writeable:true
});
defineProperties(Array.prototype,{
listen:AbstractDAO.getPrototype().listen,
unlisten:AbstractDAO.getPrototype().unlisten,
notify_:AbstractDAO.getPrototype().notify_,
/*
listen:function(){},
unlisten:function(){},
notify_:function(){},
*/
deleteF:function(v){
var a=this.clone();
for(var i=0;i<a.length;i++){
if(a[i]===v){a.splice(i,1);break;}
}
return a;
},
deleteI:function(v){
for(var i=0;i<this.length;i++){
if(this[i]===v){this.splice(i,1);return true;}
}
return false;
},
removeF:function(p){
var a=this.clone();
for(var i=0;i<a.length;i++){
if(p.f(a[i])){a.splice(i,1);break;}
}
return a;
},
removeI:function(p){
for(var i=0;i<this.length;i++){
if(p.f(this[i])){this.splice(i,1);breeak;}
}
return this;
},
pushF:function(obj){
var a=this.clone();
a.push(obj);
return a;
},
clone:function(){
return this.slice(0);
},
deepClone:function(){
var a=this.slice(0);
for(var i=0;i<a.length;i++){
a[i]=a[i].deepClone();
}
return a;
},
id:function(obj){
return obj.id||obj.$UID;
},
put:function(obj,sink){
for(var idx in this){
if(this[idx].id===obj.id){
this[idx]=obj;
sink && sink.put && sink.put(obj);
this.notify_('put',arguments);
return;
}
}
this.push(obj);
this.notify_('put',arguments);
sink && sink.put && sink.put(obj);
},
find:function(query,sink){
if(query.f){
for(var idx in this){
if(query.f(this[idx])){
sink && sink.put && sink.put(this[idx]);
return;
}
}
}else{
for(var idx in this){
if(this[idx].id===query){
sink && sink.put && sink.put(this[idx]);
return;
}
}
}
sink && sink.error && sink.error('find',query);
},
remove:function(obj,sink){
if(!obj){
sink && sink.error && sink.error('missing key');
return;
}
var objId=obj.id;
var id=(objId !==undefined && objId !=='')?objId:obj;
for(var idx in this){
if(this[idx].id===id){
var rem=this.splice(idx,1)[0];
sink && sink.remove && sink.remove(rem[0]);
return;
}
}
sink && sink.error && sink.error('remove',obj);
},
removeAll:function(sink,options){
if(!options)options={};
if(!options.query)options.query={f:function(){return true;}};
for(var i=0;i<this.length;i++){
var obj=this[i];
if(options.query.f(obj)){
var rem=this.splice(i,1)[0];
sink && sink.remove && sink.remove(rem);
i--;
}
}
sink && sink.eof && sink.eof();
return anop();
},
select:function(sink,options){
sink=sink||[].sink;
var hasQuery=options &&(options.query||options.order);
var originalsink=sink;
sink=this.decorateSink_(sink,options,false,!hasQuery);
if(!hasQuery && GLOBAL.CountExpr && CountExpr.isInstance(sink)){
sink.count=this.length;
return aconstant(originalsink);
}
var fc=this.createFlowControl_();
var start=Math.max(0,hasQuery?0:(options && options.skip)||0);
var end=hasQuery?
this.length:
Math.min(this.length,start +((options && options.limit)||this.length));
for(var i=start;i<end;i++){
sink.put(this[i],null,fc);
if(fc.stopped)break;
if(fc.errorEvt){
sink.error && sink.error(fc.errorEvt);
return aconstant(originalsink,fc.errorEvt);
}
}
sink.eof && sink.eof();
return aconstant(originalsink);
}
});
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
name:'InputPoint',
properties:[
'id','type',
{name:'done',model_:'BooleanProperty'},
{
name:'x',
documentation:'The real latest X-coordinate. pageX,relative to the whole document,in CSS pixels.',
postSet:function(old,nu){
this.lastX=old;
}
},
{
name:'y',
documentation:'The real latest Y-coordinate. pageY,relative to the whole document,in CSS pixels.',
postSet:function(old,nu){
this.lastY=old;
}
},
{
name:'x0',
documentation:'The first X-coordinate. pageX,relative to the whole document,in CSS pixels. Set to x at creation time.',
factory:function(){return this.x;}
},
{
name:'y0',
documentation:'The first Y-coordinate. pageY,relative to the whole document,in CSS pixels. Set to y at creation time.',
factory:function(){return this.y;}
},
{
name:'lastX',
documentation:'The immediately previous X-coordinate. pageX,relative to the whole document,in CSS pixels. Set to x at creation time.',
factory:function(){return this.x;}
},
{
name:'lastY',
documentation:'The immediately previous Y-coordinate. pageY,relative to the whole document,in CSS pixels. Set to y at creation time.',
factory:function(){return this.y;}
},
{
name:'dx',
getter:function(){return this.x - this.lastX;}
},
{
name:'dy',
getter:function(){return this.y - this.lastY;}
},
{
name:'totalX',
getter:function(){return this.x - this.x0;}
},
{
name:'totalY',
getter:function(){return this.y - this.y0;}
},
'lastTime',
{
name:'shouldPreventDefault',
documentation:'Set me when incoming events should have preventDefault ' +
'called on them',
defaultValue:false
}
]
});
CLASS({
name:'TouchManager',
properties:[
{name:'touches',factory:function(){return{};}}
],
constants:{
TOUCH_START:['touch-start'],
TOUCH_END:['touch-end'],
TOUCH_MOVE:['touch-move']
},
methods:{
init:function(){
this.SUPER();
if(this.X.document)this.install(this.X.document);
},
install:function(d){
d.addEventListener('touchstart',this.onTouchStart);
},
attach:function(e){
e.addEventListener('touchmove',this.onTouchMove);
e.addEventListener('touchend',this.onTouchEnd);
e.addEventListener('touchcancel',this.onTouchCancel);
e.addEventListener('touchleave',this.onTouchEnd);
},
detach:function(e){
e.removeEventListener('touchmove',this.onTouchMove);
e.removeEventListener('touchend',this.onTouchEnd);
e.removeEventListener('touchcancel',this.onTouchCancel);
e.removeEventListener('touchleave',this.onTouchEnd);
},
touchStart:function(i,t,e){
this.touches[i]=this.X.InputPoint.create({
id:i,
type:'touch',
x:t.pageX,
y:t.pageY
});
this.publish(this.TOUCH_START,this.touches[i]);
},
touchMove:function(i,t,e){
var touch=this.touches[i];
touch.x=t.pageX;
touch.y=t.pageY;
touch.lastTime=this.X.performance.now();
if(touch.shouldPreventDefault)e.preventDefault();
this.publish(this.TOUCH_MOVE,this.touch);
},
touchEnd:function(i,t,e){
this.touches[i].x=t.pageX;
this.touches[i].y=t.pageY;
this.touches[i].done=true;
this.publish(this.TOUCH_END,this.touches[i]);
delete this.touches[i];
},
touchCancel:function(i,t,e){
this.touches[i].done=true;
this.publish(this.TOUCH_END,this.touches[i]);
},
touchLeave:function(i,t,e){
this.touches[i].done=true;
this.publish(this.TOUCH_END,this.touches[i]);
}
},
listeners:[
{
name:'onTouchStart',
code:function(e){
this.attach(e.target);
for(var i=0;i<e.changedTouches.length;i++){
var t=e.changedTouches[i];
this.touchStart(t.identifier,t,e);
}
}
},
{
name:'onTouchMove',
code:function(e){
for(var i=0;i<e.changedTouches.length;i++){
var t=e.changedTouches[i];
var id=t.identifier;
if(!this.touches[id]){
console.warn('Touch move for unknown touch.');
continue;
}
this.touchMove(id,t,e);
}
}
},
{
name:'onTouchEnd',
code:function(e){
if(e.cancelable)e.preventDefault();
this.detach(e.target);
for(var i=0;i<e.changedTouches.length;i++){
var t=e.changedTouches[i];
var id=t.identifier;
if(!this.touches[id]){
console.warn('Touch end for unknown touch '+id,Object.keys(this.touches));
continue;
}
this.touchEnd(id,t,e);
}
}
},
{
name:'onTouchCancel',
code:function(e){
this.detach(e.target);
for(var i=0;i<e.changedTouches.length;i++){
var t=e.changedTouches[i];
var id=t.identifier;
if(!this.touches[id]){
console.warn('Touch cancel for unknown touch.');
continue;
}
this.touchCancel(id,t,e);
}
}
},
{
name:'onTouchLeave',
code:function(e){
this.detach(e.target);
for(var i=0;i<e.changedTouches.length;i++){
var t=e.changedTouches[i];
var id=t.identifier;
if(!this.touches[id]){
console.warn('Touch cancel for unknown touch.');
continue;
}
this.touchLeave(id,t,e);
}
}
}
]
});
CLASS({
name:'Gesture',
help:'Installed in the GestureManager to watch for a particular kind of gesture',
properties:[
{name:'name',required:true}
],
constants:{
YES:2,
MAYBE:1,
NO:0
},
methods:{
recognize:function(map){
return this.NO;
},
attach:function(handlers){
},
newPoint:function(point){
}
/*
update:function(changedTouches){
}
*/
}
});
CLASS({
name:'ScrollGesture',
extendsModel:'Gesture',
help:'Gesture that understands vertical or horizontal scrolling.',
properties:[
{
name:'name',
factory:function(){
return this.direction+'Scroll' +(this.momentumEnabled?'Momentum':this.nativeScrolling?'Native':'');
}
},
{
name:'direction',
defaultValue:'vertical'
},
{
name:'isVertical',
factory:function(){return this.direction==='vertical';}
},
{
name:'momentumEnabled',
defaultValue:false,
help:'Set me to true(usually by attaching the "verticalScrollMomentum" gesture)to enable momentum'
},
{
name:'nativeScrolling',
defaultValue:false,
help:'Set me to true(usually by attaching the "verticalScrollNative" gesture)to enable native browser scrolling'
},
{
name:'dragCoefficient',
help:'Each frame,the momentum will be multiplied by this coefficient. Higher means LESS drag.',
defaultValue:0.94
},
{
name:'dragClamp',
help:'The speed threshold(pixels/millisecond)below which the momentum drops to 0.',
defaultValue:0.05
},
{
name:'momentum',
help:'The current speed,in pixels/millisecond,at which the scroller is sliding.',
defaultValue:0
},
{
name:'lastTime',
help:'The performance.now()value for the last time we computed the momentum slide.',
hidden:true,
defaultValue:0
},
{
name:'tickRunning',
help:'True when the physics tick should run.',
hidden:true,
defaultValue:false
},
'handlers'
],
methods:{
recognize:function(map){
if(Object.keys(map).length !==1)return this.NO;
var point=map[Object.keys(map)[0]];
if(point.type==='mouse'||point.done)return this.NO;
if(Math.abs(this.momentum)>0)return this.YES;
var delta=Math.abs(this.isVertical?point.totalY:point.totalX);
return delta>10?this.YES:this.MAYBE;
},
attach:function(map,handlers){
var point=map[Object.keys(map)[0]];
this.handlers=handlers||[];
if(this.nativeScrolling)return;
(this.isVertical?point.y$:point.x$).addListener(this.onDelta);
point.done$.addListener(this.onDone);
if(this.momentum===0){
this.pingHandlers(this.direction+'ScrollStart',0,0,this.isVertical?point.y0:point.x0);
}else{
this.tickRunning=false;
}
},
pingHandlers:function(method,d,t,c){
for(var i=0;i<this.handlers.length;i++){
var h=this.handlers[i];
h && h[method] && h[method](d,t,c,this.stopMomentum);
}
},
sendEndEvent:function(point){
var delta=this.isVertical?point.dy:point.dx;
var total=this.isVertical?point.totalY:point.totalX;
var current=this.isVertical?point.y:point.x;
this.pingHandlers(this.direction+'ScrollEnd',delta,total,current);
},
calculateInstantaneousVelocity:function(point){
var now=this.X.performance.now();
var lastTime=this.tickRunning?this.lastTime:point.lastTime;
var velocity=(this.isVertical?point.dy:point.dx)/(now - point.lastTime);
if(this.tickRunning)this.lastTime=now;
return velocity;
}
},
listeners:[
{
name:'onDelta',
code:function(obj,prop,old,nu){
if(this.momentumEnabled){
var velocity=this.calculateInstantaneousVelocity(obj);
var delta=velocity - this.momentum;
this.momentum +=delta;
}
var delta=this.isVertical?obj.dy:obj.dx;
var total=this.isVertical?obj.totalY:obj.totalX;
var current=this.isVertical?obj.y:obj.x;
this.pingHandlers(this.direction+'ScrollMove',delta,total,current);
}
},
{
name:'onDone',
code:function(obj,prop,old,nu){
(this.isVertical?obj.y$:obj.x$).removeListener(this.onDelta);
obj.done$.removeListener(this.onDone);
if(this.momentumEnabled){
if(Math.abs(this.momentum)<this.dragClamp){
this.momentum=0;
this.sendEndEvent(obj);
}else{
this.tickRunning=true;
this.lastTime=this.X.performance.now();
this.tick(obj);
}
}else{
this.sendEndEvent(obj);
}
}
},
{
name:'tick',
isFramed:true,
code:function(touch){
if(!this.tickRunning)return;
var xy=this.isVertical?'y':'x';
var now=this.X.performance.now();
var elapsed=now - this.lastTime;
this.lastTime=now;
var distance=this.momentum * elapsed;
touch[xy] +=distance;
var delta,total,current;
if(this.isVertical){delta=touch.dy;total=touch.totalY;current=touch.y;}
else{delta=touch.dx;total=touch.totalX;current=touch.x;}
if(delta !=0)
this.pingHandlers(this.direction+'ScrollMove',delta,total,current);
this.momentum *=this.dragCoefficient;
if(Math.abs(this.momentum)<this.dragClamp){
this.momentum=0;
this.tickRunning=false;
this.sendEndEvent(touch);
}else{
this.tick(touch);
}
}
},
{
name:'stopMomentum',
documentation:'Passed to scroll handlers. Can be used to stop momentum from continuing after scrolling has reached the edge of the target\'s scrollable area.',
code:function(){
this.momentum=0;
}
}
]
});
CLASS({
name:'VerticalScrollNativeTrait',
documentation:'Makes(part of)a View scroll vertically. Expects scrollerID to be a property,giving the DOM ID of the element with overflow:scroll or similar. Any onScroll listener will be called on each scroll event,as per the verticalScrollNative gesture. NB:this.onScroll should be a listener,because this trait does not bind it.',
properties:[
{
name:'scroller$',
documentation:'A convenience that returns the scroller\'s DOM element.',
getter:function(){return this.X.$(this.scrollerID);}
},
{
name:'scrollGesture',
documentation:'The currently installed ScrollGesture.',
hidden:true,
transient:true,
lazyFactory:function(){
if(!this.scrollerID){
console.warn('VerticalScrollNativeTrait attached to View without a scrollerID property set.');
return '';
}
return this.X.GestureTarget.create({
containerID:this.scrollerID,
handler:this,
gesture:'verticalScrollNative'
});
}
}
],
methods:{
initHTML:function(){
this.SUPER();
this.X.gestureManager.install(this.scrollGesture);
/* Checks for this.onScroll. If found,will attach a scroll event listener for it. */
if(this.onScroll)
this.scroller$.addEventListener('scroll',this.onScroll);
},
destroy:function(){
this.SUPER();
this.X.gestureManager.uninstall(this.scrollGesture);
if(this.onScroll && this.scroller$)
this.scroller$.removeEventListener('scroll',this.onScroll)
}
}
});
CLASS({
name:'TapGesture',
extendsModel:'Gesture',
help:'Gesture that understands a quick,possible multi-point tap. Calls into the handler:tapClick(numberOfPoints).',
properties:[
{
name:'name',
defaultValue:'tap'
},
'handlers'
],
methods:{
recognize:function(map){
var response;
var doneCount=0;
var self=this;
var keys=Object.keys(map);
for(var i=0;i<keys.length;i++){
var key=keys[i];
var p=map[key];
if(Math.abs(p.totalX)>=10 && Math.abs(p.totalY)>=10){
return this.NO;
}
if(p.done)doneCount++;
}
if(response===this.NO)return response;
return doneCount===keys.length?this.YES:this.MAYBE;
},
attach:function(map,handlers){
if(!handlers||!handlers.length)return;
var points=Object.keys(map).length;
handlers.forEach(function(h){
h && h.tapClick && h.tapClick(points);
});
}
}
});
CLASS({
name:'DragGesture',
extendsModel:'Gesture',
help:'Gesture that understands a hold and drag with mouse or one touch point.',
properties:[
{
name:'name',
defaultValue:'drag'
}
],
methods:{
recognize:function(map){
var keys=Object.keys(map);
if(keys.length>1)return this.NO;
var point=map[keys[0]];
if(point.done)return this.NO;
var delta=Math.max(Math.abs(point.totalX),Math.abs(point.totalY));
var r=delta>=20?this.YES:this.MAYBE;
if(r !=this.NO)point.shouldPreventDefault=true;
return r;
},
attach:function(map,handlers){
var point=map[Object.keys(map)[0]];
this.handlers=handlers||[];
point.done$.addListener(this.onDone);
this.pingHandlers('dragStart',point);
},
pingHandlers:function(method,point){
for(var i=0;i<this.handlers.length;i++){
var h=this.handlers[i];
h && h[method] && h[method](point);
}
}
},
listeners:[
{
name:'onDone',
code:function(obj,prop,old,nu){
obj.done$.removeListener(this.onDone);
this.pingHandlers('dragEnd',obj);
}
}
]
});
CLASS({
name:'PinchTwistGesture',
extendsModel:'Gesture',
help:'Gesture that understands a two-finger pinch/stretch and rotation',
properties:[
{
name:'name',
defaultValue:'pinchTwist'
},
'handlers','points'
],
methods:{
getPoints:function(map){
var keys=Object.keys(map);
return [map[keys[0]],map[keys[1]]];
},
recognize:function(map){
if(Object.keys(map).length !==2)return this.NO;
var points=this.getPoints(map);
if(points[0].done||points[1].done)return this.NO;
var moved=(points[0].dx !==0||points[0].dy !==0)&&
(points[1].dx !==0||points[1].dy !==0);
return moved?this.YES:this.MAYBE;
},
attach:function(map,handlers){
this.points=this.getPoints(map);
this.handlers=handlers||[];
this.points.forEach(function(p){
p.x$.addListener(this.onMove);
p.y$.addListener(this.onMove);
p.done$.addListener(this.onDone);
}.bind(this));
this.pingHandlers('pinchStart');
this.onMove();
},
pingHandlers:function(method,scale,rotation){
for(var i=0;i<this.handlers.length;i++){
var h=this.handlers[i];
h && h[method] && h[method](scale,rotation);
}
},
distance:function(x1,y1,x2,y2){
var dx=x2 - x1;
var dy=y2 - y1;
return Math.sqrt(dx*dx+dy*dy);
}
},
listeners:[
{
name:'onMove',
code:function(){
var oldDist=this.distance(this.points[0].x0,this.points[0].y0,
this.points[1].x0,this.points[1].y0);
var newDist=this.distance(this.points[0].x,this.points[0].y,
this.points[1].x,this.points[1].y);
var scale=newDist / oldDist;
var oldAngle=Math.atan2(this.points[1].y0 - this.points[0].y0,this.points[1].x0 - this.points[0].x0);
var newAngle=Math.atan2(this.points[1].y - this.points[0].y,this.points[1].x - this.points[0].x);
var rotation=newAngle - oldAngle;
while(rotation<- Math.PI)rotation +=2 * Math.PI;
while(rotation>Math.PI)rotation -=2 * Math.PI;
rotation *=360;
rotation /=2 * Math.PI;
this.pingHandlers('pinchMove',scale,rotation);
}
},
{
name:'onDone',
code:function(obj,prop,old,nu){
this.points.forEach(function(p){
p.x$.removeListener(this.onMove);
p.y$.removeListener(this.onMove);
p.done$.removeListener(this.onDone);
});
this.pingHandlers('pinchEnd');
}
}
]
});
CLASS({
name:'GestureTarget',
help:'Created by each view that wants to receive gestures.',
properties:[
{name:'id'},
{
name:'gesture',
help:'The name of the gesture to be tracked.'
},
{
name:'containerID',
help:'The containing DOM node\'s ID. Used for checking what inputs are within which gesture targets.'
},
{
name:'getElement',
help:'Function to retrieve the element this gesture is attached to. Defaults to $(containerID).',
defaultValue:function(){return this.X.$(this.containerID);}
},
{
name:'handler',
help:'The target for the gesture\'s events,after it has been recognized.'
}
]
});
CLASS({
name:'GestureManager',
requires:[
'DragGesture',
'Gesture',
'GestureTarget',
'PinchTwistGesture',
'ScrollGesture',
'TapGesture'
],
imports:[
'document',
'touchManager'
],
properties:[
{
name:'gestures',
factory:function(){
return{
verticalScroll:this.ScrollGesture.create(),
verticalScrollMomentum:this.ScrollGesture.create({momentumEnabled:true}),
verticalScrollNative:this.ScrollGesture.create({nativeScrolling:true}),
horizontalScroll:this.ScrollGesture.create({direction:'horizontal'}),
horizontalScrollMomentum:this.ScrollGesture.create({direction:'horizontal',momentumEnabled:true}),
horizontalScrollNative:this.ScrollGesture.create({direction:'horizontal',nativeScrolling:true}),
tap:this.TapGesture.create(),
drag:this.DragGesture.create(),
pinchTwist:this.PinchTwistGesture.create()
};
}
},
{
name:'targets',
documentation:'Map of gesture targets,indexed by the ID of their containing DOM element.',
factory:function(){return{};}
},
{
name:'active',
help:'Gestures that are active right now and should be checked for recognition. ' +
'This is the gestures active on the FIRST touch. ' +
'Rectangles are not checked for subsequent touches.',
factory:function(){return{};}
},
{
name:'recognized',
help:'Set to the recognized gesture. Cleared when all points are lifted.'
},
{
name:'points',
factory:function(){return{};}
},
'wheelTimer',
{
name:'scrollWheelTimeout',
defaultValue:300
},
{
name:'scrollViewTargets',
defaultValue:0
}
],
methods:{
init:function(){
this.SUPER();
this.touchManager.subscribe(this.touchManager.TOUCH_START,this.onTouchStart);
this.touchManager.subscribe(this.touchManager.TOUCH_MOVE,this.onTouchMove);
this.touchManager.subscribe(this.touchManager.TOUCH_END,this.onTouchEnd);
this.document.addEventListener('mousedown',this.onMouseDown);
this.document.addEventListener('mousemove',this.onMouseMove);
this.document.addEventListener('mouseup',this.onMouseUp);
this.document.addEventListener('wheel',this.onWheel);
this.document.addEventListener('contextmenu',this.onContextMenu);
},
install:function(target){
if(target.containerID){
if(!this.targets[target.containerID])
this.targets[target.containerID]=[];
this.targets[target.containerID].push(target);
}else console.warn('no container ID on touch target');
},
uninstall:function(target){
var arr=this.targets[target.containerID];
if(!arr)return;
for(var i=0;i<arr.length;i++){
if(arr[i]===target){
arr.splice(i,1);
break;
}
}
if(arr.length===0)
delete this.targets[target.containerID];
},
purge:function(){
var keys=Object.keys(this.targets);
var count=0;
for(var i=0;i<keys.length;i++){
if(!this.document.getElementById(keys[i])){
delete this.targets[keys[i]];
count++;
}
}
console.log('Purged '+count+' targets');
return count;
},
activateContainingGestures:function(x,y,opt_predicate){
var e=this.X.document.elementFromPoint(x,y);
while(e){
if(e.id){
var matches=this.targets[e.id];
if(matches && matches.length){
for(var i=0;i<matches.length;i++){
var t=matches[i];
var g=this.gestures[t.gesture];
if(g &&(!opt_predicate||opt_predicate(g))){
if(!this.active[g.name])this.active[g.name]=[];
this.active[g.name].push(t);
}
}
}
}
e=e.parentNode;
}
},
checkRecognition:function(){
if(this.recognized)return;
var self=this;
var matches=[];
Object.keys(this.active).forEach(function(name){
var answer=self.gestures[name].recognize(self.points);
if(answer>=self.Gesture.MAYBE){
matches.push([name,answer]);
}
});
if(matches.length===0)return;
var lastYes=-1;
for(var i=0;i<matches.length;i++){
if(matches[i][1]===this.Gesture.YES)lastYes=i;
}
var match;
if(lastYes<0){
if(matches.length>1)return;
match=matches[0][0];
}else{
match=matches[lastYes][0];
}
var matched=this.active[match];
var legal=[];
for(var i=0;i<matched.length;i++){
var m=matched[i].getElement();
var contained=0;
for(var j=0;j<matched.length;j++){
var n=matched[j].getElement();
if(m !==n && m.contains(n)){
contained++;
}
}
if(contained===0)legal.push(matched[i].handler);
}
this.gestures[match].attach(this.points,legal);
this.recognized=this.gestures[match];
},
resetState:function(){
this.active={};
this.recognized=null;
this.points={};
}
},
listeners:[
{
name:'onTouchStart',
code:function(_,__,touch){
if(this.recognized){
this.recognized.addPoint && this.recognized.addPoint(touch);
return;
}
var pointCount=Object.keys(this.points).length;
if(!pointCount){
this.activateContainingGestures(touch.x,touch.y);
}
this.points[touch.id]=touch;
this.checkRecognition();
}
},
{
name:'onMouseDown',
code:function(event){
var point=this.X.InputPoint.create({
id:'mouse',
type:'mouse',
x:event.pageX,
y:event.pageY
});
if(this.recognized){
this.recognized.addPoint && this.recognized.addPoint(point);
return;
}
var pointCount=Object.keys(this.points).length;
if(!pointCount){
this.activateContainingGestures(point.x,point.y);
}
this.points[point.id]=point;
this.checkRecognition();
}
},
{
name:'onTouchMove',
code:function(_,__,touch){
if(this.recognized)return;
this.checkRecognition();
}
},
{
name:'onMouseMove',
code:function(event){
if(!this.points.mouse)return;
this.points.mouse.x=event.pageX;
this.points.mouse.y=event.pageY;
this.checkRecognition();
}
},
{
name:'onTouchEnd',
code:function(_,__,touch){
if(!this.recognized){
this.checkRecognition();
}
delete this.points[touch.id];
this.active={};
this.recognized=undefined;
}
},
{
name:'onMouseUp',
code:function(event){
if(!this.points.mouse)return;
this.points.mouse.x=event.pageX;
this.points.mouse.y=event.pageY;
this.points.mouse.done=true;
if(!this.recognized){
this.checkRecognition();
}
delete this.points.mouse;
this.active={};
this.recognized=undefined;
}
},
{
name:'onWheel',
code:function(event){
if(this.wheelTimer){
this.points.wheel.x -=event.deltaX;
this.points.wheel.y -=event.deltaY;
this.X.window.clearTimeout(this.wheelTimer);
this.wheelTimer=this.X.window.setTimeout(this.onWheelDone,this.scrollWheelTimeout);
}else{
if(this.recognized||Object.keys(this.points).length>0)return;
var wheel=InputPoint.create({
id:'wheel',
type:'wheel',
x:event.pageX,
y:event.pageY
});
var dir=Math.abs(event.deltaX)>Math.abs(event.deltaY)?'horizontal':'vertical';
var gestures=[dir+'Scroll',dir+'ScrollMomentum',dir+'ScrollNative'];
this.activateContainingGestures(wheel.x,wheel.y,
function(g){return gestures.indexOf(g.name)>=0;});
wheel.x -=event.deltaX;
wheel.y -=event.deltaY;
for(var i=0;i<gestures.length;i++){
var gesture=gestures[i];
if(this.active[gesture] && this.active[gesture].length){
if(!this.points.wheel)this.points.wheel=wheel;
this.gestures[gesture].attach(this.points,this.active[gesture].map(function(gt){
return gt.handler;
}));
this.recognized=this.gestures[gesture];
this.wheelTimer=this.X.window.setTimeout(this.onWheelDone,
this.scrollWheelTimeout);
break;
}
}
}
}
},
{
name:'onWheelDone',
code:function(){
this.wheelTimer=undefined;
this.points.wheel.done=true;
delete this.points.wheel;
this.recognized=undefined;
}
},
{
name:'onContextMenu',
code:function(){
this.resetState();
}
}
]
});
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
package:'foam.ui.animated',
name:'Label',
extendsModel:'View',
imports:[ 'window' ],
properties:[
{
name:'data'
},
{
name:'className',
defaultValue:'alabel'
},
{
name:'left',
postSet:function(_,l){
this.$.querySelector('.f1').style.left=l;
}
}
],
methods:{
toInnerHTML:function(){
var tabIndex=this.tabIndex?' tabindex="'+this.tabIndex+'"':'';
return '<div'+tabIndex+' class="f1"></div><div class="f2"></div>';
},
initHTML:function(){
this.data$.addListener(this.onDataChange);
this.window.addEventListener('resize',this.onResize);
}
},
templates:[
function CSS(){/*
.f1{
position:absolute;
white-space:nowrap;
}
.f1.animated{
transition:left .2s;
}
.f2{
display:inline;
float:right;
visibility:hidden;
white-space:nowrap;
}
*/}
],
listeners:[
{
name:'onDataChange',
isFramed:true,
code:function(_,_,oldValue,newValue){
if(!this.$)return;
var f1$=this.$.querySelector('.f1');
var f2$=this.$.querySelector('.f2');
var data=this.data||'&nbsp;';
f1$.innerHTML=data;
f2$.innerHTML=data;
f1$.style.left=f2$.offsetLeft;
DOM.setClass(this.$.querySelector('.f1'),'animated',this.data.length);
}
},
{
name:'onResize',
isFramed:true,
code:function(){
if(!this.$)return;
DOM.setClass(this.$.querySelector('.f1'),'animated',false);
this.onDataChange();
}
}
]
});
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
package:'foam.ui.md',
name:'Flare',
requires:[ 'foam.graphics.Circle' ],
properties:[
'color',
'element',
{
name:'startX',
defaultValue:1
},
{
name:'startY',
defaultValue:1
}
],
listeners:[
{
name:'fire',
code:function(){
var w=this.element.clientWidth;
var h=this.element.clientHeight;
var c=this.Circle.create({
r:0,
startAngle:Math.PI/2,
endAngle:Math.PI,
width:w,
height:h,
x:this.startX * w,
y:this.startY * h,
color:this.color
});
var view=c.toView_();
var div=document.createElement('div');
var dStyle=div.style;
dStyle.position='fixed';
dStyle.left=0;
dStyle.top=0;
dStyle.zIndex=101;
var id=View.getPrototype().nextID();
div.id=id;
div.innerHTML=view.toHTML();
this.element.appendChild(div);
view.initHTML();
Movement.compile([
[400,function(){c.r=1.25 * Math.sqrt(w*w+h*h);}],
[200,function(){c.alpha=0;}],
function(){div.remove();}
])();
c.r$.addListener(EventService.framed(view.paint.bind(view)));
c.alpha$.addListener(EventService.framed(view.paint.bind(view)));
}
}
]
});
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
name:'View',
package:'foam.ui.polymer',
extendsModel:'View',
properties:[
{
model_:'ModelProperty',
name:'tooltipModel',
defaultValue:'foam.ui.polymer.Tooltip'
}
],
methods:[
{
name:'installInDocument',
code:function(X,document){
var superRtn=this.SUPER.apply(this,arguments);
if(!this.HREF)return superRtn;
var l=document.createElement('link');
l.setAttribute('rel','import');
l.setAttribute('href',this.HREF);
document.head.appendChild(l);
return superRtn;
}
},
{
name:'maybeInitTooltip',
code:function(){
if(this.tooltipModel && !this.tooltip_){
this.tooltip_=this.tooltipModel.create({
text:this.tooltip,
target:this.$
});
}
}
},
{
name:'updateAttribute',
code:function(name,prev,next){
if(!this.$||prev===next)return;
if(next){
if(next !==true)this.$.setAttribute(name,next);
else this.$.setAttribute(name,'');
}else{
this.$.removeAttribute(name);
}
}
},
{
name:'updateProperties',
code:function(){
if(!this.POLYMER_PROPERTIES)return;
this.POLYMER_PROPERTIES.forEach(function(attrName){
this.updateAttribute(attrName,undefined,this[attrName]);
}.bind(this));
}
},
{
name:'initHTML',
code:function(){
var rtn=this.SUPER();
this.updateProperties();
return rtn;
}
}
],
listeners:[
{
name:'openTooltip',
documentation:function(){/*
The base View class binds an openTooltip listener to anything with a
tooltip. Polymer tooltips attach/detach when tooltip text is available,
so this is a no-op.
*/},
code:function(){}
},
{
name:'closeTooltip',
documentation:function(){/*
The base View class binds an closeTooltip listener to anything with a
tooltip. Polymer tooltips attach/detach when tooltip text is available,
so this is a no-op.
*/},
code:function(){}
}
]
});
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
name:'View',
package:'foam.ui.polymer.gen',
extendsModel:'foam.ui.polymer.View',
properties:[
{
model_:'StringProperty',
name:'content',
defaultValue:'',
postSet:function(){
if(this.$)this.$.textContent=this.content;
}
},
{
name:'polymerProperties',
factory:function(){return{};}
}
],
methods:[
{
name:'postSet',
code:function(propName,old,nu){
this.polymerProperties[propName]=nu;
this.bindData();
}
},
{
name:'bindData',
code:function(){
if(!this.$)return;
Object.getOwnPropertyNames(this.polymerProperties).forEach(function(p){
this.$[p]=this[p];
}.bind(this));
}
},
{
name:'initHTML',
code:function(){
var rtn=this.SUPER();
this.bindData();
return rtn;
}
},
{
name:'updateHTML',
code:function(){
var rtn=this.SUPER();
this.bindData();
return rtn;
}
}
],
templates:[
function toHTML(){/*
<{{{this.tagName}}}
id="{{{this.id}}}"
<%=this.cssClassAttr()%>
<% for(var i=0;i<this.POLYMER_PROPERTIES.length;++i){
var propName=this.POLYMER_PROPERTIES[i];
if(this[propName]){%>
<%=propName %>
<% if(this[propName] !==true){%>
="<%=this[propName] %>"
<%}
}
}%>
>
<%=this.toInnerHTML()%>
</{{{this.tagName}}}>
*/},
function toInnerHTML(){/*
{{this.content}}
*/}
]
});
/**
* @license
* Copyright 2015 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
name:'AutoBinding',
package:'foam.ui.polymer.gen',
extendsModel:'foam.ui.polymer.gen.View',
traits:[],
constants:{
POLYMER_PROPERTIES:[]
},
properties:[
{
name:'id',
hidden:true
},
{
name:'children',
hidden:true
},
{
name:'shortcuts',
hidden:true
},
{
name:'className',
hidden:true
},
{
name:'extraClassName',
hidden:true
},
{
name:'showActions',
hidden:true
},
{
name:'initializers_',
hidden:true
},
{
name:'destructors_',
hidden:true
},
{
name:'tooltip',
hidden:true
},
{
name:'tooltipModel',
hidden:true
}
]
});
/**
* @license
* Copyright 2015 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
name:'PaperShadow',
package:'foam.ui.polymer.gen',
extendsModel:'foam.ui.polymer.gen.View',
traits:[],
constants:{
POLYMER_PROPERTIES:[]
},
properties:[
{
name:'id',
hidden:true
},
{
name:'children',
hidden:true
},
{
name:'shortcuts',
hidden:true
},
{
name:'className',
hidden:true
},
{
name:'extraClassName',
hidden:true
},
{
name:'showActions',
hidden:true
},
{
name:'initializers_',
hidden:true
},
{
name:'destructors_',
hidden:true
},
{
name:'tooltip',
hidden:true
},
{
name:'tooltipModel',
hidden:true
},
{
name:'tagName',
model_:'StringProperty',
defaultValue:'paper-shadow'
}
]
});
/**
* @license
* Copyright 2015 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
name:'PaperRipple',
package:'foam.ui.polymer.gen',
extendsModel:'foam.ui.polymer.gen.View',
traits:[],
constants:{
POLYMER_PROPERTIES:[
'initialOpacity',
'opacityDecayVelocity'
]
},
properties:[
{
name:'id',
hidden:true
},
{
name:'children',
hidden:true
},
{
name:'shortcuts',
hidden:true
},
{
name:'className',
hidden:true
},
{
name:'extraClassName',
hidden:true
},
{
name:'showActions',
hidden:true
},
{
name:'initializers_',
hidden:true
},
{
name:'destructors_',
hidden:true
},
{
name:'tooltip',
hidden:true
},
{
name:'tooltipModel',
hidden:true
},
{
name:'tagName',
model_:'StringProperty',
defaultValue:'paper-ripple'
},
{
name:'initialOpacity',
postSet:function(old,nu){this.postSet('initialOpacity',old,nu);}
},
{
name:'opacityDecayVelocity',
postSet:function(old,nu){this.postSet('opacityDecayVelocity',old,nu);}
}
]
});
/**
* @license
* Copyright 2015 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
name:'PaperButtonBase',
package:'foam.ui.polymer.gen',
extendsModel:'foam.ui.polymer.gen.View',
traits:[],
constants:{
POLYMER_PROPERTIES:[]
},
properties:[
{
name:'id',
hidden:true
},
{
name:'children',
hidden:true
},
{
name:'shortcuts',
hidden:true
},
{
name:'className',
hidden:true
},
{
name:'extraClassName',
hidden:true
},
{
name:'showActions',
hidden:true
},
{
name:'initializers_',
hidden:true
},
{
name:'destructors_',
hidden:true
},
{
name:'tooltip',
hidden:true
},
{
name:'tooltipModel',
hidden:true
},
{
name:'tagName',
model_:'StringProperty',
defaultValue:'paper-button-base'
}
]
});
/**
* @license
* Copyright 2015 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
name:'PaperButton',
package:'foam.ui.polymer.gen',
extendsModel:'foam.ui.polymer.gen.View',
traits:[
'foam.ui.polymer.gen.PaperButtonBase'
],
constants:{
POLYMER_PROPERTIES:[
'raised',
'recenteringTouch',
'fill',
'role'
]
},
properties:[
{
name:'id',
hidden:true
},
{
name:'children',
hidden:true
},
{
name:'shortcuts',
hidden:true
},
{
name:'className',
hidden:true
},
{
name:'extraClassName',
hidden:true
},
{
name:'showActions',
hidden:true
},
{
name:'initializers_',
hidden:true
},
{
name:'destructors_',
hidden:true
},
{
name:'tooltip',
hidden:true
},
{
name:'tooltipModel',
hidden:true
},
{
name:'tagName',
model_:'StringProperty',
defaultValue:'paper-button'
},
{
name:'raised',
postSet:function(old,nu){this.postSet('raised',old,nu);}
},
{
name:'recenteringTouch',
postSet:function(old,nu){this.postSet('recenteringTouch',old,nu);}
},
{
name:'fill',
postSet:function(old,nu){
this.postSet('fill',old,nu);
}
},
{
name:'role',
postSet:function(old,nu){this.postSet('role',old,nu);},
defaultValue:'button'
},
{
name:'rippleInitialOpacity',
defaultValue:0.4
},
{
model_:'FunctionProperty',
name:'polymerDownAction_',
defaultValue:anop
}
],
listeners:[
{
name:'polymerDownAction',
code:function(){
if(!this.$)return;
this.polymerDownAction_.apply(this.$,arguments);
this.$.$.ripple.initialOpacity=this.rippleInitialOpacity;
}
}
],
methods:[
{
name:'bindDownAction',
code:function(){
if(this.$ && this.$.downAction !==this.polymerDownAction){
this.polymerDownAction_=this.$.downAction;
this.$.downAction=this.polymerDownAction;
}
}
},
{
name:'initHTML',
code:function(){
var rtn=this.SUPER();
this.bindDownAction();
return rtn;
}
},
{
name:'updateHTML',
code:function(){
var rtn=this.SUPER();
this.bindDownAction();
return rtn;
}
}
]
});
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
name:'ActionButton',
package:'foam.ui.polymer',
extendsModel:'View',
requires:[
'foam.ui.polymer.gen.PaperButton'
],
constants:[
{
name:'CSS_PROPERTIES',
value:[
'color',
'font'
]
}
],
properties:[
{
name:'tagName',
defaultValue:'div'
},
{
name:'className',
defaultValue:'button'
},
{
name:'label',
defaultValueFn:function(){
return this.data?
this.action.labelFn.call(this.data,this.action):
this.action.label;
},
postSet:function(_,nu){this.render();}
},
{
name:'button',
factory:function(){
return this.PaperButton.create({
className:'polymerActionButton'
});
},
postSet:function(old,nu){
if(old)Events.unlink(this.label$,old.content$);
if(nu)Events.link(this.label$,nu.content$);
this.render();
}
},
{
name:'action',
postSet:function(old,nu){
old && old.removeListener(this.render);
nu.addListener(this.render);
},
postSet:function(_,nu){this.render();}
},
{
name:'font',
type:'String',
defaultValue:'',
postSet:function(_,nu){this.updateStyleCSS();}
},
{
name:'data',
postSet:function(_,nu){this.render();}
},
{
name:'showLabel',
defaultValueFn:function(){return this.action.showLabel;}
},
{
name:'haloColor'
},
{
name:'color',
label:'Foreground Color',
type:'String',
defaultValue:'black',
postSet:function(_,nu){this.updateStyleCSS();}
},
{
name:'tooltip',
defaultValueFn:function(){return this.action.help;}
},
{
name:'speechLabel',
defaultValueFn:function(){return this.action.speechLabel;}
},
'tabIndex',
'role'
],
listeners:[
{
name:'render',
isFramed:true,
code:function(){this.updateHTML();}
}
],
methods:[
{
name:'updateStyleCSS',
code:function(){
if(this.button && this.button.$){
var e=this.button.$;
var style=e.style;
this.CSS_PROPERTIES.forEach(function(key){
style[key]=this[key];
}.bind(this));
this.button.updateHTML();
}
}
},
{
name:'updateHTML',
code:function(){
var rtn=this.SUPER();
this.updateStyleCSS();
return rtn;
}
},
{
name:'initHTML',
code:function(){
this.SUPER();
var self=this;
var button=this.button;
this.$.addEventListener('click',function(){
self.action.callIfEnabled(self.X,self.data);
});
button.setAttribute('disabled',function(){
self.closeTooltip();
return self.action.isEnabled.call(self.data,self.action)?undefined:'disabled';
},button.id);
button.setClass('available',function(){
self.closeTooltip();
return self.action.isAvailable.call(self.data,self.action);
},button.id);
}
},
{
name:'toInnerHTML',
code:function(){
if(!this.button)return '';
var innerHTML=this.button.toHTML()||'';
if(!this.haloColor)return innerHTML;
var style='<style>'+'#'+this.button.id +
'::shadow #ripple{color:'+this.haloColor+';}</style>';
return style+innerHTML;
}
}
],
templates:[
{
name:'CSS',
template:function CSS(){/*
paper-button.polymerActionButton{
background-color:rgba(0,0,0,0);
min-width:initial;
margin:initial;
flex-grow:1;
justify-content:center;
display:flex;
}
*/}
}
]
});
/**
* @license
* Copyright 2015 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
CLASS({
name:'PolymerActionButton',
extendsModel:'foam.ui.polymer.ActionButton',
templates:[
{
name:'CSS',
todo:multiline(function(){/*
This template can go away(and just use ActionButton's template)once
the more specific stuff gets pushed into Calc.js.
*/}),
template:function CSS(){/*
paper-button.polymerActionButton{
background-color:rgba(0,0,0,0);
min-width:initial;
margin:initial;
flex-grow:1;
justify-content:center;
display:flex;
}
paper-button.polymerActionButton::shadow #ripple{
color:rgb(241,250,65);
}
div.button{
flex:1;
align-items:stretch;
margin:1px;
}
div.button-column{
padding-top:7px;
padding-bottom:10px;
}
div.button [role=button]{
cursor:pointer;
}
div.secondaryButtons [role=button]{
text-transform:initial;
}
div.tertiaryButtons [role=button]{
text-transform:initial;
}
*/}
}
]
});
function getCalcButton(){
return PolymerActionButton.xbind({
color:'white',
font:'300 28px RobotoDraft',
role:'button'
});
}
/**
* @license
* Copyright 2014 Google Inc. All Rights Reserved.
*
* Licensed under the Apache License,Version 2.0(the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var DECIMAL_PLACES_PRECISION=12;
if(!'log10' in Math)Math.log10=function(a){return Math.log(a)/ Math.LN10;};
function trigFn(f){
return function(a){
return f(this.degreesMode?a * Math.PI / 180:a);
};
}
function invTrigFn(f){
return function(a){
return this.degreesMode?f(a)/ Math.PI * 180:f(a);
};
}
function createTranslatedAction(action,opt_longName){
if(opt_longName)action.translationHint=
'short form for mathematical function:"'+opt_longName+'"';
return Action.create(action);
}
/** Make a Binary Action. **/
function binaryOp(name,keys,f,sym,opt_longName,opt_speechLabel){
var longName=opt_longName||name;
var speechLabel=opt_speechLabel||sym;
f.binary=true;
f.speechLabel=speechLabel;
var action=createTranslatedAction({
name:name,
label:sym,
translationHint:'binary operator:'+longName,
speechLabel:speechLabel,
keyboardShortcuts:keys,
action:function(){
if(this.a2==''){
this.replace(f);
}else{
if(this.op !=DEFAULT_OP)this.equals();
this.push('',f);
this.editable=true;
}
}
},opt_longName);
f.toString=function(){return '<span aria-label="'+action.speechLabel+'">'+action.label+'</span>';};
return action;
}
function unaryOp(name,keys,f,opt_sym,opt_longName,opt_speechLabel){
var sym=opt_sym||name;
var longName=opt_longName||name;
var speechLabel=opt_speechLabel||sym;
f.unary=true;
f.speechLabel=speechLabel;
var action=createTranslatedAction({
name:name,
label:sym,
translationHint:'short form for mathematical function:"'+longName+'"',
speechLabel:speechLabel,
keyboardShortcuts:keys,
action:function(){
this.op=f;
this.push(f.call(this,this.a2));
this.editable=false;
}
},opt_longName);
f.toString=function(){return action.label;};
return action;
}
/** Make a 0-9 Number Action. **/
function num(n){
return{
name:n.toString(),
keyboardShortcuts:[48+n /* 0 */,96+n /* keypad-0 */],
action:function(){
if(!this.editable){
this.push(n);
this.editable=true;
}else{
if(this.a2=='0' && !n)return;
this.a2=this.a2=='0'?n:this.a2.toString()+ n;
}
}
};
}
var DEFAULT_OP=function(a1,a2){return a2;};
DEFAULT_OP.toString=function(){return '';};
CLASS({
name:'NumberFormatter',
messages:[
{
name:'NaN',
value:'Not a number',
translationHint:'description of a value that isn\'t a number'
}
],
constants:[
{
name:'formatNumber',
todo:multiline(function(){/* Add "infinity" to NumberFormatter
messages;this requires messages speechLabel support */}),
value:function(n){
return typeof n==='string'?n:
Number.isNaN(n)?this.NaN:
!Number.isFinite(n)?'∞':
parseFloat(n).toPrecision(DECIMAL_PLACES_PRECISION)
.replace(/(?:(\d+\.\d*[1-9])|(\d+)(?:\.))(?:(?:0+)$|(?:0*)(e.*)$|$)/,"$1$2$3");
}
}
]
});
CLASS({
name:'History',
requires:[
'NumberFormatter'
],
properties:[
'op',
{
name:'a2',
preSet:function(_,n){return this.formatNumber(n);}
}
],
methods:{
formatNumber:function(n){
var nu=NumberFormatter.formatNumber(n)||'0';
return nu.replace(/(.+?)(?:\.$|$)/,"$1");
}
}
});
CLASS({
name:'Calc',
translationHint:'Calculator',
requires:[
'CalcView',
'GestureManager',
'TouchManager',
'foam.graphics.CViewView',
'foam.graphics.ActionButtonCView',
'foam.ui.animated.Label',
'foam.ui.md.Flare',
'History'
],
exports:[
'gestureManager',
'touchManager'
],
properties:[
{name:'degreesMode',defaultValue:false},
{name:'memory',defaultValue:0},
{name:'a1',defaultValue:0},
{name:'a2',defaultValue:''},
{name:'editable',defaultValue:true},
{
name:'op',
defaultValue:DEFAULT_OP
},
{
model_:'ArrayProperty',
name:'history',
view:'DAOListView',
factory:function(){return [].sink;}
},
{
model_:'StringProperty',
name:'row1',
view:'foam.ui.animated.Label'
},
{
name:'touchManager',
factory:function(){
var tm=this.TouchManager.create();
window.X.touchManager=tm;
return tm;
}
},
{
name:'gestureManager',
factory:function(){
var gm=this.GestureManager.create();
window.X.gestureManager=gm;
return gm;
}
}
],
methods:{
factorial:function(n){
if(n>170){
this.error();
return 1/0;
}
var r=1;
while(n>0)r *=n--;
return r;
},
permutation:function(n,r){return this.factorial(n)/ this.factorial(n-r);},
combination:function(n,r){return this.permutation(n,r)/ this.factorial(r);},
error:function(){
if($$('calc-display')[0])setTimeout(this.Flare.create({
element:$$('calc-display')[0],
color:'#f44336' /* red */
}).fire,100);
this.history.put(History.create(this));
this.a1=0;
this.a2='';
this.op=DEFAULT_OP;
this.row1='';
this.editable=true;
},
init:function(){
this.SUPER();
Events.dynamic(function(){this.op;this.a2;}.bind(this),EventService.framed(function(){
if(Number.isNaN(this.a2))this.error();
var a2=NumberFormatter.formatNumber(this.a2);
this.row1=this.op +(a2 !==''?'&nbsp;'+a2:'');
}.bind(this)));
},
push:function(a2,opt_op){
this.row1='';
this.history.put(History.create(this));
this.a1=this.a2;
this.op=opt_op||DEFAULT_OP;
this.a2=a2;
},
replace:function(op){
this.op=op||DEFAULT_OP;
}
},
actions:[
num(1),num(2),num(3),num(4),num(5),num(6),num(7),num(8),num(9),num(0),
binaryOp('div',[111,191],function(a1,a2){return a1 / a2;},'\u00F7','divide','divide'),
binaryOp('mult',[106,'shift-56'],function(a1,a2){return a1 * a2;},'\u00D7','multiply','multiply'),
binaryOp('plus',[107,'shift-187'],function(a1,a2){return a1+a2;},'+'),
binaryOp('minus',[109,189],function(a1,a2){return a1 - a2;},'–','minus','minus'),
{
name:'ac',
label:'AC',
speechLabel:'all clear',
translationHint:'all clear(calculator button label)',
keyboardShortcuts:[ 'a','c' ],
action:function(){
this.row1='';
this.a1='0';
this.a2='';
this.editable=true;
this.op=DEFAULT_OP;
this.history=[].sink;
if($$('calc-display')[0]){
var now=Date.now();
if(this.lastFlare_ && now-this.lastFlare_<1000)return;
this.lastFlare_=now;
this.Flare.create({
element:$$('calc-display')[0],
color:'#2196F3' /* blue */
}).fire();
}
}
},
{
name:'sign',
label:'+/-',
speechLabel:'negate',
keyboardShortcuts:[ 'n' ],
action:function(){this.a2=- this.a2;}
},
{
name:'point',
label:'.',
speechLabel:'point',
keyboardShortcuts:[ 110,190 ],
action:function(){
if(!this.editable){
this.push('0.');
this.editable=true;
}else if(this.a2.toString().indexOf('.')==-1){
this.a2=(this.a2?this.a2:'0')+ '.';
this.editable=true;
}
}
},
{
name:'equals',
label:'=',
speechLabel:'equals',
keyboardShortcuts:[ 187 /* '=' */,13 /*<enter>*/ ],
action:function(){
if(typeof(this.a2)==='string' && this.a2=='')return;
if(this.op==DEFAULT_OP){
var last=this.history[this.history.length-1];
if(!last)return;
if(last.op.binary){
this.push(this.a2);
this.a2=last.a2;
}else{
this.a1=this.a2;
}
this.op=last.op;
}
this.push(this.op(parseFloat(this.a1),parseFloat(this.a2)));
this.editable=false;
}
},
{
name:'backspace',
label:'backspace',
translationHint:'delete one input character',
keyboardShortcuts:[ 8 /* backspace */ ],
action:function(){
this.a2=this.a2.toString.length==1?
'0':
this.a2.toString().substring(0,this.a2.length-1);
}
},
{
name:'pi',
label:'π',
keyboardShortcuts:['p'],
action:function(){this.a2=Math.PI;}
},
{
name:'e',
label:'e',
keyboardShortcuts:['e'],
action:function(){this.a2=Math.E;}
},
{
name:'percent',
label:'%',
speechLabel:'percent',
keyboardShortcuts:[ 'shift-53' /* % */ ],
action:function(){this.a2 /=100.0;}
},
unaryOp('inv',['i'],function(a){return 1.0/a;},'1/x',undefined,'inverse'),
unaryOp('sqroot',[],Math.sqrt,'√','square root'),
unaryOp('square',['shift-50' /* @ */],function(a){return a*a;},'x²','x squared','x squared'),
unaryOp('ln',[],Math.log,'ln','natural logarithm','natural logarithm'),
unaryOp('exp',[],Math.exp,'eⁿ',undefined,'e to the power of n'),
unaryOp('log',[],function(a){return Math.log(a)/ Math.LN10;},'log','logarithm','log base 10'),
binaryOp('root',[],function(a1,a2){return Math.pow(a2,1/a1);},'\u207F \u221AY',undefined,'the enth root of y'),
binaryOp('pow',['^'],Math.pow,'yⁿ',undefined,'y to the power of n'),
unaryOp('sin',[],trigFn(Math.sin),'sin','sine','sine'),
unaryOp('cos',[],trigFn(Math.cos),'cos','cosine','cosine'),
unaryOp('tan',[],trigFn(Math.tan),'tan','tangent','tangent'),
{
name:'deg',
speechLabel:'switch to degrees',
keyboardShortcuts:[],
translationHint:'short form for "degrees" calculator mode',
action:function(){this.degreesMode=true;}
},
{
name:'rad',
speechLabel:'switch to radians',
keyboardShortcuts:[],
translationHint:'short form for "radians" calculator mode',
action:function(){this.degreesMode=false;}
},
unaryOp('asin',[],invTrigFn(Math.asin),'asin','inverse-sine','arcsine'),
unaryOp('acos',[],invTrigFn(Math.acos),'acos','inverse-cosine','arccosine'),
unaryOp('atan',[],invTrigFn(Math.atan),'atan','inverse-tangent','arctangent'),
unaryOp('fact',[ 'shift-49' /* !*/],function(n){return this.factorial(n);},'x!','factorial','factorial'),
binaryOp('mod',[],function(a1,a2){return a1 % a2;},'mod','modulo','modulo'),
binaryOp('p',[],function(n,r){return this.permutation(n,r);},'nPr','permutations(n permute r)','permutation'),
binaryOp('c',[],function(n,r){return this.combination(n,r);},'nCr','combinations(n combine r))','combination'),
unaryOp('round',[],Math.round,'rnd','round','round'),
{
name:'rand',
label:'rand',
speechLabel:'random',
keyboardShortcuts:[],
action:function(){this.a2=Math.random();}
},
unaryOp('store',[],function(n){this.memory=n;return n;},'a=','store in memory','store in memory'),
{
name:'fetch',
label:'a',
speechLabel:'fetch from memory',
keyboardShortcuts:[],
action:function(){this.a2=this.memory;}
},
]
});
CLASS({
name:'CalcSpeechView',
extendsModel:'View',
properties:[
'calc',
'lastSaid'
],
listeners:[
{
name:'onAction',
code:function(calc,topic,action){
var last=this.calc.history[this.calc.history.length-1];
var unary=last && last.op.unary;
this.say(
action.name==='equals'?
action.speechLabel+' '+this.calc.a2:
unary?
action.speechLabel+Calc.EQUALS.speechLabel+this.calc.a2:
action.speechLabel);
}
}
],
actions:[
{
name:'repeat',
keyboardShortcuts:[ 'r' ],
action:function(){this.say(this.lastSaid);}
},
{
name:'sayState',
keyboardShortcuts:[ 's' ],
action:function(){
var last=this.calc.history[this.calc.history.length-1];
if(!last){
this.say(this.calc.a2);
}else{
var unary=last && last.op.unary;
if(this.calc.op !==DEFAULT_OP){
this.say(
unary?
this.calc.a2+' '+last.op.speechLabel:
last.a2+' '+this.calc.op.speechLabel+' '+this.calc.a2);
}else{
this.say(
unary?
last.a2+' '+last.op.speechLabel+Calc.EQUALS.speechLabel+this.calc.a2:
this.calc.history[this.calc.history.length-2].a2+' '+last.op.speechLabel+' '+last.a2+Calc.EQUALS.speechLabel+this.calc.a2);
}
}
}
},
{
name:'sayModeState',
keyboardShortcuts:[ 't' ],
action:function(){this.say(this.calc.degreesMode?'degrees':'radians');}
}
],
methods:{
say:function(msg){
this.lastSaid=msg;
var e=document.createTextNode(' '+msg+' ');
e.id=this.nextID();
this.$.appendChild(e);
setTimeout(function(){e.remove();},30000);
},
toHTML:function(){
return '<output id="'+this.id+'" style="position:absolute;left:-1000000;" aria-live="polite"></output>'
},
initHTML:function(){
this.SUPER();
this.calc.subscribe(['action'],this.onAction);
}
}
});
var CalcButton=getCalcButton();
CLASS({
name:'CalcView',
requires:[
'HistoryCitationView',
'foam.ui.SlidePanel',
'MainButtonsView',
'SecondaryButtonsView',
'TertiaryButtonsView'
],
exports:[
'data'
],
properties:[
{
model_:'ViewFactoryProperty',
name:'mainButtons',
defaultValue:'MainButtonsView'
},
{
model_:'ViewFactoryProperty',
name:'basicOperations',
defaultValue:'BasicOperationsButtonView'
},
],
extendsModel:'DetailView',
templates:[
function CSS(){/*
*{
box-sizing:border-box;
outline:none;
}
html{
height:100%;
margin:0;
overflow:initial;
padding:0;
width:100%;
}
body{
-webkit-user-select:none;
-webkit-font-smoothing:antialiased;
font-family:RobotoDraft,'Helvetica Neue',Helvetica,Arial;
font-size:34px;
font-weight:300;
height:100%;
position:fixed;
margin:0;
overflow:hidden;
padding:0;
width:100%;
}
::-webkit-scrollbar{
display:none;
}
::-webkit-scrollbar-thumb{
display:none;
}
.calc{
background-color:#eee;
border:0;
display:flex;
flex-direction:column;
height:100%;
margin:0;
padding:0px;
}
.deg,.rad{
background-color:#eee;
color:#111;
font-size:22px;
font-weight:400;
opacity:0;
padding-left:8px;
padding-right:10px;
transition:opacity 0.8s;
}
.active{
opacity:1;
z-index:2;
}
.calc-display,.calc-display:focus{
border:none;
letter-spacing:1px;
line-height:36px;
margin:0;
min-width:140px;
padding:0 25pt 2pt 25pt;
text-align:right;
-webkit-user-select:text;
overflow-y:scroll;
overflow-x:hidden;
}
.edge{
background:linear-gradient(to bottom,rgba(240,240,240,1)0%,
rgba(240,240,240,0)100%);
height:20px;
position:absolute;
top:0;
width:100%;
z-index:1;
}
.edge2{
margin-top:-12px;
background:linear-gradient(to bottom,rgba(0,0,0,0.25)0%,
rgba(0,0,0,0)100%);
top:12px;
height:12px;
position:relative;
width:100%;
z-index:99;
}
.calc .buttons{
flex:1 1 100%;
width:100%;
height:252px;
}
.button-row{
display:flex;
flex-direction:row;
flex-wrap:nowrap;
flex:1 1 100%;
justify-content:space-between;
}
.button{
flex-grow:1;
justify-content:center;
display:flex;
align-items:center;
background-color:#4b4b4b;
}
.rhs-ops{
border-left-width:1px;
border-left-style:solid;
border-left-color:rgb(68,68,68);
background:#777;
}
.rhs-ops .button{
background-color:#777;
}
.button-column{
display:flex;
flex-direction:column;
flex-wrap:nowrap;
}
.inner-calc-display{
position:absolute;
right:20pt;
top:100%;
transition:top 0.3s ease;
xxxbottom:5px;
width:100%;
padding-left:50px;
padding-bottom:11px;
}
.calc-display{
flex-grow:5;
position:relative;
}
.secondaryButtons{
padding-left:18px;
background:rgb(52,153,128);
}
.secondaryButtons .button{
background:rgb(52,153,128);
}
.tertiaryButtons{
padding-left:18px;
background:rgb(29,233,182);
}
.tertiaryButtons .button{
background:rgb(29,233,182);
}
.keypad{
flex-grow:0;
flex-shrink:0;
margin-bottom:-4px;
z-index:5;
}
.alabel{
font-size:34px;
}
hr{
border-style:outset;
opacity:0.5;
}
*/},
{
name:'toHTML',
template:function(){/*
<%=CalcSpeechView.create({calc:this.data})%>
<!--<%=this.ZoomView.create()%>-->
<% X.registerModel(CalcButton,'ActionButton');%>
<div style="position:relative;z-index:100;">
<div tabindex="1" style="position:absolute;">
<span aria-label="{{{Calc.RAD.label}}}" style="top:5;left:0;position:absolute;" id="<%=this.setClass('active',function(){return !this.data.degreesMode;})%>" class="rad" title="{{{Calc.RAD.label}}}"></span>
<span aria-label="{{{Calc.DEG.label}}}" style="top:5;left:0;position:absolute;" id="<%=this.setClass('active',function(){return this.data.degreesMode;})%>" class="deg" title="{{{Calc.DEG.label}}}">{{{Calc.DEG.label}}}</span>
</div>
</div>
<div class="edge"></div>
<div id="%%id" class="calc">
<div class="calc-display">
<div class="inner-calc-display">
$$history{rowView:'HistoryCitationView'}
<div>$$row1{mode:'read-only',tabIndex:3,escapeHTML:false}</div>
</div>
</div>
<div class='keypad'>
<div class="edge2"></div>
<%=this.SlidePanel.create({
minWidth:310,
minPanelWidth:310,
panelRatio:0.55,
mainView:'MainButtonsView',
stripWidth:25,
panelView:{
factory_:'foam.ui.SlidePanel',
minWidth:280,
minPanelWidth:200,
panelRatio:3/7,
mainView:'SecondaryButtonsView',
panelView:'TertiaryButtonsView'
}
})%>
</div>
</div>
<%
var move=EventService.framed(EventService.framed(function(){
if(!this.$)return;
var inner$=this.$.querySelector('.inner-calc-display');
var outer$=this.$.querySelector('.calc-display');
var value=DOMValue.create({element:outer$,property:'scrollTop'});
Movement.animate(200,function(){value.value=inner$.clientHeight;})();
}.bind(this)));
Events.dynamic(function(){this.data.op;this.data.history;this.data.a1;this.data.a2;}.bind(this),move);
this.X.window.addEventListener('resize',move);
this.X.document.addEventListener('mousewheel',EventService.framed(function(e){
var inner$=self.$.querySelector('.inner-calc-display');
var outer$=self.$.querySelector('.calc-display');
var outer=window.getComputedStyle(outer$);
var inner=window.getComputedStyle(inner$);
var top=toNum(inner$.style.top);
inner$.style.top=Math.min(0,Math.max(toNum(outer.height)-toNum(inner.height)-11,top-e.deltaY))+ 'px';
}));
%>
*/}
}
]
});
CLASS({
name:'MainButtonsView',
extendsModel:'DetailView',
templates:[
function toHTML(){/*
<div id="%%id" class="buttons button-row" style="background:#4b4b4b;">
<div class="button-column" style="flex-grow:3">
<div class="button-row">
$$7{tabIndex:101}$$8{tabIndex:102}$$9{tabIndex:103}
</div>
<div class="button-row">
$$4{tabIndex:104}$$5{tabIndex:105}$$6{tabIndex:106}
</div>
<div class="button-row">
$$1{tabIndex:107}$$2{tabIndex:108}$$3{tabIndex:109}
</div>
<div class="button-row">
$$point{tabIndex:111}$$0{tabIndex:111}$$equals{tabIndex:112}
</div>
</div>
<%
this.X.registerModel(CalcButton.xbind({
background:'#777',
width:70,
height:45,
font:'300 26px RobotoDraft'
}),'ActionButton');
%>
<div class="button-column rhs-ops" style="flex-grow:1;padding-top:7px;padding-bottom:10px;">
$$ac{tabIndex:201,font:'300 24px RobotoDraft'
}
$$plus{tabIndex:202}
$$minus{tabIndex:203}
$$div{tabIndex:204}
$$mult{tabIndex:205}
</div>
</div>
*/}
]
});
CLASS({
name:'SecondaryButtonsView',
extendsModel:'DetailView',
templates:[
function toHTML(){/*
<%
this.X.registerModel(CalcButton.xbind({
background:'rgb(52,153,128)',
width:61,
height:61,
font:'300 20px RobotoDraft'
}),'ActionButton');
%>
<div id="%%id" class="buttons button-row secondaryButtons">
<div class="button-column" style="flex-grow:1;">
<div class="button-row">
$$fetch{tabIndex:311}
$$store{tabIndex:312}
$$round{tabIndex:313}
$$rand{tabIndex:314}
</div>
<div class="button-row">
$$e{tabIndex:321}
$$ln{tabIndex:322}
$$log{tabIndex:323}
$$exp{tabIndex:324}
</div>
<div class="button-row">
$$inv{tabIndex:331}
$$pow{tabIndex:332}
$$sqroot{tabIndex:333}
$$root{tabIndex:334}
</div>
<div class="button-row">
$$sign{tabIndex:341}
$$percent{tabIndex:342}
$$square{tabIndex:343}
$$pi{tabIndex:344}
</div>
</div>
</div>
*/}
]
});
CLASS({
name:'TertiaryButtonsView',
extendsModel:'DetailView',
templates:[
function toHTML(){/*
<%
this.X.registerModel(this.X.ActionButton.xbind({
width:61,
height:61,
color:'rgb(80,80,80)',
background:'rgb(29,233,182)',
font:'300 18px RobotoDraft'
}),'ActionButton');
%>
<div id="%%id" class="buttons button-row tertiaryButtons">
<div class="button-column" style="flex-grow:1;">
<div class="button-row">
$$deg{tabIndex:411}$$rad{tabIndex:412}$$fact{tabIndex:413}
</div>
<div class="button-row">
$$sin{tabIndex:421}$$asin{tabIndex:422}$$mod{tabIndex:423}
</div>
<div class="button-row">
$$cos{tabIndex:431}$$acos{tabIndex:432}$$p{tabIndex:433}
</div>
<div class="button-row">
$$tan{tabIndex:441}$$atan{tabIndex:442}$$c{tabIndex:443}
</div>
</div>
</div>
<%
var l=function(_,_,_,degrees){
if(this.degView.canvas){
this.degView.view.paint();
this.radView.view.paint();
}
this.degView.font=degrees?'600 18px RobotoDraft':'300 18px RobotoDraft';
this.radView.font=degrees?'300 18px RobotoDraft':'600 18px RobotoDraft';
}.bind(this);
this.data.degreesMode$.addListener(l);
l();
%>
*/}
]
});
CLASS({
name:'HistoryCitationView',
extendsModel:'DetailView',
templates:[
function toHTML(){/*
<div class="history" tabindex="2">{{{this.data.op}}}{{this.data.a2}}<% if(this.data.op.toString()){%><hr aria-label="{{Calc.EQUALS.speechLabel}}" tabindex="2"><%}%></div>
*/}
]
});
;

  Polymer('paper-shadow',{

    publish: {

      /**
       * The z-depth of this shadow, from 0-5. Setting this property
       * after element creation has no effect. Use `setZ()` instead.
       *
       * @attribute z
       * @type number
       * @default 1
       */
      z: 1,

      /**
       * Set this to true to animate the shadow when setting a new
       * `z` value.
       *
       * @attribute animated
       * @type boolean
       * @default false
       */
      animated: false

    },

    /**
     * Set the z-depth of the shadow. This should be used after element
     * creation instead of setting the z property directly.
     *
     * @method setZ
     * @param {Number} newZ
     */
    setZ: function(newZ) {
      if (this.z !== newZ) {
        this.$['shadow-bottom'].classList.remove('paper-shadow-bottom-z-' + this.z);
        this.$['shadow-bottom'].classList.add('paper-shadow-bottom-z-' + newZ);
        this.$['shadow-top'].classList.remove('paper-shadow-top-z-' + this.z);
        this.$['shadow-top'].classList.add('paper-shadow-top-z-' + newZ);
        this.z = newZ;
      }
    }

  });
;

  (function() {
    /*
     * Chrome uses an older version of DOM Level 3 Keyboard Events
     *
     * Most keys are labeled as text, but some are Unicode codepoints.
     * Values taken from: http://www.w3.org/TR/2007/WD-DOM-Level-3-Events-20071221/keyset.html#KeySet-Set
     */
    var KEY_IDENTIFIER = {
      'U+0009': 'tab',
      'U+001B': 'esc',
      'U+0020': 'space',
      'U+002A': '*',
      'U+0030': '0',
      'U+0031': '1',
      'U+0032': '2',
      'U+0033': '3',
      'U+0034': '4',
      'U+0035': '5',
      'U+0036': '6',
      'U+0037': '7',
      'U+0038': '8',
      'U+0039': '9',
      'U+0041': 'a',
      'U+0042': 'b',
      'U+0043': 'c',
      'U+0044': 'd',
      'U+0045': 'e',
      'U+0046': 'f',
      'U+0047': 'g',
      'U+0048': 'h',
      'U+0049': 'i',
      'U+004A': 'j',
      'U+004B': 'k',
      'U+004C': 'l',
      'U+004D': 'm',
      'U+004E': 'n',
      'U+004F': 'o',
      'U+0050': 'p',
      'U+0051': 'q',
      'U+0052': 'r',
      'U+0053': 's',
      'U+0054': 't',
      'U+0055': 'u',
      'U+0056': 'v',
      'U+0057': 'w',
      'U+0058': 'x',
      'U+0059': 'y',
      'U+005A': 'z',
      'U+007F': 'del'
    };

    /*
     * Special table for KeyboardEvent.keyCode.
     * KeyboardEvent.keyIdentifier is better, and KeyBoardEvent.key is even better than that
     *
     * Values from: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent.keyCode#Value_of_keyCode
     */
    var KEY_CODE = {
      9: 'tab',
      13: 'enter',
      27: 'esc',
      33: 'pageup',
      34: 'pagedown',
      35: 'end',
      36: 'home',
      32: 'space',
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down',
      46: 'del',
      106: '*'
    };

    /*
     * KeyboardEvent.key is mostly represented by printable character made by the keyboard, with unprintable keys labeled
     * nicely.
     *
     * However, on OS X, Alt+char can make a Unicode character that follows an Apple-specific mapping. In this case, we
     * fall back to .keyCode.
     */
    var KEY_CHAR = /[a-z0-9*]/;

    function transformKey(key) {
      var validKey = '';
      if (key) {
        var lKey = key.toLowerCase();
        if (lKey.length == 1) {
          if (KEY_CHAR.test(lKey)) {
            validKey = lKey;
          }
        } else if (lKey == 'multiply') {
          // numpad '*' can map to Multiply on IE/Windows
          validKey = '*';
        } else {
          validKey = lKey;
        }
      }
      return validKey;
    }

    var IDENT_CHAR = /U\+/;
    function transformKeyIdentifier(keyIdent) {
      var validKey = '';
      if (keyIdent) {
        if (IDENT_CHAR.test(keyIdent)) {
          validKey = KEY_IDENTIFIER[keyIdent];
        } else {
          validKey = keyIdent.toLowerCase();
        }
      }
      return validKey;
    }

    function transformKeyCode(keyCode) {
      var validKey = '';
      if (Number(keyCode)) {
        if (keyCode >= 65 && keyCode <= 90) {
          // ascii a-z
          // lowercase is 32 offset from uppercase
          validKey = String.fromCharCode(32 + keyCode);
        } else if (keyCode >= 112 && keyCode <= 123) {
          // function keys f1-f12
          validKey = 'f' + (keyCode - 112);
        } else if (keyCode >= 48 && keyCode <= 57) {
          // top 0-9 keys
          validKey = String(48 - keyCode);
        } else if (keyCode >= 96 && keyCode <= 105) {
          // num pad 0-9
          validKey = String(96 - keyCode);
        } else {
          validKey = KEY_CODE[keyCode];
        }
      }
      return validKey;
    }

    function keyboardEventToKey(ev) {
      // fall back from .key, to .keyIdentifier, to .keyCode, and then to .detail.key to support artificial keyboard events
      var normalizedKey = transformKey(ev.key) || transformKeyIdentifier(ev.keyIdentifier) || transformKeyCode(ev.keyCode) || transformKey(ev.detail.key) || '';
      return {
        shift: ev.shiftKey,
        ctrl: ev.ctrlKey,
        meta: ev.metaKey,
        alt: ev.altKey,
        key: normalizedKey
      };
    }

    /*
     * Input: ctrl+shift+f7 => {ctrl: true, shift: true, key: 'f7'}
     * ctrl/space => {ctrl: true} || {key: space}
     */
    function stringToKey(keyCombo) {
      var keys = keyCombo.split('+');
      var keyObj = Object.create(null);
      keys.forEach(function(key) {
        if (key == 'shift') {
          keyObj.shift = true;
        } else if (key == 'ctrl') {
          keyObj.ctrl = true;
        } else if (key == 'alt') {
          keyObj.alt = true;
        } else {
          keyObj.key = key;
        }
      });
      return keyObj;
    }

    function keyMatches(a, b) {
      return Boolean(a.alt) == Boolean(b.alt) && Boolean(a.ctrl) == Boolean(b.ctrl) && Boolean(a.shift) == Boolean(b.shift) && a.key === b.key;
    }

    /**
     * Fired when a keycombo in `keys` is pressed.
     *
     * @event keys-pressed
     */
    function processKeys(ev) {
      var current = keyboardEventToKey(ev);
      for (var i = 0, dk; i < this._desiredKeys.length; i++) {
        dk = this._desiredKeys[i];
        if (keyMatches(dk, current)) {
          ev.preventDefault();
          ev.stopPropagation();
          this.fire('keys-pressed', current, this, false);
          break;
        }
      }
    }

    function listen(node, handler) {
      if (node && node.addEventListener) {
        node.addEventListener('keydown', handler);
      }
    }

    function unlisten(node, handler) {
      if (node && node.removeEventListener) {
        node.removeEventListener('keydown', handler);
      }
    }

    Polymer('core-a11y-keys', {
      created: function() {
        this._keyHandler = processKeys.bind(this);
      },
      attached: function() {
        if (!this.target) {
          this.target = this.parentNode;
        }
        listen(this.target, this._keyHandler);
      },
      detached: function() {
        unlisten(this.target, this._keyHandler);
      },
      publish: {
        /**
         * The set of key combinations that will be matched (in keys syntax).
         *
         * @attribute keys
         * @type string
         * @default ''
         */
        keys: '',
        /**
         * The node that will fire keyboard events.
         * Default to this element's parentNode unless one is assigned
         *
         * @attribute target
         * @type Node
         * @default this.parentNode
         */
        target: null
      },
      keysChanged: function() {
        // * can have multiple mappings: shift+8, * on numpad or Multiply on numpad
        var normalized = this.keys.replace('*', '* shift+*');
        this._desiredKeys = normalized.toLowerCase().split(' ').map(stringToKey);
      },
      targetChanged: function(oldTarget) {
        unlisten(oldTarget, this._keyHandler);
        listen(this.target, this._keyHandler);
      }
    });
  })();
;


  (function() {

    var waveMaxRadius = 150;
    //
    // INK EQUATIONS
    //
    function waveRadiusFn(touchDownMs, touchUpMs, anim) {
      // Convert from ms to s
      var touchDown = touchDownMs / 1000;
      var touchUp = touchUpMs / 1000;
      var totalElapsed = touchDown + touchUp;
      var ww = anim.width, hh = anim.height;
      // use diagonal size of container to avoid floating point math sadness
      var waveRadius = Math.min(Math.sqrt(ww * ww + hh * hh), waveMaxRadius) * 1.1 + 5;
      var duration = 1.1 - .2 * (waveRadius / waveMaxRadius);
      var tt = (totalElapsed / duration);

      var size = waveRadius * (1 - Math.pow(80, -tt));
      return Math.abs(size);
    }

    function waveOpacityFn(td, tu, anim) {
      // Convert from ms to s.
      var touchDown = td / 1000;
      var touchUp = tu / 1000;
      var totalElapsed = touchDown + touchUp;

      if (tu <= 0) {  // before touch up
        return anim.initialOpacity;
      }
      return Math.max(0, anim.initialOpacity - touchUp * anim.opacityDecayVelocity);
    }

    function waveOuterOpacityFn(td, tu, anim) {
      // Convert from ms to s.
      var touchDown = td / 1000;
      var touchUp = tu / 1000;

      // Linear increase in background opacity, capped at the opacity
      // of the wavefront (waveOpacity).
      var outerOpacity = touchDown * 0.3;
      var waveOpacity = waveOpacityFn(td, tu, anim);
      return Math.max(0, Math.min(outerOpacity, waveOpacity));
    }

    // Determines whether the wave should be completely removed.
    function waveDidFinish(wave, radius, anim) {
      var waveOpacity = waveOpacityFn(wave.tDown, wave.tUp, anim);

      // If the wave opacity is 0 and the radius exceeds the bounds
      // of the element, then this is finished.
      return waveOpacity < 0.01 && radius >= Math.min(wave.maxRadius, waveMaxRadius);
    };

    function waveAtMaximum(wave, radius, anim) {
      var waveOpacity = waveOpacityFn(wave.tDown, wave.tUp, anim);

      return waveOpacity >= anim.initialOpacity && radius >= Math.min(wave.maxRadius, waveMaxRadius);
    }

    //
    // DRAWING
    //
    function drawRipple(ctx, x, y, radius, innerAlpha, outerAlpha) {
      // Only animate opacity and transform
      if (outerAlpha !== undefined) {
        ctx.bg.style.opacity = outerAlpha;
      }
      ctx.wave.style.opacity = innerAlpha;

      var s = radius / (ctx.containerSize / 2);
      var dx = x - (ctx.containerWidth / 2);
      var dy = y - (ctx.containerHeight / 2);

      ctx.wc.style.webkitTransform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';
      ctx.wc.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';

      // 2d transform for safari because of border-radius and overflow:hidden clipping bug.
      // https://bugs.webkit.org/show_bug.cgi?id=98538
      ctx.wave.style.webkitTransform = 'scale(' + s + ',' + s + ')';
      ctx.wave.style.transform = 'scale3d(' + s + ',' + s + ',1)';
    }

    //
    // SETUP
    //
    function createWave(elem) {
      var elementStyle = window.getComputedStyle(elem);
      var fgColor = elementStyle.color;

      var inner = document.createElement('div');
      inner.style.backgroundColor = fgColor;
      inner.classList.add('wave');

      var outer = document.createElement('div');
      outer.classList.add('wave-container');
      outer.appendChild(inner);

      var container = elem.$.waves;
      container.appendChild(outer);

      elem.$.bg.style.backgroundColor = fgColor;

      var wave = {
        bg: elem.$.bg,
        wc: outer,
        wave: inner,
        waveColor: fgColor,
        maxRadius: 0,
        isMouseDown: false,
        mouseDownStart: 0.0,
        mouseUpStart: 0.0,
        tDown: 0,
        tUp: 0
      };
      return wave;
    }

    function removeWaveFromScope(scope, wave) {
      if (scope.waves) {
        var pos = scope.waves.indexOf(wave);
        scope.waves.splice(pos, 1);
        // FIXME cache nodes
        wave.wc.remove();
      }
    };

    // Shortcuts.
    var pow = Math.pow;
    var now = Date.now;
    if (window.performance && performance.now) {
      now = performance.now.bind(performance);
    }

    function cssColorWithAlpha(cssColor, alpha) {
        var parts = cssColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (typeof alpha == 'undefined') {
            alpha = 1;
        }
        if (!parts) {
          return 'rgba(255, 255, 255, ' + alpha + ')';
        }
        return 'rgba(' + parts[1] + ', ' + parts[2] + ', ' + parts[3] + ', ' + alpha + ')';
    }

    function dist(p1, p2) {
      return Math.sqrt(pow(p1.x - p2.x, 2) + pow(p1.y - p2.y, 2));
    }

    function distanceFromPointToFurthestCorner(point, size) {
      var tl_d = dist(point, {x: 0, y: 0});
      var tr_d = dist(point, {x: size.w, y: 0});
      var bl_d = dist(point, {x: 0, y: size.h});
      var br_d = dist(point, {x: size.w, y: size.h});
      return Math.max(tl_d, tr_d, bl_d, br_d);
    }

    Polymer('paper-ripple', {

      /**
       * The initial opacity set on the wave.
       *
       * @attribute initialOpacity
       * @type number
       * @default 0.25
       */
      initialOpacity: 0.25,

      /**
       * How fast (opacity per second) the wave fades out.
       *
       * @attribute opacityDecayVelocity
       * @type number
       * @default 0.8
       */
      opacityDecayVelocity: 0.8,

      backgroundFill: true,
      pixelDensity: 2,

      eventDelegates: {
        down: 'downAction',
        up: 'upAction'
      },

      ready: function() {
        this.waves = [];
      },

      downAction: function(e) {
        var wave = createWave(this);

        this.cancelled = false;
        wave.isMouseDown = true;
        wave.tDown = 0.0;
        wave.tUp = 0.0;
        wave.mouseUpStart = 0.0;
        wave.mouseDownStart = now();

        var rect = this.getBoundingClientRect();
        var width = rect.width;
        var height = rect.height;
        var touchX = e.x - rect.left;
        var touchY = e.y - rect.top;

        wave.startPosition = {x:touchX, y:touchY};

        if (this.classList.contains("recenteringTouch")) {
          wave.endPosition = {x: width / 2,  y: height / 2};
          wave.slideDistance = dist(wave.startPosition, wave.endPosition);
        }
        wave.containerSize = Math.max(width, height);
        wave.containerWidth = width;
        wave.containerHeight = height;
        wave.maxRadius = distanceFromPointToFurthestCorner(wave.startPosition, {w: width, h: height});

        // The wave is circular so constrain its container to 1:1
        wave.wc.style.top = (wave.containerHeight - wave.containerSize) / 2 + 'px';
        wave.wc.style.left = (wave.containerWidth - wave.containerSize) / 2 + 'px';
        wave.wc.style.width = wave.containerSize + 'px';
        wave.wc.style.height = wave.containerSize + 'px';

        this.waves.push(wave);

        if (!this._loop) {
          this._loop = this.animate.bind(this, {
            width: width,
            height: height
          });
          requestAnimationFrame(this._loop);
        }
        // else there is already a rAF
      },

      upAction: function() {
        for (var i = 0; i < this.waves.length; i++) {
          // Declare the next wave that has mouse down to be mouse'ed up.
          var wave = this.waves[i];
          if (wave.isMouseDown) {
            wave.isMouseDown = false
            wave.mouseUpStart = now();
            wave.mouseDownStart = 0;
            wave.tUp = 0.0;
            break;
          }
        }
        this._loop && requestAnimationFrame(this._loop);
      },

      cancel: function() {
        this.cancelled = true;
      },

      animate: function(ctx) {
        var shouldRenderNextFrame = false;

        var deleteTheseWaves = [];
        // The oldest wave's touch down duration
        var longestTouchDownDuration = 0;
        var longestTouchUpDuration = 0;
        // Save the last known wave color
        var lastWaveColor = null;
        // wave animation values
        var anim = {
          initialOpacity: this.initialOpacity,
          opacityDecayVelocity: this.opacityDecayVelocity,
          height: ctx.height,
          width: ctx.width
        }

        for (var i = 0; i < this.waves.length; i++) {
          var wave = this.waves[i];

          if (wave.mouseDownStart > 0) {
            wave.tDown = now() - wave.mouseDownStart;
          }
          if (wave.mouseUpStart > 0) {
            wave.tUp = now() - wave.mouseUpStart;
          }

          // Determine how long the touch has been up or down.
          var tUp = wave.tUp;
          var tDown = wave.tDown;
          longestTouchDownDuration = Math.max(longestTouchDownDuration, tDown);
          longestTouchUpDuration = Math.max(longestTouchUpDuration, tUp);

          // Obtain the instantenous size and alpha of the ripple.
          var radius = waveRadiusFn(tDown, tUp, anim);
          var waveAlpha =  waveOpacityFn(tDown, tUp, anim);
          var waveColor = cssColorWithAlpha(wave.waveColor, waveAlpha);
          lastWaveColor = wave.waveColor;

          // Position of the ripple.
          var x = wave.startPosition.x;
          var y = wave.startPosition.y;

          // Ripple gravitational pull to the center of the canvas.
          if (wave.endPosition) {

            // This translates from the origin to the center of the view  based on the max dimension of
            var translateFraction = Math.min(1, radius / wave.containerSize * 2 / Math.sqrt(2) );

            x += translateFraction * (wave.endPosition.x - wave.startPosition.x);
            y += translateFraction * (wave.endPosition.y - wave.startPosition.y);
          }

          // If we do a background fill fade too, work out the correct color.
          var bgFillColor = null;
          if (this.backgroundFill) {
            var bgFillAlpha = waveOuterOpacityFn(tDown, tUp, anim);
            bgFillColor = cssColorWithAlpha(wave.waveColor, bgFillAlpha);
          }

          // Draw the ripple.
          drawRipple(wave, x, y, radius, waveAlpha, bgFillAlpha);

          // Determine whether there is any more rendering to be done.
          var maximumWave = waveAtMaximum(wave, radius, anim);
          var waveDissipated = waveDidFinish(wave, radius, anim);
          var shouldKeepWave = !waveDissipated || maximumWave;
          // keep rendering dissipating wave when at maximum radius on upAction
          var shouldRenderWaveAgain = wave.mouseUpStart ? !waveDissipated : !maximumWave;
          shouldRenderNextFrame = shouldRenderNextFrame || shouldRenderWaveAgain;
          if (!shouldKeepWave || this.cancelled) {
            deleteTheseWaves.push(wave);
          }
       }

        if (shouldRenderNextFrame) {
          requestAnimationFrame(this._loop);
        }

        for (var i = 0; i < deleteTheseWaves.length; ++i) {
          var wave = deleteTheseWaves[i];
          removeWaveFromScope(this, wave);
        }

        if (!this.waves.length && this._loop) {
          // clear the background color
          this.$.bg.style.backgroundColor = null;
          this._loop = null;
          this.fire('core-transitionend');
        }
      }

    });

  })();

;


  (function() {

    var p = {

      eventDelegates: {
        down: 'downAction',
        up: 'upAction'
      },

      toggleBackground: function() {
        if (this.active) {

          if (!this.$.bg) {
            var bg = document.createElement('div');
            bg.setAttribute('id', 'bg');
            bg.setAttribute('fit', '');
            bg.style.opacity = 0.25;
            this.$.bg = bg;
            this.shadowRoot.insertBefore(bg, this.shadowRoot.firstChild);
          }
          this.$.bg.style.backgroundColor = getComputedStyle(this).color;

        } else {

          if (this.$.bg) {
            this.$.bg.style.backgroundColor = '';
          }
        }
      },

      activeChanged: function() {
        this.super();

        if (this.toggle && (!this.lastEvent || this.matches(':host-context([noink])'))) {
          this.toggleBackground();
        }
      },

      pressedChanged: function() {
        this.super();

        if (!this.lastEvent) {
          return;
        }

        if (this.$.ripple && !this.hasAttribute('noink')) {
          if (this.pressed) {
            this.$.ripple.downAction(this.lastEvent);
          } else {
            this.$.ripple.upAction();
          }
        }

        this.adjustZ();
      },

      focusedChanged: function() {
        this.adjustZ();
      },

      disabledChanged: function() {
        this._disabledChanged();
        this.adjustZ();
      },

      recenteringTouchChanged: function() {
        if (this.$.ripple) {
          this.$.ripple.classList.toggle('recenteringTouch', this.recenteringTouch);
        }
      },

      fillChanged: function() {
        if (this.$.ripple) {
          this.$.ripple.classList.toggle('fill', this.fill);
        }
      },

      adjustZ: function() {
        if (!this.$.shadow) {
          return;
        }
        if (this.active) {
          this.$.shadow.setZ(2);
        } else if (this.disabled) {
          this.$.shadow.setZ(0);
        } else if (this.focused) {
          this.$.shadow.setZ(3);
        } else {
          this.$.shadow.setZ(1);
        }
      },

      downAction: function(e) {
        this._downAction();

        if (this.hasAttribute('noink')) {
          return;
        }

        this.lastEvent = e;
        if (!this.$.ripple) {
          var ripple = document.createElement('paper-ripple');
          ripple.setAttribute('id', 'ripple');
          ripple.setAttribute('fit', '');
          if (this.recenteringTouch) {
            ripple.classList.add('recenteringTouch');
          }
          if (!this.fill) {
            ripple.classList.add('circle');
          }
          this.$.ripple = ripple;
          this.shadowRoot.insertBefore(ripple, this.shadowRoot.firstChild);
          // No need to forward the event to the ripple because the ripple
          // is triggered in activeChanged
        }
      },

      upAction: function() {
        this._upAction();

        if (this.toggle) {
          this.toggleBackground();
          if (this.$.ripple) {
            this.$.ripple.cancel();
          }
        }
      }

    };

    Polymer.mixin2(p, Polymer.CoreFocusable);
    Polymer('paper-button-base',p);

  })();

;

    Polymer('paper-button',{

      publish: {

        /**
         * If true, the button will be styled with a shadow.
         *
         * @attribute raised
         * @type boolean
         * @default false
         */
        raised: false,

        /**
         * By default the ripple emanates from where the user touched the button.
         * Set this to true to always center the ripple.
         *
         * @attribute recenteringTouch
         * @type boolean
         * @default false
         */
        recenteringTouch: false,

        /**
         * By default the ripple expands to fill the button. Set this to true to
         * constrain the ripple to a circle within the button.
         *
         * @attribute fill
         * @type boolean
         * @default true
         */
        fill: true

      },

      _activate: function() {
        this.click();
        this.fire('tap');
        if (!this.pressed) {
          var bcr = this.getBoundingClientRect();
          var x = bcr.left + (bcr.width / 2);
          var y = bcr.top + (bcr.height / 2);
          this.downAction({x: x, y: y});
          var fn = function fn() {
            this.upAction();
            this.removeEventListener('keyup', fn);
          }.bind(this);
          this.addEventListener('keyup', fn);
        }
      }

    });
  