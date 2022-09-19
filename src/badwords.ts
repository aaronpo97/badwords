import wordList from "./wordList.json";

interface Options {
   emptyList?: boolean | undefined;
   exclude?: string[] | undefined;
   list?: string[] | undefined;
   placeHolder?: string | undefined;
   regex?: RegExp | undefined;
   replaceRegex?: RegExp | undefined;
   splitRegex?: RegExp | undefined;
}
class Filter {
   list: string[];
   exclude: string[];
   splitRegex: RegExp;
   placeHolder: string;
   regex: RegExp;
   replaceRegex: RegExp;

   private constructor(options: Options) {
      const { list, exclude, splitRegex, placeHolder, regex, replaceRegex } = options;
      this.list = list!;
      this.exclude = exclude!;
      this.splitRegex = splitRegex!;
      this.placeHolder = placeHolder!;
      this.regex = regex!;
      this.replaceRegex = replaceRegex!;
   }

   /**
    * @param options - Filter instance options
    * @param options.emptyList - Instantiate filter with no blocklist.
    * @param options.list - Instantiate filter with custom list.
    * @param options.placeHolder - Character used to replace profane words.
    * @param options.regex - Regular expression used to sanitize words before comparing them to blocklist.
    * @param options.replaceRegex - Regular expression used to replace profane words with placeHolder.
    * @param options.splitRegex - Regular expression used to split a string into words.
    */
   static createFilter(options: Options = {}) {
      const {
         list = options.emptyList ? [] : wordList,
         exclude = [],
         splitRegex = /\b/,
         placeHolder = "*",
         regex = /[^a-zA-Z0-9|\$|\@]|\^/g,
         replaceRegex = /\w/g,
      } = options;

      return new Filter({ list, exclude, splitRegex, placeHolder, regex, replaceRegex });
   }
   /**
    * Determine if a string contains profane language.
    * @param string - String to evaluate for profanity.
    */
   isProfane(string: string) {
      return (
         this.list.filter(word => {
            const wordExp = new RegExp(`\\b${word.replace(/(\W)/g, "\\$1")}\\b`, "gi");
            return !this.exclude.includes(word.toLowerCase()) && wordExp.test(string);
         }).length > 0 || false
      );
   }

   /**
    * Replace a word with placeHolder characters;
    * @param string - String to replace.
    */
   replaceWord(string: string) {
      return string.replace(this.regex, "").replace(this.replaceRegex, this.placeHolder);
   }

   /**
    * Evaluate a string for profanity and return an edited version.
    * @param string - Sentence to filter.
    */
   clean(string: string) {
      return string
         .split(this.splitRegex)
         .map(word => {
            return this.isProfane(word) ? this.replaceWord(word) : word;
         })
         .join(this.splitRegex.exec(string)![0]);
   }

   /**
    * Add words to blocklist filter / remove words from allowlist filter
    * @param words - Words to add to blocklist
    */
   addWords(words: string[]) {
      this.list.push(...words);

      words
         .map(word => word.toLowerCase())
         .forEach(word => {
            if (this.exclude.includes(word)) {
               this.exclude.splice(this.exclude.indexOf(word), 1);
            }
         });
   }

   /**
    * Add words to allowlist filter
    * @param words - Word(s) to add to allowlist.
    */
   removeWords(words: string[]) {
      this.exclude.push(...words.map(word => word.toLowerCase()));
   }
}

export default Filter;
