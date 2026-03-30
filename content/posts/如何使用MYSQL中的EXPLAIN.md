---
title: 如何使用MYSQL中的EXPLAIN
date: '2026-02-22 14:20'
updated: '2026-03-29 22:32'
excerpt: 详解MySQL EXPLAIN各字段的含义，重点介绍type、key、Extra等关键字段的分析方法。
tags:
  - MySQL
category: Database
---

### 如何使用EXPLAIN进行查询分析

EXPLAIN 是 MySQL 分析 SQL 执行计划的核心工具，在 SELECT 语句前加上 EXPLAIN 就能看到优化器打算怎么执行这条查询。

explain显示的字段总共是这些：

1. id，查询中 **每个 SELECT 的标识符**，用于标明执行顺序。
   * 相同 id：同一层级的操作
   * id 大：最先执行
   * id 小：后执行（用于子查询/联合查询）
2. select_type，查询类型。常见的一些值如下：
   * `SIMPLE`：简单 SELECT，没有子查询或 UNION
   * `PRIMARY`：最外层的 SELECT
   * `SUBQUERY`：子查询中的 SELECT
   * `DERIVED`：派生表（子查询作为临时表）
   * `UNION` / `UNION RESULT`：联合查询
   * `DEPENDENT SUBQUERY`：依赖外层查询的子查询
3. table，当前行描述的是 **哪张表**。如果是派生表或子查询，则显示别名
4.  partitions（MySQL 5.6+）
   - 显示查询涉及的 **分区表分区**
   - `NULL` 表示没有使用分区
5. type，表示**连接类型 / 访问类型**，是expalin中最重要的字段之一。常见的值如下：
   * `ALL`：全表扫描（最慢）
   * `index`：全索引扫描，比全表扫描稍快
   * `range`：使用索引范围扫描
   * `ref`：非唯一索引扫描（等值匹配）
   * `eq_ref`：主键/唯一索引扫描，一次只匹配一行。通常出现在多表join时，表示在 **JOIN** 查询中，每条外表行最多匹配内表一行。
   * `const` ：表示**通过主键或唯一索引查找到的单行记录**。一般出现在单表查询
   * `system`：表示 **表只有一行数据**，MySQL 可以直接把它当作常量表来处理。效率最高

> 不同type的性能如下：
>
> ```sql
> system > const > eq_ref > ref > fulltext > ref_or_null > index_merge > unique_subquery > index_subquery > range > index > ALL
> ```
>
> 

6. possible_keys，MySQL 认为可能使用的索引，NULL 表示没有可用索引
7. key，实际使用的索引，NULL 表示没有使用索引（可能是全表扫描）
8. key_len，**使用索引的长度**（字节数），可以判断索引是否完全被利用例如：
   - `PRIMARY` 是 INT 类型 → 4
   - `VARCHAR(10)` 前缀索引 → 可能是 10 或更少字节
9. ref，哪个列或常量被用于索引查找。常见值：
   - `const`：常量匹配
   - `table.column`：列匹配
   - `NULL`：没有使用索引
10. rows，**MySQL 估算要扫描的行数**，用于粗略判断查询成本，注意：是估算值，不是精确行数
11. filtered，WHERE 条件过滤后的百分比。数字越小，说明条件过滤效果越好。例如 `100` 表示全部行都保留，`10` 表示只保留 10%
12. Extra，额外信息，也是explain中相当重要的字段。常见值：
    - `Using where`：使用了 WHERE 过滤
    - `Using index`：覆盖索引扫描（索引包含所有需要的列）
    - `Using temporary`：使用了临时表（如 GROUP BY、DISTINCT）
    - `Using filesort`：需要排序操作（效率较低）
    - `Using join buffer`：使用连接缓冲区
    - `Using index condition`：索引条件下推

### EXPLAIN 的两个增强版本

MySQL 5.6+ 支持 `EXPLAIN FORMAT=JSON`，输出更详细的 JSON 格式，能看到每一步的成本估算。MySQL 8.0.18+ 还新增了 `EXPLAIN ANALYZE`，这个更厉害，会真正执行查询并给出实际的执行时间和行数，不只是预估值。调试复杂查询的时候特别有用。

```sql
-- JSON 格式，能看到 cost 成本
EXPLAIN FORMAT=JSON SELECT * FROM employees WHERE department_id = 5;

-- 真正执行并返回实际耗时
EXPLAIN ANALYZE SELECT * FROM employees WHERE department_id = 5;
```

### 常见的问题

#### possible_keys 有值但 key 是 NULL，这是什么情况？

这就说明优化器认为全表扫描比走索引更划算。常见场景是表数据量很小，或者查询条件覆盖了大部分数据，走索引反而多一次回表的开销。另外索引字段类型不匹配也会导致索引失效，比如 varchar 字段拿 int 去比较。

#### Using index 和 Using index condition 有什么区别？

Using index 是覆盖索引，查询需要的字段全在索引里，直接从索引拿数据不用回表。Using index condition 是索引条件下推 ICP，MySQL 5.6 引入的优化，把部分 WHERE 条件下推到存储引擎层在索引遍历时就过滤掉，减少回表次数。前者是完全不回表，后者是少回表。

#### 一个慢查询，EXPLAIN 看到走了索引但还是慢，可能是什么原因？

几种可能。

第一，回表次数太多，虽然走了二级索引，但查出来几十万行每行都要回表，随机 IO 吃不消，还是慢。

第二，索引选择性差，比如 status 字段只有几个值，走索引过滤效果不好。

第三，数据量太大，索引树本身就很大，内存装不下频繁读磁盘。

第四，EXPLAIN 是估算，实际执行可能和估算不一样，可以用 EXPLAIN ANALYZE 看真实执行情况。

第五，返回数据量大，网络传输耗时。重点看 EXPLAIN 的 rows 估算值和 Extra 列有没有 filesort、temporary。

##### 补充一下常见的索引失效的场景

1. 联合索引的使用不符合最左前缀匹配原则
2. 在索引列上做运算/使用函数/做隐式类型转换
3. 使用like进行模糊匹配时，在最左侧使用了通配符，如'%xxx'。因为索引是按字符顺序排的，左边不确定就没法定位起始位置，只能全表扫
4. 使用or连接了非索引字段
5. 优化器认为不走索引更划算。比如订单表按商品 ID 查，热门商品占了 80% 的订单，走索引反而要回表几十万次，不如直接全表扫描。
6. ORDER BY 没配合好，ORDER BY 后面的字段不是主键，也不是覆盖索引，或者说使用的联合索引不是按照最左匹配的顺序来的，比如联合索引A，B，但是order by B A这时候就会失效。MySQL 可能选择全表扫描再排序，而不是走索引。



