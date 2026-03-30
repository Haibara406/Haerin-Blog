---
title: mybatis
date: '2026-01-29 13:52'
updated: '2026-03-29 22:32'
excerpt: 介绍MyBatis的核心思想与工作原理，并与Hibernate进行全面对比，分析各自的适用场景。
tags:
  - Java
  - MyBatis
  - ORM
category: Backend
---

## Mybatis简介

Mybatis是**Java持久层**也就是**ORM框架**中的一种，主要是方便开发者能过更可观且方便地**将Java对象和数据库SQL结果映射**起来。

但是他和**Hibernate**这种**全自动的ORM框架**又不太一样，他没有进行深度封装，而是作为一种**半自动的ORM + SQL驱动型**的框架。也就是**SQL自己写，但映射，参数绑定，结果封装由框架实现**。

如果没有Mybatis，传统的JDBC就需要这样

```java
Connection conn = ...
PreparedStatement ps = conn.prepareStatement(sql);
ps.setInt(1, id);
ResultSet rs = ps.executeQuery();
while (rs.next()) {
    User u = new User();
    u.setId(rs.getInt("id"));
    u.setName(rs.getString("name"));
}
```

也就是得自己连接数据库，封装PreparedStatement，并将参数传入PreparedStatement中的SQL表达式。然后执行SQL拿到结果集后自己解析。

不能说特别复杂，但每次执行SQL都要这么做确实很麻烦，尤其是像连接数据库，解析结果集并赋值给写好的Java对象，每次做的都差不多，但却要反复写。维护起来也很麻烦

所以Mybatis的核心思想就是：

1. **SQL 与 Java 解耦**，SQL 写在 **XML** 或 **注解**里，Java 只管调用接口方法。
2. **映射**，**输入**：Java 参数 → SQL 参数，**输出**：ResultSet → Java 对象
3. **Mapper 接口代理**，我们不用自己写实现类，MyBatis 在运行期用 **动态代理**帮我们生成实现类。

---

## Mybatis和Hibernate的区别

### Hibernate

是一款完整形态的 ORM 框架，可以从纯面向对象的角度来操作数据库。

它不仅能帮助我们完成对象模型和数据库关系模型的映射，还能帮助我们屏蔽不同数据库不同 SQL 的差异，简单来说我们用 Hibernate 提供的 API 就能完成大部分 SQL 操作，不需要我们编写 SQL，Hibernate 会帮助我们生成 SQL。

且也提供了 HQL（Hibernate Query Language），面向对象的查询语句，和 SQL 类似但是不太相同，最终 HQL 会被转化成 SQL 执行

还提供了 Criteria 接口，也是一样，是一套面向对象的 API，一些复杂的 SQL 可以利用 Criteria 来实现，非常灵活。

总而言之，**Hibernate 通过面向对象的思维让你操作数据库，屏蔽不同数据库的差异，它会根据底层不同数据库转化成对应的 SQL**。

缺点就是屏蔽的太多了，例如因为自动生成 SQL，所以我们无法控制具体生成的语句，你无法直接决定它走哪个的索引，且又经过了一层转化 SQL 的操作，所以性能也会有所影响。

**总结**：Hibernate 很好，基本上 ORM 要的它都有，包括一级、二级缓存等，且屏蔽底层数据库，提高了程序的可移植行。但由于它封装的太好了，使得我们无法精细化的控制执行的 SQL。

在国外几乎都用 Hibernate，在国内大家都用 Mybaits。

没有绝对的好坏，只有合适与不合适。

### Mybaits

Mybatis 相对于 Hibernate 称为半 ORM 框架，因为 Hibernate 不需要写 SQL，而 Mybatis 需要写 SQL。

也因为这点 Mybatis 更加的灵活且轻量。

能针对 SQL 进行优化，非常灵活地根据条件动态拼接 SQL 等，极端情况下性能占优。

不过也因为这点 Mybatis 和底层的数据库是强绑定的，如果更换底层数据库， 所有 SQL 需要重新过一遍（有些写法还是不一样的）。

比如之前本地开发是 MySQL，后来客户特殊情况不用 saas，需要在他们那边部署一套，他们用的是 oracle，所以以前写的 SQL 都需要改一遍。

具体选择 Hibernate 还是 Mybatis，是看情况的。

比方一些项目很简单，QPS 又不高，快速解决战斗就选 Hibernate，无脑上就完了。

而一些核心服务，QPS很高，需要对 SQL 进行精细化定制，那就 Mybatis，就是追求极致用 Mybatis。

---

## MyBatis 中 #{} 和 ${} 的区别是什么？ 

> 在 MyBatis 中，`#{}` 和 `${}` 都是用来处理 SQL 语句中的参数占位符，但它们的作用和使用场景有显著的不同。
>
> **`#{}`（PreparedStatement 占位符）**：用于传入 SQL 查询语句的参数。它会将传入的参数进行类型处理，并使用 `PreparedStatement` 进行 SQL 绑定，从而避免 SQL 注入攻击。**`#{}` 会将参数作为参数传递给数据库查询，而不是直接拼接到 SQL 中**。
>
> **`${}`（字符串拼接）**：用于直接将参数值拼接到 SQL 语句中。它不会进行类型处理或使用 `PreparedStatement`，只是将参数值直接替换到 SQL 语句中。
>
> 默认使用 #{} 为了安全；需要动态构造 SQL 的部分谨慎使用 ${} 。

### 什么是 PreparedStatement 预编译？

想象你是一个餐馆的常客，每次去餐馆吃饭，你点的菜单是固定的，只有一些细节，比如餐品的数量或者加辣的程度会有所不同。如果每次都让服务员从头到尾重新写一张菜单（比如：菜品名称、做法、数量），显然会浪费时间。而且，餐馆还需要不断地检查你的菜单内容是否合规，这样会增加额外的工作量。

但是，如果餐馆预先准备好一份固定的菜单，只需要你告诉他们“要多少份”或者“加不加辣”，他们就可以直接用这份已经验证过的菜单为你服务。这样就省去了重复的验证和写菜单的时间，你点餐也更加高效。

这就类似于 **`PreparedStatement` 的预编译**：

- **预编译**：数据库事先编译并优化好一个 SQL 模板，类似餐馆准备好的菜单。这样每次执行相同 SQL 时，数据库不需要再解析和优化它。
- **占位符（`?`）**：你只需要告诉餐馆（数据库）“具体的数量”和“是否加辣”，这就像你通过 `PreparedStatement` 的 `setXxx()` 方法传递参数值。

也因为模板预先被编译固定了，所以后续有危险的参数传入也不会影响之前的模板逻辑。不管传入的参数是delete 还是 drop，都会被理解成“具体的数量”或者“是否加辣”，不会识别成删数据还是删表，**因此避免了 sql 注入**。

总结`PreparedStatement`优点:

1. **更高效**：SQL 语句只编译一次，后续执行相同的 SQL 时，直接复用执行计划。
2. **更安全**：参数通过绑定的方式传递，避免了拼接 SQL 时容易发生的 SQL 注入漏洞。

> \#{} 对应的变量自动加上单引号 `' '`

### 在什么情况下只能使用 ${} ？

**一些动态 SQL 场景是无法通过预编译替代的**，只能使用 ${}，例如动态指定表名或者列名。(原因是JDBC不允许**把表名、列名当参数**，只能给“值”用占位符)

```xml
<select id="selectByColumn" resultType="User">
    SELECT * FROM users WHERE ${column} = #{value}
</select>
```

例如一些需要动态排序的场景。

```xml
<select id="selectAllUsers" resultType="User">
    SELECT * FROM users ORDER BY ${orderByColumn} ${orderByType}
</select>
```

> order by排序语句中，因为order by 后边必须跟字段名，而`#{}` 的本质是 **PreparedStatement 的绑定参数**，它只能代表 **值**（Value），比如条件值、数字、字符串、日期等。

---

## Mybatis的执行流程

> MyBatis 的核心思想是：**通过映射文件（XML 或注解）将 SQL 与 Java 对象进行绑定，并通过动态代理执行 SQL。**
>
> 整个执行过程可以分为两大阶段：**初始化阶段** 和 **执行阶段**。
>
> 1）**初始化阶段**主要发生在项目启动时：
>
> MyBatis 会先解析全局配置文件 `mybatis-config.xml`，加载所有 Mapper 文件，然后创建 `Configuration` 对象，把数据源、插件、类型别名、Mapper 注册等信息都放进去。每个 SQL 语句会被解析成一个 `MappedStatement` 对象存起来。
>
> 最后通过这些配置构建出 `SqlSessionFactory`，这是创建 `SqlSession` 的工厂。
>
> 2）**执行阶段**就是我们真正去查数据库的时候：
>
> 我们先通过 `SqlSessionFactory` 获取一个 `SqlSession`；再调用 `getMapper()` 得到 Mapper 接口的动态代理对象。当我们执行 Mapper 方法时，比如 `selectById(1)`，底层会进入 `MapperProxy.invoke()`，根据方法映射找到对应的 SQL（`MappedStatement`），然后交给 `Executor` 去执行。
>
> `Executor` 内部会用到 `StatementHandler`、`ParameterHandler`、`ResultSetHandler`，分别负责预编译 SQL、绑定参数、映射结果。执行完后，MyBatis 会把结果集封装成对应的 Java 对象返回。事务提交、回滚也都是通过 `SqlSession` 来完成的。
>
> 总结一下就是：**初始化阶段负责建好工厂和映射关系，执行阶段则通过动态代理调用 SQL 并完成参数绑定、结果映射和事务控制。**

1️⃣ Spring Boot 启动 → 扫描 Mapper

- 应用启动时，Spring Boot 扫描 `@MapperScan` 下的所有Mapper接口
- 为每个 Mapper 接口注册 **`MapperFactoryBean` 的 BeanDefinition**
- 此时只是注册 Bean 定义，**Mapper 接口本身还未实例化**

------

**2️⃣ 创建 SqlSessionFactory 与 Configuration**

项目启动时，**MyBatis 一定会构建一个 `Configuration` 对象**，用于保存全局配置、SQL 映射信息、插件、缓存等核心元数据。

- 在**原生 MyBatis 或非 Spring Boot 项目**中：
  - 会加载 `mybatis-config.xml`
  - 由 `XMLConfigBuilder` 解析
  - 将 XML 中的配置转换为 `Configuration` 对象
- 在 **Spring Boot / MyBatis-Plus 场景**下：
  - 通常**不会显式编写 `mybatis-config.xml`**
  - 而是通过 `application.yml / properties` 以及 Java Config
  - 由 `MybatisAutoConfiguration / MybatisPlusAutoConfiguration`
  - **以代码方式构建等价的 `Configuration` 对象**

```text
Configuration 内部核心结构：
- mappedStatements
- resultMaps
- typeHandlers
- plugins
- caches
- mapperRegistry
```

------

**3️⃣ Mapper XML → MappedStatement 注册**

- `SqlSessionFactory` 构建过程中，`XMLMapperBuilder` 解析 Mapper XML 文件
- 将每个`<select>/<insert>/<update>/<delete>`标签封装为一个 `MappedStatement `对象
- 存入 Configuration：

```text
key   = namespace + "." + methodName
value = MappedStatement
```

> Configuration 缓存了 **所有可执行 SQL 的元信息**

`MappedStatement` 包含：SQLSource、参数映射、返回类型、statementType、缓存信息等

------

**4️⃣ MapperFactoryBean 实例化 → MapperProxy 创建**

**@MapperScan 阶段**

- 将 Mapper 接口注册到 Configuration 的 MapperRegistry。它维护了 Mapper 接口与MapperProxyFactory的映射关系 。
- 为每个接口创建 MapperProxyFactory
- 同时在 Spring 中注册 MapperFactoryBean

**真正创建代理的时机**

- 在 getBean 触发 MapperFactoryBean.getObject() 时
- 调用 SqlSession.getMapper(MapperInterface)
- 由 MapperProxyFactory 创建 JDK 动态代理 MapperProxy

**注入到业务 Bean**

- Spring 注入的是 getObject() 返回的代理对象
- 容器中实际管理的仍是 MapperFactoryBean

> **Mapper 接口本身不会被直接实例化**
>
> **Spring管理的是MapperFactoryBean**
>
> **Mapper 代理对象的创建：发生在“Spring 为其他 Bean 做依赖注入时触发的 getBean 过程中”。其本质是调用getBean时，发现其是通过FactoryBean注册的，就会调用FactoryBean.getObject()方法，此时才会返回代理对象**

------

**5️⃣ 使用 SqlSession 或 Mapper 接口调用 SQL**

- **方式一：直接使用 SqlSession**

```java
sqlSession.selectList("com.example.mapper.UserMapper.selectUserList");
```

- 不依赖 Mapper 接口，直接使用 statementId
- **方式二：通过 Mapper 接口**

```java
UserMapper mapper = sqlSession.getMapper(UserMapper.class);
mapper.selectUserList();
```

- 返回 JDK 动态代理对象
- 方法调用会进入 `MapperProxy.invoke()`
- 根据方法名 + 参数类型生成 `statementId`
- 从 Configuration 查找对应 `MappedStatement`
- 最终进入 Executor 执行

> 两种调用方式**入口不同，但最终都走 Executor**

------

**6️⃣ Executor 执行 SQL 与一级缓存**

执行链路：

```text
Executor
  ↓
StatementHandler → ParameterHandler → JDBC 执行 → ResultSetHandler
```

- **StatementHandler**
  - 负责创建 JDBC 的 `PreparedStatement`
- **PreparedStatement**
  - 是 JDBC 的预编译 SQL 对象
  - SQL 中的 `?` 占位符在此阶段确定
  - 可以复用执行计划，防止 SQL 注入
- **ParameterHandler**
  - 将 Java 方法参数（如 `#{id}`）
  - 设置到 PreparedStatement 中
- **ResultSetHandler**
  - 将 JDBC 返回的 `ResultSet`
  - 映射为 Java 对象
  - 支持 resultMap、resultType、自动映射、嵌套映射等
- **事务管理**：SqlSession 提供 commit / rollback
- **一级缓存**（localCache）由 Executor 管理
  - **作用域：SqlSession 级别**
  - 同一 SqlSession、相同 MappedStatement + 参数只查询一次

一级缓存会在以下情况下失效：

- 执行 `insert / update / delete`
- `commit / rollback`
- `SqlSession.close()`

------

**7️⃣ 整体启动流程梳理**

1. @MapperScan扫描对应包下的Mapper接口，并将其注册为MapperFactoryBean，MapperFactoryBean里存储着对应Mapper接口的mapperInterface
2. 扫描mapper-config.xml即Mybatis的全局配置类，通过XMLConfigBuilder将配置文件里的数据源，插件，缓存等解析出来并创建Configuration对象，同时XMLConfigBuilder还会扫描Mapper接口对应的XML文件，同时将其中的各种标签如select，insert，update等解析出来并创建为MappedStatement对象。并将MapperProxyFactory注册到Configuration.mapperRegistry
3. 其他Bean注入Mapper接口时，会调用getBean方法，方法内部判断到该Bean实现了BeanFactory实际会调用MapperFactoryBean.getObject()。MapperFactoryBean 内部会：通过 Configuration.mapperRegistry 查找 MapperProxyFactory，并调用 MapperProxyFactory.newInstance() → 创建 MapperProxy。将生成的MapperProxyMapperProxy 注入到 对应的类

---

## Mybatis的二级缓存

Mybatis 中有两类缓存，分别是**一级缓存**和**二级缓存**。

**一级缓存（SqlSession 级别）**：仅在同一个 `SqlSession` 中生效。基于 **命名空间、SQL 语句和参数** 作为唯一标识。

- 默认开启，生命周期与 `SqlSession` 一致。
- 当执行 `commit`、`rollback` 或手动清理缓存时会清空。

**二级缓存（Mapper 级别）**：跨 `SqlSession`共享缓存，基于 Mapper 的缓存。

- 需要手动配置开启（Mapper XML 文件中需要 `<cache/>`）。
- 生命周期与 `SqlSessionFactory` 一致。
- 数据的更新、插入、删除会使相关缓存失效。
- 支持定制化存储（如整合第三方缓存工具）。

一级缓存默认是会话级缓存。即创建一个 SqlSession 对象就是一个会话，一次会话可能会执行多次相同的查询，这样缓存了之后就能重复利用查询结果，提高性能，不过 commit、rollback、update、delete 等都会清除缓存。

不过要注意，不同 SqlSession 之间的修改不会影响彼此，比如 SqlSession1 读了数据 A，SqlSession2 将数据改为 B，此时 SqlSession1 再读还是得到 A，这就出现了脏数据的问题。

所以，如果是多 SqlSession 或者分布式环境下，就可能有脏数据的情况发生，建议将一级缓存级别设置为 statement。

二级缓存是跨 SqlSession 级别的共享的，同一个 namespace 下的所有操作语句，都影响着同一个 Cache。

二级缓存也会有脏数据的情况，比如多个命名空间进行多表查询，各命名空间之间数据是不共享的，所以存在脏数据的情况。

例如 A、B 两张表进行联表查询，表 A 缓存了这次联表查询的结果，则结果存储在表 A 的 namespace 中，此时如果表 B 的数据更新了，是不会同步到表 A namespace 的缓存中，因此就会导致脏读的产生。

> 一般而言 namespace 对应一个 mapper，对应一个表。namespace 对应一个唯一的命名空间，从而可以在不同的映射文件中使用相同的 SQL 语句 ID，例如 user 可以定义一个 selectById，order 也可以定义一个 selectById，因为命名空间不同，就不会冲突。

但Mybatis的缓存都是本地缓存，所以在分布式环境下肯定不会很安全。建议生产上使用 redis 结合 spring cache 进行数据的缓存，或者利用 guava、caffeine 进行本地缓存
