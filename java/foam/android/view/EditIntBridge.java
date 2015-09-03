package foam.android.view;

import android.content.Context;
import android.util.AttributeSet;
import android.widget.EditText;

import foam.core.Value;

/**
 * View bridge that binds an {@link EditText} to a FOAM {@link Value<Integer>}.
 */
public class EditIntBridge extends AbstractTextFieldBridge<EditText, Integer> {
  public EditIntBridge(Context context) {
    super(context);
  }
  public EditIntBridge(Context context, AttributeSet attrs) {
    super(context, attrs);
  }

  @Override
  protected EditText makeInnerView(Context context, AttributeSet attrs) {
    return new EditText(context, attrs);
  }

  @Override
  protected Integer convertStringToValue(String s) {
    return Integer.parseInt(s);
  }

  @Override
  protected String convertValueToString(Integer s) {
    return s.toString();
  }
}
