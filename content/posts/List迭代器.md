---
title: "List迭代器"
date: "2026-03-05"
excerpt: "**Iterator** 是 Java 集合框架提供的统一遍历接口，不管底层是 ArrayList、LinkedList 还是 HashSet，都能用同一套 API 依次访问每个元素，完全不用关心集合内部是数组还是链表。"
tags: ["Java"]
category: "Backend"
---

**Iterator** 是 Java 集合框架提供的统一遍历接口，不管底层是 ArrayList、LinkedList 还是 HashSet，都能用同一套 API 依次访问每个元素，完全不用关心集合内部是数组还是链表。

核心方法就三个：

1. `hasNext()` 判断还有没有下一个元素
2. `next()` 取出下一个元素
3. `remove()` 删除刚刚取出的那个元素

```java
List<String> list = new ArrayList<>(Arrays.asList("A", "B", "C"));
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String item = it.next();
    if ("B".equals(item)) {
        it.remove();  // 安全删除，不会报错
    }
}
```

为什么要用 Iterator 而不是普通 for 循环删除？因为在遍历过程中用 `list.remove()` 直接删元素会触发 **fail-fast** 机制，抛 ConcurrentModificationException。Iterator 的 `remove()` 内部会同步修改计数器，所以不会报错。

`fail-fast` 和 `fail-safe` 是 **Java 集合在遍历时面对“并发修改”时的两种策略**。

一句话简单概括一下就是：

* fail-fast：一旦发现集合被修改，立刻抛异常
* fail-safe：遍历的是副本，允许修改原集合

### fail-fast

集合内部，比如ArrayList 都有个 `modCount` 字段，每次 add、remove 操作都会让这个计数器加 1。创建 Iterator 的时候，会把当前 modCount 值存一份叫 `expectedModCount`。

每次调用 `next()` 或者是在使用for-each遍历时都会检查 `modCount == expectedModCount`，一旦发现不相等，说明有人在迭代器背后偷偷改了集合，直接抛ConcurrentModificationException异常。

terator 的 `remove()` 之所以安全，是因为它删完元素后会把 `expectedModCount` 同步更新成最新的 `modCount`。

fail-fast 检测流程： 

1）ArrayList 内部维护 modCount，每次结构修改 +1 

2）iterator() 创建迭代器时，保存 expectedModCount = modCount 

3）每次 next() 调用前检查 modCount == expectedModCount 

4）如果不相等，抛出 ConcurrentModificationException 

5）Iterator.remove() 删除后同步更新 expectedModCount = modCount

> Fail-fast的特点就是：检测到修改就报错，不允许并发修改，快速发现程序错误。
>
> Java大部分集合都是fail-fast，比如ArrayList，LinkedList，HashMap，HashSet，TreeMap等

### fail-safe

java.util.concurrent 包下的集合用的是 fail-safe 机制，比如 CopyOnWriteArrayList。

CopyOnWriteArrayList 原理是迭代器遍历的是集合的快照副本，不管你怎么改原集合，迭代器看到的都是创建时的数据。代价是内存开销大，而且看不到遍历期间的新增数据。

| 特性             | fail-fast          | fail-safe            |
| ---------------- | ------------------ | -------------------- |
| 代表集合         | ArrayList、HashMap | CopyOnWriteArrayList |
| 遍历期间能否修改 | 不能，抛异常       | 能，但看不到修改     |
| 内存开销         | 低                 | 高，需要复制         |
| 适用场景         | 单线程、读多写少   | 多线程并发           |

> fail-safe的特点就是：允许并发修改，不会抛异常，但是基于COW需要复制数据，对内存和性能开销较大。
>
> 常见的使用fail-safe的集合：CopyOnWriteArrayList，CopyOnWriteArraySet

### ListIterator 双向遍历

普通 Iterator 只能往前走，而List结构还有一种迭代器ListIterator，他可以实现前后双向移动，还能在遍历时修改和插入元素。

```java
List<String> list = new ArrayList<>(Arrays.asList("A", "B", "C"));
ListIterator<String> it = list.listIterator();

// 正向遍历
while (it.hasNext()) {
    System.out.println(it.next());
}

// 反向遍历
while (it.hasPrevious()) {
    System.out.println(it.previous());
}

```

额外支持的方法： 

1）`hasPrevious()` / `previous()` 向前遍历 

2）`set(E e)` 替换当前元素 

3）`add(E e)` 在当前位置插入元素 

4）`nextIndex()` / `previousIndex()` 获取索引

### Q&A

#### 为什么会有fail-fast 这些机制？换句话说为什么迭代器不允许在遍历期间有修改？

原因其实在于集合在修改时，比如说删除，或者是插入，都会修改集合结构。而迭代器遍历是维护的索引，但结构发生变化时索引上的元素可能会发生变化，导致一些问题。

因此fail-fast在检测到有修改时，就会直接抛异常，以避免未知的错误。

那为什么迭代器的remove等方法不会影响？因为他会修改expectedModCount，并且修改维护的索引状态。

因此删除集合元素时，推荐方向遍历，因为这样删除时不会影响到未遍历到的索引。或者是使用迭代器进行删除。

#### ConcurrentModificationException 是不是只有多线程才会出现？

单线程也会出现。只要在遍历过程中通过集合本身的 add/remove 方法修改结构，就会触发。这个异常名字里带 Concurrent 容易让人误解，其实跟多线程没有必然关系，核心是 modCount 检查不通过。

#### CopyOnWriteArrayList 的迭代器为什么不支持 remove 操作？

因为它的迭代器遍历的是创建时的快照数组，这个数组是只读的。remove 操作需要修改原集合，但快照和原集合已经是两个独立的数组了，没法通过迭代器去改原数据。想删除只能直接调用集合的 remove 方法。

#### 遍历 LinkedList 时用 for 循环和 foreach 性能差多少？

差距非常大。for 循环用 get(i) 访问 LinkedList，每次都要从链表头或尾遍历到目标位置，单次 O(n)，遍历整个链表就是 O(n²)。10 万个元素的链表，for 循环可能要跑好几秒。foreach 用迭代器内部维护当前节点引用，next() 直接拿下一个节点，单次 O(1)，整体 O(n)，几毫秒就完事。实际项目里遍历 LinkedList 一定要用 foreach 或迭代器，用索引访问就是自己给自己挖坑。
