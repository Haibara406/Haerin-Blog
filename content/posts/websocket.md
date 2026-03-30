---
title: websocket
date: '2026-03-01'
excerpt: 介绍WebSocket协议的握手流程、帧格式、与HTTP轮询的对比，以及心跳保活机制。
tags:
  - WebSocket
  - Network
category: Computer Network
---

### Websocket

Websocket其实就是客户端和服务端能在一条tcp连接下进行全双工通信的一种协议。

他和Http的区别就在于：Http时请求-响应模型，必须有客户端发起请求，然后服务端才能够响应。并且响应之后连接就断了，下次请求有需要重新建立连接。

在早期想应对一些实时性比较高的场景的时候，就会采用轮训的方式，也就是客户端不断对服务端发请求，询问服务端是否有数据。他的问题就在于每次都会建立连接，如果没数据那连接就白建立了。而且频繁的发起请求也会对服务端造成一定压力。

因此后续引入了长轮询的优化，他主要就是客户端发起请求后服务端不需要马上回复，而是有数据时或者是请求超时时才回复，先将请求挂起。这在一定程度上减少了对服务端的压力，但在本质上还是得客户端主动去问服务端是否有数据，而服务端无法主动推送数据给客户端。

因此有了Websocket协议，他复用了Http握手的流程，第一次还是走Http，并带上一些请求头，告诉服务端要求升级协议，服务端同意后响应101，然后整个TCP连接就切换到了Websocket协议，方可以随时推送数据，连接一直保持着，省掉了反复建连的开销。

#### Websocket握手流程

WebSocket 握手其实就是借 HTTP 的壳来完成协议切换，整个过程就一个来回。

客户端先发一个 HTTP GET 请求，路径就是 WebSocket 的地址，关键是要带上这几个头：

```http
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

`Sec-WebSocket-Key` 是客户端随机生成的 Base64 字符串，服务器收到后会拿它和一个固定的 GUID 拼接，做一次 SHA-1 哈希再 Base64 编码，得到 `Sec-WebSocket-Accept` 返回给客户端。这个机制的目的是防止一些不支持 WebSocket 的代理服务器误把普通 HTTP 请求当成 WebSocket 连接。因为在早期有些服务器或者是代理服务器不支持Websocket协议，就把这个Http请求当做了普通的Http请求处理。

服务器同意升级就返回：

```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

握手完成后，底层 TCP 连接不断，但上层协议已经从 HTTP 切到 WebSocket 了。

#### 帧格式和数据传输

WebSocket 的数据传输不是裸的 TCP 流，它有自己的帧格式。每个帧的头部包含几个关键字段：

1）FIN 位表示这是不是消息的最后一帧，WebSocket 支持把大消息拆成多帧发送

2）Opcode 标识帧类型，0x1 是文本帧，0x2 是二进制帧，0x8 是关闭帧，0x9 是 Ping，0xA 是 Pong

3）Mask 位和 Masking-Key 用于数据掩码，规范要求客户端发给服务器的数据必须掩码，服务器发给客户端的不用。这个设计是为了防止恶意客户端构造特定字节序列骗过中间代理的缓存

4）Payload Length 表示数据长度，小于 126 字节直接用 7 位表示，126-65535 用后续 2 字节，更大的用 8 字节

### 心跳保活

WebSocket 连接建立后，如果长时间没有数据传输，中间的 NAT 设备或者防火墙可能会把连接干掉。所以需要心跳机制来保活。

WebSocket 协议内置了 Ping/Pong 帧，客户端或服务器可以定期发 Ping，对方收到后必须回 Pong。实际开发中，很多框架会自动处理这个，比如 Spring WebSocket 默认 25 秒发一次心跳。

业务层也可以自己实现心跳，比如每 30 秒发一个 `{"type":"ping"}` 的业务消息，收到 `{"type":"pong"}` 就认为连接正常。这种方式更灵活，可以顺带传一些业务状态。





