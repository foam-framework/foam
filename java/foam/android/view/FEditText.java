package foam.android.view;

import android.content.Context;
import android.text.Editable;
import android.text.TextWatcher;
import android.widget.EditText;

import foam.core.AbstractStringProperty;
import foam.core.PropertyChangeEvent;
import foam.core.PropertyChangeListener;
import foam.core.Value;
import foam.core.X;

/**
 * FOAM wrapper for Android's EditView.
 *
 * Expects either a {@link X} with "data" to be a {@link Value}, or {@link #setValue(Value)} to be
 * called with a {@link Value} for an {@link AbstractStringProperty}.
 */
public class FEditText extends EditText implements PropertyView, PropertyChangeListener {
  private Value value;
  private boolean feedback = false;

  public FEditText(Context context) {
    super(context);
    addTextChangedListener(new TextWatcher() {
      @Override
      public void afterTextChanged(Editable e) {
        feedback = true;
        value.set(e.toString());
        feedback = false;
      }
      @Override
      public void onTextChanged(CharSequence s, int start, int before, int count) {
      }
      @Override
      public void beforeTextChanged(CharSequence s, int start, int before, int count){ }
    });
  }

  public void setX(X x) {
    setValue((Value) x.get("data"));
  }
  public void setValue(Value v) {
    if (value != null) value.removeListener(this);
    value = v;
    v.addListener(this);
    setText((String) v.get());
  }

  public void propertyChange(PropertyChangeEvent event) {
    if (!feedback) setText((String) event.getNewValue());
  }
}

