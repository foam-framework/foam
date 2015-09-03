package foam.android.view;

import android.content.Context;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.AttributeSet;
import android.widget.TextView;

import foam.core.Value;

/**
 * Base class for non-MD-wrapped editable text views, like {@link EditTextBridge}.
 */
public abstract class AbstractTextFieldBridge<V extends TextView, T> extends TwoWayViewBridge<V, T> implements TextWatcher {
  public AbstractTextFieldBridge(Context context) {
    this(context, null);
  }
  public AbstractTextFieldBridge(Context context, AttributeSet attrs) {
    view = makeInnerView(context, attrs);
    view.addTextChangedListener(this);
  }

  protected abstract V makeInnerView(Context context, AttributeSet attrs);

  protected abstract T convertStringToValue(String s);
  protected abstract String convertValueToString(T t);

  protected void updateViewFromValue() {
    String oldValue = view.getText().toString();
    String newValue = convertValueToString(value.get());
    if (!oldValue.equals(newValue)) view.setText(newValue);
  }

  public void setValue(Value<T> v) {
    super.setValue(v);
    String label = getLabel(v);
    if (label != null) view.setHint(label);
  }

  @Override
  public void afterTextChanged(Editable e) {
    updateValueFromView(convertStringToValue(e.toString()));
  }

  @Override
  public void onTextChanged(CharSequence s, int start, int before, int count) {
  }

  @Override
  public void beforeTextChanged(CharSequence s, int start, int before, int count) {
  }
}
