CLASS({
  name: 'ToggleView',
  package: 'foam.ui.md',
  extendsModel: 'foam.ui.SimpleView',
  properties: [
    {
      name: 'data'
    },
    {
      name: 'className',
      defaultValue: 'checkbox-container'
    }
  ],
  templates: [
    function CSS() {/*
      .checkbox-container {
        display: inline-block;
        padding: 12px 10px;
      }

      .checkbox-background {
        background-color: #9e9e9e;
        border-radius: 7px;
        position: relative;
        height: 14px;
        width: 36px;
      }
      .checkbox-lever {
        background-color: #f5f5f5;
        border: 1px solid #ccc;
        border-radius: 50%;
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.15);
        height: 20px;
        width: 20px;
        position: absolute;
        top: -3px;
        left: 0;
        transition: left .08s;
      }

      .checkbox-background.enabled {
        background-color: #7baaf7; // Google Blue 300
      }
      .checkbox-background.enabled .checkbox-lever {
        border: none;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.26);
        background-color: #3367d6;
        left: inherit;
        left: 16px;
      }
    */},
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div id="<%=this.id%>-background" class="checkbox-background">
          <div class="checkbox-lever"></div>
        </div>
      </div>
      <%
        this.on('click', function() { self.data = !self.data; }, this.id);
        this.setClass('enabled', function() { return !!self.data; },
            this.id + '-background');
      %>
    */}
  ]
});
