const { default: React } = await import('react');
const { default: ColorPalette } = await import('@/utils/color');

export function FormatScore({ score }: { score: number }) {
  let v: string;
  let needTitle = false;
  if (!isFinite(score)) v = 'N/A';
  else if (score === +Infinity) v = '∞';
  else if (score === -Infinity) v = '-∞';
  else {
    const abs = Math.abs(score);
    if (abs >= 1e5) {
      const s = score.toExponential(1);
      v = s.replace('e+', 'e');
      needTitle = true;
    } else v = String(score);
  }
  return <span title={needTitle ? String(score) : undefined}>{v}</span>;
}

export function ColoredScore({ score, full }: { score: number; full: number }) {
  const color =
    score >= full * 0.8
      ? ColorPalette['green-3']
      : score >= full * 0.6
        ? ColorPalette['yellow-3']
        : score >= full * 0.3
          ? ColorPalette['orange-3']
          : ColorPalette['red-3'];
  return (
    <span style={{ color }}>
      <FormatScore score={score} />
    </span>
  );
}
