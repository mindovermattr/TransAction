import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type AllowedTags = "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span";

const typographyVariants = cva("", {
  variants: {
    variant: {
      default: "text-foreground text-base",
      title: "text-foreground text-2xl font-medium tracking-tight ",
      subtitle: "text-muted-foreground text-base",
      heading: "text-foreground font-semibold text-lg",
      lead: "text-muted-foreground text-lg",
      link: "text-primary text-base underline underline-offset-4 hover:text-primary/90",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type TypographyProps<Tag extends AllowedTags> = {
  tag: Tag;
  children?: ReactNode;
} & ComponentPropsWithoutRef<Tag> &
  VariantProps<typeof typographyVariants>;

const Typography = <Tag extends AllowedTags>({
  tag = "p" as Tag,
  className,
  children,
  variant,

  ...props
}: TypographyProps<Tag>) => {
  const Component = tag as AllowedTags;
  return (
    <Component
      className={cn(typographyVariants({ variant, className }))}
      {...props}
    >
      {children}
    </Component>
  );
};

export { Typography };
