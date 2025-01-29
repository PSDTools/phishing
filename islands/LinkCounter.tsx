import type { JSX } from "preact/jsx-runtime";
import type { ComponentProps } from "preact";

interface Props extends ComponentProps<"a"> {
}

export default function LinkCounter(props: Props): JSX.Element {
  return (
    <a
      {...props}
      onClick={async () => {
        await fetch("/api/links", {
          method: "post",
          body: JSON.stringify({ link: props.href }),
        });
      }}
    >
    </a>
  );
}
