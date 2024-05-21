const fs = require("fs");
const Parser = require("./parser");
const Lexer = require("./lexer");
const InputStream = require("./input");

const file = fs.readFileSync("/home/ilai/TacoScript/examples/example.taco", {
  encoding: "utf-8",
});

const input = new InputStream(file);
const lexer = new Lexer(input);
const parser = new Parser(lexer);
const ast = parser.parse();

console.log(ast);
