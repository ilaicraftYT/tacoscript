class Lexer {
  /**
   *
   * @param {InputStream} input
   */
  constructor(input) {
    this.current = null;
    this.keywords = ["if", "else", "func", "true", "false", "var"];
    this.input = input;
  }
  isKeyword(x) {
    return this.keywords.includes(x);
  }

  isDigit(x) {
    return /[0-9]/i.test(x);
  }

  isIdStart(x) {
    return /[a-z]/i.test(x);
  }

  isId(x) {
    return this.isIdStart(x) || "?!-<>=0123456789".indexOf(x) >= 0;
  }

  isOpChar(x) {
    return "+-*/%=&|<>!".indexOf(x) >= 0;
  }

  isPunc(x) {
    return ",;(){}[]".indexOf(x) >= 0;
  }

  isWhitespace(x) {
    return " \t\n".indexOf(x) >= 0;
  }

  readWhile(predicate) {
    let str = "";
    while (!this.input.eof() && predicate(this.input.peek()))
      str += this.input.next();
    return str;
  }

  readNumber() {
    let hasDot = false;
    let number = this.readWhile((x) => {
      if (x == ".") {
        if (hasDot) return false;
        hasDot = true;
        return true;
      }
      return this.isDigit(x);
    });
    return { type: "num", value: parseFloat(number) };
  }

  readIdent() {
    let id = this.readWhile(this.isId.bind(this));
    return {
      type: this.isKeyword(id) ? "kw" : "var",
      value: id,
    };
  }

  readEscaped(end) {
    let escaped = false;
    let str = "";
    this.input.next();
    while (!this.input.eof()) {
      let ch = this.input.next();
      if (escaped) {
        str += ch;
        escaped = false;
      } else if (ch == "\\") {
        escaped = true;
      } else if (ch == end) {
        break;
      } else {
        str += ch;
      }
    }
    return str;
  }

  readString() {
    return { type: "str", value: this.readEscaped('"') };
  }

  skipComment() {
    this.readWhile((x) => x != "\n");
    this.input.next();
  }

  readNext() {
    this.readWhile(this.isWhitespace);
    if (this.input.eof()) return null;
    let ch = this.input.peek();

    if (ch == "//") {
      this.skipComment();
      return this.readNext();
    }

    console.log(this.isDigit(ch), ch);

    if (ch == '"') return this.readString();
    if (this.isDigit(ch)) return this.readNumber();
    if (this.isIdStart(ch)) return this.readIdent();
    if (this.isPunc(ch))
      return {
        type: "punc",
        value: this.input.next(),
      };
    if (this.isOpChar(ch))
      return {
        type: "op",
        value: this.readWhile(this.isOpChar),
      };

    this.input.croak("canant hanlde karachter: " + ch);
  }

  peek() {
    return this.current || (this.current = this.readNext());
  }

  next() {
    let tok = this.current;
    this.current = null;
    return tok || this.readNext();
  }

  eof() {
    return this.peek() == null;
  }

  croak(msg) {
    this.input.croak(msg);
  }
}

module.exports = Lexer;
