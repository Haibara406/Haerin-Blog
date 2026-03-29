---
title: Mysql窗口函数
date: '2026-02-17'
excerpt: 首先窗口函数都需要使用over()，表示在什么规则下执行窗口函数
tags:
  - MySQL
category: Database
---

首先窗口函数都需要使用over()，表示在什么规则下执行窗口函数

over()里常见的三个部分

* partition by，表示根据xx字段分组
* order by，表示根据xx字段排序，默认升序。降序需要配合desc

* rows between，表示窗口返回（如果不制定，默认就是对查询的所有数据生效）

### 排名类函数

#### row_number

表示给每一行编号（严格递增），没有并列，一定唯一

比如一下SQL：

```sql
row_number() over(order by salary desc)
```

得到的数据类似于：

| salary | row_number |
| ------ | ---------- |
| 3000   | 1          |
| 2000   | 2          |
| 2000   | 3          |

#### rank()

也是排名，但是他有并列，出现相同名次时，下一次排名有跳跃

比如一下SQL：

```sql
rank() over(order by salary desc)
```

得到的数据是：

| salary | rank |
| ------ | ---- |
| 3000   | 1    |
| 2000   | 2    |
| 2000   | 2    |
| 1000   | 4    |

#### dense_rank()

如果希望不跳跃，则可以使用dense_rank()

```sql
dense_rank() over(order by salary desc)
```

| salary | dense_rank |
| ------ | ---------- |
| 3000   | 1          |
| 2000   | 2          |
| 2000   | 2          |
| 1000   | 3          |

对于这一类窗口函数，比如常考的“求各部分工资前三的员工”这种TopN问题

```sql
select *
from (
	select
  	*
  	row_number() over (order by salary desc) rn
  from emp
) t
where rn <= 3
```

### 前后行函数

#### lead()

取后 N 行数据

```sql
lead(price, 1) over (order by date)
```

#### lag()

取前 N 行数据

```sql
lag(price, 1) over (order by date)
```

### 聚合型窗口函数

这些函数本来就是聚合函数，但加上 over 变成窗口版本。

- `sum()`
- `avg()`
- `count()`
- `max()`
- `min()`

#### 累计求和

```sql
sum(salary) over (partition by date)
```

#### 按部门求平均薪资

```sql
avg(salary) over (partition by dept)
```

### 窗口范围控制

平时，当我们写

```sql
sum(salary) over(order by id)
```

默认等价于：

```sql
sum(salary) over(
    order by id
    rows between unbounded preceding and current row
)
```

此时的窗口范围就是从最前面开始到当前行

完整的语法就是：rows between 起点 and 重点

#### 起点/重点可选的值

| 关键字              | 含义         |
| ------------------- | ------------ |
| unbounded preceding | 从最前面开始 |
| n preceding         | 往前 n 行    |
| current row         | 当前行       |
| n following         | 往后 n 行    |
| unbounded following | 到最后一行   |















