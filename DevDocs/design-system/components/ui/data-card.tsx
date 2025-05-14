import React, { ReactNode } from "react";
import { cn } from "../../utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";

interface DataCardProps {
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
  footerContent?: ReactNode;
  headerAction?: ReactNode;
  loading?: boolean;
  error?: boolean;
  errorMessage?: string;
}

export function DataCard({
  title,
  description,
  className,
  children,
  footerContent,
  headerAction,
  loading = false,
  error = false,
  errorMessage = "Error loading data",
}: DataCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {headerAction && <div className="ml-2">{headerAction}</div>}
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex flex-col space-y-3">
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ) : error ? (
          <div className="py-6 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
            </div>
          </div>
        ) : (
          children
        )}
      </CardContent>
      
      {footerContent && <CardFooter className="border-t px-6 py-4">{footerContent}</CardFooter>}
    </Card>
  );
}