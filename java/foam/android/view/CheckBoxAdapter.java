package foam.android.view;

import android.content.Context;
import android.util.AttributeSet;
import android.widget.CheckBox;
import android.widget.CompoundButton;

import foam.core.PropertyValue;
import foam.core.Value;

/**
 * FOAM wrapper for Android CheckBox views.
 */
public class CheckBoxAdapter extends TwoWayViewAdapter<CheckBox, Boolean> implements CompoundButton.OnCheckedChangeListener {
  public CheckBoxAdapter(Context context) {
    this(context, null);
  }
  public CheckBoxAdapter(Context context, AttributeSet attrs) {
    view = attrs == null ? new CheckBox(context) : new CheckBox(context, attrs);
    view.setOnCheckedChangeListener(this);
  }

  public void setValue(Value<Boolean> v) {
    super.setValue(v);
    if (v instanceof PropertyValue) {
      view.setText(((PropertyValue) v).getProperty().getLabel());
    }
  }

  protected void updateViewFromValue() {
    view.setChecked(value.get());
  }

  public void onCheckedChanged(CompoundButton v, boolean nu) {
    updateValueFromView(nu);
  }
}
