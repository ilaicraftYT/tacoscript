const FALSE = { type: "bool", value: false };
const PRECEDENCE = {
  "=": 1,
  "||": 2,
  "&&": 3,
  "<": 7,
  ">": 7,
  "<=": 7,
  ">=": 7,
  "==": 7,
  "!=": 7,
  "+": 10,
  "-": 10,
  "*": 20,
  "/": 20,
  "%": 20,
};

class Parser {
  /**
   *
   * @param {Lexer} input
   */
  constructor(input) {
    this.input = input;
  }

  isPunc(ch) {
    let tok = this.input.peek();
    return tok && tok.type == "punc" && (!ch || tok.value == ch) && tok;
  }

  isKeyword(kw) {
    let tok = this.input.peek();
    return tok && tok.type == "kw" && (!kw || tok.value == kw) && tok;
  }

  isOperator(op) {
    let tok = this.input.peek();
    return tok && tok.type == "op" && (!op || tok.value == op) && tok;
  }

  skipPunc(ch) {
    if (this.isPunc(ch)) this.input.next();
    else this.input.croak("expecting punctuation");
  }

  skipKeyword(kw) {
    if (this.isKeyword(kw)) this.input.next();
    else this.input.croak("expecting keyword");
  }

  skipOperator(op) {
    if (this.isOperator(op)) this.input.next();
    else this.input.croak("expecting operator");
  }

  unexpected() {
    this.input.croak("unexpected token");
  }

  maybeBinary(left, myPrec) {
    let tok = this.isOperator();
    if (tok) {
      let hisPrec = PRECEDENCE[tok.value];
      if (hisPrec > myPrec) {
        this.input.next();
        return this.maybeBinary(
          {
            type: tok.value == "=" ? "assign" : "binary",
            operator: tok.value,
            left: left,
            right: this.maybeBinary(this.parseAtom(), hisPrec),
          },
          myPrec
        );
      }
    }
    return left;
  }

  delimited(start, stop, separator, parser) {
    let a = [];
    let first = true;
    this.skipPunc(start);
    while (!this.input.eof()) {
      if (this.isPunc(stop)) break;
      if (first) first = false;
      else this.skipPunc(separator);
      if (this.isPunc(stop)) break;
      a.push(parser());
    }
    this.skipPunc(stop);
    return a;
  }

  parseCall(func) {
    return {
      type: "call",
      func: func,
      args: delimited("(", ")", ",", this.parseExpression),
    };
  }

  parseVarname() {
    let name = this.input.next();
    if (name.type != "var") this.input.croak("expecting variable name");
    return name.value;
  }

  parseIf() {
    this.skipKeyword("if");
    let cond = this.parseExpression();
    let then = this.parseExpression();
    let ret = {
      type: "if",
      cond,
      then,
    };
    if (this.isKeyword("else")) {
      this.input.next();
      ret.else = this.parseExpression();
    }
    return ret;
  }

  parseFunction() {
    return {
      type: "func",
      vars: delimited("(", ")", ",", this.parseVarname),
      body: this.parseExpression(),
    };
  }

  parseBool() {
    return {
      type: "bool",
      value: this.input.next().value == "true",
    };
  }

  maybeCall(exp) {
    exp = exp();
    return this.isPunc("(") ? this.parseCall(exp) : exp;
  }

  parseAtom() {
    return this.maybeCall(() => {
      if (this.isPunc("(")) {
        this.input.next();
        let exp = this.parseExpression();
        this.skipPunc(")");
        return exp;
      }

      if (this.isPunc("{")) return this.parseProg();
      if (this.isKeyword("if")) return this.parseIf();
      if (this.isKeyword("true") || this.isKeyword("false"))
        return this.parseBool();
      if (this.isKeyword("func")) {
        this.input.next();
        return this.parseFunction();
      }

      let tok = this.input.next();
      if (tok.type == "var" || tok.type == "Num" || tok.type == "str")
        return tok;
      this.unexpected();
    });
  }

  parseToplevel() {
    let prog = [];
    while (!this.input.eof()) {
      prog.push(this.parseExpression());
      console.log(prog);
      if (!this.input.eof()) this.skipPunc(";");
    }
    return { type: "prog", prog };
  }

  parseProg() {
    let prog = this.delimited("{", "}", ";", this.parseExpression());
    if (prog.length == 0) return FALSE;
    if (prog.length == 1) return prog[0];

    return { type: "prog", prog };
  }

  parseExpression() {
    return this.maybeCall(() => this.maybeBinary(this.parseAtom(), 0));
  }

  parse() {
    return this.parseToplevel();
  }
}

module.exports = Parser;
