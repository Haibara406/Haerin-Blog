---
title: springboot启动流程
date: '2025-12-22 13:06'
updated: '2026-03-29 22:32'
excerpt: 详解SpringBoot启动的两大阶段：创建SpringApplication实例与执行run方法的完整流程。
tags:
  - Spring
  - SpringBoot
category: Backend
---

### SpringBoot启动流程

核心入口就是带有@SpringBootApplication注解的main方法如：

```java
@SpringBootApplication
public class MyApplication{
  public static void main(String[] args){
    SpringApplication.run(MyApplication.class, args);
  }
}
```

这个方法最终会调用

```java
public static ConfigurableApplicationContext run(Class<?>[] primarySources, String[] args) {
        return new SpringApplication(primarySources).run(args);
}
```

所以SpringBoot的启动流程大致分为两部分

* 第一部分创建SpringApplication实例new SpringApplication
* 第二部分调用其run方法

#### 首先第一阶段：创建SpringApplication实例

在new SpringApplication里，会做的事情如下（源码）

```java
/**
 * SpringApplication 的核心构造函数
 * 主要负责在启动前预设环境、识别 Web 类型以及加载各种初始化器和监听器。
 */
public SpringApplication(ResourceLoader resourceLoader, Class<?>... primarySources) {
    // 是否允许将命令行参数作为属性添加到 Environment 中
    this.addCommandLineProperties = true;
    
    // 是否向 Environment 添加转换服务（ConversionService）用于类型转换
    this.addConversionService = true;
    
    // 设置是否开启 headless 模式（在无显示器/键盘环境下运行）
    this.headless = true;
    
    // 初始化附加的 Profile 配置为空集合
    this.additionalProfiles = Collections.emptySet();
    
    // 设置默认的应用上下文工厂，用于后续创建 AnnotationConfigServletWebServerApplicationContext 等
    this.applicationContextFactory = ApplicationContextFactory.DEFAULT;
    
    // 设置默认的应用启动步骤监控（用于记录启动过程中的性能和步骤）
    this.applicationStartup = ApplicationStartup.DEFAULT;
    
    // 初始化应用属性配置对象
    this.properties = new ApplicationProperties();
    
    // 设置资源加载器（通常为 null，由 Spring 自动决定）
    this.resourceLoader = resourceLoader;
    
    // 断言主配置类不能为空
    Assert.notNull(primarySources, "'primarySources' must not be null");
    
    // 将传入的主配置类（通常是带有 @SpringBootApplication 的类）存入 Set 集合中
    this.primarySources = new LinkedHashSet(Arrays.asList(primarySources));
    
    // 根据类路径下的依赖情况，推断当前的 Web 应用类型（REACTIVE, SERVLET 或 NONE）
    this.properties.setWebApplicationType(WebApplicationType.deduceFromClasspath());
    
    // 从 META-INF/spring.factories 中获取并初始化所有引导注册初始化器
    this.bootstrapRegistryInitializers = new ArrayList(this.getSpringFactoriesInstances(BootstrapRegistryInitializer.class));
    
    // 获取并设置所有的应用上下文初始化器（ApplicationContextInitializer）
    this.setInitializers(this.getSpringFactoriesInstances(ApplicationContextInitializer.class));
    
    // 获取并设置所有的监听器（ApplicationListener），用于处理启动过程中的各种事件
    this.setListeners(this.getSpringFactoriesInstances(ApplicationListener.class));
    
    // 通过堆栈信息推断包含 main 方法的主类，用于后续日志输出和资源定位
    this.mainApplicationClass = this.deduceMainApplicationClass();
}
```

主要关注的部分如下：

* 是否允许将命令行参数作为属性添加到 Environment 中
* 设置默认的应用上下文工厂
* 根据类路径下的依赖情况，推断当前的 Web 应用类型（REACTIVE, SERVLET 或 NONE）
* 从 META-INF/spring.factories 中获取并初始化所有引导注册初始化器
* 获取并设置所有的应用上下文初始化器
* 获取并设置所有的监听器

1. **判断应用类型**
   * 调用WebApplicationType.deduceFromClasspath()方法，根据类路径判断是web应用，还是webFlux应用，还是普通应用。
     * 如果存在org.springframework.web.reactive.DispatcherHandler，且不存在org.springframework.web.servlet.DispatcherServlet和org.glassfish.jersey.servlet.ServletContainer则说明是reactive。
     * 如果不存在jakarta.servlet.Servlet和org.springframework.web.context.ConfigurableWebApplicationContext这是普通应用
     * 如果上述两种情况都为false，则就是Web应用
2. **通过 SPI 机制读取配置**
   * 调用getSpringFactoriesInstances，通过SpringFactoriesLoader加载META-INF/spring.factories下的配置文件，把所有需要用到的初始化器（ApplicationContextInitializer）和监听器（ApplicationListener）都找出来准备好

#### 然后是第二阶段：调用run方法启动应用

1. **记录启动时间**

   * 用于统计启动耗时

2. **创建 BootstrapContext**

   * 用于启动过程中共享对象和资源管理。

3. **获取启动监听器**

   * 监听应用的各个生命周期事件

4. **发布ApplicationStartingEvent**

   * 通知所有监听器，应用程序开始启动

5. **解析命令行参数**

   * 将args封装为ApplicationArguments对象

6. **准备环境（Environment）**

   * 读取配置文件（application.yml/application.properties），环境变量，+命令行参数等组装成ConfigurableEnvironment
   * 发布ApplicationEnvironmentPreparedEvent

7. **打印Banner**

8. **创建ConfigurableApplicationContext**

   根据第一阶段判断的应用类型创建：

   * `AnnotationConfigServletWebServerApplicationContext`（Web）

   * `AnnotationConfigReactiveWebServerApplicationContext`（WebFlux）

   * `AnnotationConfigApplicationContext`（普通）

9. **创建ConfigurableListableBeanFactory**

10. **刷新容器上下文（refresh()）**

   **解析@SpringBootApplication注解:**

   * @SpringBootConfiguration表明这是springboot的配置类

   * @ComponentScan扫描当前目录及其子包下的@Service，@Controller，@Component等Bean
   * @EnableAutoConfiguration，通过 `AutoConfigurationImportSelector` 导入自动配置类
   * 所有扫描到的 Bean 均以 **BeanDefinition 的形式注册到 BeanFactory**

   **Bean 定义加载阶段**：

   * 修改、增强 BeanDefinition，执行 `BeanFactoryPostProcessor`，如配置占位符处理。还有就是扫描@Aspect，然后解析为advisor（Pointcut + Advice），缓存Advisor， **此时仍未创建任何 Bean 实例，仅操作 BeanDefinition**

   **注册 Bean 后置处理器（BeanPostProcessor）**

   * 将所有 `BeanPostProcessor` 注册到 BeanFactory

   * 决定 Bean 创建前后的增强逻辑（AOP、@Autowired 等）

   > BeanFactoryPostProcessor和BeanPostProcessor的区别是：
   >
   > 1. BeanFactoryPostProcessor作用于bean实例化之前，主要作用是修改BeanDefinition的信息
   > 2. BeanPostFactory作用于bean实例化前后，主要作用是修改Bean对象，对Bean对象做增强
   >
   > 可以简单理解为BeanFactoryPostProcessor 改“图纸”，BeanPostProcessor 改“成品”

   **实例化单例 Bean**：

   * 执行DI依赖注入
   * Bean创建和注入成功后，调用对应的@PostConstruct方法和InitialzingBean实现的方法

   * 如果是web应用此时还会启动内嵌的Tomcat

11. 处理上下文刷新的回调（执行自定义逻辑）

    * 执行 `ApplicationContextInitializer`、自定义逻辑等。

12. 日志记录启动耗时

13. listeners.started()通知监听器，应用启动完成。执行CommandLineRunner、ApplicationRunner

14. 发布ApplicationStartedEvent, ApplicationReadyEvent等（实现了ApplicationListener的收到事件通知后就可以执行对应的逻辑）。

15. 在启动和运行过程中捕获异常并处理













