import LoginForm from "@/components/login-form";
import Logo from "@/components/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_NAME } from "@/constants";

export default function Authentication() {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div>
        <div className="flex items-center justify-center mb-4">
          <Logo />
        </div>
        <Card className="w-[320px] lg:w-[480px]">
          <CardHeader>
            <CardTitle>Login to {APP_NAME}</CardTitle>
            <CardDescription>
              Enter your email below to receive a magic link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
