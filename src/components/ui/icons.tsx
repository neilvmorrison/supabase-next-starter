import { IconType } from "react-icons";
import { LuMailCheck, LuMailX } from "react-icons/lu";
import { BiError } from "react-icons/bi";
import * as Bi from "react-icons/bi";
import * as Fi from "react-icons/fi";
import * as Hi from "react-icons/hi";
import * as Md from "react-icons/md";
import * as Fa from "react-icons/fa";
import { IconBaseProps } from "react-icons/lib";
import { GiWeightLiftingUp } from "react-icons/gi";
import { TbBrandNextjs } from "react-icons/tb";

import { cn } from "@/lib/utils";

// Extend the IconNames type with additional icons
export type IconNames =
  | "email_check"
  | "email_x"
  | "edit"
  | "trash"
  | "check"
  | "plus"
  | "close"
  | "email"
  | "lock"
  | "dark_mode"
  | "light_mode"
  | "user"
  | "alert"
  | "weights"
  | "logo";

interface BaseIconProps {
  name: IconNames;
  size?: number;
  className?: string;
}

interface StandardIconProps
  extends BaseIconProps,
    React.HTMLAttributes<HTMLDivElement> {
  asChild?: false;
}

interface SVGIconProps
  extends BaseIconProps,
    Omit<IconBaseProps, "children" | "name" | "size"> {
  asChild: true;
}

type IIconProps = StandardIconProps | SVGIconProps;

export default function Icon({
  name,
  size = 20,
  className,
  asChild = false,
  ...props
}: IIconProps) {
  const getIconComponent = (): IconType => {
    switch (name) {
      // Existing icons
      case "email_check":
        return LuMailCheck;
      case "email_x":
        return LuMailX;

      case "edit":
        return Bi.BiEdit;
      case "trash":
        return Bi.BiTrash;
      case "check":
        return Fi.FiCheck;
      case "plus":
        return Fi.FiPlus;
      case "close":
        return Fi.FiX;
      case "email":
        return Hi.HiOutlineMail;
      case "lock":
        return Hi.HiOutlineLockClosed;
      case "dark_mode":
        return Md.MdDarkMode;
      case "light_mode":
        return Md.MdLightMode;
      case "user":
        return Fa.FaUser;
      case "alert":
        return BiError;
      case "weights":
        return GiWeightLiftingUp;
      case "logo":
        return TbBrandNextjs;

      default:
        console.warn(`Icon ${name} not found`);
        return LuMailX;
    }
  };

  const IconComponent = getIconComponent();

  // For use in components like Alert that expect direct SVG children
  if (asChild) {
    return (
      <IconComponent
        size={size}
        className={cn(className)}
        {...(props as IconBaseProps)}
      />
    );
  }

  // Standard usage with wrapper div
  return (
    <div
      className={cn("inline-flex", className)}
      {...(props as React.HTMLAttributes<HTMLDivElement>)}
    >
      <IconComponent size={size} />
    </div>
  );
}
