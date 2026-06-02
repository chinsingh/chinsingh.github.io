---
title: "How topological sort is a natural outcome of reversing Postorder DFS"
date: 2024-02-15
display_date: February 15, 2024
section: Patterns
field: [Software, Science]
---

## What is topological sort?

Topological sort for a directed acyclic graph is a way of sorting the graph in an order, where for any edge u -> v, u always comes before v in the final sorting, where u and v are the nodes of the graph.

You can think of the directed acyclic graph as a sequence of tasks or a process, where different nodes are tasks. If a task X has some prerequisites, those prerequisites will point towards X, and if X is a prerequisite for any other tasks, X will point to those tasks.

## Depth First Search, but postorder

Depth first search as the name suggest takes a node and starts going to its depth visiting nodes along the way. This is preorder traversal, where you visit or process a node as you are moving along the depth.

In postorder DFS, we go to the extreme depth of a node and visit or process a node once we reach the dead-end or the leaf-nodes. 

## Its only obvious

The tasks with no prerequisites are actually these leaf nodes, since they won't be pointing to any other node. When we do a postorder DFS, these leaf nodes come first and we trace back our steps from there. While in a topological sort, these leaf nodes come last. And this order is maintained throughout the traversal. It only seems natural that reversing the result of a postorder search will result in a topological sort.