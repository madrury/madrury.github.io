---
layout: post
title:  "Mean Reverting Time Series and Subtle Mistakes"
date:   2026-04-08
categories: jekyll update mathematics
---

<div style="display:none">
$$
\newcommand{\fx}{\text{fx}}
$$
</div>

Danger always stalks the data analyst: whereas a software engineer's code may fail to compile or pass unit tests, the data analyst's work is silent about its incorrectness. It's rare for the conclusions of an analysis of observational data to be falsifyable. This post is about a data analytic error that I've encountered a few times in my career.

## Setup
Imagine a world with two nations:

  - The Tourmekian Empire, with its currency ₮.
  - The Valley of the Wind, with its currency ₩. 

The nations exist in peaceful times, long after the forests have subsided and the earth cleansed of the residual toxins of war. The world has healthy culture of travel and trade. 

We are employed as a data analyst at a currency trading firm, our job is to support Tourmekians seeking to purchase ₩ with ₮, and Valleyers seeeking to purchase ₮ with ₩. We look at plots like this, the exchange rate from ₮ to ₩, all days of our working life [^currency-symbols]:

![Exhange Rate Series]({{ site.url }}/img/mrts-exhange-rate.png){: .center-img}

At some point, a curiosity strikes us: possibly some of our customers are residents of Tourmekia, but are native to the Valley of the Wind. It's likely some of these are using our service to exchange their Tourmekian salaries for the Valley's ₩, with the intention of using that ₩ whenever they return to the homeland. These customer's likely have no need to immediately make this exchange as soon as they are paid in ₮, but instead will wait for favorable moments. We hypothesize: **it's likely that exchange rate increases should associate with more usage of our service, and vice versa**.

Being a responsible business that would never, ever cut corners on data engineering, we have historical data on daily transaction volumes:

![Transaction Volume Series]({{ site.url }}/img/mrts-volume.png){: .center-img}

We can inspect our hypothesis by scattering the day-over-day change in transaction volume against the change in exchange rate. There is a clear association:

![Change in Exhange Rate Against Change in Transaction Volume]({{ site.url }}/img/mrts-scatter-plot.png){: .center-img}

It's simple to validate this non-visually, the mean change in volume is positive when the exchange rate increases, and negative when it decreases. Deamnd goes up and down in synchronization with the exchange rate. The effect is symmetric, or close enough to believe that it is:

```python
up = df["y"].diff().filter(df["Δfx"] > 0).mean()
print(f"mean(Δy) where Δfx > 0: {up:2.2f}")
# mean(Δy) where Δfx > 0: 9.29

down = df["y"].diff().filter(df["Δfx"] < 0).mean()
print(f"mean(Δy) where Δfx < 0: {down:2.2f}")
# mean(Δy) where Δfx < 0: -10.62
```

This is a nice result! Our curiositiy has been rewarded, and we've made a useful discovery about our customer dynamics. **We're wrong**.

{% capture sin %}
自分の 罪深さに おののきます
{% endcapture %}
{% include display.html content=sin %}


## The Two Worlds
Here is a different simulation of the transaction volume series:

![Transaction Volume Series]({{ site.url }}/img/mrts-volume-symmetric.png){: .center-img}

This series looks structually identical to previous one to the untrained eye, any observer would be forgiven to alloacate the slight differences to noise. In support, the summary statistics of this new series are very simlar to the previous:

```python
up = df["y_new"].diff().filter(df["Δfx"] > 0).mean()
print(f"mean(Δy) where Δfx > 0: {up:2.2f}")
# mean(Δy) where Δfx > 0: 8.97

down = df["y_new"].diff().filter(df["Δfx"] < 0).mean()
print(f"mean(Δy) where Δfx < 0: {down:2.2f}")
# mean(Δy) where Δfx < 0: -10.20
```

These two transaction processes are not the same, and encode very different dynamics of customer behaviour. If we scatterplot side by side, maybe the observant and lucky among us will start to sense something is up[^in-reality]:

![Change in Exhange Rate Against Change in Transaction Volume, Both Series]({{ site.url }}/img/mrts-scatter-plot-side-by-side.png){: .center-img}

We generated data according to the following random processes:

**First series, asymmetric**:

$$ y = 95.0 + 0.2 t + 20.0 \mathop{max}(\Delta \fx, 0) + \epsilon $$

**Second series, symmetric**:

$$ y = 100.0 + 0.2 t + 10.0 \Delta \fx + \epsilon $$

In the first scenario, the effect is **not symmetric**, while in the second it **is symmetric**. Customers in the first scenario **do increase their transaction rate** when the exchange rate moves favorably, but **do not decrease their transaction rate** when it moves against their favor.

This is much easier to see if we plot the **true** trendline (i.e. the $a + b t$ part of the above equations) along with our observed data series:

![Transaction Volume with Trendlines, Both Series]({{ site.url }}/img/mrts-volume-with-trendlines.png){: .center-img}

In the first series, the observed transaction volume mostly stays above the true trendline, any dips below are due to the  noise term $\epsilon$. The second series moves around the trendline symmetrically.

So why, in the first case of only upwards effects, does our data alalysis detect an association? Our finding is due to **mean reversion**: when the exchange rate decreases customer bahaviour reverts to its baseline state of a random perturbation around the true trendline. When such an observation follows one where the exchange rate moved upwards (which happens about half the time) this results in (most likely) a downwards move from its elevated state back towards the trendline. So, on average, a fall in exchange rate is simultaneous with a fall in tarnsaction rate. 

## Capturing the True Effect
Asymmetric effect are common in practice, and are worth considering whenever analysing a response to some stimuli that may be positive or negative.

The basic technique is to specify a regression model including **hinge transformations** of $\Delta \fx$:

$$
y \sim \beta_0 + \beta_t t + \beta_+ \mathop{max}(\Delta \fx, 0) + \beta_- \mathop{min}(\Delta \fx, 0) + \epsilon 
$$

If we fit this model:

```python
X = np.column_stack([
    df["day"], 
    np.maximum(df["fx"].diff(1), 0),
    np.minimum(df["fx"].diff(1), 0),
])

regression = LinearRegression().fit(X[1:], df["y"][1:])

print(f"Regression Coefficient: β0 = {regression.intercept_:2.2f}")
# Regression Coefficient: β0 = 94.58
print(f"Regression Coefficient: βt = {regression.coef_[0]:2.2f}")
# Regression Coefficient: βt = 0.21
print(f"Regression Coefficient: β+ = {regression.coef_[1]:2.2f}")
# Regression Coefficient: β+ = 19.82
print(f"Regression Coefficient: β- = {regression.coef_[2]:2.2f}")
# Regression Coefficient: β- = -0.57
```

We infer correct coefficients from the observed data. In particular, we correctly deduce that there is no effect of downwards movements in $\Delta fx$.

If instead we fit the **wrong** model:

$$
y \sim \beta_0 + \beta_t t + \beta \Delta \fx + \epsilon 
$$

We infer an symmetric effect of half the size:

```python
X = np.column_stack([
    df["day"], 
    df["fx"].diff(1)
])

regression = lin.LinearRegression().fit(X[1:], df["y"][1:])

print(f"Regression Coefficient: β0 = {regression.intercept_:2.2f}")
# Regression Coefficient: β0 = 103.16
print(f"Regression Coefficient: βt = {regression.coef_[0]:2.2f}")
# Regression Coefficient: βt = 0.20
print(f"Regression Coefficient: β = {regression.coef_[1]:2.2f}")
# Regression Coefficient: β = 10.62
```

Insidiously, with the wrong model we draw **two** incorrect conclusions: we infer half of the correct positive effect, and a negative effect when there is none.


[^currency-symbols]: In the world of non-fiction: ₮ is the Mongolian tögrög and ₩ is the Korean won.
[^translation]: [Source](https://www.reddit.com/r/Nausicaa/comments/4f3nyt/i_shudder_at_the_depth_of_my_sin/).
[^in-reality]: Of course, in reality, we'd never have **both** of these to comapare, the world is what it is and all we get to see is one of them.


