---
layout: post
title:  "The Galois Group of $(x^5 - 7)(x^4 - 5)$"
date:   2026-03-19
categories: jekyll update mathematics
---

<div style="display:none">
$$
\newcommand{\identity}{\mathbb{1}}
\newcommand{\defeq}{\mathrel{\mathop:}=}
\newcommand{\roufive}{\zeta_5}
\newcommand{\routwenty}{\zeta_{20}}
\newcommand{\fourthroot}{ \sqrt[4]{5} }
\newcommand{\fifthroot}{ \sqrt[5]{7} }
\newcommand{\Qfour}{ \mathbb{Q}(i, \sqrt[4]{5}) }
\newcommand{\Qfive}{ \mathbb{Q}(\zeta_5, \sqrt[5]{7}) }
\newcommand{\Qall}{ \mathbb{Q}(i, \sqrt[4]{5}, \zeta_5, \sqrt[5]{7}) }
\newcommand{\Qalltwenty}{ \mathbb{Q}(\zeta_{20}, \sqrt[4]{5}, \sqrt[5]{7}) }
\newcommand{\Qtwentyfour}{ \mathbb{Q}(\zeta_{20}, \sqrt[4]{5}) }
\newcommand{\Qtwenty}{ \mathbb{Q}(\zeta_{20}) }
\newcommand{\pfour}{ x^4 - 5 }
\newcommand{\pfive}{ x^5 - 7 }
\newcommand{\p}{ (x^5 - 7)(x^4 - 5) }
\newcommand{\Zmodtwo}{\Z / 2\Z}
$$
</div>

In this essay, we discuss a moderately involved example in Galois Theory. 

Galois theory studies the symmetries of polynomial equations. It offers the deepest and most general explantation of why there **are** formulas for the solutions of [quadratic equations](https://en.wikipedia.org/wiki/Quadratic_equation) (the quadratic formula), [cubic](https://en.wikipedia.org/wiki/Cubic_equation) and [quartic](https://en.wikipedia.org/wiki/Quartic_equation) equations (which are less well known, but do exist!), but then there are [**no more**](https://en.wikipedia.org/wiki/Abel%E2%80%93Ruffini_theorem)! It developed out of the ideas of two young men who died tragic early deaths and have become part of the mythology of mathematics, and that I personally admire: [Niels  Abel](https://en.wikipedia.org/wiki/Niels_Henrik_Abel) and [Évariste Galois](https://en.wikipedia.org/wiki/%C3%89variste_Galois).

Galois theory also stands as a representative of what mathematicians consider an "ideal" theory. It serves as a rich thesaurus between two sub-domains of mathematics that are on the surface, not obviously connected. Galois theory allows jumping between two domains (Group theory and Field theory), applying results in one domain to their reflection in another. This, modern, form of the theory is due to [Emil Artin](https://en.wikipedia.org/wiki/Emil_Artin).

### Problem Description
Our main result is:

{% capture goal-result %}
Let $K$ denote the splitting field of the polynomial $p(x) = (x^5 - 7)(x^4 - 5)$ over the rational number field $\Q$, and let $G \defeq Gal(K / \Q)$  be its Galois group. Then:

$$[K:\Q] = 80$$

The Galois group $G$ fits into two exact sequences. The first does not split, so does not induce a semi-direct product structure, but arises naturally from the two factors of $f$: 

$$ 0 \rightarrow \Zmodtwo \times \Zmodtwo \times D_{10} \rightarrow G \rightarrow \Zmodtwo \rightarrow 0$$

The second takes some searching for, but it does split:

$$ 0 \rightarrow \Zmodtwo \times \Zmodtwo \rightarrow G \rightleftarrows GA(1, 5) \rightarrow 0$$

The splitting induces a semi-direct product structure: 

$$G \cong (\Zmodtwo \times \Zmodtwo) \rtimes GA(1, 5)$$

{% endcapture %}
{% include goal.html content=goal-result name="Goal" %}

We will see without too much trouble that:

- The splitting field of $\pfour$ has degree eight over $\Q$, and
- The splitting field of $\pfive$ has degree twenty over $\Q$.

So the degree of $K$  over $\Q$ is **at most** $8 \cdot 20 = 160$. That this maximum does **not** occur indicates there is some non-obvious algebraic relation between the roots of $\pfour$ and $\pfive$, which is indeed the case[^pentagons]. Much fuss will be made about the square root of five, which resides in the splitting field of both factors!

This relation regarding $\sqrt{5}$ intertwines the roots of $\pfour$ and $\pfive$, and this is what makes this particular analysis interesting, it will be the source of complexity in computing both the degree, and the Galois group.

### Resources
I came to this problem from a misreading of a University of Washington qualifying exam question, which, when correctly stated, is:

{% capture qualifying-exam-question %}
Let $\alpha, \beta$ denote the unique positive real 5th root of 7 and 4th root of 5, respectively. Determine the degree of $\Q(\alpha, \beta)$ over $\Q$.
{% endcapture %}
{% include goal.html content=qualifying-exam-question name="Qualifying Exam Problem" %}

This is, of course, a much simpler problem than what we're getting up to here. You can find the problem on the [2018 Algebra Prelim](https://math.washington.edu/sites/math/files/documents/grad/algebra-sept-2018.pdf) hosted [here](https://math.washington.edu/past-phd-preliminary-exams).

Various resources were very helpful in learning and practicing enough Galois theory to solve this sort of problem.

- My all time favorite book on Algebra is [Topics In Algebra](https://www.thriftbooks.com/w/topics-in-algebra_in-herstein/254351) by Herstein. There's not enough Galois theory in there for everything we need, but its style and enthusiasm is very close to my ♥.
- [Keith Conrad's Essays](https://kconrad.math.uconn.edu/blurbs/) on many, many subjects in algebra do have all we need. These are such a rich source of joy and information, I am very indebted to Keith for providing these free resources. I'll cite particular articles as we need them.
- A free textbook that also has everything we need is J.S. Milne's [Fields and Galois Theory](https://www.jmilne.org/math/CourseNotes/ft.html).
- The [PARI](https://pari.math.u-bordeaux.fr/) computer algebra system is free [^as-in-freedom] software, and includes algorithms for computing splitting fields and Galois groups. We'll use PARI to check our work.
- The [Groupprops Wiki](https://groupprops.subwiki.org/wiki/Main_Page) and [Group Names database](https://people.maths.bris.ac.uk/~matyd/GroupNames) holds rich information about the structure and identity of finite groups. We'll make use of them to narrow down possible isomorphism classes of our Galois groups.

Let's get started!


## Warming Up
Let's begin by describing the splitting fields and Galois groups of the two factors $\pfour$ and $\pfive$. We'll need a lot of this information anyway, and this serves as a good place to review the fundamentals of Field Extensions and Galois Theory.

### The Galois Group of $\pfour$
It's easy to enumerate the roots of $\pfour$: $ \pm \fourthroot,  \pm i \fourthroot $. The the splitting field of $\pfour$ is the smallest extension field of $\Q$ containing all these roots, so it must contain any algebraic expression in them as well. In particualr, the splitting field contains ratios of these roots, so it contains the fourth root of unity $i = \frac{i \fourthroot}{\fourthroot}$. Conversely, each of the four roots is a product of $\pm i$ and $\fourthroot$. It follows that the splitting field of $\pfour$ is $\Qfour$.

To compute the degree  $[\Qfour:\Q]$, observe that $\pfour$ is Eisenstein at $p = 5$, and so irreducible. Adjoining a single root, it follow that $\Q(\fourthroot)$ is a degree four extension of $\Q$. This is a real [^real-subfields] field, so it does not yet contain $i$, and therefore:

$$[\Qfour:\Q(\fourthroot)] \neq 1$$

But the minimal polynomial of $i$ over $\Q$ is $x^2 + 1$, so the degree of $i$ over *any* field is at most two, in particular:

$$[\Qfour:\Q(\fourthroot)] \leq 2$$

The only possibility is that this extension's degree is exactly two. It follows that:

$$[\Qfour:\Q] = [\Qfour:\Q(\fourthroot)] [\Q(\fourthroot):\Q] = 2 \cdot 4 = 8 $$

And we have the:

{% capture splitting-field-fourth %}
The splitting field of $\pfour$ is $\Qfour$. Its degree over the rationals is $$[\Qfour:\Q] = 8 $$
{% endcapture %}
{% include result.html content=splitting-field-fourth %}

Now we compute the Galois group of the extension $\Qfour / \Q$. Since $\pfour$ is irreducible, the Galois group acts transitively on its roots, so there is at least some automorphism:

$$ \alpha: \fourthroot \mapsto i \fourthroot $$

Additionally, complex conjugation is an automorphism of any **normal** extension (i.e., any extension that's a **splitting field**). We'll denote the complex conjugation automorphism by $\beta$.

Now, $\alpha$ must map $i$ to a root of its minimal polynomial $x^2 + 1$, so to $\pm i$. If we have chosen an automorphism $\alpha$ that maps $i \mapsto -i$, then we may as well replace our choice with $\beta \alpha$ instead, which has the benefit of fixing $i$. That's all to say, we may assume $\alpha(i) = i$ [^alternative-eight].

We have now the eight distinct (since they act distinctly on the two values $\fourthroot$ and $i$) automorphisms:

$$\alpha^k, \beta \alpha^k: k = 0, 1, 2, 3$$

and this is exactly the degree of the field extension. So these fill out the Galois group.

To identify the isomorphism class of our group, there are thankfully not so many [groups of order eight](https://groupprops.subwiki.org/wiki/Groups_of_order_8). We have elements $\alpha$ of order 4 and an involution $\beta$. They do not commute, since:

$$\beta \alpha (\fourthroot) = \beta(i \fourthroot) = - i \fourthroot$$

while:

$$ \alpha \beta (\fourthroot) = \alpha(\fourthroot) = i \fourthroot$$

So we've got either the dihedral $D_8$ or the quaternion group $Q$. Our two elements happen to satisfy the defining relations of the dihedral group:

$$ \beta \alpha \beta (\fourthroot) = \beta \alpha (\fourthroot) = \beta (i \fourthroot) = - i \fourthroot $$

$$ \alpha^3 (\fourthroot) = i^3 \fourthroot = - i \fourthroot $$

and

$$ \beta \alpha \beta (i) = \beta \alpha (- i) = \beta(- i) = i $$

$$ \alpha^3 (i) = i $$

So, indeed, $\beta \alpha \beta = \alpha^3$, and we conclude that:

{% capture galios-group-fourth %}
The isomorphism class of the Galois group of the extension $\Qfour / \Q$ is $D_8$.
{% endcapture %}
{% include result.html content=galios-group-fourth %}

Let's check our work with PARI.

```pari
? P1 = x^4 - 5;        
? K1 = nfsplitting(P1);
? K1
x^8 + 70*x^4 + 15625
```

This polynomial $x^8 + 70x^4 + 15625$ is an irreducible whose root(s) is a primitive element for $\Qfour / \Q$. In particular, this validates for us that our degree computation is correct. If we want to simply ask for the degree directly:

```pari
? poldegree(K1)
8
```

PARI can also compute the Galois group:

```pari
? G1 = galoisinit(K1); 
? galoisidentify(G1)   
[8, 3]
```

This output `[8, 3]` refers to the *third* group of order *eight* in a standardized list of finite groups, and is called the GAP id. Checking out the [groups of order eight](https://groupprops.subwiki.org/wiki/Groups_of_order_8) in the wiki, the dihedral group $D_8$ is indeed the third one. Alternatively, sometimes PARI will give us a nice standard group name if we ask:

```pari
? galoisgetname(8, 3)       
"D8"
```

But, as we get into more exotic groups later on, this will not be as reliable.

### The Galois Group of $\pfive$
Much here is similar to our arguments in the previous section, so we speed up the pace a bit. 

By enumerating the roots, we deduce that the splitting field of $\pfive$ is $\Qfive$ [^root-of-unity]. Throughout the rest of our arguments, we'll need to rely on basic [cyclotomic theory](https://kconrad.math.uconn.edu/blurbs/galoistheory/cyclotomic.pdf) quite a few times, this is the first of those times. The degrees of cyclotomic extensions are given using Euler's $\varphi$ function:

$$ [\Q(\roufive):\Q] = \varphi(5) = 4 $$

On the other hand, $\pfive$ is Eisenstein at $7$, and so irreducible, so:

$$ [\Q(\fifthroot):\Q] = 5 $$

It follows that the degree of the splitting extension is divisible by both $4$ and $5$, and hence divisible by $20$. On the other hand, the minimal polynomial of $\fifthroot$ over $\Q(\roufive)$ is some factor of the minimal polynomial of $\fifthroot$ over $\Q$, which is $\pfive$. So:

$$[\Qfive:\Q] = [\Q(\roufive)(\fifthroot):\Q(\roufive)] [\Q(\roufive):\Q] \leq 5 \cdot 4 = 20 $$

Together, this all means the degree of the extension is exactly twenty, and we have shown:

{% capture splitting-field-fifth %}
The splitting field of $\pfive$ is $\Qfive$. Its degree over the rationals is $$[\Qfive:\Q] = 20 $$
{% endcapture %}
{% include result.html content=splitting-field-fifth %}

Now for the Galois group. In the same manner as before, it acts transitively on the roots of the polynomials $\pfive$ and $\phi_5(x) = x^4 + x^3 + x^2 + x + 1$ [^minimial-polynomial]. So, under any automorphism, $\fifthroot$ has five possible images, and $\roufive$ has four; the pair has $5 \cdot 4 = 20$ possible images. This pair of images determines an automorphism uniquely, and there are in total $20$ automorphisms (the degree of the extension), so each of pair of images must occur.

To identify the isomorphism class of the Galois group, we pick two specific automorphisms in a similar manner to the last section.

$$a: \fifthroot \mapsto \roufive \fifthroot, \\ \roufive \mapsto \roufive$$

$$b: \fifthroot \mapsto \fifthroot, \\ \roufive \mapsto \roufive^2 $$

Note that $a^5 = b^4 = \identity$, and with a similar calculation as before: $b a b^{-1} = a^2$. This identifies the group as the [General Affine group of order $20$](https://groupprops.subwiki.org/wiki/General_affine_group:GA(1,5)).

{% capture galios-group-fifth %}
The isomorphism class of the Galois group of the extension $\Qfive / \Q$ is $GA(1, 5)$.
{% endcapture %}
{% include result.html content=galios-group-fifth %}

Again, let's use PARI to check our results.

```pari
? P2 = x^5 - 7;        
? K2 = nfsplitting(P2);
? K2
x^20 + 30625*x^10 + 7503125
```

So the splitting field is indeed of degree $20$ over $\Q$.

```pari
? G2 = galoisinit(K2);
? galoisidentify(G2)  
[20, 3]
? galoisgetname(20, 3)
"C5 : C4"
```

The `:` notation here is used by PARI to denote a [semi direct product](https://en.wikipedia.org/wiki/Semidirect_product), for which the usual mathematical notation is $\rtimes$. This concept will come up a few times in the future, so if the reader is not familiar, it will be a good idea to research this concept if they wish to follow to the end.

Consulting again the [Groups Wiki](https://groupprops.subwiki.org/wiki/Groups_of_order_20) the group with GAP ID $3$ is indeed our $GA(1, 5)$. The connection between our notation and the semi-direct product is that, for all $n$:

$$GA(1, n) \cong \Z / n\Z \rtimes (\Z / n\Z)^{\times} \cong \Z / n\Z \rtimes \Z / (n - 1)\Z $$

Which is exactly what PARI was telling us.

## The Degree of $[K:\Q]$.
We'll first attempt a direct attack on the degree of $K / \Q$ using some arithmetic facts about the degree of a composite extension. This won't quite work out directly, so we'll need to route around the obstruction using some knowledge of cyclotomic extensions.

### The Degree of a Composite Extension
We can immediately identify the splitting field of $\p$, it's the smallest extension of $\Q$ containing the splitting fields of both $\pfour$ and $\pfive$: 

$$K = \Qall$$

With more jargon: $K$ is the **composite extension** of $\Qfour$ and $\Qfive$. There's a useful formula for the degree of a composite extension:

{% capture composite-degree%}
If $K / F$ and $L / F$ are finite extensions, with at least one Galois, then:

$$ [KL:F] = \frac{[K:F][L:F]}{[K \cap L:F]}$$
{% endcapture %}
{% include proposition.html content=composite-degree name="The Degree of a Composite Extension" %}

A proof of this proposition, and the sister proposition used later that characterizes the Galois groups of such extensions, is in [Galois Correspondence Theorems](https://kconrad.math.uconn.edu/blurbs/galoistheory/galoiscorrthms.pdf).

In our case, this reads:

$$ [\Qall:\Q] = \frac{[\Qfour:\Q][\Qfive:\Q]}{[\Qfour \cap \Qfive:\Q]} = \frac{160}{[\Qfour \cap \Qfive:\Q]} $$

So for this to work out, we need to determine the degree of the intersection:

$$I \defeq \Qfour \cap \Qfive$$

This degree divides both $[\Qfour:\Q] = 8$ and $[\Qfive:\Q] = 20$, so the possibilities are 1, 2, and 4. We can rule out $[I:\Q] = 1$ by finding any irrational number in the intersection.

{% capture square-root-of-five %}
$$\sqrt{5} \in \Qfour \cap \Qfive$$
{% endcapture %}
{% include lemma.html content=square-root-of-five name="Square Root of Five" %}

{% capture square-root-of-five-proof %}
It's clear that $\sqrt{5} = \fourthroot^2 \in \Qfour$, so the only interesting bit is to locate $\sqrt{5}$ within $\Qfive$. In fact, $\sqrt{5} \in \Q(\roufive)$, $\fifthroot$ doesn't have anything to do with this business.

We're looking for a real number in $\Q(\roufive)$ so considering $\roufive + \bar \roufive = \roufive + \roufive^{-1}$, which is invariant under conjugation and thus real, seems like a reasonable strategy. Recall that $\roufive$ satisfies the cyclotomic polynomial $\phi_4(x) = x^4 + x^3 + x^2 + x + 1$, we can modify this into a polynomial satisfied by $t = \roufive + \roufive^{-1}$. 

Since all the roots of $\phi_4(x)$ are non-zero:

$$x^4 + x^3 + x^2 + x + 1 = 0 \iff x^2 + x + 1 + \frac{1}{x} + \frac{1}{x^2} $$

Now we can group together the reciprocal powers:

$$
\begin{align}
x^2 + x + 1 + \frac{1}{x} + \frac{1}{x^2} &= \left( x + \frac{1}{x} \right)^2 + \left( x + \frac{1}{x} \right) - 1 \\[1.25ex]
&= t^2 + t - 1
\end{align}
$$

This polynomial in $t$ has the roots:

$$t_1, t_2 = \frac{-1 \pm \sqrt{5}}{2} $$

So:

$$ \pm \sqrt{5} = 2t + 1 \in \Q(\roufive) \subset \Qfive $$

{% endcapture %}
{% include proof.html content=square-root-of-five-proof %}

So:

$$[I:\Q] \in \{2, 4\}$$ 

We don't know this yet, but in fact, $I = \Q(\sqrt{5})$, so there's nothing more interesting to find in $I$. A direct proof of this fact is elusive, so we'll need to deduce it from a more circuitous path.

### The 20'th Root of Unity
We now make a critical observation: since $\operatorname{lcm}(5, 4) = 20$, the product $i \roufive$ is a  primitive 20'th root of unity. This means that $\Qtwenty \subseteq K$, in fact:

$$K = \Qalltwenty $$

So we can maybe make use of some cyclotomic theory. 

We recall the important:

{% capture cyclotomic-galois-groups %}
Let $\zeta_n$ be a primitive n'th root of unity. The mapping:

$$\left( \Z / n \Z \right)^{\times} \rightarrow Gal(\Q(\zeta_n)/\Q)$$

defined as $k \mapsto (\zeta_n \mapsto \zeta_n^k)$ (the right hand side defines a unique automorphism) is an isomoprhism.
{% endcapture %}
{% include theorem.html content=cyclotomic-galois-groups name="Galois Groups of Cyclotomic Extensions" %}

We're interested in $\Qtwenty$:

$$Gal(\Qtwenty / \Q) \cong \left( \Z / 20\Z \right)^{\times} \cong \Z / 4 \Z \times \Z / 2 \Z$$

The second isomorphism here is from direct computation using the classification of finite abelian groups, we can easily sort out the orders of the overall group and its elements. The order of the group is $\phi(20) = 8$. There are no elements of order eight, and it's easy to find some elements of order 4, this is enough to lock down its isomorphism class. 

We won't need to know so much about this Galois group, but it is very important that **it is abelian**. This means that all its subgroups are normal, and according to the Galois correspondence, all subfields of $\Qtwenty$ are normal extensions of $\Q$.

**Let's lay some cards and the table and outline our plan**. We want to compute 

$$[\Qalltwenty:\Qtwenty] = ?$$

Ajoining the $\fifthroot$ will pose no trouble, so the interesting bit is the degree $$[\Qtwentyfour:\Qtwenty]$$. 

We already know that $\sqrt{5} \in \Qtwenty$, so we can factor over $\Qtwenty$:

$$ x^4 - 5 = (x^2 + \sqrt{5})(x^2 - \sqrt{5}) $$

The minimal polynomial of $\fourthroot$ over $\Qtwenty$ divides $x^2 - \sqrt{5}$, so the degree of the extension $\Qtwentyfour / \Qtwenty$ is either one or two. We want to rule out the first case, which happens only if $\fourthroot \in \Qtwenty$, so we aim to show this is not so.

Well, suppose **it is so**. Then $\Q(\fourthroot) \subset \Qtwenty$, and, as we observed, this is a *normal* subextension of $\Q$. This means that *all* the roots of the minimal polynomial $x^4 - 5$ of $\fourthroot$ over $\Q$ lie in $\Q(\fourthroot)$. Now  $i \fourthroot$ is another root of $x^4 - 5$, and thus the ratio $i$ of the two roots is in $\Q(\fourthroot)$ as well. But this is clearly not so, because $\Q(\fourthroot)$ consists entirely of real numbers! Thus $\Q(\fourthroot)$ is *not* a normal extension, a contradiction that rejects the assertion $\fourthroot \in \Qtwenty$.

We have shown:

{% capture no-fourth-root %}
$$[\Qtwentyfour:\Qtwenty] = 2$$
{% endcapture %}
{% include result.html content=no-fourth-root %}

Excellent.

### Wrapping Up the Degree Computation
Let's summarize what we know. We've shown that both:

$$[\Qtwenty:\Q] = 8$$

and

$$[\Qtwentyfour:\Qtwenty] = 2$$

The final piece of the tower is $[K:\Qtwentyfour]$:

$$[K:\Q] = [K:\Qtwentyfour] \cdot 2 \cdot 8$$

The next bit is standard: the minimal polynomial of $\fifthroot$ over $\Q$ is $x^5 - 7$, which is degree five, relatively prime to everything in sight. The degree $[K:\Qtwentyfour]$ is **at most** 5 (since the minimal polynomial may factor over $\Qtwentyfour$).  On the other hand:

$$[K:\Q] = [K:\Q(\fifthroot)] [\Q(\fifthroot):\Q] = 5 [K:\Q(\fifthroot)]$$

so $$[K:\Q]$$ is divisible by five. The only place for this factor of five to appear is in $[K:\Qtwentyfour]$, and we conclude that:

$$[K:\Qtwentyfour] = 5$$

and so:

{% capture the-degree-is-eighty %}
$$[K:\Q] = 5 \cdot 2 \cdot 8 = 80$$
{% endcapture %}
{% include result.html content=the-degree-is-eighty %}

Let's check with PARI:

```pari
? K = polcompositum(K1, K2)[1];
? K
x^80 + 700*x^76 + 376750*x^72 + 122500*x^70 + 95130000*x^68 - 2979812500*x^66 + 801539465625*x^64 - 41334562500000*x^62 + 694191368806250*x^60 + 24292867276562500*x^58 - 1706422058500781250*x^56 + 47410076486609375000*x^54 - 561280887291911718750*x^52 - 5925051209411851562500*x^50 + 425738647346641890625000*x^48 - 10790892168628955468750000*x^46 + 183554573392784643847656250*x^44 - 2528010683248970014648437500*x^42 + 35972053699210446367470703125*x^40 - 768232793228539696401367187500*x^38 + 17153193885189412931541992187500*x^36 - 281775242580953170523974609375000*x^34 + 3907526182486440822706536865234375*x^32 - 52533236808938827424323339843750000*x^30 + 591352356366436736840804577636718750*x^28 - 4993722921805202339864712524414062500*x^26 + 35823431176257807213779829345703125000*x^24 - 255887448170399691060807519531250000000*x^22 + 1613583093853447936679328622680664062500*x^20 - 8107215087346077123489843444824218750000*x^18 + 37687261253933487304379112288665771484375*x^16 - 168768187761658568807417415466308593750000*x^14 + 599077440553741527979187232505798339843750*x^12 - 1503372877256505452119239327850341796875000*x^10 + 2484344289732659850787588464870452880859375*x^8 - 1891941353139473713527982845306396484375000*x^6 - 966628620840780845350436599540710449218750*x^4 + 1602009581825354991088548536300659179687500*x^2 + 967942349979812958711005584812164306640625
? poldegree(K)
80
```

That's some minimal polynomial! Anyway, looks like we got it right.


## The Galois Group of $K / \Q$
With the degree $[K:\Q] = 80$ determined, let's turn to the Galois group $Gal(K / \Q)$. The same sorts of difficulties that prevented a direct calculation of the degree will be troublesome here, but let's give it a try anyway and see what we run into.

### The Galois Group of a Composite Extension
Just as there is a formula for the degree of a composite extension, there is a description of the Galois group:

{% capture composite-galois-group%}
If $A / F$ and $B / F$ are Galois extensions, then the restriction mapping:

$$ Gal(AB / F) \rightarrow Gal(A / F) \times Gal(B / F) $$

$$ \sigma \mapsto \left(\sigma \mid_K, \sigma \mid_L \right) $$

is an embedding whose image is the subgroup of the product consisting of compatible pairs of automorphisms:

$$ (\alpha, \beta): x \in A \cap B \implies \alpha(x) = \beta(x) $$
{% endcapture %}
{% include proposition.html content=composite-galois-group name="The Galois Group of a Composite Extension" %}

We want to apply this proposition in the case where, in the notation of the theorem:

$$
\begin{align*} 
    A &= \Qfour \\
    B &= \Qfive \\
    AB &= K = \Qalltwenty \\
    F &= \Q
\end{align*}
$$

To do so, we need to identify $A \cap B = \Qfour \cap \Qfive$. Recall that we made some progress on this question earlier: we were left with the knowledge that $\sqrt{5} \in A \cap B$, but diverted without managing to prove there was nothing else of interest in there. Now we're ready to do that.

We have the earlier formula relating degrees:

$$ [K:\Q] = \frac{160}{[A \cap B:\Q]} $$

Well, now we know that $[K:\Q] = 80$, so $[A \cap B:\Q] = 2$, and we have the immediate result:

{% capture intersection-identity %}
$$\Qfour \cap \Qfive = \Q(\sqrt{5})$$
{% endcapture %}
{% include result.html content=intersection-identity %}

Earlier, we deduced presentations of the Galois groups:

$$ Gal(A / \Q) = \left< \alpha, \beta: \alpha^4 = \beta^2 = \identity, \beta \alpha \beta = \alpha^3 \right> \cong D_8$$

$$ Gal(B / \Q) = \left< a, b: a^5 = b^4 = \identity, b a b^{-1} = a^2 \right> \cong GA(1, 5) $$

and also gave explicit definitions of the generating automorphisms in terms of their actions on the roots of $\pfour$ and $\pfive$ respectively. 

To make good use of the proposition, we need to determine which pairs of automorphisms have compatible restrictions to $A \cap B = \Q(\sqrt{5})$. This is a simple enough condition, a pair of automorphisms are compatible if and only if they map $\sqrt{5}$ to the same image, so let's investigate our automorphisms action on $\sqrt{5}$.

### The Actions on $\sqrt{5}$
Any automorphism in $Gal(A / \Q)$ or $Gal(B / \Q)$ must map $\sqrt{5}$ to one of its two conjugates $\pm \sqrt{5}$.

The action of $Gal(A / \Q)$ is pretty straightforward:

$$ \alpha(\sqrt{5}) = \alpha(\fourthroot^2) = \alpha(\fourthroot)^2 = (i \fourthroot)^2 = - \sqrt{5} $$

$$ \beta(\sqrt{5}) = \beta(\fourthroot^2) = \beta(\fourthroot)^2 = \fourthroot^2 = \sqrt{5} $$

So we get the action:

{% capture galois-action-of-A-on-root-five %}
The action of $Gal(A / \Q) \cong D_8$ on $\Q(\sqrt{5})$ is given by:

$$\beta \alpha^k (\sqrt{5}) = (-1)^k \sqrt{5} $$

In particular, the subgroup $Gal(A / \Q(\sqrt{5}))$ fixing $\Q(\sqrt{5})$ is:

$$A^{\sqrt{5}} \defeq \left<\alpha^2, \beta \right> \cong \Zmodtwo \times \Zmodtwo$$
{% endcapture %}
{% include result.html content=galois-action-of-A-on-root-five %}

To sort out the action of $Gal(B / \Q)$ we recall our algebraic relation from earlier: 

$$\sqrt{5} = 2(\roufive + \roufive^{-1}) + 1 = 2(\roufive + \roufive^4) + 1$$

It's immediate that $a(\sqrt{5}) = \sqrt{5}$, since $a$ fixes $\roufive$.

We know that $\roufive$ satisfies the minimal polynomial $x^4 + x^3 + x^2 + x + 1$. With this front of mind, we can calculate the action of $b$:

$$
\begin{align*}
b(\sqrt{5}) &= 2(b(\roufive) + b(\roufive)^4) + 1 \\
&= 2(\roufive^2 + \roufive^8) + 1 \\
&= 2(\roufive^2 + \roufive^3) + 1 \\
&= -2(\roufive^4 + \roufive + 1) + 1 \\
&= -2(\roufive^4 + \roufive) - 1 \\
&= -\sqrt{5}
\end{align*}
$$

Which we summarize as:

{% capture galois-action-of-B-on-root-five %}
The action of $Gal(B / \Q) \cong GA(1, 5)$ on $\Q(\sqrt{5})$ is given by:

$$b^l a^k (\sqrt{5}) = (-1)^l \sqrt{5} $$

In particular, the subgroup $Gal(B / \Q(\sqrt{5}))$ fixing $\Q(\sqrt{5})$ is:

$$B^{\sqrt{5}} \defeq \left<a, b^2 \right> \cong D_{10}$$
{% endcapture %}
{% include result.html content=galois-action-of-B-on-root-five %}

The final isomorphism $B^{\sqrt{5}} \cong D_{10}$ follows from a short computation with generators and the relation $ab = ba^2$:

$$b^2 a b^2 = b^3 a^2 b = b^4 a^4 = a^4 $$

Showing that the generators satisfy the defining relations of $D_{10}$.


### The Isomorphism Class of $G$, First Attempt
We've everything in place now to use our proposition describing the Galois groups of composite extensions to identify $Gal(K / \Q)$. 

Let's summarize what we've accomplished:

{% capture galois-group-of-K %}
The Galois group $G = Gal(K / \Q)$ consists of (the unique extension to $K / \Q$ of) those pairs of automorphisms in $Gal(A / \Q) \times Gal(B / \Q)$ that either:

- Both fix $\Q(\sqrt{5})$, these elements form a subgroup we'll call $G^{\sqrt{5}} = A^{\sqrt{5}} \times B^{\sqrt{5}}$.
- Both map $\sqrt{5} \mapsto -\sqrt{5}$, these elements *do not* form a subgroup, we'll call the *(co)set* $G^{-\sqrt{5}}$.

In particular, $G^{\sqrt{5}}$ is an index two subgroup of $Gal(K / \Q)$ with isomorphism class:

$$G^{\sqrt{5}} \cong \Zmodtwo \times \Zmodtwo \times D_{10}$$
{% endcapture %}
{% include result.html content=galois-group-of-K %}

An index two subgroup such as $G^{\sqrt{5}}$ is always normal, this is a standard textbook exercise. This provides our first short exact sequence for $G$:

$$ 0 \rightarrow G^{\sqrt{5}} \rightarrow G \rightarrow \Zmodtwo \rightarrow 0 $$

It would be very nice if this sequence split! That is, if the normal subgroup $G^{\sqrt{5}}$ was *[complemented](https://en.wikipedia.org/wiki/Complement_(group_theory))* by a subgroup $H$ with:

$$G = G^{\sqrt{5}} H \text{ and } G^{\sqrt{5}} \cap H = \identity $$

In this case, since $G^{\sqrt{5}} \triangleleft G$[^normal-notation], we would have found a semi-direct product structure for $G$:

$$ G \stackrel{?}{\cong} G^{\sqrt{5}} \rtimes \Zmodtwo $$

Which would be a satisfying identification of the isomorphism class of $G$. 

Unfortunately, this is not so... 

{% capture not-complemented %}
$G^{\sqrt{5}}$ is not complemented in $G$.
{% endcapture %}
{% include lemma.html content=not-complemented name="$G^{\sqrt{5}}$ is not Complemented" %}

{% capture not-complemented-proof %}
A complementary subgroup $H$ has order two, hence consists of an involution in the coset $G^{-\sqrt{5}}$ along with the identity element. We've represented $G$ as a subgroup of:

$$ Gal(A / \Q) \times Gal(B / \Q) \cong D_8 \times GA(1, 5) $$

and so our hypothetical involution, when viewed as an element $D_8 \times GA(1, 5)$, consists of a pair of involutions, one from each factor group. 

We are looking for a complement to the subgroup:

$$ G^{\sqrt{5}} = A^{\sqrt{5}} \times B^{\sqrt{5}} \cong \Zmodtwo \times \Zmodtwo \times D_{10} $$

Where $\Zmodtwo \times \Zmodtwo < D_8$ and $D_{10} < GA(1, 5)$. The trouble is that **we've already accounted for all the involutions in $GA(1, 5)$**, so there are no more to go around. We can just count! [According to the data](https://groupprops.subwiki.org/wiki/General_affine_group:GA(1,5)) there are five involutions in $GA(1, 5)$, and there are five in $D_{10}$ as well. So there's no possibility to find a involution in $G^{-\sqrt{5}}$, and so no complementary subgroup.
{% endcapture %}
{% include proof.html content=not-complemented-proof %}

Well, bummer. That didn't quite work out...

### The Isomorphism Class of $G$, Final Ascent
We would still like to say something more concrete about the isomorphism class of $G$. This is a group of order eighty. The [Group Names database](https://people.maths.bris.ac.uk/~matyd/GroupNames/index120.html#order80)[^dihedral-notation] lists all groups of order eighty, and it would be nice if we could at least identify which one we've got.

Let's start from our exact sequence, which is, up to isomorphism:

$$ 0 \rightarrow \Zmodtwo \times \Zmodtwo \times D_{10} \rightarrow G \rightarrow \Zmodtwo \rightarrow 0$$

Blessedly, the database [also has information on this short exact sequence](https://people.maths.bris.ac.uk/~matyd/GroupNames/73/e14/C2byC2%5E2xD5.html#d2). There are eight isomorphism classes which fit into such a short exact sequence. We've already ruled out four, the direct and semi-direct products. This leaves the four non-split extensions as possibilities.

Thanks to the Galois correspondence, we know quite a bit about the structure of $G$. Every splitting field we've found has its own Galois group, and this group is a quotient group of $G$:

- $\Qtwenty$ has Galois group $\Z / 4\Z \times \Z / 2 \Z$.
- $\Qfour$ has Galois group $D_8$.
- $\Qfive$ has Galois group $GL(1, 5)$.

The database lists the possible quotients of each group, so we can search our list for any of the four possibilities that has these quotients. This time, we have some good luck, [there is only one](https://people.maths.bris.ac.uk/~matyd/GroupNames/73/C2%5E2sF5.html). We've identified our group as:

{% capture isomorphism-class-of-G %}
$$ G \cong (\Z / 2\Z \times \Z / 2 \Z) \rtimes GA(1, 5) $$
{% endcapture %}
{% include result.html content=isomorphism-class-of-G %}

For a final time, we cross our finger and hope PARI validates our work.

```pari
? G = galoisinit(K);           
? galoisidentify(G)            
[80, 34]
```

The groups database also lists the GAP ID's of all our groups. We're happy to see that, yes, group $34$ is exactly the semidirect product $G \cong (\Z / 2\Z \times \Z / 2 \Z) \rtimes GA(1, 5)$.


### Identifying the Complementary Subgroups
Wiser folk would stop here, but this is for recreation and there's more treasure to find. The semi-direct product structure informs us that $G$ contains two subgroups:

- A **normal** copy of $\Z / 2\Z \times \Z / 2 \Z$.
- A **complementary** copy of $GA(1, 5)$.

We should be able to find these inside $G$. Let's try.

The Galois correspondence will continue to guide us. A normal subgroup within the Galois group corresponds to a normal subextension, that is, a **splitting field**. We're looking for a splitting field with **index** four, and we actually already know one of those, its $B = \Qfive$[^has-to-be-it]! 

So we'd like to show that:

{% capture galois-k-over-b %}
$$Gal(K / B) \cong \Z / 2\Z \times \Z / 2 \Z$$
{% endcapture %}
{% include lemma.html content=galois-k-over-b name="Galois Group of $K / B$" %}

{% capture galois-k-over-b-proof %}
This is not so hard, so we'll keep it terse. 

We know $K = B(i, \fourthroot)$. Both of these adjoined elements have degree two over $B$, and in fact $i$ has degree two over $B(\fourthroot)$ as well. For otherwise, $i \in B(\fourthroot)$, but this would mean $i \roufive = \routwenty \in B(\fourthroot)$ as well. This would force $B(\fourthroot) = K$, which is not so because $[K:B] = 4$. 

We conclude that $K / B$ has at least two intermediate degree two subfields, $B(\fourthroot)$ and $B(i)$, so $Gal(K / B)$ has at least two order two subgroups, so $Gal(K / B)$ is not cyclic. Since it has order four, $Gal(K / B) \cong \Z / 2\Z \times \Z / 2 \Z$, the only non-cyclic group of order four.
{% endcapture %}
{% include proof.html content=galois-k-over-b-proof %}

It is more difficult to identify the complementary subgroup. We're looking for a **non-normal** subextension of index twenty, so a non-normal degree four extension of $\Q$. We've encountered a couple of these already: $\Q(\fourthroot)$ and $\Q(i \fourthroot)$, but these do not provide the complement we're after (trust us). The subextension we're after takes some looking for, and I'm not sure how to find it without some guessing and good luck, but it's:

$$ C = \Q \left( (1 + i) \fourthroot \right) $$

Some algebra shows that $\xi = (1 + i) \fourthroot$ satisfies the polynomial $x^4 + 20$. This is irreducible as its 5-Eisenstein, and so $[C:\Q] = 4$ and $[K:C] = 20$.

Let's show that:

{% capture trivial-intersection %}
$$ Gal(K / B) \cap Gal(K / C) = \identity $$
{% endcapture %}
{% include lemma.html content=trivial-intersection name="Galois Group Complements" %}

{% capture trivial-intersection-proof %}
Let $\varphi \in Gal(K / B)$. 

Any automorphism of $K / \Q$ is determined by its action on the roots of $\p$. We've constrained ours to fix the roots of $\pfive$, so $\varphi$ is determined by how it moves the roots of $\pfour$. Because of our old friend, $\sqrt{5} \in B$, not every permutation is possible. For example:

$$\varphi(\fourthroot)^2 = \varphi(\fourthroot^2) = \varphi(\sqrt{5}) = \sqrt{5} = \fourthroot^2$$

So: $\varphi(\fourthroot) = \pm \fourthroot$. Similarly:

$$\varphi(i \fourthroot)^2 = \varphi(- \fourthroot^2) = - \varphi(\sqrt{5}) = - \sqrt{5} = ( i \fourthroot)^2$$

So: $\varphi(i \fourthroot) = \pm i \fourthroot$.

We've got four possibilities for the action of $\varphi$ on the roots of $\pfour$, let's now see how each of the non-identity possibilities affects $\xi = (1 + i) \fourthroot$.

- **Case** $\fourthroot \mapsto - \fourthroot$, and $i \fourthroot \mapsto i \fourthroot$.

$$ (1 + i) \fourthroot \mapsto (- 1 + i) \fourthroot \neq \xi$$

- **Case** $\fourthroot \mapsto \fourthroot$, and $i \fourthroot \mapsto - i \fourthroot$.

$$ (1 + i) \fourthroot \mapsto (1 - i) \fourthroot \neq \xi$$

- **Case** $\fourthroot \mapsto - \fourthroot$, and $i \fourthroot \mapsto - i \fourthroot$.

$$ (1 + i) \fourthroot \mapsto - (1 + i) \fourthroot \neq \xi$$

So all possible automorphisms $\varphi$ move $\xi$ **except** the identity automorphism. It follows that:

$$ \varphi \in Gal(K / C) \implies \varphi = \identity $$

Or, said differently:

$$ Gal(K / B) \cap Gal(K / C) = \identity $$

Which was our objective.
{% endcapture %}
{% include proof.html content=trivial-intersection-proof name="Galois Group Complements" %}

The rest is now easy. We can quickly show that $Gal(K / B)$ and $Gal(K / C)$ are complementary subgroups by just counting orders:

$$ \left| Gal(K / B) Gal(K / C) \right| = \frac{\left| Gal(K / B) \right| \left| Gal(K / C) \right|}{\left| Gal(K / B) \cap Gal(K / C) \right|} = 4 \cdot 20 = 80 $$

So:

$$Gal(K / B) Gal(K / C) = G$$

We deduce immediately that:

$$G \cong Gal(K / B) \rtimes Gal(K / C)$$

And the isomorphism class of $Gal(K / C)$ follows:

$$ 
\begin{align*}
Gal(K / C) &\cong G / Gal(K / B) \\
&= Gal(K / \Q) / Gal(K / B) \\
&\cong Gal(B / \Q) \\
&\cong GA(1, 5) 
\end{align*}
$$

Which gives us, finally, an **internal** semi-directo product structure like:

$$G \cong (\Zmodtwo \times \Zmodtwo) \rtimes GA(1, 5)$$

Which was our very final goal.


[^as-in-freedom]: Free as in **Free**dom.
[^pentagons]: This is related to the constructability of a regular pentagon ⬠. We'll show that $\cos \left( \frac{2 \pi}{5} \right) = \frac{-1 + \sqrt{5}}{4}$.
[^real-subfields]: A **real subfield** is definitionally fixed by complex conjugation. Adjoining a real number to $\Q$ always produces a real subfield, since a vector space basis of the extension over $\Q$ consists of powers of the adjoined element, which are all real numbers.
[^alternative-eight]: Alternatively, we can count possibilities for where these two roots map. There are four possibilities for the image of $\fourthroot$ and two for $i$, so eight total, and we know the extension is Galois of degree eight, so every possibility must be achieved. We'll use this argument in the next section.
[^root-of-unity]: The notation $\zeta_k$ denotes "the" k'th primitive root of unity. I.e., $\zeta_5, \zeta_5^2, \zeta_5^3, \zeta_5^4 \neq 1$, while $\zeta_5^5 = 1$. We'll only used algebraic properties of these numbers, so their non-uniqueness will not be trouble.
[^minimial-polynomial]: This is the minimal polynomial of $\roufive$ by a standard argument.
[^normal-notation]: $H \leq G$ means $H$ is a subgroup of $G$, and $H \triangleleft G$ means $H$ is a *normal* subgroup of $G$.
[^dihedral-notation]: While we subscript our dihedral groups with their order (so $D_{10}$ has ten elements), the Group Names database subscripts with half this (so their $D_{10}$ are the rigid symmetries of a regular pentagon). Additionally, the group we have named $GA(1, 5)$ is called $\mathbb{F}_5$ in the database.
[^has-to-be-it]: And this *has to be it*, since [there's only one normal subgroup of order four](https://people.maths.bris.ac.uk/~matyd/GroupNames/73/C2%5E2sF5.html).
[^more-sqrt-five]: Here we make even more use of $\sqrt{5} \in B$.
