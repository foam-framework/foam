package foam.android.view;

import android.content.Context;
import android.util.AttributeSet;

import foam.android.core.AttributeUtils;
import foam.core.AbstractBooleanProperty;
import foam.core.AbstractIntProperty;
import foam.core.AbstractStringProperty;
import foam.core.Property;

/**
 * Factory for building default Android views for the different FOAM {@link Property} types.
 *
 * This is separate from the property types themselves to keep foam.core clean of Android
 * references.
 */
public class PropertyViewFactory {
  public static ViewBridge create(Property prop, Context context) {
    return create(prop, context, null);
  }

  public static ViewBridge create(Property prop, Context context, AttributeSet attrs) {
    boolean readOnly = AttributeUtils.findBoolean(attrs, "read_only", false);
    if (prop instanceof AbstractIntProperty) {
      return readOnly ? new IntViewBridge(context, attrs) : new EditIntBridge(context, attrs);
    } else if (prop instanceof AbstractStringProperty) {
      return readOnly ? new TextViewBridge(context, attrs) : new EditTextBridge(context, attrs);
    } else if (prop instanceof AbstractBooleanProperty) {
      return new CheckBoxBridge(context, attrs);
    }
    return null;
  }
}
