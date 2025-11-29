"use client";

import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <Card>
      <CardContent className="prose prose-slate max-w-none pt-6 dark:prose-invert">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="mb-4 text-3xl font-bold">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="mb-3 mt-6 text-2xl font-semibold">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="mb-2 mt-4 text-xl font-semibold">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="mb-4 text-muted-foreground">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="mb-4 ml-6 list-disc space-y-2">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-4 ml-6 list-decimal space-y-2">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="text-muted-foreground">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-foreground">
                {children}
              </strong>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-primary underline hover:text-primary/80"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-muted pl-4 italic text-muted-foreground">
                {children}
              </blockquote>
            ),
            code: ({ children }) => (
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                {children}
              </code>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </CardContent>
    </Card>
  );
}
