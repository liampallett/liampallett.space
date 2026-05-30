---
title: "Between a Fold and a Hard Place"
date: 2026-05-20
description: "How DeepMind's AlphaFold has changed my perception of AI yet again."
tags: ["Discussion Piece", "AI", "DeepMind"]
ogImage: "/blog-images/between-a-fold/img.jpg"
atUri: "at://did:plc:tgb4klpomminc5lv3clzb6wm/site.standard.document/3mn2u24sbur2h"
---

# Between a Fold and a Hard Place

I've always been an AI sceptic. I hated the idea that it would be replacing whatever I do in the future instead of
augmenting it (still do). Vibe coding, especially. Coding is supposed to be a challenge, engaging yourself to solve a
problem!

And yet, in the README.md of most of my projects, either Claude or Gemini are cited as "consultants" for the project. NotebookLM
was my go-to revision tool during my January exams (and probably will be this time around).

## DeepMind

DeepMind's series of AlphaFold AI programs is a genuine revolution, and a big step towards AGI, in my opinion. It's clear
to me that the programs that DeepMind has developed can be applied to essentially any problem. They started with Atari games,
teaching the AI to play Breakout, then chess, then Go.

## Go, Fan Hui and Lee Sedol

Go is a very interesting board game. It has existed, in one form or another, since circa 4th century BCE, originating in
China. Despite the *easy to learn, impossible to master* nature of the game, the sheer size of the board means that there
are approximately $2.1\times10^{170}$ legal moves in a game of Go. To put that in perspective, it is believed that the
number of atoms in the universe is on the order of $10^{80}$, meaning that if every atom in existence was itself an identical
copy of our universe, there would still be fewer atoms than moves in the game of Go.

Prior to 2015, it was believed that the sheer size and complexity of the game would prove impossible for an AI program to
learn and be successful at. In October 2015, Fan Hui, 3 time winner of the European Go Championship, was defeated 5-0 by
the program. This was the first time that a computer program had proved to be successful at beating a human Go player without
a handicap.

In March 2016, the stakes were upped once again. Lee Sedol, ranked second *in the world* for international titles, played
5 rounds against AlphaGo. He lost 4-1 in the end, and ended up retiring in 2019, stating, "[AI is] an entity that cannot
be defeated".

## Move 37

During the second game of the series, AlphaGo played a move so unconventional, even searching "Move 37" online results in
solely information about this game. It has been dubbed "unthinkable by human standards", and AlphaGo itself said that a
human player would have roughly a 1 in 10,000 (0.01%) chance of playing that move. It is the first potential sign of genuine innovation
by an AI, with the move being heralded as "unique" by the match commentators.

## CASP and AlphaFold

The lessons that DeepMind learned from AlphaGo, and since, AlphaStar, are obvious. Neural networks as we know them are
able to learn and even innovate when given enough time and information. 

The Critical Assessment of Structure Prediction, or CASP competition is a global effort to write a program that can effectively
predict how a protein will fold based on its amino acid chain. A score greater than 90 is considered to be a successful fold.
Previously, most attempts had been in the mid-60s, showing that we were a long way off cracking the protein folding problem.

In 2018, AlphaFold 1 placed first in the CASP rankings, with an average score of 58.9 on the GDT ranking. However, the second version of AlphaFold,
imaginatively named AlphaFold 2, achieved a median score of 92.4 on the GDT leaderboard. This didn't just lead to a competition
win, it solved a long-standing problem in the biology community and even won the lead members a Nobel Prize in Chemistry.
What was before an arduous and expensive task became completely open source, giving anyone access to over 200 million protein
fold predictions, virtually all that are known to science. 

## Conclusion

When someone says 'AI', the first thought in many people's minds (mine included) is of software like ChatGPT and Gemini, tools that they use to
complete assignments or write that boring email they've been putting off for weeks.

After this dive into DeepMind and AlphaFold, my opinion is changed. I've recently quit using AI agents and coding tools
altogether, and I am instead fumbling over how to write a for loop in Golang. But it is clear to me now that AI as most
people know it will not change the world like AlphaFold objectively has.

I think back to the quote from Lee Sedol, that AI is something that cannot be defeated. In reality, it never was. AI could
do so much good for the world, and instead it is currently being used to make sexually exploitative images of people and
to spread misinformation online.

In space, AI could have many uses, from exoplanet identification to rover navigation on far-off worlds. It could prove
many theories that we have about the history of the universe and cosmology.

I finish by reiterating the stance that I have always taken: AI is not meant to replace people, and it never has been.
AI should be used by scientists to push the frontiers of what is possible, reaching conclusions that we as humans
could not have on our own.

Thank you for reading.

## Appendix

### Sources

* [Wikipedia — AlphaGo](https://en.wikipedia.org/wiki/AlphaGo)
* [Wikipedia — Lee Sedol](https://en.wikipedia.org/wiki/Lee_Sedol)
* [Wikipedia — Fan Hui](https://en.wikipedia.org/wiki/Fan_Hui)
* [Move Thirty-Seven](https://www.movethirtyseven.net/about)
* [Wikipedia — CASP](https://en.wikipedia.org/wiki/CASP)
* [AlphaFold Protein Structure Database](https://alphafold.ebi.ac.uk/)
