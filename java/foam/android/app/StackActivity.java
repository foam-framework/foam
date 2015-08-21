package foam.android.app;

import android.app.Activity;
import android.os.Bundle;
import android.support.annotation.IdRes;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentTransaction;
import android.util.Log;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import java.util.ArrayList;

import foam.android.core.FOAMActionBarActivity;
import foam.android.core.FOAMFragment;

/**
 * Abstract {@link Activity} that forms the basis for a generic FOAM app.
 *
 * Implements {@link StackManager}, and expects to juggle a stack of {@link FOAMFragment}s. Supports
 * an ActionBar and allows navigation back through the stack by Back button or action bar arrow.
 *
 * Subclasses must implement {@link #defaultMemento()} to provide the default, fresh-start state.
 */
public abstract class StackActivity extends FOAMActionBarActivity implements StackManager {
  private static final String LOG_TAG = "FOAM StackActivity";
  private FrameLayout frame;
  @IdRes
  private final int frameId = 278;

  private ArrayList<Bundle> mementoStack;
  private FOAMFragment fragment;
  private boolean finishedConstruction = false;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState); // Sets memento, if it exists.

    frame = new FrameLayout(this);
    frame.setId(frameId);
    setContentView(frame, new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT));

    Bundle mem = savedInstanceState != null ? savedInstanceState.getBundle("memento") : null;
    if (mem == null) {
      mem = new Bundle();
      mem.putParcelableArrayList("stack", new ArrayList<Bundle>());
      mem.putParcelable("current", defaultMemento());
    }
    finishedConstruction = true;
    setMemento(mem);
  }

  @Override
  public void setMemento(Bundle bundle) {
    mementoStack = bundle.getParcelableArrayList("stack");
    Bundle memento = bundle.getParcelable("current");
    updateView(memento, FragmentTransaction.TRANSIT_FRAGMENT_FADE);
  }

  @Override
  public Bundle getMemento() {
    Bundle bundle = new Bundle();
    bundle.putParcelable("current", fragment.getMemento());
    bundle.putParcelableArrayList("stack", mementoStack);
    return bundle;
  }

  @Override
  public void onSaveInstanceState(Bundle bundle) {
    bundle.putBundle("memento", getMemento());
  }


  @Override
  public void pushMemento(Bundle newMemento) {
    mementoStack.add(fragment.getMemento()); // Fetch the latest, not the old creation-time one.
    updateView(newMemento, FragmentTransaction.TRANSIT_FRAGMENT_FADE);
  }

  @Override
  public void replaceMemento(Bundle newMemento) {
    updateView(newMemento, FragmentTransaction.TRANSIT_FRAGMENT_FADE);
  }

  @Override
  public void popMemento() {
    int index = mementoStack.size() - 1;
    if (index >= 0) {
      updateView(mementoStack.remove(index), FragmentTransaction.TRANSIT_FRAGMENT_FADE);
    }
    // TODO(braden): Maybe recreate the defaultMemento here? Probably not.
  }

  @Override
  public void clearMementoStack() {
    mementoStack.clear();
  }


  @Override
  public void onBackPressed() {
    if (mementoStack.size() > 0) {
      popMemento();
    } else {
      super.onBackPressed();
    }
  }

  @Override
  public boolean onSupportNavigateUp() {
    return onNavigateUp();
  }

  @Override
  public boolean onNavigateUp() {
    popMemento();
    return true;
  }


  private void updateView(Bundle memento, int transition) {
    if (!finishedConstruction) return;
    FragmentManager manager = getSupportFragmentManager();
    FragmentTransaction trans = manager.beginTransaction();

    fragment = null;
    String className = memento.getString("fragment_");
    try {
      fragment = (FOAMFragment) X().newInstance(className);
    } catch(ClassNotFoundException e) {
      Log.e(LOG_TAG, "Fragment class not found: " + className);
      return;
    } catch(InstantiationException e) {
      Log.e(LOG_TAG, "Error initializing fragment " + className, e);
      return;
    } catch(IllegalAccessException e) {
      Log.e(LOG_TAG, "Could not access default constructor for " + className);
      return;
    }

    fragment.setArguments(memento);
    trans.replace(frameId, fragment);
    trans.setTransition(transition);
    trans.commit();

    getSupportActionBar().setDisplayHomeAsUpEnabled(mementoStack.size() > 0);
  }

  /**
   * Abstract method for subclasses to define the default, starting memento.
   * @return The memento for the starting fragment. (No stack!)
   */
  protected abstract Bundle defaultMemento();
}
