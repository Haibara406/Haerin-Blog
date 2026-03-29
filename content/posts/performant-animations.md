---
title: "Building Performant Web Animations"
date: "2024-03-10"
excerpt: "A deep dive into creating smooth, performant animations that enhance rather than hinder user experience."
tags: ["Performance", "Animation", "CSS"]
category: "Frontend"
---

Animation on the web can be magical—or it can be a performance nightmare. The difference lies in understanding how browsers render and what triggers expensive operations.

## The 60fps Target

Smooth animation means hitting 60 frames per second, giving you just 16.67ms per frame. Miss that window, and users perceive jank. The key is working with the browser's rendering pipeline, not against it.

## Stick to Transform and Opacity

These two properties are your best friends for performant animation:

```css
.element {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.element:hover {
  transform: translateY(-4px);
  opacity: 0.8;
}
```

Why? Because `transform` and `opacity` can be handled entirely on the GPU, bypassing expensive layout and paint operations.

## Avoid Layout Thrashing

Reading layout properties (like `offsetHeight`) and then immediately writing them causes forced synchronous layout—one of the biggest performance killers:

```javascript
// Bad: causes layout thrashing
elements.forEach(el => {
  const height = el.offsetHeight; // read
  el.style.height = height + 10 + 'px'; // write
});

// Good: batch reads and writes
const heights = elements.map(el => el.offsetHeight);
elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + 'px';
});
```

## Use will-change Sparingly

The `will-change` property tells the browser to optimize for upcoming changes, but overuse creates memory overhead:

```css
.element {
  /* Only add when animation is imminent */
  will-change: transform;
}
```

Remove it after the animation completes.

## Intersection Observer for Scroll Animations

Instead of listening to scroll events (which fire constantly), use Intersection Observer to trigger animations when elements enter the viewport:

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate');
    }
  });
});

elements.forEach(el => observer.observe(el));
```

## Conclusion

Great animation feels effortless because it is effortless—for the browser. By understanding the rendering pipeline and choosing the right techniques, you can create delightful experiences that never compromise performance.
