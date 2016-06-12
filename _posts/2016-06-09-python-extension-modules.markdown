---
layout: post
title:  "Writing a C Extension Module for Python"
date:   2016-06-07 08:52:55 -0700
categories: jekyll update
---

I like to solve [project euler](https://projecteuler.net/) problems using python.  Over time, I've bult up a small library of helper routines that are useful for many different problems.  Since these routines get used so often, I thought they would be ideal canidates to try my hand at writing them as a python C extension module.

A C extension module is a python module, only written in C.  The main python runtime, the program that interpretes and runs python programs, is written is C (it's often refered to as `cpython`).  It is possible to write a python module as a collection of C functions that is interacts directly with the python runtime, which are then callable from a running python interpreter.  For tasks requiring heavy computation, this can result in considerable speedups to many algorithms (computationally heavy parts of numpy and scipy, for example, are written as C extension modules).

In this post I will be using python 3; I believe there are a few minor details that are different if you are writing extension modules for python 2.

The Problem
-----------

[Many](https://projecteuler.net/problem=77) [problems](https://projecteuler.net/problem=87) from project euler benifit from having an aprori list of prime numbers.  For these, calling a function `primes_less_than(n)`, which returns a list of all the prime numbers less than a positive integer $$n$$, is a good first step to constructing a solution.

An efficient algorithm for producing such a list is the [Sieve of Eratosthenes](https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes), which goes like this

  - Initalize a boolean list of length $$n$$, which we will use to record whether or not each integer is prime.
  - Zero and one are not prime.
  - Two is prime, mark it as such.  All other multiples of two are not prime, mark them so.
  - The next unmarked number is not divisible by any of the primes we have already marked, so it must be prime; mark it, then mark all its multiples as not prime.  (In the first case, this number is three).
  - Repeat the above procedure until the list is exhausted.

There is one minor optimization to the above algorithm that it is always worth employing.  When we find a prime $$p$$ we have, in previous steps, marked as non-prime all multiples of all primes in the interval $$\left[ 0, p \right]$$.  This means that we must have found all non-primes less than $$p^2$$, for any composite number $$< p^2$$ must be divisible by some number $$< \sqrt{p^2} = p$$. So, when marking mulitples of a prime $$p$$, we can start marking at $$p^2$$.

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

We are going to create a python module `primes` which contains the `primes_less_than` function, with the source code written in C, so let's begin with a file `primes.c`.  Since our goal is to interface directly wih python, we need to import the python C api by including the appropriate header

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

`PyMethodDef` is a structure type defined by the python header, it is a simple `struct` with four entries

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

Here there are some internal python things, which we mostly dont have to worry about very much.  The first entry in this struct must always be set to `PyModuleDef_HEAD_INIT` (the documentation is very explicit about this), and the `-1` is a flag controling how memory is allocated for module level objects.  The remaining entries in the struct are

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

The return type `PyMODINiT_FUNC` is defined in a compiler macro, created in a maze of `#defines` [here](https://github.com/python/cpython/blob/8707d182ea722da19ace7fe994f3785cb77a679d/Include/pyport.h#L734).  The simplest possible definition is used when compiling modules while building the interpreter itself

{% highlight c %}
# define PyMODINIT_FUNC PyObject*
{% endhighlight %}

In our case we have already have a working install of python, so we need to compile our module as a shared library (compiled code usable from other compiled code)

{% highlight c %}
# define PyMODINIT_FUNC __declspec(dllexport) PyObject*
{% endhighlight %}

Luckily, we don't have to manage the compiler flags ourselves to get this to work out correctly, python will do that for us, as we will see when building our module.

TODO: returning NULL

This is the end of the neccesarry setup, so we can get on to writing the code to solve our actual problem.  We will leave this setup code at the bottom of the module (as it references the yet to be written method `primes_primes_less_than`, which we will need to define above the module method table, or else the compiler will complain).

Getting Python Objects Into C
-----------------------------

There are two fundamental tasks we must complete when writing a C function to be called from pyhon

  - Recieving the arguments passed into the python method, and deconstructing them into C datatypes.
  - Constructing a python object to return to the caller.

The function signature of a module level python method in C is always the same

{% highlight c %}
static PyObject* primes_primes_less_than(PyObject* self, PyObject *args)
{% endhighlight %}

We won't need the `self` argument (luckily, the documentation is somewhat unclear about its purpose), but we will certainly need `args`.  

Notice that all the arguments to the function are passed from python as a single object, in our case this object will contain a single python integer, we need to extract the C integer out of this so we can use it in our algorithm.  Thankfully, the python developers have provided a wonderful way to do this in `PyArg_ParseTuple`.

The code

{% highlight c %}
long n;
PyArg_ParseTuple(args, "l", &n);
{% endhighlight %}

will parse the argument object, extract the long integer, and place it in the variable `n`.  The interface to `PyArg_ParseTuple` is very clever, the number and types of arguments to the python method are expressed in a format string passed as the second argument.  If we had two integer arguments we would write

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

since the dictionary is recieved as a generic `PyObject*`, we could then use `PyDict_Check` to validate its type.

The `PyArg_ParseTuple` function returns a value, which can be used to check if the `args` object was successusfully parsed (because, for example, we could easily pass an incorrect format string).  As discussed, we want python methods to return `NULL` on error conditions, so our code for parsing `args` becomes

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

Let's turn to implementing the algorithm in our private function

{% highlight c %}
static PyObject* _primes_less_than(long n)
{% endhighlight %}

Reviewing our pure python implementation, we need two data structures

  - A fixed length boolean array (length `n`) to record which intergers we have determened to be composite so far, we called this `could_be_prime` in our python implementation.
  - A varaible length array for accumulating our prime numbers.

We only need the boolean array for the life of the function call, so we can create it on the stack and let C collect it automatically when it falls out of scope.  We only know the size of the array at runtime, but modern C (C99) allows us to get away with that.

To accumulate our prime numbers, we will use a python list, since we need to return it anyway, and it saves us from writing our own expandable array type.

{% highlight c %}
static PyObject* _primes(long n) {
    bool could_be_prime[n];
    PyObject* primes = PyList_New(0);

    /* Algorithm */

    return primes;
}
{% endhighlight %}

Again, we don't need to clean up `could_be_prime` manually, as we allocate it on the stack, and C cleans up our local namespace for us.

Our `could_be_prime` array is initially filled with garbage data, so we need to initialize it before we get to work

{% highlight c %}
for(long i = 0; i < n; i++) {
    maybe_prime[i] = 1;
}
maybe_prime[0] = 0;  // Not prime
maybe_prime[1] = 0;  // Not prime
{% endhighlight %}

The implementation of the sieve is not quite straighforward.  We only need to know how to create an integer object that python can use, and how to add these to our python list.  These tasks are accomplished with the python api functions `PyLong_FromLong` and `PyList_Append`, which are well documented in the C api references for [python long integers](https://docs.python.org/3.5/c-api/long.html) and [python lists](https://docs.python.org/3.5/c-api/list.html).  Making use of these functions, it's easy to translate our sieving algorithm into C


{% highlight c %}
/* Sieve. */
for(long i = 0; i < n; i++) {
    if(maybe_prime[i] != 0) {
        PyList_Append(primes, PyLong_FromLong(i));
        for(long j = i*i; j < n; j = j + i) {
            maybe_prime[j] = 0;
        }
    }
}
{% endhighlight %}

Building The Module
-------------------


Comparison
----------
