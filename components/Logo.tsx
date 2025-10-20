import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: number
  title?: string
  className?: string
  wrapperClassName?: string
  imgClassName?: string
  href?: string
}

export function Logo({ size = 32, title, className = "", wrapperClassName = "", imgClassName = "object-contain", href }: LogoProps) {
  const imgAlt = title ? `${title} logo` : "EKSU logo"

  const content = (
    <div style={{ width: size, height: size }} className={`${wrapperClassName} flex items-center justify-center`}>
      <Image src="/eksu-logo.png" alt={imgAlt} width={size} height={size} className={imgClassName + " " + className} />
    </div>
  )

  if (href) {
    return (
      <Link href={href} aria-label={title || "EKSU"} className="inline-block">
        {content}
      </Link>
    )
  }

  return content
}