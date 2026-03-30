---
title: spring启动流程
date: '2025-12-22'
excerpt: 梳理Spring容器从创建ApplicationContext到Bean初始化完成的完整启动流程与各阶段扩展点。
tags:
  - Java
  - Spring
category: Backend
---

### Spring启动流程

1. **创建 ApplicationContext**

   * XML配置：使用ClassPathXmlApplicationContext读取XML里的<bean>
   * 注解配置：使用AnnotationConfigApplicationContext加载基于注解的配置类（如@Service，@Component等）

2. **初始化 BeanFactory 并加载 Bean 定义**

   * 创建 `DefaultListableBeanFactory`
   * 扫描注解类或解析 XML `<bean>`，生成 `BeanDefinition`
   * 注册 `BeanDefinition` 到 `BeanFactory` 中

   > 注意：此时 Bean **还未实例化**，只是生成了元信息。

3. **解析BeanDefinitions**

   * 提取Bean的元数据，包括Bean的类名，作用域，依赖关系等，为后续 Bean 实例化和依赖注入做准备

4. **实例化非懒加载单例 Bean**

   * 调用 Bean 的构造方法生成对象

   * 仅非懒加载单例 Bean 会在容器刷新阶段实例化

5. **依赖注入**

   * 通过构造器，或setter或字段注入bean的依赖关系

6. **执行初始化回调**

   执行顺序：

   1. @PostConstruct
   2. InitializingBean.afterPropertiesSet()
   3. 自定义 `init-method`

7. **处理BeanPostProcessors**

   * postProcessBeforeInitialization：在初始化回调之前执行
   * postProcessAfterInitialization：初始化回调之后执行，可用于 AOP 代理增强

8. **发布容器刷新事件**

   * 发布事件ContextRefreshedEvent，表示容器刷新完成，所有非懒加载单例 Bean 已初始化完毕

9. **完成启动**

   * 可以通过getBean获取

> Bean生命周期顺序总结：构造方法 -> 依赖注入 -> @PostConstruct -> afterPropertiesSet -> init-method -> postProcessAfterInitialization
