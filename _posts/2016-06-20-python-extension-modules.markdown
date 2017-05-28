---
layout: post
title:  "Writing a C Extension Module for Python"
date:   2016-06-20 08:52:55 -0700
categories: jekyll update programming
---

I like to solve [project euler](https://projecteuler.net/) problems using python.  Over time, I've built up a small library of helper routines that are useful for many different problems.  Since these routines get used so often, it pays to make them as efficient as possible.

A C extension module is a python module, only written in C.  This is possible because the main python runtime, the program that interprets and runs python programs, is written is C (a fact embedded into the programs name, `cpython`).  It is therefore possible to write a python module as a collection of C functions that is interacts directly with the python runtime.  For tasks requiring heavy computation, this can result in considerable speedups to many algorithms (computationally heavy parts of numpy and scipy, for example, are written as C extension modules).

In this post I will be using python 3; I believe there are a few minor details that are different if you are writing extension modules for python 2.

The Problem
-----------

[Many](https://projecteuler.net/problem=77) [problems](https://projecteuler.net/problem=87) from project euler benefit from having an apriori list of prime numbers.  For these, calling a function `primes_less_than(n)`, which returns a list of all the prime numbers less than a positive integer $$n$$, is a good first step to constructing a solution.

An efficient algorithm for producing such a list is the [Sieve of Eratosthenes](https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes), which goes like this

  - Initialize a boolean list of length $$n$$, which we will use to record whether or not each integer is prime.
  - Zero and one are not prime, mark them so.
  - Two is prime, mark it as such.  All other multiples of two are not prime.
  - The next unmarked number is not divisible by any of the primes we have already marked, so it must be prime; mark it, then mark all its multiples as not prime.  (the first time we get to this step, this unmarked number is three).
  - Repeat the above procedure until the list is exhausted.

There is one minor optimization to the above algorithm that it is always worth employing.  When we find a prime $$p$$ we have, in previous steps, marked as non-prime all multiples of all primes in the interval $$\left[ 0, p \right]$$.  This means that we must have found all non-primes less than $$p^2$$, for any composite number $$< p^2$$ must be divisible by some number $$< \sqrt{p^2} = p$$. So, when marking multiples of a prime $$p$$, we can start marking at $$p^2$$.

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

We are going to create a python module `primes` which contains the `primes_less_than` function, so let's begin with a file `primes.c`.  Before we can get to implementing the algorithm, we need to do the somewhat boring work of creating the module object, and then telling C what functions and objects we want to put inside it.

Since our goal is to interface directly with python, we need to import the python C api by including the appropriate header

{% highlight c %}
#include <Python.h>
{% endhighlight %}

including this header makes the C python api available to us.

First, lets record what functions we intend to include in our module by creating what python calls the *method table*

{% highlight c %}
static PyMethodDef PrimesMethods[] = {
    {"primes_less_than", primes_primes_less_than, METH_VARARGS,
     "Compute a list of all the primes up to an integer n."},
    {NULL, NULL, 0, NULL}        /* Sentinel */
};
{% endhighlight %}

`PyMethodDef` is a [defined](https://github.com/python/cpython/blob/2d264235f6e066611b412f7c2e1603866e0f7f1b/Include/methodobject.h#L40) by the python header, it is a simple `struct` with four entries

  - `char* ml_name`: The name of the method.
  - `PyCFunction ml_func`: A pointer to the C function implementing the method.  The naming convention for python methods is `module_name + '_' + method_name`, which is how we ended up with the awkward C function name `primes_primes_less_than`.
  - `int ml_flags`: A python header defined set of flags controlling method calling conventions.  We will be using the simplest possible calling convention (positional arguments only), which corresponds to the `METH_VARARGS` flag.
  - `char* ml_doc`: A documentation string for the method.

The `PyCFunction` type is [defined](https://github.com/python/cpython/blob/2d264235f6e066611b412f7c2e1603866e0f7f1b/Include/methodobject.h#L18) in the same file as `PyMethodDef` and is interesting if only for its fascinating C twistedness

{% highlight c %}
typedef PyObject *(*PyCFunction)(PyObject *, PyObject *);
{% endhighlight %}

this is a [type definition of a pointer to a function](http://stackoverflow.com/questions/1591361/understanding-typedefs-for-function-pointers-in-c) that consumes two pointers to `PyObjects` and returns a pointer to a `PyObject` (not a `typedef` I could pull off first try).  We will say more about `PyObjects` later on.

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

Here there are some internal python things, which we mostly don't have to worry about very much.  The first entry in this struct must always be set to `PyModuleDef_HEAD_INIT` (the documentation is very explicit about this), and the `-1` is a flag controlling how memory is allocated for module level objects.  The remaining entries in the struct are

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

The return type `PyMODINiT_FUNC` is a compiler macro, created in a maze of `#defines` [here](https://github.com/python/cpython/blob/8707d182ea722da19ace7fe994f3785cb77a679d/Include/pyport.h#L734).  This allows the declaration to adapt itself situationally.  The simplest possible declaration is used when compiling modules while building the python runtime itself

{% highlight c %}
# define PyMODINIT_FUNC PyObject*
{% endhighlight %}

In our case we have already have a working install of python, so we need to compile our module as a shared library (compiled code usable from other compiled code)

{% highlight c %}
# define PyMODINIT_FUNC __declspec(dllexport) PyObject*
{% endhighlight %}

Luckily, we don't have to manage the compiler flags ourselves to get this to work out correctly, python will do that for us, as we will see when building our module.

It's worth mentioning that we return `NULL` when the module creation fails, this is a general pattern in `cpython` code.  When failures occur, we signal a generic error to the caller by passing `NULL`, otherwise a valid `PyObject` is returned.  To signal more granular error information the runtime provides an api that allows us to set and check exceptions in a static global variable.

This is the end of the necessary setup, so we can get on to writing code to solve our actual problem.  We will leave the setup code we just completed at the bottom of the module (as it references the yet to be written method `primes_primes_less_than`, which we will need to define above the module method table, or else the compiler will complain).

Getting Python Objects Into C
-----------------------------

There are two fundamental tasks we must complete when writing a C function to be called from pyhon

  - Receive the python objects passed as arguments into the python method, and deconstruct them into their native C datatypes.
  - Construct a python object to return.

Here we will focus on the first task.

The function signature of a module level python method in C is, surprisingly, always the same

{% highlight c %}
static PyObject* primes_primes_less_than(PyObject* self, PyObject* args)
{% endhighlight %}

We won't need the `self` argument (luckily, the documentation is somewhat unclear about its purpose), but we will certainly need `args`.  

Notice that all the arguments to the function are passed from python as a single python object `args`.  The `PyObject` type is completely generic; at its most fundamental level a `PyObject` contains a reference count (the number of other objects that care that it still exists) and a pointer to a structure containing more granular type information.  Depending on what flavor of `PyObject` it is, it can contain an entire host of other functionality.  Numbers, lists, tuples, and dictionaries are all `PyObject`s at the C level.

In our case, the `self` object will contain a single *python* integer, we need to extract the *C* integer out of this so we can use it in our algorithm (note the distinction, a python integer is a `PyObject`, but a C integer is a native 64-bit binary integer, to highlight the distinction it is common to call a python integer "wrapped").  

Thankfully, the python developers have provided a wonderful way to unwrap the native integer data.  The code

{% highlight c %}
long n;
PyArg_ParseTuple(args, "l", &n);
{% endhighlight %}

will parse the argument object, extract the long integer, and place it in the variable `n`.  The interface to `PyArg_ParseTuple` is very clever, the number and types of arguments to the python method are communicated in a format string passed as the second argument.  If we had two integer arguments we would write

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

More complicated objects are also supported, here's a two-tuple of integers and a dictionary

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

An interesting engeneering question now arises, should we implement the algorithm inline or break out the computation into a seperate, private, function?  Consider the consesquences of writing the code inline, what would happen if we wrote another function in this module that would like to *call* `primes_primes_less_than`?  That function could not simply pass along the `long`, it would have to *construct* a python object to pass as `args`, which seems like a lot of trouble.  If instead, we write a private function `_primes_less_than` which consumes a `long`, then we have the algorithm available to other functions in our C code, a clear win.  So our python method becomes

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

We only need the boolean array for the life of the function call, so we can create it on the stack (with [storage class automatic](http://www-ee.eng.hawaii.edu/Courses/EE150/Book/chap14/subsection2.1.1.1.html#SECTION0011100000000000000)) and let C collect it automatically when it falls out of scope (though this decision will have consequences, keep reading).  We only know the size of the array at runtime (as oposed to compile time), but modern C (C99) allows us to get away with that using [varaible length arrays](https://gcc.gnu.org/onlinedocs/gcc/Variable-Length.html).

To accumulate our prime numbers, we will use a python list, since we need to return the result anyway, and it saves us from writing our own expandable array type.

{% highlight c %}
static PyObject* _primes(long n) {
    bool could_be_prime[n];
    PyObject* primes = PyList_New(0);

    /* Algorithm */

    return primes;
}
{% endhighlight %}

Our `could_be_prime` array is initially filled with garbage data, so we need to initialize it before we get to work

{% highlight c %}
for(long i = 0; i < n; i++) {
    maybe_prime[i] = 1;
}
maybe_prime[0] = 0;  // Not prime
maybe_prime[1] = 0;  // Not prime
{% endhighlight %}

The implementation of the sieve is now quite straighforward.  We only need to know how to create a python integer object, and how to add these to our (initially empty) python list.  These tasks are accomplished with the python api functions `PyLong_FromLong` and `PyList_Append`, which are well documented in the C api references for [python long integers](https://docs.python.org/3.5/c-api/long.html) and [python lists](https://docs.python.org/3.5/c-api/list.html).  Making use of these functions, it's easy to translate our sieving algorithm into C

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

And with that, we've written a complete extension module.

Building and Testing the Module
-------------------

The final steps are to build our extension module, and then test to make sure it works.

Building is easy, we only need to create a very simple python script containing metadata needed for the build.  The complete `setup.py` script for our `primes` module is

{% highlight c %}
from distutils.core import setup, Extension

primes = Extension('primes',
                   sources = ['primes.c'])

setup(name = 'primes',
      version = '1.0',
      description = 'C functions for working with prime numbers.',
      ext_modules = [primes])
{% endhighlight %}

Setup scripts can be [much more complicated](https://github.com/numpy/numpy/blob/master/setup.py), but our simple case is self explanatory and to the point.

Now we cross our fingers and build the module

{% highlight bash %}
$ python setup.py build
running build
running build_ext
building 'primes' extension
...
{% endhighlight %}

If we are very lucky, the module will compile without error, otherwise we have some bugs to fix.  In any case, once all the problems are resolved we have a build directory which contains our extension module

{% highlight bash %}
$ ls build/
lib.macosx-10.10-x86_64-3.5  temp.macosx-10.10-x86_64-3.5
$ ls build/lib.macosx-10.10-x86_64-3.5/
primes.cpython-35m-darwin.so
{% endhighlight %}

If we navigate to the directory containing the shared object file and drop into python, we can import the module and use our method

{% highlight bash %}
$ cd build/lib.macosx-10.10-x86_64-3.5/; python
Python 3.5.1 (default, Mar  2 2016, 03:41:10)
[GCC 4.2.1 Compatible Apple LLVM 6.1.0 (clang-602.0.53)] on darwin
type "help", "copyright", "credits" or "license" for more information.
>>> import primes
>>> primes.primes_less_than(25)
[2, 3, 5, 7, 11, 13, 17, 19, 23]
{% endhighlight %}

Success!

Comparison
----------

Now that we have working python and C implementation of the algorithm, we can compare thier performance and see what we have won.  Let's wrap a call to the `primes_less_than` function in two python scripts, one calling the python implementation, and one calling the C implementation.  Here's the `c-test.py` script

{% highlight python %}
import primes
primes.primes_less_than(10**8)
{% endhighlight %}

The python implementation takes a good deal of time to generate such an extensive list of primes

{% highlight bash %}
$ time python py-test.py

real	0m25.156s
user	0m24.887s
sys	0m0.264s
{% endhighlight %}

Unfortuantely, running the test for the extension module causes an unexpected error

{% highlight bash %}
$ time python c-test.py
Segmentation fault
{% endhighlight %}

The dreaded segmentation fault!  What's going on here?  Why did our program crash here when we verified that it worked for a smaller list of primes?  

Recall from earlier that we created our working array `could_be_prime` in the local scope of a function, i.e. we created the array on the stack.  The stack is generally a small segment of memory, on a unix system the stack size can be determined with the `ulimit` command

{% highlight bash %}
$ ulimit -s -a
...
stack size              (kbytes, -s) 8192
...
{% endhighlight %}

Clearly our list of $$10^8$$ booleans is overflowing this limit.  We could solve this issue by using `ulimit` to allow our program a (much) bigger stack, but this is brittle.  Instead, we can just allocate space for `could_be_prime` on the heap

{% highlight c %}
static PyObject* _primes(long n) {
    bool* could_be_prime = malloc(sizeof(bool) * n);
    PyObject* primes = PyList_New(0);

    /* Algorithm */

    free(could_be_prime);
    return primes;
}
{% endhighlight %}

After recompiling, let's try again

{% highlight bash %}
$ time python c-test.py

real	0m2.293s
user	0m2.021s
sys	0m0.270s
{% endhighlight %}

Nice!

Conclusions
-----------

We got about an order of magnitude of speedup for our effort.  For an algorithm that is used in a tight loop, this coud be a very signifigant boon.  It is possible to go much further, creating classes and objects at the C level.

The [cython](http://cython.org/) project offers another approach to writing extension modules, using a python like dialect instead of interacting with the C api directly.  Cython also integrates very nicely with numpy, which can be more difficult to do in pure C.  On the other hand, writing cython does not offer the same insights and discovery as interacting with `cython` directly, so both approaches have thier advantages.

Writing an extension module is often held up as one of the great *possibilities* available to the python programmer, but I often get the feeling that few prople actually do it.  Hopefully this example will help more python programmers get over the fear and dive into deeper waters and adventures.
