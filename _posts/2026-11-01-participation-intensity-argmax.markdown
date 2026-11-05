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
\newcommand{\sign}{\operatorname{sign}}
\newcommand{\params}{\mathcal{P}}
\newcommand{\dataset}{\mathcal{D}}
$$
</div>

It's in the rules of aquisition: we are interested in maximizing our profit.[^Ferengi] 

When pricing a product, it is a basic strategy to set a price that maximizes expected profit. Mature organizations often employ analysts or data scientists whose sole role is to solve this estimation problem: what is this profit maximizing price?

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

We have the freedom to set prices $$X$$ to meet our firm's objectives. The most basic way to look at it is: we would like to set prices so as to maximize the conditional profit $$Y \mid X$$. Given that $$Y$$ is a random function of $$X$$, it makes more sense to seek a price maximizing its conditional expectation $$\E[Y \mid X = x]$$, a deterministic function of $$X$$. This sets the game:

{% capture goal %}
Determine the price $$X = x$$ that maximizes the expected profit $$\E[Y \mid X = x]$$.
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

These final two quantities will occupy us for a while, so let's give them some names. The conditional probability $$\P(D = 1 \mid X = x)$$ is called the (probability of) **participation** at the price $$X = x$$. The conditional expectation $$\E[Y \mid D = 1, X = x]$$ is called the **intensity** at the price $$X = x$$.

Intuitively, the participation should decrease monotonically to zero as $$x \rightarrow \infty$$, and the intensity should increase monotonically to $$\infty$$ as $$x \rightarrow \infty$$. Their product is a balancing act:

  - For small $$x$$, customers are likely to purchase but we're unlikely to make much profit when they do; we may even be down if the price is too low. Our expected profit is small.
  - For moderate $$x$$, customers are less likely to purchase, but when they do we make more profit, so on average we do better.
  - For large $$x$$, customers will essentially never purchase, so we make essentially zero profit.

Thus, we may hopefully imagine that the expected profit has a wave-like shape, cresting then dying off. With luck, the crest is a unique maximum. Something like this:

![Example Participation Intensity Function]({{ site.url }}/img/pif_participation_intensity_function.png){: .center-img}

If we're to have any hope at maximizing the expected profit in practice, we better have some data on hand that records how customers respond to various prices. It'll look something like this:

|    x |   d |    y |
|-----:|----:|-----:|
| 1.78 |   0 | 0.00 |
| 1.00 |   1 | 0.15 |
| 1.18 |   0 | 0.00 |
| 1.63 |   1 | 0.49 |

Since we'll have observed $$X$$ for at most a finite number of possible values, and the purchase decision (and possibly the conditional profit) are random, we need a model to estimate the participation and intensity. Possibly the simplest approach is linear regression for $$Y \mid D = 1, X = x$$:

$$ Y \mid D = 1, X = x \sim \text{Normal}(\mu = a + bx, \sigma^2) $$ 

and a logistic regression for $$D \mid X = x$$:

$$ D \mid X = x \sim \text{Bernoulli}(p = s(\alpha + \beta x)) $$

where we've used the common notation $$s$$ for the logistic function:

$$ s(t) \defeq \frac{1}{1 + \exp(-t)} $$

With these models, the expected profit is:

$$ \E[Y \mid X = x] = \frac{a + b x}{1 + \exp \left( -(\alpha + \beta x) \right)} $$

We call this class of functions **participation-intensity functions**. 

We turn to an analysis of this class of functions, with the following goals: 

  - **Uniqueness**: Determine conditions under which a participation-intensity function has a unique critical point.
  - **Maxima**: Determine conditions under which that critical point is a maximum.
  - **Expression**: Derive a formula for the critical point as a function of the parameters $$a, b, \alpha, \beta$$.

These goals will occupy us for the next section.


## Analysis of the Argmaximum

In this section, we work with a static participation-intensity function; the parameters $$a, b, \alpha, \beta$$ are fixed. Throughout, we assume that $$b \neq 0$$ and $$\beta \neq 0$$: 

- If $$b = 0$$, the intensity does not depend on the price, which is unrealistic. 
- If $$\beta = 0$$, the participation does not depend on the price, and $$f$$ is linear, with no critical point at all.

We introduce the coordinate $$\eta(x) \defeq \alpha + \beta x$$. Since $$\beta \neq 0$$, as $$x$$ ranges over the real line so does $$\eta$$, the mapping is $$x \mapsto \eta$$ is bijective. We note for later that the coordinate change preserves directionality when $\beta > 0$, and reverses it when $\beta < 0$.

Our function is:

$$ f(x) \defeq (a + bx) s(\eta) $$

We want to study the critical points of $$f$$, so we differentiate:

$$ 
\begin{align}
f'(x) 
  &= b s(\eta) + \beta (a + bx) s(\eta) (1 - s(\eta)) \\
  &= b s(\eta) (1 - s(\eta)) \left( 1 + \exp(\eta) + \frac{\beta}{b}(a + bx) \right)
\end{align}
$$

where we've made use of the identities:

$$s' = s (1 - s) \quad \text{ and } \quad \frac{1}{1 - s(\eta)} = 1 + \exp(\eta)$$

Let's rewrite the remaining linear bit in terms of $$\eta$$ instead of $$x$$:

$$
\begin{align}
1 + \frac{\beta}{b}(a + bx)
&= 1 + \frac{\beta}{b} \left( a + \frac{b}{\beta}(\eta - \alpha) \right) \\
&= \eta - \frac{b \alpha - a \beta - b}{b} 
\end{align}
$$

So, introducing a new parameter $$\lambda \defeq \frac{b \alpha - a \beta - b}{b}$$ we have:


{% capture participation-intensity-derivative %}
$$
f'(x) = b s(\eta) (1 - s(\eta)) \left( \exp(\eta) + \eta - \lambda \right)
$$
{% endcapture %}
{% include result.html content=participation-intensity-derivative name="Derivative" %}

### Uniqueness

Let's start with the uniqueness question: when does $$f$$ have a unique critical point?  Well, $$b \neq 0$$ by assumption, and $$0 < s, 1 - s < 1$$ always, so:

$$
f'(x) = 0 \iff \exp(\eta) + \eta = \lambda
$$

Now, the left hand side of this equation is a *strictly increasing* function of $$\eta$$. And:

$$
\eta \rightarrow -\infty \implies \exp(\eta) + \eta \rightarrow -\infty \\
\eta \rightarrow \infty \implies \exp(\eta) + \eta \rightarrow \infty
$$

Thus, the left hand side must, by the intermediate value theorem, attain the value $$\lambda$$ for some value of $$\eta$$. Since we have *strict* monotonicity, this can happen exactly once, so the critical point is unique.

{% capture uniqueness %}
Assuming that $$b \beta \neq 0$$, $$f$$ has a unique critical point determined by the equation $$\exp(\eta) + \eta = \lambda$$.
{% endcapture %}
{% include result.html content=uniqueness name="Uniqueness" %}

### Maxima

Now we analyze when the critical point found above is a maximum (always assuming that $$b \beta \neq 0$$). We can proceed using a sign analysis, according to:

$$\sign f'(x) = \sign(b) \sign(\exp(\eta) + \eta - \lambda)$$

We know that $$\exp(\eta) + \eta - \lambda$$ is strictly increasing in $$\eta$$, so in $$\eta$$ coordinates:

- $$\sign(\exp(\eta) + \eta - \lambda) = -1$$ to the *left* of the critical point.
- $$\sign(\exp(\eta) + \eta - \lambda) = 1$$ to the *right* of the critical point.

Swapping to $$x$$ coordinates (as noted earlier, since $$\eta = \alpha + \beta x$$) either preserves or reverses directionality according to $$\sign(\beta)$$. So in $$x$$ coordinates:

- $$ \sign(\exp(\eta) + \eta - \lambda) = - \sign(\beta) $$ to the *left* of the critical point.
- $$ \sign(\exp(\eta) + \eta - \lambda) = \sign(\beta) $$ to the *right* of the critical point.

Putting everything together, in $$x$$ coordinates:

- $$ \sign f'(x) = - \sign(b) \sign(\beta) = - \sign(b \beta) $$ to the *left* of the critical point.
- $$ \sign f'(x) = \sign(b) \sign(\beta) = \sign(b \beta) $$ to the *right* of the critical point.

Thus when $$b \beta < 0$$ the function $f$ is increasing to the left of its ciritcal point and decreasing to the right of it, it's shaped like $$\frown$$. When $$b \beta > 0$$ this reverses, and $$f$$ is shaped like $$\smile$$. This charecterizes when the critical point is a maxima:

{% capture maxima %}
Assuming that $$b \beta \neq 0$$, $$f$$'s unique critical point is a maximum exactly when $$b \beta < 0$$, and a minimum when $$b \beta > 0$$.
{% endcapture %}
{% include result.html content=maxima name="Maxima" %}

### Expression
To complete our programme, we seek a closed-form expression for the critical point of $$f$$. At present, we know this is equivalent to solving:

$$\exp(\eta) + \eta = \lambda$$

If we are restricted to the analytic functions appearing in an everyday Calculus textbook, there is no closed-form solution. But all hope is not lost: there is a common enough special function that, when added to our toolset, provides a solution.

The [**Lambert W Function**](https://en.wikipedia.org/wiki/Lambert_W_function) is a special function $$W: [-1/e, \infty) \rightarrow [-1, \infty)$$[^branches] that inverts the mapping $$t \mapsto t \exp(t)$$. That is:

$$ W(z) \exp(W(z)) = z $$

The $$W$$ function is very useful for [solving equations](https://en.wikipedia.org/wiki/Lambert_W_function#Solving_equations) of the shape `linear = exponential`, which ours is. We demonstrate how this works with our example:

$$
\begin{align}
\exp(\eta) + \eta = \lambda &\iff 1 + \eta \exp(-\eta) = \lambda \exp(-\eta) \\
&\iff (\lambda - \eta) \exp(-\eta) = 1 \\
&\iff (\lambda - \eta) \exp(\lambda - \eta) = \exp(\lambda) \\
&\iff \lambda - \eta = W(\exp(\lambda)) \\
&\iff \eta = \lambda - W(\exp(\lambda))
\end{align}
$$

The "$$W$$ function composed with an exponential" term that appears in our solution is common enough to have its own name and notation, the [Wright omega function](https://en.wikipedia.org/wiki/Wright_omega_function):

$$ \omega(z) \defeq W(\exp(z)) $$

This function has its own implementation in scientific programming libraries, avoiding the dangerous overflow potential of evaluating $$W(\exp(z))$$ literally. It is also defined for any real input, and maps onto the positive real line. It's just a nicer function in many contexts. Here's how they look:

![Lambert W and Wright ω functions]({{ site.url }}/img/pif_special_functions.png){: .center-img}

In any case, our solution is:

{% capture expression %}
Assuming that $$b \beta \neq 0$$, $$f$$'s unique critical point, in $$\eta$$ coordinates, is:

$$ \eta^* = \lambda - \omega(\lambda) $$

In $$x$$ coordinates:

$$ x^* = \frac{\eta^* - \alpha}{\beta} = \frac{\lambda - \alpha - \omega(\lambda)}{\beta}$$

Using $$\lambda = \alpha - 1 - \frac{a \beta}{b}$$ gives the alternate expression:

$$ x^* = -\frac{a}{b} - \frac{1 + \omega(\lambda)}{\beta}$$
{% endcapture %}
{% include result.html content=expression name="Closed Form Expression" %}

This last expression for $$x^*$$ is quite evocative. The $$-\frac{a}{b}$$ term is the solution to $$a + bx = 0$$, the conditional profit; i.e. it is the **break-even price** on a sale. Anything less than this leads to us losing latinum on each and every sale; we must price higher than this to stay solvent. The other term is our premium: it's the best we can do on top of the break-even price. The premium is always positive, since $$\omega > 0$$, and in the usual parameter regime where $$a < 0, b > 0, \beta < 0$$, so is the break-even price:

$$ x^* = \left\lvert \frac{a}{b} \right\rvert + \frac{1 + \omega(\lambda)}{\lvert \beta \rvert}$$

We can test this out qualitatively by making some plots as we vary parameters and track the computed critical points. Here we fix all but $$\beta$$ and let $$\beta \nearrow 0$$:

![Critical Points Move to the Right and Upwards]({{ site.url }}/img/pif_participation_intensity_vary_beta.png){: .center-img}

Qualitatively, this checks out. As $$\beta \nearrow 0$$, $$\lambda \rightarrow \alpha - 1$$, so the premium grows like $$1 / \lvert \beta \rvert$$, and the critical point drifts off to infinity.

For another example, we fix all but $$b$$ and let $$b \searrow 0$$:

![Critical Points Move to the Right and Downwards to Zero]({{ site.url }}/img/pif_participation_intensity_vary_b.png){: .center-img}

Again, qualitatively this works out. As $$b \searrow 0$$, the break-even price $$\left\lvert \frac{a}{b} \right\rvert \rightarrow \infty$$. In the usual regime $$\lambda \rightarrow - \infty$$, so $$1 + \omega(\lambda) \rightarrow 1$$, and the premium settles to $$1 / \lvert \beta \rvert$$, soon dwarfed by the break-even price. We're forced to set higher prices, otherwise we lose even when we sell.


## Models for the Participation Intensity Curve

Having eaten our fill of analysis, we turn to statistics. The world does not hand us a participation-intensity curve; at best it provides us some data, and leaves us to draw a curve out of it. Data like this:

|    x |   d |    y |
|-----:|----:|-----:|
| 1.78 |   0 | 0.00 |
| 1.00 |   1 | 0.15 |
| 1.18 |   0 | 0.00 |
| 1.63 |   1 | 0.49 |

Our job is to use this data to estimate the curve's parameters $$a, b, \alpha, \beta$$. We've made some generative assumptions already, which we remind the reader of here. We assume that individual observations are independent conditional on their prices[^non-independence], and make the distributional assumptions:

$$ D = 0 \implies Y = 0 \quad \text{deterministically} $$

$$ Y \mid D = 1, X = x \sim \text{Normal}(\mu = a + bx, \sigma^2) $$ 

$$ D \mid X = x \sim \text{Bernoulli}(p = s(\alpha + \beta x)) $$ 
 
Given this setup, we can estimate $$\params = (a, b, \sigma, \alpha, \beta)$$ by maximum likelihood.

### Maximum Likelihood

Crucially, in our setup: $$D$$ is observable.[^not-always-the-case] This means the proper likelihood for an observation $$y, d, x$$ is the *joint* probability of observing $$D = d, Y \in [y, y + dy]$$ under the parameters $$\params$$ when $$X = x$$:

$$ 
\P \left( Y \in [y, y + dy], D = d \mid X = x \right)
$$

which factors as:

$$
\P(D = d \mid X = x) \P(Y \in [y, y + dy] \mid D = d, X = x)
$$

Let's look at this product in two cases.

**Case $$d = 0$$**: Here $$y = 0$$ deterministically, so the likelihood is:

$$
\begin{align}
L(\params; 0, 0, x) &= \P(D = 0 \mid X = x) \\
&= 1 - s(\alpha + \beta x)
\end{align}
$$

**Case $$d = 1$$**: Here both factors are retained. We can write the second factor as an integral over the (Gaussian) density
 
$$p(y \mid x, D = 1) = \frac{1}{\sqrt{2 \pi \sigma^2}} \exp \left(- \frac{(y - a - bx)^2}{2 \sigma^2} \right)$$ 

of $$Y \mid D = 1, X = x$$: 

$$
\begin{align}
\P(D = 1 & \mid X = x) \P(Y \in [y, y + dy] \mid D = 1, X = x) \\
&= s(\alpha + \beta x) \int_y^{y + dy} p(t \mid x, D = 1) \, dt
\end{align}
$$

Dividing by $$dy$$ and letting $$dy \rightarrow 0$$ gives the contribution to the likelihood:

$$
L(\params; y, 1, x) = s(\alpha + \beta x) \, p(y \mid x, D = 1)
$$

Taken over an entire dataset $$\dataset = \left\{ y_i, d_i, x_i \right\}$$, we get the full likelihood as a product:

$$
\begin{align}
L(\params; \dataset) & \defeq \prod_i \P(D = d_i \mid X = x_i) \prod_{i: \ d_i = 1} p(y_i \mid x_i, D = 1) \\
&= \prod_i s(\alpha + \beta x_i)^{d_i} (1 - s(\alpha + \beta x_i))^{1 - d_i} \prod_{i: \ d_i = 1} p(y_i \mid x_i, D = 1)
\end{align}
$$

The first factor here is the likelihood of a logistic regression model for $$D \mid X$$, fit to all the available data. This factor depends only on the parameters $$\alpha, \beta$$. The second factor is the likelihood for a linear model of $$Y \mid X, D = 1$$, but fit to only data with $$D = 1$$. This factor depends only on the parameters $$a, b, \sigma$$. Thus we may maximize the likelihood by maximizing each factor individually. This justifies fitting:

- A logistic regression to all the $$d_i, x_i$$ to estimate the parameters $$\alpha, \beta$$.
- A linear regression to only the subset of data with $$d_i = 1$$ to estimate the parameters $$a, b, \sigma$$.

This simple split-and-fit procedure gives the maximum likelihood estimate of the participation-intensity curve fit to the observed data.


![A Blue Participation-Intensity Curve and an Orange Curve Closeby]({{ site.url }}/img/pif_participation_intensity_fit.png){: .center-img}

In the figure above, we've fixed a <span>true curve</span>{: .blue} and generated $$N = 250$$ samples $$y, d, x$$ from our generative model. The <span>dashed curve</span>{: .orange} is the fit curve using maximum likelihood. In this case they're quite close, but they needn't always be. If we repeat this process:

![A Blue Participation-Intensity Curve and a Bundle of Orange Curves Around It]({{ site.url }}/img/pif_participation_intensity_fits.png){: .center-img}

The fit curves bundle around the truth, as we would anticipate. We've noted with <span>tick marks</span>{: .orange} the critical point of the fit curves, using the methods of the previous section. They vary around the true critical point. In the next section, we will estimate the variance of these estimated critical points.

### Parameter Covariances


## An Interval for the Argmaximum

## Curious Coverage

[^Ferengi]: To stomach the context of this one, it may help to imagine oneself a Ferengi.

[^random-influences]: Profits may be influenced by exogenous factors such as cost of goods sold, shipping costs, or needing to close the bar because of meddling chief security officers.

[^branches]: We're sweeping some details under a rug here. The $$W$$ function is multi-branched, in the same way that the inverse of $$z \mapsto z^2$$ is multi-branched. In our case the argument $$\exp(\lambda)$$ is positive, where only the principal branch is real valued; the other real branch, $$W_{-1}$$, is defined only on $$[-1/e, 0)$$.

[^not-always-the-case]: It's not always the case. If we only observe $$Y$$, then $$Y = 0$$ can happen either because no purchase occurred, or a purchase resulted in zero profit. When that second case happens with positive probability, things get interesting: we have a zero-inflated model, and the likelihood no longer factors.

[^non-independence]: This is often false in practice, commonly when customers make repeat purchases. A more proper analysis would introduce random effects for customers, but admittedly this is also regularly ignored.