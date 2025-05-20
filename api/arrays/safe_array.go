package arrays

import (
	"slices"
	"sync"
)

type SafeArray[T any] struct {
	mu    sync.RWMutex
	items []T
}

func (a *SafeArray[T]) Add(item T) {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.items = append(a.items, item)
}

func (a *SafeArray[T]) GetAll() []T {
	a.mu.RLock()
	defer a.mu.RUnlock()
	return slices.Clone(a.items)
}

func (a *SafeArray[T]) Len() int {
	a.mu.RLock()
	defer a.mu.RUnlock()
	return len(a.items)
}
func (a *SafeArray[T]) Clear() {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.items = []T{}
}

func (a *SafeArray[T]) Slice(from int, to int) {
	a.mu.Lock()
	defer a.mu.Unlock()
	if from < 0 || to > len(a.items) || from > to {
		return
	}
	a.items = append(a.items[:from], a.items[to:]...)
}
