import { ReactNode } from "react";

interface IProfileLayoutProps {
  children: ReactNode;
}

export default async function ProfileLayout({ children }: IProfileLayoutProps) {
  return children;
}
