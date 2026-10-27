---
title: 'MoonQdrant — Qdrant 向量数据库 MoonBit 客户端'
description: 'Qdrant 向量数据库的 MoonBit 客户端库，REST 端点 1:1 对应：向量搜索、命名向量、类型化过滤 DSL、Query API、分片集群、快照管理，为 MoonBit 生态补上 RAG 基建的一环。'
pubDate: 2026-10-27
updatedDate: 2026-10-27
tags: ['MoonBit', '开源', '向量数据库', 'RAG', '客户端库']
featured: false
github: 'https://github.com/yuzhiblue/moon-qdrant'
lang: 'zh'
i18nKey: 'moon-qdrant'
draft: false
---

## 简介

MoonQdrant 是 Qdrant 向量数据库的 MoonBit 客户端库。

Qdrant 是 RAG 和向量搜索领域最常用的向量数据库之一。MoonBit 生态此前已有向量引擎和服务端，但缺少与运行中的 Qdrant 服务通信的客户端——moon-qdrant 补上了这一环：API 小而明确，与 Qdrant REST 端点 1:1 对应，底层基于 `oboard/mio` 做 HTTP 传输。

## 安装

```bash
moon add yuzhiblue/moon-qdrant
```

用 Docker 启动一个本地 Qdrant 服务即可开玩：

```bash
docker run -p 6333:6333 qdrant/qdrant
```

## 快速上手

```moonbit
let client = QdrantClient::new("http://localhost:6333")

// 创建 4 维余弦相似度集合
client.create_collection(
  "demo",
  CollectionConfig::new(VectorParams::new(4, Distance::Cosine)),
)

// 写入点（支持超过 32 位的大 id）
client.upsert_points("demo", [
  PointStruct::new(1, [0.1, 0.2, 0.3, 0.4], { "tag": "alpha" }),
  PointStruct::new(2, [0.5, 0.6, 0.7, 0.8], { "tag": "beta" }),
])

// 相似度搜索 + 条件过滤
let hits = client.search_points("demo", [0.1, 0.2, 0.3, 0.4], limit=2)
let filtered = client.search_points(
  "demo", [0.1, 0.2, 0.3, 0.4], limit=2,
  filter={ "must": [{ "key": "tag", "match": { "value": "alpha" } }] },
)
```

## 核心能力

- **完整端点覆盖**：健康检查、集合管理、点读写、搜索、批量操作、scroll 分页、count，30+ REST 端点全部实现
- **命名向量**：一个点存多套向量（如 text / image），`using_vector` 或 `NamedVector` 指定搜索通道
- **高级搜索**：分数阈值、分页 offset、HNSW 调优 / 精确搜索、批量搜索（一次往返）、分组搜索
- **Query API**：最近邻查询、正负例推荐（recommend）、facet 按 payload 字段计数
- **类型化过滤 DSL**：`Filter::new().must(Condition::match_keyword("tag", "alpha"))`，告别手拼 JSON
- **Payload 管理**：设置 / 覆盖 / 按键删除，配合 payload 索引加速过滤
- **集群运维**：集群状态、分片复制与副本操作、服务写锁、快照管理
- **可扩展**：统一的 `VectorProvider` trait，后续可适配其他向量服务

## 工程质量

- 单元测试覆盖模型与 JSON 转换；CI 中启动真实 Qdrant 容器跑集成测试，端到端断言所有客户端方法
- 提供 `REPRODUCIBILITY.md`，环境搭建、演示复跑、预期输出、故障排查全流程可复现

## 链接

- GitHub 仓库：https://github.com/yuzhiblue/moon-qdrant

## 开源协议

Apache-2.0
