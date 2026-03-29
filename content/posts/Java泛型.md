---
title: Java泛型
date: '2026-03-06'
excerpt: 什么是Java中的泛型
tags:
  - Java
category: Backend
---

## 什么是Java中的泛型

Java中的泛型的作用其实就是把编译器才能发现的类型错误的异常提前到了编译器。

在Java没有泛型之前，平时使用的这些集合比如ArrayList写法都是：
```java
List list = new ArrayList();
```

底层每个元素都是Object，因此可以存放任意类型的对象。但与之对应的取出来的对象也是Object。如果想转换成对应的Integer，String等来使用就必须得做类型转换，如：
```java
String s = (String) list.get(0);
```

但是类型强行转换是有风险的，是人就会犯错误，如果记错了或者写错了强转的类型，在编译期我们是不知道有错的。只有等到项目运行才会报出ClassCastException。

所以Java后续引入了泛型，创建对象是需要提供泛型类型，所以后续我们使用集合变成了：

```java
List<String> list = new ArrayList<>();
```

这样的话，我们这个list就只能存储String类型的变量，并且如果我们存储错了类型，比如存了Integer，编译器就能帮我们发现，并编译不通过。

并且获取元素时不需要我们自己手动强转，编译器自己就知道正确的类型是什么，直接帮我们转换。

## 伪泛型

但是Java的泛型时伪泛型，他不像C++或者是C#那样是真的泛型。

Java的泛型的本质其实是：**编译时检查，运行时擦除**。JVM其实根本不知道泛型是什么，字节码里的List<String>, List<Integer>都是List没有区别。泛型类型被擦除掉。

也就是说Java的泛型只是在编译器做一个约束，告诉我们当前的类型是什么，然后在后面帮我们做类型强转。在编译成字节码后，泛型就会被擦除，都是List。

因此我们可以通过反射，在编译器就塞入不同类型的值

```java
List<String> list = new ArrayList<>();
list.add("hello");
list.getClass().getMethod("add", Integer.class).invoke(list, 123);
```

在上述的例子中完全不会报错，原因是Java的泛型检查在编译期，而反射发生在运行期。

因此这种伪泛型就会有这么些缺点：因为运行时没有泛型信息，有些事情做不了：

1. 不能 `new T()`，编译器不知道 T 的构造器 

2. 不能 `new T[]`，只能用 `Object[]` 再强转 

3. 不能用基本类型作类型参数，`List<int>` 编译不过，得用 `List<Integer>` 

   > 原因在于：Java中的泛型在编译后就会被擦除，变成Object，而基本数据类型如int，char这些都不是Object的子类。所以java的泛型只允许引用类型作为类型参数，比如Integer，String，int[]，char[]这种

4. 不能用 instanceof 判断泛型类型，`list instanceof List<String>` 编译报错

想在运行时拿到泛型信息，得通过一些曲线救国的办法，比如 TypeReference 模式或者通过反射获取父类的泛型参数。

## 泛型擦除

泛型擦除其实就是指Java编译器在编译阶段把所有泛型信息都抹掉的过程。代码里写的 `List<String>`、`Map<Integer, User>` 这些泛型，编译成 class 文件后全变成了 `List`、`Map`，泛型参数被替换成它的上界，没写上界就默认是 `Object`。

举个例子，比如说写了这样一段代码：

```java
public <T> void printList(List<T> list) {
    for (T element : list) {
        System.out.println(element);
    }
}
```

编译后，泛型 T 被擦掉了，字节码里其实是这样的：

```java
public void printList(List list) {
    for (Object element : list) {
        System.out.println(element);
    }
}
```

这就导致了几个问题：运行时拿不到泛型的实际类型、不能 `new T()`、不能 `new T[]`、不能对泛型用 `instanceof`。这些限制都是类型擦除带来的副作用。

### 为什么 Java 选择类型擦除

既然如此Java为什么选择类型擦除？而不是像C++，C#那样做真正的泛型？

原因在于Java 5 引入泛型的时候，线上已经跑着无数 Java 1.4 及更早版本的应用了。如果泛型在运行时也保留类型信息，意味着 JVM 要大改，老代码全得重新编译，这推广成本太高了，八成还要被骂得很惨。

所以 Java 团队选了个折中方案：编译期做类型检查和约束，检查完就把泛型信息擦掉。这样生成的字节码和以前的格式一样，老 JVM 能跑，老代码也不用改。代价就是 Java 的泛型是**伪泛型**，运行时类型信息丢了。

#### 类型擦除后为什么反射还能拿到泛型类型

先看个现象，`List<String>` 里 get 出来的元素不用强转：

```java
List<String> list = new ArrayList<>();
list.add("yes");
String str = list.get(0);  // 不需要 (String) 强转
```

用 `javap -c` 看字节码会发现，编译器偷偷帮你插了一条 `checkcast` 指令，自动把 Object 强转成 String。

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/mqA98Tcj_image_mianshiya.png)

所以不是运行时还知道类型，而是编译器帮你补了强转代码。

那反射能拿到泛型类型又是怎么回事？看这段代码：

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/9eLAYpPs_image_mianshiya.png)

秘密在 class 文件里。用 `javap -v` 反编译会看到一个叫 `Signature` 的属性，里面存着完整的泛型签名信息。

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/5fXhuyWN_image_mianshiya.png)

这个信息是给编译器和反射用的，不影响运行时的字节码执行。

但有个前提：只有**类的成员变量**、**方法参数**、**方法返回值**这三种位置的泛型信息会被记录下来。局部变量的泛型信息是拿不到的，因为 class 文件里根本没存。

#### 泛型擦除带来的常见坑

1. 不能用泛型类型创建实例或数组

   ```java
   public <T> void test() {
       T obj = new T();      // 编译报错
       T[] arr = new T[10];  // 编译报错
   }
   ```

   擦除后 T 变成 Object，JVM 根本不知道该 new 什么类型。想要创建实例得传个 `Class<T>` 进来。

2. 不能对泛型使用 instanceof

   ```java
   if (obj instanceof List<String>) {}  // 编译报错
   ```

   运行时只有 `List`，没有 `List<String>`，所以这个检查没法做。

3. 基本数据类型无法作为类型参数

   ```java
   List<int> list = new ArrayList<>();  // 编译报错
   ```

   因为类型擦除后只有List，元素的类型为上界，没有上界默认为Object，而int，char这类基本数据类型因为不是对象，所以自然也不是Object的子类。

4. 泛型类型的静态成员共享

   ```java
   public class Box<T> {
       public static int count = 0;
   }
   // Box<String>.count 和 Box<Integer>.count 是同一个
   ```

   不管泛型参数是啥，编译后都是同一个 Box 类，静态成员当然是共享的。

## Java 泛型的上下界限定符

> 无论是`? extends T` 还是 `? super T `都必须理解为不可分割的整体。
>
> 它不是 “一个问号” 和 “一个 extends 关键字，或者 super 关键字” 的组合，而是共同定义了一个类型范围。这个类型范围的正式名称叫做 “有上界的通配符类型” 或者是 “有下界的通配符类型”
>
> ? 代表：一个未知的、待定的类型。
>
> extends T 或 super T 是对这个未知类型的约束：表示这个未知类型必须是 T 或者 T 的某个子类。/ 表示这个未知类型必须是 T 或者 T 的某个父类

Java 泛型的上下界限定符用来**限制泛型参数的类型范围**，让你在保证类型安全的同时获得更大的灵活性。

* `? extends T` 叫上界限定符，表示类型必须是 T 或 T 的子类，主要用于读取场景。因为你知道拿出来的东西至少是个 T，所以读取安全；但你不知道具体是哪个子类，所以没法往里塞东西，因为有可能你塞的是Integer，但这实际是一个Double集合，虽然他们都是Number或者说是Object的子类，但此时类型已经出现了错误。

* `? super T` 叫下界限定符，表示类型必须是 T 或 T 的父类，主要用于写入场景。因为容器里装的是 T或者是T的父类，你往里塞 T或者T的子类 肯定没问题；但读出来的时候只能当 Object 用，因为不确定具体类型。

  > 这里需要补充一下：为什么 `? extends` T不允许写？
  >
  > 比如说 `? extends Number`，为什么不允许写？因为 `? extends Number`只是告诉你：虽然不知道具体类型，但一定是Number或Number的子类。你不清楚这个类型具体是Number还是Integer还是Long。你需要确保你传入的类型需要满足所有可能，而 `? extends T`中不存在这种情况，因为你不管传哪种类型都有合法的反例。
  >
  > 比如 `? extends Number`，那加入我传入Integer，结果真实类型有可能是String，Double就会类型错误，那假如我直接传入Number，看似合理但是Java其实是不允许父类对象赋值给子类引用的。也就是说，下面这个代码是不合法的
  >
  > ```java
  > Integer i = new Number();
  > ```
  >
  > 所以 `? extends T`就不能写，只能读，因为你能确保读出来的类型一定是Number，因为你确定了他的上界就是Number
  >
  > 而对于 `? super T` 他其实既可以读也可以写。 `? super T` 代表的含义是：虽然不知道具体类型，但一定是 T 或者 T 的父类。可以读是因为虽然没有确定上界，但是这里有默认的上界也就是Object，所以你可以把元素读成Object，这是没问题的。
  >
  > 而因为 `? super T` 他确定了类型一定是 T 或者 T 的父类，所以你可以存储 T 或者 T 的子类，因为这些元素都是合法的，因为不管上界究竟是T还是T的某一个父类，T的子类肯定都是这些父类的子类。
  >
  > 比如 A extends B， B extends C 那 A 肯定extends C 这里是一个道理。所以你就能写T或者T的子类，因为后续一定是赋值给父类的引用。在Java里是完全合法的。

![img](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/om6O0zzb_fanxin.drawio_mianshiya.png)

看个例子就明白了：

```java
// 上界：只读不写
public void process(List<? extends Number> list) {
    Number num = list.get(0);  // 读取安全，返回 Number 或其子类
    // list.add(1);            // 编译错误，不能往里加东西
}

// 下界：只写不读
public void addToList(List<? super Integer> list) {
    list.add(1);               // 写入安全，Integer 肯定能放进去
    // Integer v = list.get(0); // 编译错误，读出来只能当 Object
}
```

### PECS 原则

记住 **PECS** 原则就不会用错：Producer Extends, Consumer Super。

1）如果你要从集合里拿东西出来用，集合就是生产者，用 extends 

2）如果你要往集合里塞东西进去，集合就是消费者，用 super

![img](https://pic.code-nav.cn/mianshiya/question_picture/1843904816956411905/7bMcl2Ef_hsWGLznH8M_mianshiya.jpg)

### 协变和逆变

上界限定符实现的是协变，下界限定符实现的是逆变。

协变就是子类型可以替换父类型。`List<Dog>` 可以赋值给 `List<? extends Animal>`，因为 Dog 是 Animal 的子类，类型方向是一致的。

```java
List<? extends Animal> animals = new ArrayList<Dog>();  // 协变
```

逆变正好反过来，父类型可以替换子类型。`List<Animal>` 可以赋值给 `List<? super Dog>`，因为 Animal 是 Dog 的父类，类型方向是相反的。

```java
List<? super Dog> dogs = new ArrayList<Animal>();  // 逆变
```

为啥要搞这么复杂？因为 Java 的泛型不像数组那样天然支持协变。`Dog[]` 可以直接赋值给 `Animal[]`，但 `List<Dog>` 赋值给 `List<Animal>` 会编译报错。有了通配符和边界限定，才能在保证类型安全的前提下实现灵活的类型转换。

> 协变 (Covariance) 与 逆变 (Contravariance) 的通俗理解 这两个词听起来很学术，但它们描述的是一种非常直观的类型转换关系。我们用一个生活中的例子来理解。
>
> 继承关系前提： 猫 是 动物 的子类。
>
> 1. 不变 (Invariance) - Java 泛型的默认行为 场景：你有一个“猫笼” (List<猫>) 和一个“动物笼” (List<动物>)。 问题：你能把“猫笼”当成一个“动物笼”来用吗？ 答案：不行。List<猫> 不是 List<动物>。 原因：如果可以，我就能把一只狗（也是动物）放进这个被当成“动物笼”的“猫笼”里，猫笼里就混进了狗，这违背了“猫笼”的初衷，会出问题。 结论：Java 泛型默认是不变的，List<子类> 和 List<父类> 之间没有任何关系，以保证绝对的类型安全。
> 2. 协变 (Covariance) - extends 带来的关系 协，就是“协同、顺应”的意思。协变意味着泛型类型的关系顺应了原始类型的继承关系。 原始关系：猫 是 动物 的子类。 协变关系：装猫的容器 是 装某种动物的容器 的子类型。 Java 实现：List<猫> 是 List<? extends 动物> 的子类型。 理解：List<? extends 动物> 的意思是 “一个装着某种动物的只读容器”。我有一个 List<猫>，猫当然是动物，所以我把它给你，你从里面拿出来的东西当成动物来看，是完全没有问题的。 代价：为了保证安全，你不能往这个 List<? extends 动物> 里放任何东西（除了null）。因为我不知道这个容器具体是装猫的还是装狗的，我不能随便放一只鸟进去。所以，它变成了只读的（生产者 Producer）。 一句话总结协变 (extends)：我有一个更具体的容器 (List<猫>)，可以安全地把它当成一个更泛化的只读容器 (List<? extends 动物>) 来使用。子类型关系被保留了。
> 3. 逆变 (Contravariance) - super 带来的关系 逆，就是“反转、逆行”的意思。逆变意味着泛型类型的关系反转了原始类型的继承关系。 原始关系：猫 是 动物 的子类。 逆变关系：能装动物的容器 是 能装猫的容器 的子类型。 Java 实现：List<动物> 是 List<? super 猫> 的子类型。 理解：这听起来最绕，但其实很合理。List<? super 猫> 的意思是 “一个能接收猫以及猫的父类的只写容器”。我需要一个能装下猫的容器。那么，一个能装所有动物的容器 (List<动物>)，是不是肯定能装下猫？当然可以！一个能装所有生物的容器 (List<生物>)，是不是也能装下猫？也可以！ 代价：为了保证安全，你从这个 List<? super 猫> 里取东西时，你只知道取出来的一定是 Object，因为这个容器可能是 List<猫>，也可能是 List<动物>，甚至是 List<Object>，你无法确定取出的具体类型。所以，它变成了只写的（消费者 Consumer）。 一句话总结逆变 (super)：我需要一个能接收具体类型 (猫) 的容器，那么一个能接收其父类型 (动物) 的容器就可以安全地被使用。子类型关系被反转了。

### 类型擦除的影响

Java 泛型是假泛型，编译完就把类型信息擦掉了。`List<Integer>` 和 `List<String>` 在运行时都是 `List`，靠边界限定符在编译期做检查。

上界限定符 `<T extends Number>` 擦除后会变成 Number，下界限定符擦除后变成 Object。编译器会在必要的地方插入强制类型转换，所以运行时的类型安全全靠编译期的检查来保证。

```java
// 编译前
public <T extends Number> void print(T value) {
    System.out.println(value.intValue());
}

// 擦除后相当于
public void print(Number value) {
    System.out.println(value.intValue());
}
```

### 多重边界

上界限定符支持多重边界，用 `&` 连接，但只能有一个类，接口不限：

```java
// T 必须同时是 Number 的子类，并且实现 Comparable 和 Serializable
public <T extends Number & Comparable<T> & Serializable> void process(T value) {
    // 可以调用 Number 的方法，也可以调用 Comparable 的方法
}
```

注意类必须写在第一个，接口写后面，否则编译不过。

## Q&A

### 实际项目中什么时候会用到这些边界限定符？

写工具类和框架代码的时候用得多。比如你要写个通用的集合处理方法，需要同时支持 `List<Integer>` 和 `List<Number>`，就得用通配符。Spring 框架里大量使用，像 `BeanFactory.getBean(Class<T> requiredType)` 返回值用的就是泛型边界。还有就是回调接口设计，比如 `Comparator<? super T>` 让你可以用父类的比较器来比较子类对象。

### 既然泛型被擦除了，为什么 List<String> 和 List<Integer> 不能互相赋值？

这是编译期检查，不是运行时检查。编译器在擦除之前就已经做了类型检查，发现类型不匹配直接报错，压根走不到擦除那一步。你要是用反射往 `List<String>` 里塞 Integer 是完全可以的，运行时根本不管。

### 有没有办法在运行时拿到泛型的实际类型？

有几种办法。一种是通过反射读取字段、方法签名上的泛型信息，class 文件里有存。另一种是定义匿名内部类继承泛型类，比如 `new TypeToken<List<String>>(){}`，这时候泛型信息会被记录到子类的 Signature 里，Gson、Jackson 这些框架就是这么干的。还有就是直接把 `Class<T>` 当参数传进来，最简单粗暴。

### 泛型方法里的 T 和类上定义的 T 有什么关系？

没关系，两个 T 是独立的类型参数。方法上的 T 会遮蔽类上的 T，方法内部用的是方法自己声明的那个。如果类是 `Foo<T>`，方法是 `<T> void bar(T t)`，调用 bar 时传什么类型都行，跟 Foo 实例化时指定的 T 没关系。



