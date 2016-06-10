---
layout: post
title:  "Writing a C Extension Module for Python"
date:   2016-06-07 08:52:55 -0700
categories: jekyll update
---

I like to solve project euler problems using python.  Over time, I've bult up a small library of helper routines that are useful for many different problems.  Since these get used so often, I thought they would be a nice test case to try my hand at rewriting them in C as a python extension module.

The Problem
-----------

[Many](https://projecteuler.net/problem=77) [problems](https://projecteuler.net/problem=87) from project euler benifit from having an aprori list of prime numbers.  A function `primes_less_than(n)`, which returns a list of all the prime numbers less than a positive integer $$n$$ is thus extremely useful.

An efficient algorithm for producing such a list is the Sieve of Eratosthenes, which goes like this

  - Initalize a list of booleans with length $$n$$, which we will use to record whether or not each integer is prime.
  - zero and one are not prime.
  - Two is prime, mark it as such.  All multiples of two are not prime, mark them so.
  - The next unmarked number is not divisible by any of the primes we have marked, so it must be prime, mark it, then mark all its multiples as not prime.  (In the first case, this number is three).
  - Repeat the above procedure until exhaust the list.

There is one minor optimization to the above algorithm that it is always worth it to employ.  Once we find a prime $$p$$ we have marked as non-prime all multiples of all primes in the interval $$\left[ 0, p \right]$$.  This means that we must have found all non-primes less than $$p^2$$ (any composite number $$< p^2$$ must be divisible by some number $$(< \sqrt{p^2} = p)$$. So, when marking mulitples of a prime $$p$$, we can start marking at $$p^2$$.

Here's a pure python implementation of this algorithm

{% highlight python %}
def primes_less_than(N):
    '''Implementation of the prime sieve.
         
      Iterator that returns the primes of up to and including N
    in order.
    '''
    could_be_prime = [True]*(N+1)
    # 0 and 1 are not prime.
    could_be_prime[0] = could_be_prime[1] = False
    for i in xrange(N):
        # If we have not explicitly marked as composite yet...
	if could_be_prime[i]:
	    yield i
	    # Mark all multiples of this prime as composite.
	    for j in xrange(i*i, N, i):
	        could_be_prime[j] = False
{% endhighlight %}
  
Our goal will be to translate this algorithm into a python module written in C.

Creating a Module Object
------------------------

Implementing the Algorithm
--------------------------

Building The Module
-------------------

Comparison
----------
