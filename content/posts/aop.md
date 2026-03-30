---
title: aop
date: '2026-03-24'
excerpt: 详解Spring AOP的实现原理，包括代理创建流程、JDK与CGLIB的选择及Advice执行链机制。
tags:
  - Spring
  - AOP
category: Backend
---

## AOP

### 什么是AOP？

AOP（Aspect-Oriented Programming，面向切面编程）是一种编程范式，它旨在解决软件开发中的横切关注点（cross-cutting concerns）问题。横切关注点是那些分布于多个模块或对象的功能，例如日志记录、安全检查、事务管理等。AOP 通过将横切关注点与业务逻辑分离，从而提高了代码的模块化程度，使得开发更加简洁、易于维护。

### AOP是如何实现的

首先就是在springboot启动后，在refresh阶段，会扫描所有组件类，比如 @Component、@Service、@Controller、@Repository等等，并将它们解析成 BeanDefinition 注册到 BeanFactory 中。

接下来，如果开启了 AOP（Spring Boot 默认开启），那么在SpringBoot提供的一个自动装配类AopAutoConfiguration里的@EnableAspectJAutoProxy注解，注解内部import类一个AspectJAutoProxyRegistrar，这个类会向容器注册一个非常关键的 Bean：AnnotationAwareAspectJAutoProxyCreator。这个类本质上是一个 BeanPostProcessor，它是整个 Spring AOP 的核心执行者。随后在 refresh 流程中，Spring 会把所有 BeanPostProcessor 注册进容器，包括这个自动代理创建器。

在AnnotationAwareAspectJAutoProxyCreator这个类初始化的时候，他会标记容器内所有包含@Aspect的BeanDefinition，并且解析其中的advice，pointcut等。并且按照pointcut + advice的组合封装为Advisor缓存起来

那在bean创建，并初始化完成后，在PostProcessorAfterInitialization阶段AnnotationAwareAspectJAutoProxyCreator就会根据缓存的Advisor，判断这个Bean是否命中任何一个Advisor。判断的标准就是看这个bean或者这个bean的方法是否匹配这个Advisor对应这个pointcut，如果匹配至少一个，则就会为其创建代理对象。

至于选择JDK还是CGLIB，这取决于配置和类的构造。如果目标类实现了接口，且没有强制使用 CGLIB，则使用 JDK 动态代理。JDK 代理只能代理接口方法。如果没有接口，或者配置了强制使用 CGLIB，则使用 CGLIB。CGLIB 通过生成子类实现代理，可以代理类的方法，但不能代理 final 方法。Spring Boot 2.x 之后默认启用 CGLIB。

对于JDK代理而言就是通过Proxy.newProxyInstance来生成代理类，而CGLIB则是通过Enhancer创建目标类的子类，覆盖父类方法。

就是具体的执行aop逻辑，对于JDK代理而言，主要就是代理对象的方法调用会被转发到InvocationHandler.invoke()方法中，可以在这里定义增强逻辑。而对于CGLIB则是通过MethodInterceptor.intercept()方法拦截父类方法调用，实现增强逻辑。

> 需要注意的是一个方法可以有多个增强，比如可以有@Around，可以有@After，也可以同时有@Before，当然也可以同时有多个相同的增强。
>
> 如果某个方法被多个切面增强了，Spring 会把它们组织成一个 **链条**（Chain），按顺序执行。这个链条就是 **增强逻辑链（Advisor Chain / Advice Chain）**。
>
> 本质上是一个列表，每个元素是 `Advisor`（增强器，封装了 Advice + Pointcut）。
>
> 当方法调用时，Spring 会按链条顺序依次执行：
>
> 1. 前置通知
> 2. 环绕通知（调用 `proceed()` 执行下一个链条/目标方法）
> 3. 后置通知 / 返回通知 / 异常通知
>
> 链条可以递归触发，环绕通知是控制链条流的关键。
>
> 而@Order注解用来 **控制切面在增强链中的执行顺序**。**数字越小，优先级越高，先执行**。（after和before相反，越大越先执行）
> 需要注意的是：`@Order` 是 **切面级别**，而不是单个 Advice。
>
> 也就是说**不同类型通知**顺序固定：`Before → Around → 目标方法 → After/AfterReturning/AfterThrowing`
>
> 相同类型通知由Order决定，Order相同则按Spring容器的注册顺序

### `@EnableAspectJAutoProxy(proxyTargetClass = true)` 使用在哪？

* 这是 Spring AOP 的开关注解，**告诉 Spring 容器启用基于注解的切面（AspectJ 风格）代理**。

* **使用位置**：通常放在 **`@Configuration` 的配置类上**，例如：

```java
@Configuration
@EnableAspectJAutoProxy(proxyTargetClass = true)
public class AppConfig {
}
```

* **参数含义**：
  - `proxyTargetClass = true` → 强制使用 **CGLIB 代理**（即使目标类实现了接口）。
  - `proxyTargetClass = false`（默认） → 优先用 **JDK 动态代理**（要求目标类必须实现接口）。

### AOP核心属性

| 概念          | 解释                                                         |
| ------------- | ------------------------------------------------------------ |
| **Advice**    | 通知，切面中具体的增强逻辑，比如 `@Before`, `@After`, `@Around`。 |
| **Pointcut**  | 切点，定义哪些方法需要被增强。                               |
| **JoinPoint** | 连接点，程序执行的某个点（方法执行）                         |
| **Aspect**    | 切面，封装了通知（Advice）和切点（Pointcut），就是封装横切逻辑的模块。 |

> 切点Pointcut，决定拦截谁，他是一套规则，用来匹配哪些连接点JoinPoint（方法）。其实就是方法的匹配表达式，符合表达式的都会被拦截。比如
>
> ```sh
> execution(public * *(..))              // 所有 public 方法
> execution(* save*(..))                 // 方法名以 save 开头
> execution(* com.xxx..*(..))            // 某包及子包
> @annotation(Log)                        // 带某注解的方法
> ```
>
> 而Aspect切面他是切点Pointcut和通知Advice的结合。Pointcut决定在哪干，Advice决定什么时候干，以及具体怎么干。
>
> | 通知            | 干啥               | 场景        |
> | --------------- | ------------------ | ----------- |
> | @Before         | 方法前             | 权限校验    |
> | @After          | 方法后（不论异常） | 清理资源    |
> | @AfterReturning | 正常返回           | 结果日志    |
> | @AfterThrowing  | 抛异常             | 异常处理    |
> | @Around         | 包住方法           | 事务 / 监控 |
>
> 而Aspect则是打包这套规则。所以：
>
> * JoinPoint 表示程序中可以被增强的执行点，可以简单理解为方法；
> * Pointcut 用来筛选哪些 JoinPoint 需要增强，比如execution(public * *(..)) 就代表所有public的JoinPoint；
> * Advice 则是定义在这些JoinPoint上要执行的统一的增强逻辑；
> * Aspect 则是将切点和通知组合在一起的切面。
> * Spring 在方法执行时，通过代理在匹配的 JoinPoint 上织入 Advice。

























