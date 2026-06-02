---
title: "Living life by Greedy Method"
date: 2024-12-11
display_date: December 11, 2024
section: Life, Modelled
field: [Software, Science]
---

Greedy method is an algorithmic paradigm used in problems where we need to find an optimal solution. But it does not guarantee an optimal solution.

Wait!

That sounds counterintuitive. And it is.

It is particularly useful in scenarios where there could be multiple optimal solutions or multiple right answers. But since you are greedy, you just go with one — whichever one is best for you.

For example, consider the following scenario:

![](https://substack-post-media.s3.amazonaws.com/public/images/1a41891f-eac9-4cac-bb0f-3db81f1d2431_1156x610.png)


You want to find the least possible cost to go from A to B. There are two paths here which give you the least cost — two right answers. But the problem is not to identify the path, but to get the least cost. So you go with any one of them.

Another characteristic of a greedy algorithm is that it makes **locally optimal choices** — assuming it will eventually lead to a **globally optimal result**.

I am fascinated by how much this method applies to real life and how well it applies to our decision making. Of course, in real life, there are lot more input parameters and lot more outputs which you are trying to optimize. You might often use this method without even realizing it. When deciding which exercises to select for your particular goal, when deciding which car you need to buy, in fact, it applies to almost every decision of your life.

It might even yield better results if we apply it consciously. Take task prioritization as an example. (I am going to try this from my next sprint).

Write down the tasks you are assigned and score it according to the benefit that the task offers. This benefit could be personal (since we are being greedy) or for your product or team. Now write the deadline for each task. For each task, you want to maximize the profit, but you also want to pick the task which is more urgent first.

Final Score = Benefit/Deadline

Sort your tasks in descending order of their final score and you have a rough order for taking up these tasks. It’s a [knapsack problem](https://en.wikipedia.org/wiki/Knapsack_problem)!

At each point in your life, you make or rather, should make the “locally optimal choice”. And in the end you hope, if you make enough locally optimal choices — you will end up with a globally optimal life!