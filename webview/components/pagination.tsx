const { default: React } = await import('react');
import './pagination.css';

type Props = {
  current: number;
  total: number;
  onChange: (page: number) => void;
  className?: string;
};

// 生成页码：在 current 的 [-3, +3] 范围内特殊处理（全部列出），其它按 2^k-1 的倍增偏移生成
function generatePages(current: number, total: number): number[] {
  const pages = new Set<number>();

  // 总是包含 1 和 total（方便导航）
  pages.add(1);
  pages.add(total);

  // 特殊处理：current -3 .. current +3
  for (let p = current - 3; p <= current + 3; p++) {
    if (p >= 1 && p <= total) pages.add(p);
  }

  // 按倍增(2^k - 1) 添加两侧页码：7,15,31,... (k = 3,4,5,...)
  for (let k = 3; k < 32; k++) {
    const offset = (1 << k) - 1;
    const left = current - offset;
    const right = current + offset;

    let added = false;
    if (left >= 1 && left <= total) {
      pages.add(left);
      added = true;
    }
    if (right >= 1 && right <= total) {
      pages.add(right);
      added = true;
    }

    // 如果这个偏移对两侧都没有贡献，且偏移已经超出 total，认为后续更大的偏移也不会有贡献，停止循环
    if (!added && offset > total) break;
  }

  const arr = Array.from(pages);
  arr.sort((a, b) => a - b);
  return arr;
}

export default function Pagination({
  current,
  total,
  onChange,
  className
}: Props) {
  if (total <= 1) return null;

  const pages = generatePages(current, total);

  const goto = (p: number) => {
    const page = Math.min(Math.max(1, p), total);
    if (page !== current) onChange(page);
  };

  return (
    <nav className={className} aria-label="pagination">
      <ul className="pagination">
        {pages.map(item => (
          <li
            key={item}
            className={`page-item ${item === current ? 'active' : ''}`}
          >
            <button className="page-link" onClick={() => goto(item)}>
              {item}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
