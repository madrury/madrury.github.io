require 'rouge'

module Rouge
  module Lexers
    class Pari < RegexLexer
      title 'PARI/GP'
      desc 'The PARI/GP computer algebra system'
      tag 'pari'
      aliases 'gp', 'pari-gp'
      filenames '*.gp', '*.pari'

      keywords = %w[
        if else for forprime foreach while until break next return
        local my global func print printl
      ]

      builtins = %w[
        gcd lcm factor isprime nextprime primes lift mod
        Mod znorder znprimroot ellap ellord
        matrix vector matdet matinverse trace
        polroots polcyclo poldisc nfsplitting poldegree 
        galoisinit galoisidentify galoisgetname
        polcompositum
      ]

      state :root do
        rule %r/^\?/, Keyword::Pseudo
        rule %r/\\.*$/, Comment::Single
        rule %r(/\*.*?\*/)m, Comment::Multiline
        rule %r/"[^"]*"/, Str
        rule %r/\b(#{keywords.join('|')})\b/, Keyword
        rule %r/\b(#{builtins.join('|')})\b/, Name::Builtin
        rule %r/\b\d+(\.\d+)?\b/, Num
        rule %r/[+\-*\/^%=<>!&|~]+/, Operator
        rule %r/[(){}\[\],;]/, Punctuation
        rule %r/[a-zA-Z_]\w*/, Name
        rule %r/\s+/, Text
      end
    end
  end
end