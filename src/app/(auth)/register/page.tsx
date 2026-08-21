"use client";

import React, { useState } from "react";
import { Button, Card, CardContent, TextField, Label, Input } from "@heroui/react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Better Auth sign-up logic will go here
  };

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-1">Create an Account</h2>
          <p className="text-sm text-muted mb-6">Join ShopNest as a customer or seller.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField>
              <Label>Full Name</Label>
              <Input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </TextField>
            <TextField>
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </TextField>
            <TextField>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </TextField>
            <Button type="submit" variant="primary" className="w-full mt-2">
              Create Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
