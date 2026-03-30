---
title: ReentrantLock
date: '2026-01-07 13:26'
updated: '2026-03-29 22:32'
excerpt: 深入讲解CAS原理、ABA问题解决方案、总线风暴，以及ReentrantLock的底层实现机制。
tags:
  - Java
  - JUC
category: Backend
---

## CAS

> CAS 是一种**硬件级别的原子操作**，它比较内存中的某个值是否为预期值，如果是，则更新为新值，否则不做修改。
>
> **工作原理**：
>
> - 比较（Compare）：CAS 会检查内存中的某个值是否与预期值相等。
> - 交换（Swap）：如果相等，则将内存中的值更新为新值。
> - 失败重试：如果不相等，说明有其他线程已经修改了该值，CAS 操作失败，一般会利用重试，直到成功。

### CAS 的优缺点

优点：

- 无锁并发：CAS 操作不使用锁，因此不会导致线程阻塞，提高了系统的并发性和性能。
- 原子性：CAS 操作是原子的，保证了线程安全。

缺点：

- ABA 问题：CAS 操作中，如果一个变量值从 A 变成 B，又变回 A，CAS 无法检测到这种变化，可能导致错误。
- 自旋开销：CAS 操作通常通过自旋实现，可能导致 CPU 资源浪费，尤其在高并发情况下。
- 单变量限制：CAS 操作仅适用于单个变量的更新，不适用于涉及多个变量的复杂操作。

### ABA 问题

ABA 问题是指当变量值从 A 变为 B 再变回 A 时，CAS 操作无法检测到这种变化。解决 ABA 问题的一种常见方法是引入版本号或时间戳，每次更新变量时同时更新版本号，从而检测到变量的变化。

Java 中的 `AtomicStampedReference` 就提供了版本号解决方案，它内部提供了一个 Pair 封装了引用和版本号，利用 `volatile` 保证了可见性。

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1772087337535152129/mvcA75wT_image_mianshiya.png)

在内部 CAS 中，添加了版本号的对比：

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1772087337535152129/Ph924xai_image_mianshiya.png)

这样就避免的 ABA 的问题。简单使用示例如下：

```java
private AtomicStampedReference<Integer> atomicStampedReference = new AtomicStampedReference<>(0, 0);

    public void updateValue(int expected, int newValue) {
        int[] stampHolder = new int[1];
        Integer currentValue = atomicStampedReference.get(stampHolder);
        int currentStamp = stampHolder[0];

        boolean updated = atomicStampedReference.compareAndSet(expected, newValue, currentStamp, currentStamp + 1);
        if (updated) {
            System.out.println("Value updated to " + newValue);
        } else {
            System.out.println("Update failed");
        }
    }
```

Java 还提供了一个 `AtomicMarkableReference` 类，原理和 `AtomicStampedReference` 类似，差别就是它内部只要一个 bool 值，只能表示数据是否被修改过。

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1772087337535152129/XBpKXTks_image_mianshiya.png)

而`AtomicStampedReference` 中的 stamp 是int，可以表现数据被修改了几次。其它原理都是一致的。

### CAS 总线风暴

lock 前缀指令会把写缓冲区中的所有数据立即刷新到主内存中。

在对称多处理器架构下，每个 cpu 都会通过嗅探总线来检查自己的缓存是否过期。如果某个 cpu 刷新自己的数据到主存，就会通过总线通知其它 cpu 过期对应的缓存，这就实现了内存屏障，保证了缓存一致性。

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1772087337535152129/AiNnhu94_image_mianshiya.png)

而通过总线来回通信称为 cache 一致性流量。因为都需要通过总线通信，如果这个流量过大，总线就会成为瓶颈，导致本地缓存更新延迟。

如果 CAS 修改同一个变量并发很高，就会导致总线风暴。这也是 CAS 高并发下的一个性能瓶颈。

---

## AQS

> 简单来说 AQS 就是起到了一个抽象、封装的作用，将一些排队、入队、加锁、中断等方法提供出来，便于其他相关 JUC 锁的使用，具体加锁时机、入队时机等都需要实现类自己控制。
>
> 它主要通过维护一个共享状态（state）和一个先进先出（FIFO）的同步队列，来管理线程对共享资源的访问。
>
> state 用 volatile 修饰，表示当前资源的状态。例如，在独占锁中，state 为 0 表示未被占用，为 1 表示已被占用。
>
> 当线程尝试获取资源失败时，会被加入到 AQS 的同步队列中。这个队列是一个变体的 CLH 队列，采用双向链表结构，节点包含线程的引用、等待状态以及前驱和后继节点的指针。
>
> AQS 常见的实现类有 `ReentrantLock、CountDownLatch、Semaphore` 等等。

### AQS 核心机制

1）状态 **state**：AQS 通过一个 volatile 类型的整数 state 来表示同步状态。子类通过 getState()、setState(int) 和 compareAndSetState(int, int) 方法来检查和修改该状态。

State可以表示多种含义，例如在 ReentrantLock 中，状态表示锁的重入次数；在 Semaphore 中，状态表示可用的许可数。

2）队列 **Queue**：AQS 维护了一个 FIFO 的同步队列，用于管理等待获取同步状态的线程。每个节点（Node）代表一个等待的线程，节点之间通过 next 和 prev 指针链接。当一个线程获取同步状态失败时，它会被添加到同步队列中，并自旋等待或被阻塞，直到前面的线程释放同步状态。

3）独占模式和共享模式：

- 独占模式：只有一个线程能获取同步状态，例如 ReentrantLock。
- 共享模式：多个线程可以同时获取同步状态，例如 Semaphore 和 ReadWriteLock。

### 简单俯瞰 AQS 框架

AQS 整体架构图-（[图来自美团技术](https://tech.meituan.com/2019/12/05/aqs-theory-and-apply.html)）：

![82077ccf14127a87b77cefd1ccf562d3253591.png](https://pic.code-nav.cn/mianshiya/question_picture/1772087337535152129/82077ccf14127a87b77cefd1ccf562d3253591_mianshiya.png)

一般实现类仅需重写图中的 API 层，来控制加锁和入队等时机（仅关注这层就够了，其他 AQS 都封装好了）。具体如何获取到锁由上图第二层的方法提供，如果未获取到锁，则进入排队层。然后上述从 API 层到排队层都依赖数据层提供的支持。

关键方法介绍，子类通过重写这些方法来实现特定的同步器：

1）tryAcquire(int arg)：

尝试以独占模式获取同步状态。由子类实现，返回 true 表示获取成功，返回 false 表示获取失败。

2）tryRelease(int arg)：

尝试以独占模式释放同步状态。由子类实现，返回 true 表示释放成功，返回 false 表示释放失败。

3）tryAcquireShared(int arg)：

尝试以共享模式获取同步状态。由子类实现，返回一个非负数表示获取成功，返回负数表示获取失败。

4）tryReleaseShared(int arg)：

尝试以共享模式释放同步状态。由子类实现，返回 true 表示释放成功，返回 false 表示释放失败。

5）isHeldExclusively()：

判断当前线程是否以独占模式持有同步状态。由子类实现，返回 true 表示当前线程持有同步状态，返回 false 表示没有持有。

### CLH

CLH其实就是一种自旋锁的等待队列的实现。核心思想就是**将**把每个等待线程放入一个逻辑上的链表队列中，每个线程只在自己的节点上自旋等待**，从而减少对同一内存位置的竞争。每个等待线程放入一个逻辑上的链表队列中，每个线程只在自己的节点上自旋等待**，从而减少对同一内存位置的竞争。

通常使用ThreadLocal来维护当前线程的结点对象和当前线程的前驱结点。这样等待的线程从原来对同一个state变量进行CAS导致总线风暴，变成了每个等待线程对其前驱结点的isLocked变量cas。有效避免总线风暴。但仍然时自旋空转，仍然消耗cpu资源。

但是CLH的优点就是：

* 解决了锁饥饿问题，保证公平，维护了一个逻辑上的FIFO链表队列
* 避免出现总线风暴的问题，将并发cas同一个变量替换成了每个线程cas自己对应的变量。

> 对于自旋锁，也就是在获取锁的时候，线程会对一个原子遍历循环执行CAS操作，直到该方法返回成功的时候即为成功获取锁。
>
> **自旋锁的缺点**
>
> 1. 锁饥饿问题。锁竞争记录的情况下，可能存在一个线程一直被其他线程 ⌈插队⌋ 而一直获取不到锁的情况
> 2. 性能问题。锁竞争记录的状态下性能较差

针对自旋锁的问题，演进出一种基于队列的自旋锁即 CLH（Craig, Landin, and Hagersten），它适用于多处理器环境下的高并发场景。

原理是通过维护一个**隐式队列**，使线程在等待锁时自旋在本地变量上，从而减少了对共享变量的争用和缓存一致性流量。

它将争抢的线程组织成一个队列，通过排队的方式按序争抢锁。且每个线程不再 CAS 争抢一个变量，而是自旋判断排在它前面线程的状态，如果前面的线程状态为释放锁，那么后续的线程则抢锁。

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1772087337535152129/sI02tJvg_image_mianshiya.png)

因此，CLH 通过排队按序争抢解决了锁饥饿的问题。通过 CAS 自旋监听前面线程的状态避免的总线风暴问题的产生。

不过 CLH 还是有缺点的：

- 占用 CPU 资源：自旋期间线程会一直占用 CPU 资源，适用于锁等待时间较短的场景。

注意！上面说了 CLH 是通过隐式队列实现的，这里的隐式指的是不同线程之前是没有真正通过指针连接的， 仅仅是利用 AtomicReference + ThreadLocal 实现了隐式关联。

大家可以参考下这个示例代码实现：

```java
public class CLHLock {
    private static class CLHNode {
        volatile boolean isLocked = true; // 默认加锁状态
    }

  	// 通过ThreadLocal维护每个线程的结点和他对应的前驱节点。
    private final ThreadLocal<CLHNode> currentNode;
    private final ThreadLocal<CLHNode> predecessorNode;
  	// 通过AtomicReference原子性地修改引用
    private final AtomicReference<CLHNode> tail;
  

    public CLHLock() {
        this.currentNode = ThreadLocal.withInitial(CLHNode::new);
        this.predecessorNode = new ThreadLocal<>();
        this.tail = new AtomicReference<>(new CLHNode());
    }

    public void lock() {
        CLHNode node = currentNode.get();
        CLHNode pred = tail.getAndSet(node);
        predecessorNode.set(pred);

        // 自旋等待前驱节点释放锁
        while (pred.isLocked) {
        }
    }

    public void unlock() {
        CLHNode node = currentNode.get();
        node.isLocked = false; // 释放锁
        currentNode.set(predecessorNode.get()); // 回收当前节点
    }
}
```

### AQS 对 CLH 的改造

CLH虽然保证了公平，避免了总线风暴的问题，但是线程仍然在不断cas尝试，cpu仍然在空转消耗资源。这对于长任务场景下代价是很大的，不如阻塞。

所以AQS首先是：

1. 引入了park阻塞以及waitStatus，扩展每个结点的状态，比如默认=0，CANCELLED = 1（这个节点已经作废，不再参与竞争。比如线程等待过程中被中断，发生异常退出等。）， SIGNAL = -1（表示当前线程释放锁时需要唤醒他后面的线程），CONDITION = -2（表示这个节点在“条件队列”里，不在同步队列），PROPAGATE = -3（只用于共享锁，表示共享锁需要向后传播唤醒）
2. 通过state状态变量，引入了两种锁管理状态。独占模式和共享模式
3. 显示维护一个基于双向链表的队列，**尾部加入节点**通过 CAS 保证线程安全。前后指针能干更方便快速定位前后节点，并且引入前驱指针能在出现CANCELLED时快速调整链表（因为一个线程在park前必须确保他的前驱结点能唤醒他也就是需要判断他的前驱结点是SIGNAL，需要执行shouldParkAfterFailedAcquire方法，如果没有前驱指针根本找不到结点）
4. 支持中断，超时以及条件队列。比如调用await时释放锁，进入条件队列，然后park自己。等线程调用signal时回去条件队列找第一个结点，然后修改waitState重新加入同步队列

> 三个方面改进的了 CLH 锁的数据结构：
>
> 1. 扩展每个节点的状态
> 2. 显式的维护前驱节点和后继节点
> 3. 出队节点显式的设置为 null 等辅助 GC 的优化。
>
> ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/n1nfa5YconXc824K_mianshiya.webp)

因为 CLH 有占用 CPU 资源问题，因此 AQS 将自旋等待前置节点改成了阻塞线程。

而后续的线程阻塞就无法主动发现前面的线程释放锁，因此前面线程需要需要通知后续线程锁被释放了。

所以 AQS 的变型版 CLH 需要显式地维护一个队列，且是一个双向列表实现，因为前面线程需要通知后续线程。

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1772087337535152129/G3m5Z1I3_image_mianshiya.png)

且前面线程如果等待超时或者主动取消后，需要从队列中移除，且后面的线程需要“顶”上来。

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1772087337535152129/RVehD6XX_image_mianshiya.png) 在 AQS 中，线程的等待状态有以下几种：

- 0，初始化的时候的默认值

- CANCELLED，值为 1，由于超时、中断或其他原因，该节点被取消

- SIGNAL，值为 -1，表示该节点准备就绪，正常等待资源

- CONDITION，值为 -2，表示该节点位于条件等待队列中

- PROPAGATE，值为 -3，当处在 SHARED 情况下，该字段才有用，将 releaseShared 动作需要传播到其他节点

  - 如果 `waitStatus > 0`， 则表明节点的状态已经取消等待获取资源

  - 如果 `waitStatus < 0`, 则表明节点的处于有效的等待时间

---

## ReentrantLock

> ReentrantLock 其实就是基于 AQS 实现的一个可重入锁，支持公平和非公平两种方式。
>
> 内部实现依靠一个 state 变量和两个等待队列：同步队列和等待队列。
>
> 利用 CAS 修改 state 来争抢锁。
>
> 争抢不到则入同步队列等待，同步队列是一个双向链表。
>
> 条件 condition 不满足时候则入等待队列等待，是个单向链表。
>
> 是否是公平锁的区别在于：线程获取锁时是加入到同步队列尾部还是直接利用 CAS 争抢锁。
>
> ![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1772087337535152129/VWa8SBRY_image_mianshiya.png)

---







