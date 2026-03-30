---
title: spring事务的传播行为
date: '2025-12-23 15:38'
updated: '2026-03-29 22:32'
excerpt: 介绍Spring七种事务传播行为的含义、使用场景及代码示例，帮助理解事务嵌套的处理逻辑。
tags:
  - Spring
category: Backend
---

## Spring事务的传播行为

Spring事务的传播行为描述的就是当一个事务被另一个事务调用时，他应该如何参与事务

Spring提供了七种事务的传播行为

#### PROPAGATION_REQUIRED（默认）

* **含义**：如果当前存在事务，就加入该事务；如果不存在，就创建一个新的事务。
* **典型场景**：大多数业务方法。
* **示例**：

```java
@Transactional(propagation = Propagation.REQUIRED)
public void methodA() {
    // do something
    methodB(); // methodB也可以用REQUIRED
}
```

- **效果**：
  - `methodA` 调用 `methodB`，`methodB` 会加入 `methodA` 的事务。
  - 只要有一个方法抛异常回滚，整个事务都会回滚。

#### PROPAGATION_SUPPORTS

* **含义**：如果当前存在事务，就加入；如果没有事务，就以非事务方式执行。
* **典型场景**：可有可无的事务操作，例如一些查询方法。
* **示例**：

```java
@Transactional(propagation = Propagation.SUPPORTS)
public void methodC() {
    // 查询操作
}
```

- **效果**：
  - 如果有外部事务，`methodC` 会参与。
  - 如果没有事务，`methodC` 仍然可以正常执行。

#### PROPAGATION_MANDATORY

- **含义**：必须在一个已有事务中运行，否则抛异常。
- **典型场景**：必须依赖上层事务的操作。
- **示例**：

```java
@Transactional(propagation = Propagation.MANDATORY)
public void methodD() {
    // do something
}
```

- **效果**：
  - 如果外层没有事务，会报 `IllegalTransactionStateException`。
  - 主要用在必须依赖已有事务的子操作中。

#### **PROPAGATION_REQUIRES_NEW**

- **含义**：总是创建一个新的事务，暂停当前存在的事务（如果有）。
- **典型场景**：日志记录、单独提交的操作。
- **示例**：

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void methodE() {
    // 新事务执行
}
```

- **效果**：
  
  - 外层事务回滚不会影响 `methodE` 的事务。
  - `methodE` 抛异常只会回滚自己，不影响外层事务（除非异常被外层捕获并处理）。
  
  > 双方都是独立的新事物，出现异常互不干扰

#### **PROPAGATION_NOT_SUPPORTED**

- **含义**：以非事务方式执行，暂停当前事务（如果有）。
- **典型场景**：不希望事务干扰的操作，比如一些读操作或日志写入。
- **示例**：

```java
@Transactional(propagation = Propagation.NOT_SUPPORTED)
public void methodF() {
    // 不参与事务
}
```

- **效果**：
  - 外层事务被暂停，方法执行不在事务中。

####  **PROPAGATION_NEVER**

- **含义**：必须以非事务方式执行，如果当前存在事务，则抛异常。
- **典型场景**：不允许事务干扰的操作。
- **示例**：

```java
@Transactional(propagation = Propagation.NEVER)
public void methodG() {
    // do something
}
```

- **效果**：
  - 如果有外层事务，会报 `IllegalTransactionStateException`。

#### **PROPAGATION_NESTED**

- **含义**：如果当前存在事务，则在嵌套事务中执行（保存点 savepoint）；如果不存在，则等同于 `REQUIRED`。
- **典型场景**：部分回滚而不影响整个事务。
- **示例**：

```java
@Transactional(propagation = Propagation.NESTED)
public void methodH() {
    // 嵌套事务
}
```

- **效果**：
  - 嵌套事务回滚只会回滚到保存点，不影响外层事务。
  - 注意：`NESTED` 依赖 **单一数据源的 JDBC** 才能真正支持，否则会退化为 `REQUIRED`。

### **总结对比表**

| 传播行为      | 外层有事务               | 外层无事务 | 特点                         |
| ------------- | ------------------------ | ---------- | ---------------------------- |
| REQUIRED      | 加入事务                 | 新建事务   | 默认行为，最常用             |
| SUPPORTS      | 加入事务                 | 非事务执行 | 可有可无                     |
| MANDATORY     | 加入事务                 | 抛异常     | 必须在事务中                 |
| REQUIRES_NEW  | 新建事务（外层事务挂起） | 新建事务   | 独立提交，常用于日志         |
| NOT_SUPPORTED | 暂停事务                 | 非事务执行 | 强制非事务                   |
| NEVER         | 抛异常                   | 非事务执行 | 禁止事务                     |
| NESTED        | 嵌套事务                 | 新建事务   | 可回滚到保存点，依赖单数据源 |







