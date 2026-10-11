/**
 * (제안 P-D3) 로컬 규칙 tmi/no-dynamic-class: 조립된 클래스 이름 금지.
 *
 * 문제(점검 02-design-system.md DS-06): `text-${size}` 같은 조립 클래스는 tmi/no-raw-design-values와
 * tailwindcss/no-custom-classname을 모두 통과한다. Tailwind는 소스에서 "완성된 이름"만 찾아 CSS를 만들므로
 * 이 클래스는 생성되지 않고, 화면에서 스타일이 조용히 빠진다.
 *
 * 판정: 템플릿 리터럴에서 `${…}` 바로 앞이나 뒤에 공백 없이 글자가 붙어 있으면(= 이름 조각) 오류.
 *   `text-${size}`      → 오류 (앞에 "text-"가 붙음)
 *   `${base} ${active}` → 허용 (완성된 클래스끼리 공백으로 이어 붙임)
 *   `px-3 ${cls}`       → 허용
 * 범위: className 계열 JSX 속성, cn()/cva()/clsx() 인자 안의 템플릿 리터럴만 본다(로그·URL 템플릿 거짓 양성 방지).
 * 한계: 조립 결과를 변수에 먼저 담으면(`const cls = `text-${size}`; <p className={cls}>`) 잡지 못한다(README "한계").
 *
 * 적용: eslint.config.mjs의 tmi 플러그인 rules에 "no-dynamic-class": noDynamicClass를 추가하고
 *       rules에 "tmi/no-dynamic-class": "error".
 */
const CLASS_ATTRS = new Set(["className", "class", "classNames", "inputClassName", "contentClassName"]);
const CLASS_FNS = new Set(["cn", "cva", "clsx", "twMerge"]);

const inClassContext = (node) => {
  for (let p = node.parent; p; p = p.parent) {
    if (p.type === "JSXAttribute") return CLASS_ATTRS.has(p.name?.name);
    if (p.type === "CallExpression" && p.callee.type === "Identifier") return CLASS_FNS.has(p.callee.name);
    if (p.type === "Program" || p.type.endsWith("Statement")) return false;
  }
  return false;
};

export const noDynamicClass = {
  meta: {
    type: "problem",
    messages: {
      glued:
        "클래스 이름을 조립하지 마세요('{{near}}'). Tailwind는 조립된 이름을 생성하지 않아 스타일이 빠집니다. 완성된 클래스를 객체 맵에서 고르세요(예: sizeClass[size], 값은 \"text-sm\"처럼 완성된 이름).",
    },
  },
  create(context) {
    return {
      TemplateLiteral(node) {
        if (node.expressions.length === 0 || !inClassContext(node)) return;
        // 한 템플릿에서 첫 번째로 붙은 조각만 보고한다(`bg-${x}-muted`를 두 번 보고하지 않게).
        for (const [i, q] of node.quasis.entries()) {
          const text = q.value.cooked ?? "";
          const before = i < node.quasis.length - 1 && /\S$/.test(text); // `${` 바로 앞에 글자
          const after = i > 0 && /^\S/.test(text); // `}` 바로 뒤에 글자
          if (before || after) {
            const near = before ? `${text.split(/\s+/).pop()}\${…}` : `\${…}${text.split(/\s+/)[0]}`;
            context.report({ node, messageId: "glued", data: { near } });
            return;
          }
        }
      },
    };
  },
};
