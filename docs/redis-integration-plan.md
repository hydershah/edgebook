# Redis Integration Plan for EdgeBook

## Overview
This document outlines the comprehensive plan for integrating Redis into the EdgeBook application for caching, session management, and rate limiting.

## Current State Analysis

### Architecture
- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT sessions (30-day expiry)
- **Payment Processing**: Whop
- **API Routes**: 68+ REST endpoints in `/app/api`

### Current Performance Issues
- In-memory caching (Map) that resets on server restart
- Not shared across multiple instances
- No rate limiting implemented
- Expensive database queries on every request
- No session invalidation capability

## Implementation Phases

### Phase 1: Foundation Setup
**Timeline**: Day 1-2

#### 1.1 Install Dependencies
```bash
npm install ioredis
npm install --save-dev @types/ioredis
```

#### 1.2 Create Redis Connection (`/lib/redis.ts`)
```typescript
import { Redis } from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export const redis = globalForRedis.redis ?? new Redis(process.env.REDIS_URL)

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis
```

#### 1.3 Create Cache Service (`/lib/services/cache/cache.service.ts`)
- Implement get, set, delete, invalidate methods
- Add JSON serialization/deserialization
- Include error handling and fallback to database

### Phase 2: Quick Wins - Replace Existing Caches
**Timeline**: Day 2-3

#### 2.1 Update `/api/picks/trending`
- **Current**: In-memory Map cache (2 min TTL)
- **New**: Redis cache with key pattern `trending:{algorithm}:{sport}:{limit}`
- **Impact**: HIGH - Homepage/feed queries

#### 2.2 Update `/api/admin/analytics`
- **Current**: In-memory Map cache (5 min TTL)
- **New**: Redis cache with key pattern `analytics:{days}`
- **Impact**: MEDIUM - Admin dashboard

### Phase 3: High-Impact Caching
**Timeline**: Week 1

#### 3.1 Cache Pick Stats (`/api/picks/stats`)
- **Problem**: 8 separate Prisma queries per request
- **Solution**: Cache individual pick stats
- **Key Pattern**: `pick:{pickId}:stats`
- **TTL**: 1-2 minutes
- **Impact**: CRITICAL - Called for every pick in feeds

#### 3.2 Cache Top Creators (`/api/users/top-creators`)
- **Problem**: Expensive win-rate calculations
- **Solution**: Cache computed results
- **Key Pattern**: `top-creators`
- **TTL**: 10 minutes
- **Impact**: HIGH - Displayed on every page

#### 3.3 Cache User Profiles
- **Routes**: `/api/profile`, `/api/creator/stats`
- **Key Pattern**: `user:{userId}:profile`, `user:{userId}:stats`
- **TTL**: 5-15 minutes
- **Impact**: HIGH - Frequently accessed

### Phase 4: Security - Rate Limiting
**Timeline**: Week 1-2

#### 4.1 Create Rate Limiter Service
```typescript
// /lib/services/rate-limiter/rate-limiter.service.ts
class RateLimiterService {
  async checkLimit(key: string, limit: number, window: number): Promise<boolean>
  async incrementAndCheck(key: string, limit: number, window: number): Promise<{ allowed: boolean, remaining: number }>
}
```

#### 4.2 Protect Critical Endpoints
| Endpoint Category | Rate Limit | Window |
|------------------|------------|---------|
| Auth routes (`/api/auth/*`) | 5 attempts | 15 minutes |
| Purchase routes | 10 requests | 1 minute |
| User actions (like, follow) | 30 requests | 1 minute |
| Email sending | 3 requests | 1 hour |

### Phase 5: Advanced Features (Optional)
**Timeline**: Week 2-4

#### 5.1 Session Management with Redis
- Migrate from JWT-only to Redis-backed sessions
- Enable instant session invalidation
- Track active sessions per user
- Implement device management

#### 5.2 Real-time Features
- Redis Pub/Sub for notifications
- Live pick updates
- Real-time follower counts

#### 5.3 View Count Buffering
- Buffer view counts in Redis
- Flush to database periodically
- Reduce database writes

## Cache Key Patterns

### User-related
- `user:{userId}:profile` - User profile data
- `user:{userId}:stats` - Creator statistics
- `user:{userId}:winrate` - Win rate calculations
- `user:{userId}:followers` - Follower list
- `user:{userId}:following` - Following list
- `user:{userId}:purchases` - Purchased picks (Set)

### Pick-related
- `pick:{pickId}:stats` - Engagement stats (likes, comments, views)
- `pick:{pickId}:views` - View count buffer

### Feed & Trending
- `trending:{algorithm}:{sport}:{limit}` - Trending picks
- `leaderboard:winrate:{timeframe}` - Win rate leaderboard
- `top-creators` - Top creators list

### Analytics
- `analytics:{days}` - Admin analytics data

### Rate Limiting
- `ratelimit:{endpoint}:{userId|ip}:{window}` - Rate limit counters

## Cache Invalidation Strategy

### Time-based (TTL)
- Analytics: 5 minutes
- Trending: 2 minutes
- User profiles: 5-15 minutes
- Pick stats: 1-2 minutes
- Leaderboards: 15-30 minutes

### Event-based Invalidation
| Event | Keys to Invalidate |
|-------|-------------------|
| Profile updated | `user:{userId}:*` |
| New purchase | `user:{userId}:purchases`, `pick:{pickId}:stats` |
| Follow/unfollow | `user:{userId}:following`, `user:{targetId}:followers` |
| Pick status changed | `user:{userId}:winrate`, leaderboards |
| New like/comment | `pick:{pickId}:stats` |

## Environment Variables

Add to `.env`:
```env
# Redis Configuration (from Railway)
REDIS_URL="redis://default:password@host:port"

# Optional individual components
REDIS_HOST="your-redis-host"
REDIS_PORT="6379"
REDIS_PASSWORD="your-password"

# Cache Configuration
CACHE_ENABLED="true"
CACHE_DEFAULT_TTL="300"  # 5 minutes in seconds
```

## Performance Metrics to Track

### Cache Performance
- Cache hit rate (target: >80%)
- Cache miss rate
- Average response time (before/after caching)
- Redis memory usage
- Key expiration patterns

### Rate Limiting
- Requests blocked per endpoint
- Top users hitting limits
- False positive rate

## Testing Strategy

1. **Unit Tests**: Cache service methods
2. **Integration Tests**: API routes with caching
3. **Load Tests**: Verify performance improvements
4. **Failover Tests**: Redis connection failures
5. **Cache Invalidation Tests**: Verify proper invalidation

## Rollback Plan

1. **Feature flags**: Use `CACHE_ENABLED` environment variable
2. **Graceful degradation**: Fall back to database on Redis errors
3. **Monitoring**: Track error rates and performance
4. **Quick disable**: Single environment variable to disable all caching

## Expected Outcomes

### Performance Improvements
- **50-70% reduction** in database queries for trending/feed endpoints
- **80-90% faster** response times for cached endpoints
- **Horizontal scalability** - cache shared across instances
- **Reduced database load** - especially during peak times

### Security Improvements
- **Protection against abuse** with rate limiting
- **Prevention of brute force** attacks on auth endpoints
- **Resource protection** from spam and DOS attempts

### User Experience
- **Faster page loads** - especially for feeds and profiles
- **Consistent performance** - even under high load
- **Better reliability** - reduced database bottlenecks

## Monitoring & Alerts

Set up monitoring for:
- Redis connection status
- Cache hit/miss ratios
- Memory usage (warn at 80%, critical at 95%)
- Rate limit violations
- Response time improvements
- Error rates

## Future Enhancements

1. **Cache Warming**: Pre-populate cache for popular content
2. **Smart Invalidation**: Use Redis keyspace notifications
3. **Multi-tier Caching**: L1 (in-memory) + L2 (Redis)
4. **GraphQL Integration**: Cache at resolver level
5. **CDN Integration**: Cache static content at edge

## References

- [ioredis Documentation](https://github.com/redis/ioredis)
- [Redis Best Practices](https://redis.io/docs/management/optimization/)
- [Next.js Caching Strategies](https://nextjs.org/docs/app/building-your-application/caching)
- [Railway Redis Documentation](https://docs.railway.app/databases/redis)