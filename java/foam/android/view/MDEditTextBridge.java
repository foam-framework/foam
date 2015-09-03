package foam.android.view;

import android.content.Context;
import android.util.AttributeSet;
import android.widget.EditText;

/**
 * FOAM wrapper for Android's {@link EditText} for editing {@link String}s.
 */
public class MDEditTextBridge extends AbstractMDTextFieldBridge<EditText, String> {
  public MDEditTextBridge(Context context) {
    super(context);
  }
  public MDEditTextBridge(Context context, AttributeSet attrs) {
    super(context, attrs);
  }

  @Override
  protected EditText makeInnerView(Context context) {
    return new EditText(context);
  }

  @Override
  protected String convertStringToValue(String s) {
    return s;
  }

  @Override
  protected String convertValueToString(String t) {
    return t;
  }
}
