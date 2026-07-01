import { ExternalLink, Link as LinkIcon } from "lucide-react";
import type { ComponentPropsWithoutRef, ElementType } from "react";
import { MarkdownAsync, type Components } from "react-markdown";
import rehypePrettyCode, {
  type Options as PrettyCodeOptions,
} from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

const prettyCodeOptions: PrettyCodeOptions = {
  theme: "github-dark-default",
  keepBackground: false,
  bypassInlineCode: true,
  defaultLang: {
    block: "plaintext",
    inline: "",
  },
};

function Heading({
  as: Tag,
  id,
  children,
  ...props
}: ComponentPropsWithoutRef<"h2"> & {
  as: ElementType;
}) {
  return (
    <Tag id={id} {...props}>
      <span>{children}</span>
      {id ? (
        <a
          href={`#${id}`}
          className="docs-heading-anchor"
          aria-label={`Link to ${id.replaceAll("-", " ")}`}
        >
          <LinkIcon aria-hidden="true" />
        </a>
      ) : null}
    </Tag>
  );
}

const components: Components = {
  a({ href = "", children, ...props }) {
    const external = href.startsWith("http://") || href.startsWith("https://");

    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        {...props}
      >
        {children}
        {external ? (
          <ExternalLink
            aria-hidden="true"
            className="ml-1 inline size-3.5 align-[-0.12em]"
          />
        ) : null}
      </a>
    );
  },
  h2({ id, children, ...props }) {
    return (
      <Heading as="h2" id={id} {...props}>
        {children}
      </Heading>
    );
  },
  h3({ id, children, ...props }) {
    return (
      <Heading as="h3" id={id} {...props}>
        {children}
      </Heading>
    );
  },
  pre({ children, ...props }) {
    return (
      <pre tabIndex={0} {...props}>
        {children}
      </pre>
    );
  },
  table({ children, ...props }) {
    return (
      <div className="docs-table-scroll" tabIndex={0}>
        <table {...props}>{children}</table>
      </div>
    );
  },
};

export async function MarkdownContent({ children }: { children: string }) {
  return (
    <div className="docs-prose">
      <MarkdownAsync
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [rehypePrettyCode, prettyCodeOptions],
          rehypeSlug,
        ]}
        components={components}
      >
        {children}
      </MarkdownAsync>
    </div>
  );
}
