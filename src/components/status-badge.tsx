import { cn } from "cn";
import { Badge } from "@/components/ui/badge";

// 상태 표시는 이 부품 하나로 그린다: 같은 의미 = 같은 모양·같은 기호·같은 기본 문구.
// 색만으로 의미를 전하지 않도록 기호(✓·▲·✕)를 함께 그린다. 기호는 장식이라 화면낭독기는 글자만 읽는다.
// 문구가 화면마다 달라야 하면(예: "정답") label로 바꾸되, 의미(status)는 바꾸지 않는다.
const STATUS = {
  pending: { label: "준비 중", mark: null, className: "" },
  success: { label: "완료", mark: "✓", className: "border-transparent bg-success/10 text-success" },
  warning: { label: "주의", mark: "▲", className: "border-transparent bg-warning/10 text-warning" },
  error: { label: "실패", mark: "✕", className: "border-transparent bg-destructive/10 text-destructive" },
} as const;

export type Status = keyof typeof STATUS;

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: Status;
  label?: string;
  className?: string;
}) {
  const s = STATUS[status];
  return (
    <Badge variant="outline" className={cn(s.className, className)}>
      {s.mark ? <span aria-hidden="true">{s.mark}</span> : null}
      {label ?? s.label}
    </Badge>
  );
}
