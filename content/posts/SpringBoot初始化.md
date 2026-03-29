---
title: "SpringBoot初始化"
date: "2026-03-18"
excerpt: "SpringBoot中常见的几种初始化方式"
tags: ["Java", "Spring", "SpringBoot"]
category: "Backend"
---

## SpringBoot中常见的几种初始化方式

---

### @PostConstruct

* **特点**：和某个 Bean 绑定，Bean 创建并注入完成后立即执行。

* **执行时机**：
  Bean 生命周期初始化阶段（依赖注入完成后）

* **使用场景**：
  - 初始化缓存
  - 检查配置
  - 资源准备（如连接池预热）

* **优点**：
  - 最轻量
  - 无侵入（不依赖 Spring 接口）

* **缺点**：
  - 只能作用于单个 Bean

```java
@Component
public class CacheService {
    @PostConstruct
    public void initCache() {
        System.out.println("初始化缓存数据...");
    }
}
```

---

### InitializingBean

* **特点**：Bean 完成依赖注入后执行（本质同 @PostConstruct）

* **执行方法**：
```java
afterPropertiesSet()
```

* **优缺点**：
  - ✅ 比较直接
  - ❌ 耦合 Spring（侵入性强）
  - ❌ 可读性不如 @PostConstruct

* **使用场景**：
  - 初始化 Bean 内部资源
  - 参数校验
  - 启动线程池

```java
@Component
public class MyService implements InitializingBean {
    @Override
    public void afterPropertiesSet() {
        System.out.println("Bean 初始化完成后执行逻辑");
    }
}
```

---

### @Bean(initMethod)

* **特点**：通过配置指定初始化方法

* **执行顺序（重要）**：
```
@PostConstruct → InitializingBean → init-method
```

* **使用场景**：
  - 第三方 Bean 初始化（无法加注解时）

```java
@Bean(initMethod = "init")
public MyBean myBean() {
    return new MyBean();
}
```

---

### CommandLineRunner

* **特点**：Spring 容器启动完成后执行

* **方法签名**：
```java
run(String... args)
```

* **执行时机**：
```
ApplicationStartedEvent 之后
ApplicationReadyEvent 之前
```

* **使用场景**：
  - 启动后执行任务
  - 初始化全局资源
  - 调用外部接口预热

* **优点**：
  - 所有 Bean 已准备好

* **缺点**：
  - 参数需要手动解析

```java
@Component
public class MyStartupRunner implements CommandLineRunner {
    @Override
    public void run(String... args) {
        System.out.println("系统启动完成后执行初始化逻辑");
    }
}
```

---

### ApplicationRunner（推荐）

* **特点**：CommandLineRunner 的增强版

* **方法签名**：
```java
run(ApplicationArguments args)
```

* **优势（重点）**：
  - 支持参数解析
  - 区分 option 参数和普通参数

* **示例**：

```bash
java -jar app.jar --name=haibara test1
```

```java
@Component
public class MyRunner implements ApplicationRunner {
    @Override
    public void run(ApplicationArguments args) {
        System.out.println(args.getOptionNames()); // [name]
        System.out.println(args.getOptionValues("name")); // [haibara]
        System.out.println(args.getNonOptionArgs()); // [test1]
    }
}
```

* **执行顺序**：
```
ApplicationRunner → CommandLineRunner
```

> 这里的ApplicationArguments是SpringBoot在启动时会将命令行参数解析并包装成为的对象

---

### ApplicationListener

* **特点**：基于接口的事件监听机制

* **优缺点**：
  - ✅ 可监听任意生命周期事件
  - ✅ 解耦（不绑定具体 Bean 初始化）
  - ❌ 写法较繁琐
  - ❌ 一个类通常只监听一个事件

```java
@Component
public class MyApplicationListener implements ApplicationListener<ApplicationReadyEvent> {
    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        System.out.println("应用启动完成");
    }
}
```

---

### @EventListener（推荐🔥）

* **特点**：ApplicationListener 的注解版（本质是语法糖）

* **优势**：
  - 写法简洁
  - 支持多个事件
  - 支持条件、异步

```java
@Component
public class MyListener {

    @EventListener
    public void handle(ApplicationReadyEvent event) {
        System.out.println("应用启动完成");
    }
}
```

---

#### 高级用法（面试加分🔥）

**1️⃣ 监听多个事件**
```java
@EventListener({ApplicationStartedEvent.class, ApplicationReadyEvent.class})
```

**2️⃣ 条件监听**
```java
@EventListener(condition = "#event != null")
```

**3️⃣ 异步执行**
```java
@Async
@EventListener
public void handle(ApplicationReadyEvent event) {
}
```

---

## Spring Boot 生命周期事件

SpringApplication.run()
   │
   ├─ ApplicationStartingEvent        （应用刚开始，还没容器）
   ├─ ApplicationEnvironmentPreparedEvent （环境变量准备好）
   ├─ ApplicationContextInitializedEvent （容器创建，但 Bean 未加载）
   ├─ ApplicationPreparedEvent        （Bean 定义加载完）
   ├─ ApplicationStartedEvent         （容器刷新完成，Bean 创建完成）
   ├─ CommandLineRunner / ApplicationRunner
   ├─ ApplicationReadyEvent           （应用完全启动成功）
   └─ 如果出错 → ApplicationFailedEvent

---

## 完整执行顺序（重要🔥）

```
BeanFactoryPostProcessor
↓
BeanPostProcessor
↓
@PostConstruct
↓
InitializingBean
↓
init-method
↓
ApplicationStartedEvent
↓
ApplicationRunner / CommandLineRunner
↓
ApplicationReadyEvent
```
