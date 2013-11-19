var value    = SimpleValue.create("<b>bold</b> <i>italic</i> plain");
var text     = TextAreaView.create({value:value, displayWidth:98, onKeyMode:true});
var richText = RichTextView.create({value:value, height:200, onKeyMode:true });
var fgPicker = ColorPickerView.create({});
var bgPicker = ColorPickerView.create({});

var toolbar;
RichTextView.actions.select(TREE(Action.PARENT, Action.CHILDREN))(function(tree) {
  toolbar = ToolbarView.create({ document: document });
  toolbar.addActions(tree.roots);
  toolbar.value.set(richText);
});


fgPicker.value.addListener(function(v) {
  richText.setForegroundColor(v.get());
});
bgPicker.value.addListener(function(v) {
  richText.setBackgroundColor(v.get());
});

document.writeln('<br>Rich<br>');
richText.write(document);
toolbar.write(document);
fgPicker.write(document);
bgPicker.write(document);

document.writeln('Poor<br>');
text.write(document);

