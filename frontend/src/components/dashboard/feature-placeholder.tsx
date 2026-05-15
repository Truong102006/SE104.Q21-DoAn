"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

interface FeaturePlaceholderProps {
  title: string;
  description: string;
}

export function FeaturePlaceholder({ title, description }: FeaturePlaceholderProps) {
  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="border-b px-3 py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wrench className="h-4 w-4 text-gold" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="py-3">
          <p className="text-sm text-muted-foreground">
            Đang phát triển. Trang đã có route và giao diện cơ bản, sẵn sàng để nối API/logic.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
