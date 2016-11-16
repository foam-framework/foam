package foam.lib.parse;

public interface ParserContext {
  public Object get(String key);
  public void set(String key, Object value);
  public ParserContext sub();
}
