import { Fragment } from "react";

/**
 * Renders `**bold**` spans of a copy string; the rest stays plain text. A bold
 * span holds no `*`, so asterisks that are part of the text (the masked email
 * "a***@gmail.com") stay as they are.
 */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*\*([^*\n]+)\*\*/).map((part, i) =>
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
