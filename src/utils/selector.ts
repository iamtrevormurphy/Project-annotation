export function generateSelector(el: Element): string {
  const parts: string[] = []
  let current: Element | null = el

  while (current && current.tagName !== 'BODY') {
    if (current.id) {
      parts.unshift(`#${CSS.escape(current.id)}`)
      break
    }

    let part = current.tagName.toLowerCase()

    const testId = current.getAttribute('data-testid')
    const ariaLabel = current.getAttribute('aria-label')

    if (testId) {
      part += `[data-testid="${CSS.escape(testId)}"]`
    } else if (ariaLabel) {
      part += `[aria-label="${CSS.escape(ariaLabel)}"]`
    } else {
      // Keep stable class names — filter out CSS module hashes (e.g. _abc12) and emotion (css-xxx)
      const stable = Array.from(current.classList).filter(
        c => !/__[a-zA-Z0-9]{4,}$/.test(c) && !/^css-/.test(c)
      )
      if (stable.length > 0) {
        part += stable.slice(0, 2).map(c => `.${CSS.escape(c)}`).join('')
      }
    }

    const parent = current.parentElement
    if (parent) {
      const sameSiblings = Array.from(parent.children).filter(
        c => c.tagName === current!.tagName
      )
      if (sameSiblings.length > 1) {
        part += `:nth-of-type(${sameSiblings.indexOf(current) + 1})`
      }
    }

    parts.unshift(part)
    current = current.parentElement
  }

  return parts.join(' > ')
}
