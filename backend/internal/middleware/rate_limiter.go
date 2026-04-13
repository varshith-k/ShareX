package middleware

import (
	"net"
	"net/http"
	"sync"
	"time"
)

type visitor struct {
	lastSeen time.Time
	tokens   int
}

var (
	visitors = make(map[string]*visitor)
	mu       sync.Mutex
	rate     = 5                // max 5 requests
	interval = 1 * time.Minute // per minute
)

func getVisitor(ip string) *visitor {
	mu.Lock()
	defer mu.Unlock()

	v, exists := visitors[ip]
	if !exists {
		v = &visitor{
			lastSeen: time.Now(),
			tokens:   rate,
		}
		visitors[ip] = v
	}

	return v
}

func RateLimiter(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		ip, _, _ := net.SplitHostPort(r.RemoteAddr)
		v := getVisitor(ip)

		mu.Lock()

		// refill tokens based on time passed
		if time.Since(v.lastSeen) > interval {
			v.tokens = rate
			v.lastSeen = time.Now()
		}

		if v.tokens <= 0 {
			mu.Unlock()
			http.Error(w, "Too many requests, please try again later", http.StatusTooManyRequests)
			return
		}

		v.tokens--
		mu.Unlock()

		next.ServeHTTP(w, r)
	})
}