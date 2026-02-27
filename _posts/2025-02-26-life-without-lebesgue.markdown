---
layout: post
title:  "Life Without Lebesgue"
date:   2025-02-26
categories: jekyll update mathematics
---
Sometimes it is fun and instructive to solve problems under self imposed constraints ⛓.

We show that:

$$\lim_{n \rightarrow \infty} \int_0^\infty \frac{n x^{n}}{0.1 + x^{n+3}} \sin\left(\frac{x}{n}\right) dx= 1$$

If one is well aquantned with this sort of problem, the limit of integrals calls to mind the great integration theorems of [Henri Lebesgue](https://en.wikipedia.org/wiki/Henri_Lebesgue): the [monotone convergence](https://en.wikipedia.org/wiki/Monotone_convergence_theorem#Monotone_convergence_for_non-negative_measurable_functions_(Beppo_Levi)) and [dominated convergence theorems](https://en.wikipedia.org/wiki/Dominated_convergence_theorem). These are powerful weapons, so, of course, we discard them.

Instead, our main tool will be simpler, we'll make use of uniform convergence:

{% capture uniform-convergence %}
If a sequence of integrable functions $f_n: [a, b] \rightarrow R$ converges *uniformly* to $f: [a, b] \rightarrow R$. Then $f$ is integrable, and:

$$ \lim_{n \rightarrow \infty} \int_a^b f_n(t) dt = \int_a^b f(t) dt$$

{% endcapture %}
{% include theorem.html content=uniform-convergence name="Uniform Convergence of Integrals" %}

This proposition is commonly discussed in undergraduate real analysis classes, while the Lebesgue theorems are saved for later, after measures are developed. It is not so hard to prove the proposition once you're well practiced with the definitions, it's often used as an exam problem.

Its application to *our* problem is somewhat indirect. It can hardly be *completely* direct, because our intergrals range over the whole positive real line, not a compact interval. But that's not the only issue we'll encounter.

## Notation

Some notation for common expressions will be useful.

$$
\begin{align}
   f_n(x) &= \frac{x^{n}}{0.1 + x^{n+3}} \\
   s_n(x) &= n \sin\left(\frac{x}{n}\right)
\end{align}
$$

Notably, we include the factor of $n$ with the sinusoidal function, not the rational function $f_n$. This is a good choice...

## The Sinusoidal Factor
Let's plot the evolution of the sinusoidal factor $s_n(x)$ with varying $n$ to get a sense of what's going on here. Throughout all our plots, later elements in a sequence are *blue*{: .blue}, earlier elements are *green*{: .green}, we'll always use this convention.

![Sinusoidal Terms]({{ site.url }}/img/lwl-sin.png){: .center-img}

There's striking asymptotic behaviour here as $n \rightarrow \infty$, it certainly seems like $s_n(x) \rightarrow x$.

### The Wedge Bound
We'll first demonstrate a simple bound for $s_n(x)$ from above and below.

{% capture wedge-bound %}
$s_n(x) \leq x$ and $s_n(x) \geq -x$ for all $x \geq 0$. I.e., $s_n(x)$ stays confined to the "wedge" $\|y\| \leq \|x\|$.
{% endcapture %}
{% include lemma.html content=wedge-bound name="Wedge Bound" %}

![Wedge Bound]({{ site.url }}/img/lwl-wedge-bound.png){: .center-img}
    
{% capture wedge-bound-proof %}
We make the change of variables $t = \frac{x}{n}$, and look at these inequalities in terms of $t$:

- $x - s_n(x) = n(t - \sin(t))$, so $s_n(x) \leq x$ is equivelent to $\sin(t) \leq t$.
- $s_n(x) + x = n(t + \sin(t))$, so the bound $s_n(x) \geq -x$ is equivelent to $\sin(t) \geq -t$.

These are immediate consequences of the findamental theorem of calculus. Since $\frac{d}{dx} \sin(x) = \cos(x)$ and $-1 \leq \cos(x) \leq 1$ always:

$$ \sin(x) = \int_0^x \cos(t) dt \leq \int_0^x dt = x $$

And for the second bound:

$$ \sin(x) = \int_0^x \cos(t) dt \geq - \int_0^x dt = - x $$
{% endcapture %}
{% include proof.html content=wedge-bound-proof %}


### Uniform Convergence
Maybe the reader recalls the small angle approximation for the sine function, encountered in physics classes when solving differential equations involving pendulum motion: $\sin(x) \approx x$ when $x$ is "small". In our case, for a *fixed* value of $x$ and a *large* value of $n$, the argument $\frac{x}{n}$ is "small", so the small angle approximation tells us that:

$$\sin\left(\frac{x}{n}\right) \approx \frac{x}{n} \implies s_n(x) = n \sin\left(\frac{x}{n}\right) \approx n \frac{x}{n} = x$$

Let's make this precise so we have some finer control over this approximation.

{% capture sinusoidal-uniform-approximation %}
Fix an $A > 0$. Then, on the interval $[0, A]$, $s_n(x) \rightarrow x$ **uniformly in $x$** as $n \rightarrow \infty$.
{% endcapture %}
{% include lemma.html content=sinusoidal-uniform-approximation name="Sinusoid Uniform Approximation" %}

{% capture sinusoidal-uniform-approximation-proof %}
As is traditional, let $\epsilon > 0$ be arbitrary, our goal is to bound the absolute difference $|x - s_n(x)|$ on the interval $[0, A]$ for all $n$ sufficiently large.

Following the lead of our intution using the small angle apprximation, we make the change of variables $t = \frac{x}{n}$ to focus the argument near zero:

$$ x - s_n(x) = nt - n \sin(t) = n(t - \sin(t))$$

This immediately tells us that $x - s_n(x) \geq 0$, since $t - \sin(t)$ always. 
<br><br>

Bounding from above takes a bit more effort.

We use a more formal version of the small angle approximation:

$$ t - \sin(t) = t - \left( t - \frac{t^3}{3!} + \frac{t^5}{5!} - \cdots \right) = \frac{t^3}{3!} - \frac{t^5}{5!} - \cdots $$

Remember, we're looking to take $n$ large, so $t$ small. As were working over the compact interval $[0, A]$, we may as well assume that all $n$ under consideration are so large that $\frac{A}{n} < 1$. In terms of $t$, this is: $t < 1$. With this in mind, we estimate:

$$ t - \sin(t) = \frac{t^3}{3!} - \left(\frac{t^5}{5!} - \frac{t^7}{7!} + \cdots\right) \leq \frac{t^3}{3!} $$

This last inequality follows because every pair of terms in the subtracted alternating summation is non-negative. For example:

$$ \frac{t^5}{5!} - \frac{t^7}{7!} = \frac{t^5}{5!} \left( 1 - \frac{t^2}{7 \cdot 6} \right) \geq 0 $$

and so on.
<br><br>

This is good. We can now esitmate the difference:

$$ x - s_n(x) = n(t - \sin(t)) \leq n \frac{t^3}{3!} \leq \frac{n A^3}{n^3} = \frac{A^3}{n^2}$$

Let $N$ be so large that $\frac{A^3}{n^2} < \epsilon$, then, for all $n > N$:

$$ 0 \leq x - s_n(x) \leq \frac{A^3}{n^2} < \epsilon $$

Since this bound holds independent of $x$, we've established the uniform convergence of $s_n(x) \rightarrow x$.
{% endcapture %}
{% include proof.html content=sinusoidal-uniform-approximation-proof %}


□

## Splitting the Integral

We turn our attention to the integral (or, more accurately, sequence of integrals):

$$ I_n = \int_0^\infty \frac{n x^{n}}{0.1 + x^{n+3}} \sin\left( \frac{x}{n} \right) dx$$

We also let $I_n(x)$ (used as a function, not a constant) denote the integrand of the integral $I_n$.

For some inspiration, let's plot the integrands and see if there's any hint of a strategy:


```python
def f(n: int, t: np.array):
    return t**n / (0.1 + t**(n+3))
                   
def I(n: int, t: np.array):
    return f(n, t) * s(n, t)
```


```python
N_MAX, X_MIN, X_MAX = 25, 0.0, 10.0

t = np.linspace(X_MIN, X_MAX, num=1000)

fig, ax = plt.subplots(figsize=(14, 3))
for n in range(1, N_MAX):
    ax.plot(t, I(n, t), color=cm.winter_r(n/N_MAX))
ax.axvline(1.0, linewidth=3, color='black', linestyle='--', alpha=0.5)

ax.set_xlabel('$t$')
ax.set_ylabel('$I_n(t) = f_n(t) \\ s_n(t)$')
```




    Text(0, 0.5, '$I_n(t) = f_n(t) \\ s_n(t)$')




    
![png](integral-limit_files/integral-limit_18_1.png)
    


This is fairly illuminating, some observations:

  - There is a shift in qualitative behaviour of the integrand at $x = 1$, this suggests splitting into two integrals at this boundary.
  - For $x < 1$, the function seems to be converging pointwise (though not uniformly!) to zero. This suggests the integrals over $[0, 1]$ limit to zero.
  - For $x \geq 1$ the integrands seem to be limiting to some function like $x \mapsto \frac{1}{x^k}$, though we'll have to figure out what $k$ is. If so, we may be able to compute the limit here as an integral of a reciporical power.
  - For $x > A$, i.e. very large $x$, the integrands die out quickly. This suggests they have a negligable effect on the integral.

These considerations suggest fixing a large $A > 0$, and splitting our integral into three pieces, working piece by piece:

$$ I_n = \int_0^1 I_n(x) dx + \int_1^A I_n(x) dx + \int_A^\infty I_n(x) dx$$

Let's go.

## The Integral To The Right

The rightmost integral is most easily dispatched. Recall that our suspicion is that, since $I_n(x)$ dies out so quickly as $x \rightarrow \infty$, this integral should contribute negligably to the final value. So we seek to upper bound its value.

We're working in the range $x > A$, and here we have no controll over the convergence of $s_n(x)$, but we do have the wedge bounding lemma $\left| s_n(x) \right| \leq x$ that applies everywhere. Let's see what this can do for bounding $I_n(x)$:

$$ \left| I_n(x) \right| = \frac{x^{n}}{0.1 + x^{n+3}} \left| s_n(x) \right| \leq \frac{x^{n + 1}}{0.1 + x^{n+3}} \leq \frac{x^{n+1}}{x^{n+3}} = \frac{1}{x^2} $$

Where the first inequality uses the wedge bounding lemma, and the second follows from ignoring the $0.1$ summand in the demoninator (since $0.0 < 0.1$, this makes the denominator smaller, and the overall ratio larger).

It works out nicely:

$$ \left| \int_A^\infty I_n(x) dx \right| \leq \int_A^\infty \left| I_n(x) \right| dx \leq \int_A^\infty \frac{1}{x^2} dx = \frac{1}{A} $$

So indeed, by taking $A$ large enough, we can reduce the contribution of the tail to the final integrals as much as we wish, and this bound is independent of $n$. From now on, we consider $A$ fixed and large.

## The Ingeral To The Left

We suspect the sequence of left ingetrals limits to zero:

$$ \lim_{n \rightarrow \infty} \int_0^1 I_n(x) dx =^{?} 0 $$

Here's a zoomed in plot of this reigon to make this believable:


```python
N_MAX, X_MIN, X_MAX = 200, 0.0, 1.1

t = np.linspace(X_MIN, X_MAX, num=1000)

fig, ax = plt.subplots(figsize=(14, 3))
for n in range(1, N_MAX):
    ax.plot(t, I(n, t), color=cm.winter_r(n/N_MAX))
ax.axvline(1.0, linewidth=3, color='black', linestyle='--', alpha=0.5)

ax.set_xlabel('$t$')
ax.set_ylabel('$I_n(t) = f_n(t) \\ s_n(t)$')
```




    Text(0, 0.5, '$I_n(t) = f_n(t) \\ s_n(t)$')




    
![png](integral-limit_files/integral-limit_24_1.png)
    


Again, our wedge bound on $s_n(x)$ will play. Let's get some intution by bounding the $s_n(x)$ factor of the integrand, similarly to the previous argument:

$$ I_n(x) = \frac{x^{n}}{0.1 + x^{n+3}} s_n(x) \leq \frac{x^{n + 1}}{0.1 + x^{n+3}} \leq 10 x^{n + 1} $$


```python
N_MAX, X_MIN, X_MAX = 200, 0.0, 1.0

t = np.linspace(X_MIN, X_MAX, num=1000)

fig, ax = plt.subplots(figsize=(14, 3))
for n in range(1, N_MAX):
    ax.plot(t, I(n, t), color=cm.winter_r(n/N_MAX), alpha=0.5)
ax.plot(t, 10 * t**(N_MAX + 1), color='orange', linestyle=':', linewidth=3, label="$10 x^{n+1}$")
ax.axvline(1.0, linewidth=3, color='black', linestyle='--', alpha=0.5)

ax.set_ylim([0.0, 1.6])

ax.set_xlabel('$t$')
ax.set_ylabel('$I_n(t) = f_n(t) \\ s_n(t)$')
ax.legend()
```




    <matplotlib.legend.Legend at 0x113653d90>




    
![png](integral-limit_files/integral-limit_26_1.png)
    


This allows us to bound:

$$ \int_0^1 I_n(x) dx \leq \int_0^1 10 x^{n + 1} dx = \frac{10}{n + 2} $$

And so:

$$ \lim_{n \rightarrow \infty} \int_0^1 I_n(x) dx \leq \lim_{n \rightarrow \infty} \frac{10}{n + 2} = 0 $$

For the lower bound, we note that $s_n(x) = n \sin(\frac{x}{n}) \geq 0$ as long as $0 \leq \frac{x}{n} \leq \pi$. Since were working on the interval $0 \leq x \leq 1$ here, this is true for all $n$. So $s_n(x) \geq 0$ always in this regoin, and since $f_n(x) \geq 0$ always (by direct inspection), these combine to give us the lower bound:

$$0 \leq \lim_{n \rightarrow \infty} \int_0^1 I_n(x) dx $$

Alltogether:

$$0 \leq \lim_{n \rightarrow \infty} \int_0^1 I_n(x) dx \leq 0$$

So:

$$ \lim_{n \rightarrow \infty} \int_0^1 I_n(x) dx = 0 $$

Good.

**Note:** We're freewheeling with the $\lim$ here, before we've shown the limit even exists. Real pros would use $\limsup$ and $\liminf$ here, inserting them for the proper unadorned $\lim$'s makes this all proper.

## The Integral In The Middle

The middle integral remains:

$$ \int_1^A I_n(x) dx $$

From our previous arguments, we know that the left and right integrals do not contribute to the final value (in the limit), so we expect this middle integral holds the key to the whole story. Let's fix $A = 4$ for visualization purposes, and look at what we've got:


```python
N_MAX, X_MIN, X_MAX = 50, 0.8, 4.2

t = np.linspace(X_MIN, X_MAX, num=1000)

fig, ax = plt.subplots(figsize=(14, 3))
for n in range(1, N_MAX):
    ax.plot(t, I(n, t), color=cm.winter_r(n/N_MAX))
ax.axvline(1.0, linewidth=3, color='black', linestyle='--', alpha=0.5)
ax.axvline(4.0, linewidth=3, color='black', linestyle='--', alpha=0.5)

ax.set_xlabel('$t$') 
ax.set_ylabel('$I_n(t) = f_n(t) \\ s_n(t)$')
```




    Text(0, 0.5, '$I_n(t) = f_n(t) \\ s_n(t)$')




    
![png](integral-limit_files/integral-limit_30_1.png)
    


It seems likely, from this plot, that the functions $I_n(x)$ are converging (uniformly?) to some limiting function, so we should try to figure out a canidate for this limit. We already know the uniform limit $s_n(x) \rightarrow x$, so that helps quite a bit:

$$ I_n(x) = f_n(x) s_n(x) \approx x f_n(x) = \frac{x^{n + 1}}{0.1 + x^{n+3}} \approx \frac{x^{n+1}}{x^{n+3}} = \frac{1}{x^2} $$

In the final approximation, we've slyly used that $x \geq 1$, ensuring that $x^{n + 3}$ is the dominant term in the denominator.

Let's superimpose our candidate limit function and see if we should believe this:


```python
N_MAX, X_MIN, X_MAX = 100, 0.8, 4.2

t = np.linspace(X_MIN, X_MAX, num=1000)

fig, ax = plt.subplots(figsize=(14, 3))
for n in range(1, N_MAX):
    ax.plot(t, I(n, t), color=cm.winter_r(n/N_MAX))
ax.plot(t, 1/t**2, color="orange", linewidth=3, linestyle=":", label=r"$\frac{1}{x^2}$")

ax.axvline(1.0, linewidth=3, color='black', linestyle='--', alpha=0.5)
ax.axvline(4.0, linewidth=3, color='black', linestyle='--', alpha=0.5)

ax.set_xlabel('$t$') 
ax.set_ylabel('$I_n(t) = f_n(t) \\ s_n(t)$')
ax.legend()
```




    <matplotlib.legend.Legend at 0x115946490>




    
![png](integral-limit_files/integral-limit_32_1.png)
    


That seems promising! Our goal now is to show that:

$$ \lim_{n \rightarrow \infty} \int_1^A I_n(x) dx = \int_1^A \frac{1}{x^2} dx = 1 - \frac{1}{A} $$

There are two paths here. The easier route calls upon the [dominated convergence theorem](https://en.wikipedia.org/wiki/Dominated_convergence_theorem) to deduce convergence of the integrals from pointwise convergence of the functions, this makes short work of this problem.

The harder path makes use of simpler tools: we'll deduce convergence of the integrals from *uniform* convergence of the functions. This begs the question, is the (proposed) convergence $I_n(x) \rightarrow \frac{1}{x^2}$ uniform?

**Actually, no, it's not**. There's trouble near $x = 1$:


```python
N_MAX, X_MIN, X_MAX = 200, 0.975, 1.1

t = np.linspace(X_MIN, X_MAX, num=1000)

fig, ax = plt.subplots(figsize=(14, 3))
for n in range(1, N_MAX):
    ax.plot(t, I(n, t), color=cm.winter_r(n/N_MAX))
ax.plot(t, 1/t**2, color="orange", linewidth=3, linestyle=":", label=r"$\frac{1}{x^2}$")

ax.axvline(1.0, linewidth=3, color='black', linestyle='--', alpha=0.5)

ax.set_xlabel('$t$') 
ax.set_ylabel('$I_n(t) = f_n(t) \\ s_n(t)$')
ax.legend()
```


    ---------------------------------------------------------------------------

    NameError                                 Traceback (most recent call last)

    Cell In[2], line 3
          1 N_MAX, X_MIN, X_MAX = 200, 0.975, 1.1
    ----> 3 t = np.linspace(X_MIN, X_MAX, num=1000)
          5 fig, ax = plt.subplots(figsize=(14, 3))
          6 for n in range(1, N_MAX):


    NameError: name 'np' is not defined


The problem here is that $f_n(1)$ is independent of $n$:

$$ f_n(1) = \frac{1}{0.1 + 1} = \frac{10}{11} $$

So there's no chance that $I_n(x) \rightarrow \frac{1}{x^2}$ uniformly on $[1, A]$. We'll need to adapt our strategy a little. Maybe we can isolate the trouble, and enclose the problematic reigon in a small enough box that it does not affect the integrals so much. Let's introduce a $B$ just *slightly* larger than $1$:


```python
N_MAX, X_MIN, X_MAX = 200, 0.975, 1.1
B = 1 + 0.005

t = np.linspace(X_MIN, X_MAX, num=1000)

fig, ax = plt.subplots(figsize=(14, 3))
for n in range(1, N_MAX):
    ax.plot(t, I(n, t), color=cm.winter_r(n/N_MAX))
ax.plot(t, 1/t**2, color="orange", linewidth=3, linestyle=":", label=r"$\frac{1}{x^2}$")

ax.axvline(1.0, linewidth=3, color='black', linestyle='--', alpha=0.5)
ax.axvline(B, linewidth=3, color='black', linestyle='--', alpha=0.5)
ax.axvspan(1.0, B, linewidth=None, color='grey', linestyle='--', alpha=0.5)
ax.annotate('$B$', (B - 0.001, -0.09), fontsize=12, annotation_clip=False)

ax.set_xlabel('$t$') 
ax.set_ylabel('$I_n(t) = f_n(t) \\ s_n(t)$')
ax.legend()
```




    <matplotlib.legend.Legend at 0x115ca2fd0>




    
![png](integral-limit_files/integral-limit_36_1.png)
    


Our strategy is to (again) split our integral up, this time into two peices:

$$ \int_1^A I_n(x) dx = \int_1^B I_n(x) dx + \int_B^1 I_n(x) dx $$

The first integral is over a very small interval, and we can hopefully make its value as small as we like by making the interval very thin. We're hoping our original strategy exploiting uniform convergence works for the second integral.

### The Integral Over $[1, B]$

We want to bound $I_n(x)$ on $[1, \infty]$, this is straightforward by now using our wedge bound on $s_n(x)$:

$$ \left| I_n(x) \right| = \frac{x^{n}}{0.1 + x^{n+3}} \left| s_n(x) \right| \leq \frac{x^{n + 1}}{0.1 + x^{n+3}} \leq \frac{1}{x^2} \leq 1 $$

So:

$$ \left| \int_1^B I_n(x) dx \right| \leq \int_1^B \left| I_n(x) \right| dx \leq \int_1^B dx = B - 1$$

By taking $B$ close to $1$, we can make this piece as small as we'd like.

### The Integral Over $[B, A]$

Our hope here is that we can make use of uniform convergence, so we would like to show the following:

#### Lemma (Uniform Convergence):
On the interval $[B, A]$, $I_n(x) \rightarrow \frac{1}{x^2}$ as $n \rightarrow \infty$, uniformly in $x$.

#### Proof:

Of course, fix $\epsilon > 0$.

We want to estimate:

$$ \left| I_n(x) - \frac{1}{x^2} \right| = \left| f_n(x) s_n(x) - \frac{1}{x^2} \right| $$

Since $s_n(x) \rightarrow x$ uniformly, this suggests using the triangle inequality like so:

$$\left| f_n(x) s_n(x) - \frac{1}{x^2} \right| \leq \left| f_n(x) s_n(x) - x f_n(x) \right| + \left|x f_n(x) - \frac{1}{x^2} \right|$$

For the first term here, we make use of the uniform convergence of $s_n(x)$ and the boundedness of $f_n(x)$. Choose $N$ so large that $n > N \implies \left| s_n(x) - x \right| < \epsilon$ for all $1 \leq x \leq A$. We have the simple bound on $f_n(x)$:

$$ f_n(x) = \frac{x^{n}}{0.1 + x^{n+3}} \leq \frac{x^{n}}{x^{n+3}} = \frac{1}{x^3} \leq 1 $$

so for $n > N$:

$$ \left| f_n(x) s_n(x) - x f_n(x) \right| = \left| f_n(x) \right| \left| s_n(x) - x \right| < \epsilon $$

For the second term, we calculate directly:

$$\frac{1}{x^2} - x f_n(x) = \frac{1}{x^2} - \frac{x^{n + 1}}{0.1 + x^{n+3}} = \frac{0.1}{x^2 (0.1 + x^{n+3})} \leq \frac{0.1}{x^{n+3}} \leq \frac{0.1}{B^{n + 3}}$$

Since $B > 1$, $\frac{0.1}{B^{n + 3}} \rightarrow 0$ as $n \rightarrow \infty$. So we may replace $N$, if needed, so that $n > N \implies \frac{0.1}{B^{n + 3}} < \epsilon$ as well.

Alltogether, for $n > N$:

$$\left| I_n(x) - \frac{1}{x^2} \right| < 2\epsilon$$

Since this bound does not depend on $x$, we conclude that on the interval $[B, A]$, $I_n(x) \rightarrow \frac{1}{x^2}$ as $n \rightarrow \infty$, uniformly in $x$. □

It follows immediately from this lemma that:

$$ \lim_{n \rightarrow \infty} \int_A^B I_n(x) dx = \int_A^B \frac{1}{x^2} dx = \frac{1}{B} - \frac{1}{A} $$

Informally, we can see we are on the right track here: as $B \searrow 1$ and $A \nearrow \infty$ the value of the integral tends to $1$.

### Together: The Integral Over $[1, A]$

Returning to our main goal in this section, we aim to show that:


$$ \lim_{n \rightarrow \infty} \int_1^A I_n(x) dx = \int_1^A \frac{1}{x^2} dx = 1 - \frac{1}{A} $$

For the moment, let $B$ be any number slightly larger than $1$ (and, of course, less than $A$), we will shortly make a more judicious choice. Then:

$$ 
\begin{align}
    \left| \int_1^A I_n(x) dx - \left(1 - \frac{1}{A}\right) \right| &= \left| \int_1^B I_n(x) dx + \int_B^A I_n(x) dx - \left(\frac{1}{B} - \frac{1}{A}\right) - \left(1 - \frac{1}{A}\right) + \left(\frac{1}{B} - \frac{1}{A}\right)\right| \\
    &= \left| \int_1^B I_n(x) dx + \int_B^A I_n(x) dx - \left(\frac{1}{B} - \frac{1}{A}\right) + \left( \frac{1}{B} - 1 \right) \right| \\
    &\leq \left| \int_1^B I_n(x) dx \right| + \left| \int_B^A I_n(x) dx - \left(\frac{1}{B} - \frac{1}{A}\right) \right| + \left| \frac{1}{B} - 1 \right| \\
    &\leq \left(B - 1\right) + \left(1 - \frac{1}{B}\right) + \left| \int_B^A I_n(x) dx - \left(\frac{1}{B} - \frac{1}{A}\right) \right| \\
\end{align}    
$$

Fix $\epsilon > 0$. Choose $B$ so close to $1$ that both $B - 1 < \frac{\epsilon}{3}$, and $1 - \frac{1}{B} < \frac{\epsilon}{3}$. 

With this fixed $B$, now apply our computation of the integral limit over $[B, A]$ following from uniform convergence. Pick $N$ so large that:

$$ n > N \implies \left| \int_B^A I_n(x) dx - \left(\frac{1}{B} - \frac{1}{A}\right) \right| < \frac{\epsilon}{3} $$

Then for all $n > N$:

$$\left| \int_1^A I_n(x) dx - \left(1 - \frac{1}{A}\right) \right| < \frac{\epsilon}{3} + \frac{\epsilon}{3} + \frac{\epsilon}{3} = \epsilon$$

Since $\epsilon$ is arbitrary, this shows that:

$$\lim_{n \rightarrow \infty} \left| \int_1^A I_n(x) dx - \left(1 - \frac{1}{A}\right) \right| = 0$$

Or equivalently:

$$ \lim_{n \rightarrow \infty} \int_1^A I_n(x) dx = 1 - \frac{1}{A} $$

As was our goal.

## Finale

We've got all the pieces in hand now. Recall our intention is to show that:

$$\lim_{n \rightarrow \infty} \int_0^\infty I_n(x) dx= 1$$

So, let's estimate using our three integral strategy. For the moment, let $A > 1$ be any value, we'll again make a more judicious choice shortly:

$$
\begin{align}
    \left| \int_0^\infty I_n(x) dx - 1 \right| &\leq \left| \int_0^1 I_n(x) dx \right| + \left| \int_1^A I_n(x) dx - \left(1 - \frac{1}{A}\right) \right| + \left| \frac{1}{A} \right| + \left| \int_A^\infty I_n(x) dx \right| \\
     &\leq \left| \int_0^1 I_n(x) dx \right| + \left| \int_1^A I_n(x) dx - \left(1 - \frac{1}{A}\right) \right| + \frac{1}{A} + \frac{1}{A}
\end{align}
$$

Where the final inequality uses our estimate of the rightmost integral. 

For a final time, fix $\epsilon > 0$. Choose and fix $A$ so large that $\frac{1}{A} < \frac{\epsilon}{4}$. Choose $N$ so large that, for $n > N$, **both**:

$$
\begin{align}
    \left| \int_0^1 I_n(x) dx \right| &\leq \frac{\epsilon}{4} \\
    \left| \int_1^A I_n(x) dx - \left(1 - \frac{1}{A}\right) \right| &\leq \frac{\epsilon}{4}
\end{align}
$$

Then, for all $n > N$:

$$
\left| \int_0^\infty I_n(x) dx - 1 \right| \leq \frac{\epsilon}{4} + \frac{\epsilon}{4} + \frac{\epsilon}{4} + \frac{\epsilon}{4} = \epsilon
$$

That is:

$$ \lim_{n \rightarrow \infty} \left| \int_0^\infty I_n(x) dx - 1 \right| = 0 $$

Or, equivalently:

$$\lim_{n \rightarrow \infty} \int_0^\infty I_n(x) dx = 1$$

Fin.


```python

```

{% capture prf %}
Let $f$ be continuous on $[a, b]$...
{% endcapture %}
{% include proof.html content=prf %}