---
title: "My experience with Summarization models"
date: 2025-08-03
display_date: August 3, 2025
section: Shipping AI
field: Software
---

I recently tested a few summarization models for a project I’m working on.  
The goal was to generate article summaries that followed specific tone and formatting instructions, stayed factually accurate. It also involved a minor reasoning task to pick the most impactful stories from a list.

I used free models on [Open Router](https://openrouter.ai/) since I was just building an MVP and wasn’t willing to pay just yet.

Following are some of the models I tested and the results. Keep in mind that all of these are free variants of the models.

#### **[DeepSeek: R1 Distill Llama 70B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-70B)**

This is a distilled LLM based on Llama-3.3-70B-Instruct model. This is the model I tested for the longest since it was one of the few available free models a while ago. This also gave me the best summaries out of the available free models at the time, both in terms of adherence to instructions and accuracy.

The only issue with it was the consistency. 1 in 10 summaries went wrong, quite frequently. Sometimes the format would be unexpected, other times it would outright deny being able to summarize. Occasionally it would also return some random response. For example, some tags for the article instead of summary. It fared well on accuracy though. Never gave any incorrect or outside information.

To be fair I didn’t try adjusting the temperature since I wanted somewhat witty output and I was afraid fiddling with temperature might hamper that. Also, the [hugging face page](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-70B) for the model explicitly states not to give the model any system prompts, which I did anyway. I guess, I didn’t give it a fair chance.

#### **[MoonshotAI: Kimi K2](https://moonshotai.github.io/Kimi-K2/)**

Since this was a mixture-of-experts model, I figured why not give it a chance as my use case required summarization of articles from different domains.

This gave good results overall. I was not completely satisfied with the impactful article selection. The summaries and their titles lacked clarity as well. Although, it didn’t give me any buggy data.

#### [DeepSeek V3-0324](https://huggingface.co/deepseek-ai/DeepSeek-V3-0324)

I abandoned it soon since it called Trump, ‘former’ POTUS. While not entirely wrong, but still a red flag for my use-case. Also some summaries were too small.

#### [Dolphin Mistral 24B - Venice Edition](https://www.aimodels.fyi/models/huggingFace/dolphin-mistral-24b-venice-edition-cognitivecomputations)

This is a collaborative project between [cognitivecomputations](https://aimodels.fyi/creators/huggingFace/cognitivecomputations) and Venice.ai to create an uncensored version of Mistral 24B.

I included this in my testing since this is an uncensored model, which could be particularly useful for my use case of summarizing news articles. But the impactful article selection was not great so I moved along.

#### [DeepSeek R1 0528](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528)

This was the best one until this point in summarization, but it was incredibly, dare I say, even painfully slow. That would not be a deal breaker for my use case since I’m not summarizing in a user-facing application at runtime. Only issue could be that it would make testing it a bit difficult and time consuming.

Another issue was adherence to the format. With the title generation for the summary, it provided an “Alternative title”. I could fix this via prompt, but I decided to keep it aside and give other models a try.

#### [Qwen3 Coder](https://qwenlm.github.io/blog/qwen3-coder/)

Because why not? Its the state-of-the-art coding model right now, and I thought it might be fun to see how a coding model performs as a journalist summarizing articles. Not so surprisingly, this model was fastest one of the bunch. The issue however, was that it didn’t stick to the tone I asked for, which was a bit witty and clever. It also included some html tags like `<div>` in the response along with some inline styling.

Its exactly what you’d expect from a coder though.

#### [Microsoft: MAI DS R1](https://techcommunity.microsoft.com/blog/machinelearningblog/introducing-mai-ds-r1/4405076)

This is a post-trained variant of DeepSeek-R1 developed by the Microsoft AI team improve the model’s responsiveness on previously blocked topics while enhancing its safety profile. Safety was an important parameter for me and I already had good experience with DeepSeek R1 models, so I decided to give it a try.

This was the best performing model without a doubt. It adhered to all the instructions, remained factually correct and covered all the important points while summarizing while maintaining the tone and format I was going for.

Needless to say, this was the one I ended up using for my use-case.

If you’re exploring summarization for your own project, I hope this gives you a head start. Let me know if you’ve found a model that worked well for you. I’d love to hear.