---
title: 常见的JDK版本的新特性
date: '2026-03-03'
excerpt: 梳理JDK 8、17、21等主要版本的核心新特性，包括Lambda、虚拟线程、Record等重要改进。
tags:
  - Java
category: Backend
---

### JDK8

1. **Lambda 表达式**

   - 函数式编程正式进入 Java

   - 替代匿名内部类，简化回调和集合操作

2. **函数式接口**（`@FunctionalInterface`）
   - 标准函数式接口：`Function`、`Consumer`、`Supplier`、`Predicate`

3. **Stream API**
   - 内部迭代、链式操作、惰性求值、并行流

4. **Optional**
   - 避免 NullPointerException

5. **接口默认方法（default）和静态方法**
   - 接口可以带实现方法（JDK8就为Collection 接口添加了 stream、removeIf 等方法，都是默认方法）

6. **全新时间 API（java.time 包）**
   - `LocalDate`、`LocalDateTime`、`Instant`、`Duration`、`ZoneId`

7. **HashMap 改进**
   - 链表长度 > 8 转红黑树，减少查找复杂度
8. **ConcurrentHashMap**改进
   * 取消分段锁，改用数组+链表+红黑树结构；
9. **JVM移除了永久代**
   * 移除永久代作为方法区实现，而选择元空间来实现方法区

---

### JDK11





---

### JDK17

1. **Sealed 类 / 接口**

   - 限制继承范围

   - 用 `permits` 指定允许的子类

2. **Record（正式）**

   - 自动生成 `getter`、`equals`、`hashCode`、`toString`

   - 用于轻量级 DTO

3. **instanceof 模式匹配**（Pattern Matching for instanceof）
   - 避免重复强制类型转换

4. **switch pattern matching（预览）**
   - 可以基于类型匹配进行 case

5. **G1 / ZGC 性能优化**
   - 更低延迟和大堆内存场景优化

### JDK 21（最新 LTS）

1. **虚拟线程（Project Loom）**
   - 超轻量级线程，降低高并发 IO 场景线程开销
2. **结构化并发**
   - 多线程任务管理像顺序代码一样简单
3. **Record Pattern**
   - Record 结合模式匹配，解构对象更方便
