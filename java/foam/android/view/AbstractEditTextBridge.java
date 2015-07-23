package foam.android.view;

import android.content.Context;
import android.support.design.widget.TextInputLayout;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.AttributeSet;
import android.widget.EditText;

import foam.core.Value;

/**
 * Generic superclass for a {@link ViewBridge} that converts from some input type to and from a
 * {@link String} in the view.
 */
public abstract class AbstractEditTextBridge<T> extends TwoWayViewBridge<TextInputLayout, T> implements TextWatcher {
  public AbstractEditTextBridge(Context context) {
    this(context, null);
  }
  public AbstractEditTextBridge(Context context, AttributeSet attrs) {
    view = new TextInputLayout(context);
    EditText text = attrs == null ? new EditText(context) : new EditText(context, attrs);
    view.addView(text);

    view.setPadding(8, 16, 8, 8);

    text.addTextChangedListener(this);
  }

  protected abstract T convertStringToValue(String s);

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
