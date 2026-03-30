---
title: synchronized
date: '2026-01-05 14:17'
updated: '2026-03-29 22:32'
excerpt: 深入讲解synchronized的实现原理，包括对象头Mark Word结构及偏向锁、轻量级锁、重量级锁的升级过程。
tags:
  - Java
  - JUC
category: Backend
---

## synchronized

> `synchronized` 实现原理依赖于 JVM 的 Monitor（监视器锁） 和 对象头（Object Header）。
>
> 当 `synchronized` 修饰在方法或代码块上时，会对特定的对象或类加锁，从而确保同一时刻只有一个线程能执行加锁的代码块。
>
> - **synchronized 修饰方法**：会在方法的访问标志中增加一个 `ACC_SYNCHRONIZED` 标志。每当一个线程访问该方法时，JVM 会检查方法的访问标志。如果包含 `ACC_SYNCHRONIZED` 标志，线程必须先获得该方法对应的对象的监视器锁（即对象锁），然后才能执行该方法，从而保证方法的同步性。
> - **synchronized 修饰代码块**：会在代码块的前后插入 `monitorenter` 和 `monitorexit` 字节码指令。可以把 `monitorenter` 理解为加锁，`monitorexit`理解为解锁。

### 对象头（Object Header）

在Java中，对象的内存布局分为：对象头，对象实例以及内存填充。

而对象头中就包含Mark Word，Klass Pointer以及数组长度(这个只有数组才有)。

- Mark Word：用于存储对象的运行时数据，包括锁状态、哈希码、GC 分代信息等。
- Klass Pointer：指向对象所属类的元数据，帮助 JVM 通过它确定对象的类型，能访问哪些方法，字段，父类信息等。也就是说Java 的 **动态绑定、反射、类型检查** 都依赖这个指针

> 关于Klass Pointer：对象头中有 **Klass Pointer**，指向对象所属类方法区中的元信息。
>
> 比如说：
> ```java
> class A {
>     int x;
>     void hello() { System.out.println("Hi"); }
> }
> 
> A a = new A();
> ```
>
> 当我们调用a.hello()时，JVM会通过这个指针找到A的方法表，从而执行正确的方法。
>
> 每个对象都有自己的对象头，但Klass Pointer **指针指向的元信息是共享的**。也就是说：即使创建了 100 个 `A` 的实例，它们的 Klass Pointer 都指向同一个 `A` 类元数据。

Mark Word 是实现 synchronized 的关键，因为它会根据锁的状态保存不同的信息，具体包括：

- 未锁定状态：Mark Word 存储对象的哈希码和 GC 分代信息。
- 偏向锁状态：Mark Word 保存获取该锁的线程 ID 和一些偏向锁标志位。
- 轻量级锁状态：Mark Word 存储的是指向栈中锁记录的指针。
- 重量级锁状态：Mark Word 存储的是指向 Monitor 对象的指针。

![img](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/6v5xDiuq_image_mianshiya.png)

---

### 锁升级

因为synchronized不同于ReentrantLock这类锁通过cas，volatile等修改状态变量state来表达上锁这个状态。synchronized需要调用操作系统底层原语mutex来上锁。需要操作系统从用户态切换到内核态，并涉及线程的阻塞和唤醒，而这些操作都需要频繁线程上下文切换。所以之前的synchronized很笨很重。

所以JDK1.6之后对synchronized进行了优化，引入了锁升级。从无锁->偏向锁->轻量级锁->重量级锁

#### 偏向锁

在没有锁竞争的情况下，锁总是“偏向”于第一个获得它的线程。偏向锁通过减少不必要的 CAS 操作来提高性能。

- 加锁过程：当线程第一次请求锁时，JVM 会将该线程的 ID 记录在对象头的 Mark Word 中，表示锁偏向于该线程。后续该线程再进入该锁时，无需进行额外的同步操作。
- 撤销偏向锁：如果在偏向锁持有期间，另一个线程请求同一把锁，JVM 会撤销偏向锁，并升级为轻量级锁。

> 在JDK15以后偏向锁就被删除了，原因是随着多核 CPU 和高并发应用的普及，偏向锁的性能优势逐渐变得不明显。**在多线程竞争严重的情况下，偏向锁会引发较多的撤销和重偏向操作，反而对性能产生负面影响**。

#### 轻量级锁

轻量级锁适用于多个线程短时间内争用同一锁的场景。

- 加锁过程：当线程进入同步块时，JVM 会在当前线程的栈帧中创建一个锁记录（Lock Record），并将对象头中的 Mark Word 拷贝到锁记录中。线程尝试使用 CAS 操作将对象头中的 Mark Word 更新为指向锁记录的指针。如果成功，则表示该线程获取了锁；如果失败，则表示其他线程已经持有该锁，此时锁会升级为重量级锁。
- 解锁过程：线程退出同步块时，JVM 会将对象头中的 Mark Word 恢复为原始值。

#### 重量级锁（Heavyweight Locking）

当锁竞争激烈时，JVM 会升级为重量级锁，重量级锁使用操作系统的**互斥量（Mutex）** 机制来实现线程的阻塞与唤醒。

- 加锁过程：如果线程无法通过轻量级锁获取锁，JVM 会将该锁升级为重量级锁，并将当前线程阻塞。
- 解锁过程：当线程释放重量级锁时，JVM 会唤醒所有阻塞的线程，允许它们再次尝试获取锁。

**锁升级总结**：

- **偏向锁**：当一个线程第一次获取锁时，JVM 会将该线程标记为“偏向”状态，后续若该线程再获取该锁，几乎没有开销。
- **轻量级锁**：当另一个线程尝试获取已经被偏向的锁时，锁会升级为轻量级锁，使用 CAS 操作来减少锁竞争的开销。
- **重量级锁**：当 CAS 失败无法获取锁，锁会升级为重量级锁，线程会被挂起，直到锁被释放。

---

### Synchronized 的可重入性

和ReentrantLock一样，synchronized也是可重入的，基于锁监视器moniter里的_recursions字段，每获取一次锁，计数器加一，释放锁时，计数器减一，直到计数器为 0，锁才会真正释放。

---

### 锁消除和锁粗化

- **锁消除**：JVM 会通过逃逸分析判断对象是否只在当前线程使用，如果是，那么会消除不必要的加锁操作。
- **锁粗化**：当多个锁操作频繁出现时，JVM 会将这些锁操作合并，减少锁获取和释放的开销。

---

### 偏向锁实现原理

> 偏向锁解决的是只有一个线程来抢锁的情况，此时因为只有他一个线程执行任务，没有其他线程来抢，那我就不执行上锁操作

如果当前锁对象支持偏向锁，那么就会通过 CAS 操作：将当前线程的地址(也当做唯一ID)记录到 markword 中，并且将标记字段的最后三位设置为 101。之后有线程请求这把锁，只需要判断 markword 最后三位是否为 101，是否指向的是当前线程的地址。



再次附上此图：

![img](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/LKhjnxU3_image_mianshiya.png)

---

### 轻量级锁实现原理

> **轻量级锁考虑的是锁竞争的线程不多，线程持有锁时间不长的情况**

当只有一个线程来抢锁的时候，就是偏向锁，线程会cas地将该对象头里的Mark Word里记录当前线程的ID，并且将标志字段后三位设置为101，表示是偏向锁。

当有第二个线程来获取锁的时候，此时线程就会发现当前偏向锁已经被其他线程占有了。此时就会触发**偏向锁撤销**

需要注意的是**偏向锁撤销**  != 释放已获取偏向锁的线程的锁。

1. 在短暂的STW之后
2. 会校验之前获取偏向锁的线程是否还持有锁
   * 如果持有
     * 升级为轻量级锁
     * 第二个线程通过cas自旋获取锁
   * 如果不持有了
     * 则会撤销偏向
     * 回到无锁/可重新偏向

> 1. 短暂stw的原因在于JVM需要安全确认：之前获取偏向锁的线程此刻是否仍在这个 synchronized 临界区内。这个信息不在Mark Word里，而是在该线程的栈帧里。所以需要判断是否还存在对应的 **Lock Record / monitorenter 语义状态**。不 STW线程可能正好在 **退出同步块 / 进入同步块**
> 2. 随后会基于stw间的判断来决定下一步行动。
>    * 如果确认线程已经不在同步块，那么就不升级为轻量级锁，会撤销当前的偏向锁，对象头标志回到001，然后第二个线程可以重新偏向
>    * 如果还在同步块里，那就会升级为轻量级锁，然后第二个线程开始cas自旋。

**轻量级锁在上锁**的时候，如果判断当前处于无锁状态，会在当前线程栈的当前栈帧中划出一块叫 LockRecord 的区域，然后把锁对象的 MarkWord 拷贝一份到 LockRecord 中称之为 dhw里。然后通过 CAS 把锁对象头指向这个 LockRecord 。

![img](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/dhI1dsdp_image_mianshiya.png)

如果当前是有锁状态，并且是当前线程持有的，则将 null 放到 dhw 中，这是重入锁的逻辑。

**轻量级锁在解锁**的时候，就会查看栈帧中保存的dhw，如果是null则代表是冲入的，则直接弹出去然后返回。如果是当前锁对象的markword，那么会通过cas再换回去。cas成功则释放成功，失败则升级成重量级锁。

![img](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/02ikizuD_image_mianshiya.png)

![img](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/GSfzWZKa_image_mianshiya.png)

> 关于这个轻量级加锁再多说几句。
>
> 每次加锁肯定是在一个方法调用中，而方法调用就是有栈帧入栈，如果是轻量级锁重入的话那么此时入栈的栈帧里面的 dhw 就是 null，否则就是锁对象的 markword。
>
> 这样在解锁的时候就能通过 dhw 的值来判断此时是否是重入的。
>
> 还有就是轻量级锁的cas自选，是适应性自旋，自选时间由上一个线程自旋的时间决定

---

### 重量级锁

当第二个线程持续cas获取锁失败，或者当锁竞争更激烈的时候，就会升级为重量级锁。

关于synchronized有几点补充：

1. 当synchronized修饰代码块的时候，编译成字节码就是monitor enter和monitor exit。

   * monitorenter就是加锁，加锁会释放**LoadLoad和LoadStore**这两个内存屏障，确保（总的来说就是强制从主存中读数据，确保**读到的都是最新的数据**）
     * 禁止后续读重排到前面读之前，保证**加锁后能看到其他线程释放锁时写入的最新值**
     * 禁止后续写重排到前面读之前，保证**加锁后对共享变量的写操作不会越界到加锁前**
   * monitorexit就是释放锁，释放锁时会释放**StoreStore和StoreLoad**屏障，确保（总的来说就是强制将cpu缓存中的变量刷新到主存中，确保**修改对其他线程立刻可见**）
     * 禁止前面的写重排到后面写之后，保证**临界区内的写在释放锁之前完成并可见**
     * 禁止前面的写重排到后续读之前，保证临界区内写对后续线程立即可见，建立 **happens-before** 关系
   * 而monitorenter和monitorexit这两个指令又是通过JMM的**hanpens-before**规则约束的，由java来确保对同一把锁的 monitorexit一定happens-before后续对这把锁的 monitorenter
   * synchronized就是这样**通过内存屏障来确保有序性和可见性，通过加锁来保证原子性**
2. 当synchronized修饰方法的时候，编译成字节码就和修饰代码块不一样，他会为方法的ACC_FLAG标志添加上ACC_SYNCHRONIZED。当要访问某个被synchronized修饰的方法时，JVM就通过这个知道这是被synchronized修饰的方法就会对方法进行加锁。

   > 当然加锁的流程其实和修饰代码块大同小异，只是修饰方法时不会被编译成monitor enter和monitor exit字节码显式指令，而是JVM在方法的入口和返回处调用

#### 锁监视器 ObjectMonitor

在HotSpot里这个ObjectMonitor是用c++写的，主要的字段有：
```c++
ObjectMonitor(){
  _recursions = 0; // 重入次数
  _object = NULL; // 存储锁对象
  _owner = NULL; // 拥有锁的线程
  _WaitSet = NULL; // 调用wait()方法的线程
  _cxq = NULL; // 多个线程争抢锁会先存到这个列表中
  _EntryList = NULL; // 这个列表也是存储锁竞争失败的线程
}
```

加锁主要流程就是

1. 通过CAS将owner设置为当前线程。如果发现owner就是当前线程则是重入，recursions ++。设置成功就代表锁获取成功
2. 如果当前owner是其他线程，那么就会获取锁失败。失败后不会立刻被阻塞(因为阻塞需要操作系统切换到内核态，增加线程上下文切换的开销)，会先尝试CAS一次，然后自适应自旋。如果还是失败，就会被包装成ObjectWaiter，然后塞入队列中，然后再尝试获取一次锁，如果再失败就乖乖被阻塞。

解锁的主要流程就是

1. 解锁时判断owner是否是当前线程，如果是recursions --。如果recursions不等于0，则说明是可重入锁。这里会直接返回。recursions等于0时才释放锁







