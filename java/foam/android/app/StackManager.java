package foam.android.app;

import android.app.Activity;
import android.os.Bundle;

import foam.android.core.Memorable;

/**
 * Interface for an object, usually an {@link Activity}, that manages a stack of mementos.
 *
 * See {@link Memorable} for the details of memorability.
 */
public interface StackManager extends Memorable {
  /**
   * The current memento is pushed onto the back stack, and the provided memento made current.
   * @param memento A new memento to become current.
   */
  void pushMemento(Bundle memento);

  /**
   * The current memento is discarded, and the provided one becomes current in its place.
   * @param memento The new memento to become current.
   */
  void replaceMemento(Bundle memento);

  /**
   * Discards the current memento and replaces it with the one from the top of the back stack.
   *
   * Generally not called directly; more often called in response to a Back action by the user.
   */
  void popMemento();

  /**
   * Drops everything from the back stack. Does NOT change the current memento.
   */
  void clearMementoStack();
}
