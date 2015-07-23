package foam.android.view;

import android.content.Context;
import android.util.AttributeSet;
import android.widget.TextView;

/**
 * Created by braden on 7/7/15.
 */
public class FoamTagView extends TextView {
  public FoamTagView(Context context, AttributeSet attrs) {
    super(context, attrs);
    readFoamAttrs(attrs);
  }
  public FoamTagView(Context context, AttributeSet attrs, int defStyle) {
    super(context, attrs, defStyle);
  }

  private void readFoamAttrs(AttributeSet attrs) {
    for (int i = 0; i < attrs.getAttributeCount(); i++) {
      if (attrs.getAttributeName(i).equals("prop")) {
        setText("$$" + attrs.getAttributeValue(i));
      }
    }
  }
}
