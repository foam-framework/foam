package foam.android.view;

import android.content.Context;
import android.util.AttributeSet;

import foam.android.core.AttributeUtils;
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
    if (prop.getType() == Property.TYPE_INTEGER) {
      return readOnly ? new IntViewBridge(context, attrs) : new EditIntBridge(context, attrs);
    } else if (prop.getType() == Property.TYPE_STRING) {
      return readOnly ? new TextViewBridge(context, attrs) : new EditTextBridge(context, attrs);
    } else if (prop.getType() == Property.TYPE_BOOLEAN) {
      return new CheckBoxBridge(context, attrs);
    } else if (prop.isArray()) {
      // TODO(braden): Assumes the array is of modeled objects.
      return new DAOListViewBridge(context, attrs);
    }
    return null;
  }
}
