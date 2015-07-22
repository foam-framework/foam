package foam.android.core;

import android.content.Context;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.util.Log;
import android.view.LayoutInflater;

import foam.core.HasX;
import foam.core.X;

/**
 * Wrapper for {@link Fragment} that adds {@link HasX}.
 */
public class FOAMFragment extends Fragment implements HasX, Memorable {
  private Bundle memento;
  private X x_;
  public X X() { return x_; }
  public void X(X x) { x_ = x; }

  public void setMemento(Bundle bundle) {
    memento = bundle;
  }

  public Bundle getMemento() {
    return memento;
  }

  @Override
  public void onCreate(Bundle savedState) {
    super.onCreate(savedState);
    setMemento(getArguments());
  }

  /**
   * Wraps a {@link LayoutInflater} to make sure it's got the correct FOAM {@link X} context.
   * @param inflater The original {@link LayoutInflater} passed to {@link #onCreateView}.
   * @return A new {@link LayoutInflater} that has the right FOAM context.
   */
  protected LayoutInflater decorateInflater(LayoutInflater inflater) {
    return inflater.cloneInContext(new XContext(getActivity(), X()));
  }

  protected X findX(Context context) {
    X x = null;
    if (context instanceof HasX) {
      x = ((HasX) context).X();
    } else if (getActivity() instanceof HasX) {
      x = ((HasX) getActivity()).X();
    }

    if (x == null) Log.e("FOAMFragment", "Could not locate X");
    return x;
  }

  /**
   * Tries to find an integer with the given key, first in the memento and then in the {@link X}.
   *
   * Emits a warning to LogCat when lookup fails. Use the {@link #getInputInt(String, int)} version
   * to avoid this warning.
   *
   * @param key The key to look up.
   * @return Either the found value, or -1.
   */
  protected int getInputInt(String key) {
    int ret = getInputInt(key, -1);
    if (ret == -1) {
      Log.w("FOAMFragment", "Failed to find input int for key \"" + key + "\"");
    }
    return ret;
  }

  /**
   * Tries to find an integer with the given key, first in the memento and then in the {@link X}.
   *
   * Returns the provided defaultValue if the key cannot be found.
   *
   * @param key The key to look up.
   * @param defaultValue To be returned if the key is not found.
   * @return memento.key, X.key or defaultValue, in that order.
   */
  protected int getInputInt(String key, int defaultValue) {
    int fromMem = memento.getInt(key);
    if (fromMem != 0) return fromMem;
    fromMem = memento.getInt(key, -1);
    if (fromMem != -1) return fromMem;

    // Defaulted to two different values. Check the context.
    Object o = X().get(key);
    if (o == null) return defaultValue;
    return (Integer) o;
  }
}
