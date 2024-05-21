class InputStream {
  constructor(input) {
    this.pos = 0;
    this.line = 1;
    this.col = 1;
    this.input = input;
  }

  next() {
    let ch = this.input.charAt(this.pos++);
    if (ch == "\n") {
      this.line++;
      col = 0;
    } else this.col++;

    return ch;
  }

  peek() {
    return this.input.charAt(this.pos);
  }

  eof() {
    return this.peek() == "";
  }

  croak(msg) {
    throw new Error(`${msg} (${this.line}:${this.col})`);
  }
}

module.exports = InputStream;
