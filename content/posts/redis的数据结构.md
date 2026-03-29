---
title: "redis的数据结构"
date: "2026-03-10"
excerpt: "简介"
tags: ["Redis"]
category: "Database"
---

### 简介

**5 种数据类型对比**

| 结构类型 | 结构存储的值                           | 结构的读写能力                                               |
| -------- | -------------------------------------- | ------------------------------------------------------------ |
| String   | 字符串、整数或者浮点数                 | 一种二进制安全的数据类型，支持存储：字符串、整数、浮点数、图片 (图片的 base64 编码或者图片路径)、序列化后的对象； |
| List     | 链表，链表上的每个节点都包含一个字符串 | 链表两端可进行插入和删除操作，支持遍历读取和反向查找，更加方便操作 |
| Hash     | 包含键值对的无序散列表                 | String 类型的 field-value (键值对) 映射表，特别适合用于存储对象，后续可以直接修改这个对象中的某些字段的值 |
| Set      | 包含字符串的无序集合                   | 无序集合，集合中的元素保证唯一性，类似于 `HashSet`           |
| ZSet     | 和散列一样，用于存储键值对             | 和 Set 相比，Sorted Set 增加了一个权重参数 `score`，使得集合中的元素能够按照 `score` 进行有序排序。 |

**5 种数据类型的底层数据结构**

| String  | List (不同版本不相同)                                      | Hash               | Set               | Zset                   |
| ------- | ---------------------------------------------------------- | ------------------ | ----------------- | ---------------------- |
| **SDS** | **ListPack /** **QuickList/** **ZipList /** **LinkedList** | **Dict / ZipList** | **Dict / Intset** | **ZipList / SkipList** |

### 客户端常用

| 基础操作指令      | 作用                                        |
| ----------------- | ------------------------------------------- |
| **SET KEY VALUE** | 设置 key, value 数据                        |
| **GET KEY**       | 根据 key 查询对应的 VALUE, 如果不存在返回空 |
| **clear**         | 清除屏幕中的信息                            |
| **quit/exit**     | 退出客户端                                  |
| **help**          | 获取命令帮助文档                            |

| 对 key(键) 操作   | 作用                                                         | 效果                                                         |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **keys**          | 查看当前库所有 key                                           | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/ohQSQlpTd4pmzcKi_mianshiya.png) |
| **exists key**    | 判断某个 key 是否存在                                        | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/FeWetWZaL8vhayZk_mianshiya.png) |
| **type key**      | 查看此 key 是什么数据类型                                    | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/hjjMsVY0uW9KSks2_mianshiya.png) |
| **del key**       | 删除指定 key 数据                                            | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/yh3Aa47eedy9k6WY_mianshiya.png) |
| **unlink key**    | 根据 value 选择非阻塞删除 [将 key 从 keyspace 元数据中删除，真正删除会在后续异步操作] | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/Lxfj1Vel4XYJXboG_mianshiya.png) |
| **expire key 10** | 设置 key 10s 之后过期                                        | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/uEUlW3SlWWn3H0MC_mianshiya.webp) |
| **ttl key**       | 查看还有多少秒过期 [-1 表示永不过期，-2 表示已经过期]        |                                                              |

---

### 对 DB 数据库操作

> redis 安装之后，默认有 16 个库，下标为 0 ~ 15

| 对数据库指令 | 作用                       | 效果                                                         |
| ------------ | -------------------------- | ------------------------------------------------------------ |
| dbsize       | 查看当前数据库的 key 数量  | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/S0pKQEbypChHZ7Te_mianshiya.png) |
| select       | 默认有 16 个数据库，0 ~ 15 |                                                              |
| flushdb      | 清空当前库                 | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/VuDup9lyf67GhBcq_mianshiya.webp) |
| flushall     | 清空全部库                 |                                                              |

---

### String 字符串

> 简单且常用。 可以用来存储多种类型的数据比如：字符串、整数、浮点数、图片、序列化后的对象 由于 Redis 是基于 C 语句编写的，但是 C 语言内没有字符串，所以 Redis 自己构建了一种`简单动态字符串 (Simple Dynamic String, SDS)`

#### 基本操作

| 字符串操作指令    | 介绍                               | 效果                                                         |
| ----------------- | ---------------------------------- | ------------------------------------------------------------ |
| **SET key value** | 设置指定 key 的值                  | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/SZ4d5pb5MBRAGyQ5_mianshiya.webp) ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/ZMYbJJx6xqy2kc8r_mianshiya.png) |
| **GET key**       | 获取指定 key 的值                  |                                                              |
| **EXISTS key**    | 判断指定 key 是否存在              |                                                              |
| **DEL key**       | 删除指定的 key                     |                                                              |
| **STRLEN**        | 返回 key 所存储的字符串值的长度    |                                                              |
| **SETNX key**     | 只有 key 不存在的时候设置 key 的值 | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/LTnQNvMXujFfUVg8_mianshiya.png) |

#### 批量设置

| 字符串操作指令                        | 介绍                          | 效果                                                         |
| ------------------------------------- | ----------------------------- | ------------------------------------------------------------ |
| **MSET key1 value1 key2 value2 ....** | 设置一个或者多个指定 key 的值 | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/nX6rAyWUR7Ezsua3_mianshiya.png) |
| **MGET key1 key2 ....**               | 获取一个或者多个指定 key 的值 |                                                              |

#### 计数器功能

| 字符串操作指令 | 介绍                      | 效果                                                         |
| -------------- | ------------------------- | ------------------------------------------------------------ |
| **INCR key**   | 将 key 中存储的数字值增一 | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/yJSsz41T4rHh0X8J_mianshiya.webp) |
| **DECR key**   | 将 key 中存储的数字值减一 |                                                              |

#### 设置过期时间

| 字符串操作指令            | 介绍                      | 效果                                                         |
| ------------------------- | ------------------------- | ------------------------------------------------------------ |
| **EXPIRE key**            | 给已存在的key设置过期时间 | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/LubDIa0ZnEGR6P7d_mianshiya.webp) |
| **SETEX key [TTL] VALUE** | 设置值并且设置过期时间    |                                                              |

#### 应用场景

- 需要存储常规数据的场景：缓存 Session、Token、图片地址、序列化之后的对象 (相比较于 Hash 存储更加节省内存)
- 计数场景：用户单位时间内的访问次数、页面单位时间内的访问次数
- 分布式锁：利用 `SETNX key value` 命令可以实现一个最为简易的分布式锁

---

### List 列表

> 列表是有序的字符串集合，支持从两端推入和弹出元素，底层实现为双向链表。

#### 基本操作

| 指令                 | 介绍                                        | 效果                                                         |
| -------------------- | ------------------------------------------- | ------------------------------------------------------------ |
| RPUSH key v1 v2      | 从列表末尾添加一个或者多个元素              | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/L9T3pP3aGRVUL2le_mianshiya.png) |
| LPUSH key v1 v2      | 从列表的头部添加一个或者多个元素            | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/PGnACRtuAcfN4Z3t_mianshiya.webp) |
| LRANGE key start end | 获取列表 start 和 end 之间的元素            |                                                              |
| LSET key index value | 将指定列表索引 index 位置的值设置为 value   | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/7RJTV9dDJoeLmujT_mianshiya.png) ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/z4e40nDZ10duwQst_mianshiya.webp) |
| LLEN key             | 获取列表元素数量                            |                                                              |
| LPOP key             | 移除并且获取指定列表的第一个元素 (最左边)   |                                                              |
| RPOP key             | 移除并且获取指定列表的最后一个元素 (最右边) |                                                              |

**LPUSH \ RPUSH 和 LPOP \ RPOP 指令对比**

![画板](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/fBRLs9lszhSnb6Gf_mianshiya.webp)

#### 应用场景

**信息流展示**：更新文章、更新动态

**消息队列：** 但是不推荐，缺陷过多

---

### Hash 哈希表

> 基于 String 类型的 `field-value(键值对)` 的映射表，特别适合用于存储对象，后续操作的时候，可以直接修改整个对象中的某些字段的值。

#### 基本操作

| 指令                                                         | 介绍                                                    | 效果                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------ |
| HSET key field value                                         | 设置指定哈希表中指定字段的值                            | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/0EhdB0UyFLH5TiZs_mianshiya.png) ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/eHGRjwHNhN1z7pwJ_mianshiya.webp) ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/slhXYzP6qg2hezpm_mianshiya.webp) |
| HMSET key field1 value1 field2 value2 field3 value3**（在redis4.0时被废除，HSET支持同时设置多个filed-value）** | 同时将一个或者多个 `field-value` 对设置到指定哈希表中   |                                                              |
| HGET key field                                               | 获取只当哈希表中指定字段的值                            | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/xm055cSvU2QIrDhE_mianshiya.png) ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/sNP4vtq4q1gVZJey_mianshiya.webp) ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/moH2U2C580MN3Vc9_mianshiya.png) |
| HMGET key field1 field2....                                  | 获取指定哈希表中的指定的一个或者多个字段的值            |                                                              |
| HGETALL key                                                  | 获取指定哈希表中所有的键值对                            |                                                              |
| HEXISTS key field                                            | 查看指定哈希表中指定的字段是否存在                      |                                                              |
| HLEN key                                                     | 获取指定哈希表中的字段数目                              | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/67MuYboOBf00n2Ma_mianshiya.webp) |
| HSETNX key field value                                       | 只有指定字段不存在时设置指定字段的值                    |                                                              |
| HINCRBY key field increment                                  | 对指定哈希中的指定字段做运算操作 (正数为加，负数为减号) | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/XzXr2VzW8U541xhz_mianshiya.webp) |

#### 应用场景

- 举例：用户、商品、文章、购物车信息
- 相关命令：`HSET`(设置单个字段的值)、`HMSET`(设置多个字段的值)

---

### Set 集合

> Redis 中的 Set 类型是一种无序集合，没有顺序但是都唯一，类似于 Java 中的 `HashSet`。 满足需求：需要存储一个列表数据，但是不希望出现重复数据； Set 也提供了查询某一个元素是否在 Set 内的接口；也可以快速实现求交集、并集、差集的操作。

#### 基本操作

| 指令                                 | 介绍                                      | 效果                                                         |
| ------------------------------------ | ----------------------------------------- | ------------------------------------------------------------ |
| SADD key member1 member2 ...         | 向指定集合添加一个或者多个元素            | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/XFYQ2ZwEr084lFgb_mianshiya.webp) ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/HGTgxc0CDixarxod_mianshiya.png) |
| SMEMBERS key                         | 获取指定集合中的所有元素                  |                                                              |
| SCARD key                            | 获取指定集合的元素数量                    |                                                              |
| SISMEMBER key member                 | 判断指定元素是否在指定集合中              |                                                              |
| **求交集**                           |                                           |                                                              |
| SINTER key1 key2 ...                 | 获取给定所有集合的交集                    | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/X56CWfJhS81U5nVm_mianshiya.webp) ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/BcLyLksmoUvljk6l_mianshiya.png) |
| SINTERSTORE destination key1 key2    | 将给定所有集合的交集存储在 destination 中 |                                                              |
| **求并集**                           |                                           |                                                              |
| SUNION key1 key2....                 | 获取给定所有集合的并集                    | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/BY6DYpncom240Mm0_mianshiya.webp) ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/T55kPqRd13AHvv3A_mianshiya.png) |
| SUNIONSTORE destination key1 key2    | 将指定所有集合的并集存储在 destination 中 |                                                              |
| **求差集**                           |                                           |                                                              |
| SDIFF key1, key2                     | 获取指定所有集合的差集                    | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/3N85JGR6EKKYYjcZ_mianshiya.webp) ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/iVjidl0I4E2FLtnZ_mianshiya.png) |
| SDIFFSTORE destination key1 key2.... | 将给定所有集合的差集存储在 destination 中 |                                                              |
| **移除操作**                         |                                           |                                                              |
| SPOP key count                       | 随机移除并获取指定集合中一个或者多个元素  | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/gnY0jgoXhxkioRpj_mianshiya.webp) |
| SRANDMEMBER key count                | 随机获取指定集合中指定数目的元素          |                                                              |

#### 应用场景

1. 统计的数据需要不能够重复
   - 举例：网站统计、文章点赞、动态点赞 (借助 SCARD 指令)
2. 需要获取多个数据源交集、并集 和 差集 的场景
   - 举例：共同好友(交集)、共同粉丝(交集)、共同关注等
3. 需要随机获取数据源中的元素的场景
   - 抽奖系统、随机点名等场景

---

### Sorted Set 有序集合

> 类似于 Set, 但是相比于 Set, Sorted Set 增加了一个权重参数 `score`；使得集合中的元素按照 `score` 进行有序排序；类似于 `TreeSet`+ `HashMap`

#### 基本操作

| 指令                                          | 介绍                                                         | 效果                                                         |
| --------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ZADD key score1 member1 score2 member2 ....   | 向指定有序集合中添加一个或者多个元素                         | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/c2YfcwQeXJJuJkDa_mianshiya.webp) |
| ZCARD KEY                                     | 获取指定有序集合的元素数量                                   |                                                              |
| ZSCORE KEY MEMBER                             | 获取指定有序集合中指定元素的 score 值                        |                                                              |
| ZINTERSTORE destination sum_key key1 key2 ... | 将给定所有有序集合的交集存储在 destination 中，对相同元素对应的 score 值进行 SUM 聚合操作， num_key 为集合数目 | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/VKfaRhFI82nc27U3_mianshiya.png)![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/tBKrjEvbul248mqq_mianshiya.png)![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/0tREmGl239wl7R2K_mianshiya.png) ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/TX2jE56CaPid0Jw1_mianshiya.png) ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/BOlFyOIHFTRTtxuA_mianshiya.webp) ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/4RpnHMsFqws6bN6M_mianshiya.png) ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/hPf3oQmPWe0n44EO_mianshiya.png) |
| ZINTERSTORE destination sum_key key1 key2 ... | 将给定所有有序集合的交集存储在 destination 中，对相同元素对应的 score 值进行 SUM 聚合操作， num_key 为集合数目 | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/VKfaRhFI82nc27U3_mianshiya.png)![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/tBKrjEvbul248mqq_mianshiya.png)![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/0tREmGl239wl7R2K_mianshiya.png) ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/TX2jE56CaPid0Jw1_mianshiya.png) ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/BOlFyOIHFTRTtxuA_mianshiya.webp) ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/4RpnHMsFqws6bN6M_mianshiya.png) ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/hPf3oQmPWe0n44EO_mianshiya.png) |
| ZUNIONSTORE destination sum_key key1 key2 ... | 求并集，其他和 ZINTERSTORE 类似                              |                                                              |
| ZDIFFSTORE destination sum_key key1 key2 ...  | 求差集，其他和 ZDIFFSTORE 类似                               |                                                              |
| **范围查询**                                  |                                                              |                                                              |
| ZRANGE key start end                          | 获取指定有序集合 start 和 end 之间的元素 (按照 score 从低到高排序) | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/JE3dRVZuarBRXFVg_mianshiya.png) |
| ZREVRANGE key start end                       | 获取指定有序集合 start 和 end 之间的元素 (按照 score 从高到低排序) | ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/5vHuaFk73rl8Dgvc_mianshiya.png) ![img](https://pic.code-nav.cn/mianshiya/question_picture/1799682467499941889/MSWmK9CDozUDiWxs_mianshiya.png) |
| ZREVRANK key member                           | 获取指定有序集合中指定元素排名，返回下标 (按照 score 从大到小排序) |                                                              |

#### 应用场景

- 各种排行榜、段位排行榜、热点话题排行榜，应用：`ZRANGE (从小到大排序)`、`ZREVRANGE (从大到小排序)`、`ZREVRANK (指定元素排名)`
- 需要存储的数据有优先级或者重要程度的场景，比如优先级任务队列

---

### 四种高级数据类型

> 随着 Redis 版本的更新，后面又增加 BitMap（2.2 版新增）、HyperLogLog（2.8 版新增）、GEO（3.2 版新增）、Stream（5.0 版新增）

#### BitMap

BitMap 是一种以位为单位存储数据的高效方式，适合用来表示布尔值（如存在性、状态等）。每个 bit 可以表示一个状态（0 或 1），使用空间少且操作快速。

**使用示例**：假设要统计每天用户的在线状态，可以用 Bitmap 记录每个用户是否在线：

```redis
SETBIT user:online:2024-09-27 12345 1  # 用户 ID 12345 在 2024-09-27 在线
GETBIT user:online:2024-09-27 12345    # 获取用户 ID 12345 在该日期的在线状态
```

#### HyperLogLog

HyperLogLog 是一种概率性数据结构，主要用于估算基数（不同元素的数量），内存占用固定，适合处理大规模数据的去重和计数。

**使用示例**：假设要估算访问网站的独立用户数量：

```redis
PFADD unique:visitors user1 user2 user3  # 添加用户 ID
PFCOUNT unique:visitors                  # 估算独立用户数量
```

#### GEO

GEO 是 Redis 提供的一种用于存储地理位置信息的数据结构，可以存储经纬度信息并支持空间查询，例如计算距离和获取范围内的坐标。

**使用示例**：假设要存储城市的位置并查找距离某个城市在一定范围内的其他城市：

```redis
GEOADD cities 13.361389 38.115556 "Palermo"      # 添加城市
GEOADD cities 15.087269 37.502669 "Catania"      # 添加城市
GEODIST cities "Palermo" "Catania" "km"          # 计算两个城市之间的距离
GEORADIUS cities 15.0 37.5 100 km                # 查找指定范围内的城市
```

#### Stream

Stream 是 Redis 提供的一种日志数据结构，适合于存储时间序列数据或消息流。支持高效的消息生产和消费模式，具有持久性和序列化特性。

**使用示例**：假设要存储传感器数据流，可以使用 Stream 进行数据插入和消费：

```redis
XADD sensor:data * temperature 22.5 humidity 60  # 向 Stream 添加传感器数据
XRANGE sensor:data - +                           # 获取 Stream 中的所有数据
XREAD COUNT 10 STREAMS sensor:data $             # 读取新的传感器数据
```



---

### 总结

- String ：缓存对象、计数器、分布式 session 等
- List：阻塞队列、消息队列（但是有两个问题：1. 生产者需要自行实现全局唯一 ID；2. 不能以消费组形式消费数据）等
- Hash：缓存对象、购物车、分布式锁等
- Set：集合聚合计算（并集、交集、差集）的场景，如点赞、共同关注、收藏等
- Zset：最典型的就是排行榜，这个也是面试中经常问到的点
- BitMap（2.2 版新增）：主要有 0 和 1 两种状态，可以用于签到统计、用户登录态判断等
- HyperLogLog（2.8 版新增）：海量数据基数统计的场景，有一定的误差，可以根据场景选择使用，常用于网页 PV、UV 的统计
- GEO（3.2 版新增）：存储地理位置信息的场景，比如说百度地图、高德地图、附近的人等
- Stream（5.0 版新增）：这个主要就是消息队列了，可以实现一个简单的消息，其相比 list 多了两个特性，分别是自动生成全局唯一消息ID以及支持以消费组形式消费数据（同一个消息可被分发给多个单消费者和消费者组），相比 pub/sub 它是可以被持久化。

![img](https://pic.code-nav.cn/mianshiya/question_picture/1810279447413260290/tYHGUG7m_image_mianshiya.png)

---

### Redis数据结构底层实现

#### ZSET

ZSet 的底层是**跳表 + 哈希表**双结构配合。跳表按 score 排序，支持 O(log N) 的插入、删除和范围查询；哈希表存 member 到 score 的映射，支持 O(1) 的单点查分。

为什么要两个结构？各取所长：

1）通过 member 查 score，比如 `ZSCORE key member`，走哈希表，O(1) 搞定

2）按 score 范围查 member，比如 `ZRANGEBYSCORE key 0 100`，走跳表，O(log N + M)

3）插入和删除同时更新两个结构，跳表部分 O(log N)，哈希表部分 O(1)，整体 O(log N)

如果只用跳表，按 member 查 score 就得遍历，复杂度退化到 O(N)。如果只用哈希表，范围查询没法搞。两个结构各管各的，互补短板。

当元素少的时候，ZSet 会用 listpack 来存，省内存。触发条件是元素个数不超过 128 且每个元素长度不超过 64 字节，任意一个条件破了就自动升级成跳表+哈希表。这俩阈值可以通过 `zset-max-listpack-entries` 和 `zset-max-listpack-value` 配置。

**ZSet 常用命令的复杂度**

| 命令          | 复杂度       | 说明                                            |
| ------------- | ------------ | ----------------------------------------------- |
| ZADD          | O(log N)     | 跳表插入O(logn) + 哈希表更新O(1)                |
| ZREM          | O(log N)     | 跳表删除O(logn) + 哈希表删除O(1)                |
| ZSCORE        | O(1)         | 直接查哈希表O(1)                                |
| ZRANK         | O(log N)     | 跳表查找O(logn) + span 累加                     |
| ZRANGE        | O(log N + M) | 通过跳表span类加快速定位到start + 遍历 M 个元素 |
| ZRANGEBYSCORE | O(log N + M) | 同上                                            |
| ZCARD         | O(1)         | 直接返回长度字段                                |

##### skiplist跳表

跳表本质上是一个**多层链表**，底层链表保存所有元素，上层链表是下层的子集，通过这种分层索引结构把链表的 O(n) 查找优化到 O(logn)。

zskiplist的数据结构

```c++
typedef struct zskiplist {
    struct zskiplistNode *header;  // zskiplist的头结点
    struct zskiplistNode *tail;  // zskiplist的尾节点，指向zskiplist底层的最后一个元素
    unsigned long length;  // 记录元素个数
    int level;  // 记录当前跳表的最高层数
} zskiplist;
```

zskiplistNode的数据结构

```c++
typedef struct zskiplistNode {
    sds ele;                      // 元素值，用 SDS 存储
    double score;                 // 分数，用于排序
    struct zskiplistNode *backward;  // 回退指针，指向前一个节点
    struct zskiplistLevel {
        struct zskiplistNode *forward;  // 前进指针
        unsigned long span;              // 跨度，记录该层当前节点到下个节点跨越了最底层多少个节点
    } level[];                    // 层级数组
} zskiplistNode;
```

> redis的zskiplist相较于一般的zskiplist有两点不同：
>
> 1. score允许重复
> 2. 多了一个backward指针
>
> 多的这个backward指针很关键，他直接导致跳表成为了一个双向链表，使得支持如ZREVRANGE，ZREVRANK这些需要反向遍历的方法。（同样的思想也来自于b+树的设计，其叶子结点通过双向链表连接，使得在order by倒叙遍历时更加方便）
>
> 需要注意的是backward只在最底层才有

###### zskiplist的查询

**跳表的查询过程**

- 查找跳表节点从跳表头节点的最高层开始，逐一遍历每一层。
- 遍历某一层节点时，依据节点中 member 和 score 进行判断：
- 若当前节点 score「小于」要查找的 score，访问该层下一个节点。
- 若当前节点 score「等于」要查找的 score 且当前节点 member「小于」要查找的节点的 member，访问该层下一个节点。
- 若上述两个条件都不满足或下一个节点为空，使用当前遍历节点 level 数组里的下一层指针，跳到下一层继续查找 。

![img](https://pic.code-nav.cn/mianshiya/question_picture/1826085029072973825/RhL6VsfNClkXAM4X_mianshiya.webp)

比如对于上图的例子

查找「元素:abcd，权重：4」的节点时：

- 从跳表头节点最高层 L2 开始，指向「元素:abc，权重：3」节点，因其权重小于目标权重，访问下一个节点，却发现下一个节点为空。
- 跳到「元素:abc，权重：3」节点的下一层 leve [1]，其下一个指针指向「元素:abcde，权重：4」节点，虽权重相同，但该节点 SDS 类型数据大于目标数据，继续跳到下一层 leve [0]。
- 在 leve [0] 层，「元素:abc，权重：3」节点的下一个指针指向「元素:abcd，权重：4」节点，找到目标节点，查询结束。

###### zskiplist的插入

当插入zskiplist时，需要有几点补充信息：

* 跳跃表最大层数，源码通过宏定义设为 32，节点再多也不会超 32 层。
* 初始化头节点时，由于节点最多 32 层，所以先建立好 32 层链表对应的头节点

**zskilist节点插入的整体流程**

1. **准备工作**：定义zskiplistNode *update数组和int rank数组。
   * update[i]表示：第i层最后一个比插入节点小的节点。后续新节点插入该层，就直接插入在这个节点后面。
   * rank[i]表示在寻找节点的插入位置时，每层跨越的底层节点数，用于更新插入节点每层的span
2. **查找插入位置**：这里的目标就是找到每层的插入点。外层for循环表示当前遍历的level（从最高层开始），内层while遍历当前level的所有节点。在while中只要右侧节点不为空，并且右侧节点的 `score` 小于新节点的 `score`，或者 `score` 相同但 `member` 小于新节点。就会一直循环找，循环中就会记录rank[i]。while遍历完后代表当前level遍历结束，就会更新当前level的update
3. **生成新节点层数**：使用 `zslRandomLevel` 函数生成新节点的随机层数。
   * 如果新节点层数比跳表最大层数高：
     * 高层没有任何节点，直接让 header 指向新节点。
     * 初始化 rank[i] 为0，初始化update[i]为header
     * 更新跳表最大层数。
4. **创建并插入新节点**：
   * 指针的更新
     * 遍历插入节点的随机level，这里的插入流程和链表插入差不多，就是让新节点的forward指向update[i]的forward。再让update[i]的forward指向新节点
   * span的更新
     * 新节点的 `span` = 原来的跨度 - 经过的节点数；update[i]->level[i].span -  (rank[0] - rank[i])
     * 前驱节点的 `span` = 从前驱到新节点的跨度。rank[0] - rank[i] + 1
5. **更新其他节点的** `**span**` **值**：对于未触及的层，更新 `update` 节点的 `span` 值（+1）。
6. **设置前后指针**：设置新节点的 `backward` 指针，若新节点有下一个节点，设置下一个节点的 `backward` 指针指向新节点；否则更新跳跃表的 `tail` 指针。
7. **更新跳跃表长度**：跳跃表节点数量加一，返回插入的新节点指针。

> 在插入新节点时，会调用`zslRandomLevel`函数随机生成该节点的层数
>
> ```c++
> int zslRandomLevel(void) {
>     int level = 1;
>     while ((random()&0xFFFF) < (ZSKIPLIST_P * 0xFFFF))
>         level += 1;
>     return (level<ZSKIPLIST_MAXLEVEL) ? level : ZSKIPLIST_MAXLEVEL;
> }
> ```
>
> 关键点：
>
> * 初始层数为1，代表每个跳表节点至少有 **1 层**。
> * `random()`：生成一个随机整数。`random() & 0xFFFF`：取随机整数的低 16 位，相当于 `[0, 65535]` 的随机数。
> * `ZSKIPLIST_P`：跳表层数增长概率，一般 Redis 默认 `ZSKIPLIST_P = 0.25`。
> * `(ZSKIPLIST_P * 0xFFFF)`：把概率映射到 `[0, 65535]` 的范围。
> * `while` 循环：如果随机数小于这个阈值，就把节点层数 `level` 增加 1。
> * 最后判断得到的level是否超过了最大层数32
>
> 随机函数很简单，本质就是生成0-65535的随机数，判断生成的随机数是否小于65536 / 4，即每层只有1/4的概率能上升到上一层

###### zskiplist的删除

删除的逻辑其实和插入的逻辑非常相似。

zskiplist的删除会使用两个内部函数：`zslDelete`和`zslDeleteNode`

在zslDelet中

1. 准备update数组，记录每层中查找待删除节点时遍历到的最后一个节点（不一定就是待删除节点的最后一个节点）。临时变量x等于跳表的header，从头结点开始遍历

2. 从最高层开始遍历，查找待删除的节点。这里的查找逻辑和**插入**时一直，只要右侧节点不为空，并且右侧节点的 `score` 小于新节点的 `score`，或者 `score` 相同但 `member` 小于新节点。就会一直循环找

3. 经过了步骤2里的循环后，让当前得到的x = x->level[0].forward;如果x 不为 null，并且x.score 等于待删除节点的score，并且x.member等于待删除节点的member。那么就证明找到了待删除节点。调用zdeleteNode方法进行删除

   **zdeleteNode方法的大致流程**

   1. 遍历跳表的每一层，判断update[i] -> level[i].forward是否等于 x
      * 如果是，则更新update[i] -> level[i].span += x -> level[i].span - 1。并更新update[i]的forward指针
      * 如果不是，则说明说明 x 在这一层对 update[i] 的跨度没有影响，只需要将跨度减 1。即update[i] -> level[i].span -= 1
   2. 遍历完后，如果判断到要删除的节点x有forward节点，则更新其后继节点的backward指针。如果没有forward节点，则代表当前节点是尾节点，这需要更新跳表的tail指针
   3. 最后循环从最高层判断跳表的header在每层的forward指针是否为null，为null就代表删除的节点是该层唯一的节点，此时就需要减少跳表记录的level层数
   4. 最后修改跳表记录的元素个数

###### **跳表的层级概率为什么是 25% 而不是 50%？**

这是空间和时间的权衡。50% 的话每两个节点就有一个上升，索引层太密集，浪费内存。25% 的话平均每 4 个节点有一个上升，既能保证 O(logn) 的查询效率，又不会占太多额外空间。Redis 这个 0.25 是经过实测调优的。

###### **跳表插入和删除会不会导致索引层不平衡？**

不会，因为层级是随机决定的。只要随机函数够均匀，插入删除多少次，整体的层级分布都会趋近于理论值。这跟红黑树不一样，红黑树必须靠旋转维护平衡，跳表靠概率天然就是平衡的。

###### **两个 member 的 score 相同怎么排？**

按 member 的字典序排。Redis 内部比较时先比 score，score 相等再用 `sdscmp` 比较 member 字符串。所以 ZSet 的排序是稳定且确定的，不会出现同 score 的元素顺序不一致的情况。

###### **redis是怎么判断两个sds的变量的大小的**

首先redis使用自己设计的sds来存储字符串，大致的结构如下：

```c
structure sdshdr{
  int len;		// 当前字符串长度
  int free;		// 多余预留空间
  char buf[];	// 字符内容（不以 \0 结尾）
}
```

因为使用了len来记录字符串的长度，不依赖c语言传统字符串的'/0'，因此不能使用c语言内置的strcmp，因为其内部需要依赖'/0'进行判断。

而是使用自己定义的函数sdscmp来判断的，其大致逻辑为

```c
size_t l1 = sdslen(s1); // 获取 s1 长度
size_t l2 = sdslen(s2); // 获取 s2 长度
size_t min_len = (l1 < l2) ? l1 : l2;

int cmp = memcmp(s1, s2, min_len); // 按字节比较最短长度
if (cmp == 0) {
    // 前 min_len 个字节相等
    if (l1 == l2) return 0;   // 长度也相等 => 完全相等
    return (l1 > l2) ? 1 : -1; // 长度不同 => 长的更大
}
return cmp; // 前面不同 => 返回 memcmp 结果
```

**先按内容比字节**

- 使用 `memcmp`，按字节顺序比较前 `min_len` 个字节。
- 一旦发现不同，直接返回差值（>0 或 <0）。

**如果前面相等**

- 比较长度：短的字符串小，长的字符串大。

**返回值意义**：

- `< 0` → s1 < s2
- `0` → s1 == s2
- `> 0` → s1 > s2

而memcmp内部，就逐一比较两个字符串的每个字节，一旦发现不同就返回差值

```c
for (size_t i = 0; i < n; i++) {
    unsigned char c1 = ((unsigned char*)s1)[i];
    unsigned char c2 = ((unsigned char*)s2)[i];
    if (c1 != c2) return (c1 - c2);  // 一旦发现不同，返回差值
}
return 0; // 前 n 个字节完全相同
```

###### 为什么不选择使用红黑树或者是b+树来代替skipList？

首先需要知道为什么ZSET需要跳表。

跳表无非就是一个多层双向链表，用来优化传统双向链表查询性能O(n)的问题。使用跳表就能讲查询性能提升到O(logn)。

而红黑树同样也是作为优化链表O(n)查询操作为O(logn)的一种数据结构。在Java中就是用红黑树去优化HashMap在哈希冲突严重时，查询性能退化成O(n)的问题。

因此红黑树完全也可以在这里作为升级的待选数据结构。但为什么最后选择了跳表呢？

1. 其实整体来看，选择跳表不选择红黑树的原因就是因为：跳表实现简单，代码可读性强，维护简单。并且做范围查询和遍历更加方便
2. 跳表的多层级是通过概率决定的，数据量大了，自然层级就上去了，数据量小层级就小一些，自动适应。而红黑树为了确保平衡需要左旋/右旋 + 变色，逻辑更复杂。并没有跳表直观
3. 跳表主要是ZSET用来解决哈希表无法进行高效范围查询以及排序的。跳表能通过span在O(logn)的时间复杂度下定位起点，然后往后遍历即可。而红黑树需要中序遍历，做各种判断
4. redis的跳表不同于一般的跳表，增加了span字段，记录跨度。对于ZRANK等，直接在遍历时类加span即可。而树形结构的红黑树，实现起来就很难。

不选择b+树，因为：

1. **节点较大**，通常一页大小（4 KB）存储多个 key
2. **主要优化 IO**，减少磁盘访问次数
3. **插入删除需要分裂/合并**，实现复杂

对于redis这种内存数据库，b+树完全用不上



---

#### SDS

Redis 的 String 底层用的是 **SDS**，全称 Simple Dynamic String，简单动态字符串。它不是直接用 C 语言原生的 char 数组，因为 C 字符串有几个致命问题：

1. 获取长度得遍历一遍，时间复杂度 O(n)
2. 遇到 \0 就认为结束了，没法存二进制数据
3. 扩容得自己手动搞，一不小心就缓冲区溢出

SDS 的核心设计是在字符数组前面加了个头部结构，记录了当前长度 len 和分配的空间 alloc。这样获取长度直接读 len 字段，O(1) 搞定；判断剩余空间用 alloc - len 就行，扩容前先检查够不够，不够再分配，杜绝溢出；而且不依赖 \0 判断结束，图片、音频这种二进制数据也能存。

SDS 结构包含三个核心字段：len 记录当前字符串长度，alloc 记录分配的总空间，buf 存储实际数据。获取长度时直接返回 len，时间复杂度 O(1)。扩容时先检查 alloc - len 是否足够，不够则重新分配。buf 末尾仍保留 \0，兼容部分 C 函数。

> redis为了兼容c语言函数而在buf中添加的'\0'只是为了保证 **如果你真的把 SDS.buf 当作普通 C 字符串传给外部库，也不会访问越界**。
>
> 这些c函数依赖'\0'做结束判断，因此如果buf中本身存储的数据就包含'\0'，那么肯定会因此被截断。
>
> **但 Redis 自己内部逻辑永远不会被影响**，因为内部操作**只用 `len`**。

##### 编码优化

![img](https://pic.code-nav.cn/mianshiya/question_picture/1843904816956411905/SoFWOkd3_kmY4Uz2sUb_mianshiya.webp)

> 从上面这张图中可以看到一个小彩蛋：redisObject有个字段是refcount，翻译成中文就是引用计数的意思。
>
> 也就是说redis的对象采用的是引用计数这种方式来判断一个对象是否需要被清理的。而不是像Java那样使用可达性分析
>
> 原因也很简单，redis的数据结构相对简单，扁平。绝大多数情况下，Redis 对象之间**不会出现复杂的循环引用**（例如，你不会在一个 String 里面存一个指向自己的指针）。
>
> 还有一个好处就是：**实现共享对象池**：这是引用计数最大的功劳。Redis 在启动时会预先创建 **0 到 9999 的整数对象**。
>
> - 如果有 1000 个 Key 的值都是 `100`，它们不需要占用 1000 份内存，而是全部指向同一个 `robj`。
> - 每多一个 Key 指向它，`refcount` 就加 1。
> - 这种**共享整数**的机制极大地节省了内存。
>
> 而且即便refcount不等于0，也不代表这个对象能一直存活。引用计数只负责“没人用时释放内存”。
>
> 但如果redis内存不够用了，就会通过lru或者lfu算法进行淘汰，即便refcount不等于1，也有可能被淘汰

除此之外Redis 还根据存储内容做了**编码优化**：

1）能解析成整数的，直接用 **int 编码**，将redisobject中原本用来存储sdshdr的指针，用来存储数字，连 SDS 都不用分配了

2）44 字节以内的短字符串用 **embstr 编码**，redisObject 和 SDS 分配在一块连续内存，一次 malloc 搞定

3）超过 44 字节的长字符串用 **raw 编码**，redisObject 和 SDS 分开存，方便独立扩容

> redisObject的结构
>
> ```c
> typedef struct redisObject {
>     unsigned type:4;        // 4 bits
>     unsigned encoding:4;    // 4 bits
>     unsigned lru:24;        // 24 bits，LRU 时间或 LFU 计数
>     int refcount;           // 32 bits，引用计数
>     void *ptr;              // 64 bits，指向实际数据
> } robj;
> ```

![img](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/wnE89xBp_image_mianshiya.webp)

> EMBSTR 编码的好处是 redisObject 和 sds 在**一块连续内存**里，创建和释放都只需要一次内存操作，对 CPU 缓存也更友好。超过 44 字节就得用 RAW 编码，redisObject 和 sds 分开存，ptr 指针指向另一块内存。

###### **三种编码的内存布局**

| 编码类型 | 触发条件               | 内存分配次数                      | 适用场景           |
| -------- | ---------------------- | --------------------------------- | ------------------ |
| int      | 值是 long 范围内的整数 | 0 次                              | 计数器、ID         |
| embstr   | 字符串 ≤44 字节        | 1 次(redisObject和sdshdr一起分配) | 短字符串、缓存 key |
| raw      | 字符串 >44 字节        | 2 次(redisObject和sdshdr各一次)   | 长文本、序列化数据 |

这里44 字节这个阈值是被**内存分配器的分配单元**给定死的。

**Redis 用的是 jemalloc，最小分配单元是 64 字节**，超过 64 字节就得分配更大的块，所以 Redis 要把 EMBSTR 编码的字符串塞进 64 字节里。

64 字节怎么分配的：

1. redisObject 结构体占 16 字节：type 占 4 位，encoding 占 4 位，lru 占 24 位，refcount 占 32 位，ptr 指针占 64 位，加起来 128 位就是 16 字节。
2. sdshdr8 结构体占 3 字节：len 占 1 字节记录已使用长度，alloc 占 1 字节记录分配长度，flags 占 1 字节标记类型。
3. 字符串末尾的 '\0' 占 1 字节。
4. 剩下的就是 64 - 16 - 3 - 1 = 44 字节，刚好能存 44 个字符。

![img](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/Ctg87c8p_embstr.drawio_mianshiya.webp)

###### Redis3.2之前的阈值

在redis3.2之前阈值是39而不是44，原因是因为redis3.2之前sdshdr是单一版本，结构长这样

```c
struct sdshdr {
    // 记录 buf 数组中已使用的字节数量（等同于字符串长度）
    unsigned int len;
    // 记录 buf 数组中未使用的字节数量
    unsigned int free;
    // 字节数组，用于保存字符串
    char buf[];
};
```

len和free就占了8字节，对比sdshdr8的一字节len和一字节alloc以及一字节flag，就多了5字节。44 - 5 = 39

###### jemalloc 的内存分配策略

jemalloc 的分配策略是按 size class 分级的，常见的 size class：8、16、32、48、64、80、96、128...

64 字节是一个关键分界点。申请 64 字节以内的内存，jemalloc 直接给你一个 64 字节的块；申请 65 字节，就得给 80 字节的块，浪费 15 字节。

Redis 把 EMBSTR 卡在 64 字节，就是为了最大化利用这个最小分配单元，不浪费一个字节。

###### EMBSTR 和 RAW 的区别

| 特性       | EMBSTR                      | RAW                         |
| ---------- | --------------------------- | --------------------------- |
| 内存布局   | redisObject 和 sds 连续存储 | redisObject 和 sds 分开存储 |
| 内存分配   | 一次 malloc                 | 两次 malloc                 |
| 内存释放   | 一次 free                   | 两次 free                   |
| 字符串长度 | ≤44 字节                    | >44 字节                    |
| 缓存友好性 | 高，数据在一块              | 低，需要跳转指针            |
| 修改操作   | 任何修改都转成 RAW          | 可以原地修改                |

EMBSTR 有个特点：**只读**。只要对 EMBSTR 编码的字符串做任何修改操作，比如 APPEND、SETRANGE，Redis 都会先把它转成 RAW 编码再修改。因为 EMBSTR 的内存是一次性分配的，没法动态扩展。

```bash
127.0.0.1:6379> SET name "hello"
OK
127.0.0.1:6379> OBJECT ENCODING name
"embstr"
127.0.0.1:6379> APPEND name " world"
(integer) 11
127.0.0.1:6379> OBJECT ENCODING name
"raw"
```

###### int编码

字符串还有一种 INT 编码，当字符串内容是 long 范围内的整数时，直接把整数值存在 ptr 指针里，连 sds 都省了。

```bash
127.0.0.1:6379> SET counter 12345
OK
127.0.0.1:6379> OBJECT ENCODING counter
"int"
```

Redis 还会复用 0-9999 这一万个整数对象，类似 Java 的整数缓存池，进一步节省内存。（前面提到的refcount的好处）

###### 为什么embstr是只读的？既然这样为什么不直接使用raw

需要注意的是这里说的“只读”并不是真正意义上只读，而是指embstr的**实现上不支持原地修改**。

embstr是redisObject和sdshdr一起分配一次连续内存。好处就是创建快，释放快，只需要malloc一次，内存碎片少。但是如果想要单独修改sdshdr就做不到，因为内存不是单独分配的而是一起分配的。要么就只能重新整体分配。

而raw是redisObject和sdshdr分别malloc分配的内存。好处就是可以扩容，可以原地修改互不影响。缺点就是内存碎片多。

**那既然这样为什么不直接使用raw呢？**

原因在于EMBSTR 的设计目标是：**优化短字符串创建与读取，而不是修改**。因为embstr是一次分配，连续存储。这意味着 CPU 缓存命中率更高，读取速度更快。而绝大多数短字符串在实际业务中都是读多写少的，比如用户昵称、配置项、Token，几乎不会被修改。就算偶尔要改，转一次 RAW 的开销也可以接受。

> 当对embstr编码的sds进行追加/修改时，无论追加和修改后的字符串长度是否超过阈值，都会切换为raw编码

###### redis为什么要搞这么多编码？

因为Redis是基于内存的数据库，其操作的数据都存储在内存中。因此对于内存占用，内存分配次数，CPU 缓存命中率，内存碎片等都十分敏感。int编码能在能字节解析成数字时不用分配sds的内存，embstr能在字符串较短时减少分配次数，内存碎片，以及内存占用等。而raw编码则确保正常大字符串的使用没问题。

##### 内存预分配策略

Redis SDS 并不是每次只分配恰好长度，而是多分一些空间，减少频繁 realloc。当追加数据时，如果追加后的长度超过了 `alloc`，就必须扩容。对应的规则是：

1）字符串长度小于 1MB 时，扩容后的 alloc 是 new_len 的 2 倍。比如追加后长度变成 100 字节，那 alloc 就分配 200 字节

2）字符串长度大于等于 1MB 时，每次多分配 1MB。比如追加后长度变成 2MB，那 alloc 就分配 3MB

这个策略在频繁追加内容的场景特别有用，比如日志收集、消息拼接，不用每次都 realloc。

##### SDS的多版本设计

在Redis3.2之前使用的是单一SDS结构

```c
struct sdshdr {
    // 记录 buf 数组中已使用的字节数量（等同于字符串长度）
    unsigned int len;
    // 记录 buf 数组中未使用的字节数量
    unsigned int free;
    // 字节数组，用于保存字符串
    char buf[];
};
```

这种设计虽然简单，但对于长度较短的字符串，头部的 `len` 和 `free` 也会各占 4/8 字节，显得有些浪费空间。

因此在Redis3.2之后，DS 就不只有一种结构，而是根据字符串长度选择不同的 sdshdr：

```c
// sdshdr5：长度 0-31 字节，len 只占 5 bit
// sdshdr8：长度 32-255 字节，len 占 1 字节
// sdshdr16：长度 256-65535 字节，len 占 2 字节
// sdshdr32/64：更长的字符串

/* 长度小于32字节 */
struct __attribute__ ((__packed__)) sdshdr5 {
    unsigned char flags; /* 前3位表示类型 (SDS_TYPE_5), 后5位存储长度 */
    char buf[];
};

/* 长度小于 256 字节 */
struct __attribute__ ((__packed__)) sdshdr8 {
    uint8_t len;         /* 已使用长度 (1字节) */
    uint8_t alloc;       /* 总分配空间 (1字节) */
    unsigned char flags; /* 类型标识 (1字节)，低3位存储类型 */
    char buf[];          /* 字符数组 */
};

/* 长度小于 64 KB */
struct __attribute__ ((__packed__)) sdshdr16 {
    uint16_t len;        /* 已使用长度 (2字节) */
    uint16_t alloc;      /* 总分配空间 (2字节) */
    unsigned char flags; /* 类型标识 (1字节) */
    char buf[];
};

/* 长度小于 4 GB */
struct __attribute__ ((__packed__)) sdshdr32 {
    uint32_t len;        /* 已使用长度 (4字节) */
    uint32_t alloc;      /* 总分配空间 (4字节) */
    unsigned char flags; /* 类型标识 (1字节) */
    char buf[];
};

/* 长度大于 4 GB (理论值，实际受 proto-max-bulk-len 限制) */
struct __attribute__ ((__packed__)) sdshdr64 {
    uint64_t len;        /* 已使用长度 (8字节) */
    uint64_t alloc;      /* 总分配空间 (8字节) */
    unsigned char flags; /* 类型标识 (1字节) */
    char buf[];
};
```

这样短字符串用 sdshdr8，头部只占 3 字节；长字符串才用 sdshdr32，头部占 9 字节。这样能省不少内存，尤其是 Redis 里大量的短 key。

##### SDS 扩容的时候，为什么小于 1MB 是翻倍，大于 1MB 是加 1MB？

小字符串翻倍扩容是为了减少扩容次数，代价是可能浪费一半空间，但小字符串由于本身占用内存就很小，因此浪费的内存就不多。

而大字符串如果还翻倍，比如一个 10MB 的字符串扩容后变 20MB，白白浪费 10MB。所以大字符串改成固定加 1MB，在扩容次数和空间浪费之间找平衡。

##### 为什么 Redis 不直接用 C++ 的 std::string？

Redis 是纯 C 写的，引入 C++ 会增加编译依赖和运行时开销。而且 std::string 的内存分配策略不够灵活，没法针对 Redis 的使用场景做优化，比如预分配策略、多版本 sdshdr 这些。自己实现 SDS 能完全掌控内存布局，针对短字符串、长字符串分别优化。

##### 总结SDS相对于普通字符串的优势

1. 扩容后空间预分配。传统字符串在每次追加时都可能会触发realloc。而SDS会根据不同的长度优化扩容：若追加后的字符串 < 1MB则扩容成2倍；反之则每次多分配1MB
2. 在头部增加len以及alloc字段，能够在O(1)内获取字符串长度，以及剩余未使用的空间
3. 不依赖'\0'做字符串的结束判断，因此可以存放二进制数据等
4. redis3.2版本后能根据不同的字符串长度，动态选择不同版本的sdshdr版本，节省空间
5. 每次在拼接时都会检查空间，若超出则自动扩容，从设计上避免了溢出。（传统字符串需要自行判断）

---

#### Ziplist / Quicklist / ListPack

**Ziplist** 是一块连续内存，把所有元素紧凑地挨在一起存，省内存但不适合存大量数据。

**Quicklist** 是 Redis 3.2 之后 List 的默认实现，本质是双向链表串起来一堆小的 Ziplist，兼顾了内存效率和操作性能。

Ziplist 的内存布局是这样的：开头有 zlbytes 记录整个压缩列表占多少字节，zltail 记录最后一个节点的偏移量用于快速定位尾部，zllen 记录节点个数，中间是一个个 entry 节点紧密排列，最后用 zlend（0xFF）标记结束。

每个 entry 节点内部又分三部分：pre_entry_length 记录前一个节点的长度用于反向遍历，encoding 记录当前节点的数据类型和长度，content 存实际数据。

![img](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/0I8lKBz2_image_mianshiya.webp)

Ziplist 的问题在于，每个 entry 要记录前一个节点的长度。如果前面插入了个大元素，后面那个 entry 的 pre_entry_length 字段就得扩容，它一扩容后面的节点又得跟着变，可能触发**连锁更新**，极端情况下整条链都得重写一遍。

Quicklist 就是为了解决这个问题，把一大串数据拆成多个小 Ziplist，每个 Ziplist 控制在一定大小内，连锁更新最多影响一小块，不会波及整个列表。

##### Ziplist 在 Redis 里的应用

**早期（3.2 之前）** Redis 用 Ziplist 来存小规模的 List 和 Hash：

1）List 在元素个数小于 512 个、且每个元素小于 64 字节时，底层用 Ziplist

2）Hash 在filed数量小于 512 对、且每个 field 和 value 都小于 64 字节时，底层也用 Ziplist

这两个阈值可以通过配置调整：

```text
list-max-ziplist-entries 512
list-max-ziplist-value 64
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
```

超过阈值就升级成更复杂的数据结构，List 升级成 LinkedList，Hash 升级成 hashtable。

##### Quicklist 的设计细节

Quicklist 是个双向链表，每个链表节点里装的不是单个元素，而是一整个 Ziplist。这样链表操作是 O(1) 的，同时每个节点内部还享受 Ziplist 的内存紧凑优势。

![img](https://pic.code-nav.cn/mianshiya/question_picture/1772087337535152129/dCNHJ06V_image_mianshiya.webp)

Redis 还支持对 Quicklist 中间节点的 Ziplist 做 LZF 压缩。因为队列两头访问频繁、中间很少碰，把中间的节点压缩掉能再省一波内存。

> 这里主要是因为：当节点元素很多时，真正频繁访问的可能就是头部和尾部的若干元素，中间的很多元素可能并不会过多使用。
>
> 因此为了确保这种情况内存不会被过多消耗，Redis会使用LZF压缩算法，将中间的这些Ziplist/ListPack压缩掉。只保留两端若干个节点为未压缩状态。
>
> 选择LZF的原因在于LZF是一种轻量级的压缩算法
>
> * 压缩速度快
> * 解压速度快
> * 压缩率一半
>
> 因为Redis是基于内存的数据库，需要以压缩和解压的性能为前提，不适合那些用于磁盘的压缩率高但是压缩和解压的速度很慢的算法

![img](https://pic.code-nav.cn/mianshiya/question_picture/1843904816956411905/Q4zCw9Vq_l2M0ZRsBc8_mianshiya.webp)

控制 Quicklist 行为的配置有两个：

```text
list-max-ziplist-size -2
list-compress-depth 0
```

list-max-ziplist-size 控制每个节点内 Ziplist 的大小：

- 正数表示最多存多少个元素
- -1 表示最大 4KB
- -2 表示最大 8KB（默认值）
- -3/-4/-5 分别对应 16KB/32KB/64KB

list-compress-depth 控制两端多少个节点不压缩。0 表示都不压缩，1 表示两端各留 1 个不压缩、中间全压缩。

##### ListPack

ListPack 是 Redis 6.0 引入的一种**紧凑型序列化数据结构**，专门用来替代 ziplist。它把数据直接按字节序列存储，不走 Redis 常规的对象模型，内存占用极低。

Redis 7.0 开始，List、Hash、ZSet 在数据量小的时候底层都改用 ListPack 了，彻底把 ziplist 换掉了。对应的Quicklist每个节点也从ziplist换成了ListPack

ListPack 的结构很简单：

1）header 占 6 字节，前 4 字节存总长度，后 2 字节存元素个数

2）中间是一个个 element 紧挨着排列

3）末尾一个 0xFF 字节标识结束

![img](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/a8tr0m6N_listpack.drawio_mianshiya.webp)

每个 element 内部又分三部分：encoding-type 标记编码方式、element-data 存实际数据、element-tot-len 记录前两部分的总长度。

##### 为什么要使用ListPack替换ZipList？

ziplist 的问题出在它的 entry 结构上。每个 entry 会记录前一个 entry 的长度，用来支持从后往前遍历。这个长度字段是变长的：前一个 entry 小于 254 字节时占 1 字节，大于等于 254 字节时占 5 字节。

假设现在有一串 entry，每个都刚好 253 字节。如果在最前面插入一个 260 字节的新 entry，第二个 entry 记录前一个长度的字段就得从 1 字节扩到 5 字节，这个 entry 变大了，可能导致第三个 entry 也得扩...一路传下去就是连锁更新。最坏情况下时间复杂度是 O(N²)。

> 核心原因在于ziplist这种内存连续的结构，是一次性分配的整体内存。
>
> 而其entry中的关键字段prev_entry_len是变长的，但前一个entry的字节小于254时，占1字节，超过时就会升级到5字节。
>
> 那如果我现在很多节点都是临近254字节，那么如果前面的节点变长了，超过了254字节，后续entry的prev_entry_len就需要扩容。而ziplist的扩容是整体重新分配内存，然后吧数据迁移到新内存，再释放旧内存。并且他的扩容是针对当前节点的判断，如果后面的节点因为前面的节点变了，自己也需要变，那么最坏情况下会进行n次扩容，每次扩容时间复杂度O(n)，因此最快情况下，一个entry的修改可能会导致O(n^2)的时间复杂度

##### ListPack 怎么解决连锁更新的

ListPack 的核心改进：**每个 element 只记录自己的长度，不记录前一个的长度**。

element 的内部结构：

![img](https://pic.code-nav.cn/mianshiya/question_picture/1772087337535152129/udzx3DUu_image_mianshiya.webp)

1）encoding-type：标记编码类型，整数还是字符串，以及具体的编码方式

2）element-data：实际数据

3）element-tot-len：encoding-type + element-data 的总长度

关键在于 element-tot-len 放在元素末尾，而且只记录自己的长度。往前遍历的时候，先读 element-tot-len 往前跳相应字节数就到了这个元素的开头。再往前一字节是上一个元素的 element-tot-len，以此类推。

这样一来，修改任何元素都只影响自己，不会波及后面的元素，连锁更新问题就不存在了。

##### 编码方式

ListPack 用多种编码方式来压缩数据：

1）7 位无符号整数：0-127 的整数只占 1 字节

2）13 位有符号整数：-4096 到 4095 占 2 字节

3）16/24/32/64 位整数：根据数值范围选择合适的编码

4）字符串：短字符串用 6 位长度前缀，长字符串用 12 位或 32 位

这种变长编码让 ListPack 在存储小整数和短字符串时特别省内存。比如存 100 个用户 ID，如果 ID 都在 0-127 范围内，每个只占 2 字节。

##### 和 ziplist 的性能对比

| 维度       | ziplist               | ListPack   |
| ---------- | --------------------- | ---------- |
| 连锁更新   | 存在，最坏 O(N²)      | 不存在     |
| 内存占用   | 略小                  | 略大一点点 |
| 遍历方向   | 双向                  | 双向       |
| 插入复杂度 | 平均 O(N)，最坏 O(N²) | O(N)       |
| 实现复杂度 | 较复杂                | 更简单     |

ListPack 内存占用比 ziplist 稍大一点，因为每个元素都要存自己的长度。但这点开销换来了稳定的 O(N) 插入性能，很值。

##### ListPack 的 element-tot-len 本身也是变长的，怎么知道它占几个字节？

回答：element-tot-len 用的是类似 UTF-8 的变长编码。每个字节的最高位是标志位，1 表示还有后续字节，0 表示结束。从后往前读，一直读到最高位是 0 的字节为止。这样不管 element-tot-len 占几个字节都能正确解析。

##### 为什么ZipList/ListPack只被用来存储少量数据？大量数据还是要替换成QuickList

因为无论是ZipList还是ListPack本质上都是紧凑数组，并不是真正意义上的数组，并没有索引结构。查询元素时只能顺着每个entry一个个跳过去。元素少点还好，多了查询性能就不行了。

并且ZipList和ListPack设计的目的也是因为Redis是内存数组，如果存储少量数据就直接使用链表，那么head和tail两个指针就占用16字节，性能开销比数据本身还大。内存局部性也低。

对于对内存的精细化考量，小数据时使用ZipList或者ListPack通过内存偏移量查询元素，避免指针的开销，且数据量小时性能差异不明显。

当数据量大时，转换成QuickList，即拥有链表的查询性能，也拥有ZipList/ListPack的内存紧密型。并且也减少了指针的使用量。针对链表的一些O(1)的操作，即拥有了提升的性能，又节约了部分指针的呢困开销

##### ZipList和ListPack分别怎么进行遍历

**ZipList**

* 正序遍历：从首地址偏移header（ `zlbytes` (4字节) + `zltail` (4字节) + `zllen` (2字节) ）后到达第一个节点。节点的开头是prev_entry_len，这并不是一个定长的字段。前一个 entry 小于 254 字节时占 1 字节，大于等于 254 字节时占 5 字节。

  * 因此在实际读取这个字段时，会先看第一个字节是< 254还是== 254。前者说明该字段占1字节，后者说明占5字节。然后跳过该字段后，就到了encoding，encoding占1-5字节不等。
  * 一般是判断encoding的前两位，前两位00，代表是encoding占1字节，剩下6位记录长度信息；前两位01，代表encoding占2字节，后14位记录长度信息；encoding10开头，代表占5字节，后4字节记录长度。
  * 无论是00还是01还是10，都代表元素是字符串。若encoding前两位是11，这代表是整数。整数的encoding都是1字节

  解析完encoding后就知道了data的长度，就能跳过当前entry了，来到下一个entry的开头。以此类推

* 反向遍历：通过header中的zltail，直接移动到最后一个entry的起始位置，然后读取头部的prevlen，然后跳过对应字节就可以读取前一个节点的prevlen，以此类推

**ListPack**

* 正序遍历：跳过 Header（`Total Bytes`(4字节) + `Num Elem`(2字节)）。抵达第一个节点，后续也是解析encoding-type，解析的方式和zipList相似，都是先解析开头判断是字符串还是整数，然后读取后面的长度信息，跳过date。（如果0开头表示是7位整数，整个entry包括element-total-len占1字节；若是10，则是字符串，后6位是长度信息；若是110，则也是字符串，后五位 + 1字节是长度信息）。然后跳过element_total_len就到了下一entry的开头
* 反向遍历：从结束标识0xFF开始，就能读到最后一个元素的element-tot-len，然后往前跳相应字节数就到了这个元素的开头。再往前一字节是上一个元素的 element-tot-len，以此类推。

---

#### Hash

Redis 的 Hash 是一种**键值对集合**，能把多个字段和值存在同一个 key 下面，特别适合存对象的属性。比如存用户信息，用 `user:1001` 作为 key，里面放 name、age、city 这些字段，改单个字段不用整体覆盖，比用 String 存 JSON 灵活多了。

Hash 底层有两种编码方式。数据量小的时候用 listpack 存储，紧凑省内存；数据量大了自动切换成 hashtable，查询效率 O(1)。切换阈值默认是 512 个字段（field）或者单个值（field/value）超过 64 字节。

![img](https://pic.code-nav.cn/mianshiya/question_picture/1783388929455529986/eVexIs3Y_hash.drawio_mianshiya.webp)

触发的时机是在执行插入时，会判断当前field个数，以及value的长度是否超过阈值。

具体的转换流程，其实就是遍历整个ziplist/listpack 然后两两entry打包插入hashtable，替换编码，然后释放原来的ziplist/listpack。

因为转换时field最多只有512个，因此O(n)的效率也还行，在接受范围内。但需要注意的是：这个转换过程是单向的，也就是说一旦升级到hashtable后，即便field数降到512以下也不会退回到ziplist/listpack

阈值设置为512的核心原因还是因为：

* 存储小数据时顺序结构内存连续，无指针开销，对cpu cache友好。但当数据量大时，顺序结构的O(n)查询就会变为瓶颈，且限于
* 存储大数据用hash结构，查询更快精确查找O(1)，代价就是使用了链表结构，内存分散，指针开销大

> redis内部的大部分数据结构，其实在小数据时都会采用ziplist/listpack，比如ZSET，HASH，LIST。然后大数据时都会有升级的数据结构，如ZSET：SkipList/HASH，HASH：HashTable，List：QuickList/LinkedList
>
> 其核心原因都是：在内存占用和查询速度之间做平衡。
>
> 小数据量时，由于数据本身较小，如果直接上链表这类数据结构，那么就会导致指针的内存开销比数据本身还大。因此redis才会使用ziplist/listpack这类内存连续的列表，来作为小数据的存储结构。
>
> zpilist/listpack，由于内存连续，通过内存偏移量直接访问元素，无需指针开销，且减少了内存碎片。并且小数据量的顺序结构，对cpu 缓存十分友好，由于缓存局部性，能有更高的缓存命中率。因此数据量很小时顺序结构的O(n)遍历，由于cpu cache，与O(logn)并没有差一个数量级。
>
> 而对于大数据，ziplist/listpack这类数据结构的弊端开始显现，首先就是O(n)的时间复杂度，在数据量大时和O(logn)的差距只会越来越明显。并且当数据量大或者是数据本身比较大时，CPU Cache开始帮不上忙，能缓存的数据越来越少，一次遍历可能需要多次CPU Cache加载。线性遍历的成本急剧上升
>
> 因此Redis的思路就是大数据量时“空间换时间”，比如Hash结构就使用HashTable优化查询速度；ZSET就使用跳表优化遍历以及范围查询的速度，并且使用Hash结构优化单值查询速度；List结构就是用LinkedList升级为双向链表优化头部和尾部的插入删除效率。

##### HashTable的结构

```c
typedef struct dict {
    dictType *type;         // 类型函数指针
    void *privdata;         // 私有数据
    dictht ht[2];           // 两个哈希表（渐进式rehash）
    long rehashidx;         // rehash进度
    unsigned long iterators;// 迭代器数量
} dict;

typedef struct dictht {
    dictEntry **table;      // 哈希桶数组
    unsigned long size;     // 哈希表大小
    unsigned long sizemask; // 大小掩码，值是 size-1
    unsigned long used;     // 已使用的节点数
} dictht;

typedef struct dictEntry {
    void *key;              // 键
    union {
        void *val;
        uint64_t u64;
        int64_t s64;
        double d;
    } v;                    // 值，用联合体节省内存
    struct dictEntry *next; // 链表指针，解决哈希冲突
} dictEntry;
```

几个设计细节：

1）sizemask 永远等于 size-1，计算桶位置用 `hash & sizemask`，比取模快 （前提是数组的长度必须是2次幂）

2）值用联合体存储，如果是整数或浮点数可以直接塞进去，省掉一次指针跳转。如果是一个复杂redis对象，比如字符串，List等等就存指针。

3）哈希冲突用链表法解决，冲突的元素挂在同一个桶的链表上

![img](https://pic.code-nav.cn/mianshiya/question_picture/1783397053004488705/Snipaste_2024-05-15_22-27-32_mianshiya.webp)

##### 渐进式 rehash

Redis 的哈希表扩容不是一次性搬完的，而是分多次慢慢搬，这就是**渐进式 rehash**。

为什么要这么设计？因为 Redis 是单线程的，如果一次性搬几十万个 key，这段时间其他请求全得等着，服务直接卡死。

![img](https://pic.code-nav.cn/mianshiya/question_picture/1843904816956411905/U1DZgn3d_r0J74EMvoo_mianshiya.webp)

具体流程是这样的：

1）触发扩容后，给 ht[1] 分配空间，大小是第一个大于等于 ht[0].used * 2 的 2 次方幂。比如原表的值是 1024，那个其扩容之后的新表大小就是 2048。 

2）把 rehashidx 的值从 -1 设成 0，标记开始 rehash 

3）每次对 Hash 做增删改查，顺便把 rehashidx 对应的桶从 ht[0] 搬到 ht[1]，然后 rehashidx ++ 

4）新插入的数据直接写 ht[1]，查询的时候两个表都要查 

5）搬完之后 ht[0] 和 ht[1] 指针互换，rehashidx 重置为 -1

![img](https://pic.code-nav.cn/mianshiya/question_picture/1772087337535152129/fi0youIX_wecom-temp-170726-8d24749bd759fb281def9afc0a25e3f2_mianshiya.webp)

##### 扩容和缩容的触发条件

扩容看**负载因子**，公式是 `used / size`：

1）负载因子 >= 1 且没在做 RDB/AOF 持久化，触发扩容 

2）负载因子 >= 5，这个时候说明哈希冲突非常严重了，不管有没有持久化，强制扩容

为什么持久化的时候不扩容？因为 RDB 和 AOF 重写会 fork 子进程，用了写时复制机制。这时候如果父进程大量修改内存，会产生大量内存拷贝，所以尽量避免。

缩容是负载因子 < 0.1 时触发，新表大小是第一个大于等于 used 的 2 次方幂。例如老表的 used = 1000，那么新表的大小就是 1024。同样，持久化期间不缩容。

缩容的流程和扩容类似，都是渐进式rehash：

1. 创建新表ht[1]，大小通常是第一个大于used的2次幂
2. 每次执行增删改查时，顺便把ht[0]里面的部分旧数据迁移到ht[1]中
3. 数据迁移完后，释放ht[0]的内存，并替换指针
4. 对于缩容期间的读写，依旧是写就先写ht[1]，查就先查ht[0]，查不到再查ht[1]

##### Hash 和 String 存 JSON 相比，各有什么优缺点？

Hash 的优势是能单独改某个字段，不用整个对象读出来改完再写回去，省网络带宽也省 CPU。缺点是不支持嵌套结构，只能存一层键值对。String 存 JSON 能存复杂嵌套结构，但改单个字段得整体覆盖。一般对象属性平铺的用 Hash，结构复杂的用 String 存 JSON。

##### 渐进式 rehash 期间，读写操作是怎么处理的？

写操作直接写到新表 ht[1]，保证新数据不会被搬两次。读操作先查 ht[0]，没找到再查 ht[1]。删除和更新也是两个表都要检查。每次操作完顺便搬一个桶，所以 rehash 期间每个请求会稍微慢一点，但不会出现长时间阻塞。

##### 为什么扩容是 2 倍而不是 1.5 倍？

因为哈希表大小必须是 2 的幂次，这样计算桶位置可以用位运算 `hash & (size-1)` 代替取模，效率高很多。2 倍扩容刚好还是 2 的幂次。另外 2 倍扩容时，原来的元素要么在原位置，要么在原位置 + 原大小的位置，只用看 hash 值新增的那一位是 0 还是 1，迁移逻辑也简单。

##### 为什么在有RDB/AOF持久化时不会做扩容/缩容？

因为 RDB 和 AOF 重写会 fork 子进程，用了写时复制机制。这时候如果父进程大量修改内存，会产生大量内存拷贝，所以尽量避免。

##### 为什么Hash结构扩容时，会有一个负载因子>=5这么一个看似很奇怪的数字？毕竟Java的HashMap负载因子也才0.75

这其实是因为Redis持久化的锅。

正常情况下Redis在进行持久化时，Hash结构即便需要扩容，也不会在这时候扩容。

因为在做RDB/AOF持久化时，采用了copy on write写时复制的技术。正常情况下在做持久化时会fork出一个子进程来做，主进程依旧正常对外处理读写操作。为了提升fork的速度，redis并不是完全复制一个一模一样的子进程出来，而是只复制关键部分。对于数据部分，子进程仅仅只是复制了页表，但映射的还是同一个物理内存。当父进程执行写命令时，会将对应的物理内存的页复制一份，并让自己的页表映射到这个页上，然后对副本进行修改。此时子进程指向的还是老的页，因此数据没有变化。

而RDB和AOF的持久化过程可能会持续若干秒，在此期间如果遇到业务高峰期，主进程执行了大量的HSET或者HMSET操作。就很有可能导致哈希表被塞满了。

正常的塞满redis不会处理，因为如果在持久化期间处理扩容/缩容，那么就会导致主进程进行大量的页复制，对内存的消耗极大。最坏的可能就是近乎翻倍（即几乎所有的数据页都被复制）。那就很容易导致系统出现OOM。

只有当used/size >= 5时，这个值一般遇不到。但一旦遇到说明此时的hash冲突已经非常严重了。负载因子达到5就说明平均每个bucket至少有5个节点。意味着查询操作可能需要遍历5次内存地址

---

#### IntSet

> 当Set里元素全是整数且元素个数小于512时使用IntSet；当元素超过512，或者元素的类型不再只是整数时，会升级为HashTable

IntSet是Redis中set集合在数据量较小时且存储的数据都为整数时，所使用的一种数据结构。基于整数数组实现，并具备长度可变，有序等特性

```c
typedef struct intset{
  uint32_t encoding;		// 编码方式，支持16，32，64位整数
  uint32_t length;		  // 元素个数
  int8_t contents[];		// 整数数组，保存集合数据
}
```

IntSet通过encoding设置contents数组中每个元素的大小，因此在遍历contents数组时，除去header也就是encoding和length占用的8字节，那么contents里每个元素都占相同的字节数。（具体多少看encoding的值）在遍历元素时就可以通过内存偏移量来移动，因为是顺序存储的，避免了指针的开销。

##### IntSet扩容

但元素过多，或者是encoding发生改变时，IntSet会执行扩容逻辑。

IntSet扩容的内存申请使用的是zrealloc（基于realloc）会先尝试在当前数组的基础上申请连续内存。

对于encoding发生变化时，会倒叙将原有数据更新为新的字节大小，主要是防止正序会覆盖后面的元素。

如果没有在当前数组的基础上申请到连续内存才会申请新的内存空间，整体拷贝过去

---











