package foam.android.view;

import android.content.Context;
import android.widget.CheckBox;
import android.widget.CompoundButton;

import foam.core.PropertyChangeEvent;
import foam.core.PropertyChangeListener;
import foam.core.Value;

/**
 * FOAM wrapper for Android CheckBox views.
 */
public class FCheckBox extends CheckBox implements PropertyView, PropertyChangeListener, CompoundButton.OnCheckedChangeListener {
  private Value value;
  private boolean feedback = false;

  public FCheckBox(Context context) {
    super(context);
    setOnCheckedChangeListener(this);
  }

  public void setValue(Value v) {
    if (value != null) value.removeListener(this);
    value = v;
    setChecked(((Boolean) v.get()).booleanValue());
    setText(v.getProperty().getLabel());
  }

  public void onCheckedChanged(CompoundButton v, boolean nu) {
    feedback = true;
    value.set(nu);
    feedback = false;
  }

  public void propertyChange(PropertyChangeEvent event) {
    if (!feedback) setChecked(((Boolean) event.getNewValue()).booleanValue());
  }
}
