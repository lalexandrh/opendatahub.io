import { PageProps, graphql } from "gatsby";
import * as React from "react";

import { Footer, Layout, Seo, SideNavigation } from "../components/shared";
import { DOCS_NAVIGATION } from "../const";
import { PageSection, Title, Alert } from "@patternfly/react-core";
import { AsciiDocSection } from "../types";

const DocsPageTemplate = ({
  data: { asciidoc, markdownRemark, allFile: allDocs },
  location,
}: PageProps<Queries.DocsPageTemplateQuery>) => {
  const toc: { [key: string]: AsciiDocSection[] } = allDocs.edges
    .map((edge) => edge.node.childAsciidoc)
    .reduce((prev, curr) => {
      if (curr?.fields?.slug && curr.sections) {
        return {
          ...prev,
          [curr.fields.slug]: curr.sections.filter(
            (section) => section?.level && section.level <= 2
          ),
        };
      } else {
        return prev;
      }
    }, {});
  const html = markdownRemark?.html ?? asciidoc?.html

  return (
    <Layout
      sidebar={
        <SideNavigation
          config={DOCS_NAVIGATION}
          location={location}
          toc={toc}
        />
      }
    >
      <PageSection
        isCenterAligned
        isWidthLimited
        padding={{ default: "padding" }}
      >
        <Alert variant="info" title="Important Notice" isInline className="pf-u-mb-xl">
          <p>
            The Open Data Hub documentation and the <code>opendatahub-documentation</code> repository are archived as of March 2026.
            To see the latest documentation, go to: <a href="https://docs.redhat.com/en/documentation/red_hat_openshift_ai_self-managed/" target="_blank" rel="noopener noreferrer">Red Hat OpenShift AI Self-Managed documentation</a>.
          </p>
        </Alert>
        <Title headingLevel="h1" size="4xl">{asciidoc?.document?.title ?? markdownRemark?.frontmatter?.title}</Title>
        <div
          className="asciidoc-docs"
          dangerouslySetInnerHTML={{ __html: html ?? "" }}
        />
      </PageSection>
      <PageSection isCenterAligned padding={{ default: "noPadding" }}>
        <Footer />
      </PageSection>
    </Layout>
  );
};

export const Head = ({
  data: { asciidoc, markdownRemark },
}: PageProps<Queries.DocsPageTemplateQuery>) => {
  const title = asciidoc?.document?.title ?? markdownRemark?.frontmatter?.title ?? "Documentation"
  return <Seo title={title} />;
};

export default DocsPageTemplate;

export const pageQuery = graphql`
query DocsPageTemplate($id: String!) {
  allFile(
    filter: {
        sourceInstanceName: { eq: "docs" }
        childrenAsciidoc: { elemMatch: { id: { ne: null } } }
      }
  ) {
    edges {
      node {
        childAsciidoc {
          fields {
            slug
          }
          sections {
            parentId
            name
            level
            index
            id
          }
        }
      }
    }
  }
  asciidoc(id: {eq: $id}) {
    html
    id
    document {
      title
    }
  }
  markdownRemark(id: {eq: $id}) {
    html
    id
    frontmatter {
      title
    }
  }
}
`;
