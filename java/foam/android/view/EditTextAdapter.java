package foam.android.view;

import android.content.Context;
import android.text.Editable;
import android.text.TextWatcher;
import android.widget.EditText;

/**
 * FOAM wrapper for Android's EditView.
 */
public class EditTextAdapter extends TwoWayViewAdapter<EditText> {
  public EditTextAdapter(Context context) {
    view = new EditText(context);
    view.addTextChangedListener(new TextWatcher() {
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

  protected void updateViewFromValue() {
    view.setText((String) value.get());
  }
}

