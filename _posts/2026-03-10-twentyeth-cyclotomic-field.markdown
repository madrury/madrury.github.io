---
layout: post
title:  "The Subfield Lattice of $ℚ(ζ_{20})$"
date:   2026-03-21
# Unfinished, and not planned for publication; kept for the work in it.
published: false
categories: mathematics
---

<div style="display:none">
$$
\newcommand{\identity}{\mathbb{1}}
\newcommand{\defeq}{\mathrel{\mathop:}=}
\newcommand{\zetafive}{\zeta_5}
\newcommand{\zetatwenty}{\zeta_{20}}
\newcommand{\Qtwenty}{ \mathbb{Q}(\zeta_{20}) }
$$
</div>

This article is a b-side to my essay on [the Galois Group of $(x^5 - 7)(x^4 - 5)$](...).

There, we made use of the Cyclotomic structure of the field $\Qtwenty$, computing the degree of the extension $\Qtwenty / \Q$ and the Galois group $Gal(\Qtwenty / \Q)$:

{% capture cyclotomic-galois-groups %}
Let $\zetatwenty$ be a primitive 20'th root of unity. The mapping:

$$\left( \Z / 20 \Z \right)^{\times} \rightarrow Gal(\Q(\zetatwenty)/\Q)$$

defined by $k \mapsto (\zetatwenty \mapsto \zetatwenty^k)$ is an isomoprhism.
{% endcapture %}
{% include theorem.html content=cyclotomic-galois-groups name="Galois Groups of Cyclotomic Extensions" %}

In fact, knowing the lattice of subgroups of $\Z / 4 \Z \oplus \Z / 2 \Z$ will be of some use to us:

In fact, knowing the lattice of subgroups of $\Z / 4 \Z \oplus \Z / 2 \Z$ will be of some use to us:

![Lattice of Subgroups]({{ site.url }}/img/subfield-lattice-a6cafcab5577122da6d082eebd1c97bf.svg){: .center-img}

We've maybe flipped the lattice upside down depending on the reader's taste, this way makes it a bit easier to reason about the corresponding fixed fields under the Galios correspondence, which we will do shortly.

**Let's lay some cards and the table and outline a plan**. We want to show that:

$$[\Qtwentyfour:\Qtwenty] = 2$$ 

We already know that $\sqrt{5} \in \Qtwenty$, so we can factor over $\Qtwenty$:

$$ x^4 - 5 = (x^2 + \sqrt{5})(x^2 - \sqrt{5}) $$

The minimial polynomial of $\fourthroot$ over $\Qtwenty$ divides $x^2 - \sqrt{5}$, so the degree of the extension $\Qtwentyfour / \Qtwenty$ is either one or two. We need to rule out the first case, which happens only if $\fourthroot \in \Qtwenty$, so we aim to show this is not so. To accomplish this, we'll need to study the subfield lattice of $\Qtwenty$.

### Degree Four Subfields of $\Qtwenty$
If it was the case that $$ \fourthroot \in \Qtwenty $$, then $\Q(\fourthroot)$ would be a degree four real [^real-subfields] subfield of $$ \Qtwenty $$. We aim to classify these.


{% capture only-one-real-subfield %}
There is exactly one real subfield $R$ of $\Qtwenty$ with $[R:\Q] = 4$.
{% endcapture %}
{% include lemma.html content=only-one-real-subfield name="Only One Real Subfield" %}

{% capture only-one-real-subfield-proof %}
Complex conjugation is an involution of the extention $\Qtwenty / \Q$ with a real fixed field $R$, and index $[\Qtwenty:R] = 2$ (by the Galios correspondence, subgroup orders correspond to the index of the fixed field). Since $\Qtwenty$ is a degree eight extension, $R$ is degree 4.

Now let's return to our sugroup lattice of $Gal(\Qtwenty / \Q)$, there are three order $2$ subgroups, and we've found one Galios corresponding subfield. We can present two more:

- $\Q(\roufive)$ is a degree 4, non-real, subfield, as we have previously observed. 
- $\Q(i, \sqrt{5})$ is degree 4, non-real subfield.

The second of these is degree four because:

$$ [\Q(i, \sqrt{5}):\Q] = [\Q(i, \sqrt{5}):\Q(\sqrt{5})] [\Q(\sqrt{5}):\Q] = 2 [\Q(i, \sqrt{5}):\Q(\sqrt{5})]$$

and $[\Q(i, \sqrt{5}):\Q(\sqrt{5})] \neq 1$ because $i \notin \Q(\sqrt{5})$. 

These two subfields are different, because otherwise $i \in \Q(\roufive)$, putting $i \roufive = \routwenty \in \Q(\roufive)$, which would force $\Q(\routwenty) = \Q(\roufive)$. But we've already seen these are extensions of degree $8$ and $4$, respectively.

This enumerates *all* degree four subfields, of which only one is real.
{% endcapture %}
{% include proof.html content=only-one-real-subfield-proof%}

Taking this a step further, we identify a primitive element for $R$:

{% capture identitfy-the-real-subfield %}
$$R = \Q \left( \sqrt{\frac{5 + \sqrt{5}}{2}} \right)$$
{% endcapture %}
{% include lemma.html content=identitfy-the-real-subfield name="Identitify the Real Subfield" %}


{% capture identitfy-the-real-subfield-proof %}
We'll first need the minimal polynomial of $\routwenty$. We could [look this up](https://en.wikipedia.org/wiki/Cyclotomic_polynomial), but there's a neat way to deduce it from what we already know.

- $\roufive$ satisfies $x^4 + x^3 + x^2 + x + 1$.
- $\zeta_{10} = - \roufive$ satisfies $x^4 - x^3 + x^2 - x + 1$.
- $\routwenty$ satisfies $x^8 - x^6 + x^4 - x^2 + 1$

Of course, there's no guarentee the polynomial we obtain here is *irreducible*, but we luck out: since we know the extension $\Qtwenty / \Q$ is degree eight, this is indeed the minimal polynomial of $\routwenty$.

Now we'll follow a strategy familiar from earlier: determine a polynomial satisfied by the real number $\routwenty + \bar \routwenty$ by rewriting the minimial polynomial of $\routwenty$ in terms of a new variable $t = x + \frac{1}{x}$. Witht he same sort of manipulations we used before:

$$x^8 - x^6 + x^4 - x^2 + 1 = 0 \iff x^4 - x^2 + 1 - \frac{1}{x^2} + \frac{1}{x^4} = 0$$

and:

$$x^4 - x^2 + 1 - \frac{1}{x^2} + \frac{1}{x^4} = t^4 - 5t^2 + 5$$

We have a quadratic polynomial is $t^2$, and it's 5-eisenstein (★lucky★) so irreducible. Its roots are:

$$t^2 = \frac{5 \pm \sqrt{5}}{2} = \implies t = \pm \sqrt{\frac{5 \pm \sqrt{5}}{2}}$$

We deduce that $$R = \Q \left( \sqrt{\frac{5 + \sqrt{5}}{2}} \right)/ \Q$$ is a degree 4 real extension. It's also a *normal* extension, since $Gal(\Qtwenty / \Q)$ is abelian, so *all* the roots are in $R$. By construction, $\routwenty + \bar \routwenty$ satisfies the same minimal polynomial as $t$, so it must be equal to one of these roots, and we conclude that:

$$R = \Q(\routwenty + \bar \routwenty) $$

In particular, $R$ is a subfield of $\Qtwenty$.
{% endcapture %}
{% include proof.html content=identitfy-the-real-subfield-proof %}


{% capture no-fourth-root %}
$$\fourthroot \notin \Qtwenty$$
{% endcapture %}
{% include result.html content=no-fourth-root %}


[^alternative-eight]: Alternatively, we can count possibilities for where these two roots map. There are four possibilities for the image of $\fourthroot$ and two for $i$, so eight total, and every possibility must be achieved. We'll use this argument in the next section.
[^root-of-unity]: The notation $\zeta_k$ denotes "the" k'th primitive root of unity. I.e., $\zeta_5, \zeta_5^2, \zeta_5^3, \zeta_5^4 \neq 1$, while $\zeta_5^5 = 1$.
[^minimial-polynomial]: This is the minimal polynomial of $\roufive$.
[^real-subfields]: A **real subfield** is definitionally fixed by complex conjugation.