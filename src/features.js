// Turns MediaPipe blendshape categories into a fixed-length numeric vector.
// The order is the sorted category names, so recording and inference always align.

export function featureNamesFrom(categories) {
  return categories.map((c) => c.categoryName).sort()
}

export function toVector(categories, names) {
  const m = {}
  for (const c of categories) m[c.categoryName] = c.score
  return names.map((n) => m[n] || 0)
}
