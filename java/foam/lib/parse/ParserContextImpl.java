package foam.lib.parse;

import java.util.HashMap;

public class ParserContextImpl implements ParserContext {
  private HashMap<String, Object> map_ = new HashMap<String, Object>();
  private ParserContext parent_ = null;

  public Object get(String key) {
    if ( map_.containsKey(key) )
      return map_.get(key);
    if ( parent_ != null )
      return parent_.get(key);
    return null;
  }

  public void set(String key, Object value)  {
    map_.put(key, value);
  }

  public ParserContext sub() {
    ParserContextImpl child = new ParserContextImpl();
    child.parent_ = this;
    return child;
  }
}
