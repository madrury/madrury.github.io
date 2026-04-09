---
layout: post
title:  "Mean Reverting Series and Silent Mistakes"
date:   2026-04-08
categories: jekyll update mathematics
---

<div style="display:none">
</div>

Danger always stalks the data analyst: whereas the software engineers code may fail to compile, or pass unit tests, the data analyst's work stays silent about its incorrectness; it's a rare case where an analysis is directly falisfyable. This post is about one such error that I've encountered a few times in my career, enough so that I'd like to put a simple example of the mistake in the public record.

## The Setup
Imagine a world with two nations:

  - The Tourmekian Empire, with its currency ₮.
  - The Valley of the Wind, with its currency ₩. 

The nations exist in peaceful times, long after the forests have subsided and the earth cleansed of toxins. The world has healthy culture of travel and trade. 

We are employed as data analysis at a currency trading firm, our job is to support Tourmekians seeking to purchase ₩ with ₮, and Valleyers seeeking to purchase ₮ with ₩. We look at plots like this, the exchange rate from ₮ to ₩, all days of our working lives [^currency-symbols]:

![Exhange Rate Series]({{ site.url }}/img/mrts-exhange-rate.png){: .center-img}

At some point, curiosity strikes us: possibly some of our customers are native to Tourmekia but reside in the Valley of the Wind. It's likely some of these are using our service to exchange their Tourmekian salaries for ₩, with the intention of retiring in the Valley. These customer's likely have no need to immediately make this exchange as soon as they are paid in ₮, but instead will wait for favorable moments. That is, it's likely that exchange rate increases should associate with more usage of our service, and vice versa.

Being a responsible business that would never, ever cut corners on data engineering, we have historical data on our transaction volumes:

![Transaction Volume Series]({{ site.url }}/img/mrts-volume.png){: .center-img}

We can test out our hypothesis by scattering the day-over-day change in transaction volume against the change in exchange rate. There is a clear association:

![Change in Exhange Rate Against Change in Transaction Volume]({{ site.url }}/img/mrts-scatter-plot.png){: .center-img}

It's simple to validate this non-visually, the mean change in volume is positive when the exchange rate increases, and negative when it decreases. The effect is symmetric, or close enough to believe that it is:

```python
up = df["y"].diff().filter(df["Δfx"] > 0).mean()
print(f"mean(Δy) where Δfx > 0: {up:2.2f}")
# mean(Δy) where Δfx > 0: 9.29

down = df["y"].diff().filter(df["Δfx"] < 0).mean()
print(f"mean(Δy) where Δfx < 0: {down:2.2f}")
# mean(Δy) where Δfx < 0: -10.62
```

This is a nice result! Our curiositiy has been rewarded, and we've made a useful discovery about our customer dynamics. **We're wrong**. 自分の 罪深さに おののきます[^translation].


## The Two Worlds
Here is a different simulation of the transaction volume series:

![Transaction Volume Series]({{ site.url }}/img/mrts-volume-symmetric.png){: .center-img}

These two series look structually identical to the untrained eye. The summary statistics of this new series is very simlar to the previous:

```python
up = df["y_new"].diff().filter(df["Δfx"] > 0).mean()
print(f"mean(Δy) where Δfx > 0: {up:2.2f}")
# mean(Δy) where Δfx > 0: 8.97

down = df["y_new"].diff().filter(df["Δfx"] < 0).mean()
print(f"mean(Δy) where Δfx < 0: {down:2.2f}")
# mean(Δy) where Δfx < 0: -10.20
```



[^currency-symbols]: In the world of non-fiction: ₮ is the Mongolian tögrög and ₩ is the Korean won.
[^translation]: [Source](https://www.reddit.com/r/Nausicaa/comments/4f3nyt/i_shudder_at_the_depth_of_my_sin/).


