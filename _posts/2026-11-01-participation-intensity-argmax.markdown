---
layout: post
title:  "Confidence Intervals for Maximizing Expected Revenue"
abstract: 'We develop a confidence interval for a common estimate of a revenue maximizing price.'
date: 2026-11-01
categories: statistics
---

<link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital@0;1&display=swap">

<div style="display:none">
$$
\newcommand{\identity}{\mathbb{1}}
\newcommand{\defeq}{\mathrel{\mathop:}=}
\newcommand{\P}{\operatorname{P}}
\newcommand{\E}{\operatorname{E}}
$$
</div>

It's almost definitional: firms are interested in maximizing their revenue. When pricing a product, it is a baseline strategy to set a price that maximizes expected revenue. Mature organizations often employ analysts or data scientists who's sole role is to solve this estimation problem: what is this revenue maximizing price?

In this essay, we study a basic statistical approach to this problem, which we call the **participation-intensity model**. This is useful when we have collected data that observes customers at various prices, either purchasing the product (participating) or not, and noting the collected revenue when they do (intensity). We derive a closed form expression for the revenue-maximizing price estimate, and then use this expression to develop a confidence interval for the revenue-maximizing price. We finish by explaining some curious properties of this interval.

The participation-intensity terminology we use here is drawn from [labor economics literature](https://economics.stackexchange.com/questions/2941/what-is-the-difference-between-intensive-margin-and-extensive-margin-in-labor-ec). In that field, the **extensive margin** refers to labor force participation, and the **intensive margin** refers to the amount of labor given participation. It's common to refer to the type of models discussed here as **two-part models**, coined in the 1983 RAND study of health care expenditure from [Duan, Manning, Morris & Newhouse](https://www.rand.org/pubs/reports/R2754.html):

> The two-part model is an attempt to correct the problem with nonspenders in the one-part model by separating behavior into two stages, first a decision to have positive expenses, and then a decision about the level of expenses, *conditional* on its being positive.
{: .typewriter}

This name somewhat stuck, but it lacks the sense when found in the wild, and anyway, it strikes me as flavorless. Actuaries call a very similar thing **frequency-severity** models. In any case, <span>comrades</span>{: .comrades} may forgive me for stretching terminology.

The closed form expression we derive is not novel, it appears, for example, in REFERENCE, though the analysis here is our own original work. The confidence interval analysis, to our knowledge, does not appear elsewhere in literature.

## Participation and Intensity

Imagine a potential customer considering whether to purchase some product for an offered price $$X = x$$. The price $$X$$ may be random or deterministic, but it will always enter out analysis conditionally, so the we won't dwell on the distinction.

As the firm attempting to sell the product, we are interested in measuring two things:

  - Does the customer purchase the product, do they *participate* in the transaction? We model this as the binary random variable $T$?
  - Given that the customer purchases the product, what is the revenue we obtain $$Y$$?

In case the customer does *not* purchase, we define the revenue $$Y$$ to be zero deterministically:

$$ T = 0 \implies Y = 0 $$

Otherwise, $$Y$$ may be a random or deterministic function of $$X$$. In this essay we model $$Y$$ as a random variable, and esitmate its dependence on $$X$$.

We have the freedom to set prices $$X$$ to meet our firm's objectives. The most basic way to look at it is: we would like to set prices so as to maximize the conditional revenue $$Y \mid X$$. Given that $$Y$$ is random, it makes more sense to seek a price maximizing its conditional expectation $$E[Y \mid X = x]$$. This sets the game:

{% capture goal %}
Determine the price $$X = x$$ that maximizes the expected revenue $$E[Y \mid X = x]$$.
{% endcapture %}
{% include goal.html content=goal name="Goal" %}

There is a useful factorization of the expected revenue. The purchase decision $$T$$ mediates, so we can condition on $$T$$ and apply the [law of total expectation](Law of total expectation):

$$
\begin{align}
\E[Y & \mid X = x]  \\
&= \E[Y \mid T = 0, X = x] \P(T = 0 \mid X = x) +  \E[Y \mid T = 1, X = x] \P(T = 1 \mid X = x) \\ 
&= 0 \times \P(T = 0 \mid X = x) + \E[Y \mid T = 1, X = x] \P(T = 1 \mid X = x) \\
&= \E[Y \mid T = 1, X = x] \P(T = 1 \mid X = x)
\end{align}
$$

These final two quantities will occupy us for a while, so let's give them some names. The conditional probability $$\P(T = 1 \mid X = x)$$ is called the (probability of) **participation** at the price $$x$$. The conditional expectation is called the **intensity** at the price $$x$$.

Intuitively, the participation should decrease monotonically to zero as $$x \rightarrow \infty$$, and the intensity should increase monotonically to $$\infty$$ as $$x \rightarrow \infty$$. Their product is a balancing act:

  - For small $x$, customers are likely to purchase but we're unlikely to make much revenue when they do. Our expected revenue is low.
  - For moderate $x$, customers are less likely to purchase, but when they do we make more revenue, so on average we do better.
  - For large $x$, customers will essentailly never purchase, so we make essentially no revenue.

Thus, we may hopefully imagine that the expected revenue has a concave shape, with a unique maximim. Something like this:

IMAGE OF FUNCTION

If we're to have any hope at maximizing the expected revenue, we better have some data on hand that records how customers respond to various prices. It'll look something like this:

|    x |   d |    y |
|-----:|----:|-----:|
| 1.99 |   0 | 0.00 |
| 1.78 |   0 | 0.00 |
| 1.00 |   1 | 0.15 |
| 1.18 |   0 | 0.00 |
| 0.49 |   1 | 0.04 |
| 1.63 |   1 | 0.49 |

Since we'll have observed $$X$$ for at most a finite number of possible values, and the purchase decision (and possibly the conditional revenue) are random, we need a model to estiamte the participation and intensities. Possiblity the simplest approach is linear and logistic regression:

$$ \P(T \mid X = x) = s(\alpha + \beta x)$$ 

$$ \E[Y \mid T = 1, X = x] = a + bx $$ 

Where we've used the common notation $s$ for the logistic function:

$$ s(t) \defeq \frac{1}{1 + e^{-t}} $$

With these models, the conditional revenue is:

$$ \E[Y \mid X = x] = \frac{a + b x}{1 + e^{-(\alpha + \beta x)}} $$

We call this class of functions **participation-intensity functions**. We turn to an analysis of this class of functions, with the following goals: 

  - Determine conditions under which a participation-intensity function has a unique ciritical point.
  - Determine conditions under which that critical point is a maximum
  - Derive a formula for the critical point as a function of the parameters $$a, b, \alpha, \beta$$.

These goals will occupy us for the next section.


## An Expression for the Argmaximum

## An Interval for the Argmaximum

## Curious Coverage