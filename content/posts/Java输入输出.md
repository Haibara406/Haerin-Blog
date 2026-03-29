---
title: "Java输入输出"
date: "2026-02-26"
excerpt: "只有输出"
tags: ["Java", "AI"]
category: "AI"
---

#### 只有输出

```java
public class Main{
    public static void main(String[] args){
        System.out.printlin("Hello World!");
    }
}
```

#### 单组A+B

```java
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(a + b);
    }
}
```

#### 多组A + B

```java
public class Main{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        while(sc.hasNext()){
            int a = sc.nextInt();
        	int b = sc.nextInt();
            System.out.println(a + b);
        }
    }
}
```

#### 多组A + B（T组形式）

```java
public class Main{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        int t = sc.nextInt();
        for(int i = 0;i < t;i ++){
            int a = sc.nextInt();
        	int b = sc.nextInt();
            System.out.println(a + b);
        }
    }
}
```

#### 多组A + B（0尾形式）

```java
public class Main{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        while(true){
            int a = sc.nextInt();
        	int b = sc.nextInt();
            if(a == 0 && b == 0) break;
            System.out.println(a + b);
        }
    }
}
```

#### 单组 （一维数组）

```java
public class Main{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long sum = 0;
        for(int i = 0;i < n;i ++){
            sum += sc.nextInt();
        }
        System.out.println(sum);
    }
}
```

#### 多组 （一维数组，T组形式）

```Java
public class Main{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        while(sc.hasNext()){
            int t = sc.nextInt();
            long sum = 0;
            for(int i = 0;i < t;i ++){
                sum += sc.nextInt();
            }
            System.out.println(sum);
        }
    }
}
```

#### 单组 （二维数组）

```java
public class Main{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int m = sc.nextInt();
        long sum = 0;
        for(int i = 0;i < n;i ++){
            for(int j = 0;j < m;j ++){
                sum += sc.nextInt();
            }
        }
        System.out.println(sum);
    }
}
```

#### 多组 （二维数组，T组形式）

```java
public class Main{
    public class void main(String[] args){
        Scanner sc = new Scanner(System.in);
        int t = sc.nextInt();
        for(int i = 0;i < t;i ++){
            int n = sc.nextInt();
            int m = sc.nextInt();
            long sum = 0;
            for(int j = 0;j < n;j ++){
                for(int k = 0;k < m;k ++){
                    sum += sc.nextInt();
                }
            }
            System.out.println(sum);
        }
    }
}
```

#### 单组 （字符串）

```java
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        sc.nextLine();
        String s = new StringBuilder(sc.nextLine()).reverse().toString();
        System.out.println(s);
    }
}
```

#### 多组 （字符串 t组形式）

```java
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int t = sc.nextInt();
        for(int i = 0;i < t;i ++){
            int n = sc.nextInt();
            sc.nextLine();
            String s = new StringBuilder(sc.nextLine()).reverse().toString();
            System.out.println(s);
        }
    }
}
```

#### 单组 （二维字符数组）

```java
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), m = sc.nextInt();
        sc.nextLine();
        String[] ss = new String[n];
        for(int i = 0;i < n;i ++){
            ss[i] = new StringBuilder(sc.nextLine()).reverse().toString();
        }
        for(int i = n - 1;i >= 0; -- i){
            System.out.println(ss[i]);
        }
    }
}
```

#### 多组 （带空格的字符串 t组形式）

> **输入：**
>
> 3
> 9
> one space
> 11
> two  spaces
> 14
> three   spaces
>
> **输出：**
>
> ecapseno
> secapsowt
> secapseerht

```java
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int t = sc.nextInt();
        sc.nextLine();
        for(int i = 0;i < t;i ++){
            sc.nextLine();
            String s = new StringBuilder(sc.nextLine().replace(" ", "")).reverse().toString();
            System.out.println(s);
        }
    }
}
```

#### 单组 （保留小数位数）

> **输入：**1.23
>
> **输出：**1.230
>
> ---
>
> **输入：**114.514
>
> **输出**：114.514
>
> ---
>
> **输入：**123
>
> **输出：**123.000

```java
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        double num = sc.nextDouble();
        System.out.printf("%.3f", num);
    }
}
```

#### 单组 （补充前导零）

> **输入：**123
>
> **输出：**000000123
>
> ---
>
> **输入：**123456789
>
> **输出：**123456789

```java
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int num = sc.nextInt();
        System.out.printf("%9d", num);
    }
}
```

#### 单组 判断YES/NO

> **输入：**123
>
> **输出：**YES
>
> ---
>
> **输入：**124
>
> **输出：**NO

```java
import java.util.Scanner;

// 注意类名必须为 Main, 不要有任何 package xxx 信息
public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        if (n % 2 != 0){
            System.out.println("YES");
        } else{
            System.out.println("NO");
        }
        
    }
}
```

#### 单组 （spj判断浮点误差）

> **输入：**123
>
> **输出：**47529.155256

```java
public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int num = in.nextInt();
        double s = Math.PI * Math.pow(num, 2);
        String format = String.format("%.6f", s);
        System.out.println(format);
    }
}
```





