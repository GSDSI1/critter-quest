/** 0=grass 1=path 2=tall-grass 3=water 4=tree 5=wall 6=floor 7=door 8=roof 9=heal-pad 10=sign 11=flower 12=rock 13=bridge 14=fence 15=sand 16=cave-floor 17=cave-wall 18=mart-counter */

export function t(rows: string[]): number[] {
  const map: Record<string, number> = {
    '.': 0, '=': 1, '#': 2, '~': 3, 'T': 4, 'W': 5, 'F': 6,
    'D': 7, 'R': 8, 'H': 9, 'S': 10, '*': 11, 'O': 12, 'B': 13, '-': 14, ',': 15,
    'C': 16, 'K': 17, 'M': 18, 'G': 11,
  };
  return rows.join('').split('').map(c => map[c] ?? 0);
}
