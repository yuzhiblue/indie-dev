---
title: 'MoonQdrant — Qdrant Vector Database Client for MoonBit'
description: 'A MoonBit client library for the Qdrant vector database, mapping REST endpoints 1:1: vector search, named vectors, typed filter DSL, Query API, shard cluster ops and snapshot management — completing the RAG infrastructure story for the MoonBit ecosystem.'
pubDate: 2026-10-27
updatedDate: 2026-10-27
tags: ['MoonBit', 'Open Source', 'Vector Database', 'RAG', 'Client Library']
featured: false
github: 'https://github.com/yuzhiblue/moon-qdrant'
lang: 'en'
i18nKey: 'moon-qdrant'
draft: false
---

## Overview

MoonQdrant is a MoonBit client library for the Qdrant vector database.

Qdrant is one of the most widely used vector databases for RAG and vector search. The MoonBit ecosystem already had vector engines and servers, but no client for talking to a running Qdrant service — moon-qdrant fills that gap: the API is small and explicit, mapping 1:1 to Qdrant REST endpoints, with HTTP transport built on `oboard/mio`.

## Installation

```bash
moon add yuzhiblue/moon-qdrant
```

Spin up a local Qdrant server with Docker:

```bash
docker run -p 6333:6333 qdrant/qdrant
```

## Quick Start

```moonbit
let client = QdrantClient::new("http://localhost:6333")

// create a 4-dimension cosine collection
client.create_collection(
  "demo",
  CollectionConfig::new(VectorParams::new(4, Distance::Cosine)),
)

// upsert points (ids beyond 32 bits are supported)
client.upsert_points("demo", [
  PointStruct::new(1, [0.1, 0.2, 0.3, 0.4], { "tag": "alpha" }),
  PointStruct::new(2, [0.5, 0.6, 0.7, 0.8], { "tag": "beta" }),
])

// similarity search + conditional filtering
let hits = client.search_points("demo", [0.1, 0.2, 0.3, 0.4], limit=2)
let filtered = client.search_points(
  "demo", [0.1, 0.2, 0.3, 0.4], limit=2,
  filter={ "must": [{ "key": "tag", "match": { "value": "alpha" } }] },
)
```

## Core Capabilities

- **Full endpoint coverage**: health check, collection management, point CRUD, search, batch operations, scroll pagination, count — 30+ REST endpoints implemented
- **Named vectors**: store multiple vectors per point (e.g. text / image); select the search channel via `using_vector` or a `NamedVector`
- **Advanced search**: score threshold, offset pagination, HNSW tuning / exact search, batch search (one round trip), grouped search
- **Query API**: nearest-neighbor queries, positive/negative example recommendations (recommend), facet counting by payload field
- **Typed filter DSL**: `Filter::new().must(Condition::match_keyword("tag", "alpha"))` — stop hand-assembling JSON
- **Payload management**: set / overwrite / delete by keys, accelerated by payload indexes
- **Cluster operations**: cluster status, shard replication and replica operations, service write locks, snapshot management
- **Extensible**: a unified `VectorProvider` trait, ready to adapt to other vector services

## Engineering Quality

- Unit tests cover models and JSON conversion; CI starts a real Qdrant container and runs integration tests asserting every client method end to end
- Ships with `REPRODUCIBILITY.md` covering environment setup, demo replay, expected output and troubleshooting — everything reproducible

## Links

- GitHub repository: https://github.com/yuzhiblue/moon-qdrant

## License

Apache-2.0
