"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Button, Card, CardContent, TextField, Label, Input } from "@heroui/react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { FiMail, FiLock, FiEye, FiEyeOff, FiShoppingBag, FiArrowRight } from "react-icons/fi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate Better Auth sign-in request
    setTimeout(() => {
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#ecfdf5_0%,#f8fafc_48%,#eff6ff_100%)] px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            aria-label="Go to the ShopNest homepage"
            title="Go to homepage"
            className="group mx-auto inline-flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2 text-2xl font-bold text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-primary/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <FiShoppingBag className="h-5 w-5" />
            </div>
            <span>
              Shop<span className="text-primary">Nest</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground mt-4 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm text-muted mt-1">
            Sign in to access your orders, wishlist, and personalized recommendations
          </p>
        </div>

        <Card className="border border-border/80 bg-background/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button
                variant="outline"
                className="w-full h-11 border-border/80 hover:bg-muted/10 font-medium text-sm flex items-center justify-center gap-2 transition-all"
                onPress={() => console.log("Google Login")}
              >
                <FcGoogle className="w-5 h-5" />
                Google
              </Button>
              <Button
                variant="outline"
                className="w-full h-11 border-border/80 hover:bg-muted/10 font-medium text-sm flex items-center justify-center gap-2 transition-all"
                onPress={() => console.log("GitHub Login")}
              >
                <FaGithub className="w-5 h-5" />
                GitHub
              </Button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-border w-full" />
              <span className="bg-background px-3 text-[11px] font-semibold text-muted uppercase tracking-wider absolute">
                Or email
              </span>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <TextField>
                <Label className="text-xs font-semibold text-foreground/90 mb-1.5 flex items-center gap-1.5">
                  <FiMail className="w-3.5 h-3.5 text-muted" />
                  Email Address
                </Label>
                <Input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-white px-3.5 text-sm text-foreground shadow-sm placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </TextField>

              <TextField>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs font-semibold text-foreground/90 flex items-center gap-1.5">
                    <FiLock className="w-3.5 h-3.5 text-muted" />
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-primary hover:underline transition-all"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border bg-white pl-3.5 pr-10 text-sm text-foreground shadow-sm placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </TextField>

              {/* Remember Me */}
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="text-xs text-muted cursor-pointer select-none"
                >
                  Keep me signed in on this device
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                isDisabled={isLoading}
                className="w-full h-11 mt-3 bg-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-hover transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-sm text-muted mt-6">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline transition-all"
          >
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
