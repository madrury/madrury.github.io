---
layout: post
title:  "Confidence Intervals for the Profit Maximizing Price"
abstract: 'We submit to the Grand Nagus a confidence interval for a profit maximizing price.'
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

It's almost definitional: firms are interested in maximizing their profit.[^Ferengi] 

When pricing a product, it is a basic strategy to set a price that maximizes expected profit. Mature organizations often employ analysts or data scientists whose sole role is to solve this estimation problem: what is this revenue maximizing price?

In this essay, we study a basic statistical approach to this problem, which we call the **participation-intensity model**. This is useful when we have collected data that observes customers at various prices, either purchasing the product (participating) or not, and noting the collected profit (intensity) when they do. We derive a closed form expression for the profit-maximizing price, and then use this expression to develop a confidence interval for it. We finish by explaining some curious properties of this interval.

The participation-intensity terminology we use here is drawn from [labor economics literature](https://economics.stackexchange.com/questions/2941/what-is-the-difference-between-intensive-margin-and-extensive-margin-in-labor-ec). In that field, the **extensive margin** refers to labor force participation, and the **intensive margin** refers to the amount of labor given participation. It's common to refer to the type of models discussed here as **two-part models**, coined in the 1983 RAND study of health care expenditure from [Duan, Manning, Morris & Newhouse](https://www.rand.org/pubs/reports/R2754.html):

> The two-part model is an attempt to correct the problem with nonspenders in the one-part model by separating behavior into two stages, first a decision to have positive expenses, and then a decision about the level of expenses, *conditional* on its being positive.
{: .typewriter}

This name somewhat stuck, but it lacks the comparative sense when found in the wild, and anyway, it strikes me as flavorless. Actuaries call a very similar thing **frequency-severity** models, in that context the event is a bad thing and we lose latinum when it occurs. In any case, <span class="comrades">comrades</span> may forgive me for stretching terminology.

The closed form expression we derive is not novel, it appears, for example, in REFERENCE, though the analysis here is our own original work.


## Participation and Intensity

Imagine a potential customer considering whether to purchase some product for an offered price $$X = x$$. The price $$X$$ may be random or deterministic, but it will always enter our analysis conditionally, so we won't dwell on the distinction.

As the firm attempting to sell the product, we are interested in measuring two things:

  - Does the customer purchase the product, do they *participate* in the transaction? We model this as the binary random variable $$D$$.
  - Given that the customer purchases the product, what is the profit we obtain $$Y$$?

In case the customer does *not* purchase, we define the profit $$Y$$ to be zero deterministically:

$$ D = 0 \implies Y = 0 $$

Otherwise, $$Y$$ may be a random[^random-influences] or deterministic function of $$X$$. In this essay we model $$Y$$ as a random variable, and estimate its dependence on $$X$$ with a model.

We have the freedom to set prices $$X$$ to meet our firm's objectives. The most basic way to look at it is: we would like to set prices so as to maximize the conditional profit $$Y \mid X$$. Given that $$Y$$ is a random function of $$X$$, it makes more sense to seek a price maximizing its conditional expectation $$E[Y \mid X = x]$$, a deterministic function of $$X$$. This sets the game:

{% capture goal %}
Determine the price $$X = x$$ that maximizes the expected profit $$E[Y \mid X = x]$$.
{% endcapture %}
{% include goal.html content=goal name="Goal" %}

There is a useful factorization of the expected profit. The purchase decision $$D$$ mediates, so we can condition on $$D$$ and apply the [law of total expectation](https://en.wikipedia.org/wiki/Law_of_total_expectation):

$$
\begin{align}
\E[Y \mid X = x]
  &= \E[Y \mid D = 0, X = x] \, \P(D = 0 \mid X = x) \\
  &\qquad + \E[Y \mid D = 1, X = x] \, \P(D = 1 \mid X = x)
\end{align}
$$

A customer who doesn't purchase brings in no profit, so $$\E[Y \mid D = 0, X = x] = 0$$, and the first term vanishes. What's left is a product of two factors:

$$
\E[Y \mid X = x] = \E[Y \mid D = 1, X = x] \, \P(D = 1 \mid X = x)
$$

These final two quantities will occupy us for a while, so let's give them some names. The conditional probability $$\P(D = 1 \mid X = x)$$ is called the (probability of) **participation** at the price $$X = x$$. The conditional expectation is called the **intensity** at the price $$x$$.

Intuitively, the participation should decrease monotonically to zero as $$x \rightarrow \infty$$, and the intensity should increase monotonically to $$\infty$$ as $$x \rightarrow \infty$$. Their product is a balancing act:

  - For small $$x$$, customers are likely to purchase but we're unlikely to make much profit when they do, we may even be down if the price is too low. Our expected profit is small.
  - For moderate $$x$$, customers are less likely to purchase, but when they do we make more profit, so on average we do better.
  - For large $$x$$, customers will essentially never purchase, so we make essentially zero profit.

Thus, we may hopefully imagine that the expected profit has a wave like shape, cresting than dying off. With luck, the crest is a unique maximum. Something like this:

![Example Participation Intensity Function]({{ site.url }}/img/pif_participation_intensity_function.png){: .center-img}

If we're to have any hope at maximizing the expected profit in practice, we better have some data on hand that records how customers respond to various prices. It'll look something like this:

|    x |   d |    y |
|-----:|----:|-----:|
| 1.99 |   0 | 0.00 |
| 1.78 |   0 | 0.00 |
| 1.00 |   1 | 0.15 |
| 1.18 |   0 | 0.00 |
| 0.49 |   1 | 0.04 |
| 1.63 |   1 | 0.49 |

Since we'll have observed $$X$$ for at most a finite number of possible values, and the purchase decision (and possibly the conditional profit) are random, we need a model to estimate the participation and intensity. Possibly the simplest approach is linear and logistic regression:

$$ \P(D = 1 \mid X = x) = s(\alpha + \beta x)$$ 

$$ \E[Y \mid D = 1, X = x] = a + bx $$ 

Where we've used the common notation $$s$$ for the logistic function:

$$ s(t) \defeq \frac{1}{1 + e^{-t}} $$

With these models, the conditional profit is:

$$ \E[Y \mid X = x] = \frac{a + b x}{1 + e^{-(\alpha + \beta x)}} $$

We call this class of functions **participation-intensity functions**. 

We turn to an analysis of this class of functions, with the following goals: 

  - Determine conditions under which a participation-intensity function has a unique critical point.
  - Determine conditions under which that critical point is a maximum
  - Derive a formula for the critical point as a function of the parameters $$a, b, \alpha, \beta$$.

These goals will occupy us for the next section.


## An Expression for the Argmaximum

## An Interval for the Argmaximum

## Curious Coverage


[^Ferengi]: To help stomache the context of this one, it may help to imagine oneself a Ferengi.

[^random-influences]: Profits may be influenced by exogenous factors such as cost of goods sold, shipping costs, or needing to close the bar because of meddling chief security officers.