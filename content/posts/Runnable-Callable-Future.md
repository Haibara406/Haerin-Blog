---
title: Runnable-Callable-Future
date: '2026-03-02'
excerpt: 对比Runnable、Callable、Future三者的区别，并详解FutureTask的状态机与cancel/get方法实现。
tags:
  - Java
  - JUC
category: Backend
---

| 名称         | 定义                                               | 返回值     | 是否可抛异常                                                 |
| ------------ | -------------------------------------------------- | ---------- | ------------------------------------------------------------ |
| **Runnable** | 任务接口，表示可运行的任务                         | `void`     | 不允许抛检查型异常（只能捕获或抛出 `RuntimeException` / `Error`） |
| **Callable** | 泛型任务接口，表示可以返回结果的任务               | 泛型 `<V>` | 允许抛任何异常                                               |
| **Future**   | 任务的结果代表，可以用来获取任务执行结果或取消任务 | 泛型 `<V>` | 由 `Callable` 抛出的异常会在 `get()` 时封装成 `ExecutionException` |

**为什么Callable能抛受检异常，而Runnable不行？**

* 原因在于Callable的call方法声明了`throws Exception`，因此编译器允许抛受检异常
* 而 Runnable 的 `run()` 没有 `throws`，所以编译器不允许

**Future 如何获取结果、判断状态、取消任务**

首先我们通常配合线程池使用，比如

`Future<Integer> future = executor.submit(callableTask);`

在submit提交了任务后，会将任务包装成一个FutureTask，这个FutureTask实现了RunnableFuture接口，而RunnableFuture接口又继承了Runnable和Future两个接口。

| 名称               | 类型 | 功能                                                         |
| ------------------ | ---- | ------------------------------------------------------------ |
| **Future**         | 接口 | 表示异步任务的结果。只拿结果，不关心任务怎么跑               |
| **Runnable**       | 接口 | 表示一个可以 `run()` 的任务（线程可执行）                    |
| **RunnableFuture** | 接口 | **同时是 Runnable + Future**，可以跑（run）也可以拿结果（get） |
| **FutureTask**     | 类   | `RunnableFuture` 的实现类，封装一个异步任务，可以交给线程池执行 |

FutureTask内部维护了一个state变量

```java
  	private volatile int state;
    private static final int NEW          = 0;
    private static final int COMPLETING   = 1;
    private static final int NORMAL       = 2;
    private static final int EXCEPTIONAL  = 3;
    private static final int CANCELLED    = 4;
    private static final int INTERRUPTING = 5;
    private static final int INTERRUPTED  = 6;
```

这是Future里cancel，isCancelled，isDone等方法的重要实现。

1. 对于isCancelled方法，则是判断state >= CANCELLED

2. 对于isDone方法，则是判断return state != NEW;

3. 对于cancel方法，其实就是判断state是否是NEW，并且通过CAS的方式尝试将state从NEW修改为INTERRUPTING或者是CANCELLED。具体修改为什么需要根据cancel方法中的参数决定。

   * 如果传入的是true，则如果任务正在运行会尝试 **中断执行该任务的线程**（调用 `Thread.interrupt()`）。同时状态会先标记为 **INTERRUPTING**，最终会变为 **INTERRUPTED**。

   * 如果传入的是false，如果任务已经开始运行，则不会去打断线程，只会把任务状态标记为 **CANCELLED**。任务可能会继续运行直到结束，但 `Future.get()` 会抛出 `CancellationException`。

4. 对于get方法，其实Future中定义的get方法有两种

   * 一种是无参的，会一直阻塞等待任务执行完成，并返回结果
   * 一种是传入等待时间，只会等到timeout这么久

> FutureTask中还会有一个变量outcome去记录任务执行过程中可能出现的异常，他会将异常信息保存起来，如果执行过程中任务取消了，或者是出现了异常则会通过这个变量将异常抛出去







