export interface LanguageConfig {
  language: string;
  version: string;
}

export interface Hint {
  type: "error" | "warning" | "tip";
  line: number | null;
  msg: string;
}

export interface AnalysisResponse {
  hints: Hint[];
  fixed: string;
}

export const LANGUAGES = [
  "Python", "JavaScript", "TypeScript", "Java", "C", "C++", "C#", "Go", "Rust",
  "PHP", "Swift", "Kotlin", "Ruby", "R", "Scala", "Perl", "Haskell", "Lua",
  "Dart", "Elixir", "Clojure", "F#", "Bash", "PowerShell", "Julia", "Nim",
  "Zig", "OCaml", "Groovy", "Crystal"
];

export const PISTON_LANG_MAP: Record<string, LanguageConfig> = {
  Python:     { language: "python",      version: "3.10.0" },
  JavaScript: { language: "javascript",  version: "18.15.0" },
  TypeScript: { language: "typescript",  version: "5.0.3" },
  Java:       { language: "java",        version: "15.0.2" },
  C:          { language: "c",           version: "10.2.0" },
  "C++":      { language: "c++",         version: "10.2.0" },
  "C#":       { language: "csharp",      version: "6.12.0" },
  Go:         { language: "go",          version: "1.16.2" },
  Rust:       { language: "rust",        version: "1.68.2" },
  PHP:        { language: "php",         version: "8.2.3" },
  Swift:      { language: "swift",       version: "5.3.3" },
  Kotlin:     { language: "kotlin",      version: "1.8.20" },
  Ruby:       { language: "ruby",        version: "3.0.1" },
  R:          { language: "rscript",     version: "4.1.1" },
  Scala:      { language: "scala",       version: "3.2.2" },
  Perl:       { language: "perl",        version: "5.36.0" },
  Haskell:    { language: "haskell",     version: "9.0.1" },
  Lua:        { language: "lua",         version: "5.4.4" },
  Dart:       { language: "dart",        version: "2.19.6" },
  Elixir:     { language: "elixir",      version: "1.11.3" },
  Clojure:    { language: "clojure",     version: "1.10.3" },
  "F#":       { language: "fsharp.net",  version: "5.0.201" },
  Bash:       { language: "bash",        version: "5.2.0" },
  PowerShell: { language: "powershell",  version: "7.1.4" },
  Julia:      { language: "julia",       version: "1.8.5" },
  Nim:         { language: "nim",         version: "1.6.2" },
  Zig:        { language: "zig",         version: "0.10.1" },
  OCaml:      { language: "ocaml",       version: "4.12.0" },
  Groovy:     { language: "groovy",      version: "3.0.7" },
  Crystal:    { language: "crystal",     version: "0.36.1" },
};

export const DEFAULT_SNIPPETS: Record<string, string> = {
  Python: `def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\n\nfor i in range(10):\n    print(fibonacci(i))`,
  JavaScript: `function fibonacci(n) {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nfor (let i = 0; i < 10; i++) {\n    console.log(fibonacci(i));\n}`,
  TypeScript: `function fibonacci(n: number): number {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nfor (let i = 0; i < 10; i++) {\n    console.log(fibonacci(i));\n}`,
  Java: `public class Main {\n    public static int fibonacci(int n) {\n        if (n <= 1) return n;\n        return fibonacci(n - 1) + fibonacci(n - 2);\n    }\n    public static void main(String[] args) {\n        for (int i = 0; i < 10; i++) {\n            System.out.println(fibonacci(i));\n        }\n    }\n}`,
  C: `#include <stdio.h>\n\nint fibonacci(int n) {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nint main() {\n    for (int i = 0; i < 10; i++) {\n        printf("%d\\n", fibonacci(i));\n    }\n    return 0;\n}`,
  "C++": `#include <iostream>\n\nint fibonacci(int n) {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nint main() {\n    for (int i = 0; i < 10; i++) {\n        std::cout << fibonacci(i) << std::endl;\n    }\n    return 0;\n}`,
  Go: `package main\n\nimport "fmt"\n\nfunc fibonacci(n int) int {\n\tif n <= 1 {\n\t\treturn n\n\t}\n\treturn fibonacci(n-1) + fibonacci(n-2)\n}\n\nfunc main() {\n\tfor i := 0; i < 10; i++ {\n\t\tfmt.Println(fibonacci(i))\n\t}\n}`,
  Rust: `fn fibonacci(n: u32) -> u32 {\n    if n <= 1 {\n        return n;\n    }\n    fibonacci(n - 1) + fibonacci(n - 2)\n}\n\nfn main() {\n    for i in 0..10 {\n        println!("{}", fibonacci(i));\n    }\n}`,
  Ruby: `def fibonacci(n)\n  return n if n <= 1\n  fibonacci(n - 1) + fibonacci(n - 2)\nend\n\n10.times do |i|\n  puts fibonacci(i)\nend`
};

export const COLOR_THEME = {
  bg: "#080b14",
  s1: "#0e1220",
  s2: "#141826",
  s3: "#1c2235",
  border: "#252d45",
  borderHi: "#3a4468",
  text: "#e2e8ff",
  muted: "#6b7599",
  dim: "#3d4a6b",
  accent: "#7b6cf6",
  accentLo: "#7b6cf61c",
  accentHi: "#9d92ff",
  green: "#22d3a0",
  greenLo: "#22d3a01c",
  greenHi: "#22d3a0",
  amber: "#f5a623",
  amberLo: "#f5a6231c",
  red: "#f87171",
  redLo: "#f871711c",
  cyan: "#22d3ee",
  cyanLo: "#22d3ee1c"
};
