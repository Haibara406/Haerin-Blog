---
title: "ThreadLocal"
date: "2026-03-09"
excerpt: "ThreadLocal"
tags: ["Thread", "Java"]
category: "Backend"
---

## ThreadLocal

> `ThreadLocal` 提供了一种线程内独享的变量机制，使每个线程都能有自己独立的变量副本。每个线程内部维护一个 `ThreadLocalMap`，这个 `ThreadLocalMap` 用于存储线程独立的变量副本。`ThreadLocalMap` 以 `ThreadLocal` 实例作为键，以线程独立的变量副本作为值。不同线程通过 `ThreadLocal` 获取各自的变量副本，而不会影响其他线程的数据。

在每个线程内部也就是Thread内部都定义了一个变量即ThreadLocal.ThreadLocalMap，使得每个Thread对象都能够拥有自己的存储map。

### 为什么ThreadLocalMap要定义在ThreadLocal里而不是Thread里？

其实原因很简单，因为ThreadLocalMap只是一个工具，提供给Thread，使得Thread在并发环境下能够存储自己的数据备份，而无需像传统的锁那样，访问共享资源时需要上锁，而是自己就有一份数据备份。

所以ThreadLocalMap对于Thread而言就是一个扩展工具，而不是必须，如果定义在Thread里，反而是Thread 反过来依赖 ThreadLocal 的概念，因为Thread 不应该“知道太多 ThreadLocal 的实现细节”。

ThreadLocalMap内部有一个Entry数组，而Entry继承了WeakReference弱引用，使用ThreadLocal类型的变量作为key，并且对key调用了super的构造方法，所以key是弱引用，value是强引用。

### TreadLocal如何get？

1. 首先通过Thread.currentThread()获取当前线程
2. 传入当前线程thread，调用getEntry(thread)方法，获得对应的Entry
   1. 在getEntry方法中，首先通过key.threadLocalHashCode获取key对应hash值，然后& (table.length - 1)获得对应数组下标
   2. 拿到对应下标下的Entry
      1. 如果当前entry不为null，并且key = entry.get()即entry里对应的key与传入的threadlocal对象一致，这直接返回
      2. 否则的话就调用getEntryAfterMissing方法，因为此时可能有两种情况：1. 出现hash冲突 2. 确实没有这个key
         1. 从刚才判断的下标开始，逐一比对key
         2. 如果找到了即key == entry.get()，就直接返回
         3. 如果遍历到了为null的key，就顺便清理这个Entry
            1. 实现也很简单，就是把entry的value设置为null然后size--，这样value就会被gc回收
            2. 然后继续往后遍历，知道entry为null，否则则会判断entry.get()是否为null，为null就继续清理
         4. 如果确实没找到则返回null

从中可以看到ThreadLocal处理hash冲突采用的是线性探测法，即如果出现hash冲突就往后判断当前位置是否有位置，直到找到空位则填充进去。

而HashMap等使用的是拉链法，即出现hash冲突的地方则把value包装成node，组成链表，但链表达到一定长度后再升级成红黑树。

### ThreadLocal如何set？

1. 首先也是通过threadLocalHashCode获取key的哈希值，然后& (table.length - 1)获取到对应的数组下标
2. 然后从这个下标开始遍历Entry数组
3. 如果判断到传入的key == entry.get()则直接更新value然后return
4. 如果entry.get()为null，则直接覆盖这个null值（相当于是回收了key为null的位置）然后返回
5. 遍历到数组最后后，新建一个entry存储key-value
6. 然后判断是否Entry长度是否达到阈值，如果达到阈值则执行扩容逻辑

### ThreadLocal的缺点

1. ThreadLocal的生命周期和Thread的生命周期绑定，而线程频繁的创建和销毁很浪费资源，所以一般都是使用线程池，线程池里的核心线程不会被销毁，所以对应的ThreadLocal会一直存在，因此ThreadLocal值就不会被gc回收，可能就会导致内存泄露
2. ThreadLocalMap处理hash冲突使用的是线性勘测法，这种方法的效率很低，
3. ThreadLocal为了避免内存泄漏在get和set方法中遇到了为null的key都会主动清理

### ThreadLocal如何正确使用

1. 需要在合适的时候调用remove方法手动清理，避免内存泄漏，如可以使用try-finally结构，finally中使用remove方法
2. ThreadLocal变量使用static修饰，以确保同一个线程的局部变量在线程的生命周期内都可以被访问，避免对象频繁创建。
3. 使用ThreadLocal.withInitail(() -> 0)来赋予初始值，避免第一次get时出现空指针
4. 尽量将使用范围限制在小的上下文，避免在ThreadLocal存储大对象

### ThreadLocal为什么容易内存泄漏

究其原因threadlocal内存泄漏是发生在value上。为什么呢？

因为对于key会有这样一条引用链

```mathematica
GC Root -> Thread -> Thread.threadLocals -> Entry ── WeakReference ──> ThreadLocal(key)（已被 GC）
```

由于entry -> key这一段是弱应用，当由于ThreadLocal在正常使用时是强引用，如：ThreadLocal<User> tl = new ThreadLocal<>();此时tl就是ThreadLocal的强引用，那么即便Entry -> key(这个key也就是当前ThreadLocal)是弱引用，只有tl被至为null时，此时key只剩entry的弱引用，下次gc时就会被回收掉，而value是这样的

```mathematician
GC Root
  ↓
Thread（线程池线程，长期存活）
  ↓
Thread.threadLocals
  ↓
Entry
  ↓
value（强引用）   ← 泄漏点
```

value是强引用，不会被回收掉，导致entry里出现大量key为null的键值对，只要Thread不死，就一直存在这样一条强引用链指向value。

在正常的线程中，线程执行完任务就会被销毁，但是在线程池的场景下，线程不会被销毁，而是会被复用，导致value一直无法被gc。

那为什么value不能设置为弱引用吗？如果value也是弱引用那就炸了，因为我可能刚存进去现在还没来得及使用，value就已经被gc回收了。

> 关于key是弱引用的补充：首先ThreadLocalMap里的key是ThreadLocal实例对象，相当于是entry对于所存的key也就是ThreadLocal实例对象是弱引用。entry从一出生就只会以弱引用的方式指向ThreadLocal，所以在执行ThreadLocal.get/ThreadLocal.set时，当传入对应key也就是ThreadLocal实例时，entry对这个key就是弱引用。而此时ThreadLocal对象的强引用就是对应的ThreadLocal引用实例即ThreadLocal<User> tl = new ThreadLocal<>()，此时tl就是强引用。

### 在线程池场景下，ThreadLocal除了可能会导致内存泄漏，还会出现哪些问题

在线程池环境下，线程通常是核心线程，会长期存在并被不断复用。由于ThreadLocalMap是Thread对象的成员变量，因此它的生命周期与线程相同。

如果开发者在一次任务执行过程中向ThreadLocal中set了一些数据，但在任务结束时没有调用remove清理，就会产生两个问题。

第一个问题是内存泄漏。

由于线程池中的线程不会销毁，ThreadLocalMap也不会销毁，Entry中的value可能会一直存在。随着系统运行时间变长，这些残留数据会不断累积，占用大量内存。

第二个问题是数据污染，也就是线程复用导致的上下文错乱。

例如：
 线程T1执行请求A
 ThreadLocal.set(userId = 张三)

请求结束后没有remove。

线程T1随后被线程池复用去执行请求B。

此时如果业务代码调用：
 ThreadLocal.get()

就可能读到之前遗留的“张三”的数据，而当前请求其实是“李四”。这就会导致严重的业务错误，例如用户数据串号、权限错误、日志上下文错乱等问题。

因此在使用ThreadLocal时，尤其是在Web应用和线程池场景下，一般都会在finally块中调用remove，确保当前请求使用完的数据被及时清理。

### ThreadLocal的key为什么不直接设置成强引用

ThreadLocal对象本身并不真正存储数据，它只是一个“访问入口”。真正的数据存储在Thread对象内部的ThreadLocalMap中。

ThreadLocalMap的底层结构是一个Entry数组。Entry的结构是：
 key -> WeakReference<ThreadLocal>
 value -> Object

也就是说，key是ThreadLocal对象的弱引用，value是实际存储的数据。

如果key设计成强引用，会产生一个严重问题。Thread对象持有ThreadLocalMap，ThreadLocalMap持有Entry数组，而Entry又强引用ThreadLocal对象。这样就形成了一个引用链：
 Thread -> ThreadLocalMap -> Entry -> ThreadLocal

即使业务代码中已经不再持有ThreadLocal的引用，例如：
 ThreadLocal local = new ThreadLocal();
 local = null;

由于ThreadLocalMap中仍然强引用这个ThreadLocal对象，GC无法回收它。结果是：
 ThreadLocal对象无法回收
 Entry无法清理
 value也无法释放
 最终导致内存泄漏。

为了避免这种情况，JDK将Entry中的key设计成WeakReference。当外部代码不再引用ThreadLocal对象时，GC可以回收这个ThreadLocal，此时Entry中的key会变成null，但value仍然存在。

当之后调用ThreadLocal的get、set、remove等操作时，ThreadLocalMap会顺便清理这些key为null的Entry。这种清理方式叫做惰性清理。

但需要注意的是，弱引用只能保证ThreadLocal对象可以被回收，而value仍然可能存在。如果线程长期不访问这个ThreadLocalMap，value仍然可能长期存在，因此在实际开发中仍然需要手动调用remove来清理ThreadLocal中的数据。

value不能设置成弱引用的原因在于，我可能目前只是存储值，并不是马上要用，如果我没有立刻用，也就是没有立刻赋值给外部强引用，很可能随时会被GC回收。可能会出现业务异常。

### InheritableThreadLocal

这是可以跨线程使用的ThreadLocal，子线程在创建时会**复制**父线程的InheritableThreadLocal。然后使用父线程在此之前内部存的数据。

需要注意的是：是复制而不是共享，意思是说后续父线程发生变更是不会同步更新的。

还有就是他只会在new Thread的时候执行一次复制。

因此对于线程池的场景就无法生效，因为线程池里的线程早就创建好了。

### 为什么Netty要重新设计一个FastThreadLocal

Netty重新设计ThreadLocal主要是为了提升性能，并解决JDK ThreadLocal在高并发网络框架中的一些效率问题。Netty实现的版本叫FastThreadLocal。

JDK的ThreadLocal底层是ThreadLocalMap，其结构是一个Entry数组。每个Entry包含WeakReference<ThreadLocal>作为key，以及Object作为value。

访问ThreadLocal中的数据时，大致流程是：
 根据ThreadLocal内部的threadLocalHashCode计算数组索引
 定位Entry数组中的槽位
 如果发生哈希冲突，则通过线性探测继续查找
 找到Entry后再比较key是否等于当前ThreadLocal对象

因此JDK的ThreadLocal访问过程涉及：
 哈希计算
 数组查找
 冲突处理
 Entry对象访问
 过期Entry清理

虽然平均复杂度是O(1)，但在冲突较多或Entry较多时，可能退化为O(n)。

Netty的FastThreadLocal采用了一种完全不同的设计思路。它不使用Map结构，而是直接使用数组下标来存储数据。

FastThreadLocal在创建时会分配一个全局唯一的index，这个index是通过一个全局AtomicInteger递增生成的。例如：
 第一个FastThreadLocal index=0
 第二个FastThreadLocal index=1
 第三个FastThreadLocal index=2

每个线程内部都有一个InternalThreadLocalMap对象，其中维护一个Object类型的数组：
 Object[] indexedVariables

数组中的每个位置对应一个FastThreadLocal变量。例如：
 index 0 -> 第一个FastThreadLocal的值
 index 1 -> 第二个FastThreadLocal的值
 index 2 -> 第三个FastThreadLocal的值

当调用FastThreadLocal.set(value)时，流程是：
 获取当前线程
 获取线程内部的InternalThreadLocalMap
 通过FastThreadLocal持有的index直接访问数组
 执行array[index] = value

当调用get()时，也是直接读取：
 value = array[index]

整个访问路径是：
 FastThreadLocal -> index -> Thread -> InternalThreadLocalMap -> Object[index]

这种设计完全避免了：
 哈希计算
 HashMap结构
 Entry对象
 哈希冲突
 线性探测

因此访问复杂度是稳定的O(1)，性能明显优于JDK的ThreadLocal，特别是在高并发和频繁访问ThreadLocal的网络框架中。

为了支持这种设计，Netty还让线程使用特殊的FastThreadLocalThread，使线程可以直接持有InternalThreadLocalMap，从而进一步减少访问开销。

FastThreadLocal中的数组元素类型是Object，而不是Entry对象，这也减少了对象层级，提高了访问效率。

另外FastThreadLocal的index是全局递增的，而不是每个线程单独分配。这是因为如果每个线程自己分配index，那么FastThreadLocal对象就无法确定自己在不同线程中的数组位置，就必须额外维护一个Thread到index的映射关系，例如Map<Thread,index>，这样就会重新引入HashMap查找，从而失去数组直接访问的性能优势。

因此Netty选择使用全局递增的index，使所有线程的数据布局一致，每个FastThreadLocal在所有线程中的数组位置都相同，从而可以通过数组下标直接定位数据，实现最快的访问速度。

不过这种设计也存在一个副作用。由于index是全局递增的，如果系统创建了非常多的FastThreadLocal对象，那么每个线程内部的数组可能被迫扩容到很大的长度，即使其中大部分位置并没有被使用。这也是FastThreadLocal的一种性能与空间之间的权衡。





