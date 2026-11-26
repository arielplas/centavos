"use client";

// El avatar de la persona: la foto (`imageUrl`) o, si no, sus iniciales, y lleva a
// `/app/perfil`. En escritorio vive en la barra superior; en el teléfono, en el
// encabezado del Pulso, como el `AccountMenu` de la app. Es un enlace de 44 px
// con nombre accesible («Perfil»).

import Link from "next/link";
import { useT } from "@/components/app/LanguageProvider";
import { useSession } from "@/components/app/SessionProvider";
import { initialsFrom } from "@/components/app/ui/format";
import { PERFIL_HREF } from "./nav";

export function Avatar({ name, imageUrl, size = 36 }: { name: string; imageUrl?: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-sand text-ink"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38), fontWeight: 800 }}
    >
      {imageUrl ? (
        // URL pública de la foto de perfil (§4.6): `<img>` sin next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" loading="lazy" width={size} height={size} className="h-full w-full object-cover" />
      ) : (
        initialsFrom(name)
      )}
    </span>
  );
}

export function AccountAvatar({ current, className }: { current?: boolean; className?: string }) {
  const t = useT();
  const { user } = useSession();
  return (
    <Link
      href={PERFIL_HREF}
      aria-label={t("auth:profile.title")}
      aria-current={current ? "page" : undefined}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${current ? "ring-2 ring-ink" : ""} ${className ?? ""}`}
    >
      <Avatar name={user?.name ?? ""} imageUrl={user?.imageUrl} />
    </Link>
  );
}
