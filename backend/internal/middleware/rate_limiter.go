package middleware

import (
	"net"
	"net/http"
	"sync"
	"time"
)

type visitor struct {
	tokens   int
	lastSeen time.Time
}

var (
	visitors = make(map[string]*visitor)
	mu       sync.Mutex

	maxRequests = 5
	window      = 1 * time.Minute
)

func getVisitor(ip string) *visitor {
	mu.Lock()
	defer mu.Unlock()

	v, exists := visitors[ip]
	if !exists {
		v = &visitor{
			tokens:   maxRequests,
			lastSeen: time.Now(),
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

		if time.Since(v.lastSeen) > window {
			v.tokens = maxRequests
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