package foam.android.view;

import android.content.Context;
import android.support.design.widget.TextInputLayout;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.AttributeSet;
import android.widget.EditText;

import foam.core.PropertyValue;
import foam.core.Value;

/**
 * FOAM wrapper for Android's EditView.
 */
public class EditTextAdapter extends TwoWayViewAdapter<TextInputLayout> {
  public EditTextAdapter(Context context) {
    this(context, null);
  }
  public EditTextAdapter(Context context, AttributeSet attrs) {
    view = new TextInputLayout(context);
    EditText text = attrs == null ? new EditText(context) : new EditText(context, attrs);
    view.addView(text);

    view.setPadding(8, 16, 8, 8);

    text.addTextChangedListener(new TextWatcher() {
      @Override
      public void afterTextChanged(Editable e) {
        updateValueFromView(e.toString());
      }

      @Override
      public void onTextChanged(CharSequence s, int start, int before, int count) {
      }

      @Override
      public void beforeTextChanged(CharSequence s, int start, int before, int count) {
      }
    });
  }

  public void setValue(Value v) {
    super.setValue(v);
    if (v instanceof PropertyValue) {
      view.setHint(((PropertyValue) v).getProperty().getLabel());
    }
  }

  protected void updateViewFromValue() {
    view.getEditText().setText((String) value.get());
  }
}
