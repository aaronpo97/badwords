"use strict";
var __importDefault =
   (this && this.__importDefault) ||
   function (mod) {
      return mod && mod.__esModule ? mod : { default: mod };
   };
Object.defineProperty(exports, "__esModule", { value: true });
const wordList_json_1 = __importDefault(require("./wordList.json"));
class Filter {
   constructor(options) {
      this.list = options.list;
      this.exclude = options.exclude;
      this.splitRegex = options.splitRegex;
      this.placeHolder = options.placeHolder;
      this.regex = options.regex;
      this.replaceRegex = options.replaceRegex;
   }
   static createFilter(options) {
      const {
         list = options.emptyList ? [] : wordList_json_1.default,
         exclude = [],
         splitRegex = /\b/,
         placeHolder = "*",
         regex = /[^a-zA-Z0-9|\$|\@]|\^/g,
         replaceRegex = /\w/g,
      } = options;
      return new Filter({ list, exclude, splitRegex, placeHolder, regex, replaceRegex });
   }
   log() {
      console.log(this);
   }
   isProfane(string) {
      return (
         this.list.filter(word => {
            const wordExp = new RegExp(`\\b${word.replace(/(\W)/g, "\\$1")}\\b`, "gi");
            return !this.exclude.includes(word.toLowerCase()) && wordExp.test(string);
         }).length > 0 || false
      );
   }
   replaceWord(string) {
      return string.replace(this.regex, "").replace(this.replaceRegex, this.placeHolder);
   }
   clean(string) {
      return string
         .split(this.splitRegex)
         .map(word => {
            return this.isProfane(word) ? this.replaceWord(word) : word;
         })
         .join(this.splitRegex.exec(string)[0]);
   }
   addWords() {
      let words = Array.from(arguments);
      this.list.push(...words);
      words
         .map(word => word.toLowerCase())
         .forEach(word => {
            if (this.exclude.includes(word)) {
               this.exclude.splice(this.exclude.indexOf(word), 1);
            }
         });
   }
   removeWords(words) {
      this.exclude.push(...words.map(word => word.toLowerCase()));
   }
}

console.log(Filter.createFilter());
exports.default = Filter;
