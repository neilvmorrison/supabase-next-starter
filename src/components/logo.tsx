import { APP_NAME } from "@/constants";
import Icon from "./ui/icons";
import { Text } from "./ui/text";
import Link from "next/link";

interface ILogoProps {
  asLink?: boolean;
}

export default function Logo({ asLink = false }: ILogoProps) {
  const Component = asLink ? Link : "div";
  return (
    <Component className="flex items-center gap-2" href="/">
      <Icon name="logo" />
      <Text className="font-semibold line-clamp-1">{APP_NAME}</Text>
    </Component>
  );
}
