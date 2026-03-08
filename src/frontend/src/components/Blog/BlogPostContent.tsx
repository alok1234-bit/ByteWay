interface BlogPostContentProps {
  content: string;
}

export default function BlogPostContent({ content }: BlogPostContentProps) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <div className="whitespace-pre-wrap leading-relaxed">{content}</div>
    </div>
  );
}
