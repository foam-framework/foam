package foam.android.view;

import android.content.Context;
import android.support.design.widget.TextInputLayout;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.AttributeSet;
import android.widget.EditText;
import android.widget.TextView;

import foam.core.Value;

/**
 * Base class for text editing views expecting to be wrapped in a {@link TextInputLayout}.
 */
public abstract class AbstractMDTextFieldBridge<V extends TextView, T> extends TwoWayViewBridge<TextInputLayout, T> implements TextWatcher {
  public AbstractMDTextFieldBridge(Context context) {
    this(context, null);
  }
  public AbstractMDTextFieldBridge(Context context, AttributeSet attrs) {
    view = new TextInputLayout(context, attrs);
    V inner = makeInnerView(context);
    inner.addTextChangedListener(this);
    view.addView(inner);
  }

  protected abstract V makeInnerView(Context context);

  protected abstract T convertStringToValue(String s);
  protected abstract String convertValueToString(T t);

  protected void updateViewFromValue() {
    EditText v = view.getEditText();
    String oldValue = v.getText().toString();
    String newValue = convertValueToString(value.get());
    if (!oldValue.equals(newValue)) v.setText(newValue);
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
