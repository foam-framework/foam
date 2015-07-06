package foam.android.view;

import android.content.Context;
import android.view.View;

import foam.core.Property;
import foam.core.X;

/**
 * The base View for all FOAM wrapper views.
 *
 * Doesn't do very much. TwoWayFView and OneWayFView do the real work.
 */
public class BaseFView<V extends View, P extends Property> extends View {
  private V innerView;
  private X x;
  private P prop;
  private static final String CONTEXT_KEY = "data";

  /**
   * Raw constructor that doesn't take a
   * @param context
   */
  public BaseFView(Context context) {
    super(context);
    this.x = x;
    prop = (P) x.get(CONTEXT_KEY);
  }
}
