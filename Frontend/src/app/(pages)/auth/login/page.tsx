"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";

import water from "/public/benhvien.jpg";
import logowqm from "/public/logoh.jpg";
import { Eye, EyeOff, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate server response
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);

    // Example validation
    if (email && password && email === "staff@gmail.com" && password === "123456") {
      localStorage.setItem("email", email);
      toast({
        variant: "success",
        title: "Login Successful",
        description: "Welcome back!",
      });
      localStorage.setItem("loginrole","staff");
      router.push("/"); // Redirect to dashboarddashboard/homepage
    }  else if (email && password && email === "doctor@gmail.com" && password === "123456") {
      toast({
        variant: "success",
        title: "Login Successful",
        description: "Welcome back!",
      });
      localStorage.setItem("loginrole","doctor");
      router.push("/"); // Redirect to dashboarddashboard/homepage
    } else if (email && password && email === "patient@gmail.com" && password === "123456") {
      toast({
        variant: "success",
        title: "Login Successful",
        description: "Welcome back!",
      });
      localStorage.setItem("loginrole","patient");
      router.push("/"); // Redirect to dashboarddashboard/homepage
    } else {
      toast({
        title: "Login Failed",
        description: "Please check your email and password.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left Section with the Image */}
      <div className="hidden md:block md:w-2/3 relative h-full">
        <Image
          src={water}
          alt="Waterplace"
          layout="fill"
          objectFit="cover"
          objectPosition="center"
          priority
        />
      </div>

      {/* Right Section with the Form */}
      <div className="flex flex-1 flex-col justify-center items-center px-6 sm:px-8 md:px-16 bg-white">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-lg">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Link href={"/"}><Image
              src={logowqm}
              alt="WQM Logo"
              width={100}
              height={80}
              className="h-16"
              priority
            />
            </Link>
          </div>

          {/* Login Form */}
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center">
            Login
          </h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="block mb-2 text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block mb-2 text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-sm">Remember</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-blue-500">
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? "Loging in..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
