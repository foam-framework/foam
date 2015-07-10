package foam.android.core;

import android.util.Log;
import android.view.View;

import java.util.HashMap;
import java.util.Map;

import foam.core.X;

/**
 * Global tree that maps View IDs to FOAM X contexts.
 *
 * TODO(braden): This probably leaks memory as the app evolves. These should be tied to Activities.
 */
public class XTree {
  private static Map<Integer, X> map = new HashMap<>();

  public static X get(int id) {
    return map.get(id);
  }

  public static void put(int id, X x) {
    if (id == View.NO_ID) {
      Log.w("FOAM Context Manager", "FOAM views with contexts need IDs!");
      return;
    }

    map.put(id, x);
  }
}
