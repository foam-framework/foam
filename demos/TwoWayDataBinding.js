apar(
   arequire('foam.ui.DetailView')
)(function() {

  MODEL({
    name: 'Temperature',
    documentation: 'Version 1: Uses Events.relate() to relate to two fields.',
    properties: [ 'f', 'c' ],
    methods: {
      init: function() { Events.relate(this.c$, this.f$, this.c2f, this.f2c); },
      c2f: function(f) { return 9/5 * f + 32; },
      f2c: function(c) { return 5/9 * ( c - 32 ); }
    },
    templates: [
      function toDetailHTML() {/*
        <p class="temperature-converter">
          <label class="celsius-wrap">$$c{onKeyMode: true, type: 'number', className: 'celsius'} °C</label>
          <span class="arrows">⇄</span>
          <label class="fahrenheit-wrap">$$f{onKeyMode: true, type: 'number', className: 'fahrenheit'} °F</label>
        </p>
      */}
    ]
  });
  Temperature.create().write();

  MODEL({
    name: 'Temperature2',
    documentation: "Version 2: Save as version 1, but upgrades fields to FloatProperties and sets the 'precision' of the views.",
    properties: [
      { name: 'c', type: 'Float' },
      { name: 'f', type: 'Float' }
    ],
    methods: {
      init: function() { Events.relate(this.c$, this.f$, this.c2f, this.f2c); },
      c2f: function(f) { return 9/5 * f + 32; },
      f2c: function(c) { return 5/9 * ( c - 32 ); }
    },
    templates: [
      function toDetailHTML() {/*
        <p class="temperature-converter">
          <label class="celsius-wrap">$$c{onKeyMode: true, precision: 4, className: 'celsius'} °C</label>
          <span class="arrows">⇄</span>
          <label class="fahrenheit-wrap">$$f{onKeyMode: true, precision: 4, className: 'fahrenheit'} °F</label>
        </p>
      */}
    ]
  });
  Temperature2.create().write();

  MODEL({
    name: 'Temperature3',
    documentation: "Version 3: Uses the postSet's on the properties instead of relate().",
    properties: [
      {
        name: 'c',
        type: 'Float',
        postSet: function(oldValue, newValue) {
          if ( oldValue !== newValue ) this.f = 9/5 * newValue + 32;
        }
      },
      {
        name: 'f',
        type: 'Float',
        defaultValue: 32,
        postSet: function(oldValue, newValue) {
          if ( oldValue !== newValue ) this.c = 5/9 * ( newValue - 32 );
        }
      }
    ],
    templates: [
      function toDetailHTML() {/*
        <p class="temperature-converter">
          <label class="celsius-wrap">$$c{onKeyMode: true, precision: 4, className: 'celsius'} °C</label>
          <span class="arrows">⇄</span>
          <label class="fahrenheit-wrap">$$f{onKeyMode: true, precision: 4, className: 'fahrenheit'} °F</label>
        </p>
      */}
    ]
  });
  Temperature3.create().write();
});
