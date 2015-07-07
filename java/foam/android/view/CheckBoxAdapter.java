package foam.android.view;

import android.content.Context;
import android.widget.CheckBox;
import android.widget.CompoundButton;

/**
 * FOAM wrapper for Android CheckBox views.
 */
public class CheckBoxAdapter extends TwoWayViewAdapter<CheckBox> implements CompoundButton.OnCheckedChangeListener {
  public CheckBoxAdapter(Context context) {
    view = new CheckBox(context);
    view.setOnCheckedChangeListener(this);
  }

  protected void updateViewFromValue() {
    view.setChecked(((Boolean) value.get()).booleanValue());
  }

  public void onCheckedChanged(CompoundButton v, boolean nu) {
    updateValueFromView(nu);
  }
}
