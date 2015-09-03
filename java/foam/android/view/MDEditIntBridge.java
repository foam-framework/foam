package foam.android.view;

import android.content.Context;
import android.support.design.widget.TextInputLayout;
import android.util.AttributeSet;
import android.widget.EditText;

/**
 * Wraps an {@link EditText} (actually {@link TextInputLayout}) with conversion to and from
 * an integer.
 */
public class MDEditIntBridge extends AbstractMDTextFieldBridge<EditText, Integer> {
  public MDEditIntBridge(Context context) {
    super(context);
  }
  public MDEditIntBridge(Context context, AttributeSet attrs) {
    super(context, attrs);
  }

  @Override
  protected EditText makeInnerView(Context context) {
    return new EditText(context);
  }

  @Override
  protected Integer convertStringToValue(String s) {
    return Integer.parseInt(s);
  }

  @Override
  protected String convertValueToString(Integer t) {
    return t.toString();
  }
  // TODO(braden): Override other TextWatcher calls to disallow entering non-numeric values.
}
