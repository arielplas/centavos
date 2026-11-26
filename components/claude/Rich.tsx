import { Fragment } from "react";

/** Renders `**bold**` spans of a copy string; the rest stays plain text. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, i) =>
        i % 2 === 1 ? (
          <b key={i} className="font-bold text-ink">
            {part}
          </b>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
