package foam.android.app;

import android.app.FragmentManager;
import android.app.FragmentTransaction;
import android.os.Bundle;
import android.os.Parcelable;
import android.support.annotation.IdRes;
import android.view.Menu;
import android.view.MenuItem;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import java.io.Serializable;
import java.util.ArrayList;

import foam.android.core.FOAMActionBarActivity;
import foam.android.core.FOAMFragment;
import foam.core.FObject;
import foam.core.PubSubListener;
import foam.core.SimpleValue;
import foam.core.ValueChangeEvent;
import foam.dao.DAO;
import foam.tutorials.todo.R;


public class BrowserActivity extends FOAMActionBarActivity implements PubSubListener<ValueChangeEvent<FObject>>, StackManager {
  /**
   * Subclasses are expected to set {@link #dao} properly.
   */
  protected DAO dao;
  private SimpleValue<FObject> selection;
  private FrameLayout frame;
  @IdRes
  private final int frameId = 225;

  private ArrayList<Bundle> mementoStack;
  private Bundle memento;
  private FOAMFragment fragment;

  private boolean created = false;


  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    selection = new SimpleValue<>();
    X(X().put("selection", selection).put("dao", dao));

    selection.addListener(this);

    frame = new FrameLayout(this);
    frame.setId(frameId);
    setContentView(frame, new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT));

    created = true;
    updateView();
  }

  @Override
  protected Bundle defaultMemento() {
    Bundle current = new Bundle();
    current.putString("fragment_", "foam.android.app.ListFragment");

    Bundle mem = new Bundle();
    mem.putParcelable("current", current);
    mem.putParcelableArrayList("stack", new ArrayList<Parcelable>());
    return mem;
  }

  @Override
  public void setMemento(Bundle bundle) {
    // A complete memento for me is:
    // stack: an ArrayList<Bundle> for the back stack
    // current: a single Bundle for the current memento

    mementoStack = bundle.getParcelableArrayList("stack");
    memento = bundle.getParcelable("current");
    updateView();
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
    mementoStack.add(memento);
    memento = newMemento;
    updateView();
  }

  @Override
  public void replaceMemento(Bundle newMemento) {
    memento = newMemento;
    updateView();
  }

  @Override
  public void popMemento() {
    int index = mementoStack.size() - 1;
    if (index >= 0) {
      memento = mementoStack.remove(index);
      updateView();
    }
  }

  @Override
  public void eventOccurred(String[] topic, ValueChangeEvent<FObject> event) {
    FObject nu = event.getNewValue();
    if (nu == null) {
      mementoStack.clear();
      Bundle newMemento = new Bundle();
      newMemento.putString("fragment_", "foam.android.app.ListFragment");
      pushMemento(newMemento);
    } else {
      Bundle newMemento = new Bundle();
      newMemento.putSerializable("data", (Serializable) nu.model().getID().get(nu));
      newMemento.putString("fragment_", "foam.android.app.DetailFragment");
      pushMemento(newMemento);
    }
  }

  /**
   * Renders the correct fragment for the current memento.
   */
  private void updateView() {
    if (!created) return;
    FragmentManager manager = getFragmentManager();
    FragmentTransaction trans = manager.beginTransaction();

    fragment = (FOAMFragment) X().newInstance(memento.getString("fragment_"));
    fragment.setArguments(memento);
    trans.replace(frameId, fragment);

    boolean forward = mementoStack.size() > 0;
    trans.setTransition(forward ? FragmentTransaction.TRANSIT_FRAGMENT_OPEN : FragmentTransaction.TRANSIT_FRAGMENT_CLOSE);
    trans.commit();
    getSupportActionBar().setDisplayHomeAsUpEnabled(forward);
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
  public boolean onCreateOptionsMenu(Menu menu) {
    // Inflate the menu; this adds items to the action bar if it is present.
    getMenuInflater().inflate(R.menu.menu_main, menu);
    return true;
  }
  @Override
  public boolean onOptionsItemSelected(MenuItem item) {
    // Handle action bar item clicks here. The action bar will
    // automatically handle clicks on the Home/Up button, so long
    // as you specify a parent activity in AndroidManifest.xml.
    int id = item.getItemId();

    //noinspection SimplifiableIfStatement
    if (id == R.id.action_settings) {
      return true;
    }

    return super.onOptionsItemSelected(item);
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
}
