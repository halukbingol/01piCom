export class ZhbConstant {
  public static readonly SVG_NS = 'http://www.w3.org/2000/svg';

  /**
   * Field separator used in a content's `trace` file: `state@|@text`. The part
   * before the separator is the state number; the part after is the text shown
   * on the trace pane for that state.
   */
  public static readonly TRACE_SEPARATOR = '@|@';


  /**
   * Append to the title of the html page.
   */
  public static readonly SITE = '  |  01pi.com';


  /**
   * Default content appears at `http://localhost:8080/`
   */
  public static readonly DEFAULT_CONTENT = 'PrimitiveTypes';

}
