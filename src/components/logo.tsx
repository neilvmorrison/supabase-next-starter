import { APP_NAME } from "@/constants";
import { Icon, Text } from "./ui";
import Link from "next/link";

interface ILogoProps {
  asLink?: boolean;
}

export function Logo({ asLink = false }: ILogoProps) {
  const Component = asLink ? Link : "div";
  return (
    <Component className="flex items-center gap-2" href="/">
      <Icon name="logo" />
      <Text className="font-semibold line-clamp-1">{APP_NAME}</Text>
    </Component>
  );
}
