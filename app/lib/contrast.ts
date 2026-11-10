/** Calculates WCAG text contrast from concrete sRGB channel triples. */
export function contrastRatio(first: number[], second: number[]): number {
  const luminance = (channels: number[]) =>
    channels
      .slice(0, 3)
      .map((c) => c / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
      .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
  const a = luminance(first),
    b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** A measured state is distinct from states or textured paint that were not checked. */
export interface ContrastCheck {
  label: string;
  state: string;
  ratio: number | null;
  required: number;
}

/** Turns a measured pair into a plain-language result with its actual threshold. */
export function describeContrast(check: ContrastCheck): string {
  if (check.ratio === null)
    return `Unverified · ${check.label} · ${check.state} · textured, transparent, or unresolved paint`;
  return `${check.ratio >= check.required ? "Pass" : "Needs attention"} · ${check.label} · ${check.state} · ${check.ratio.toFixed(2)}:1 (target ${check.required}:1)`;
}

/** Parses browser-computed RGB paint, rejecting unresolved or unsupported color spaces. */
function rgb(value: string): number[] | null {
  if (!/^rgba?\(/.test(value)) return null;
  const channels = value.match(/[\d.]+/g)?.map(Number);
  return channels && channels.length >= 3
    ? [...channels.slice(0, 3), channels[3] ?? 1]
    : null;
}

/** Measures actual solid text/background pairs; image, gradient and uncertain paint stay unverified. */
export function measureContrast(
  root: HTMLElement,
  state = "normal",
  target?: HTMLElement,
): ContrastCheck[] {
  const elements = target
    ? [target]
    : Array.from(
        root.querySelectorAll<HTMLElement>(
          "h1,h2,p,label,button,a,input,select",
        ),
      );
  return elements
    .filter(
      (e) =>
        e.getClientRects().length &&
        (e.textContent?.trim() ||
          e.getAttribute("aria-label") ||
          e instanceof HTMLInputElement),
    )
    .slice(0, 60)
    .map((element) => {
      const styles = getComputedStyle(element);
      const font = parseFloat(styles.fontSize);
      const required =
        font >= 24 || (font >= 18.66 && Number(styles.fontWeight) >= 700)
          ? 3
          : 4.5;
      const label = (
        element.getAttribute("aria-label") ||
        (element as HTMLInputElement).value ||
        element.textContent ||
        element.tagName
      )
        .trim()
        .slice(0, 65);
      let background: number[] = [255, 255, 255];
      let unresolved = false;
      const layers: number[][] = [];
      for (
        let node: HTMLElement | null = element;
        node;
        node = node.parentElement
      ) {
        const computed = getComputedStyle(node);
        if (
          computed.backgroundImage !== "none" ||
          computed.mixBlendMode !== "normal" ||
          Number(computed.opacity) < 1
        ) {
          unresolved = true;
          break;
        }
        const color = rgb(computed.backgroundColor);
        if (!color) {
          unresolved = true;
          break;
        }
        layers.push(color);
        if (color[3] === 1) break;
      }
      for (const layer of layers.reverse())
        background = background.map(
          (c, i) => layer[i] * layer[3] + c * (1 - layer[3]),
        );
      const foreground = rgb(styles.color);
      const ratio =
        unresolved || !foreground
          ? null
          : contrastRatio(
              foreground
                .slice(0, 3)
                .map(
                  (c, i) =>
                    c * foreground[3] + background[i] * (1 - foreground[3]),
                ),
              background,
            );
      return { label, state, ratio, required };
    });
}
