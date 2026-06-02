---
title: "Optimization Game - How Far Can You Go?"
date: 2024-11-05
display_date: November 5, 2024
section: Rabbit Holes
field: Software
---

I came across this question which was asked in some big tech on Leetcode, and thought I’d make a challenge out of it.

How can you optimize the below code?

```java
LinkedList<Integer> list;
Long sum = 0;

for (int i = 0; i < list.size(); ++i) {
  Long value = list.get(i); 
  sum += value;
}
```

### Identifying Initial Bottlenecks

The first major issue with this code is the use of `list.get(i)`. Since `LinkedList` doesn’t support O(1) retrieval by index, each `get()` call iterates up to that index, making the overall complexity O(n²). To fix this, we can use an `Iterator` to traverse the `LinkedList` or switch to an `ArrayList`, which offers O(1) access time due to its contiguous memory structure.

Another inefficiency is the unnecessary auto-boxing when initializing `Long sum = 0`, which could be simplified. Let’s address these two points in our first optimization:

```java
LinkedList<Integer> list;
Long sum = 0L;

for (Integer value : list) { 
  sum += value;
}
```

Using an enhanced for-loop with an `Iterator` or switching to an `ArrayList` ensures O(n) traversal. Additionally, initializing `sum` with `0L` avoids any auto-boxing.

At this point, we have an optimized, generic version of the code suitable for most situations. However, for the sake of experimentation, let’s explore further optimizations without focusing on edge cases. This exercise will give us insight into different performance trade-offs, touching on some core Java and computer science concepts along the way.

### Going Further with Arrays

Instead of a `LinkedList`, we can use a primitive `int` array, which offers significant advantages:

#### 1\. Cache Locality

Arrays in Java are contiguous blocks of memory, which allows the CPU to load large chunks of the array into the cache after the first access. This enables faster access to subsequent elements due to _spatial locality_. Here’s a simplified memory layout comparison to illustrate:

```
Address      Contents      | Address      Contents
ffff 0000    data[0]       | ffff 1000    l_data
ffff 0040    data[1]       |   ....
ffff 0080    data[2]       | ffff 3460    l_data->next
ffff 00c0    data[3]       |   ....
ffff 0100    data[4]       | ffff 8dc0    l_data->next->next
                           | ffff 8e00    l_data->next->next->next
                           |   ....
                           | ffff 8f00    l_data->next->next->next->next
```

When we access `data[0]`, the CPU loads a chunk of memory starting at `ffff 0000` into the cache, enabling quick access to `data[1]`, `data[2]`, and so on. By contrast, a `LinkedList` has scattered nodes, each pointing to the next. Accessing `l_data->next` requires loading a different part of memory, resulting in more cache misses and reduced efficiency.

#### 2\. Dereferencing Overhead

In a `LinkedList`, each element resides in a node with a pointer to the next element. This design causes:
* **Indirect Access**: Accessing elements requires traversing pointers, adding multiple memory lookups and slowing access.
* **Pointer Chasing**: Nodes are scattered in memory, leading to frequent cache misses as the CPU fetches each pointer location separately, increasing access latency.
* **Memory Overhead**: Each node’s pointer and wrapper object (e.g., `Integer`) consume extra memory, which reduces cache efficiency and adds garbage collection overhead.

In contrast, an `int[]` array stores values contiguously, allowing direct access without pointers, minimizing cache misses, and avoiding the extra memory and garbage collection costs. This results in faster, more efficient sequential access.

### Utilizing Parallel Streams

Since we’re using Java, we can leverage parallel streams to speed up summation over large datasets. Here’s a quick overview of how parallel streams operate:

1. **Splitting the Data Source**: A parallel stream divides the data source (e.g., a collection or array) into chunks. Each chunk is assigned to a separate thread for concurrent processing, leveraging multiple CPU cores.
2. **Work-Stealing**: Java’s `ForkJoinPool` powers parallel streams and supports work-stealing. If one thread finishes early, it can take over work from another thread that’s still processing.

Parallel streams work best with large data sources, as the overhead of splitting and managing multiple threads is only worth it when there’s significant computation. In this example, we’ll assume a large dataset and implement parallel streams:

### Optimizing Further: Choosing `int` over long

Finally, to squeeze out the last bits of performance, we can replace `long` with `int`, which has some subtle advantages:

* **Memory Efficiency**: `int` uses 4 bytes, whereas `long` uses 8. For large datasets, this reduces memory footprint.    
* **Cache Efficiency**: Smaller data types like `int` occupy less space in the cache, which may reduce cache misses when handling large arrays.
* **Avoiding Type Promotion**: In Java, mixing `int` and `long` in expressions promotes `int` values to `long`, introducing minor overhead. By keeping everything as `int`, we skip this conversion.

With all these optimizations, here’s our final optimized code:

```java
int[] array = { /* your integers */ }; 

int sum = java.util.Arrays.stream(array).parallel().sum();
```

Although the result itself is not of much use, the journey was worth it. We ventured through several fundamental concepts trying to optimize it to the extreme.

I think this is as far as you can go staying in bounds of the language. Can you go any further?