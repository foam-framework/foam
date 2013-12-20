var stack = {
  openWindow: function(view, width, height, opt_cb) {
     var self = this;
     chrome.app.window.create('empty.html', {width: width, height: height}, function(w) {
       w.contentWindow.onload = function() {
         self.window = w.contentWindow;
         $addWindow(w.contentWindow);
         self.window.document.body.innerHTML = view.toHTML();
         view.initHTML();
         w.focus();
         opt_cb && opt_cb(self.window);
       };
       w.onClosed.addListener(function() {
         console.log('onClosed');
         $removeWindow(w.contentWindow);
       });
     });
  },
  pushView: function(view, name, cb) {
     // this.window = window.open('','','width=700,height=600');
     this.openWindow(view, 900, 800, cb);
  },
  back: function() {
    this.window.close();
    this.window = undefined;
  },
  setPreview: function() {
    /* nop */
  }
};

function launchController() {
    controller = ActionBorder.create(DAOController, DAOController.create({
      model: Person,
      dao: PersonDAO
    }));
    controller.__proto__.stackView = stack;

    stack.pushView(controller, '', function() {});
}

chrome.app.runtime.onLaunched.addListener(launchController);
