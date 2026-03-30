---
title: bean的生命周期&循环依赖问题
date: '2026-02-04'
excerpt: 详细介绍Spring Bean从实例化到销毁的完整生命周期，以及各阶段的扩展点与循环依赖解决方案。
tags:
  - Spring
  - SpringBoot
category: Backend
---

## bean的生命周期

其实bean的生命周期和普通对象的生命周期没有什么太大的区别，无非都是：实例化，初始化，使用，销毁。

只不过bean在这些步骤中作了一定扩展。

* **实例化**：Spring 容器根据配置文件或注解实例化 Bean 对象。
* **属性注入**：Spring 将依赖（通过setter 方法或字段注入）注入到 Bean 实例中。
* **初始化前的扩展机制**：如果 Bean 实现了 BeanNameAware 等 aware 接口，则执行 aware 注入。
* **初始化前**（BeanPostProcessor）：在 Bean 初始化之前，可以通过 BeanPostProcessor 接口对 Bean 进行一些额外的处理。
* **初始化**：调用 InitializingBean 接口的 afterPropertiesSet() 方法或通过 init-method 属性指定的初始化方法。
* **初始化后**（BeanPostProcessor）：在 Bean 初始化后，可以通过 BeanPostProcessor 进行进一步的处理。
* **使用** Bean：Bean 已经初始化完成，可以被容器中的其他 Bean 使用。
* **销毁**：当容器关闭时，Spring 调用 DisposableBean 接口的 destroy() 方法或通过 destroy-method 属性指定的销毁方法。

我们需要先知晓之所以 Bean 容易被添加一些属性，或者能在运行时被改造就是因为在生成 Bean 的时候，Spring对外暴露出很多扩展点。

基于这些点，可以设置一些逻辑，Spring 会在 Bean 创建的某些阶段根据这些扩展点，基于此进行 Bean 的改造。

有了上面的认识，再来看 Spring Bean 的生命周期，我用一幅图总结一下：

![img](https://pic.code-nav.cn/mianshiya/question_picture/1772087337535152129/zNxXrxM1_60913d46-9305-41c6-adc6-7787e078b188_mianshiya.png)

大致了解生命周期之后，我们再来看详细的操作，可以看到有好多扩展点：

![img](https://pic.code-nav.cn/mianshiya/question_picture/1772087337535152129/coeRfvs5_4ebac0e4-813d-4fc5-93c7-141e309d57e9_mianshiya.png)

>  注意细节，这幅图的颜色和上面那副有对应关系的。

### bean生命周期各阶段详解

**实例化阶段**：

* Bean 的实例化是通过反射机制创建的。Spring 根据 `@Component`、`@Bean` 或者 XML 中的 `<bean>` 元素配置，来确定要创建的 Bean。

**属性赋值阶段：**

* 在实例化完成后，Spring 会进行依赖注入。这包括将属性值注入到 Bean 的字段中，可能是通过 setter 方法注入，或者直接字段注入。

**初始化前的扩展机制**：

- Bean 可以实现 `BeanNameAware`、`BeanFactoryAware` 等 `Aware` 接口，从而在初始化之前获取 Bean 的名称、BeanFactory、ApplicationContext 等容器资源。例如，`ApplicationContextAware` 接口允许 Bean 获取 `ApplicationContext`，以便进一步与 Spring 容器交互。

**BeanPostProcessor 的作用**：

- `BeanPostProcessor` 接口允许开发者在 Bean 初始化前后添加自定义逻辑。例如，可以在 `postProcessBeforeInitialization` 方法中执行某些前置操作。在 `postProcessAfterInitialization` 中，可以进一步修改或替换 Bean 实例。

**初始化的细节**：

- `InitializingBean` 接口提供了一个 `afterPropertiesSet` 方法，用于在 Bean 的所有属性设置完成后执行一些自定义初始化逻辑。开发者也可以通过 `@PostConstruct` 注解或者 XML/Java 配置中的 `init-method` 属性，来指定初始化方法。

**Bean 的就绪状态**：

- Bean 完成初始化后，即进入就绪状态，可以供应用程序使用。在此状态下，Bean 已经完成了所有的属性设置和初始化步骤，处于可用状态。

**销毁阶段的清理**：

- Bean 的销毁通常在容器关闭时进行。`DisposableBean` 接口提供了 `destroy` 方法，用于清理资源。开发者也可以通过 `@PreDestroy` 注解或配置中的 `destroy-method` 属性，指定清理逻辑。

### Bean 的生命周期扩展点汇总

Spring 提供了多个扩展点，让开发者可以自定义和控制 Bean 的生命周期：

**BeanPostProcessor**：

- 通过实现 `BeanPostProcessor` 接口，开发者可以在 Bean 初始化前后添加自定义逻辑，如动态代理、AOP 增强等（比如在PostProcessorAfterInitialization中，就有关于@Async以及@Around等AOP相关的Processor（即AsyncAnnotationBeanPostProcessor，AnnotationAwareAspectJAutoProxyCreator）创建代理对象）。

> 需要注意，processor并不只会在bean初始化前后才会调用执行。在解决循环以来也就是属性注入阶段就可能会调用processor。
>
> 比如在发生循环依赖时，为了解决发生循环依赖的bean是需要被代理的这一情况，spring设计了三级缓存，在第三级缓存中会缓存能创建该bean对象的工厂方法，而这个工厂方法通常是这样的：
> ```java
> singletonFactories.put(beanName, () -> getEarlyBeanReference(bean, beanName));
> ```
>
> 这个getEarlyBeanReference就是SmartInstantiationAwareBeanPostProcessor里的核心方法，SmartInstantiationAwareBeanPostProcessor是 Spring 为了解决“Bean 还没创建完成，但容器必须提前知道它最终形态”而提供的生命周期前瞻型扩展点。getEarlyBeanReference方法内部会判断该bean未来是否会被代理，如果是的话，为了处理代理类的循环依赖问题（如果和普通类一样处理，这注入到别的类的是原对象，而IOC容器里这是代理对象），则会提前创建该bean的代理对象引用，否则就返回原对象

**BeanFactoryPostProcessor**：

- `BeanFactoryPostProcessor` 允许开发者在 Bean 实例化之前，修改 Bean 的定义信息（如属性值），它在所有 Bean 实例化之前执行。他主要针对的是BeanDefinition

**Aware 接口**：

- Spring 提供了多个 `Aware` 接口，如 `BeanNameAware`、`BeanFactoryAware`、`ApplicationContextAware` 等，允许 Bean 获取 Spring 容器的相关信息，进一步定制生命周期。

**@PostConstruct 和 @PreDestroy**：

- 这些注解提供了一种声明式的方法来定义初始化和销毁逻辑，通常用于替代 XML 或 Java 配置中的 `init-method` 和 `destroy-method`。

### Bean 的作用域（Scope）与生命周期的关系

Spring Bean 的生命周期还与其作用域密切相关：

**Singleton（单例）**：

- 默认作用域，Bean 的生命周期与 Spring 容器的生命周期一致。在容器启动时创建，在容器关闭时销毁。

**Prototype（原型）**：

- 每次请求时创建一个新的 Bean 实例，容器只负责创建，不管理其生命周期（不调用销毁方法）。

**Request、Session、Application、WebSocket**：

- 这些作用域用于 Web 应用中，Bean 的生命周期分别与 HTTP 请求、会话、应用或 WebSocket 的生命周期一致。（）

---

## 单例模式

**单例模式（Singleton Pattern）**是一种**创建型设计模式**，它的核心思想只有一句话：保证一个类在 JVM 中只有一个实例，并提供一个全局访问点。

在Spring 容器中，**默认 Bean为单例（singleton scope）**

使用单例的原因在于：避免这些对象频繁被创建，导致浪费资源，状态不一致，并发问题难以控制。

单例模式的目标就是： **控制实例数量 + 统一访问入口**

从本质来看，单例模式必须满足三点：

1. 构造方法私有化
2. 自己类持有唯一实例
3. 提供公共的访问方式

常见的单例模式的实现有两种：懒汉式和饿汉式。

### 饿汉式

特点：实例在类加载时就创建，线程安全，但如果实例初始化较重或没有被使用会浪费资源。

```java
public class Singleton{
  private static final Singleton instance = new Singleton();
  private Singleton(){}
  public static Singleton getInstance(){
    return instance;
  }
}
```

### 懒汉式

特点：实例在类加载时就创建，线程安全，但如果实例初始化较重或没有被使用会浪费资源。

```java
public class Singleton{
  private static volatile Singleton instance;
  private Singleton(){}
  public static synchronized Singleton getInstance(){
    if(instance == null){
      instance = new Singleton();
    }
    return instance;
  }
}
```

因为懒汉式单例在多线程环境下，可能出现多个线程同时初始化实例的问题，最简单是加个锁。但是这样一来，每次调用 `getInstance` 方法都需要加锁，**而实际上只需要在第一次创建实例时加锁**。在高并发环境下，频繁获取单例对象的锁操作会显著降低性能。

所有有以下几种兼顾安全和性能的选择

#### 双重检测法

这个思想同样在分布式锁的场景下很常见，用来解决一些缓存穿透的问题，在那个场景下就是第一个检测判断到redis为空后，只有一个线程能获取锁成功然后请求mysql将数据刷新到redis中。其余的线程获取锁成功后，必须进行二次判断，避免上一个线程已经把数据刷新回去，但由于并发原因，当前线程依旧获取了锁，导致建立不必要的数据库连接或请求等

```java
public class Singleton{
  private static volatile Singleton instance;
  private Singleton(){}
  public static Singleton getInstance(){
    // 第一次检查：避免不必要的同步
    if(instance == null){
      synchronized(this){
        // 第二次检查：确保实例唯一
        if(instance == null){
          instance = new Singleton();
        }
      }
    }
    return instance;
  }
}
```

> **为什么双重检查锁定需要 volatile 关键字？**
>
> 在 Java 中，`volatile` 修饰符用于**防止指令重排序**，从而确保双重检查锁定的正确性。
>
> `instance = new Singleton()` 是一个非原子操作，它分为以下三步：
>
> 1. 分配内存空间。
> 2. 初始化对象。
> 3. 将对象的引用赋值给 `instance`。
>
> 在没有 `volatile` 的情况下，编译器和 CPU 可能会对这些步骤进行**重排序**（比如执行顺序变成 1 → 3 → 2）。此时，另一个线程可能会在 `instance` 被赋值后，但对象尚未完成初始化时访问它，从而导致错误。
>
> 所以将 `instance` 声明为 `volatile`，可以禁止指令重排序，确保对象的初始化过程对所有线程可见。
>
> ```java
> private static volatile Singleton instance;
> ```
>
> 保证 `instance` 的写操作对其他线程立即可见，并禁止重排序优化，确保双重检查锁定的正确性。
>
> **总结**：
>
> - **双重检查锁定**通过缩小加锁范围，仅在必要时同步代码块，既保证线程安全，又提升性能。
> - **`volatile` 关键字**是实现双重检查锁定的关键，防止指令重排序导致未初始化对象被访问。

#### 静态内部类

我们都知道静态方法/变量，会在类加载的时候同时被加载。因此饿汉式就是采用静态变量的方式，确保类在被初始化为bean时，就初始化他的静态变量。等到业务开始时，其他线程不管怎么访问，都是存在实例的，自然也不会有病发问题。

而静态内部类就采用了这个特点，既然我直接在类里使用静态变量会被初始化，那我在类里再写一个静态的内部类，这样只有在内部类被使用时才会被加载，进而内部的静态变量才会被复制，达到懒加载的目的。

```java
public class Singleton{
  private Singleton(){}
  private static class Holder{
    private static final Singleton instance = new Singleton();
  }
  public static Singleton getInstance(){
    return Holder.instance;
  }
}
```

#### 枚举类

原理类似于静态内部类，枚举类有JVM保证只会初始化一次，枚举类编译后其实就是一个class.

且枚举类更强的就是，他能够避免反射以及反序列化

```java
public enum Singleton {
    INSTANCE;
}

final class Singleton extends Enum<Singleton> {
    public static final Singleton INSTANCE;

    static {
        INSTANCE = new Singleton("INSTANCE", 0);
    }
}
```

---

## 循环依赖

首先循环依赖就是 **两个或多个 Bean** 互相引用，形成了一个闭环。简单说就是**我中有你，你中有我**，或者像是**先有鸡还是先有蛋**的死锁问题。

在 Spring 中，最典型的场景就是：

- Spring 正在创建 Bean A，发现它依赖 B，于是去创建 B；
- 结果创建 B 的时候，发现它又依赖 A。

这时候 A 还正在创建中，还没完全生成好，B 拿不到 A 的引用，所以就不知道该怎么办了。

不过这里要**分两种情况**（更详细的介绍看扩展知识中的内容）：

- 如果是**构造器注入**：这种是无解的，Spring 会直接抛出 `BeanCurrentlyInCreationException` 错误，因为连对象实例都 new 不出来。
- 如果是 **Setter 或字段注入**：Spring 是可以通过三级缓存机制来解决的，简单说就是先把半成品的 A 暴露出来给 B 用，但这属于框架的兜底策略。

### 如何解决循环依赖

大白话讲就是：先把“**半成品的 bean**”暴露出去。虽然 bean 的属性还没填完，但这个对象引用的地址已经生成了，先拿去用，别报错，等后面再慢慢完善 bean。

具体 Spring 是靠**三级缓存**机制来解决了循环依赖的，可以把这三个缓存想象成三个不同等级的“货架”

- **一级缓存**（singletonObjects）: 这是成品货架。放的都是完全初始化好、可以直接用的 Bean
- **二级缓存**（earlySingletonObjects）: 这是半成品货架。放的是已经实例化（new 出来了），但还没填充属性的 Bean
- **三级缓存**（singletonFactories）: 这是工厂货架。这里放的不是 Bean 本身，而是一个能生产 Bean 的工厂（Lambda 表达式），这是解决问题的关键。

**假设 A 和 B 互相依赖，流程是这样的**：

1. A 出生：Spring 先把 A new 出来（实例化），这时候 A 还是个空壳子。
2. A 登记：Spring 马上把一个能获取 A 的工厂放到三级缓存里（注意，这时候还没放入二级）。
3. A 找 B：A 开始填充属性，发现需要 B，就去创建 B。
4. B 出生：B 也 new 出来，开始填充属性，发现需要 A。
5. B 找 A：B 去一级缓存找 A？没找到。去二级缓存找？也没找到。去三级缓存找？找到了！
6. B 调用三级缓存里的工厂，拿到了 A 的引用（如果是代理对象，这里就会提前生成代理）。
7. 关键一步：B 把拿到的 A 放到二级缓存，并把三级缓存里的工厂删掉（保证单例，只生产一次）。
8. 闭环完成：B 拿到了 A，B 创建完成，入驻一级缓存。A 拿到 B，A 也创建完成，入驻一级缓存。

完整流程如下：

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/1JuEAQwD_image_mianshiya.png)

在Spring中解决循环依赖必须要同时满足以下两点：

1. 依赖的bean必须都是单例
2. 依赖注入的方式，必须**不全是**构造器注入，且 beanName 字母序在前的不能是构造器注入

#### 为什么bean必须都是单例？

在源码中，会判断bean是否是Prototype类型，如果是的话会直接抛异常，这是因为如果bean不是单例的那么每次getBean都会重新创建对象，Spring不会缓存Prototype Bean。

如果两个 Bean 都是原型模式的话，那么创建 A1 需要创建一个 B1，创建 B1 的时候要创建一个 A2，创建 A2 又要创建一个 B2，创建 B2 又要创建一个 A3，创建 A3 又要创建一个 B3.....这样就卡bug了，直接stackoverflow。

如果A是单例，B是Prototype，那么创建A就需要创建B，创建B有需要创建A。这个循环是没问题的，但是因为B时Prototype，所以每次获取B都是新创建的对象，可能就会与你所期望的那个对象不是同一个。

如果A是Prototype，B是单例，那么就会导致创建A需要创建B，创建B需要创建A，而这一步创建的A和第一步创建的A是不一样的，直接到是stackoverflow

#### 为什么DI的方式不能是构造器？

在Spring中创建Bean分三大步骤；

1. 实例化，createBeanInstance，就是 new 了个对象
2. 属性注入，populateBean， 就是 set 一些属性值
3. 初始化，initializeBean，执行一些 aware 接口中的方法，initMethod，AOP代理等

如果全是构造器注入，比如`A(B b)`，那表明在 new 的时候，就需要得到 B，此时需要 new B ，但是 B 也是要在构造的时候注入 A ，即`B(A a)`，这时候 B 需要在一个 map 中找到不完整的 A ，发现找不到。

为什么找不到？因为 A 还没 new 完呢，所以找不到完整的 A，**因此如果全是构造器注入的话，那么 Spring 无法处理循环依赖**。

>构造器注入要求“先得到依赖 → 才能创建对象”，
> 而 Spring 的循环依赖解决依赖于：
> “先创建对象 → 再注入依赖”的三级缓存机制。
>
>三级缓存的前提就是必须要先new出一个裸对象，而构造器注入必须要先得到依赖才能new
>
>而setter和字段注入可以通过无参构造new一个半成品出来

#### 为什么一个构造器一个set注入，不能100%成功？

假设 A 是通过 set 注入 B，B 通过构造函数注入 A，此时是**成功的**。

来分析下：实例化 A 之后，此时可以在 map 中存入 A，开始为 A 进行属性注入，发现需要 B，此时 new B，发现构造器需要 A，此时从 map 中得到 A ，B 构造完毕，B 进行属性注入，初始化，然后 A 注入 B 完成属性注入，然后初始化 A。

整个过程很顺利，没毛病。

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1772087337535152129/CBz478fq_image_mianshiya.png)

假设 A 是通过构造器注入 B，B 通过 set 注入 A，此时是**失败的**。

我们来分析下：实例化 A，发现构造函数需要 B， 此时去实例化 B，然后进行 B 的属性注入，从 map 里面找不到 A，因为 A 还没 new 成功，所以 B 也卡住了，然后就 gg。

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1772087337535152129/VaS07mhy_image_mianshiya.png)

看到这里，仔细思考的小伙伴可能会说，可以先实例化 B 啊，往 map 里面塞入不完整的 B，这样就能成功实例化 A 了啊。

确实，思路没错**但是 Spring 容器是按照字母序创建 Bean 的，A 的创建永远排在 B 前面**。

现在我们总结一下：

- 如果循环依赖都是构造器注入，则失败
- 如果循环依赖不完全是构造器注入，则可能成功，可能失败，具体跟BeanName的字母序有关系。

---

### Spring 解决循环依赖全流程

明确了 Spring 创建 Bean 的三步骤之后，再来看看它为单例搞的三个 map：

1. 一级缓存，singletonObjects，存储所有已创建完毕的单例 Bean （完整的 Bean）
2. 二级缓存，earlySingletonObjects，存储所有仅完成实例化，但还未进行属性注入和初始化的 Bean
3. 三级缓存，singletonFactories，存储能建立这个 Bean 的一个工厂，通过工厂能获取这个 Bean，延迟化 Bean 的生成，工厂生成的 Bean 会塞入二级缓存

这三个 map 是如何配合的呢？

1. 首先，获取单例 Bean 的时候会通过 BeanName 先去 singletonObjects（一级缓存） 查找完整的 Bean，如果找到则直接返回，否则进行步骤 2。
2. 看对应的 Bean 是否在创建中，如果不在直接返回找不到（返回null），如果是，则会去 earlySingletonObjects （二级缓存）查找 Bean，如果找到则返回，否则进行步骤 3
3. 去 singletonFactories （三级缓存）通过 BeanName 查找到对应的工厂，如果存着工厂则通过工厂创建 Bean ，并且放置到 earlySingletonObjects 中。
4. 如果三个缓存都没找到，则返回 null。

从上面的步骤我们可以得知，如果查询发现 Bean 还未创建，到第二步就直接返回 null，不会继续查二级和三级缓存。

返回 null 之后，说明这个 Bean 还未创建，这个时候会标记这个 Bean 正在创建中，然后再调用 createBean 来创建 Bean，而实际创建是调用方法 doCreateBean。

doCreateBean 这个方法就会执行上面我们说的三步骤：

1. 实例化
2. 属性注入
3. 初始化

在实例化 Bean 之后，**会往 singletonFactories 塞入一个工厂，而调用这个工厂的 getObject 方法，就能得到这个 Bean**。

```java
addSingletonFactory(beanName, () -> getEarlyBeanReference(beanName, mbd, bean));
```

> 这个getEarlyBeanReference就是SmartInstantiationAwareBeanPostProcessor里的核心方法，SmartInstantiationAwareBeanPostProcessor是 Spring 为了解决“Bean 还没创建完成，但容器必须提前知道它最终形态”而提供的生命周期前瞻型扩展点。getEarlyBeanReference方法内部会判断该bean未来是否会被代理，如果是的话，为了处理代理类的循环依赖问题（如果和普通类一样处理，这注入到别的类的是原对象，而IOC容器里这是代理对象），则会提前创建该bean的代理对象引用，否则就返回原对象

要注意，此时 Spring 是不知道会不会有循环依赖发生的，**但是它不管**，反正往 singletonFactories 塞这个工厂，这里就是**提前暴露**。

然后就开始执行属性注入，这个时候 A 发现需要注入 B，所以去 getBean(B)，此时又会走一遍上面描述的逻辑，到了 B 的属性注入这一步。

此时 B 调用 getBean(A)，这时候一级缓存里面找不到，但是发现 A 正在创建中的，于是去二级缓存找，发现没找到，于是去三级缓存找，然后找到了。

并且通过上面提前在三级缓存里暴露的工厂得到 A，然后将这个工厂从三级缓存里删除，并将 A 加入到二级缓存中。

然后结果就是 B 属性注入成功。

紧接着 B 调用 initializeBean 初始化，最终返回，此时 B 已经被加到了一级缓存里 。

这时候就回到了 A 的属性注入，此时注入了 B，接着执行初始化，最后 A 也会被加到一级缓存里，且从二级缓存中删除 A。

Spring 解决依赖循环就是按照上面所述的逻辑来实现的。

重点就是在对象实例化之后，都会在三级缓存里加入一个工厂，提前对外暴露还未完整的 Bean，这样如果被循环依赖了，对方就可以利用这个工厂得到一个不完整的 Bean，破坏了循环的条件。

---

### 为什么解决循环依赖需要三级？

其实讲道理，二级缓存就能过解决循环依赖的问题。

一级缓存存初始化好的bean，二级缓存存初始化不完全的bean。

假如现在A依赖B，B依赖A：

1. 实例化A后，将A存储到二级缓存中，然后对A进行属性注入，发现A需要B，但一级和二级缓存都没有B，于是需要创建B
2. 实例化好B后，将B存储到二级缓存中，然后进行属性注入时，发现B需要A，而此时在二级缓存中发现了A，于是注入，最后B初始化好，提升到一级缓存
3. 回过头来对A注入B，直接从一级缓存中取，最后A初始化好，也提升到一级缓存

很完美。但这里存在一个致命的问题：如果B/A是需要被代理的，那么此时注入的是原对象，而缓存中在postProcessorAfterInitialization里会生成对应的代理类，并添加到容器里。这就会导致对应的aop失效

那这样就一定需要三级缓存吗？也不一定，二级缓存同样可以做到。三级缓存无非就是在返回bean时判断当前bean在未来是否会被代理，如果会被代理则提前暴露该bean的代理类，如果不会被代理则返回原对象。

这一步完全也可以在二级缓存里做。但是基于这个推理，就需要在实例化好bean后，就判断bean是否会被代理，如果是则将代理对象假如二级缓存，否则缓存原对象。这样在后续的注入里，注入的也是代理对象，这符合我们的预期。并且在postProcessorAfterInitialization里会判断是否已经创建了代理对象，如果是则直接服用之前的代理对象，否则再创建代理对象。

怎么看上去感觉很合理，但实际上有个致命问题：并不是所有需要被代理的类，都会出现循环依赖的情况，只有极少数，甚至于不会发生循环依赖问题。所以，如果这样设计的话就会导致，明明没有发生循环依赖，但我的bean还是提前暴露了代理类，这就违背了bean的生命周期。我们不能因为一个目的而去破坏另一个已有的规则，何况Spring又作为Apache的顶级项目。再者Spring不能感知是否发生了循环依赖，所以这就会破坏bean原本定义好的生命周期。

这时候可能会有个疑问“那我在第二层加逻辑，让他能感知是否发生循环依赖不就好了，这样就不会破坏bean的生命周期了”。

对此我的回答是，难道就是为了少一级缓存，要让代码变得这么屎山吗？又是把原本第三级缓存的任务聚合到二级缓存里，现在又是为了少一级缓存，要去额外添加复杂的判断逻辑。

所以三级缓存本质目的上就是职责划分，使存储的实例和工厂的分离。再者就是避免过早暴露代理对象，破坏bean的生命周期。	
