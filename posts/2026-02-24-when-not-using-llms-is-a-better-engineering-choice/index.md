---
title: "When Not Using LLMs Is A Better Engineering Choice"
date: 2026-02-24
display_date: February 24, 2026
section: Shipping AI
field: Software
---

I’m currently working on an application that allows users to customize hundreds of product offerings in their CRM. One functionality was to edit images for those products. When I started to enhance it with AI features, one obvious enhancement which would save a ton of time for users was image generation. Since there are loads of products, customizing them one by one was a huge manual effort.

Two reasons why I couldn’t go for image generation via AI though:

*   My organization’s internal AI gateway didn’t support multimodal output, and they had no plans to do it anytime soon.
    
*   Even if I did find a way, generating images for hundreds of products would take forever. Certainly it could be done in the background, but it would be costly and would negate the purpose it was trying to solve in the first place.
    

### The Solution: You Don’t Need Image Generation

What if instead of generating, we fetch images online and rank them?

I started looking for image search APIs and found [Openverse](https://api.openverse.org/v1/). The ranking part could be done by an LLM, which is much more efficient than generation, both in terms of cost and time. The ranking could also be done by humans, which is why I added this functionality to the manual mode of my application as well.

The overall pipeline still took around 2–3 minutes (sometimes up to 5). I worked around this limitation by using push notifications when the ranking was done. But it still wasn’t great user experience. And frankly, only slightly better than doing it manually. On top of that, Openverse was failing for most products, often returning irrelevant images or nothing at all. Because of this, many products ended up without images at all. So we had multiple problems at once:

*   latency
*   poor UX
*   reliability issues
*   and incomplete coverage

Too many products simply had nothing to rank, and this half-baked workflow was still taking too much time.

I found that one of my colleagues had used the [Pexels API](https://www.pexels.com/api/) for their application and it performed surprisingly well, even with technical product names. I replaced Openverse in my application using it just as a fallback.

Pexels API was much more reliable, which meant it was fetching images for hundreds of products without failing. But that also meant the LLM now had to rank _all_ those images.

#### From Minutes to Milliseconds: Local embeddings over LLMs

The LLM ranking was now taking 5–10 minutes and sometimes even 15 minutes when the number of products was high.

This is when I decided to revisit the requirement again. All I really needed was that the image be relevant to the product name.

I looked online and found a good number of models that can be used for exactly this purpose. These models work by converting images and corresponding text into vectors. They then calculate similarity using a dot product (or cosine similarity).

**LLMs only make sense when you have to ask back-and-forth questions regarding the images.**

My requirement was way more straightforward. No generation, no reasoning.
![](https://substack-post-media.s3.amazonaws.com/public/images/30dbcd05-4e23-4397-9364-dcd6ff502900_8192x775.png)

I replaced the LLM calls with a local inference using the [clip-ViT-B-32](https://huggingface.co/sentence-transformers/clip-ViT-B-32) model, and the amount of time to process all those images dropped to milliseconds. In fact, the API calls to fetch the images were now taking longer than ranking them.

### You may not need LLMs either

In hindsight, this wasn’t an image generation problem at all. It was a retrieval and ranking problem.

The biggest takeaway for me was this: look closely at your actual requirement before reaching for LLMs or generative AI. Sometimes, not using LLMs is the better engineering choice.