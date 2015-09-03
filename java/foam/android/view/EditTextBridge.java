package foam.android.view;

import android.content.Context;
import android.util.AttributeSet;
import android.widget.EditText;

import foam.core.Value;

/**
 * View bridge that binds an {@link EditText} to a FOAM {@link Value <String>}.
 */
public class EditTextBridge extends AbstractTextFieldBridge<EditText, String> {
  public EditTextBridge(Context context) {
    super(context);
  }
  public EditTextBridge(Context context, AttributeSet attrs) {
    super(context, attrs);
  }

  @Override
  protected EditText makeInnerView(Context context, AttributeSet attrs) {
    return new EditText(context, attrs);
  }

  @Override
  protected String convertStringToValue(String s) {
    return s;
  }

  @Override
  protected String convertValueToString(String s) {
    return s;
  }
}
