---
title: "Executors"
date: "2025-10-27"
excerpt: "Executors"
tags: ["Java", "Executor"]
category: "Backend"
---

## Executors

**Executors**是`java.util.concurrent`包下的一个类，他提供了一些常用的线程池，可以帮助我们快速根据不同场景创建线程池。
但无论是哪种线程池底层都是通过**ThreadPoolExecutor**创建的。这也告诉我们，如果我们要自定义线程池参数等，可以直接创建ThreadPookExecutor。

---

### newFixedThreadPool(int nThreads)

```java
public static ExecutorService newFixedThreadPool(int nThreads) {
    return new ThreadPoolExecutor(
        nThreads, nThreads,
        0L, TimeUnit.MILLISECONDS,
        new LinkedBlockingQueue<Runnable>() // 无界队列
    );
}
```

#### 特点

* 创建一个 **固定大小** 的线程池。(固定大小指的是无临时线程)

* 核心线程数 = 最大线程数 = `nThreads`。

* 队列：`LinkedBlockingQueue`（无界队列）。

#### 适用场景

- 任务比较多，但线程数控制在固定范围。
- 避免因为无限制创建线程导致 OOM。

#### 缺点

- 队列是无界的，可能造成任务堆积、内存溢出。

---

### newCachedThreadPool()

```java
public static ExecutorService newCachedThreadPool() {
    return new ThreadPoolExecutor(
        0, Integer.MAX_VALUE,
        60L, TimeUnit.SECONDS,
        new SynchronousQueue<Runnable>() // 不存任务
    );
}
```

#### 特点

- 创建一个 **可缓存** 的线程池。
  * 所谓可缓存指的是：**线程可被缓存复用**。执行完任务后，如果 60 秒内还有新任务，就复用这个线程；超过 60 秒没任务，线程就被回收。

- 核心线程数 = 0。
- 最大线程数 = Integer.MAX_VALUE。
- 空闲线程会在 60 秒后被回收。
- 队列：`SynchronousQueue`（不存储任务，直接交给线程执行）。
  * `SynchronousQueue` 是一个特殊的阻塞队列，特点是：
    - **容量为 0**（不存储元素）。
    - 每个 `put` 操作必须等待一个 `take` 操作，反之亦然。
    - 也就是说：提交任务时，如果没有空闲线程来取任务，`SynchronousQueue` 就无法保存任务。于是线程池会立刻创建一个新线程来处理任务

#### 适用场景

- 短期大量并发、轻量级任务。
- 例如：高并发场景下的临时任务处理。

#### 缺点

- 最大线程数几乎无限制，可能耗尽系统资源。容易导致 **线程数过多 -> OOM**。

---

###  newSingleThreadExecutor()

```java
public static ExecutorService newSingleThreadExecutor() {
    return new FinalizableDelegatedExecutorService(
        new ThreadPoolExecutor(
            1, 1,
            0L, TimeUnit.MILLISECONDS,
            new LinkedBlockingQueue<Runnable>() // 无界队列
        )
    );
}
```

#### 特点

- 创建一个 **单线程** 的线程池。
- 核心线程数 = 最大线程数 = 1。
- 队列：`LinkedBlockingQueue`（无界）。

#### 适用场景

- 确保任务 **顺序执行**。
- 例如：日志处理、顺序化任务。

#### 缺点

- 单线程处理，性能有限；异常未捕获可能导致线程终止。

---

### newScheduledThreadPool(int corePoolSize)

```java
public static ScheduledExecutorService newScheduledThreadPool(int corePoolSize) {
    return new ScheduledThreadPoolExecutor(corePoolSize);
}

public class ScheduledThreadPoolExecutor extends ThreadPoolExecutor implements ScheduledExecutorService {
    // 内部队列是 DelayedWorkQueue
}
```

#### 特点

- 创建一个 **定时任务** 线程池。
- 核心线程数 = `corePoolSize`，最大线程数 = Integer.MAX_VALUE。
- 队列：`DelayedWorkQueue`。

#### 适用场景

- 替代 `Timer`，执行周期性任务或延迟任务。

#### 优势

- 比 `Timer` 更健壮，支持多个任务并发执行。

```java
ScheduledExecutorService pool = Executors.newScheduledThreadPool(3);
pool.schedule(() -> System.out.println("延迟 2 秒执行"), 2, TimeUnit.SECONDS);
pool.scheduleAtFixedRate(() -> System.out.println("每隔 3 秒执行一次"), 1, 3, TimeUnit.SECONDS);
```

---

### 总结

> 虽然 `Executors` 提供了快速创建线程池的方法，但 **阿里巴巴 Java 开发手册** 强烈不推荐直接使用它们，而是建议使用 `ThreadPoolExecutor` 自定义线程池，原因是：
>
> - `newFixedThreadPool` 和 `newSingleThreadExecutor` 使用 **无界队列**，容易 OOM。
> - `newCachedThreadPool` 和 `newScheduledThreadPool` 最大线程数几乎无限制，也容易 OOM。
>
> 推荐自己创建ThreadPoolExecutor，自定义参数。更好的了解自己的设计与需求

| 工厂方法                      | 核心线程数 | 最大线程数        | 队列                          | 特点                    | 优点                      | 缺点                         | 适用场景                       |
| ----------------------------- | ---------- | ----------------- | ----------------------------- | ----------------------- | ------------------------- | ---------------------------- | ------------------------------ |
| **newFixedThreadPool(n)**     | n          | n                 | `LinkedBlockingQueue`（无界） | 固定大小                | 控制线程数，复用线程      | 队列无界，任务过多可能 OOM   | 稳定的并发任务量，长期运行     |
| **newCachedThreadPool()**     | 0          | Integer.MAX_VALUE | `SynchronousQueue`            | 按需创建，空闲 60s 回收 | 灵活，应对短时并发高峰    | 最大线程数几乎无限，可能 OOM | 短期大量并发，轻量任务         |
| **newSingleThreadExecutor()** | 1          | 1                 | `LinkedBlockingQueue`（无界） | 单线程顺序执行          | 简单，保证顺序性          | 性能有限，异常可能终止线程   | 顺序任务（日志、顺序文件写入） |
| **newScheduledThreadPool(n)** | n          | Integer.MAX_VALUE | `DelayedWorkQueue`            | 定时/周期任务           | 支持定时，比 Timer 更可靠 | 最大线程数无限制，可能 OOM   | 定时调度、周期性任务           |

---

### 补充：ScheduledExecutorService

`ScheduledThreadPoolExecutor` 是 **Java 并发包里专门用来做定时任务的线程池**，比老的 `Timer` 更强大也更安全。

```java
ScheduledExecutorService scheduler = new ScheduledThreadPoolExecutor(
    2, // 核心线程数，支持并发执行定时任务
    new ThreadPoolExecutor.CallerRunsPolicy() // 拒绝策略
);
```

#### 常用方法

##### 一次性延迟执行（schedule）

```java
scheduler.schedule(() -> {
    System.out.println("延迟 3 秒后执行一次任务");
}, 3, TimeUnit.SECONDS);
```

##### 固定速率执行（scheduleAtFixedRate）

```java
scheduler.scheduleAtFixedRate(() -> {
    System.out.println("每隔 2 秒执行一次任务，开始时间固定，可能会有任务重叠");
}, 1, 2, TimeUnit.SECONDS);
```

特点：**任务按时间表调度**，不管上一次是否完成，都会尝试在时间点启动。

- 如果任务执行时间 > 周期，会导致任务堆积（可能并发执行）。

##### 固定延迟执行（scheduleWithFixedDelay）

```java
scheduler.scheduleWithFixedDelay(() -> {
    System.out.println("上一个任务执行完毕后再等 5 秒执行下一次");
}, 1, 5, TimeUnit.SECONDS);
```

特点：**以上一次任务完成时间为基准**，延迟指定时间后再执行下一次。

- 适合需要避免任务重叠的场景。

---

#### 注意事项

##### API的选择

* 如果只是想隔一段时间就发送消息，并不关心任务是否完成 → 用 `scheduleAtFixedRate`。
* 如果要避免任务重叠 → 用 `scheduleWithFixedDelay`。

##### 异常处理

* 任务抛异常会中断后续调度，所以一定要 try-catch。

  ```java
  scheduler.scheduleAtFixedRate(() -> {
      try {
          // your task
      } catch (Exception e) {
          e.printStackTrace();
      }
  }, 0, 1, TimeUnit.SECONDS);
  ```

##### 关闭线程池

* 使用完要调用 `shutdown()`，否则 JVM 可能不会退出

  ```java
  scheduler.shutdown();
  ```

  







