---
title: JVM
date: '2026-02-08'
excerpt: JVM
tags:
  - Java
  - JVM
category: Backend
---

# JVM

## JVM由那些部分组成

JVM由四部分组成，分别是：

* 类加载器子系统
* 运行时数据区
* 执行引擎
* 本地方法接口JNI

>  写好Java代码，被编译器编译成class文件后，他是如何运行的？
>
> 1. 类加载器负责把class文件从本地或网络中拉进来，放到内存中准备好
> 2. 运行时数据区就是内存的仓库，存放代码，变量这些数据
> 3. 执行引擎负责把字节码文件翻译成机器能看懂的指令去执行
> 4. 如果需要调用c++之类的外部代码，比如访问硬件，就需要JNI来帮忙

![img](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/BfMv5pqj_jvmneicun.drawio_mianshiya.webp)

### 类加载器子系统

类加载器主要就是根据类的全限定名，找到对应的.class字节流，来源不限于磁盘/网络/内存等。主要的执行流程分为五步：加载 → 验证 → 准备 → 解析 → 初始化

1. 加载的时候做三件事：

   * 根据类的全限定名找到.class字节流
   * 把字节流转成方法区里的Class元数据
   * 在堆中创建java.lang.Class<>对象，作为他的数据访问接口

2. 验证阶段主要是保证字节码合法且安全。

   > 为什么要把字节码解析成元数据以及创建java.lang.Class对象后才开始验证字节码是否安全合法？
   > 本质原因是因为字节码文件本质是二进制的静态数据文件，JVM需要先通过类加载器将这些静态文件转换成**有结构的模型**也就是方法区当中的运行时数据结构，比如说常量池，方法表，继承关系等才能够去根据这些数据验证。

   1. 文件格式的校验，检验这个字节码文件是否符合JVM要求的文件格式要求
      1. 验证字节码前4字节是否是0XCAFEBABE
      2. 版本号是否超出JVM支持的范围
      3. 常量池是否出现不支持的常量类型，数据的编码是否和类型匹配，是否有错误的引用等等
      4. 字段表，属性表，方法表等的结构是否正确
   2. 元数据校验
      1. 验证继承关系是否合法，比如是否继承自己，或者父类是否有final即不允许被继承。
      2. 验证字段访问权限是否合法。
      3. 验证方法是否合法，比如重写父类方法时，不能 override final 方法，方法访问权限合法（private/protected/public）。）
   3. 字节码校验
      1. 比如跳转指令是否会跳到方法体之外？
      2. 数据类型之间的转换是否有效？
      3. 操作数栈上的数据类型是否匹配？栈深度是否合法
   4. 符号引用校验，**这一部分有时会**延迟到第一次使用时解析**（懒验证）**
      1. 验证当前类引用的外部资源是否存在，以及外部资源中是否存在当前类依赖的字段和方法，对应的类型是否合法，访问权限是否合法

   > 失败直接抛**`VerifyError`**

3. 准备阶段为类的static变量分配内存并设置默认值

4. 解析阶段会讲常量池中的符号引用转换为直接引用，比如替换成指针，相对偏移量，句柄这些实际的物理上的定位手段

5. 初始化阶段

   * 执行static{}静态代码块
   * 执行static变量的显式赋值
   * 合并成<clinit>方法

   > 静态代码块/方法/内部类等只执行一次，线程安全

> 验证，准备和解析统称为链接

**符号引用**是一种字符串级别的描述，编译期就存在，因为编译期时还不知道这个类在哪，类可能晚加载，被不同的classLoader加载或者来自网络，所以先用符号引用占位。

而**直接引用**就是内存地址/指针，运行期才能确定。

符号引用只是占位，而直接饮用则是定位类元数据/方法入口/字段偏移的一个地址引用/指针

此外类加载采用**双亲委派模型**，加载请求先往上抛给父加载器，父加载器搞不定才自己动手。这样能避免核心类被篡改，比如我写个 java.lang.String 是加载不进去的。

#### 双亲委派机制

双亲委派模型是 Java 类加载的核心机制：当一个类加载器收到加载请求时，不会自己先去加载，而是把请求**向上委派给父加载器**，一直委派到最顶层的 Bootstrap ClassLoader。如果父加载器加载不了，才轮到自己加载，如果父加载器能记载就会把类对应的java.lang.Class对象的引用返回给子类加载器。

举个例子，你写了个类叫 MyService，Application ClassLoader 收到加载请求后不会立刻加载，而是问 Extension ClassLoader："你能加载吗？"

Extension ClassLoader 又去问 Bootstrap ClassLoader，Bootstrap ClassLoader 在 rt.jar 里找不到这个类，说"我搞不定"，请求就退回给 Extension ClassLoader。

Extension ClassLoader 在 ext 目录也找不到，再退回给 Application ClassLoader，最终由 Application ClassLoader 从 classpath 里找到并加载。

![img](https://pic.code-nav.cn/mianshiya/question_picture/1843904816956411905/c6PvNqS1_YFl3khhK0r_mianshiya.jpg)

双亲委派的好处很直接：

1）保证核心类库安全。java.lang.Object 永远由 Bootstrap ClassLoader 加载，就算有人恶意写了个同名的 Object 类放到 classpath 下，也不会被加载，因为请求先委派给 Bootstrap，Bootstrap 在 rt.jar 里找到了就直接返回。

2）避免类重复加载。同一个类在 JVM 中只会被加载一次，保证类的唯一性。

> 比如我想自己写一个java.lang.Object类，来替换java核心库下的Object类，但提交类加载请求时java.lang.Object每次都会被Bootstrap ClassLoader抢先加载。
>
> 后续我又打算自己写一个java.lang.Dog类，来访问java.lang包下受限的资源，结果是类可以加载成功但无法访问首先资源，因为JVM判断类的标准出了看全限定名外，还要看加载这个类的类加载器。而不同类加载器加载出来的类不允许跨命名空间访问对方的受限资源

##### 三种内置的类加载器

JDK 8 及之前，Java 提供了 3 种类加载器：

1）Bootstrap ClassLoader：C++ 实现的，负责加载 `<JAVA_HOME>/lib` 目录下的核心类库，比如 rt.jar、resources.jar。在 Java 代码里获取它的引用会返回 null。

2）Extension ClassLoader：Java 实现的，负责加载 `<JAVA_HOME>/lib/ext` 目录下的扩展类库，或者被 java.ext.dirs 系统变量指定的路径。

3）Application ClassLoader：Java 实现的，负责加载 classpath 下的类，包括我们自己写的代码和引入的第三方 jar 包。没有自定义类加载器的话，它就是程序的默认加载器。

> 双亲委派模型不是强制规定，你不遵守也不会报错，只是 Java 设计者推荐的一种类加载器实现方式。

##### 打破双亲委派的场景

双亲委派虽然好，但某些场景下必须打破它：

**JDBC 和 SPI 机制**

JDBC 的 Driver 接口定义在 rt.jar 里，由 Bootstrap ClassLoader 加载。但具体的驱动实现，比如 MySQL 的 com.mysql.cj.jdbc.Driver 在 classpath 下的 jar 包里，Bootstrap ClassLoader 压根加载不到。

解决办法是用线程上下文类加载器。线程上下文类加载器 = 把“用哪个类加载器加载类”的决定权，从“被调用方”反转交给“调用方（线程）”。**它是为了解决：父加载器需要调用子加载器才能看到的类，这个“类可见性死局”。**

核心思想就是：既然父类加载器看不到实现类在哪，但是运行的线程知道，其实就是JVM在线程内部随身携带了一个类加载器也就是`Thread.currentThread().getContextClassLoader()`。在使用时通过对应的set方法将类加载器塞入当前线程中，然后加载时再取出来加载类。

DriverManager 在初始化时会调用 `Thread.currentThread().getContextClassLoader()` 拿到 Application ClassLoader，用它来加载具体的驱动实现。这就打破了"父加载器加载的类不能使用子加载器加载的类"这个限制。

所有 Java SPI 机制都是这个套路：接口定义在核心类库，实现在 classpath 下，通过线程上下文类加载器来加载实现类。

> SPI的核心类ServiceLoader在java.util包下，被Bootstrap ClassLoader加载，而我们需要调用被Bootstrap ClassLoader加载的类的方法，比如ServiceLoader.load()去加载位于classpath下的接口类的实现类。但默认在调用class.forName的时候会使用加载该类的类加载器去加载对应类，而加载ServiceLoader的Bootstrap ClassLoader他看不到位于classpath下的接口实现类，所以就无法完成加载。
>
> 因此SPI需要打破双亲委派，不然Bootstrap ClassLoader来加载对应的接口实现类，而是在启动时往线程里存一个自定义的类加载器，等到要加载接口的实现类时，从线程中将该类加载器取出，用这个自定义的类加载器去加载接口的实现类。
>
> 实现的本质其实都是在调用Class.forName时，从线程池中取出你希望加载该类的类加载器，然后传入Class.forName方法中

**Web 容器的隔离需求**

Tomcat、WebLogic 这些容器，每个 Web 应用都有自己的 WebAppClassLoader，而且加载顺序跟标准双亲委派反过来：优先自己加载，加载不到才委派给父加载器。

为什么要这么搞？假设两个应用分别依赖 Spring 4 和 Spring 5，如果走双亲委派，Spring 类会被共享的父加载器加载，那两个应用就只能用同一个版本，这显然不行。每个应用用自己的类加载器，就能实现版本隔离。

> 而对于Tomcat来说，Tomcat允许不同的Web容器依赖不同版本的第三方库。他会为每个Web容器创建一个自定义类加载器WebAppClassLoader，然后优先用该类加载器去加载类，找不到再去找父类。不同的类加载器导致web应用之间的命名空间不同，无法相互访问对方的受限资源。达到隔离的效果。

##### 自定义类加载器

想自定义类加载器很简单，继承 ClassLoader 重写 findClass 方法就行：

```java
public class MyClassLoader extends ClassLoader {
    private String classPath;
    
    public MyClassLoader(String classPath) {
        this.classPath = classPath;
    }
    
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        byte[] data = loadClassData(name);
        if (data == null) {
            throw new ClassNotFoundException(name);
        }
        return defineClass(name, data, 0, data.length);
    }
    
    private byte[] loadClassData(String name) {
        String fileName = classPath + "/" + name.replace(".", "/") + ".class";
        try (FileInputStream fis = new FileInputStream(fileName);
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[1024];
            int len;
            while ((len = fis.read(buffer)) != -1) {
                baos.write(buffer, 0, len);
            }
            return baos.toByteArray();
        } catch (IOException e) {
            return null;
        }
    }
}
```

如果想打破双亲委派，重写 loadClass 方法，不调用 `super.loadClass()` 就行。但一般不建议这么干，除非你很清楚自己在做什么。

> 需要注意，SPI也就是ServiceLoader.load()有两个重载
>
> * 一个是public static <S> ServiceLoader<S> load(Class<S> service)，默认使用加载接口类的类加载器去加载实现类。在JDBC场景下就会由于双亲委派的限制，导致加载Driver类的Bootstrap ClassLoader找不到位于classpath下的Driver实现类
> * 另一个则是public static <S> ServiceLoader<S> load(Class<S> service, ClassLoader loader)，他会用传入的loader来加载接口的实现类，JDBC的DriverManager就是利用这个方法，让实现类能够被加载。
>
> JDBC其实也可以直接传入自定义类加载器，而不使用TCCL，但使用TCCL的话，就无需每次都new一个类加载器然后传进去。可以在启动或者是线程创建时显式set一次TCCL，随后就可以直接通过Thread.currentThread().getContextClassLoader()传入对应的类加载器。并且对于多数据源场景下，TCCL只需要在对应业务的入口显式把对应的类加载器set到线程里就可以让不同线程加载不同的实现类。

##### Q&A

###### 为什么不从顶层往下加载

既然最终可能是父加载器加载，为什么不直接从 Bootstrap ClassLoader 开始往下找？

原因有两个：

1. 类加载器之间是组合关系，子加载器持有父加载器的引用，但父加载器不知道有哪些子加载器。如果从上往下找，父加载器都不知道该把请求传给谁。

2. 假设有 5 个平级的自定义类加载器，从上往下的话，Bootstrap ClassLoader 加载不了就得挨个问这 5 个子加载器，效率太低。从下往上的话，谁发起的请求最终就由谁兜底加载，路径清晰。

###### 如果我自己写一个 java.lang.String 类，能被加载吗？

能被加载但用不了。双亲委派机制下，加载 java.lang.String 的请求会一路委派到 Bootstrap ClassLoader，它在 rt.jar 里找到了 String 就直接返回。你自己写的压根没机会被加载。就算你打破双亲委派强行加载，JVM 也有安全检查，java 开头的包名是受保护的，会直接抛 SecurityException。

###### 同一个类被不同的类加载器加载，在 JVM 里是同一个类吗？

不是。在 JVM 里，判断两个类是否相同，除了类的全限定名要一样，加载它们的类加载器也必须是同一个。也就是说，com.example.User 被 ClassLoader A 和 ClassLoader B 分别加载后，在 JVM 里是两个不同的类，它们之间的对象不能互相赋值，强转会抛 ClassCastException。

### 运行时数据区

JVM的运行时数据区分为：堆，方法区，虚拟机栈，本地方法栈，程序计数器

其中，堆和方法区为线程共享。虚拟机栈，本地方法栈，程序计数器为每个线程私有

1. 堆是最大的一块内存，所有 new 出来的对象和数组都往这儿放。GC 主要就在堆上干活，新生代老年代那套都在这里面。

2. 方法区存的是类的元信息，包括类结构、常量池、静态变量、JIT 编译后的代码缓存。JDK 8 之前用永久代实现，容易撑爆内存，JDK 8 换成了元空间，直接用系统内存，上限高多了。

3. 虚拟机栈是线程私有的，每调用一个方法就压一个栈帧进去，方法执行完就弹出来。栈帧里装着局部变量表、操作数栈、动态链接、方法返回地址这些东西。

4. 本地方法栈跟虚拟机栈差不多，区别是它服务的是 native 方法，也就是用 C/C++ 写的那些 JNI 代码。

5. 程序计数器就是个小本本，记录当前线程执行到哪条字节码指令了。线程切换回来得知道从哪继续跑。这是唯一不会 OOM 的区域，因为它就存一个地址，几个字节的事。

除此之外还有一块**直接内存**，虽然不属于 JVM 运行时数据区，但 NIO 的 DirectByteBuffer 会用到它。直接在系统内存里分配，省掉了堆和本地内存之间的拷贝，IO 密集型场景能提升不少性能。

> JIT就是Just-In-Time Compilation 即时编译。
>
> 1. 为什么需要JIT？
>    * Java 程序最初写成 .java 文件 → 编译成 字节码 .class 文件。
>    * 字节码是 平台无关 的，但是不能直接跑在 CPU 上，必须由 JVM 解释执行。
>    * 这样导致的问题就是JVM在解释执行的时候虽然启动很快(因为不需要像c++那样全部编译完才执行)，但是一条条地翻译字节码->机器码，速度就会比较慢。所以引入了JIT把一些热点代码直接编译成机器码，下次运行就能直接使用。(在思想上很想redis缓存热门数据)。
>    *  简单来说：解释器负责通用性，JIT 负责性能。
>
> 
>
> 2. JIT 编译的工作原理
>    * JVM 一边解释执行字节码，一边收集运行信息（比如某个方法被调用多少次）
>    * 如果发现某段代码是 热点代码（HotSpot），就交给 JIT 编译器，把它翻译成机器码。下次再执行时，直接跑机器码 → 性能接近 C/C++。
>
> 
>
> 3. JIT 编译的优化
>
> JIT 不只是单纯翻译，还会做大量优化：
>
> * 方法内联（Inlining）：把小方法的代码直接嵌入调用处，减少方法调用开销。
> * 循环展开 / 消除：减少循环判断次数
> * 逃逸分析：判断对象是否能栈上分配
> * 锁优化：锁消除、锁粗化、偏向锁、轻量级锁。
> * 分支预测优化：加速 if/else 的执行。



#### 堆

HotSpot把堆分成新生代和老年代，新生代又分成 Eden 区和两个 Survivor 区。

![img](https://pic.code-nav.cn/mianshiya/question_picture/1843904816956411905/DZca9OzY_h5yJ51xARI_mianshiya.webp)

1. 新对象优先在 Eden 区分配。

2. Eden 满了触发 Minor GC，存活的对象挪到 Survivor 区。
3. 两个 Survivor 区轮流用，每熬过一次 GC 年龄加 1，年龄到 15（15的原因在于对象头中的markword负责记录GC年龄，他只留了4bit） 或者 Survivor 放不下了就晋升到老年代。
4. 老年代满了触发 Major GC，回收一次耗时比 Minor GC 长得多。

这套分代设计基于一个经验假设：绝大多数对象朝生夕灭。IBM 有个统计数据，新生代 98% 以上的对象熬不过一次 GC，分代之后可以用不同的回收策略对付不同年龄的对象，效率更高。

#### 虚拟机栈和栈帧

每个线程都有自己的虚拟机栈，栈里面是一个个栈帧。调用方法就是压栈帧，方法返回就是弹栈帧。

栈帧内部有四个主要部分：局部变量表存方法参数和局部变量；操作数栈是字节码指令的工作区，加减乘除都在这里完成；动态链接指向运行时常量池中该方法的符号引用；方法返回地址记录调用者的下一条指令位置，方法执行完好回去。

![img](https://pic.code-nav.cn/mianshiya/question_picture/1843904816956411905/ZtcfAS2Q_hk5jyxZujD_mianshiya.webp)

-Xss 参数可以设置单个线程的栈大小，默认一般是 512K 到 1M。栈太小容易 StackOverflowError，递归深度受限；栈太大浪费内存，能开的线程数就少了。

> 关于动态链接：
>
> 1. 指向运行时常量池的方法引用
>
> 2. 每一个栈帧内部都包含一个指向运行时常量池中该栈帧所属方法的引用
>
> 3. 包含这个引用的目的就是为了支持当前方法的代码能够实现动态链接（Dynamic Linking）
>
> 4. 在java源文件被编译到字节码文件中时，所有的变量和方法引用都作为符号引用（Symbolic Reference）保存在class文件的常量池里。比如:描述一个方法调用了另外的其他方法时，就是通过常量池中指向方法的符号引用来表示的
>
> 5. 动态链接的作用就是为了将这些符号引用转换为调用方法的直接引用

#### 方法区

JDK 7 及之前，HotSpot 用永久代实现方法区，大小通过 -XX:PermSize 和 -XX:MaxPermSize 设置。问题是永久代和堆连在一起，GC 不好搞，而且默认值偏小，动态代理、CGLIB 生成大量类很容易把永久代撑爆报 PermGen OOM。

JDK 8 把永久代干掉了，换成元空间。元空间用的是本地内存，默认不设上限，由系统内存决定。可以用 -XX:MetaspaceSize 和 -XX:MaxMetaspaceSize 控制，不设的话理论上能用光系统内存。

| 版本   | 实现方式 | 内存位置 | 默认大小 |
| ------ | -------- | -------- | -------- |
| JDK 7  | 永久代   | Java 堆  | 64M~85M  |
| JDK 8+ | 元空间   | 本地内存 | 无上限   |

字符串常量池也挪了位置：JDK 6 在永久代，JDK 7 挪到了堆里，JDK 8 继续在堆里。

> JDK1.6中字符串常量池和静态常量都在永久代，JDK1.7之后移至堆中

#### Q&A

##### 栈上分配是什么？什么情况下对象不会分配在堆上？

如果 JIT 通过逃逸分析发现某个对象不会逃出当前方法，就可能把它直接分配在栈上，方法结束自动回收，不用进堆也不用 GC。更激进的是标量替换，把对象拆成基本类型变量，连对象头都省了。不过这些优化依赖 JIT，解释执行阶段没这福利。可以用 -XX:+DoEscapeAnalysis 开启逃逸分析，默认是开的。

##### 堆内存设多大合适？新生代和老年代比例怎么调？

没有标准答案，得看应用特点。一般建议堆设成物理内存的一半到三分之二，留点给元空间和直接内存。新生代和老年代默认是 1:2，可以用 -XX:NewRatio 调整。如果对象大多是短命的，新生代可以调大点，减少对象过早晋升到老年代。如果有很多长期存活的缓存对象，老年代就得留够。实际调优得结合 GC 日志分析，看 Minor GC 和 Major GC 的频率和耗时

##### StackOverflowError 和 OutOfMemoryError 有什么区别？分别在什么情况下发生？

StackOverflowError 是单个线程的栈深度超过了限制，典型场景是递归调用没有终止条件，一直压栈帧直到爆栈。OutOfMemoryError 是内存不够用了，可能是堆满了创建不了新对象，可能是元空间满了加载不了新类，也可能是创建线程时系统内存不够分配栈空间。前者是线程级别的问题，不影响其他线程；后者通常是全局性的，应用可能直接挂掉。

### 执行引擎

执行引擎负责把字节码转换为机器指令并执行，内部有两个核心组件配合工作：

解释器负责逐条解释字节码并执行，启动速度快但效率一般。JIT 编译器会把执行次数超过阈值的**热点代码**编译成本地机器码缓存起来，下次直接执行机器码，性能提升明显。

HotSpot 里有两个 JIT 编译器：C1 编译器做轻量级优化，编译快；C2 编译器做深度优化，编译慢但生成的代码跑得快。JDK 8 默认用分层编译，先让 C1 快速编译，热点代码再让 C2 深度优化。

#### 编译执行和解释执行

**编译执行**是程序运行前先把源码整个翻译成机器码，运行时直接跑机器码，不用再翻译。C、C++、Go 走的就是这条路，执行效率高，但每个平台得单独编译一份。

**解释执行**是运行时逐行翻译逐行执行，不需要提前编译。Python、Ruby、JavaScript（早期）都是解释执行，跨平台方便，但每次跑都要翻译一遍，效率差点意思。

而JVM 两种都用，是**混合执行**模式。程序刚启动时，JVM 用解释器逐条翻译字节码执行；跑着跑着发现某段代码特别热（比如一个方法被调用了上万次），JIT 编译器就介入把它编译成本地机器码缓存起来，后面再执行就直接跑机器码了。

启动阶段靠解释器快速响应，热点代码靠 JIT 编译提升性能，两者配合兼顾了启动速度和运行效率。

#### JIT

JIT 就是 JVM 在运行时把字节码编译成机器码的技术。Java 程序刚启动时是解释执行的，一行一行翻译字节码，速度比较慢。但 JVM 会统计每个方法被调用的次数，当某段代码被执行超过一定阈值，JVM 就认为它是**热点代码**，把它编译成本地机器码缓存起来，下次直接执行机器码，性能能提升 10 倍以上。

举个例子，一个方法被调用了 10000 次，前几千次是解释执行，JIT 发现这是热点后编译成机器码，后面几千次就直接跑编译好的代码了。所以 Java 程序有个"预热"的过程，跑一段时间后性能会明显上来。

##### 热点探测

JVM 用两种计数器来识别热点代码。

* 第一种是**方法调用计数器**，统计每个方法被调用的次数，Client 模式默认阈值是 1500 次，Server 模式是 10000 次。
* 第二种是**回边计数器**，统计循环体执行的次数，一个 for 循环跑了几万次也会被认定为热点。

这两个计数器可以通过 `-XX:CompileThreshold` 调整。如果你的服务启动后马上要扛流量，可以把阈值调低让 JIT 早点介入；如果更看重启动速度，可以调高阈值减少编译开销。

##### C1和C2编译器

HotSpot JVM 内置了两个 JIT 编译器：

| 特性     | C1（Client Compiler） | C2（Server Compiler）        |
| -------- | --------------------- | ---------------------------- |
| 编译速度 | 快，毫秒级            | 慢，可能几十毫秒             |
| 优化程度 | 轻量级优化            | 激进优化                     |
| 适用场景 | 客户端应用、快速启动  | 服务端应用、长时间运行       |
| 典型优化 | 基础内联、简单消除    | 逃逸分析、标量替换、循环展开 |

JDK 8 之后默认开启**分层编译**，程序启动时先用 C1 快速编译，保证响应速度；等运行稳定后，热点中的热点再交给 C2 做深度优化，两全其美。

##### HotSpot的分层编译

HotSpot 虚拟机从 JDK 7 开始引入分层编译（Tiered Compilation），把编译分成 5 个层级：

1）第 0 层：纯解释执行，不做任何编译优化

2）第 1 层：C1 编译器编译，不开启性能监控

3）第 2 层：C1 编译器编译，开启方法调用计数和回边计数

4）第 3 层：C1 编译器编译，开启全部性能监控

5）第 4 层：C2 编译器编译，做激进优化

![Snipaste_2026-01-19_14-48-19.png](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/2vfBLiPd_Snipaste_2026-01-19_14-48-19.webp)

C1 编译器编译速度快但优化程度低，C2 编译器编译慢但能做逃逸分析、标量替换这些激进优化。分层编译让 JVM 可以根据代码的热度动态选择编译级别，冷代码用解释器或 C1 凑合跑，热点代码上 C2 榨干性能。

##### JIT 的核心优化技术

1）**方法内联**：把被调用方法的代码直接嵌入调用处，省掉方法调用的栈帧开销。比如 getter/setter 这种小方法，内联后跟直接访问字段一样快。

2）**逃逸分析**：分析对象的作用域，如果一个对象只在方法内部使用、不会逃逸到外部，JIT 可以把它分配在栈上而不是堆上，省掉 GC 压力；甚至直接把对象拆成几个基本类型变量，这叫**标量替换**。

3）**循环展开**：把循环体复制多份减少循环判断次数。比如原来循环 100 次，展开后变成循环 25 次但每次执行 4 份代码，减少了 75 次循环判断。

4）**空值检查消除**：如果 JIT 分析出某个引用不可能为 null，就把 null 检查的指令删掉。

![img](https://pic.code-nav.cn/mianshiya/question_picture/1843904816956411905/NWlSnArS_DA6ONEMwhd_mianshiya.webp)

##### Q&A

###### JIT 编译是在主线程执行的吗？会不会阻塞业务代码？

JIT 编译在独立的后台线程执行，不会阻塞业务代码。当某个方法达到编译阈值时，JVM 把编译任务丢给编译线程，业务代码继续解释执行；等编译完成后，下次调用这个方法时才切换到编译后的机器码。所以从业务角度看，JIT 编译是无感知的，最多就是 CPU 占用会高一些。

###### C1 和 C2 编译器有什么区别？什么时候用哪个？

C1 也叫 Client 编译器，编译速度快但优化保守，生成的代码质量一般。C2 也叫 Server 编译器，编译慢但会做逃逸分析、循环展开、内联等激进优化，生成的代码质量高。默认开启分层编译后，代码先用解释器跑，热了用 C1 编译快速提升性能，非常热了再用 C2 深度优化。单核或者内存小的机器可以关掉 C2 只用 C1，省资源。

###### 逃逸分析是什么？JIT 怎么利用它优化代码？

逃逸分析是判断一个对象的作用域有没有逃出当前方法或线程。如果对象不会逃逸，JIT 可以做三种优化：一是栈上分配，对象直接在栈上分配不进堆，方法结束自动回收，省掉 GC；二是标量替换，把对象拆成基本类型变量，连对象头都省了；三是同步消除，对象不会被其他线程访问，加的锁可以直接去掉。这些优化都依赖运行时 profile 信息，AOT 编译做不了。

###### JIT 编译后的代码有没有可能被丢掉重新编译？

有。这种情况叫**逆优化**。JIT 做优化时会基于当前的运行情况做假设，比如假设某个分支永远不会走到、某个类型检查永远是 true。如果后续运行打破了这些假设，JVM 就会把之前编译的代码作废，退回到解释执行，然后基于新的信息重新编译。最常见的场景是类层次结构变化，比如之前只有一个实现类所以 JIT 做了激进内联，后来加载了新的子类，之前的假设就不成立了。

###### Graal 编译器和 C2 有什么区别？为什么有人说它是未来？

Graal 是用 Java 写的 JIT 编译器，C2 是 C++ 写的。用 Java 写的好处是更容易维护、更容易做实验性优化。性能上 Graal 在某些场景能比 C2 快 10%~20%，尤其是 Scala 这种大量使用高阶函数的语言。另外 Graal 是 GraalVM 的核心组件，支持 AOT 编译成 native image，冷启动时间能从秒级降到毫秒级，这对 Serverless 场景非常有吸引力。JDK 17 之后 Graal 作为实验特性内置，用 `-XX:+UseJVMCICompiler` 可以启用。

#### AOT

AOT 就是在程序运行之前，把 Java 字节码直接编译成目标平台的机器码。跟 JIT 正好相反：JIT 是运行时边跑边编译，AOT 是打包阶段就编译好了。

AOT 最大的好处是**启动快**。传统 Java 程序启动要加载几千个类、JIT 要预热，一个 Spring Boot 应用启动可能要好几秒。用 GraalVM 编译成 native image 后，启动时间能从 5 秒降到 50 毫秒，内存占用也能从 200MB 降到 30MB。这对 Serverless、云函数这种冷启动敏感的场景非常有吸引力。

JIT 编译流程：Java 源码编译成字节码，JVM 启动后解释执行字节码，运行时 JIT 编译器检测热点代码，将热点代码编译成机器码缓存起来。

AOT 编译流程：Java 源码编译成字节码，构建阶段 AOT 编译器将字节码编译成机器码，打包成可执行文件，运行时直接执行机器码，无需 JVM。

> 适合CLI工具，Serverless以及冷启动敏感场景

![img](https://pic.code-nav.cn/mianshiya/question_picture/1843904816956411905/7EJpRlAR_I4kK6oLxko_mianshiya.webp)

##### AOT 和 JIT 的核心区别

| 特性     | JIT                   | AOT                  |
| -------- | --------------------- | -------------------- |
| 编译时机 | 运行时                | 构建时               |
| 启动速度 | 慢，需要预热          | 快，毫秒级启动       |
| 峰值性能 | 高，有运行时优化      | 较低，缺少运行时信息 |
| 内存占用 | 大，需要 JVM 和编译器 | 小，不需要 JVM       |
| 跨平台性 | 一次编译到处运行      | 每个平台单独编译     |
| 反射支持 | 完全支持              | 需要显式配置         |

简单说，JIT 擅长长时间运行的服务，跑得越久优化越到位也就越快；AOT 擅长启动快、用完就走的场景。

##### GraalVM Native Image

GraalVM 是目前 Java AOT 编译的主流方案。它能把 Java 应用编译成独立的可执行文件，不依赖 JVM，直接在操作系统上跑。

```bash
# 安装 GraalVM 和 native-image
sdk install java 21-graalce
gu install native-image

# 编译 Spring Boot 应用
./mvnw -Pnative native:compile

# 或者用 Gradle
./gradlew nativeCompile
```

编译出来的文件就是一个普通的可执行程序，双击就能跑，跟 Go、Rust 编译出来的东西一样。

##### AOT 编译的限制

AOT 编译需要在构建阶段确定所有会用到的类和方法，但 Java 有很多动态特性会在运行时才知道具体类型：

1）**反射**：`Class.forName("com.example.Foo")` 这种代码，编译器不知道 Foo 是啥，需要手动配置 reflect-config.json 告诉它。

2）**动态代理**：JDK Proxy、CGLIB 生成的代理类在运行时才产生，AOT 编译器看不到。

3）**序列化**：JSON 序列化框架通常用反射读写字段，需要额外配置。

4）**类路径扫描**：Spring 的 `@ComponentScan` 会扫描 classpath 下的类，AOT 模式下需要提前分析好。

Spring Boot 3.0 和 Quarkus 为了支持 Native Image，做了大量适配工作，在构建阶段就把这些动态行为静态化了。

![img](https://pic.code-nav.cn/mianshiya/question_picture/1843904816956411905/oHOBwExk_zmUCAD2LG4_mianshiya.webp)

##### Q&A

###### AOT 编译后的程序性能一定比 JIT 差吗？

回答：不一定，要看场景。AOT 在启动阶段肯定赢，但长时间运行的话 JIT 通常能追上甚至反超。因为 JIT 能根据实际运行数据做优化，比如它知道某个 if 分支 99% 走 true，就会把代码布局按这个方向优化。AOT 编译时没有这些信息，只能做保守优化。不过 GraalVM 支持**Profile-Guided Optimization**，你可以先跑一遍收集运行数据，再用这些数据做 AOT 编译，效果会好很多。

###### Spring Boot 3.0 的 Native Image 支持有什么坑？

回答：坑不少。首先是构建时间长，一个普通的 Spring Boot 应用可能要编译五六分钟。其次是内存占用大，编译过程本身就要吃好几个 G 的内存。再就是调试麻烦，native image 没法用传统的 Java 调试器，出了问题只能看日志。最后是兼容性问题，不是所有第三方库都支持 native image，用到不支持的库就编译不过。建议生产上先在普通 JVM 模式跑稳定了，再考虑切 native image。

###### 为什么 Serverless 场景特别需要 AOT？

回答：Serverless 的计费模式是按调用次数和执行时间收费的，启动时间也算在执行时间里。传统 Java 应用启动要 3~5 秒，这 3 秒就是白花钱。而且云厂商为了节省资源，会在没有请求的时候把你的实例销毁，下次请求来了再重新拉起，这就是冷启动。如果冷启动要好几秒，用户体验就很差。用 AOT 编译成 native image 后，冷启动能降到几十毫秒，跟 Node.js、Go 一个级别，Java 终于能在 Serverless 领域跟其他语言竞争了。

###### GraalVM Native Image 的 closed-world assumption 是什么意思？

回答：意思是编译器假设在构建时就能看到程序会用到的所有代码，运行时不会动态加载新的类。这是 AOT 编译的基本前提，不然编译器没法确定要编译哪些东西。传统 Java 是 open-world 的，可以随时 `Class.forName` 加载新类、可以用 URLClassLoader 加载外部 jar。在 closed-world 假设下，这些都不行，所有会用到的类必须在构建时就确定下来，要么在代码里直接引用，要么在配置文件里显式声明。

### 本地方法接口

JNI 允许 Java 程序调用 C/C++ 这类本地代码，也能让本地代码回调 Java。典型场景是访问操作系统级别的功能，比如文件操作底层、网络 socket 底层，或者调用高性能的图形库、加密库。

声明一个 native 方法后，用 javah 生成头文件，再用 C/C++ 实现对应函数，编译成动态链接库，Java 里 System.loadLibrary 加载进来就能调了。

### Q&A

#### 类加载器有哪几种，它们之间是什么关系？

主要有三种。Bootstrap ClassLoader 是顶层的，C++ 写的，负责加载 rt.jar 这些核心类库。Extension ClassLoader 加载 ext 目录下的扩展类。Application ClassLoader 加载应用 classpath 下的类，也就是我们自己写的代码。它们之间是父子委托关系，不是继承关系，通过 parent 字段关联。加载类时先委托给父加载器，父加载器找不到才自己加载。

#### 方法区和堆有什么区别？为什么 JDK 8 要把永久代换成 Metaspace？

堆存对象实例，方法区存类的元数据和常量池。永久代有两个问题：一是大小固定，类加载多了容易 OOM；二是 Full GC 时才回收，回收效率低。Metaspace 用本地内存，默认不设上限，可以动态扩展，而且元数据回收更及时。Spring 这类大量使用动态代理的框架，用 Metaspace 稳定性好很多。

---

## JVM那些情况会OOM？如何分析内存占用？OOM后又如何分析？

### JVM常见的OOM类型

JVM 常见的 OOM 有 6 种类型，每种对应不同的内存区域出问题。

| OOM 错误类型                       | 出问题的区域     | 典型触发场景                       |
| ---------------------------------- | ---------------- | ---------------------------------- |
| Java heap space                    | 堆               | 大量对象创建、内存泄漏             |
| StackOverflowError                 | 栈               | 无限递归、调用链过深               |
| Metaspace / PermGen space          | 方法区           | 动态代理生成大量类、频繁热部署     |
| Direct buffer memory               | 直接内存         | NIO 分配过多 ByteBuffer            |
| Unable to create new native thread | 操作系统线程资源 | 线程数超出系统限制                 |
| GC overhead limit exceeded         | 堆               | GC 花了 98% 时间只回收不到 2% 内存 |

StackOverflowError 严格来说不是 OutOfMemoryError 的子类，但面试时一般放一起说。

按内存区域划分：

堆相关的有两个，heap space 是堆直接撑爆，GC overhead 是堆快满了 GC 拼命回收但效果太差。

栈只有 StackOverflowError 一种，栈帧压太多把线程栈撑爆。

方法区就是 Metaspace 或早期的 PermGen space。

堆外内存有两种，Direct buffer memory 是 NIO 直接内存爆了，Unable to create native thread 是系统线程资源不够了。

![img](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/dEOLfcyu_oom.drawio_mianshiya.webp)

#### 堆内存溢出

**Java heap space** 是最常见的 OOM。堆是存对象实例的地方，创建太多对象、有内存泄漏导致对象回收不掉，堆就会撑爆。

典型场景：一个 ArrayList 当缓存用，只往里加数据不清理；查数据库一次查出几百万条记录全加载到内存；图片处理一次性把几百 MB 的图片读进内存。

排查方法：加上 `-XX:+HeapDumpOnOutOfMemoryError` 参数，OOM 时自动 dump 堆快照，用 MAT 或 VisualVM 分析哪些对象占用内存最多。

解决方案：要么优化代码减少对象创建，分页查询、及时释放大对象；要么用 `-Xmx` 加大堆内存，但这只是治标，迟早还会爆。

#### 栈内存溢出

StackOverflowError 是线程栈空间用完了。每调用一个方法就压一个栈帧，递归没写退出条件、或者调用链太深，栈帧压得太多就爆了。

每个线程默认栈大小 1MB，一个栈帧大约几百字节到几 KB，所以正常情况下几千层调用没问题。但如果递归深度上万层就悬了。

解决方案：检查递归逻辑，把递归改成迭代；或者用 `-Xss` 调大线程栈，比如 `-Xss2m`，但调太大会影响能创建的线程总数。

#### 方法区溢出

JDK 7 及之前报 `PermGen space`，JDK 8 之后报 `Metaspace`。方法区存类的元数据，动态生成大量类就会撑爆。

典型场景：Spring AOP 给几千个 Bean 生成代理类、CGLIB 动态生成类、Groovy 脚本频繁编译、JSP 不断修改重新编译、OSGi 热部署类加载器泄漏。

JDK 8 的 Metaspace 用本地内存，默认不限大小，所以比永久代好一些，但生产环境还是建议设置 `-XX:MaxMetaspaceSize=256m` 来兜底，不然一旦泄漏会把机器内存吃光。

#### 直接内存溢出

NIO 的 ByteBuffer.allocateDirect 分配的是堆外内存，不走 GC 管理。Netty 为了追求性能大量用直接内存做网络缓冲区，分配了不释放就会爆。

直接内存默认上限跟 `-Xmx` 一样大，可以用 `-XX:MaxDirectMemorySize` 单独设置。

排查比堆内存麻烦，因为 dump 文件里看不到直接内存的内容。得用 NMT（Native Memory Tracking）或者 pmap 看进程内存分布。

#### 线程数过多

`Unable to create new native thread` 表示操作系统不让创建新线程了。Linux 默认每个进程最多几千到几万个线程，具体看 `/proc/sys/kernel/threads-max` 和 `ulimit -u`。

每个线程要占 1MB 栈空间加上一些内核资源，创建 1 万个线程就要 10GB 内存光用来放栈。

解决方案：用线程池控制线程数量，别 new Thread 裸创建；如果确实需要高并发，上协程或者 NIO 多路复用。

#### GC 执行耗时过长

`GC overhead limit exceeded` 触发条件很苛刻：连续 5 次 Full GC，每次 GC 时间超过 98%，而且每次只回收不到 2% 的堆内存。说白了就是 GC 拼命干活但基本白干，内存还是满的。

这种情况一般是严重的内存泄漏，堆里塞满了不能回收的对象，GC 跑一圈下来啥也回收不了。

可以用 `-XX:-UseGCOverheadLimit` 关掉这个检测，但只是把报错从 GC overhead 换成 heap space，治标不治本。正确做法是 dump 堆分析泄漏点。

### 如何分析JVM的内存占用情况？

利用 `jstat ` 监控和分析 JVM 内部的垃圾回收、内存等运行状态。可以用它来查看堆内存、非堆内存等的实时状态。

可以使用 `jmap` 查看， JVM 堆的详细信息（包括堆的配置、内存使用情况、GC 活动等）。

在发生 OOM 时，可以根据 `jmap` 得到堆转储文件（建议增加JVM启动参数，`-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/heapdump.hprof`，在发生 OOM 后自动生成转储文件），再导入到 MAT、VisualVM、GCeasy等工具中分析文件，找出哪些对象占用了大量的内存，再定位到具体的代码解决问题。

#### jstat

他是JDK自带的工具，用于监控JVM的各种运行时数据

```sh
jstat -gc <pid> 1000 10
jstat -gcutil <pid> 1000 10
```

- -gc 选项：显示垃圾收集信息（也可以用 gcutil ，gcutil以百分比形式显示内存的使用情况，gc 显示的是内存占用的字节数，以 KB 的形式输出堆内存的使用情况）
- pid：Java 进程的 PID。
- 1000：每 1000 毫秒采样一次。
- 10：采样 10 次。

示例输出：
```sh
 S0C    S1C    S0U    S1U      EC       EU        OC         OU       MC       MU       CCSC    CCSU     YGC     YGCT     FGC    FGCT     GCT
1536.0 1536.0  0.0    0.0    30720.0   1024.0  708608.0    2048.0   44800.0  43712.6   4864.0  4096.0      4    0.072   1      0.015    0.087
1536.0 1536.0  0.0    0.0    30720.0   2048.0  708608.0    2048.0   44800.0  43712.6   4864.0  4096.0      4    0.072   1      0.015    0.087
1536.0 1536.0  0.0    0.0    30720.0   3072.0  708608.0    2048.0   44800.0  43712.6   4864.0  4096.0      4    0.072   1      0.015    0.087

```

字段含义：

- S0C (Survivor Space 0 Capacity): 第一个 Survivor 区域的容量（字节数）。
- S1C (Survivor Space 1 Capacity): 第二个 Survivor 区域的容量（字节数）。
- S0U (Survivor Space 0 Utilization): 第一个 Survivor 区域的使用量（字节数）。
- S1U (Survivor Space 1 Utilization): 第二个 Survivor 区域的使用量（字节数）。
- EC (Eden Space Capacity): Eden 区域的容量（字节数）。
- EU (Eden Space Utilization): Eden 区域的使用量（字节数）。
- OC (Old Generation Capacity): 老年代的容量（字节数）。
- OU (Old Generation Utilization): 老年代的使用量（字节数）。
- MC (Metaspace Capacity): 方法区（Metaspace）的容量（字节数）。
- MU (Metaspace Utilization): 方法区的使用量（字节数）。
- CCSC (Compressed Class Space Capacity): 压缩类空间的容量（字节数）。
- CCSU (Compressed Class Space Utilization): 压缩类空间的使用量（字节数）。
- YGC (Young Generation GC Count): 年轻代垃圾回收的次数。
- YGCT (Young Generation GC Time): 年轻代垃圾回收的总时间（秒）。
- FGC (Full GC Count): full gc 的次数。
- FGCT (Full GC Time): full gc 的总时间（秒）。
- GCT (Garbage Collection Time): 总的垃圾回收时间（秒）。

> 注意：如果 FGC 变化频率很高，则说明系统性能和吞吐量将下降，或者可能出现内存溢出。

#### jmap

用于生成堆转储文件，查看对象分配情况。

```sh
jmap -heap <pid>
```

示例输出：
```sh
Attaching to process ID 1234, please wait...
Debugger attached successfully.
Server compiler detected.
JVM version is 25.131-b11

using parallel threads in the new generation.
using thread-local object allocation.
Concurrent Mark-Sweep GC

Heap Configuration:
   MinHeapFreeRatio         = 40
   MaxHeapFreeRatio         = 70
   MaxHeapSize              = 1048576000 (1000.0MB)
   NewSize                  = 1310720 (1.25MB)
   MaxNewSize               = 17592186044415 MB
   OldSize                  = 8388608 (8.0MB)
   NewRatio                 = 2
   SurvivorRatio            = 8
   MetaspaceSize            = 21807104 (20.796875MB)
   CompressedClassSpaceSize = 1073741824 (1024.0MB)
   MaxMetaspaceSize         = 17592186044415 MB
   G1HeapRegionSize         = 0 (0.0MB)

Heap Usage:
New Generation (Eden + 1 Survivor Space):
   capacity = 46989312 (44.8125MB)
   used     = 14364528 (13.697036743164062MB)
   free     = 32624784 (31.115463256835938MB)
   30.57471507400737% used
Eden Space:
   capacity = 41943040 (40.0MB)
   used     = 12058624 (11.5MB)
   free     = 29884416 (28.5MB)
   28.769444942474365% used
From Space:
   capacity = 5036288 (4.8046875MB)
   used     = 2305904 (2.1997528076171875MB)
   free     = 2730384 (2.6049346923828125MB)
   45.8012652387619% used
To Space:
   capacity = 5036288 (4.8046875MB)
   used     = 0 (0.0MB)
   free     = 5036288 (4.8046875MB)
   0.0% used
concurrent mark-sweep generation:
   capacity = 100663296 (96.0MB)
   used     = 1433600 (1.3671875MB)
   free     = 99229696 (94.6328125MB)
   1.4241612307230632% used

10764 interned Strings occupying 826944 bytes.

```

字段含义：

- MinHeapFreeRatio: 堆内存最小自由比例。
- MaxHeapFreeRatio: 堆内存最大自由比例。
- MaxHeapSize: 堆内存的最大容量（字节数）。
- NewSize: 新生代的初始容量（字节数）。
- MaxNewSize: 新生代的最大容量（字节数）。
- OldSize: 老年代的初始容量（字节数）。
- NewRatio: 新生代与老年代的比例。
- SurvivorRatio: 新生代中 Survivor 空间的比例。
- MetaspaceSize: 方法区（Metaspace）的初始容量（字节数）。
- CompressedClassSpaceSize: 压缩类空间的容量（字节数）。
- MaxMetaspaceSize: 方法区（Metaspace）的最大容量（字节数）。
- G1HeapRegionSize: G1 垃圾收集器的堆区域大小（字节数）。

Heap Usage 部分的字段解释：

- capacity: 内存区域的总容量（字节数）。
- used: 当前使用的内存量（字节数）。
- free: 当前空闲的内存量（字节数）。
- % used: 使用百分比。

同时还能基于对象统计，比如
```sh
jmap -histo <pid> 
```

输出示例：

```
num     #instances    #bytes   class name
1       1234567       98765432 java.lang.String
2       234567        45678901 byte[]
3       12345         34567890 com.xxx.OrderDTO
```

重点看：

- **byte[]**
- **String**
- **你自己的业务对象**

经验判断：

- byte[] 很多 → 可能是缓存 / IO / 序列化
- String 爆炸 → 拼接、日志、缓存 key
- DTO / Entity 爆炸 → 集合未清理、缓存泄漏

> 一般在项目启动时配置会配置：
> -XX:+HeapDumpOnOutOfMemoryError
> -XX:HeapDumpPath=/path/to/dump
> 这样就会在触发OOM自动执行jmap -dump:format=b,file=<file> <pid>生成堆转储文件。（这个指令会让虚拟机暂停工作一段时间）
>
> 还有就是可以使用jcmd，比jmap稳定，对线上更友好。
> ```sh
> jcmd <pid> GC.heap_info
> jcmd <pid> GC.class_histogram
> ```

### 线上OOM后如何分析？

#### 第一步使用jmap工具生成堆转储文件

```sh
jmap -dump:format=b,file=<file> <pid>
```

大部分系统内存占用2GB ~ 8GB，此命令会导致虚拟机暂停工作 1～3 秒左右。

可以在 JVM 内存溢出后，主动 dump 生成文件，在启动时增加以下参数即可。

```sh
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/tmp/heapdump.hprof
```

#### 第二步使用工具分析堆转储文件

一般使用Eclipse MAT或者是VisualVM等工具打开堆转储文件，分析内存泄漏和对象分配情况

##### MAT

下图为 MAT 工具，它提供了 Leak Suspects 报告，输出有可能发生内存泄漏的对象：

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1772087337535152129/mqzH1liH_image_mianshiya.png)

从上图的左下角可以得知，memoryref.A 这个对象可能产生了内存泄漏！

再简单过一下 MAT 分析内存的其他思路：

可以看直方图，得到占用最多的内存的对象类型是什么：

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1772087337535152129/IwuuJ4ny_image_mianshiya.png)

然后通过右键单击某一行并选择 列出对象（List objects）> 包含传入引用来查看引用它们的内容：

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1772087337535152129/t1sJlNzt_image_mianshiya.png)

可以追溯找出最终的引用对象是什么：

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1772087337535152129/rORtoMrh_image_mianshiya.png)

最终再结合业务代码就能定位到最终的问题，然后修复后经验证即可上线。

#### Q&A

##### 线上出现 OOM 了，你怎么排查？

1. 先看是哪种OOM，是堆还是方法区还是线程数，是heap space就查堆，是metaspace就查类加载，是native thread就查线程数等
2. 执行jmap -dump:format=b,file=<file> <pid>拿到堆转储文件
3. 使用Eclipse MAT或者是VisualVM打开dump文件，查看Histogram里哪些实例数量异常多，再看看Dominator Tree 找到持有大量内存的对象，顺着引用链往上追就能定位到问题代码。

##### 内存泄漏和内存溢出有什么区别？

* 内存泄漏指的是对象用完了，但一直占着内存没有被删除
* 内存溢出是需要的内存已经超过了分配的内存

可以得知，内存泄漏是因，内存溢出是果。泄漏不一定溢出，因为可能要泄漏积累一段时间才会爆。没有泄漏也有可能溢出，比如一次性加载太大的文件进内存。但大多数线上 OOM 都是泄漏导致的，纯粹内存不够的情况很少，加内存只是拖延问题。

##### 怎么判断是内存泄漏还是内存确实不够？

看 GC 日志。如果 Full GC 之后堆内存能回到一个比较低的水位，说明没泄漏，就是并发高峰期内存不够用，加内存就行。如果 Full GC 之后堆使用量还是很高，而且每次 GC 后的基线在慢慢上涨，那多半是泄漏，得分析 dump 文件找泄漏点。



---

## JVM垃圾回收

### 垃圾回收算法

垃圾回收算法本质上就是**处理内存碎片的几种不同策略**。

主要有三种：

1. **标记-清除**：先遍历一遍，把有用的对象打个标记，然后把没标记的垃圾直接清掉。问题是清完之后空出来的地方东一块西一块的，像蜂窝煤一样。下次想分配个大对象，明明总空间够，但就是找不到一块连续的地儿放。

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/jjsNMPkI_image_mianshiya.png)

2. **标记-复制**：把内存一分为二，平时只用一半。回收的时候把活着的对象全部复制到另一半，整整齐齐排好，然后把原来那一半直接清空。好处是快，绝对没有碎片。坏处是得空着一半地盘不能用，太浪费。

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/0bvKS4BK_image_mianshiya.png)

> Java 新生代里绝大部分对象都是朝生夕死的，存活的很少，复制成本低，所以复制算法特别好使。实际不用 1:1 分，HotSpot 用 Eden + 两个 Survivor 的比例，利用率能到 90%。

3. **标记-整理**：老年代常用。老年代对象活得久，用复制算法得复制一大堆太慢，用标记-清除又有碎片。标记-整理的做法是先标记，然后把所有活着的对象往一端推，像整理书架一样排紧凑，最后把剩下的空间清空。既没碎片，又不用浪费一半空间，代价是移动对象比较耗时。

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/lZN5pYSy_image_mianshiya.png)

三种算法的对比：

![img](https://pic.code-nav.cn/mianshiya/question_picture/1843904816956411905/nUnpgx4E_UIvLRhocs5_mianshiya.webp)

#### 标记-清除详细分析

分为两个阶段：

标记阶段：tracing 阶段，从GC Roots根（栈、寄存器、全局变量等）开始遍历对象图，标记所遇到的每个对象。

清除阶段：扫描堆中的对象，将未标记的对象作为垃圾回收。

基本上就是下图所示这个过程：

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/5bvmHcuJ_image_mianshiya.png)

**清除不会移动和整理内存空间**，一般都是通过空闲链表(双向链表)来标记哪一块内存空闲可用，因此会导致一个情况：**空间碎片**。

这会使得明明总的内存是够的，但是申请内存就是不足。

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/OwHW2D9h_image_mianshiya.png)

而且在申请内存的时候也有点麻烦，需要遍历链表查找合适的内存块，会比较耗时。

所以会有**多个空闲链表的实现**，也就是根据内存分块大小组成不同的链表，比如分为大分块链表和小分块链表，这样根据申请的内存分块大小遍历不同的链表，加快申请的效率。

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/ASBO8Tca_image_mianshiya.png)

当然还可以分更多个链表。

还有标记，标记的话一般我们会觉得应该是标记在对象身上，比如标记位放在对象头中，但是这对写时复制不兼容。

等于每一次 GC 都需要修改对象，假设是 fork 出来的，其实是共享一块内存，那修改必然导致复制。

所以有一种**位图标记法**，其实就是将堆的内存某个块用一个位来标记。就像我们的内存是一页一页的，堆中的内存可以分成一块一块，而对象就是在一块，或者多块内存上。

根据对象所在的地址和堆的起始地址就可以算出对象是在第几块上，然后用一个位图中的第几位在置为 1 ，表明这块地址上的对象被标记了。

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/wfUzWdd0_image_mianshiya.png)

而且用位图表格法不仅可以利用写时复制，清除也更加高效，如果标记在对象头上，那么需要遍历整个堆来扫描对象，现在有了位图，可以快速遍历清除对象。

但是不论是标记对象头还是利用位图，标记-清除的碎片问题还是处理不了。

因此就引出了标记-复制和标记-整理。

> 需要注意的是，上述关于位图标记和写时复制有错误理解。正确的应该是：在某些 fork + COW 的场景下，**对象头标记会带来额外的页复制成本，位图标记可以避免这个问题，这是位图的一个优势。**
>
> 并且位图是连续内存，顺序扫描非常快，

#### 标记-复制详细分析

首先这个算法会把堆分为两块，一块是 From、一块是 To。

对象只会在 From 上生成，发生 GC 之后会找到所有存活对象，然后将其复制到 To 区，之后整体回收 From 区。

再将 To 区和 From 区身份对调，即 To 变成 From ， From 变成 To，我再用图来解释一波。

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/F4kpP1VP_image_mianshiya.png)

可以看到内存的分配是紧凑的，**不会有内存碎片的产生**。

不需要空闲链表的存在，**直接移动指针分配内存**，效率很高。

**对 CPU缓存亲和性高**，因为从根开始遍历一个节点，是深度优先遍历，把关联的对象都找到，然后内存分配在相近的地方。

这样根据局部性原理，一个对象被加载了那它所引用的对象也同时被加载，因此访问缓存直接命中。、

当然它也是有缺点的，因为对象的分配只能在 From 区，而 From 区只有堆一半大小，因此**内存的利用率是 50%。**

其次如果**存活的对象很多，那么复制的压力还是很大的**，会比较慢。

然后由于需要移动对象，因此**不适用于上文提到的保守式 GC。**

当然我上面描述的是深度优先就是递归调用，有栈溢出风险，还有一种 Cheney 的 GC 复制算法，是采用迭代的广度优先遍历，具体不做分析了，有兴趣自行搜索。

#### 标记-整理详细分析

标记-整理其实和标记-复制差不多，区别在于复制算法是分为两个区来回复制，而整理不分区，直接整理。

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/uRUMLyTI_image_mianshiya.png)

算法思路还是很清晰的，将存活的对象往边界整理，也没有内存碎片，也不需要复制算法那样腾出一半的空间，所以内存利用率也高。

缺点就是需要对堆进行多次搜索，毕竟是在一个空间内又标记，又移动的，所以整体而言花费的时间较多，而且如果堆很大的情况，那么消耗的时间将更加突出。

> 相较于标记清除算法，标记整理因为还要移动整理存活对象，所以STW的时间会更长

> 此外所有垃圾算法都是从GC Roots作为入口扫描的。
>
> GC Roots 是一组**始终被 JVM 或程序引用的对象**，它们是垃圾回收的“起点”，从这些对象出发，向下遍历引用链，就可以找到所有**可达对象**。
>
> JVM中常见的GC Roots来源
>
> | 类型                 | 举例                          |
> | -------------------- | ----------------------------- |
> | **栈帧中的本地变量** | 方法中的局部对象引用          |
> | **方法区的静态引用** | 类的 static 成员变量          |
> | **常量引用**         | String 常量池、常量表中的引用 |
> | **JNI 全局引用**     | C/C++ 调用 JNI 时的全局引用   |
> | **线程对象**         | Thread 对象本身作为根节点     |
> | **活跃守护线程**     | 守护线程持有的对象            |

至此相信你对标记-清除、标记-复制和标记-整理都清晰了，让我们再回到刚才提到的分代收集。

> 严格意义上除了标记清除，标记复制，标记整理，还有三种垃圾回收算法。
>
> 1. 引用计数，指的就是每个对象都有一个引用计数器，当引用指向该对象时计数加一，当引用被解除时计数减一。当计数为零时，表示该对象没有引用，可以被回收。
>    * 优点：实现简单，能够及时回收内存。
>    * 缺点：无法处理循环引用的问题。
> 2. 分代收集算法（Generational Collection），指对象按“存活时间”分代不同代使用不同算法
>    * 将堆分为新生代和老年代，每代使用不同的垃圾回收算法。
>    * 新生代一般使用复制算法，老年代一般使用标记-清除或标记-整理算法。
>    * 优势：利用了对象的生命周期长短不同的特点，新生代的对象生命周期短，老年代的对象生命周期长
> 3. 并行垃圾回收算法（Parallel Garbage Collection），使用多个线程同时进行垃圾回收，提高回收效率。
>    - 主要包括并行标记-清除、并行复制等。

#### Q&A

##### 提问：CMS 和 G1 分别用的什么算法？

回答：CMS 老年代用标记-清除，所以会有碎片问题，碎片太多会触发 Full GC 用 Serial Old 做标记-整理。G1 整体上是基于 Region 的复制算法，回收时把存活对象复制到空闲 Region，所以没有碎片问题。

##### 提问：为什么老年代不用复制算法？

回答：老年代对象存活率高，复制算法要复制大量对象，效率太低。新生代 98% 的对象活不过一次 GC，复制的少，才适合用复制算法。

##### 提问：标记-整理为什么比标记-清除慢？

回答：标记-整理需要移动对象，移动意味着要更新所有指向这些对象的引用，还要保证移动过程中对象的一致性。标记-清除只是把对象标记为可回收，加到空闲链表里，不需要移动任何东西。

##### 提问：什么是保守式 GC，为什么它不能用复制算法？

回答：保守式 GC 没有精确的类型信息，不确定一个值到底是指针还是普通数字，只能保守地认为所有看起来像指针的值都是指针。复制算法要移动对象、更新引用，但保守式 GC 不敢更新那些"可能是指针"的值，万一改错了就出大问题。所以只能用标记-清除这种不移动对象的算法。

> 像JVM就是用的是分代收集算法（Generational Collection）
>
> - 将堆分为新生代和老年代，每代使用不同的垃圾回收算法。
> - 新生代一般使用复制算法，老年代一般使用标记-清除或标记-整理算法。
> - 优势：利用了对象的生命周期长短不同的特点，新生代的对象生命周期短，老年代的对象生命周期长。

### 垃圾收集器

HotSpot 虚拟机的垃圾收集器按作用区域分成两类：新生代收集器和老年代收集器，它们需要搭配使用。

> 新生代垃圾收集器：Serial（标记复制），ParNew（标记复制），Parallel Scavange（标记复制）
>
> 老年代垃圾收集器：Serial Old（标记整理），Parallel Old（标记整理），CMS（标记清除）
>
> 全代垃圾收集器：G1
>
> 通常来说：Serial配合Serial Old，ParNew配合CMS，Parallel Scavange配合Parallel Old，然后G1一个人

**新生代收集器**

1）Serial：单线程，用标记-复制算法。GC 时所有应用线程停下来等着，简单粗暴。在客户端模式下是默认收集器，几十 MB 的新生代几毫秒就能收完。**全程STW**

2）ParNew：Serial 的多线程版本，除了能并行收集，别的都一样。它存在的意义是能跟 CMS 配合，JDK 9 之后跟 CMS 绑定了，单独用不了了。**全程STW**

3）Parallel Scavenge：也叫吞吐量收集器，多线程并行收集。它的目标不是缩短单次停顿，而是最大化 CPU 用在业务代码上的时间占比。适合后台跑批、大数据计算这种不在乎偶尔卡一下的场景。**全程STW**

**老年代收集器**

1）Serial Old：Serial 的老年代版本，单线程，用标记-整理算法。**全程STW**

2）Parallel Old：Parallel Scavenge 的老年代搭档，多线程并行标记-整理。要发挥吞吐量优先的效果，新生代老年代得配套用。**全程STW**

3）CMS：全称 Concurrent Mark Sweep，追求低停顿。大部分工作跟应用线程并发执行，只有初始标记和重新标记需要短暂停顿。缺点是用标记-清除算法会产生碎片，还有并发失败的风险。JDK 9 标记为废弃，JDK 14 正式移除。

4）G1：JDK 9 之后的默认收集器，把堆切成 2048 个左右的 Region，不再严格区分新生代老年代。能设定目标停顿时间，让 GC 变得可预测。

5）ZGC：JDK 11 引入的低延迟收集器，停顿时间控制在 10ms 以内，跟堆大小无关。支持 TB 级别的堆内存。JDK 15 转正。

它们之间的搭配关系：

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/3bzFOHV8_image_mianshiya.png)

#### Serial 与 ParNew

Serial 是最古老的收集器，单线程收集时必须暂停所有工作线程。别小看它，在单核 CPU 或者小内存场景下，它没有线程切换的开销，效率反而最高。HotSpot 客户端模式到现在还默认用它：

![Snipaste_2024-05-02_21-04-13.jpg](https://pic.code-nav.cn/mianshiya/question_picture/1783397053004488705/Snipaste_2024-05-02_21-04-13_mianshiya.jpg)

ParNew 就是 Serial 的多线程版本，多核机器上能并行收集：

![Snipaste_2024-05-02_21-05-06.jpg](https://pic.code-nav.cn/mianshiya/question_picture/1783397053004488705/Snipaste_2024-05-02_21-05-06_mianshiya.jpg)

#### Parallel Scavenge / Parallel Old

Parallel Scavenge 提供两个参数精确控制吞吐量：

1）`-XX:MaxGCPauseMillis`：设置最大停顿时间。JVM 会自动调整堆大小和其他参数来尽量满足这个目标。但垃圾总量不变的情况下，单次停顿短了，收集频率就得上去，不能无脑调小。

2）`-XX:GCTimeRatio`：直接设置吞吐量。值是个大于 0 小于 100 的整数，假设设成 19，意思是 GC 时间占比不超过 1/(1+19)=5%。默认值 99，也就是 GC 时间不超过 1%。

Parallel Old 是它的老年代搭档，一起用才能发挥吞吐量优先的效果：

![Snipaste_2024-05-02_21-08-38.jpg](https://pic.code-nav.cn/mianshiya/question_picture/1783397053004488705/Snipaste_2024-05-02_21-08-38_mianshiya.jpg)

#### CMS

> CMS只负责老年代，YoungGC默认由ParNew实现，使用的是标记-复制算法。YoungGC是并行的，全程STW。

CMS 清理老年代用标记-清除算法，整个过程分四步：

1）初始标记：只标记 GC Roots 直接关联的对象，速度很快，但**需要 STW**。

2）并发标记：从 GC Roots 开始遍历整个对象图，这一步耗时最长，但跟应用线程并发执行，不停顿。

3）重新标记：修正并发标记期间因为应用线程运行导致的引用变化，**需要 STW**，但时间不长。

4）并发清除：清理死亡对象，跟应用线程并发执行。

5）重置线程：恢复对对象的标记

![Snipaste_2024-05-02_21-10-28.jpg](https://pic.code-nav.cn/mianshiya/question_picture/1783397053004488705/Snipaste_2024-05-02_21-10-28_mianshiya.jpg)

CMS 有三个硬伤：

1）吃 CPU。并发阶段虽然不停顿，但 GC 线程跟应用线程抢 CPU，核心少的机器会明显感觉变慢。

2）内存碎片。标记-清除算法不整理内存，碎片多了之后大对象分配不下，只能触发 Full GC 做压缩。

3）浮动垃圾。并发清除时应用线程还在产生新垃圾，这些垃圾只能等下次 GC 再清理。如果老年代空间预留不够，会触发 Concurrent Mode Failure，退化成 Serial Old 来收集，停顿时间暴增。

> Concurrent Mode Failure是CMS独有的错误，因为使用标记清理的算法，所以会导致内存碎片化，会出现总内存虽然够，但就是找不到能分配给一个对象的空间的问题。
>
> 再清理期间，由于是并发清理，如果用户线程创建对象的速度 > CMS清理和分配的速度。或者说已经找不到分配对象的空间了，就会爆出Concurrent Mode Failure的错误，并退化成Serial Old来清理。而Serial Old这是单线程清理，使用标记整理的算法。能缓解内存碎片的问题。但代价就是如果堆内存很大，那么STW的时间将会很长。

#### G1

> G1的YoungGC同样使用标记-复制算法，整个过程其实和CMS的YoungGC差不多。
>
> 1. 标记阶段，即从GC Roots集合开始，标记活跃对象
> 2. 转移阶段，即把活跃对象复制到新的内存地址上
> 3. 重定位阶段，因为转移导致对象的地址发生了变化，在重定位阶段，所有指向对象旧地址的指针都要调整到对象新的地址上。
> 4. 然后再把垃圾清理掉。
>
> 整个过程全程STW，原因在于对象引用关系在复制期间**不能被应用线程修改**，所以不能设计为并发。换句话来说就是G1和CMS并没有解决如何在并发转移的过程中准确定位对象的问题。
>
> 而后续的ZGC，同样采用标记-复制算法，他通过**染色指针**和**读屏障**实现了并发转移

G1 把堆划分成大约 2048 个大小相等的 Region，每个 Region 可以动态扮演 Eden、Survivor 或者 Old 的角色：

![zongjie-e0f5da26-6e46-4f9d-bfcc-0842cc7079e7.png](https://pic.code-nav.cn/mianshiya/question_picture/1783397053004488705/zongjie-e0f5da26-6e46-4f9d-bfcc-0842cc7079e7_mianshiya.png)

**标注 H 的是 Humongous Region，专门存放超过 Region 容量一半的大对象。**

**G1 的回收流程从大局上看分两大块：并发标记**和**对象拷贝**

**并发标记基于 SATB 算法，分四个阶段：**

1）初始标记：扫描 GC Roots，标记根直接可达的对象。G1 用外部 bitmap 记录标记信息，不改对象头。这个阶段通常搭在 Young GC 上一起做，额外开销很小。**需要 STW**，但很快。

2）并发标记：遍历对象图，SATB 写屏障会记录期间的引用变更，防止漏标

3）最终标记：处理 SATB 队列里积压的引用变更记录，把并发期间漏掉的对象补标上，**需要短暂 STW**。

4）筛选回收：根据 bitmap 统计每个 Region 的存活对象数量。如果某个 Region 完全没有存活对象，直接整体回收。同时计算每个 Region 的回收价值，为后续选择 CSet 做准备。**需要STW**

![Snipaste_2024-05-02_21-14-27.jpg](https://pic.code-nav.cn/mianshiya/question_picture/1783397053004488705/Snipaste_2024-05-02_21-14-27_mianshiya.jpg)

然后就是**对象拷贝**

这个阶段叫 Evacuation，是 STW 的。根据标记结果和回收价值，选一批 Region 组成 Collection Set，然后把 CSet 里的存活对象拷贝到新 Region。

G1 的性能瓶颈主要就在这：存活对象越多，拷贝时间越长。所以 G1 会优先选垃圾多的 Region 回收，这也是 Garbage First 名字的由来

G1 通过 `-XX:MaxGCPauseMillis` 设置目标停顿时间，默认 200ms。通过控制 CSet 大小来控制停顿时间，以符合设置的目标停顿时间之内

> G1出了YoungGC和Full GC还有一种回收模式：Mixed GC。
>
> Young GC 只回收 Eden 和 Survivor 区的 Region，触发条件是 Eden 区满了。**全程STW**
>
> Mixed GC的触发时机则是当老年代达到一定比例时，比如默认就是45%就会出发Mixed GC。Mixed GC 不是一次把所有老年代都收完，而是分多次，每次挑垃圾比例高的 Region，直到垃圾比例降到**预设比例**之下

#### 三色标记

三色标记法将对象的颜色分为了黑、灰、白，三种颜色。

「白色」：该对象没有被标记过。（垃圾）

「灰色」：该对象已经被标记过了，但该对象下的属性没有全被标 记完。（GC需要从此对象中去寻找垃圾）

「黑色」：该对象已经被标记过了，且该对象下的属性也全部都被 标记过了。（程序所需要的对象）

**三色标记存在问题**

大致就多标和漏标。

多标就是：被黑色标记的对象突然断开引用，变成了垃圾，但因为已经被标记为了黑色，所以不会被删除。

漏标就是：黑色标记的对象新增了一个白色引用，但因为已经被标记为黑色，所以不会再重新遍历该黑色对象的引用，导致他说引用的对象被误删。

对于这两个问题而言，多标可以不用解决，可以交给下次GC来清理即可。但漏标就很致命了，严重的话可能引发系统崩溃。

**如何解决漏标问题**：

1. 增量更新：关注的是“新产生的引用”，有新引用指向白色对象就记录下来。重新标记阶段结束再将记录下来的引用重新扫描一遍（CMS）
2. 原始快照，指的是：在并发标记开始那一刻，对“逻辑上的对象图”拍一张快照（Snapshot At The Beginning），之后即使引用被删除，也要当作“曾经存活过”来处理。可能造成浮动垃圾，但可以留给下次GC处理。（G1的SATB）

#### ZGC 的颜色指针

ZGC的详细介绍

1. [什么是ZGC](https://www.mianshiya.com/question/1780933295295459330)
2. [美团技术文档-ZGC](https://tech.meituan.com/2020/08/06/new-zgc-practice-in-meituan.html)

ZGC 是 JDK 11 引入的超低延迟收集器，停顿时间控制在 10ms 以内，而且跟堆大小无关，几 TB 的堆也一样。

它的核心技术是颜色指针：在 64 位指针里拿出几个 bit 存储对象的标记状态，这样标记和重定位都能跟应用线程并发执行，几乎不需要 STW。JDK 15 转正为正式特性，JDK 21 开始支持分代收集。

#### Q&A

##### 提问：CMS 和 G1 都是低延迟收集器，什么情况下选 CMS，什么情况下选 G1？

回答：现在基本没有选 CMS 的理由了，JDK 14 已经把它移除了。如果非要比较，G1 在 4G 以上堆内存时优势明显，因为它能控制停顿时间，而且用复制算法不产生碎片。CMS 在小堆上可能停顿更短，但碎片问题和并发失败风险让它很难调优。新项目直接上 G1，堆超过几十 G 考虑 ZGC。

##### 提问：G1 的 Mixed GC 是什么？跟 Young GC 和 Full GC 有什么区别？

回答：Young GC 只收集新生代 Region，触发条件是 Eden 区满了。Mixed GC 是 G1 特有的，同时收集所有新生代 Region 和部分老年代 Region，在并发标记完成后触发。Full GC 是退化行为，当 Mixed GC 来不及回收、老年代放不下晋升对象时触发，会用单线程的 Serial Old 做全堆收集，停顿时间很长。JDK 10 之后 Full GC 改成了多线程，但依然要尽量避免。

##### 提问：Parallel Scavenge 为什么不能跟 CMS 搭配使用？

回答：架构设计不兼容。Parallel Scavenge 有自己独立的一套框架代码，跟其他收集器用的 HotSpot GC 框架不一样。CMS 需要配合能处理增量更新的新生代收集器，ParNew 是专门改过的，Parallel Scavenge 没有这个能力。所以要用 CMS 只能配 ParNew，要用 Parallel Scavenge 只能配 Parallel Old。







