---
layout: post
title:  "Writing a C Extension Module for Python"
date:   2016-06-07 08:52:55 -0700
categories: jekyll update
---

I like to solve [project euler](https://projecteuler.net/) problems using python.  Over time, I've bult up a small library of helper routines that are useful for many different problems.  Since these routines get used so often, I thought they would be a nice to try my hand at rewriting them in C as a python extension module.

In this post I will be using python 3, I believe there are a few minor details that are different if you are writing extension modules for python 2.

The Problem
-----------

[Many](https://projecteuler.net/problem=77) [problems](https://projecteuler.net/problem=87) from project euler benifit from having an aprori list of prime numbers.  Calling a function `primes_less_than(n)`, which returns a list of all the prime numbers less than a positive integer $$n$$, is a good first step to many problems.

An efficient algorithm for producing such a list is the Sieve of Eratosthenes, which goes like this

  - Initalize a boolean list of length $$n$$, which we will use to record whether or not each integer is prime.
  - Zero and one are not prime.
  - Two is prime, mark it as such.  All multiples of two are not prime, mark them so.
  - The next unmarked number is not divisible by any of the primes we have already marked, so it must be prime; mark it, then mark all its multiples as not prime.  (In the first case, this number is three).
  - Repeat the above procedure until the list is exhausted.

There is one minor optimization to the above algorithm that it is always worth employing.  When we find a prime $$p$$ we have, in previous steps, marked as non-prime all multiples of all primes in the interval $$\left[ 0, p \right]$$.  This means that we must have found all non-primes less than $$p^2$$. for any composite number $$< p^2$$ must be divisible by some number $$< \sqrt{p^2} = p$$. So, when marking mulitples of a prime $$p$$, we can start marking at $$p^2$$.

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

We are going to create a python module `primes` which contains the `primes_less_than` function, with the source code written in C, to that end, we begin with a file `primes.c`.  Since our goal is to interface directly wih python, we need to import the python C api by including the appropriate header

{% highlight c %}
#include <Python.h>
{% endhighlight %}

Before we can get to implementing the algorithm, we need to do the somewhat boring work of creating the module object, then telling C what functions and objects we want to put inside it.

We will do the second part first, creating what python calls the *method table*

{% highlight c %}
static PyMethodDef PrimesMethods[] = {
    {"primes_less_than", primes_primes_less_than, METH_VARARGS,
     "Compute a list of all the primes up to an integer n."},
    {NULL, NULL, 0, NULL}        /* Sentinel */
};
{% endhighlight %}

`PyMethodDef` is a structure type defined by the python header, it is a `struct` with four entries

  - `char* ml_name`: The name of the method, as called from python.
  - `PyCFunction ml_func`: A pointer to the C function implementing the method.  The naming convention for python methods is `module_name + '_' + method_name`, which is how we ended up with the awkward function name `primes_primes_less_than`.
  - `int ml_flags`: A python header defined set of flags controlling method calling conventions.  We will be using the simplest possible calling convention (positional arguments only), which corosponds to the `METH_VARARGS` flag.
  - `char* ml_doc`: A documentation string for the method.

Now we have to define the module object and tell it about our method table

{% highlight c %}
static struct PyModuleDef primes_module = {
   PyModuleDef_HEAD_INIT,
   "primes",
   "Methods for working with primes and prime factorizations.",
   -1,
   PrimesMethods
};
{% endhighlight %}

Here there are some internal python things, which we mostly dont have to worry about very much.  The first entry in this struct must always be set to `PyModuleDef_HEAD_INIT` (the documentation is very explicit about this), and the `-1` is a flag controling how memory is allocated for module level objects.  The remaining entries in the struct are of interest to us

  - `char* m_name`: The name of module.
  - `char* m_doc`: A documentation string for the module.
  - `PyMethodDef* m_methods`: The method table of the module being created.

Finally we need to initialize the module, i.e. tell python what to do when we `import` it

{% highlight c %}
PyMODINIT_FUNC PyInit_primes(void) {
    PyObject *m;

    m = PyModule_Create(&primes_module);
    if (m == NULL)
        return NULL;

    return m;
}
{% endhighlight %}

The return type `PyMODINiT_FUNC` is defined in a maze of compiler marcros [here](https://github.com/python/cpython/blob/8707d182ea722da19ace7fe994f3785cb77a679d/Include/pyport.h#L734).  The simplest possible definition is used when compiling modules into python itself

{% highlight c %}
# define PyMODINIT_FUNC PyObject*
{% endhighlight %}

In our case we have already have a working install of python, so we need to compile our module as a shared library (compiled code usable from other compiled code), which uses the following definition

{% highlight c %}
# define PyMODINIT_FUNC __declspec(dllexport) PyObject*
{% endhighlight %}

Luckily, we don't have to manage the compiler flags ourselves to get this to work out correctly, as we will see when building our module.

TODO: returning NULL

This is the end of the neccesarry setup, so we can get on to writing the code to solve our actual problem.  We will leave this setup code at the bottom of the module (as it references the yet to be written method `primes_primes_less_than`, which we will need to define above the module method table, or else the compiler will complain).

Getting Python Objects Into C
-----------------------------

There are two fundamental tasks we must complete when writing a python module at the C level

  - Recieving the arguments passed into the python method, deconstructing them into C datatypes.
  - Constructing a python object to return to the caller.

The signature of a module level python method in C is always the same

{% highlight c %}
static PyObject* primes_primes_less_than(PyObject* self, PyObject *args)
{% endhighlight %}

We won't need the `self` arument (luckily, the documentation is somewhat unclear about its purpose), but we will certainly need `args`.  

Notice that all the arguments to the function are passed from python as a single object, (which is not too interesting for us as we have only one argument, but is good to take note of), in our case this object will contain a single python integer, we need to extract the C integer out of this so we can use it in our algorithm.  Thankfully, the python developers have provided a wonderful way to do this

The code

{% highlight c %}
long n;
PyArg_ParseTuple(args, "l", &n);
{% endhighlight %}

will parse the argument object, extract the long integer, and place it in the variable `n`.  The interface to `PyArg_ParseTuple` is very clever, if we had two integer arguments we would write

{% highlight c %}
long n, m;
PyArg_ParseTuple(args, "ll", &n, &m);
{% endhighlight %}

or an integer and a string

{% highlight c %}
long n;
char* s;
PyArg_ParseTuple(args, "ls", &n, &s);
{% endhighlight %}

More compicated objects are also supported, here's a two-tuple of integers and a dictionary

{% highlight c %}
long n, m;
PyObject* dict;
PyArg_ParseTuple(args, "(ll)O", &n, &m, &dict);
{% endhighlight %}

since the dictionary is recieved as a generic object, we could then use `PyDict_Check` to validate its type.

The `PyArg_ParseTuple` function returns a value, which can be used to check if the `args` object was successusfully parsed (because, for example, we could pass an incorrect format string).  As discussed, we want python methods to return `NULL` on error conditions, so our code for parsing `args` becomes

{% highlight c %}
long n;
if(!PyArg_ParseTuple(args, "l", &n))
    return NULL;
{% endhighlight %}

and our partially completed method is

{% highlight c %}
static PyObject* primes_primes_less_than(PyObject* self, PyObject *args) {
    long n;

    if(!PyArg_ParseTuple(args, "l", &n))
        return NULL;

    /* Algorithm. */
    
    return primes
}
{% endhighlight %}

An interesting engeneering question now arises, should we implement the algorithm inline or break out the computation into a seperate, private, function?  Consider the consesquences of writing the code inline, what would happen if we wrote another function in this module that would like to *call* `primes_primes_less_than`?  That function would have to *construct* a python argument to pass as `args`, it could not simply pass along the `long`, which seems like a lot of trouble.  If instead, we write a private function `_primes_less_than` which consumes a `long`, then we have the algorithm available to other functions in our C code, a clear win.  So our python method becomes

{% highlight c %}
static PyObject* primes_primes_less_than(PyObject* self, PyObject *args) {
    long n;
    PyObject* primes;

    if(!PyArg_ParseTuple(args, "l", &n))
        return NULL;

    primes = _primes_less_than(n); 
    return primes
}
{% endhighlight %}

Implementing the Algorithm
--------------------------


Building The Module
-------------------

Comparison
----------
