---
layout: post
title:  "All of Nothing is True"
date:   2026-07-30
categories: jekyll update programming
---

<div style="display:none">
$$
\newcommand{\fx}{\text{fx}}
$$
</div>

<style>
  .square-svg text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  .square-svg .title { font-size: 14px; font-weight: 500; fill: #1a1a1a; }
  .square-svg .subtitle { font-size: 12px; fill: #666; }
  .square-svg line { stroke: #1a1a1a; }
</style>

The `all` and `any` functions are present in many programming languages, in the case of this essay, our examples will be given in Python. These functions are well named:

```python
# Are ALL the values truthy?
> all([True, True, True])
True
> all([True, False, True])
False
# Are ANY of the values truthy?
> any([True, False, False])
True
> any([False, False, False])
False
```

At some point, everyone gets curious, and passes in an empty collection:

```python
> all([])
True
> any([])
False
```

These two results may come as a shock! Programmers are used to errors, and there's a widespread expectation that when an operation makes no sense programming languages will refuse and produce an error. We can make good sense of something like:

```
All of the following are true:
    - My cat's name is Moshi.
    - My dog's name is Tomo.
    - My dog's name is Benji
```

But this?

```
All of the following are true:
```

That seems incomplete, we suspect the author wandered off to get some coffee. So we expect that `all([])` should produce an error, but it doesn't, it's `True`.

So, here we attempt to answer why the Python developers chose for all of nothing to evaluate as `True`. We'll use this question to introduce a style of algebraic reasoning common in modern mathematics.

## The Compatibility Equation 
Let's take stock at what we have going on in some detail. The `all` function consumes a list of booleans, and returns (reduces it) to a single boolean. So in terms of types:

```python
def all(bs: list[bool]) -> bool
```

The little arrow `->` is notation in Python for annotating functions. We're going to be interested in the relationships between functions that operate on `list`s and functions that operate on `bool`s. We'd like to diagram these relationships, so we need a diagrammatic notation for a function, and keeping on with the arrow notation seems like a good idea:

<svg class="square-svg" width="100%" viewBox="0 0 680 100" role="img" aria-label="Commutative square showing any of L1 concatenated with L2 equals any of L1 or any of L2">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>

  <line x1="250" y1="50" x2="444" y2="50" stroke-width="2" marker-end="url(#arrow)"/>
  <text class="title" x="347" y="40" text-anchor="middle">all</text>

  <text class="title" x="170" y="40" text-anchor="middle">list[bool]</text>
  <text class="subtitle" x="170" y="60" text-anchor="middle">[T,T,F]</text>

  <text class="title" x="510" y="40" text-anchor="middle">bool</text>
  <text class="subtitle" x="510" y="60" text-anchor="middle">F</text>
</svg>

We get an output of `True` only when **all** entrys in the list are `True`:

<svg class="square-svg" width="100%" viewBox="0 0 680 100" role="img" aria-label="Commutative square showing any of L1 concatenated with L2 equals any of L1 or any of L2">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>

  <line x1="250" y1="50" x2="444" y2="50" stroke-width="2" marker-end="url(#arrow)"/>
  <text class="title" x="347" y="40" text-anchor="middle">all</text>

  <text class="title" x="170" y="40" text-anchor="middle">list[bool]</text>
  <text class="subtitle" x="170" y="60" text-anchor="middle">[T,T,T]</text>

  <text class="title" x="510" y="40" text-anchor="middle">bool</text>
  <text class="subtitle" x="510" y="60" text-anchor="middle">T</text>
</svg>

Let's explore how this relates to the operations supported by our two datatypes.

A fundamental operation on `list`s is **concatenation**. This consumes a pair of `list`'s and returns a single `list`. In Python, it is notated with a `+`:

<svg class="square-svg" width="100%" viewBox="0 0 680 100" role="img" aria-label="Commutative square showing any of L1 concatenated with L2 equals any of L1 or any of L2">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>

  <line x1="250" y1="50" x2="444" y2="50" stroke-width="2" marker-end="url(#arrow)"/>
  <text class="title" x="347" y="40" text-anchor="middle">+</text>

  <text class="title" x="170" y="40" text-anchor="middle">(list[bool], list[bool])</text>
  <text class="subtitle" x="170" y="60" text-anchor="middle">([T,T,T], [F,T,F])</text>

  <text class="title" x="510" y="40" text-anchor="middle">list[bool]</text>
  <text class="subtitle" x="510" y="60" text-anchor="middle">[T,T,T,F,T,F]</text>
</svg>

The empty list `[]` has an important role to play in relation to concatenation. When concatenated with *any* list, it leaves it unchanged:

<svg class="square-svg" width="100%" viewBox="0 0 680 100" role="img" aria-label="Commutative square showing any of L1 concatenated with L2 equals any of L1 or any of L2">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>

  <line x1="250" y1="50" x2="444" y2="50" stroke-width="2" marker-end="url(#arrow)"/>
  <text class="title" x="347" y="40" text-anchor="middle">+</text>

  <text class="title" x="170" y="40" text-anchor="middle">(list[bool], list[bool])</text>
  <text class="subtitle" x="170" y="60" text-anchor="middle">([], [F,T,F])</text>

  <text class="title" x="510" y="40" text-anchor="middle">list[bool]</text>
  <text class="subtitle" x="510" y="60" text-anchor="middle">[F,T,F]</text>
</svg>

It's very important that this works for *any list whatsoever*, so that we can express this property as equations including a generic list `bs`:

```python
# For any list xs whatsoever...
bs: list[bool]
## ...both of these equations hold.
[] + bs == bs
bs + [] == bs
```

Booleans support the common logical operations of `and` and `or`. At the moment we're most interested in `and`, which consumes a pair of booleans and returns a single boolean:

<svg class="square-svg" width="100%" viewBox="0 0 680 100" role="img" aria-label="Commutative square showing any of L1 concatenated with L2 equals any of L1 or any of L2">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>

  <line x1="250" y1="50" x2="444" y2="50" stroke-width="2" marker-end="url(#arrow)"/>
  <text class="title" x="347" y="40" text-anchor="middle">and</text>

  <text class="title" x="170" y="40" text-anchor="middle">(bool, bool)</text>
  <text class="subtitle" x="170" y="60" text-anchor="middle">(T, F)</text>

  <text class="title" x="510" y="40" text-anchor="middle">bool</text>
  <text class="subtitle" x="510" y="60" text-anchor="middle">F</text>
</svg>

Just like how the empty list acts as a "do nothing" value for list concatenation, the value `True` acts as a "do nothing" value for the `and` operation. Since there's only two boolean values in total, this is easy to explicitly check in both cases:

```python
> True and True
True
> True and False
False
```

So, again, we can express this as an equation involving a generic boolean `b`:

```python
# For any boolean b whatsoever...
bs: list[bool]
## ...both of these equations hold.
True and b == b
b and True == b
```

There's a very pleasing symmetry here: for both datatypes we have an operation that combines two values into one, and in each case there is a specific value that combines to "do nothing". Dataypes with this structure are called [Monoids](https://en.wikipedia.org/wiki/Monoid), if you look for more examples, you'll find many. In the language of Monoids, our "do nothing" values are called **identity elements**, and so we would say:

> The empty list `[]` is the identity element for list concatenation.

> The value `True` is the identity element for `and`.

We've drifted a bit from our main path, so let's remind ourselves of our purpose. We'd like to justify why `all([]) == True`. We've discussed all the constituent pieces `all`, `[]`, and `True` in isolation, so now let's look for some relationship between them. 

It pays to be a little more general, is there a relationship between list concatenation and `all` that holds for *every list*? Suppose I have a really, really long list `L` and I want to know `all(L)`. It's too long for me to look thought the entire thing myself, but I have a friend who owes me a favor. We get an idea, I take half of `L` and my friend takes the other half. I compute `all` of my half of `L`, my friend computes `all` of their half, and then `all(L) == True` exactly when both of us got `True`. That is, if you split a list into two pieces, you can compute `all` of the entire list if you know `all` of the two pieces, the trick is to `and` together the `all` of the two parts.

So that's pretty tortured to describe in prose, but thankfully there are a couple more efficient modes of expression available to us. First, an equation:

```python
# For every pair of boolean lists whatsoever...
xs: list[bool]
ys: list[bool]
# ...this compatibility equation between `all` and `and` holds:
all(xs + ys) == all(xs) and all(ys)
```

This really says exactly the same thing as our (attempt at) a prose description above, it expresses a fundamental compatibility between list concatenation and `and`. Notation has allowed us to eliminate all concepts except only those needed to make the point clearly. This is the power of mathematical notation.

We can also make the same point with a diagram, this specific type of diagram is called a **commutative diagram** in mathematical circles:

<svg class="square-svg" width="100%" viewBox="0 0 680 300" role="img" aria-label="Commutative square showing any of L1 concatenated with L2 equals any of L1 or any of L2">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>

  <line x1="250" y1="50" x2="444" y2="50" stroke-width="2" marker-end="url(#arrow)"/>
  <text class="title" x="347" y="40" text-anchor="middle">+</text>
  <text class="title" x="170" y="40" text-anchor="middle">(list[bool], list[bool])</text>
  <text class="subtitle" x="170" y="60" text-anchor="middle">([T,T,T], [F,T,F])</text>
  <text class="title" x="510" y="40" text-anchor="middle">list[bool]</text>
  <text class="subtitle" x="510" y="60" text-anchor="middle">[T,T,T,F,T,F]</text>

  <line x1="250" y1="250" x2="444" y2="250" stroke-width="2" marker-end="url(#arrow)"/>
  <text class="title" x="347" y="240" text-anchor="middle">and</text>
  <text class="title" x="170" y="240" text-anchor="middle">(bool, bool)</text>
  <text class="subtitle" x="170" y="260" text-anchor="middle">(T,F)</text>
  <text class="title" x="510" y="240" text-anchor="middle">bool</text>
  <text class="subtitle" x="510" y="260" text-anchor="middle">F</text>

  <line x1="170" y1="80" x2="170" y2="210" stroke-width="2" marker-end="url(#arrow)"/>
  <text class="title" x="155" y="150" text-anchor="end">all &#215; all</text>
  <line x1="510" y1="80" x2="510" y2="210" stroke-width="2" marker-end="url(#arrow)"/>
  <text class="title" x="525" y="150" text-anchor="start">all</text>
</svg>

The idea here is that you start in the top left, and there are two paths you can take to the bottom right. The path around the top says *first concatenate the lists, and then take `all` of the result*, this is the left hand side of the previous equation. The path around the bottom says *first take `all` of the lists individually, then `and` together the results*, this is the right hand side of the previous equation. The **commutative** in commutative diagram means that each possible path between two locations in the diagram should always lead to the same result, which is a nice visual way to display our compatibility equation.

##  Consequences for the Empty List
What does this all say about the empty list `[]`? Well, we said the compatability equations holds for **all** values of `list[bool]`, so what happens when we take that dictate seriously for an empty list `[]`. Let's take one of the two lists in the equation to be empty:

```python
# For every boolean list xs whatsoever...
xs: list[bool]
# ...this compatibility equation holds.
all(xs + []) == all(xs) and all([])
```

Ok, but now we see that `xs + []` inside of the `all`, and this should call to mind a prior point! The whole job of an empty list is to unchange any list its concatenated with, that is:

```python
# For every boolean list xs whatsoever...
all(xs + []) == all(xs)
```

So the compatibility equation is:

```python
# For every boolean list xs whatsoever...
all(xs) == all(xs) and all([])
```

Whatever value we may choose to assign to `all([])`, it must have this property. It must be a truth value that leaves every possible truth value of `all(xs)` unchanged when `and`ed together. But we've seen this, there *is* such a truth value, it's `True`. So *the compatibility equation forces a value*, we have no choice, we *must* define:

```python
all([]) == True
```

Our only other option is to abandon the universality of the compatibility equation. If we make *any other choice*, then the equation no longer holds for *all* lists, which, I hope, strikes the reader as a sad situation.

## A Sneaky Point
A skeptical person may have noticed an assumption I [snuck](https://www.youtube.com/watch?v=PJVNzwTnfbk) in the argument without any consideration. Yes, we'd like the compatibility equation to hold for *all* boolean lists, but does the empty list count? There's nothing in an empty list, so what right do we have to claim that it's a `list[bool]`.

This is a fair objection, and you can probably make it thought life just find holding this position, but I think you'd be worse off for it. Generally, it's good style to make definitions, arguments, and conclusions as general as possible, even when doing so requires a touch of the unnatural. In this case, it may be off-putting, but it's a good idea to consider `[]` as a member of *all* list types. I.e., `[] ∈ list[T]` for *any* type `T`.

One way to find comfort with this position is to consider another important function on lists, the `head` function. This function is not built in to Python, but it would be easy enough to write. It takes a list of a certain length, and removes the final element, returning the bit in front:

```python
> head([True, False, True, False])
[True, False, True]
> head([1, 2, 3, 4, 5])
[1, 2, 3, 4]
```

How would we annotate such a function? The type of data in the list doesn't matter, `head` is generic, so we'd go like this:

```python
# A generic type...
T = TypeVar['T']
# Returns a list containing the same datatype.
def head(xs: list[T]) -> list[T]
```

Alright, you likely see where this is going, what if we pass in a singleton list to `head`?

```python
> head([True])
[]
> head([154])
[]
```

We, of course, get out an empty list. But according to our annotation, this should have the same datatype as we started with, `list[bool]` in the first example and `list[int]` in the second. So the empty list is a member of both types according to our annotation.

There's nothing forcing us to annotate `head` as such, we could instead introduce an `EmptyList` type that contains only one value, and:

```python
def head(xs: list[T]) -> list[T] | EmptyList
```

But like, yuck, why? Things work better when there's less exceptional cases, so it's preferred to consider an empty list as very generically typed.

## Any and Sum
Now that you're (hopefully) convinced that `all([]) == True` is the way to go, the same style of argument leads to the same sort of conclusion for `any([])` and `sum([])`. Try it out!