package foam.android.view;

import android.content.Context;
import android.util.AttributeSet;
import android.widget.CheckBox;
import android.widget.CompoundButton;

import foam.core.Value;

/**
 * FOAM wrapper for Android CheckBox views.
 */
public class CheckBoxBridge extends TwoWayViewBridge<CheckBox, Boolean> implements CompoundButton.OnCheckedChangeListener {
  public CheckBoxBridge(Context context) {
    this(context, null);
  }
  public CheckBoxBridge(Context context, AttributeSet attrs) {
    view = attrs == null ? new CheckBox(context) : new CheckBox(context, attrs);
    view.setOnCheckedChangeListener(this);
  }

  public void setValue(Value<Boolean> v) {
    super.setValue(v);
    String label = getLabel(v);
    if (label != null) view.setText(label);
  }

  protected void updateViewFromValue() {
    Object o = value.get();
    view.setChecked(o == null ? false : (Boolean) o);
  }

  public void onCheckedChanged(CompoundButton v, boolean nu) {
    updateValueFromView(nu);
  }
}
