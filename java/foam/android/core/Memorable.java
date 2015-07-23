package foam.android.core;

import android.os.Bundle;

/**
 * Interface for any "memorable" object. Used to get and set memento information into a {@link Bundle}.
 *
 * Used by {@link FOAMFragment} and {@link FOAMActivity} to save their state and manage back behavior.
 *
 * Most memorable objects are fragments, descended from {@link FOAMFragment}. In order for
 * {@link FOAMActivity} and friends to reconstruct the fragments on the back stack, all memorable
 * fragments should store their classname under the "fragment" key.
 */
public interface Memorable {
  Bundle getMemento();
  void setMemento(Bundle bundle);
}
