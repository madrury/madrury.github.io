---
layout: post
title:  "How Do You Calculate Eigenvalues?"
date:   2017-10-04
categories: jekyll update statistics
---

The two most practically important problems in computational mathematics are solving systems of linear equations, and computing the eigenvalues and eigenvectors of a matrix.  We've already discussed a method for solving linear equations in [A Deep Dive Into How R Fits a Linear Model](http://madrury.github.io/jekyll/update/statistics/2016/07/20/lm-in-R.html), so for this post I thought we should complete the circle with a discussion of methods which compute eigenvalues and eigenvectors.

The standard algorithm for computing eigenvalues is called the $$QR$$-algorithm.  As the reader can surely guess, this involves the $$QR$$-factorization of the matrix in question (as a quick reminder, the $$QR$$-factorization encodes the Gram–Schmidt process for orthonormalizing a basis).

The details of the $$QR$$-algorithm are mysterious.  Suppose we are interested in computing the eigenvalues of a matrix $$A$$.  The first step of the $$QR$$-algorithm is to factor $$A$$ into the product of an orthogonal and an upper triangular matrix (this is the $$QR$$-factorization mentioned above)

$$ A = Q_0 R_0 $$

The next step is the mystery, we multiply the $$QR$$ factors in the *reverse order*

$$ A_1 = R_0 Q_0 $$

This is quite a bizarre thing to do.  There is no immediate geometric or intuitive interpretation of multiplying the two matrices in reverse order.  

The algorithm then iterates this factor-and-reverse process

$$ A_1 = Q_1 R_1 $$

$$ A_2 = R_1 Q_1 $$

$$ A_2 = Q_2 R_2 $$

...and so on.  This process eventually leads us (in the limit) to an upper triangular matrix (though it is not at all obvious why this would be the case), and the diagonal entries on this limit are the eigenvalues of $$A$$.

In this essay we will hopefully de-mystify this process, and give the reader some insight into this important algorithm.

### Software

I first learned about the $$QR$$-algorithm when writing [this C library](https://github.com/madrury/linalg), which implements many of the standard numerical linear algebraic algorithms.  In this post, I will be providing python code implementing the various algorithms; hopefully this will be more accessible to many readers.

To help with the numerous numpy arrays that needed to be typeset as matrices in latex, I wrote this small python package: [np2latex](https://github.com/madrury/np2latex).  May it go some way to relieving the reader's tedium, as it did mine.

### Acknowledgements

The impetus to write this material down was a question from my student [Michael Campbell](https://www.linkedin.com/in/michaelcampbell1988/).

[Greg Fasshauer](http://www.math.iit.edu/~fass/)'s notes [here](http://www.math.iit.edu/~fass/477577_Chapter_10.pdf), and [here](http://www.math.iit.edu/~fass/477577_Chapter_11.pdf) were very helpful, as was the source paper by John Francis: [The QR Transformation, I](https://academic.oup.com/comjnl/article/4/3/265/380632/The-QR-Transformation-A-Unitary-Analogue-to-the-LR).


## Setup

We will restrict ourselves to finding eigenvalues (and eigenvectors) of symmetric matrices $$A$$, and we will assume that $$A$$ has no repeated eigenvalues, and no zero eigenvalues [^zero-and-repeated-eigenvalues].  This is the most useful case in practice (for example, in finding the principal components of a data set $$X$$).  There are few couple important consequences of this assumption that we will make note of:

  1. All symmetric matrices (with real number entries) have a full set of eigenvalues and eigenvectors.  
  2. The eigenvalues are all real numbers.
  3. The eigenvectors corresponding to different eigenvalues are *orthogonal* (eigenvectors of different eigenvalues are always linearly independent, the symmetry of the matrix buys us orthogonality).

As a running example, we will take the matrix

$$ A = \left( \begin{array}{ccc} 2.92 & 0.86 & -1.15 \\ 0.86 & 6.51 & 3.32 \\ -1.15 & 3.32 & 4.57 \\ \end{array} \right) $$

This matrix was constructed as a product $$Q D Q^t$$, where

$$ Q = \left( \begin{array}{ccc} 0.00 & -0.80 & -0.60 \\ 0.80 & -0.36 & 0.48 \\ 0.60 & 0.48 & -0.64 \\ \end{array} \right) $$

is an orthogonal matrix, and

$$ D = \left( \begin{array}{ccc} 9.00 & 0.00 & 0.00 \\ 0.00 & 4.00 & 0.00 \\ 0.00 & 0.00 & 1.00 \\ \end{array} \right)$$

This immediately implies that $$A$$ is symmetric (which could also be verified by inspection), and that it has eigenvalues $$\lambda_1 = 9.0, \lambda_2 = 4.0$$, and $$\lambda_3 = 1.0$$.  The associated eigenvectors are the columns of $$Q$$ [^eigenvectors-are-columns].

We will often have need to visualize a matrix, especially orthogonal matrices.  To do so we will draw the columns of the matrix as vectors in $$\mathbb{R}^3$$.  For example, in this way we can visualize the matrix $$Q$$ as

![Example Orthogonal Basis]({{ site.url }}/img/qra-basis-example.png){: .center-img}


## Power Iteration

The basic idea underlying eigenvalue finding algorithms is called **power iteration**, and it is a simple one.

Start with any vector $$v$$, and continually multiply by $$A$$

$$ v \rightarrow Av \rightarrow A^2 v \rightarrow A^3 v \rightarrow \cdots $$

Suppose, for the moment, that this process converges to some vector (it almost certainly does not, but we will fix that in soon).  Call the limit vector $$A^{\infty} v$$.  Then $$A^{\infty} v$$ must satisfy [^limit-must-satisfy]

$$ A A^{\infty} v = A^{\infty} v $$

So $$A^{\infty} v$$ is an eigenvector of $$A$$ with associated eigenvalue $$\lambda = 1$$.

We see now why this process cannot always converge: $$A$$ must possess an eigenvalue of $$1$$.  To fix things up, let's normalize the product vector after each stage of the algorithm

$$ v_1 = \frac{Av}{| Av |}, \ v_2 = \frac{Av_1}{| Av_1 |}, v_3 = \frac{Av_2}{| Av_2 |}, \ \ldots $$

With this simple addition, it's not difficult to show that the process always converges to some vector.  Now, instead of the limit vector staying invariant under multiplication by $$A$$, it must stay invariant under multiplication by $$A$$ *followed by* normalization.  I.e., $$Av$$ must be proportional to $$v$$.

$$ A A^{\infty} v = \lambda A^{\infty} v $$

So the convergent vector is an **eigenvector** of $$A$$, this time with an unknown eigenvalue.

{% highlight python %}
def power_iteration(A, tol=0.00001):
    v = np.random.normal(size=A.shape[1])
    v = v / np.linalg.norm(v)
    previous = np.empty(shape=A.shape[1])
    while True:
        previous[:] = v
        v = A @ v
        v = v / np.linalg.norm(v)
        if np.all(np.abs(v - previous) < tol):
            break
    return v
{% endhighlight %}

Applying power iteration to our example matrix $$A$$, we can watch the iteration vector converge on an eigenvector

![Random Vector Converging to Eigenvector]({{ site.url }}/img/qra-power-iteration.png){: .center-img}

The eigenvector is

$$ e = \left( \begin{array}{c} 0.00 \\ 0.80 \\ -0.60 \\ \end{array} \right) $$

The eigenvalue corresponding to this eigenvector $$\lambda_1 = 9$$, which happens to be the largest eigenvalue of the matrix $$A$$.  This is generally true: for almost all initial vectors $$v_0$$, power iteration converges to the **eigenvector corresponding to the largest eigenvalue of the matrix** [^largest-eigenvalue].

Unfortunately, this puts us in a difficult spot if we hope to use power iteration to find *all* the eigenvectors of a matrix, as it almost always returns to us the same eigenvector.  Even if we apply the process to an entire orthonormal *basis*, each basis element will almost surely converge to the eigenvector with the largest eigenvalue.

![Random Basis Converging to Eigenvector]({{ site.url }}/img/qra-power-iteration-basis.png){: .center-img}

Luckily, there is a simple way to characterize the starting vectors that are exceptional, i.e. the ones that do *not* converge to the largest eigenvector.


## Convergence with an Orthogonal Vector

Recall from our earlier setup that the eigenvectors of a symmetric matrix are always orthogonal to one another.  This means that if we take any vector $$v_{\perp}$$ that is orthogonal to the largest eigenvector $$e_1$$ of $$A$$, then $$Ae_{\perp}$$ will still be orthogonal to $$e_1$$.

$$ e_1 \cdot v_{\perp} = 0 \Rightarrow e_1 \cdot A v_{\perp} = 0 $$

So, if we start the iteration at $$v_{\perp}$$, the sequence generated from power generation *cannot* converge to $$e_1$$, as it stays orthogonal to it throughout all steps in the process.

The same arguments as before (but applied to the restriction of $$A$$ to the orthogonal complement to $$e_1$$) imply that this orthogonal power iteration must converge to *something*, and that this something must be another eigenvector!  In this case, we almost always end up at the *second largest* eigenvector of $$A$$.

![Random Orthogonal Vector Converging to Second Eigenvector]({{ site.url }}/img/qra-power-iteration-orthogonal.png){: .center-img}

It's now obvious that we can continue this process of restricting focus to a smaller orthogonal subspace of the eigenvectors we have already found, and applying power iteration to compute the next eigenvector.  In this way, we will eventually find the entire sequence of eigenvectors of $$A$$: $$e_1, e_2, \ldots$$.

So, in principle, the problem is solved! Yet, this is not how this is usually done in practice, there are still some interesting refinements to the basic algorithm we should discuss.


## Simultaneous Orthogonalization

In our previous discussion of power iteration, we needed to restart the algorithm after each eigenvector is found.  If we want a full set of eigenvectors of the matrix, we need to run a full power iteration sequence $$n$$ (the dimension of the matrix $$A$$) times.

The reason we could not simply run $$n$$ power iterations simultaneously, seeded with a basis of vectors $$v_1, v_2, \ldots, v_n$$, is that we were more or less guaranteed that all of them would converge to the same vector (the with the largest eigenvalue).  If we want to find all the eigenvectors at once, we need to prevent this from happening.

Suppose that we adjust the basis at each iteration by *orthogonalizing it*.  I.e., at each step we insert the operation

$$ o_1, o_2, \ldots, o_n = \mathop{\text{othogonalize}}(A v_1, A v_2, \ldots, A v_n) $$

If we are lucky, this will prevent all the separate power iterations from converging to the same place.  Instead they will (hopefully) converge to an orthogonal basis.  This is indeed the case, and the resulting algorithm is called **simultaneous orthogonalization**.

![Simultaneous Orthogonalization]({{ site.url }}/img/qra-so.png){: .center-img}

Recall that the process of orthogonalizing a basis is encoded in the $$QR$$-factorization of a matrix.  With this in mind, we can write out the steps of the simultaneous orthogonalization algorithm as follows.

Start with $$Q_0 = I$$.  Then proceed as follows

$$ A Q_0 = Q_1 R_1 $$

$$ A Q_1 = Q_2 R_2 $$

$$ A Q_2 = Q_3 R_3 $$

...and so on.  The sequence of orthogonal matrices $$Q_0, Q_1, Q_2, \ldots$$ thus generated converge, and the limit is a matrix of eigenvectors of $$A$$.

In code

{% highlight python %}
def simultaneous_orthogonalization(A, tol=0.001):
    Q, R = np.linalg.qr(A) 
    previous = np.empty(shape=Q.shape)
    for i in range(100):
        previous[:] = Q
        X = A @ Q
        Q, R = np.linalg.qr(X)
        if np.all(np.abs(Q - previous) < 0.001):
            break
    return Q
{% endhighlight %}

If we apply this algorithm to our example matrix $$A$$, the sequence of matricies generated is

$$ Q_1 = \left( \begin{array}{ccc} -0.16 & -0.15 & -0.98 \\ -0.76 & -0.61 & 0.22 \\ -0.63 & 0.78 & -0.02 \\ \end{array} \right) $$

$$ Q_2 = \left( \begin{array}{ccc} -0.04 & 0.63 & 0.77 \\ -0.81 & 0.43 & -0.40 \\ -0.59 & -0.64 & 0.49 \\ \end{array} \right) $$

$$ Q_3 = \left( \begin{array}{ccc} -0.02 & 0.76 & 0.65 \\ -0.81 & 0.37 & -0.46 \\ -0.59 & -0.53 & 0.61 \\ \end{array} \right) $$

$$ Q_4 = \left( \begin{array}{ccc} -0.01 & 0.79 & 0.61 \\ -0.80 & 0.36 & -0.47 \\ -0.60 & -0.49 & 0.63 \\ \end{array} \right) $$

$$ Q_5 = \left( \begin{array}{ccc} -0.00 & 0.80 & 0.60 \\ -0.80 & 0.36 & -0.48 \\ -0.60 & -0.48 & 0.64 \\ \end{array} \right) $$

$$ Q_6 = \left( \begin{array}{ccc} -0.00 & 0.80 & 0.60 \\ -0.80 & 0.36 & -0.48 \\ -0.60 & -0.48 & 0.64 \\ \end{array} \right) $$

We see that, at least up to sign, the simultaneous orthogonalization algorithm reproduces the matrix of eigenvectors of $$A$$, as intended.

### A Mathematical Property of Simultaneous Orthogonalization

We will need an interesting property of the iterates of the simultaneous orthogonalization algorithm for later use, so let's digress for the moment to discuss it.

The steps of the simultaneous orthogonalization algorithm can be rearranged to isolate the upper triangular matricies

$$ A = Q_1 R_1 \Rightarrow Q_1^t A = R_1 $$

$$ A Q_1 = Q_2 R_2 \Rightarrow Q_2^t A Q_1 = R_2 $$

$$ A Q_2 = Q_3 R_3 \Rightarrow Q_3^t A Q_2 = R_3 $$

$$ \vdots $$

If we multiply the resulting sequences together, we get, for example

$$ Q_3^t A Q_2 Q_2^t A Q_1 Q_1^t A = R_3 R_2 R_1 $$

Using the orthogonality of the $$Q_i$$'s results in

$$ Q_3^t A^3 = R_3 R_2 R_1 $$

It's easy to see that this applies to any stage of the computation; so we get the identities

$$ Q_i^t A^i = R_i R_{i-1} \cdots R_1 $$

or, restated

$$ A^i = Q_i R_i R_{i-1} \cdots R_1 $$

Now, since we assumed that $$A$$ has no zero-eigenvalues, it is invertible.  The $$QR$$-factorizations of invertible matrices are unique [^uniqueness-of-QR].  This means that we can interpret the above identity as expressing the unique $$QR$$-factorization of the powers of $$A$

$$ A^i = \underbrace{Q_i}_{\text{orthogonal}} \underbrace{R_i R_{i-1} \cdots R_1}_{\text{upper triangular}} $$


## QR Algorithm

While the simultaneous orthogonalization technically solves our problem, it does not lend itself easily to the type of tweaks that push numerical algorithms to production quality.  In practice, it is the $$QR$$-algorithm mentioned in the introduction that is the starting point for the eigenvalue algorithms that underlie much practical computing.

As a reminder, the $$QR$$-algorithm proceeded with a strange reverse-then-multiply-then-factor procedure

$$ A = Q_1 R_1 $$

$$ A_1 = R_1 Q_1 = Q_2 R_2 $$

$$ A_2 = R_2 Q_2 = Q_3 R_3 $$

This procedure converges to a diagonal matrix [^convergence-to-diagonal], and the diagonal entries are the eigenvalues of $$A$$.

We're in a confusing notational situation, as we now have two different algorithms involving a sequence of orthogonal and upper-triangular matrices.  To distinguish, we will decorate the sequence arising from the $$QR$$-algorithm with tildes

$$ A = \tilde Q_1 \tilde R_1 $$

$$ A_1 = \tilde R_1 \tilde Q_1 = \tilde Q_2 \tilde R_2 $$

$$ A_2 = \tilde R_2 \tilde Q_2 = \tilde Q_3 \tilde R_3 $$

In code

{% highlight python %}
def qr_algorithm(A, tol=0.0001):
    Q, R = np.linalg.qr(A)
    previous = np.empty(shape=Q.shape)
    for i in range(500):
        previous[:] = Q
        X = R @ Q
        Q, R = np.linalg.qr(X)
        if np.allclose(X, np.triu(X), atol=tol): 
            break
    return Q
{% endhighlight %}

Visualizing the iterates of the $$QR$$-algorithm reveals an interesting pattern.

!QR Algorithm]({{ site.url }}/img/qra-qr.png){: .center-img}

While the iterates of the simultaneous orthogonalization algorithm converged to a basis of eigenvectors of $$Q$$, the iterates of the $$QR$$-algorithm seem to converge to the identity matrix [^sign-concern].

$$ \tilde Q_1 = \left( \begin{array}{ccc} -0.90 & 0.05 & 0.44 \\ -0.27 & -0.85 & -0.45 \\ 0.35 & -0.52 & 0.77 \\ \end{array} \right) $$

$$ \tilde Q_2 = \left( \begin{array}{ccc} -0.99 & 0.00 & -0.14 \\ -0.01 & -1.00 & 0.09 \\ -0.14 & 0.09 & 0.99 \\ \end{array} \right) $$

$$ \tilde Q_3 = \left( \begin{array}{ccc} -1.00 & 0.00 & 0.04 \\ -0.00 & -1.00 & -0.01 \\ 0.04 & -0.01 & 1.00 \\ \end{array} \right) $$

$$ \tilde Q_4 = \left( \begin{array}{ccc} -1.00 & 0.00 & -0.01 \\ -0.00 & -1.00 & 0.00 \\ -0.01 & 0.00 & 1.00 \\ \end{array} \right) $$

This suggests that the iterations may be communicating *adjustments* to something, and that the product

$$ \tilde Q_1 \tilde Q_2 \tilde Q_3 \cdots $$

may be important.

Let's see if we can get a hint of what is going on by computing these products

$$ \tilde Q_1 = \left( \begin{array}{ccc} -0.90 & 0.05 & 0.44 \\ -0.27 & -0.85 & -0.45 \\ 0.35 & -0.52 & 0.77 \\ \end{array} \right) $$

$$ \tilde Q_1\tilde Q_2 = \left( \begin{array}{ccc} 0.83 & -0.01 & 0.56 \\ 0.34 & 0.81 & -0.49 \\ -0.45 & 0.59 & 0.67 \\ \end{array} \right) $$

$$ \tilde Q_1\tilde Q_2\tilde Q_3 = \left( \begin{array}{ccc} -0.81 & 0.00 & 0.59 \\ -0.35 & -0.80 & -0.48 \\ 0.47 & -0.60 & 0.65 \\ \end{array} \right) $$

$$ \tilde Q_1\tilde Q_2\tilde Q_3\tilde Q_4 = \left( \begin{array}{ccc} 0.80 & -0.00 & 0.60 \\ 0.36 & 0.80 & -0.48 \\ -0.48 & 0.60 & 0.64 \\ \end{array} \right) $$

This is the best possible situation!  The products of the $$\tilde Q$$ matricies converge to the basis of eigenvectors.

This is great, but it is still very mysterious exactly what is going on here.  To illuminate this a bit, we now turn to uncovering the relationship between the simultaneous orthogonalization algorithm and the $$QR$$-algorithm.


## The Connection Between the QR and Simultaneous Orthogonalization Algorithms

Recall our identity relating the iterates of the simultaneous orthogonalization to the powers of $$A$

$$ A^i = Q_i R_i R_{i-1} \cdots R_1 $$

Let's seek a similar relation for the $$QR$$ algorithm.  If we succeed, we can leverage the uniqueness of the $$QR$$-factorization to draw a relationship between the two algorithms.

The $$QR$$ algorithm begins by factoring $$A$$

$$ A = \tilde Q_1 \tilde R_1 $$

This means that, for example

$$ A^3 = \tilde Q_1 \tilde R_1 \tilde Q_1 \tilde R_1 \tilde Q_1 \tilde R_1 $$

Now, each product $$ \tilde R_1 \tilde Q_1 $$ are exactly those matrices that are factored in the *second* iteration of the algorithm, so

$$ A^3 = \tilde Q_1 \tilde Q_2 \tilde R_2 \tilde Q_2 \tilde R_2 \tilde R_1 $$

We can apply this trick one more time, $$\tilde R_2 \tilde Q_2$$ is exactly the matrix factored in the *third* iteration of the algorithm, so

$$ A^3 = \tilde Q_1 \tilde Q_2 \tilde Q_3 \tilde R_3 \tilde R_2 \tilde R_1 $$

So, we have two competeing factorizations of $$A^3$$ into an orthogonal matrix and an upper triangular matrix

$$ A^3 = \underbrace{Q_3}_{\text{Orthogonal}} \ \underbrace{R_3 R_2 R_1}_{\text{Upper Triangular}} $$

$$ A^3 = \underbrace{\tilde Q_1 \tilde Q_2 \tilde Q_3}_{\text{Orthogonal}} \underbrace{\tilde R_3 \tilde R_2 \tilde R_1}_{\text{Upper Triangular}} $$

Given that $$QR$$-factorizations of invertible matricies are unique, we conclude the relations

$$ Q_i = \tilde Q_1 \tilde Q_2 \cdots \tilde Q_i $$

and

$$ R_i \cdots R_2 R_1 = \tilde R_i \cdots \tilde R_2 \tilde R_1 $$

This explains our observation from before: we already know that $$Q_i \rightarrow \text{Matrix of Eigenvectors}$$, so we immediately can conclude that $$\tilde Q_1 \tilde Q_2 \cdots \tilde Q_i \rightarrow \text{Matrix of Eigenvectors}$$ as well.


## The Products RQ

We have one final point to wrap up: we earlier stated that the products $$R_i Q_i$$ in the $$QR$$ algorithm converge to a diagonal matrix, and the diagonal entries are the eigenvalues of $$A$$, why is this so?

Let's first demonstrate that this is the case in our running example.

$$ \tilde R_1 \tilde Q_1 = \left( \begin{array}{ccc} 3.90 & 0.06 & 0.54 \\ 0.06 & 8.92 & -0.80 \\ 0.54 & -0.80 & 1.18 \\ \end{array} \right) $$

$$ \tilde R_2 \tilde Q_2 = \left( \begin{array}{ccc} 3.99 & 0.00 & -0.14 \\ 0.00 & 9.00 & 0.09 \\ -0.14 & 0.09 & 1.01 \\ \end{array} \right) $$

$$ \tilde R_3 \tilde Q_3 = \left( \begin{array}{ccc} 4.00 & 0.00 & 0.04 \\ 0.00 & 9.00 & -0.01 \\ 0.04 & -0.01 & 1.00 \\ \end{array} \right) $$

$$ \tilde R_4 \tilde Q_4 = \left( \begin{array}{ccc} 4.00 & 0.00 & -0.01 \\ 0.00 & 9.00 & 0.00 \\ -0.01 & 0.00 & 1.00 \\ \end{array} \right) $$

To begin to understand why this is the case, let's start from the fact that, for sufficiently large $$n$$, the product matrix $$\tilde Q_1 \tilde Q_2 \cdots \tilde Q_n$$ is a matrix of eigenvectors.  Letting $$D$$ denote the diagonal matrix of associated eigenvalues, this means that [^approx-equal]

$$ A \tilde Q_1 \tilde Q_2 \cdots \tilde Q_n = \tilde Q_1 \tilde Q_2 \cdots \tilde Q_n D $$

Shuffling things around a bit

$$ \tilde Q_n^t \cdots \tilde Q_2^t \tilde Q_1^t A \tilde Q_1 \tilde Q_2 \cdots \tilde Q_n = D $$

But $$A = \tilde Q_1 R_1$$, so

$$ \begin{align*}
\tilde Q_n^t \cdots \tilde Q_2^t \tilde Q_1^t A \tilde Q_1 \tilde Q_2 \cdots \tilde Q_n &= \tilde Q_n^t \cdots \tilde Q_2^t \tilde Q_1^t \tilde Q_1 \tilde R_1 \tilde Q_1 \tilde Q_2 \cdots \tilde Q_n \\
&= \tilde Q_n^t \cdots \tilde Q_2^t \tilde R_1 \tilde Q_1 \tilde Q_2 \cdots \tilde Q_n \\
&= \tilde Q_n^t \cdots \tilde Q_2^t \tilde Q_2 \tilde R_2 \tilde Q_2 \cdots \tilde Q_n \\
&= \tilde Q_n^t \cdots \tilde Q_3^t \tilde R_2 \tilde Q_2 \cdots \tilde Q_n \\
&= \tilde Q_n^t \cdots \tilde Q_3^t \tilde Q_3 \tilde R_3 \cdots \tilde Q_n \\
&= \cdots \\
&= \tilde R_n \tilde Q_n
\end{align*}$$

So, alltogether

$$ \tilde R_n \tilde Q_n = D $$

Which explains the convergence of the $$RQ$$ products.

[^zero-and-repeated-eigenvalues]: The case of zero eigenvalues is not difficult to treat, as we can simply resrict the action of $$A$$ to the orthogonal complement of the null space, where it has all non-zero eigenvalues.  The case of repreated eigenvalues is more difficult, and we will leave it to the reader to stydy further if interested.

[^eigenvectors-are-columns]: This is easy to see by inspection: $$Q D Q^t Q = Q D$$.

[^limit-must-satisfy]: By taking limits of the equation $$v_{i+1} = A v_i$$.

[^largest-eigenvalue]: Largest in the sense of absolute value.

[^uniqueness-of-QR]: For a proof, see the [paper of Francis](https://academic.oup.com/comjnl/article/4/3/265/380632/The-QR-Transformation-A-Unitary-Analogue-to-the-LR).

[^convergence-to-diagonal]: In the general case where eigenvalues may be repeated, these matricies converge to an upper triangular matrix, the [Schur form](https://en.wikipedia.org/wiki/Schur_decomposition) of A.  The eigenvalues are on the diagonal of this limit matrix.

[^sign-concern]: Actually, not exactly an identity matrix.  More preciesely, a square diagonal matrix with with a $$+1$$ or $$-1$$ for each entry.

[^approx-equal]:: Of course, this is really an approximate equality which becomes exact it the limit of $$n \rightarrow \infty$$.
